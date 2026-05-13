'use client';

import { useState, useRef, useEffect } from 'react';
import { ConceptDirection, RefinementMessage } from '@/lib/types';
import { AnalystOutput } from '@/lib/types/agents';
import Button from '../shared/Button';

interface RefinementPanelProps {
  direction: ConceptDirection;
  brief: AnalystOutput | null;
  history: RefinementMessage[];
  onUpdate: (updated: ConceptDirection) => void;
  onHistoryUpdate: (history: RefinementMessage[]) => void;
  onClose: () => void;
}

export default function RefinementPanel({
  direction,
  brief,
  history,
  onUpdate,
  onHistoryUpdate,
  onClose,
}: RefinementPanelProps) {
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [history]);

  async function handleSubmit() {
    const message = input.trim();
    if (!message || loading) return;

    setInput('');
    setError(null);

    const newHistory: RefinementMessage[] = [
      ...history,
      { role: 'user', content: message },
    ];
    onHistoryUpdate(newHistory);
    setLoading(true);

    try {
      const res = await fetch('/api/refine', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ direction, brief, userMessage: message }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || 'Refinement failed');
      }

      const updated: ConceptDirection = await res.json();
      onUpdate(updated);
      onHistoryUpdate([
        ...newHistory,
        { role: 'assistant', content: `Updated: "${updated.conceptName}" — ${updated.tagline}` },
      ]);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  }

  function handleKeyDown(e: React.KeyboardEvent<HTMLTextAreaElement>) {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  }

  return (
    <div className="fixed inset-y-0 right-0 w-full max-w-md bg-surface border-l border-white/[0.06] flex flex-col z-50 shadow-2xl">
      {/* Header */}
      <div className="px-6 py-4 border-b border-white/[0.06] flex items-center justify-between flex-shrink-0">
        <div>
          <p className="text-xs uppercase tracking-widest text-zinc-600 mb-0.5">Refining</p>
          <p className="text-zinc-200 font-medium" style={{ fontFamily: 'var(--font-playfair)' }}>
            {direction.conceptName}
          </p>
        </div>
        <button
          onClick={onClose}
          className="text-zinc-500 hover:text-zinc-300 transition-colors p-2 rounded-lg hover:bg-white/5"
        >
          <svg className="size-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>

      {/* Current direction summary */}
      <div className="px-6 py-3 bg-bg/50 border-b border-white/[0.04] flex-shrink-0">
        <p className="text-xs text-zinc-600 italic leading-relaxed">{direction.tagline}</p>
        <div className="flex gap-1.5 mt-2">
          {direction.keywords.map((kw, i) => (
            <span key={i} className="text-xs px-2 py-0.5 rounded-full border border-white/10 text-zinc-500">
              {kw.word}
            </span>
          ))}
        </div>
      </div>

      {/* Message history */}
      <div className="flex-1 overflow-y-auto px-6 py-4 space-y-4">
        {history.length === 0 && (
          <div className="text-center py-8 space-y-2">
            <p className="text-zinc-500 text-sm">What would you like to change?</p>
            <div className="space-y-1 text-xs text-zinc-700">
              <p>"Make the color palette warmer"</p>
              <p>"Push the typography in a more minimal direction"</p>
              <p>"Make the concept feel more premium"</p>
            </div>
          </div>
        )}
        {history.map((msg, i) => (
          <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
            <div
              className={`
                max-w-[80%] px-4 py-3 rounded-2xl text-sm leading-relaxed
                ${msg.role === 'user'
                  ? 'bg-accent/20 border border-accent/25 text-amber-100'
                  : 'bg-elevated border border-white/10 text-zinc-300'
                }
              `}
            >
              {msg.content}
            </div>
          </div>
        ))}
        {loading && (
          <div className="flex justify-start">
            <div className="bg-elevated border border-white/10 rounded-2xl px-4 py-3 flex gap-1.5">
              {[0, 1, 2].map((i) => (
                <span
                  key={i}
                  className="size-1.5 rounded-full bg-zinc-500 animate-bounce"
                  style={{ animationDelay: `${i * 100}ms` }}
                />
              ))}
            </div>
          </div>
        )}
        {error && (
          <div className="bg-red-500/10 border border-red-500/20 rounded-xl px-4 py-3 text-red-400 text-xs">
            {error}
          </div>
        )}
        <div ref={bottomRef} />
      </div>

      {/* Input */}
      <div className="px-4 py-4 border-t border-white/[0.06] flex-shrink-0">
        <div className="flex gap-2 items-end">
          <textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="What would you like to change? (Enter to send)"
            rows={2}
            disabled={loading}
            className="flex-1 bg-bg border border-white/10 rounded-xl px-4 py-3 text-zinc-200 placeholder:text-zinc-600 text-sm focus:outline-none focus:border-accent/50 transition-colors resize-none"
          />
          <Button
            onClick={handleSubmit}
            disabled={!input.trim()}
            loading={loading}
            className="mb-0.5"
          >
            →
          </Button>
        </div>
      </div>
    </div>
  );
}
