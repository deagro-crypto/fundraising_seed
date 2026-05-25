/* DeAgro Fundraising CRM — mock client (in-memory).
   A camada `api` será trocada por chamadas ao Apps Script Web App. */

const STATUSES = [
  { id: 'todo',        label: 'A contatar',         cls: 'status-todo' },
  { id: 'contacted',   label: 'Contato feito',      cls: 'status-contacted' },
  { id: 'waiting',     label: 'Aguardando resposta',cls: 'status-waiting' },
  { id: 'interest',    label: 'Interesse',          cls: 'status-interest' },
  { id: 'discarded',   label: 'Descartado',         cls: 'status-discarded' },
  { id: 'negotiation', label: 'Em negociação',      cls: 'status-negotiation' },
  { id: 'committed',   label: 'Comitado',           cls: 'status-committed' },
  { id: 'closed',      label: 'Fechado',            cls: 'status-closed' },
  { id: 'stalled',     label: 'Não evoluiu',        cls: 'status-stalled' },
];

const FUNNEL_ORDER = ['todo','contacted','waiting','interest','negotiation','committed','closed'];
const NEGATIVE = new Set(['discarded','stalled']);

const FOCUS_COLORS = {
  Impacto: '#1f4d2a', Tech: '#005577', Blockchain: '#4a2e8c', Crypto: '#8a4b00',
};

/* ---------- Seed data (Excel Base) ---------- */
const seedFunds = [
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
const seedStatusCycle = ['todo','todo','contacted','waiting','negotiation','interest','discarded','stalled'];

let state = {
  funds: seedFunds.map((r, i) => ({
    id: uid(),
    name: r[0], website: r[1], tier: r[2],
    focus: r[3], latam: r[4], thesis: r[5],
    notes_deagro: '', notes_advisor: '',
    location: '', work_format: '',
    status: seedStatusCycle[i % seedStatusCycle.length],
    proposed_ticket: [250000, 500000, 1000000, 150000][i % 4],
    committed_ticket: (i % 9 === 0) ? 250000 : 0,
  })),
  rounds: [
    {
      id: uid(), name: 'Seed 2026', target: 4000000, status: 'open',
      opened_at: '2026-01-15',
      estrategia: 'Captar com fundos de impacto + tech LATAM como âncoras, depois abrir cheques menores com fundos cripto globais para diversificar a base.',
      documento: ['SAFE','SAFT'],
      equity_esperado: 15,
    },
  ],
  activeRoundId: null,
  detailRoundId: null,
  filters: { tier: 'all', q: '', focus: '', latam: '', status: '' },
  sort: { key: null, dir: 'asc' },
  page: 1,
  pageSize: 20,
};
state.activeRoundId = state.rounds[0].id;

/* ---------- "API" mock ---------- */
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
const escapeHtml = (s) => String(s||'').replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]));
const activeRound = () => state.rounds.find(r => r.id === state.activeRoundId) || state.rounds[0];

function populateStatusSelect(sel, includeAll) {
  sel.innerHTML = includeAll ? '<option value="">Status (todos)</option>' : '';
  STATUSES.forEach(s => {
    const o = document.createElement('option');
    o.value = s.id; o.textContent = s.label; sel.appendChild(o);
  });
}

/* ---------- View switching ---------- */
function switchView(name) {
  $$('.view').forEach(v => v.classList.add('hidden'));
  $('#view-' + name).classList.remove('hidden');
  const navName = (name === 'round-detail') ? 'rounds' : name;
  $$('.nav-link').forEach(a => a.classList.toggle('active', a.dataset.view === navName));
  if (name === 'dashboard') renderDashboard();
  if (name === 'funds') renderFunds();
  if (name === 'rounds') renderRounds();
  if (name === 'round-detail') renderRoundDetail();
}

/* ===================== DASHBOARD ===================== */
function renderDashboard() {
  const round = activeRound();
  if (!round) return;
  $('#dash-round-name').textContent = round.name;
  $('#dash-round-meta').textContent = `Aberta em ${round.opened_at || '—'} · ${round.status === 'open' ? 'Aberta' : 'Fechada'}`;

  const committed = state.funds.reduce((s, f) => s + (+f.committed_ticket || 0), 0);
  const pipelineFunds = state.funds.filter(f => f.status === 'negotiation');
  const pipeline = pipelineFunds.reduce((s, f) => s + (+f.proposed_ticket || 0), 0);
  const pct = round.target ? Math.min(100, committed / round.target * 100) : 0;
  const universe = state.funds.length;
  const active = state.funds.filter(f => !NEGATIVE.has(f.status) && f.status !== 'closed').length;

  $('#kpi-target').textContent = fmt(round.target);
  $('#kpi-committed').textContent = fmt(committed);
  $('#kpi-bar').style.width = pct + '%';
  $('#kpi-pct').textContent = pct.toFixed(1) + '% do target';
  $('#kpi-pipeline').textContent = fmt(pipeline);
  $('#kpi-pipeline-n').textContent = pipelineFunds.length + ' fundos';
  $('#kpi-universe').textContent = universe;
  $('#kpi-active').textContent = active + ' ativos no funil';

  renderFunnel();
  renderPie();
  renderFocusBars();
}

function renderFunnel() {
  const counts = {};
  STATUSES.forEach(s => counts[s.id] = state.funds.filter(f => f.status === s.id).length);

  // Funil: largura decrescente de 100% a ~36%, valores dentro
  const positives = FUNNEL_ORDER.map(id => ({ id, ...statusOf(id), n: counts[id] || 0 }));
  const N = positives.length;
  $('#funnel-shape').innerHTML = positives.map((r, i) => {
    const w = 100 - i * ((100 - 38) / (N - 1));
    return `<div class="funnel-band" style="width:${w}%">
      <span class="lbl">${escapeHtml(r.label)}</span>
      <span class="n">${r.n}</span>
    </div>`;
  }).join('');

  // Itens negativos do lado, menores e em vermelho
  const negatives = ['discarded','stalled'].map(id => ({ ...statusOf(id), n: counts[id] || 0 }));
  $('#funnel-side').innerHTML = `<div class="funnel-side__title">Saídas do funil</div>` +
    negatives.map(r => `<div class="fs-row"><span>${escapeHtml(r.label)}</span><span class="n">${r.n}</span></div>`).join('');
}

function renderPie() {
  const counts = [1,2,3].map(t => state.funds.filter(f => f.tier === t).length);
  const total = counts.reduce((a,b) => a+b, 0) || 1;
  const colors = ['#DAA520','#588157','#CED4DA'];
  const labels = ['Tier 1','Tier 2','Tier 3'];
  const svg = $('#pie-tier');
  svg.innerHTML = '';
  let a0 = -Math.PI/2;
  const cx=100, cy=100, r=85;
  counts.forEach((n, i) => {
    if (!n) return;
    const a1 = a0 + (n/total) * Math.PI * 2;
    const large = (a1 - a0) > Math.PI ? 1 : 0;
    const x0 = cx + r*Math.cos(a0), y0 = cy + r*Math.sin(a0);
    const x1 = cx + r*Math.cos(a1), y1 = cy + r*Math.sin(a1);
    const d = `M${cx},${cy} L${x0},${y0} A${r},${r} 0 ${large},1 ${x1},${y1} Z`;
    svg.insertAdjacentHTML('beforeend', `<path d="${d}" fill="${colors[i]}" stroke="#fff" stroke-width="2"/>`);
    a0 = a1;
  });
  // donut hole
  svg.insertAdjacentHTML('beforeend', `<circle cx="${cx}" cy="${cy}" r="42" fill="#fff"/>
    <text x="${cx}" y="${cy-2}" text-anchor="middle" font-size="22" font-weight="700" fill="#344E41">${total}</text>
    <text x="${cx}" y="${cy+16}" text-anchor="middle" font-size="10" fill="#495057">fundos</text>`);

  $('#pie-tier-legend').innerHTML = labels.map((l, i) =>
    `<li><span class="sw" style="background:${colors[i]}"></span>${l} · <b>${counts[i]}</b></li>`
  ).join('');
}

function renderFocusBars() {
  const tags = ['Impacto','Tech','Blockchain','Crypto'];
  const counts = tags.map(t => state.funds.filter(f => f.focus.includes(t)).length);
  const latamN = state.funds.filter(f => f.latam).length;
  const all = [...tags.map((t,i) => [t, counts[i], FOCUS_COLORS[t]]), ['LATAM', latamN, '#B8860B']];
  const max = Math.max(1, ...all.map(r => r[1]));
  $('#focus-bars').innerHTML = all.map(([label, n, color]) =>
    `<div class="bar-row">
      <div>${label}</div>
      <div class="bar-row__bar"><div class="bar-row__fill" style="width:${(n/max)*100}%;background:${color}"></div></div>
      <div class="bar-row__n">${n}</div>
    </div>`).join('');
}

/* ===================== ROUND DETAIL (com Kanban) ===================== */
function renderRoundDetail() {
  const id = state.detailRoundId || state.activeRoundId;
  const round = state.rounds.find(r => r.id === id);
  if (!round) return;
  state.detailRoundId = round.id;

  $('#rd-name').textContent = round.name;
  $('#rd-meta').textContent = `Aberta em ${round.opened_at || '—'} · ${round.status === 'open' ? 'Aberta' : 'Fechada'}`;

  const committed = state.funds.reduce((s, f) => s + (+f.committed_ticket || 0), 0);
  const pipeline = state.funds.filter(f => f.status === 'negotiation').reduce((s,f)=>s+(+f.proposed_ticket||0), 0);
  const pct = round.target ? Math.min(100, committed/round.target*100) : 0;
  $('#rd-target').textContent = fmt(round.target);
  $('#rd-committed').textContent = fmt(committed);
  $('#rd-pipeline').textContent = fmt(pipeline);
  $('#rd-pct').textContent = pct.toFixed(1) + '%';
  $('#rd-bar').style.width = pct + '%';

  const byTier = [1,2,3].map(t => ({
    t,
    n: state.funds.filter(f => f.tier === t).length,
    cm: state.funds.filter(f => f.tier === t).reduce((s,f)=>s+(+f.committed_ticket||0),0),
  }));
  $('#rd-tier-split').innerHTML = byTier.map(b =>
    `<div class="ts">Tier ${b.t}: <b>${b.n}</b> fundos · <b>${fmt(b.cm)}</b> comitado</div>`
  ).join('');

  const docs = Array.isArray(round.documento) ? round.documento : [];
  $('#rd-documento').textContent = docs.length ? docs.join(' + ') : '—';
  $('#rd-equity').textContent = (round.equity_esperado || round.equity_esperado === 0)
    ? Number(round.equity_esperado).toLocaleString('pt-BR') + '%' : '—';
  $('#rd-estrategia').textContent = round.estrategia || '—';

  renderKanban();
}

function renderKanban() {
  const positives = FUNNEL_ORDER.map(id => statusOf(id));
  const negatives = ['discarded','stalled'].map(id => statusOf(id));

  const renderCol = (s, isNeg) => {
    const funds = state.funds.filter(f => f.status === s.id);
    const cards = funds.length
      ? funds.map(f => `
          <div class="k-card tier-${f.tier}" data-edit="${f.id}">
            <div class="k-card__name">${escapeHtml(f.name)}</div>
            <div class="k-card__sub">T${f.tier} · ${fmt(f.proposed_ticket)}</div>
          </div>`).join('')
      : '<div class="k-col__empty">—</div>';
    return `<div class="k-col ${isNeg ? 'is-neg' : ''}">
      <div class="k-col__head"><span>${escapeHtml(s.label)}</span><span class="k-col__count">${funds.length}</span></div>
      <div class="k-col__list">${cards}</div>
    </div>`;
  };

  $('#kanban').innerHTML = `
    <div class="kanban-row positives">${positives.map(s => renderCol(s, false)).join('')}</div>
    <div class="kanban-row negatives">${negatives.map(s => renderCol(s, true)).join('')}</div>`;
  $$('#kanban [data-edit]').forEach(c => c.addEventListener('click', () => openFundModal(c.dataset.edit)));
}

/* ===================== FUNDS TABLE ===================== */
function renderFunds() {
  const { tier, q, focus, latam, status } = state.filters;
  const ql = q.trim().toLowerCase();
  let rows = state.funds.filter(f => {
    if (tier !== 'all' && f.tier !== Number(tier)) return false;
    if (focus && !f.focus.includes(focus)) return false;
    if (latam === 'yes' && !f.latam) return false;
    if (latam === 'no' && f.latam) return false;
    if (status && f.status !== status) return false;
    if (ql && !(f.name.toLowerCase().includes(ql) || (f.thesis||'').toLowerCase().includes(ql))) return false;
    return true;
  });

  // sort
  const { key, dir } = state.sort;
  if (key) {
    const mult = dir === 'asc' ? 1 : -1;
    rows = [...rows].sort((a, b) => {
      const av = a[key], bv = b[key];
      if (typeof av === 'number' && typeof bv === 'number') return (av - bv) * mult;
      return String(av || '').localeCompare(String(bv || ''), 'pt-BR') * mult;
    });
  }

  // pagination
  const total = rows.length;
  const totalPages = Math.max(1, Math.ceil(total / state.pageSize));
  if (state.page > totalPages) state.page = totalPages;
  const start = (state.page - 1) * state.pageSize;
  const pageRows = rows.slice(start, start + state.pageSize);

  $('#empty-state').classList.toggle('hidden', rows.length > 0);
  $('#funds-tbody').innerHTML = pageRows.map(f => {
    const st = statusOf(f.status);
    const focusChips = f.focus.map(x => `<span class="chip focus-${x}">${x}</span>`).join('');
    const site = f.website ? `<a class="site-link" href="${f.website}" target="_blank" rel="noopener" onclick="event.stopPropagation()">↗</a>` : '';
    return `
      <tr data-edit="${f.id}">
        <td><b>${escapeHtml(f.name)}</b>${site}</td>
        <td><span class="chip tier-${f.tier}">T${f.tier}</span></td>
        <td>${focusChips}</td>
        <td>${f.latam ? '<span class="chip latam">LATAM</span>' : ''}</td>
        <td><span class="status-pill ${st.cls}">${st.label}</span></td>
        <td class="right">${fmt(f.proposed_ticket)}</td>
        <td class="right">${fmt(f.committed_ticket)}</td>
        <td class="cell-thesis">${escapeHtml(f.thesis || '')}</td>
      </tr>`;
  }).join('');
  $$('#funds-tbody tr[data-edit]').forEach(r => r.addEventListener('click', () => openFundModal(r.dataset.edit)));

  renderPagination(total, totalPages);
  renderSortIndicators();
}

function renderPagination(total, totalPages) {
  const p = state.page;
  const start = total === 0 ? 0 : (p - 1) * state.pageSize + 1;
  const end = Math.min(total, p * state.pageSize);
  const pages = [];
  for (let i = 1; i <= totalPages; i++) pages.push(i);
  $('#funds-pagination').innerHTML = `
    <div>${total === 0 ? 'Nenhum resultado' : `${start}–${end} de ${total}`}</div>
    <div class="pagination__pages">
      <button data-page="prev" ${p <= 1 ? 'disabled' : ''}>‹</button>
      ${pages.map(i => `<button data-page="${i}" class="${i === p ? 'active' : ''}">${i}</button>`).join('')}
      <button data-page="next" ${p >= totalPages ? 'disabled' : ''}>›</button>
    </div>`;
  $$('#funds-pagination button').forEach(b => b.addEventListener('click', () => {
    const v = b.dataset.page;
    if (v === 'prev') state.page = Math.max(1, state.page - 1);
    else if (v === 'next') state.page = Math.min(totalPages, state.page + 1);
    else state.page = Number(v);
    renderFunds();
  }));
}

function renderSortIndicators() {
  $$('.funds-table th.sortable').forEach(th => {
    th.classList.remove('sort-asc','sort-desc');
    if (th.dataset.sort === state.sort.key) th.classList.add('sort-' + state.sort.dir);
  });
}

/* ===================== ROUNDS LIST ===================== */
function renderRounds() {
  $('#rounds-tbody').innerHTML = state.rounds.map(r => {
    const committed = state.funds.reduce((s, f) => s + (+f.committed_ticket || 0), 0);
    return `<tr data-open="${r.id}">
      <td><b>${escapeHtml(r.name)}</b></td>
      <td class="right">${fmt(r.target)}</td>
      <td class="right">${fmt(committed)}</td>
      <td>${r.status === 'open' ? '<span class="status-pill status-negotiation">Aberta</span>' : '<span class="status-pill status-closed">Fechada</span>'}</td>
      <td>${r.opened_at || ''}</td>
    </tr>`;
  }).join('');
  $$('#rounds-tbody tr[data-open]').forEach(r => r.addEventListener('click', () => {
    state.detailRoundId = r.dataset.open;
    switchView('round-detail');
  }));
}

/* ===================== FUND MODAL ===================== */
function openFundModal(id) {
  const form = $('#fund-form');
  form.reset();
  const editing = id ? state.funds.find(f => f.id === id) : null;
  $('#fund-modal-title').textContent = editing ? editing.name : 'Novo fundo';
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
    form.notes_deagro.value = editing.notes_deagro || '';
    form.notes_advisor.value = editing.notes_advisor || '';
    $$('#fund-form input[name=focus]').forEach(c => c.checked = editing.focus.includes(c.value));
    form.latam.checked = !!editing.latam;
    setModalMode('view');
  } else {
    setModalMode('edit');
  }
  $('#fund-modal').classList.remove('hidden');
}

function setModalMode(mode) {
  const body = $('#fund-form');
  if (mode === 'view') {
    body.classList.add('is-readonly');
    $('#edit-mode-btn').classList.remove('hidden');
    $('#save-fund-btn').classList.add('hidden');
  } else {
    body.classList.remove('is-readonly');
    $('#edit-mode-btn').classList.add('hidden');
    $('#save-fund-btn').classList.remove('hidden');
  }
}

function closeModals() { $$('.modal').forEach(m => m.classList.add('hidden')); }

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
    notes_deagro: (fd.get('notes_deagro') || '').trim(),
    notes_advisor: (fd.get('notes_advisor') || '').trim(),
    focus,
    latam: form.latam.checked,
  };
  await api.saveFund(payload);
  closeModals();
  renderFunds(); renderDashboard();
  if (!$('#view-round-detail').classList.contains('hidden')) renderRoundDetail();
}

async function deleteFund() {
  const id = $('#fund-form').id.value;
  if (!id) return;
  if (!confirm('Excluir este fundo?')) return;
  await api.deleteFund(id);
  closeModals();
  renderFunds(); renderDashboard();
  if (!$('#view-round-detail').classList.contains('hidden')) renderRoundDetail();
}

/* ===================== ROUND MODAL ===================== */
function openRoundModal(id) {
  const form = $('#round-form'); form.reset();
  const editing = id ? state.rounds.find(r => r.id === id) : null;
  $('#round-modal-title').textContent = editing ? 'Editar rodada' : 'Nova rodada';
  if (editing) {
    form.id.value = editing.id;
    form.name.value = editing.name;
    form.target.value = editing.target;
    form.status.value = editing.status;
    form.equity_esperado.value = editing.equity_esperado ?? '';
    form.estrategia.value = editing.estrategia || '';
    const docs = Array.isArray(editing.documento) ? editing.documento : [];
    $$('#round-form input[name=documento]').forEach(c => c.checked = docs.includes(c.value));
  }
  $('#round-modal').classList.remove('hidden');
}

async function submitRound(e) {
  e.preventDefault();
  const fd = new FormData(e.target);
  const documento = $$('#round-form input[name=documento]:checked').map(c => c.value);
  await api.saveRound({
    id: fd.get('id') || null,
    name: fd.get('name').trim(),
    target: Number(fd.get('target')),
    status: fd.get('status'),
    equity_esperado: fd.get('equity_esperado') === '' ? null : Number(fd.get('equity_esperado')),
    documento,
    estrategia: (fd.get('estrategia') || '').trim(),
  });
  closeModals();
  renderRounds(); renderDashboard();
  if (!$('#view-round-detail').classList.contains('hidden')) renderRoundDetail();
}

/* ===================== WIRE UP ===================== */
function init() {
  populateStatusSelect($('#fund-form select[name=status]'), false);
  populateStatusSelect($('#filter-status'), true);

  $$('.nav-link').forEach(a => a.addEventListener('click', e => {
    e.preventDefault(); switchView(a.dataset.view);
  }));

  $('#dash-open-round').addEventListener('click', () => {
    state.detailRoundId = state.activeRoundId; switchView('round-detail');
  });
  $('#back-to-rounds').addEventListener('click', () => switchView('rounds'));

  const resetPage = () => { state.page = 1; };

  $$('#tier-tabs .tab').forEach(t => t.addEventListener('click', () => {
    $$('#tier-tabs .tab').forEach(x => x.classList.remove('active'));
    t.classList.add('active');
    state.filters.tier = t.dataset.tier;
    resetPage();
    renderFunds();
  }));

  $('#filter-q').addEventListener('input', e => { state.filters.q = e.target.value; resetPage(); renderFunds(); });
  $('#filter-focus').addEventListener('change', e => { state.filters.focus = e.target.value; resetPage(); renderFunds(); });
  $('#filter-latam').addEventListener('change', e => { state.filters.latam = e.target.value; resetPage(); renderFunds(); });
  $('#filter-status').addEventListener('change', e => { state.filters.status = e.target.value; resetPage(); renderFunds(); });
  $('#clear-filters').addEventListener('click', () => {
    state.filters = { tier: 'all', q: '', focus: '', latam: '', status: '' };
    state.sort = { key: null, dir: 'asc' };
    resetPage();
    $('#filter-q').value = ''; $('#filter-focus').value = '';
    $('#filter-latam').value = ''; $('#filter-status').value = '';
    $$('#tier-tabs .tab').forEach(x => x.classList.toggle('active', x.dataset.tier === 'all'));
    renderFunds();
  });

  $$('.funds-table th.sortable').forEach(th => th.addEventListener('click', () => {
    const k = th.dataset.sort;
    if (state.sort.key === k) state.sort.dir = state.sort.dir === 'asc' ? 'desc' : 'asc';
    else state.sort = { key: k, dir: 'asc' };
    renderFunds();
  }));

  $('#new-fund-btn').addEventListener('click', () => openFundModal(null));
  $('#fund-form').addEventListener('submit', submitFund);
  $('#delete-fund-btn').addEventListener('click', deleteFund);
  $('#edit-mode-btn').addEventListener('click', () => setModalMode('edit'));

  $('#new-round-btn').addEventListener('click', () => openRoundModal(null));
  $('#edit-round-btn').addEventListener('click', () => openRoundModal(state.detailRoundId || state.activeRoundId));
  $('#round-form').addEventListener('submit', submitRound);

  $$('[data-close]').forEach(el => el.addEventListener('click', closeModals));
  document.addEventListener('keydown', e => { if (e.key === 'Escape') closeModals(); });

  switchView('dashboard');
}

init();
