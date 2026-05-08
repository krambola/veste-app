// api/size-analysis.js — Versão SEM IA (cálculo por IMC)
// Não precisa de chave Anthropic. 100% grátis.

export default async function handler(req, res) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");

  if (req.method === "OPTIONS") return res.status(200).end();
  if (req.method !== "POST") return res.status(405).json({ error: "Use POST" });

  try {
    const { altura, peso } = req.body;
    const alturaCm = parseFloat(altura);
    const pesoKg = parseFloat(peso);

    if (!alturaCm || !pesoKg) {
      return res.status(400).json({ error: "Altura e peso são obrigatórios" });
    }

    // Calcula IMC
    const alturaM = alturaCm / 100;
    const imc = pesoKg / (alturaM * alturaM);
    const imcRound = imc.toFixed(1);

    // Classificação IMC
    let imcClassificacao;
    if (imc < 18.5) imcClassificacao = "Abaixo do peso";
    else if (imc < 25) imcClassificacao = "Peso normal";
    else if (imc < 30) imcClassificacao = "Sobrepeso";
    else if (imc < 35) imcClassificacao = "Obesidade I";
    else imcClassificacao = "Obesidade II+";

    // Tamanho recomendado por IMC + altura
    let tamanho;
    if (imc < 19) tamanho = "PP";
    else if (imc < 22) tamanho = "P";
    else if (imc < 26) tamanho = "M";
    else if (imc < 30) tamanho = "G";
    else if (imc < 34) tamanho = "GG";
    else tamanho = "XGG";

    // Ajuste para pessoas muito altas (manga/comprimento)
    if (alturaCm > 185 && tamanho === "M") tamanho = "G";

    // Biotipo aproximado
    let biotipo;
    if (imc < 20) biotipo = "Ectomorfo";
    else if (imc < 26) biotipo = "Mesomorfo";
    else biotipo = "Endomorfo";

    // Dicas básicas por biotipo
    const dicasMap = {
      "Ectomorfo": "Peças com caimento mais ajustado realçam sua silhueta. Tecidos estruturados funcionam bem.",
      "Mesomorfo": "Sua estrutura aceita praticamente qualquer modelagem. Aposte em peças que valorizem a cintura.",
      "Endomorfo": "Tecidos fluidos e modelagens retas trazem conforto e elegância. Evite peças muito justas."
    };

    return res.status(200).json({
      tamanho,
      biotipo,
      imc: imcRound,
      imcClassificacao,
      dicas: dicasMap[biotipo],
      confianca: 85
    });
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
}
