/**
 * Procedural cell artwork.
 *
 * Every cell is generated geometry — morphing membranes, nuclei, granules,
 * ramified processes — so the figure reads as living tissue rather than
 * clip art, and scales to any resolution for print or projection.
 *
 * Each renderer returns { defs, body } of SVG markup centred on (0,0).
 */

/* ------------------------------------------------------------ small utils */

/** Deterministic PRNG so a cell looks identical on every reload. */
function rng(seed) {
  let s = seed * 9301 + 49297;
  return () => {
    s = (s * 9301 + 49297) % 233280;
    return s / 233280;
  };
}

function hexToRgb(hex) {
  const h = hex.replace('#', '');
  return [
    parseInt(h.slice(0, 2), 16),
    parseInt(h.slice(2, 4), 16),
    parseInt(h.slice(4, 6), 16),
  ];
}

/**
 * Mix a hex colour toward white (amt > 0) or black (amt < 0).
 * Returns hex so the result can be fed back into `alpha()`.
 */
export function shade(hex, amt) {
  const [r, g, b] = hexToRgb(hex);
  const t = amt > 0 ? 255 : 0;
  const k = Math.abs(amt);
  const mix = (c) => Math.round(c + (t - c) * k);
  const hx = (c) => mix(c).toString(16).padStart(2, '0');
  return `#${hx(r)}${hx(g)}${hx(b)}`;
}

export function alpha(hex, a) {
  const [r, g, b] = hexToRgb(hex);
  return `rgba(${r},${g},${b},${a})`;
}

/** Closed Catmull-Rom spline through points — smooth organic outlines. */
function smoothClosedPath(pts) {
  const n = pts.length;
  const at = (i) => pts[((i % n) + n) % n];
  let d = `M ${at(0)[0].toFixed(2)} ${at(0)[1].toFixed(2)}`;
  for (let i = 0; i < n; i++) {
    const p0 = at(i - 1);
    const p1 = at(i);
    const p2 = at(i + 1);
    const p3 = at(i + 2);
    const c1x = p1[0] + (p2[0] - p0[0]) / 6;
    const c1y = p1[1] + (p2[1] - p0[1]) / 6;
    const c2x = p2[0] - (p3[0] - p1[0]) / 6;
    const c2y = p2[1] - (p3[1] - p1[1]) / 6;
    d += ` C ${c1x.toFixed(2)} ${c1y.toFixed(2)}, ${c2x.toFixed(2)} ${c2y.toFixed(2)}, ${p2[0].toFixed(2)} ${p2[1].toFixed(2)}`;
  }
  return d + ' Z';
}

/**
 * Organic blob outline.
 *  n     — number of control points (more = finer ruffles)
 *  wob   — radial irregularity, as a fraction of r
 *  phase — advance for membrane morph frames
 *  spikes — { count, amp, offset } optional protrusions (pseudopodia)
 */
export function blob(r, { n = 14, wob = 0.08, seed = 1, phase = 0, spikes = null } = {}) {
  const rand = rng(seed);
  const base = [];
  for (let i = 0; i < n; i++) base.push(rand() * 2 - 1);
  const pts = [];
  for (let i = 0; i < n; i++) {
    const a = (i / n) * Math.PI * 2;
    // two drifting harmonics keep the morph from looking like a pulse
    let rr =
      r *
      (1 +
        wob * base[i] * Math.cos(phase + i * 0.9) +
        wob * 0.45 * base[(i + 3) % n] * Math.sin(phase * 0.7 + i * 1.7));
    if (spikes) {
      const k = Math.cos(a * spikes.count + (spikes.offset || 0));
      if (k > 0.55) rr *= 1 + spikes.amp * (k - 0.55) / 0.45;
    }
    pts.push([Math.cos(a) * rr, Math.sin(a) * rr]);
  }
  return smoothClosedPath(pts);
}

/** Three morph frames, emitted as a SMIL <animate> on the `d` attribute. */
function morph(r, opts, dur) {
  const frames = [0, 2.1, 4.2].map((p) => blob(r, { ...opts, phase: p }));
  return {
    d: frames[0],
    anim: `<animate attributeName="d" dur="${dur}s" repeatCount="indefinite"
      values="${frames[0]};${frames[1]};${frames[2]};${frames[0]}"
      calcMode="spline" keyTimes="0;0.33;0.66;1"
      keySplines="0.4 0 0.6 1;0.4 0 0.6 1;0.4 0 0.6 1"/>`,
  };
}

/* --------------------------------------------------------- shared anatomy */

/** Membrane gradient + inner shadow + specular rim, used by every cell. */
function membraneDefs(id, color) {
  return `
  <radialGradient id="${id}-mem" cx="34%" cy="26%" r="78%">
    <stop offset="0%"   stop-color="${shade(color, 0.42)}"/>
    <stop offset="46%"  stop-color="${color}"/>
    <stop offset="100%" stop-color="${shade(color, -0.46)}"/>
  </radialGradient>
  <radialGradient id="${id}-cyto" cx="38%" cy="32%" r="70%">
    <stop offset="0%"   stop-color="${alpha(shade(color, 0.7), 0.5)}"/>
    <stop offset="70%"  stop-color="${alpha(color, 0.06)}"/>
    <stop offset="100%" stop-color="${alpha(shade(color, -0.4), 0.28)}"/>
  </radialGradient>
  <radialGradient id="${id}-glow" cx="50%" cy="50%" r="50%">
    <stop offset="55%"  stop-color="${alpha(color, 0.3)}"/>
    <stop offset="100%" stop-color="${alpha(color, 0)}"/>
  </radialGradient>
  <radialGradient id="${id}-nuc" cx="36%" cy="30%" r="76%">
    <stop offset="0%"   stop-color="${shade(color, -0.18)}"/>
    <stop offset="60%"  stop-color="${shade(color, -0.46)}"/>
    <stop offset="100%" stop-color="${shade(color, -0.66)}"/>
  </radialGradient>`;
}

/** Nucleus with gradient, nucleoli and faint chromatin. */
function nucleus(id, color, r, { seed = 7, irregular = 0.06, rot = 0, sx = 1, sy = 1 } = {}) {
  const rand = rng(seed + 13);
  const d = blob(r, { n: 11, wob: irregular, seed: seed + 3 });
  let speck = '';
  for (let i = 0; i < 7; i++) {
    const a = rand() * Math.PI * 2;
    const rr = rand() * r * 0.66;
    speck += `<circle cx="${(Math.cos(a) * rr).toFixed(1)}" cy="${(Math.sin(a) * rr).toFixed(1)}" r="${(r * (0.06 + rand() * 0.08)).toFixed(1)}" fill="${alpha(shade(color, -0.8), 0.3)}"/>`;
  }
  return `<g transform="rotate(${rot}) scale(${sx} ${sy})">
    <path d="${d}" fill="url(#${id}-nuc)" stroke="${alpha(shade(color, -0.75), 0.55)}" stroke-width="1.1"/>
    ${speck}
    <circle cx="${(-r * 0.18).toFixed(1)}" cy="${(-r * 0.2).toFixed(1)}" r="${(r * 0.17).toFixed(1)}" fill="${alpha(shade(color, 0.5), 0.35)}"/>
  </g>`;
}

/** Specular highlight arc along the upper-left membrane. */
function rimLight(r, color) {
  return `<path d="M ${(-r * 0.74).toFixed(1)} ${(-r * 0.44).toFixed(1)}
      A ${r.toFixed(1)} ${r.toFixed(1)} 0 0 1 ${(r * 0.3).toFixed(1)} ${(-r * 0.88).toFixed(1)}"
      fill="none" stroke="${alpha(shade(color, 0.92), 0.5)}" stroke-width="${(r * 0.055).toFixed(1)}"
      stroke-linecap="round" opacity="0.75"/>`;
}

/** Scattered organelles / vesicles for cytoplasmic texture. */
function vesicles(color, r, count, seed, { min = 0.05, max = 0.11 } = {}) {
  const rand = rng(seed);
  let out = '';
  for (let i = 0; i < count; i++) {
    const a = rand() * Math.PI * 2;
    const rr = (0.42 + rand() * 0.46) * r;
    const sz = r * (min + rand() * (max - min));
    out += `<circle cx="${(Math.cos(a) * rr).toFixed(1)}" cy="${(Math.sin(a) * rr).toFixed(1)}" r="${sz.toFixed(1)}"
      fill="${alpha(shade(color, 0.55), 0.16)}" stroke="${alpha(shade(color, 0.8), 0.14)}" stroke-width="0.8"/>`;
  }
  return out;
}

/* --------------------------------------------------------------- renderers */

/** GBM tumour cell — large, irregular, pseudopodia, atypical nucleus. */
function tumor(id, color, r, seed) {
  const m = morph(r, { n: 17, wob: 0.13, seed, spikes: { count: 5, amp: 0.2, offset: 0.6 } }, 16);
  const inner = morph(r * 0.82, { n: 13, wob: 0.1, seed: seed + 4 }, 19);
  const rand = rng(seed + 31);
  let invado = '';
  for (let i = 0; i < 7; i++) {
    const a = rand() * Math.PI * 2;
    const len = r * (0.1 + rand() * 0.2);
    const x1 = Math.cos(a) * r * 0.96;
    const y1 = Math.sin(a) * r * 0.96;
    invado += `<path d="M ${x1.toFixed(1)} ${y1.toFixed(1)} q ${(Math.cos(a + 0.5) * len).toFixed(1)} ${(Math.sin(a + 0.5) * len).toFixed(1)}
      ${(Math.cos(a) * len * 1.7).toFixed(1)} ${(Math.sin(a) * len * 1.7).toFixed(1)}"
      fill="none" stroke="${alpha(color, 0.5)}" stroke-width="${(r * 0.035).toFixed(1)}" stroke-linecap="round"/>`;
  }
  return {
    defs: membraneDefs(id, color),
    body: `
    <circle r="${(r * 1.5).toFixed(1)}" fill="url(#${id}-glow)"/>
    ${invado}
    <path d="${m.d}" fill="url(#${id}-mem)" stroke="${shade(color, 0.3)}" stroke-width="2.2" class="membrane">${m.anim}</path>
    <path d="${inner.d}" fill="url(#${id}-cyto)" opacity="0.9">${inner.anim}</path>
    ${vesicles(color, r, 14, seed + 9)}
    ${rimLight(r, color)}
    <g transform="translate(${(r * 0.06).toFixed(1)} ${(r * 0.08).toFixed(1)})">
      ${nucleus(id, color, r * 0.44, { seed, irregular: 0.16, rot: -18, sx: 1.12, sy: 0.9 })}
    </g>
    <circle cx="${(-r * 0.46).toFixed(1)}" cy="${(r * 0.42).toFixed(1)}" r="${(r * 0.15).toFixed(1)}"
      fill="${alpha(shade(color, -0.5), 0.5)}" stroke="${alpha(shade(color, -0.7), 0.4)}" stroke-width="1"/>`,
  };
}

/** Glioma stem cell — small, luminous, a few short processes. */
function stem(id, color, r, seed) {
  const m = morph(r, { n: 13, wob: 0.11, seed }, 13);
  const rand = rng(seed + 5);
  let proc = '';
  for (let i = 0; i < 5; i++) {
    const a = (i / 5) * Math.PI * 2 + rand();
    const len = r * (0.5 + rand() * 0.5);
    proc += `<path d="M ${(Math.cos(a) * r * 0.9).toFixed(1)} ${(Math.sin(a) * r * 0.9).toFixed(1)}
      q ${(Math.cos(a + 0.7) * len * 0.6).toFixed(1)} ${(Math.sin(a + 0.7) * len * 0.6).toFixed(1)}
      ${(Math.cos(a) * len).toFixed(1)} ${(Math.sin(a) * len).toFixed(1)}"
      fill="none" stroke="${alpha(color, 0.55)}" stroke-width="${(r * 0.07).toFixed(1)}" stroke-linecap="round"/>`;
  }
  return {
    defs: membraneDefs(id, color),
    body: `
    <circle r="${(r * 2).toFixed(1)}" fill="url(#${id}-glow)">
      <animate attributeName="opacity" values="0.75;1;0.75" dur="4.5s" repeatCount="indefinite"/>
    </circle>
    ${proc}
    <path d="${m.d}" fill="url(#${id}-mem)" stroke="${shade(color, 0.42)}" stroke-width="1.8" class="membrane">${m.anim}</path>
    ${vesicles(color, r, 6, seed + 2)}
    ${rimLight(r, color)}
    ${nucleus(id, color, r * 0.46, { seed: seed + 1, irregular: 0.1 })}`,
  };
}

/** Lymphocyte — small, round, large nucleus, surface microvilli. */
function lymphocyte(id, color, r, seed, opts = {}) {
  const m = morph(r, { n: 18, wob: 0.05, seed }, 11);
  const rand = rng(seed + 17);
  let villi = '';
  for (let i = 0; i < 16; i++) {
    const a = (i / 16) * Math.PI * 2 + rand() * 0.2;
    const h = r * (0.07 + rand() * 0.07);
    villi += `<circle cx="${(Math.cos(a) * r * 0.99).toFixed(1)}" cy="${(Math.sin(a) * r * 0.99).toFixed(1)}" r="${h.toFixed(1)}"
      fill="${alpha(shade(color, 0.25), 0.5)}"/>`;
  }
  // Treg marker: a secondary surface ring
  const ring = opts.ring
    ? `<circle r="${(r * 1.14).toFixed(1)}" fill="none" stroke="${alpha(shade(color, 0.45), 0.4)}"
         stroke-width="1.6" stroke-dasharray="5 7">
         <animateTransform attributeName="transform" type="rotate" from="0" to="360" dur="36s" repeatCount="indefinite"/>
       </circle>`
    : '';
  return {
    defs: membraneDefs(id, color),
    body: `
    <circle r="${(r * 1.6).toFixed(1)}" fill="url(#${id}-glow)"/>
    ${ring}
    ${villi}
    <path d="${m.d}" fill="url(#${id}-mem)" stroke="${shade(color, 0.36)}" stroke-width="1.8" class="membrane">${m.anim}</path>
    ${vesicles(color, r, 5, seed + 6, { min: 0.04, max: 0.07 })}
    ${rimLight(r, color)}
    ${nucleus(id, color, r * 0.62, { seed, irregular: 0.08, rot: 14, sx: 1.04, sy: 0.94 })}`,
  };
}

/** NK cell — lymphocyte morphology with prominent cytotoxic granules. */
function nk(id, color, r, seed) {
  const base = lymphocyte(id, color, r, seed);
  const rand = rng(seed + 44);
  let gran = '';
  for (let i = 0; i < 11; i++) {
    const a = rand() * Math.PI * 2;
    const rr = (0.5 + rand() * 0.38) * r;
    const sz = r * (0.07 + rand() * 0.06);
    gran += `<circle cx="${(Math.cos(a) * rr).toFixed(1)}" cy="${(Math.sin(a) * rr).toFixed(1)}" r="${sz.toFixed(1)}"
      fill="${alpha(shade(color, 0.85), 0.55)}" stroke="${alpha(shade(color, 0.6), 0.45)}" stroke-width="0.7"/>`;
  }
  return { defs: base.defs, body: base.body + gran };
}

/** Macrophage — large, amoeboid, ruffled membrane, vacuoles, kidney nucleus. */
function macrophage(id, color, r, seed) {
  const m = morph(r, { n: 20, wob: 0.17, seed, spikes: { count: 3, amp: 0.16, offset: 2.1 } }, 14);
  const inner = morph(r * 0.78, { n: 15, wob: 0.12, seed: seed + 7 }, 17);
  const rand = rng(seed + 21);
  let ruffle = '';
  for (let i = 0; i < 9; i++) {
    const a = (i / 9) * Math.PI * 2 + rand() * 0.3;
    const w = r * (0.16 + rand() * 0.12);
    ruffle += `<path d="M ${(Math.cos(a - 0.2) * r * 0.94).toFixed(1)} ${(Math.sin(a - 0.2) * r * 0.94).toFixed(1)}
      q ${(Math.cos(a) * w * 1.9).toFixed(1)} ${(Math.sin(a) * w * 1.9).toFixed(1)}
      ${(Math.cos(a + 0.26) * r * 0.94 - Math.cos(a - 0.2) * r * 0.94).toFixed(1)} ${(Math.sin(a + 0.26) * r * 0.94 - Math.sin(a - 0.2) * r * 0.94).toFixed(1)}"
      fill="${alpha(shade(color, 0.2), 0.18)}" stroke="${alpha(shade(color, 0.5), 0.3)}" stroke-width="1"/>`;
  }
  // kidney-shaped nucleus
  const kr = r * 0.4;
  const kidney = `<g transform="translate(${(r * 0.1).toFixed(1)} ${(r * 0.12).toFixed(1)}) rotate(-24)">
    <path d="M ${(-kr).toFixed(1)} 0
      C ${(-kr).toFixed(1)} ${(-kr * 1.1).toFixed(1)}, ${(kr * 0.9).toFixed(1)} ${(-kr * 1.25).toFixed(1)}, ${(kr * 1.05).toFixed(1)} ${(-kr * 0.3).toFixed(1)}
      C ${(kr * 1.15).toFixed(1)} ${(kr * 0.35).toFixed(1)}, ${(kr * 0.5).toFixed(1)} ${(kr * 1.2).toFixed(1)}, ${(-kr * 0.1).toFixed(1)} ${(kr * 0.95).toFixed(1)}
      C ${(-kr * 0.55).toFixed(1)} ${(kr * 0.8).toFixed(1)}, ${(-kr * 0.3).toFixed(1)} ${(kr * 0.3).toFixed(1)}, ${(-kr).toFixed(1)} 0 Z"
      fill="url(#${id}-nuc)" stroke="${alpha(shade(color, -0.7), 0.5)}" stroke-width="1.1"/>
  </g>`;
  let vac = '';
  for (let i = 0; i < 5; i++) {
    const a = rand() * Math.PI * 2;
    const rr = (0.4 + rand() * 0.4) * r;
    const sz = r * (0.1 + rand() * 0.09);
    vac += `<circle cx="${(Math.cos(a) * rr).toFixed(1)}" cy="${(Math.sin(a) * rr).toFixed(1)}" r="${sz.toFixed(1)}"
      fill="${alpha(shade(color, -0.3), 0.3)}" stroke="${alpha(shade(color, 0.6), 0.3)}" stroke-width="1"/>`;
  }
  return {
    defs: membraneDefs(id, color),
    body: `
    <circle r="${(r * 1.45).toFixed(1)}" fill="url(#${id}-glow)"/>
    ${ruffle}
    <path d="${m.d}" fill="url(#${id}-mem)" stroke="${shade(color, 0.32)}" stroke-width="2" class="membrane">${m.anim}</path>
    <path d="${inner.d}" fill="url(#${id}-cyto)">${inner.anim}</path>
    ${vesicles(color, r, 12, seed + 3)}
    ${vac}
    ${rimLight(r, color)}
    ${kidney}`,
  };
}

/** Microglia — small soma with fine ramified, branching processes. */
function microglia(id, color, r, seed) {
  const m = morph(r * 0.72, { n: 15, wob: 0.12, seed }, 15);
  const rand = rng(seed + 11);

  // recursive ramification
  function branch(x, y, a, len, w, depth) {
    const ex = x + Math.cos(a) * len;
    const ey = y + Math.sin(a) * len;
    const cx = x + Math.cos(a + (rand() - 0.5) * 0.9) * len * 0.6;
    const cy = y + Math.sin(a + (rand() - 0.5) * 0.9) * len * 0.6;
    let s = `<path d="M ${x.toFixed(1)} ${y.toFixed(1)} Q ${cx.toFixed(1)} ${cy.toFixed(1)} ${ex.toFixed(1)} ${ey.toFixed(1)}"
      fill="none" stroke="${alpha(shade(color, 0.3), depth === 0 ? 0.75 : 0.5)}"
      stroke-width="${w.toFixed(2)}" stroke-linecap="round"/>`;
    if (depth < 2) {
      const spread = 0.55 + rand() * 0.4;
      s += branch(ex, ey, a - spread, len * 0.62, w * 0.6, depth + 1);
      s += branch(ex, ey, a + spread, len * 0.6, w * 0.6, depth + 1);
    } else {
      s += `<circle cx="${ex.toFixed(1)}" cy="${ey.toFixed(1)}" r="${(w * 0.9).toFixed(1)}" fill="${alpha(shade(color, 0.6), 0.5)}"/>`;
    }
    return s;
  }
  let arbor = '';
  const N = 7;
  for (let i = 0; i < N; i++) {
    const a = (i / N) * Math.PI * 2 + rand() * 0.3;
    arbor += branch(Math.cos(a) * r * 0.6, Math.sin(a) * r * 0.6, a, r * 0.78, r * 0.1, 0);
  }
  return {
    defs: membraneDefs(id, color),
    body: `
    <circle r="${(r * 1.5).toFixed(1)}" fill="url(#${id}-glow)"/>
    <g class="arbor" opacity="0.95">${arbor}</g>
    <path d="${m.d}" fill="url(#${id}-mem)" stroke="${shade(color, 0.34)}" stroke-width="1.8" class="membrane">${m.anim}</path>
    ${vesicles(color, r * 0.7, 6, seed + 8)}
    ${rimLight(r * 0.72, color)}
    ${nucleus(id, color, r * 0.36, { seed: seed + 2, irregular: 0.1, rot: 8 })}`,
  };
}

/** Dendritic cell — stellate, with long tapering dendrites. */
function dendritic(id, color, r, seed) {
  const m = morph(r * 0.78, { n: 14, wob: 0.14, seed }, 13);
  const rand = rng(seed + 29);
  let dend = '';
  const N = 9;
  for (let i = 0; i < N; i++) {
    const a = (i / N) * Math.PI * 2 + rand() * 0.25;
    const len = r * (1.05 + rand() * 0.75);
    const curve = (rand() - 0.5) * 1.2;
    const sx = Math.cos(a) * r * 0.66;
    const sy = Math.sin(a) * r * 0.66;
    const ex = Math.cos(a) * len;
    const ey = Math.sin(a) * len;
    const cx = Math.cos(a + curve) * len * 0.62;
    const cy = Math.sin(a + curve) * len * 0.62;
    dend += `<path d="M ${sx.toFixed(1)} ${sy.toFixed(1)} Q ${cx.toFixed(1)} ${cy.toFixed(1)} ${ex.toFixed(1)} ${ey.toFixed(1)}"
      fill="none" stroke="${alpha(shade(color, 0.28), 0.6)}" stroke-width="${(r * 0.13 * (1 - i / (N * 3))).toFixed(2)}"
      stroke-linecap="round"/>
      <circle cx="${ex.toFixed(1)}" cy="${ey.toFixed(1)}" r="${(r * 0.065).toFixed(1)}" fill="${alpha(shade(color, 0.7), 0.6)}"/>`;
  }
  // MHC-II-laden surface vesicles
  let mhc = '';
  for (let i = 0; i < 7; i++) {
    const a = rand() * Math.PI * 2;
    mhc += `<circle cx="${(Math.cos(a) * r * 0.5).toFixed(1)}" cy="${(Math.sin(a) * r * 0.5).toFixed(1)}" r="${(r * 0.08).toFixed(1)}"
      fill="${alpha(shade(color, 0.8), 0.4)}" stroke="${alpha(shade(color, 0.5), 0.4)}" stroke-width="0.8"/>`;
  }
  return {
    defs: membraneDefs(id, color),
    body: `
    <circle r="${(r * 1.5).toFixed(1)}" fill="url(#${id}-glow)"/>
    <g class="arbor">${dend}</g>
    <path d="${m.d}" fill="url(#${id}-mem)" stroke="${shade(color, 0.3)}" stroke-width="1.8" class="membrane">${m.anim}</path>
    ${mhc}
    ${rimLight(r * 0.78, color)}
    ${nucleus(id, color, r * 0.4, { seed: seed + 5, irregular: 0.12, rot: -10, sx: 1.1, sy: 0.9 })}`,
  };
}

/** MDSC — immature myeloid morphology: band/ring nucleus, granular cytoplasm. */
function mdsc(id, color, r, seed) {
  const m = morph(r, { n: 16, wob: 0.1, seed }, 12);
  const rand = rng(seed + 37);
  let gran = '';
  for (let i = 0; i < 16; i++) {
    const a = rand() * Math.PI * 2;
    const rr = (0.3 + rand() * 0.6) * r;
    gran += `<circle cx="${(Math.cos(a) * rr).toFixed(1)}" cy="${(Math.sin(a) * rr).toFixed(1)}" r="${(r * (0.045 + rand() * 0.05)).toFixed(1)}"
      fill="${alpha(shade(color, 0.55), 0.3)}"/>`;
  }
  const br = r * 0.46;
  return {
    defs: membraneDefs(id, color),
    body: `
    <circle r="${(r * 1.5).toFixed(1)}" fill="url(#${id}-glow)"/>
    <path d="${m.d}" fill="url(#${id}-mem)" stroke="${shade(color, 0.34)}" stroke-width="1.8" class="membrane">${m.anim}</path>
    ${gran}
    ${rimLight(r, color)}
    <g transform="rotate(-16)">
      <path d="M ${(-br).toFixed(1)} ${(br * 0.1).toFixed(1)}
        C ${(-br * 1.15).toFixed(1)} ${(-br * 0.95).toFixed(1)}, ${(br * 1.15).toFixed(1)} ${(-br * 0.95).toFixed(1)}, ${br.toFixed(1)} ${(br * 0.1).toFixed(1)}
        C ${(br * 0.75).toFixed(1)} ${(br * 0.62).toFixed(1)}, ${(-br * 0.75).toFixed(1)} ${(br * 0.62).toFixed(1)}, ${(-br).toFixed(1)} ${(br * 0.1).toFixed(1)} Z"
        fill="url(#${id}-nuc)" stroke="${alpha(shade(color, -0.7), 0.5)}" stroke-width="1.1"/>
    </g>`,
  };
}

const RENDERERS = { tumor, stem, lymphocyte, nk, macrophage, microglia, dendritic, mdsc };

/**
 * Build artwork for one cell definition.
 * Returns { defs, body } — caller places `body` inside a translated <g>.
 */
export function cellArt(cell, idx) {
  const id = `c-${cell.id}`;
  const seed = 3 + idx * 17;
  const fn = RENDERERS[cell.kind] || lymphocyte;
  const opts = cell.id === 'treg' ? { ring: true } : {};
  return fn(id, cell.color, cell.r, seed, opts);
}

/**
 * Endothelial lining, seen edge-on: flattened cells tiled along the vessel
 * wall, each bulging inward at its nucleus, with tight junctions between them
 * — the structural basis of the blood–brain barrier.
 *
 *  x    — wall position
 *  dir  — +1 if the lumen is to the right of the wall, -1 if to the left
 */
export function endotheliumArt(x, h, dir = 1, color = '#e8808f') {
  const rand = rng(91);
  let out = '';
  const step = 74;
  for (let y = -40; y < h + 80; y += step) {
    const len = step * 0.52 + rand() * 8; // half-length along the wall
    const th = 7 + rand() * 2.5; // wall thickness
    const bulge = 13 + rand() * 5; // nuclear bulge into the lumen

    // flattened cell profile: thin at the ends, swollen around the nucleus
    const d = `M ${x} ${(y - len).toFixed(1)}
      C ${(x + dir * th).toFixed(1)} ${(y - len * 0.6).toFixed(1)},
        ${(x + dir * bulge).toFixed(1)} ${(y - bulge * 0.7).toFixed(1)},
        ${(x + dir * bulge).toFixed(1)} ${y.toFixed(1)}
      C ${(x + dir * bulge).toFixed(1)} ${(y + bulge * 0.7).toFixed(1)},
        ${(x + dir * th).toFixed(1)} ${(y + len * 0.6).toFixed(1)},
        ${x} ${(y + len).toFixed(1)}
      L ${(x - dir * 5).toFixed(1)} ${(y + len).toFixed(1)}
      L ${(x - dir * 5).toFixed(1)} ${(y - len).toFixed(1)} Z`;

    out += `<path d="${d}" fill="${alpha(color, 0.26)}" stroke="${alpha(shade(color, 0.42), 0.45)}" stroke-width="1.1"/>
      <ellipse cx="${(x + dir * bulge * 0.52).toFixed(1)}" cy="${y.toFixed(1)}"
        rx="${(bulge * 0.34).toFixed(1)}" ry="${(len * 0.26).toFixed(1)}"
        fill="${alpha(shade(color, -0.45), 0.6)}" stroke="${alpha(shade(color, 0.3), 0.3)}" stroke-width="0.8"/>
      <!-- tight junction -->
      <circle cx="${(x + dir * 3).toFixed(1)}" cy="${(y + len).toFixed(1)}" r="2.6"
        fill="${alpha(shade(color, 0.75), 0.75)}"/>`;
  }
  // basement membrane
  out += `<path d="M ${(x - dir * 5).toFixed(1)} 0 L ${(x - dir * 5).toFixed(1)} ${h}"
    stroke="${alpha(shade(color, 0.2), 0.3)}" stroke-width="2.5" fill="none" stroke-dasharray="1 5"/>`;
  return out;
}

/** Red blood cells drifting down the vessel lumen. */
export function rbcArt(cx, h, n = 7) {
  const rand = rng(63);
  let out = '';
  for (let i = 0; i < n; i++) {
    const delay = (i / n) * 14;
    const off = (rand() - 0.5) * 54;
    const rr = 9 + rand() * 4;
    out += `<g opacity="0.8">
      <ellipse cx="${(cx + off).toFixed(1)}" cy="-40" rx="${rr.toFixed(1)}" ry="${(rr * 0.74).toFixed(1)}"
        fill="rgba(226,90,110,0.55)" stroke="rgba(255,150,165,0.45)" stroke-width="1"
        transform="rotate(${(rand() * 60 - 30).toFixed(0)} ${(cx + off).toFixed(1)} -40)"/>
      <animateTransform attributeName="transform" type="translate" from="0 0" to="0 ${h + 120}"
        dur="${(13 + rand() * 7).toFixed(1)}s" begin="-${delay.toFixed(1)}s" repeatCount="indefinite"/>
    </g>`;
  }
  return out;
}
