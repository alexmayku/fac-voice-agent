'use client';

import { useCallback, useMemo, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { TokenSource } from 'livekit-client';
import { useUser } from '@clerk/nextjs';
import { useSession } from '@livekit/components-react';
import { WarningIcon } from '@phosphor-icons/react/dist/ssr';
import type { AppConfig } from '@/app-config';
import { AgentSessionProvider } from '@/components/agents-ui/agent-session-provider';
import { StartAudioButton } from '@/components/agents-ui/start-audio-button';
import { ViewController } from '@/components/app/view-controller';
import { Toaster } from '@/components/ui/sonner';
import { useAgentErrors } from '@/hooks/useAgentErrors';
import { useDebugMode } from '@/hooks/useDebug';
import { getSandboxTokenSource } from '@/lib/utils';

const IN_DEVELOPMENT = process.env.NODE_ENV !== 'production';

function AppSetup() {
  useDebugMode({ enabled: IN_DEVELOPMENT });
  useAgentErrors();

  return null;
}

interface AppProps {
  appConfig: AppConfig;
}

export function App({ appConfig }: AppProps) {
  const searchParams = useSearchParams();
  const urlMode = searchParams.get('mode');
  const { user } = useUser();
  const [selectedMode, setSelectedMode] = useState<'planning' | 'review'>(
    urlMode === 'review' ? 'review' : 'planning'
  );
  const [onboardingDismissed, setOnboardingDismissed] = useState(false);

  const showOnboarding =
    !onboardingDismissed &&
    !!user &&
    (user.publicMetadata as Record<string, unknown>)?.preferences === undefined;

  const handleOnboardingComplete = useCallback(() => {
    setOnboardingDismissed(true);
    user?.reload();
  }, [user]);

  const effectiveAgentName = selectedMode === 'review' ? 'review-coach' : 'weekly-coach';

  const handleModeSelect = useCallback((mode: 'planning' | 'review') => {
    setSelectedMode(mode);
  }, []);

  const effectiveConfig = useMemo(() => {
    return { ...appConfig, agentName: effectiveAgentName };
  }, [appConfig, effectiveAgentName]);

  const tokenSource = useMemo(() => {
    if (typeof process.env.NEXT_PUBLIC_CONN_DETAILS_ENDPOINT === 'string') {
      return getSandboxTokenSource(effectiveConfig);
    }
    return TokenSource.custom(async () => {
      const res = await fetch('/api/connection-details', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          room_config: effectiveAgentName
            ? { agents: [{ agent_name: effectiveAgentName }] }
            : undefined,
        }),
      });
      return await res.json();
    });
  }, [effectiveConfig, effectiveAgentName]);

  const session = useSession(tokenSource);

  return (
    <AgentSessionProvider session={session}>
      <AppSetup />
      <ViewController
        mode={selectedMode}
        onModeSelect={handleModeSelect}
        showOnboarding={showOnboarding}
        onOnboardingComplete={handleOnboardingComplete}
      />
      <StartAudioButton label="Start Audio" />
      <Toaster
        icons={{
          warning: <WarningIcon weight="bold" />,
        }}
        position="top-center"
        className="toaster group"
        style={
          {
            '--normal-bg': 'var(--popover)',
            '--normal-text': 'var(--popover-foreground)',
            '--normal-border': 'var(--border)',
          } as React.CSSProperties
        }
      />
    </AgentSessionProvider>
  );
}
