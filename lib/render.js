// Rendering layer. The markup below is the mockup's HTML, parameterized so the
// homepage, section pages, and per-article detail pages are generated from data
// while the design stays faithful to somegoodnews.html.
//
// A `base` prefix is threaded through every internal link so pages can live at
// the site root ("") or in a subfolder like stories/ ("../").

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

// ---------- link helpers (base-aware) ----------

const homeHref = (base) => `${base}index.html`;
const sectionHref = (base, slug) => `${base}${slug}.html`;
const storyHref = (base, id) => `${base}stories/${id}.html`;
const assetHref = (base, file) => `${base}assets/${file}`;

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

function masthead(activeSlug, base) {
  const links = NAV.map(
    (n) =>
      `          <a href="${sectionHref(base, n.slug)}"${
        n.slug === activeSlug ? ' class="active"' : ''
      }>${esc(n.label)}</a>`
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
        <h1 class="wordmark"><a href="${homeHref(base)}">Cloud<span class="good">break</span></a></h1>
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
          <h4>How Cloudbreak works</h4>
          <p>We comb publishers across the web for the stories that make your day a little brighter, show you the headline and a quick summary, then send you straight to the <a href="#">original source</a> for the full story. We don't republish anyone's work — good news belongs to everyone, and credit belongs to the people who reported it.</p>
        </div>
        <div class="tip">
          <h4>Spotted something good?</h4>
          <p>A neighbor, a rescue, a small win on your street — if it made you smile, send it our way.</p>
          <a href="#" class="btn">Send us a tip →</a>
        </div>
      </div>
      <div class="legal">
        <span class="wm">Cloud<em>break</em></span>
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

function card(a, lg, base) {
  const dek = lg && a.dek ? `\n          <p class="dek">${esc(a.dek)}</p>` : '';
  return `        <article class="card${lg ? ' lg' : ''}">
          <a class="photo" href="${storyHref(base, a.id)}" style="background:${a.gradient};"><span class="glyph" aria-hidden="true">${a.glyph}</span></a>
          <span class="kicker">${esc(a.kicker)}</span>
          <h3><a href="${storyHref(base, a.id)}">${esc(a.title)}</a></h3>${dek}
          <p class="byline">via <b>${esc(a.source)}</b> · ${a.ago.short}</p>
        </article>`;
}

function railStory(a, withpic, base) {
  if (withpic) {
    return `        <div class="railstory withpic">
          <a class="photo" href="${storyHref(base, a.id)}" style="background:${a.gradient};"><span class="glyph" aria-hidden="true">${a.glyph}</span></a>
          <div>
            <span class="kicker">${esc(a.kicker)}</span>
            <h3><a href="${storyHref(base, a.id)}">${esc(a.title)}</a></h3>
            <p class="byline">via <b>${esc(a.source)}</b> · ${a.ago.long}</p>
          </div>
        </div>`;
  }
  return `        <div class="railstory">
          <span class="kicker">${esc(a.kicker)}</span>
          <h3><a href="${storyHref(base, a.id)}">${esc(a.title)}</a></h3>
          <p class="byline">via <b>${esc(a.source)}</b> · ${a.ago.long}</p>
        </div>`;
}

// ---------- home-only blocks ----------

function splash(lead, rail, base) {
  const railHtml = rail.map((a, i) => railStory(a, i === 0, base)).join('\n\n');
  const meta =
    `via <b>${esc(lead.source)}</b> · ${lead.ago.long}` +
    (lead.readMins ? ` · ${lead.readMins} min read` : '');

  return `
  <div class="wrap">
    <div class="splash">
      <div class="lead">
        <a class="photo" href="${storyHref(base, lead.id)}" style="background:${lead.gradient};">
          <span class="glyph" aria-hidden="true">${lead.glyph}</span>
        </a>
        <span class="kicker">${esc(lead.kicker)}</span>
        <h1><a href="${storyHref(base, lead.id)}">${esc(lead.title)}</a></h1>
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

function block(sec, cards, base) {
  const moreHref = NAV_SLUGS.has(sec.slug) ? sectionHref(base, sec.slug) : '#';
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

// A "More good news" grid, reused on section + story pages.
function relatedBlock(title, articles, base) {
  if (!articles.length) return '';
  const cards = articles.map((a) => card(a, false, base)).join('\n');
  return `
  <section class="block related">
    <div class="wrap">
      <div class="sechead">
        <h2>${esc(title)}</h2>
      </div>
      <div class="grid3">
${cards}
      </div>
    </div>
  </section>`;
}

// ---------- document shell ----------

function doc({ title, body, base = '' }) {
  return `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>${esc(title)}</title>
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Archivo:wght@400;500;600;700;800;900&family=Newsreader:ital,opsz,wght@0,16..72,400;0,16..72,500;1,16..72,400&family=Spline+Sans+Mono:wght@400;500;600&display=swap" rel="stylesheet">
<link rel="stylesheet" href="${assetHref(base, 'styles.css')}">
</head>
<body>
${body}
<script src="${assetHref(base, 'main.js')}"></script>
</body>
</html>
`;
}

// ---------- page builders ----------

export function renderHome({ home, byId }) {
  const base = '';
  const lead = byId.get(home.lead);
  const rail = home.rail.map((id) => byId.get(id)).filter(Boolean);

  const sections = home.sections
    .map((sec) => {
      const cards = sec.ids
        .map((id) => byId.get(id))
        .filter(Boolean)
        .map((a) => card(a, !!sec.lg, base))
        .join('\n');
      return block(sec, cards, base);
    })
    .join('\n');

  const body = [
    utilBar(),
    masthead(null, base),
    splash(lead, rail, base),
    ticker(home.ticker),
    sections,
    meter(home.meter || {}),
    footer(),
  ].join('\n');

  return doc({ title: 'Cloudbreak — Good news only', body, base });
}

export function renderSection({ label, slug, layout, articles }) {
  const base = '';
  const count = articles.length;
  const cards = count
    ? articles.map((a) => card(a, layout === 'grid3', base)).join('\n')
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
    masthead(slug, base),
    hero,
    `\n  <section class="block">\n    <div class="wrap">\n${grid}\n    </div>\n  </section>`,
    footer(),
  ].join('\n');

  return doc({ title: `${label} — Cloudbreak`, body, base });
}

export function renderArticle({ article: a, related }) {
  // Story pages live in stories/, so internal links need a "../" prefix.
  const base = '../';
  const activeSlug = a.tags.find((t) => NAV_SLUGS.has(t)) || null;

  const meta =
    `via <b>${esc(a.source)}</b> · ${a.ago.long}` +
    (a.readMins ? ` · ${a.readMins} min read` : '');

  const bodyParas = Array.isArray(a.body) && a.body.length
    ? a.body.map((p) => `        <p>${esc(p)}</p>`).join('\n')
    : `        <p>${esc(a.dek || 'A little bit of good news to brighten your day.')}</p>`;

  const sourceCta =
    a.url && a.url !== '#'
      ? `\n      <a class="source-btn" href="${esc(a.url)}" target="_blank" rel="noopener">Read the full story at ${esc(a.source)} →</a>`
      : `\n      <p class="source-note">Curated by Cloudbreak — we link straight to the original source as soon as it's available.</p>`;

  const story = `
  <div class="wrap">
    <article class="story">
      <a class="backlink" href="${homeHref(base)}">← All good news</a>
      <span class="kicker">${esc(a.kicker)}</span>
      <h1 class="story-title">${esc(a.title)}</h1>
      ${a.dek ? `<p class="story-standfirst">${esc(a.dek)}</p>` : ''}
      <p class="byline">${meta}</p>
      <div class="photo story-photo" style="background:${a.gradient};"><span class="glyph" aria-hidden="true">${a.glyph}</span></div>
      <div class="story-body">
${bodyParas}
      </div>${sourceCta}
    </article>
  </div>`;

  const body = [
    utilBar(),
    masthead(activeSlug, base),
    story,
    relatedBlock('More good news', related, base),
    footer(),
  ].join('\n');

  return doc({ title: `${a.title} — Cloudbreak`, body, base });
}
