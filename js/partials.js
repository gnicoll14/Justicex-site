// Shared nav + footer injector — keeps page files small.
(function(){
  const here = (location.pathname.split('/').pop() || 'index.html').toLowerCase();

  // Pre-launch notice ribbon (remove at launch: delete this block).
  (function(){
    function mount(){
      if (document.getElementById('jx-prelaunch')) return;
      const bar = document.createElement('div');
      bar.id = 'jx-prelaunch';
      bar.setAttribute('role','note');
      bar.setAttribute('aria-label','Pre-launch notice');
      bar.style.cssText = 'position:relative;z-index:60;background:#FFF4EF;color:#7a2f16;'
        + "border-bottom:1px solid #F1CDBE;font-family:'Source Sans 3',system-ui,sans-serif;"
        + 'font-size:12.5px;font-weight:600;line-height:1.4;padding:7px 16px;text-align:center;'
        + 'display:flex;align-items:center;justify-content:center;gap:9px;';
      bar.innerHTML = '<span aria-hidden="true" style="flex:none;display:inline-flex;width:16px;height:16px;'
        + 'border-radius:50%;background:#D85A30;color:#fff;align-items:center;justify-content:center;'
        + 'font-size:11px;font-weight:800;">!</span><span><b>Pre-launch preview</b> — JusticeX isn’t live yet '
        + '(coming Summer 2026). Please don’t enter real case or matter details in the demo.</span>';
      document.body.insertBefore(bar, document.body.firstChild);
    }
    if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', mount);
    else mount();
  })();
  const navHTML = `
<nav class="site-nav">
  <div class="site-nav-inner">
    <a href="index.html" class="brand" aria-label="JusticeX home">
      <img class="brand-mark" src="assets/brand-mark.png" alt="">
      <span>Justice<span class="x">X</span></span>
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
      <a href="contact.html?path=early" class="nav-cta">Get early access</a>
    </div>
  </div>
</nav>`;
  const footerHTML = `
<footer class="site-footer">
  <div class="wrap">
    <div class="footer-top">
      <div>
        <div class="footer-brand">Justice<span class="x">X</span></div>
        <div class="footer-tag">Truth. Fairness. Efficiency.<br>Objective comparison for dispute resolution — coming Summer 2026.</div>
      </div>
      <div><h5>Solutions</h5><ul>
        <li><a href="solutions.html#pipeline">Pipeline</a></li>
        <li><a href="solutions.html#deliverables">Deliverables</a></li>
        <li><a href="solutions.html#outcomes">Outcomes</a></li>
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
        <li><a href="about.html#roadmap">Roadmap</a></li>
        <li><a href="about.html#roadmap">Pricing</a></li>
        <li><a href="about.html#news">News Room</a></li>
        <li><a href="contact.html">Contact</a></li>
      </ul></div>
    </div>
    <div class="footer-disclaimer">
      JusticeX is a SaaS platform — not a law firm or mediator. AI output may be inaccurate and must be independently reviewed. <a href="disclaimer.html" style="color:var(--jx-gold-500);text-decoration:underline">See full disclaimer</a>.
    </div>
    <div class="footer-bottom">
      <div class="legal">© 2026 JusticeX · hello@justicex.ai · JusticeX is a software platform — not a law firm or mediator. It provides objective comparison only; information here is not legal advice. The platform is in active development; some capabilities are pre-release.</div>
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
  // Sticky-nav scroll state (shadow + background on scroll)
  (function(){
    const nav = document.querySelector('.site-nav');
    if (!nav) return;
    const st = document.createElement('style');
    st.textContent = '.site-nav{transition:background .25s ease, box-shadow .25s ease;}'
      + '.site-nav.scrolled{box-shadow:0 4px 24px rgba(0,0,0,.28);background:rgba(4,20,40,.85);}';
    document.head.appendChild(st);
    const onScroll = () => nav.classList.toggle('scrolled', window.scrollY > 520);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
  })();
})();
