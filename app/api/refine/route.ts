import { NextRequest, NextResponse } from 'next/server';
import { buildRefinementPrompt } from '@/lib/prompts';
import { ConceptDirection } from '@/lib/types';

const SYSTEM_PROMPT =
  'You are an expert UI/UX design strategist. Always respond with valid JSON only. No explanation. No markdown. No code fences. Pure JSON.';

export async function POST(req: NextRequest) {
  try {
    const { direction, userMessage }: { direction: ConceptDirection; userMessage: string } =
      await req.json();
    const userPrompt = buildRefinementPrompt(direction, userMessage);

    const res = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${process.env.GROQ_API_KEY}`,
      },
      body: JSON.stringify({
        model: 'llama-3.3-70b-versatile',
        temperature: 0.5,
        max_tokens: 2000,
        response_format: { type: 'json_object' },
        messages: [
          { role: 'system', content: SYSTEM_PROMPT },
          { role: 'user', content: userPrompt },
        ],
      }),
    });

    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err?.error?.message ?? `Groq API error ${res.status}`);
    }

    const data = await res.json();
    const content = data.choices[0].message.content as string;
    return NextResponse.json(JSON.parse(content));
  } catch (error) {
    console.error('Refine error:', error);
    const msg = error instanceof Error ? error.message : '';
    const userError =
      msg.includes('401') || msg.includes('Invalid') || msg.includes('API key')
        ? 'Invalid Groq API key.'
        : msg.includes('quota') || msg.includes('rate') || msg.includes('429')
        ? 'Groq rate limit hit. Please wait a moment and try again.'
        : 'Refinement failed. Please try again.';
    return NextResponse.json({ error: userError }, { status: 500 });
  }
}
