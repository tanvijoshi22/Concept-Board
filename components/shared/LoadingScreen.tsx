'use client';

import { useEffect, useState } from 'react';

const MESSAGES = [
  'Analyzing your product vision…',
  'Understanding your users and context…',
  'Exploring the visual landscape…',
  'Synthesizing design directions…',
  'Crafting concept names and keywords…',
  'Composing color palettes…',
  'Selecting typography pairings…',
  'Finalizing your concept directions…',
];

export default function LoadingScreen() {
  const [messageIndex, setMessageIndex] = useState(0);
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    const interval = setInterval(() => {
      setVisible(false);
      setTimeout(() => {
        setMessageIndex((i) => (i + 1) % MESSAGES.length);
        setVisible(true);
      }, 300);
    }, 2400);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="flex flex-col items-center justify-center min-h-screen gap-12 px-4 relative overflow-hidden">
      {/* Ambient glow */}
      <div
        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] rounded-full pointer-events-none animate-pulse"
        style={{
          background: 'radial-gradient(circle, rgba(217,119,6,0.08) 0%, transparent 65%)',
          animationDuration: '3s',
        }}
      />

      {/* Orbital dots */}
      <div className="relative size-16">
        {[0, 1, 2, 3, 4, 5].map((i) => (
          <span
            key={i}
            className="absolute size-1.5 rounded-full bg-accent"
            style={{
              top: '50%',
              left: '50%',
              transformOrigin: '0 -24px',
              transform: `rotate(${i * 60}deg) translateY(-24px)`,
              animation: `fade-in 0.4s ease ${i * 80}ms both, pulse 1.8s ease-in-out ${i * 80}ms infinite`,
              marginTop: '-3px',
              marginLeft: '-3px',
            }}
          />
        ))}
        <span
          className="absolute inset-0 rounded-full border border-accent/20"
          style={{ animation: 'pulse 2.5s ease-in-out infinite' }}
        />
      </div>

      <div className="text-center space-y-3 max-w-xs relative">
        <p
          className="text-zinc-200 text-base font-medium transition-opacity duration-300"
          style={{ opacity: visible ? 1 : 0 }}
        >
          {MESSAGES[messageIndex]}
        </p>
        <p className="text-zinc-600 text-sm">
          Building two distinct concept directions for your product.
        </p>
      </div>
    </div>
  );
}
