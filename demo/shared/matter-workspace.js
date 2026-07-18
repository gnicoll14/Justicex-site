/* ============================================================================
   JusticeX — Matter Workspace surface (Ref 92)
   Flag: matter_workspace_v1  ·  DEFAULT OFF (not linked from any nav)
   ----------------------------------------------------------------------------
   Drives two surfaces from one state model:
     • matter-workspace.html  (data-jx-view="workspace") — the whole-matter hub
     • matter-step.html       (data-jx-view="step")      — the per-step journey

   PER-STEP IA (revised 2026-07-12 — 3-act flow, replaces the 4-chapter journey):
     Act 1 · Get oriented   — INFORMATIONAL (nothing to do; understand the step)
     Act 2 · Your part      — the ONE action: collect only the ADDITIONAL info /
                              decisions this step needs (else "nothing to add")
     Act 3 · Your results   — INFORMATIONAL: the plain-language overview (recap
                              media) + the certified record (→ your agreement),
                              then one Confirm & continue bar.
     Act 1 & 3 are marked "nothing to do"; Act 2 is highlighted when input is
     needed. This preserves the three governed streams (Guide media · Recap media
     with client-lane marking · certified Report → the agreement).

   TERMINOLOGY (Option C, Decision Brief 2026-07-12): plain-first; [[legal term]]
   markers render the formal term in parentheses (consumer) with a hover definition,
   or plainly in the attorney view. Role-aware output naming (Your Agreement / MOU).

   Governance: synthetic Delgado only · objective, not-counsel posture · client-lane
   marking on every client media surface · media via signed entitlement-scoped
   placeholder refs (C.23 / C-ENT-07) · canonical 7 stage names. Off outside the flag.
   ========================================================================== */
(function () {
  'use strict';

  /* ---- 1 · Flag + role-aware view -------------------------------------- */
  var FLAG = 'matter_workspace_v1';
  function flagOn() { try { var q = new URLSearchParams(location.search);
    return q.get('flag') === FLAG || q.get(FLAG) === 'on'; } catch (e) { return false; } }
  function viewMode() { try { var v = (new URLSearchParams(location.search)).get('view');
    return (v === 'attorney' || v === 'legal') ? 'attorney' : 'consumer'; } catch (e) { return 'consumer'; } }
  function isAttorneyView() { return viewMode() === 'attorney'; }

  /* ---- 2 · Plain-language glossary bridge ------------------------------ */
  var GLOSSARY = {
    'equitable distribution': 'New York’s approach to dividing what a couple built together during the marriage — fairly, though not always 50/50.',
    'marital property': 'What the couple acquired during the marriage, which is divided between them.',
    'separate property': 'What one spouse owned before the marriage, or received individually by gift or inheritance — generally kept by that spouse.',
    'legal custody': 'Who makes the major decisions for the children — schooling, health, and religion.',
    'physical custody': 'Where the children live and the day-to-day parenting schedule.',
    'maintenance': 'Spousal support — payments from one spouse to the other after divorce. New York calls it “maintenance.”',
    'Child Support Standards Act': 'New York’s standard formula for calculating child support, often called the CSSA.',
    'grounds': 'The legal reason given for the divorce.'
  };
  function esc(s) { return String(s == null ? '' : s).replace(/[&<>"]/g, function (c) {
    return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]; }); }
  function render(str) {
    var attorney = isAttorneyView();
    return esc(str).replace(/\[\[([^\]]+)\]\]/g, function (m, term) {
      var def = GLOSSARY[term] || '';
      var span = '<span class="jx-term" tabindex="0" title="' + esc(def) + '">' + esc(term) + '</span>';
      return attorney ? ' <strong class="jx-term-strong">' + span + '</strong>' : ' (' + span + ')';
    }).replace(/\s+\(/g, ' (').trim();
  }

  /* ---- 3 · Entitlement-scoped media resolver (C.23 / C-ENT-07) --------- */
  function mediaRef(lane, stageId, format) {
    var seed = (lane + ':' + stageId + ':' + format), h = 0;
    for (var i = 0; i < seed.length; i++) { h = (h * 31 + seed.charCodeAt(i)) >>> 0; }
    return { lane: lane, format: format, wired: false,
      ref: 'jx-media://signed/' + ('00000000' + h.toString(16)).slice(-8) + '.preview-not-wired' };
  }

  /* ---- 4 · Checkpoints -------------------------------------------------- */
  var CHECKPOINTS = {
    3: { id: 'CP1', label: 'Checkpoint 1', title: 'Sharing & hiding review', next: 'Summarize', owner: 'You (or your attorney, where one is on the matter)' },
    5: { id: 'CP2', label: 'Checkpoint 2', title: 'Gap-analysis review', next: 'Resolution', owner: 'Each party' },
    6: { id: 'CP3', label: 'Checkpoint 3', title: 'Resolution review', next: 'Memorandum', owner: 'Each party' },
    7: { id: 'FIN', label: 'Finalize', title: 'Certify the record', next: null, owner: 'Both parties' }
  };

  /* ---- 5 · Action model (drives the Act-2 highlight) ------------------- */
  /* Every step is a working activity; the label names what you do here. */
  var ACTIONS = {
    add:      { title: 'Add your information',  verb: 'add your documents and details', icon: 'ti-upload' },
    confirm:  { title: 'Confirm the scope',     verb: 'confirm the matter and its questions', icon: 'ti-checkbox' },
    choose:   { title: 'Choose what to share',  verb: 'choose what is shared and what stays private', icon: 'ti-adjustments-check' },
    review:   { title: 'Review the summaries',  verb: 'review each side’s summary and flag anything off', icon: 'ti-eye-check' },
    settle:   { title: 'Settle each open point', verb: 'settle each open point, side by side', icon: 'ti-arrows-diff' },
    decide:   { title: 'Make your decisions',   verb: 'choose the option you both accept, for each open question', icon: 'ti-hand-click' },
    finalize: { title: 'Review and finalize',   verb: 'review the assembled agreement and finalize it', icon: 'ti-signature' }
  };
  function actMeta(stage) { return ACTIONS[stage.action] || ACTIONS.review; }

  /* ---- 6 · MatterState (synthetic — Delgado) --------------------------- */
  var MATTER = {
    id: 'DLG-2026-0417', title: 'Delgado', type: 'Divorce, children & property',
    party_model: 'two', jurisdiction: 'Kings County, NY',
    framework: 'Fair division of property [[equitable distribution]]',
    you: 'Marisol', other: 'Andrés', current: 5, payment_state: 'preview'
  };
  function outputName() { return isAttorneyView() ? 'Memorandum of Understanding' : 'Your Agreement'; }
  function outputSub() {
    return isAttorneyView()
      ? 'The legal-format summary for attorney review and update — the non-binding Memorandum the parties’ attorneys turn into the binding agreement.'
      : 'A plain summary of everything you agreed — yours to keep, and to take to an attorney. It is not the binding legal document; an attorney turns it into that.';
  }

  /* ---- 7 · End-to-end overview ---------------------------------------- */
  var OVERVIEW = {
    title: 'How your matter works, start to finish.',
    lead: 'Seven simple steps take you from your first facts to a written agreement. Take the overview in whichever way suits you — watch, listen, or read — then start whenever you are ready.',
    beats: [
      { k: '1 · Plan', v: 'Set what your matter is about and the questions to work through.', icon: 'ti-map-2' },
      { k: '2 · Intake', v: 'Add your documents and details, at your own pace. Nothing is shared yet.', icon: 'ti-folders' },
      { k: '3 · Redact', v: 'Personal details are hidden before anything is shared. You decide what crosses.', icon: 'ti-shield-lock' },
      { k: '4 · Summarize', v: 'Each side is written up the same way, so the picture rests on the facts.', icon: 'ti-file-description' },
      { k: '5 · Gap Analysis', v: 'See where you already agree and where you still differ.', icon: 'ti-git-compare' },
      { k: '6 · Resolution', v: 'Weigh clear options for each open point and choose, together.', icon: 'ti-arrows-shuffle' },
      { k: '7 · Your Agreement', v: 'Everything you agreed is assembled into a written agreement, ready for an attorney.', icon: 'ti-file-certificate' }
    ]
  };

  /* ---- 8 · StageState[] ------------------------------------------------ */
  /* guide  = 4 linear beats (Act 1 · informational).
     action = drives the Act-2 highlight; input = the Act-2 items (the DELTA).
     recap  = 4 beats (Act 3 · plain-language overview, client lane).
     report = certified record (Act 3 · the record → the agreement). */
  var STAGES = [
    { n: 1, id: 'plan', name: 'Plan', scope: 'each', status: 'done', action: 'confirm',
      lead: 'Set what your matter is about — and the questions you will work through.',
      minutes: 'About 4 minutes',
      guide: [
        { k: 'What this step does', v: 'Sets what your matter is about and the questions you will work through, so every later step stays focused.', icon: 'ti-map-2' },
        { k: 'What you will do', v: 'Confirm the matter type and location, and review the questions JusticeX lays out for a matter like yours.', icon: 'ti-checkbox' },
        { k: 'What JusticeX does with it', v: 'Organizes the matter into clear questions and applies the right approach for its type and state. It does not judge or advise.', icon: 'ti-adjustments' },
        { k: 'What you get, and what is next', v: 'A clear scope and question list. Next: Intake, where you each add your documents and details.', icon: 'ti-arrow-right' }
      ],
      input: { lead: 'Confirm the basics of your matter, and add anything missing. This is the only part of this step that needs you.',
        items: [
          { k: 'What it is about', v: 'Confirm this is a divorce with children and property, and the county it belongs in.' },
          { k: 'Questions to work through', v: 'Review the questions for a matter like yours, and add anything missing.' },
          { k: 'Already agreed', v: 'Note anything already settled — such as sharing the major decisions about the children — to carry forward.' }
        ] },
      recap: [
        { k: 'What you set', v: 'That this is a divorce with children and property in Kings County, New York, and that you both agreed to share the major decisions about the children [[legal custody]].', icon: 'ti-file-text' },
        { k: 'What it says, objectively', v: 'Six questions fall out of the scope you set: the home, the retirement account, the 2019 inheritance, spousal support [[maintenance]], the parenting schedule, and child support. Four base points are already aligned.', icon: 'ti-scale' },
        { k: 'How it supports what is ahead', v: 'This list is the spine of every later step — Intake collects against it, and Gap Analysis and Resolution work through it one question at a time.', icon: 'ti-arrow-right' }
      ],
      report: {
        summary: 'Scope set — a divorce with children and property in Kings County, New York, dividing what the couple built together fairly [[equitable distribution]]. Six open questions were identified and both parties were onboarded. Sharing the major decisions about the children [[legal custody]] is noted as agreed in principle.',
        facts: ['6 questions', 'Kings County, NY', 'Fair division of property', 'Shared decisions agreed'],
        detail: [
          { h: 'Matter type & approach', p: 'A divorce with children and property division. Property is divided under New York’s fair-division approach [[equitable distribution]]. Both parties work separately in Plan and Intake, then together from Redact onward.' },
          { h: 'Questions identified', p: 'The home, the retirement account, the 2019 inheritance, spousal support, the parenting schedule, and child support — six questions to work through.' },
          { h: 'Already aligned', p: 'The divorce itself, sharing the major decisions about the children [[legal custody]], each parent’s fitness, and keeping the children’s schooling stable are noted as agreed in principle, for confirmation later.' }
        ] }
    },
    { n: 2, id: 'intake', name: 'Intake', scope: 'each', status: 'done', action: 'add',
      lead: 'Add the facts of your matter, at your pace.',
      minutes: 'About 5 minutes',
      guide: [
        { k: 'What this step does', v: 'Collects the facts of your matter — your documents and details — so the comparison is accurate and fair.', icon: 'ti-folders' },
        { k: 'What you will do', v: 'Upload or enter each item, or skip and come back. A check shows what is still helpful to add.', icon: 'ti-upload' },
        { k: 'What JusticeX does with it', v: 'Organizes and checks your inputs, for your eyes only. Nothing is shared yet.', icon: 'ti-adjustments' },
        { k: 'What you get, and what is next', v: 'An organized picture of your facts, with anything missing flagged. Next: Redact, where personal details are hidden.', icon: 'ti-arrow-right' }
      ],
      input: { lead: 'Add the documents and details for your matter that you have not already shared. Upload or enter each item, or skip and come back.', items: [] },
      recap: [
        { k: 'What you shared', v: 'Your home appraisal, mortgage statement, retirement and bank statements, income documentation, and the 2019 inheritance records.', icon: 'ti-file-text' },
        { k: 'What it says, objectively', v: 'A home appraised at about $960,000 (about $550,000 of value left after the mortgage), a retirement account of $280,000, and incomes of about $145,000 and $62,000. The older retirement records are still incomplete.', icon: 'ti-scale' },
        { k: 'How it supports what is ahead', v: 'These become the objective facts both sides are written up against in Gap Analysis, and they anchor the options in Resolution.', icon: 'ti-arrow-right' }
      ],
      report: {
        summary: 'Seven of eight items received. Your property facts are captured: a home appraised at $960,000 (mortgage $410,000; $550,000 of value left after the mortgage), a retirement account of $280,000, an individual retirement account and joint accounts, incomes of $145,000 and $62,000, and 2019 inheritance records. One item — the older retirement records — is incomplete and flagged for follow-up.',
        facts: ['7 of 8 received', 'Home value left $550,000', 'Retirement $280,000', 'Incomes $145k / $62k', '1 item flagged'],
        detail: [
          { h: 'What you own, captured', p: 'Home — appraised $960,000; mortgage $410,000; $550,000 of value left; owned jointly. Retirement account — $280,000; a portion of about $60,000 built up before the marriage is claimed as personal property [[separate property]], pending records. Individual retirement account — $45,000. Joint accounts — $85,000. Vehicles — $20,000 net.' },
          { h: 'Income & length of marriage', p: 'Andrés about $145,000; Marisol about $62,000; marriage about 14 years; Marisol reduced paid work to care for the children.' },
          { h: 'Completeness & consistency', p: 'One flag: the older retirement records are incomplete. No inconsistencies detected. No interpretation, valuation, or advice is offered — these are your inputs, organized.' }
        ] }
    },
    { n: 3, id: 'redact', name: 'Redact', scope: 'both', status: 'done', action: 'choose',
      lead: 'Personal details are hidden before anything crosses between you.',
      minutes: 'About 3 minutes',
      guide: [
        { k: 'What this step does', v: 'Hides personal details before anything crosses between you, so the comparison rests on the facts and you control what is shared.', icon: 'ti-shield-lock' },
        { k: 'What you will do', v: 'Review what was hidden, and choose what is shared versus kept private for each item.', icon: 'ti-eye-check' },
        { k: 'What JusticeX does with it', v: 'Hides details by your sharing rules and logs every choice. It never shares more than you confirm.', icon: 'ti-adjustments' },
        { k: 'What you get, and what is next', v: 'A cleaned, shareable version of each item. Next: Summarize, where each side is written up the same way.', icon: 'ti-arrow-right' }
      ],
      input: { lead: 'Two choices are yours here: check what was hidden, and set what is shared with the other party versus kept private.', items: [
          { k: 'Review what is hidden', v: 'Check the personal details JusticeX found and hid on each item.' },
          { k: 'Set what is shared', v: 'For each item, choose what is shared with the other party and what stays private.' }
        ] },
      recap: [
        { k: 'What you shared', v: 'You confirmed the hiding on your items and set what is shared with Andrés versus kept private, item by item.', icon: 'ti-file-text' },
        { k: 'What it says, objectively', v: 'Personal details were hidden on every item. The financial figures the comparison needs remain; names, account numbers, and addresses do not cross.', icon: 'ti-scale' },
        { k: 'How it supports what is ahead', v: 'The hidden, shareable versions are what Summarize and Gap Analysis work from — so the comparison never turns on private details.', icon: 'ti-arrow-right' }
      ],
      report: {
        summary: 'Personal details were hidden (redacted) before anything crossed between the parties. Each side controls what is shared versus kept private — uploading a document does not share it. This is Checkpoint 1: the sharing and hiding are confirmed by the accountable owner before the matter advances.',
        facts: ['Details hidden', 'You control sharing', 'Checkpoint 1', 'Every choice logged'],
        detail: [
          { h: 'What was hidden', p: 'Names, contact details, account numbers, and addresses were found and hidden across the Intake items. The figures the comparison needs — values, balances, incomes — remain.' },
          { h: 'Sharing decisions', p: 'For each item, the owner set shared or private. In a divorce where both sides must disclose finances, financial items are shared; personal details are hidden regardless.' },
          { h: 'Checkpoint 1', p: 'The accountable owner — you, or your attorney where one is on the matter — confirmed the sharing and hiding. Nothing advanced until that confirmation.' }
        ] }
    },
    { n: 4, id: 'summarize', name: 'Summarize', scope: 'both', status: 'done', action: 'review',
      lead: 'Each side is written up the same way, so the picture rests on the facts.',
      minutes: 'About 3 minutes',
      guide: [
        { k: 'What this step does', v: 'Writes up both sides the same way — the same questions, the same depth — so the picture rests on the facts, not on who prepared better.', icon: 'ti-file-description' },
        { k: 'What you will do', v: 'Nothing to add — this step works from what you already gave. You can read each summary and flag anything off.', icon: 'ti-eye' },
        { k: 'What JusticeX does with it', v: 'Produces one even summary per question. It does not weigh, rank, or recommend.', icon: 'ti-adjustments' },
        { k: 'What you get, and what is next', v: 'An even, side-by-side summary of every question. Next: Gap Analysis, where agreement and difference are mapped.', icon: 'ti-arrow-right' }
      ],
      input: { lead: 'Nothing new is needed here — this step works from what you already provided. Look over the summaries below and flag anything that does not match.', items: [
          { k: 'Read each summary', v: 'Check the objective summary captured for each question.' },
          { k: 'Flag anything off', v: 'Mark any summary that does not reflect what you provided, to revisit.' }
        ] },
      recap: [
        { k: 'What was summarized', v: 'The confirmed, hidden items you and Andrés provided — nothing new to add.', icon: 'ti-file-text' },
        { k: 'What it says, objectively', v: 'The objective facts are set for every question: home value left of $550,000, a retirement account of $280,000, incomes of $145,000 and $62,000, and a roughly 14-year marriage. Both summaries used the same questions and depth.', icon: 'ti-scale' },
        { k: 'How it supports what is ahead', v: 'These even summaries are the common ground Gap Analysis compares — so differences show up as facts, not framing.', icon: 'ti-arrow-right' }
      ],
      report: {
        summary: 'Each side was written up identically — the same questions, the same depth — so the picture rests on the facts, not on who prepared better. Objective facts were captured for every question, and an even-handedness check confirmed the two summaries are balanced.',
        facts: ['Home value left $550,000', 'Retirement $280,000', 'Incomes $145k / $62k', '~14-yr marriage', 'Balance checked'],
        detail: [
          { h: 'Identical treatment', p: 'Both parties’ hidden inputs were written up with the same questions, model, and depth. An even-handedness check halts the process on any imbalance; none was found.' },
          { h: 'Objective facts captured', p: 'Home value left $550,000; retirement account $280,000 with a pre-marriage portion pending records; individual retirement account $45,000; joint accounts $85,000; incomes $145,000 and $62,000; marriage about 14 years.' },
          { h: 'No interpretation', p: 'Summaries describe what each side provided. No valuation, weighting, or recommendation is made at this step.' }
        ] }
    },
    { n: 5, id: 'gap-analysis', name: 'Gap Analysis', scope: 'both', status: 'active', action: 'settle',
      lead: 'See where you and Andrés agree and where you differ — then settle each open point, side by side.',
      minutes: 'About 6 minutes',
      gaps: [
        { issue: 'The home', cat: 'Property',
          you: 'Keep the home; buy out Andrés’s share', other: 'Sell the home and split what is left',
          options: ['Independent appraisal, then you buy out at half the value left', 'Sell and split 50/50', 'Co-own for two years, then decide'],
          note: 'Worked example — if the home is kept about six years then sold, Andrés’s $275,000 half is received later; at a 4% discount rate that is worth about $217,000 today. The value you agree here carries into your agreement and reconciles to the dollar.',
          agreed: '', status: 'open' },
        { issue: 'The retirement account', cat: 'Property',
          you: 'All of it is shared (marital)', other: 'About $60,000 built up before the marriage is personal',
          options: ['Produce the pre-2011 records', 'Treat as fully shared, pending records', 'Agreed carve-out of $60,000 as personal'],
          agreed: '', status: 'open' },
        { issue: 'The 2019 inheritance', cat: 'Property',
          you: 'It was mixed into joint accounts — now shared', other: 'It is traceable and still personal',
          options: ['Trace the deposits', 'Split the difference', 'Treat as personal, with an offset elsewhere'],
          agreed: '', status: 'open' },
        { issue: 'Spousal support', cat: 'Support',
          you: 'Support for a set period', other: 'A lower amount, for a shorter time',
          options: ['New York guideline amount and duration', 'An agreed flat amount', 'Step down over three years'],
          agreed: '', status: 'open' },
        { issue: 'The parenting schedule', cat: 'Children',
          you: 'Alternating weeks', other: 'Every other weekend plus one weeknight',
          options: ['Alternating weeks', 'A 5-2-2-5 schedule', 'Every other weekend plus shared holidays'],
          agreed: '', status: 'open' },
        { issue: 'Child support', cat: 'Children',
          you: 'The standard formula', other: 'The standard formula',
          options: ['New York’s standard formula [[Child Support Standards Act]], once the parenting schedule is set'],
          agreed: 'Standard formula', status: 'aligned' }
      ],
      guide: [
        { k: 'What this step does', v: 'Maps where you already agree, where you differ, and what is still missing — across every question.', icon: 'ti-git-compare' },
        { k: 'What you will do', v: 'Nothing to add — this step compares the summaries. You can review the map and confirm it reads fairly.', icon: 'ti-eye' },
        { k: 'What JusticeX does with it', v: 'Maps agreement and difference objectively and flags anything missing. It does not take a side or suggest a number.', icon: 'ti-adjustments' },
        { k: 'What you get, and what is next', v: 'A clear map: agreed, open, and missing. Next: Resolution, where clear options are laid out for each open point.', icon: 'ti-arrow-right' }
      ],
      input: { lead: 'Nothing new is needed here — this step compares the two summaries. Review the map and confirm it reflects both sides fairly.', items: [
          { k: 'Review the map', v: 'Look over the agreed, open, and missing points across the six questions.' },
          { k: 'Check it reads fairly', v: 'Confirm the map reflects both sides evenly, or flag a point to revisit.' }
        ] },
      recap: [
        { k: 'Where you stand', v: 'Four base points are aligned: the divorce, sharing the major decisions about the children [[legal custody]], each parent fit, and keeping schooling stable.', icon: 'ti-file-text' },
        { k: 'What it says, objectively', v: 'Six questions remain open: the home, the retirement account, the inheritance, spousal support [[maintenance]], the parenting schedule, and child support. No side is favored and no number is suggested.', icon: 'ti-scale' },
        { k: 'How it supports what is ahead', v: 'The open list becomes the agenda for Resolution — each open question gets an even set of options next.', icon: 'ti-arrow-right' }
      ],
      report: {
        summary: 'Agreed, differing, and missing points were mapped across the six questions. Aligned base: the divorce itself, sharing the major decisions about the children [[legal custody]], each parent fit, and keeping the children’s schooling stable. Open: the home, the retirement account, the inheritance, spousal support, the parenting schedule, and child support. This is Checkpoint 2.',
        facts: ['4 agreed', '6 open questions', 'Checkpoint 2', 'No recommendation'],
        detail: [
          { h: 'Agreed', p: 'The divorce itself, sharing the major decisions about the children [[legal custody]], each parent’s fitness, and keeping the children’s schooling stable.' },
          { h: 'Open', p: 'The home and buy-out, dividing the retirement account (what is shared versus personal), the 2019 inheritance, spousal support [[maintenance]], the parenting schedule, and child support.' },
          { h: 'Missing / to reconcile', p: 'The older retirement records remain incomplete, which affects the personal-property portion. Flagged, not decided.' }
        ] }
    },
    { n: 6, id: 'resolution', name: 'Resolution', scope: 'both', status: 'upcoming', action: 'decide',
      lead: 'Clear options are laid out for each open question — even, with no recommendation.',
      minutes: 'About 6 minutes',
      guide: [
        { k: 'What this step does', v: 'Lays out clear, even options for each open question, so you can see where you are close and where a choice is needed.', icon: 'ti-arrows-shuffle' },
        { k: 'What you will do', v: 'Work through each open question and choose, together, the option you both accept.', icon: 'ti-hand-click' },
        { k: 'What JusticeX does with it', v: 'Presents options evenly and records what you agree. It does not propose a figure, predict an outcome, or advise.', icon: 'ti-adjustments' },
        { k: 'What you get, and what is next', v: 'An agreed position on each question. Next: your agreement is assembled.', icon: 'ti-arrow-right' }
      ],
      input: { lead: 'This is where you decide. Work through each open question and choose, together, the option you both accept — or leave it for an attorney.', items: [
          { k: 'Work each open question', v: 'For each open question, review the even options and choose the one you both accept.' },
          { k: 'Note anything for an attorney', v: 'Leave any question open if you would rather decide it with an attorney.' }
        ] },
      recap: [
        { k: 'What you decided', v: 'Your choices on each open question, made together with Andrés, are gathered here as you work through Resolution.', icon: 'ti-file-text' },
        { k: 'What it says, objectively', v: 'The options are even and no number is recommended. Agreement is noted where you are already close — for example, using New York’s standard child-support formula [[Child Support Standards Act]] once the parenting schedule is set.', icon: 'ti-scale' },
        { k: 'How it supports what is ahead', v: 'Every agreed choice flows straight into your written agreement; anything left open is listed there for an attorney.', icon: 'ti-arrow-right' }
      ],
      report: {
        summary: 'Clear options were laid out for each open question — even, with no recommendation. Agreement was noted where the positions are already close, such as using New York’s standard child-support formula [[Child Support Standards Act]] once the parenting schedule is set. This is Checkpoint 3, before your agreement is assembled.',
        facts: ['Even options', 'Agreement noted', 'Checkpoint 3', 'You decide'],
        detail: [
          { h: 'Options, not advice', p: 'Each open question is presented with the same set of clear options for both sides. JusticeX does not recommend an option, propose a dollar figure, or predict a result.' },
          { h: 'Agreement noted', p: 'Where positions are already close — for instance, New York’s standard child-support formula [[Child Support Standards Act]] once the parenting schedule is set — that agreement is surfaced so the remaining choice is small.' },
          { h: 'Checkpoint 3', p: 'The agreed positions are confirmed by each party before assembly. Anything not agreed is carried into your agreement as an open point for an attorney.' }
        ] }
    },
    { n: 7, id: 'memorandum', name: 'Memorandum', scope: 'both', status: 'upcoming', action: 'finalize',
      lead: 'Everything you agreed is assembled into a written agreement.',
      minutes: 'About 4 minutes',
      guide: [
        { k: 'What this step does', v: 'Assembles everything you agreed into a single written agreement, with open points listed for an attorney.', icon: 'ti-file-certificate' },
        { k: 'What you will do', v: 'Review the assembled agreement, then finalize it and sign when you are both ready.', icon: 'ti-signature' },
        { k: 'What JusticeX does with it', v: 'Assembles the certified, audit-tracked record. It generates the document; it does not give legal advice on it.', icon: 'ti-adjustments' },
        { k: 'What you get, and what is next', v: 'Your written agreement — ready to sign and to take to an attorney.', icon: 'ti-arrow-right' }
      ],
      input: { lead: 'Review your agreement, section by section. If anything needs a change, jump back to the step where it was decided — nothing is locked until you finalize.', items: [] },
      assembly: [
        { title: 'Decision-making for the children', detail: 'Shared — you both make the major decisions together [[legal custody]].', from: 1, fromName: 'Plan', status: 'agreed' },
        { title: 'Dividing what you own', detail: 'The home, the retirement account, and the 2019 inheritance.', from: 6, fromName: 'Resolution', status: 'agreed' },
        { title: 'Spousal support', detail: 'The amount and how long it lasts [[maintenance]].', from: 6, fromName: 'Resolution', status: 'agreed' },
        { title: 'The parenting schedule', detail: 'Where the children live and the day-to-day schedule.', from: 6, fromName: 'Resolution', status: 'agreed' },
        { title: 'Child support', detail: 'New York’s standard formula [[Child Support Standards Act]], once the parenting schedule is set.', from: 6, fromName: 'Resolution', status: 'agreed' },
        { title: 'Open point — older retirement records', detail: 'Still incomplete; it affects the personal-property portion of the retirement account. Add the records, or note it for an attorney.', from: 2, fromName: 'Intake', status: 'open' }
      ],
      recap: [
        { k: 'What it is built from', v: 'Everything you confirmed at each step — nothing new is added here.', icon: 'ti-file-text' },
        { k: 'What it says, objectively', v: 'The agreed terms are stated as you agreed them; open points are listed plainly for an attorney. The figures are your certified inputs, not an estimate or a recommendation.', icon: 'ti-scale' },
        { k: 'How it supports what is ahead', v: 'This is your document to keep — ready to sign, and for your own attorney to review before anyone relies on it.', icon: 'ti-arrow-right' }
      ],
      report: {
        summary: 'The agreed terms were assembled into your written agreement, with any open points listed for an attorney. The Finalize gate certifies the record — audit-tracked — ready to sign and to take to an attorney. Assembled, the step reports are your agreement. For an attorney, the same record is available as a Memorandum of Understanding for review and update.',
        facts: ['Certified', 'Audit-tracked (SHA-256)', 'Attorney-ready', 'Finalize gate'],
        detail: [
          { h: 'How it is assembled', p: 'Each step’s certified summary and detail report compounds into your written agreement. The binding and numeric content is produced by the in-product renderer, never a third-party tool.' },
          { h: 'Open points for an attorney', p: 'Anything not agreed is carried forward and listed plainly, so you and an attorney can see exactly what remains.' },
          { h: 'Finalize', p: 'The record is certified — audit-tracked with a tamper-evident history (a SHA-256 hash chain) — and is ready to sign and for an attorney. It is your document; the overviews never replace it.' }
        ] }
    }
  ];

  /* ---- 9 · Lane marking + posture -------------------------------------- */
  var MARK = {
    guide: 'AI-assisted overview · figures illustrative · not legal advice.',
    recap: 'AI-generated · general information only · not a formal agreement, and not evidence or support of one · figures reflect your inputs.',
    gate:  'AI-generated · general information only · not a formal agreement. Media is served from a signed, entitlement-scoped link (C-ENT-07) — not a fixed public path.'
  };
  var POSTURE = 'JusticeX organizes and compares your information objectively. It is software — not a law firm or a lawyer — and it does not advise you or the other party. You decide, with your own attorney if you choose.';

  /* ---- 10 · Tabbed media viewer --------------------------------------- */
  function placeholderPanel(lane, stageId, format, label, icon) {
    var m = mediaRef(lane, stageId, format);
    return '<div class="mv-ph" data-fmt="' + format + '">' +
      '<div class="mv-ph-ic"><i class="ti ' + icon + '"></i></div>' +
      '<div class="mv-ph-t">' + esc(label) + '</div>' +
      '<div class="mv-ph-d">Served on demand from a signed, short-lived, ' +
      '<strong>entitlement-scoped link</strong> (C-ENT-07) — not wired in this preview.</div>' +
      '<code class="mv-ph-ref">' + esc(m.ref) + '</code></div>';
  }
  function renderViewer(el, cfg) {
    var lane = cfg.lane, stageId = cfg.stageId, beats = cfg.beats;
    var tabs = [
      { k: 'watch',  label: 'Watch',       icon: 'ti-player-play' },
      { k: 'listen', label: 'Listen',      icon: 'ti-headphones' },
      { k: 'ig',     label: 'Infographic', icon: 'ti-photo' },
      { k: 'slides', label: 'Slides',      icon: 'ti-presentation' },
      { k: 'read',   label: cfg.readLabel || 'Read', icon: 'ti-list-details' }
    ];
    var beatsHtml = beats.map(function (b) {
      return '<li><span class="bx"><i class="ti ' + (b.icon || 'ti-point') + '"></i></span>' +
        '<span><span class="k">' + render(b.k) + '</span><span class="v">' + render(b.v) + '</span></span></li>';
    }).join('');
    el.innerHTML =
      '<div class="mv-choose"><i class="ti ti-adjustments-horizontal"></i> Choose how to take it in:</div>' +
      '<div class="mv-tabs" role="tablist">' + tabs.map(function (t) {
        return '<button class="mv-tab" role="tab" data-k="' + t.k + '"><i class="ti ' + t.icon + '"></i> ' + t.label + '</button>';
      }).join('') + '</div>' +
      '<div class="mv-body">' +
        '<div class="mv-panel" data-k="watch">' + placeholderPanel(lane, stageId, 'video', 'A short overview video', 'ti-player-play') + '</div>' +
        '<div class="mv-panel" data-k="listen">' + placeholderPanel(lane, stageId, 'audio', 'An audio overview', 'ti-headphones') + '</div>' +
        '<div class="mv-panel" data-k="ig">' + placeholderPanel(lane, stageId, 'infographic', 'A one-page infographic', 'ti-photo') + '</div>' +
        '<div class="mv-panel" data-k="slides">' + placeholderPanel(lane, stageId, 'slides', 'A short slide overview', 'ti-presentation') + '</div>' +
        '<div class="mv-panel on" data-k="read"><ul class="beats' + (cfg.linear ? ' linear' : '') + '">' + beatsHtml + '</ul></div>' +
      '</div>';
    var tabsEl = el.querySelectorAll('.mv-tab'), panels = el.querySelectorAll('.mv-panel');
    function sel(k) {
      tabsEl.forEach(function (t) { t.classList.toggle('on', t.dataset.k === k);
        t.setAttribute('aria-selected', t.dataset.k === k ? 'true' : 'false'); });
      panels.forEach(function (p) { p.classList.toggle('on', p.dataset.k === k); });
    }
    tabsEl.forEach(function (t) { t.addEventListener('click', function () { sel(t.dataset.k); }); });
    sel('read');
  }

  /* ---- 11 · Chrome fixup + view toggle -------------------------------- */
  function rootChrome() {
    document.querySelectorAll('.site-nav a, .site-footer a').forEach(function (a) {
      var href = a.getAttribute('href') || '';
      if (/^(https?:|mailto:|#|\/)/.test(href) || href === '') return;
      a.setAttribute('href', '/' + href);
    });
    var mark = document.querySelector('.site-nav .brand-mark');
    if (mark) { var s = mark.getAttribute('src') || '';
      if (s && !/^(https?:|\/)/.test(s)) mark.setAttribute('src', '/' + s); }
  }
  function viewToggleHref(target) {
    var q = new URLSearchParams(location.search);
    if (target === 'consumer') q.delete('view'); else q.set('view', target);
    var s = q.toString();
    return location.pathname + (s ? '?' + s : '');
  }

  /* ---- 12 · Shared CSS ------------------------------------------------- */
  function injectViewerCSS() {
    if (document.getElementById('jx-mv-css')) return;
    var st = document.createElement('style');
    st.id = 'jx-mv-css';
    st.textContent = [
      '.mv-choose{font-size:12px;font-weight:700;letter-spacing:.04em;text-transform:uppercase;color:var(--jx-slate-500);display:flex;align-items:center;gap:7px;margin-bottom:9px}',
      '.mv-choose i{color:var(--jx-navy-600);font-size:15px}',
      '.mv-tabs{display:inline-flex;flex-wrap:wrap;gap:6px;margin-bottom:16px;background:var(--jx-stone-100);border:1px solid var(--jx-stone-200);border-radius:999px;padding:5px}',
      '.mv-tab{display:inline-flex;align-items:center;gap:7px;font-size:13.5px;font-weight:600;padding:8px 15px;border-radius:999px;border:none;background:transparent;color:var(--jx-navy-800);cursor:pointer;font-family:var(--font-body)}',
      '.mv-tab i{font-size:16px}',
      '.mv-tab:hover{background:var(--jx-white)}',
      '.mv-tab.on{background:var(--jx-navy-800);color:#fff;box-shadow:0 1px 2px rgba(4,44,83,.2)}',
      '.jx-lane-client .mv-tab.on{background:var(--jx-coral-500)}',
      '.mv-panel{display:none}.mv-panel.on{display:block}',
      '.mv-ph{display:flex;flex-direction:column;align-items:flex-start;gap:8px;background:var(--jx-paper);border:1px dashed var(--jx-stone-300,#B5C5DC);border-radius:12px;padding:22px 22px}',
      '.mv-ph-ic{width:44px;height:44px;border-radius:999px;background:var(--jx-navy-800);color:#fff;display:flex;align-items:center;justify-content:center;font-size:21px}',
      '.jx-lane-client .mv-ph-ic{background:var(--jx-coral-500)}',
      '.mv-ph-t{font-family:var(--font-display);font-weight:600;font-size:16px;color:var(--jx-navy-800)}',
      '.mv-ph-d{font-size:13px;color:var(--jx-slate-500);line-height:1.5;max-width:60ch}',
      '.mv-ph-ref{font-family:var(--font-mono);font-size:11px;color:var(--jx-slate-500);background:var(--jx-stone-100);border:1px solid var(--jx-stone-200);border-radius:6px;padding:3px 8px;word-break:break-all}',
      '.beats{list-style:none;margin:0;padding:0;display:grid;grid-template-columns:1fr 1fr;gap:14px 26px}',
      '.beats.linear{grid-template-columns:1fr;gap:13px;max-width:760px}',
      '@media(max-width:720px){.beats{grid-template-columns:1fr}}',
      '.beats li{display:flex;gap:12px}',
      '.beats .bx{width:30px;height:33px;flex:0 0 auto;background:var(--jx-navy-500);clip-path:polygon(50% 0,100% 25%,100% 75%,50% 100%,0 75%,0 25%);display:flex;align-items:center;justify-content:center;color:#fff;font-size:15px}',
      '.jx-lane-client .beats .bx{background:var(--jx-coral-500)}',
      '.beats .k{display:block;font-weight:700;color:var(--jx-navy-800);font-size:14px;margin-bottom:2px;font-family:var(--font-body)}',
      '.beats .v{font-size:14px;color:var(--jx-ink-700);line-height:1.5}',
      '.mv-note{font-size:11.5px;color:var(--jx-slate-500);margin-top:14px;line-height:1.5}',
      '.jx-term{border-bottom:1px dotted var(--jx-slate-300,#9CA0A7);cursor:help;color:var(--jx-slate-500);font-style:italic;white-space:nowrap}',
      '.jx-term:hover,.jx-term:focus{color:var(--jx-coral-600);border-bottom-color:var(--jx-coral-500);outline:none}',
      '.jx-term-strong .jx-term{font-style:normal;color:var(--jx-navy-800);border-bottom-color:var(--jx-navy-500)}'
    ].join('\n');
    document.head.appendChild(st);
  }

  /* ---- 13 · Public API -------------------------------------------------- */
  window.JXMatter = {
    FLAG: FLAG, flagOn: flagOn, viewMode: viewMode, isAttorneyView: isAttorneyView,
    viewToggleHref: viewToggleHref, outputName: outputName, outputSub: outputSub,
    matter: MATTER, stages: STAGES, overview: OVERVIEW, checkpoints: CHECKPOINTS,
    marks: MARK, posture: POSTURE, glossary: GLOSSARY, actMeta: actMeta,
    mediaRef: mediaRef, renderViewer: renderViewer, rootChrome: rootChrome,
    injectViewerCSS: injectViewerCSS, esc: esc, render: render,
    stage: function (n) { return STAGES.filter(function (s) { return s.n === n; })[0]; },
    scopeLabel: function (s) {
      if (MATTER.party_model === 'one') return 'You — the applicant';
      return s.scope === 'each' ? 'Each party · on their own' : 'Both parties · together';
    }
  };
})();
