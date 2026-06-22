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

// All News: reveal the timeline a few days at a time. Without JS, every day is
// visible (progressive enhancement) — the button is hidden until JS turns it on.
(function(){
  var days=document.querySelectorAll('.news-day');
  var btn=document.getElementById('load-more');
  if(!btn || days.length===0) return;
  var INITIAL=4, STEP=4, visible=INITIAL;
  function apply(){
    for(var i=0;i<days.length;i++){ days[i].style.display = i<visible ? '' : 'none'; }
    if(visible>=days.length){ btn.hidden=true; } else { btn.hidden=false; }
  }
  if(days.length>INITIAL){ apply(); }
  btn.addEventListener('click', function(){ visible+=STEP; apply(); });
})();

// tip form: submit via fetch to a configured endpoint, fall back to mailto,
// otherwise show a friendly demo message — all without leaving the page.
(function(){
  var form=document.getElementById('tip-form');
  if(!form) return;
  var status=document.getElementById('tip-status');
  function say(msg){ if(status) status.textContent=msg; }

  function openMailto(data){
    var email=form.getAttribute('data-email')||'';
    if(!email) return false;
    var subject='Cloudbreak tip: '+(data.get('headline')||'good news');
    var lines=[
      'Headline: '+(data.get('headline')||''),
      'Link: '+(data.get('link')||''),
      'From: '+((data.get('name')||'')+' '+(data.get('email')||'')).trim(),
      '',
      (data.get('details')||'')
    ];
    window.location.href='mailto:'+email+'?subject='+encodeURIComponent(subject)+'&body='+encodeURIComponent(lines.join('\n'));
    return true;
  }

  form.addEventListener('submit', function(e){
    // honeypot: if a bot filled the hidden field, silently drop it
    var honey=form.querySelector('[name="_honey"]');
    if(honey && honey.value){ e.preventDefault(); return; }

    var headline=form.querySelector('[name="headline"]');
    if(headline && !headline.value.trim()){
      e.preventDefault(); say('Add the good news headline first. ☀'); headline.focus(); return;
    }

    var endpoint=form.getAttribute('data-endpoint')||'';
    var email=form.getAttribute('data-email')||'';
    var data=new FormData(form);

    if(endpoint){
      // Submit in-page — no email app. Falls back to mailto only if the
      // request can't reach the server at all.
      e.preventDefault();
      say('Sending…');
      fetch(endpoint,{method:'POST',headers:{'Accept':'application/json'},body:data})
        .then(function(res){
          if(res.ok){ form.reset(); say('Thank you! Your good news is on its way. ☀'); }
          else { say('Hmm, that didn’t go through. Please try again in a moment.'); }
        })
        .catch(function(){
          if(openMailto(data)){ say('Connection issue — opening your email app as a backup…'); }
          else { say('Network hiccup — please try again.'); }
        });
    } else if(email){
      e.preventDefault();
      say('Opening your email app…');
      openMailto(data);
    } else {
      e.preventDefault();
      form.reset();
      say('Thanks! (Demo mode — connect a form endpoint or email in data/site.json to receive tips.)');
    }
  });
})();
