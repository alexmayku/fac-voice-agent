'use client';

import { ArrowRight, Clock } from 'lucide-react';
import { NavPill } from '@/components/app/nav-pill';
import { OnboardingDialog } from '@/components/app/onboarding-dialog';

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
  return (
    <div ref={ref} className="welcome-bg flex min-h-svh flex-col px-5 py-6 md:px-16 md:py-7">
      {/* Header */}
      <header className="flex items-center justify-between">
        <div className="flex items-center gap-1.5">
          <div className="h-1.5 w-1.5 rounded-sm bg-[#111827]" />
          <span className="text-[10px] tracking-[1.2px] text-[#6b7280] uppercase">
            Weekly Coach
          </span>
        </div>
        <NavPill />
      </header>

      {/* Main content */}
      <main className="flex flex-1 flex-col justify-center">
        <div className="flex flex-col gap-4 md:gap-9">
          {/* Heading */}
          <div className="flex flex-col gap-4">
            <h1 className="text-[42px] leading-[1.1] font-bold text-[#1f2937] md:text-[60px]">
              Your Coach.
            </h1>
            <p className="max-w-[672px] text-[15px] leading-[22px] text-[#4b5563] md:text-[16px] md:leading-[28px]">
              Here to help you reflect on your week, clarify your goals, and commit to meaningful
              action through focused voice sessions.
            </p>
          </div>

          {/* Session cards */}
          <div className="flex flex-col gap-4 md:flex-row">
            {/* Weekly Planning card */}
            <button
              onClick={() => onStartSession('planning')}
              className="group flex flex-col gap-3 rounded-[20px] border border-[#f3f4f6] bg-white/70 p-6 shadow-[0px_4px_20px_0px_rgba(0,0,0,0.03)] backdrop-blur-md transition-all duration-200 hover:-translate-y-0.5 hover:bg-white/85 hover:shadow-[0px_8px_30px_0px_rgba(0,0,0,0.08)] md:w-[364px]"
            >
              <div className="flex w-full items-center justify-between">
                <span className="text-[11px] font-bold tracking-[1.2px] text-[#d97757] uppercase">
                  Beginning of Week
                </span>
                <ArrowRight className="h-3.5 w-3.5 text-[#9ca3af]/60 transition-transform group-hover:translate-x-0.5" />
              </div>
              <span className="text-left text-[24px] leading-[30px] font-bold text-[#111827] md:text-[30px] md:leading-tight">
                Weekly Planning
              </span>
              <p className="text-left text-[13px] leading-[20px] text-[#4b5563] md:hidden">
                Set intentions for the week ahead. Clarify priorities, outline actionable steps, and
                mentally prepare for upcoming challenges.
              </p>
              <div className="flex items-center gap-1.5 text-[12px] font-bold text-[#d97757]/80">
                <Clock className="h-2.5 w-2.5" />
                <span>10-15 Min Voice Session</span>
              </div>
            </button>

            {/* Weekly Review card */}
            <button
              onClick={() => onStartSession('review')}
              className="group flex flex-col gap-3 rounded-[20px] border border-[#f3f4f6] bg-white/70 p-6 shadow-[0px_4px_20px_0px_rgba(0,0,0,0.03)] backdrop-blur-md transition-all duration-200 hover:-translate-y-0.5 hover:bg-white/85 hover:shadow-[0px_8px_30px_0px_rgba(0,0,0,0.08)] md:w-[364px]"
            >
              <div className="flex w-full items-center justify-between">
                <span className="text-[11px] font-bold tracking-[1.2px] text-[#d97757] uppercase">
                  End of Week
                </span>
                <ArrowRight className="h-3.5 w-3.5 text-[#9ca3af]/60 transition-transform group-hover:translate-x-0.5" />
              </div>
              <span className="text-left text-[24px] leading-[30px] font-bold text-[#111827] md:text-[30px] md:leading-tight">
                Weekly Review
              </span>
              <p className="text-left text-[13px] leading-[20px] text-[#4b5563] md:hidden">
                Look back on your progress. Reflect on your commitments, acknowledge lessons
                learned, and close the week with gratitude.
              </p>
              <div className="flex items-center gap-1.5 text-[12px] font-bold text-[#d97757]/80">
                <Clock className="h-2.5 w-2.5" />
                <span>15-20 Min Voice Reflection</span>
              </div>
            </button>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-[#e5e7eb]/50 px-5 pt-6 text-left text-[11px] leading-[16px] text-[#9ca3af]">
        Your cycle completes every 7 days. Consistency is key.
      </footer>

      <OnboardingDialog open={showOnboarding} onComplete={onOnboardingComplete ?? (() => {})} />
    </div>
  );
};
