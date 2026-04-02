/**
 * Generate semantic search embeddings for all searchable content.
 * Requires: OPENAI_API_KEY in environment (or .env file).
 *
 * Usage: node scripts/gen-embeddings.mjs
 *
 * Writes: data/embeddings.json (commit this file — it's static content)
 */

import { readFileSync, writeFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dirname, '..');

if (process.env.NODE_ENV !== 'production') {
    try {
        const { config } = await import('dotenv');
        config({ path: join(ROOT, '.env') });
    } catch {}
}

const API_KEY = process.env.OPENAI_API_KEY;
if (!API_KEY) {
    console.error('Error: OPENAI_API_KEY is not set.');
    process.exit(1);
}

// All searchable content (mirrors cmdk.js INDEX, minus pre-computed _text fields)
const siteDataPath = join(ROOT, 'js', 'site-data.js');
const siteDataSrc = readFileSync(siteDataPath, 'utf8');
// Extract hostedEssays and navLinks by evaluating in a minimal context
const evalCtx = {};
const fn = new Function('window', siteDataSrc + '\nreturn window;');
const siteData = fn({ SITE_DATA: {} }).SITE_DATA;

const hostedEssays = siteData.hostedEssays || [];
const navLinks = siteData.navLinks || [];

const ITEMS = [
    { type: 'Pages', title: 'Home', desc: 'Design, data, and forecasting', url: '/', keys: '' },
    ...navLinks.map(n => ({ type: 'Pages', title: n.label, desc: n.desc || '', url: n.href, keys: n.keys || '' })),
    ...hostedEssays.map(e => ({ type: 'Articles', title: e.title, desc: e.desc, url: e.url, keys: e.keys || 'essays' })),

    // Articles (external)
    { type: 'Articles', title: 'March 17th Preview: Illinois Primary', desc: 'VoteHub', url: 'https://votehub.com/2026/03/17/march-17th-preview-illinois-primary/', keys: 'elections illinois primary' },
    { type: 'Articles', title: 'Guest Post: ETHS Student on the IL-9 Election', desc: 'FOIAgras', url: 'https://foiagras.com/p/il9-org-guest-post', keys: 'elections il9 prediction markets' },
    { type: 'Articles', title: 'ETHS Students Reflect on Casting First Ballots', desc: 'The Daily Northwestern', url: 'https://dailynorthwestern.com/2026/03/11/top-stories/eths-students-reflect-on-casting-first-ballots-in-congressional-primary/', keys: 'elections voting' },
    { type: 'Articles', title: 'Democratic Candidates Battle for Lead in IL-9 Primary', desc: 'The Evanstonian', url: 'https://www.evanstonian.net/news/2025/11/21/democratic-candidates-battle-for-lead-in-illinois-ninth-congressional-district-primary/', keys: 'elections' },
    { type: 'Articles', title: 'Top 4 Candidates in Illinois\' 9th Congressional District Race', desc: 'The Evanstonian', url: 'https://www.evanstonian.net/news/2025/08/15/top-4-candidates-in-illinois-9th-congressional-district-race/', keys: 'elections' },

    // Press
    { type: 'Press', title: 'The Open Seat: ETHS Sophomore Aims to Predict Congressional Race', desc: 'The Daily Northwestern Podcast', url: 'https://podcasts.apple.com/ru/podcast/the-open-seat-eths-sophomore-aims-to-predict/id1156168384?i=1000751106803', keys: 'il9cast' },
    { type: 'Press', title: 'IL9Cast Featured as Novel Local Forecasting Tool', desc: 'Capitol Fax', url: 'https://capitolfax.com/2026/02/09/catching-up-with-the-federal-candidates-35/', keys: 'il9cast' },
    { type: 'Press', title: 'ETHS Student Aims to Forecast 9th District Congressional Race', desc: 'Evanston Roundtable', url: 'https://evanstonroundtable.com/2026/02/10/eths-student-aims-to-forecast-9th-district-congressional-race-using-betting-market-data/', keys: 'il9cast prediction markets' },

    // Projects
    { type: 'Projects', title: 'IL9Cast', desc: 'Forecasting aggregator for the IL-9 Democratic primary', url: 'https://il9.org', keys: 'prediction markets polling elections' },
    { type: 'Projects', title: 'Project 2028 Podcast', desc: 'Politics and policy podcast reaching 50+ countries', url: 'https://podcasts.apple.com/us/podcast/project-2028/id1753137875', keys: 'podcast politics' },

    // Experience
    { type: 'Experience', title: 'Student Fellow, Data Science & Decision Desk', desc: 'VoteHub', url: '/experience', keys: 'kalshi forecasting midterms' },
    { type: 'Experience', title: 'Founder & Data Scientist', desc: 'IL9Cast', url: '/experience', keys: 'forecasting prediction markets polling' },
    { type: 'Experience', title: 'Sports Photographer', desc: 'Chicago Union (UFA)', url: '/experience', keys: 'photography ultimate frisbee canon' },
];

// Build embed texts
const texts = ITEMS.map(item => [item.title, item.desc, item.keys].filter(Boolean).join(' '));

console.log(`Embedding ${texts.length} items...`);

const resp = await fetch('https://api.openai.com/v1/embeddings', {
    method: 'POST',
    headers: {
        'Authorization': `Bearer ${API_KEY}`,
        'Content-Type': 'application/json',
    },
    body: JSON.stringify({
        model: 'text-embedding-3-small',
        input: texts,
        dimensions: 512,
    }),
});

if (!resp.ok) {
    const err = await resp.text();
    console.error('OpenAI API error:', resp.status, err);
    process.exit(1);
}

const data = await resp.json();
const embeddings = data.data; // [{index, embedding}]

const output = {
    model: 'text-embedding-3-small',
    dimensions: 512,
    generated: new Date().toISOString(),
    items: ITEMS.map((item, i) => ({
        title: item.title,
        desc: item.desc,
        url: item.url,
        type: item.type,
        embedding: embeddings[i].embedding,
    })),
};

const outPath = join(ROOT, 'data', 'embeddings.json');
writeFileSync(outPath, JSON.stringify(output));
console.log(`Wrote ${output.items.length} embeddings to ${outPath}`);
console.log(`Usage: ${data.usage.total_tokens} tokens`);
