'use client';

import { useState } from 'react';
import { ColorPalette as ColorPaletteType } from '@/lib/types';

interface ColorPaletteProps {
  palette: ColorPaletteType;
}

export default function ColorPalette({ palette }: ColorPaletteProps) {
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h4 className="text-xs uppercase tracking-widest text-zinc-500">Color Palette</h4>
        <span className={`
          text-xs px-2.5 py-1 rounded-full border
          ${palette.theme === 'dark'
            ? 'bg-zinc-900 border-zinc-700 text-zinc-400'
            : 'bg-zinc-100/10 border-zinc-300/20 text-zinc-400'
          }
        `}>
          {palette.theme === 'dark' ? 'Dark Theme' : 'Light Theme'}
        </span>
      </div>

      <div className="flex gap-2">
        {palette.colors.map((color, i) => (
          <div
            key={i}
            className="relative flex-1 group"
            onMouseEnter={() => setHoveredIndex(i)}
            onMouseLeave={() => setHoveredIndex(null)}
          >
            <div
              className="h-12 rounded-lg shadow-sm border border-white/5 cursor-default transition-transform duration-150 group-hover:scale-105"
              style={{ backgroundColor: color.hex }}
            />
            {hoveredIndex === i && (
              <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 z-10 pointer-events-none">
                <div className="bg-elevated border border-white/10 rounded-lg px-3 py-2 text-center shadow-xl min-w-[120px]">
                  <p className="text-zinc-100 text-xs font-mono">{color.hex}</p>
                  <p className="text-zinc-400 text-xs mt-0.5">{color.name}</p>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>

      <div className="grid grid-cols-2 gap-x-4 gap-y-1.5">
        {palette.colors.map((color, i) => (
          <div key={i} className="flex items-center gap-2">
            <div
              className="size-3 rounded-full flex-shrink-0 border border-white/10"
              style={{ backgroundColor: color.hex }}
            />
            <span className="text-xs text-zinc-500 truncate">{color.name} — {color.role}</span>
          </div>
        ))}
      </div>

      <p className="text-xs text-zinc-600 leading-relaxed border-t border-white/5 pt-3">
        {palette.rationale}
      </p>
    </div>
  );
}
