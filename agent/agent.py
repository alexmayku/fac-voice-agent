import signal
import sys
from dotenv import load_dotenv
from livekit import agents
from livekit.agents import AgentServer, AgentSession, Agent, room_io, function_tool
from livekit.plugins import openai, noise_cancellation
from pathlib import Path

load_dotenv(".env.local")

# Simple in-memory storage for notes
memory = {}

class VoiceAgent(Agent):
    def __init__(self):
        system_prompt = (Path(__file__).parent.parent / "prompts" / "weekly_coach_system.txt").read_text()

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
    async def send_session_summary(self, summary: str) -> str:
        """Send a written summary to the user's chat. Call this once when wrapping up the session."""
        await self.session.room_io.room.local_participant.send_text(
            summary,
            topic="lk.chat",
        )
        return "Summary sent."

server = AgentServer()

@server.rtc_session()
async def entrypoint(ctx: agents.JobContext):
    session = AgentSession(
        llm=openai.realtime.RealtimeModel(
            voice="alloy",
            model="gpt-4o-mini-realtime-preview",
        ),
    )

    await session.start(
        room=ctx.room,
        agent=VoiceAgent(),
        room_options=room_io.RoomOptions(
            audio_input=room_io.AudioInputOptions(
                noise_cancellation=noise_cancellation.BVC(),
            ),
        ),
    )

    await session.generate_reply(
        instructions="""
Let’s take a breath.

This is a short weekly focus check.

What’s on your mind?
"""
    )

if __name__ == "__main__":
    # Force exit on SIGINT/SIGTERM so Ctrl+C actually stops the process
    def _exit_on_signal(signum, frame):
        sys.exit(0)

    signal.signal(signal.SIGINT, _exit_on_signal)
    signal.signal(signal.SIGTERM, _exit_on_signal)
    agents.cli.run_app(server)
