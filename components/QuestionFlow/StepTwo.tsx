'use client';

import { SessionAnswers } from '@/lib/types';
import PillSelect from '../shared/PillSelect';
import Button from '../shared/Button';
import ProgressBar from './ProgressBar';

const USER_TYPE_OPTIONS = [
  { value: 'General consumers', label: 'General consumers' },
  { value: 'Enterprise professionals', label: 'Enterprise professionals' },
  { value: 'Children (under 12)', label: 'Children (under 12)' },
  { value: 'Teenagers', label: 'Teenagers' },
  { value: 'Elderly users', label: 'Elderly users' },
  { value: 'Field workers / blue-collar', label: 'Field workers / blue-collar' },
  { value: 'Admins / managers', label: 'Admins / managers' },
  { value: 'Other', label: 'Other' },
];

const ENVIRONMENT_OPTIONS = [
  { value: 'Office/desk', label: 'Office / desk' },
  { value: 'On the go / outdoors', label: 'On the go / outdoors' },
  { value: 'Low-light / nighttime', label: 'Low-light / nighttime' },
  { value: 'High-stress situations', label: 'High-stress situations' },
  { value: 'Casual / leisure', label: 'Casual / leisure' },
  { value: 'Multiple environments', label: 'Multiple environments' },
];

const FEELINGS_OPTIONS = [
  { value: 'Confident & in control', label: 'Confident & in control' },
  { value: 'Calm & reassured', label: 'Calm & reassured' },
  { value: 'Excited & delighted', label: 'Excited & delighted' },
  { value: 'Safe & secure', label: 'Safe & secure' },
  { value: 'Playful & engaged', label: 'Playful & engaged' },
  { value: 'Focused & efficient', label: 'Focused & efficient' },
  { value: 'Empowered to act', label: 'Empowered to act' },
];

interface StepTwoProps {
  answers: SessionAnswers;
  onChange: (updates: Partial<SessionAnswers>) => void;
  onNext: () => void;
  onBack: () => void;
}

export default function StepTwo({ answers, onChange, onNext, onBack }: StepTwoProps) {
  const canProceed =
    answers.userType &&
    answers.userGoal.trim() &&
    answers.environment.length > 0 &&
    answers.userFeelings.length > 0;

  return (
    <div className="w-full max-w-2xl mx-auto py-12 px-6 space-y-10">
      <ProgressBar step={2} />

      <div className="space-y-2">
        <h2 className="text-2xl font-semibold text-zinc-100" style={{ fontFamily: 'var(--font-playfair)' }}>
          The Users
        </h2>
        <p className="text-zinc-500 text-sm leading-relaxed">
          The visual personality of a product must speak directly to the people using it. Their context shapes everything.
        </p>
      </div>

      <div className="space-y-8">
        <div className="space-y-2">
          <label className="text-sm text-zinc-400">
            Who is the primary user of this product? <span className="text-red-400">*</span>
          </label>
          <PillSelect
            options={USER_TYPE_OPTIONS}
            value={answers.userType}
            onChange={(v) => onChange({ userType: v as string })}
          />
        </div>

        <div className="space-y-2">
          <label className="text-sm text-zinc-400">
            What is the primary goal of the user when using this product? <span className="text-red-400">*</span>
          </label>
          <textarea
            value={answers.userGoal}
            onChange={(e) => onChange({ userGoal: e.target.value })}
            placeholder="e.g., Monitor worker safety in real-time and respond to hazards before they escalate."
            rows={3}
            className="w-full bg-surface border border-white/10 rounded-xl px-4 py-3 text-zinc-200 placeholder:text-zinc-600 text-sm focus:outline-none focus:border-accent/50 transition-colors resize-none"
          />
        </div>

        <div className="space-y-2">
          <label className="text-sm text-zinc-400">
            What environment do users typically use the product in? <span className="text-red-400">*</span>
          </label>
          <p className="text-xs text-zinc-600">Select all that apply.</p>
          <PillSelect
            options={ENVIRONMENT_OPTIONS}
            value={answers.environment}
            onChange={(v) => onChange({ environment: v as string[] })}
            multi
          />
        </div>

        <div className="space-y-2">
          <label className="text-sm text-zinc-400">
            How should the user feel when using this product? <span className="text-red-400">*</span>
          </label>
          <p className="text-xs text-zinc-600">Select all that apply.</p>
          <PillSelect
            options={FEELINGS_OPTIONS}
            value={answers.userFeelings}
            onChange={(v) => onChange({ userFeelings: v as string[] })}
            multi
          />
        </div>
      </div>

      <div className="flex justify-between pt-4">
        <Button variant="ghost" onClick={onBack}>← Back</Button>
        <Button onClick={onNext} disabled={!canProceed} size="lg">
          Next — Business Vision →
        </Button>
      </div>
    </div>
  );
}
