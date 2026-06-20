// Builds the static site into dist/ from the article + home data.
//   node scripts/build.js

// Up to `limit` other articles that share a tag with `a`, freshest first.
function relatedTo(a, all, limit = 3) {
  const tags = new Set(a.tags);
  return all
    .filter((x) => x.id !== a.id && x.tags.some((t) => tags.has(t)))
    .slice(0, limit);
}

// Resolve home sections, filling `auto: "recent"` sections with the freshest
// articles not already featured elsewhere, and dropping any that come up empty
// (e.g. when no live feed items are present).
function resolveHomeSections(home, articles) {
  const used = new Set([home.lead, ...(home.rail || [])]);
  for (const sec of home.sections || []) {
    if (Array.isArray(sec.ids)) sec.ids.forEach((id) => used.add(id));
  }
  const out = [];
  for (const sec of home.sections || []) {
    if (sec.auto === 'recent') {
      const ids = articles
        .filter((a) => !used.has(a.id))
        .slice(0, sec.limit || 4)
        .map((a) => a.id);
      if (!ids.length) continue; // nothing fresh to show — skip the section
      ids.forEach((id) => used.add(id));
      out.push({ ...sec, ids });
    } else {
      out.push(sec);
    }
  }
  return out;
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

  rmSync(DIST, { recursive: true, force: true });
  mkdirSync(DIST, { recursive: true });

  // homepage (resolve any auto sections first, e.g. "Fresh Off the Wire")
  home.sections = resolveHomeSections(home, articles);
  writeFileSync(join(DIST, 'index.html'), renderHome({ home, byId }));

  // static pages
  writeFileSync(join(DIST, 'about.html'), renderAbout());
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

  const pages = 3 + NAV.length + articles.length;
  console.log(`Built ${pages} pages from ${articles.length} articles → dist/`);
  console.log('  index.html');
  console.log('  about.html');
  console.log('  tip.html');
  for (const nav of NAV) {
    console.log(`  ${nav.slug}.html  (${counts[nav.slug]} ${counts[nav.slug] === 1 ? 'story' : 'stories'})`);
  }
  console.log(`  stories/*.html  (${articles.length} detail pages)`);
}

main();
