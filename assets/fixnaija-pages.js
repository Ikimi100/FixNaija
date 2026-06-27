/* FixNaija shared page behavior: mobile menu, scroll reveal, count-up */
(function(){
  // Mobile drawer menu (scrim + close button)
  var t = document.getElementById('menuToggle');
  var m = document.getElementById('mobileMenu');
  if(t && m){
    var scrim = document.createElement('div'); scrim.className = 'mm-scrim'; document.body.appendChild(scrim);
    function openM(){ m.classList.add('open'); scrim.classList.add('open'); t.setAttribute('aria-expanded','true'); document.body.style.overflow='hidden'; }
    function closeM(){ m.classList.remove('open'); scrim.classList.remove('open'); t.setAttribute('aria-expanded','false'); document.body.style.overflow=''; }
    t.addEventListener('click', function(){ m.classList.contains('open') ? closeM() : openM(); });
    scrim.addEventListener('click', closeM);
    var x = document.getElementById('menuClose'); if(x) x.addEventListener('click', closeM);
    m.querySelectorAll('a').forEach(function(a){ a.addEventListener('click', closeM); });
    document.addEventListener('keydown', function(e){ if(e.key==='Escape') closeM(); });
  }

  // Scroll reveal
  if('IntersectionObserver' in window){
    var io = new IntersectionObserver(function(es){
      es.forEach(function(e){ if(e.isIntersecting){ e.target.classList.add('in'); io.unobserve(e.target); } });
    }, {threshold:.12});
    document.querySelectorAll('.reveal').forEach(function(el){ io.observe(el); });

    // Count-up numbers (elements with data-count)
    var cio = new IntersectionObserver(function(es){
      es.forEach(function(e){
        if(!e.isIntersecting) return;
        var el = e.target, target = parseFloat(el.dataset.count), suf = el.dataset.suffix||'', n=0;
        var step = function(){ n += Math.ceil(target/45); if(n>=target){n=target;} else {requestAnimationFrame(step);} el.textContent = n + suf; };
        step(); cio.unobserve(el);
      });
    }, {threshold:.6});
    document.querySelectorAll('[data-count]').forEach(function(el){ cio.observe(el); });
  } else {
    document.querySelectorAll('.reveal').forEach(function(el){ el.classList.add('in'); });
  }
})();
