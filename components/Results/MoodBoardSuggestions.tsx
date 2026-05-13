'use client';

import { useState, useEffect } from 'react';
import { MoodBoardSuggestion, MoodBoardImage } from '@/lib/types';

interface MoodBoardSuggestionsProps {
  suggestions: MoodBoardSuggestion[];
  primaryColor: string;
  secondaryColor: string;
}

function hexToRgba(hex: string, alpha: number) {
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);
  return `rgba(${r},${g},${b},${alpha})`;
}

function GradientFallback({ keyword, primaryColor, secondaryColor }: { keyword: string; primaryColor: string; secondaryColor: string }) {
  return (
    <div
      className="w-full h-full flex items-center justify-center"
      style={{
        background: `linear-gradient(135deg, ${primaryColor} 0%, ${hexToRgba(secondaryColor, 0.4)} 100%)`,
      }}
    >
      <span className="text-white/80 text-xs font-medium uppercase tracking-wider px-2 text-center">
        {keyword}
      </span>
    </div>
  );
}

function ImageTile({
  image,
  primaryColor,
  secondaryColor,
  className = '',
}: {
  image: MoodBoardImage;
  primaryColor: string;
  secondaryColor: string;
  className?: string;
}) {
  const [loaded, setLoaded] = useState(false);
  const [error, setError] = useState(false);

  return (
    <div className={`relative overflow-hidden group ${className}`}>
      {image.url && !error ? (
        <>
          {!loaded && <div className="absolute inset-0 animate-shimmer" />}
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={image.url}
            alt={image.alt ?? image.keyword}
            className="w-full h-full object-cover transition-opacity duration-300"
            style={{ opacity: loaded ? 1 : 0 }}
            onLoad={() => setLoaded(true)}
            onError={() => setError(true)}
          />
          {/* Hover overlay */}
          <div className="absolute inset-0 bg-black/0 group-hover:bg-black/40 transition-all duration-200 flex flex-col items-center justify-center">
            <span className="text-white text-xs font-medium uppercase tracking-wider opacity-0 group-hover:opacity-100 transition-opacity duration-200">
              {image.keyword}
            </span>
          </div>
          {/* Photographer credit */}
          {image.credit && (
            <a
              href={image.creditLink}
              target="_blank"
              rel="noopener noreferrer"
              className="absolute bottom-1 right-1.5 text-white/60 text-[9px] hover:text-white/90 transition-colors leading-none"
              style={{ fontSize: '9px' }}
              onClick={(e) => e.stopPropagation()}
            >
              {image.credit}
            </a>
          )}
        </>
      ) : (
        <GradientFallback
          keyword={image.keyword}
          primaryColor={primaryColor}
          secondaryColor={secondaryColor}
        />
      )}
    </div>
  );
}

function ShimmerGrid() {
  return (
    <div className="space-y-3">
      <div className="flex gap-2">
        {[0, 1, 2, 3, 4].map((i) => (
          <div key={i} className="h-6 w-20 rounded-full animate-shimmer" />
        ))}
      </div>
      <div className="grid gap-[3px]" style={{ gridTemplateColumns: '3fr 2fr', height: '280px' }}>
        <div className="animate-shimmer rounded-tl-lg rounded-bl-lg" />
        <div className="grid grid-cols-2 gap-[3px]">
          <div className="animate-shimmer rounded-tr-lg" />
          <div className="animate-shimmer" />
          <div className="animate-shimmer" />
          <div className="animate-shimmer rounded-br-lg" />
        </div>
      </div>
    </div>
  );
}

export default function MoodBoardSuggestions({
  suggestions,
  primaryColor,
  secondaryColor,
}: MoodBoardSuggestionsProps) {
  const [images, setImages] = useState<MoodBoardImage[] | null>(null);

  useEffect(() => {
    // If Agent 3 pre-fetched images, use them directly
    if (suggestions.length > 0 && suggestions[0].imageUrl !== undefined) {
      setImages(
        suggestions.map((s) => ({
          keyword: s.keyword,
          emotion: s.emotion,
          category: s.category,
          url: s.imageUrl ?? null,
          thumb: s.imageThumb ?? undefined,
          alt: s.imageAlt ?? s.searchQuery,
          credit: s.imageCredit ?? 'Unsplash',
          creditLink: s.imageCreditLink ?? 'https://unsplash.com',
        })),
      );
      return;
    }

    // Fallback: fetch client-side via legacy /api/moodboard route
    async function fetchImages() {
      try {
        const res = await fetch('/api/moodboard', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ suggestions }),
        });
        const data = await res.json();
        setImages(data.images ?? []);
      } catch {
        setImages([]);
      }
    }
    fetchImages();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className="space-y-4">
      <h4 className="text-xs uppercase tracking-widest text-zinc-500">Mood Board</h4>

      {images === null ? (
        <ShimmerGrid />
      ) : (
        <div className="space-y-3">
          {/* Keyword badges */}
          <div className="flex gap-2 flex-wrap">
            {suggestions.map((s, i) => (
              <span
                key={i}
                className="text-xs px-2.5 py-1 rounded-full font-medium"
                style={{
                  background: hexToRgba(primaryColor, 0.12),
                  color: primaryColor,
                  border: `1px solid ${hexToRgba(primaryColor, 0.25)}`,
                }}
              >
                {s.keyword}
              </span>
            ))}
          </div>

          {/* Mosaic grid */}
          <div
            className="grid gap-[3px] overflow-hidden rounded-lg"
            style={{ gridTemplateColumns: '3fr 2fr', height: '280px' }}
          >
            {/* Large left image */}
            {images[0] && (
              <ImageTile
                image={images[0]}
                primaryColor={primaryColor}
                secondaryColor={secondaryColor}
                className="rounded-tl-lg rounded-bl-lg"
              />
            )}

            {/* Right 2×2 grid */}
            <div className="grid grid-cols-2 gap-[3px]">
              {[1, 2, 3, 4].map((idx) =>
                images[idx] ? (
                  <ImageTile
                    key={idx}
                    image={images[idx]}
                    primaryColor={primaryColor}
                    secondaryColor={secondaryColor}
                    className={
                      idx === 1 ? 'rounded-tr-lg' : idx === 4 ? 'rounded-br-lg' : ''
                    }
                  />
                ) : (
                  <div
                    key={idx}
                    className={`${idx === 1 ? 'rounded-tr-lg' : idx === 4 ? 'rounded-br-lg' : ''}`}
                    style={{
                      background: hexToRgba(primaryColor, 0.08),
                    }}
                  />
                ),
              )}
            </div>
          </div>

          {/* Search links */}
          <div className="flex flex-wrap gap-2 pt-1">
            {suggestions.slice(0, 3).map((s, i) => (
              <a
                key={i}
                href={`https://www.pexels.com/search/${encodeURIComponent(s.searchQuery)}/`}
                target="_blank"
                rel="noopener noreferrer"
                className="text-xs px-3 py-1.5 rounded-lg bg-surface border border-white/10 text-zinc-500 hover:text-zinc-300 hover:border-white/20 transition-colors"
              >
                Search &ldquo;{s.keyword}&rdquo; on Pexels →
              </a>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
