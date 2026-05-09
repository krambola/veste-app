// api/tryon.js — Kling Kolors v1.5 via fal.ai
// Doc: https://fal.ai/models/fal-ai/kling/v1-5/kolors-virtual-try-on
// Custo: $0.07/geração

export default async function handler(req, res) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");

  if (req.method === "OPTIONS") return res.status(200).end();
  if (req.method !== "POST") return res.status(405).json({ error: "Use POST" });

  const FAL_KEY = process.env.FAL_API_KEY;
  if (!FAL_KEY) {
    return res.status(500).json({ error: "FAL_API_KEY não configurada" });
  }

  try {
    const { person_image, garment_image } = req.body;

    if (!person_image || !garment_image) {
      return res.status(400).json({ error: "Imagens obrigatórias" });
    }

    // 1. Submete o job ao Kling Kolors v1.5
    const submitResp = await fetch(
      "https://queue.fal.run/fal-ai/kling/v1-5/kolors-virtual-try-on",
      {
        method: "POST",
        headers: {
          Authorization: `Key ${FAL_KEY}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          human_image_url: person_image,
          garment_image_url: garment_image,
        }),
      }
    );

    if (!submitResp.ok) {
      const errText = await submitResp.text();
      return res.status(submitResp.status).json({ error: errText.slice(0, 300) });
    }

    const { request_id } = await submitResp.json();

    // 2. Polling até completar (~10-20s)
    for (let i = 0; i < 40; i++) {
      await new Promise((r) => setTimeout(r, 2000));

      const statusResp = await fetch(
        `https://queue.fal.run/fal-ai/kling/requests/${request_id}/status`,
        { headers: { Authorization: `Key ${FAL_KEY}` } }
      );
      const statusData = await statusResp.json();

      if (statusData.status === "COMPLETED") {
        const finalResp = await fetch(
          `https://queue.fal.run/fal-ai/kling/requests/${request_id}`,
          { headers: { Authorization: `Key ${FAL_KEY}` } }
        );
        const result = await finalResp.json();

        // Kling retorna { image: { url: ... } }
        return res.status(200).json({
          image_url: result.image.url,
          request_id,
        });
      } else if (statusData.status === "FAILED") {
        return res.status(500).json({ error: "Geração falhou" });
      }
    }

    return res.status(504).json({ error: "Timeout — geração demorou demais" });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: err.message });
  }
}

export const config = {
  api: {
    bodyParser: {
      sizeLimit: "20mb",
    },
  },
};
