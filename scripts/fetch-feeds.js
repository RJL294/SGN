// Pulls the public good-news feeds listed in feeds.json and ACCUMULATES new
// items into data/archive.json (committed, so it persists across builds).
// Stories are de-duplicated by link and retired once they're older than the
// retention window, so new stories push older ones down the page rather than
// replacing them.
//
//   node scripts/fetch-feeds.js
//
// Degrades gracefully: any feed that fails is logged and skipped, and the
// existing archive is preserved.

import { readFileSync, writeFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

import { parseFeed } from '../lib/rss.js';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
const ARCHIVE = join(ROOT, 'data', 'archive.json');
const TIMEOUT_MS = 10000;
const PER_FEED = 25;
const RETAIN_DAYS = 90; // retire stories after ~3 months

function loadArchive() {
  try {
    const data = JSON.parse(readFileSync(ARCHIVE, 'utf8'));
    return Array.isArray(data) ? data : [];
  } catch {
    return [];
  }
}

function normUrl(u) {
  return String(u || '').trim().replace(/\/+$/, '');
}

// Effective timestamp: the story's publish date, or when we first saw it.
function effTime(item) {
  const d = Date.parse(item.date);
  if (!Number.isNaN(d)) return d;
  const f = Date.parse(item.firstSeen);
  return Number.isNaN(f) ? Date.now() : f;
}

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
  const archive = loadArchive();
  const byUrl = new Map(archive.map((it) => [normUrl(it.url), it]));
  const startCount = byUrl.size;
  const now = Date.now();
  const cutoff = now - RETAIN_DAYS * 86400000;
  const nowIso = new Date().toISOString();

  let ok = 0;
  let added = 0;

  for (const feed of feeds) {
    try {
      const xml = await fetchText(feed.url);
      const items = parseFeed(xml).filter((i) => i.title && i.link);
      for (const item of items.slice(0, PER_FEED)) {
        const key = normUrl(item.link);
        if (!key || byUrl.has(key)) continue;
        // skip stories that are already older than the retention window
        const pub = Date.parse(item.date);
        if (!Number.isNaN(pub) && pub < cutoff) continue;
        byUrl.set(key, {
          title: item.title,
          dek: item.description ? item.description.slice(0, 220) : '',
          kicker: feed.kicker || 'Good News',
          source: feed.name,
          url: item.link,
          date: item.date || '',
          glyph: feed.glyph,
          gradient: feed.gradient,
          tags: feed.tags || [],
          firstSeen: nowIso,
        });
        added++;
      }
      ok++;
      console.log(`  ✓ ${feed.name} — ${Math.min(items.length, PER_FEED)} items scanned`);
    } catch (err) {
      console.log(`  ✗ ${feed.name} — ${err.message} (skipped)`);
    }
  }

  // retire anything past the retention window, then sort newest first
  const kept = [...byUrl.values()].filter((it) => effTime(it) >= cutoff);
  kept.sort((a, b) => effTime(b) - effTime(a));
  const retired = startCount + added - kept.length;

  writeFileSync(ARCHIVE, JSON.stringify(kept, null, 2) + '\n');
  console.log(
    `\n${ok}/${feeds.length} feeds fetched · +${added} new · ${retired} retired · ${kept.length} stories in archive → data/archive.json`
  );
}

main();
