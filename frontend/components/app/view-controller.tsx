'use client';

import { AnimatePresence, motion } from 'motion/react';
import { useSessionContext } from '@livekit/components-react';
import { SessionView } from '@/components/app/session-view';
import { WelcomeView } from '@/components/app/welcome-view';

const MotionWelcomeView = motion.create(WelcomeView);
const MotionSessionView = motion.create(SessionView);

const VIEW_MOTION_PROPS = {
  variants: {
    visible: {
      opacity: 1,
    },
    hidden: {
      opacity: 0,
    },
  },
  initial: 'hidden',
  animate: 'visible',
  exit: 'hidden',
  transition: {
    duration: 0.5,
    ease: 'linear',
  },
};

interface ViewControllerProps {
  mode: 'planning' | 'review';
  onModeSelect: (mode: 'planning' | 'review') => void;
}

export function ViewController({ mode, onModeSelect }: ViewControllerProps) {
  const { isConnected, start, end } = useSessionContext();

  const handleStartSession = (selectedMode: 'planning' | 'review') => {
    onModeSelect(selectedMode);
    start();
  };

  return (
    <AnimatePresence mode="wait">
      {!isConnected && (
        <MotionWelcomeView
          key="welcome"
          {...VIEW_MOTION_PROPS}
          onStartSession={handleStartSession}
        />
      )}
      {isConnected && (
        <MotionSessionView
          key="session-view"
          {...VIEW_MOTION_PROPS}
          mode={mode}
          onDisconnect={end}
        />
      )}
    </AnimatePresence>
  );
}
