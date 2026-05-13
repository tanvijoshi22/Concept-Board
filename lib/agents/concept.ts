import { AnalystOutput, AgentConceptDirection, ConceptOutput } from '@/lib/types/agents';
import { callLLM } from './shared';

export const CONCEPT_SYSTEM_PROMPT = `You are a creative director specialising in product design language and brand identity. You receive a structured design brief and your only job is to generate exactly 2 concept directions — one conventional and refined, one bold and unexpected. For each direction you coin an evocative concept name and 3 defining keywords that act as the north star for all visual decisions. You think in metaphors, emotional archetypes, and visual language. You never think about hex codes or font names at this stage — only conceptual and emotional direction. You always output valid JSON only. No explanation. No markdown. Pure JSON.`;

export function buildConceptPrompt(brief: AnalystOutput): string {
  return `Based on this structured design brief, generate exactly 2 concept directions.

DESIGN BRIEF:
Product summary: ${brief.productSummary}

User profile:
- Type: ${brief.userProfile.type}
- Context: ${brief.userProfile.context}
- Primary need: ${brief.userProfile.primaryNeed}
- Emotional state: ${brief.userProfile.emotionalState}

Business intent:
- Perception goals: ${brief.businessIntent.perceptionGoals.join(', ')}
- Personality words: ${brief.businessIntent.personalityWords.join(', ')}
- Positioning: ${brief.businessIntent.positioningStatement}
- Visual admiration: ${brief.businessIntent.visualAdmirations}
- Avoid: ${brief.businessIntent.visualAvoidances}

Market context:
- Competitor visual pattern: ${brief.marketContext.competitorVisualPattern}
- Differentiation opportunity: ${brief.marketContext.differentiationOpportunity}

Core design challenge: ${brief.designBriefStatement}
Suggested tone: ${brief.suggestedConceptTone.join(', ')}

KEYWORD ICON RULES: icon must be a valid Tabler icon name (ti- prefix). Choose the most semantically fitting icon. Valid icons include: ti-crown, ti-target, ti-layers, ti-rocket, ti-brain, ti-shield, ti-compass, ti-flame, ti-heart, ti-globe, ti-star, ti-bolt, ti-leaf, ti-mountain, ti-diamond, ti-award, ti-eye, ti-sun, ti-moon, ti-anchor, ti-key, ti-lock, ti-feather, ti-wand, ti-prism, ti-infinity, ti-atom, ti-seeding, ti-tree, ti-wind, ti-droplet, ti-sparkles, ti-focus, ti-crosshair, ti-trophy, ti-medal, ti-users, ti-map, ti-search, ti-microscope, ti-palette, ti-brush, ti-pencil, ti-camera, ti-code, ti-database, ti-chart-bar, ti-trending-up, ti-activity, ti-wave, ti-cube, ti-stack, ti-filter, ti-flag, ti-swords, ti-zap, ti-bulb, ti-cloud, ti-circle-check.

Return ONLY this JSON structure:
{
  "directions": [
    {
      "id": "direction_1",
      "conceptName": "Single evocative word or short phrase — Direction 1 should be the considered/refined interpretation",
      "positioningStatement": "This product should feel like X so the user feels Y",
      "tagline": "One sentence emotional essence of this concept",
      "keywords": [
        {
          "word": "keyword one",
          "framingPhrase": "3-4 words connecting concept name to this keyword (e.g. 'Empower to be', 'Built around', 'Design for')",
          "icon": "ti-crown",
          "explanation": "2-3 sentences on how this keyword manifests visually in the UI",
          "visualManifestations": ["Specific visual decision 1", "Specific visual decision 2", "Specific visual decision 3"]
        },
        { "word": "keyword two", "framingPhrase": "...", "icon": "ti-target", "explanation": "...", "visualManifestations": ["...", "...", "..."] },
        { "word": "keyword three", "framingPhrase": "...", "icon": "ti-layers", "explanation": "...", "visualManifestations": ["...", "...", "..."] }
      ],
      "aestheticArchetype": "One of: Minimal, Editorial, Bold, Technical, Warm, Premium, Playful",
      "differentiatorFromDirection2": "One sentence explaining how this direction differs from Direction 2"
    },
    {
      "id": "direction_2",
      "conceptName": "Direction 2 should be the bold/unexpected interpretation",
      "positioningStatement": "...",
      "tagline": "...",
      "keywords": [
        { "word": "...", "framingPhrase": "...", "icon": "ti-...", "explanation": "...", "visualManifestations": ["...", "...", "..."] },
        { "word": "...", "framingPhrase": "...", "icon": "ti-...", "explanation": "...", "visualManifestations": ["...", "...", "..."] },
        { "word": "...", "framingPhrase": "...", "icon": "ti-...", "explanation": "...", "visualManifestations": ["...", "...", "..."] }
      ],
      "aestheticArchetype": "...",
      "differentiatorFromDirection2": "..."
    }
  ]
}`;
}

export function buildRefinementConceptPrompt(
  brief: AnalystOutput,
  currentDirection: AgentConceptDirection,
  userMessage: string,
): string {
  return `You are refining an existing concept direction based on user feedback.

ORIGINAL BRIEF CONTEXT:
${brief.designBriefStatement}
Tone: ${brief.suggestedConceptTone.join(', ')}

CURRENT CONCEPT DIRECTION:
${JSON.stringify(currentDirection, null, 2)}

USER REFINEMENT REQUEST: "${userMessage}"

Update this concept direction based on the user's request. Keep what works, adjust what they've asked to change.
Return a single direction object (same structure as one direction in the directions array). Return ONLY valid JSON.`;
}

export async function runConceptCreator(brief: AnalystOutput): Promise<ConceptOutput> {
  return callLLM(CONCEPT_SYSTEM_PROMPT, buildConceptPrompt(brief), 0.9, 2000) as Promise<ConceptOutput>;
}

export async function runConceptRefiner(
  brief: AnalystOutput,
  currentDirection: AgentConceptDirection,
  userMessage: string,
): Promise<AgentConceptDirection> {
  return callLLM(
    CONCEPT_SYSTEM_PROMPT,
    buildRefinementConceptPrompt(brief, currentDirection, userMessage),
    0.7,
    2000,
  ) as Promise<AgentConceptDirection>;
}
