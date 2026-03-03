'use client';

import React, { useEffect, useRef, useState, useCallback } from 'react';
import { Mic, MicOff, PhoneOff, Send } from 'lucide-react';
import { AnimatePresence, motion } from 'motion/react';
import {
  useSessionContext,
  useSessionMessages,
  useVoiceAssistant,
  useChat,
} from '@livekit/components-react';
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

interface AudioRingVisualizerProps {
  volume: number;
  isSpeaking: boolean;
  isMuted: boolean;
}

function AudioRingVisualizer({ volume, isSpeaking, isMuted }: AudioRingVisualizerProps) {
  const ringScale1 = 1 + volume * 0.15;
  const ringScale2 = 1 + volume * 0.25;
  const ringScale3 = 1 + volume * 0.35;

  return (
    <div className="relative flex items-center justify-center">
      {/* Outer rings */}
      <motion.div
        animate={{ scale: isSpeaking ? ringScale3 : 1, opacity: isSpeaking ? 0.08 : 0.04 }}
        transition={{ type: 'spring', stiffness: 300, damping: 20 }}
        className="border-(--coach-orange) absolute h-72 w-72 rounded-full border"
      />
      <motion.div
        animate={{ scale: isSpeaking ? ringScale2 : 1, opacity: isSpeaking ? 0.12 : 0.06 }}
        transition={{ type: 'spring', stiffness: 300, damping: 20 }}
        className="border-(--coach-orange) absolute h-56 w-56 rounded-full border"
      />
      <motion.div
        animate={{ scale: isSpeaking ? ringScale1 : 1, opacity: isSpeaking ? 0.2 : 0.1 }}
        transition={{ type: 'spring', stiffness: 300, damping: 20 }}
        className="border-(--coach-orange) absolute h-40 w-40 rounded-full border"
      />

      {/* Center mic */}
      <motion.div
        animate={{ scale: isSpeaking ? 1.05 : 1 }}
        transition={{ type: 'spring', stiffness: 400, damping: 20 }}
        className={cn(
          'relative z-10 flex h-24 w-24 items-center justify-center rounded-full shadow-lg',
          isMuted ? 'bg-(--coach-warm-gray)' : 'bg-(--coach-orange)'
        )}
      >
        {isMuted ? (
          <MicOff className="h-10 w-10 text-white" />
        ) : (
          <Mic className="h-10 w-10 text-white" />
        )}
      </motion.div>
    </div>
  );
}

interface WaveformBarsProps {
  volume: number;
  isSpeaking: boolean;
  barCount?: number;
}

function WaveformBars({ volume, isSpeaking, barCount = 24 }: WaveformBarsProps) {
  const bars = Array.from({ length: barCount }, (_, i) => {
    const center = barCount / 2;
    const distFromCenter = Math.abs(i - center) / center;
    const baseHeight = 0.15 + (1 - distFromCenter) * 0.4;
    const dynamicHeight = isSpeaking ? baseHeight + volume * (1 - distFromCenter) * 0.5 : 0.15;
    return Math.min(dynamicHeight, 1);
  });

  return (
    <div className="flex items-end justify-center gap-[2px]">
      {bars.map((height, i) => (
        <motion.div
          key={i}
          animate={{ height: `${Math.max(height * 32, 4)}px` }}
          transition={{ type: 'spring', stiffness: 400, damping: 25 }}
          className="bg-(--coach-orange) w-[3px] rounded-full opacity-60"
        />
      ))}
    </div>
  );
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
  const { state: agentState, audioTrack } = useVoiceAssistant();
  const { send: sendChat } = useChat();
  const { microphoneToggle } = useInputControls({});
  const [chatInput, setChatInput] = useState('');
  const scrollRef = useRef<HTMLDivElement>(null);
  const timer = useSessionTimer();

  const isSpeaking = agentState === 'speaking';
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
      timestamp: new Date(msg.receivedAt ?? Date.now()),
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
    <section className="bg-background flex h-svh w-svw" {...props}>
      {/* Left panel — visualizer */}
      <div className="relative flex flex-1 flex-col items-center justify-between py-6 max-md:hidden">
        {/* Live badge */}
        <div className="flex items-center gap-2">
          <div className="bg-(--coach-orange) flex items-center gap-2 rounded-full px-4 py-1.5 text-xs font-semibold text-white">
            <span className="bg-white/80 inline-block h-2 w-2 animate-pulse rounded-full" />
            LIVE SESSION &bull; {timer}
          </div>
        </div>

        {/* Visualizer */}
        <div className="flex flex-col items-center gap-8">
          <AudioRingVisualizer volume={volume} isSpeaking={isSpeaking} isMuted={isMicMuted} />
          <WaveformBars volume={volume} isSpeaking={isSpeaking} />
          <div className="text-center">
            <h2 className="text-foreground font-serif text-2xl font-medium">{sessionTitle}</h2>
            {transcriptMessages.length > 0 && (
              <p className="text-(--coach-warm-gray) mt-1 max-w-xs text-sm italic">
                &ldquo;{transcriptMessages[transcriptMessages.length - 1]?.text.slice(0, 80)}
                {(transcriptMessages[transcriptMessages.length - 1]?.text.length ?? 0) > 80
                  ? '...'
                  : ''}
                &rdquo;
              </p>
            )}
          </div>
        </div>

        {/* Controls */}
        <div className="flex items-center gap-3">
          <button
            onClick={() => microphoneToggle.toggle()}
            className={cn(
              'flex h-12 w-12 items-center justify-center rounded-full transition-colors',
              isMicMuted
                ? 'bg-(--coach-warm-gray)/20 text-(--coach-warm-gray)'
                : 'bg-secondary text-foreground'
            )}
          >
            {isMicMuted ? <MicOff className="h-5 w-5" /> : <Mic className="h-5 w-5" />}
          </button>
          <button
            onClick={() => {
              onDisconnect();
              session.end();
            }}
            className="bg-(--coach-orange) flex h-14 w-14 items-center justify-center rounded-full text-white transition-opacity hover:opacity-90"
          >
            <PhoneOff className="h-6 w-6" />
          </button>
        </div>
      </div>

      {/* Right panel — transcript */}
      <div className="border-(--coach-border) flex h-full w-full flex-col border-l md:w-[420px] lg:w-[460px]">
        {/* Transcript header */}
        <div className="border-(--coach-border) flex items-center justify-between border-b px-5 py-4">
          <h3 className="text-foreground text-sm font-semibold">Transcript</h3>
          {/* Mobile-only live badge and controls */}
          <div className="flex items-center gap-2 md:hidden">
            <div className="bg-(--coach-orange) flex items-center gap-1.5 rounded-full px-3 py-1 text-[10px] font-semibold text-white">
              <span className="bg-white/80 inline-block h-1.5 w-1.5 animate-pulse rounded-full" />
              {timer}
            </div>
            <button
              onClick={() => microphoneToggle.toggle()}
              className={cn(
                'flex h-8 w-8 items-center justify-center rounded-full text-xs',
                isMicMuted
                  ? 'bg-(--coach-warm-gray)/20 text-(--coach-warm-gray)'
                  : 'bg-secondary text-foreground'
              )}
            >
              {isMicMuted ? <MicOff className="h-4 w-4" /> : <Mic className="h-4 w-4" />}
            </button>
            <button
              onClick={() => {
                onDisconnect();
                session.end();
              }}
              className="bg-(--coach-orange) flex h-8 w-8 items-center justify-center rounded-full text-white"
            >
              <PhoneOff className="h-4 w-4" />
            </button>
          </div>
        </div>

        {/* Messages */}
        <div ref={scrollRef} className="flex-1 space-y-4 overflow-y-auto px-5 py-4">
          <AnimatePresence>
            {transcriptMessages.map((msg) => (
              <motion.div
                key={msg.id}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.2 }}
                className={cn('flex flex-col', msg.role === 'user' ? 'items-end' : 'items-start')}
              >
                <div
                  className={cn(
                    'mb-1 flex items-center gap-1.5 text-[10px] font-semibold tracking-wide uppercase',
                    msg.role === 'user'
                      ? 'text-(--coach-warm-gray)'
                      : 'text-(--coach-orange)'
                  )}
                >
                  {msg.role === 'agent' && (
                    <span className="bg-(--coach-orange) inline-flex h-4 w-4 items-center justify-center rounded-full text-[8px] text-white">
                      C
                    </span>
                  )}
                  {msg.role === 'agent' ? 'AI Coach' : 'You'} &bull; {formatTime(msg.timestamp)}
                  {msg.role === 'user' && (
                    <span className="bg-(--coach-green) inline-flex h-4 w-4 items-center justify-center rounded-full text-[8px] text-white">
                      U
                    </span>
                  )}
                </div>
                <div
                  className={cn(
                    'max-w-[85%] rounded-2xl px-4 py-3 text-sm leading-relaxed',
                    msg.isActions
                      ? 'border-(--coach-green) bg-(--coach-green-light) border'
                      : msg.role === 'user'
                        ? 'bg-(--coach-cream) text-foreground border-(--coach-border) border'
                        : 'bg-card text-foreground border-(--coach-border) border'
                  )}
                >
                  {msg.isActions && (
                    <div className="text-(--coach-green) mb-2 flex items-center gap-1.5 text-[10px] font-bold tracking-wider uppercase">
                      <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
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
            <div className="text-(--coach-warm-gray) flex h-full items-center justify-center text-center text-sm">
              Your coach is listening...
            </div>
          )}
        </div>

        {/* Chat input */}
        <form
          onSubmit={handleSend}
          className="border-(--coach-border) flex items-center gap-2 border-t px-4 py-3"
        >
          <input
            type="text"
            value={chatInput}
            onChange={(e) => setChatInput(e.target.value)}
            placeholder="Type a note or message..."
            className="bg-secondary text-foreground placeholder:text-(--coach-warm-gray) flex-1 rounded-full px-4 py-2.5 text-sm outline-none"
          />
          <button
            type="submit"
            disabled={!chatInput.trim()}
            className="bg-(--coach-green) flex h-9 w-9 items-center justify-center rounded-full text-white transition-opacity disabled:opacity-30"
          >
            <Send className="h-4 w-4" />
          </button>
        </form>
      </div>
    </section>
  );
};
