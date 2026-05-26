# Tasks

## MVP entregue e em produção 🚀

Frontend rodando em https://deagro-crypto.github.io/fundraising_seed/, backend no Apps Script da DeAgro, advisor (Daniel) populando dados reais.

### Frontend (`docs/`)
- [x] Dashboard com KPIs (target, capturado, em negociação, fundos adicionados à rodada)
- [x] Funil da rodada (formato trapezoidal, valores dentro, saídas em vermelho ao lado)
- [x] Gráfico pizza de fundos por tier + distribuição por foco
- [x] Página de Fundos com tabs por tier (em dourado), filtros (nome, foco, LATAM, status)
- [x] Tabela com ordenação clicável, paginação 20/página, scroll horizontal+vertical
- [x] Tese com line-clamp 3 linhas (texto completo no modal)
- [x] Página de Rodadas (lista) → clique abre detalhe da rodada
- [x] Detalhe da rodada com card de progresso + Kanban (9 colunas, cards coloridos por tier, scroll interno)
- [x] Modal de fundo: leitura → Editar → Salvar; campos completos incluindo Contato (nome/tel/email) e notas separadas DeAgro/Advisor
- [x] Modal de fundo e rodada com footer fixo (botões sempre visíveis)
- [x] Modal de rodada: nome, target, status, equity esperado, documento (SAFE/SAFT), estratégia
- [x] Modal "Gerenciar fundos da rodada": pré-marca o que está, diff `+N −M` no botão
- [x] Spinner in-button durante save/delete/add-remove
- [x] Logo DeAgro no header + favicon
- [x] Hospedado no GitHub Pages (`main/docs`)

### Backend (`app_script/`)
- [x] Web App com router por `action` + handlers para Funds/Rounds/Notes/StatusLog
- [x] `setupDatabase()` cria a planilha + abas + salva ID automaticamente
- [x] `seedFunds()` importa os 40 fundos + cria rodada Seed 2026
- [x] `ensureSheet_` aditivo (não destrói dados ao adicionar colunas no fim do schema)
- [x] StatusLog automático em toda mudança de status
- [x] Identificação automática de advisor via `ADVISOR_EMAILS` (`daniel@kamea.com.br`)
- [x] Endpoints `addFundsToRound` / `removeFundsFromRound` (bulk)
- [x] Frontend conectado via fetch (POST text/plain pra evitar CORS preflight)

## Backlog / ideias

### Próximos prováveis
- [ ] **Histórico de notas** (aba `Notes` já existe no DB) — listar com autor e timestamp dentro do modal do fundo, em vez dos dois campos de texto livre que sobrescrevem
- [ ] **Log de status** visível no modal do fundo (cronologia de mudanças, já gravado em `StatusLog`)
- [ ] **Drag-and-drop no Kanban** para mudar status arrastando
- [ ] **Compartilhar planilha** automaticamente com `daniel@kamea.com.br` via `DriveApp.addEditor()` num helper do backend
- [ ] **Filtro por rodada** no catálogo de Fundos (atualmente mostra todos do universo)
- [ ] **Exportar** snapshot da rodada (CSV/PDF) para relatório

### Polish
- [ ] Validar e-mail/telefone no modal de fundo
- [ ] Confirmação visual após save (toast em vez de re-render só)
- [ ] Atalho de teclado para abrir modal de novo fundo (`N`)
- [ ] Dark mode (paleta DeAgro tem boa base verde-escuro)

### Dívidas técnicas
- [ ] `A` e `e` do logo SVG têm curvas auto-cruzantes similares à do `g` (PR #17) — não estão visíveis ainda mas podem virar problema
- [ ] Reload completo a cada mutação é caro (1-2s no Apps Script). Considerar update otimista do state e refetch em segundo plano se ficar lento.
- [ ] Sem tratamento de conflito quando duas pessoas editam o mesmo fundo simultaneamente.

## Notas operacionais

- Toda alteração em `app_script/*.gs` exige: colar no editor + rodar `initDatabase` se schema mudou + **redeploy do Web App** (Deploy → Manage deployments → Edit → New version → Deploy). A URL fica a mesma.
- O frontend está em `main/docs` servido por GitHub Pages — propagação ~1min após push.
- Branch de desenvolvimento: `claude/bold-franklin-HbF5i`.
