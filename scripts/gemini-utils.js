export async function callGemini(model, prompt) {
  const { GoogleGenerativeAI } = await import('@google/generative-ai');
  const genai = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
  const m = genai.getGenerativeModel({ model });

  // retryDelay をエラー本文から取得（秒単位。見つからなければ 70 秒）
  function extractRetryDelay(msg) {
    const match = msg.match(/retryDelay["\s:]+(\d+)s/);
    return match ? (parseInt(match[1], 10) + 10) * 1000 : 70000;
  }

  // リトライ対象のエラーかどうか判定（RPM/RPD超過・サービス一時障害）
  function isRetryable(msg) {
    return (
      msg.includes('429') ||
      msg.includes('503') ||
      msg.includes('RESOURCE_EXHAUSTED') ||
      msg.includes('UNAVAILABLE') ||
      msg.includes('quota')
    );
  }

  const MAX_ATTEMPTS = 4;
  for (let attempt = 0; attempt < MAX_ATTEMPTS; attempt++) {
    try {
      const result = await m.generateContent(prompt);
      const text = result.response.text().trim();
      if (!text) throw new Error('Gemini returned empty response');
      return text;
    } catch (err) {
      const msg = String(err.message);
      if (isRetryable(msg) && attempt < MAX_ATTEMPTS - 1) {
        const wait = extractRetryDelay(msg);
        console.warn(`[WARN] Gemini エラー（リトライ可能）- ${Math.round(wait / 1000)}秒後にリトライ (${attempt + 1}/${MAX_ATTEMPTS - 1}): ${msg.slice(0, 80)}`);
        await new Promise((r) => setTimeout(r, wait));
      } else {
        console.error(`[ERROR] Gemini 呼び出し失敗 (attempt ${attempt + 1}): ${msg.slice(0, 120)}`);
        throw err;
      }
    }
  }
}

export function parseJsonFromText(text) {
  const cleaned = text
    .replace(/^```json\s*/m, '').replace(/^```\s*/m, '').replace(/```\s*$/m, '').trim();
  return JSON.parse(cleaned);
}
