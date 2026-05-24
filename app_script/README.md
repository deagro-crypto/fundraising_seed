# DeAgro Fundraising — Apps Script backend

Camada de backend do CRM rodando como **Google Apps Script Web App** com Google Sheets como banco.

## Arquivos

- `code.gs` — Web App (`doGet`/`doPost`), router de actions, handlers e helpers de setup.
- `database.gs` — Camada de acesso aos dados. Define o schema (abas e colunas) e expõe `Database.Funds`, `Database.Rounds`, `Database.Notes`, `Database.StatusLog`.

## Setup (uma vez)

1. Crie uma planilha no Drive da DeAgro e copie o ID dela (parte da URL entre `/d/` e `/edit`).
2. No console do Apps Script, crie um projeto novo e cole `code.gs` e `database.gs`.
3. Em **Project Settings → Script Properties**, adicione:
   - `SPREADSHEET_ID` = ID da planilha.
   - `ADVISOR_EMAILS` (opcional) = lista separada por vírgula com os emails do advisor — usado para marcar notas como `advisor` vs `deagro`.
4. No editor, rode a função `initDatabase()` uma vez. Isso cria as abas `Funds`, `Rounds`, `Notes`, `StatusLog`, `Enums` com cabeçalhos.
5. **Deploy → New deployment → Web app**
   - *Execute as*: Me
   - *Who has access*: Anyone within DeAgro (ou Anyone with the link, se o front for público)
6. Copie a URL `/exec`. É o endpoint que o frontend vai chamar.

## Protocolo

`GET <webapp>/exec?action=<name>&<params>`
`POST <webapp>/exec`  body JSON: `{ "action": "...", "payload": { ... } }`

Resposta: `{ ok: true, data: ... }` ou `{ ok: false, error: "..." }`.

### Actions disponíveis

| action | payload | retorna |
|---|---|---|
| `ping` | — | `{ ok, time }` |
| `listFunds` | — | `Fund[]` |
| `getFund` | `{ id }` | `Fund` |
| `createFund` | `Fund` (sem id) | `Fund` criado |
| `updateFund` | `{ id, ...patch }` | `Fund` atualizado |
| `deleteFund` | `{ id }` | `{ id, deleted: true }` |
| `listRounds` | — | `Round[]` |
| `createRound` | `Round` | `Round` |
| `updateRound` | `{ id, ...patch }` | `Round` |
| `closeRound` | `{ id }` | `Round` |
| `listNotes` | `{ fund_id }` | `Note[]` |
| `addNote` | `{ fund_id, body }` | `Note` |
| `listStatusLog` | `{ fund_id }` | `StatusLog[]` |
| `roundProgress` | `{ round_id }` | `{ round, committed, pipeline, by_tier[] }` |

### Schema (Fund)

```
id, name, website, tier (1|2|3),
focus: ['Impacto'|'Tech'|'Blockchain'|'Crypto'],
latam (bool), location, work_format,
status: todo|contacted|waiting|diligence|interest|committed|pass,
proposed_ticket, committed_ticket (number, USD),
thesis, notes, owner,
created_at, updated_at
```

Toda mudança de `status` gera um registro em `StatusLog`.
Notas livres devem ir para `Notes` via `addNote` (mantém histórico por autor).
