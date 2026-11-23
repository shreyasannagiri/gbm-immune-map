/**
 * GBM immunosuppressive microenvironment — content model.
 *
 * Scientific scope follows:
 *   Jackson CM, Choi J, Lim M. "Mechanisms of immunotherapy resistance:
 *   lessons from glioblastoma." Nat Immunol. 2019;20(9):1100-1109.
 *   doi:10.1038/s41590-019-0433-y  ·  PMID 31358997
 *
 * Geometry lives in a 1280 x 820 viewBox. Positions are hand-authored so the
 * composition reads clearly; label offsets are tuned per mechanism.
 */

export const PAPER = {
  authors: 'Jackson CM, Choi J, Lim M',
  title: 'Mechanisms of immunotherapy resistance: lessons from glioblastoma',
  journal: 'Nature Immunology',
  year: 2019,
  citation: 'Nat Immunol. 2019;20(9):1100–1109',
  doi: '10.1038/s41590-019-0433-y',
  doiUrl: 'https://doi.org/10.1038/s41590-019-0433-y',
  pubmed: 'https://pubmed.ncbi.nlm.nih.gov/31358997/',
};

export const VIEW = { w: 1280, h: 820 };

/* ------------------------------------------------------------------ layers */

export const LAYERS = [
  {
    id: 'checkpoint',
    name: 'Immune checkpoints',
    short: 'Checkpoints',
    color: '#5aa9ff',
    blurb:
      'Inhibitory receptor–ligand pairs at the cell surface that shut down a T cell even when it has found its target.',
  },
  {
    id: 'antigen',
    name: 'Antigen presentation & heterogeneity',
    short: 'Antigen',
    color: '#e081ff',
    blurb:
      'GBM is mutationally quiet and antigenically moving — there is often too little for a T cell to see, and what it sees disappears.',
  },
  {
    id: 'cytokine',
    name: 'Cytokines & chemokines',
    short: 'Cytokines',
    color: '#45d6a4',
    blurb:
      'Soluble messengers that recruit suppressive cells into the tumour and re-educate the ones already there.',
  },
  {
    id: 'myeloid',
    name: 'Myeloid reprogramming',
    short: 'Myeloid',
    color: '#ff8da1',
    blurb:
      'Macrophages, microglia and MDSCs make up much of the tumour mass and are turned into the tumour’s own immune brake.',
  },
  {
    id: 'metabolic',
    name: 'Metabolic suppression',
    short: 'Metabolic',
    color: '#ffb057',
    blurb:
      'The tumour starves T cells of what they need and floods them with metabolites that actively disable them.',
  },
  {
    id: 'hypoxia',
    name: 'Hypoxia & vasculature',
    short: 'Hypoxia',
    color: '#a98cff',
    blurb:
      'Low oxygen drives HIF-1α programmes that amplify every other mechanism, and builds vessels T cells cannot cross.',
  },
  {
    id: 'tcell',
    name: 'T-cell dysfunction & sequestration',
    short: 'T-cell state',
    color: '#3fd2e8',
    blurb:
      'Beyond the tumour: exhaustion, treatment-induced lymphopenia, and naive T cells trapped in the bone marrow.',
  },
];

export const layerById = Object.fromEntries(LAYERS.map((l) => [l.id, l]));

/* ------------------------------------------------------------------- cells */

/**
 * kind  — which procedural renderer draws it (see render/cells.js)
 * r     — soma radius in viewBox units
 * role  — one-line identity shown in the panel header
 */
export const CELLS = [
  {
    id: 'gbm',
    kind: 'tumor',
    name: 'GBM tumour cell',
    role: 'Malignant astrocytic cell — the organiser of the whole niche',
    x: 624,
    y: 424,
    r: 120,
    color: '#ff5f85',
    labelAt: 'below',
    body:
      'Glioblastoma cells do more than grow. They actively assemble an immunosuppressive niche: expressing inhibitory ligands, secreting chemokines that pull in suppressive myeloid cells, consuming and excreting metabolites that paralyse T cells, and losing the very antigens that immunotherapy targets. GBM carries a low mutational burden, so there are relatively few neoantigens to begin with, and profound intratumoural heterogeneity means no two regions look the same to the immune system.',
    facts: [
      'Median survival remains under 2 years despite resection, radiation and temozolomide',
      'Low tumour mutational burden relative to melanoma or NSCLC — few neoantigens',
      'PTEN loss and PI3K pathway activation raise PD-L1 and associate with checkpoint resistance',
    ],
  },
  {
    id: 'gsc',
    kind: 'stem',
    name: 'Glioma stem cell',
    role: 'Treatment-resistant reservoir in the perinecrotic / hypoxic niche',
    x: 300,
    y: 196,
    r: 54,
    color: '#ff9ac6',
    labelAt: 'left',
    body:
      'Glioma stem cells sit in hypoxic and perivascular niches and regenerate the tumour after therapy. They express low levels of MHC class I, resist radiation and chemotherapy, and actively instruct myeloid cells — secreting periostin and other factors that recruit tumour-associated macrophages. Their survival after treatment is a major reason local control fails even when the bulk tumour responds.',
    facts: [
      'Low MHC-I expression — poorly visible to CD8⁺ T cells',
      'Secrete periostin and CSF-1 to recruit and polarise macrophages',
      'HIF-dependent programmes maintain stemness in the hypoxic niche',
    ],
  },
  {
    id: 'cd8',
    kind: 'lymphocyte',
    name: 'CD8⁺ cytotoxic T cell',
    role: 'The effector immunotherapy is trying to unleash',
    x: 624,
    y: 136,
    r: 54,
    color: '#5cc8ff',
    labelAt: 'above',
    body:
      'The CD8⁺ T cell is the cell every GBM immunotherapy ultimately depends on. In glioblastoma the few that reach the tumour arrive into a landscape built to disable them: they co-express multiple inhibitory receptors (PD-1, TIM-3, LAG-3, CTLA-4, TIGIT), sit in a nutrient-stripped and acidic medium, and are outnumbered many-fold by suppressive myeloid cells. The review stresses that dysfunction here is not one state but several — exhaustion, anergy, senescence, tolerance and simple ignorance — and that each one needs a different fix.',
    facts: [
      'Tumour-infiltrating T cells co-express several checkpoints at once',
      'Exhaustion, anergy, senescence, tolerance and ignorance are distinct, separately treatable states',
      'Blocking one checkpoint frequently drives compensatory upregulation of another',
    ],
  },
  {
    id: 'treg',
    kind: 'lymphocyte',
    name: 'Regulatory T cell',
    role: 'CD4⁺ FOXP3⁺ suppressor, enriched in GBM',
    x: 910,
    y: 212,
    r: 50,
    color: '#8a8cff',
    labelAt: 'right',
    body:
      'Tregs are enriched in glioblastoma relative to blood and suppress effector T cells through several non-redundant routes: constitutive CTLA-4 that strips co-stimulatory CD80/CD86 off dendritic cells, high-affinity IL-2 consumption that starves neighbouring effectors, and surface CD39/CD73 that manufacture adenosine. They are recruited by tumour-derived CCL2 and CCL22 and expanded by TGF-β and by kynurenine from IDO-expressing tumour cells.',
    facts: [
      'Recruited by tumour-derived CCL2 / CCL22',
      'CTLA-4 trans-endocytoses CD80/CD86 from dendritic cells',
      'CD39/CD73 on the surface convert ATP to immunosuppressive adenosine',
    ],
  },
  {
    id: 'nk',
    kind: 'nk',
    name: 'NK cell',
    role: 'Innate killer, disarmed by TGF-β',
    x: 196,
    y: 428,
    r: 50,
    color: '#3fdcbe',
    labelAt: 'left',
    body:
      'NK cells should be the answer to MHC-I loss — they kill cells that fail to display class I. In GBM that backstop is removed: TGF-β in the microenvironment downregulates the activating receptor NKG2D, blunting cytotoxicity, while hypoxia and metabolic stress further reduce NK function. The result is that a tumour cell can hide from CD8⁺ T cells by losing MHC-I without paying the usual price.',
    facts: [
      'TGF-β downregulates NKG2D and suppresses cytotoxicity',
      'Normally kills MHC-Iⁿᵉᵍ targets — the escape route from CD8 recognition',
      'A rationale for combining TGF-β blockade with checkpoint inhibition',
    ],
  },
  {
    id: 'dc',
    kind: 'dendritic',
    name: 'Dendritic cell',
    role: 'Antigen-presenting cell — priming is the upstream bottleneck',
    x: 292,
    y: 622,
    r: 54,
    color: '#ffd166',
    labelAt: 'below',
    body:
      'Nothing downstream works if priming fails. Tumour-derived VEGF, IL-10 and TGF-β keep dendritic cells immature, so they present antigen without co-stimulation — which tolerises rather than activates T cells. The CNS compounds the problem: antigen drainage is restricted compared with peripheral tissue, and Treg CTLA-4 removes CD80/CD86 from the DC surface. The review frames poor priming as a reason checkpoint blockade alone underperforms in GBM.',
    facts: [
      'VEGF, IL-10 and TGF-β arrest DC maturation',
      'Immature DCs presenting antigen without co-stimulation induce tolerance',
      'Restricted CNS antigen drainage limits priming in draining lymph nodes',
    ],
  },
  {
    id: 'tam',
    kind: 'macrophage',
    name: 'Tumour-associated macrophage',
    role: 'Monocyte-derived, blood-recruited — the dominant infiltrate',
    x: 996,
    y: 440,
    r: 78,
    color: '#ff9d57',
    labelAt: 'right',
    body:
      'Myeloid cells can account for a third to a half of the cells in a glioblastoma, and most are monocyte-derived macrophages recruited from the blood. Tumour-derived CSF-1, CCL2, GM-CSF and periostin drive both their recruitment and their polarisation toward an M2-like, wound-healing phenotype. In that state they are the tumour’s main enforcement arm: a major source of PD-L1, IL-10, TGF-β and arginase, and they physically crowd out lymphocytes.',
    facts: [
      'Myeloid cells comprise roughly 30–50% of the cells in a GBM',
      'Monocyte-derived TAMs dominate over resident microglia in the tumour core',
      'CSF1R inhibition repolarises rather than depletes — and meets resistance',
    ],
  },
  {
    id: 'mg',
    kind: 'microglia',
    name: 'Microglia',
    role: 'Resident CNS myeloid cell, co-opted by the tumour',
    x: 586,
    y: 702,
    r: 56,
    color: '#b48cff',
    labelAt: 'below',
    body:
      'Microglia are the brain’s resident immune cells, normally surveying tissue with fine ramified processes. In glioblastoma they retract those processes, adopt an amoeboid tumour-supportive phenotype, and secrete IL-6, IL-10, TGF-β and matrix metalloproteinases that both suppress T cells and clear a path for tumour invasion. Distinguishing them from blood-derived macrophages matters therapeutically — the two populations respond differently to myeloid-targeted drugs.',
    facts: [
      'Ontogenetically distinct from monocyte-derived TAMs — different drug responses',
      'IL-6/STAT3 signalling sustains the tumour-supportive phenotype',
      'Secreted MMPs degrade matrix and facilitate tumour invasion',
    ],
  },
  {
    id: 'mdsc',
    kind: 'mdsc',
    name: 'Myeloid-derived suppressor cell',
    role: 'Immature myeloid cell, recruited to suppress',
    x: 888,
    y: 666,
    r: 54,
    color: '#9fb0c4',
    labelAt: 'right',
    body:
      'MDSCs are immature myeloid cells whose entire function is suppression. Pulled in by CCL2 and CXCL1/2, they deplete L-arginine through arginase-1, generate nitric oxide and reactive oxygen species that nitrate the T-cell receptor, and secrete IL-10 and TGF-β. They are elevated in the blood of GBM patients as well as in the tumour, which is one reason systemic immune competence tracks with outcome.',
    facts: [
      'Arginase-1 depletes L-arginine required for T-cell proliferation',
      'NO and ROS nitrate the TCR, uncoupling it from antigen recognition',
      'Elevated in peripheral blood as well as in the tumour',
    ],
  },
  {
    id: 'naive',
    kind: 'lymphocyte',
    name: 'Naive T cells (bone marrow)',
    role: 'Sequestered far from the tumour',
    x: 142,
    y: 740,
    r: 34,
    color: '#7fe3ff',
    labelAt: 'below',
    hidden: true,
    body:
      'One of the review’s most striking points: the T cells missing from a glioblastoma are not necessarily dead. In GBM, sphingosine-1-phosphate receptor 1 (S1P1) is internalised from the naive T-cell surface, and without it those cells cannot leave the bone marrow. A large fraction of the repertoire is physically sequestered in marrow — which reframes GBM-associated lymphopenia as a trafficking defect, not simply destruction, and suggests it is reversible.',
    facts: [
      'S1P1 internalisation traps naive T cells in bone marrow',
      'Reframes GBM lymphopenia as sequestration rather than destruction',
      'Potentially reversible — a distinct therapeutic target from exhaustion',
    ],
  },
];

export const cellById = Object.fromEntries(CELLS.map((c) => [c.id, c]));

/* -------------------------------------------------------------- mechanisms */

/**
 * kind     'synapse'  — membrane-to-membrane receptor/ligand pair
 *          'soluble'  — secreted factor, animated as diffusing particles
 *          'state'    — an intrinsic property of one cell or region
 * bend     curvature of the connector (viewBox units, signed)
 * lab      label offset from the anchor point
 * ligand / receptor  — glyph labels drawn at each membrane
 */
export const MECHANISMS = [
  /* ---------------------------------------------------------- checkpoints */
  {
    id: 'pd1',
    layer: 'checkpoint',
    kind: 'synapse',
    from: 'gbm',
    to: 'cd8',
    label: 'PD-L1 → PD-1',
    ligand: 'PD-L1',
    receptor: 'PD-1',
    bend: -26,
    lab: { dx: -108, dy: -6 },
    title: 'PD-1 / PD-L1 — the axis that failed in GBM',
    molecules: ['PD-L1 (CD274)', 'PD-1 (PDCD1)', 'IFN-γ', 'PTEN / PI3K'],
    summary:
      'PD-L1 on tumour and myeloid cells engages PD-1 on activated T cells and dephosphorylates the signals downstream of the T-cell receptor — the T cell sees its target and does nothing.',
    detail:
      'PD-L1 is expressed constitutively in GBM and induced further by interferon-γ, making it an adaptive response to the very immune attack it blocks. PTEN loss and PI3K pathway activation raise PD-L1 and associate with resistance to checkpoint blockade. The CheckMate-143 trial of nivolumab in recurrent GBM failed to improve survival over bevacizumab, and the review uses that result as its central puzzle: PD-1 blockade is necessary but nowhere near sufficient when priming is poor and myeloid suppression is this dominant.',
    therapy:
      'Nivolumab, pembrolizumab. Neoadjuvant (pre-surgical) dosing shows biological activity where adjuvant dosing did not — timing relative to surgery and steroids may matter more than the agent.',
  },
  {
    id: 'pdl1-tam',
    layer: 'checkpoint',
    kind: 'synapse',
    from: 'tam',
    to: 'cd8',
    label: 'Myeloid PD-L1',
    ligand: 'PD-L1',
    receptor: 'PD-1',
    via: { x: 812, y: 232 },
    lab: { dx: 258, dy: -78 },
    title: 'Myeloid PD-L1 — the larger ligand pool',
    molecules: ['PD-L1 on TAMs / microglia / MDSCs'],
    summary:
      'Much of the PD-L1 a T cell meets in a glioblastoma is not on tumour cells at all — it is on the myeloid cells that outnumber them.',
    detail:
      'Because myeloid cells can constitute 30–50% of a glioblastoma and express PD-L1 densely, the ligand a T cell actually encounters is largely myeloid. This explains a persistent clinical observation: tumour-cell PD-L1 immunohistochemistry predicts response poorly in GBM. It also predicts that myeloid-targeted therapy and checkpoint blockade should be synergistic rather than redundant.',
    therapy:
      'Rationale for combining PD-1 blockade with CSF1R inhibition or other myeloid-directed agents.',
  },
  {
    id: 'ctla4',
    layer: 'checkpoint',
    kind: 'synapse',
    from: 'treg',
    to: 'dc',
    label: 'CTLA-4 ⊣ CD80/86',
    ligand: 'CTLA-4',
    receptor: 'CD80/86',
    via: { x: 380, y: 290 },
    lab: { dx: -108, dy: 45 },
    title: 'CTLA-4 — co-stimulation removed at the source',
    molecules: ['CTLA-4 (CD152)', 'CD80 / CD86', 'FOXP3'],
    summary:
      'CTLA-4 outcompetes CD28 for CD80/CD86 and physically strips those molecules off the dendritic cell, so no T cell downstream can be properly co-stimulated.',
    detail:
      'Tregs express CTLA-4 constitutively and remove CD80/CD86 from APCs by trans-endocytosis. The effect is upstream and cell-extrinsic: it degrades priming for the whole repertoire, not just the engaged T cell. Because CTLA-4 acts in lymphoid tissue during priming while PD-1 acts in the tumour during effector function, the two blockades address genuinely different failures — the basis for combination trials in GBM.',
    therapy:
      'Ipilimumab; combination with anti-PD-1 under investigation, with CNS-specific toxicity a real constraint.',
  },
  {
    id: 'tim3',
    layer: 'checkpoint',
    kind: 'synapse',
    from: 'gbm',
    to: 'cd8',
    label: 'Galectin-9 → TIM-3',
    ligand: 'Gal-9',
    receptor: 'TIM-3',
    bend: 30,
    lab: { dx: 125, dy: -36 },
    title: 'TIM-3 — the compensatory checkpoint',
    molecules: ['TIM-3 (HAVCR2)', 'Galectin-9', 'HMGB1', 'CEACAM-1'],
    summary:
      'TIM-3 rises on T cells after PD-1 blockade and after radiation — a second brake engaged precisely when the first is released.',
    detail:
      'Galectin-9 engagement of TIM-3 marks the most deeply dysfunctional T cells, and TIM-3 upregulation is a documented escape route from anti-PD-1 therapy. In preclinical glioma models the triple combination of anti-TIM-3, anti-PD-1 and stereotactic radiation produced markedly better survival than any single agent — one of the clearer arguments in the review that resistance mechanisms are layered and must be blocked together.',
    therapy:
      'Anti-TIM-3 combined with PD-1 blockade and radiation; strong preclinical signal in glioma models.',
  },
  {
    id: 'lag3',
    layer: 'checkpoint',
    kind: 'synapse',
    from: 'gbm',
    to: 'cd8',
    label: 'MHC-II → LAG-3',
    ligand: 'MHC-II',
    receptor: 'LAG-3',
    bend: 74,
    lab: { dx: 151, dy: 34 },
    title: 'LAG-3 — a brake on the CD4 axis too',
    molecules: ['LAG-3 (CD223)', 'MHC class II', 'FGL1'],
    summary:
      'LAG-3 binds MHC class II with high affinity and inhibits both effector T-cell function and the help CD4⁺ cells provide.',
    detail:
      'LAG-3 is co-expressed with PD-1 on exhausted tumour-infiltrating lymphocytes and is enriched on glioma-infiltrating T cells. Blocking LAG-3 alone does little; combined with PD-1 blockade it improves survival in glioma models. The review treats the co-expression pattern itself as the message — single-agent checkpoint blockade is working against a redundant network.',
    therapy:
      'Anti-LAG-3 with anti-PD-1 (relatlimab-class agents); efficacy depends on combination.',
  },
  {
    id: 'tigit',
    layer: 'checkpoint',
    kind: 'synapse',
    from: 'gbm',
    to: 'cd8',
    label: 'CD155 → TIGIT',
    ligand: 'CD155',
    receptor: 'TIGIT',
    bend: -74,
    lab: { dx: -124, dy: 52 },
    title: 'TIGIT — competing with activation itself',
    molecules: ['TIGIT', 'CD155 (PVR)', 'CD112', 'CD226 (DNAM-1)'],
    summary:
      'TIGIT binds the same ligands as the activating receptor CD226 but with higher affinity, tipping the balance toward inhibition.',
    detail:
      'CD155 is broadly expressed on glioma cells. TIGIT engagement suppresses both T-cell and NK-cell function, and TIGIT marks dysfunctional glioma-infiltrating lymphocytes. Because TIGIT and CD226 share ligands, the outcome at the membrane is set by their relative levels rather than by ligand availability — a receptor-ratio problem, not a ligand-expression problem.',
    therapy:
      'Anti-TIGIT antibodies in combination with PD-1 blockade; preclinical glioma data support the pairing.',
  },
  {
    id: 'cd47',
    layer: 'checkpoint',
    kind: 'synapse',
    from: 'gbm',
    to: 'tam',
    label: 'CD47 → SIRPα',
    ligand: 'CD47',
    receptor: 'SIRPα',
    bend: -40,
    lab: { dx: -22, dy: -22 },
    title: 'CD47 / SIRPα — the "don’t eat me" signal',
    molecules: ['CD47', 'SIRPα (CD172a)'],
    summary:
      'CD47 on the tumour cell tells the macrophage not to phagocytose it — an innate checkpoint parallel to PD-1 on T cells.',
    detail:
      'CD47 is overexpressed in glioblastoma and engages SIRPα on macrophages and microglia to veto phagocytosis. Blocking it unlocks myeloid cells that are already abundant inside the tumour, which is attractive precisely because myeloid infiltration in GBM is so heavy. In models, CD47 blockade drives macrophage-mediated tumour clearance and can improve antigen presentation downstream.',
    therapy:
      'Anti-CD47 (magrolimab-class) and SIRPα-targeted agents; appealing given the dense myeloid infiltrate.',
  },

  /* ------------------------------------------------------------- antigen */
  {
    id: 'mhc1',
    layer: 'antigen',
    kind: 'synapse',
    from: 'gbm',
    to: 'cd8',
    label: 'MHC-I loss',
    ligand: 'MHC-I ↓',
    receptor: 'TCR',
    bend: 0,
    lab: { dx: 0, dy: -8 },
    title: 'Loss of MHC class I — invisibility',
    molecules: ['HLA-A/B/C', 'β2-microglobulin', 'TAP1/2', 'TCR'],
    summary:
      'Downregulating MHC class I removes the display case. The T-cell receptor has nothing to bind, and no amount of checkpoint blockade changes that.',
    detail:
      'GBM cells, and glioma stem cells in particular, reduce MHC-I surface expression through HLA loss, β2-microglobulin defects and impaired peptide transport. This is the most fundamental resistance mechanism in the review: it sits upstream of every checkpoint. It also explains why NK-cell suppression by TGF-β matters so much — the innate backstop for MHC-I loss has been removed as well.',
    therapy:
      'Strategies that bypass MHC-I: CAR T cells, NK-directed therapy, or interferon-based induction of antigen-processing machinery.',
  },
  {
    id: 'tmb',
    layer: 'antigen',
    kind: 'state',
    at: 'gbm',
    label: 'Low TMB · heterogeneity',
    anchor: { dx: -16, dy: 96 },
    lab: { dx: -204, dy: 136 },
    title: 'Low mutational burden and antigenic heterogeneity',
    molecules: ['Neoantigens', 'EGFRvIII', 'MGMT / hypermutation'],
    summary:
      'GBM carries few mutations compared with tumours that respond to checkpoint blockade — and the targets it does have are unevenly distributed and expendable.',
    detail:
      'Response to checkpoint inhibition correlates with mutational burden across cancers, and GBM sits at the quiet end. Worse, its antigens are regional: profound intratumoural heterogeneity means a target present in one biopsy may be absent metres away in the same tumour. The rindopepimut experience is the cautionary case — vaccinating against EGFRvIII led to recurrent tumours that had simply lost EGFRvIII. Hypermutation after temozolomide raises burden but has not reliably produced responsiveness.',
    therapy:
      'Multi-antigen and personalised neoantigen vaccines; single-target approaches invite antigen-loss escape.',
  },
  {
    id: 'priming',
    layer: 'antigen',
    kind: 'soluble',
    from: 'gbm',
    to: 'dc',
    label: 'DC maturation block',
    bend: -70,
    lab: { dx: -54, dy: 72 },
    title: 'Dendritic-cell maturation arrest',
    molecules: ['VEGF', 'IL-10', 'TGF-β'],
    summary:
      'Tumour-derived VEGF, IL-10 and TGF-β keep dendritic cells immature, so antigen is presented without co-stimulation — which tolerises instead of activating.',
    detail:
      'Checkpoint blockade releases a brake on T cells that have already been primed. If priming never happened properly, there is little to release. The review highlights restricted CNS antigen drainage alongside these soluble factors, and positions dendritic-cell vaccines and in-situ immunisation as attempts to supply the priming step the tumour has suppressed.',
    therapy:
      'DC vaccines (e.g. DCVax-L), oncolytic viruses and in-situ vaccination to restore priming; logically combined with checkpoint blockade.',
  },

  /* ----------------------------------------------------------- cytokines */
  {
    id: 'tgfb',
    layer: 'cytokine',
    kind: 'soluble',
    from: 'gbm',
    to: 'nk',
    label: 'TGF-β',
    bend: -60,
    lab: { dx: -64, dy: 2 },
    title: 'TGF-β — the master suppressive cytokine',
    molecules: ['TGF-β1/2', 'NKG2D', 'FOXP3', 'SMAD2/3'],
    summary:
      'TGF-β suppresses cytotoxic T cells, strips NKG2D from NK cells, and converts naive CD4⁺ cells into Tregs — three failures from one molecule.',
    detail:
      'Glioma cells and tumour-associated myeloid cells both secrete TGF-β abundantly. Its breadth is what makes it important: it blunts effector differentiation, disarms the NK compartment that would otherwise handle MHC-I-low tumour cells, promotes Treg induction, and contributes to invasion and angiogenesis. Systemic blockade has been limited by toxicity, which is why localised and bifunctional approaches are being pursued.',
    therapy:
      'TGF-β trap / bifunctional agents and TGFβR kinase inhibitors; systemic blockade is toxicity-limited.',
  },
  {
    id: 'il10',
    layer: 'cytokine',
    kind: 'soluble',
    from: 'mg',
    to: 'cd8',
    label: 'IL-10 · IL-6',
    via: { x: 300, y: 420 },
    lab: { dx: -31, dy: -118 },
    title: 'IL-10 and IL-6 — myeloid suppressive output',
    molecules: ['IL-10', 'IL-6', 'STAT3'],
    summary:
      'Microglia and macrophages flood the niche with IL-10 and IL-6, suppressing effector function and locking in their own tumour-supportive state through STAT3.',
    detail:
      'IL-10 directly inhibits T-cell effector function and sustains the M2-like myeloid phenotype; IL-6 drives STAT3 activation that reinforces it. STAT3 sits at the convergence of several of these pathways, which is why it has been pursued as a node where one drug might collapse multiple mechanisms at once.',
    therapy:
      'STAT3 inhibition as a convergence point for several suppressive pathways.',
  },
  {
    id: 'ccl2',
    layer: 'cytokine',
    kind: 'soluble',
    from: 'gbm',
    to: 'mdsc',
    label: 'CCL2 · CXCL1/2',
    bend: 60,
    lab: { dx: 64, dy: 50 },
    title: 'Chemokine recruitment of suppressive cells',
    molecules: ['CCL2 (MCP-1)', 'CCL22', 'CXCL1 / CXCL2', 'CCR2'],
    summary:
      'The tumour writes its own guest list: CCL2 and CXCL1/2 draw in MDSCs and Tregs, while effector T-cell entry stays poor.',
    detail:
      'CCL2 recruits CCR2⁺ monocytes and MDSCs, and together with CCL22 brings in regulatory T cells. The imbalance is the point — the chemokine environment is selectively permissive for suppressive populations. Blocking CCL2–CCR2 reduces MDSC infiltration in glioma models and extends survival when combined with checkpoint blockade.',
    therapy:
      'CCR2 / CCL2 antagonists combined with PD-1 blockade; CXCR2 blockade for MDSC trafficking.',
  },
  {
    id: 'csf1',
    layer: 'cytokine',
    kind: 'soluble',
    from: 'gbm',
    to: 'tam',
    label: 'CSF-1 · GM-CSF · periostin',
    bend: 44,
    lab: { dx: 60, dy: 86 },
    title: 'CSF-1 and periostin — recruiting and re-educating macrophages',
    molecules: ['CSF-1', 'GM-CSF', 'Periostin', 'CSF1R'],
    summary:
      'CSF-1, GM-CSF and periostin both bring macrophages into the tumour and instruct them, on arrival, to protect it.',
    detail:
      'Recruitment and polarisation are driven by the same signals, so the infiltrate arrives pre-committed to an M2-like phenotype. Glioma stem cells secrete periostin specifically to recruit TAMs. CSF1R inhibition repolarises rather than depletes these cells in glioma models and improves survival, though resistance emerges — an illustration of the review’s broader argument that the myeloid compartment is the most addressable and most underused target in GBM.',
    therapy:
      'CSF1R inhibitors (repolarisation rather than depletion); resistance emerges, supporting combination use.',
  },
  {
    id: 'vegf',
    layer: 'hypoxia',
    kind: 'soluble',
    from: 'gbm',
    to: 'vessel',
    label: 'VEGF → abnormal vessels',
    bend: -30,
    lab: { dx: 92, dy: -92 },
    title: 'VEGF — a vascular and an immune lesion',
    molecules: ['VEGF-A', 'VEGFR2', 'ICAM-1 / VCAM-1'],
    summary:
      'VEGF builds leaky, disorganised vessels that T cells struggle to cross, and simultaneously keeps dendritic cells immature.',
    detail:
      'The vasculature is not a neutral conduit. VEGF-driven vessels downregulate the adhesion molecules T cells need for extravasation, so even a competent systemic response may not reach the tumour, while the resulting oedema and hypoxia deepen the suppressive programme. VEGF also acts directly on dendritic cells to block maturation — the same molecule obstructing both trafficking and priming.',
    therapy:
      'Bevacizumab; vascular normalisation may improve T-cell trafficking, though it did not extend survival alone.',
  },

  /* ------------------------------------------------------------- myeloid */
  {
    id: 'm2',
    layer: 'myeloid',
    kind: 'state',
    at: 'tam',
    label: 'M2-like polarisation',
    anchor: { dx: 42, dy: -56 },
    lab: { dx: 84, dy: -78 },
    title: 'M2-like polarisation — the tumour’s enforcement arm',
    molecules: ['CD163 / CD206', 'ARG1', 'IL-10', 'TGF-β', 'STAT3'],
    summary:
      'Tumour-associated macrophages adopt a wound-healing phenotype: tissue remodelling, angiogenesis and active immune suppression instead of tumour killing.',
    detail:
      'The M1/M2 framing is a simplification of a continuum, but the functional consequence in GBM is clear. Polarised TAMs supply PD-L1, IL-10, TGF-β and arginase simultaneously, so this single cell state reproduces several mechanisms at once. Because myeloid cells are the dominant infiltrate, repolarising them changes the microenvironment more than acting on any other population — and unlike exhausted T cells, they are plentiful and already in place.',
    therapy:
      'Repolarisation strategies: CSF1R inhibition, CD40 agonism, STAT3 inhibition, TLR agonists.',
  },
  {
    id: 'crowding',
    layer: 'myeloid',
    kind: 'state',
    at: 'mg',
    label: 'Myeloid dominance 30–50%',
    anchor: { dx: -8, dy: 54 },
    lab: { dx: 170, dy: 60 },
    title: 'Myeloid dominance of the infiltrate',
    molecules: ['Monocyte-derived TAMs', 'Resident microglia', 'MDSCs'],
    summary:
      'Myeloid cells make up a third to a half of the cells in a glioblastoma. Glioblastoma is not a T-cell-poor tumour so much as a myeloid-dominated one.',
    detail:
      'Monocyte-derived macrophages dominate the tumour core while resident microglia populate the periphery, and the two are ontogenetically distinct with different responses to myeloid-directed drugs. The sheer mass of this compartment means the tumour is quantitatively an immune organ working against the host, which reframes the therapeutic question away from "add more T cells" toward "change what is already here".',
    therapy:
      'Distinguishing microglia from monocyte-derived TAMs matters for drug selection and for reading trial results.',
  },
  {
    id: 'arg1',
    layer: 'metabolic',
    kind: 'soluble',
    from: 'mdsc',
    to: 'cd8',
    label: 'ARG1 · iNOS · ROS',
    via: { x: 860, y: 450 },
    lab: { dx: 135, dy: -132 },
    title: 'Arginine depletion, NO and ROS',
    molecules: ['Arginase-1', 'iNOS / NO', 'ROS', 'Peroxynitrite'],
    summary:
      'MDSCs consume the arginine T cells need to proliferate, then nitrate the T-cell receptor so it can no longer read antigen.',
    detail:
      'Arginase-1 depletes extracellular L-arginine, arresting T-cell proliferation, while nitric oxide and reactive oxygen species generate peroxynitrite that nitrates tyrosine residues on the TCR complex — uncoupling the receptor from antigen recognition. This is suppression by chemistry rather than by receptor signalling, and no checkpoint antibody addresses it.',
    therapy:
      'Arginase and iNOS inhibitors; MDSC depletion (low-dose chemotherapy, CXCR2 blockade).',
  },

  /* ----------------------------------------------------------- metabolic */
  {
    id: 'ido',
    layer: 'metabolic',
    kind: 'soluble',
    from: 'gbm',
    to: 'treg',
    label: 'IDO1 → kynurenine',
    bend: -34,
    lab: { dx: 194, dy: -168 },
    title: 'IDO1 and the kynurenine pathway',
    molecules: ['IDO1', 'Tryptophan', 'Kynurenine', 'AhR'],
    summary:
      'IDO1 burns through tryptophan and produces kynurenine — starving effector T cells while converting others into Tregs through AhR.',
    detail:
      'Tryptophan depletion alone arrests T-cell proliferation; kynurenine then acts through the aryl hydrocarbon receptor to promote regulatory differentiation. IDO1 expression in glioma associates with Treg infiltration and worse survival. The review notes that IDO inhibition has been disappointing as monotherapy across cancers, which fits its central theme: these mechanisms are parallel, and removing one leaves the rest intact.',
    therapy:
      'IDO1 inhibitors (epacadostat-class) in combination; monotherapy results were negative.',
  },
  {
    id: 'adenosine',
    layer: 'metabolic',
    kind: 'synapse',
    from: 'treg',
    to: 'cd8',
    label: 'CD39/CD73 → adenosine',
    ligand: 'CD39/73',
    receptor: 'A2AR',
    bend: -46,
    lab: { dx: 46, dy: -96 },
    title: 'The adenosine axis',
    molecules: ['CD39 (ENTPD1)', 'CD73 (NT5E)', 'Adenosine', 'A2A receptor'],
    summary:
      'CD39 and CD73 on Tregs and tumour cells convert ATP released by dying cells into adenosine, which raises cAMP in T cells and switches off effector function.',
    detail:
      'This pathway converts a pro-inflammatory signal into an anti-inflammatory one: ATP from dying cells, which should alert the immune system, is hydrolysed to adenosine instead. Signalling through A2AR elevates cAMP and suppresses T and NK cells. Hypoxia upregulates CD73 and A2AR, which is why this axis is strongest exactly where the tumour is most hypoxic — one of the clearest couplings between two mechanism classes in the review.',
    therapy:
      'A2AR antagonists and anti-CD73 antibodies; rational to combine with hypoxia-directed strategies.',
  },
  {
    id: 'twohg',
    layer: 'metabolic',
    kind: 'state',
    at: 'gsc',
    label: '2-HG (IDH-mutant)',
    anchor: { dx: 26, dy: 44 },
    lab: { dx: 130, dy: 54 },
    title: '2-hydroxyglutarate in IDH-mutant glioma',
    molecules: ['IDH1/2 mutation', 'D-2-hydroxyglutarate'],
    summary:
      'Mutant IDH produces the oncometabolite 2-HG, which suppresses T-cell function and reshapes the immune landscape of these tumours.',
    detail:
      '2-HG accumulates to millimolar concentrations and is taken up by infiltrating T cells, impairing activation and polarising the infiltrate. IDH-mutant gliomas are correspondingly less immune-infiltrated than IDH-wild-type GBM — a reminder that tumour genotype sets the immune phenotype, and that immunotherapy strategy may need to differ by molecular subtype rather than by histology.',
    therapy:
      'Mutant-IDH inhibitors and IDH-specific vaccines; genotype-stratified immunotherapy design.',
  },

  /* ------------------------------------------------------------- hypoxia */
  {
    id: 'hif',
    layer: 'hypoxia',
    kind: 'state',
    at: 'gsc',
    label: 'HIF-1α programme',
    anchor: { dx: -14, dy: -62 },
    lab: { dx: 0, dy: -110 },
    title: 'Hypoxia and HIF-1α — the amplifier',
    molecules: ['HIF-1α', 'VEGF', 'CXCL12 (SDF-1)', 'CD73', 'PD-L1'],
    summary:
      'Low oxygen in the necrotic core activates HIF-1α, which raises PD-L1, VEGF, CXCL12 and CD73 together — one upstream switch feeding every other mechanism.',
    detail:
      'Hypoxia is not simply a consequence of rapid growth; it is an active immunological programme. HIF-1α recruits MDSCs and TAMs through CXCL12, pushes macrophages toward M2 polarisation, elevates PD-L1 and the adenosine machinery, and maintains glioma stem cells. Because it sits upstream of checkpoints, chemokines, metabolism and vasculature at once, the review treats hypoxia as the clearest example of why single-mechanism blockade underperforms in GBM.',
    therapy:
      'Vascular normalisation, HIF pathway inhibition, hypoxia-activated prodrugs; rational backbone for combinations.',
  },
  {
    id: 'cxcl12',
    layer: 'hypoxia',
    kind: 'soluble',
    from: 'gsc',
    to: 'tam',
    label: 'CXCL12 recruitment',
    via: { x: 700, y: 34 },
    lab: { dx: -204, dy: -56 },
    title: 'CXCL12 — hypoxia-driven myeloid recruitment',
    molecules: ['CXCL12 (SDF-1)', 'CXCR4'],
    summary:
      'The hypoxic niche broadcasts CXCL12, pulling CXCR4⁺ myeloid cells into the region of the tumour that is already most suppressive.',
    detail:
      'CXCL12–CXCR4 signalling recruits MDSCs and macrophages into hypoxic and perivascular niches, where low oxygen then polarises them further. The loop is self-reinforcing: hypoxia recruits myeloid cells, myeloid cells drive angiogenesis and consumption that sustain hypoxia. CXCR4 blockade has been explored both to interrupt this recruitment and to mobilise cells out of protective niches.',
    therapy:
      'CXCR4 antagonists (plerixafor-class) to interrupt recruitment and disrupt niche protection.',
  },

  /* ------------------------------------------------------------ T-cell state */
  {
    id: 's1p1',
    layer: 'tcell',
    kind: 'state',
    at: 'naive',
    label: 'S1P1 loss → marrow sequestration',
    anchor: { dx: 0, dy: -44 },
    lab: { dx: 186, dy: 46 },
    title: 'Bone-marrow sequestration of naive T cells',
    molecules: ['S1P1 (S1PR1)', 'Sphingosine-1-phosphate'],
    summary:
      'In GBM, S1P1 is internalised from naive T cells, and without it they cannot exit the bone marrow. The missing T cells are not dead — they are stuck.',
    detail:
      'This is one of the review’s most consequential observations. Egress from bone marrow requires surface S1P1; its internalisation in glioblastoma traps a large share of the naive repertoire there, producing profound lymphopenia without wholesale destruction. It reframes a long-standing clinical observation as a trafficking defect — and trafficking defects are, in principle, reversible, making this a target entirely distinct from exhaustion or checkpoint blockade.',
    therapy:
      'Restoring S1P1-dependent egress; a target orthogonal to every checkpoint strategy.',
  },
  {
    id: 'lymphodepletion',
    layer: 'tcell',
    kind: 'state',
    at: 'cd8',
    label: 'Steroids · TMZ lymphodepletion',
    anchor: { dx: 54, dy: -34 },
    lab: { dx: 156, dy: -96 },
    title: 'Treatment-induced lymphodepletion',
    molecules: ['Dexamethasone', 'Temozolomide', 'Radiation'],
    summary:
      'Standard GBM care is itself immunosuppressive: dexamethasone is directly lymphotoxic and temozolomide depletes lymphocytes.',
    detail:
      'Corticosteroids are given to nearly every GBM patient for oedema, and they blunt the benefit of checkpoint blockade; temozolomide and radiation add further lymphodepletion. The standard of care therefore works against the immunotherapy being tested on top of it — a confound the review argues has contributed to negative trials, and a reason neoadjuvant and steroid-sparing designs are being pursued.',
    therapy:
      'Steroid-sparing oedema management; neoadjuvant immunotherapy before lymphodepleting therapy.',
  },
  {
    id: 'exhaustion',
    layer: 'tcell',
    kind: 'state',
    at: 'cd8',
    label: 'Exhaustion · anergy · senescence',
    anchor: { dx: -52, dy: -32 },
    lab: { dx: -148, dy: -52 },
    title: 'Five distinct forms of T-cell dysfunction',
    molecules: ['TOX / EOMES', 'CD57 / KLRG1', 'Multiple checkpoints'],
    summary:
      'The review insists on separating ignorance, tolerance, anergy, exhaustion and senescence — they look alike in a tissue section and need different treatments.',
    detail:
      'Ignorance means the antigen was never seen; tolerance, that the response was deleted centrally or peripherally; anergy, activation without co-stimulation; exhaustion, progressive loss of function under chronic antigen with inhibitory-receptor co-expression; senescence, terminal replicative arrest. Checkpoint blockade addresses exhaustion. Nothing in it fixes ignorance (a priming problem), tolerance (a repertoire problem) or senescence (irreversible) — which is a precise explanation for why anti-PD-1 monotherapy has underperformed in glioblastoma.',
    therapy:
      'Match the intervention to the lesion: vaccines and oncolytic viruses for ignorance, co-stimulation for anergy, checkpoints for exhaustion.',
  },
  {
    id: 'trafficking',
    layer: 'tcell',
    kind: 'state',
    at: 'vessel',
    label: 'BBB · impaired trafficking',
    anchor: { dx: 0, dy: 0 },
    lab: { dx: -150, dy: 260 },
    title: 'The blood–brain barrier and T-cell entry',
    molecules: ['Tight junctions', 'ICAM-1 / VCAM-1', 'Meningeal lymphatics'],
    summary:
      'Even a successful systemic response has to get in. Abnormal tumour vessels and restricted adhesion-molecule expression limit T-cell extravasation into the brain.',
    detail:
      'The CNS is immunologically distinct rather than immunologically privileged — meningeal lymphatics and routine immune surveillance exist — but access is genuinely restricted. VEGF-driven vessels express fewer of the adhesion molecules T cells need to stop and cross, and antigen drainage to lymph nodes is limited compared with peripheral tissue. Both ends of the loop, priming and delivery, are therefore constrained.',
    therapy:
      'Vascular normalisation, intratumoural or convection-enhanced delivery, local immunostimulation.',
  },
];

export const mechById = Object.fromEntries(MECHANISMS.map((m) => [m.id, m]));

/** Regions drawn behind the cells. */
export const REGIONS = {
  hypoxia: { cx: 288, cy: 206, r: 188 },
  vessel: { x: 1168, y: 0, w: 120, h: VIEW.h },
  marrow: { cx: 138, cy: 744, r: 104 },
};

/* ---------------------------------------------------------------- walkthrough */

export const CHAPTERS = [
  {
    id: 'intro',
    layers: [],
    title: 'A tumour that builds its own defence',
    text:
      'Glioblastoma is the model system for immunotherapy resistance. Checkpoint blockade transformed melanoma and lung cancer and did essentially nothing here. This map lays out why, following Jackson, Choi and Lim’s 2019 review in Nature Immunology. Start the walkthrough to take the mechanisms one layer at a time, or explore freely — click any cell or any labelled mechanism.',
  },
  {
    id: 'antigen',
    layers: ['antigen'],
    title: '1 · Nothing to see',
    text:
      'Begin upstream. GBM carries few mutations, so there are few neoantigens; those it has are regionally heterogeneous and can be lost under pressure, as the EGFRvIII vaccine experience showed. MHC class I is downregulated, and dendritic cells are held immature by tumour-derived VEGF, IL-10 and TGF-β — so priming fails before any checkpoint becomes relevant.',
  },
  {
    id: 'checkpoint',
    layers: ['checkpoint'],
    title: '2 · Brakes at the membrane',
    text:
      'For the T cells that do recognise the tumour, the synapse is crowded with inhibitory pairs: PD-L1/PD-1, galectin-9/TIM-3, MHC-II/LAG-3, CD155/TIGIT, and Treg CTLA-4 stripping co-stimulation from dendritic cells. Note where the PD-L1 comes from — most of it is myeloid, not tumour. Block one and another rises in its place.',
  },
  {
    id: 'myeloid',
    layers: ['myeloid', 'cytokine'],
    title: '3 · A myeloid organ',
    text:
      'Myeloid cells make up a third to a half of a glioblastoma. CSF-1, periostin, CCL2 and GM-CSF both recruit them and polarise them to an M2-like state, in which they become the tumour’s enforcement arm — PD-L1, IL-10, TGF-β and arginase from a single cell type. GBM is less a T-cell-poor tumour than a myeloid-dominated one.',
  },
  {
    id: 'metabolic',
    layers: ['metabolic'],
    title: '4 · Suppression by chemistry',
    text:
      'Some of the strongest suppression never touches a receptor. IDO1 consumes tryptophan and makes kynurenine; arginase strips L-arginine; NO and ROS nitrate the T-cell receptor itself; CD39 and CD73 convert alarm-signal ATP into inhibitory adenosine. No checkpoint antibody addresses any of this.',
  },
  {
    id: 'hypoxia',
    layers: ['hypoxia'],
    title: '5 · The amplifier',
    text:
      'Hypoxia in the necrotic core is an active immunological programme. HIF-1α raises PD-L1, VEGF, CXCL12 and CD73 simultaneously, recruits myeloid cells, polarises them, and maintains glioma stem cells. One upstream switch feeds every layer below it — and VEGF-driven vessels then keep T cells from entering at all.',
  },
  {
    id: 'tcell',
    layers: ['tcell'],
    title: '6 · The cells that never arrive',
    text:
      'Finally, look outside the tumour. Naive T cells lose surface S1P1 and are trapped in the bone marrow, so GBM lymphopenia is partly a trafficking defect rather than destruction. Dexamethasone and temozolomide deplete lymphocytes further. And "dysfunction" is five different states — only one of which, exhaustion, is what checkpoint blockade treats.',
  },
  {
    id: 'all',
    layers: ['checkpoint', 'antigen', 'cytokine', 'myeloid', 'metabolic', 'hypoxia', 'tcell'],
    title: 'Everything at once',
    text:
      'This is the argument of the review in one picture. These mechanisms are parallel and redundant, not sequential, which is why removing any single one leaves the others intact — and why the next generation of GBM immunotherapy will have to be combinatorial, correctly timed, and matched to the specific lesion in each patient.',
  },
];
