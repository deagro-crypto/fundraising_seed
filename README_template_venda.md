# README — Produtização "Fundraising Kit" (briefing de handoff)

> **Para a outra sessão**: este documento é um briefing de negócio + técnico para transformar
> um CRM de captação interno (hoje em produção na DeAgro) num **produto vendável como template
> low-cost de pagamento único**. Leia tudo antes de começar.

---

## ⚠️ Regra nº 1 — NÃO TOCAR NA PRODUÇÃO

O projeto-fonte (`deagro-crypto/fundraising_seed`) está **em produção**, com o advisor da DeAgro
usando dados reais. NÃO modifique esse repo, o Apps Script da DeAgro nem a planilha de produção.

**Trabalhe numa cópia limpa**: faça um fork / novo repositório (ex.: `fundraising-kit`) e desenvolva
lá. O objetivo é um produto genérico e des-brandeado, não um patch no tool da DeAgro.

---

## O que é o produto

Um CRM de captação pronto-pra-usar que o **comprador instala na própria conta Google**:
catálogo de investidores, pipeline Kanban, dashboard de rodada. Dados ficam 100% com o comprador
(Google Sheets). **Pagamento único, low cost.** Sem SaaS, sem multi-tenancy, sem billing recorrente,
sem infra do vendedor.

**Posicionamento**: "O Foundersuite que você não aluga — instala uma vez e é seu."
Mais robusto que template de Notion, mais barato que SaaS.

**ICP preferido**: advisors financeiros que tocam várias rodadas (recorrência de uso, indicam pros
pares). Secundário: founders captando seed/pre-seed.

---

## Arquitetura do projeto-fonte (para entender o que copiar)

- **Frontend**: HTML + CSS + Vanilla JS, sem build. Servido por GitHub Pages de `main/docs`.
  - `docs/index.html`, `docs/styles.css` (paleta verde #3A5A40 + dourado #DAA520), `docs/app.js`
  - `docs/assets/logo.svg`, `docs/assets/favicon.svg`
- **Backend**: Google Apps Script Web App (`doGet`/`doPost`, router por `action`), roda como owner
  ("Execute as: Me", access "Anyone" — a URL é o segredo).
  - `app_script/code.gs` (router/handlers), `app_script/database.gs` (schema + repos),
    `app_script/seed.gs` (dados de exemplo)
- **DB**: Google Sheets, 5 abas: `Funds`, `Rounds`, `Notes`, `StatusLog`, `Enums`.
- **CORS**: front chama o Web App via `POST` com `Content-Type: text/plain` (evita preflight).
  O deploy precisa estar com "Who has access: Anyone".

### Modelo de dados resumido
- **Fund**: id, name, website, tier(1/2/3), focus[Impacto/Tech/Blockchain/Crypto], latam, location,
  work_format, status, proposed_ticket, committed_ticket, thesis, notes_deagro, notes_advisor,
  contact_name/phone/email, owner, round_ids[]
- **Round**: id, name, target, currency, status(open/closed), opened_at, closed_at, estrategia,
  documento[SAFE/SAFT], equity_esperado(%), notes
- **Status do funil**: positivos (todo→contacted→waiting→interest→negotiation→committed→closed) +
  negativos (discarded, no_interest_company, stalled)

---

## O calcanhar de Aquiles (resolver ou não vende)

Template de Notion vende porque é **1 clique** (Duplicate). O nosso exige **deploy de Apps Script** —
pra leigo é um paredão. É o gap nº1 entre "tool" e "produto vendável". Duas saídas:

- **A) Aceitar o atrito**: mirar compradores semi-técnicos. Mais barato, escala menos.
- **B) Matar o atrito** (recomendado): guia de instalação passo-a-passo + vídeo de 5 min +
  **"instalação assistida" como upsell pago**. O fluxo `setupDatabase()` já faz 80% do trabalho.

---

## Modificações necessárias (o trabalho da outra sessão)

Em ordem de prioridade:

1. **`config.js` de branding** — extrair nome do produto, cores (CSS vars), logo, moeda, idioma para
   um único arquivo de config. Hoje está hardcoded como DeAgro.
2. **Enums vindos da planilha** — tiers, status do funil, focos e tipos de documento já vivem na aba
   `Enums`; falta o **front ler dela** em vez da lista fixa no `app.js`. Isso deixa cada cliente
   customizar o funil editando a planilha, sem mexer em código.
3. **Limpar o seed** — remover os 40 fundos da DeAgro (`seed.gs`); shippar com poucos exemplos
   genéricos + botão "limpar exemplos".
4. **Des-brandear assets** — trocar logo/favicon DeAgro por placeholders neutros + instruções de como
   o comprador troca pelos dele.
5. **Guia de instalação à prova de leigo** — README do produto + vídeo. Espinha: criar projeto Apps
   Script → colar 3 arquivos → `setupDatabase()` → `seedFunds()` (exemplos) → deploy Web app →
   colar URL no `config.js` → publicar front (Pages ou hospedagem do comprador).
6. **Empacotamento** — zip versionado + entrega via **Gumroad / Lemon Squeezy** (pagamento, nota,
   licença). Licença de uso simples.

Estimativa: ~1-2 semanas; a maior parte do código já existe, é refatoração + des-branding + docs.

---

## Pricing & distribuição

- **Template**: US$ 49–149 one-time.
- **Upsell "instalação assistida"**: US$ 99–199.
- **Canais**: Gumroad, comunidades de founders LATAM, rede do advisor, IndieHackers, Product Hunt.
- **Ativo escondido**: a base de ~40 fundos classificados (tier/foco/LATAM/tese) pode ser um produto
  à parte ou bônus que os genéricos não têm. Pode valer mais que o software. **Confirmar antes de
  redistribuir** — checar se há restrição de uso/origem desses dados.

---

## Riscos honestos

- **Teto baixo**: pagamento único de baixo valor → volume é tudo, sem recorrência.
- **Pirataria**: são arquivos, vão circular. Tratar como custo de marketing.
- **Suporte**: mesmo "sem suporte", comprador de bug acha o vendedor. Definir expectativa clara.
- **Validação manda**: antes de codar as modificações, validar com 3-5 advisors se pagariam e quanto.

---

## Primeiros passos sugeridos para a outra sessão

1. Forkar/copiar o código-fonte para um repo novo e limpo (`fundraising-kit`).
2. Implementar o `config.js` de branding (modificação nº1) — é o que destrava "qualquer um usar".
3. Fazer o front ler os enums da planilha (modificação nº2).
4. Limpar seed + des-brandear assets (nº3 e nº4).
5. Escrever o guia de instalação + gravar vídeo (nº5).
6. Empacotar e listar no Gumroad (nº6).

> Não copie dados, logo ou identidade da DeAgro para o produto vendido. O produto é genérico.
