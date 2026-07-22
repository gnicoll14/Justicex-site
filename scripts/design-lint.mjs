#!/usr/bin/env node
// JusticeX — design-system drift lint for the data-driven page path.
//
// The generator inlines its design tokens so a generated page is self-contained.
// That is exactly the condition under which drift accumulates: css/tokens.css moves,
// the generator does not, and generated surfaces quietly diverge from the hand-authored
// site. This lint is the tripwire.
//
// BLOCKING checks (exit 1):
//   1. Token parity — every token inlined in scripts/generate.js must exist in
//      css/tokens.css with an identical value.
//   2. Skeleton integrity — every generated page carries the locked Families
//      skeleton anchors in the locked order.
//   3. Flag posture (G1) — no record may ship a personalization capability ON.
//   4. Record hygiene — surface_id and url_path present and unique.
//
// ADVISORY (reported, exit 0) — consistent with the 2026-07-19 brand-drift scan,
// where off-palette hexes are LOGGED not auto-fixed; promote-or-replace is Gregg's call:
//   5. Off-token hex literals in the generator body.
//
// Usage: node scripts/design-lint.mjs

import { readFileSync, readdirSync, existsSync } from 'node:fs';
import { join, dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const REPO = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const GEN = join(REPO, 'scripts', 'generate.js');
const TOKENS_CSS = join(REPO, 'css', 'tokens.css');
const PAGES = join(REPO, 'content', 'pages');

const errors = [];
const warnings = [];
const notes = [];

// ---------- 1. Token parity ----------
const genSrc = readFileSync(GEN, 'utf8');
const blockMatch = genSrc.match(/const TOKEN_BLOCK = `([^`]*)`/);
if (!blockMatch) {
  errors.push('generate.js: could not find the TOKEN_BLOCK constant — the lint cannot verify token parity.');
} else {
  const inlined = Object.fromEntries(
    blockMatch[1].split(';').filter(Boolean).map(d => {
      const i = d.indexOf(':');
      return [d.slice(0, i).trim(), d.slice(i + 1).trim().toUpperCase()];
    })
  );

  const cssSrc = readFileSync(TOKENS_CSS, 'utf8');
  const canonical = {};
  for (const m of cssSrc.matchAll(/(--jx-[A-Za-z0-9-]+)\s*:\s*([^;]+);/g)) {
    canonical[m[1]] = m[2].trim().toUpperCase();
  }

  for (const [name, value] of Object.entries(inlined)) {
    if (!(name in canonical)) {
      errors.push(`token drift: ${name} is inlined in generate.js but absent from css/tokens.css.`);
    } else if (canonical[name] !== value) {
      errors.push(`token drift: ${name} = ${value} in generate.js but ${canonical[name]} in css/tokens.css (tokens.css wins).`);
    }
  }
  notes.push(`token parity: ${Object.keys(inlined).length} inlined tokens checked against ${Object.keys(canonical).length} in css/tokens.css.`);
}

// ---------- 5. Off-token hex literals (advisory) ----------
const body = blockMatch ? genSrc.replace(blockMatch[0], '') : genSrc;
const strayHex = [...new Set([...body.matchAll(/#[0-9A-Fa-f]{6}\b/g)].map(m => m[0].toUpperCase()))];
if (strayHex.length) {
  warnings.push(`${strayHex.length} off-token hex literal(s) in the generator body: ${strayHex.join(', ')}. ` +
    `Consistent with the 07-19 brand-drift scan — logged, not auto-fixed; promote-to-token or replace is Gregg's call.`);
}

// ---------- Records ----------
if (!existsSync(PAGES)) {
  errors.push('content/pages/ does not exist — no records to lint.');
} else {
  const files = readdirSync(PAGES).filter(f => f.endsWith('.json'));
  if (!files.length) warnings.push('content/pages/ holds no records.');

  const seenId = new Map();
  const seenPath = new Map();

  for (const f of files) {
    const rec = JSON.parse(readFileSync(join(PAGES, f), 'utf8'));
    const tag = `content/pages/${f}`;

    // 4. Record hygiene
    if (!rec.surface_id) errors.push(`${tag}: missing surface_id.`);
    if (!rec.url_path) errors.push(`${tag}: missing url_path.`);
    if (rec.surface_id) {
      if (seenId.has(rec.surface_id)) errors.push(`${tag}: duplicate surface_id '${rec.surface_id}' (also ${seenId.get(rec.surface_id)}).`);
      seenId.set(rec.surface_id, tag);
    }
    if (rec.url_path) {
      if (seenPath.has(rec.url_path)) errors.push(`${tag}: duplicate url_path '${rec.url_path}' (also ${seenPath.get(rec.url_path)}).`);
      seenPath.set(rec.url_path, tag);
    }

    // 3. Flag posture (G1) — personalization capabilities default OFF in production.
    const av = (rec.media && rec.media.avatar) || {};
    if (av.enabled && av.modality === 'real_consented_avatar') {
      if (!av.consent_ref) {
        errors.push(`${tag}: real_consented_avatar with no consent_ref — a real presenter may not ship without a recorded consent reference.`);
      } else {
        warnings.push(`${tag}: real_consented_avatar is set; confirm avatar_presenter_v1 is flag-gated OFF in production before publish.`);
      }
    }
    const gov = rec.governance || {};
    if (gov.status === 'published') {
      if (gov.brand_legal_qa !== 'pass') errors.push(`${tag}: status=published but brand_legal_qa=${gov.brand_legal_qa || 'unset'}.`);
      if (gov.design_lint !== 'pass') errors.push(`${tag}: status=published but design_lint=${gov.design_lint || 'unset'}.`);
      if (gov.fable_review !== 'pass' && gov.fable_review !== 'n/a') errors.push(`${tag}: status=published but fable_review=${gov.fable_review || 'unset'}.`);
    }
    // Gated/Roadmap coverage may not go public without the counsel gate cleared.
    const cov = Array.isArray(rec.coverage) ? rec.coverage : [];
    if (gov.status === 'published' && cov.some(c => c === 'Gated' || c === 'Roadmap') && gov.counsel_gate !== 'cleared') {
      errors.push(`${tag}: coverage includes ${cov.join('/')} but counsel_gate=${gov.counsel_gate || 'unset'} — must be 'cleared' before public wiring.`);
    }
    // 1:1 co-brand carries a named third party — always counsel-gated (Q125 / Q-WP7).
    const acct = rec.taxonomy && rec.taxonomy.account;
    if (acct && acct.name && gov.counsel_gate !== 'cleared') {
      warnings.push(`${tag}: 1:1 co-brand '${acct.name}' — publishing a real named account requires counsel Q125/Q-WP7 clearance.`);
    }
  }
}

// ---------- 2. Skeleton integrity ----------
// Render each record in-process and assert the locked anchors appear in the locked order.
const LOCKED_ORDER = ['id="how"', 'id="media"', 'id="value"', 'id="example"', 'id="get-started"'];
try {
  const { createRequire } = await import('node:module');
  const require = createRequire(import.meta.url);
  const { render } = require(GEN);
  const files = existsSync(PAGES) ? readdirSync(PAGES).filter(f => f.endsWith('.json')) : [];
  for (const f of files) {
    const rec = JSON.parse(readFileSync(join(PAGES, f), 'utf8'));
    const html = render(rec);
    let cursor = -1;
    for (const anchor of LOCKED_ORDER) {
      const at = html.indexOf(anchor);
      if (at === -1) { errors.push(`content/pages/${f}: rendered page is missing the locked anchor ${anchor}.`); break; }
      if (at < cursor) { errors.push(`content/pages/${f}: locked skeleton out of order at ${anchor}.`); break; }
      cursor = at;
    }
    if (!html.includes('How JusticeX keeps this honest')) {
      errors.push(`content/pages/${f}: rendered page is missing the concentrated disclosure block.`);
    }
    if (rec.taxonomy?.account?.name && !html.includes('Illustrative 1:1 co-branded exemplar')) {
      errors.push(`content/pages/${f}: 1:1 co-brand record rendered without the illustrative/authorization banner.`);
    }

    // No dead links. A generated page may only link to an in-page anchor or a real
    // file that exists in the repo. href="#" is the tell for placeholder chrome that
    // shipped — it looks live and goes nowhere.
    for (const m of html.matchAll(/href="([^"]*)"/g)) {
      const href = m[1];
      if (href === '#') {
        errors.push(`content/pages/${f}: rendered page contains a dead href="#".`);
        continue;
      }
      if (href.startsWith('#') || /^(https?:|mailto:|tel:)/.test(href)) continue;
      const target = href.split(/[?#]/)[0];
      if (target && !existsSync(join(REPO, target))) {
        errors.push(`content/pages/${f}: rendered page links to '${target}', which does not exist in the repo.`);
      }
    }
  }
} catch (e) {
  errors.push(`skeleton check could not run: ${e.message}`);
}

// ---------- Report ----------
console.log('== JusticeX design-system drift lint ==\n');
for (const n of notes) console.log(`note   ${n}`);
for (const w of warnings) console.log(`WARN   ${w}`);
for (const e of errors) console.log(`FAIL   ${e}`);
console.log('');
if (errors.length) {
  console.log(`DRIFT — ${errors.length} blocking issue(s), ${warnings.length} advisory.`);
  process.exit(1);
}
console.log(`CLEAN — 0 blocking issues, ${warnings.length} advisory.`);
