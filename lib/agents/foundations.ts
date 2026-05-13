import { AnalystOutput, AgentConceptDirection, MoodBoardOutput, FoundationsOutput, FoundationsInput } from '@/lib/types/agents';
import { callLLM } from './shared';

export const FOUNDATIONS_SYSTEM_PROMPT = `You are a senior UI designer specialising in design foundations and design systems. You receive a complete creative brief, a concept direction with keywords, and a mood board. Your job is to derive concrete, buildable design foundations from all of this — a color palette with specific hex codes, a typography pairing from Google Fonts, spacing and radius decisions, shadow style, and iconography direction. Every decision you make must be traceable back to the concept and keywords. You never make arbitrary decisions. You always explain the connection between a visual decision and the concept it expresses. For typography, recommend characterful, distinctive font pairings — NEVER generic fonts (Inter, Roboto, Arial, DM Sans, Plus Jakarta Sans, Space Grotesk). Think: Söhne, Instrument Serif, Canela, Syne, Clash Display, Cabinet Grotesk, Neue Montreal, Recoleta — fonts a senior designer gets excited about. Both must be available on Google Fonts. You always output valid JSON only. No explanation. No markdown. Pure JSON.`;

export function buildFoundationsPrompt(input: FoundationsInput): string {
  const { brief, concept, moodBoard } = input;
  return `Derive complete design foundations for this concept direction.

CREATIVE BRIEF:
${brief.designBriefStatement}
User emotional state: ${brief.userProfile.emotionalState}
Suggested tone: ${brief.suggestedConceptTone.join(', ')}
Differentiation opportunity: ${brief.marketContext.differentiationOpportunity}

CONCEPT DIRECTION:
Name: ${concept.conceptName}
Tagline: ${concept.tagline}
Archetype: ${concept.aestheticArchetype}
Positioning: ${concept.positioningStatement}

Keywords:
${concept.keywords.map(kw => `- "${kw.word}": ${kw.explanation}
  Visual manifestations: ${kw.visualManifestations.join(' | ')}`).join('\n')}

${moodBoard ? `MOOD BOARD:
Overall mood: ${moodBoard.overallMoodNote}
Images: ${moodBoard.moodBoardSuggestions.map(s => `${s.keyword} (${s.colorNote})`).join(', ')}` : 'Mood board: not available — derive foundations from concept only.'}

Return ONLY this JSON structure:
{
  "directionId": "${concept.id}",
  "colorPalette": {
    "rationale": "Why these colors fit the concept",
    "theme": "light or dark",
    "themeRationale": "Why light or dark is right for this user context",
    "colors": [
      { "name": "Primary", "hex": "#XXXXXX", "role": "CTAs, highlights, brand moments", "keywordConnection": "which keyword and how" },
      { "name": "Secondary", "hex": "#XXXXXX", "role": "Supporting accent", "keywordConnection": "..." },
      { "name": "Background", "hex": "#XXXXXX", "role": "Primary background", "keywordConnection": "..." },
      { "name": "Surface", "hex": "#XXXXXX", "role": "Cards, panels, elevated surfaces", "keywordConnection": "..." },
      { "name": "Text Primary", "hex": "#XXXXXX", "role": "Headlines and primary text", "keywordConnection": "..." },
      { "name": "Text Secondary", "hex": "#XXXXXX", "role": "Body text and labels", "keywordConnection": "..." }
    ],
    "semanticColors": {
      "success": "#XXXXXX",
      "warning": "#XXXXXX",
      "error": "#XXXXXX",
      "info": "#XXXXXX"
    }
  },
  "typography": {
    "rationale": "Why these typefaces fit the concept",
    "displayFont": {
      "name": "Font name (must be on Google Fonts — be opinionated, not generic)",
      "weight": "700 Bold",
      "usage": "Where this appears in the UI",
      "personality": "What this font communicates",
      "keywordConnection": "Which keyword and how",
      "sampleText": "4-6 word sample using the concept name"
    },
    "bodyFont": {
      "name": "Font name (must be on Google Fonts)",
      "weight": "400 Regular",
      "usage": "Where this appears",
      "personality": "What this communicates",
      "keywordConnection": "Which keyword and how"
    },
    "scaleBase": 16,
    "scaleRatio": "1.333 Perfect Fourth",
    "lineHeightBody": "1.6",
    "letterSpacingDisplay": "-0.02em"
  },
  "spacingPersonality": {
    "density": "compact or balanced or spacious",
    "baseUnit": 8,
    "rationale": "Why this density fits the concept and user context"
  },
  "visualPersonality": {
    "borderRadius": "e.g. '4px — sharp and authoritative'",
    "shadowStyle": "e.g. 'Subtle directional, no color shadows, 0 2px 8px rgba(0,0,0,0.12)'",
    "iconographyStyle": "e.g. 'Outline, 1.5px stroke, 20px grid'",
    "microinteractionFeel": "e.g. 'Linear 150ms on hover, spring physics on open/close'",
    "overallDescription": "Full paragraph (150-200 words) describing the complete aesthetic — material quality, shadows, spacing rhythm, grid tightness, motion character, what makes this direction UNFORGETTABLE"
  },
  "uiInspirationReferences": [
    { "productName": "...", "whatToTakeFrom": "specific visual element", "url": "specific Dribbble shot or product URL" },
    { "productName": "...", "whatToTakeFrom": "specific visual element", "url": "..." }
  ]
}`;
}

export async function runFoundations(input: FoundationsInput): Promise<FoundationsOutput> {
  return callLLM(
    FOUNDATIONS_SYSTEM_PROMPT,
    buildFoundationsPrompt(input),
    0.5,
    4000,
  ) as Promise<FoundationsOutput>;
}
