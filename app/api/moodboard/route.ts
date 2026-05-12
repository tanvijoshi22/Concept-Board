import { NextRequest, NextResponse } from 'next/server';

interface SuggestionInput {
  keyword: string;
  emotion: string;
  category: string;
  searchQuery: string;
}

export async function POST(req: NextRequest) {
  const { suggestions }: { suggestions: SuggestionInput[] } = await req.json();

  const hasPexels =
    process.env.PEXELS_API_KEY &&
    process.env.PEXELS_API_KEY !== 'your_pexels_api_key_here';

  if (!hasPexels) {
    // Use Unsplash Source URL — no API key required, browser follows the redirect
    return NextResponse.json({
      images: suggestions.map((s) => ({
        keyword: s.keyword,
        emotion: s.emotion,
        category: s.category,
        url: `https://source.unsplash.com/800x600/?${encodeURIComponent(s.searchQuery)}`,
        thumb: `https://source.unsplash.com/400x300/?${encodeURIComponent(s.searchQuery)}`,
        alt: s.searchQuery,
        credit: 'Unsplash',
        creditLink: 'https://unsplash.com/?utm_source=concept_board_generator&utm_medium=referral',
      })),
    });
  }

  // Pexels path — used when PEXELS_API_KEY is configured
  const imagePromises = suggestions.map(async (s) => {
    try {
      const res = await fetch(
        `https://api.pexels.com/v1/search?query=${encodeURIComponent(s.searchQuery)}&per_page=3&orientation=landscape&size=medium`,
        { headers: { Authorization: process.env.PEXELS_API_KEY! } },
      );
      if (!res.ok) throw new Error(`Pexels ${res.status}`);
      const data = await res.json();
      const photo = data.photos?.[0];
      if (!photo) throw new Error('No results');
      return {
        keyword: s.keyword,
        emotion: s.emotion,
        category: s.category,
        url: photo.src.large as string,
        thumb: photo.src.medium as string,
        alt: (photo.alt as string) || s.searchQuery,
        credit: photo.photographer as string,
        creditLink: `${photo.photographer_url as string}?utm_source=concept_board_generator&utm_medium=referral`,
      };
    } catch {
      // Pexels failed for this query — fall back to Unsplash Source
      return {
        keyword: s.keyword,
        emotion: s.emotion,
        category: s.category,
        url: `https://source.unsplash.com/800x600/?${encodeURIComponent(s.searchQuery)}`,
        thumb: `https://source.unsplash.com/400x300/?${encodeURIComponent(s.searchQuery)}`,
        alt: s.searchQuery,
        credit: 'Unsplash',
        creditLink: 'https://unsplash.com/?utm_source=concept_board_generator&utm_medium=referral',
      };
    }
  });

  const images = await Promise.all(imagePromises);
  return NextResponse.json({ images });
}
