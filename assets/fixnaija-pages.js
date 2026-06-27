/* FixNaija shared page behavior: mobile menu, scroll reveal, count-up */
(function(){
  // Mobile menu toggle
  var t = document.getElementById('menuToggle');
  var m = document.getElementById('mobileMenu');
  if(t && m){ t.addEventListener('click', function(){
    m.classList.toggle('open');
    var open = m.classList.contains('open');
    t.setAttribute('aria-expanded', open);
  });
  m.querySelectorAll('a').forEach(function(a){ a.addEventListener('click', function(){ m.classList.remove('open'); }); });
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
