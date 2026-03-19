#!/usr/bin/env node
/**
 * Syncs canonical, Open Graph, and Twitter image URLs from site-origin.json
 * into HTML files, and regenerates robots.txt + sitemap.xml.
 * Idempotent — safe to run multiple times.
 *
 * Run: node scripts/seo-inject.mjs   or   npm run seo:inject
 */
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.join(__dirname, '..');
const configPath = path.join(root, 'site-origin.json');
const { origin } = JSON.parse(fs.readFileSync(configPath, 'utf8'));
if (!origin || typeof origin !== 'string' || !origin.startsWith('http')) {
  console.error('site-origin.json must contain a string "origin" like https://example.com');
  process.exit(1);
}
const originNoSlash = origin.replace(/\/$/, '');

const PAGE_PATHS = {
  'index.html': '/',
  'about.html': '/about',
  'experience.html': '/experience',
  'writing.html': '/writing',
  'press.html': '/press',
  'now.html': '/now',
  'racecalls.html': '/racecalls',
  'admin.html': '/admin',
  'resume.html': '/resume',
  '404.html': '/',
};

function ensureCanonical(html, canonical) {
  if (/<link rel="canonical"/.test(html)) {
    return html.replace(/<link rel="canonical" href="[^"]*">/, `<link rel="canonical" href="${canonical}">`);
  }
  if (/<meta name="description"/.test(html)) {
    return html.replace(
      /(<meta name="description"[^>]*>)/,
      `$1\n  <link rel="canonical" href="${canonical}">`
    );
  }
  return html.replace(
    /(<\/title>\s*\n)/,
    `$1  <link rel="canonical" href="${canonical}">\n`
  );
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

function injectHtml(file) {
  const fp = path.join(root, file);
  if (!fs.existsSync(fp)) return;
  const canonical = originNoSlash + PAGE_PATHS[file];
  const ogImage = `${originNoSlash}/portrait.jpg`;
  let s = fs.readFileSync(fp, 'utf8');
  s = ensureCanonical(s, canonical);
  s = ensureOgUrl(s, canonical);
  s = ensureOgImage(s, ogImage);
  s = ensureTwitterImage(s, ogImage);
  fs.writeFileSync(fp, s);
}

for (const file of Object.keys(PAGE_PATHS)) {
  injectHtml(file);
}

const publicPaths = ['/', '/about', '/experience', '/writing', '/press', '/now', '/racecalls', '/resume'];

const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${publicPaths
  .map((p) => {
    const loc = p === '/' ? `${originNoSlash}/` : `${originNoSlash}${p}`;
    return `  <url>
    <loc>${loc}</loc>
    <changefreq>monthly</changefreq>
  </url>`;
  })
  .join('\n')}
</urlset>
`;

fs.writeFileSync(path.join(root, 'sitemap.xml'), sitemap.trim() + '\n');

const robots = `User-agent: *
Allow: /

Disallow: /admin

Sitemap: ${originNoSlash}/sitemap.xml
`;

fs.writeFileSync(path.join(root, 'robots.txt'), robots);

console.log(`SEO inject: ${originNoSlash} (HTML + robots.txt + sitemap.xml)`);
