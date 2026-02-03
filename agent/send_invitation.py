import os
import sys

import resend


def main():
    resend.api_key = os.environ["RESEND_API_KEY"]
    email_to = os.environ["EMAIL_TO"]
    app_url = os.environ["APP_URL"]

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

    r = resend.Emails.send(
        {
            "from": "Your Coach <onboarding@resend.dev>",
            "to": [email_to],
            "subject": "Your weekly coaching session is ready",
            "text": text_body,
            "html": html_body,
        }
    )
    print(f"Email sent: {r}")


if __name__ == "__main__":
    try:
        main()
    except Exception as e:
        print(f"Failed to send invitation email: {e}", file=sys.stderr)
        sys.exit(1)
