'use client';

import { useState } from 'react';
import { CalendarDays, ClipboardCheck, Settings } from 'lucide-react';
import { UserButton } from '@clerk/nextjs';
import { OnboardingDialog } from '@/components/app/onboarding-dialog';
import { OrbShader } from '@/components/app/orb-shader';
import { SettingsDialog } from '@/components/app/settings-dialog';

interface WelcomeViewProps {
  onStartSession: (mode: 'planning' | 'review') => void;
  showOnboarding?: boolean;
  onOnboardingComplete?: () => void;
}

export const WelcomeView = ({
  onStartSession,
  showOnboarding = false,
  onOnboardingComplete,
  ref,
}: React.ComponentProps<'div'> & WelcomeViewProps) => {
  const [settingsOpen, setSettingsOpen] = useState(false);
  return (
    <div ref={ref} className="relative flex min-h-svh flex-col">
      <OrbShader sphereCenter={[0, 0.07]} sphereScale={3.2} />

      <header className="relative z-10 flex items-center justify-between px-6 py-5 md:px-10">
        <div className="flex items-center gap-2.5">
          <div className="h-2 w-2 rounded-full bg-(--coach-accent)" />
          <span className="text-foreground text-[13px] font-medium tracking-[0.08em] uppercase">
            Coach
          </span>
        </div>
        <div className="flex items-center gap-4 rounded border border-(--coach-border) bg-white/60 px-4 py-2.5 backdrop-blur-sm">
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
      </header>

      <main className="relative z-10 flex flex-1 flex-col items-center justify-center px-6 md:px-10">
        <div className="mt-[280px] flex flex-col items-center gap-12">
          {/* Text */}
          <div className="flex flex-col items-center gap-3.5">
            <p className="text-[11px] font-medium tracking-[0.15em] text-(--coach-warm-gray) uppercase">
              Your Weekly Reflection
            </p>
            <p className="max-w-[420px] text-center text-[15px] leading-6 font-light text-(--coach-muted)">
              Pause. Breathe. Find clarity. Choose a guided session to begin.
            </p>
          </div>

          {/* Session buttons */}
          <div className="flex flex-col items-center gap-4 sm:flex-row">
            <button
              onClick={() => onStartSession('planning')}
              className="flex items-center gap-3 rounded border border-(--coach-border) bg-white/60 px-7 py-3.5 backdrop-blur-sm transition-colors hover:bg-white/70"
            >
              <CalendarDays className="h-4 w-4 text-(--coach-accent)" strokeWidth={1.5} />
              <div className="flex flex-col items-start gap-0.5">
                <span className="text-foreground text-[13px]">Weekly Planning</span>
                <span className="text-[10px] text-(--coach-muted)">Monday · 10 min</span>
              </div>
            </button>
            <button
              onClick={() => onStartSession('review')}
              className="flex items-center gap-3 rounded border border-(--coach-border) bg-white/60 px-7 py-3.5 backdrop-blur-sm transition-colors hover:bg-white/70"
            >
              <ClipboardCheck className="h-4 w-4 text-(--coach-accent)" strokeWidth={1.5} />
              <div className="flex flex-col items-start gap-0.5">
                <span className="text-foreground text-[13px]">Weekly Review</span>
                <span className="text-[10px] text-(--coach-muted)">Friday · 15 min</span>
              </div>
            </button>
          </div>
        </div>
      </main>

      <footer className="relative z-10 py-7 text-center text-[10px] font-light tracking-[0.1em] text-(--coach-border) uppercase">
        Mindfulness for the modern mind
      </footer>

      <OnboardingDialog open={showOnboarding} onComplete={onOnboardingComplete ?? (() => {})} />
      <SettingsDialog open={settingsOpen} onOpenChange={setSettingsOpen} />
    </div>
  );
};
