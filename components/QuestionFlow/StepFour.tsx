'use client';

import { SessionAnswers } from '@/lib/types';
import PillSelect from '../shared/PillSelect';
import Button from '../shared/Button';
import ProgressBar from './ProgressBar';

const POSITIONING_OPTIONS = [
  { value: 'Similar (fit in with the market)', label: 'Similar — fit in' },
  { value: 'Differentiated (stand out)', label: 'Differentiated — stand out' },
  { value: 'Premium (above the market)', label: 'Premium — above the market' },
  { value: 'Challenger (disrupt the norm)', label: 'Challenger — disrupt' },
];

interface StepFourProps {
  answers: SessionAnswers;
  onChange: (updates: Partial<SessionAnswers>) => void;
  onGenerate: () => void;
  onBack: () => void;
  loading?: boolean;
  error?: string | null;
}

export default function StepFour({ answers, onChange, onGenerate, onBack, loading, error }: StepFourProps) {
  const canGenerate = answers.positioning;

  function setCompetitor(index: 0 | 1 | 2, value: string) {
    const comps = [...answers.competitors] as [string, string, string];
    comps[index] = value;
    onChange({ competitors: comps });
  }

  return (
    <div className="w-full max-w-2xl mx-auto py-12 px-6 space-y-10">
      <ProgressBar step={4} />

      <div className="space-y-2">
        <h2 className="text-2xl font-semibold text-zinc-100" style={{ fontFamily: 'var(--font-playfair)' }}>
          Market & Competitors
        </h2>
        <p className="text-zinc-500 text-sm leading-relaxed">
          Knowing the visual benchmark helps us design within context — or deliberately break from it.
        </p>
      </div>

      <div className="space-y-8">
        <div className="space-y-2">
          <label className="text-sm text-zinc-400">Who are the 1–3 main competitors?</label>
          <p className="text-xs text-zinc-600">Optional but helpful.</p>
          <div className="grid grid-cols-3 gap-3">
            {([0, 1, 2] as const).map((i) => (
              <input
                key={i}
                type="text"
                value={answers.competitors[i]}
                onChange={(e) => setCompetitor(i, e.target.value)}
                placeholder={['Competitor 1', 'Competitor 2', 'Competitor 3'][i]}
                className="bg-surface border border-white/10 rounded-xl px-4 py-3 text-zinc-200 placeholder:text-zinc-600 text-sm focus:outline-none focus:border-accent/50 transition-colors"
              />
            ))}
          </div>
        </div>

        <div className="space-y-2">
          <label className="text-sm text-zinc-400">
            How does this product want to position itself against competitors?{' '}
            <span className="text-red-400">*</span>
          </label>
          <PillSelect
            options={POSITIONING_OPTIONS}
            value={answers.positioning}
            onChange={(v) => onChange({ positioning: v as string })}
          />
        </div>

        <div className="space-y-2">
          <label className="text-sm text-zinc-400">
            Any specific visual benchmarks in the market this product should meet or exceed?
          </label>
          <textarea
            value={answers.benchmarks}
            onChange={(e) => onChange({ benchmarks: e.target.value })}
            placeholder="e.g., Should feel as polished as Linear or Notion. Must match the production quality of Stripe's dashboard."
            rows={3}
            className="w-full bg-surface border border-white/10 rounded-xl px-4 py-3 text-zinc-200 placeholder:text-zinc-600 text-sm focus:outline-none focus:border-accent/50 transition-colors resize-none"
          />
        </div>
      </div>

      {error && (
        <div className="bg-red-500/10 border border-red-500/20 rounded-xl px-4 py-3 text-red-400 text-sm">
          {error}
        </div>
      )}

      <div className="flex justify-between pt-4">
        <Button variant="ghost" onClick={onBack} disabled={loading}>← Back</Button>
        <Button
          onClick={onGenerate}
          disabled={!canGenerate}
          loading={loading}
          size="lg"
          className="min-w-[220px]"
        >
          Generate Concept Directions →
        </Button>
      </div>
    </div>
  );
}
