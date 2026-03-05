'use client';

import { useEffect, useState } from 'react';
import { useUser } from '@clerk/nextjs';
import { EmailSettings } from '@/components/app/email-settings';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { mergePreferences } from '@/lib/types';
import type { UserPreferences } from '@/lib/types';

interface SettingsDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function SettingsDialog({ open, onOpenChange }: SettingsDialogProps) {
  const { user } = useUser();
  const [preferences, setPreferences] = useState<UserPreferences>(() =>
    mergePreferences(user?.publicMetadata as Record<string, unknown>)
  );
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    if (open && user) {
      setPreferences(mergePreferences(user.publicMetadata as Record<string, unknown>));
      setSaved(false);
    }
  }, [open, user]);

  const handleSave = async () => {
    setSaving(true);
    try {
      await fetch('/api/user-preferences', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(preferences),
      });
      await user?.reload();
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    } catch (err) {
      console.error('Failed to save preferences:', err);
    } finally {
      setSaving(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle className="text-foreground font-serif text-2xl font-light">
            Email Settings
          </DialogTitle>
        </DialogHeader>

        <div className="mt-2">
          <EmailSettings preferences={preferences} onChange={setPreferences} />
        </div>

        <button
          onClick={handleSave}
          disabled={saving}
          className="mt-4 w-full rounded-lg bg-(--coach-green) py-2.5 text-sm font-semibold text-white transition-opacity hover:opacity-90 disabled:opacity-50"
        >
          {saving ? 'Saving...' : saved ? 'Saved!' : 'Save Settings'}
        </button>
      </DialogContent>
    </Dialog>
  );
}
