import { NextRequest } from 'next/server';
import { runAnalyst } from '@/lib/agents/analyst';
import { runConceptCreator } from '@/lib/agents/concept';
import { runMoodBoard } from '@/lib/agents/moodboard';
import { runFoundations } from '@/lib/agents/foundations';
import { AgentConceptDirection, AnalystOutput, MoodBoardOutput, FoundationsOutput } from '@/lib/types/agents';
import { ConceptDirection, MoodBoardSuggestion } from '@/lib/types';

function mergeDirection(
  id: 'direction_1' | 'direction_2',
  concept: AgentConceptDirection,
  moodBoard: MoodBoardOutput | null,
  foundations: FoundationsOutput | null,
): ConceptDirection {
  const fallbackColor = '#D97706';

  const colorPalette = foundations
    ? {
        rationale: foundations.colorPalette.rationale,
        colors: foundations.colorPalette.colors,
        theme: foundations.colorPalette.theme,
      }
    : { rationale: '', colors: [], theme: 'dark' as const };

  const typography = foundations
    ? {
        rationale: foundations.typography.rationale,
        displayFont: {
          name: foundations.typography.displayFont.name,
          source: 'Google Fonts',
          usage: foundations.typography.displayFont.usage,
          personality: foundations.typography.displayFont.personality,
        },
        bodyFont: {
          name: foundations.typography.bodyFont.name,
          source: 'Google Fonts',
          usage: foundations.typography.bodyFont.usage,
          personality: foundations.typography.bodyFont.personality,
        },
      }
    : { rationale: '', displayFont: { name: 'Playfair Display', source: 'Google Fonts', usage: '', personality: '' }, bodyFont: { name: 'Inter', source: 'Google Fonts', usage: '', personality: '' } };

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
    : [];

  void fallbackColor;

  return {
    id,
    conceptName: concept.conceptName,
    tagline: concept.tagline,
    keywords: concept.keywords.map((kw) => ({
      word: kw.word,
      icon: kw.icon,
      framingPhrase: kw.framingPhrase,
      explanation: kw.explanation,
      visualManifestations: kw.visualManifestations,
    })),
    colorPalette,
    typography,
    moodBoardImageSuggestions,
    uiInspirationReferences: foundations?.uiInspirationReferences ?? [],
    designPersonality: foundations?.visualPersonality.overallDescription ?? '',
  };
}

export async function POST(req: NextRequest) {
  const formAnswers = await req.json();
  const encoder = new TextEncoder();

  const stream = new ReadableStream({
    async start(controller) {
      const send = (data: object) =>
        controller.enqueue(encoder.encode(`data: ${JSON.stringify(data)}\n\n`));

      try {
        // Step 1 — Analyst
        send({ step: 1, status: 'running' });
        let brief: AnalystOutput;
        try {
          brief = await runAnalyst(formAnswers);
        } catch (e) {
          send({ error: `Analyst failed: ${e instanceof Error ? e.message : 'unknown error'}` });
          controller.close();
          return;
        }
        send({ step: 1, status: 'done' });

        // Step 2 — Concept Creator
        send({ step: 2, status: 'running' });
        let concepts;
        try {
          concepts = await runConceptCreator(brief);
        } catch (e) {
          send({ error: `Concept creator failed: ${e instanceof Error ? e.message : 'unknown error'}` });
          controller.close();
          return;
        }
        send({ step: 2, status: 'done' });

        // Step 3 — Mood Board (sequential to avoid Groq rate limits)
        send({ step: 3, status: 'running' });
        const mb1 = await runMoodBoard(concepts.directions[0]).catch(() => null);
        const mb2 = await runMoodBoard(concepts.directions[1]).catch(() => null);
        send({ step: 3, status: 'done' });

        // Step 4 — Foundations (sequential to avoid Groq rate limits)
        send({ step: 4, status: 'running' });
        const f1 = await runFoundations({ brief, concept: concepts.directions[0], moodBoard: mb1 }).catch(() => null);
        const f2 = await runFoundations({ brief, concept: concepts.directions[1], moodBoard: mb2 }).catch(() => null);
        send({ step: 4, status: 'done' });

        // Step 5 — Bundle
        send({ step: 5, status: 'running' });
        const direction1 = mergeDirection('direction_1', concepts.directions[0], mb1, f1);
        const direction2 = mergeDirection('direction_2', concepts.directions[1], mb2, f2);
        send({
          step: 5,
          status: 'done',
          result: { directions: [direction1, direction2], brief },
        });
      } catch (error) {
        send({ error: error instanceof Error ? error.message : 'Pipeline failed' });
      } finally {
        controller.close();
      }
    },
  });

  return new Response(stream, {
    headers: {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache',
    },
  });
}
