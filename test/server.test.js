const test = require('node:test');
const assert = require('node:assert/strict');
const request = require('supertest');

process.env.NODE_ENV = 'test';
process.env.CLOUD_PASSWORD = 'test-password';

const app = require('../server');

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
  assert.match(response.text, /id="rc-about-contact-value"/);
  assert.match(response.text, /<script src="js\/pages\/about\.js"><\/script>/);
  assert.doesNotMatch(response.text, /href="\/racecalls"/);
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
  assert.match(response.text, /https:\/\/mccomb\.ca\/colophon/);
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
