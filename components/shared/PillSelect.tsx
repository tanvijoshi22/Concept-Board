'use client';

interface Option {
  value: string;
  label: string;
}

interface PillSelectProps {
  options: Option[];
  value: string | string[];
  onChange: (value: string | string[]) => void;
  multi?: boolean;
}

export default function PillSelect({ options, value, onChange, multi = false }: PillSelectProps) {
  const selected = Array.isArray(value) ? value : value ? [value] : [];

  function toggle(optionValue: string) {
    if (multi) {
      const arr = selected.includes(optionValue)
        ? selected.filter((v) => v !== optionValue)
        : [...selected, optionValue];
      onChange(arr);
    } else {
      onChange(selected[0] === optionValue ? '' : optionValue);
    }
  }

  return (
    <div className="flex flex-wrap gap-2">
      {options.map((opt) => {
        const active = selected.includes(opt.value);
        return (
          <button
            key={opt.value}
            type="button"
            onClick={() => toggle(opt.value)}
            className={`
              px-4 py-2 rounded-full text-sm transition-all duration-150 cursor-pointer
              border
              ${active
                ? 'bg-accent/15 border-accent text-amber-400'
                : 'bg-surface border-white/10 text-zinc-400 hover:border-white/20 hover:text-zinc-200'
              }
            `}
          >
            {opt.label}
          </button>
        );
      })}
    </div>
  );
}
