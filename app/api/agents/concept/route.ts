import { NextRequest, NextResponse } from 'next/server';
import { runConceptCreator } from '@/lib/agents/concept';

export async function POST(req: NextRequest) {
  try {
    const { brief } = await req.json();
    const result = await runConceptCreator(brief);
    return NextResponse.json(result);
  } catch (error) {
    const msg = error instanceof Error ? error.message : 'Agent 2 failed';
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
