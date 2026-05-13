import { NextRequest, NextResponse } from 'next/server';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { buildRefinementPrompt } from '@/lib/prompts';
import { ConceptDirection } from '@/lib/types';

const SYSTEM_PROMPT =
  'You are an expert UI/UX design strategist. Always respond with valid JSON only. No explanation. No markdown. No code fences. Pure JSON.';

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);

export async function POST(req: NextRequest) {
  try {
    const { direction, userMessage }: { direction: ConceptDirection; userMessage: string } =
      await req.json();
    const userPrompt = buildRefinementPrompt(direction, userMessage);

    const model = genAI.getGenerativeModel({
      model: 'gemini-2.5-flash',
      systemInstruction: SYSTEM_PROMPT,
      generationConfig: {
        responseMimeType: 'application/json',
        temperature: 0.5,
        maxOutputTokens: 2000,
      },
    });

    const result = await model.generateContent(userPrompt);
    const content = result.response.text();
    return NextResponse.json(JSON.parse(content));
  } catch (error) {
    console.error('Refine error:', error);
    const msg = error instanceof Error ? error.message : String(error);
    const userError =
      msg.includes('API_KEY') || msg.includes('401') || msg.includes('API key')
        ? 'Invalid Gemini API key.'
        : msg.includes('quota') || msg.includes('RESOURCE_EXHAUSTED') || msg.includes('429')
        ? 'Gemini quota exceeded. Wait a moment or check your API limits at aistudio.google.com.'
        : 'Refinement failed. Please try again.';
    return NextResponse.json({ error: userError }, { status: 500 });
  }
}
