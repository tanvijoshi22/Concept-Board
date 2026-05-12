'use client';

import { SessionAnswers } from '@/lib/types';
import PillSelect from '../shared/PillSelect';
import Button from '../shared/Button';
import ProgressBar from './ProgressBar';

const PERCEPTION_OPTIONS = [
  { value: 'Trustworthy & reliable', label: 'Trustworthy & reliable' },
  { value: 'Innovative & cutting-edge', label: 'Innovative & cutting-edge' },
  { value: 'Friendly & approachable', label: 'Friendly & approachable' },
  { value: 'Premium & aspirational', label: 'Premium & aspirational' },
  { value: 'Bold & disruptive', label: 'Bold & disruptive' },
  { value: 'Simple & accessible', label: 'Simple & accessible' },
  { value: 'Professional & authoritative', label: 'Professional & authoritative' },
];

interface StepThreeProps {
  answers: SessionAnswers;
  onChange: (updates: Partial<SessionAnswers>) => void;
  onNext: () => void;
  onBack: () => void;
}

export default function StepThree({ answers, onChange, onNext, onBack }: StepThreeProps) {
  const canProceed =
    answers.businessPerception.length > 0 &&
    answers.businessWords.some((w) => w.trim());

  function setWord(index: 0 | 1 | 2, value: string) {
    const words = [...answers.businessWords] as [string, string, string];
    words[index] = value;
    onChange({ businessWords: words });
  }

  return (
    <div className="w-full max-w-2xl mx-auto py-12 px-6 space-y-10">
      <ProgressBar step={3} />

      <div className="space-y-2">
        <h2 className="text-2xl font-semibold text-zinc-100" style={{ fontFamily: 'var(--font-playfair)' }}>
          The Business Vision
        </h2>
        <p className="text-zinc-500 text-sm leading-relaxed">
          How a business wants to be perceived is the soul of its design language.
        </p>
      </div>

      <div className="space-y-8">
        <div className="space-y-2">
          <label className="text-sm text-zinc-400">
            How does the business want to be perceived by its users? <span className="text-red-400">*</span>
          </label>
          <p className="text-xs text-zinc-600">Select all that apply.</p>
          <PillSelect
            options={PERCEPTION_OPTIONS}
            value={answers.businessPerception}
            onChange={(v) => onChange({ businessPerception: v as string[] })}
            multi
          />
        </div>

        <div className="space-y-2">
          <label className="text-sm text-zinc-400">
            What are 3 words the business would use to describe itself? <span className="text-red-400">*</span>
          </label>
          <p className="text-xs text-zinc-600">Free-form brand adjectives — at least one required.</p>
          <div className="grid grid-cols-3 gap-3">
            {([0, 1, 2] as const).map((i) => (
              <input
                key={i}
                type="text"
                value={answers.businessWords[i]}
                onChange={(e) => setWord(i, e.target.value)}
                placeholder={['Bold', 'Human', 'Clear'][i]}
                className="bg-surface border border-white/10 rounded-xl px-4 py-3 text-zinc-200 placeholder:text-zinc-600 text-sm focus:outline-none focus:border-accent/50 transition-colors"
              />
            ))}
          </div>
        </div>

        <div className="space-y-2">
          <label className="text-sm text-zinc-400">
            Are there any brands (in any industry) the business admires visually?
          </label>
          <p className="text-xs text-zinc-600">Optional — e.g., "Apple for simplicity, Nike for boldness"</p>
          <textarea
            value={answers.admireBrands}
            onChange={(e) => onChange({ admireBrands: e.target.value })}
            placeholder="e.g., Stripe for precision, Airbnb for warmth, Linear for craftsmanship"
            rows={2}
            className="w-full bg-surface border border-white/10 rounded-xl px-4 py-3 text-zinc-200 placeholder:text-zinc-600 text-sm focus:outline-none focus:border-accent/50 transition-colors resize-none"
          />
        </div>

        <div className="space-y-2">
          <label className="text-sm text-zinc-400">
            Are there any visual styles the business explicitly wants to avoid?
          </label>
          <p className="text-xs text-zinc-600">Optional — e.g., "Nothing too corporate or cold"</p>
          <textarea
            value={answers.avoidStyles}
            onChange={(e) => onChange({ avoidStyles: e.target.value })}
            placeholder="e.g., Avoid anything that looks overly clinical or startup-generic"
            rows={2}
            className="w-full bg-surface border border-white/10 rounded-xl px-4 py-3 text-zinc-200 placeholder:text-zinc-600 text-sm focus:outline-none focus:border-accent/50 transition-colors resize-none"
          />
        </div>
      </div>

      <div className="flex justify-between pt-4">
        <Button variant="ghost" onClick={onBack}>← Back</Button>
        <Button onClick={onNext} disabled={!canProceed} size="lg">
          Next — Market & Competitors →
        </Button>
      </div>
    </div>
  );
}
