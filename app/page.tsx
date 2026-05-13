'use client';

import { useState, useCallback } from 'react';
import { AppState, SessionAnswers, ConceptDirection, RefinementMessage } from '@/lib/types';
import { DEFAULT_STATE } from '@/lib/session';
import StepOne from '@/components/QuestionFlow/StepOne';
import StepTwo from '@/components/QuestionFlow/StepTwo';
import StepThree from '@/components/QuestionFlow/StepThree';
import StepFour from '@/components/QuestionFlow/StepFour';
import LoadingScreen from '@/components/shared/LoadingScreen';
import ConceptCard from '@/components/Results/ConceptCard';
import RefinementPanel from '@/components/Refinement/RefinementPanel';

export default function HomePage() {
  const [state, setState] = useState<AppState>(DEFAULT_STATE);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [generationError, setGenerationError] = useState<string | null>(null);
  const [generationLoading, setGenerationLoading] = useState(false);
  const [loadingStep, setLoadingStep] = useState(1);
  const [completedSteps, setCompletedSteps] = useState<number[]>([]);

  const handleAnswerChange = useCallback((updates: Partial<SessionAnswers>) => {
    setState((prev) => ({ ...prev, answers: { ...prev.answers, ...updates } }));
  }, []);

  const handleNext = useCallback(() => {
    setState((prev) => ({ ...prev, step: (prev.step as number) + 1 as 2 | 3 | 4 }));
  }, []);

  const handleBack = useCallback(() => {
    setState((prev) => ({ ...prev, step: (prev.step as number) - 1 as 1 | 2 | 3 }));
  }, []);

  const handleGenerate = useCallback(async () => {
    setGenerationLoading(true);
    setGenerationError(null);
    setLoadingStep(1);
    setCompletedSteps([]);
    setState((prev) => ({ ...prev, step: 'loading' }));

    try {
      const res = await fetch('/api/orchestrate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(state.answers),
      });

      if (!res.body) throw new Error('No response stream');

      const reader = res.body.getReader();
      const decoder = new TextDecoder();
      let buffer = '';

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });
        const parts = buffer.split('\n\n');
        buffer = parts.pop() ?? '';

        for (const part of parts) {
          if (!part.startsWith('data: ')) continue;
          const event = JSON.parse(part.slice(6));

          if (event.error) {
            setGenerationError(event.error);
            setState((prev) => ({ ...prev, step: 4 }));
            setGenerationLoading(false);
            return;
          }
          if (event.step && event.status === 'running') {
            setLoadingStep(event.step);
          }
          if (event.step && event.status === 'done') {
            setCompletedSteps((prev) => [...prev, event.step]);
            if (event.result) {
              setState((prev) => ({
                ...prev,
                step: 'results',
                directions: event.result.directions,
                brief: event.result.brief,
                error: null,
              }));
            }
          }
        }
      }
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Something went wrong. Please try again.';
      setGenerationError(message);
      setState((prev) => ({ ...prev, step: 4 }));
    } finally {
      setGenerationLoading(false);
    }
  }, [state.answers]);

  const handleStartOver = useCallback(() => {
    setState(DEFAULT_STATE);
    setShowConfirmModal(false);
    setGenerationError(null);
  }, []);

  const handleOpenRefinement = useCallback((id: 'direction_1' | 'direction_2') => {
    setState((prev) => ({ ...prev, selectedDirectionId: id, showRefinement: true, refinementHistory: [] }));
  }, []);

  const handleCloseRefinement = useCallback(() => {
    setState((prev) => ({ ...prev, showRefinement: false }));
  }, []);

  const handleDirectionUpdate = useCallback((updated: ConceptDirection) => {
    setState((prev) => {
      if (!prev.directions) return prev;
      const [d1, d2] = prev.directions;
      return {
        ...prev,
        directions: updated.id === 'direction_1' ? [updated, d2] : [d1, updated],
      };
    });
  }, []);

  const handleHistoryUpdate = useCallback((history: RefinementMessage[]) => {
    setState((prev) => ({ ...prev, refinementHistory: history }));
  }, []);

  const selectedDirection =
    state.directions && state.selectedDirectionId
      ? state.directions.find((d) => d.id === state.selectedDirectionId) ?? null
      : null;

  return (
    <div className="min-h-screen bg-bg flex flex-col">
      {/* Nav */}
      {state.step !== 'welcome' && (
        <nav className="sticky top-0 z-40 border-b border-white/[0.05] bg-bg/80 backdrop-blur-sm px-6 py-4 flex items-center justify-between">
          <span
            className="text-zinc-400 text-sm font-medium"
            style={{ fontFamily: 'var(--font-playfair)', fontStyle: 'italic' }}
          >
            Concept Board Generator
          </span>
          <button
            onClick={() => setShowConfirmModal(true)}
            className="text-xs text-zinc-600 hover:text-zinc-400 transition-colors px-3 py-1.5 rounded-lg hover:bg-white/5 border border-transparent hover:border-white/10"
          >
            Start Over
          </button>
        </nav>
      )}

      {/* Main content */}
      <main className="flex-1 flex flex-col">
        {state.step === 'welcome' && <WelcomeScreen onStart={() => setState((prev) => ({ ...prev, step: 1 }))} />}
        {state.step === 1 && (
          <StepOne answers={state.answers} onChange={handleAnswerChange} onNext={handleNext} />
        )}
        {state.step === 2 && (
          <StepTwo answers={state.answers} onChange={handleAnswerChange} onNext={handleNext} onBack={handleBack} />
        )}
        {state.step === 3 && (
          <StepThree answers={state.answers} onChange={handleAnswerChange} onNext={handleNext} onBack={handleBack} />
        )}
        {state.step === 4 && (
          <StepFour
            answers={state.answers}
            onChange={handleAnswerChange}
            onGenerate={handleGenerate}
            onBack={handleBack}
            loading={generationLoading}
            error={generationError}
          />
        )}
        {state.step === 'loading' && <LoadingScreen currentStep={loadingStep} completedSteps={completedSteps} />}
        {state.step === 'results' && state.directions && (
          <ResultsScreen
            directions={state.directions}
            onRefine={handleOpenRefinement}
          />
        )}
      </main>

      {/* Refinement panel */}
      {state.showRefinement && selectedDirection && (
        <>
          <div
            className="fixed inset-0 bg-black/40 z-40 backdrop-blur-sm"
            onClick={handleCloseRefinement}
          />
          <RefinementPanel
            direction={selectedDirection}
            brief={state.brief}
            history={state.refinementHistory}
            onUpdate={handleDirectionUpdate}
            onHistoryUpdate={handleHistoryUpdate}
            onClose={handleCloseRefinement}
          />
        </>
      )}

      {/* Start Over confirmation */}
      {showConfirmModal && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4 backdrop-blur-sm">
          <div className="bg-surface border border-white/10 rounded-2xl p-6 max-w-sm w-full shadow-2xl space-y-4">
            <h3 className="text-zinc-100 font-semibold" style={{ fontFamily: 'var(--font-playfair)' }}>
              Start over?
            </h3>
            <p className="text-zinc-400 text-sm leading-relaxed">
              This will clear your current session and all generated directions. This can&apos;t be undone.
            </p>
            <div className="flex gap-3 pt-2">
              <button
                onClick={() => setShowConfirmModal(false)}
                className="flex-1 px-4 py-2.5 rounded-xl border border-white/10 text-zinc-400 hover:text-zinc-200 hover:border-white/20 text-sm transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleStartOver}
                className="flex-1 px-4 py-2.5 rounded-xl bg-red-600/20 border border-red-600/30 text-red-400 hover:bg-red-600/30 text-sm transition-colors"
              >
                Yes, start over
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function WelcomeScreen({ onStart }: { onStart: () => void }) {
  return (
    <div className="flex-1 flex items-center justify-center px-6 py-20 relative overflow-hidden">
      {/* Subtle ambient glow */}
      <div
        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full pointer-events-none"
        style={{ background: 'radial-gradient(circle, rgba(217,119,6,0.06) 0%, transparent 70%)' }}
      />
      <div className="max-w-lg w-full text-center space-y-8 relative">
        <div className="space-y-5">
          <p className="text-xs uppercase tracking-widest text-zinc-600 animate-fade-up">
            Concept Board Generator
          </p>
          <h1
            className="text-5xl text-zinc-50 leading-tight animate-fade-up delay-100"
            style={{ fontFamily: 'var(--font-playfair)', fontStyle: 'italic' }}
          >
            Let&apos;s define your product&apos;s personality.
          </h1>
          <p className="text-zinc-500 text-base leading-relaxed animate-fade-up delay-200">
            Answer a few structured questions about your product, users, and market — and get 2 distinct concept directions with color palettes, typography, mood board cues, and design language.
          </p>
        </div>

        <div className="flex items-center justify-center gap-6 text-sm text-zinc-600 animate-fade-up delay-300">
          <span>4 steps</span>
          <span className="size-1 rounded-full bg-zinc-700" />
          <span>~5 minutes</span>
          <span className="size-1 rounded-full bg-zinc-700" />
          <span>2 concept directions</span>
        </div>

        <div className="animate-fade-up delay-400">
          <button
            onClick={onStart}
            className="inline-flex items-center gap-2 bg-accent hover:bg-accent-light text-white px-8 py-4 rounded-xl text-base font-medium transition-all duration-200 active:scale-[0.97] shadow-[0_0_40px_rgba(217,119,6,0.25)] hover:shadow-[0_0_50px_rgba(217,119,6,0.35)]"
          >
            Start defining your concept →
          </button>
        </div>

        <p className="text-xs text-zinc-700 animate-fade-up delay-500">
          No account required. Session is local and not saved.
        </p>
      </div>
    </div>
  );
}

function ResultsScreen({
  directions,
  onRefine,
}: {
  directions: [ConceptDirection, ConceptDirection];
  onRefine: (id: 'direction_1' | 'direction_2') => void;
}) {
  return (
    <div className="flex-1 py-10 px-6">
      <div className="max-w-6xl mx-auto space-y-8">
        <div className="text-center space-y-2">
          <p className="text-xs uppercase tracking-widest text-zinc-600">Your concept directions</p>
          <h2
            className="text-3xl text-zinc-100"
            style={{ fontFamily: 'var(--font-playfair)', fontStyle: 'italic' }}
          >
            Two directions. Pick one. Refine it.
          </h2>
          <p className="text-zinc-500 text-sm">
            Click any keyword to expand its explanation. Use &ldquo;Refine this direction&rdquo; to iterate conversationally.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-start">
          {directions.map((d, i) => (
            <div
              key={d.id}
              className="animate-fade-up"
              style={{ animationDelay: `${i * 120}ms` }}
            >
              <ConceptCard
                direction={d}
                label={`Direction ${i + 1} — ${i === 0 ? 'Considered' : 'Bold'}`}
                onRefine={() => onRefine(d.id)}
              />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
