# content/ — the data-driven page path

One record = one surface. The record is the single source of truth for that surface's
message; the site renders it into the **locked Families skeleton**. Tailoring lives only
in the record. The shell — tokens, nav, footer, skeleton order, the 7-stage hex rail,
the component library — is locked in `scripts/generate.js` and never varies per record.

```
content/
  content-model.schema.json   # v2 schema (three-door taxonomy, three-tier inheritance)
  pages/*.json                # one record per surface
  pages/_draft/               # records not yet conformed to v2 — skipped by --all
```

## Generate

```bash
node scripts/generate.js --all              # -> _generated/<surface_id>.generated.html  (staging)
node scripts/generate.js --all --publish    # -> <surface_id>.html at the site root      (served)
node scripts/generate.js content/pages/x.json [outDir]
```

`_generated/` is **not served by Netlify**. The data-driven path is therefore default-OFF
at the filesystem level: producing a live page takes the explicit `--publish` flag. This is
the G1 feature-flag standard applied to the build step itself.

## Lint

```bash
node scripts/design-lint.mjs
```

Blocking: token parity against `css/tokens.css`, locked-skeleton integrity, record hygiene
(surface_id / url_path present and unique), and gate posture (nothing `published` without
brand/legal + design-lint + Fable passing; `Gated`/`Roadmap` coverage needs `counsel_gate: cleared`).

Advisory: off-token hex literals in the generator body — logged, not auto-fixed, consistent
with the 2026-07-19 brand-drift scan. Promote-to-token or replace is Gregg's call.

Schema validation runs separately (CI uses `ajv-cli`; locally, any JSON-Schema validator):

```bash
npx --yes ajv-cli@5 validate -s content/content-model.schema.json -d "content/pages/*.json" --strict=false
```

Note that the schema pins the guardrail fields — `palette_ban`, `negative_constraints`,
`disclosure_line`, `studio_defaults` — to exact constants. That is deliberate: a surface
varies its art direction and copy, never its guardrails. If a surface needs a additional
visual prohibition, put it in `art_direction`, not in `negative_constraints`.

Schema validation, the design lint, and a generator-reproducibility check all run in CI. Reproducibility means a
generated page may never be hand-edited: change the record, re-run, commit.

## Before a surface goes public

1. `governance.design_lint: pass`
2. Media pack generated and QA'd (brand + legal) — see the run-sheet in Appendix D
3. `governance.brand_legal_qa: pass`
4. Fable 5 pass on any live-bound page or asset
5. `counsel_gate: cleared` for Gated/Roadmap coverage, and for any 1:1 co-brand
   naming a real account (Q125 / Q-WP7)
6. Every personalization capability flag confirmed OFF in production

*Propose-only. Nothing pushed or published. Synthetic examples only.*
