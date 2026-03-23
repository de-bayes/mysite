if (process.env.NODE_ENV !== 'production') require('dotenv').config();

const express = require('express');
const path = require('path');
const fs = require('fs');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');

const NODE_ENV = process.env.NODE_ENV || 'development';
const TRUST_LOCALHOST_AUTH = process.env.TRUST_LOCALHOST_AUTH === 'true';
const app = express();
if (NODE_ENV === 'production') {
    app.set('trust proxy', 1);
}
const PORT = process.env.PORT || 3000;
const CLOUD_PASSWORD = process.env.CLOUD_PASSWORD;
const DATA_DIR = fs.existsSync('/data') ? '/data' : path.join(__dirname, 'data');
const RACECALLS_FILE = path.join(DATA_DIR, 'racecalls.json');

fs.mkdirSync(DATA_DIR, { recursive: true });

// Seed race calls if file doesn't exist
if (!fs.existsSync(RACECALLS_FILE)) {
    writeJSON(RACECALLS_FILE, [{
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

function readJSON(filePath, fallback) {
    try {
        if (fs.existsSync(filePath)) return JSON.parse(fs.readFileSync(filePath, 'utf8'));
    } catch { /* corrupted file, return fallback */ }
    return fallback;
}

function writeJSON(filePath, data) {
    fs.writeFileSync(filePath, JSON.stringify(data, null, 2));
}

const CALLER_DESKS = ['ap', 'nyt', 'ddhq', 'votehub'];

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
    if (!auth || !auth.startsWith('Bearer ') || auth.slice(7) !== CLOUD_PASSWORD) {
        return res.status(401).json({ error: 'Unauthorized' });
    }
    next();
}

app.use(helmet({
    contentSecurityPolicy: false,
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
    if (req.body.password === CLOUD_PASSWORD) {
        return res.json({ ok: true });
    }
    return res.status(401).json({ error: 'Wrong password' });
});

// =============================================
// RESUME (read/write resume.html)
// =============================================
const RESUME_FILE = path.join(__dirname, 'resume.html');

app.get('/api/resume', requireAuth, (req, res) => {
    try {
        const html = fs.readFileSync(RESUME_FILE, 'utf8');
        // Extract just the resume-inner content
        // resume-inner closes, then resume-paper + resume-shell; optional </main> before flag-footer (site chrome)
        const resumeInnerEnd = /<div class="resume-inner">([\s\S]*?)<\/div>\s*<\/div>\s*<\/div>\s*(?:<\/main>\s*)?<div class="flag-footer">/;
        const match = html.match(resumeInnerEnd);
        if (match) {
            return res.json({ content: match[1].trim() });
        }
        return res.json({ content: '' });
    } catch {
        return res.status(500).json({ error: 'Failed to read resume' });
    }
});

app.put('/api/resume', apiWriteLimiter, requireAuth, (req, res) => {
    const content = String(req.body.content || '').trim();
    if (!content) return res.status(400).json({ error: 'Content required' });
    try {
        let html = fs.readFileSync(RESUME_FILE, 'utf8');
        const resumePutRe = /(<div class="resume-inner">)([\s\S]*?)(<\/div>\s*<\/div>\s*<\/div>\s*(?:<\/main>\s*)?<div class="flag-footer">)/;
        html = html.replace(resumePutRe, '$1\n' + content + '\n            $3');
        fs.writeFileSync(RESUME_FILE, html);
        return res.json({ ok: true });
    } catch (err) {
        return res.status(500).json({ error: 'Failed to save resume' });
    }
});

// =============================================
// RACE CALL RECORDS
// =============================================
app.get('/api/racecalls', (req, res) => {
    const calls = readJSON(RACECALLS_FILE, []);
    return res.json(calls);
});

app.post('/api/racecalls', apiWriteLimiter, requireAuth, (req, res) => {
    const race = String(req.body.race || '').trim().slice(0, 200);
    const date = String(req.body.date || '').trim();
    const calledFor = String(req.body.calledFor || '').trim().slice(0, 100);
    const result = String(req.body.result || '').trim().slice(0, 20);
    const notes = String(req.body.notes || '').trim().slice(0, 500);
    if (!race || !date || !calledFor) return res.status(400).json({ error: 'Race, date, and called-for candidate required' });
    if (isNaN(new Date(date).getTime())) return res.status(400).json({ error: 'Invalid date' });
    if (!['correct', 'incorrect', 'pending'].includes(result)) return res.status(400).json({ error: 'Result must be correct, incorrect, or pending' });

    // New fields
    const validRaceTypes = ['presidential', 'senate', 'house', 'governor', 'state_senate', 'state_house', 'other'];
    const raceType = validRaceTypes.includes(req.body.raceType) ? req.body.raceType : 'other';
    const rawParty = String(req.body.primaryParty || '').trim().toLowerCase();
    const primaryParty = rawParty === 'dem' || rawParty === 'rep' ? rawParty : '';
    const isPrimary = !!req.body.isPrimary || primaryParty !== '';
    const state = String(req.body.state || '').trim().slice(0, 2).toUpperCase();
    if (raceType !== 'presidential' && !state) return res.status(400).json({ error: 'State is required for non-presidential races' });
    const margin = req.body.margin !== null && req.body.margin !== undefined && req.body.margin !== '' ? parseFloat(req.body.margin) : null;
    const firstCaller = CALLER_DESKS.includes(req.body.firstCaller) ? req.body.firstCaller : '';
    const callers = callersFromFirstCaller(firstCaller);
    const sourceUrl = String(req.body.sourceUrl || '').trim().slice(0, 500);

    const calls = readJSON(RACECALLS_FILE, []);
    calls.unshift({
        id: Date.now().toString(36) + Math.random().toString(36).slice(2, 6),
        race, date, calledFor, result, notes,
        raceType, isPrimary, primaryParty, state, margin, callers, firstCaller,
        sourceUrl,
        created: new Date().toISOString()
    });
    calls.sort((a, b) => new Date(b.date) - new Date(a.date));
    writeJSON(RACECALLS_FILE, calls);
    return res.json({ ok: true });
});

app.put('/api/racecalls/:id', apiWriteLimiter, requireAuth, (req, res) => {
    const calls = readJSON(RACECALLS_FILE, []);
    const idx = calls.findIndex(c => c.id === req.params.id);
    if (idx === -1) return res.status(404).json({ error: 'Not found' });

    if (req.body.race) calls[idx].race = String(req.body.race).trim().slice(0, 200);
    if (req.body.date) calls[idx].date = String(req.body.date).trim();
    if (req.body.calledFor) calls[idx].calledFor = String(req.body.calledFor).trim().slice(0, 100);
    if (req.body.result) calls[idx].result = String(req.body.result).trim().slice(0, 20);
    if (req.body.notes !== undefined) calls[idx].notes = String(req.body.notes).trim().slice(0, 500);

    // New fields
    const validRaceTypes = ['presidential', 'senate', 'house', 'governor', 'state_senate', 'state_house', 'other'];
    if (req.body.raceType !== undefined && validRaceTypes.includes(req.body.raceType)) {
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

    writeJSON(RACECALLS_FILE, calls);
    return res.json({ ok: true });
});

app.delete('/api/racecalls/:id', apiWriteLimiter, requireAuth, (req, res) => {
    const calls = readJSON(RACECALLS_FILE, []);
    const filtered = calls.filter(c => c.id !== req.params.id);
    if (filtered.length === calls.length) return res.status(404).json({ error: 'Not found' });
    writeJSON(RACECALLS_FILE, filtered);
    return res.json({ ok: true });
});

const BLOCKED_FILES = new Set(['server.js', 'package.json', 'package-lock.json', 'resume.md', 'style.md', '.env']);
app.use((req, res, next) => {
    const base = req.path.replace(/^\//, '').split('/')[0];
    if (BLOCKED_FILES.has(base) || base.startsWith('.')) return res.status(404).sendFile(path.join(__dirname, '404.html'));
    next();
});

app.use(express.static(__dirname, { extensions: ['html'] }));

app.use((req, res) => {
    res.status(404).sendFile(path.join(__dirname, '404.html'));
});

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
