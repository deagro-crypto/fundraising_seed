/**
 * DeAgro Fundraising CRM — Camada de acesso à planilha
 *
 * Cada aba da planilha funciona como uma "tabela". As colunas estão
 * declaradas no array SCHEMA — para adicionar campo basta incluir aqui
 * e (se a aba já existir) rodar Database.init() de novo para criar a coluna.
 *
 * IDs são UUIDs gerados via Utilities.getUuid().
 */

const Database = (function () {

  const SCHEMA = {
    Funds: [
      'id', 'name', 'website', 'tier',
      'focus_impacto', 'focus_tech', 'focus_blockchain', 'focus_crypto',
      'latam', 'location', 'work_format',
      'status', 'proposed_ticket', 'committed_ticket',
      'thesis', 'notes', 'owner',
      'created_at', 'updated_at',
    ],
    Rounds: [
      'id', 'name', 'target', 'currency', 'status',
      'opened_at', 'closed_at', 'notes',
      'created_at', 'updated_at',
    ],
    Notes: [
      'id', 'fund_id', 'author_email', 'author_role', 'body', 'created_at',
    ],
    StatusLog: [
      'id', 'fund_id', 'from_status', 'to_status', 'changed_by', 'changed_at',
    ],
    Enums: [
      'kind', 'value', 'label',
    ],
  };

  const DEFAULT_ENUMS = [
    ['status', 'todo',       'A contatar'],
    ['status', 'contacted',  'Contato feito'],
    ['status', 'waiting',    'Aguardando resposta'],
    ['status', 'diligence',  'Em diligência'],
    ['status', 'interest',   'Interesse'],
    ['status', 'committed',  'Comitado'],
    ['status', 'pass',       'Passou'],
    ['tier',   '1',          'Tier 1'],
    ['tier',   '2',          'Tier 2'],
    ['tier',   '3',          'Tier 3'],
    ['focus',  'Impacto',    'Impacto'],
    ['focus',  'Tech',       'Tech'],
    ['focus',  'Blockchain', 'Blockchain'],
    ['focus',  'Crypto',     'Crypto'],
  ];

  /* ---------------- Sheet utilities ---------------- */

  function ss_() {
    const id = PropertiesService.getScriptProperties().getProperty('SPREADSHEET_ID');
    if (!id) throw new Error('SPREADSHEET_ID não configurado. Rode setSpreadsheetId("<id>") primeiro.');
    return SpreadsheetApp.openById(id);
  }

  function sheet_(name) {
    const s = ss_().getSheetByName(name);
    if (!s) throw new Error('Aba inexistente: ' + name + '. Rode initDatabase().');
    return s;
  }

  function ensureSheet_(name, headers) {
    const ss = ss_();
    let sh = ss.getSheetByName(name);
    if (!sh) sh = ss.insertSheet(name);
    const range = sh.getRange(1, 1, 1, headers.length);
    const current = sh.getLastColumn() ? sh.getRange(1, 1, 1, sh.getLastColumn()).getValues()[0] : [];
    const needWrite = headers.some((h, i) => current[i] !== h) || current.length !== headers.length;
    if (needWrite) {
      sh.clear();
      range.setValues([headers]).setFontWeight('bold').setBackground('#3A5A40').setFontColor('#FFFFFF');
      sh.setFrozenRows(1);
    }
    return sh;
  }

  function rowsToObjects_(sh) {
    const lastRow = sh.getLastRow();
    const lastCol = sh.getLastColumn();
    if (lastRow < 2) return { headers: sh.getRange(1, 1, 1, lastCol).getValues()[0], rows: [] };
    const values = sh.getRange(1, 1, lastRow, lastCol).getValues();
    const headers = values.shift();
    const rows = values.map((r, i) => {
      const o = { _row: i + 2 };
      headers.forEach((h, c) => o[h] = r[c]);
      return o;
    });
    return { headers, rows };
  }

  function findRowIndex_(sh, id) {
    const { rows } = rowsToObjects_(sh);
    const found = rows.find(r => r.id === id);
    if (!found) throw new Error('id não encontrado: ' + id);
    return { row: found._row, obj: found };
  }

  function writeObject_(sh, headers, obj) {
    const row = headers.map(h => obj[h] === undefined ? '' : obj[h]);
    sh.appendRow(row);
  }

  function updateObject_(sh, rowIndex, headers, patch) {
    const current = sh.getRange(rowIndex, 1, 1, headers.length).getValues()[0];
    headers.forEach((h, i) => {
      if (patch[h] !== undefined) current[i] = patch[h];
    });
    sh.getRange(rowIndex, 1, 1, headers.length).setValues([current]);
  }

  function now_() { return new Date().toISOString(); }
  function uid_() { return Utilities.getUuid(); }
  function bool_(v) { return v === true || v === 'true' || v === 1 || v === '1' || v === 'x' || v === 'X'; }

  /* ---------------- Serialização de Funds ---------------- */

  function toFundRow_(f) {
    const focus = Array.isArray(f.focus) ? f.focus : [];
    return {
      id: f.id,
      name: f.name || '',
      website: f.website || '',
      tier: Number(f.tier) || 0,
      focus_impacto:    focus.indexOf('Impacto') >= 0,
      focus_tech:       focus.indexOf('Tech') >= 0,
      focus_blockchain: focus.indexOf('Blockchain') >= 0,
      focus_crypto:     focus.indexOf('Crypto') >= 0,
      latam: !!f.latam,
      location: f.location || '',
      work_format: f.work_format || '',
      status: f.status || 'todo',
      proposed_ticket: Number(f.proposed_ticket) || 0,
      committed_ticket: Number(f.committed_ticket) || 0,
      thesis: f.thesis || '',
      notes: f.notes || '',
      owner: f.owner || '',
      created_at: f.created_at || now_(),
      updated_at: now_(),
    };
  }

  function fromFundRow_(r) {
    const focus = [];
    if (bool_(r.focus_impacto))    focus.push('Impacto');
    if (bool_(r.focus_tech))       focus.push('Tech');
    if (bool_(r.focus_blockchain)) focus.push('Blockchain');
    if (bool_(r.focus_crypto))     focus.push('Crypto');
    return {
      id: r.id,
      name: r.name,
      website: r.website,
      tier: Number(r.tier) || 0,
      focus,
      latam: bool_(r.latam),
      location: r.location,
      work_format: r.work_format,
      status: r.status,
      proposed_ticket: Number(r.proposed_ticket) || 0,
      committed_ticket: Number(r.committed_ticket) || 0,
      thesis: r.thesis,
      notes: r.notes,
      owner: r.owner,
      created_at: r.created_at,
      updated_at: r.updated_at,
    };
  }

  /* ---------------- Repos ---------------- */

  const Funds = {
    list() {
      const sh = sheet_('Funds');
      return rowsToObjects_(sh).rows.map(fromFundRow_);
    },
    get(id) {
      const { obj } = findRowIndex_(sheet_('Funds'), id);
      return fromFundRow_(obj);
    },
    create(payload, user) {
      const sh = sheet_('Funds');
      const fund = toFundRow_({ ...payload, id: uid_(), created_at: now_(), owner: payload.owner || user });
      writeObject_(sh, SCHEMA.Funds, fund);
      StatusLog.add(fund.id, '', fund.status, user);
      return fromFundRow_(fund);
    },
    update(id, patch, user) {
      const sh = sheet_('Funds');
      const { row, obj } = findRowIndex_(sh, id);
      const before = fromFundRow_(obj);
      const merged = toFundRow_({ ...before, ...patch, id, created_at: obj.created_at });
      updateObject_(sh, row, SCHEMA.Funds, merged);
      if (patch.status && patch.status !== before.status) {
        StatusLog.add(id, before.status, patch.status, user);
      }
      return fromFundRow_(merged);
    },
    remove(id) {
      const sh = sheet_('Funds');
      const { row } = findRowIndex_(sh, id);
      sh.deleteRow(row);
      return { id, deleted: true };
    },
  };

  const Rounds = {
    list() {
      return rowsToObjects_(sheet_('Rounds')).rows.map(r => ({
        id: r.id, name: r.name,
        target: Number(r.target) || 0,
        currency: r.currency || 'USD',
        status: r.status || 'open',
        opened_at: r.opened_at, closed_at: r.closed_at,
        notes: r.notes,
        created_at: r.created_at, updated_at: r.updated_at,
      }));
    },
    get(id) {
      const { obj } = findRowIndex_(sheet_('Rounds'), id);
      return {
        id: obj.id, name: obj.name,
        target: Number(obj.target) || 0,
        currency: obj.currency || 'USD',
        status: obj.status || 'open',
        opened_at: obj.opened_at, closed_at: obj.closed_at,
        notes: obj.notes,
      };
    },
    create(payload) {
      const sh = sheet_('Rounds');
      const r = {
        id: uid_(),
        name: payload.name || '',
        target: Number(payload.target) || 0,
        currency: payload.currency || 'USD',
        status: payload.status || 'open',
        opened_at: payload.opened_at || new Date().toISOString().slice(0,10),
        closed_at: payload.closed_at || '',
        notes: payload.notes || '',
        created_at: now_(),
        updated_at: now_(),
      };
      writeObject_(sh, SCHEMA.Rounds, r);
      return r;
    },
    update(id, patch) {
      const sh = sheet_('Rounds');
      const { row, obj } = findRowIndex_(sh, id);
      const merged = { ...obj, ...patch, id, updated_at: now_() };
      updateObject_(sh, row, SCHEMA.Rounds, merged);
      return merged;
    },
  };

  const Notes = {
    listByFund(fundId) {
      return rowsToObjects_(sheet_('Notes')).rows
        .filter(r => r.fund_id === fundId)
        .sort((a, b) => String(a.created_at).localeCompare(String(b.created_at)));
    },
    add(fundId, body, user) {
      const sh = sheet_('Notes');
      const note = {
        id: uid_(),
        fund_id: fundId,
        author_email: user || '',
        author_role: roleOf_(user),
        body: body || '',
        created_at: now_(),
      };
      writeObject_(sh, SCHEMA.Notes, note);
      return note;
    },
  };

  const StatusLog = {
    listByFund(fundId) {
      return rowsToObjects_(sheet_('StatusLog')).rows
        .filter(r => r.fund_id === fundId)
        .sort((a, b) => String(a.changed_at).localeCompare(String(b.changed_at)));
    },
    add(fundId, from, to, user) {
      const sh = sheet_('StatusLog');
      const entry = {
        id: uid_(),
        fund_id: fundId,
        from_status: from || '',
        to_status: to || '',
        changed_by: user || '',
        changed_at: now_(),
      };
      writeObject_(sh, SCHEMA.StatusLog, entry);
      return entry;
    },
  };

  function roleOf_(email) {
    if (!email) return '';
    const advisors = (PropertiesService.getScriptProperties().getProperty('ADVISOR_EMAILS') || '')
      .split(',').map(s => s.trim().toLowerCase()).filter(Boolean);
    return advisors.indexOf(String(email).toLowerCase()) >= 0 ? 'advisor' : 'deagro';
  }

  /* ---------------- Init ---------------- */

  function init() {
    Object.keys(SCHEMA).forEach(name => ensureSheet_(name, SCHEMA[name]));
    const enums = sheet_('Enums');
    if (enums.getLastRow() < 2) {
      enums.getRange(2, 1, DEFAULT_ENUMS.length, 3).setValues(DEFAULT_ENUMS);
    }
    return { ok: true, sheets: Object.keys(SCHEMA) };
  }

  return { Funds, Rounds, Notes, StatusLog, init, SCHEMA };
})();
