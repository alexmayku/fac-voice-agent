'use client';

import { useState } from 'react';
import { EmailSettings } from '@/components/app/email-settings';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { DEFAULT_PREFERENCES } from '@/lib/types';
import type { UserPreferences } from '@/lib/types';

interface OnboardingDialogProps {
  open: boolean;
  onComplete: () => void;
}

export function OnboardingDialog({ open, onComplete }: OnboardingDialogProps) {
  const [preferences, setPreferences] = useState<UserPreferences>(DEFAULT_PREFERENCES);
  const [saving, setSaving] = useState(false);

  const handleGetStarted = async () => {
    setSaving(true);
    try {
      await fetch('/api/user-preferences', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...preferences, onboardingComplete: true }),
      });
      onComplete();
    } catch (err) {
      console.error('Failed to save preferences:', err);
    } finally {
      setSaving(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={() => {}}>
      <DialogContent
        className="sm:max-w-lg"
        showCloseButton={false}
        onPointerDownOutside={(e) => e.preventDefault()}
        onEscapeKeyDown={(e) => e.preventDefault()}
        onInteractOutside={(e) => e.preventDefault()}
      >
        <DialogHeader className="items-center text-center">
          <DialogTitle className="text-foreground text-lg font-normal">
            Welcome to Coach
          </DialogTitle>
          <DialogDescription className="text-[12px] leading-5 font-normal text-(--coach-warm-gray)">
            Two weekly rituals to keep you focused. Monday planning sets your intentions. Friday
            review celebrates your wins.
          </DialogDescription>
        </DialogHeader>

        <div className="mt-4">
          <p className="mb-3 text-[10px] font-medium tracking-[0.12em] text-(--coach-warm-gray) uppercase">
            Email Reminders
          </p>
          <EmailSettings preferences={preferences} onChange={setPreferences} />
        </div>

        <button
          onClick={handleGetStarted}
          disabled={saving}
          className="bg-foreground text-background mt-4 w-full rounded py-3.5 text-[12px] font-medium tracking-[0.06em] transition-opacity hover:opacity-90 disabled:opacity-50"
        >
          {saving ? 'Saving...' : 'Get Started'}
        </button>
      </DialogContent>
    </Dialog>
  );
}
