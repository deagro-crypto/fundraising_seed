/**
 * DeAgro Fundraising CRM — Apps Script Web App
 *
 * Publicar: Deploy → New deployment → Web app
 *   - Execute as: Me
 *   - Who has access: Anyone with Google account no domínio DeAgro
 *
 * Frontend chama: GET  <webapp>/exec?action=listFunds
 *                 POST <webapp>/exec  body = { action, payload }
 *
 * O router despacha para handlers; cada handler delega ao Database.
 */

const SPREADSHEET_ID = PropertiesService.getScriptProperties().getProperty('SPREADSHEET_ID') || '';

function doGet(e)  { return route_(e, 'GET'); }
function doPost(e) { return route_(e, 'POST'); }

function route_(e, method) {
  try {
    const params = (e && e.parameter) || {};
    let action = params.action;
    let payload = {};

    if (method === 'POST' && e.postData && e.postData.contents) {
      const body = JSON.parse(e.postData.contents);
      action = action || body.action;
      payload = body.payload || {};
    } else {
      payload = params;
    }

    if (!action) return json_({ ok: false, error: 'missing action' });
    if (!HANDLERS[action]) return json_({ ok: false, error: 'unknown action: ' + action });

    const user = (Session.getActiveUser() && Session.getActiveUser().getEmail()) || '';
    const data = HANDLERS[action](payload, user);
    return json_({ ok: true, data });
  } catch (err) {
    return json_({ ok: false, error: String(err && err.message || err) });
  }
}

function json_(obj) {
  return ContentService
    .createTextOutput(JSON.stringify(obj))
    .setMimeType(ContentService.MimeType.JSON);
}

/* ------------------ Handlers ------------------ */
const HANDLERS = {
  // Funds
  listFunds:   ()        => Database.Funds.list(),
  getFund:     (p)       => Database.Funds.get(p.id),
  createFund:  (p, user) => Database.Funds.create(p, user),
  updateFund:  (p, user) => Database.Funds.update(p.id, p, user),
  deleteFund:  (p)       => Database.Funds.remove(p.id),

  // Rounds
  listRounds:  ()        => Database.Rounds.list(),
  createRound: (p, user) => Database.Rounds.create(p, user),
  updateRound: (p, user) => Database.Rounds.update(p.id, p, user),
  closeRound:  (p, user) => Database.Rounds.update(p.id, { status: 'closed', closed_at: today_() }, user),

  // Associação fundo ↔ rodada (suporta múltiplos)
  addFundsToRound:      (p, user) => bulkRoundMembership_(p.round_id, p.fund_ids || [], 'add',    user),
  removeFundsFromRound: (p, user) => bulkRoundMembership_(p.round_id, p.fund_ids || [], 'remove', user),

  // Notes (append-only)
  listNotes:   (p)       => Database.Notes.listByFund(p.fund_id),
  addNote:     (p, user) => Database.Notes.add(p.fund_id, p.body, user),

  // Status log + agregados
  listStatusLog: (p)     => Database.StatusLog.listByFund(p.fund_id),
  roundProgress: (p)     => computeRoundProgress_(p.round_id),

  // Util
  ping: () => ({ ok: true, time: new Date().toISOString() }),
};

function computeRoundProgress_(roundId) {
  const round = Database.Rounds.get(roundId);
  const funds = Database.Funds.list();
  const committed = funds.reduce((s, f) => s + (Number(f.committed_ticket) || 0), 0);
  const pipeline  = funds
    .filter(f => ['diligence','interest'].includes(f.status))
    .reduce((s, f) => s + (Number(f.proposed_ticket) || 0), 0);
  const by_tier = [1,2,3].map(t => {
    const fs = funds.filter(f => Number(f.tier) === t);
    return {
      tier: t,
      count: fs.length,
      committed: fs.reduce((s, f) => s + (Number(f.committed_ticket) || 0), 0),
    };
  });
  return { round, committed, pipeline, by_tier };
}

function today_() { return new Date().toISOString().slice(0, 10); }

function bulkRoundMembership_(roundId, fundIds, mode, user) {
  const updated = [];
  fundIds.forEach(fid => {
    const f = Database.Funds.get(fid);
    const set = new Set(f.round_ids || []);
    if (mode === 'add') set.add(roundId); else set.delete(roundId);
    updated.push(Database.Funds.update(fid, { round_ids: [...set] }, user));
  });
  return { count: updated.length, funds: updated };
}

/* ------------------ Setup helpers ------------------ */

/**
 * Roda uma única vez. Cria a planilha do zero no Drive,
 * salva o ID em Script Properties e inicializa as abas/cabeçalhos.
 * Retorna logs com o ID e a URL — confira no painel de execução.
 */
function setupDatabase() {
  const props = PropertiesService.getScriptProperties();
  let id = props.getProperty('SPREADSHEET_ID');
  let ss;

  if (id) {
    try {
      ss = SpreadsheetApp.openById(id);
      Logger.log('Já existe SPREADSHEET_ID configurado: ' + id);
    } catch (e) {
      Logger.log('SPREADSHEET_ID inválido, criando nova planilha.');
      id = null;
    }
  }

  if (!id) {
    ss = SpreadsheetApp.create('DeAgro Fundraising DB');
    id = ss.getId();
    props.setProperty('SPREADSHEET_ID', id);
    // Remove a aba "Sheet1"/"Página1" criada por padrão depois que initDatabase tiver criado as nossas
  }

  const initResult = Database.init();

  // Limpa a aba default vazia, se ainda existir
  const defaults = ['Sheet1', 'Página1', 'Sheet 1'];
  defaults.forEach(name => {
    const sh = ss.getSheetByName(name);
    if (sh && ss.getSheets().length > 1) ss.deleteSheet(sh);
  });

  const url = ss.getUrl();
  Logger.log('✓ Planilha pronta');
  Logger.log('   ID:  ' + id);
  Logger.log('   URL: ' + url);
  Logger.log('   Abas criadas: ' + initResult.sheets.join(', '));

  return { ok: true, spreadsheet_id: id, url, sheets: initResult.sheets };
}

/** Configura o ID manualmente (caso queira apontar para uma planilha existente). */
function setSpreadsheetId(id) {
  PropertiesService.getScriptProperties().setProperty('SPREADSHEET_ID', id);
}

/** Roda manualmente para (re)criar as abas/cabeçalhos numa planilha já configurada. */
function initDatabase() {
  return Database.init();
}
