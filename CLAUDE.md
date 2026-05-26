# DeAgro Fundraising CRM

CRM interno da DeAgro para gerenciar a rodada de captação **Seed 2026** em conjunto com o advisor financeiro (Daniel / Kamea). Catálogo de fundos, classificação por tier/foco/geografia, gestão de pipeline em Kanban, dashboard de progresso da rodada.

## Stack

- **Frontend**: HTML + CSS + Vanilla JS (sem build), hospedado em **GitHub Pages** servindo de `main/docs`.
  - URL pública: https://deagro-crypto.github.io/fundraising_seed/
- **Backend**: **Google Apps Script Web App** rodando como `doGet`/`doPost` com router por `action`. Roda como o owner ("Execute as: Me") e access "Anyone" (a URL é o segredo).
- **DB**: **Google Sheets** (5 abas: `Funds`, `Rounds`, `Notes`, `StatusLog`, `Enums`).

## Estrutura do repo

```
docs/                       — frontend (servido pelo Pages)
  index.html
  styles.css                — paleta DeAgro (verde #3A5A40 + dourado #DAA520)
  app.js                    — SPA, camada de API por fetch
  assets/logo.svg

app_script/                 — backend (cópias do que vai colado no editor)
  code.gs                   — Web App, router, handlers, agregados
  database.gs               — schema das abas, repos, helpers; ensureSheet_ aditivo
  seed.gs                   — seedFunds() importa os 40 fundos da base DeAgro
  README.md                 — passo a passo de setup do Apps Script
```

## Modelo de dados

### Fund
```
id, name, website, tier (1|2|3),
focus: ['Impacto'|'Tech'|'Blockchain'|'Crypto'],
latam (bool), location, work_format,
status: todo | contacted | waiting | interest | negotiation | committed | closed
      | discarded | no_interest_company | stalled,
proposed_ticket, committed_ticket (USD),
thesis,
notes_deagro, notes_advisor,
contact_name, contact_phone, contact_email,
owner,
round_ids: [round_id]
```

### Round
```
id, name, target (USD), currency, status (open|closed),
opened_at, closed_at,
estrategia,
documento: ['SAFE'|'SAFT'],
equity_esperado (% diluição),
notes
```

### Status no funil
- **Positivos** (passam pelo funil): `A contatar → Contato feito → Aguardando resposta → Interesse → Em negociação → Comitado → Fechado`
- **Negativos** (saem do funil): `Descartado` (fundo recusou), `Sem interesse da empresa` (DeAgro recusou), `Não evoluiu` (sem evolução)

## Convenções operacionais (deste projeto)

- **Sempre comitar e dar merge** sem perguntar — usuário valida online no Pages.
- Branch de trabalho: `claude/bold-franklin-HbF5i`. Cada mudança vira PR pra `main`, squash-merge.
- Quando alterar `app_script/`, lembrar de **avisar o usuário** sobre o que ele precisa colar no editor do Apps Script e se precisa redeployar.
- **CORS no Apps Script**: usar POST com `Content-Type: text/plain` (evita preflight). Web App precisa estar com "Who has access: Anyone" — qualquer outra opção redireciona pro login do Google e o `fetch()` cross-origin quebra com "Failed to fetch".
- **`ensureSheet_` é aditivo**: adicionar campos novos sempre no fim de `SCHEMA.X` em `database.gs`. Reordenar/remover dispara rebuild destrutivo (apaga dados).

## Setup do backend (referência rápida)

1. Em `script.google.com` → New project → criar `Code.gs`, `Database.gs`, `Seed.gs` colando do repo.
2. Script Property `ADVISOR_EMAILS` = `daniel@kamea.com.br` (opcional, marca autor de notas).
3. Rodar `setupDatabase()` → cria a planilha no Drive + 5 abas + salva `SPREADSHEET_ID` automaticamente.
4. Rodar `seedFunds()` → importa os 40 fundos + cria rodada Seed 2026.
5. Deploy → New deployment → Web app → Execute as: Me, Who has access: **Anyone** → copia URL `/exec`.

Detalhes completos em [`app_script/README.md`](app_script/README.md).

## Trabalho ativo

Veja [`TASKS.md`](TASKS.md).
