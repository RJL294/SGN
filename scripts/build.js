// Builds the static site into dist/ from the article + home data.
//   node scripts/build.js

// Up to `limit` other articles that share a tag with `a`, freshest first.
function relatedTo(a, all, limit = 3) {
  const tags = new Set(a.tags);
  return all
    .filter((x) => x.id !== a.id && x.tags.some((t) => tags.has(t)))
    .slice(0, limit);
}

// Compose a live-newswire homepage: the lead, rail, ticker and top sections are
// filled from the freshest stories (feed items first, then curated), so the
// front page changes as news arrives. Curated picks land in "Editor's Picks".
function composeHome(home, articles) {
  const feed = articles.filter((a) => !a.curated);
  const curated = articles.filter((a) => a.curated);
  const pool = [...feed, ...curated]; // fresh feed first, curated after
  const used = new Set();
  const take = (n, tag) => {
    const src = tag ? pool.filter((a) => a.tags.includes(tag)) : pool;
    const out = [];
    for (const a of src) {
      if (used.has(a.id)) continue;
      used.add(a.id);
      out.push(a);
      if (out.length >= n) break;
    }
    return out;
  };

  const lead = take(1)[0];
  const rail = take(3);
  const latest = take(4);

  const themed = [
    ['Animal Kingdom', 'animals', 'animals'],
    ['Science & Good AI', 'science', 'science'],
    ['The Planet', 'planet', 'planet'],
    ['Kindness & Community', 'kindness', 'kindness'],
  ]
    .map(([title, slug, tag]) => ({ title, slug, layout: 'grid3', lg: true, ids: take(3, tag).map((a) => a.id) }))
    .filter((s) => s.ids.length);

  const sections = [
    { title: 'Latest Good News', slug: 'latest', layout: 'grid4', ids: latest.map((a) => a.id) },
    ...themed,
  ];
  const picks = curated.filter((a) => !used.has(a.id)).slice(0, 8);
  if (picks.length) {
    sections.push({ title: "Editor's Picks", slug: 'editors', layout: 'grid4', ids: picks.map((a) => a.id) });
  }

  home.lead = lead ? lead.id : null;
  home.rail = rail.map((a) => a.id);
  home.ticker = pool.slice(0, 6).map((a) => a.title);
  home.sections = sections;
  return home;
}

import {
  mkdirSync,
  writeFileSync,
  copyFileSync,
  readdirSync,
  rmSync,
  readFileSync,
} from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

import { loadArticles, indexById, bySection } from '../lib/articles.js';
import {
  renderHome,
  renderSection,
  renderArticle,
  renderAbout,
  renderTip,
  renderProgress,
  renderAllNews,
  NAV,
} from '../lib/render.js';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
const DIST = join(ROOT, 'dist');

function loadJSON(relPath, fallback) {
  try {
    return JSON.parse(readFileSync(join(ROOT, relPath), 'utf8'));
  } catch {
    return fallback;
  }
}

function copyAssets() {
  const src = join(ROOT, 'assets');
  const dest = join(DIST, 'assets');
  mkdirSync(dest, { recursive: true });
  for (const f of readdirSync(src)) {
    copyFileSync(join(src, f), join(dest, f));
  }
}

function main() {
  const articles = loadArticles();
  const byId = indexById(articles);
  const home = loadJSON('data/home.json', { sections: [], ticker: [], rail: [], meter: {} });
  const site = loadJSON('data/site.json', { tipEndpoint: '', contactEmail: '' });
  const progress = loadJSON('data/progress.json', { metrics: [] });

  rmSync(DIST, { recursive: true, force: true });
  mkdirSync(DIST, { recursive: true });

  // homepage — composed live from the freshest stories (feed first, curated after)
  composeHome(home, articles);
  writeFileSync(join(DIST, 'index.html'), renderHome({ home, byId, progress }));

  // static pages
  writeFileSync(join(DIST, 'about.html'), renderAbout());
  writeFileSync(join(DIST, 'progress.html'), renderProgress({ progress }));
  writeFileSync(join(DIST, 'news.html'), renderAllNews({ articles }));
  writeFileSync(
    join(DIST, 'tip.html'),
    renderTip({ endpoint: site.tipEndpoint || '', contactEmail: site.contactEmail || '' })
  );

  // one page per nav section
  const counts = {};
  for (const nav of NAV) {
    const list = bySection(articles, nav.slug);
    counts[nav.slug] = list.length;
    const html = renderSection({
      label: nav.label,
      slug: nav.slug,
      layout: 'grid3',
      articles: list,
    });
    writeFileSync(join(DIST, `${nav.slug}.html`), html);
  }

  // one detail page per article, under stories/
  mkdirSync(join(DIST, 'stories'), { recursive: true });
  for (const a of articles) {
    const html = renderArticle({ article: a, related: relatedTo(a, articles) });
    writeFileSync(join(DIST, 'stories', `${a.id}.html`), html);
  }

  copyAssets();

  // Custom domain: GitHub Pages reads a CNAME file at the site root.
  if (site.domain) {
    writeFileSync(join(DIST, 'CNAME'), site.domain + '\n');
  }

  const pages = 5 + NAV.length + articles.length;
  console.log(`Built ${pages} pages from ${articles.length} articles → dist/`);
  console.log('  index.html');
  console.log('  about.html');
  console.log('  progress.html');
  console.log('  news.html');
  console.log('  tip.html');
  for (const nav of NAV) {
    console.log(`  ${nav.slug}.html  (${counts[nav.slug]} ${counts[nav.slug] === 1 ? 'story' : 'stories'})`);
  }
  console.log(`  stories/*.html  (${articles.length} detail pages)`);
}

main();
