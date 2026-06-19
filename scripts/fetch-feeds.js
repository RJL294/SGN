// Pulls the public good-news feeds listed in feeds.json, normalizes each item
// into the article shape, and writes them to data/feed-cache.json. The build
// then merges this cache with the curated articles.
//
//   node scripts/fetch-feeds.js
//
// Degrades gracefully: any feed that fails (network policy, timeout, bad XML)
// is logged and skipped, and the cache is still written from whatever succeeded.

import { readFileSync, writeFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

import { parseFeed } from '../lib/rss.js';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
const TIMEOUT_MS = 10000;
const PER_FEED = 12;

async function fetchText(url) {
  const ctrl = new AbortController();
  const timer = setTimeout(() => ctrl.abort(), TIMEOUT_MS);
  try {
    const res = await fetch(url, {
      signal: ctrl.signal,
      headers: { 'user-agent': 'CloudbreakBot/1.0 (+https://github.com/RJL294/SGN)' },
    });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    return await res.text();
  } finally {
    clearTimeout(timer);
  }
}

async function main() {
  const feeds = JSON.parse(readFileSync(join(ROOT, 'feeds.json'), 'utf8'));
  const collected = [];
  let ok = 0;

  for (const feed of feeds) {
    try {
      const xml = await fetchText(feed.url);
      const items = parseFeed(xml).filter((i) => i.title && i.link);
      for (const item of items.slice(0, PER_FEED)) {
        collected.push({
          title: item.title,
          dek: item.description ? item.description.slice(0, 220) : '',
          kicker: feed.kicker || 'Good News',
          source: feed.name,
          url: item.link,
          date: item.date,
          glyph: feed.glyph,
          gradient: feed.gradient,
          tags: feed.tags || [],
        });
      }
      ok++;
      console.log(`  ✓ ${feed.name} — ${Math.min(items.length, PER_FEED)} items`);
    } catch (err) {
      console.log(`  ✗ ${feed.name} — ${err.message} (skipped)`);
    }
  }

  writeFileSync(
    join(ROOT, 'data', 'feed-cache.json'),
    JSON.stringify(collected, null, 2) + '\n'
  );
  console.log(
    `\n${ok}/${feeds.length} feeds fetched · ${collected.length} items cached → data/feed-cache.json`
  );
  console.log('Run `npm run build` to fold them into the site.');
}

main();
