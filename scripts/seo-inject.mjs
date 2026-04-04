#!/usr/bin/env node
/**
 * Syncs canonical, Open Graph, and Twitter image URLs from site-data/site-origin.json
 * into HTML files, and regenerates robots.txt + sitemap.xml.
 * Idempotent; safe to run multiple times.
 *
 * Run: node scripts/seo-inject.mjs   or   npm run seo:inject
 */
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.join(__dirname, '..');
const configPath = path.join(root, 'site-data', 'site-origin.json');
const { origin } = JSON.parse(fs.readFileSync(configPath, 'utf8'));
if (!origin || typeof origin !== 'string' || !origin.startsWith('http')) {
  console.error(
    'site-data/site-origin.json must contain a string "origin" like https://example.com'
  );
  process.exit(1);
}
const originNoSlash = origin.replace(/\/$/, '');
const SITE_NAME = 'Ryan McComb';
const TWITTER_HANDLE = '@RyanJMcComb';
const writingDir = path.join(root, 'writing');

function getEssayPaths() {
  if (!fs.existsSync(writingDir)) return [];
  return fs
    .readdirSync(writingDir, { withFileTypes: true })
    .filter((entry) => entry.isDirectory())
    .map((entry) => ({
      file: `writing/${entry.name}/index.html`,
      publicPath: `/writing/${entry.name}/`,
    }))
    .filter((entry) => fs.existsSync(path.join(root, entry.file)));
}

const essayPages = getEssayPaths();

const PAGE_PATHS = {
  'index.html': '/',
  'about.html': '/about',
  'experience.html': '/experience',
  'writing.html': '/writing',
  'press.html': '/press',
  'colophon.html': '/colophon',
  'resume.html': '/resume',
  '404.html': '/',
  ...Object.fromEntries(essayPages.map((entry) => [entry.file, entry.publicPath])),
};

function ensureCanonical(html, canonical) {
  if (/<link rel="canonical"/.test(html)) {
    return html.replace(
      /<link rel="canonical" href="[^"]*">/,
      `<link rel="canonical" href="${canonical}">`
    );
  }
  if (/<meta name="description"/.test(html)) {
    return html.replace(
      /(<meta name="description"[^>]*>)/,
      `$1\n  <link rel="canonical" href="${canonical}">`
    );
  }
  return html.replace(/(<\/title>\s*\n)/, `$1  <link rel="canonical" href="${canonical}">\n`);
}

function ensureOgUrl(html, canonical) {
  if (/property="og:url"/.test(html)) {
    return html.replace(
      /<meta property="og:url" content="[^"]*">/,
      `<meta property="og:url" content="${canonical}">`
    );
  }
  return html.replace(
    /(<meta property="og:type"[^>]*>)/,
    `$1\n  <meta property="og:url" content="${canonical}">`
  );
}

function ensureOgImage(html, ogImage) {
  if (/property="og:image"/.test(html)) {
    return html.replace(
      /<meta property="og:image" content="[^"]*">/,
      `<meta property="og:image" content="${ogImage}">`
    );
  }
  return html.replace(
    /(<meta property="og:url"[^>]*>)/,
    `$1\n  <meta property="og:image" content="${ogImage}">`
  );
}

function ensureTwitterImage(html, ogImage) {
  if (/name="twitter:image"/.test(html)) {
    return html.replace(
      /<meta name="twitter:image" content="[^"]*">/,
      `<meta name="twitter:image" content="${ogImage}">`
    );
  }
  return html.replace(
    /(<meta name="twitter:card"[^>]*>)/,
    `$1\n  <meta name="twitter:image" content="${ogImage}">`
  );
}

function ensureMetaByName(html, name, content, anchorPattern) {
  const escapedName = name.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  const tagRe = new RegExp(`<meta name="${escapedName}" content="[^"]*">`);
  if (tagRe.test(html)) {
    return html.replace(tagRe, `<meta name="${name}" content="${content}">`);
  }
  return html.replace(anchorPattern, `$1\n  <meta name="${name}" content="${content}">`);
}

function ensureMetaByProperty(html, property, content, anchorPattern) {
  const escapedProperty = property.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  const tagRe = new RegExp(`<meta property="${escapedProperty}" content="[^"]*">`);
  if (tagRe.test(html)) {
    return html.replace(tagRe, `<meta property="${property}" content="${content}">`);
  }
  return html.replace(anchorPattern, `$1\n  <meta property="${property}" content="${content}">`);
}

function ensureJsonLdStringField(html, field, content) {
  const escapedField = field.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  const fieldRe = new RegExp(`("${escapedField}"\\s*:\\s*")[^"]*(")`);
  if (!fieldRe.test(html)) return html;
  return html.replace(fieldRe, `$1${content}$2`);
}

function getTitle(html) {
  const match = html.match(/<title>([^<]*)<\/title>/);
  return match ? match[1] : SITE_NAME;
}

function getDescription(html) {
  const match = html.match(/<meta name="description" content="([^"]*)">/);
  return match ? match[1] : '';
}

function injectHtml(file) {
  const fp = path.join(root, file);
  if (!fs.existsSync(fp)) return;
  const canonical = originNoSlash + PAGE_PATHS[file];
  const ogImage = `${originNoSlash}/images/portraits/portrait.jpg`;
  let s = fs.readFileSync(fp, 'utf8');
  const title = getTitle(s);
  const description = getDescription(s);
  s = ensureCanonical(s, canonical);
  s = ensureOgUrl(s, canonical);
  s = ensureOgImage(s, ogImage);
  s = ensureMetaByName(
    s,
    'twitter:card',
    'summary_large_image',
    /(<meta property="og:site_name"[^>]*>)/
  );
  s = ensureTwitterImage(s, ogImage);
  s = ensureMetaByProperty(s, 'og:site_name', SITE_NAME, /(<meta property="og:image"[^>]*>)/);
  s = ensureMetaByName(s, 'twitter:title', title, /(<meta name="twitter:card"[^>]*>)/);
  s = ensureMetaByName(s, 'twitter:description', description, /(<meta name="twitter:title"[^>]*>)/);
  s = ensureMetaByName(
    s,
    'twitter:creator',
    TWITTER_HANDLE,
    /(<meta name="twitter:description"[^>]*>)/
  );
  s = ensureMetaByName(s, 'twitter:site', TWITTER_HANDLE, /(<meta name="twitter:creator"[^>]*>)/);
  s = ensureMetaByName(s, 'author', SITE_NAME, /(<link rel="apple-touch-icon"[^>]*>)/);
  // Keep structured data image URLs aligned with OG/Twitter tags so share previews and JSON-LD do not drift.
  s = ensureJsonLdStringField(s, 'image', ogImage);
  fs.writeFileSync(fp, s);
}

for (const file of Object.keys(PAGE_PATHS)) {
  injectHtml(file);
}

const publicPaths = [
  '/',
  '/about',
  '/experience',
  '/writing',
  '/press',
  '/colophon',
  '/resume',
  ...essayPages.map((entry) => entry.publicPath),
];

const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${publicPaths
  .map((p) => {
    const loc = p === '/' ? `${originNoSlash}/` : `${originNoSlash}${p}`;
    const filePath =
      p === '/'
        ? path.join(root, 'index.html')
        : path.join(root, p.replace(/^\//, ''), 'index.html');
    const fallbackPath =
      p === '/' ? path.join(root, 'index.html') : path.join(root, p.replace(/^\//, '') + '.html');
    const statPath = fs.existsSync(filePath) ? filePath : fallbackPath;
    const lastmod = fs.statSync(statPath).mtime.toISOString().slice(0, 10);
    return `  <url>
    <loc>${loc}</loc>
    <lastmod>${lastmod}</lastmod>
    <changefreq>monthly</changefreq>
  </url>`;
  })
  .join('\n')}
</urlset>
`;

fs.writeFileSync(path.join(root, 'sitemap.xml'), sitemap.trim() + '\n');

// User-agent: * is the usual wildcard for any bot that obeys robots.txt.
const robots = `User-agent: *
Allow: /

Disallow: /api/

Sitemap: ${originNoSlash}/sitemap.xml
`;

fs.writeFileSync(path.join(root, 'robots.txt'), robots);

console.log(`SEO inject: ${originNoSlash} (HTML + robots.txt + sitemap.xml)`);
