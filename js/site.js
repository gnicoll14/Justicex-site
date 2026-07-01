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
    const map = { 'mediator-pilot': 'mediator', 'counsel': 'counsel', 'waitlist': 'consumer', 'consumer': 'consumer', 'pilot': 'pilot', 'financial': 'financial', 'cpa': 'financial' };
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
      fetch('/', { method: 'POST', headers: { 'Content-Type': 'application/x-www-form-urlencoded' }, body: body })
        .then(res => { (res && res.ok) ? showConfirm() : showError(); })
        .catch(showError); // genuine network failure surfaces an error rather than a false success
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
  var SEEN_KEY = 'jx_splash_seen';

  // Build the modal once and attach it to the page.
  var modal = document.createElement('div');
  modal.className = 'jx-vmodal';
  modal.id = 'jxVideoModal';
  modal.setAttribute('aria-hidden', 'true');
  modal.setAttribute('role', 'dialog');
  modal.setAttribute('aria-modal', 'true');
  modal.setAttribute('aria-label', 'JusticeX.ai Framework video');
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

  // Show the click-to-enter splash only on the HOME page, once per browser
  // session. Restricting to home means interior nav clicks (Markets, Solutions,
  // etc.) can never re-trigger it. A user click lets the intro video play WITH
  // SOUND (browsers block unmuted autoplay but allow audio after a gesture).
  // sessionStorage makes it appear once per visit and reappear on a new visit.
  var splashPage = (window.location.pathname.split('/').pop() || '').toLowerCase();
  var isHome = (splashPage === '' || splashPage === 'index.html');
  var seen = null;
  try { seen = sessionStorage.getItem(SEEN_KEY); } catch (e) {}
  // Entry splash removed (2026-07-01): no blocking interstitial. The framework
  // video stays one click away via the in-hero play button (#frameworkVideoTrigger).
  void isHome; void seen;

  function showEntryGate() {
    if (!document.getElementById('jxEntryStyle')) {
      var st = document.createElement('style');
      st.id = 'jxEntryStyle';
      st.textContent =
        '#jxEntry{position:fixed;inset:0;z-index:100000;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:28px;background:#101A3B;opacity:0;transition:opacity .4s ease;padding:24px;}' +
        '#jxEntry.in{opacity:1;}#jxEntry.out{opacity:0;}' +
        '#jxEntry img{width:auto;max-height:min(52vh,460px);max-width:min(900px,88vw);display:block;}' +
        '#jxEntry .jx-enter{display:inline-flex;align-items:center;gap:10px;font:600 16px/1 system-ui,-apple-system,Segoe UI,sans-serif;color:#042C53;background:#F0997B;border:0;border-radius:999px;padding:15px 28px;cursor:pointer;transition:background .15s ease,transform .15s ease;box-shadow:0 6px 24px rgba(0,0,0,.25);}' +
        '#jxEntry .jx-enter:hover{background:#F4B097;transform:translateY(-1px);}' +
        '#jxEntry .jx-skip{background:transparent;border:0;cursor:pointer;font:600 12px/1 system-ui,-apple-system,Segoe UI,sans-serif;letter-spacing:.14em;text-transform:uppercase;color:#B6C0D0;padding:6px 10px;opacity:.85;transition:color .15s ease,opacity .15s ease;}' +
        '#jxEntry .jx-skip:hover{color:#F0997B;opacity:1;}';
      document.head.appendChild(st);
    }
    var gate = document.createElement('div');
    gate.id = 'jxEntry';
    gate.setAttribute('role', 'dialog');
    gate.setAttribute('aria-label', 'Welcome to JusticeX.ai');
    gate.innerHTML =
      '<img src="assets/splash-logo.png" alt="JusticeX.ai">' +
      '<button class="jx-enter" type="button">&#9658;&nbsp; Play intro with sound</button>' +
      '<button class="jx-skip" type="button">Skip intro</button>';
    document.body.appendChild(gate);
    requestAnimationFrame(function () { requestAnimationFrame(function () { gate.classList.add('in'); }); });

    function removeGate() {
      gate.classList.add('out');
      setTimeout(function () { if (gate.parentNode) gate.parentNode.removeChild(gate); }, 400);
    }
    var enterBtn = gate.querySelector('.jx-enter');
    enterBtn.addEventListener('click', function () { removeGate(); openModal({ muted: false, full: true }); });
    gate.querySelector('.jx-skip').addEventListener('click', removeGate);
    try { enterBtn.focus(); } catch (e) {}
  }

  // Return visits: clicking the framework image on Home replays the video.
  // This is a user gesture, so it can play with sound.
  var trigger = document.getElementById('frameworkVideoTrigger');
  if (trigger) {
    trigger.addEventListener('click', function () {
      openModal({ muted: false, full: true });
    });
  }
})();
