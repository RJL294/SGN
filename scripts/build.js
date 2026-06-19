// Builds the static site into dist/ from the article + home data.
//   node scripts/build.js

// Up to `limit` other articles that share a tag with `a`, freshest first.
function relatedTo(a, all, limit = 3) {
  const tags = new Set(a.tags);
  return all
    .filter((x) => x.id !== a.id && x.tags.some((t) => tags.has(t)))
    .slice(0, limit);
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
import { renderHome, renderSection, renderArticle, NAV } from '../lib/render.js';

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

  rmSync(DIST, { recursive: true, force: true });
  mkdirSync(DIST, { recursive: true });

  // homepage
  writeFileSync(join(DIST, 'index.html'), renderHome({ home, byId }));

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

  const pages = 1 + NAV.length + articles.length;
  console.log(`Built ${pages} pages from ${articles.length} articles → dist/`);
  console.log('  index.html');
  for (const nav of NAV) {
    console.log(`  ${nav.slug}.html  (${counts[nav.slug]} ${counts[nav.slug] === 1 ? 'story' : 'stories'})`);
  }
  console.log(`  stories/*.html  (${articles.length} detail pages)`);
}

main();
