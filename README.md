# Some Good News ☀

A data-driven static news site that compiles the feel-good news from across the
web — HuffPost-style layout, good news only. Every article is **data**, and the
homepage and section pages are **generated** from it, so the design stays
consistent and content is easy to add.

## Quick start

No install step — it runs on Node 18+ with **zero dependencies**.

```bash
npm run build     # generate the site into dist/
npm run serve     # preview at http://localhost:4173
# or both at once:
npm run dev
```

## How it works

```
data/articles.json   Curated stories — the source of truth.
data/home.json       Homepage composition: lead story, rail, ticker, sections, meter.
feeds.json           Public good-news RSS/Atom feeds to ingest (optional).
lib/rss.js           Dependency-free RSS 2.0 / Atom parser.
lib/articles.js      Loads, normalizes, merges + de-dupes articles.
lib/render.js        Templates (the mockup's markup, parameterized).
scripts/build.js     Generates dist/ (homepage + one page per section).
scripts/fetch-feeds.js  Pulls feeds → data/feed-cache.json.
scripts/serve.js     Zero-dep static preview server.
assets/              styles.css + main.js, lifted verbatim from the mockup.
```

### Adding a story

Append an object to `data/articles.json`:

```json
{
  "id": "unique-slug",
  "title": "Headline goes here",
  "dek": "Optional one-sentence summary.",
  "kicker": "Kindness",
  "source": "The Bright Side",
  "url": "https://original-source.example/story",
  "hoursAgo": 3,
  "glyph": "🌟",
  "gradient": "linear-gradient(135deg,#FFC02E,#FF5A36)",
  "tags": ["kindness", "community"]
}
```

`tags` decide which section pages it appears on (they map to the nav slugs in
`lib/render.js`). To feature it on the homepage, reference its `id` from
`data/home.json`. Then `npm run build`.

### Pulling live feeds

```bash
npm run fetch     # writes data/feed-cache.json
npm run build     # merges cached feed items with curated stories
```

Feed items link back to their **original source** and are de-duplicated against
curated entries by URL. The fetcher degrades gracefully: any feed blocked by a
network policy is skipped, and the site still builds from `articles.json`.
`data/feed-cache.json` is git-ignored — it's regenerated on demand.

## Design

The look comes straight from the original mockup: the `<style>` and `<script>`
were extracted into `assets/styles.css` / `assets/main.js`, and the markup
became the templates in `lib/render.js`. The only CSS additions are an active
nav state and the section-page hero.
