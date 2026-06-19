// Rendering layer. The markup below is the mockup's HTML, parameterized so the
// homepage and every section page are generated from data while the design
// stays byte-for-byte faithful to somegoodnews.html.

export const NAV = [
  { label: 'Kindness', slug: 'kindness' },
  { label: 'Animals', slug: 'animals' },
  { label: 'Everyday Heroes', slug: 'heroes' },
  { label: 'Science Wins', slug: 'science' },
  { label: 'Good AI', slug: 'good-ai' },
  { label: 'The Planet', slug: 'planet' },
  { label: 'Community', slug: 'community' },
  { label: 'Comebacks', slug: 'comebacks' },
  { label: 'Reunions', slug: 'reunions' },
];

const NAV_SLUGS = new Set(NAV.map((n) => n.slug));

function esc(s) {
  return String(s)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

// ---------- shared chrome ----------

function utilBar() {
  return `
  <div class="util">
    <div class="wrap">
      <span class="date" id="today">FRIDAY, JUNE 19, 2026</span>
      <span class="tag">Good news only</span>
      <span class="spacer"></span>
      <span class="live"><span class="dot"></span>Updated <span class="mono" id="clock">6:42 AM</span></span>
      <a href="#" class="sub">Get the daily smile →</a>
    </div>
  </div>`;
}

function masthead(activeSlug) {
  const links = NAV.map(
    (n) =>
      `          <a href="${n.slug}.html"${n.slug === activeSlug ? ' class="active"' : ''}>${esc(
        n.label
      )}</a>`
  ).join('\n');

  return `
  <header class="masthead">
    <div class="wrap">
      <div class="nameplate">
        <svg class="sun" width="64" height="64" viewBox="0 0 100 100" aria-hidden="true">
          <g fill="none" stroke="#FFC02E" stroke-width="6" stroke-linecap="round" class="ray">
            <line x1="50" y1="6" x2="50" y2="20"/>
            <line x1="82" y1="18" x2="72" y2="28"/>
            <line x1="94" y1="50" x2="80" y2="50"/>
            <line x1="18" y1="18" x2="28" y2="28"/>
            <line x1="6"  y1="50" x2="20" y2="50"/>
            <line x1="71" y1="71" x2="80" y2="80"/>
            <line x1="29" y1="71" x2="20" y2="80"/>
          </g>
          <circle cx="50" cy="50" r="20" fill="#FFC02E"/>
          <circle cx="50" cy="50" r="20" fill="none" stroke="#1B1613" stroke-width="3"/>
        </svg>
        <h1 class="wordmark"><a href="index.html">Some <span class="good">Good</span> News</a></h1>
      </div>
      <p class="dateline">
        Good news only, since 2026 <span class="pip"></span> <b>Hand-picked from across the web</b> <span class="pip"></span> Verified before it cheers you up
      </p>
      <nav>
        <div class="navrow">
${links}
        </div>
      </nav>
    </div>
  </header>`;
}

function footer() {
  return `
  <footer>
    <div class="wrap">
      <div class="foot-top">
        <div class="how">
          <h4>How Some Good News works</h4>
          <p>We comb publishers across the web for the stories that make your day a little brighter, show you the headline and a quick summary, then send you straight to the <a href="#">original source</a> for the full story. We don't republish anyone's work — good news belongs to everyone, and credit belongs to the people who reported it.</p>
        </div>
        <div class="tip">
          <h4>Spotted something good?</h4>
          <p>A neighbor, a rescue, a small win on your street — if it made you smile, send it our way.</p>
          <a href="#" class="btn">Send us a tip →</a>
        </div>
      </div>
      <div class="legal">
        <span class="wm">Some <em>Good</em> News</span>
        <span class="spacer"></span>
        <span>© 2026 · Good news only</span>
        <span>About</span>
        <span>Sources</span>
        <span>Newsletter</span>
      </div>
    </div>
  </footer>`;
}

// ---------- cards ----------

function card(a, lg) {
  const dek = lg && a.dek ? `\n          <p class="dek">${esc(a.dek)}</p>` : '';
  return `        <article class="card${lg ? ' lg' : ''}">
          <div class="photo" style="background:${a.gradient};"><span class="glyph" aria-hidden="true">${a.glyph}</span></div>
          <span class="kicker">${esc(a.kicker)}</span>
          <h3><a href="${esc(a.url)}">${esc(a.title)}</a></h3>${dek}
          <p class="byline">via <b>${esc(a.source)}</b> · ${a.ago.short}</p>
        </article>`;
}

function railStory(a, withpic) {
  if (withpic) {
    return `        <div class="railstory withpic">
          <div class="photo" style="background:${a.gradient};"><span class="glyph" aria-hidden="true">${a.glyph}</span></div>
          <div>
            <span class="kicker">${esc(a.kicker)}</span>
            <h3><a href="${esc(a.url)}">${esc(a.title)}</a></h3>
            <p class="byline">via <b>${esc(a.source)}</b> · ${a.ago.long}</p>
          </div>
        </div>`;
  }
  return `        <div class="railstory">
          <span class="kicker">${esc(a.kicker)}</span>
          <h3><a href="${esc(a.url)}">${esc(a.title)}</a></h3>
          <p class="byline">via <b>${esc(a.source)}</b> · ${a.ago.long}</p>
        </div>`;
}

// ---------- home-only blocks ----------

function splash(lead, rail) {
  const railHtml = rail.map((a, i) => railStory(a, i === 0)).join('\n\n');
  const meta =
    `via <b>${esc(lead.source)}</b> · ${lead.ago.long}` +
    (lead.readMins ? ` · ${lead.readMins} min read` : '');

  return `
  <div class="wrap">
    <div class="splash">
      <div class="lead">
        <div class="photo" style="background:${lead.gradient};">
          <span class="glyph" aria-hidden="true">${lead.glyph}</span>
        </div>
        <span class="kicker">${esc(lead.kicker)}</span>
        <h1><a href="${esc(lead.url)}">${esc(lead.title)}</a></h1>
        <p class="dek">${esc(lead.dek)}</p>
        <p class="byline">${meta}</p>
      </div>

      <div class="rail">
        <div class="railhead">More good news <span>☀</span></div>

${railHtml}
      </div>
    </div>
  </div>`;
}

function ticker(items) {
  const spans = items
    .map((t) => `            <span class="item">${esc(t)}</span>`)
    .join('\n');
  return `
  <div class="ticker">
    <div class="wrap" style="padding:0;max-width:none;">
      <div class="row">
        <div class="label">Trending Smiles</div>
        <div class="track">
          <div class="move" id="ticker">
${spans}
          </div>
        </div>
      </div>
    </div>
  </div>`;
}

function block(sec, cards) {
  const moreHref = NAV_SLUGS.has(sec.slug) ? `${sec.slug}.html` : '#';
  return `
  <section class="block">
    <div class="wrap">
      <div class="sechead">
        <h2>${esc(sec.title)}</h2>
        <a href="${moreHref}" class="more">See all →</a>
      </div>
      <div class="${sec.layout}">
${cards}
      </div>
    </div>
  </section>`;
}

function meter(m) {
  const stats = (m.stats || [])
    .map((s) => {
      const num =
        s.count != null
          ? `<div class="num" data-count="${s.count}">0</div>`
          : `<div class="num" data-suffix="${esc(s.suffix)}">${esc(s.suffix)}</div>`;
      return `        <div class="stat">${num}<div class="lbl">${esc(s.label)}</div></div>`;
    })
    .join('\n');

  return `
  <div class="meter">
    <div class="wrap">
      <p class="eyebrow">The Good News Meter · this week</p>
      <h2>Proof it's <em>not all bad</em> out there.</h2>
      <div class="stats">
${stats}
      </div>
    </div>
  </div>`;
}

// ---------- document shell ----------

function doc({ title, body }) {
  return `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>${esc(title)}</title>
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Archivo:wght@400;500;600;700;800;900&family=Newsreader:ital,opsz,wght@0,16..72,400;0,16..72,500;1,16..72,400&family=Spline+Sans+Mono:wght@400;500;600&display=swap" rel="stylesheet">
<link rel="stylesheet" href="assets/styles.css">
</head>
<body>
${body}
<script src="assets/main.js"></script>
</body>
</html>
`;
}

// ---------- page builders ----------

export function renderHome({ home, byId }) {
  const lead = byId.get(home.lead);
  const rail = home.rail.map((id) => byId.get(id)).filter(Boolean);

  const sections = home.sections
    .map((sec) => {
      const cards = sec.ids
        .map((id) => byId.get(id))
        .filter(Boolean)
        .map((a) => card(a, !!sec.lg))
        .join('\n');
      return block(sec, cards);
    })
    .join('\n');

  const body = [
    utilBar(),
    masthead(null),
    splash(lead, rail),
    ticker(home.ticker),
    sections,
    meter(home.meter || {}),
    footer(),
  ].join('\n');

  return doc({ title: 'Some Good News — Good news only', body });
}

export function renderSection({ label, slug, layout, articles }) {
  const count = articles.length;
  const cards = count
    ? articles.map((a) => card(a, layout === 'grid3')).join('\n')
    : '';

  const grid = count
    ? `      <div class="${layout}">
${cards}
      </div>`
    : `      <p class="empty">No stories here just yet — but good news has a way of turning up. Check back soon. ☀</p>`;

  const hero = `
  <div class="wrap">
    <div class="section-hero">
      <span class="kicker">${count} ${count === 1 ? 'story' : 'stories'}</span>
      <h1>${esc(label)}</h1>
      <p class="section-sub">Every ${esc(label)} story we're smiling about, freshest first.</p>
    </div>
  </div>`;

  const body = [
    utilBar(),
    masthead(slug),
    hero,
    `\n  <section class="block">\n    <div class="wrap">\n${grid}\n    </div>\n  </section>`,
    footer(),
  ].join('\n');

  return doc({ title: `${label} — Some Good News`, body });
}
