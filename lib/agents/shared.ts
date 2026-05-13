const GROQ_URL = 'https://api.groq.com/openai/v1/chat/completions';
const MODEL = 'llama-3.3-70b-versatile';

export async function callLLM(
  systemPrompt: string,
  userPrompt: string,
  temperature = 0.7,
  maxTokens = 2000,
): Promise<unknown> {
  const res = await fetch(GROQ_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${process.env.GROQ_API_KEY}`,
    },
    body: JSON.stringify({
      model: MODEL,
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userPrompt },
      ],
      temperature,
      max_tokens: maxTokens,
      response_format: { type: 'json_object' },
    }),
  });

  const data = await res.json();
  if (data.error) throw new Error(data.error.message ?? 'Groq error');
  const text: string = data.choices[0].message.content;
  return JSON.parse(text);
}
