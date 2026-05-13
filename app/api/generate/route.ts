import { NextRequest, NextResponse } from 'next/server';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { buildGenerationPrompt } from '@/lib/prompts';
import { SessionAnswers } from '@/lib/types';

const SYSTEM_PROMPT =
  'You are an expert UI/UX design strategist. Always respond with valid JSON only. No explanation. No markdown. No code fences. Pure JSON.';

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);

async function callGemini(userPrompt: string, temperature: number) {
  const model = genAI.getGenerativeModel({
    model: 'gemini-2.0-flash',
    systemInstruction: SYSTEM_PROMPT,
    generationConfig: {
      responseMimeType: 'application/json',
      temperature,
      maxOutputTokens: 4000,
    },
  });

  const result = await model.generateContent(userPrompt);
  return result.response.text();
}

export async function POST(req: NextRequest) {
  try {
    const answers: SessionAnswers = await req.json();
    const userPrompt = buildGenerationPrompt(answers);

    const content = await callGemini(userPrompt, 0.8);
    return NextResponse.json(JSON.parse(content));
  } catch (error) {
    console.error('Generate error:', error);
    const msg = error instanceof Error ? error.message : String(error);
    const userError =
      msg.includes('API_KEY') || msg.includes('401') || msg.includes('API key')
        ? 'Invalid Gemini API key. Check GEMINI_API_KEY in .env.local and restart the server.'
        : msg.includes('quota') || msg.includes('RESOURCE_EXHAUSTED') || msg.includes('429')
        ? 'Gemini quota exceeded. Wait a moment or check your API limits at aistudio.google.com.'
        : 'Generation failed. Please try again.';
    return NextResponse.json({ error: userError }, { status: 500 });
  }
}
