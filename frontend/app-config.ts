export interface AppConfig {
  pageTitle: string;
  pageDescription: string;
  companyName: string;

  supportsChatInput: boolean;
  supportsVideoInput: boolean;
  supportsScreenShare: boolean;
  isPreConnectBufferEnabled: boolean;

  logo: string;
  startButtonText: string;
  accent?: string;
  logoDark?: string;
  accentDark?: string;

  // agent dispatch configuration
  agentName?: string;

  // LiveKit Cloud Sandbox configuration
  sandboxId?: string;
}

export const APP_CONFIG_DEFAULTS: AppConfig = {
  companyName: 'Coach',
  pageTitle: 'Weekly Coach',
  pageDescription: 'Your weekly voice coaching ritual',

  supportsChatInput: true,
  supportsVideoInput: false,
  supportsScreenShare: false,
  isPreConnectBufferEnabled: true,

  logo: '/lk-logo.svg',
  accent: '#5b7553',
  logoDark: '/lk-logo-dark.svg',
  accentDark: '#7b9b73',
  startButtonText: 'Begin Session',

  agentName: process.env.AGENT_NAME ?? undefined,

  sandboxId: undefined,
};
