export async function callGemini(model, prompt) {
  const { GoogleGenerativeAI } = await import('@google/generative-ai');
  const genai = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
  const m = genai.getGenerativeModel({ model });

  for (let attempt = 0; attempt < 3; attempt++) {
    try {
      const result = await m.generateContent(prompt);
      return result.response.text().trim();
    } catch (err) {
      const msg = String(err.message);
      // 「current quota」はRPD日次上限 → リトライ不可。それ以外の429はRPM → 待機してリトライ
      const isRpmLimit = msg.includes('429') && !msg.includes('current quota');
      if (isRpmLimit && attempt < 2) {
        const wait = (attempt + 1) * 30000;
        console.warn(`[WARN] Gemini RPMリミット - ${wait / 1000}秒後にリトライ (${attempt + 1}/2)`);
        await new Promise((r) => setTimeout(r, wait));
      } else {
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
