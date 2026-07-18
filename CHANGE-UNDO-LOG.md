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
| 1 | 2026-07-18 | Foundation: runtime feature-flag & undo registry | `js/flags.js` | (registry) | _pending_ |
| 2 | 2026-07-18 | Foundation: shared console shell (nav/footer/buttons/cards on tokens + compat shim) | `demo/shared/console.css` | — | _pending_ |
| 3 | 2026-07-18 | Foundation: shared console nav/footer injector | `demo/shared/app-partials.js` | — | _pending_ |
| 4 | 2026-07-18 | This log | `CHANGE-UNDO-LOG.md` | — | _pending_ |

_Remaining (tracked, staged as they land): shell fan-out across ~30 console pages; matter-type config + generalized rail; build-now counsel items behind flags; two governance skills._
