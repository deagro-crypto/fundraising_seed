/* DeAgro Fundraising CRM — mock client.
   Camada `api` é stub em memória; trocar por fetch('<webapp>/exec?action=...')
   quando o Apps Script estiver no ar. */

const STATUSES = [
  { id: 'todo',       label: 'A contatar',        cls: 'status-todo' },
  { id: 'contacted',  label: 'Contato feito',     cls: 'status-contacted' },
  { id: 'waiting',    label: 'Aguardando resposta', cls: 'status-waiting' },
  { id: 'diligence',  label: 'Em diligência',     cls: 'status-diligence' },
  { id: 'interest',   label: 'Interesse',         cls: 'status-interest' },
  { id: 'committed',  label: 'Comitado',          cls: 'status-committed' },
  { id: 'pass',       label: 'Passou',            cls: 'status-pass' },
];

/* ---------- Seed data (extraído do Excel Base) ---------- */
const seedFunds = [
  // Tier 1
  ['Accion Venture Lab','https://accion.org/venturelab',1,['Impacto','Tech'],true,'impacto financeiro inclusivo + fintech / web3'],
  ['Quona Capital','https://quona.com',1,['Impacto','Tech','Blockchain'],true,'fintech inclusiva (infra próxima de blockchain)'],
  ['IGNIA','https://ignia.com.mx',1,['Impacto','Tech'],true,'impacto + tech, forte em LATAM'],
  ['Mercy Corps Ventures','https://mercycorps.org/ventures',1,['Impacto','Tech','Blockchain'],true,'investe em blockchain para inclusão, agro com tokenização de grãos, foco em clima'],
  ['Bamboo Capital Partners','https://bamboocp.com',1,['Impacto'],true,'energia e inclusão financeira — forte em agro'],
  ['Vox Capital','https://voxcapital.com.br',1,['Impacto','Tech'],true,'um dos principais fundos de impacto do Brasil'],
  ['Positive Ventures','https://positive.vc',1,['Impacto','Tech'],true,'impacto + tech emergente — preferência por rodadas seed'],
  ['EcoEnterprises Fund','https://ecoenterprisesfund.com',1,['Impacto'],true,'clima e bioeconomia LATAM'],
  ['Regen Network','https://regen.network',1,['Impacto','Tech','Blockchain'],false,'blockchain + agro'],
  ['Toucan Protocol','https://toucan.earth',1,['Impacto','Tech','Blockchain'],false,'tokenização de créditos de carbono'],
  ['Celo Foundation','https://celo.org',1,['Impacto','Tech'],true,'forte em impacto + LATAM + inclusão financeira'],
  ['Multicoin Capital','https://multicoin.capital',1,['Impacto','Tech','Blockchain','Crypto'],false,'state-free money e open finance'],
  // Tier 2
  ['Potencia Ventures','',2,['Impacto','Tech'],true,'impacto social + tech'],
  ['Village Capital','https://vilcap.com',2,['Impacto','Tech'],true,'impacto + inovação — com blockchain'],
  ['LGT Venture Philanthropy','https://lgtvp.com',2,['Impacto'],true,'forte em clima e food systems'],
  ['MOV Investimentos','https://movinvest.com.br',2,['Impacto','Tech'],true,'ESG e impacto'],
  ['Kaeté Investimentos','',2,['Impacto'],true,'negócios sustentáveis'],
  ['Angel Ventures','https://angelventures.vc',2,['Tech'],true,'early-stage LATAM'],
  ['Bossanova Investimentos','https://bossanovainvest.com',2,['Tech'],true,'early-stage LATAM'],
  ['Infinite Capital','',2,['Tech','Blockchain'],true,'blockchain + deeptech com atuação LATAM'],
  ['Acumen Fund','https://acumen.org',2,['Impacto','Tech'],true,'agricultura e energia com inclusão'],
  ['Root Capital','https://rootcapital.org',2,['Impacto','Tech'],true,'financiamento agrícola — explorando digitalização'],
  ['Delphi Ventures','https://delphidigital.io',2,['Tech','Blockchain','Crypto'],false,'projetos que avançam um futuro descentralizado'],
  ['A16Z','https://a16z.com',2,['Tech','Blockchain','Crypto'],false,'crypto e web3 — todas as fases'],
  ['Archetype','https://archetype.fund',2,['Impacto','Tech','Blockchain','Crypto'],false,'early-stage crypto'],
  ['Placeholder VC','https://placeholder.vc',2,['Tech','Blockchain','Crypto'],false,'open-source, decentralized networks'],
  ['Paradigm','https://paradigm.xyz',2,['Tech','Blockchain'],false,'research-driven, open blockchain tech'],
  // Tier 3
  ['Omidyar Network','https://omidyar.com',3,['Impacto','Tech','Crypto'],true,'impacto sistêmico + govtech + crypto'],
  ['Elevar Equity','https://elevarequity.com',3,['Impacto','Tech'],true,'inclusão econômica'],
  ['Rayo Capital','',3,['Tech'],true,'foco em web3 LATAM'],
  ['Pantera Capital','https://panteracapital.com',3,['Tech','Crypto'],false,'um dos maiores fundos cripto do mundo'],
  ['Blockchain Capital','https://blockchain.capital',3,['Tech','Blockchain','Crypto'],false,'pioneiro em blockchain — focado em crypto'],
  ['Digital Currency Group','https://dcg.co',3,['Tech'],true,'grande investidor global com atuação LATAM'],
  ['Coinbase Ventures','https://coinbase.com/ventures',3,['Tech','Crypto'],false,'startups Latam — foco em crypto'],
  ['Animoca Brands','https://animocabrands.com',3,['Tech'],false,'gaming + web3 global'],
  ['1kx','https://1kx.network',3,['Tech','Blockchain','Crypto'],false,'token networks com community ownership'],
  ['Framework Ventures','https://framework.ventures',3,['Tech','Blockchain'],false,'DeFi, gaming, AI e blockchain infra'],
  ['CoinFund','https://coinfund.io',3,['Tech','Blockchain','Crypto'],false,'on-chain financial products'],
  ['Electric Capital','https://electriccapital.com',3,['Tech','Crypto'],false,'crypto networks'],
  ['Variant Fund','https://variant.fund',3,['Tech','Blockchain','Crypto'],false,'user-owned web'],
];

const uid = () => Math.random().toString(36).slice(2, 10);
const seedStatus = ['todo','todo','contacted','waiting','diligence','interest'];

let state = {
  funds: seedFunds.map((r, i) => ({
    id: uid(),
    name: r[0], website: r[1], tier: r[2],
    focus: r[3], latam: r[4], thesis: r[5], notes: '',
    location: '', work_format: '',
    status: seedStatus[i % seedStatus.length],
    proposed_ticket: [250000, 500000, 1000000, 150000][i % 4],
    committed_ticket: (i % 7 === 0) ? 250000 : 0,
  })),
  rounds: [
    { id: uid(), name: 'Seed 2026', target: 4000000, status: 'open', opened_at: '2026-01-15' },
  ],
  activeRoundId: null,
  filters: { tier: 'all', q: '', focus: '', latam: '', status: '' },
};
state.activeRoundId = state.rounds[0].id;

/* ---------- "API" mock (substituir por fetch ao Apps Script) ---------- */
const api = {
  listFunds: () => Promise.resolve(state.funds),
  saveFund: (f) => {
    if (f.id) {
      const i = state.funds.findIndex(x => x.id === f.id);
      state.funds[i] = { ...state.funds[i], ...f };
    } else { state.funds.push({ ...f, id: uid() }); }
    return Promise.resolve();
  },
  deleteFund: (id) => { state.funds = state.funds.filter(f => f.id !== id); return Promise.resolve(); },
  listRounds: () => Promise.resolve(state.rounds),
  saveRound: (r) => {
    if (r.id) { const i = state.rounds.findIndex(x => x.id === r.id); state.rounds[i] = { ...state.rounds[i], ...r }; }
    else { state.rounds.push({ ...r, id: uid(), opened_at: new Date().toISOString().slice(0,10) }); }
    return Promise.resolve();
  },
};

/* ---------- Helpers ---------- */
const fmt = (n) => n ? 'US$ ' + Number(n).toLocaleString('en-US') : 'US$ 0';
const $ = (s, el = document) => el.querySelector(s);
const $$ = (s, el = document) => [...el.querySelectorAll(s)];
const statusOf = (id) => STATUSES.find(s => s.id === id) || STATUSES[0];

function populateStatusSelect(sel, includeAll) {
  sel.innerHTML = '';
  if (includeAll) sel.innerHTML = '<option value="">Status (todos)</option>';
  STATUSES.forEach(s => {
    const o = document.createElement('option');
    o.value = s.id; o.textContent = s.label; sel.appendChild(o);
  });
}

/* ---------- Views ---------- */
function switchView(name) {
  $$('.view').forEach(v => v.classList.add('hidden'));
  $('#view-' + name).classList.remove('hidden');
  $$('.nav-link').forEach(a => a.classList.toggle('active', a.dataset.view === name));
  if (name === 'dashboard') renderDashboard();
  if (name === 'funds') renderFunds();
  if (name === 'rounds') renderRounds();
}

/* ---------- Dashboard ---------- */
function renderDashboard() {
  const round = state.rounds.find(r => r.id === state.activeRoundId) || state.rounds[0];
  if (!round) return;
  $('#round-name').textContent = round.name;
  const committed = state.funds.reduce((s, f) => s + (Number(f.committed_ticket) || 0), 0);
  const pipeline = state.funds
    .filter(f => ['diligence','interest'].includes(f.status))
    .reduce((s, f) => s + (Number(f.proposed_ticket) || 0), 0);
  $('#round-target').textContent = fmt(round.target);
  $('#round-committed').textContent = fmt(committed);
  $('#round-pipeline').textContent = fmt(pipeline);
  const pct = round.target ? Math.min(100, (committed / round.target) * 100) : 0;
  $('#round-pct').textContent = pct.toFixed(1) + '%';
  $('#round-bar').style.width = pct + '%';

  // tier split
  const byTier = [1,2,3].map(t => ({
    t,
    n: state.funds.filter(f => f.tier === t).length,
    cm: state.funds.filter(f => f.tier === t).reduce((s,f)=>s+(+f.committed_ticket||0),0),
  }));
  $('#tier-split').innerHTML = byTier.map(b =>
    `<div class="ts">Tier ${b.t}: <b>${b.n}</b> fundos · <b>${fmt(b.cm)}</b> comitado</div>`
  ).join('');

  // pipeline cards
  const active = state.funds.filter(f => !['pass','todo'].includes(f.status));
  $('#pipeline').innerHTML = active.length ? active.map(f => `
    <div class="pl-card tier-${f.tier}">
      <h4>${escapeHtml(f.name)}</h4>
      <div class="sm">${statusOf(f.status).label} · Tier ${f.tier}</div>
      <div class="sm">Proposto: <b>${fmt(f.proposed_ticket)}</b>${f.committed_ticket ? ` · Comitado: <b>${fmt(f.committed_ticket)}</b>` : ''}</div>
    </div>`).join('') : '<div class="empty">Nenhum fundo ativo no pipeline.</div>';
}

/* ---------- Funds table ---------- */
function renderFunds() {
  const { tier, q, focus, latam, status } = state.filters;
  const ql = q.trim().toLowerCase();
  const rows = state.funds.filter(f => {
    if (tier !== 'all' && f.tier !== Number(tier)) return false;
    if (focus && !f.focus.includes(focus)) return false;
    if (latam === 'yes' && !f.latam) return false;
    if (latam === 'no' && f.latam) return false;
    if (status && f.status !== status) return false;
    if (ql && !(f.name.toLowerCase().includes(ql) || (f.thesis||'').toLowerCase().includes(ql))) return false;
    return true;
  });

  $('#empty-state').classList.toggle('hidden', rows.length > 0);
  $('#funds-tbody').innerHTML = rows.map(f => {
    const st = statusOf(f.status);
    const focusChips = f.focus.map(x => `<span class="chip focus-${x}">${x}</span>`).join('');
    const site = f.website ? `<a href="${f.website}" target="_blank" rel="noopener">↗</a>` : '';
    return `
      <tr>
        <td><b>${escapeHtml(f.name)}</b> ${site}<div class="sm muted">${escapeHtml(f.location||'')}</div></td>
        <td><span class="chip tier-${f.tier}">T${f.tier}</span></td>
        <td>${focusChips}</td>
        <td>${f.latam ? '<span class="chip latam">LATAM</span>' : ''}</td>
        <td><span class="status-pill ${st.cls}">${st.label}</span></td>
        <td class="right">${fmt(f.proposed_ticket)}</td>
        <td class="right">${fmt(f.committed_ticket)}</td>
        <td class="sm muted">${escapeHtml(f.thesis || '')}</td>
        <td class="row-actions"><button class="link-btn" data-edit="${f.id}">editar</button></td>
      </tr>`;
  }).join('');

  $$('#funds-tbody [data-edit]').forEach(b => b.addEventListener('click', () => openFundModal(b.dataset.edit)));
}

/* ---------- Rounds ---------- */
function renderRounds() {
  $('#rounds-tbody').innerHTML = state.rounds.map(r => {
    const committed = state.funds.reduce((s, f) => s + (+f.committed_ticket || 0), 0);
    return `<tr>
      <td><b>${escapeHtml(r.name)}</b></td>
      <td>${fmt(r.target)}</td>
      <td>${fmt(committed)}</td>
      <td>${r.status === 'open' ? '<span class="status-pill status-diligence">Aberta</span>' : '<span class="status-pill status-todo">Fechada</span>'}</td>
      <td>${r.opened_at || ''}</td>
      <td class="row-actions"><button class="link-btn" data-edit-round="${r.id}">editar</button></td>
    </tr>`;
  }).join('');
  $$('#rounds-tbody [data-edit-round]').forEach(b => b.addEventListener('click', () => openRoundModal(b.dataset.editRound)));
}

/* ---------- Fund modal ---------- */
function openFundModal(id) {
  const form = $('#fund-form');
  form.reset();
  const editing = id ? state.funds.find(f => f.id === id) : null;
  $('#fund-modal-title').textContent = editing ? 'Editar fundo' : 'Novo fundo';
  $('#delete-fund-btn').classList.toggle('hidden', !editing);

  if (editing) {
    form.id.value = editing.id;
    form.name.value = editing.name;
    form.website.value = editing.website || '';
    form.tier.value = editing.tier;
    form.location.value = editing.location || '';
    form.work_format.value = editing.work_format || '';
    form.status.value = editing.status;
    form.proposed_ticket.value = editing.proposed_ticket || '';
    form.committed_ticket.value = editing.committed_ticket || '';
    form.thesis.value = editing.thesis || '';
    form.notes.value = editing.notes || '';
    $$('#fund-form input[name=focus]').forEach(c => c.checked = editing.focus.includes(c.value));
    form.latam.checked = !!editing.latam;
  }
  $('#fund-modal').classList.remove('hidden');
}

function closeModals() {
  $$('.modal').forEach(m => m.classList.add('hidden'));
}

async function submitFund(e) {
  e.preventDefault();
  const form = e.target;
  const fd = new FormData(form);
  const focus = $$('#fund-form input[name=focus]:checked').map(c => c.value);
  const payload = {
    id: fd.get('id') || null,
    name: fd.get('name').trim(),
    website: fd.get('website').trim(),
    tier: Number(fd.get('tier')),
    location: fd.get('location').trim(),
    work_format: fd.get('work_format'),
    status: fd.get('status'),
    proposed_ticket: Number(fd.get('proposed_ticket') || 0),
    committed_ticket: Number(fd.get('committed_ticket') || 0),
    thesis: fd.get('thesis').trim(),
    notes: fd.get('notes').trim(),
    focus,
    latam: form.latam.checked,
  };
  await api.saveFund(payload);
  closeModals();
  renderFunds();
  renderDashboard();
}

async function deleteFund() {
  const id = $('#fund-form').id.value;
  if (!id) return;
  if (!confirm('Excluir este fundo?')) return;
  await api.deleteFund(id);
  closeModals();
  renderFunds();
  renderDashboard();
}

/* ---------- Round modal ---------- */
function openRoundModal(id) {
  const form = $('#round-form'); form.reset();
  const editing = id ? state.rounds.find(r => r.id === id) : null;
  $('#round-modal-title').textContent = editing ? 'Editar rodada' : 'Nova rodada';
  if (editing) {
    form.id.value = editing.id;
    form.name.value = editing.name;
    form.target.value = editing.target;
    form.status.value = editing.status;
  }
  $('#round-modal').classList.remove('hidden');
}

async function submitRound(e) {
  e.preventDefault();
  const fd = new FormData(e.target);
  await api.saveRound({
    id: fd.get('id') || null,
    name: fd.get('name').trim(),
    target: Number(fd.get('target')),
    status: fd.get('status'),
  });
  closeModals();
  renderRounds(); renderDashboard();
}

function escapeHtml(s){return String(s||'').replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]))}

/* ---------- Wire up ---------- */
function init() {
  populateStatusSelect($('#fund-form select[name=status]'), false);
  populateStatusSelect($('#filter-status'), true);

  $$('.nav-link').forEach(a => a.addEventListener('click', e => {
    e.preventDefault(); switchView(a.dataset.view);
  }));

  $$('#tier-tabs .tab').forEach(t => t.addEventListener('click', () => {
    $$('#tier-tabs .tab').forEach(x => x.classList.remove('active'));
    t.classList.add('active');
    state.filters.tier = t.dataset.tier;
    renderFunds();
  }));

  $('#filter-q').addEventListener('input', e => { state.filters.q = e.target.value; renderFunds(); });
  $('#filter-focus').addEventListener('change', e => { state.filters.focus = e.target.value; renderFunds(); });
  $('#filter-latam').addEventListener('change', e => { state.filters.latam = e.target.value; renderFunds(); });
  $('#filter-status').addEventListener('change', e => { state.filters.status = e.target.value; renderFunds(); });
  $('#clear-filters').addEventListener('click', () => {
    state.filters = { tier: 'all', q: '', focus: '', latam: '', status: '' };
    $('#filter-q').value = ''; $('#filter-focus').value = '';
    $('#filter-latam').value = ''; $('#filter-status').value = '';
    $$('#tier-tabs .tab').forEach(x => x.classList.toggle('active', x.dataset.tier === 'all'));
    renderFunds();
  });

  $('#new-fund-btn').addEventListener('click', () => openFundModal(null));
  $('#fund-form').addEventListener('submit', submitFund);
  $('#delete-fund-btn').addEventListener('click', deleteFund);

  $('#new-round-btn').addEventListener('click', () => openRoundModal(null));
  $('#edit-round-btn').addEventListener('click', () => openRoundModal(state.activeRoundId));
  $('#round-form').addEventListener('submit', submitRound);

  $$('[data-close]').forEach(el => el.addEventListener('click', closeModals));
  document.addEventListener('keydown', e => { if (e.key === 'Escape') closeModals(); });

  switchView('dashboard');
}

init();
