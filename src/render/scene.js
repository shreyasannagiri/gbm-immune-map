/**
 * Scene construction: background niches, cells, mechanism connectors,
 * receptor/ligand glyphs, labels and hit targets.
 *
 * Animation is declarative (SMIL + CSS) rather than rAF-driven, so the figure
 * is cheap enough to sit on a lab homepage and keeps running while idle.
 */

import { CELLS, MECHANISMS, REGIONS, VIEW, layerById } from '../data/model.js';
import { cellArt, endotheliumArt, rbcArt, alpha, shade, blob } from './cells.js';

const SVGNS = 'http://www.w3.org/2000/svg';

/** Pseudo-cells: anchors that are places rather than cells. */
const PSEUDO = {
  vessel: { id: 'vessel', x: 1206, y: 330, r: 44 },
};

function anchorFor(id) {
  return CELLS.find((c) => c.id === id) || PSEUDO[id];
}

function el(tag, attrs = {}, html = null) {
  const n = document.createElementNS(SVGNS, tag);
  for (const [k, v] of Object.entries(attrs)) n.setAttribute(k, v);
  if (html !== null) n.innerHTML = html;
  return n;
}

const norm = (x, y) => {
  const l = Math.hypot(x, y) || 1;
  return [x / l, y / l];
};

/* --------------------------------------------------------------- geometry */

/**
 * Connector between two cells: a quadratic curve whose endpoints sit on the
 * membranes, with its control point either perpendicular (`bend`) or
 * explicitly authored (`via`).
 */
function connector(m) {
  const A = anchorFor(m.from);
  const B = anchorFor(m.to);
  if (!A || !B) return null;

  let ctrl;
  if (m.via) {
    ctrl = [m.via.x, m.via.y];
  } else {
    const [ux, uy] = norm(B.x - A.x, B.y - A.y);
    const bend = m.bend || 0;
    ctrl = [(A.x + B.x) / 2 - uy * bend, (A.y + B.y) / 2 + ux * bend];
  }

  const [d1x, d1y] = norm(ctrl[0] - A.x, ctrl[1] - A.y);
  const [d2x, d2y] = norm(ctrl[0] - B.x, ctrl[1] - B.y);
  const gap = m.kind === 'synapse' ? 9 : 4;
  const start = [A.x + d1x * (A.r + gap), A.y + d1y * (A.r + gap)];
  const end = [B.x + d2x * (B.r + gap), B.y + d2y * (B.r + gap)];

  // quadratic midpoint, for label and glyph placement
  const mid = [
    0.25 * start[0] + 0.5 * ctrl[0] + 0.25 * end[0],
    0.25 * start[1] + 0.5 * ctrl[1] + 0.25 * end[1],
  ];

  return {
    d: `M ${start[0].toFixed(1)} ${start[1].toFixed(1)} Q ${ctrl[0].toFixed(1)} ${ctrl[1].toFixed(1)} ${end[0].toFixed(1)} ${end[1].toFixed(1)}`,
    start,
    end,
    ctrl,
    mid,
    angleStart: (Math.atan2(d1y, d1x) * 180) / Math.PI,
    angleEnd: (Math.atan2(d2y, d2x) * 180) / Math.PI,
  };
}

/* ------------------------------------------------------------- background */

function buildDefs() {
  const H = REGIONS.hypoxia;
  return `
  <radialGradient id="bg-field" cx="48%" cy="44%" r="62%">
    <stop offset="0%"   stop-color="#152a3a"/>
    <stop offset="55%"  stop-color="#0d1a26"/>
    <stop offset="100%" stop-color="#070e15"/>
  </radialGradient>

  <radialGradient id="hypoxia-grad" cx="50%" cy="50%" r="50%">
    <stop offset="0%"   stop-color="rgba(74,46,110,0.85)"/>
    <stop offset="42%"  stop-color="rgba(58,38,92,0.55)"/>
    <stop offset="78%"  stop-color="rgba(44,34,74,0.22)"/>
    <stop offset="100%" stop-color="rgba(40,32,70,0)"/>
  </radialGradient>

  <radialGradient id="necrosis-grad" cx="50%" cy="50%" r="50%">
    <stop offset="0%"   stop-color="rgba(22,14,30,0.9)"/>
    <stop offset="100%" stop-color="rgba(30,20,44,0)"/>
  </radialGradient>

  <linearGradient id="lumen" x1="0" y1="0" x2="1" y2="0">
    <stop offset="0%"   stop-color="rgba(120,30,52,0.1)"/>
    <stop offset="35%"  stop-color="rgba(150,40,66,0.4)"/>
    <stop offset="100%" stop-color="rgba(110,26,48,0.22)"/>
  </linearGradient>

  <radialGradient id="marrow-grad" cx="50%" cy="50%" r="50%">
    <stop offset="0%"   stop-color="rgba(60,72,96,0.6)"/>
    <stop offset="70%"  stop-color="rgba(44,54,74,0.3)"/>
    <stop offset="100%" stop-color="rgba(40,50,70,0)"/>
  </radialGradient>

  <filter id="soft" x="-40%" y="-40%" width="180%" height="180%">
    <feGaussianBlur stdDeviation="6"/>
  </filter>

  <filter id="grain" x="0" y="0" width="100%" height="100%">
    <feTurbulence type="fractalNoise" baseFrequency="0.9" numOctaves="3" seed="7"/>
    <feColorMatrix type="saturate" values="0"/>
    <feComponentTransfer><feFuncA type="linear" slope="0.055"/></feComponentTransfer>
  </filter>

  <filter id="cell-glow" x="-50%" y="-50%" width="200%" height="200%">
    <feGaussianBlur stdDeviation="7" result="b"/>
    <feMerge><feMergeNode in="b"/><feMergeNode in="SourceGraphic"/></feMerge>
  </filter>

  <marker id="arrow" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="5.5" markerHeight="5.5" orient="auto-start-reverse">
    <path d="M 0 1 L 9 5 L 0 9 z" fill="context-stroke"/>
  </marker>`;
}

/** Faint extracellular matrix: fibres and interstitial speckle. */
function ecmTexture() {
  let s = '';
  let seed = 1;
  const rand = () => {
    seed = (seed * 9301 + 49297) % 233280;
    return seed / 233280;
  };
  for (let i = 0; i < 46; i++) {
    const x = rand() * VIEW.w;
    const y = rand() * VIEW.h;
    const len = 40 + rand() * 150;
    const a = rand() * Math.PI;
    s += `<path d="M ${x.toFixed(0)} ${y.toFixed(0)} q ${(Math.cos(a) * len * 0.5).toFixed(0)} ${(Math.sin(a + 0.6) * len * 0.4).toFixed(0)} ${(Math.cos(a) * len).toFixed(0)} ${(Math.sin(a) * len).toFixed(0)}"
      fill="none" stroke="rgba(150,200,230,0.05)" stroke-width="1.1"/>`;
  }
  for (let i = 0; i < 150; i++) {
    s += `<circle cx="${(rand() * VIEW.w).toFixed(0)}" cy="${(rand() * VIEW.h).toFixed(0)}" r="${(0.6 + rand() * 1.5).toFixed(1)}"
      fill="rgba(170,215,245,${(0.03 + rand() * 0.07).toFixed(3)})"/>`;
  }
  return s;
}

function buildBackground() {
  const H = REGIONS.hypoxia;
  const V = REGIONS.vessel;
  const M = REGIONS.marrow;

  // trabecular bone inside the marrow cavity
  let trab = '';
  for (let i = 0; i < 11; i++) {
    const a = (i / 11) * Math.PI * 2 + 0.4;
    const r0 = 26 + (i % 3) * 14;
    const r1 = 74 + (i % 4) * 11;
    const bow = (i % 2 ? 1 : -1) * 16;
    trab += `<path d="M ${(M.cx + Math.cos(a) * r0).toFixed(0)} ${(M.cy + Math.sin(a) * r0).toFixed(0)}
      Q ${(M.cx + Math.cos(a + 0.2) * ((r0 + r1) / 2) + bow).toFixed(0)} ${(M.cy + Math.sin(a + 0.2) * ((r0 + r1) / 2)).toFixed(0)}
        ${(M.cx + Math.cos(a) * r1).toFixed(0)} ${(M.cy + Math.sin(a) * r1).toFixed(0)}"
      fill="none" stroke="rgba(228,216,196,0.16)" stroke-width="${3 + (i % 3)}" stroke-linecap="round"/>`;
  }

  return `
  <rect x="0" y="0" width="${VIEW.w}" height="${VIEW.h}" fill="url(#bg-field)"/>
  <g opacity="0.9">${ecmTexture()}</g>
  <rect x="0" y="0" width="${VIEW.w}" height="${VIEW.h}" filter="url(#grain)" opacity="0.5" pointer-events="none"/>

  <!-- hypoxic / perinecrotic niche -->
  <g class="region" data-region="hypoxia">
    <circle cx="${H.cx}" cy="${H.cy}" r="${H.r}" fill="url(#hypoxia-grad)">
      <animate attributeName="r" values="${H.r};${H.r + 10};${H.r}" dur="12s" repeatCount="indefinite"/>
    </circle>
    <circle cx="${H.cx - 10}" cy="${H.cy + 14}" r="${H.r * 0.44}" fill="url(#necrosis-grad)"/>
    <circle cx="${H.cx}" cy="${H.cy}" r="${H.r * 0.82}" fill="none"
      stroke="rgba(169,140,255,0.22)" stroke-width="1.4" stroke-dasharray="3 9"/>
    <text class="region-label" x="${H.cx - 128}" y="${H.cy - 150}">Hypoxic · perinecrotic niche</text>
  </g>

  <!-- blood vessel / blood–brain barrier -->
  <g class="region" data-region="vessel">
    <rect x="${V.x}" y="0" width="${V.w}" height="${V.h}" fill="url(#lumen)"/>
    <g clip-path="url(#vessel-clip)">${rbcArt(V.x + V.w * 0.62, V.h)}</g>
    <g clip-path="url(#vessel-clip)">${endotheliumArt(V.x + 6, V.h, 1)}</g>
    <text class="region-label" x="${V.x - 14}" y="26" text-anchor="end">Vasculature · blood–brain barrier</text>
  </g>

  <!-- bone marrow cavity: the compartment naive T cells cannot leave -->
  <g class="region" data-region="marrow">
    <circle cx="${M.cx}" cy="${M.cy}" r="${M.r}" fill="url(#marrow-grad)"/>
    <g opacity="0.9">${trab}</g>
    <circle cx="${M.cx}" cy="${M.cy}" r="${M.r}" fill="none"
      stroke="rgba(232,221,200,0.13)" stroke-width="17"/>
    <circle cx="${M.cx}" cy="${M.cy}" r="${M.r - 8}" fill="none"
      stroke="rgba(238,228,210,0.3)" stroke-width="1.6"/>
    <circle cx="${M.cx}" cy="${M.cy}" r="${M.r + 8.5}" fill="none"
      stroke="rgba(238,228,210,0.18)" stroke-width="1.2"/>
    <text class="region-label" x="${M.cx - 96}" y="${M.cy - M.r - 18}">Bone marrow</text>
  </g>`;
}

/* ------------------------------------------------------------------ cells */

function buildCells(root) {
  const g = el('g', { class: 'layer-cells' });
  const defs = [];

  CELLS.forEach((cell, i) => {
    const art = cellArt(cell, i);
    defs.push(art.defs);

    const wrap = el('g', {
      class: `cell cell-${cell.id}`,
      'data-cell': cell.id,
      transform: `translate(${cell.x} ${cell.y})`,
      tabindex: '0',
      role: 'button',
      'aria-label': cell.name,
    });

    // inner group drifts so the attribute transform above is preserved
    const drift = el('g', { class: 'drift' });
    drift.style.animationDuration = `${14 + i * 2.7}s`;
    drift.style.animationDelay = `${-i * 1.9}s`;
    drift.innerHTML = art.body;

    // generous invisible hit area
    const hit = el('circle', { r: cell.r * 1.05, fill: 'transparent', class: 'cell-hit' });

    wrap.append(drift, hit);
    g.appendChild(wrap);
  });

  // extra naive T cells in the marrow, decoration only
  const M = REGIONS.marrow;
  const extras = el('g', { class: 'marrow-extras' });
  [
    [M.cx + 52, M.cy + 30, 20],
    [M.cx - 48, M.cy + 46, 17],
    [M.cx + 14, M.cy + 64, 14],
  ].forEach(([x, y, r], i) => {
    extras.innerHTML += `<g transform="translate(${x} ${y})" opacity="0.72">
      <circle r="${r * 1.5}" fill="rgba(127,227,255,0.07)"/>
      <path d="${blob(r, { n: 14, wob: 0.07, seed: 60 + i })}" fill="rgba(127,227,255,0.3)"
        stroke="rgba(160,240,255,0.5)" stroke-width="1.2"/>
      <circle r="${r * 0.55}" fill="rgba(30,80,110,0.75)"/>
    </g>`;
  });
  g.appendChild(extras);

  return { group: g, defs: defs.join('\n') };
}

/* ------------------------------------------------------- mechanism layers */

function solubleParticles(id, pathId, color) {
  let out = '';
  const n = 5;
  for (let i = 0; i < n; i++) {
    const dur = 5.2 + (i % 3) * 1.1;
    const begin = -(i / n) * dur;
    const r = 3.1 + (i % 2) * 1.5;
    out += `<g class="particle">
      <circle r="${r}" fill="${alpha(color, 0.85)}"/>
      <circle r="${r * 2.3}" fill="${alpha(color, 0.18)}"/>
      <animateMotion dur="${dur}s" begin="${begin.toFixed(2)}s" repeatCount="indefinite"
        rotate="auto" keyPoints="0;1" keyTimes="0;1" calcMode="linear">
        <mpath href="#${pathId}" xlink:href="#${pathId}"/>
      </animateMotion>
      <animate attributeName="opacity" values="0;1;1;0" keyTimes="0;0.12;0.8;1"
        dur="${dur}s" begin="${begin.toFixed(2)}s" repeatCount="indefinite"/>
    </g>`;
  }
  return out;
}

/** Membrane-embedded receptor or ligand glyph. */
function glyph(x, y, angle, label, color, cls) {
  return `<g class="glyph ${cls}" transform="translate(${x.toFixed(1)} ${y.toFixed(1)}) rotate(${angle.toFixed(1)})">
    <rect x="-9" y="-4.6" width="18" height="9.2" rx="4.6"
      fill="${alpha(color, 0.92)}" stroke="rgba(255,255,255,0.75)" stroke-width="1"/>
    <rect x="-9" y="-4.6" width="18" height="9.2" rx="4.6" fill="none"
      stroke="${alpha(color, 0.5)}" stroke-width="4" class="glyph-halo"/>
    <text class="glyph-text" x="0" y="-9" transform="rotate(${-angle.toFixed(1)})">${label}</text>
  </g>`;
}

function buildMechanisms() {
  const gEdges = el('g', { class: 'layer-edges' });
  const gGlyphs = el('g', { class: 'layer-glyphs' });
  const gLabels = el('g', { class: 'layer-labels' });

  MECHANISMS.forEach((m) => {
    const layer = layerById[m.layer];
    const color = layer.color;
    const common = {
      class: `mech mech-${m.kind}`,
      'data-mech': m.id,
      'data-layer': m.layer,
    };

    if (m.kind === 'state') {
      const host = anchorFor(m.at);
      if (!host) return;
      const ax = host.x + (m.anchor?.dx || 0);
      const ay = host.y + (m.anchor?.dy || 0);
      const lx = host.x + (m.lab?.dx || 0);
      const ly = host.y + (m.lab?.dy || 0);

      const g = el('g', common);
      g.innerHTML = `
        <g class="state-marker" transform="translate(${ax.toFixed(1)} ${ay.toFixed(1)})">
          <circle r="13" fill="${alpha(color, 0.14)}" stroke="${alpha(color, 0.45)}" stroke-width="1.2">
            <animate attributeName="r" values="11;17;11" dur="3.4s" repeatCount="indefinite"/>
            <animate attributeName="opacity" values="0.9;0.25;0.9" dur="3.4s" repeatCount="indefinite"/>
          </circle>
          <circle r="5.2" fill="${alpha(color, 0.95)}" stroke="rgba(255,255,255,0.8)" stroke-width="1.1"/>
        </g>`;
      gEdges.appendChild(g);
      gLabels.appendChild(makeLabel(m, lx, ly, color, [ax, ay]));
      return;
    }

    const c = connector(m);
    if (!c) return;
    const pathId = `p-${m.id}`;

    const g = el('g', common);
    if (m.kind === 'soluble') {
      g.innerHTML = `
        <path id="${pathId}" class="edge-base" d="${c.d}" fill="none"
          stroke="${alpha(color, 0.34)}" stroke-width="2" stroke-dasharray="7 9" stroke-linecap="round"/>
        <path class="edge-hit" d="${c.d}" fill="none" stroke="transparent" stroke-width="22"/>
        <g class="particles">${solubleParticles(m.id, pathId, color)}</g>`;
    } else {
      g.innerHTML = `
        <path id="${pathId}" class="edge-base" d="${c.d}" fill="none"
          stroke="${alpha(color, 0.5)}" stroke-width="2.4" stroke-linecap="round"/>
        <path class="edge-pulse" d="${c.d}" fill="none" stroke="${alpha(color, 0.95)}"
          stroke-width="2.6" stroke-linecap="round" stroke-dasharray="14 150"/>
        <path class="edge-hit" d="${c.d}" fill="none" stroke="transparent" stroke-width="22"/>`;
    }
    gEdges.appendChild(g);

    if (m.kind === 'synapse') {
      const gg = el('g', common);
      gg.innerHTML =
        glyph(c.start[0], c.start[1], c.angleStart, m.ligand || '', color, 'ligand') +
        glyph(c.end[0], c.end[1], c.angleEnd + 180, m.receptor || '', color, 'receptor');
      gGlyphs.appendChild(gg);
    }

    const lx = c.mid[0] + (m.lab?.dx || 0);
    const ly = c.mid[1] + (m.lab?.dy || 0);
    gLabels.appendChild(makeLabel(m, lx, ly, color, c.mid));
  });

  return { gEdges, gGlyphs, gLabels };
}

/** Clickable pill label; width is fitted after insertion. */
function makeLabel(m, x, y, color, from = null) {
  const g = el('g', {
    class: 'mech-label',
    'data-mech': m.id,
    'data-layer': m.layer,
    transform: `translate(${x.toFixed(1)} ${y.toFixed(1)})`,
    tabindex: '0',
    role: 'button',
    'aria-label': m.title,
  });
  // remembered for the de-collision pass: preferred position and leader origin
  g.dataset.px = x.toFixed(1);
  g.dataset.py = y.toFixed(1);
  if (from) {
    g.dataset.fx = from[0].toFixed(1);
    g.dataset.fy = from[1].toFixed(1);
  }
  const lead = from
    ? `<path class="leader" d="M ${(from[0] - x).toFixed(1)} ${(from[1] - y).toFixed(1)} L 0 0"
        stroke="${alpha(color, 0.42)}" stroke-width="1.1" fill="none" stroke-dasharray="3 4"/>`
    : '';
  g.innerHTML = `${lead}
    <g class="pill">
      <rect class="pill-bg" x="-40" y="-11.5" width="80" height="23" rx="11.5"
        fill="rgba(8,15,22,0.82)" stroke="${alpha(color, 0.6)}" stroke-width="1.2"/>
      <circle class="pill-dot" cx="-28" cy="0" r="3.4" fill="${color}"/>
      <text class="pill-text" x="-19" y="4.2" fill="#e7f1fa">${m.label}</text>
    </g>`;
  return g;
}

/** Fit every pill background to its text width. */
function fitLabels(svg) {
  svg.querySelectorAll('.mech-label .pill').forEach((pill) => {
    const text = pill.querySelector('.pill-text');
    const rect = pill.querySelector('.pill-bg');
    const dot = pill.querySelector('.pill-dot');
    const w = text.getComputedTextLength();
    const padL = 22;
    const padR = 13;
    const total = w + padL + padR;
    rect.setAttribute('x', (-total / 2).toFixed(1));
    rect.setAttribute('width', total.toFixed(1));
    dot.setAttribute('cx', (-total / 2 + 11).toFixed(1));
    text.setAttribute('x', (-total / 2 + padL).toFixed(1));
  });
}

/**
 * Keep pill labels from overlapping each other, the cells, or the frame.
 *
 * Authored offsets are treated as preferences: a short relaxation nudges
 * labels apart, springs them back toward their preferred spot, and then
 * redraws each leader line. Re-run whenever the visible set changes, so any
 * combination of layers stays legible.
 */
export function relaxLabels(svg, visibleLayers) {
  const nodes = [...svg.querySelectorAll('.mech-label')].filter((n) =>
    visibleLayers.has(n.dataset.layer)
  );
  if (!nodes.length) return;

  const items = nodes.map((n) => {
    const bg = n.querySelector('.pill-bg');
    const w = Number(bg.getAttribute('width')) + 10;
    const h = 23 + 9;
    return {
      node: n,
      w,
      h,
      px: Number(n.dataset.px),
      py: Number(n.dataset.py),
      x: Number(n.dataset.px),
      y: Number(n.dataset.py),
      fx: n.dataset.fx !== undefined ? Number(n.dataset.fx) : null,
      fy: n.dataset.fy !== undefined ? Number(n.dataset.fy) : null,
    };
  });

  // obstacles: the cell bodies, which labels should not sit on top of
  const bodies = CELLS.filter((c) => !c.hidden).map((c) => ({ x: c.x, y: c.y, r: c.r * 0.92 }));

  for (let iter = 0; iter < 90; iter++) {
    const damp = 0.5;

    // pairwise separation
    for (let i = 0; i < items.length; i++) {
      for (let j = i + 1; j < items.length; j++) {
        const a = items[i];
        const b = items[j];
        const dx = b.x - a.x;
        const dy = b.y - a.y;
        const ox = (a.w + b.w) / 2 - Math.abs(dx);
        const oy = (a.h + b.h) / 2 - Math.abs(dy);
        if (ox <= 0 || oy <= 0) continue;
        // push along the cheaper axis, preferring vertical (text reads in rows)
        if (oy / b.h < ox / b.w) {
          const s = ((dy >= 0 ? 1 : -1) * oy) / 2 * damp;
          a.y -= s;
          b.y += s;
        } else {
          const s = ((dx >= 0 ? 1 : -1) * ox) / 2 * damp;
          a.x -= s;
          b.x += s;
        }
      }
    }

    // push off cell bodies
    for (const it of items) {
      for (const c of bodies) {
        const dx = it.x - c.x;
        const dy = it.y - c.y;
        const nearX = Math.max(Math.abs(dx) - it.w / 2, 0);
        const nearY = Math.max(Math.abs(dy) - it.h / 2, 0);
        const dist = Math.hypot(nearX, nearY);
        if (dist >= c.r) continue;
        const [ux, uy] = norm(dx || 0.01, dy || 0.01);
        const push = (c.r - dist) * 0.3;
        it.x += ux * push;
        it.y += uy * push;
      }
    }

    // spring back toward the authored position, and stay inside the frame
    for (const it of items) {
      it.x += (it.px - it.x) * 0.055;
      it.y += (it.py - it.y) * 0.055;
      it.x = Math.min(VIEW.w - it.w / 2 - 4, Math.max(it.w / 2 + 4, it.x));
      it.y = Math.min(VIEW.h - 18, Math.max(18, it.y));
    }
  }

  for (const it of items) {
    it.node.setAttribute('transform', `translate(${it.x.toFixed(1)} ${it.y.toFixed(1)})`);
    const leader = it.node.querySelector('.leader');
    if (leader && it.fx !== null) {
      leader.setAttribute(
        'd',
        `M ${(it.fx - it.x).toFixed(1)} ${(it.fy - it.y).toFixed(1)} L 0 0`
      );
    }
  }
}

/* ------------------------------------------------------------ cell labels */

function buildCellLabels() {
  const g = el('g', { class: 'layer-cell-labels' });
  CELLS.forEach((cell) => {
    const pos = { above: [0, -cell.r - 26], below: [0, cell.r + 34], left: [-cell.r - 18, 6], right: [cell.r + 18, 6] }[
      cell.labelAt || 'below'
    ];
    const anchor = cell.labelAt === 'left' ? 'end' : cell.labelAt === 'right' ? 'start' : 'middle';
    g.innerHTML += `<g class="cell-label" data-cell="${cell.id}"
        transform="translate(${(cell.x + pos[0]).toFixed(1)} ${(cell.y + pos[1]).toFixed(1)})">
      <text class="cell-name" text-anchor="${anchor}" fill="${shade(cell.color, 0.55)}">${cell.name}</text>
    </g>`;
  });
  return g;
}

/* ------------------------------------------------------------------ build */

export function buildScene(host) {
  const svg = el('svg', {
    viewBox: `0 0 ${VIEW.w} ${VIEW.h}`,
    class: 'scene',
    preserveAspectRatio: 'xMidYMid meet',
    role: 'img',
    'aria-label': 'Interactive map of immunosuppressive mechanisms in the glioblastoma microenvironment',
  });

  const cells = buildCells();
  const defs = el('defs', {}, buildDefs() + cells.defs +
    `<clipPath id="vessel-clip"><rect x="${REGIONS.vessel.x}" y="0" width="${REGIONS.vessel.w}" height="${REGIONS.vessel.h}"/></clipPath>`);
  svg.appendChild(defs);

  const world = el('g', { class: 'world' });
  const bg = el('g', { class: 'layer-bg' }, buildBackground());
  const { gEdges, gGlyphs, gLabels } = buildMechanisms();

  world.append(bg, gEdges, cells.group, buildCellLabels(), gGlyphs, gLabels);
  svg.appendChild(world);
  host.appendChild(svg);

  fitLabels(svg);

  return { svg, world };
}

/** Pan / zoom with pointer drag and wheel; returns a reset function. */
export function attachViewControls(svg, world) {
  const view = { x: 0, y: 0, k: 1 };
  let drag = null;
  let moved = 0;

  const apply = () => {
    world.setAttribute('transform', `translate(${view.x} ${view.y}) scale(${view.k})`);
    svg.classList.toggle('is-zoomed', view.k > 1.02);
  };

  const toLocal = (e) => {
    const r = svg.getBoundingClientRect();
    const sx = VIEW.w / r.width;
    const sy = VIEW.h / r.height;
    const s = Math.max(sx, sy); // matches preserveAspectRatio "meet"
    return [
      (e.clientX - r.left - r.width / 2) * s + VIEW.w / 2,
      (e.clientY - r.top - r.height / 2) * s + VIEW.h / 2,
    ];
  };

  svg.addEventListener('wheel', (e) => {
    e.preventDefault();
    const [mx, my] = toLocal(e);
    const k0 = view.k;
    const k1 = Math.min(4, Math.max(1, k0 * (e.deltaY < 0 ? 1.12 : 1 / 1.12)));
    // keep the point under the cursor fixed
    view.x = mx - ((mx - view.x) * k1) / k0;
    view.y = my - ((my - view.y) * k1) / k0;
    view.k = k1;
    if (k1 === 1) {
      view.x = 0;
      view.y = 0;
    }
    apply();
  }, { passive: false });

  svg.addEventListener('pointerdown', (e) => {
    if (e.button !== 0) return;
    drag = { x: e.clientX, y: e.clientY, vx: view.x, vy: view.y };
    moved = 0;
  });

  svg.addEventListener('pointermove', (e) => {
    if (!drag) return;
    const r = svg.getBoundingClientRect();
    const s = Math.max(VIEW.w / r.width, VIEW.h / r.height);
    const dx = (e.clientX - drag.x) * s;
    const dy = (e.clientY - drag.y) * s;
    moved = Math.max(moved, Math.hypot(dx, dy));
    if (view.k <= 1.02) return;
    view.x = drag.vx + dx;
    view.y = drag.vy + dy;
    apply();
    svg.classList.add('is-panning');
  });

  const endDrag = () => {
    drag = null;
    svg.classList.remove('is-panning');
  };
  svg.addEventListener('pointerup', endDrag);
  svg.addEventListener('pointerleave', endDrag);

  return {
    reset() {
      view.x = 0;
      view.y = 0;
      view.k = 1;
      apply();
    },
    zoom(f) {
      view.k = Math.min(4, Math.max(1, view.k * f));
      if (view.k === 1) {
        view.x = 0;
        view.y = 0;
      }
      apply();
    },
    /** true when the last pointer sequence was a drag, not a click */
    wasDrag: () => moved > 6,
  };
}
