// Minimal, dependency-free RSS 2.0 / Atom parser.
// Good enough for well-formed news feeds: handles CDATA, HTML entities,
// namespaced tags (dc:date, content:encoded) and both <item> and <entry>.

function decodeEntities(s) {
  if (!s) return '';
  return s
    .replace(/<!\[CDATA\[([\s\S]*?)\]\]>/g, '$1')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&apos;/g, "'")
    .replace(/&#0*39;/g, "'")
    .replace(/&#x0*27;/gi, "'")
    .replace(/&#(\d+);/g, (_, n) => String.fromCodePoint(Number(n)))
    .replace(/&#x([0-9a-fA-F]+);/g, (_, n) => String.fromCodePoint(parseInt(n, 16)))
    .replace(/&amp;/g, '&')
    .trim();
}

function tagText(block, name) {
  const re = new RegExp('<' + name + '(?:\\s[^>]*)?>([\\s\\S]*?)<\\/' + name + '>', 'i');
  const m = block.match(re);
  return m ? decodeEntities(m[1]) : '';
}

function linkHref(block, isAtom) {
  if (isAtom) {
    // Prefer <link rel="alternate" href="..."> then any <link href="...">
    const alt = block.match(/<link\b[^>]*\brel=["']alternate["'][^>]*\bhref=["']([^"']+)["']/i);
    if (alt) return decodeEntities(alt[1]);
    const any = block.match(/<link\b[^>]*\bhref=["']([^"']+)["']/i);
    if (any) return decodeEntities(any[1]);
  }
  return tagText(block, 'link');
}

function stripTags(s) {
  return s.replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim();
}

/**
 * Parse a feed XML string into a normalized list of items.
 * @returns {{title:string, link:string, description:string, date:string}[]}
 */
export function parseFeed(xml) {
  if (!xml) return [];
  const isAtom = /<feed[\s>]/i.test(xml) && !/<rss[\s>]/i.test(xml);
  const blocks =
    xml.match(isAtom ? /<entry[\s\S]*?<\/entry>/gi : /<item[\s\S]*?<\/item>/gi) || [];

  return blocks.map((b) => {
    const description = stripTags(
      tagText(b, 'description') ||
        tagText(b, 'summary') ||
        tagText(b, 'content:encoded') ||
        tagText(b, 'content')
    );
    return {
      title: stripTags(tagText(b, 'title')),
      link: linkHref(b, isAtom).trim(),
      description,
      date:
        tagText(b, 'pubDate') ||
        tagText(b, 'published') ||
        tagText(b, 'updated') ||
        tagText(b, 'dc:date'),
    };
  });
}
