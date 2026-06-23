// Mediator Console — interactive prototype
// Single React app. Loads under Babel.

const { useState, useEffect, useMemo, useRef } = React;

/* ========== DATA ========== */
const MATTERS = [
  { id: "NY-DIV-2026-0184", title: "Smith v. Smith", parties: ["E. Smith (Petitioner)", "M. Smith (Respondent)"], type: "Divorce & Marital Dissolution", jurisdiction: "Supreme Ct, Kings Cty, NY", filed: "2026-03-08", stage: 4, completed: [1,2,3], cps: { 1: true, 2: false, 3: false }, status: "active" },
  { id: "NY-CUST-2026-0091", title: "Reyes / Reyes — Custody", parties: ["A. Reyes", "J. Reyes"], type: "Child Custody & Parenting Plan", jurisdiction: "Family Ct, Queens Cty, NY", filed: "2026-02-14", stage: 6, completed: [1,2,3,4,5], cps: { 1: true, 2: false, 3: false }, status: "checkpoint" },
  { id: "NY-LT-2026-0312",  title: "540 Bedford Ave — Holdover", parties: ["540 Bedford LLC (Landlord)", "T. Okafor (Tenant)"], type: "Landlord–Tenant Dispute", jurisdiction: "Civil Ct, Kings Cty, NY", filed: "2026-04-02", stage: 7, completed: [1,2,3,4,5,6], cps: { 1: true, 2: true, 3: false }, status: "checkpoint" },
  { id: "NY-CON-2026-0044", title: "Park v. Volta Audio", parties: ["S. Park (Buyer)", "Volta Audio LLC"], type: "Small Claims · Consumer", jurisdiction: "Civil Ct, Bronx Cty, NY", filed: "2026-04-22", stage: 2, completed: [1], cps: { 1: false, 2: false, 3: false }, status: "active" },
  { id: "NY-HOA-2026-0119", title: "Linden Ridge HOA", parties: ["Linden Ridge HOA Board", "Owners of 14, 16, 18 Linden Ln"], type: "Neighbor & HOA", jurisdiction: "Westchester Cty, NY", filed: "2026-05-01", stage: 1, completed: [], cps: { 1: false, 2: false, 3: false }, status: "queued" },
];

const STAGES = [
  { n: 1, name: "Plan",      desc: "Scope & path selection.",                 cp: 0, blurb: "Matter scope confirmed before any evidence is captured." },
  { n: 2, name: "Intake",    desc: "Evidence collection + quality flags.",    cp: 0, blurb: "Schema-aware intake; OCR; chain-of-custody hash per file." },
  { n: 3, name: "Redact",    desc: "Privilege & PII redaction.",              cp: 1, blurb: "Multi-pass NER + privilege classifier. Counsel approves the diff." },
  { n: 4, name: "Summarize", desc: "Symmetric position briefs.",              cp: 0, blurb: "Same prompts, same models, both parties. Every claim cited." },
  { n: 5, name: "Rate",      desc: "Calibrated claim-strength scoring.",      cp: 2, blurb: "Per-claim score with confidence band. Mediator can override." },
  { n: 6, name: "Discover",  desc: "ZOPA map + convergence analysis.",        cp: 0, blurb: "Issue-by-issue overlay. Deterministic symmetry assertion." },
  { n: 7, name: "Resolve",   desc: "Settlement framework + default clauses.", cp: 3, blurb: "Audit-traceable draft. Mediator signs before parties see it." },
];

const FILES = [
  { name: "Petitioner brief (E. Smith).pdf",  party: "A", size: "1.2 MB", pages: 18,  ocr: 99, status: "Ingested" },
  { name: "Statement of net worth — Smith.xlsx", party: "A", size: "184 KB", pages: 6, ocr: 100, status: "Ingested" },
  { name: "Q3 financials Smith.pdf",          party: "A", size: "780 KB", pages: 12, ocr: 94, status: "Flagged · low OCR" },
  { name: "Response brief (M. Smith).pdf",    party: "B", size: "1.4 MB", pages: 22,  ocr: 99, status: "Ingested" },
  { name: "Counterclaim & exhibits.zip",      party: "B", size: "3.6 MB", pages: 41, ocr: 97, status: "Ingested" },
  { name: "Marital home appraisal.pdf",       party: "B", size: "640 KB", pages: 9,  ocr: 100, status: "Ingested" },
  { name: "Shared — SOW 2024-03-12.pdf",      party: "S", size: "112 KB", pages: 4,  ocr: 100, status: "Ingested" },
];

const CLAIMS = [
  { id: "C1", name: "Equitable distribution of marital home", scoreA: 78, scoreB: 64, band: "±6", cite: "Q3 financials Smith.pdf · p.4" },
  { id: "C2", name: "Spousal maintenance (length & amount)",  scoreA: 71, scoreB: 58, band: "±8", cite: "Statement of net worth · ¶3" },
  { id: "C3", name: "Allocation of retirement accounts",      scoreA: 82, scoreB: 80, band: "±4", cite: "Counterclaim & exhibits · Ex.B" },
  { id: "C4", name: "Custodial schedule (school year)",       scoreA: 66, scoreB: 72, band: "±7", cite: "Response brief · ¶17" },
  { id: "C5", name: "Allocation of joint debt",               scoreA: 54, scoreB: 81, band: "±5", cite: "Q3 financials · Sch. 2" },
];

const ZOPA_ISSUES = [
  { id: "Z1", name: "Marital home — buyout amount",  status: "zopa", aMin: 38, aMax: 62, bMin: 48, bMax: 76, zopaLo: 48, zopaHi: 62, scaleLo: "$240K", scaleHi: "$540K", note: "Overlapping band $360K–$415K. Most likely landing zone given recent comps in equitable-distribution case law." },
  { id: "Z2", name: "Spousal maintenance — monthly", status: "conv", aMin: 35, aMax: 55, bMin: 40, bMax: 60, zopaLo: 40, zopaHi: 55, scaleLo: "$2.5K", scaleHi: "$6.5K", note: "Bands materially overlap. Both parties open to a duration-capped schedule with step-down at 36 months." },
  { id: "Z3", name: "Joint debt — assumption ratio",  status: "gap",  aMin: 20, aMax: 38, bMin: 60, bMax: 82, zopaLo: 0,  zopaHi: 0,  scaleLo: "0 / 100", scaleHi: "100 / 0", note: "No overlap. Suggest revisiting after Stage 5 claim C5 — the evidentiary delta on undisclosed obligations is the highest-value lever." },
];

const SOURCES = {
  "S1": { tag: "Source 1", name: "Q3 financials Smith.pdf", page: 4, party: "A", lines: ["The petitioner's gross monthly income for the quarter declined by 38% relative to the prior trailing quarter, principally due to a reduction in commission-based earnings.", "Material modifications to the household budget commenced in September 2025; see attached schedule.", "Carrying costs on the marital residence (mortgage, taxes, insurance) total $4,820/month and have remained constant."], hl: 0 },
  "S2": { tag: "Source 2", name: "Response brief (M. Smith).pdf", page: 7, party: "B", lines: ["Respondent maintains that the Q3 income decline reflects voluntary scope reduction and is not evidence of permanent earnings impairment.", "Respondent further notes that household financial obligations have been borne disproportionately by Respondent during the period in question."], hl: 0 },
  "S3": { tag: "Source 3", name: "Counterclaim & exhibits — Ex. B", page: 12, party: "B", lines: ["Retirement asset summary as of valuation date: combined balance $1,184,200, allocated 56% to Petitioner and 44% to Respondent across IRA, 401(k), and SEP accounts.", "Vesting schedules are statutory; no material restrictions apply to equitable distribution."], hl: 0 },
  "S4": { tag: "Source 4", name: "SOW 2024-03-12.pdf", page: 1, party: "S", lines: ["The parties acknowledge that the marital agreement of record was executed on March 12, 2024, and remains in force as of the filing date.", "All schedules and exhibits referenced therein are incorporated by reference."], hl: 0 },
};

/* ========== TOP BAR ========== */
function TopBar({ matter, onExit }) {
  return (
    <div className="topbar">
      <a href="index.html" className="topbar-brand">
        <img src="assets/brand-mark.png" alt="" style={{width:'24px',height:'24px'}}/>
        <span>JusticeX<span style={{color:'var(--jx-gold-500)'}}>.</span><span className="ai">ai</span></span>
      </a>
      <div className="topbar-divider"></div>
      <div className="topbar-crumbs">
        <span>Mediator Workspace</span>
        <span className="crumb-sep">›</span>
        <span>Matters</span>
        <span className="crumb-sep">›</span>
        <span className="crumb-current">{matter ? matter.id : "Pick a matter"}</span>
      </div>
      <div className="topbar-search">
        <span style={{color:'var(--jx-slate-300)',fontSize:'13px'}}>⌕</span>
        <input placeholder="Jump to matter, party, citation…" />
        <span className="kbd">⌘K</span>
      </div>
      <a href="index.html" className="exit" onClick={onExit}>Exit prototype</a>
      <div className="topbar-user">
        <span className="avatar">GN</span>
        <div>
          <div className="who">G. Nicoll</div>
          <div className="role">Mediator</div>
        </div>
      </div>
    </div>
  );
}

/* ========== SIDEBAR ========== */
function Sidebar({ matters, selected, onSelect }) {
  const [filter, setFilter] = useState("all");
  const filtered = matters.filter(m =>
    filter === "all" ||
    (filter === "active" && m.status === "active") ||
    (filter === "checkpoint" && m.status === "checkpoint") ||
    (filter === "queued" && m.status === "queued")
  );
  const counts = {
    all: matters.length,
    active: matters.filter(m=>m.status==="active").length,
    checkpoint: matters.filter(m=>m.status==="checkpoint").length,
  };
  return (
    <aside className="sidebar">
      <div className="sidebar-header">
        <div className="label">Matters · This week</div>
        <div className="count">{counts.all} <span style={{fontSize:'13px',color:'var(--jx-slate-500)',fontFamily:'var(--font-body)',marginLeft:'6px'}}>· {counts.checkpoint} awaiting</span></div>
      </div>
      <div className="sidebar-filters">
        {[["all","All"],["active","Active"],["checkpoint","Checkpoint"],["queued","Queued"]].map(([k,label]) => (
          <button key={k} className={"sidebar-filter " + (filter===k?"active":"")} onClick={()=>setFilter(k)}>{label}</button>
        ))}
      </div>
      <div className="matters-list">
        {filtered.map(m => {
          const pillCls = m.status === "checkpoint" ? "pill-cp" : m.status === "active" ? "pill-active" : "pill-queued";
          const pillText = m.status === "checkpoint" ? "Checkpoint" : m.status === "active" ? "Active" : "Queued";
          return (
            <div key={m.id} className={"matter-row " + (selected===m.id?"active":"")} onClick={()=>onSelect(m.id)}>
              <div className="matter-id">{m.id}</div>
              <div className="matter-title">{m.title}</div>
              <div className="matter-meta">
                <span>Stage {m.stage} · {STAGES[m.stage-1].name}</span>
                <span className={"pill " + pillCls}>{pillText}</span>
              </div>
            </div>
          );
        })}
      </div>
      <div className="sidebar-foot">
        <span className="dot"></span>
        <span>Pipeline healthy · last symmetry check 14:04:23</span>
      </div>
    </aside>
  );
}

/* ========== PANEL: STAGE 1 PLAN ========== */
function PlanPanel({ matter }) {
  return (
    <div>
      <div className="plan-grid">
        <div className="plan-cell"><div className="label">Parties</div><div className="val">{matter.parties[0]}<br/>{matter.parties[1]}</div></div>
        <div className="plan-cell"><div className="label">Dispute type</div><div className="val">{matter.type}</div></div>
        <div className="plan-cell"><div className="label">Jurisdiction</div><div className="val">{matter.jurisdiction}</div><div className="sub">Equitable-distribution state · AI-permissive disclosure</div></div>
        <div className="plan-cell"><div className="label">Filed</div><div className="val">{matter.filed}</div><div className="sub">Within statutory mediation window.</div></div>
        <div className="plan-cell"><div className="label">Issues in scope</div><div className="val">14 issues · 5 disputed</div><div className="sub">Locked at intake. Re-run after Stage 6.</div></div>
        <div className="plan-cell"><div className="label">Pipeline depth</div><div className="val">Standard mediation path</div><div className="sub">All 7 stages enabled · 3 checkpoints.</div></div>
      </div>
    </div>
  );
}

/* ========== PANEL: STAGE 2 INTAKE ========== */
function IntakePanel() {
  return (
    <table className="file-table">
      <thead>
        <tr><th>File</th><th>Party</th><th>Size · Pages</th><th>OCR</th><th>Status</th><th></th></tr>
      </thead>
      <tbody>
        {FILES.map((f,i) => (
          <tr key={i}>
            <td><div className="file-name">{f.name}</div></td>
            <td><span className={"file-party " + (f.party==="A"?"party-a":f.party==="B"?"party-b":"")}>{f.party==="A"?"Party A":f.party==="B"?"Party B":"Shared"}</span></td>
            <td className="file-meta">{f.size} · {f.pages} pp</td>
            <td><div className="ocr-bar"><div className="fill" style={{width: f.ocr+"%"}}></div></div><span className="file-meta">{f.ocr}%</span></td>
            <td className="file-meta">{f.status}</td>
            <td><button className="btn-mini">Open</button></td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}

/* ========== PANEL: STAGE 3 REDACT ========== */
function RedactPanel({ signed, onSign }) {
  return (
    <div>
      <div className={"checkpoint-callout " + (signed ? "signed" : "")}>
        <span className="cp-icon">{signed ? "✓" : "1"}</span>
        <div className="cp-text">
          <div className="cp-label">{signed ? "Checkpoint 1 · Signed" : "Checkpoint 1 · Post-redaction"}</div>
          <div className="cp-msg">{signed ? "You signed off on the redaction set. Stages 4–7 may proceed." : "Review and approve the redactions before Stage 4 begins."}</div>
          <div className="cp-meta">142 redactions · 8 documents · 38 privilege matches</div>
        </div>
        {!signed && <button className="btn-mini primary" onClick={onSign}>Sign off →</button>}
        {signed && <button className="btn-mini">View certificate</button>}
      </div>

      <div className="redact-diff">
        <div className="redact-card before">
          <span className="label">Before redaction · Source view</span>
          <p>Petitioner <span className="redact">E. Smith</span>, residing at <span className="redact">42 Oak Ave, Brooklyn NY 11215</span>, with SSN <span className="redact">123-45-6789</span> and primary account <span className="redact">Citi •8842</span>, alleges...</p>
          <p>Communication via attorney <span className="redact">Mara Bell, Esq. (privileged)</span> dated <span className="redact">2026-02-08</span> confirms position.</p>
        </div>
        <div className="redact-card after">
          <span className="label">After redaction · Model input</span>
          <p>Petitioner <span className="redact">XXXXXXX</span>, residing at <span className="redact">XX OAK XXXXX BROOKLYN</span>, with SSN <span className="redact">XXX-XX-XXXX</span> and primary account <span className="redact">XXXX XXXX</span>, alleges...</p>
          <p>Communication via attorney <span className="redact">XXXXXXXXXXX (privileged)</span> dated <span className="redact">XXXX-XX-XX</span> confirms position.</p>
        </div>
      </div>
    </div>
  );
}

/* ========== PANEL: STAGE 4 SUMMARIZE ========== */
function SummarizePanel({ onCite, activeCite }) {
  const Chip = ({ id }) => (
    <span className={"cite " + (activeCite === id ? "active" : "")} onClick={()=>onCite(id)} role="button">[{id.replace("S","")}]</span>
  );
  return (
    <div className="split">
      <section>
        <div className="split-head">
          <div>
            <div className="party-tag">Party A · Petitioner</div>
            <div className="party-name">E. Smith</div>
          </div>
          <div style={{textAlign:'right'}}>
            <div className="party-tag">Brief coverage</div>
            <div className="party-score">87%</div>
          </div>
        </div>
        <p className="brief-para">Petitioner seeks equitable distribution of marital assets with primary residential custody of the minor children. Petitioner's earnings declined 38% in Q3 2025 following the breach in commission-based engagements, while household carrying costs remained constant<Chip id="S1"/>.</p>
        <p className="brief-para">Petitioner submits the marital agreement of record dated 2024-03-12 governs disposition of pre-marital assets but does not bind the post-2024 retirement-asset accretion now in scope<Chip id="S4"/>.</p>
        <p className="brief-para">On the basis of the Q3 statement, Petitioner requests spousal maintenance of $4,800/month for 36 months, stepping down to $2,400/month for the subsequent 24 months<Chip id="S1"/>.</p>
      </section>
      <section>
        <div className="split-head">
          <div>
            <div className="party-tag">Party B · Respondent</div>
            <div className="party-name">M. Smith</div>
          </div>
          <div style={{textAlign:'right'}}>
            <div className="party-tag">Brief coverage</div>
            <div className="party-score">82%</div>
          </div>
        </div>
        <p className="brief-para">Respondent maintains that the Q3 income decline reflects voluntary scope reduction and is not evidence of permanent earnings impairment<Chip id="S2"/>. Respondent further notes that household financial obligations have been borne disproportionately by Respondent during the period in question<Chip id="S2"/>.</p>
        <p className="brief-para">Retirement asset summary as of the valuation date totals $1,184,200, with Respondent's share calculated at 44% across IRA, 401(k), and SEP accounts; vesting is statutory<Chip id="S3"/>.</p>
        <p className="brief-para">Respondent acknowledges the marital agreement of 2024-03-12<Chip id="S4"/> and does not contest its incorporation of pre-marital schedules.</p>
      </section>
    </div>
  );
}

/* ========== PANEL: STAGE 5 RATE ========== */
function RatePanel({ signed, onSign }) {
  const [scores, setScores] = useState(CLAIMS);
  return (
    <div>
      <div className={"checkpoint-callout " + (signed ? "signed" : "")}>
        <span className="cp-icon">{signed ? "✓" : "2"}</span>
        <div className="cp-text">
          <div className="cp-label">{signed ? "Checkpoint 2 · Signed" : "Checkpoint 2 · Post-rating"}</div>
          <div className="cp-msg">{signed ? "Scoring rationale confirmed. ZOPA discovery may proceed." : "Confirm claim-level scoring or override with rationale capture."}</div>
          <div className="cp-meta">5 claims · symmetry assertion: PASS · neutrality auditor: PASS</div>
        </div>
        {!signed && <button className="btn-mini primary" onClick={onSign}>Approve scoring →</button>}
        {signed && <button className="btn-mini">View certificate</button>}
      </div>

      <div className="claim-list">
        {scores.map((c, i) => (
          <div className="claim-row" key={c.id}>
            <div>
              <div className="claim-name">{c.name}</div>
              <div className="claim-row-meta" style={{fontSize:'11px',color:'var(--jx-slate-500)',marginTop:'4px',fontFamily:'var(--font-mono)'}}>Anchor: {c.cite}</div>
            </div>
            <div className="claim-score">
              <div className="score-num" style={{color:'var(--jx-teal-600)'}}>{c.scoreA}</div>
              <div className="score-bar"><div className="fill" style={{width: c.scoreA+"%"}}></div></div>
              <div className="score-band">A · {c.band}</div>
            </div>
            <div className="claim-score">
              <div className="score-num" style={{color:'var(--jx-gold-600)'}}>{c.scoreB}</div>
              <div className="score-bar"><div className="fill" style={{width: c.scoreB+"%", background:'var(--jx-gold-500)'}}></div></div>
              <div className="score-band">B · {c.band}</div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

/* ========== PANEL: STAGE 6 DISCOVER ========== */
function DiscoverPanel() {
  return (
    <div className="zopa">
      {ZOPA_ISSUES.map(z => {
        const statusLabel = z.status === "zopa" ? "ZOPA · ready" : z.status === "conv" ? "Convergent" : "Gap";
        const statusCls = z.status === "zopa" ? "status-zopa" : z.status === "conv" ? "status-conv" : "status-gap";
        return (
          <div className="zopa-issue" key={z.id}>
            <div className="issue-head">
              <div className="issue-name">{z.name}</div>
              <span className={"issue-status " + statusCls}>{statusLabel}</span>
            </div>
            <div className="zopa-line">
              <div className="scale"><span>{z.scaleLo}</span><span>{z.scaleHi}</span></div>
              {z.zopaHi > z.zopaLo && <div className="band" style={{left: z.zopaLo+"%", width: (z.zopaHi-z.zopaLo)+"%"}}></div>}
              <div className="a-mark" style={{left: ((z.aMin+z.aMax)/2)+"%"}}>A · {z.aMin}–{z.aMax}</div>
              <div className="b-mark" style={{left: ((z.bMin+z.bMax)/2)+"%", top:'calc(50% + 12px)'}}>B · {z.bMin}–{z.bMax}</div>
            </div>
            <div className="issue-note">{z.note}</div>
          </div>
        );
      })}
    </div>
  );
}

/* ========== PANEL: STAGE 7 RESOLVE ========== */
function ResolvePanel({ signed, onSign }) {
  return (
    <div>
      <div className={"checkpoint-callout " + (signed ? "signed" : "")}>
        <span className="cp-icon">{signed ? "✓" : "3"}</span>
        <div className="cp-text">
          <div className="cp-label">{signed ? "Checkpoint 3 · Signed" : "Checkpoint 3 · Pre-resolution"}</div>
          <div className="cp-msg">{signed ? "Framework approved. Ready to release to parties." : "Review the settlement framework before the joint session."}</div>
          <div className="cp-meta">3 default clauses inserted · durability score 84/100 · provenance: court-vetted templates</div>
        </div>
        {!signed && <button className="btn-mini primary" onClick={onSign}>Approve framework →</button>}
        {signed && <button className="btn-mini">View certificate</button>}
      </div>

      <div className="framework">
        <h4>Article I · Distribution of Marital Property</h4>
        <p>The marital residence located at <span className="var">[ADDRESS · redacted]</span> shall be sold within <span className="var">180</span> days of execution. Net proceeds shall be divided <span className="var">52 / 48</span> in favor of Party A, reflecting the equitable-distribution band identified in the ZOPA analysis.</p>

        <h4>Article II · Spousal Maintenance</h4>
        <p>Party B shall pay spousal maintenance in the amount of <span className="var">$3,200</span> per month for <span className="var">36</span> months, stepping down to <span className="var">$1,800</span> per month for an additional <span className="var">24</span> months, contingent on continuous earnings within the income band stipulated in Schedule A.</p>

        <h4>Article III · Retirement Asset Allocation</h4>
        <p>Combined retirement asset balance of $1,184,200 shall be allocated <span className="var">54 / 46</span> in favor of Party A. Transfer to be completed via QDRO within <span className="var">90</span> days.</p>

        <hr/>

        <h4>Default & Dispute Clauses</h4>
        <p>The parties agree to a <strong>mediation-first</strong> requirement for any post-execution dispute; <strong>fee-shifting</strong> in the event of a finding of bad faith; <strong>liquidated damages</strong> of <span className="var">$2,500</span> per breach of the schedule herein; and <strong>self-executing remedies</strong> for late payment as set forth in Schedule B.</p>
      </div>
    </div>
  );
}

/* ========== STAGE PANEL CONTAINER ========== */
function StagePanel({ matter, stage, cps, onSignCheckpoint, onCite, activeCite }) {
  const s = STAGES[stage-1];
  let body;
  switch (stage) {
    case 1: body = <PlanPanel matter={matter} />; break;
    case 2: body = <IntakePanel />; break;
    case 3: body = <RedactPanel signed={cps[1]} onSign={()=>onSignCheckpoint(1)} />; break;
    case 4: body = <SummarizePanel onCite={onCite} activeCite={activeCite} />; break;
    case 5: body = <RatePanel signed={cps[2]} onSign={()=>onSignCheckpoint(2)} />; break;
    case 6: body = <DiscoverPanel />; break;
    case 7: body = <ResolvePanel signed={cps[3]} onSign={()=>onSignCheckpoint(3)} />; break;
    default: body = <div className="empty"><h3>Coming up</h3><p>Stage hasn't started for this matter.</p></div>;
  }
  return (
    <div className="stage-panel">
      <div className="stage-panel-head">
        <div>
          <div className="stage-eyebrow">Stage {s.n} · {s.cp ? `Checkpoint ${s.cp}` : "Automated"}</div>
          <h2>{s.name} — {s.desc}</h2>
          <p className="stage-desc">{s.blurb}</p>
        </div>
        <div className="panel-actions">
          <button className="btn-mini">Audit ledger</button>
          <button className="btn-mini">Export</button>
        </div>
      </div>
      <div className="stage-panel-body">{body}</div>
    </div>
  );
}

/* ========== RAIL ========== */
function StageRail({ matter, stage, onPick, cps }) {
  const completed = new Set(matter.completed);
  const progress = Math.round((completed.size / 7) * 100);
  return (
    <div className="rail">
      <div className="rail-title">
        Pipeline progress
        <span className="progress-text">{progress}% complete · {Object.values(cps).filter(Boolean).length}/3 checkpoints signed</span>
      </div>
      <div className="rail-stages">
        {STAGES.map(s => {
          const cls = ["rail-stage"];
          if (completed.has(s.n)) cls.push("done");
          if (s.n === stage) cls.push("active");
          if (s.cp) cls.push("checkpoint");
          return (
            <button key={s.n} className={cls.join(" ")} onClick={()=>onPick(s.n)}>
              {s.cp ? <span className="cp-flag">CP{s.cp}</span> : null}
              <div className="stage-n">{String(s.n).padStart(2,"0")}</div>
              <div className="stage-name">{s.name}</div>
              <div className="stage-meta">{s.desc}</div>
            </button>
          );
        })}
      </div>
    </div>
  );
}

/* ========== CITATION DRAWER ========== */
function CitationDrawer({ cite, onClose }) {
  const src = cite ? SOURCES[cite] : null;
  return (
    <React.Fragment>
      <div className={"drawer-backdrop " + (cite ? "open" : "")} onClick={onClose}></div>
      <aside className={"drawer " + (cite ? "open" : "")}>
        {src ? (
          <React.Fragment>
            <div className="drawer-head">
              <div>
                <div className="src-tag">{src.tag}</div>
                <div className="src-name">{src.name}</div>
              </div>
              <button className="close-btn" onClick={onClose}>Close ✕</button>
            </div>
            <div className="drawer-body">
              <div className="doc-meta">
                <div className="m"><span className="label">Party</span><span className="val">{src.party==="A"?"Party A":src.party==="B"?"Party B":"Shared"}</span></div>
                <div className="m"><span className="label">Page</span><span className="val">{src.page}</span></div>
                <div className="m"><span className="label">Provenance</span><span className="val">Stage 2 · OCR 99%</span></div>
                <div className="m"><span className="label">Hash</span><span className="val">0x9af3c…</span></div>
              </div>
              <div className="drawer-page">
                <div className="page-no">Page {src.page}</div>
                {src.lines.map((line, i) => (
                  <p key={i}>{i === src.hl ? <mark>{line}</mark> : line}</p>
                ))}
              </div>
            </div>
            <div className="drawer-foot">
              <button className="btn-mini">Open in viewer</button>
              <button className="btn-mini">Copy citation</button>
              <button className="btn-mini danger" style={{marginLeft:'auto'}}>Flag misquote</button>
            </div>
          </React.Fragment>
        ) : null}
      </aside>
    </React.Fragment>
  );
}

/* ========== APP ========== */
function App() {
  const [selectedId, setSelectedId] = useState(MATTERS[0].id);
  const [stage, setStage] = useState(4);
  const [cpState, setCpState] = useState({}); // per-matter cps
  const [cite, setCite] = useState(null);
  const [toast, setToast] = useState(null);

  // initialize cp state from MATTERS
  useEffect(() => {
    const init = {};
    MATTERS.forEach(m => { init[m.id] = { ...m.cps }; });
    setCpState(init);
  }, []);

  const matter = useMemo(() => MATTERS.find(m => m.id === selectedId), [selectedId]);
  const cps = cpState[selectedId] || {};

  function showToast(text, sub) {
    setToast({ text, sub });
    setTimeout(() => setToast(null), 3200);
  }

  function pickMatter(id) {
    setSelectedId(id);
    const m = MATTERS.find(x => x.id === id);
    setStage(m.stage);
    setCite(null);
  }

  function signCheckpoint(n) {
    setCpState(prev => ({ ...prev, [selectedId]: { ...(prev[selectedId]||{}), [n]: true } }));
    showToast(`Checkpoint ${n} signed`, `${selectedId} · ${new Date().toLocaleTimeString()}`);
  }

  function onCite(id) {
    setCite(prev => prev === id ? null : id);
  }

  if (!matter) return null;

  return (
    <div className="app">
      <TopBar matter={matter} />
      <Sidebar matters={MATTERS} selected={selectedId} onSelect={pickMatter} />
      <main className="main">
        <div className="main-inner">
          <div className="matter-card">
            <div className="matter-card-top">
              <div>
                <div className="matter-card-id">{matter.id}</div>
                <div className="matter-card-title">{matter.title}</div>
                <div className="matter-card-meta">
                  <div className="m-cell"><span className="label">Parties</span><span className="val">{matter.parties[0]} · {matter.parties[1]}</span></div>
                  <div className="m-cell"><span className="label">Type</span><span className="val">{matter.type}</span></div>
                  <div className="m-cell"><span className="label">Jurisdiction</span><span className="val">{matter.jurisdiction}</span></div>
                  <div className="m-cell"><span className="label">Filed</span><span className="val">{matter.filed}</span></div>
                </div>
              </div>
              <div className="matter-card-actions">
                <button className="btn-mini">Open in viewer</button>
                <button className="btn-mini navy">Brief parties</button>
              </div>
            </div>
          </div>

          <StageRail matter={matter} stage={stage} cps={cps} onPick={setStage} />
          <StagePanel matter={matter} stage={stage} cps={cps} onSignCheckpoint={signCheckpoint} onCite={onCite} activeCite={cite} />

          <div className="action-bar">
            <div className="a-info">
              <div className="a-label">Now on</div>
              <div className="a-text">Stage {stage} · {STAGES[stage-1].name}</div>
            </div>
            <div className="a-info">
              <div className="a-label">Audit log</div>
              <div className="a-text" style={{fontFamily:'var(--font-mono)',fontSize:'12px'}}>0x9af3c… · {new Date().toLocaleTimeString()}</div>
            </div>
            <div className="a-spacer"></div>
            <button className="btn-mini" disabled={stage===1} onClick={()=>setStage(Math.max(1, stage-1))}>← Previous stage</button>
            <button className="btn-mini navy" disabled={stage===7} onClick={()=>setStage(Math.min(7, stage+1))}>Next stage →</button>
          </div>
        </div>
      </main>

      <CitationDrawer cite={cite} onClose={()=>setCite(null)} />

      <div className={"toast " + (toast ? "show" : "")}>
        {toast && <React.Fragment><span className="toast-ok">✓</span><span>{toast.text}</span><span className="toast-mono">{toast.sub}</span></React.Fragment>}
      </div>
    </div>
  );
}

ReactDOM.createRoot(document.getElementById("app")).render(<App />);
