import { NextRequest, NextResponse } from 'next/server';
import { runMoodBoard } from '@/lib/agents/moodboard';

export async function POST(req: NextRequest) {
  try {
    const { concept } = await req.json();
    const result = await runMoodBoard(concept);
    return NextResponse.json(result);
  } catch (error) {
    const msg = error instanceof Error ? error.message : 'Agent 3 failed';
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
