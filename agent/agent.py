import json
import logging
import os
import signal
import sys
from dotenv import load_dotenv
from livekit import agents
from livekit.agents import AgentServer, AgentSession, Agent, room_io, function_tool
from livekit.plugins import openai, noise_cancellation
from pathlib import Path
import resend

load_dotenv(".env.local")

logger = logging.getLogger(__name__)

resend.api_key = os.getenv("RESEND_API_KEY", "")

DATA_DIR = Path(__file__).parent / "data"

# Simple in-memory storage for notes
memory = {}

class VoiceAgent(Agent):
    def __init__(self):
        system_prompt = (Path(__file__).parent / "prompts" / "weekly_coach_system.txt").read_text()

        super().__init__(
            instructions=system_prompt,
        )

    @function_tool
    async def save_note(self, note: str) -> str:
        """Save a note to memory. Use this when the user asks you to remember something."""
        note_id = len(memory) + 1
        memory[note_id] = note
        return f"Saved note #{note_id}: {note}"

    @function_tool
    async def get_notes(self) -> str:
        """Retrieve all saved notes. Use this when the user asks what you've remembered."""
        if not memory:
            return "No notes saved yet."
        return "\n".join([f"#{id}: {note}" for id, note in memory.items()])

    @function_tool
    async def send_test_email(self) -> str:
        """Send a test email to verify email delivery is working. Call this when the user asks to test the email."""
        email_to = os.getenv("EMAIL_TO")
        if not resend.api_key or not email_to:
            return (
                "Test email not sent. "
                "RESEND_API_KEY=" + ("set" if resend.api_key else "missing") +
                ", EMAIL_TO=" + (email_to or "missing")
            )
        try:
            resend.Emails.send({
                "from": "Coach <onboarding@resend.dev>",
                "to": email_to,
                "subject": "Test — coaching email setup",
                "text": "If you're reading this, email delivery is working.",
            })
            return "Test email sent to " + email_to
        except Exception as e:
            logger.error("Test email failed: %s", e)
            return "Test email failed: " + str(e)

    @function_tool
    async def send_session_summary(self, summary: str) -> str:
        """Send a written summary to the user's chat. Call this once when wrapping up the session."""
        await self.session.room_io.room.local_participant.send_text(
            summary,
            topic="lk.chat",
        )

        # Persist summary so the Friday review agent can reference it
        DATA_DIR.mkdir(exist_ok=True)
        (DATA_DIR / "latest_summary.json").write_text(json.dumps({"summary": summary}))

        email_to = os.getenv("EMAIL_TO")
        if resend.api_key and email_to:
            try:
                resend.Emails.send({
                    "from": "Coach <onboarding@resend.dev>",
                    "to": email_to,
                    "subject": "Weekly coaching summary",
                    "text": summary,
                })
                return "Summary sent to chat and emailed to " + email_to
            except Exception as e:
                logger.error("Failed to send email via Resend: %s", e)
                return "Summary sent to chat. Email failed: " + str(e)
        else:
            logger.warning("Email skipped: RESEND_API_KEY=%s, EMAIL_TO=%s",
                           "set" if resend.api_key else "missing",
                           email_to or "missing")
            return "Summary sent to chat. Email skipped (missing RESEND_API_KEY or EMAIL_TO)."

server = AgentServer()

@server.rtc_session()
async def entrypoint(ctx: agents.JobContext):
    logger.info("Job received — agent_name=%r, metadata=%r", ctx.job.agent_name, ctx.job.metadata)

    mode = ctx.job.metadata or ""

    if mode == "review-coach":
        agent = ReviewAgent()
        opening = """
Let's take a breath.

It's the end of the week. Let's look back at what you set out to do and see how it went.
"""
    else:
        agent = VoiceAgent()
        opening = """
Let's take a breath.

This is a short weekly focus check.

What's on your mind?
"""

    session = AgentSession(
        llm=openai.realtime.RealtimeModel(
            voice="alloy",
            model="gpt-4o-mini-realtime-preview",
        ),
    )

    await session.start(
        room=ctx.room,
        agent=agent,
        room_options=room_io.RoomOptions(
            audio_input=room_io.AudioInputOptions(
                noise_cancellation=noise_cancellation.BVC(),
            ),
        ),
    )

    await session.generate_reply(instructions=opening)

class ReviewAgent(Agent):
    def __init__(self):
        system_prompt = (Path(__file__).parent / "prompts" / "weekly_review_system.txt").read_text()

        # Inject Monday commitments if available
        summary_path = DATA_DIR / "latest_summary.json"
        if summary_path.exists():
            try:
                data = json.loads(summary_path.read_text())
                commitments = data.get("summary", "")
                system_prompt += f"\n\nThe user's Monday commitments:\n{commitments}"
            except (json.JSONDecodeError, KeyError):
                system_prompt += "\n\nNo Monday commitments were found. Ask the user what they set out to do this week."
        else:
            system_prompt += "\n\nNo Monday commitments were found. Ask the user what they set out to do this week."

        super().__init__(
            instructions=system_prompt,
        )

    @function_tool
    async def send_review_summary(self, summary: str) -> str:
        """Send the review reflection summary to the user's chat. Call this once when wrapping up the review session."""
        await self.session.room_io.room.local_participant.send_text(
            summary,
            topic="lk.chat",
        )
        email_to = os.getenv("EMAIL_TO")
        if resend.api_key and email_to:
            try:
                resend.Emails.send({
                    "from": "Coach <onboarding@resend.dev>",
                    "to": email_to,
                    "subject": "Weekly review reflections",
                    "text": summary,
                })
                return "Review summary sent to chat and emailed to " + email_to
            except Exception as e:
                logger.error("Failed to send review email via Resend: %s", e)
                return "Review summary sent to chat. Email failed: " + str(e)
        else:
            logger.warning("Email skipped: RESEND_API_KEY=%s, EMAIL_TO=%s",
                           "set" if resend.api_key else "missing",
                           email_to or "missing")
            return "Review summary sent to chat. Email skipped (missing RESEND_API_KEY or EMAIL_TO)."



if __name__ == "__main__":
    # Force exit on SIGINT/SIGTERM so Ctrl+C actually stops the process
    def _exit_on_signal(signum, frame):
        sys.exit(0)

    signal.signal(signal.SIGINT, _exit_on_signal)
    signal.signal(signal.SIGTERM, _exit_on_signal)
    agents.cli.run_app(server)
