/* ============================================================
   JusticeX — Matter-Type Registry (single source of truth)
   Added 2026-07-18 (design-system-consistency branch).

   GOAL 4: a new matter type or state changes ONLY its content +
   rules here, never the shell or the rail engine. One rail engine
   reads the active type's `stages`; the shell, checkpoints, gating,
   and posture copy are all driven from this config.

   Canon: the 7-step common framework (Positioning Canon SSOT) is
   TAILORED per litigation type via `party_model` + `reference_kind`
   (June-25 design decision). Divorce is the reference implementation;
   Article 81 guardianship + grievance are the one-party documentation-
   prep track; estate/contracts are roadmap.

   Stage shape matches the rail engine's JX.stages:
     { n, id, name, scope, checkpoint }
   Type shape:
     { key, label, status, party_model, reference_kind, attorney,
       posture, band, stages[] }
   `attorney`: 'required' | 'optional' | 'none'  (gates the flag +
   the gate banner; Article 81 = required, grievance = optional).
   `status`:  'live' | 'wip' | 'roadmap'
   ============================================================ */
(function (global) {
  'use strict';

  var TYPES = {
    // ---- DIVORCE & CUSTODY — the live reference implementation (two-party) ----
    divorce: {
      key: 'divorce',
      label: 'Divorce & Custody',
      status: 'live',
      party_model: 'two-party',
      reference_kind: 'NY DRL · equitable distribution / CSSA',
      attorney: 'none',                 // parties may self-serve; mediator/attorney optional
      posture: 'Objective comparison — both parties, side by side',
      band: 'TWO PARTIES · OBJECTIVE COMPARISON',
      stages: [
        { n: 1, id: '01-plan',        name: 'Plan',          scope: 'both' },
        { n: 2, id: '02-intake',      name: 'Intake',        scope: 'each' },
        { n: 3, id: '03-redact',      name: 'Redact',        scope: 'each', checkpoint: 'CP1' },
        { n: 4, id: '04-summarize',   name: 'Summarize',     scope: 'each' },
        { n: 5, id: '05-gap-analysis',name: 'Gap Analysis',  scope: 'both', checkpoint: 'CP2' },
        { n: 6, id: '06-resolution',  name: 'Resolution',    scope: 'both', checkpoint: 'CP3' },
        { n: 7, id: '07-memorandum',  name: 'Memorandum',    scope: 'both', checkpoint: 'Finalize' }
      ]
    },

    // ---- ARTICLE 81 GUARDIANSHIP — one-party documentation prep (attorney REQUIRED) ----
    guardianship: {
      key: 'guardianship',
      label: 'Article 81 Guardianship',
      status: 'wip',
      party_model: 'one-party',
      reference_kind: 'NY MHL Article 81',
      attorney: 'required',             // Article 81 requires a named attorney of record
      posture: 'Documentation preparation · attorney-in-the-loop',
      band: 'ONE PARTY · OBJECTIVE DOCUMENTATION PREPARATION · ATTORNEY-IN-THE-LOOP',
      stages: [
        { n: 1, id: '01-plan',        name: 'Plan',                     scope: 'petitioner' },
        { n: 2, id: '02-intake',      name: 'Intake',                   scope: 'petitioner' },
        { n: 3, id: '03-redact',      name: 'Redact',                   scope: 'petitioner', checkpoint: 'CP1' },
        { n: 4, id: '04-summarize',   name: 'Summarize',                scope: 'petitioner' },
        { n: 5, id: '05-readiness',   name: 'Completeness & Readiness', scope: 'petitioner', checkpoint: 'CP2' },
        { n: 6, id: '06-assembly',    name: 'Document Assembly',        scope: 'petitioner', checkpoint: 'CP3' },
        { n: 7, id: '07-attorney',    name: 'Attorney Review & Package',scope: 'attorney',   checkpoint: 'Finalize' }
      ]
    },

    // ---- ATTORNEY GRIEVANCE — one-party documentation prep (attorney OPTIONAL) ----
    grievance: {
      key: 'grievance',
      label: 'Attorney Grievance',
      status: 'wip',
      party_model: 'one-party',
      reference_kind: 'NY Rules of Professional Conduct',
      attorney: 'optional',             // a grievance reports conduct; a named attorney is not required
      posture: 'Documentation preparation · attorney-in-the-loop',
      band: 'ONE PARTY · OBJECTIVE DOCUMENTATION PREPARATION · ATTORNEY-IN-THE-LOOP',
      stages: [
        { n: 1, id: '01-plan',        name: 'Plan',                     scope: 'complainant' },
        { n: 2, id: '02-eligibility', name: 'Eligibility & Forum',      scope: 'complainant' },
        { n: 3, id: '03-intake',      name: 'Intake',                   scope: 'complainant' },
        { n: 4, id: '04-redact',      name: 'Redact',                   scope: 'complainant', checkpoint: 'CP1' },
        { n: 5, id: '05-readiness',   name: 'Completeness & Readiness', scope: 'complainant', checkpoint: 'CP2' },
        { n: 6, id: '06-assembly',    name: 'Complaint Assembly',       scope: 'complainant', checkpoint: 'CP3' },
        { n: 7, id: '07-submit',      name: 'Submit & Track',           scope: 'complainant', checkpoint: 'Finalize' }
      ]
    },

    // ---- ESTATE & CONTRACTS — roadmap (shape reserved; content not built) ----
    estate: {
      key: 'estate',
      label: 'Estate & Contracts',
      status: 'roadmap',
      party_model: 'one-party',
      reference_kind: 'NY EPTL / contract',
      attorney: 'optional',
      posture: 'Documentation preparation · attorney-in-the-loop',
      band: 'ROADMAP — not yet built',
      stages: []                        // defined when the type is built
    }
  };

  var API = {
    all: function () { return TYPES; },
    get: function (key) { return TYPES[key] || null; },
    keys: function () { return Object.keys(TYPES); },
    live: function () { return Object.keys(TYPES).filter(function (k) { return TYPES[k].status === 'live'; }); },
    stages: function (key) { return (TYPES[key] || {}).stages || []; },
    // gate helper: does this type require / offer an attorney, for the gate banner + flag
    attorneyGate: function (key) { return (TYPES[key] || {}).attorney || 'none'; }
  };


  // Render the canonical hexagon rail from a type's stages into #containerId.
  // DOM matches console.css .mrail (a.done/.active + .hex .n + .rn).
  API.renderRail = function (containerId, typeKey, currentN) {
    var el = (typeof document !== 'undefined') && document.getElementById(containerId);
    if (!el) return;
    var stages = API.stages(typeKey), html = '';
    stages.forEach(function (st) {
      var cls = st.n < currentN ? 'done' : (st.n === currentN ? 'active' : '');
      html += '<a class="' + cls + '"' + (st.n === currentN ? ' aria-current="step"' : '') + '>'
            + '<span class="hex"><span class="n">' + st.n + '</span></span>'
            + '<span class="rn">' + st.name + '</span></a>';
    });
    el.innerHTML = html;
    var band = (API.get(typeKey) || {}).band;
    var bandEl = document.getElementById(containerId + '-band');
    if (bandEl && band) bandEl.textContent = band;
  };

  global.JX_MATTER_TYPES = API;
})(window);
