import { NextRequest, NextResponse } from 'next/server';
import { buildGenerationPrompt } from '@/lib/prompts';
import { SessionAnswers } from '@/lib/types';

const SYSTEM_PROMPT =
  'You are an expert UI/UX design strategist. Always respond with valid JSON only. No explanation. No markdown. No code fences. Pure JSON.';

async function callGemini(userPrompt: string, temperature: number) {
  const res = await fetch(
    'https://generativelanguage.googleapis.com/v1beta/openai/chat/completions',
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${process.env.GEMINI_API_KEY}`,
      },
      body: JSON.stringify({
        model: 'gemini-2.0-flash',
        temperature,
        max_tokens: 4000,
        response_format: { type: 'json_object' },
        messages: [
          { role: 'system', content: SYSTEM_PROMPT },
          { role: 'user', content: userPrompt },
        ],
      }),
    },
  );

  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err?.error?.message ?? `Gemini API error ${res.status}`);
  }

  const data = await res.json();
  return data.choices[0].message.content as string;
}

export async function POST(req: NextRequest) {
  try {
    const answers: SessionAnswers = await req.json();
    const userPrompt = buildGenerationPrompt(answers);

    const content = await callGemini(userPrompt, 0.8);
    return NextResponse.json(JSON.parse(content));
  } catch (error) {
    console.error('Generate error:', error);
    const msg = error instanceof Error ? error.message : '';
    const userError =
      msg.includes('401') || msg.includes('Invalid') || msg.includes('API key')
        ? 'Invalid Gemini API key. Check GEMINI_API_KEY in .env.local and restart the server.'
        : msg.includes('quota') || msg.includes('rate') || msg.includes('429')
        ? 'Gemini rate limit hit. Please wait a moment and try again.'
        : 'Generation failed. Please try again.';
    return NextResponse.json({ error: userError }, { status: 500 });
  }
}
