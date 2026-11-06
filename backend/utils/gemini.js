const API_BASE = 'https://generativelanguage.googleapis.com/v1beta/models';
const DEFAULT_MODEL = 'gemini-3.8-flash';
const TIMEOUT_MS = 20000;

const isConfigured = () => Boolean(process.env.GEMINI_API_KEY);

// Gửi một lượt generateContent -> Trả về JSON gốc của Gemini
const generateContent = async ({ systemInstruction, contents, tools }) => {
  if (!isConfigured()) {
    throw Object.assign(new Error('Chưa cấu hình GEMINI_API_KEY'), { code: 'GEMINI_NOT_CONFIGURED' });
  }
  const model = process.env.GEMINI_MODEL || DEFAULT_MODEL;
  const body = { contents };
  if (systemInstruction) body.systemInstruction = { parts: [{ text: systemInstruction }] };
  if (tools) body.tools = tools;

  let response;
  try {
    response = await fetch(`${API_BASE}/${encodeURIComponent(model)}:generateContent`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-goog-api-key': process.env.GEMINI_API_KEY,
      },
      body: JSON.stringify(body),
      signal: AbortSignal.timeout(TIMEOUT_MS),
    });
  } catch (err) {
    throw Object.assign(new Error(`Không gọi được Gemini: ${err.name}`), { code: 'GEMINI_ERROR' });
  }

  if (!response.ok) {
    // Chỉ ghi mã lỗi và vài chục ký tự đầu của thông báo
    const detail = (await response.text().catch(() => '')).slice(0, 300);
    const code = response.status === 429 ? 'GEMINI_RATE_LIMIT' : 'GEMINI_ERROR';
    throw Object.assign(new Error(`Gemini trả về ${response.status}: ${detail}`), { code });
  }
  return response.json();
};

module.exports = { isConfigured, generateContent };