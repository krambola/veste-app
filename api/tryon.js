// api/tryon.js — Serverless function no Vercel
// Recebe as duas imagens, chama a fal.ai, devolve o resultado.
// A FAL_API_KEY fica protegida nas Environment Variables do Vercel.

export default async function handler(req, res) {
  // CORS — permite o front chamar esta API
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");

  if (req.method === "OPTIONS") {
    return res.status(200).end();
  }

  if (req.method !== "POST") {
    return res.status(405).json({ error: "Use POST" });
  }

  const FAL_KEY = process.env.FAL_API_KEY;
  if (!FAL_KEY) {
    return res.status(500).json({ error: "FAL_API_KEY não configurada no Vercel" });
  }

  try {
    const { person_image, garment_image, category = "auto", mode = "balanced" } = req.body;

    if (!person_image || !garment_image) {
      return res.status(400).json({ error: "Imagens obrigatórias" });
    }

    // 1. Submete o job à fal.ai
    const submitResp = await fetch("https://queue.fal.run/fal-ai/fashn/tryon/v1.6", {
      method: "POST",
      headers: {
        "Authorization": `Key ${FAL_KEY}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        model_image: person_image,
        garment_image: garment_image,
        category,
        mode,
        garment_photo_type: "auto",
        num_samples: 1
      })
    });

    if (!submitResp.ok) {
      const errText = await submitResp.text();
      return res.status(submitResp.status).json({ error: errText });
    }

    const { request_id } = await submitResp.json();

    // 2. Polling até completar (~15s)
    for (let i = 0; i < 40; i++) {
      await new Promise(r => setTimeout(r, 2000));

      const statusResp = await fetch(
        `https://queue.fal.run/fal-ai/fashn/requests/${request_id}/status`,
        { headers: { "Authorization": `Key ${FAL_KEY}` } }
      );
      const statusData = await statusResp.json();

      if (statusData.status === "COMPLETED") {
        const finalResp = await fetch(
          `https://queue.fal.run/fal-ai/fashn/requests/${request_id}`,
          { headers: { "Authorization": `Key ${FAL_KEY}` } }
        );
        const result = await finalResp.json();
        return res.status(200).json({
          image_url: result.images[0].url,
          request_id
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

// Aumenta o limite do body (imagens base64 são grandes)
export const config = {
  api: {
    bodyParser: {
      sizeLimit: "20mb"
    }
  }
};
