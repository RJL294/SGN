// Loads curated articles + any cached feed items, normalizes them into a single
// shape, then merges and de-duplicates them so the rest of the build is simple.

import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');

function readJSON(relPath, fallback) {
  try {
    return JSON.parse(readFileSync(join(ROOT, relPath), 'utf8'));
  } catch {
    return fallback;
  }
}

// Fallback palette for feed items that don't carry their own gradient.
const PALETTE = [
  'linear-gradient(135deg,#FFC02E,#FF5A36)',
  'linear-gradient(135deg,#1E9E63,#0C7C8C)',
  'linear-gradient(135deg,#2B6CB0,#7A4BC9)',
  'linear-gradient(135deg,#FF5A36,#F2A20C)',
  'linear-gradient(135deg,#7CB518,#1E9E63)',
  'linear-gradient(135deg,#E85D9E,#FFC02E)',
];

function slugify(s) {
  return String(s)
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 60);
}

function pickGradient(seed) {
  let h = 0;
  for (const ch of String(seed)) h = (h * 31 + ch.charCodeAt(0)) >>> 0;
  return PALETTE[h % PALETTE.length];
}

function relTime(hoursAgo) {
  const h = Math.max(0, Math.round(hoursAgo));
  if (h < 1) return { short: 'now', long: 'just now' };
  if (h < 24) return { short: h + 'h', long: h + (h === 1 ? ' hour ago' : ' hours ago') };
  const d = Math.round(h / 24);
  return { short: d + 'd', long: d + (d === 1 ? ' day ago' : ' days ago') };
}

export function normalize(a) {
  const hoursAgo =
    a.hoursAgo != null
      ? a.hoursAgo
      : a.date && !Number.isNaN(Date.parse(a.date))
      ? (Date.now() - Date.parse(a.date)) / 3.6e6
      : a.firstSeen && !Number.isNaN(Date.parse(a.firstSeen))
      ? (Date.now() - Date.parse(a.firstSeen)) / 3.6e6
      : 6;

  return {
    id: a.id || slugify(a.title),
    title: a.title || 'Untitled',
    dek: a.dek || '',
    kicker: a.kicker || 'Good News',
    source: a.source || 'The Web',
    url: a.url || '#',
    glyph: a.glyph || '☀',
    gradient: a.gradient || pickGradient(a.id || a.title),
    tags: Array.isArray(a.tags) ? a.tags : a.section ? [a.section] : [],
    rail: !!a.rail,
    readMins: a.readMins || null,
    body: Array.isArray(a.body) ? a.body : a.body ? [a.body] : null,
    hoursAgo,
    ago: relTime(hoursAgo),
  };
}

// Curated entries win ties; everything is keyed by source URL (falling back to
// id) so a feed copy of a curated story collapses into one card.
export function loadArticles() {
  const curated = readJSON('data/articles.json', []).map(normalize);
  const cached = readJSON('data/archive.json', []).map(normalize);

  const byKey = new Map();
  for (const a of [...curated, ...cached]) {
    const key = a.url && a.url !== '#' ? a.url.replace(/\/+$/, '') : 'id:' + a.id;
    if (!byKey.has(key)) byKey.set(key, a);
  }
  return [...byKey.values()].sort((x, y) => x.hoursAgo - y.hoursAgo);
}

export function indexById(articles) {
  return new Map(articles.map((a) => [a.id, a]));
}

export function bySection(articles, slug) {
  return articles.filter((a) => a.tags.includes(slug));
}
