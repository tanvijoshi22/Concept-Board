'use client';

import { UIInspiration } from '@/lib/types';

interface UIInspirationsProps {
  references: UIInspiration[];
}

export default function UIInspirations({ references }: UIInspirationsProps) {
  return (
    <div className="space-y-4">
      <h4 className="text-xs uppercase tracking-widest text-zinc-500">UI Inspiration References</h4>

      <div className="space-y-3">
        {references.map((ref, i) => (
          <div key={i} className="bg-bg rounded-xl p-4 border border-white/5 space-y-2">
            <div className="flex items-start justify-between gap-3">
              <div className="space-y-1">
                <p className="text-sm font-medium text-zinc-200">{ref.productName}</p>
                <p className="text-sm text-zinc-400 leading-relaxed">{ref.whatToTakeFrom}</p>
              </div>
              {ref.url && ref.url !== 'url if known' && ref.url.startsWith('http') && (
                <a
                  href={ref.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex-shrink-0 text-xs px-3 py-1.5 rounded-lg bg-surface border border-white/10 text-zinc-400 hover:text-zinc-200 hover:border-white/20 transition-colors whitespace-nowrap"
                >
                  View →
                </a>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
