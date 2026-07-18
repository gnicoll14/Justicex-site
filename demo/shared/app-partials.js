/* ============================================================
   JusticeX — Console (app) shared nav + footer injector
   Added 2026-07-18 (design-system-consistency branch).
   The console counterpart to js/partials.js: ONE app nav and ONE
   app footer for every console page, so chrome stops diverging.

   Drop-in: put <div data-partial="app-nav"></div> at the top of
   <body> and <div data-partial="app-footer"></div> at the end.
   Load AFTER shared/console.css. Injects the pre-launch ribbon,
   a skip-to-content link, active-link state, and the account slot.
   ============================================================ */
(function () {
  'use strict';
  var here = (location.pathname.split('/').pop() || 'index.html').toLowerCase();

  // Pre-launch ribbon (remove at launch).
  (function () {
    if (document.getElementById('jx-prelaunch')) return;
    var bar = document.createElement('div');
    bar.id = 'jx-prelaunch';
    bar.setAttribute('role', 'note');
    bar.style.cssText = 'position:relative;z-index:60;background:#FFF4EF;color:#7a2f16;'
      + "border-bottom:1px solid #F1CDBE;font-family:'Source Sans 3',system-ui,sans-serif;"
      + 'font-size:12.5px;font-weight:600;line-height:1.4;padding:7px 16px;text-align:center;'
      + 'display:flex;align-items:center;justify-content:center;gap:9px;';
    bar.innerHTML = '<span aria-hidden="true" style="flex:none;display:inline-flex;width:16px;height:16px;'
      + 'border-radius:50%;background:#D85A30;color:#fff;align-items:center;justify-content:center;'
      + 'font-size:11px;font-weight:800;">!</span><span><b>Pre-launch preview</b> — synthetic demo. '
      + 'No real person, figure, or matter. Please do not submit real personal or case information.</span>';
    document.body.insertBefore(bar, document.body.firstChild);
  })();

  var navHTML = ''
    + '<nav class="app-nav" aria-label="Console">'
    + '  <div class="app-nav-inner">'
    + '    <a class="app-brand" href="/index.html" aria-label="JusticeX home">'
    + '      <img src="/assets/brand-mark.png" alt="">'
    + '      <span>Justice<span class="x">X</span></span>'
    + '    </a>'
    + '    <div class="app-nav-links">'
    + '      <a href="dashboard.html">Dashboard</a>'
    + '      <a href="matter-workspace.html">Matters</a>'
    + '      <a href="directory.html">Directory</a>'
    + '      <a href="support.html">Support</a>'
    + '    </div>'
    + '    <div class="app-nav-actions" data-account-slot>'
    + '      <span class="termsw" id="termsw"></span>'
    + '    </div>'
    + '  </div>'
    + '</nav>';

  var footHTML = ''
    + '<footer class="app-foot">'
    + '  <div class="app-foot-inner">'
    + '    <div><b>JusticeX is a software platform — not a law firm or mediator.</b> '
    + '         Objective comparison only; not legal advice. Synthetic demo — no real person, figure, or matter.</div>'
    + '    <div><b>Truth · Fairness · Efficiency</b></div>'
    + '  </div>'
    + '</footer>';

  var navSlot = document.querySelector('[data-partial="app-nav"]');
  if (navSlot) navSlot.outerHTML = navHTML;
  var footSlot = document.querySelector('[data-partial="app-footer"]');
  if (footSlot) footSlot.outerHTML = footHTML;

  // Skip-to-content
  if (!document.querySelector('.skip-link')) {
    var sl = document.createElement('a');
    sl.className = 'skip-link'; sl.href = '#main'; sl.textContent = 'Skip to content';
    document.body.insertBefore(sl, document.body.firstChild);
    var main = document.querySelector('main, [role="main"], #main') || document.querySelector('section');
    if (main && !main.id) main.id = 'main';
  }

  // Active link
  document.querySelectorAll('.app-nav-links a').forEach(function (a) {
    if ((a.getAttribute('href') || '').toLowerCase() === here) a.classList.add('active');
  });
})();
