export interface EmailPreference {
  enabled: boolean;
  time: string;
}

export interface UserPreferences {
  onboardingComplete: boolean;
  emails: {
    planning: EmailPreference;
    review: EmailPreference;
  };
}

export const DEFAULT_PREFERENCES: UserPreferences = {
  onboardingComplete: false,
  emails: {
    planning: { enabled: true, time: '08:30' },
    review: { enabled: true, time: '08:30' },
  },
};

export const TIME_SLOTS = ['07:00', '07:30', '08:00', '08:30', '09:00', '09:30', '10:00'] as const;

export function formatTime(time: string): string {
  const [hours, minutes] = time.split(':').map(Number);
  const period = hours >= 12 ? 'PM' : 'AM';
  const displayHours = hours % 12 || 12;
  return `${displayHours}:${minutes.toString().padStart(2, '0')} ${period}`;
}

export function mergePreferences(metadata: Record<string, unknown> | undefined): UserPreferences {
  if (!metadata?.preferences) return DEFAULT_PREFERENCES;
  const stored = metadata.preferences as Partial<UserPreferences>;
  return {
    onboardingComplete: stored.onboardingComplete ?? DEFAULT_PREFERENCES.onboardingComplete,
    emails: {
      planning: {
        enabled: stored.emails?.planning?.enabled ?? DEFAULT_PREFERENCES.emails.planning.enabled,
        time: stored.emails?.planning?.time ?? DEFAULT_PREFERENCES.emails.planning.time,
      },
      review: {
        enabled: stored.emails?.review?.enabled ?? DEFAULT_PREFERENCES.emails.review.enabled,
        time: stored.emails?.review?.time ?? DEFAULT_PREFERENCES.emails.review.time,
      },
    },
  };
}
