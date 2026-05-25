/**
 * Seed inicial: importa os 40 fundos da base DeAgro + cria a rodada Seed 2026
 * com todos linkados. Idempotente: não duplica se o nome do fundo já existir.
 *
 * Rode UMA VEZ no editor (selecione `seedFunds` → Run) depois do setupDatabase().
 */
function seedFunds() {
  const existing = Database.Funds.list();
  const existingNames = new Set(existing.map(f => (f.name || '').trim().toLowerCase()));

  // Garante a rodada Seed 2026
  let round = Database.Rounds.list().find(r => r.name === 'Seed 2026');
  if (!round) {
    round = Database.Rounds.create({
      name: 'Seed 2026',
      target: 4000000,
      currency: 'USD',
      status: 'open',
      opened_at: new Date().toISOString().slice(0, 10),
      estrategia: 'Captar com fundos de impacto + tech LATAM como âncoras, depois abrir cheques menores com fundos cripto globais para diversificar a base.',
      documento: ['SAFE','SAFT'],
      equity_esperado: 15,
    });
  }

  const created = [];
  const skipped = [];

  SEED_FUNDS_DATA_.forEach(f => {
    if (existingNames.has(f.name.toLowerCase())) {
      skipped.push(f.name);
      return;
    }
    const fund = Database.Funds.create({
      name: f.name,
      website: f.website,
      tier: f.tier,
      focus: f.focus,
      latam: f.latam,
      thesis: f.thesis,
      notes_deagro: '',
      notes_advisor: '',
      location: '',
      work_format: '',
      status: 'todo',
      proposed_ticket: 0,
      committed_ticket: 0,
      round_ids: [round.id],
    }, 'seed');
    created.push(fund.name);
  });

  const summary = {
    ok: true,
    round_id: round.id,
    round_name: round.name,
    created: created.length,
    skipped: skipped.length,
    sample_created: created.slice(0, 5),
    sample_skipped: skipped.slice(0, 5),
  };
  Logger.log('✓ Seed concluído');
  Logger.log('   Criados:    %s', created.length);
  Logger.log('   Já existiam: %s', skipped.length);
  Logger.log('   Rodada:     %s (id %s)', round.name, round.id);
  return summary;
}

/**
 * Limpa TODOS os fundos e rodadas. Use só em desenvolvimento.
 * (Mantém os cabeçalhos das abas — não roda initDatabase de novo.)
 */
function resetAllData_() {
  ['Funds', 'Rounds', 'Notes', 'StatusLog'].forEach(name => {
    const sh = SpreadsheetApp.openById(
      PropertiesService.getScriptProperties().getProperty('SPREADSHEET_ID')
    ).getSheetByName(name);
    const lastRow = sh.getLastRow();
    if (lastRow > 1) sh.deleteRows(2, lastRow - 1);
  });
  Logger.log('Dados zerados (cabeçalhos preservados).');
}

/* --------- Dados (extraídos da aba Base do Excel original) --------- */
const SEED_FUNDS_DATA_ = [
  // Tier 1
  { name: 'Accion Venture Lab',      website: 'https://accion.org/venturelab',          tier: 1, focus: ['Impacto','Tech'],                           latam: true,  thesis: 'impacto financeiro inclusivo + fintech / web3' },
  { name: 'Quona Capital',           website: 'https://quona.com',                      tier: 1, focus: ['Impacto','Tech','Blockchain'],              latam: true,  thesis: 'fintech inclusiva (infra próxima de blockchain)' },
  { name: 'IGNIA',                   website: 'https://ignia.com.mx',                   tier: 1, focus: ['Impacto','Tech'],                           latam: true,  thesis: 'impacto + tech, forte em LATAM' },
  { name: 'Mercy Corps Ventures',    website: 'https://mercycorps.org/ventures',        tier: 1, focus: ['Impacto','Tech','Blockchain'],              latam: true,  thesis: 'investe em blockchain para inclusão, agro com tokenização de grãos, foco em clima' },
  { name: 'Bamboo Capital Partners', website: 'https://bamboocp.com',                   tier: 1, focus: ['Impacto'],                                  latam: true,  thesis: 'energia e inclusão financeira — forte em agro' },
  { name: 'Vox Capital',             website: 'https://voxcapital.com.br',              tier: 1, focus: ['Impacto','Tech'],                           latam: true,  thesis: 'um dos principais fundos de impacto do Brasil' },
  { name: 'Positive Ventures',       website: 'https://positive.vc',                    tier: 1, focus: ['Impacto','Tech'],                           latam: true,  thesis: 'impacto + tech emergente — preferência por rodadas seed' },
  { name: 'EcoEnterprises Fund',     website: 'https://ecoenterprisesfund.com',         tier: 1, focus: ['Impacto'],                                  latam: true,  thesis: 'clima e bioeconomia LATAM' },
  { name: 'Regen Network',           website: 'https://regen.network',                  tier: 1, focus: ['Impacto','Tech','Blockchain'],              latam: false, thesis: 'blockchain + agro' },
  { name: 'Toucan Protocol',         website: 'https://toucan.earth',                   tier: 1, focus: ['Impacto','Tech','Blockchain'],              latam: false, thesis: 'tokenização de créditos de carbono' },
  { name: 'Celo Foundation',         website: 'https://celo.org',                       tier: 1, focus: ['Impacto','Tech'],                           latam: true,  thesis: 'forte em impacto + LATAM + inclusão financeira' },
  { name: 'Multicoin Capital',       website: 'https://multicoin.capital',              tier: 1, focus: ['Impacto','Tech','Blockchain','Crypto'],     latam: false, thesis: 'state-free money e open finance' },

  // Tier 2
  { name: 'Potencia Ventures',       website: '',                                       tier: 2, focus: ['Impacto','Tech'],                           latam: true,  thesis: 'impacto social + tech' },
  { name: 'Village Capital',         website: 'https://vilcap.com',                     tier: 2, focus: ['Impacto','Tech'],                           latam: true,  thesis: 'impacto + inovação — com blockchain' },
  { name: 'LGT Venture Philanthropy',website: 'https://lgtvp.com',                      tier: 2, focus: ['Impacto'],                                  latam: true,  thesis: 'forte em clima e food systems' },
  { name: 'MOV Investimentos',       website: 'https://movinvest.com.br',               tier: 2, focus: ['Impacto','Tech'],                           latam: true,  thesis: 'ESG e impacto' },
  { name: 'Kaeté Investimentos',     website: '',                                       tier: 2, focus: ['Impacto'],                                  latam: true,  thesis: 'negócios sustentáveis' },
  { name: 'Angel Ventures',          website: 'https://angelventures.vc',               tier: 2, focus: ['Tech'],                                     latam: true,  thesis: 'early-stage LATAM' },
  { name: 'Bossanova Investimentos', website: 'https://bossanovainvest.com',            tier: 2, focus: ['Tech'],                                     latam: true,  thesis: 'early-stage LATAM' },
  { name: 'Infinite Capital',        website: '',                                       tier: 2, focus: ['Tech','Blockchain'],                        latam: true,  thesis: 'blockchain + deeptech com atuação LATAM' },
  { name: 'Acumen Fund',             website: 'https://acumen.org',                     tier: 2, focus: ['Impacto','Tech'],                           latam: true,  thesis: 'agricultura e energia com inclusão' },
  { name: 'Root Capital',            website: 'https://rootcapital.org',                tier: 2, focus: ['Impacto','Tech'],                           latam: true,  thesis: 'financiamento agrícola — explorando digitalização' },
  { name: 'Delphi Ventures',         website: 'https://delphidigital.io',               tier: 2, focus: ['Tech','Blockchain','Crypto'],               latam: false, thesis: 'projetos que avançam um futuro descentralizado' },
  { name: 'A16Z',                    website: 'https://a16z.com',                       tier: 2, focus: ['Tech','Blockchain','Crypto'],               latam: false, thesis: 'crypto e web3 — todas as fases' },
  { name: 'Archetype',               website: 'https://archetype.fund',                 tier: 2, focus: ['Impacto','Tech','Blockchain','Crypto'],     latam: false, thesis: 'early-stage crypto' },
  { name: 'Placeholder VC',          website: 'https://placeholder.vc',                 tier: 2, focus: ['Tech','Blockchain','Crypto'],               latam: false, thesis: 'open-source, decentralized networks' },
  { name: 'Paradigm',                website: 'https://paradigm.xyz',                   tier: 2, focus: ['Tech','Blockchain'],                        latam: false, thesis: 'research-driven, open blockchain tech' },

  // Tier 3
  { name: 'Omidyar Network',         website: 'https://omidyar.com',                    tier: 3, focus: ['Impacto','Tech','Crypto'],                  latam: true,  thesis: 'impacto sistêmico + govtech + crypto' },
  { name: 'Elevar Equity',           website: 'https://elevarequity.com',               tier: 3, focus: ['Impacto','Tech'],                           latam: true,  thesis: 'inclusão econômica' },
  { name: 'Rayo Capital',            website: '',                                       tier: 3, focus: ['Tech'],                                     latam: true,  thesis: 'foco em web3 LATAM' },
  { name: 'Pantera Capital',         website: 'https://panteracapital.com',             tier: 3, focus: ['Tech','Crypto'],                            latam: false, thesis: 'um dos maiores fundos cripto do mundo' },
  { name: 'Blockchain Capital',      website: 'https://blockchain.capital',             tier: 3, focus: ['Tech','Blockchain','Crypto'],               latam: false, thesis: 'pioneiro em blockchain — focado em crypto' },
  { name: 'Digital Currency Group',  website: 'https://dcg.co',                         tier: 3, focus: ['Tech'],                                     latam: true,  thesis: 'grande investidor global com atuação LATAM' },
  { name: 'Coinbase Ventures',       website: 'https://coinbase.com/ventures',          tier: 3, focus: ['Tech','Crypto'],                            latam: false, thesis: 'startups Latam — foco em crypto' },
  { name: 'Animoca Brands',          website: 'https://animocabrands.com',              tier: 3, focus: ['Tech'],                                     latam: false, thesis: 'gaming + web3 global' },
  { name: '1kx',                     website: 'https://1kx.network',                    tier: 3, focus: ['Tech','Blockchain','Crypto'],               latam: false, thesis: 'token networks com community ownership' },
  { name: 'Framework Ventures',      website: 'https://framework.ventures',             tier: 3, focus: ['Tech','Blockchain'],                        latam: false, thesis: 'DeFi, gaming, AI e blockchain infra' },
  { name: 'CoinFund',                website: 'https://coinfund.io',                    tier: 3, focus: ['Tech','Blockchain','Crypto'],               latam: false, thesis: 'on-chain financial products' },
  { name: 'Electric Capital',        website: 'https://electriccapital.com',            tier: 3, focus: ['Tech','Crypto'],                            latam: false, thesis: 'crypto networks' },
  { name: 'Variant Fund',            website: 'https://variant.fund',                   tier: 3, focus: ['Tech','Blockchain','Crypto'],               latam: false, thesis: 'user-owned web' },
];
