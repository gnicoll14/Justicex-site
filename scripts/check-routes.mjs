#!/usr/bin/env node
// Routing self-test: every `contact.html?path=X` used in the site must resolve to a
// key in the js/site.js audience router map (or be an intentionally-unmapped path).
// Catches the "CTA points at an unmapped path -> shows no form" class of bug.
import { readFileSync, readdirSync, statSync } from 'node:fs';
import { join } from 'node:path';

const siteJs = readFileSync('js/site.js', 'utf8');
const mapBlock = siteJs.match(/const map = \{([^}]*)\}/s);
if (!mapBlock) { console.error('FAIL: could not find router map in js/site.js'); process.exit(1); }
const mapKeys = new Set([...mapBlock[1].matchAll(/'([a-z-]+)'\s*:/g)].map(m => m[1]));

// Paths intentionally left unmapped (documented behaviour).
const allowedUnmapped = new Set(['demo', 'early', 'employer']); // generic "Get early access" -> picker unselected (visitor self-selects)

function htmlFiles(dir) {
  let out = [];
  for (const e of readdirSync(dir)) {
    if (e === 'node_modules' || e.startsWith('.')) continue;
    const p = join(dir, e);
    const s = statSync(p);
    if (s.isDirectory()) out = out.concat(htmlFiles(p));
    else if (e.endsWith('.html')) out.push(p);
  }
  return out;
}

const used = new Map(); // path -> [files]
for (const f of htmlFiles('.')) {
  const txt = readFileSync(f, 'utf8');
  for (const m of txt.matchAll(/contact\.html\?path=([a-z-]+)/g)) {
    if (!used.has(m[1])) used.set(m[1], []);
    used.get(m[1]).push(f);
  }
}

let bad = 0;
for (const [p, files] of used) {
  if (!mapKeys.has(p) && !allowedUnmapped.has(p)) {
    bad++;
    console.error(`FAIL: path="${p}" is used but has no router map entry -> ${[...new Set(files)].join(', ')}`);
  }
}
if (bad) { console.error(`\n${bad} unmapped path(s). Add to the map in js/site.js or to allowedUnmapped.`); process.exit(1); }
console.log(`OK: ${used.size} CTA path(s) all resolve (map: ${[...mapKeys].join(', ')}; intentional-unmapped: ${[...allowedUnmapped].join(', ')}).`);
