# The glioblastoma immune microenvironment

An interactive map of immunosuppression and immunotherapy resistance in GBM,
built for display on a lab website.

Scientific content follows **Jackson CM, Choi J, Lim M.** *Mechanisms of
immunotherapy resistance: lessons from glioblastoma.* Nature Immunology
2019;20(9):1100–1109. [doi:10.1038/s41590-019-0433-y](https://doi.org/10.1038/s41590-019-0433-y)
· [PMID 31358997](https://pubmed.ncbi.nlm.nih.gov/31358997/)

![The figure, with all seven mechanism layers visible](docs/preview.jpg)

## What it shows

Ten cell types in the tumour niche — GBM cell, glioma stem cell, CD8⁺ T cell,
Treg, NK cell, dendritic cell, tumour-associated macrophage, microglia, MDSC
and marrow-sequestered naive T cells — plus a hypoxic/perinecrotic niche, the
vasculature and the bone-marrow compartment.

**26 mechanisms across 7 toggleable layers:**

| Layer | Covers |
| --- | --- |
| Immune checkpoints | PD-1/PD-L1 (tumour and myeloid), CTLA-4, TIM-3, LAG-3, TIGIT, CD47/SIRPα |
| Antigen presentation | MHC-I loss, low TMB and heterogeneity, DC maturation arrest |
| Cytokines & chemokines | TGF-β, IL-10/IL-6, CCL2/CXCL1-2, CSF-1/GM-CSF/periostin |
| Myeloid reprogramming | M2-like polarisation, myeloid dominance of the infiltrate |
| Metabolic suppression | IDO1/kynurenine, ARG1/iNOS/ROS, CD39-CD73/adenosine, 2-HG |
| Hypoxia & vasculature | HIF-1α programme, CXCL12 recruitment, VEGF and abnormal vessels |
| T-cell dysfunction | S1P1 marrow sequestration, steroid/TMZ lymphodepletion, five dysfunction states, BBB trafficking |

Each mechanism opens a panel with a plain-language summary, the molecules
involved, the detail as the review frames it, and the therapeutic angle.

## Reading modes

- **Guided walkthrough** — eight chapters that build the argument one layer at
  a time, from "nothing to see" through to "everything at once".
- **Free exploration** — hover any cell to isolate everything it participates
  in; click any label for the full entry; toggle layers in the left rail.
- **Deep links** — `#m/<mechanism-id>` or `#c/<cell-id>` opens the figure with
  that item selected, e.g. `…/gbm-map/#m/pd1` or `#c/tam`. Useful for linking
  from a paper summary or a teaching page.

## Four ways to run it

**1 · Mac app** — double-click, no terminal, works offline.

```bash
npm run app
```

Builds `desktop/GBM Immune Map.app`. Drag it to Applications or the Dock. It
opens the figure in its own chromeless window (Chrome/Edge/Brave app mode if
one is installed, otherwise the default browser). The whole figure is one HTML
file inside the bundle — about 1 MB, no server, no Node, no network.

**2 · Development** — for editing the science or the design.

```bash
npm install
npm run dev     # http://localhost:5173, hot reload
```

**3 · On the lab website** — a static bundle, no backend.

```bash
npm run build   # dist/ — ~27 kB gzipped, no image assets
```

Asset paths are relative, so `dist/` works from any sub-path. To embed it in
an existing page:

```html
<iframe src="/gbm-map/" title="GBM immune microenvironment"
        style="width:100%;height:820px;border:0"></iframe>
```

**4 · A single file** — for emailing, or for a CMS that takes one upload.

```bash
npm run build:artifact
```

Writes `dist/standalone.html` (complete document, double-clickable) and
`dist/artifact.html` (the same page as a fragment, for publishing platforms
that supply their own document skeleton).

## How it is put together

```
src/
  data/model.js      all scientific content, cell positions, layers, chapters
  render/cells.js    procedural cell anatomy — membranes, nuclei, granules,
                     dendrites, ramified processes, endothelium
  render/scene.js    scene assembly, connector geometry, label de-collision,
                     pan/zoom
  main.js            state, layer filtering, hover isolation, panel, walkthrough
  styles/app.css     layout and visual design
```

**Editing the science.** Everything a reader sees lives in `src/data/model.js`.
To add a mechanism, append an entry to `MECHANISMS` with a `layer`, a `kind`
(`synapse` for receptor–ligand pairs, `soluble` for secreted factors, `state`
for intrinsic cell properties), the cells it connects, and its text. Labels
place themselves: authored offsets are treated as preferences and a relaxation
pass in `relaxLabels()` keeps pills from colliding with each other or with
cells, for any combination of visible layers.

**The artwork is code.** `render/cells.js` generates each cell from seeded
noise — Catmull-Rom membrane outlines that morph via SMIL, gradient-shaded
nuclei with chromatin and nucleoli, cytoplasmic vesicles, NK granules,
macrophage ruffles and vacuoles, recursive microglial arbors, dendritic
processes, and a flattened endothelial lining with tight junctions. Nothing is
a bitmap, so it stays sharp at any zoom and prints cleanly for posters.

Animation is declarative (SMIL + CSS) rather than JavaScript-driven, so the
figure is cheap to leave running on a page, and `prefers-reduced-motion` is
respected.

## Notes

- `legacy/` holds the previous implementation and its image assets; nothing in
  the current build references it, and it can be deleted at any time.

## Published link

A private, shareable copy of the figure is published at
<https://claude.ai/artifact/KsEnaYGen9xdbSFyQ5jejZ>. Only you can open it
until you share it from the page's Share menu. Republish after changes with
`npm run build:artifact`, then publish `dist/artifact.html` to the same URL.
