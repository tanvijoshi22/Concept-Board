'use client';

import { SessionAnswers } from '@/lib/types';
import PillSelect from '../shared/PillSelect';
import Button from '../shared/Button';
import ProgressBar from './ProgressBar';

const DOMAIN_OPTIONS = [
  { value: 'Fintech', label: 'Fintech' },
  { value: 'Healthcare', label: 'Healthcare' },
  { value: 'EdTech', label: 'EdTech' },
  { value: 'E-commerce', label: 'E-commerce' },
  { value: 'Productivity', label: 'Productivity' },
  { value: 'Safety/Industrial', label: 'Safety / Industrial' },
  { value: 'Entertainment', label: 'Entertainment' },
  { value: 'Social', label: 'Social' },
  { value: 'Other', label: 'Other' },
];

const STAGE_OPTIONS = [
  { value: 'Brand new (0 to 1)', label: 'Brand new (0 to 1)' },
  { value: 'Redesign of existing product', label: 'Redesign of existing product' },
  { value: 'Expansion of an existing product', label: 'Expansion of an existing product' },
];

interface StepOneProps {
  answers: SessionAnswers;
  onChange: (updates: Partial<SessionAnswers>) => void;
  onNext: () => void;
}

export default function StepOne({ answers, onChange, onNext }: StepOneProps) {
  const canProceed = answers.domain && answers.productDescription.trim() && answers.stage;

  return (
    <div className="w-full max-w-2xl mx-auto py-12 px-6 space-y-10">
      <ProgressBar step={1} />

      <div className="space-y-2">
        <h2 className="text-2xl font-semibold text-zinc-100" style={{ fontFamily: 'var(--font-playfair)' }}>
          The Product & Domain
        </h2>
        <p className="text-zinc-500 text-sm leading-relaxed">
          Understanding what the product does helps us set the right tone for its personality.
        </p>
      </div>

      <div className="space-y-8">
        <div className="space-y-2">
          <label className="text-sm text-zinc-400">What is the name of the product?</label>
          <p className="text-xs text-zinc-600">Optional — leave blank if it doesn't have one yet.</p>
          <input
            type="text"
            value={answers.productName}
            onChange={(e) => onChange({ productName: e.target.value })}
            placeholder="e.g., Forma, Daybreak, Pulse"
            className="w-full bg-surface border border-white/10 rounded-xl px-4 py-3 text-zinc-200 placeholder:text-zinc-600 text-sm focus:outline-none focus:border-accent/50 transition-colors"
          />
        </div>

        <div className="space-y-2">
          <label className="text-sm text-zinc-400">
            What domain or industry does it belong to? <span className="text-red-400">*</span>
          </label>
          <PillSelect
            options={DOMAIN_OPTIONS}
            value={answers.domain}
            onChange={(v) => onChange({ domain: v as string })}
          />
        </div>

        <div className="space-y-2">
          <label className="text-sm text-zinc-400">
            In one or two sentences, what does the product do? <span className="text-red-400">*</span>
          </label>
          <textarea
            value={answers.productDescription}
            onChange={(e) => onChange({ productDescription: e.target.value })}
            placeholder="e.g., A real-time safety monitoring platform for industrial field workers that alerts supervisors to hazards before they escalate."
            rows={3}
            className="w-full bg-surface border border-white/10 rounded-xl px-4 py-3 text-zinc-200 placeholder:text-zinc-600 text-sm focus:outline-none focus:border-accent/50 transition-colors resize-none"
          />
        </div>

        <div className="space-y-2">
          <label className="text-sm text-zinc-400">
            What stage is this product at? <span className="text-red-400">*</span>
          </label>
          <PillSelect
            options={STAGE_OPTIONS}
            value={answers.stage}
            onChange={(v) => onChange({ stage: v as string })}
          />
        </div>
      </div>

      <div className="flex justify-end pt-4">
        <Button onClick={onNext} disabled={!canProceed} size="lg">
          Next — Users →
        </Button>
      </div>
    </div>
  );
}
