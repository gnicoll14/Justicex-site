/* ===== JX help system engine — accessible popovers (WCAG 1.4.13), media hub, drawer, checklist ===== */
(function(){
  // ---- content dictionary: what it is / how it helps / where the number comes from ----
  var H = {
    attainment:{t:"Attainment vs target",b:"<p><span class='lead-lbl'>What:</span> the revenue you’ve closed-won this year as a share of your annual target.</p><p><span class='lead-lbl'>How it helps:</span> tells you at a glance whether you’re on pace — green means ahead, amber means behind where you’d expect to be this far into the year.</p>",s:"From: your Won deals in the tracker ÷ your quota."},
    coverage:{t:"Pipeline coverage",b:"<p><span class='lead-lbl'>What:</span> your open, weighted pipeline divided by your remaining target — shown as a multiple (e.g. 3.0x).</p><p><span class='lead-lbl'>How it helps:</span> 3x is the healthy default. Below it, you likely don’t have enough live deals to hit target and should open more doors.</p>",s:"From: open weighted pipeline ÷ (target − won)."},
    forecast:{t:"Forecast",b:"<p><span class='lead-lbl'>What:</span> won revenue plus your weighted open pipeline — your single best estimate of where you’ll land.</p><p><span class='lead-lbl'>How it helps:</span> compare it to your target to see the gap you still need to close.</p>",s:"From: won + Σ(deal value × stage probability)."},
    weighted:{t:"Weighted value",b:"<p><span class='lead-lbl'>What:</span> each deal’s annual value multiplied by its stage’s probability of closing.</p><p><span class='lead-lbl'>How it helps:</span> a $10,000 deal at 30% (Qualified) counts as $3,000 — so your pipeline reflects reality, not wishful totals.</p>",s:"From: deal value × the stage probability in your funnel."},
    commission:{t:"Your commission",b:"<p><span class='lead-lbl'>What:</span> your share of the sale — the deal’s value times your commission rate.</p><p><span class='lead-lbl'>How it helps:</span> shows what each deal is worth to you personally, weighted the same way your pipeline is.</p>",s:"Illustrative for planning — not an offer of compensation; terms are confirmed with JusticeX."},
    oneonone:{t:"Your 1:1 talking points",b:"<p><span class='lead-lbl'>What:</span> talking points auto-drafted from your live numbers for your manager check-in.</p><p><span class='lead-lbl'>How it helps:</span> walk in with attainment, coverage, forecast and your asks already framed — no prep.</p>",s:"From: your own dashboard figures, generated on this page."},
    funnel:{t:"Your pipeline funnel",b:"<p><span class='lead-lbl'>What:</span> your deals grouped by stage, from first Connected through Won.</p><p><span class='lead-lbl'>How it helps:</span> spot where deals bunch up or stall so you know what to work next.</p>",s:"From: the stage on each of your deals in the tracker."},
    activity:{t:"Activity vs target",b:"<p><span class='lead-lbl'>What:</span> your leading actions this week (touches, conversations, offers) against a weekly goal.</p><p><span class='lead-lbl'>How it helps:</span> activity is the one thing you fully control — hit these and the pipeline follows.</p>",s:"From: activity you log this week vs the weekly target."},
    ltforecast:{t:"Long-term forecast",b:"<p><span class='lead-lbl'>What:</span> a projection of sales and commission over the coming periods at your current pace.</p><p><span class='lead-lbl'>How it helps:</span> see the trajectory, not just this quarter, so you can plan.</p>",s:"From: your weighted pipeline and close pace, projected forward. Illustrative."},
    tier:{t:"Tiering",b:"<p><span class='lead-lbl'>What:</span> Tier 1 = senior contacts with strong fit for JusticeX — call these first. Tier 2/3 are warmer-later.</p><p><span class='lead-lbl'>How it helps:</span> tells you who to spend your first hours on.</p>",s:"From: title seniority + fit, scored on your device from your own file."},
    comm_rate:{t:"Your commission rate",b:"<p><span class='lead-lbl'>What:</span> the share of each sale you keep. Slide it to model different arrangements.</p>",s:"Illustrative — your actual rate is set in your partner terms."},
    accounts:{t:"Accounts you open",b:"<p><span class='lead-lbl'>What:</span> how many new accounts you start working in a year.</p><p><span class='lead-lbl'>How it helps:</span> the biggest lever on your income — more warm accounts, more deals.</p>",s:"Your assumption — move the slider."},
    dpa:{t:"Deals per account",b:"<p><span class='lead-lbl'>What:</span> how many separate deals you close within one account (e.g. multiple matters or seats).</p>",s:"Your assumption — move the slider."},
    dealval:{t:"Value per deal",b:"<p><span class='lead-lbl'>What:</span> the annual JusticeX value of one deal. An employer funding the benefit company-wide is far larger than a single mediator seat.</p>",s:"From: JusticeX draft pricing — illustrative, validate before quoting."},
    privacy:{t:"Where your contacts live",b:"<p><span class='lead-lbl'>What:</span> your LinkedIn file is read and scored entirely in your browser, on your device.</p><p><span class='lead-lbl'>How it helps:</span> nothing is uploaded. A contact becomes visible to JusticeX only when <b>you</b> move that one person into a real pipeline opportunity. Everyone you don’t pursue stays yours alone — close the tab and the file is gone.</p>",s:"Enforced client-side: no contact data leaves this page."},
    pipeline_shared:{t:"What your manager sees",b:"<p><span class='lead-lbl'>What:</span> deals you add to your pipeline are visible to your JusticeX manager for forecasting and account credit.</p><p><span class='lead-lbl'>How it helps:</span> it’s how you get credit and support. Your un-pursued network is never shared — only deals you choose to pursue.</p>",s:"From: contacts you move into the pipeline. Never other partners."}
  };

  // ---- single floating popover ----
  var pop=document.createElement('div');
  pop.className='jxh-pop';pop.setAttribute('role','tooltip');pop.id='jxhPop';pop.hidden=true;
  document.body.appendChild(pop);
  var cur=null, hideT=null, overPop=false;

  function fill(key){
    var d=H[key]; if(!d){return false;}
    pop.innerHTML='<h5>'+d.t+'</h5>'+d.b+(d.s?'<span class="src">'+d.s+'</span>':'');
    return true;
  }
  function place(trig){
    pop.hidden=false;
    var r=trig.getBoundingClientRect(), pr=pop.getBoundingClientRect();
    var sx=window.scrollX||window.pageXOffset, sy=window.scrollY||window.pageYOffset;
    var left=r.left+sx+r.width/2-24;
    var maxL=sx+document.documentElement.clientWidth-pr.width-10;
    if(left>maxL)left=maxL; if(left<sx+8)left=sx+8;
    var below=r.bottom+sy+10, above=r.top+sy-pr.height-10;
    var useBelow = (r.bottom+pr.height+16) < document.documentElement.clientHeight || r.top < pr.height+16;
    pop.style.left=left+'px';
    pop.style.top=(useBelow?below:above)+'px';
    pop.classList.toggle('below',useBelow);pop.classList.toggle('above',!useBelow);
    var ax=(r.left+sx+r.width/2)-left-5; pop.style.setProperty('--ax',Math.max(10,Math.min(pr.width-20,ax))+'px');
  }
  function show(trig){
    clearTimeout(hideT);
    if(!fill(trig.getAttribute('data-h')))return;
    cur=trig; place(trig); trig.setAttribute('aria-expanded','true');
  }
  function hide(){
    clearTimeout(hideT);
    pop.hidden=true; overPop=false;
    if(cur){cur.setAttribute('aria-expanded','false');cur=null;}
  }
  function softHide(){ // delayed so the pointer can travel to the popover (hoverable)
    clearTimeout(hideT);
    hideT=setTimeout(function(){ if(!overPop)hide(); },180);
  }
  pop.addEventListener('mouseenter',function(){overPop=true;clearTimeout(hideT);});
  pop.addEventListener('mouseleave',function(){overPop=false;softHide();});

  function wire(t){
    t.setAttribute('aria-describedby','jxhPop');
    t.setAttribute('aria-expanded','false');
    if(!t.getAttribute('aria-label'))t.setAttribute('aria-label','More information');
    t.addEventListener('mouseenter',function(){show(t);});
    t.addEventListener('mouseleave',softHide);
    t.addEventListener('focus',function(){show(t);});
    t.addEventListener('blur',function(){softHide();});
    // click always shows (focus may have opened it already; a toggle would race and net-hide)
    t.addEventListener('click',function(e){e.preventDefault();e.stopPropagation();show(t);});
  }
  function scan(root){(root||document).querySelectorAll('.jxh:not([data-wired])').forEach(function(t){t.setAttribute('data-wired','1');wire(t);});}
  document.addEventListener('keydown',function(e){if(e.key==='Escape'&&!pop.hidden){var c=cur;hide();if(c)c.focus();}});
  document.addEventListener('click',function(e){if(!pop.hidden&&e.target!==pop&&!pop.contains(e.target)&&!(cur&&cur.contains(e.target)))hide();});
  window.addEventListener('scroll',function(){if(cur)place(cur);},true);
  window.jxHelpScan=scan; scan();

  // ---- media hub: video modal, audio reveal, pending toast ----
  function toast(msg){
    var el=document.getElementById('jxToast');
    if(!el){el=document.createElement('div');el.id='jxToast';el.className='jx-toast';document.body.appendChild(el);}
    el.textContent=msg; el.classList.add('show');
    clearTimeout(el._t); el._t=setTimeout(function(){el.classList.remove('show');},4200);
  }
  window.jxToast=toast;
  // video modal
  var vm=document.getElementById('jxVModal');
  function openVideo(src,pending){
    if(!vm){vm=document.createElement('div');vm.id='jxVModal';vm.className='jx-vmodal';
      vm.innerHTML='<div class="box"><button class="x" aria-label="Close">×</button><div class="vslot"></div></div>';
      document.body.appendChild(vm);
      vm.addEventListener('click',function(e){if(e.target===vm||e.target.classList.contains('x'))closeVideo();});
    }
    var slot=vm.querySelector('.vslot');
    if(pending){slot.innerHTML='<div class="ph"><div class="ic">🎬</div><h4>Overview video is being produced</h4><p>A short, brand-approved walkthrough is generating. It appears here the moment it’s published.</p></div>';}
    else{slot.innerHTML='<video controls autoplay playsinline src="'+src+'"></video>';}
    vm.classList.add('open');
  }
  function closeVideo(){if(vm){vm.classList.remove('open');var v=vm.querySelector('video');if(v){v.pause();}vm.querySelector('.vslot').innerHTML='';}}
  window.jxCloseVideo=closeVideo;
  document.addEventListener('keydown',function(e){if(e.key==='Escape'&&vm&&vm.classList.contains('open'))closeVideo();});

  document.querySelectorAll('.jx-media').forEach(function(hub){
    var pending=hub.getAttribute('data-pending')==='1';
    var w=hub.querySelector('.jx-media-watch'), h=hub.querySelector('.jx-media-hear'), s=hub.querySelector('.jx-media-see');
    var wrap=hub.querySelector('.jx-media-audiowrap'), au=hub.querySelector('audio');
    if(w)w.addEventListener('click',function(e){e.preventDefault();openVideo(w.getAttribute('data-vsrc'),pending);});
    if(h)h.addEventListener('click',function(e){e.preventDefault();
      if(pending){toast("Audio overview is being produced — it activates when published.");return;}
      if(wrap){if(wrap.hidden){wrap.hidden=false;if(au)au.play().catch(function(){});}else if(au&&au.paused){au.play().catch(function(){});}else if(au){au.pause();}}});
    if(s)s.addEventListener('click',function(e){if(pending){e.preventDefault();toast("The overview deck is being produced — it activates when published.");}});
  });

  // ---- help drawer ----
  var scrim=document.getElementById('jxDrawerScrim'), drawer=document.getElementById('jxDrawer');
  function openDrawer(){if(scrim)scrim.classList.add('open');if(drawer){drawer.classList.add('open');var x=drawer.querySelector('.x');if(x)x.focus();}}
  function closeDrawer(){if(scrim)scrim.classList.remove('open');if(drawer)drawer.classList.remove('open');}
  window.jxOpenDrawer=openDrawer;
  document.querySelectorAll('[data-help-open]').forEach(function(b){b.addEventListener('click',openDrawer);});
  if(drawer){var xb=drawer.querySelector('.x');if(xb)xb.addEventListener('click',closeDrawer);}
  if(scrim)scrim.addEventListener('click',closeDrawer);
  document.addEventListener('keydown',function(e){if(e.key==='Escape'&&drawer&&drawer.classList.contains('open'))closeDrawer();});

  // ---- journey progress (in-memory only) — works for .jx-flow chevrons or .jx-check cards ----
  var CKSEL='.jx-flow .fl,.jx-check .ck';
  var journeyReopened=false;
  function renderProgress(){
    var items=document.querySelectorAll(CKSEL);
    if(!items.length)return;
    var done=0; items.forEach(function(c){if(c.classList.contains('done'))done++;});
    var pct=Math.round(done/items.length*100);
    var f=document.querySelector('.jx-progress .fill'), l=document.querySelector('.jx-progress .lbl');
    if(f)f.style.width=pct+'%';
    if(l)l.textContent=done+' of '+items.length+' done';
    // once all steps have been visited, collapse the walkthrough so it stops duplicating the rail
    var full=document.getElementById('jxJourneyFull'), doneBox=document.getElementById('jxJourneyDone');
    if(full&&doneBox){
      var allDone=done>=items.length && !journeyReopened;
      full.hidden=allDone; doneBox.hidden=!allDone;
    }
  }
  window.jxJourneyReset=function(){journeyReopened=true;var full=document.getElementById('jxJourneyFull'),doneBox=document.getElementById('jxJourneyDone');if(full)full.hidden=false;if(doneBox)doneBox.hidden=true;};
  window.jxCheckDone=function(id){var el=document.querySelector('.jx-flow .fl[data-ck="'+id+'"],.jx-check .ck[data-ck="'+id+'"]');if(el&&!el.classList.contains('done')){el.classList.add('done');renderProgress();}};
  renderProgress();
})();
