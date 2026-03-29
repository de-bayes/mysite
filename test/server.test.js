const test = require('node:test');
const assert = require('node:assert/strict');
const request = require('supertest');

process.env.NODE_ENV = 'test';
process.env.CLOUD_PASSWORD = 'test-password';

const app = require('../server');

test('home page renders', async () => {
  const response = await request(app).get('/');
  assert.equal(response.status, 200);
  assert.match(response.text, /<title>Ryan McComb \| VoteHub, Elections, and Forecasting<\/title>/);
  assert.match(response.text, /"@type": "WebSite"/);
  assert.match(response.text, /"@type": "Person"/);
  assert.match(response.text, /VoteHub Student Fellow/);
});

test('about page includes branded bio and profile structured data', async () => {
  const response = await request(app).get('/about');
  assert.equal(response.status, 200);
  assert.match(response.text, /About Ryan McComb \| VoteHub, Elections, and @ryanjmccomb/);
  assert.match(response.text, /"@type": "ProfilePage"/);
  assert.match(response.text, /https:\/\/x\.com\/ryanjmccomb/);
});

test('writing index renders hosted essay links', async () => {
  const response = await request(app).get('/writing');
  assert.equal(response.status, 200);
  assert.match(response.text, /data-url="\/writing\/il9cast-postmortem\/"/);
  assert.match(response.text, /<a class="writing-card-link" href="\/writing\/il9cast-postmortem\/">/);
  assert.match(response.text, /"@type": "CollectionPage"/);
});

test('hosted essay route renders shareable page', async () => {
  const response = await request(app).get('/writing/il9cast-postmortem/');
  assert.equal(response.status, 200);
  assert.match(response.text, /IL9Cast Post-Mortem/);
  assert.match(response.text, /https:\/\/ryanjmccomb\.com\/writing\/il9cast-postmortem\//);
  assert.match(response.text, /"@type": "Article"/);
  assert.match(response.text, /article:published_time/);
});

test('race calls API returns JSON array', async () => {
  const response = await request(app).get('/api/racecalls');
  assert.equal(response.status, 200);
  assert.equal(Array.isArray(response.body), true);
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

test('sitemap includes article URLs and lastmod timestamps', async () => {
  const response = await request(app).get('/sitemap.xml');
  assert.equal(response.status, 200);
  assert.match(response.text, /<lastmod>\d{4}-\d{2}-\d{2}<\/lastmod>/);
  assert.match(response.text, /https:\/\/ryanjmccomb\.com\/writing\/il9cast-postmortem\//);
  assert.match(response.text, /https:\/\/ryanjmccomb\.com\/writing\/peoples-edict\//);
});

test('press page exposes crawlable links and collection schema', async () => {
  const response = await request(app).get('/press');
  assert.equal(response.status, 200);
  assert.match(response.text, /Ryan McComb Press \| VoteHub, IL9Cast, and Elections Coverage/);
  assert.match(response.text, /<a class="writing-card-link" href="https:\/\/capitolfax\.com\/2026\/02\/09\/catching-up-with-the-federal-candidates-35\/"/);
  assert.match(response.text, /"@type": "CollectionPage"/);
});

test('unknown routes return the custom 404 page', async () => {
  const response = await request(app).get('/definitely-not-a-real-page');
  assert.equal(response.status, 404);
  assert.match(response.text, /Page not found/);
});
