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
        <DialogHeader>
          <DialogTitle className="text-foreground font-serif text-2xl font-light">
            Welcome to Coach
          </DialogTitle>
          <DialogDescription className="text-sm leading-relaxed text-(--coach-warm-gray)">
            Each week follows a simple rhythm: on{' '}
            <strong className="text-foreground">Monday</strong>, you&apos;ll get a link to a short
            voice coaching session where we&apos;ll map out your priorities — then a summary lands
            in your inbox. On <strong className="text-foreground">Friday</strong>, another link
            arrives for a quick review of how the week went. You can adjust or turn off these
            reminders below.
          </DialogDescription>
        </DialogHeader>

        <div className="mt-2">
          <p className="text-foreground mb-3 text-sm font-medium">Email Reminders</p>
          <EmailSettings preferences={preferences} onChange={setPreferences} />
        </div>

        <button
          onClick={handleGetStarted}
          disabled={saving}
          className="mt-4 w-full rounded-lg bg-(--coach-green) py-2.5 text-sm font-semibold text-white transition-opacity hover:opacity-90 disabled:opacity-50"
        >
          {saving ? 'Saving...' : 'Get Started'}
        </button>
      </DialogContent>
    </Dialog>
  );
}
