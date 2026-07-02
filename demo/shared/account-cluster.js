/* JusticeX Console — shared signed-in account cluster (extracted from 18 demo pages, 2026-07-01).
   Byte-identical logic across all pages at extraction; edit here, not per page.
   Security fix vs the inline original: the stored profile photo is validated as a data:image/* URL
   and applied via element.style (DOM), never interpolated into innerHTML. */
(function(){
 if(window.__jxac) return; window.__jxac=1;
 function init(){
  var bar=document.querySelector('.appbar'); if(!bar) return;
  if(getComputedStyle(bar).position==='static') bar.style.position='relative';
  var photo=localStorage.getItem('jx_photo_me');
  var photoOk=!!photo && /^data:image\//.test(photo);   // only same-origin FileReader data URLs; blocks any script/other scheme
  // Whitfield synthetic matter: the three people on it. Photos render when shared; initials until then.
  var P=[
   {init:'DW',name:'Dana Whitfield',role:'You',cls:'me',avcls:'',dcls:''},
   {init:'MC',name:'Maren Cardillo',role:'Mediator',cls:'',avcls:'med',dcls:'med'},
   {init:'JO',name:'Jordan Okonkwo',role:'Attorney',cls:'',avcls:'att',dcls:'att'}
  ];
  var stack=P.map(function(p){
    var showPhoto=(p.cls==='me' && photoOk);
    return '<button class="pav '+p.cls+'" title="" onclick="location.href=\'account.html\'">'
      +'<span class="av '+p.avcls+'"'+(showPhoto?' data-me-photo="1"':'')+'>'+(showPhoto?'':p.init)+'</span>'
      +'<span class="tip">'+p.name+' · '+p.role+' — manage</span></button>';
  }).join('');
  var el=document.createElement('div'); el.className='jxac';
  el.innerHTML='<span class="lbl">Signed in</span><div class="stack">'+stack+'</div>'
    +'<button class="chev" aria-label="Account menu" onclick="var m=document.getElementById(\'jxacmenu\');m.classList.toggle(\'show\');event.stopPropagation();"><i class="ti ti-chevron-down"></i></button>';
  bar.appendChild(el);
  // Apply the validated photo via DOM (not innerHTML) — the XSS-safe path.
  if(photoOk){ var meAv=el.querySelector('.pav.me .av[data-me-photo]'); if(meAv){ meAv.style.backgroundImage='url("'+photo.replace(/["\\]/g,'')+'")'; } }
  var minis=P.map(function(p){
    return '<a class="mini" href="account.html"><span class="d '+p.dcls+'">'+p.init+'</span><span>'+p.name+'<small>'+p.role+(p.cls==='me'?' · Individual':'')+'</small></span></a>';
  }).join('');
  var m=document.createElement('div'); m.id='jxacmenu'; m.className='jxacmenu';
  m.innerHTML='<div class="hd"><b>On this matter</b><span>Whitfield — Divorce &amp; custody</span></div>'+minis
    +'<div class="sep"></div>'
    +'<a class="row" href="account.html"><i class="ti ti-user-cog"></i> Account &amp; profile</a>'
    +'<a class="row" href="account.html"><i class="ti ti-users"></i> Manage participants</a>'
    +'<a class="row" href="trust.html"><i class="ti ti-shield-lock"></i> Privacy &amp; security</a>'
    +'<a class="row danger" href="index.html"><i class="ti ti-logout"></i> Log out</a>';
  document.body.appendChild(m);
  document.addEventListener('click',function(){m.classList.remove('show');});
 }
 if(document.readyState==='loading') document.addEventListener('DOMContentLoaded',init); else init();
})();
