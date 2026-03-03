'use client';

import { UserButton } from '@clerk/nextjs';
import { CalendarDays, ClipboardCheck, ArrowRight } from 'lucide-react';

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
        <p className="text-(--coach-warm-gray) mb-2 text-xs font-semibold tracking-[0.2em] uppercase">
          Weekly Ritual
        </p>
        <h1 className="text-foreground mb-3 text-center font-serif text-4xl font-light tracking-tight md:text-5xl">
          Your Weekly Reflection
        </h1>
        <p className="text-(--coach-warm-gray) mb-12 max-w-md text-center text-base leading-relaxed">
          Pause, breathe, and find clarity. Choose a guided session to begin your journey toward
          focus.
        </p>

        <div className="grid w-full max-w-3xl grid-cols-1 gap-6 md:grid-cols-2">
          {/* Planning card */}
          <div className="bg-card border-(--coach-border) group flex flex-col overflow-hidden rounded-2xl border shadow-sm transition-shadow hover:shadow-md">
            <div className="bg-(--coach-green-light) flex h-48 items-center justify-center">
              <div className="flex flex-col items-center gap-3">
                <div className="bg-(--coach-green) flex h-16 w-16 items-center justify-center rounded-2xl text-white">
                  <CalendarDays className="h-8 w-8" />
                </div>
                <div className="bg-(--coach-green) h-1 w-16 rounded-full opacity-30" />
              </div>
            </div>
            <div className="flex flex-1 flex-col p-6">
              <div className="text-(--coach-warm-gray) mb-2 flex items-center gap-2 text-xs font-semibold tracking-[0.15em] uppercase">
                <CalendarDays className="h-3.5 w-3.5" />
                Monday Morning
              </div>
              <h2 className="text-foreground mb-2 font-serif text-2xl font-medium">
                Weekly Planning
              </h2>
              <p className="text-(--coach-warm-gray) mb-6 flex-1 text-sm leading-relaxed">
                Set your intentions for the week ahead with a guided voice session designed to align
                your goals.
              </p>
              <div className="flex items-center justify-between">
                <span className="text-(--coach-warm-gray) text-sm">10 min session</span>
                <button
                  onClick={() => onStartSession('planning')}
                  className="bg-(--coach-green) inline-flex items-center gap-2 rounded-lg px-5 py-2.5 text-sm font-semibold text-white transition-opacity hover:opacity-90"
                >
                  Begin Session
                  <ArrowRight className="h-4 w-4" />
                </button>
              </div>
            </div>
          </div>

          {/* Review card */}
          <div className="bg-card border-(--coach-border) group flex flex-col overflow-hidden rounded-2xl border shadow-sm transition-shadow hover:shadow-md">
            <div className="bg-(--coach-orange-light) flex h-48 items-center justify-center">
              <div className="flex flex-col items-center gap-3">
                <div className="bg-(--coach-orange) flex h-16 w-16 items-center justify-center rounded-2xl text-white">
                  <ClipboardCheck className="h-8 w-8" />
                </div>
                <div className="bg-(--coach-orange) h-1 w-16 rounded-full opacity-30" />
              </div>
            </div>
            <div className="flex flex-1 flex-col p-6">
              <div className="text-(--coach-warm-gray) mb-2 flex items-center gap-2 text-xs font-semibold tracking-[0.15em] uppercase">
                <ClipboardCheck className="h-3.5 w-3.5" />
                Friday Afternoon
              </div>
              <h2 className="text-foreground mb-2 font-serif text-2xl font-medium">
                Weekly Review
              </h2>
              <p className="text-(--coach-warm-gray) mb-6 flex-1 text-sm leading-relaxed">
                Reflect on your progress, celebrate small wins, and clear your mind from the past
                week.
              </p>
              <div className="flex items-center justify-between">
                <span className="text-(--coach-warm-gray) text-sm">15 min session</span>
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

      <footer className="text-(--coach-warm-gray) py-6 text-center text-xs">
        Mindfulness for the modern mind.
      </footer>
    </div>
  );
};
