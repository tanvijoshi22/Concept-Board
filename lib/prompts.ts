import { SessionAnswers, ConceptDirection } from './types';

export const SYSTEM_PROMPT = `You are a world-class UI/UX design strategist and creative director — you think and reason like the top design leads at Stripe, Linear, Figma, Vercel, and Apple. You have deep expertise in visual identity, brand language, product aesthetics, motion design, and spatial composition.

Your role is to help senior designers define the design direction of a product by generating structured concept directions. When given inputs about a product's domain, users, business vision, and market context, you generate exactly 2 distinct concept directions:

- Direction 1: A considered, refined interpretation — well-executed and immediately credible, but not generic
- Direction 2: A bold, unexpected interpretation — deliberately breaks from category conventions in a way that feels intentional, not accidental

DESIGN QUALITY STANDARDS you must apply to every recommendation:

TYPOGRAPHY: Recommend characterful, distinctive font pairings that a senior designer would genuinely get excited about. NEVER suggest generic fonts (Inter, Roboto, Arial, system-ui, DM Sans, Plus Jakarta Sans, Space Grotesk — avoid these entirely). Think: what pairing would make someone stop and say "yes"? Consider Söhne, Instrument Serif, Editorial New, Satoshi, Cabinet Grotesk, Canela, Freight Display, Neue Montreal, Recoleta, Syne, Clash Display, etc. Pair an opinionated display font with a refined, legible body font. Both must be available on Google Fonts.

COLOR: Design palettes with clear intent and hierarchy. Use a dominant brand color with a sharp accent — avoid timid, evenly-distributed palettes. Every color must earn its place. Specific hex values must be intentional, not generic. Consider how the palette behaves in context: does it feel alive? Does it have tension?

MOTION & INTERACTION: In the designPersonality, include specific micro-interaction and animation guidance — what transitions occur, at what speed, with what easing. How does motion reinforce the concept's emotional quality? (e.g., "snap-to with spring physics on state changes", "staggered content reveals with 40ms delays", "parallax depth on scroll")

SPATIAL COMPOSITION: Address the layout philosophy — is it structured and grid-tight, or loose and editorial? Generous negative space or controlled density? Asymmetric grids? Overlapping layers? How does whitespace (or the lack of it) serve the concept?

VISUAL TEXTURE & DEPTH: Specify whether the UI uses flat surfaces, subtle grain textures, gradient meshes, layered transparencies, dramatic shadows, or restrained depth. Describe what gives the UI its material quality.

SPECIFICITY: Every recommendation must be specific and opinionated. Vague guidance like "modern and clean" is unacceptable. "A near-monochrome palette with a single saturated coral accent, Canela Deck for display and Söhne Buch for body — high contrast, editorial, zero decoration" is acceptable.

DIFFERENTIATION: Each direction must have an unmistakable visual point-of-view. A designer should be able to distinguish the two directions from a thumbnail. Generic design is the enemy.

Always respond in valid JSON only. No explanations outside the JSON. No markdown code blocks. Pure JSON.`;



export function buildGenerationPrompt(answers: SessionAnswers): string {
  return `Based on the following product inputs, generate exactly 2 concept directions for the product's design language.

PRODUCT INPUTS:
Product name: ${answers.productName || 'Not specified'}
Domain: ${answers.domain}
What it does: ${answers.productDescription}
Stage: ${answers.stage}
Primary user type: ${answers.userType}
User's primary goal: ${answers.userGoal}
Usage environment: ${answers.environment.join(', ')}
How users should feel: ${answers.userFeelings.join(', ')}
Business perception goals: ${answers.businessPerception.join(', ')}
Business self-description words: ${answers.businessWords.filter(Boolean).join(', ')}
Brands admired visually: ${answers.admireBrands || 'None specified'}
Styles to avoid: ${answers.avoidStyles || 'None specified'}
Competitors: ${answers.competitors.filter(Boolean).join(', ') || 'None specified'}
Market positioning: ${answers.positioning}
Visual benchmarks: ${answers.benchmarks || 'None specified'}

MOOD BOARD RULES (apply to every moodBoardImageSuggestions entry):
- Each suggestion must represent the concept name or one of the 3 keywords — NEVER the product domain
- Think like a senior designer building a reference board: draw from architecture, industrial design, nature, art direction, fashion, and photography
- searchQuery must be atmospheric and descriptive, NOT literal. Examples:
  Keyword "Leader" → "dramatic mountain peak summit aerial solitary" (NOT "leadership business people")
  Keyword "Control" → "cockpit aircraft instruments dark precision" (NOT "person using computer")
  Keyword "Decisive" → "chess board single piece spotlight high contrast" (NOT "confident decisive person")
  Keyword "Appetite" → "overhead flat lay vibrant spices market warm tones" (NOT "food photography restaurant")
- The 5 suggestions should cover: 1 for the concept name + 1 per keyword

KEYWORD ICON RULES:
- icon must be a valid Tabler Icons name (ti- prefix). Choose the most semantically fitting icon.
- framingPhrase is a 3-4 word phrase that narratively connects the concept name to the keyword (e.g. concept "Empowered" + keyword "Leader" → "Empower to be")

Generate 2 concept directions. Return ONLY this JSON structure, nothing else:
{
  "directions": [
    {
      "id": "direction_1",
      "conceptName": "Single evocative word or short phrase",
      "tagline": "One sentence that captures the feeling of this concept",
      "keywords": [
        {
          "word": "keyword one",
          "icon": "ti-crown",
          "framingPhrase": "3-4 word phrase connecting concept name to this keyword (e.g. 'Empower to be', 'Feast through', 'Dive into')",
          "explanation": "2-3 sentences on what this keyword means for the design and how it manifests visually"
        },
        {
          "word": "keyword two",
          "icon": "ti-target",
          "framingPhrase": "...",
          "explanation": "2-3 sentences..."
        },
        {
          "word": "keyword three",
          "icon": "ti-layers",
          "framingPhrase": "...",
          "explanation": "2-3 sentences..."
        }
      ],
      "colorPalette": {
        "rationale": "Why these colors fit the concept",
        "colors": [
          { "name": "Primary", "hex": "#XXXXXX", "role": "Main brand color — CTAs, highlights" },
          { "name": "Secondary", "hex": "#XXXXXX", "role": "Supporting accent color" },
          { "name": "Background", "hex": "#XXXXXX", "role": "Primary background" },
          { "name": "Surface", "hex": "#XXXXXX", "role": "Cards, panels, elevated surfaces" },
          { "name": "Text Primary", "hex": "#XXXXXX", "role": "Headlines and primary text" },
          { "name": "Text Secondary", "hex": "#XXXXXX", "role": "Body text and labels" }
        ],
        "theme": "light"
      },
      "typography": {
        "rationale": "Why these typefaces fit the concept",
        "displayFont": {
          "name": "Font name (must be available on Google Fonts)",
          "source": "Google Fonts",
          "usage": "Headlines, hero text, concept titles",
          "personality": "What this font communicates"
        },
        "bodyFont": {
          "name": "Font name (must be available on Google Fonts)",
          "source": "Google Fonts",
          "usage": "Body copy, labels, UI elements",
          "personality": "What this font communicates"
        }
      },
      "moodBoardImageSuggestions": [
        {
          "keyword": "the concept name or keyword this image represents",
          "emotion": "the specific feeling this image should evoke",
          "category": "Architecture / Nature / Industrial / Fashion / Art Direction / Photography",
          "description": "Very specific image description — not generic. E.g. NOT 'modern building' but 'brutalist concrete facade with dramatic shadow lines and geometric repetition'",
          "searchQuery": "atmospheric, descriptive Unsplash search terms — NOT literal. E.g. for keyword Leader: 'dramatic mountain peak summit aerial solitary' not 'leadership business people'"
        },
        { "keyword": "...", "emotion": "...", "category": "...", "description": "...", "searchQuery": "..." },
        { "keyword": "...", "emotion": "...", "category": "...", "description": "...", "searchQuery": "..." },
        { "keyword": "...", "emotion": "...", "category": "...", "description": "...", "searchQuery": "..." },
        { "keyword": "...", "emotion": "...", "category": "...", "description": "...", "searchQuery": "..." }
      ],
      "uiInspirationReferences": [
        { "productName": "Product name", "whatToTakeFrom": "Specific visual element to draw from", "url": "url if known" },
        { "productName": "Product name", "whatToTakeFrom": "Specific visual element to draw from", "url": "url if known" },
        { "productName": "Product name", "whatToTakeFrom": "Specific visual element to draw from", "url": "url if known" }
      ],
      "designPersonality": "A detailed, opinionated paragraph (150-200 words) describing: the overall visual aesthetic and material quality; specific guidance on shadows, border-radius, spacing rhythm, iconography style; motion/animation character (speed, easing, what animates and why); spatial composition approach (grid tightness, use of white space, any asymmetry or overlap); and the one thing that makes this direction UNFORGETTABLE. Write as if briefing a designer team — specific, not generic."
    },
    {
      "id": "direction_2",
      "conceptName": "...",
      "tagline": "...",
      "keywords": [...],
      "colorPalette": { ... },
      "typography": { ... },
      "moodBoardImageSuggestions": [...],
      "uiInspirationReferences": [...],
      "designPersonality": "..."
    }
  ]
}`;
}

export function buildRefinementPrompt(direction: ConceptDirection, userMessage: string): string {
  return `The user has selected the following concept direction and wants to refine it.

CURRENT DIRECTION:
${JSON.stringify(direction, null, 2)}

USER REFINEMENT REQUEST: "${userMessage}"

Update the concept direction based on the user's request. Keep what works, adjust what they've asked to change. Return the same JSON structure as before — only for this one direction (a single ConceptDirection object, not wrapped in a "directions" array). Return ONLY valid JSON, no explanation.`;
}
