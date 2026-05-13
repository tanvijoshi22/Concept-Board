import { AgentConceptDirection, MoodBoardOutput, MoodBoardSuggestionRaw, MoodBoardSuggestionWithImage } from '@/lib/types/agents';
import { callLLM } from './shared';

export const MOODBOARD_SYSTEM_PROMPT = `You are a senior mood board designer and art director. You receive a design concept and keywords and your job is to generate highly specific, atmospheric image search queries that capture the visual and emotional world of each keyword. You think like a designer building a mood board — you draw from architecture, industrial design, nature, art direction, fashion, and photography. You never suggest literal product images, stock photography, or people at computers. Your queries are poetic and visual. A query for the keyword 'Leader' should return images that feel commanding and authoritative — like a mountain summit or a brutalist government building — not images of business leaders. You always output valid JSON only. No explanation. No markdown. Pure JSON.`;

export function buildMoodBoardPrompt(concept: AgentConceptDirection): string {
  return `Generate exactly 5 mood board image suggestions for this concept direction.

CONCEPT DIRECTION:
Name: ${concept.conceptName}
Tagline: ${concept.tagline}
Aesthetic archetype: ${concept.aestheticArchetype}

KEYWORDS:
${concept.keywords.map((kw, i) => `${i + 1}. "${kw.word}" — ${kw.explanation}`).join('\n')}

RULES:
- Suggestion 1: for the concept name itself
- Suggestions 2-4: one per keyword, in order
- Suggestion 5: for the overall concept archetype/mood
- searchQuery must be atmospheric — NOT literal.
  Good: "brutalist concrete facade dramatic shadow geometric repetition"
  Bad: "modern building office"
- Draw from: Architecture, Industrial Design, Nature, Fashion, Art Direction, Photography, Interior, Material/Texture, Abstract
- colorNote describes the color quality this image should have

Return ONLY this JSON:
{
  "directionId": "${concept.id}",
  "moodBoardSuggestions": [
    {
      "keyword": "which keyword or concept name this image represents",
      "emotion": "the specific feeling this image should evoke",
      "category": "Architecture / Industrial Design / Nature / Fashion / Art Direction / Photography / Interior / Material / Abstract",
      "description": "Very specific image description — not generic",
      "searchQuery": "atmospheric descriptive Unsplash search terms — NOT literal",
      "colorNote": "What color quality this image should have, e.g. 'Deep blues and blacks' or 'Warm amber and gold tones'"
    }
  ],
  "overallMoodNote": "One paragraph describing the collective visual world of all 5 images"
}`;
}

async function fetchUnsplashImage(
  query: string,
): Promise<{ url: string | null; thumb: string | null; alt: string; credit: string; creditLink: string }> {
  const accessKey = process.env.UNSPLASH_ACCESS_KEY;

  if (accessKey && accessKey !== 'your_unsplash_access_key_here') {
    try {
      const res = await fetch(
        `https://api.unsplash.com/search/photos?query=${encodeURIComponent(query)}&per_page=1&orientation=landscape`,
        { headers: { Authorization: `Client-ID ${accessKey}` } },
      );
      if (res.ok) {
        const data = await res.json();
        const photo = data.results?.[0];
        if (photo) {
          return {
            url: photo.urls.regular as string,
            thumb: photo.urls.small as string,
            alt: (photo.alt_description as string) || query,
            credit: photo.user.name as string,
            creditLink: `${photo.user.links.html as string}?utm_source=concept_board_generator&utm_medium=referral`,
          };
        }
      }
    } catch {
      // fall through to Source URL
    }
  }

  // Fallback: Loremflickr (no key required, uses Flickr photos with keyword search)
  const keywords = query.split(' ').slice(0, 4).join(',');
  return {
    url: `https://loremflickr.com/800/600/${encodeURIComponent(keywords)}`,
    thumb: `https://loremflickr.com/400/300/${encodeURIComponent(keywords)}`,
    alt: query,
    credit: 'Flickr',
    creditLink: 'https://flickr.com',
  };
}

export async function runMoodBoard(concept: AgentConceptDirection): Promise<MoodBoardOutput> {
  const raw = (await callLLM(
    MOODBOARD_SYSTEM_PROMPT,
    buildMoodBoardPrompt(concept),
    0.8,
    1500,
  )) as { directionId: string; moodBoardSuggestions: MoodBoardSuggestionRaw[]; overallMoodNote: string };

  // Fetch images for each suggestion
  const withImages: MoodBoardSuggestionWithImage[] = await Promise.all(
    raw.moodBoardSuggestions.map(async (s) => {
      const img = await fetchUnsplashImage(s.searchQuery);
      return {
        ...s,
        imageUrl: img.url,
        imageThumb: img.thumb,
        imageAlt: img.alt,
        imageCredit: img.credit,
        imageCreditLink: img.creditLink,
      };
    }),
  );

  return {
    directionId: raw.directionId,
    moodBoardSuggestions: withImages,
    overallMoodNote: raw.overallMoodNote,
  };
}
