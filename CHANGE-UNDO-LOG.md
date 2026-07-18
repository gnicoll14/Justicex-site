# JusticeX — Design-System & Counsel Un-Hold — Change & Undo Log

Branch: `design-system-consistency` (staged, **not pushed**). Base: `main` @ `31a20a1`.
Started 2026-07-18. Every change is an atomic commit on this branch, layered on top of the
pre-existing uncommitted WIP tree, which was left untouched.

## How to undo

- **Undo one change:** `git revert <sha>` (safe, keeps history) or `git reset --hard <sha>~1` (discards).
- **Undo one counsel item at runtime (no code change):** it is behind a flag. In the browser console:
  `JXFlags.off('advertising_placement')` — or preview the production posture with `JXFlags.env('production')`.
- **Discard the whole pass:** `git checkout main` (your WIP is preserved — it was never committed;
  the foundation commits only add new files, so nothing of yours is overwritten). Then optionally
  `git branch -D design-system-consistency`.
- **Nothing here is pushed.** No `git push` runs without Gregg.

## Flag posture

`js/flags.js` resolves: COUNSEL_SENSITIVE = ON in demo / OFF in production; HARD_LIMIT = OFF everywhere
(synthetic-only surfaces); GUARD = always on. Set env via `<body data-jx-env="production">` or `?jxenv=production`.

## Log

| # | Date | Change | Files | Flag / group | Commit |
|---|---|---|---|---|---|
| 0 | 2026-07-18 | Base | — | — | `31a20a1` (main) |
| 1 | 2026-07-18 | Checkpoint: your pre-existing WIP (preserved, not authored here) | 42 files | — | `72768dd` |
| 2 | 2026-07-18 | Foundation: flag/undo registry + shared console shell + injector + this log | `js/flags.js`, `demo/shared/console.css`, `demo/shared/app-partials.js`, `CHANGE-UNDO-LOG.md` | (registry) | `625545e` |
| 3 | 2026-07-18 | Fan-out: adopt the shared console shell (tokens + unified buttons + harmonized chrome) on ALL 44 console pages; drop risky `.wrap` shim override | 44 `demo/*.html` + `demo/shared/console.css` | — | _this commit_ |

_Remaining (tracked): per-page hardcoded-hex → token cleanup; app nav/footer injector on the chrome-less pages; matter-type config + generalized 7-stage rail; build-now counsel items behind COUNSEL_SENSITIVE flags (Fable-verify the legally-sensitive copy); two governance skills._
