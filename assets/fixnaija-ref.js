/* FixNaija · coordinator referral links
   A link like  register.html?ref=ada-482  (or any page ?ref=…) remembers the
   coordinator's code on this device for 30 days, so the registration can be
   credited to them.  Only the short code is stored — nothing personal.        */
(function(){
  var KEY='fx_ref', DAYS=30, RE=/^[a-z0-9-]{3,24}$/;
  try{
    var p=new URLSearchParams(location.search).get('ref');
    if(p){ p=p.trim().toLowerCase(); if(RE.test(p)) localStorage.setItem(KEY,JSON.stringify({c:p,t:Date.now()})); }
  }catch(_){}
  window.fxGetRef=function(){
    try{
      var o=JSON.parse(localStorage.getItem(KEY)||'null');
      if(!o||!RE.test(o.c)) return null;
      if(Date.now()-o.t>DAYS*864e5){ localStorage.removeItem(KEY); return null; }
      return o.c;
    }catch(_){ return null; }
  };
})();
