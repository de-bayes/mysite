if (process.env.NODE_ENV !== 'production') require('dotenv').config();

const crypto = require('crypto');
const express = require('express');
const path = require('path');
const fs = require('fs');
const fsp = fs.promises;
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');

const NODE_ENV = process.env.NODE_ENV || 'development';
const TRUST_LOCALHOST_AUTH = process.env.TRUST_LOCALHOST_AUTH === 'true';
const app = express();
if (NODE_ENV === 'production') {
    app.set('trust proxy', 1);
}
const PORT = process.env.PORT || 5001;
const CLOUD_PASSWORD = process.env.CLOUD_PASSWORD;
const DATA_DIR = fs.existsSync('/data') ? '/data' : process.env.VERCEL ? '/tmp/data' : path.join(__dirname, 'data');
const RACECALLS_FILE = path.join(DATA_DIR, 'racecalls.json');
const WRITING_DIR = path.join(__dirname, 'writing');

fs.mkdirSync(DATA_DIR, { recursive: true });

function readJSONSync(filePath, fallback) {
    try {
        if (fs.existsSync(filePath)) return JSON.parse(fs.readFileSync(filePath, 'utf8'));
    } catch (err) { console.error(`Failed to read/parse JSON file ${filePath}:`, err); }
    return fallback;
}

function writeJSONSync(filePath, data) {
    fs.writeFileSync(filePath, JSON.stringify(data, null, 2));
}

async function readJSON(filePath, fallback) {
    try {
        const data = await fsp.readFile(filePath, 'utf8');
        return JSON.parse(data);
    } catch (err) {
        if (err.code !== 'ENOENT') console.error(`Failed to read/parse JSON file ${filePath}:`, err);
    }
    return fallback;
}

async function writeJSON(filePath, data) {
    await fsp.writeFile(filePath, JSON.stringify(data, null, 2));
}

// Seed race calls if file doesn't exist
if (!fs.existsSync(RACECALLS_FILE)) {
    writeJSONSync(RACECALLS_FILE, [{
        id: 'm7x8k1a2b3',
        race: 'IL-09 Dem Primary',
        date: '2026-03-17T00:00:00.000Z',
        calledFor: 'Daniel Biss',
        result: 'correct',
        notes: '',
        raceType: 'house',
        isPrimary: true,
        state: 'IL',
        margin: null,
        callers: { votehub: false, ap: true, nyt: true, ddhq: true },
        firstCaller: 'ap',
        sourceUrl: '',
        primaryParty: '',
        created: '2026-03-17T00:00:00.000Z'
    }]);
}

const CALLER_DESKS = ['ap', 'nyt', 'ddhq', 'votehub'];
const VALID_RACE_TYPES = ['presidential', 'senate', 'house', 'governor', 'state_senate', 'state_house', 'other'];
const CANONICAL_TOP_LEVEL_PATHS = new Set(['/about', '/experience', '/writing', '/press', '/racecalls', '/resume', '/admin']);

function getWritingPages() {
    if (!fs.existsSync(WRITING_DIR)) return new Map();
    return new Map(
        fs.readdirSync(WRITING_DIR, { withFileTypes: true })
            .filter((entry) => entry.isDirectory())
            .map((entry) => [entry.name, path.join(WRITING_DIR, entry.name, 'index.html')])
            .filter(([, filePath]) => fs.existsSync(filePath))
    );
}

const WRITING_PAGES = getWritingPages();

function callersFromFirstCaller(firstCaller) {
    const callers = { ap: false, nyt: false, ddhq: false, votehub: false };
    if (CALLER_DESKS.includes(firstCaller)) callers[firstCaller] = true;
    return callers;
}

const isLocalhost = (req) => {
    const host = req.hostname || req.headers.host || '';
    return host === 'localhost' || host === '127.0.0.1' || host.startsWith('localhost:') || host.startsWith('127.0.0.1:');
};

/** In production, localhost-only auth bypass requires TRUST_LOCALHOST_AUTH=true */
function allowLocalhostAuthBypass(req) {
    return isLocalhost(req) && (NODE_ENV !== 'production' || TRUST_LOCALHOST_AUTH);
}

function requireAuth(req, res, next) {
    if (!CLOUD_PASSWORD && allowLocalhostAuthBypass(req)) return next();
    if (!CLOUD_PASSWORD) {
        return res.status(503).json({ error: 'Cloud storage not configured' });
    }
    const auth = req.headers.authorization;
    if (!auth || !auth.startsWith('Bearer ')) {
        return res.status(401).json({ error: 'Unauthorized' });
    }
    const token = auth.slice(7);
    if (token.length !== CLOUD_PASSWORD.length ||
        !crypto.timingSafeEqual(Buffer.from(token), Buffer.from(CLOUD_PASSWORD))) {
        return res.status(401).json({ error: 'Unauthorized' });
    }
    next();
}

app.use(helmet({
    contentSecurityPolicy: {
        directives: {
            defaultSrc: ["'self'"],
            scriptSrc: ["'self'"],
            styleSrc: ["'self'", "'unsafe-inline'"],
            imgSrc: ["'self'"],
            fontSrc: ["'self'"],
            connectSrc: ["'self'"],
            objectSrc: ["'none'"],
            frameAncestors: ["'none'"],
            baseUri: ["'self'"],
            formAction: ["'self'"]
        }
    },
    crossOriginEmbedderPolicy: false
}));

app.use(express.json());

const apiLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 300,
    standardHeaders: true,
    legacyHeaders: false
});

const authLimiter = rateLimit({
    windowMs: 60 * 60 * 1000,
    max: 50,
    standardHeaders: true,
    legacyHeaders: false,
    message: { error: 'Too many login attempts, try again later' }
});

const apiWriteLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 120,
    standardHeaders: true,
    legacyHeaders: false,
    message: { error: 'Too many write requests, try again later' }
});

app.use('/api/', apiLimiter);

app.post('/api/auth', authLimiter, (req, res) => {
    if (!CLOUD_PASSWORD && allowLocalhostAuthBypass(req)) {
        return res.json({ ok: true });
    }
    if (!CLOUD_PASSWORD) {
        return res.status(503).json({ error: 'Cloud storage not configured' });
    }
    const submitted = String(req.body.password || '');
    if (submitted.length === CLOUD_PASSWORD.length &&
        crypto.timingSafeEqual(Buffer.from(submitted), Buffer.from(CLOUD_PASSWORD))) {
        return res.json({ ok: true });
    }
    return res.status(401).json({ error: 'Wrong password' });
});

// =============================================
// RESUME (read/write resume.html)
// =============================================
const RESUME_FILE = path.join(__dirname, 'resume.html');

app.get('/api/resume', requireAuth, async (req, res) => {
    try {
        const html = await fsp.readFile(RESUME_FILE, 'utf8');
        // Extract just the resume-inner content
        // resume-inner closes, then resume-paper + resume-shell; optional </main> before flag-footer (site chrome)
        const resumeInnerEnd = /<div class="resume-inner">([\s\S]*?)<\/div>\s*<\/div>\s*<\/div>\s*(?:<\/main>\s*)?<div class="flag-footer">/;
        const match = html.match(resumeInnerEnd);
        if (match) {
            return res.json({ content: match[1].trim() });
        }
        return res.json({ content: '' });
    } catch (err) {
        console.error('Failed to read resume:', err);
        return res.status(500).json({ error: 'Failed to read resume' });
    }
});

app.put('/api/resume', apiWriteLimiter, requireAuth, async (req, res) => {
    const content = String(req.body.content || '').trim();
    if (!content) return res.status(400).json({ error: 'Content required' });
    try {
        let html = await fsp.readFile(RESUME_FILE, 'utf8');
        const resumePutRe = /(<div class="resume-inner">)([\s\S]*?)(<\/div>\s*<\/div>\s*<\/div>\s*(?:<\/main>\s*)?<div class="flag-footer">)/;
        html = html.replace(resumePutRe, '$1\n' + content + '\n            $3');
        await fsp.writeFile(RESUME_FILE, html);
        return res.json({ ok: true });
    } catch (err) {
        console.error('Failed to save resume:', err);
        return res.status(500).json({ error: 'Failed to save resume' });
    }
});

// =============================================
// RACE CALL RECORDS
// =============================================
app.get('/api/racecalls', async (req, res) => {
    const calls = await readJSON(RACECALLS_FILE, []);
    return res.json(calls);
});

app.post('/api/racecalls', apiWriteLimiter, requireAuth, async (req, res) => {
    const race = String(req.body.race || '').trim().slice(0, 200);
    const date = String(req.body.date || '').trim();
    const calledFor = String(req.body.calledFor || '').trim().slice(0, 100);
    const result = String(req.body.result || '').trim().slice(0, 20);
    const notes = String(req.body.notes || '').trim().slice(0, 500);
    if (!race || !date || !calledFor) return res.status(400).json({ error: 'Race, date, and called-for candidate required' });
    if (isNaN(new Date(date).getTime())) return res.status(400).json({ error: 'Invalid date' });
    if (!['correct', 'incorrect', 'pending'].includes(result)) return res.status(400).json({ error: 'Result must be correct, incorrect, or pending' });

    // New fields
    const raceType = VALID_RACE_TYPES.includes(req.body.raceType) ? req.body.raceType : 'other';
    const rawParty = String(req.body.primaryParty || '').trim().toLowerCase();
    const primaryParty = rawParty === 'dem' || rawParty === 'rep' ? rawParty : '';
    const isPrimary = !!req.body.isPrimary || primaryParty !== '';
    const state = String(req.body.state || '').trim().slice(0, 2).toUpperCase();
    if (raceType !== 'presidential' && !state) return res.status(400).json({ error: 'State is required for non-presidential races' });
    const margin = req.body.margin !== null && req.body.margin !== undefined && req.body.margin !== '' ? parseFloat(req.body.margin) : null;
    const firstCaller = CALLER_DESKS.includes(req.body.firstCaller) ? req.body.firstCaller : '';
    const callers = callersFromFirstCaller(firstCaller);
    const sourceUrl = String(req.body.sourceUrl || '').trim().slice(0, 500);

    const calls = await readJSON(RACECALLS_FILE, []);
    calls.unshift({
        id: crypto.randomUUID(),
        race, date, calledFor, result, notes,
        raceType, isPrimary, primaryParty, state, margin, callers, firstCaller,
        sourceUrl,
        created: new Date().toISOString()
    });
    calls.sort((a, b) => new Date(b.date) - new Date(a.date));
    await writeJSON(RACECALLS_FILE, calls);
    return res.json({ ok: true });
});

app.put('/api/racecalls/:id', apiWriteLimiter, requireAuth, async (req, res) => {
    const calls = await readJSON(RACECALLS_FILE, []);
    const idx = calls.findIndex(c => c.id === req.params.id);
    if (idx === -1) return res.status(404).json({ error: 'Not found' });

    if (req.body.race) calls[idx].race = String(req.body.race).trim().slice(0, 200);
    if (req.body.date) calls[idx].date = String(req.body.date).trim();
    if (req.body.calledFor) calls[idx].calledFor = String(req.body.calledFor).trim().slice(0, 100);
    if (req.body.result) calls[idx].result = String(req.body.result).trim().slice(0, 20);
    if (req.body.notes !== undefined) calls[idx].notes = String(req.body.notes).trim().slice(0, 500);

    // New fields
    if (req.body.raceType !== undefined && VALID_RACE_TYPES.includes(req.body.raceType)) {
        calls[idx].raceType = req.body.raceType;
    }
    if (req.body.isPrimary !== undefined) calls[idx].isPrimary = !!req.body.isPrimary;
    if (req.body.primaryParty !== undefined) {
        const p = String(req.body.primaryParty || '').trim().toLowerCase();
        calls[idx].primaryParty = p === 'dem' || p === 'rep' ? p : '';
    }
    if (req.body.state !== undefined) calls[idx].state = String(req.body.state).trim().slice(0, 2).toUpperCase();
    if (req.body.margin !== undefined) {
        calls[idx].margin = req.body.margin !== null && req.body.margin !== '' ? parseFloat(req.body.margin) : null;
    }
    if (req.body.firstCaller !== undefined) {
        calls[idx].firstCaller = CALLER_DESKS.includes(req.body.firstCaller) ? req.body.firstCaller : '';
        calls[idx].callers = callersFromFirstCaller(calls[idx].firstCaller);
    } else if (req.body.callers !== undefined) {
        const callers = {};
        CALLER_DESKS.forEach(k => { callers[k] = !!(req.body.callers && req.body.callers[k]); });
        calls[idx].callers = callers;
    }
    if (req.body.sourceUrl !== undefined) {
        calls[idx].sourceUrl = String(req.body.sourceUrl || '').trim().slice(0, 500);
    }

    await writeJSON(RACECALLS_FILE, calls);
    return res.json({ ok: true });
});

app.delete('/api/racecalls/:id', apiWriteLimiter, requireAuth, async (req, res) => {
    const calls = await readJSON(RACECALLS_FILE, []);
    const filtered = calls.filter(c => c.id !== req.params.id);
    if (filtered.length === calls.length) return res.status(404).json({ error: 'Not found' });
    await writeJSON(RACECALLS_FILE, filtered);
    return res.json({ ok: true });
});

// ── OG Image Generation ──────────────────────────────────────────────────────
let _ogDeps = null;
async function getOGDeps() {
    if (_ogDeps) return _ogDeps;
    const [{ default: satori }, { Resvg }] = await Promise.all([
        import('satori'),
        import('@resvg/resvg-js')
    ]);
    const [interFont400, interFont700] = await Promise.all([
        fsp.readFile(path.join(__dirname, 'fonts', 'inter-latin-400.woff')),
        fsp.readFile(path.join(__dirname, 'fonts', 'inter-latin-700.woff')),
    ]);
    _ogDeps = { satori, Resvg, interFont400, interFont700 };
    return _ogDeps;
}

const ogRenderCache = new Map();
const OG_CACHE_MAX = 100;

app.get('/api/og', apiLimiter, async (req, res) => {
    try {
        const title = String(req.query.title || '').slice(0, 140).trim();
        const desc = String(req.query.desc || '').slice(0, 220).trim();
        const type = String(req.query.type || 'article').slice(0, 20).trim();
        if (!title) return res.status(400).send('Missing title');

        const cacheKey = `${title}||${desc}||${type}`;
        if (ogRenderCache.has(cacheKey)) {
            res.set('Content-Type', 'image/png');
            res.set('Cache-Control', 'public, max-age=31536000, immutable');
            return res.send(ogRenderCache.get(cacheKey));
        }

        const { satori, Resvg, interFont400, interFont700 } = await getOGDeps();
        const label = type === 'article' ? 'Essay' : type.charAt(0).toUpperCase() + type.slice(1);
        const titleSize = title.length > 70 ? 44 : title.length > 50 ? 48 : 54;

        const element = {
            type: 'div',
            props: {
                style: {
                    display: 'flex', flexDirection: 'column',
                    width: '100%', height: '100%',
                    backgroundColor: '#151515', fontFamily: 'Inter',
                },
                children: [
                    {
                        type: 'div',
                        props: {
                            style: {
                                display: 'flex', flexDirection: 'column', flex: 1,
                                padding: '56px 72px 44px 72px',
                                justifyContent: 'space-between',
                            },
                            children: [
                                {
                                    type: 'div',
                                    props: {
                                        style: { display: 'flex', color: '#555', fontSize: 17, letterSpacing: 3, textTransform: 'uppercase', fontWeight: 400 },
                                        children: 'mccomb.ca',
                                    }
                                },
                                {
                                    type: 'div',
                                    props: {
                                        style: { display: 'flex', color: '#e8e8e8', fontSize: titleSize, fontWeight: 700, lineHeight: 1.2, maxWidth: '1040px' },
                                        children: title,
                                    }
                                },
                                {
                                    type: 'div',
                                    props: {
                                        style: { display: 'flex', flexDirection: 'column' },
                                        children: [
                                            ...(desc ? [{
                                                type: 'div',
                                                props: {
                                                    style: { display: 'flex', color: '#777', fontSize: 21, lineHeight: 1.5, maxWidth: '940px', marginBottom: 18 },
                                                    children: desc,
                                                }
                                            }] : []),
                                            {
                                                type: 'div',
                                                props: {
                                                    style: { display: 'flex', color: '#e06b1f', fontSize: 14, fontWeight: 600, letterSpacing: 3, textTransform: 'uppercase' },
                                                    children: label,
                                                }
                                            }
                                        ],
                                    }
                                }
                            ],
                        }
                    },
                    {
                        type: 'div',
                        props: {
                            style: { display: 'flex', height: 5, backgroundColor: '#e06b1f', width: '100%' },
                            children: '',
                        }
                    }
                ],
            }
        };

        const svg = await satori(element, {
            width: 1200, height: 630,
            fonts: [
                { name: 'Inter', data: interFont400, weight: 400, style: 'normal' },
                { name: 'Inter', data: interFont700, weight: 700, style: 'normal' },
            ]
        });

        const resvg = new Resvg(svg, { fitTo: { mode: 'width', value: 1200 } });
        const png = Buffer.from(resvg.render().asPng());

        if (ogRenderCache.size >= OG_CACHE_MAX) ogRenderCache.delete(ogRenderCache.keys().next().value);
        ogRenderCache.set(cacheKey, png);

        res.set('Content-Type', 'image/png');
        res.set('Cache-Control', 'public, max-age=31536000, immutable');
        return res.send(png);
    } catch (err) {
        console.error('OG image generation error:', err);
        return res.status(500).send('Failed to generate image');
    }
});

// ── Semantic Search ───────────────────────────────────────────────────────────
let _embeddings = null;
async function getEmbeddings() {
    if (_embeddings) return _embeddings;
    const embFile = path.join(__dirname, 'data', 'embeddings.json');
    _embeddings = await readJSON(embFile, null);
    return _embeddings;
}

let _embeddingPipeline = null;
async function getEmbeddingPipeline() {
    if (_embeddingPipeline) return _embeddingPipeline;
    const { pipeline } = await import('@huggingface/transformers');
    _embeddingPipeline = await pipeline('feature-extraction', 'Xenova/all-MiniLM-L6-v2', { dtype: 'q8' });
    return _embeddingPipeline;
}
// Warm up in background so first search isn't slow
getEmbeddingPipeline().catch(() => {});

function cosineSimilarity(a, b) {
    let dot = 0, normA = 0, normB = 0;
    for (let i = 0; i < a.length; i++) {
        dot += a[i] * b[i];
        normA += a[i] * a[i];
        normB += b[i] * b[i];
    }
    return dot / (Math.sqrt(normA) * Math.sqrt(normB));
}

app.get('/api/search', apiLimiter, async (req, res) => {
    const q = String(req.query.q || '').slice(0, 200).trim();
    if (!q) return res.json([]);

    const embeddings = await getEmbeddings();
    if (!embeddings || !embeddings.items || !embeddings.items.length) return res.json([]);

    try {
        const model = await getEmbeddingPipeline();
        const out = await model(q, { pooling: 'mean', normalize: true });
        const queryVec = Array.from(out.data);

        const scored = embeddings.items.map(item => ({
            ...item,
            score: cosineSimilarity(queryVec, item.embedding)
        }));
        scored.sort((a, b) => b.score - a.score);

        const results = scored
            .filter(r => r.score > 0.30)
            .slice(0, 8)
            .map(({ title, desc, url, type, score }) => ({ title, desc, url, type, score }));

        return res.json(results);
    } catch (err) {
        console.error('Search error:', err);
        return res.json([]);
    }
});

const BLOCKED_FILES = new Set(['server.js', 'package.json', 'package-lock.json', 'resume.md', 'style.md', '.env']);
app.use((req, res, next) => {
    const base = req.path.replace(/^\//, '').split('/')[0];
    if (BLOCKED_FILES.has(base) || base.startsWith('.')) return res.status(404).sendFile(path.join(__dirname, '404.html'));
    next();
});

app.use((req, res, next) => {
    if (req.method !== 'GET' && req.method !== 'HEAD') return next();

    const withQuery = (targetPath) => {
        const query = req.url.includes('?') ? req.url.slice(req.url.indexOf('?')) : '';
        return targetPath + query;
    };

    if (req.path === '/index.html') {
        return res.redirect(301, withQuery('/'));
    }

    if (req.path.endsWith('/index.html')) {
        return res.redirect(301, withQuery(req.path.slice(0, -'index.html'.length)));
    }

    const writingHtmlMatch = req.path.match(/^\/writing\/([^/]+)\.html$/);
    if (writingHtmlMatch && WRITING_PAGES.has(writingHtmlMatch[1])) {
        return res.redirect(301, withQuery(`/writing/${writingHtmlMatch[1]}/`));
    }

    if (/^\/writing\/[^/]+$/.test(req.path)) {
        const slug = req.path.split('/')[2];
        if (WRITING_PAGES.has(slug)) {
            return res.redirect(301, withQuery(`${req.path}/`));
        }
    }

    if (req.path.endsWith('/') && req.path.length > 1) {
        const withoutSlash = req.path.slice(0, -1);
        if (CANONICAL_TOP_LEVEL_PATHS.has(withoutSlash)) {
            return res.redirect(301, withQuery(withoutSlash));
        }
    }

    if (req.path.endsWith('.html')) {
        const withoutExt = req.path.slice(0, -5);
        if (CANONICAL_TOP_LEVEL_PATHS.has(withoutExt)) {
            return res.redirect(301, withQuery(withoutExt));
        }
    }

    next();
});

app.get('/now', (_req, res) => res.redirect(301, '/'));

app.get(['/writing', '/writing/'], (_req, res) => {
    res.sendFile(path.join(__dirname, 'writing.html'));
});

app.get(/^\/writing\/([^/]+)\/?$/, (req, res, next) => {
    const slug = req.params[0];
    const pagePath = WRITING_PAGES.get(slug);
    if (!pagePath) return next();
    return res.sendFile(pagePath);
});

app.get('/sitemap.xml', (_req, res) => res.sendFile(path.join(__dirname, 'sitemap.xml')));
app.get('/robots.txt', (_req, res) => res.sendFile(path.join(__dirname, 'robots.txt')));

app.use(express.static(__dirname, { extensions: ['html'] }));

app.use((req, res) => {
    res.status(404).sendFile(path.join(__dirname, '404.html'));
});

if (require.main === module) {
    app.listen(PORT, () => {
        console.log(`Server running on port ${PORT}`);
    });
}

module.exports = app;
