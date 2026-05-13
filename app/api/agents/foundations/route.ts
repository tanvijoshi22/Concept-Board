import { NextRequest, NextResponse } from 'next/server';
import { runFoundations } from '@/lib/agents/foundations';

export async function POST(req: NextRequest) {
  try {
    const { brief, concept, moodBoard } = await req.json();
    const result = await runFoundations({ brief, concept, moodBoard: moodBoard ?? null });
    return NextResponse.json(result);
  } catch (error) {
    const msg = error instanceof Error ? error.message : 'Agent 4 failed';
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
