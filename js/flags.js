/* ============================================================
   JusticeX — Runtime Feature-Flag & Undo Registry
   Added 2026-07-18 (design-system-consistency branch).
   Purpose: every counsel-sensitive or removal-prone surface ships
   behind a reversible, runtime-flippable, audit-logged flag — the
   Kill-Switch Standard (2026-07-10) made concrete in the front end.

   Default posture:
     env = 'demo'        -> COUNSEL_SENSITIVE flags ON  (synthetic showcase)
     env = 'production'  -> COUNSEL_SENSITIVE flags OFF (until counsel clears)
     HARD_LIMIT flags    -> ALWAYS OFF in production, regardless of env
                            (real PII/PHI, binding artifact to a real person,
                             real money movement, real third-party egress).

   Usage in markup:
     <div data-flag="advertising_placement"> ... </div>   (hidden when flag off)
     <div data-flag-not="advertising_placement"> ... </div> (shown ONLY when off)

   Console/undo API:
     JXFlags.list()                 -> all flags + resolved state
     JXFlags.on('id') / off('id')   -> session override (visual undo)
     JXFlags.reset()                -> clear overrides
     JXFlags.env('production')      -> preview the production posture
   ============================================================ */
(function (global) {
  'use strict';

  // Environment: overridable via <body data-jx-env="production"> or ?jxenv=
  function detectEnv() {
    var q = new URLSearchParams(location.search).get('jxenv');
    if (q) return q;
    var b = document.body && document.body.getAttribute('data-jx-env');
    if (b) return b;
    // Netlify preview / localhost / demo path default to 'demo'
    return 'demo';
  }

  // group: 'COUNSEL_SENSITIVE' (reversible) | 'HARD_LIMIT' (synthetic-only) | 'GUARD' (always on)
  // source: the counsel reference that put it behind a flag.
  var FLAGS = {
    // ---- A. Advertising, feedback & discovery ----
    advertising_placement:     { group: 'COUNSEL_SENSITIVE', source: 'Q3–Q15 / RPC 7.2', desc: 'Sponsored/paid placement UI in the directory' },
    advertising_article81:     { group: 'COUNSEL_SENSITIVE', source: 'C.21 / Q59', desc: 'Sponsored placement within Article 81' },
    public_reviews:            { group: 'COUNSEL_SENSITIVE', source: 'Q2/Q8/Q9', desc: 'Public professional reviews past the ≥5-review gate' },
    external_discovery:        { group: 'COUNSEL_SENSITIVE', source: 'C.12 / Q11–Q13', desc: 'Off-platform professional discovery + invite' },

    // ---- B. Convergence / two-party core ----
    gap_alignment_view:        { group: 'COUNSEL_SENSITIVE', source: 'Gov.Reg.6 / Q94–Q95', desc: 'Gap-Analysis & Alignment ("where you already agree") — descriptive only' },
    shared_exchange:           { group: 'COUNSEL_SENSITIVE', source: 'C.23 / Q75–Q78', desc: 'Two-party symmetric shared-exchange + who-pays framing' },
    evidence_corroboration:    { group: 'COUNSEL_SENSITIVE', source: 'C.9 / Q18', desc: 'Symmetric evidence-consistency signal (no credibility judgment)' },

    // ---- C. Generative-legal engines (guards + gated output) ----
    advice_drift_classifier:   { group: 'GUARD',             source: 'KDR 91 / C-UPL-02', desc: 'Fail-closed advice-drift classifier on every generative surface (always on)' },
    upl_jurisdiction_gate:     { group: 'GUARD',             source: 'KDR 91', desc: 'Per-jurisdiction generative-legal gate; renders only in a cleared state' },
    scrivener_assembly:        { group: 'COUNSEL_SENSITIVE', source: 'KDR 90 / C-UPL-01', desc: 'Passive slot-fill of attorney-vetted templates (none vetted yet)' },
    guideline_figures:         { group: 'COUNSEL_SENSITIVE', source: 'KDR 91 / Q94', desc: 'CSSA/maintenance figures for unrepresented users (labelled, show-the-math)' },
    factor_checklists:         { group: 'COUNSEL_SENSITIVE', source: 'Q91', desc: 'Custody / equitable-distribution factor checklists (located, not applied)' },
    precedent_consumer:        { group: 'COUNSEL_SENSITIVE', source: 'Gov.Reg.7 / Q93', desc: 'Located public precedent to unrepresented users (no merit characterization)' },
    affordability_forecast:    { group: 'COUNSEL_SENSITIVE', source: 'Gov.Reg.1 / Q92', desc: 'Per-party forecast/affordability (estimate only, no conclusion)' },
    disclosure_tracker:        { group: 'COUNSEL_SENSITIVE', source: 'Q95', desc: 'Statute-keyed disclosure/sharing tracker' },
    ny_statutory_values:       { group: 'COUNSEL_SENSITIVE', source: 'C.14 / Q25–Q28', desc: 'NY CSSA/maintenance values as engine default (verify-pending)' },

    // ---- D. Article 81 & grievance (attorney-gated) ----
    article81_product:         { group: 'COUNSEL_SENSITIVE', source: 'C.21 / Q53–Q69', desc: 'Article 81 guardianship product (4 flag-gated moves)' },
    grievance_product:         { group: 'COUNSEL_SENSITIVE', source: 'Q97–Q102', desc: 'Attorney-grievance product (organize/track/forum/letters)' },

    // ---- E/F. Copy, instruments, monetization ----
    dispute_routing_clause:    { group: 'COUNSEL_SENSITIVE', source: 'C.15 / Q36–Q38', desc: 'Embedded dispute-routing clause; org-required mode' },
    marketplace_monetization:  { group: 'COUNSEL_SENSITIVE', source: 'Q19–Q24/Q35', desc: 'Non-legal marketplace referral, benchmarking, sponsorship (NOT cash-out)' },
    catalog_popularity_rank:   { group: 'COUNSEL_SENSITIVE', source: 'C.20 / Q103', desc: 'Market-scoped popularity ranking ("most common ≠ recommended")' },
    cpa_role:                  { group: 'COUNSEL_SENSITIVE', source: 'C.16 / Q40–Q41', desc: 'Financial-Tax Professional (CPA) role posture' },
    consent_secondary_use:     { group: 'COUNSEL_SENSITIVE', source: 'C.22 / Q81–Q88', desc: 'Model-improvement opt-in / dual-consent (live, awaiting ratification)' },
    disclaimer_conflict_line:  { group: 'COUNSEL_SENSITIVE', source: 'UPL Hardening R3', desc: 'The "No conflict checks" disclosure line (staged, hold-for-counsel)' },

    // ---- G. Growth loop ----
    invite_other_party:        { group: 'COUNSEL_SENSITIVE', source: 'Gov.Reg.3 / Q105', desc: 'Invite-the-other-party (manual only; DV screen; explicit consent)' },
    convert_to_artifact:       { group: 'COUNSEL_SENSITIVE', source: 'Gov.Reg.4 / Q70–Q80', desc: 'Convert-to-artifact / value-fence (de-identify only when leaving the circle)' },
    bring_in_professionals:    { group: 'COUNSEL_SENSITIVE', source: 'Gov.Reg.8 / Q106–Q109', desc: 'Bring-in-professionals (no-fee model; never a referral fee)' },

    // ---- HARD LIMITS — build against synthetic only; never enabled against a real person/data pre-launch ----
    dv_esign_binding:          { group: 'HARD_LIMIT', source: 'Gov.Reg.5 / Q89–Q90', desc: 'Binding/e-signed memorandum delivered to a real person' },
    third_party_realdata:      { group: 'HARD_LIMIT', source: 'Q69/Q96', desc: 'Non-consenting third party real sensitive data intake' },
    third_party_ai_realdata:   { group: 'HARD_LIMIT', source: 'Gov.Reg.9 / KDR 88', desc: 'Real client data through third-party AI at runtime' },
    notebooklm_media:          { group: 'HARD_LIMIT', source: 'Q104', desc: 'Egress of real matter content to NotebookLM Enterprise' },
    in_product_money:          { group: 'HARD_LIMIT', source: 'Gov.Reg.10 / Q21', desc: 'In-product money movement / escrow (never build)' }
  };

  var overrides = {}; // session-only, for the visual undo
  var env = detectEnv();

  function resolve(id) {
    var f = FLAGS[id];
    if (!f) return false;
    if (id in overrides) return overrides[id];
    if (f.group === 'GUARD') return true;                 // guards are always on
    if (f.group === 'HARD_LIMIT') return env !== 'production' ? false : false; // synthetic-only surfaces are off by default even in demo
    // COUNSEL_SENSITIVE:
    return env !== 'production';                           // on in demo, off in production
  }

  function apply() {
    document.querySelectorAll('[data-flag]').forEach(function (el) {
      el.hidden = !resolve(el.getAttribute('data-flag'));
    });
    document.querySelectorAll('[data-flag-not]').forEach(function (el) {
      el.hidden = resolve(el.getAttribute('data-flag-not'));
    });
  }

  var API = {
    list: function () {
      return Object.keys(FLAGS).map(function (id) {
        return { id: id, group: FLAGS[id].group, on: resolve(id), source: FLAGS[id].source, desc: FLAGS[id].desc };
      });
    },
    get: resolve,
    on: function (id) { overrides[id] = true; apply(); return resolve(id); },
    off: function (id) { overrides[id] = false; apply(); return resolve(id); },
    reset: function () { overrides = {}; apply(); },
    env: function (e) { if (e) { env = e; apply(); } return env; },
    _flags: FLAGS
  };

  global.JXFlags = API;
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', apply);
  else apply();
})(window);
