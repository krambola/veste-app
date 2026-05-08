# Vestê — Provador Virtual com IA

Provador virtual usando **FASHN v1.6** (via fal.ai) + **Claude** (Anthropic) para análise de tamanho.

## 🚀 Deploy no Vercel — Passo a Passo

### 1. Subir os arquivos no GitHub

1. Vá em [github.com/new](https://github.com/new)
2. Crie um repositório novo (pode ser privado), nome: `veste-app`
3. **NÃO** marque "Add README" (já tem este arquivo)
4. Clique em **Create repository**
5. Na próxima tela, clique em **"uploading an existing file"**
6. Arraste TODOS os arquivos desta pasta (`api/`, `public/`, `package.json`, `vercel.json`, `README.md`)
7. Clique em **Commit changes**

### 2. Criar conta no Vercel

1. Vá em [vercel.com/signup](https://vercel.com/signup)
2. Clique em **Continue with GitHub** (mais rápido)
3. Autorize o Vercel a acessar seus repositórios

### 3. Importar o projeto

1. No dashboard do Vercel, clique em **Add New → Project**
2. Encontre o repositório `veste-app` na lista e clique em **Import**
3. **NÃO mude nada** nas configurações (Framework Preset = "Other")
4. Antes de clicar em Deploy, expanda a seção **Environment Variables**
5. Adicione duas variáveis:

| Name | Value |
|---|---|
| `FAL_API_KEY` | sua chave da fal.ai |
| `ANTHROPIC_API_KEY` | sua chave da Anthropic (opcional, veja abaixo) |

6. Clique em **Deploy**
7. Espere 30 segundos. Pronto! Seu app está em `https://veste-app-xxxxx.vercel.app`

### 4. Pegar as chaves

**fal.ai:**
- [fal.ai/dashboard/keys](https://fal.ai/dashboard/keys) → "Create new key" → copiar valor
- Adicionar cartão em [fal.ai/dashboard/billing](https://fal.ai/dashboard/billing)

**Anthropic (opcional — se quiser análise de tamanho via IA):**
- [console.anthropic.com/settings/keys](https://console.anthropic.com/settings/keys) → "Create Key"
- Sem essa chave, a parte de tamanho não funciona, mas o try-on sim.

## 💰 Custos

- Vercel: **grátis** (Hobby plan: 100GB bandwidth/mês)
- fal.ai: **US$ 0,075 por geração** (≈ R$ 0,40)
- Anthropic: **~US$ 0,001 por análise** (praticamente grátis)

## 🛠️ Estrutura

```
veste-app/
├── api/
│   ├── tryon.js          ← Backend: chama fal.ai (FASHN v1.6)
│   └── size-analysis.js  ← Backend: chama Claude
├── public/
│   └── index.html        ← Frontend completo
├── package.json
├── vercel.json
└── README.md
```

## 🎨 Customizar visual

Tudo está em `public/index.html`. Procure por:
- **Nome "vestê"** → trocar por sua marca
- **Cores** → procurar `bg-stone-900` e `bg-stone-50` (Tailwind)
- **Textos** → ctrl+F nos textos que quiser mudar

Após editar, faça novo commit no GitHub. O Vercel re-deploya em 30s automaticamente.

## 📊 Próximos passos sugeridos

- [ ] Salvar leads (email/whatsapp) num Google Sheets ou Airtable
- [ ] Adicionar Google Analytics
- [ ] Conectar domínio próprio (provoulevou.com.br) — grátis no Vercel
- [ ] Criar painel admin para ver provas feitas
- [ ] Integrar com loja virtual (Shopify, Nuvemshop)

## ⚠️ Importante

- **Nunca** suba a `FAL_API_KEY` direto no código. Use sempre Environment Variables.
- A pasta `api/` é executada no servidor (Node.js), as chaves ficam protegidas.
- A pasta `public/` é estática e enviada ao navegador.
