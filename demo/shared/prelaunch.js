/* Pre-launch / not-live notice ribbon for the JusticeX console (product) pages.
   Self-contained: injects a slim notice at the top of <body>. No CSS dependency.
   Remove at launch: delete this file + the <script src="shared/prelaunch.js"> includes.
   Optional per-page override: set window.JX_PRELAUNCH_MSG (HTML string) before this script. */
(function () {
  if (window.__jxPrelaunch) return;
  window.__jxPrelaunch = true;
  var msg = window.JX_PRELAUNCH_MSG ||
    '<b>Preview — not live.</b> JusticeX is not yet active. Do not enter real personal information or real case details — use sample data only.';
  function mount() {
    if (document.getElementById('jx-prelaunch')) return;
    var bar = document.createElement('div');
    bar.id = 'jx-prelaunch';
    bar.setAttribute('role', 'note');
    bar.setAttribute('aria-label', 'Pre-launch notice');
    bar.style.cssText = 'position:sticky;top:0;z-index:99999;background:#FFF4EF;color:#7a2f16;' +
      'border-bottom:1px solid #F1CDBE;font-family:\'Source Sans 3\',system-ui,sans-serif;' +
      'font-size:12.5px;font-weight:600;line-height:1.4;padding:7px 16px;text-align:center;' +
      'display:flex;align-items:center;justify-content:center;gap:9px;';
    bar.innerHTML = '<span aria-hidden="true" style="flex:none;display:inline-flex;width:16px;height:16px;' +
      'border-radius:50%;background:#D85A30;color:#fff;align-items:center;justify-content:center;' +
      'font-size:11px;font-weight:800;">!</span><span>' + msg + '</span>';
    document.body.insertBefore(bar, document.body.firstChild);
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', mount);
  else mount();
})();
