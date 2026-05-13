const GROQ_URL = 'https://api.groq.com/openai/v1/chat/completions';
const MODEL = 'llama-3.3-70b-versatile';

const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

export async function callLLM(
  systemPrompt: string,
  userPrompt: string,
  temperature = 0.7,
  maxTokens = 2000,
  retries = 4,
): Promise<unknown> {
  const body = JSON.stringify({
    model: MODEL,
    messages: [
      { role: 'system', content: systemPrompt },
      { role: 'user', content: userPrompt },
    ],
    temperature,
    max_tokens: maxTokens,
    response_format: { type: 'json_object' },
  });

  for (let attempt = 0; attempt <= retries; attempt++) {
    const res = await fetch(GROQ_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${process.env.GROQ_API_KEY}`,
      },
      body,
    });

    if (res.status === 429) {
      if (attempt === retries) throw new Error('Groq rate limit — max retries exceeded');
      // Groq tells us exactly how long to wait
      const retryAfter = res.headers.get('retry-after');
      const waitMs = retryAfter ? parseFloat(retryAfter) * 1000 : (attempt + 1) * 15000;
      await sleep(waitMs);
      continue;
    }

    const data = await res.json();
    if (data.error) throw new Error(data.error.message ?? 'Groq error');
    const text: string = data.choices[0].message.content;
    return JSON.parse(text);
  }

  throw new Error('callLLM: unreachable');
}
