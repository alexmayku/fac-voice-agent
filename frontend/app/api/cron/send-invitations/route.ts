import { NextRequest, NextResponse } from 'next/server';
import { Resend } from 'resend';
import { clerkClient } from '@clerk/nextjs/server';
import { mergePreferences } from '@/lib/types';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  const authHeader = req.headers.get('authorization');
  const expectedToken = process.env.CRON_SECRET;

  if (!expectedToken || authHeader !== `Bearer ${expectedToken}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const mode = req.nextUrl.searchParams.get('mode');
  if (mode !== 'planning' && mode !== 'review') {
    return NextResponse.json(
      { error: 'Invalid mode. Use ?mode=planning or ?mode=review' },
      { status: 400 }
    );
  }

  const resendApiKey = process.env.RESEND_API_KEY;
  const appUrl = process.env.APP_URL;

  if (!resendApiKey || !appUrl) {
    return NextResponse.json({ error: 'Missing RESEND_API_KEY or APP_URL' }, { status: 500 });
  }

  const time = req.nextUrl.searchParams.get('time') || '08:30';
  const emailKey = mode === 'planning' ? 'planning' : 'review';

  const resend = new Resend(resendApiKey);
  const clerk = await clerkClient();

  // Fetch all users (paginated) and filter by email preferences
  const users: { email: string; firstName: string | null }[] = [];
  let offset = 0;
  const limit = 100;

  while (true) {
    const { data: batch } = await clerk.users.getUserList({ limit, offset });
    for (const user of batch) {
      const email = user.emailAddresses[0]?.emailAddress;
      if (!email) continue;

      const prefs = mergePreferences(user.publicMetadata as Record<string, unknown>);
      const emailPref = prefs.emails[emailKey];

      // Only send if enabled and time matches
      if (emailPref.enabled !== false && emailPref.time === time) {
        users.push({ email, firstName: user.firstName });
      }
    }
    if (batch.length < limit) break;
    offset += limit;
  }

  if (users.length === 0) {
    return NextResponse.json({ message: 'No users found', sent: 0, failed: 0 });
  }

  let sent = 0;
  let failed = 0;

  for (const user of users) {
    const greeting = user.firstName ? `Hi ${user.firstName},` : 'Hi,';
    const emailParams =
      mode === 'planning'
        ? buildPlanningEmail(user.email, greeting, appUrl)
        : buildReviewEmail(user.email, greeting, appUrl);

    try {
      await resend.emails.send(emailParams);
      sent++;
    } catch (err) {
      console.error(`Failed to send to ${user.email}:`, err);
      failed++;
    }
  }

  return NextResponse.json({ message: `Sent ${mode} invitations`, sent, failed });
}

function buildPlanningEmail(to: string, greeting: string, appUrl: string) {
  const text = `${greeting}

It's Monday.

This is your invitation to pause for a few minutes and get clear on the week ahead.

In your coaching session, we'll talk through what's on your mind and turn it into a simple, focused plan you can actually follow.

No pressure. No perfection. Just clarity.

When you're ready, start your session here:
${appUrl}

You don't need to have answers. Just show up.

Your coach`;

  const html = `<div style="font-family: sans-serif; max-width: 520px; margin: 0 auto; padding: 32px 16px; color: #222;">
  <p>${greeting}</p>
  <p>It's Monday.</p>
  <p>This is your invitation to pause for a few minutes and get clear on the week ahead.</p>
  <p>In your coaching session, we'll talk through what's on your mind and turn it into a simple, focused plan you can actually follow.</p>
  <p>No pressure. No perfection. Just clarity.</p>
  <p>When you're ready, start your session here:</p>
  <p style="text-align: center; margin: 32px 0;">
    <a href="${appUrl}"
       style="background-color: #111; color: #fff; padding: 14px 28px;
              border-radius: 6px; text-decoration: none; font-weight: 600;">
      Start my coaching session
    </a>
  </p>
  <p>You don't need to have answers. Just show up.</p>
  <p>Your coach</p>
</div>`;

  return {
    from: 'Coach <coach@coach.hardwarestartup.com>',
    to: [to],
    subject: 'Your weekly coaching session is ready',
    text,
    html,
  };
}

function buildReviewEmail(to: string, greeting: string, appUrl: string) {
  const reviewUrl = `${appUrl}?mode=review`;

  const text = `${greeting}

It's Friday.

This is your invitation to pause and reflect on the week.

In your review session, we'll go through what you committed to on Monday and talk about how it went — what worked, what didn't, and what you'd do differently.

No judgement. Just honest reflection.

When you're ready, start your review here:
${reviewUrl}

Your coach`;

  const html = `<div style="font-family: sans-serif; max-width: 520px; margin: 0 auto; padding: 32px 16px; color: #222;">
  <p>${greeting}</p>
  <p>It's Friday.</p>
  <p>This is your invitation to pause and reflect on the week.</p>
  <p>In your review session, we'll go through what you committed to on Monday and talk about how it went — what worked, what didn't, and what you'd do differently.</p>
  <p>No judgement. Just honest reflection.</p>
  <p>When you're ready, start your review here:</p>
  <p style="text-align: center; margin: 32px 0;">
    <a href="${reviewUrl}"
       style="background-color: #111; color: #fff; padding: 14px 28px;
              border-radius: 6px; text-decoration: none; font-weight: 600;">
      Start my weekly review
    </a>
  </p>
  <p>Your coach</p>
</div>`;

  return {
    from: 'Coach <coach@coach.hardwarestartup.com>',
    to: [to],
    subject: 'Time for your weekly review',
    text,
    html,
  };
}
