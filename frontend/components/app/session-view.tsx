'use client';

import React, { useCallback, useEffect, useRef, useState } from 'react';
import { Mic, MicOff, PhoneOff, Send } from 'lucide-react';
import { AnimatePresence, motion } from 'motion/react';
import {
  useChat,
  useSessionContext,
  useSessionMessages,
  useVoiceAssistant,
} from '@livekit/components-react';
import { OrbShader } from '@/components/app/orb-shader';
import { useInputControls } from '@/hooks/agents-ui/use-agent-control-bar';
import { cn } from '@/lib/shadcn/utils';

function useSessionTimer() {
  const [seconds, setSeconds] = useState(0);
  useEffect(() => {
    const interval = setInterval(() => setSeconds((s) => s + 1), 1000);
    return () => clearInterval(interval);
  }, []);
  const mins = Math.floor(seconds / 60)
    .toString()
    .padStart(2, '0');
  const secs = (seconds % 60).toString().padStart(2, '0');
  return `${mins}:${secs}`;
}

interface TranscriptMessage {
  id: string;
  role: 'agent' | 'user';
  text: string;
  timestamp: Date;
  isActions?: boolean;
}

function formatTime(date: Date) {
  return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
}

interface SessionViewProps {
  mode: 'planning' | 'review';
  onDisconnect: () => void;
}

export const SessionView = ({
  mode,
  onDisconnect,
  ...props
}: React.ComponentProps<'section'> & SessionViewProps) => {
  const session = useSessionContext();
  const { messages: rawMessages } = useSessionMessages(session);
  const { audioTrack } = useVoiceAssistant();
  const { send: sendChat } = useChat();
  const { microphoneToggle } = useInputControls({});
  const [chatInput, setChatInput] = useState('');
  const scrollRef = useRef<HTMLDivElement>(null);
  const timer = useSessionTimer();

  const isMicMuted = !microphoneToggle.enabled;

  const [volume, setVolume] = useState(0);

  useEffect(() => {
    if (!audioTrack?.publication?.track) return;
    const track = audioTrack.publication.track;
    const ctx = new AudioContext();
    const source = ctx.createMediaStreamSource(new MediaStream([track.mediaStreamTrack]));
    const analyser = ctx.createAnalyser();
    analyser.fftSize = 256;
    source.connect(analyser);
    const data = new Uint8Array(analyser.frequencyBinCount);

    let raf: number;
    const tick = () => {
      analyser.getByteFrequencyData(data);
      const avg = data.reduce((a, b) => a + b, 0) / data.length / 255;
      setVolume(avg);
      raf = requestAnimationFrame(tick);
    };
    tick();

    return () => {
      cancelAnimationFrame(raf);
      ctx.close();
    };
  }, [audioTrack]);

  const transcriptMessages: TranscriptMessage[] = rawMessages.map((msg, i) => {
    const isUser = msg.from?.isLocal === true;
    const text = typeof msg.message === 'string' ? msg.message : '';
    const hasActionMarkers =
      text.includes('COMMITTED ACTIONS') ||
      text.includes('Action items') ||
      text.includes('- ') ||
      text.includes('• ');
    return {
      id: `msg-${i}`,
      role: isUser ? 'user' : 'agent',
      text,
      timestamp: new Date(msg.timestamp ?? Date.now()),
      isActions: !isUser && hasActionMarkers && text.split('\n').length > 2,
    };
  });

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [transcriptMessages.length]);

  const handleSend = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault();
      if (!chatInput.trim()) return;
      await sendChat(chatInput.trim());
      setChatInput('');
    },
    [chatInput, sendChat]
  );

  const sessionTitle = mode === 'review' ? 'Weekly Review' : 'Weekly Planning';

  return (
    <section className="relative flex h-svh w-svw" {...props}>
      <OrbShader audioLevel={volume} sphereCenter={[0, 0.05]} sphereScale={2.8} panelRightWidth={460} />

      {/* Left panel — orb visualizer */}
      <div className="relative z-10 flex flex-1 flex-col items-center justify-center gap-8 max-md:hidden">
        {/* Live badge */}
        <div className="absolute top-7 left-8 flex items-center gap-2">
          <div className="h-1.5 w-1.5 rounded-full bg-(--coach-accent)" />
          <span className="text-[10px] font-medium tracking-[0.12em] text-(--coach-warm-gray) uppercase">
            Live Session
          </span>
          <span className="text-[10px] font-light text-(--coach-muted)">{timer}</span>
        </div>

        {/* Spacer to match orb position rendered by shader */}
        <div className="h-[340px] w-[340px]" />

        {/* Session info */}
        <div className="flex flex-col items-center gap-2">
          <span className="text-[11px] font-medium tracking-[0.15em] text-(--coach-warm-gray) uppercase">
            {sessionTitle}
          </span>
          {transcriptMessages.length > 0 && (
            <p className="max-w-[360px] text-center text-[13px] leading-5 font-light text-(--coach-muted) italic">
              &ldquo;{transcriptMessages[transcriptMessages.length - 1]?.text.slice(0, 80)}
              {(transcriptMessages[transcriptMessages.length - 1]?.text.length ?? 0) > 80
                ? '...'
                : ''}
              &rdquo;
            </p>
          )}
        </div>

        {/* Controls */}
        <div className="flex items-center gap-4">
          <button
            onClick={() => microphoneToggle.toggle()}
            className={cn(
              'flex h-12 w-12 items-center justify-center rounded-full border transition-colors',
              isMicMuted
                ? 'border-(--coach-border) bg-black/[0.05] text-(--coach-muted)'
                : 'text-foreground border-(--coach-border) bg-black/[0.05]'
            )}
          >
            {isMicMuted ? (
              <MicOff className="h-[18px] w-[18px]" />
            ) : (
              <Mic className="h-[18px] w-[18px]" />
            )}
          </button>
          <button
            onClick={() => {
              onDisconnect();
              session.end();
            }}
            className="flex h-12 w-12 items-center justify-center rounded-full bg-(--coach-disconnect) text-white transition-opacity hover:opacity-90"
          >
            <PhoneOff className="h-[18px] w-[18px]" />
          </button>
        </div>
      </div>

      {/* Right panel — transcript */}
      <div className="relative z-10 flex h-full w-full flex-col border-l border-(--coach-border) bg-black/[0.03] md:w-[420px] lg:w-[460px]">
        {/* Transcript header */}
        <div className="flex items-center justify-between border-b border-(--coach-border) px-6 py-5">
          <h3 className="text-[11px] font-medium tracking-[0.12em] text-(--coach-warm-gray) uppercase">
            Transcript
          </h3>
          {/* Mobile-only controls */}
          <div className="flex items-center gap-2 md:hidden">
            <div className="flex items-center gap-1.5 text-[10px] font-medium text-(--coach-warm-gray)">
              <div className="h-1.5 w-1.5 rounded-full bg-(--coach-accent)" />
              {timer}
            </div>
            <button
              onClick={() => microphoneToggle.toggle()}
              className={cn(
                'flex h-8 w-8 items-center justify-center rounded-full',
                isMicMuted
                  ? 'bg-black/[0.05] text-(--coach-muted)'
                  : 'text-foreground bg-black/[0.05]'
              )}
            >
              {isMicMuted ? <MicOff className="h-4 w-4" /> : <Mic className="h-4 w-4" />}
            </button>
            <button
              onClick={() => {
                onDisconnect();
                session.end();
              }}
              className="flex h-8 w-8 items-center justify-center rounded-full bg-(--coach-disconnect) text-white"
            >
              <PhoneOff className="h-4 w-4" />
            </button>
          </div>
        </div>

        {/* Messages */}
        <div ref={scrollRef} className="flex-1 space-y-5 overflow-y-auto px-6 py-6">
          <AnimatePresence>
            {transcriptMessages.map((msg) => (
              <motion.div
                key={msg.id}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.2 }}
                className="flex flex-col"
              >
                <div className="mb-1.5 flex items-center gap-2">
                  <span
                    className={cn(
                      'text-[10px] font-medium tracking-[0.08em] uppercase',
                      msg.role === 'agent' ? 'text-(--coach-accent)' : 'text-foreground'
                    )}
                  >
                    {msg.role === 'agent' ? 'Coach' : 'You'}
                  </span>
                  <span className="text-[10px] font-light text-(--coach-border)">
                    {formatTime(msg.timestamp)}
                  </span>
                </div>
                <div
                  className={cn(
                    'text-[13px] leading-[22px] font-light',
                    msg.isActions
                      ? 'rounded border border-(--coach-accent)/20 bg-(--coach-accent-light) px-4 py-3'
                      : 'text-[#4A4844]'
                  )}
                >
                  {msg.isActions && (
                    <div className="mb-2 flex items-center gap-1.5 text-[10px] font-medium tracking-[0.08em] text-(--coach-accent) uppercase">
                      <svg
                        className="h-3.5 w-3.5"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                        strokeWidth={2}
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                        />
                      </svg>
                      Committed Actions
                    </div>
                  )}
                  <span className="whitespace-pre-wrap">{msg.text}</span>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>

          {transcriptMessages.length === 0 && (
            <div className="flex h-full items-center justify-center text-center text-[13px] font-light text-(--coach-muted)">
              Your coach is listening...
            </div>
          )}
        </div>

        {/* Chat input */}
        <form
          onSubmit={handleSend}
          className="flex items-center gap-3 border-t border-(--coach-border) px-6 py-4"
        >
          <input
            type="text"
            value={chatInput}
            onChange={(e) => setChatInput(e.target.value)}
            placeholder="Type a note or message..."
            className="text-foreground flex-1 rounded border border-(--coach-border) bg-white/50 px-3.5 py-2.5 text-[12px] font-light outline-none placeholder:text-(--coach-border)"
          />
          <button
            type="submit"
            disabled={!chatInput.trim()}
            className="bg-foreground text-background flex h-9 w-9 items-center justify-center rounded-full transition-opacity disabled:opacity-30"
          >
            <Send className="h-4 w-4" />
          </button>
        </form>
      </div>
    </section>
  );
};
