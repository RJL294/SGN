// live-ish clock in the dateline
(function(){
  var clock=document.getElementById('clock');
  if(!clock) return;
  function tick(){
    var d=new Date();
    var h=d.getHours(),m=d.getMinutes();
    var ap=h>=12?'PM':'AM'; h=h%12; if(h===0)h=12;
    clock.textContent=h+':'+(m<10?'0':'')+m+' '+ap;
  }
  tick(); setInterval(tick,15000);
  var t=document.getElementById('today');
  if(t){ t.textContent=new Date().toLocaleDateString('en-US',{weekday:'long',month:'long',day:'numeric',year:'numeric'}).toUpperCase(); }
})();

// duplicate ticker items so the loop is seamless
(function(){
  var move=document.getElementById('ticker');
  if(move){ move.innerHTML+=move.innerHTML; }
})();

// count-up for the meter, triggered on scroll into view
(function(){
  var reduce=window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var nums=document.querySelectorAll('.num[data-count]');
  function run(el){
    var target=+el.getAttribute('data-count'), start=null, dur=1400;
    if(reduce){ el.textContent=target.toLocaleString(); return; }
    function step(ts){
      if(!start)start=ts;
      var p=Math.min((ts-start)/dur,1);
      var eased=1-Math.pow(1-p,3);
      el.textContent=Math.floor(eased*target).toLocaleString();
      if(p<1)requestAnimationFrame(step);
      else el.textContent=target.toLocaleString();
    }
    requestAnimationFrame(step);
  }
  if('IntersectionObserver' in window){
    var io=new IntersectionObserver(function(es){
      es.forEach(function(e){ if(e.isIntersecting){ run(e.target); io.unobserve(e.target);} });
    },{threshold:.4});
    nums.forEach(function(n){io.observe(n);});
  } else { nums.forEach(run); }
})();
