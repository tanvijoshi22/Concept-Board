import { NextRequest, NextResponse } from 'next/server';
import { runConceptRefiner } from '@/lib/agents/concept';
import { runMoodBoard } from '@/lib/agents/moodboard';
import { runFoundations } from '@/lib/agents/foundations';
import { AnalystOutput, AgentConceptDirection } from '@/lib/types/agents';
import { ConceptDirection, MoodBoardSuggestion } from '@/lib/types';

export async function POST(req: NextRequest) {
  try {
    const { direction, brief, userMessage }: {
      direction: ConceptDirection;
      brief: AnalystOutput | null;
      userMessage: string;
    } = await req.json();

    // Reconstruct an AgentConceptDirection from the stored ConceptDirection
    const currentConcept: AgentConceptDirection = {
      id: direction.id,
      conceptName: direction.conceptName,
      positioningStatement: '',
      tagline: direction.tagline,
      keywords: direction.keywords.map((kw) => ({
        word: kw.word,
        framingPhrase: kw.framingPhrase ?? '',
        icon: kw.icon ?? 'ti-star',
        explanation: kw.explanation,
        visualManifestations: kw.visualManifestations ?? [],
      })),
      aestheticArchetype: 'Minimal',
      differentiatorFromDirection2: '',
    };

    // Fallback brief if not provided
    const effectiveBrief: AnalystOutput = brief ?? {
      productSummary: '',
      userProfile: { type: '', context: '', primaryNeed: '', emotionalState: '' },
      businessIntent: { perceptionGoals: [], personalityWords: [], visualAdmirations: '', visualAvoidances: '', positioningStatement: '' },
      marketContext: { competitors: [], competitorVisualPattern: '', differentiationOpportunity: '' },
      designBriefStatement: '',
      suggestedConceptTone: [],
    };

    // Agent 2: refine the concept
    const updatedConcept = await runConceptRefiner(effectiveBrief, currentConcept, userMessage);

    // Agent 3: new mood board
    const moodBoard = await runMoodBoard(updatedConcept).catch(() => null);

    // Agent 4: new foundations
    const foundations = await runFoundations({
      brief: effectiveBrief,
      concept: updatedConcept,
      moodBoard,
    }).catch(() => null);

    const moodBoardImageSuggestions: MoodBoardSuggestion[] = moodBoard
      ? moodBoard.moodBoardSuggestions.map((s) => ({
          keyword: s.keyword,
          emotion: s.emotion,
          category: s.category,
          description: s.description,
          searchQuery: s.searchQuery,
          imageUrl: s.imageUrl,
          imageThumb: s.imageThumb,
          imageAlt: s.imageAlt,
          imageCredit: s.imageCredit,
          imageCreditLink: s.imageCreditLink,
          colorNote: s.colorNote,
        }))
      : direction.moodBoardImageSuggestions;

    const updated: ConceptDirection = {
      id: direction.id,
      conceptName: updatedConcept.conceptName,
      tagline: updatedConcept.tagline,
      keywords: updatedConcept.keywords.map((kw) => ({
        word: kw.word,
        icon: kw.icon,
        framingPhrase: kw.framingPhrase,
        explanation: kw.explanation,
        visualManifestations: kw.visualManifestations,
      })),
      colorPalette: foundations
        ? { rationale: foundations.colorPalette.rationale, colors: foundations.colorPalette.colors, theme: foundations.colorPalette.theme }
        : direction.colorPalette,
      typography: foundations
        ? {
            rationale: foundations.typography.rationale,
            displayFont: { name: foundations.typography.displayFont.name, source: 'Google Fonts', usage: foundations.typography.displayFont.usage, personality: foundations.typography.displayFont.personality },
            bodyFont: { name: foundations.typography.bodyFont.name, source: 'Google Fonts', usage: foundations.typography.bodyFont.usage, personality: foundations.typography.bodyFont.personality },
          }
        : direction.typography,
      moodBoardImageSuggestions,
      uiInspirationReferences: foundations?.uiInspirationReferences ?? direction.uiInspirationReferences,
      designPersonality: foundations?.visualPersonality.overallDescription ?? direction.designPersonality,
    };

    return NextResponse.json(updated);
  } catch (error) {
    console.error('Refine error:', error);
    const msg = error instanceof Error ? error.message : '';
    const userError =
      msg.includes('401') || msg.includes('API key')
        ? 'Invalid Groq API key.'
        : msg.includes('rate') || msg.includes('429')
        ? 'Rate limit hit. Please wait a moment.'
        : 'Refinement failed. Please try again.';
    return NextResponse.json({ error: userError }, { status: 500 });
  }
}
