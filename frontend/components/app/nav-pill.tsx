'use client';

import { useState } from 'react';
import { Settings } from 'lucide-react';
import { UserButton } from '@clerk/nextjs';
import { SettingsDialog } from '@/components/app/settings-dialog';

export function NavPill() {
  const [settingsOpen, setSettingsOpen] = useState(false);

  return (
    <>
      <div className="flex items-center gap-4 rounded-3xl border border-(--coach-border) bg-white/70 px-4 py-2.5 shadow backdrop-blur-md">
        <button
          onClick={() => setSettingsOpen(true)}
          className="hover:text-foreground text-(--coach-muted) transition-colors"
          aria-label="Settings"
        >
          <Settings className="h-[18px] w-[18px]" />
        </button>
        <UserButton
          appearance={{
            elements: {
              avatarBox: 'h-8 w-8',
            },
          }}
        />
      </div>
      <SettingsDialog open={settingsOpen} onOpenChange={setSettingsOpen} />
    </>
  );
}
