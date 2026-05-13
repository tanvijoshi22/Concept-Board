import { NextRequest, NextResponse } from 'next/server';
import { runAnalyst } from '@/lib/agents/analyst';

export async function POST(req: NextRequest) {
  try {
    const { formAnswers } = await req.json();
    const result = await runAnalyst(formAnswers);
    return NextResponse.json(result);
  } catch (error) {
    const msg = error instanceof Error ? error.message : 'Agent 1 failed';
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
