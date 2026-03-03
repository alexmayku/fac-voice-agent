'use client';

import { ArrowRight, CalendarDays, ClipboardCheck } from 'lucide-react';
import { UserButton } from '@clerk/nextjs';

interface WelcomeViewProps {
  onStartSession: (mode: 'planning' | 'review') => void;
}

export const WelcomeView = ({
  onStartSession,
  ref,
}: React.ComponentProps<'div'> & WelcomeViewProps) => {
  return (
    <div ref={ref} className="flex min-h-svh flex-col">
      <header className="flex items-center justify-between px-6 py-5 md:px-10">
        <div className="flex items-center gap-2">
          <svg
            width="28"
            height="28"
            viewBox="0 0 28 28"
            fill="none"
            className="text-(--coach-green)"
          >
            <path
              d="M14 2C12 6 8 8 4 10C8 12 12 16 14 22C16 16 20 12 24 10C20 8 16 6 14 2Z"
              fill="currentColor"
              opacity="0.7"
            />
            <path
              d="M14 6C13 9 10 11 7 12C10 13 13 16 14 20C15 16 18 13 21 12C18 11 15 9 14 6Z"
              fill="currentColor"
            />
          </svg>
          <span className="text-foreground text-lg font-semibold tracking-tight">Coach</span>
        </div>
        <UserButton
          appearance={{
            elements: {
              avatarBox: 'h-9 w-9',
            },
          }}
        />
      </header>

      <main className="flex flex-1 flex-col items-center justify-center px-6 pb-16 md:px-10">
        <p className="mb-2 text-xs font-semibold tracking-[0.2em] text-(--coach-warm-gray) uppercase">
          Weekly Ritual
        </p>
        <h1 className="text-foreground mb-3 text-center font-serif text-4xl font-light tracking-tight md:text-5xl">
          Your Weekly Reflection
        </h1>
        <p className="mb-12 max-w-md text-center text-base leading-relaxed text-(--coach-warm-gray)">
          Pause, breathe, and find clarity. Choose a guided session to begin your journey toward
          focus.
        </p>

        <div className="grid w-full max-w-3xl grid-cols-1 gap-6 md:grid-cols-2">
          {/* Planning card */}
          <div className="bg-card group flex flex-col overflow-hidden rounded-2xl border border-(--coach-border) shadow-sm transition-shadow hover:shadow-md">
            <div className="flex h-48 items-center justify-center bg-(--coach-green-light)">
              <div className="flex flex-col items-center gap-3">
                <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-(--coach-green) text-white">
                  <CalendarDays className="h-8 w-8" />
                </div>
                <div className="h-1 w-16 rounded-full bg-(--coach-green) opacity-30" />
              </div>
            </div>
            <div className="flex flex-1 flex-col p-6">
              <div className="mb-2 flex items-center gap-2 text-xs font-semibold tracking-[0.15em] text-(--coach-warm-gray) uppercase">
                <CalendarDays className="h-3.5 w-3.5" />
                Monday Morning
              </div>
              <h2 className="text-foreground mb-2 font-serif text-2xl font-medium">
                Weekly Planning
              </h2>
              <p className="mb-6 flex-1 text-sm leading-relaxed text-(--coach-warm-gray)">
                Set your intentions for the week ahead with a guided voice session designed to align
                your goals.
              </p>
              <div className="flex items-center justify-between">
                <span className="text-sm text-(--coach-warm-gray)">10 min session</span>
                <button
                  onClick={() => onStartSession('planning')}
                  className="inline-flex items-center gap-2 rounded-lg bg-(--coach-green) px-5 py-2.5 text-sm font-semibold text-white transition-opacity hover:opacity-90"
                >
                  Begin Session
                  <ArrowRight className="h-4 w-4" />
                </button>
              </div>
            </div>
          </div>

          {/* Review card */}
          <div className="bg-card group flex flex-col overflow-hidden rounded-2xl border border-(--coach-border) shadow-sm transition-shadow hover:shadow-md">
            <div className="flex h-48 items-center justify-center bg-(--coach-orange-light)">
              <div className="flex flex-col items-center gap-3">
                <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-(--coach-orange) text-white">
                  <ClipboardCheck className="h-8 w-8" />
                </div>
                <div className="h-1 w-16 rounded-full bg-(--coach-orange) opacity-30" />
              </div>
            </div>
            <div className="flex flex-1 flex-col p-6">
              <div className="mb-2 flex items-center gap-2 text-xs font-semibold tracking-[0.15em] text-(--coach-warm-gray) uppercase">
                <ClipboardCheck className="h-3.5 w-3.5" />
                Friday Afternoon
              </div>
              <h2 className="text-foreground mb-2 font-serif text-2xl font-medium">
                Weekly Review
              </h2>
              <p className="mb-6 flex-1 text-sm leading-relaxed text-(--coach-warm-gray)">
                Reflect on your progress, celebrate small wins, and clear your mind from the past
                week.
              </p>
              <div className="flex items-center justify-between">
                <span className="text-sm text-(--coach-warm-gray)">15 min session</span>
                <button
                  onClick={() => onStartSession('review')}
                  className="border-foreground/20 text-foreground inline-flex items-center gap-2 rounded-lg border bg-transparent px-5 py-2.5 text-sm font-semibold transition-colors hover:bg-black/5"
                >
                  Start Review
                  <ArrowRight className="h-4 w-4" />
                </button>
              </div>
            </div>
          </div>
        </div>
      </main>

      <footer className="py-6 text-center text-xs text-(--coach-warm-gray)">
        Mindfulness for the modern mind.
      </footer>
    </div>
  );
};
