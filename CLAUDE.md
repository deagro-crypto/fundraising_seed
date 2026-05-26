# DeAgro Fundraising CRM

CRM interno da DeAgro para gerenciar a rodada de captação **Seed 2026** em conjunto com o advisor financeiro (Daniel / Kamea). Catálogo de fundos, classificação por tier/foco/geografia, gestão de pipeline em Kanban, dashboard de progresso da rodada.

**Status**: MVP em produção. Frontend deployado no GitHub Pages, backend rodando no Apps Script da DeAgro, advisor (Daniel) populando dados reais via UI.

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
  assets/
    logo.svg                — logo horizontal (header)
    favicon.svg             — só as 3 folhas (favicon)

app_script/                 — backend (cópias do que vai colado no editor)
  code.gs                   — Web App, router, handlers, agregados
  database.gs               — schema das abas, repos, helpers; ensureSheet_ aditivo
  seed.gs                   — seedFunds() importa os 40 fundos da base DeAgro
  README.md                 — passo a passo de setup do Apps Script

CLAUDE.md                   — este arquivo (contexto do projeto)
TASKS.md                    — estado atual + backlog
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

## Funcionalidades principais

- **Dashboard**: KPIs (target, capturado, em negociação, fundos da rodada), funil em formato trapezoidal com saídas em vermelho ao lado, pizza por tier, distribuição por foco.
- **Fundos**: tabela com tabs dourados por tier, filtros, ordenação clicável, paginação (20/página), scroll horizontal, tese com line-clamp 3 linhas, modal com Contato (nome/tel/email) e notas separadas DeAgro/Advisor.
- **Rodadas**: lista → detalhe com Kanban (cards coloridos por tier, scroll interno por coluna). Campos: nome, target, status, equity esperado, documento (SAFE/SAFT), estratégia.
- **Gerenciar fundos da rodada**: modal único com diff (`+N −M`) para adicionar ou remover fundos do conjunto da rodada.
- **Feedback visual**: spinners in-button durante chamadas async ao Apps Script.

## Convenções operacionais (deste projeto)

- **Sempre comitar e dar merge** sem perguntar — usuário valida online no Pages.
- Branch de trabalho: `claude/bold-franklin-HbF5i`. Cada mudança vira PR pra `main`, squash-merge.
- Quando alterar `app_script/`, lembrar de **avisar o usuário** sobre o que ele precisa colar no editor do Apps Script e se precisa redeployar.
- **CORS no Apps Script**: usar POST com `Content-Type: text/plain` (evita preflight). Web App precisa estar com "Who has access: Anyone" — qualquer outra opção redireciona pro login do Google e o `fetch()` cross-origin quebra com "Failed to fetch".
- **`ensureSheet_` é aditivo**: adicionar campos novos sempre no fim de `SCHEMA.X` em `database.gs`. Reordenar/remover dispara rebuild destrutivo (apaga dados).
- **Modal com form**: form embrulha `.modal__body` (rolável) + `.modal__footer` (fixo). Não colocar footer dentro do body, senão os botões somem quando o conteúdo é longo.

## Setup do backend (referência rápida)

1. Em `script.google.com` → New project → criar `Code.gs`, `Database.gs`, `Seed.gs` colando do repo.
2. Script Property `ADVISOR_EMAILS` = `daniel@kamea.com.br` (marca autor de notas).
3. Rodar `setupDatabase()` → cria a planilha no Drive + 5 abas + salva `SPREADSHEET_ID` automaticamente.
4. Rodar `seedFunds()` → importa os 40 fundos + cria rodada Seed 2026.
5. Deploy → New deployment → Web app → Execute as: Me, Who has access: **Anyone** → copia URL `/exec`.

Detalhes completos em [`app_script/README.md`](app_script/README.md).

## Atualizações de backend

Sempre que `app_script/*.gs` mudar:

1. Colar o arquivo alterado no editor do Apps Script.
2. Se `Database.gs` mudou schema, rodar `initDatabase()` (aditivo — não destrói dados se só adicionou colunas no fim).
3. **Deploy → Manage deployments → Edit → New version → Deploy** para a API expor as mudanças. URL fica a mesma.

## Trabalho ativo

Veja [`TASKS.md`](TASKS.md).

