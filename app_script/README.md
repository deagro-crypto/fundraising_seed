# DeAgro Fundraising — Apps Script backend

Backend do CRM rodando como **Google Apps Script Web App** com Google Sheets como banco.

## Arquivos

- `code.gs` — Web App (`doGet`/`doPost`), router de actions, handlers, agregados (`roundProgress`) e helpers de setup.
- `database.gs` — Camada de acesso aos dados. Declara o schema das abas e expõe `Database.Funds`, `Database.Rounds`, `Database.Notes`, `Database.StatusLog`.
- `seed.gs` — Função `seedFunds()` que importa os 40 fundos da base DeAgro e cria a rodada "Seed 2026" com todos linkados. Idempotente.

## Setup (uma vez)

1. **Criar projeto Apps Script** em `script.google.com` → New project. Cole 3 arquivos:
   - Renomeie o `Code.gs` padrão e cole `app_script/code.gs`.
   - **File → New → Script** → `Database.gs` → cole `app_script/database.gs`.
   - **File → New → Script** → `Seed.gs` → cole `app_script/seed.gs`.
2. **(Opcional) Script Properties**: ⚙ Project Settings → Script Properties:
   - `ADVISOR_EMAILS` = emails do advisor separados por vírgula. Quem escrever notas com email nessa lista é marcado como `advisor`; senão, `deagro`.
   - *(Não precisa criar `SPREADSHEET_ID` — o `setupDatabase()` faz isso pra você.)*
3. **Rodar `setupDatabase`**: no editor, selecione a função `setupDatabase` no seletor de funções e clique em **Run**. Autorize quando o Google pedir (precisa de Sheets + Drive).
   - O script vai **criar a planilha** "DeAgro Fundraising DB" no seu Drive, salvar o ID em Script Properties automaticamente, criar as 5 abas (`Funds`, `Rounds`, `Notes`, `StatusLog`, `Enums`) com cabeçalhos verdes e popular o `Enums` com os valores padrão.
   - Abra **View → Logs** (`Ctrl+Enter`) — o log mostra o ID e a URL da planilha criada.
4. **Rodar `seedFunds`** (opcional, mas recomendado): seletor de funções → `seedFunds` → **Run**. Importa os 40 fundos da base DeAgro e cria a rodada "Seed 2026" com todos linkados. Pode rodar de novo sem medo — não duplica.
5. **Deploy**: Deploy → New deployment → "Web app"
   - *Execute as*: Me (sua conta DeAgro)
   - *Who has access*: "Anyone with Google Account" (ou restrinja ao domínio Workspace da DeAgro)
   - Deploy → copie a **URL `/exec`**
6. **Smoke test**: abra `<webapp-url>/exec?action=ping`. Deve retornar `{"ok":true,"data":{"ok":true,"time":"..."}}`.
7. **Me passe a URL** para eu conectar o frontend.

> Se algum dia quiser recomeçar do zero: delete a planilha no Drive, apague a Script Property `SPREADSHEET_ID` e rode `setupDatabase()` de novo.

## Protocolo

- `GET <webapp>/exec?action=<name>&<params>`
- `POST <webapp>/exec` body JSON: `{ "action": "...", "payload": { ... } }`

Resposta: `{ ok: true, data: ... }` ou `{ ok: false, error: "..." }`.

### Actions

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
| `addFundsToRound` | `{ round_id, fund_ids: [] }` | `{ count, funds }` |
| `removeFundFromRound` | `{ round_id, fund_id }` | `{ count, funds }` |
| `listNotes` | `{ fund_id }` | `Note[]` |
| `addNote` | `{ fund_id, body }` | `Note` |
| `listStatusLog` | `{ fund_id }` | `StatusLog[]` |
| `roundProgress` | `{ round_id }` | `{ round, committed, pipeline, by_tier[] }` |

### Schemas

**Fund**
```
id, name, website, tier (1|2|3),
focus: ['Impacto'|'Tech'|'Blockchain'|'Crypto'],
latam (bool), location, work_format,
status: todo | contacted | waiting | interest | negotiation | committed | closed
      | discarded | no_interest_company | stalled,
proposed_ticket, committed_ticket (number, USD),
thesis,
notes_deagro, notes_advisor,
owner,
round_ids: [round_id],
created_at, updated_at
```

**Round**
```
id, name, target (USD), currency, status (open|closed),
opened_at, closed_at,
estrategia,
documento: ['SAFE'|'SAFT'],
equity_esperado (number, %),
notes,
created_at, updated_at
```

Toda mudança de `status` do fundo gera um registro em `StatusLog`. Notas livres via `addNote` (mantém histórico por autor com email + role).

## Atualizar schema depois

Para adicionar campo novo, edite `SCHEMA` em `database.gs` e rode `initDatabase()` de novo — ele cria a coluna se faltar e mantém os dados existentes (desde que a ordem dos cabeçalhos não mude no meio).
