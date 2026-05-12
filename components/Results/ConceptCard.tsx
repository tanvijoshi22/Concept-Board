'use client';

import { useState } from 'react';
import { ConceptDirection } from '@/lib/types';
import { getTablerIcon } from '@/lib/icons';
import ColorPalette from './ColorPalette';
import TypographySection from './TypographySection';
import MoodBoardSuggestions from './MoodBoardSuggestions';
import UIInspirations from './UIInspirations';
import Button from '../shared/Button';

interface ConceptCardProps {
  direction: ConceptDirection;
  label: string;
  onRefine: () => void;
}

export default function ConceptCard({ direction, label, onRefine }: ConceptCardProps) {
  const [expandedKeyword, setExpandedKeyword] = useState<number | null>(null);

  const primaryColor = direction.colorPalette.colors[0]?.hex ?? '#D97706';
  const secondaryColor = direction.colorPalette.colors[1]?.hex ?? '#92400E';

  return (
    <div className="flex flex-col bg-surface rounded-2xl border border-white/[0.06] overflow-hidden shadow-[0_8px_40px_rgba(0,0,0,0.5)] transition-shadow duration-300 hover:shadow-[0_12px_56px_rgba(0,0,0,0.65)] hover:border-white/[0.09]">

      {/* Header */}
      <div className="px-7 pt-7 pb-6 border-b border-white/[0.06]">
        <p className="text-xs uppercase tracking-widest text-zinc-600 mb-3">{label}</p>
        <h3
          className="text-4xl font-semibold text-zinc-50 mb-2"
          style={{ fontFamily: 'var(--font-playfair)' }}
        >
          {direction.conceptName}
        </h3>
        <p className="text-zinc-400 text-base italic leading-relaxed">{direction.tagline}</p>
      </div>

      {/* Keyword Icon Cards */}
      <div className="px-7 py-6 border-b border-white/[0.06] space-y-3">
        <h4 className="text-xs uppercase tracking-widest text-zinc-500">Defining Keywords</h4>

        <div className="grid grid-cols-3 divide-x divide-white/[0.06] bg-elevated rounded-xl overflow-hidden border border-white/[0.06]">
          {direction.keywords.map((kw, i) => {
            const IconComponent = getTablerIcon(kw.icon ?? 'ti-star');
            const isExpanded = expandedKeyword === i;

            return (
              <button
                key={i}
                type="button"
                onClick={() => setExpandedKeyword(isExpanded ? null : i)}
                className={`
                  p-4 text-left transition-colors duration-150 cursor-pointer
                  ${isExpanded ? 'bg-white/[0.04]' : 'hover:bg-white/[0.03]'}
                `}
              >
                <IconComponent
                  size={22}
                  style={{ color: primaryColor }}
                />
                {kw.framingPhrase && (
                  <p
                    className="text-[10px] uppercase tracking-[0.06em] text-zinc-600 mt-2.5 leading-tight"
                  >
                    {kw.framingPhrase}
                  </p>
                )}
                <p className="text-[17px] font-medium text-zinc-100 mt-1 leading-snug">
                  {kw.word}
                </p>
                {isExpanded && (
                  <p className="text-xs text-zinc-500 leading-relaxed mt-2">
                    {kw.explanation}
                  </p>
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* Scrollable body */}
      <div className="flex-1 overflow-y-auto divide-y divide-white/[0.04]">
        <div className="px-7 py-6">
          <ColorPalette palette={direction.colorPalette} />
        </div>

        <div className="px-7 py-6">
          <TypographySection typography={direction.typography} />
        </div>

        <div className="px-7 py-6">
          <MoodBoardSuggestions
            suggestions={direction.moodBoardImageSuggestions}
            primaryColor={primaryColor}
            secondaryColor={secondaryColor}
          />
        </div>

        <div className="px-7 py-6">
          <UIInspirations references={direction.uiInspirationReferences} />
        </div>

        <div className="px-7 py-6 space-y-3">
          <h4 className="text-xs uppercase tracking-widest text-zinc-500">Design Personality</h4>
          <p className="text-sm text-zinc-400 leading-relaxed">{direction.designPersonality}</p>
        </div>
      </div>

      {/* Actions */}
      <div className="px-7 py-5 border-t border-white/[0.06] flex items-center gap-3 bg-bg/50">
        <Button onClick={onRefine} size="md" className="flex-1">
          Refine this direction
        </Button>
        <Button
          variant="secondary"
          size="md"
          disabled
          title="Coming in v2"
          className="flex-1 opacity-40"
        >
          Export PDF
          <span className="text-[10px] ml-1.5 px-1.5 py-0.5 rounded bg-white/10 text-zinc-500">v2</span>
        </Button>
      </div>
    </div>
  );
}
