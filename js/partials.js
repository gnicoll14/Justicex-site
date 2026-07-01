// Shared nav + footer injector — keeps page files small.
(function(){
  const here = (location.pathname.split('/').pop() || 'index.html').toLowerCase();
  const navHTML = `
<nav class="site-nav">
  <div class="site-nav-inner">
    <a href="index.html" class="brand" aria-label="JusticeX.ai home">
      <img class="brand-mark" src="assets/brand-mark.png" alt="">
      <span>Justice<span class="x">X</span><span class="ai">.ai</span></span>
    </a>
    <button class="nav-toggle" id="navToggle" aria-label="Toggle navigation" aria-expanded="false">
      <span class="nav-toggle-bar"></span>
      <span class="nav-toggle-bar"></span>
      <span class="nav-toggle-bar"></span>
    </button>
    <div class="nav-links" id="navLinks">
      <a href="index.html">Home</a>
      <a href="markets.html">Markets</a>
      <a href="solutions.html">Solutions</a>
      <a href="technology.html">Technology</a>
      <a href="about.html">About</a>
      <a href="contact.html">Contact</a>
    </div>
    <div class="nav-actions">
      <a href="contact.html?path=pilot" class="nav-cta-pilot">Start Pilot</a>
      <a href="demo/" class="nav-secondary" style="display:inline-flex;align-items:center;gap:6px"><span style="color:var(--jx-coral-500);font-size:10px">▶</span> Explore the process</a>
      <a href="contact.html?path=demo" class="nav-cta">Request Early Access</a>
    </div>
  </div>
</nav>`;
  const footerHTML = `
<footer class="site-footer">
  <div class="wrap">
    <div class="footer-top">
      <div>
        <div class="footer-brand">Justice<span class="x">X</span><span class="ai">.ai</span></div>
        <div class="footer-tag">Truth. Fairness. Efficiency.<br>Objective comparison for dispute resolution — coming Summer 2026.</div>
      </div>
      <div><h5>Product</h5><ul>
        <li><a href="solutions.html">Pipeline</a></li>
        <li><a href="solutions.html#deliverables">Deliverables</a></li>
        <li><a href="about.html#roadmap">Roadmap</a></li>
        <li><a href="about.html#roadmap">Pricing · Phase 2</a></li>
      </ul></div>
      <div><h5>Markets</h5><ul>
        <li><a href="markets.html#markets">Markets</a></li>
        <li><a href="markets.html#paths">Delivery paths</a></li>
        <li><a href="markets.html#channels">Channels &amp; partners</a></li>
        <li><a href="markets.html#catalog">Dispute Catalog</a></li>
      </ul></div>
      <div><h5>Trust</h5><ul>
        <li><a href="trust.html">Trust Center</a></li>
        <li><a href="technology.html#security">Security</a></li>
        <li><a href="technology.html#compliance">Compliance</a></li>
        <li><a href="technology.html#ethics">Responsible AI</a></li>
        <li><a href="disclaimer.html">Disclaimer</a></li>
        <li><a href="terms.html">Terms of Service</a></li>
        <li><a href="privacy.html">Privacy Policy</a></li>
        <li><a href="privacy.html#subprocessors">Subprocessors</a></li>
      </ul></div>
      <div><h5>Company</h5><ul>
        <li><a href="about.html">About</a></li>
        <li><a href="about.html#team">Team</a></li>
        <li><a href="about.html#news">News Room</a></li>
        <li><a href="contact.html">Contact</a></li>
      </ul></div>
    </div>
    <div class="footer-disclaimer">
      JusticeX.ai is a SaaS platform — not a law firm or mediator. AI output may be inaccurate and must be independently reviewed. <a href="disclaimer.html" style="color:var(--jx-gold-500);text-decoration:underline">See full disclaimer</a>.
    </div>
    <div class="footer-bottom">
      <div class="legal">© 2026 JusticeX.ai · hello@justicex.ai · JusticeX.ai is a software platform — not a law firm or mediator. It provides objective comparison only; information here is not legal advice. The platform is in active development; some capabilities are pre-release.</div>
      <div class="social"><a href="contact.html">Contact</a></div>
    </div>
  </div>
</footer>`;
  const navSlot = document.querySelector('[data-partial="nav"]');
  if (navSlot) navSlot.outerHTML = navHTML;
  const footSlot = document.querySelector('[data-partial="footer"]');
  if (footSlot) footSlot.outerHTML = footerHTML;
  // Skip-to-content link for keyboard/screen-reader users
  (function(){
    if (!document.querySelector('.skip-link')) {
      const sl = document.createElement('a');
      sl.className = 'skip-link'; sl.href = '#main'; sl.textContent = 'Skip to content';
      document.body.insertBefore(sl, document.body.firstChild);
    }
    let main = document.querySelector('main, [role="main"], #main');
    if (!main) main = document.querySelector('section');
    if (main && !main.id) main.id = 'main';
  })();
  // active link
  document.querySelectorAll('.nav-links a').forEach(a => {
    if ((a.getAttribute('href')||'').toLowerCase() === here) a.classList.add('active');
  });
  // Mobile nav toggle
  const toggle = document.getElementById('navToggle');
  const links = document.getElementById('navLinks');
  if (toggle && links) {
    toggle.addEventListener('click', () => {
      const open = links.classList.toggle('open');
      toggle.classList.toggle('active', open);
      toggle.setAttribute('aria-expanded', open ? 'true' : 'false');
      document.body.classList.toggle('nav-open', open);
    });
    // Close menu on link click
    links.querySelectorAll('a').forEach(a => a.addEventListener('click', () => {
      links.classList.remove('open');
      toggle.classList.remove('active');
      toggle.setAttribute('aria-expanded', 'false');
      document.body.classList.remove('nav-open');
    }));
  }
  // Sticky-nav scroll state + slide-in "Start Pilot" micro-CTA
  (function(){
    const nav = document.querySelector('.site-nav');
    if (!nav) return;
    const st = document.createElement('style');
    st.textContent = '.nav-cta-pilot{display:none;}'
      + '.site-nav{transition:background .25s ease, box-shadow .25s ease;}'
      + '.site-nav.scrolled{box-shadow:0 4px 24px rgba(0,0,0,.28);background:rgba(4,20,40,.85);}'
      + '.site-nav.scrolled .nav-cta-pilot{display:inline-flex;align-items:center;gap:6px;background:var(--jx-gold-500);color:#021A33;font-weight:700;font-size:13px;padding:8px 14px;border-radius:6px;text-decoration:none;animation:jxPilotIn .3s ease;}'
      + '@keyframes jxPilotIn{from{opacity:0;transform:translateX(10px);}to{opacity:1;transform:none;}}';
    document.head.appendChild(st);
    const onScroll = () => nav.classList.toggle('scrolled', window.scrollY > 520);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
  })();
})();
