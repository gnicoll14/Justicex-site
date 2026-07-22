#!/usr/bin/env node
/* JusticeX — data-driven page generator.
   Reads a content-model record (content/pages/*.json, per content/content-model.schema.json v2)
   and renders it into the LOCKED Families skeleton. Same locked shell for every page;
   only the record varies. See content/README.md for the full workflow.

   Usage: node scripts/generate.js --all [--publish]
          node scripts/generate.js <record.json> [outDir]
*/
const fs = require('fs');
const path = require('path');

// ---- B2: global visual-personalization kill-switch ----
// Counsel's red button. content/flags.json is read once at render; global:false suppresses the
// Higgsfield visual layer on EVERY surface regardless of per-record flags, falling back to the
// locked navy gradient. A missing or malformed file fails SAFE (treated as global:true so the
// per-record flags still govern) - but a file present with global:false is absolute.
function loadFlags() {
  try {
    const p = path.join(__dirname, '..', 'content', 'flags.json');
    if (!fs.existsSync(p)) {
      // Fable re-check flag 2: the default (fail open) is deliberate - a vanished config must not
      // silently strip the site. But a counsel red button whose config can disappear unnoticed is
      // a gap, so its absence is LOUD.
      console.warn('\n' + '='.repeat(72));
      console.warn('WARNING: content/flags.json NOT FOUND.');
      console.warn('The global visual-personalization kill-switch is INACTIVE.');
      console.warn('Per-record media.visual_personalization flags govern; counsel has no');
      console.warn('single off-switch until this file is restored.');
      console.warn('='.repeat(72) + '\n');
      return { global: true, surfaces: {} };
    }
    const f = JSON.parse(fs.readFileSync(p, 'utf8'));
    const vp = f.visual_personalization || {};
    return { global: vp.global !== false, surfaces: vp.surfaces || {} };
  } catch (e) {
    console.warn('\n' + '='.repeat(72));
    console.warn('WARNING: content/flags.json is MALFORMED (' + e.message + ').');
    console.warn('The global visual-personalization kill-switch is INACTIVE.');
    console.warn('='.repeat(72) + '\n');
    return { global: true, surfaces: {} };
  }
}
const FLAGS = loadFlags();

const esc = s => String(s == null ? '' : s)
  .replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;');

// ---- LOCKED design tokens ----
// Mirrored from css/tokens.css (the design-system source of truth). They are inlined
// so a generated page is self-contained, which means they CAN drift. That drift is
// what scripts/design-lint.mjs exists to catch: it diffs this block against
// css/tokens.css and fails CI on any divergence. Do not hand-edit a value here —
// change css/tokens.css and re-run the lint.
const TOKEN_BLOCK = `--jx-navy-900:#021A33;--jx-navy-800:#042C53;--jx-navy-700:#0A3866;--jx-navy-600:#154572;--jx-navy-500:#2A5582;--jx-coral-600:#B04722;--jx-coral-500:#D85A30;--jx-coral-100:#FAECE7;--jx-coralLt-500:#F0997B;--jx-slate-700:#3A3937;--jx-slate-500:#5F5E5A;--jx-stone-200:#D1DEEE;--jx-stone-100:#E6F1FB;--jx-white:#FFFFFF;--jx-paper:#F4F6FA;--jx-hero-scrim-navy:linear-gradient(180deg,rgba(4,44,83,.78),rgba(2,26,51,.86));--jx-hero-scrim-light:linear-gradient(180deg,rgba(255,255,255,.82),rgba(255,255,255,.88))`;

const TOKENS = Object.fromEntries(
  TOKEN_BLOCK.split(';').map(d => d.split(':')).map(([k, v]) => [k.trim(), v.trim().toUpperCase()])
);

// ---- LOCKED shell (tokens + skeleton CSS). Never varies per record. ----
const HEAD = (title) => `<!DOCTYPE html><html lang="en"><head>
<meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1">
<title>${esc(title)}</title>
<link rel="preconnect" href="https://fonts.googleapis.com"><link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Source+Sans+3:wght@400;500;600;700&family=Source+Serif+4:opsz,wght@8..60,400;8..60,600;8..60,700&display=swap" rel="stylesheet">
<style>
:root{${TOKEN_BLOCK};--font-display:'Source Serif 4',Georgia,serif;--font-body:'Source Sans 3',system-ui,sans-serif;--ease:cubic-bezier(0.2,0.6,0.2,1)}
*{box-sizing:border-box}html,body{margin:0}body{font-family:var(--font-body);color:var(--jx-navy-800);background:#fff;font-size:17px;line-height:1.55;-webkit-font-smoothing:antialiased}
h1,h2,h3,h4{font-family:var(--font-display);line-height:1.2;margin:0}.wrap{max-width:1120px;margin:0 auto;padding:0 24px}
.eyebrow{font-size:11px;letter-spacing:.22em;text-transform:uppercase;font-weight:700;color:var(--jx-coral-600)}a{color:inherit}
.btn{display:inline-flex;align-items:center;gap:8px;font-weight:600;font-size:15px;border-radius:6px;padding:12px 20px;border:1px solid transparent;cursor:pointer;text-decoration:none;transition:all .18s var(--ease)}
.btn--primary{background:var(--jx-coral-500);color:#fff}.btn--primary:hover{background:var(--jx-coral-600)}.btn--secondary{background:transparent;color:var(--jx-navy-800);border-color:var(--jx-stone-200)}.btn--ghost{background:transparent;color:var(--jx-navy-700);padding:12px 8px}.btn--sm{padding:8px 14px;font-size:13px}
.nav{position:sticky;top:0;z-index:40;background:var(--jx-navy-800);color:#fff}.nav__inner{display:flex;align-items:center;justify-content:space-between;height:64px}
.brand{display:flex;align-items:center;gap:10px;font-family:var(--font-display);font-weight:700;font-size:20px;color:#fff;text-decoration:none}.brand .x{color:var(--jx-coralLt-500)}.hexmark{width:26px;height:29px}
.nav__links{display:flex;gap:24px;font-size:15px;color:var(--jx-stone-200)}.nav__links a{text-decoration:none}.nav__links a:hover{color:#fff}.nav__cta{display:flex;align-items:center;gap:16px}
.cobrand{display:flex;align-items:center;gap:8px;padding-left:14px;margin-left:2px;border-left:1px solid var(--jx-navy-500);font-size:13px;color:var(--jx-stone-200)}.cobrand .logo{width:24px;height:24px;border-radius:4px;background:var(--jx-coralLt-500);color:var(--jx-navy-900);display:grid;place-items:center;font-size:11px;font-weight:700}
.illus{background:#FBF3D6;color:#7a5c00;text-align:center;font-size:12px;padding:6px 0;border-bottom:1px solid #ecdca0}
.ribbon{background:var(--jx-stone-100);border-bottom:1px solid var(--jx-stone-200);font-size:13px;color:var(--jx-navy-700)}.ribbon__inner{display:flex;align-items:center;justify-content:space-between;padding:8px 0;gap:16px;flex-wrap:wrap}.ribbon .who{display:flex;align-items:center;gap:10px}.ribbon .avatar{width:26px;height:26px;border-radius:999px;background:var(--jx-navy-700);color:#fff;display:grid;place-items:center;font-size:11px;font-weight:700}
.pills{display:flex;gap:8px;flex-wrap:wrap}.pill{font-size:13px;padding:3px 10px;border-radius:999px;background:#fff;border:1px solid var(--jx-stone-200);color:var(--jx-navy-700)}.pill--accent{background:var(--jx-coral-100);border-color:var(--jx-coralLt-500);color:var(--jx-coral-600);font-weight:600}
.hero{background:linear-gradient(180deg,var(--jx-navy-800),var(--jx-navy-900));color:#fff;padding:80px 0 64px;position:relative;overflow:hidden}.hero__bg{position:absolute;inset:0;z-index:0}.hero__bg img,.hero__bg video{width:100%;height:100%;object-fit:cover;display:block}.hero__scrim{position:absolute;inset:0;z-index:1;background:var(--jx-hero-scrim-navy)}.hero > .wrap{position:relative;z-index:2}.secfig{margin-top:32px;border-radius:12px;overflow:hidden;border:1px solid var(--jx-stone-200)}.secfig img{width:100%;height:auto;display:block}@media(prefers-reduced-motion:reduce){.hero__bg video{display:none}}.hero .eyebrow{color:var(--jx-coralLt-500)}.hero h1{font-size:56px;max-width:16ch;margin:14px 0 0;letter-spacing:-.02em}.hero .lead{font-size:20px;color:var(--jx-stone-200);max-width:56ch;margin:18px 0 0}.hero__cta{margin-top:32px;display:flex;gap:14px;flex-wrap:wrap}.hero__cta .btn--secondary{color:#fff;border-color:var(--jx-navy-500)}
.indexbar{background:var(--jx-navy-700);border-bottom:1px solid var(--jx-navy-500)}.indexbar__inner{display:flex;gap:32px;overflow-x:auto;padding:14px 0}.indexbar a{color:var(--jx-stone-200);text-decoration:none;font-size:15px;white-space:nowrap;font-weight:500}.indexbar a:hover{color:#fff}
section.band{padding:64px 0}.band--paper{background:var(--jx-paper)}.band h2{font-size:40px;letter-spacing:-.01em;max-width:24ch}.lede{font-size:17px;color:var(--jx-slate-500);max-width:62ch;margin-top:12px}.substance{font-size:19px;color:var(--jx-slate-700);max-width:64ch;margin-top:16px}.frame{margin-top:20px;padding-left:16px;border-left:3px solid var(--jx-coral-500);color:var(--jx-navy-700);font-style:italic;max-width:60ch}
.figure{margin-top:32px;border:1px solid var(--jx-stone-200);border-radius:16px;background:#fff;box-shadow:0 4px 12px rgba(4,44,83,.08);overflow:hidden}.figstage{aspect-ratio:16/6;display:grid;place-items:center;background:radial-gradient(circle at 20% 30%,rgba(216,90,48,.06),transparent 40%),radial-gradient(circle at 80% 70%,rgba(4,44,83,.05),transparent 45%),#fff}.figure__cap{display:flex;align-items:center;justify-content:space-between;padding:12px 18px;border-top:1px solid var(--jx-stone-200);font-size:13px;color:var(--jx-slate-500);background:var(--jx-paper)}
.pipeline{display:flex;gap:6px;align-items:center;flex-wrap:wrap;justify-content:center;padding:20px}.stage{display:flex;flex-direction:column;align-items:center;gap:6px;min-width:74px}.stage .hex{width:44px;height:50px;display:grid;place-items:center;color:#fff;font-weight:700;font-size:15px}.stage small{font-size:11px;color:var(--jx-slate-500);text-align:center}.arrow{color:var(--jx-stone-200);font-size:18px}
.hub{display:grid;grid-template-columns:repeat(3,1fr);gap:20px;margin-top:32px}.hubcard{border:1px solid var(--jx-stone-200);border-radius:10px;padding:24px;background:#fff;box-shadow:0 1px 2px rgba(4,44,83,.06)}.hubcard .k{font-size:11px;letter-spacing:.22em;text-transform:uppercase;color:var(--jx-coral-600);font-weight:700}.hubcard h4{font-size:22px;margin:8px 0 6px}.hubcard p{font-size:13px;color:var(--jx-slate-500);margin:0 0 14px}.flag{display:inline-block;margin-top:10px;font-size:11px;font-weight:700;letter-spacing:.06em;color:var(--jx-slate-500);background:var(--jx-paper);border:1px dashed var(--jx-stone-200);border-radius:999px;padding:2px 10px}
.grid3{display:grid;grid-template-columns:repeat(3,1fr);gap:24px;margin-top:40px}.card{background:#fff;border:1px solid var(--jx-stone-200);border-radius:10px;padding:24px;box-shadow:0 1px 2px rgba(4,44,83,.06)}.card .n{font-family:var(--font-display);font-size:28px;color:var(--jx-coral-500);font-weight:700}.card p{font-size:14px;color:var(--jx-slate-700);margin:8px 0 0}
.matter{display:grid;grid-template-columns:1.1fr .9fr;gap:32px;align-items:center;margin-top:24px}.matter .box{background:var(--jx-navy-800);color:#fff;border-radius:16px;padding:32px}.matter .box .eyebrow{color:var(--jx-coralLt-500)}.matter ul{margin:14px 0 0;padding:0;list-style:none}.matter li{padding:9px 0;border-top:1px solid var(--jx-navy-600);font-size:15px;display:flex;justify-content:space-between;gap:16px;color:var(--jx-stone-200)}.matter li span{color:#fff;font-weight:600;text-align:right}
.cta{background:var(--jx-coral-500);color:#fff;text-align:center;padding:64px 0}.cta h2{color:#fff;margin:0 auto;max-width:22ch}.cta p{color:#fff;opacity:.92;max-width:52ch;margin:14px auto 0}.cta .btn--primary{background:#fff;color:var(--jx-coral-600);margin-top:32px}.cta .btn--primary:hover{background:var(--jx-coral-100)}
.honest{background:var(--jx-paper);border-top:1px solid var(--jx-stone-200);padding:40px 0;font-size:14px;color:var(--jx-slate-500)}.honest h3{font-size:13px;letter-spacing:.14em;text-transform:uppercase;color:var(--jx-navy-700);margin-bottom:10px}.covtags{display:flex;gap:8px;flex-wrap:wrap;margin-bottom:14px}.covtag{font-size:12px;font-weight:600;padding:3px 10px;border-radius:999px}.cov-live{background:#D6EBDD;color:#1D6B4E}.cov-road{background:var(--jx-coral-100);color:var(--jx-coral-600)}.honest p{max-width:82ch;margin:0 0 8px}.standing{font-style:italic}
.foot{background:var(--jx-navy-900);color:#9CA0A7;font-size:13px;padding:36px 0}.foot__inner{display:flex;justify-content:space-between;gap:24px;flex-wrap:wrap}.foot a{color:var(--jx-stone-200);text-decoration:none;margin-right:16px}
@media(max-width:820px){.nav__links{display:none}.hero h1{font-size:40px}.band h2{font-size:30px}.grid3,.hub{grid-template-columns:1fr}.matter{grid-template-columns:1fr}}
</style></head><body>`;

const HEX = `<svg class="hexmark" viewBox="0 0 26 29" aria-hidden="true"><path d="M13 1 24.5 7.5v14L13 28 1.5 21.5v-14L13 1Z" fill="none" stroke="#F0997B" stroke-width="2"/><path d="M8.5 9.5l9 9M17.5 9.5l-9 9" stroke="#F0997B" stroke-width="2.4" stroke-linecap="round"/></svg>`;

// ---- Shared chrome routes ----
// Mirrored from js/partials.js, which is the site's canonical nav/footer definition.
// NOTE (open proposal): per the media standard SC-1, shared chrome should come FROM
// the partials rather than be re-declared here. Doing that means the generated page
// loads css/site.css + css/tokens.css instead of inlining its own shell — which would
// also retire the token-drift class of bug entirely. That is a change to the approved
// locked skeleton, so it is raised for Gregg, not made unilaterally. Until then these
// routes are kept in step with partials.js and the design lint fails on any dead href.
const NAV_LINKS = [
  ['index.html', 'Home'],
  ['markets.html', 'Markets'],
  ['solutions.html', 'Solutions'],
  ['technology.html', 'Technology'],
  ['about.html', 'About'],
  ['contact.html', 'Contact'],
];
const FOOT_LINKS = [
  ['solutions.html', 'Solutions'],
  ['markets.html', 'Markets'],
  ['technology.html', 'Technology'],
  ['trust.html', 'Trust'],
  ['disclaimer.html', 'Disclaimer'],
];

function render(r){
  const tx = r.taxonomy||{}, c = r.copy||{}, d = r.disclosure_block||{}, m = r.media||{}, av = (m.avatar||{});
  const acct = tx.account && tx.account.name ? tx.account : null;
  const pres = tx.presenter||{};
  const sol = tx.solution||{};
  const cov = Array.isArray(r.coverage)? r.coverage : (r.coverage?[r.coverage]:[]);
  const doorLabel = tx.channel && tx.channel!=='n/a' ? `Channel · ${tx.channel}` : (tx.market && tx.market!=='n/a' ? `Market · ${tx.market}` : (tx.door||''));
  const preparedBy = acct ? `Prepared for ${esc(acct.name)} by ${esc(pres.name||'JusticeX')} · ${esc(pres.title||'JusticeX')}`
                          : `Prepared by ${esc(pres.name||'JusticeX')} · ${esc(pres.title||'JusticeX')}`;
  const initials = esc(pres.initials||'JX');

  let out = HEAD(acct ? `JusticeX × ${acct.name}` : `JusticeX — ${c.hero_eyebrow||r.surface_id}`);

  // Illustrative banner (1:1 co-brand only)
  if(acct) out += `<div class="illus">Illustrative 1:1 co-branded exemplar — “${esc(acct.name)}” placeholder; co-branding a real account requires authorization (counsel Q-WP7 / Q125) before publish.</div>`;

  // LOCKED nav (+ co-brand slot when account present)
  out += `<header class="nav"><div class="wrap nav__inner"><a class="brand" href="index.html">${HEX}<span>Justice<span class="x">X</span></span>`
       + (acct ? `<span class="cobrand"><span class="logo">${esc(acct.name.split(' ').map(w=>w[0]||'').join('').slice(0,2).toUpperCase())}</span><span>${esc(acct.name)}</span></span>` : '')
       + `</a><nav class="nav__links">${NAV_LINKS.map(([h,l])=>`<a href="${h}">${l}</a>`).join('')}</nav>`
       // No "Sign in" until the console is live behind auth — a dead sign-in link on a
       // pre-launch marketing page invites a support ticket and implies an account exists.
       + `<div class="nav__cta"><a href="#get-started" class="btn btn--primary btn--sm">${esc(c.the_ask||'Get started')}</a></div></div></header>`;

  // TAILORED ribbon
  const covPill = acct ? '1:1 · Named account' : (cov[0]||'');
  out += `<div class="ribbon"><div class="wrap ribbon__inner"><div class="who"><span class="avatar">${initials}</span><span>${preparedBy}</span></div>`
       + `<div class="pills"><span class="pill pill--accent">${esc(sol.litigation_type||'')}${sol.jurisdiction?' · '+esc(sol.jurisdiction):''}</span><span class="pill">${esc(doorLabel)}</span>${covPill?`<span class="pill">${esc(covPill)}</span>`:''}</div></div></div>`;

  // HERO = Lead
  const ra = (m.rendered_assets || {});
  const _surfaceFlag = FLAGS.surfaces[r.surface_id];
  const vp = FLAGS.global !== false
          && _surfaceFlag !== false
          && m.visual_personalization === true;
  const heroMotion = vp ? ra.motion_bg : null;
  const heroStill = vp ? ra.hero_image : null;
  const heroPoster = vp ? (ra.motion_bg_poster || ra.hero_image) : null;
  let heroLayer = '';
  if (heroMotion) {
    heroLayer = `<div class="hero__bg"><video autoplay muted loop playsinline` + (heroPoster?` poster="${esc(heroPoster)}"`:'') + ` aria-hidden="true"><source src="${esc(heroMotion)}" type="video/mp4"></video></div><div class="hero__scrim"></div>`;
  } else if (heroStill) {
    heroLayer = `<div class="hero__bg"><img src="${esc(heroStill)}" alt="" aria-hidden="true"></div><div class="hero__scrim"></div>`;
  }
  out += `<section class="hero">${heroLayer}<div class="wrap"><div class="eyebrow">${esc(c.hero_eyebrow||'')}</div>`
       + `<h1>${esc(c.hero_title||'')}</h1><p class="lead">${esc(c.lead||'')}</p>`
       + `<div class="hero__cta"><a href="#get-started" class="btn btn--primary">${esc(c.the_ask||'Get started')}</a><a href="#how" class="btn btn--secondary">See how it works</a></div></div></section>`;

  // LOCKED index bar
  out += `<nav class="indexbar"><div class="wrap indexbar__inner"><a href="#how">How it works</a><a href="#media">Watch · Hear · See</a><a href="#value">Why it fits</a><a href="#example">Worked example</a><a href="#get-started">Get started</a></div></nav>`;

  // SUBSTANCE + tier-2 frame + infographic
  const hexes=['Plan','Intake','Redact','Summarize','Gap<br>Analysis','Resolution','Memo'];
  const pipeline = hexes.map((n,i)=>`<div class="stage"><div class="hex" style="background:var(--jx-${i===4?'coral-500':'navy-700'})">${i+1}</div><small>${n}</small></div>`).join('<span class="arrow">→</span>');
  out += `<section class="band" id="how"><div class="wrap"><div class="eyebrow">How it works</div><h2>The same seven stages, for every party and every matter.</h2>`
       + `<p class="substance">${esc(c.substance||'')}</p>`
       + (c.tier2_frame?`<p class="frame">${esc(c.tier2_frame)}</p>`:'')
       + `<div class="figure">`
       + (ra.infographic
           ? `<div class="figstage" style="aspect-ratio:auto;padding:0"><img src="${esc(ra.infographic)}" alt="${esc('Infographic: '+(c.hero_title||'overview'))}" style="width:100%;height:auto;display:block"></div>`
           : `<div class="figstage"><div class="pipeline">${pipeline}</div></div>`)
       + `<div class="figure__cap"><span>${ra.infographic?'Overview infographic for this surface.':'Overview infographic — placeholder; generated in Gemini Notebook for this surface.'}</span><span>AI-assisted · figures illustrative</span></div></div>`
       + ((vp && ra.section_art) ? `<div class="secfig"><img src="${esc(ra.section_art)}" alt="${esc('Illustration for '+(c.hero_title||'this section'))}" loading="lazy"></div>` : '')
       + `</div></section>`;

  // MEDIA HUB
  // Media assets are wired only once they exist and have passed brand+legal QA.
  // Until then the control renders as a DISABLED span, not a dead link — a live-looking
  // "Play video" that goes nowhere is worse than an honestly unavailable one.
  const asset = (m.rendered_assets || {});
  const control = (key, label) => asset[key]
    ? `<a class="btn btn--secondary btn--sm" href="${esc(asset[key])}">${label} ▸</a><div class="flag">wired</div>`
    : `<span class="btn btn--secondary btn--sm" aria-disabled="true" style="opacity:.55;cursor:default">${label} ▸</span>`
      + `<div class="flag">pending · media not yet generated</div>`;

  out += `<section class="band band--paper" id="media"><div class="wrap"><div class="eyebrow">On this page</div><h2>Watch · Hear · See</h2><div class="hub">`
       + `<div class="hubcard"><div class="k">Watch</div><h4>Overview video</h4><p>A short video tuned to this audience.</p>${control('video','Play video')}</div>`
       + `<div class="hubcard"><div class="k">Hear</div><h4>Audio deep-dive</h4><p>A narrated walk-through of the seven-stage process.</p>${control('audio','Play audio')}</div>`
       + `<div class="hubcard"><div class="k">See</div><h4>Slide deck</h4><p>A one-pager to share.</p>${control('deck','Open deck')}</div></div>`;
  if(av.enabled){
    const mod = av.modality==='real_consented_avatar' ? `a real, consented ${esc(av.tool||'presenter')} avatar` : 'a professional voice-guided walkthrough';
    out += `<p style="font-size:13px;color:var(--jx-slate-500);margin-top:14px">This page is narrated by ${mod} — <em>AI-assisted presenter, shown at first exposure</em>. <span class="flag">flag: avatar_presenter_v1 — ${av.modality==='real_consented_avatar'?'gated':'OFF (voice for pilot)'}</span></p>`;
  }
  out += `</div></section>`;

  // PROOF
  const cards = (c.proof_points||[]).map(p=>`<div class="card"><div class="n">◆</div><p>${esc(p)}</p></div>`).join('');
  out += `<section class="band" id="value"><div class="wrap"><div class="eyebrow">Why it fits</div><h2>Built around the way you already work.</h2><div class="grid3">${cards}</div></div></section>`;

  // WORKED EXAMPLE
  const ex = c.example_matter||{};
  const rows = (ex.rows||[]).map(x=>`<li>${esc(x.label)}<span>${esc(x.value)}</span></li>`).join('');
  out += `<section class="band band--paper" id="example"><div class="wrap"><div class="eyebrow">Worked example</div><h2>A neutral side-by-side, from real inputs.</h2><p class="lede">Illustrative synthetic matter — no real party data enters the platform.</p>`
       + `<div class="matter"><div><p style="font-size:17px;color:var(--jx-slate-700)">${esc(ex.body||'')}</p></div>`
       + `<div class="box"><div class="eyebrow">${esc(ex.case_name||'')}</div><ul>${rows}</ul></div></div></div></section>`;

  // CTA = the ask (close on master promise)
  out += `<section class="cta" id="get-started"><div class="wrap"><div class="eyebrow" style="color:#fff">Get started</div><h2>${esc(c.the_ask||'Get started')}</h2>`
       + `<p>${esc(c.master_promise||'')}</p><a href="${esc(c.cta_href||'#')}" class="btn btn--primary">${esc(c.the_ask||'Get started')}</a></div></section>`;

  // CONCENTRATED DISCLOSURE
  const covtags = (c.coverage_tags||[]).map(t=>`<span class="covtag ${/roadmap/i.test(t)?'cov-road':'cov-live'}">${esc(t)}</span>`).join('');
  out += `<section class="honest"><div class="wrap"><div class="covtags">${covtags}</div><h3>How JusticeX keeps this honest</h3>`
       + `<p>${esc(d.keeps_this_honest||'')}</p><p>${esc(d.coverage_statement||'')}</p><p class="standing">${esc(d.standing_line||'AI-assisted overviews · figures illustrative · not legal advice.')}</p></div></section>`;

  // LOCKED footer
  out += `<footer class="foot"><div class="wrap"><div class="foot__inner"><div><span class="brand" style="font-size:18px">Justice<span class="x">X</span></span><div style="margin-top:8px">Truth · Fairness · Efficiency</div></div><div>${FOOT_LINKS.map(([h,l])=>`<a href="${h}">${l}</a>`).join('')}</div></div></div></footer></body></html>`;
  return out;
}

module.exports = { render, TOKENS };

// ---- CLI ----
// Default output is _generated/ — a STAGING directory, not served by Netlify.
// Writing into the served site root requires the explicit --publish flag, so the
// data-driven path is default-OFF at the filesystem level (G1).
if (require.main === module) {
  const args = process.argv.slice(2);
  const publish = args.includes('--publish');
  const all = args.includes('--all');
  const positional = args.filter(a => !a.startsWith('--'));

  const REPO = path.resolve(__dirname, '..');
  const PAGES = path.join(REPO, 'content', 'pages');
  const outDir = publish ? REPO : path.join(REPO, '_generated');

  if (!all && positional.length === 0) {
    console.error('usage: node scripts/generate.js <record.json> [outDir]');
    console.error('       node scripts/generate.js --all [--publish]');
    process.exit(1);
  }

  const records = all
    ? fs.readdirSync(PAGES).filter(f => f.endsWith('.json')).map(f => path.join(PAGES, f))
    : [positional[0]];
  const explicitOut = (!all && positional[1]) ? positional[1] : outDir;
  fs.mkdirSync(explicitOut, { recursive: true });

  for (const recPath of records) {
    const rec = JSON.parse(fs.readFileSync(recPath, 'utf8'));
    const html = render(rec);
    // Published pages take the clean surface name; staged pages keep .generated
    // so a staged artifact can never be mistaken for a hand-authored page.
    const name = (rec.surface_id || 'page') + (publish ? '.html' : '.generated.html');
    const outFile = path.join(explicitOut, name);
    fs.writeFileSync(outFile, html);
    console.log('generated', path.relative(REPO, outFile), '(' + html.length + ' bytes) from', path.basename(recPath));
  }
  if (!publish) console.log('\nStaged to _generated/ — not served. Re-run with --publish to write into the site root.');
}
