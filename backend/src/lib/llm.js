// Optional LLM plug point. Set in backend/.env to enable:
//   LLM_API_KEY=...                      (required to activate)
//   LLM_API_URL=https://api.openai.com/v1/chat/completions  (any OpenAI-compatible endpoint)
//   LLM_MODEL=gpt-4o-mini
// Without a key every caller falls back to a deterministic heuristic.

export function llmAvailable() {
  return Boolean(process.env.LLM_API_KEY);
}

export async function llmComplete(prompt) {
  if (!llmAvailable()) return null;

  const url = process.env.LLM_API_URL || 'https://api.openai.com/v1/chat/completions';
  try {
    const res = await fetch(url, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${process.env.LLM_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: process.env.LLM_MODEL || 'gpt-4o-mini',
        messages: [{ role: 'user', content: prompt }],
        max_tokens: 200,
      }),
    });
    if (!res.ok) return null;
    const data = await res.json();
    return data.choices?.[0]?.message?.content?.trim() || null;
  } catch {
    return null;
  }
}
