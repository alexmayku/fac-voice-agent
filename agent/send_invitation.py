import os
import sys

import resend


def send_planning_email(email_to: str, app_url: str):
    text_body = f"""\
Hi,

It's Monday.

This is your invitation to pause for a few minutes and get clear on the week ahead.

In your coaching session, we'll talk through what's on your mind and turn it into a simple, focused plan you can actually follow.

No pressure. No perfection. Just clarity.

When you're ready, start your session here:
{app_url}

You don't need to have answers. Just show up.

Your coach"""

    html_body = f"""\
<div style="font-family: sans-serif; max-width: 520px; margin: 0 auto; padding: 32px 16px; color: #222;">
  <p>Hi,</p>
  <p>It's Monday.</p>
  <p>This is your invitation to pause for a few minutes and get clear on the week ahead.</p>
  <p>In your coaching session, we'll talk through what's on your mind and turn it into a simple, focused plan you can actually follow.</p>
  <p>No pressure. No perfection. Just clarity.</p>
  <p>When you're ready, start your session here:</p>
  <p style="text-align: center; margin: 32px 0;">
    <a href="{app_url}"
       style="background-color: #111; color: #fff; padding: 14px 28px;
              border-radius: 6px; text-decoration: none; font-weight: 600;">
      Start my coaching session
    </a>
  </p>
  <p>You don't need to have answers. Just show up.</p>
  <p>Your coach</p>
</div>"""

    return {
        "from": "Your Coach <onboarding@resend.dev>",
        "to": [email_to],
        "subject": "Your weekly coaching session is ready",
        "text": text_body,
        "html": html_body,
    }


def send_review_email(email_to: str, app_url: str):
    review_url = f"{app_url}?mode=review"

    text_body = f"""\
Hi,

It's Friday.

This is your invitation to pause and reflect on the week.

In your review session, we'll go through what you committed to on Monday and talk about how it went — what worked, what didn't, and what you'd do differently.

No judgement. Just honest reflection.

When you're ready, start your review here:
{review_url}

Your coach"""

    html_body = f"""\
<div style="font-family: sans-serif; max-width: 520px; margin: 0 auto; padding: 32px 16px; color: #222;">
  <p>Hi,</p>
  <p>It's Friday.</p>
  <p>This is your invitation to pause and reflect on the week.</p>
  <p>In your review session, we'll go through what you committed to on Monday and talk about how it went — what worked, what didn't, and what you'd do differently.</p>
  <p>No judgement. Just honest reflection.</p>
  <p>When you're ready, start your review here:</p>
  <p style="text-align: center; margin: 32px 0;">
    <a href="{review_url}"
       style="background-color: #111; color: #fff; padding: 14px 28px;
              border-radius: 6px; text-decoration: none; font-weight: 600;">
      Start my weekly review
    </a>
  </p>
  <p>Your coach</p>
</div>"""

    return {
        "from": "Your Coach <onboarding@resend.dev>",
        "to": [email_to],
        "subject": "Time for your weekly review",
        "text": text_body,
        "html": html_body,
    }


def main():
    resend.api_key = os.environ["RESEND_API_KEY"]
    email_to = os.environ["EMAIL_TO"]
    app_url = os.environ["APP_URL"]

    mode = sys.argv[1] if len(sys.argv) > 1 else "planning"

    if mode == "review":
        email_params = send_review_email(email_to, app_url)
    else:
        email_params = send_planning_email(email_to, app_url)

    r = resend.Emails.send(email_params)
    print(f"Email sent: {r}")


if __name__ == "__main__":
    try:
        main()
    except Exception as e:
        print(f"Failed to send invitation email: {e}", file=sys.stderr)
        sys.exit(1)
