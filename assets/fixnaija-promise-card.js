/* FixNaija · "Share this promise" cards
   Draws a 1080×1350 share image on the visitor's device (nothing is uploaded)
   and offers Share / Download / WhatsApp.  Usage: FXPromise.open({...})        */
(function(){
  var W=1080,H=1350, HAIR=String.fromCharCode(8202);
  var css='.pc-modal{position:fixed;inset:0;z-index:2000;display:flex;align-items:center;justify-content:center;padding:16px;background:rgba(9,14,11,.72);backdrop-filter:blur(3px)}'+
    '.pc-modal[hidden]{display:none}'+
    '.pc-box{position:relative;background:#fff;border-radius:14px;max-width:880px;width:100%;max-height:calc(100vh - 32px);overflow:auto;display:grid;grid-template-columns:minmax(0,1fr) minmax(0,1fr);gap:26px;padding:26px;box-shadow:0 30px 80px -20px rgba(0,0,0,.5)}'+
    '@media(max-width:720px){.pc-box{grid-template-columns:1fr;gap:16px;padding:18px}}'+
    '.pc-prev{position:relative;background:#f3f1ea;border-radius:10px;aspect-ratio:4/5;display:flex;align-items:center;justify-content:center;overflow:hidden}'+
    '@media(max-width:720px){.pc-prev{max-height:52vh;aspect-ratio:auto;height:52vh}}'+
    '.pc-prev img{width:100%;height:100%;object-fit:contain;display:block}'+
    '.pc-prev img[hidden],.pc-prev .ld[hidden]{display:none}'+
    '.pc-prev .ld{font-family:var(--display,sans-serif);font-weight:700;color:#6b746c;font-size:.9rem}'+
    '.pc-txt{display:flex;flex-direction:column;justify-content:center;gap:12px}'+
    '.pc-txt h3{font-family:var(--display,sans-serif);font-weight:800;font-size:1.5rem;letter-spacing:-.03em;color:#0d140f;line-height:1.1;margin:0}'+
    '.pc-txt p{color:#4d564e;font-size:.95rem;line-height:1.6;margin:0}'+
    '.pc-btns{display:grid;gap:10px;margin-top:6px}'+
    '.pc-btns button,.pc-btns a{display:flex;align-items:center;justify-content:center;gap:8px;min-height:50px;border-radius:8px;font-family:var(--display,sans-serif);font-weight:700;font-size:.95rem;text-decoration:none;cursor:pointer;border:1px solid transparent;transition:filter .2s,border-color .2s}'+
    '.pc-go{background:#00663a;color:#fff}.pc-go:hover{filter:brightness(1.1)}'+
    '.pc-wa{background:#25d366;color:#08331a}.pc-wa:hover{filter:brightness(1.05)}'+
    '.pc-dl{background:#fff;color:#0d140f;border-color:#d8d4c8!important}.pc-dl:hover{border-color:#0d140f!important}'+
    '.pc-hint{display:none;font-size:.85rem;color:#00663a;font-weight:600}'+
    '.pc-x{position:absolute;top:10px;right:10px;width:38px;height:38px;border-radius:50%;border:none;background:#f3f1ea;color:#0d140f;font-size:1.4rem;line-height:1;cursor:pointer;z-index:2}'+
    '.pc-x:hover{background:#e8e5dc}';
  var st=document.createElement('style');st.textContent=css;document.head.appendChild(st);

  /* Noto Sans fills in letters the brand fonts lack (Hausa ƙ ɗ ɓ) when the page loads it */
  var FD=' Archivo, "Noto Sans", sans-serif', FT=' Poppins, "Noto Sans", sans-serif';
  var load=function(src){return new Promise(function(ok,no){var i=new Image();i.onload=function(){ok(i);};i.onerror=no;i.src=src;});};
  var imgs=null;
  function spaced(t){return (String(t).normalize('NFC').match(/[^\u0300-\u036f][\u0300-\u036f]*/g)||[]).join(HAIR);}  /* keeps accents (Yorùbá, Igbo) on their letters */
  function fit(x,text,font,size,max,min){var s=size;do{x.font=font.replace('{s}',s);if(x.measureText(text).width<=max)break;s-=4;}while(s>(min||20));return s;}
  function lines(x,text,max){var w=String(text).split(' '),out=[],ln='';for(var i=0;i<w.length;i++){var t=ln?ln+' '+w[i]:w[i];if(x.measureText(t).width>max&&ln){out.push(ln);ln=w[i];}else ln=t;}if(ln)out.push(ln);return out;}

  async function draw(o){
    if(!imgs){imgs=await Promise.all(['images/logo.png','images/hero-ticket.webp','images/sdp-mark.png'].map(load));}
    var smp=[o.n,o.unit,o.label,o.source,o.eyebrow,o.ticketRole,o.ticket,o.date,o.cta,o.linkText,o.tagline,'FixNaija Movement ADEBAYO · BUGAJE'].filter(Boolean).join(' ');smp+=' '+smp.toUpperCase();
    try{await Promise.all(['800 120px'+FD,'700 30px'+FD,'400 36px'+FT,'600 36px'+FT].map(function(f){return document.fonts.load(f,smp);}));}catch(_){}  /* load the letter sets this card needs */
    var logo=imgs[0],pair=imgs[1],sdp=imgs[2];
    var c=document.createElement('canvas');c.width=W;c.height=H;var x=c.getContext('2d');x.textBaseline='alphabetic';
    /* paper + tints + flag line */
    x.fillStyle='#f8f6f0';x.fillRect(0,0,W,H);
    var g=x.createRadialGradient(W*.92,H*.02,0,W*.92,H*.02,W*.8);g.addColorStop(0,'#ffe9d6');g.addColorStop(1,'rgba(255,233,214,0)');x.fillStyle=g;x.fillRect(0,0,W,H);
    g=x.createRadialGradient(0,H*.78,0,0,H*.78,W*.7);g.addColorStop(0,'#dcefe3');g.addColorStop(1,'rgba(220,239,227,0)');x.fillStyle=g;x.fillRect(0,0,W,H);
    x.fillStyle='#00663a';x.fillRect(0,0,W*.34,12);x.fillStyle='#e8e5dc';x.fillRect(W*.34,0,W*.32,12);x.fillStyle='#f26a1b';x.fillRect(W*.66,0,W*.34,12);
    /* brand row */
    x.save();x.shadowColor='rgba(13,20,15,.25)';x.shadowBlur=18;x.shadowOffsetY=6;x.fillStyle='#fff';x.beginPath();x.arc(135,135,62,0,Math.PI*2);x.fill();x.restore();
    x.save();x.beginPath();x.arc(135,135,55,0,Math.PI*2);x.clip();x.drawImage(logo,80,80,110,110);x.restore();
    x.fillStyle='#0d140f';x.font='800 46px'+FD;x.fillText('FixNaija Movement',222,128);
    x.fillStyle='#00a651';x.beginPath();x.arc(229,160,7,0,Math.PI*2);x.fill();
    x.fillStyle='#00663a';x.font='700 24px'+FD;x.fillText(spaced('ADEBAYO · BUGAJE · 2027'),246,169);
    var sh=64,sw=sdp.width*sh/sdp.height;x.drawImage(sdp,W-80-sw,103,sw,sh);
    /* eyebrow */
    x.fillStyle='#00663a';x.fillRect(80,292,30,6);x.fillStyle='#f26a1b';x.fillRect(122,292,30,6);
    x.fillStyle='#00663a';x.font='700 26px'+FD;x.fillText(spaced(String(o.eyebrow||'THE 2027–2031 BLUEPRINT').toUpperCase()),172,302);
    /* the big number + unit */
    var unit=o.unit?(' '+o.unit):'';
    x.font='800 230px'+FD;var nW=x.measureText(o.n).width;x.font='800 96px'+FD;var uW=unit?x.measureText(unit).width:0;
    var scale=Math.min(1,(W-160)/(nW+uW));var ns=Math.floor(230*scale),us=Math.floor(96*scale);
    x.fillStyle=o.color==='orange'?'#d9530b':'#00663a';x.font='800 '+ns+'px'+FD;x.fillText(o.n,72,300+ns*0.92);
    if(unit){x.fillStyle='#0d140f';x.font='800 '+us+'px'+FD;x.fillText(unit,72+nW*scale,300+ns*0.92);}
    /* label */
    var y=300+ns*0.92+86;x.fillStyle='#0d140f';x.font='700 50px'+FD;
    var L=lines(x,o.label,W-160);if(L.length>4){x.font='700 42px'+FD;L=lines(x,o.label,W-160);}
    var lh=L.length>4?54:62;for(var i=0;i<L.length;i++){x.fillText(L[i],80,y+i*lh);}
    y+= (L.length-1)*lh+56;
    if(o.source){x.fillStyle='#6b746c';x.font='400 28px'+FT;x.fillText(o.source,80,y);y+=20;}
    /* the ticket, bottom right */
    var top=Math.max(y+30,720),ph=1110-top;
    if(ph>=240){var pw=pair.width*ph/pair.height;x.drawImage(pair,W-pw+10,top,pw,ph);}
    x.fillStyle='#0d140f';x.fillRect(80,1000,52,5);
    x.fillStyle='#00663a';x.font='700 22px'+FD;x.fillText(spaced(String(o.ticketRole||'SDP · PRESIDENT & VICE PRESIDENT').toUpperCase()),80,1040);
    x.fillStyle='#0d140f';x.font='800 40px'+FD;x.fillText(o.ticket||'Adebayo – Bugaje 2027',80,1086);
    /* bottom band */
    x.fillStyle='#063d25';x.fillRect(0,1110,W,H-1110);
    x.fillStyle='#7fe0ae';x.font='700 26px'+FD;x.fillText(spaced(String(o.date||'SATURDAY · 16 JANUARY 2027').toUpperCase()),80,1180);
    var foot=(o.cta||'Read the plan →')+' '+(o.linkText||'fixnaijamovement.com.ng/blueprint');
    x.fillStyle='#ffffff';var fs=fit(x,foot,'800 {s}px'+FD,48,W-160,26);x.font='800 '+fs+'px'+FD;x.fillText(foot,80,1250);
    x.fillStyle='rgba(255,255,255,.72)';x.font='400 26px'+FT;x.fillText(o.tagline||'Security · Productivity · Prosperity',80,1298);
    x.fillStyle='#00a651';x.fillRect(0,H-10,W/2,10);x.fillStyle='#f26a1b';x.fillRect(W/2,H-10,W/2,10);
    return await new Promise(function(r){c.toBlob(r,'image/png');});
  }

  var modal=null,blob=null,url=null,cur=null,lastFocus=null;
  function build(){
    modal=document.createElement('div');modal.className='pc-modal';modal.hidden=true;
    modal.setAttribute('role','dialog');modal.setAttribute('aria-modal','true');modal.setAttribute('aria-labelledby','pcTitle');
    modal.innerHTML='<div class="pc-box"><button type="button" class="pc-x" id="pcX" aria-label="Close">×</button>'+
      '<div class="pc-prev"><span class="ld" id="pcLd"></span><img id="pcImg" alt="" hidden></div>'+
      '<div class="pc-txt"><h3 id="pcTitle"></h3><p id="pcSub"></p><div class="pc-btns">'+
      '<button type="button" class="pc-go" id="pcShare"></button>'+
      '<a class="pc-wa" id="pcWa" target="_blank" rel="noopener" href="#"></a>'+
      '<a class="pc-dl" id="pcDl" href="#" download="fixnaija-promise.png"></a></div><div class="pc-hint" id="pcHint"></div></div></div>';
    document.body.appendChild(modal);
    modal.addEventListener('click',function(e){if(e.target===modal)close();});
    document.getElementById('pcX').addEventListener('click',close);
    document.addEventListener('keydown',function(e){if(!modal.hidden&&e.key==='Escape')close();});
    document.getElementById('pcDl').addEventListener('click',function(){document.getElementById('pcHint').style.display='block';});
    document.getElementById('pcShare').addEventListener('click',async function(){
      if(!blob)return;
      var file=new File([blob],cur.file||'fixnaija-promise.png',{type:'image/png'});
      if(navigator.canShare&&navigator.canShare({files:[file]})){
        try{await navigator.share({files:[file],text:cur.wa,title:cur.title||'FixNaija'});return;}catch(e){if(e&&e.name==='AbortError')return;}
      }
      document.getElementById('pcDl').click();
    });
  }
  function close(){modal.hidden=true;document.documentElement.style.overflow='';if(lastFocus)try{lastFocus.focus();}catch(_){}}
  async function open(o){
    if(!modal)build();cur=o;lastFocus=document.activeElement;
    var ui=o.ui||{};
    document.getElementById('pcTitle').textContent=ui.title||'Share this promise';
    document.getElementById('pcSub').textContent=ui.sub||'Post it on WhatsApp Status, Facebook or Instagram — every share takes the plan further.';
    document.getElementById('pcShare').textContent=ui.share||'Share image';
    document.getElementById('pcWa').textContent=ui.whatsapp||'Send the link on WhatsApp';
    document.getElementById('pcDl').textContent=ui.download||'Download image';
    document.getElementById('pcHint').textContent=ui.hint||'Saved to your downloads — attach it in WhatsApp or your Status.';
    document.getElementById('pcHint').style.display='none';
    document.getElementById('pcX').setAttribute('aria-label',ui.close||'Close');
    document.getElementById('pcWa').href='https://wa.me/?text='+encodeURIComponent(o.wa||'');
    var img=document.getElementById('pcImg'),ld=document.getElementById('pcLd');
    img.hidden=true;ld.hidden=false;ld.textContent=ui.making||'Making your card…';img.alt=o.alt||o.label||'';
    document.getElementById('pcDl').setAttribute('download',o.file||'fixnaija-promise.png');
    modal.hidden=false;document.documentElement.style.overflow='hidden';document.getElementById('pcX').focus();
    try{blob=await draw(o);}catch(e){console.warn('[FixNaija promise card]',e);ld.textContent=ui.failed||'Sorry, the image could not be made on this device. You can still send the link on WhatsApp.';return;}
    if(url)URL.revokeObjectURL(url);url=URL.createObjectURL(blob);
    img.src=url;img.hidden=false;ld.hidden=true;document.getElementById('pcDl').href=url;
  }
  window.FXPromise={open:open,draw:draw};
})();
