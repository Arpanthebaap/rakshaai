// Vercel serverless function — proxies transcript text to Claude for scam-risk analysis.
// Keeps the Anthropic API key server-side only (never exposed to the browser).
//
// Setup:
//   1. vercel env add ANTHROPIC_API_KEY   (paste your key from console.anthropic.com)
//   2. Deploy: vercel --prod
//
// The frontend (public/index.html) calls this at /api/analyze instead of
// hitting api.anthropic.com directly.

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Use POST" });
  }

  const { transcript, lang } = req.body || {};
  if (!transcript || typeof transcript !== "string") {
    return res.status(400).json({ error: "Missing 'transcript' string in request body" });
  }
  const targetLang = lang === "hi" ? "Hindi (Devanagari script)" : "English";

  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) {
    return res.status(500).json({ error: "ANTHROPIC_API_KEY is not configured on the server" });
  }

  try {
    const upstream = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": apiKey,
        "anthropic-version": "2023-06-01"
      },
      body: JSON.stringify({
        model: "claude-sonnet-4-6",
        max_tokens: 400,
        messages: [{
          role: "user",
          content: `You are a fraud-detection assistant analyzing a live phone call or message transcript for scam patterns common in India (digital arrest scams, fake police/customs/bank calls, OTP theft, voice cloning, UPI fraud). Respond ONLY with raw JSON, no markdown fences, no preamble, in this exact shape:
{"risk_score": <0-100 integer>, "category": "<short category>", "explanation": "<one sentence, plain language, addressed to the person on the call>", "recommended_action": "<one short imperative sentence>"}

Write the values of "category", "explanation", and "recommended_action" in ${targetLang}. Keep the JSON keys in English.

Transcript so far:
${transcript}`
        }]
      })
    });

    const data = await upstream.json();
    const textBlock = (data.content || []).find((c) => c.type === "text");
    if (!textBlock) {
      return res.status(502).json({ error: "No text content returned from model" });
    }
    const cleaned = textBlock.text.replace(/```json|```/g, "").trim();
    const parsed = JSON.parse(cleaned);
    return res.status(200).json(parsed);
  } catch (err) {
    return res.status(500).json({ error: "Analysis failed", detail: String(err) });
  }
}
