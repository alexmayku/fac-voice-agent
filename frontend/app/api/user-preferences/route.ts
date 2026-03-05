import { NextRequest, NextResponse } from 'next/server';
import { auth, clerkClient } from '@clerk/nextjs/server';
import { DEFAULT_PREFERENCES, TIME_SLOTS, mergePreferences } from '@/lib/types';
import type { UserPreferences } from '@/lib/types';

export async function GET() {
  const { userId } = await auth();
  if (!userId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const clerk = await clerkClient();
  const user = await clerk.users.getUser(userId);
  const preferences = mergePreferences(user.publicMetadata as Record<string, unknown>);

  return NextResponse.json(preferences);
}

export async function PUT(req: NextRequest) {
  const { userId } = await auth();
  if (!userId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const body = (await req.json()) as Partial<UserPreferences>;

  // Validate time values
  const validTimes = TIME_SLOTS as readonly string[];
  if (body.emails?.planning?.time && !validTimes.includes(body.emails.planning.time)) {
    return NextResponse.json({ error: 'Invalid planning time' }, { status: 400 });
  }
  if (body.emails?.review?.time && !validTimes.includes(body.emails.review.time)) {
    return NextResponse.json({ error: 'Invalid review time' }, { status: 400 });
  }

  const clerk = await clerkClient();
  const user = await clerk.users.getUser(userId);
  const current = mergePreferences(user.publicMetadata as Record<string, unknown>);

  const updated: UserPreferences = {
    onboardingComplete: body.onboardingComplete ?? current.onboardingComplete,
    emails: {
      planning: {
        enabled: body.emails?.planning?.enabled ?? current.emails.planning.enabled,
        time: body.emails?.planning?.time ?? current.emails.planning.time,
      },
      review: {
        enabled: body.emails?.review?.enabled ?? current.emails.review.enabled,
        time: body.emails?.review?.time ?? current.emails.review.time,
      },
    },
  };

  await clerk.users.updateUserMetadata(userId, {
    publicMetadata: {
      ...user.publicMetadata,
      preferences: updated,
    },
  });

  return NextResponse.json(updated);
}
