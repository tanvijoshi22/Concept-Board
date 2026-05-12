'use client';

interface ProgressBarProps {
  step: 1 | 2 | 3 | 4;
}

const STEP_LABELS = ['Product & Domain', 'Users', 'Business Vision', 'Market & Competitors'];

export default function ProgressBar({ step }: ProgressBarProps) {
  return (
    <div className="w-full max-w-2xl mx-auto">
      <div className="flex items-center justify-between mb-4">
        <p className="text-xs text-zinc-500 tracking-widest uppercase">
          Step {step} of 4
        </p>
        <p className="text-xs text-zinc-500">{STEP_LABELS[step - 1]}</p>
      </div>
      <div className="h-px bg-white/10 rounded-full overflow-hidden">
        <div
          className="h-full bg-accent transition-all duration-500 ease-out"
          style={{ width: `${(step / 4) * 100}%` }}
        />
      </div>
    </div>
  );
}
