const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const request = require('supertest');

process.env.NODE_ENV = 'test';
process.env.CLOUD_PASSWORD = 'test-password';

const app = require('../server');
const ROOT = path.join(__dirname, '..');

test('home page renders', async () => {
  const response = await request(app).get('/');
  assert.equal(response.status, 200);
  assert.match(response.text, /<title>Ryan McComb \|/);
  assert.match(response.text, /"@type": "WebSite"/);
  assert.match(response.text, /"@type": "Person"/);
  assert.match(response.text, /VoteHub Student Fellow/);
});

test('about page includes branded bio and profile structured data', async () => {
  const response = await request(app).get('/about');
  assert.equal(response.status, 200);
  assert.match(response.text, /Ryan McComb/);
  assert.match(response.text, /"@type": "ProfilePage"/);
  assert.match(response.text, /https:\/\/x\.com\/RyanJMcComb/);
  assert.match(response.text, /<script src="js\/pages\/about\.js"><\/script>/);
  assert.doesNotMatch(response.text, /href="\/racecalls"/);
  assert.doesNotMatch(response.text, /href="\/resume"/);
});

test('about portrait fallback points at an existing asset', async () => {
  const response = await request(app).get('/about');
  assert.equal(response.status, 200);
  const srcMatch = response.text.match(/<img src="([^"]*about-portrait[^"]*)"/);
  assert.ok(srcMatch, 'missing about portrait fallback image');

  const imageResponse = await request(app).get('/' + srcMatch[1]);
  assert.equal(imageResponse.status, 200);
});

test('writing index renders hosted essay links', async () => {
  const response = await request(app).get('/writing');
  assert.equal(response.status, 200);
  assert.match(response.text, /data-url="\/writing\/il9cast-postmortem\/"/);
  assert.match(
    response.text,
    /<a class="writing-card-link" href="\/writing\/il9cast-postmortem\/">/
  );
  assert.match(response.text, /"@type": "CollectionPage"/);
});

test('hosted essay route renders shareable page', async () => {
  const response = await request(app).get('/writing/il9cast-postmortem/');
  assert.equal(response.status, 200);
  assert.match(response.text, /IL9Cast Post-Mortem/);
  assert.match(response.text, /https:\/\/mccomb\.ca\/writing\/il9cast-postmortem\//);
  assert.match(response.text, /"@type": "Article"/);
  assert.match(response.text, /article:published_time/);
});

test('essay structured data image URLs stay valid', async () => {
  for (const slug of [
    'il9cast-postmortem',
    'median-voter-theory',
    'nsa-surveillance',
    'peoples-edict',
  ]) {
    const response = await request(app).get(`/writing/${slug}/`);
    assert.equal(response.status, 200);
    const imageMatch = response.text.match(/"image": "([^"]+)"/);
    assert.ok(imageMatch, `missing JSON-LD image for ${slug}`);
    assert.equal(imageMatch[1], 'https://mccomb.ca/images/portraits/portrait.jpg');
  }
});

test('/racecalls redirects to home', async () => {
  const response = await request(app).get('/racecalls');
  assert.equal(response.status, 301);
  assert.equal(response.headers.location, '/');
});

test('/racecalls/ redirects to home', async () => {
  const response = await request(app).get('/racecalls/');
  assert.equal(response.status, 301);
  assert.equal(response.headers.location, '/');
});

test('/now redirects to home', async () => {
  const response = await request(app).get('/now');
  assert.equal(response.status, 301);
  assert.equal(response.headers.location, '/');
});

test('/now/ redirects to home', async () => {
  const response = await request(app).get('/now/');
  assert.equal(response.status, 301);
  assert.equal(response.headers.location, '/');
});

test('archive tree is not publicly served', async () => {
  const response = await request(app).get('/archive/now-page/now.html');
  assert.equal(response.status, 404);
});

test('/admin redirects to home', async () => {
  const response = await request(app).get('/admin');
  assert.equal(response.status, 301);
  assert.equal(response.headers.location, '/');
});

test('/admin/ redirects to home', async () => {
  const response = await request(app).get('/admin/');
  assert.equal(response.status, 301);
  assert.equal(response.headers.location, '/');
});

test('/resume redirects to home', async () => {
  const response = await request(app).get('/resume');
  assert.equal(response.status, 301);
  assert.equal(response.headers.location, '/');
});

test('/resume/ redirects to home', async () => {
  const response = await request(app).get('/resume/');
  assert.equal(response.status, 301);
  assert.equal(response.headers.location, '/');
});

test('racecalls summary JSON is served at stable public URL', async () => {
  const response = await request(app).get('/racecalls-summary.json');
  assert.equal(response.status, 200);
  const body = JSON.parse(response.text);
  assert.ok(typeof body.nowRecord === 'string');
  assert.ok('nowAccuracy' in body);
  assert.ok(typeof body.aboutContactValue === 'string');
});

test('site-data tree is not publicly served', async () => {
  const response = await request(app).get('/site-data/site-origin.json');
  assert.equal(response.status, 404);
});

test('api source tree is not publicly served', async () => {
  const response = await request(app).get('/api/index.js');
  assert.equal(response.status, 404);
});

test('express static cache headers match deployment config', async () => {
  const css = await request(app).get('/style.css');
  assert.equal(css.status, 200);
  assert.equal(css.headers['cache-control'], 'no-cache, must-revalidate');

  const js = await request(app).get('/js/shared/nav.js');
  assert.equal(js.status, 200);
  assert.equal(js.headers['cache-control'], 'no-cache, must-revalidate');

  const image = await request(app).get('/images/portraits/portrait.jpg');
  assert.equal(image.status, 200);
  assert.equal(image.headers['cache-control'], 'public, max-age=31536000, immutable');
});

test('canonical redirects collapse .html and slash variants', async () => {
  const aboutHtml = await request(app).get('/about.html');
  assert.equal(aboutHtml.status, 301);
  assert.equal(aboutHtml.headers.location, '/about');

  const writingSlash = await request(app).get('/writing/');
  assert.equal(writingSlash.status, 301);
  assert.equal(writingSlash.headers.location, '/writing');

  const essayNoSlash = await request(app).get('/writing/il9cast-postmortem');
  assert.equal(essayNoSlash.status, 301);
  assert.equal(essayNoSlash.headers.location, '/writing/il9cast-postmortem/');

  const essayIndex = await request(app).get('/writing/il9cast-postmortem/index.html');
  assert.equal(essayIndex.status, 301);
  assert.equal(essayIndex.headers.location, '/writing/il9cast-postmortem/');
});

test('resume API requires auth', async () => {
  const response = await request(app).get('/api/resume');
  assert.equal(response.status, 401);
  assert.equal(response.body.error, 'Unauthorized');
});

test('sitemap includes article URLs', async () => {
  const response = await request(app).get('/sitemap.xml');
  assert.equal(response.status, 200);
  assert.ok(!response.text.includes('mccomb.ca/now'));
  assert.ok(!response.text.includes('mccomb.ca/colophon'));
  assert.match(response.text, /https:\/\/mccomb\.ca\/writing\/il9cast-postmortem\//);
  assert.match(response.text, /https:\/\/mccomb\.ca\/writing\/peoples-edict\//);
});

test('press page exposes crawlable links and collection schema', async () => {
  const response = await request(app).get('/press');
  assert.equal(response.status, 200);
  assert.match(response.text, /Press.*Ryan McComb|Ryan McComb.*Press/);
  assert.match(
    response.text,
    /<a class="writing-card-link" href="https:\/\/capitolfax\.com\/2026\/02\/09\/catching-up-with-the-federal-candidates-35\/"/
  );
  assert.match(response.text, /"@type": "CollectionPage"/);
});

test('unknown routes return the custom 404 page', async () => {
  const response = await request(app).get('/definitely-not-a-real-page');
  assert.equal(response.status, 404);
  assert.match(response.text, /Page not found/);
});

test('nested 404 page uses root-relative assets', async () => {
  const response = await request(app).get('/deep/missing/page');
  assert.equal(response.status, 404);
  assert.match(response.text, /href="\/style\.css"/);
  assert.match(response.text, /src="\/js\/pages\/bayes-404\.js"/);
  assert.doesNotMatch(response.text, /href="style\.css"/);
  assert.doesNotMatch(response.text, /src="js\//);
});

test('photos page keeps its dedicated social preview image', async () => {
  const html = fs.readFileSync(path.join(ROOT, 'photos.html'), 'utf8');
  assert.match(
    html,
    /<meta property="og:image" content="https:\/\/mccomb\.ca\/images\/og\/og-photos\.jpg">/
  );
  assert.match(
    html,
    /<meta name="twitter:image" content="https:\/\/mccomb\.ca\/images\/og\/og-photos\.jpg">/
  );

  const seoInject = fs.readFileSync(path.join(ROOT, 'scripts', 'seo-inject.mjs'), 'utf8');
  assert.match(seoInject, /'photos\.html': '\/images\/og\/og-photos\.jpg'/);
});

test('vercel routes production traffic through the Express app', () => {
  const config = JSON.parse(fs.readFileSync(path.join(ROOT, 'vercel.json'), 'utf8'));
  assert.equal('trailingSlash' in config, false);
  assert.deepEqual(config.rewrites, [{ source: '/(.*)', destination: '/api' }]);
  assert.ok(fs.existsSync(path.join(ROOT, 'api', 'index.js')));
});
