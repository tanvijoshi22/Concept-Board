'use client';

import { Typography } from '@/lib/types';

interface TypographySectionProps {
  typography: Typography;
}

function googleFontsUrl(fontName: string): string {
  const family = fontName.replace(/ /g, '+');
  return `https://fonts.googleapis.com/css2?family=${family}:wght@400;600;700&display=swap`;
}

interface FontCardProps {
  font: Typography['displayFont'];
  sampleText: string;
  sampleSize: string;
  label: string;
}

function FontCard({ font, sampleText, sampleSize, label }: FontCardProps) {
  const isGoogleFont = font.source.toLowerCase().includes('google');

  return (
    <div className="bg-bg rounded-xl p-4 space-y-3 border border-white/5">
      {isGoogleFont && (
        <link
          rel="stylesheet"
          href={googleFontsUrl(font.name)}
          precedence="default"
        />
      )}
      <div className="flex items-center justify-between">
        <span className="text-xs uppercase tracking-widest text-zinc-600">{label}</span>
        <span className="text-xs text-zinc-600">{font.source}</span>
      </div>
      <p
        className="text-zinc-100 leading-tight"
        style={{ fontFamily: `'${font.name}', serif`, fontSize: sampleSize }}
      >
        {sampleText}
      </p>
      <div className="space-y-1">
        <p className="text-zinc-200 text-sm font-medium">{font.name}</p>
        <p className="text-zinc-500 text-xs">{font.personality}</p>
        <p className="text-zinc-600 text-xs">{font.usage}</p>
      </div>
    </div>
  );
}

export default function TypographySection({ typography }: TypographySectionProps) {
  return (
    <div className="space-y-4">
      <h4 className="text-xs uppercase tracking-widest text-zinc-500">Typography</h4>

      <div className="grid grid-cols-2 gap-3">
        <FontCard
          font={typography.displayFont}
          label="Display"
          sampleText="The quick brown fox"
          sampleSize="1.25rem"
        />
        <FontCard
          font={typography.bodyFont}
          label="Body"
          sampleText="Designed for the people who need it most."
          sampleSize="0.875rem"
        />
      </div>

      <p className="text-xs text-zinc-600 leading-relaxed border-t border-white/5 pt-3">
        {typography.rationale}
      </p>
    </div>
  );
}
