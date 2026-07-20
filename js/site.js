// JusticeX.ai — shared site interactions
(function () {
  // Highlight current nav link
  const path = (window.location.pathname.split('/').pop() || 'index.html').toLowerCase();
  document.querySelectorAll('.nav-links a').forEach(a => {
    const href = (a.getAttribute('href') || '').toLowerCase();
    if (href === path || (path === '' && href === 'index.html') || (path === 'index.html' && href === 'index.html')) {
      a.classList.add('active');
    }
  });

  // Tabs
  document.querySelectorAll('[data-tabs]').forEach(group => {
    const tabs = group.querySelectorAll('.tab');
    const panels = group.querySelectorAll('.tabpanel');
    tabs.forEach((t, i) => {
      t.addEventListener('click', () => {
        tabs.forEach(x => x.setAttribute('aria-selected', 'false'));
        panels.forEach(p => p.classList.remove('active'));
        t.setAttribute('aria-selected', 'true');
        if (panels[i]) panels[i].classList.add('active');
      });
    });
  });

  // Audience router on contact page
  const router = document.querySelector('[data-audience-router]');
  if (router) {
    const cards = router.querySelectorAll('[data-audience]');
    const forms = document.querySelectorAll('[data-form]');
    // Default: nothing preselected — the visitor picks a path (prevents the old
    // "everyone lands on the mediator application" misroute).
    cards.forEach(card => {
      card.addEventListener('click', () => {
        const aud = card.getAttribute('data-audience');
        cards.forEach(c => c.classList.remove('active'));
        card.classList.add('active');
        forms.forEach(f => f.classList.toggle('active', f.getAttribute('data-form') === aud));
      });
    });
    // honor ?path= query
    const params = new URLSearchParams(window.location.search);
    const want = params.get('path');
    // Note: 'demo' (Request Early Access) intentionally NOT mapped — it leaves the
    // role picker unselected so a general visitor self-identifies rather than
    // landing on the mediator application.
    const map = { 'partner': 'partner', 'refer-rep': 'partner', 'mediator-pilot': 'mediator', 'mediator': 'mediator', 'counsel': 'counsel', 'waitlist': 'consumer', 'consumer': 'consumer', 'pilot': 'pilot', 'financial': 'financial', 'insurer': 'financial', 'cpa': 'financial', 'security': 'security', 'employer': 'employer', 'organization': 'employer', 'org': 'employer' };
    if (want && map[want]) {
      const target = router.querySelector(`[data-audience="${map[want]}"]`);
      if (target) target.click();
    }
  }

  // Form submit → Netlify Forms (AJAX), then show confirmation
  document.querySelectorAll('form[data-form]').forEach(f => {
    f.addEventListener('submit', e => {
      e.preventDefault();
      const conf = f.querySelector('.confirmation');
      const showConfirm = () => { if (conf) { conf.style.display = 'block'; const ff = f.querySelector('.form-fields'); if (ff) ff.style.display = 'none'; } };
      const showError = () => {
        let er = f.querySelector('.form-error');
        if (!er) { er = document.createElement('p'); er.className = 'form-error'; er.setAttribute('role', 'alert'); er.style.cssText = 'margin-top:14px;color:var(--jx-coral-600,#B04722);font-weight:600'; f.appendChild(er); }
        er.textContent = 'Something went wrong sending your request. Please try again, or email hello@justicex.ai.';
      };
      const body = new URLSearchParams(new FormData(f)).toString();
      const btn = f.querySelector('[type="submit"]');
      if (btn) { btn.disabled = true; btn.dataset.busy = '1'; }               // prevent double-submit
      const ctl = new AbortController();
      const to = setTimeout(() => ctl.abort(), 15000);                        // don't spin forever on a hung POST
      fetch('/', { method: 'POST', headers: { 'Content-Type': 'application/x-www-form-urlencoded' }, body: body, signal: ctl.signal })
        .then(res => { (res && res.ok) ? showConfirm() : showError(); })
        .catch(showError)                                                     // network failure / timeout surfaces an error, not a false success
        .finally(() => { clearTimeout(to); if (btn) { btn.disabled = false; delete btn.dataset.busy; } });
    });
  });

  // Dispute catalog filter
  const cat = document.getElementById('disputeCatalog');
  if (cat) {
    const filters = cat.querySelectorAll('[data-filter]');
    const rows = cat.querySelectorAll('tbody tr');
    filters.forEach(f => {
      f.addEventListener('click', () => {
        filters.forEach(x => x.classList.remove('active'));
        f.classList.add('active');
        const v = f.getAttribute('data-filter');
        rows.forEach(r => {
          r.style.display = (v === 'all' || r.getAttribute('data-phase') === v) ? '' : 'none';
        });
      });
    });
  }
})();

// ============================================================
// Framework video — first-visit splash + click-to-replay
// ============================================================
(function () {
  var VIDEO_SRC = 'assets/framework-video.mp4';

  // Build the modal once and attach it to the page.
  var modal = document.createElement('div');
  modal.className = 'jx-vmodal';
  modal.id = 'jxVideoModal';
  modal.setAttribute('aria-hidden', 'true');
  modal.setAttribute('role', 'dialog');
  modal.setAttribute('aria-modal', 'true');
  modal.setAttribute('aria-label', 'JusticeX Framework video');
  modal.innerHTML =
    '<div class="jx-vmodal-backdrop" data-vclose></div>' +
    '<div class="jx-vmodal-frame">' +
      '<button class="jx-vmodal-close" data-vclose aria-label="Close video">&times;</button>' +
      '<video id="jxVideoPlayer" class="jx-vmodal-video" controls playsinline preload="metadata">' +
        '<source src="' + VIDEO_SRC + '" type="video/mp4">' +
        'Your browser does not support embedded video.' +
      '</video>' +
    '</div>';
  document.body.appendChild(modal);

  var player = modal.querySelector('#jxVideoPlayer');

  function openModal(opts) {
    opts = opts || {};
    var src = opts.src || VIDEO_SRC;
    if (player.getAttribute('src') !== src) { player.setAttribute('src', src); try { player.load(); } catch (e) {} }
    modal.classList.add('open');
    modal.classList.toggle('jx-vmodal--full', !!opts.full);
    modal.setAttribute('aria-hidden', 'false');
    document.body.classList.add('jx-vmodal-lock');
    try { player.currentTime = 0; } catch (e) {}
    player.muted = !!opts.muted;
    var p = player.play();
    if (p && p.catch) {
      p.catch(function () {
        // Autoplay with sound was blocked — retry muted so the video still plays.
        player.muted = true;
        player.play().catch(function () {});
      });
    }
  }

  function closeModal() {
    modal.classList.remove('open');
    modal.setAttribute('aria-hidden', 'true');
    document.body.classList.remove('jx-vmodal-lock');
    try { player.pause(); } catch (e) {}
  }

  modal.querySelectorAll('[data-vclose]').forEach(function (el) {
    el.addEventListener('click', closeModal);
  });
  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape' && modal.classList.contains('open')) closeModal();
  });

  // Auto-close the splash/video screen once playback finishes.
  player.addEventListener('ended', closeModal);

  // Entry splash fully removed (2026-07-01) — no blocking interstitial. The framework
  // video is available via the in-hero play button (#frameworkVideoTrigger) below.

  // Return visits: clicking the framework image on Home replays the video.
  // This is a user gesture, so it can play with sound.
  // Wire every video trigger on the page: the hero one (#frameworkVideoTrigger) and any
  // number of .jx-vtrigger buttons (e.g. an overview media hub). Each plays its own
  // data-vsrc if set, else the default Framework clip — so multiple videos can coexist.
  document.querySelectorAll('#frameworkVideoTrigger, .jx-vtrigger').forEach(function (trigger) {
    trigger.addEventListener('click', function () {
      openModal({ muted: false, full: true, src: trigger.getAttribute('data-vsrc') || VIDEO_SRC });
    });
  });
})();
