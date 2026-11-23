/**
 * Fold the Vite build into one self-contained page.
 *
 * Produces dist/artifact.html: no external files, no absolute paths — the
 * whole figure (markup, styles, bundle) in a single document. Used for
 * publishing to a share link and for dropping into any CMS that only accepts
 * one file.
 *
 *   npm run build:artifact
 */

import { readFileSync, writeFileSync, readdirSync } from 'node:fs';
import { join } from 'node:path';

const dist = new URL('../dist/', import.meta.url).pathname;
const html = readFileSync(join(dist, 'index.html'), 'utf8');

const assets = readdirSync(join(dist, 'assets'));
const jsFile = assets.find((f) => f.endsWith('.js'));
const cssFile = assets.find((f) => f.endsWith('.css'));
if (!jsFile || !cssFile) throw new Error('run `npm run build` first');

const js = readFileSync(join(dist, 'assets', jsFile), 'utf8');
const css = readFileSync(join(dist, 'assets', cssFile), 'utf8');

if (js.includes('</script')) throw new Error('bundle contains a literal </script>; cannot inline');

// body markup of the built page, minus the tags the artifact skeleton supplies
const body = html
  .replace(/[\s\S]*<body[^>]*>/i, '')
  .replace(/<\/body>[\s\S]*/i, '')
  .replace(/<script[^>]*><\/script>/gi, '')
  .trim();

const fonts =
  (html.match(/<link rel="preconnect"[^>]*>/g) || []).join('\n    ') +
  '\n    ' +
  (html.match(/<link[^>]*fonts\.googleapis\.com[^>]*>/) || [''])[0];

const out = `<title>Glioblastoma Immune Microenvironment</title>
    ${fonts}
    <style>
${css}
    </style>

${body}

    <script type="module">
${js}
    </script>
`;

writeFileSync(join(dist, 'artifact.html'), out);
console.log(
  `dist/artifact.html    ${(Buffer.byteLength(out) / 1024).toFixed(1)} kB (fragment, for publishing)`
);

/*
 * Standalone twin: a complete document that runs straight from the filesystem
 * (double-click, no server). The bundle is inlined, so the module script has
 * nothing to fetch and the file:// origin restrictions never apply.
 */
const standalone = `<!doctype html>
<html lang="en">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <title>Glioblastoma Immune Microenvironment</title>
    ${fonts}
    <style>
${css}
    </style>
  </head>
  <body>
${body}
    <script type="module">
${js}
    </script>
  </body>
</html>
`;
writeFileSync(join(dist, 'standalone.html'), standalone);
console.log(
  `dist/standalone.html  ${(Buffer.byteLength(standalone) / 1024).toFixed(1)} kB (double-clickable, works offline)`
);
