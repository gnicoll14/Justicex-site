#!/usr/bin/env node
/* JusticeX — media conversion drop-folder.  (S7, Fable 2026-07-22)
 *
 * The generation is days of work; the conversion is the larger, unbudgeted half —
 * ~111 visual assets × (WebP/AVIF, H.264+H.265+WebM, 9:16 + 1:1 reframes, poster
 * extraction) is several hundred manual ffmpeg operations. That is the realistic
 * failure mode: not bad assets, an exhausted operator and a half-wired site.
 *
 * This makes the operator's job: generate → download → drop → run.
 *
 * USAGE
 *   node scripts/convert-media.mjs                 # process everything in _incoming/
 *   node scripts/convert-media.mjs --watch         # keep running, process on drop
 *   node scripts/convert-media.mjs --dry-run       # show what would happen
 *
 * NAMING (from the tracker's SAVE AS lines — the filename carries the routing):
 *   <n>-<surface>-hero-bg.png      → assets/visuals/<surface>/   + .webp (<300KB)
 *   <n>-<surface>-section.png      → assets/visuals/<surface>/   + .webp (<200KB)
 *   <n>-<surface>-cinematic.mp4    → assets/visuals/<surface>/   + .webm, -9x16, -1x1, -poster.png
 *   <n>-<surface>-audio.mp3        → assets/overviews/<surface>/ (copied as-is)
 *   <n>-<surface>-video.mp4        → assets/overviews/<surface>/ (copied as-is)
 *   <n>-<surface>-infographic.png  → assets/overviews/<surface>/ + .webp
 *   <n>-<surface>-deck.pdf|pptx    → assets/overviews/<surface>/ (copied as-is)
 *
 * REQUIRES ffmpeg (brew install ffmpeg). cwebp optional — ffmpeg handles WebP.
 */

import { readdirSync, existsSync, mkdirSync, copyFileSync, statSync, watch } from 'node:fs';
import { join, dirname, resolve, basename, extname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { execFileSync } from 'node:child_process';

const REPO = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const INCOMING = join(REPO, '_incoming');
const DRY = process.argv.includes('--dry-run');
const WATCH = process.argv.includes('--watch');

const HERO_KB = 300, SECTION_KB = 200, VIDEO_MB = 5;

function sh(cmd, args) {
  if (DRY) { console.log(`   [dry] ${cmd} ${args.join(' ')}`); return; }
  execFileSync(cmd, args, { stdio: ['ignore', 'ignore', 'pipe'] });
}
const kb = p => existsSync(p) ? Math.round(statSync(p).size / 1024) : 0;
function ensure(d) { if (!DRY) mkdirSync(d, { recursive: true }); }

function haveFfmpeg() {
  try { execFileSync('ffmpeg', ['-version'], { stdio: 'ignore' }); return true; }
  catch { return false; }
}

/** Encode WebP, stepping quality down until it fits the budget. */
function toWebp(src, out, budgetKB) {
  for (const q of [88, 80, 72, 64, 55]) {
    sh('ffmpeg', ['-y', '-i', src, '-quality', String(q), out]);
    if (DRY) return;
    if (kb(out) <= budgetKB) return console.log(`   webp q${q} → ${kb(out)}KB  ✓`);
  }
  console.log(`   webp → ${kb(out)}KB  ⚠ over ${budgetKB}KB budget, review manually`);
}

/** Cinematic derivatives: web mp4, webm, 9:16, 1:1, poster. */
function videoSet(src, outDir, stem) {
  const mp4 = join(outDir, `${stem}.mp4`);
  // H.264 web master — CRF stepped until under budget
  for (const crf of [23, 26, 29, 32]) {
    sh('ffmpeg', ['-y', '-i', src, '-c:v', 'libx264', '-crf', String(crf), '-preset', 'slow',
                  '-an', '-movflags', '+faststart', '-pix_fmt', 'yuv420p', mp4]);
    if (DRY || kb(mp4) / 1024 <= VIDEO_MB) break;
  }
  console.log(`   mp4  → ${kb(mp4)}KB`);
  sh('ffmpeg', ['-y', '-i', src, '-c:v', 'libvpx-vp9', '-crf', '34', '-b:v', '0', '-an',
                join(outDir, `${stem}.webm`)]);
  // Reframes — crop from the 16:9 master, never regenerate (saves credits, keeps consistency)
  sh('ffmpeg', ['-y', '-i', src, '-vf', 'crop=ih*9/16:ih', '-c:v', 'libx264', '-crf', '26',
                '-an', '-movflags', '+faststart', '-pix_fmt', 'yuv420p',
                join(outDir, `${stem}-9x16.mp4`)]);
  sh('ffmpeg', ['-y', '-i', src, '-vf', 'crop=ih:ih', '-c:v', 'libx264', '-crf', '26',
                '-an', '-movflags', '+faststart', '-pix_fmt', 'yuv420p',
                join(outDir, `${stem}-1x1.mp4`)]);
  // Poster from frame 1 — required by design-lint rule 3b (prefers-reduced-motion fallback)
  sh('ffmpeg', ['-y', '-i', src, '-vf', 'select=eq(n\\,0)', '-vframes', '1',
                join(outDir, `${stem}-poster.png`)]);
  console.log('   webm · 9x16 · 1x1 · poster  ✓');
}

function route(file) {
  const name = basename(file);
  const m = name.match(/^(\d+)-([a-z0-9-]+)-(hero-bg|section|cinematic|audio|video|infographic|deck)(.*)$/i);
  if (!m) { console.log(`  ?  ${name} — unrecognised name, skipped`); return; }
  const [, num, surface, kind] = m;
  const ext = extname(name).toLowerCase();
  const visuals = join(REPO, 'assets', 'visuals', surface);
  const overviews = join(REPO, 'assets', 'overviews', surface);
  const stem = `${num}-${surface}-${kind}`;

  console.log(`\n▸ ${name}  →  ${surface}`);

  if (kind === 'hero-bg' || kind === 'section') {
    ensure(visuals);
    if (!DRY) copyFileSync(file, join(visuals, name));
    toWebp(file, join(visuals, `${stem}.webp`), kind === 'hero-bg' ? HERO_KB : SECTION_KB);
  } else if (kind === 'cinematic') {
    ensure(visuals);
    videoSet(file, visuals, stem);
  } else if (kind === 'infographic') {
    ensure(overviews);
    if (!DRY) copyFileSync(file, join(overviews, name));
    toWebp(file, join(overviews, `${stem}.webp`), SECTION_KB);
  } else {
    ensure(overviews);
    if (!DRY) copyFileSync(file, join(overviews, name));
    console.log(`   copied (${ext})  ✓`);
  }
}

function run() {
  if (!existsSync(INCOMING)) { ensure(INCOMING); console.log(`created ${INCOMING} — drop files here.`); return; }
  const files = readdirSync(INCOMING).filter(f => !f.startsWith('.'));
  if (!files.length) return console.log('_incoming/ is empty.');
  console.log(`Processing ${files.length} file(s)${DRY ? ' [DRY RUN]' : ''}…`);
  for (const f of files) { try { route(join(INCOMING, f)); } catch (e) { console.log(`  ✗ ${f}: ${e.message}`); } }
  console.log('\nDone. Move processed files out of _incoming/ (or delete) before the next batch.');
}

if (!haveFfmpeg()) {
  console.error('ffmpeg not found. Install with:  brew install ffmpeg');
  process.exit(1);
}
run();
if (WATCH) {
  console.log('\nWatching _incoming/ … (ctrl-C to stop)');
  let t; watch(INCOMING, () => { clearTimeout(t); t = setTimeout(run, 1500); });
}
