// api/size-analysis.js — Análise de biotipo e tamanho via Claude API
export default async function handler(req, res) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");

  if (req.method === "OPTIONS") return res.status(200).end();
  if (req.method !== "POST") return res.status(405).json({ error: "Use POST" });

  const ANTHROPIC_KEY = process.env.ANTHROPIC_API_KEY;
  if (!ANTHROPIC_KEY) {
    return res.status(500).json({ error: "ANTHROPIC_API_KEY não configurada" });
  }

  try {
    const { altura, peso } = req.body;

    const prompt = `Você é um especialista em moda. Analise:
- Altura: ${altura} cm
- Peso: ${peso} kg

Recomende:
1. Tamanho ideal (PP, P, M, G, GG, XGG)
2. IMC e classificação
3. Biotipo (ectomorfo, mesomorfo, endomorfo)
4. Dicas de caimento curtas
5. Confiança 0-100

Responda APENAS JSON válido sem markdown:
{
  "tamanho": "M",
  "biotipo": "Mesomorfo",
  "imc": "23.5",
  "imcClassificacao": "Peso normal",
  "dicas": "Texto curto",
  "confianca": 92
}`;

    const resp = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": ANTHROPIC_KEY,
        "anthropic-version": "2023-06-01"
      },
      body: JSON.stringify({
        model: "claude-sonnet-4-20250514",
        max_tokens: 1000,
        messages: [{ role: "user", content: prompt }]
      })
    });

    if (!resp.ok) {
      const errText = await resp.text();
      return res.status(resp.status).json({ error: errText });
    }

    const data = await resp.json();
    const text = data.content[0].text.replace(/```json|```/g, "").trim();
    return res.status(200).json(JSON.parse(text));
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
}
