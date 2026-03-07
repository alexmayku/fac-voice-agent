'use client';

import { useEffect, useRef, useState } from 'react';

interface OrbShaderProps {
  audioLevel?: number;
  sphereCenter?: [number, number];
  sphereScale?: number;
  panelRightWidth?: number;
}

/**
 * Fixed background gradient layer — covers the full viewport.
 */
export function SessionBackground() {
  return (
    <div
      className="pointer-events-none fixed inset-0 z-0"
      style={{
        backgroundImage: [
          `radial-gradient(ellipse at 100% 0%, rgba(133,237,255,0.25) 0%, rgba(67,119,128,0.125) 25%, transparent 50%)`,
          `radial-gradient(ellipse at 0% 0%, rgba(249,255,158,0.2) 0%, rgba(125,128,79,0.1) 25%, transparent 50%)`,
          `linear-gradient(90deg, #fafafa 0%, #fafafa 100%)`,
        ].join(', '),
      }}
    />
  );
}

/**
 * Soft terracotta orb — placed inline wherever needed. Reacts to audio level.
 */
export function OrbShader({ audioLevel = 0 }: OrbShaderProps) {
  const smoothRef = useRef(0);
  const [smooth, setSmooth] = useState(0);

  useEffect(() => {
    let raf: number;
    const tick = () => {
      const target = audioLevel;
      const rise = target > smoothRef.current ? 0.35 : 0.12;
      smoothRef.current += (target - smoothRef.current) * rise;
      setSmooth(smoothRef.current);
      raf = requestAnimationFrame(tick);
    };
    tick();
    return () => cancelAnimationFrame(raf);
  }, [audioLevel]);

  const scale = 1 + smooth * 0.15;
  const glow = 0.12 + smooth * 0.15;

  return (
    <div
      className="pointer-events-none relative"
      style={{
        width: 320,
        height: 320,
        transform: `scale(${scale})`,
        transition: 'transform 0.1s ease-out',
      }}
    >
      {/* Ambient glow — cyan + yellow accents */}
      <div
        className="absolute inset-0 rounded-full"
        style={{
          background: `
            radial-gradient(circle at 40% 40%, rgba(217,119,87,${glow}) 0%, rgba(217,119,87,0.04) 40%, transparent 65%),
            radial-gradient(circle at 60% 60%, rgba(133,237,255,0.06) 0%, transparent 50%),
            radial-gradient(circle at 50% 40%, rgba(249,255,158,0.04) 0%, transparent 60%)
          `,
          filter: 'blur(16px)',
        }}
      />
      {/* Main orb — soft terracotta */}
      <div
        className="absolute rounded-full"
        style={{
          width: 200,
          height: 200,
          left: 60,
          top: 60,
          background: `radial-gradient(circle at 40% 35%, rgba(217,119,87,0.55) 0%, rgba(217,119,87,0.2) 45%, transparent 70%)`,
          boxShadow: `0 0 50px rgba(217,119,87,${0.15 + smooth * 0.12})`,
          filter: 'blur(4px)',
        }}
      />
      {/* Inner core — solid, vivid center */}
      <div
        className="absolute rounded-full"
        style={{
          width: 100,
          height: 100,
          left: 110,
          top: 110,
          background: `radial-gradient(circle at 45% 40%, rgba(217,119,87,0.7) 0%, rgba(217,119,87,0.35) 40%, transparent 70%)`,
          filter: 'blur(6px)',
        }}
      />
    </div>
  );
}
