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

// tip form: submit via fetch to a configured endpoint, fall back to mailto,
// otherwise show a friendly demo message — all without leaving the page.
(function(){
  var form=document.getElementById('tip-form');
  if(!form) return;
  var status=document.getElementById('tip-status');
  function say(msg){ if(status) status.textContent=msg; }

  form.addEventListener('submit', function(e){
    // honeypot: if a bot filled the hidden field, silently drop it
    if(form.querySelector('[name="_gotcha"]') && form.querySelector('[name="_gotcha"]').value){
      e.preventDefault(); return;
    }
    var headline=form.querySelector('[name="headline"]');
    if(headline && !headline.value.trim()){
      e.preventDefault(); say('Add the good news headline first. ☀'); headline.focus(); return;
    }

    var endpoint=form.getAttribute('data-endpoint')||'';
    var email=form.getAttribute('data-email')||'';
    var data=new FormData(form);

    if(endpoint){
      e.preventDefault();
      say('Sending…');
      fetch(endpoint,{method:'POST',headers:{'Accept':'application/json'},body:data})
        .then(function(res){
          if(res.ok){ form.reset(); say('Thank you! Your good news is on its way. ☀'); }
          else { say('Hmm, that didn’t go through. Please try again in a moment.'); }
        })
        .catch(function(){ say('Network hiccup — please try again.'); });
    } else if(email){
      e.preventDefault();
      var subject='Cloudbreak tip: '+(data.get('headline')||'good news');
      var lines=[
        'Headline: '+(data.get('headline')||''),
        'Link: '+(data.get('link')||''),
        'From: '+((data.get('name')||'')+' '+(data.get('email')||'')).trim(),
        '',
        (data.get('details')||'')
      ];
      say('Opening your email app…');
      window.location.href='mailto:'+email+'?subject='+encodeURIComponent(subject)+'&body='+encodeURIComponent(lines.join('\n'));
    } else {
      e.preventDefault();
      form.reset();
      say('Thanks! (Demo mode — connect a form endpoint or email in data/site.json to receive tips.)');
    }
  });
})();
