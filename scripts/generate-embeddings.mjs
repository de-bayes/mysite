/**
 * Build data/embeddings.json for semantic search (commit the output).
 * Run: node scripts/generate-embeddings.mjs (downloads model on first run).
 *
 * Requires @huggingface/transformers (not in package.json; install before running):
 *   npm install @huggingface/transformers
 *
 * The ITEMS list below should stay aligned with the INDEX in js/shared/cmdk.js
 * so that Cmd+K search and any future semantic search surface the same content.
 */

import { readFileSync, writeFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dirname, '..');

// Index must stay aligned with js/shared/cmdk.js (no precomputed _text fields).
const siteDataPath = join(ROOT, 'js', 'shared', 'site-data.js');
const siteDataSrc = readFileSync(siteDataPath, 'utf8');
// new Function matches in-browser evaluation; input is only trusted repo files.
const fn = new Function('window', siteDataSrc + '\nreturn window;');
const siteData = fn({ SITE_DATA: {} }).SITE_DATA;

const hostedEssays = siteData.hostedEssays || [];
const navLinks = siteData.navLinks || [];

const ITEMS = [
  { type: 'Pages', title: 'Home', desc: 'Design, data, and forecasting', url: '/', keys: '' },
  ...navLinks.map((n) => ({
    type: 'Pages',
    title: n.label,
    desc: n.desc || '',
    url: n.href,
    keys: n.keys || '',
  })),
  ...hostedEssays.map((e) => ({
    type: 'Articles',
    title: e.title,
    desc: e.desc,
    url: e.url,
    keys: e.keys || 'essays',
  })),

  // Hand-maintained external blocks: mirror additions in js/shared/cmdk.js INDEX so Cmd+K and embeddings stay aligned.
  // Articles (external)
  {
    type: 'Articles',
    title: 'IL-09: An Election for the Ages',
    desc: 'VoteHub',
    url: 'https://votehub.com/2026/04/01/il-09-an-election-for-the-ages/',
    keys: 'elections il9 primary age generational divide democratic politics biss',
  },
  {
    type: 'Articles',
    title: 'March 17th Preview: Illinois Primary',
    desc: 'VoteHub',
    url: 'https://votehub.com/2026/03/17/march-17th-preview-illinois-primary/',
    keys: 'elections illinois primary',
  },
  {
    type: 'Articles',
    title: 'Guest Post: ETHS Student on the IL-9 Election',
    desc: 'FOIA Gras',
    url: 'https://foiagras.com/p/il9-org-guest-post',
    keys: 'elections il9 prediction markets',
  },
  {
    type: 'Articles',
    title: 'ETHS Students Reflect on Casting First Ballots',
    desc: 'The Daily Northwestern',
    url: 'https://dailynorthwestern.com/2026/03/11/top-stories/eths-students-reflect-on-casting-first-ballots-in-congressional-primary/',
    keys: 'elections voting',
  },
  {
    type: 'Articles',
    title: 'Democratic Candidates Battle for Lead in IL-9 Primary',
    desc: 'The Evanstonian',
    url: 'https://www.evanstonian.net/news/2025/11/21/democratic-candidates-battle-for-lead-in-illinois-ninth-congressional-district-primary/',
    keys: 'elections',
  },
  {
    type: 'Articles',
    title: "Top 4 Candidates in Illinois' 9th Congressional District Race",
    desc: 'The Evanstonian',
    url: 'https://www.evanstonian.net/news/2025/08/15/top-4-candidates-in-illinois-9th-congressional-district-race/',
    keys: 'elections',
  },
  {
    type: 'Articles',
    title: 'Students Reflect on Casting First Ballots in Congressional Primary',
    desc: 'The Evanstonian',
    url: 'https://www.evanstonian.net/news/2026/03/11/students-reflect-on-casting-first-ballots-in-congressional-primary/',
    keys: 'elections voting',
  },
  {
    type: 'Articles',
    title: 'D202 Board Confronts Deficit, Improves Sustainability',
    desc: 'The Evanstonian',
    url: 'https://www.evanstonian.net/news/2026/02/27/school-board-confronts-4-2-million-deficit-while-advancing-sustainability-initiatives/',
    keys: 'education',
  },
  {
    type: 'Articles',
    title: 'District 65 Board Remains at Impasse Over Salem Replacement',
    desc: 'The Evanstonian',
    url: 'https://www.evanstonian.net/news/2026/01/23/district-65-board-remains-at-impasse-over-salem-replacement/',
    keys: 'education',
  },
  {
    type: 'Articles',
    title: 'Finals Return with Familiar 10% Weight',
    desc: 'The Evanstonian',
    url: 'https://www.evanstonian.net/news/2025/12/12/finals-return-with-familiar-10-weight/',
    keys: 'education',
  },
  {
    type: 'Articles',
    title: 'Kits on the Rise: Field Hockey and Swim & Dive Eye State Success',
    desc: 'The Evanstonian',
    url: 'https://www.evanstonian.net/sports/2025/10/24/kits-on-the-rise-field-hockey-and-swim-dive-eye-state-success/',
    keys: 'sports swimming',
  },
  {
    type: 'Articles',
    title: 'Equity or Exclusion? District 65 Draws a Federal Eye',
    desc: 'The Evanstonian',
    url: 'https://www.evanstonian.net/opinion/2025/09/19/equity-or-exclusion-district-65-draws-a-federal-eye/',
    keys: 'education',
  },
  {
    type: 'Articles',
    title: 'Contentious Races Decided in Evanston',
    desc: 'The Evanstonian',
    url: 'https://www.evanstonian.net/news/2025/04/17/contentious-races-decided-in-evanston/',
    keys: 'elections',
  },
  {
    type: 'Articles',
    title: '$2.5 Million Donation Added to the Auditorium Renovations',
    desc: 'The Evanstonian',
    url: 'https://www.evanstonian.net/news/2025/03/14/2-5-million-dollar-donation-added-to-the-auditorium-renovations/',
    keys: 'education',
  },
  {
    type: 'Articles',
    title: "Evanston's Mayoral Race: Biss vs. Boarini",
    desc: 'The Evanstonian',
    url: 'https://www.evanstonian.net/news/2025/02/14/evanston-mayoral-race/',
    keys: 'elections',
  },

  // Press
  {
    type: 'Press',
    title: 'The Open Seat: ETHS Sophomore Aims to Predict Congressional Race',
    desc: 'The Daily Northwestern Podcast',
    url: 'https://podcasts.apple.com/ru/podcast/the-open-seat-eths-sophomore-aims-to-predict/id1156168384?i=1000751106803',
    keys: 'il9cast',
  },
  {
    type: 'Press',
    title: 'IL9Cast Featured as Novel Local Forecasting Tool',
    desc: 'Capitol Fax',
    url: 'https://capitolfax.com/2026/02/09/catching-up-with-the-federal-candidates-35/',
    keys: 'il9cast',
  },
  {
    type: 'Press',
    title: 'ETHS Student Aims to Forecast 9th District Congressional Race',
    desc: 'Evanston Roundtable',
    url: 'https://evanstonroundtable.com/2026/02/10/eths-student-aims-to-forecast-9th-district-congressional-race-using-betting-market-data/',
    keys: 'il9cast prediction markets',
  },

  // Projects
  {
    type: 'Projects',
    title: 'IL9Cast',
    desc: 'Forecasting aggregator for the IL-9 Democratic primary',
    url: 'https://il9.org',
    keys: 'prediction markets polling elections',
  },
  {
    type: 'Projects',
    title: 'Project 2028 Podcast',
    desc: 'Politics and policy podcast reaching 50+ countries',
    url: 'https://podcasts.apple.com/us/podcast/project-2028/id1753137875',
    keys: 'podcast politics',
  },
  {
    type: 'Projects',
    title: 'ManiFed Markets & Manifold Trading',
    desc: 'Play-money peer-to-peer lending platform with trading bots',
    url: 'https://manifold.markets/JeromeHPowell',
    keys: 'prediction markets trading kelly criterion',
  },
  {
    type: 'Projects',
    title: 'Political Science & Policy Project',
    desc: 'Blog covering game theory, constitutional law, and voting theory',
    url: '/experience',
    keys: 'blog pspp',
  },

  // Experience
  {
    type: 'Experience',
    title: 'Student Fellow, Data Science & Decision Desk',
    desc: 'VoteHub',
    url: '/experience',
    keys: 'kalshi forecasting midterms',
  },
  {
    type: 'Experience',
    title: 'Founder & Data Scientist',
    desc: 'IL9Cast',
    url: '/experience',
    keys: 'forecasting prediction markets polling',
  },
  {
    type: 'Experience',
    title: 'Volunteer Finance Lead',
    desc: 'Daniel Biss for Congress (IL-9)',
    url: '/experience',
    keys: 'campaign finance',
  },
  {
    type: 'Experience',
    title: 'Sports Photographer',
    desc: 'Chicago Union (UFA)',
    url: '/experience',
    keys: 'photography ultimate frisbee canon',
  },
  {
    type: 'Experience',
    title: 'ManiFed Markets & Manifold Trading',
    desc: 'Play-money lending platform with trading bots',
    url: '/experience',
    keys: 'prediction markets trading kelly criterion',
  },
  {
    type: 'Experience',
    title: 'Founder & Host',
    desc: 'Project 2028 Podcast',
    url: '/experience',
    keys: 'podcast politics',
  },
];

// Build embed texts
const texts = ITEMS.map((item) => [item.title, item.desc, item.keys].filter(Boolean).join(' '));

console.log('Loading embedding model (first run downloads ~23MB)...');
const { pipeline } = await import('@huggingface/transformers');
const extractor = await pipeline('feature-extraction', 'Xenova/all-MiniLM-L6-v2', { dtype: 'q8' });

console.log(`Embedding ${texts.length} items...`);
const itemEmbeddings = [];
for (let i = 0; i < texts.length; i++) {
  const out = await extractor(texts[i], { pooling: 'mean', normalize: true });
  itemEmbeddings.push(Array.from(out.data));
  process.stdout.write(`  ${i + 1}/${texts.length}\r`);
}
console.log('');

const output = {
  model: 'Xenova/all-MiniLM-L6-v2',
  dimensions: 384,
  generated: new Date().toISOString(),
  items: ITEMS.map((item, i) => ({
    title: item.title,
    desc: item.desc,
    url: item.url,
    type: item.type,
    embedding: itemEmbeddings[i],
  })),
};

const outPath = join(ROOT, 'data', 'embeddings.json');
writeFileSync(outPath, JSON.stringify(output));
console.log(`Wrote ${output.items.length} embeddings to ${outPath}`);
