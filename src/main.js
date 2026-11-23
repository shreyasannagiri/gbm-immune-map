/**
 * Interaction layer: layer filtering, hover isolation, selection, detail
 * panel, and the guided walkthrough.
 */

import {
  CELLS,
  CHAPTERS,
  CREDIT,
  LAB,
  LAYERS,
  MECHANISMS,
  PAPER,
  PRIMARY_REF,
  cellById,
  figureCitation,
  formatCitation,
  layerById,
  mechById,
  refsFor,
} from './data/model.js';
import { buildScene, attachViewControls, relaxLabels } from './render/scene.js';

/* ------------------------------------------------------------------ state */

const state = {
  active: new Set(LAYERS.map((l) => l.id)), // visible mechanism layers
  selection: null, // { type: 'cell'|'mech', id }
  hover: null,
  tour: -1, // -1 = off
};

/** cell id → mechanisms that touch it */
const mechsByCell = {};
for (const m of MECHANISMS) {
  for (const id of [m.from, m.to, m.at].filter(Boolean)) {
    (mechsByCell[id] ||= []).push(m);
  }
}

const host = document.getElementById('scene-host');
const panel = document.getElementById('panel');
const { svg, world } = buildScene(host);
const viewCtl = attachViewControls(svg, world);

/* ------------------------------------------------------------- left rail */

function buildLayerList() {
  const wrap = document.getElementById('layer-list');
  wrap.innerHTML = LAYERS.map((l) => {
    const n = MECHANISMS.filter((m) => m.layer === l.id).length;
    return `<button class="layer-chip" data-layer="${l.id}" aria-pressed="true"
        style="--c:${l.color}">
      <span class="swatch"></span>
      <span class="layer-name">${l.name}</span>
      <span class="layer-count">${n}</span>
    </button>`;
  }).join('');

  wrap.addEventListener('click', (e) => {
    const chip = e.target.closest('.layer-chip');
    if (!chip) return;
    const id = chip.dataset.layer;
    if (state.active.has(id)) state.active.delete(id);
    else state.active.add(id);
    exitTour();
    render();
  });

  wrap.addEventListener('pointerover', (e) => {
    const chip = e.target.closest('.layer-chip');
    if (chip) svg.dataset.hoverLayer = chip.dataset.layer;
  });
  wrap.addEventListener('pointerout', (e) => {
    if (e.target.closest('.layer-chip')) delete svg.dataset.hoverLayer;
  });
}

function buildCellList() {
  const wrap = document.getElementById('cell-list');
  wrap.innerHTML = CELLS.map(
    (c) => `<button class="cell-chip" data-cell="${c.id}" style="--c:${c.color}">
      <span class="swatch"></span>
      <span class="cell-chip-name">${c.name}</span>
    </button>`
  ).join('');

  wrap.addEventListener('click', (e) => {
    const chip = e.target.closest('.cell-chip');
    if (chip) select('cell', chip.dataset.cell);
  });
  wrap.addEventListener('pointerover', (e) => {
    const chip = e.target.closest('.cell-chip');
    if (chip) setHover('cell', chip.dataset.cell);
  });
  wrap.addEventListener('pointerout', (e) => {
    if (e.target.closest('.cell-chip')) setHover(null);
  });
}

document.getElementById('citation').innerHTML =
  `${PRIMARY_REF.authors}. <em>${PRIMARY_REF.title}.</em>
   ${PRIMARY_REF.journalAbbrev}. ${PRIMARY_REF.year};${PRIMARY_REF.volume}(${PRIMARY_REF.issue}):${PRIMARY_REF.pages}.
   <span class="cite-links">
     <a href="${PRIMARY_REF.doiUrl}" target="_blank" rel="noopener">doi:${PRIMARY_REF.doi}</a> ·
     <a href="${PRIMARY_REF.pubmed}" target="_blank" rel="noopener">PMID ${PRIMARY_REF.pmid}</a>
   </span>`;

document.getElementById('credit').innerHTML =
  `${CREDIT.author} · ${LAB.name}<br /><span class="credit-dept">${LAB.department}, ${LAB.institution}</span>`;

const layersToggle = document.getElementById('layers-toggle');
layersToggle.addEventListener('click', () => {
  if (state.active.size === LAYERS.length) state.active.clear();
  else state.active = new Set(LAYERS.map((l) => l.id));
  exitTour();
  render();
});

/* ------------------------------------------------------------ interaction */

function setHover(type, id) {
  const next = type ? `${type}:${id}` : null;
  if (state.hover === next) return;
  state.hover = next;
  renderHighlight();
}

function select(type, id, { updateHash = true } = {}) {
  state.selection = type ? { type, id } : null;
  if (updateHash) {
    // deep link, so a lab page can point straight at one mechanism or cell
    const hash = type ? `#${type === 'mech' ? 'm' : 'c'}/${id}` : '';
    history.replaceState(null, '', hash || location.pathname + location.search);
  }
  renderHighlight();
  renderPanel();
  if (type === 'cell') {
    document.querySelectorAll('.cell-chip').forEach((c) =>
      c.classList.toggle('is-sel', c.dataset.cell === id)
    );
  } else {
    document.querySelectorAll('.cell-chip').forEach((c) => c.classList.remove('is-sel'));
  }
}

// Pointer wiring on the scene
svg.addEventListener('pointerover', (e) => {
  const mech = e.target.closest('[data-mech]');
  if (mech) return setHover('mech', mech.dataset.mech);
  const cell = e.target.closest('[data-cell]');
  if (cell) return setHover('cell', cell.dataset.cell);
  setHover(null);
});
svg.addEventListener('pointerout', (e) => {
  if (!e.relatedTarget || !svg.contains(e.relatedTarget)) setHover(null);
});

svg.addEventListener('click', (e) => {
  if (viewCtl.wasDrag()) return;
  const mech = e.target.closest('[data-mech]');
  if (mech) return select('mech', mech.dataset.mech);
  const cell = e.target.closest('[data-cell]');
  if (cell) return select('cell', cell.dataset.cell);
  select(null);
});

svg.addEventListener('keydown', (e) => {
  if (e.key !== 'Enter' && e.key !== ' ') return;
  const t = e.target.closest('[data-mech], [data-cell]');
  if (!t) return;
  e.preventDefault();
  if (t.dataset.mech) select('mech', t.dataset.mech);
  else select('cell', t.dataset.cell);
});

document.addEventListener('keydown', (e) => {
  if (e.key === 'Escape') {
    if (state.tour >= 0) exitTour();
    else select(null);
  }
  if (state.tour >= 0) {
    if (e.key === 'ArrowRight') gotoChapter(state.tour + 1);
    if (e.key === 'ArrowLeft') gotoChapter(state.tour - 1);
  }
});

/* --------------------------------------------------------------- rendering */

function render() {
  // layer visibility
  LAYERS.forEach((l) => svg.classList.toggle(`hide-${l.id}`, !state.active.has(l.id)));
  document.querySelectorAll('.layer-chip').forEach((chip) => {
    const on = state.active.has(chip.dataset.layer);
    chip.classList.toggle('is-off', !on);
    chip.setAttribute('aria-pressed', String(on));
  });
  layersToggle.textContent = state.active.size === LAYERS.length ? 'none' : 'all';

  // a selection in a hidden layer is no longer meaningful
  if (state.selection?.type === 'mech') {
    const m = mechById[state.selection.id];
    if (m && !state.active.has(m.layer)) state.selection = null;
  }
  relaxLabels(svg, state.active);
  renderHighlight();
  renderPanel();
}

/** Dim everything unrelated to the hovered / selected element. */
function renderHighlight() {
  const focus = state.hover || (state.selection ? `${state.selection.type}:${state.selection.id}` : null);

  svg.querySelectorAll('.is-focus, .is-related, .is-faded').forEach((n) =>
    n.classList.remove('is-focus', 'is-related', 'is-faded')
  );
  svg.classList.toggle('has-focus', Boolean(focus));
  if (!focus) return;

  const [type, id] = focus.split(':');
  const relMechs = new Set();
  const relCells = new Set();

  if (type === 'cell') {
    relCells.add(id);
    (mechsByCell[id] || [])
      .filter((m) => state.active.has(m.layer))
      .forEach((m) => {
        relMechs.add(m.id);
        [m.from, m.to, m.at].filter(Boolean).forEach((c) => relCells.add(c));
      });
  } else {
    const m = mechById[id];
    if (m) {
      relMechs.add(m.id);
      [m.from, m.to, m.at].filter(Boolean).forEach((c) => relCells.add(c));
    }
  }

  svg.querySelectorAll('[data-mech]').forEach((n) => {
    const on = relMechs.has(n.dataset.mech);
    n.classList.add(on ? (type === 'mech' ? 'is-focus' : 'is-related') : 'is-faded');
  });
  svg.querySelectorAll('.cell, .cell-label').forEach((n) => {
    const on = relCells.has(n.dataset.cell);
    n.classList.add(on ? (type === 'cell' && n.dataset.cell === id ? 'is-focus' : 'is-related') : 'is-faded');
  });
}

/* -------------------------------------------------------------- the panel */

const tag = (l) =>
  `<span class="tag" style="--c:${layerById[l].color}">${layerById[l].short}</span>`;

function mechRow(m) {
  // the clause after the em dash is the readable gloss; fall back to the title
  const parts = m.title.split('—');
  let sub = (parts.length > 1 ? parts[1] : parts[0]).trim();
  sub = sub.charAt(0).toUpperCase() + sub.slice(1);
  return `<button class="mech-row" data-jump-mech="${m.id}" style="--c:${layerById[m.layer].color}">
    <span class="row-dot"></span>
    <span class="row-text">
      <span class="row-title">${m.label}</span>
      <span class="row-sub">${sub}</span>
    </span>
  </button>`;
}

function renderPanel() {
  if (state.tour >= 0) return renderTourPanel();

  if (!state.selection) {
    const intro = CHAPTERS[0];
    panel.innerHTML = `
      <div class="panel-inner">
        <p class="eyebrow">Interactive figure</p>
        <h2 class="panel-h">${intro.title}</h2>
        <p class="lede">${intro.text}</p>

        <div class="how-to">
          <h3>How to read this map</h3>
          <ul>
            <li><b>Cells</b> are drawn as cells — hover one to isolate everything it does.</li>
            <li><b>Solid connectors</b> with paired glyphs are membrane receptor–ligand interactions.</li>
            <li><b>Dashed connectors</b> with travelling particles are secreted factors.</li>
            <li><b>Pulsing dots</b> mark intrinsic cell states rather than interactions.</li>
            <li>Toggle <b>layers</b> at the left to take one mechanism class at a time.</li>
          </ul>
        </div>

        <div class="layer-key">
          ${LAYERS.map(
            (l) => `<div class="key-row" style="--c:${l.color}">
              <span class="swatch"></span>
              <div><b>${l.name}</b><p>${l.blurb}</p></div>
            </div>`
          ).join('')}
        </div>

        <section class="source-block">
          <h3>The source</h3>
          <p class="source-cite">
            ${PRIMARY_REF.authors}.
            <em>${PRIMARY_REF.title}.</em>
            ${PRIMARY_REF.journal}. ${PRIMARY_REF.year};${PRIMARY_REF.volume}(${PRIMARY_REF.issue}):${PRIMARY_REF.pages}.
          </p>
          <p class="source-links">
            <a href="${PRIMARY_REF.doiUrl}" target="_blank" rel="noopener">doi:${PRIMARY_REF.doi}</a>
            <a href="${PRIMARY_REF.pubmed}" target="_blank" rel="noopener">PubMed ${PRIMARY_REF.pmid}</a>
          </p>
          <p class="source-note">
            Every cell, mechanism and claim on this map is drawn from this review.
            The figure is an interpretation of that paper for teaching and
            discussion — it reports no new data. Where the review cites primary
            work, follow its reference list.
          </p>

          <h3 class="cite-this-h">Cite this figure</h3>
          <p class="cite-this" id="cite-this">${figureCitation()}</p>
          <button class="copy-btn" id="copy-cite" type="button">Copy citation</button>
        </section>

        <p class="panel-credit">
          Built by ${CREDIT.author} · ${LAB.name}, ${LAB.department},
          ${LAB.institution}
        </p>
      </div>`;
    return;
  }

  if (state.selection.type === 'cell') {
    const c = cellById[state.selection.id];
    const mechs = (mechsByCell[c.id] || []).filter((m) => state.active.has(m.layer));
    const byLayer = LAYERS.map((l) => [l, mechs.filter((m) => m.layer === l.id)]).filter(
      ([, ms]) => ms.length
    );
    panel.innerHTML = `
      <div class="panel-inner">
        <button class="back-btn" data-back>← Overview</button>
        <p class="eyebrow" style="--c:${c.color}"><span class="swatch"></span> Cell</p>
        <h2 class="panel-h">${c.name}</h2>
        <p class="role">${c.role}</p>
        <p class="body">${c.body}</p>
        <h3 class="sect">Key points</h3>
        <ul class="facts">${c.facts.map((f) => `<li>${f}</li>`).join('')}</ul>
        ${
          byLayer.length
            ? `<h3 class="sect">Mechanisms involving this cell <span class="count">${mechs.length}</span></h3>
               ${byLayer
                 .map(
                   ([l, ms]) =>
                     `<div class="row-group"><p class="row-group-h">${tag(l.id)}</p>${ms
                       .map(mechRow)
                       .join('')}</div>`
                 )
                 .join('')}`
            : `<p class="muted">No mechanisms visible — enable more layers at the left.</p>`
        }
      </div>`;
    return;
  }

  const m = mechById[state.selection.id];
  const parts = [m.from, m.to, m.at].filter(Boolean).map((id) => cellById[id]).filter(Boolean);
  panel.innerHTML = `
    <div class="panel-inner">
      <button class="back-btn" data-back>← Overview</button>
      <p class="eyebrow">${tag(m.layer)}<span class="kind">${
        { synapse: 'Receptor–ligand', soluble: 'Secreted factor', state: 'Cell state' }[m.kind]
      }</span></p>
      <h2 class="panel-h">${m.title}</h2>
      <p class="lede">${m.summary}</p>

      ${
        parts.length
          ? `<div class="actors">${parts
              .map(
                (c, i) => `${i ? '<span class="arrow">→</span>' : ''}
                <button class="actor" data-jump-cell="${c.id}" style="--c:${c.color}">
                  <span class="swatch"></span>${c.name}
                </button>`
              )
              .join('')}</div>`
          : ''
      }

      <h3 class="sect">Molecules</h3>
      <div class="chips">${m.molecules.map((x) => `<span class="chip">${x}</span>`).join('')}</div>

      <h3 class="sect">In the review</h3>
      <p class="body">${m.detail}</p>

      <div class="therapy">
        <h3>Therapeutic angle</h3>
        <p>${m.therapy}</p>
      </div>

      <p class="mech-source">
        Source:
        ${refsFor(m)
          .map(
            (r) =>
              `<a href="${r.doiUrl}" target="_blank" rel="noopener">${r.short}</a>`
          )
          .join(', ')}
      </p>

      <h3 class="sect">Also in this layer</h3>
      ${MECHANISMS.filter((x) => x.layer === m.layer && x.id !== m.id && state.active.has(x.layer))
        .map(mechRow)
        .join('')}
    </div>`;
}

panel.addEventListener('click', async (e) => {
  const copy = e.target.closest('#copy-cite');
  if (copy) {
    try {
      await navigator.clipboard.writeText(figureCitation());
      copy.textContent = 'Copied';
    } catch {
      // clipboard blocked (http, or an embedded frame) — select it instead
      const node = document.getElementById('cite-this');
      const range = document.createRange();
      range.selectNodeContents(node);
      const sel = window.getSelection();
      sel.removeAllRanges();
      sel.addRange(range);
      copy.textContent = 'Selected — press Cmd-C';
    }
    setTimeout(() => (copy.textContent = 'Copy citation'), 2400);
    return;
  }
  const jm = e.target.closest('[data-jump-mech]');
  if (jm) return select('mech', jm.dataset.jumpMech);
  const jc = e.target.closest('[data-jump-cell]');
  if (jc) return select('cell', jc.dataset.jumpCell);
  if (e.target.closest('[data-back]')) return select(null);
});
panel.addEventListener('pointerover', (e) => {
  const jm = e.target.closest('[data-jump-mech]');
  if (jm) return setHover('mech', jm.dataset.jumpMech);
  const jc = e.target.closest('[data-jump-cell]');
  if (jc) return setHover('cell', jc.dataset.jumpCell);
});
panel.addEventListener('pointerout', (e) => {
  if (e.target.closest('[data-jump-mech], [data-jump-cell]')) setHover(null);
});

/* ---------------------------------------------------------- walkthrough */

const tourBar = document.getElementById('tour-bar');
const tourBtn = document.getElementById('tour-btn');
const tourDots = document.getElementById('tour-dots');

tourDots.innerHTML = CHAPTERS.map(
  (c, i) => `<button class="tour-dot" data-chapter="${i}" title="${c.title}"></button>`
).join('');
tourDots.addEventListener('click', (e) => {
  const d = e.target.closest('.tour-dot');
  if (d) gotoChapter(Number(d.dataset.chapter));
});

tourBtn.addEventListener('click', () => (state.tour >= 0 ? exitTour() : gotoChapter(0)));
document.getElementById('tour-next').addEventListener('click', () => gotoChapter(state.tour + 1));
document.getElementById('tour-prev').addEventListener('click', () => gotoChapter(state.tour - 1));
document.getElementById('tour-exit').addEventListener('click', exitTour);

function gotoChapter(i) {
  if (i < 0 || i >= CHAPTERS.length) return;
  state.tour = i;
  state.selection = null;
  const ch = CHAPTERS[i];
  state.active = new Set(ch.layers);
  LAYERS.forEach((l) => svg.classList.toggle(`hide-${l.id}`, !state.active.has(l.id)));
  document.querySelectorAll('.layer-chip').forEach((chip) => {
    const on = state.active.has(chip.dataset.layer);
    chip.classList.toggle('is-off', !on);
    chip.setAttribute('aria-pressed', String(on));
  });
  document.querySelectorAll('.tour-dot').forEach((d, j) => d.classList.toggle('is-on', j === i));
  relaxLabels(svg, state.active);
  tourBar.hidden = false;
  tourBtn.classList.add('is-on');
  tourBtn.innerHTML = '<span class="btn-icon" aria-hidden="true">■</span> Exit walkthrough';
  document.getElementById('tour-prev').disabled = i === 0;
  document.getElementById('tour-next').disabled = i === CHAPTERS.length - 1;
  renderHighlight();
  renderTourPanel();
}

function renderTourPanel() {
  const ch = CHAPTERS[state.tour];
  const mechs = MECHANISMS.filter((m) => state.active.has(m.layer));
  panel.innerHTML = `
    <div class="panel-inner">
      <p class="eyebrow">Walkthrough · step ${state.tour + 1} of ${CHAPTERS.length}</p>
      <h2 class="panel-h">${ch.title}</h2>
      <p class="lede">${ch.text}</p>
      ${
        mechs.length
          ? `<h3 class="sect">On the map now <span class="count">${mechs.length}</span></h3>
             ${mechs.map(mechRow).join('')}`
          : ''
      }
      <p class="tour-nudge">Click anything on the map to read it in full — the walkthrough stays where you left it.</p>
    </div>`;
}

function exitTour() {
  if (state.tour < 0) return;
  state.tour = -1;
  tourBar.hidden = true;
  tourBtn.classList.remove('is-on');
  tourBtn.innerHTML = '<span class="btn-icon" aria-hidden="true">▶</span> Start walkthrough';
  document.querySelectorAll('.tour-dot').forEach((d) => d.classList.remove('is-on'));
  state.active = new Set(LAYERS.map((l) => l.id));
  render();
}

/* ------------------------------------------------------------- view ctls */

document.getElementById('zoom-in').addEventListener('click', () => viewCtl.zoom(1.3));
document.getElementById('zoom-out').addEventListener('click', () => viewCtl.zoom(1 / 1.3));
document.getElementById('zoom-reset').addEventListener('click', () => viewCtl.reset());

/* -------------------------------------------------------------------- go */

buildLayerList();
buildCellList();
render();

/** Open whatever the URL points at: #m/<mechanism> or #c/<cell>. */
function applyHash() {
  const m = /^#(m|c)\/([\w-]+)$/.exec(location.hash);
  if (!m) return;
  const [, kind, id] = m;
  if (kind === 'm' && mechById[id]) select('mech', id, { updateHash: false });
  if (kind === 'c' && cellById[id]) select('cell', id, { updateHash: false });
}

applyHash();
window.addEventListener('hashchange', applyHash);

// keep labels legible when the figure is resized
let resizeTimer;
window.addEventListener('resize', () => {
  clearTimeout(resizeTimer);
  resizeTimer = setTimeout(() => relaxLabels(svg, state.active), 150);
});
