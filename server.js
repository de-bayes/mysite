const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const { pipeline } = require('stream/promises');

const app = express();
const PORT = process.env.PORT || 3000;
const CLOUD_PASSWORD = process.env.CLOUD_PASSWORD;
const DATA_DIR = fs.existsSync('/data') ? '/data' : path.join(__dirname, 'data');
const UPLOAD_DIR = path.join(DATA_DIR, 'uploads');
const GUESTBOOK_FILE = path.join(DATA_DIR, 'guestbook.json');
const ANALYTICS_FILE = path.join(DATA_DIR, 'analytics.json');
const TYPING_SCORES_FILE = path.join(DATA_DIR, 'typing-scores.json');
const HOTTAKES_FILE = path.join(DATA_DIR, 'hottakes.json');
const BLOGPOSTS_FILE = path.join(DATA_DIR, 'blogposts.json');

fs.mkdirSync(UPLOAD_DIR, { recursive: true });

function readJSON(filePath, fallback) {
    try {
        if (fs.existsSync(filePath)) return JSON.parse(fs.readFileSync(filePath, 'utf8'));
    } catch { /* corrupted file, return fallback */ }
    return fallback;
}

function writeJSON(filePath, data) {
    fs.writeFileSync(filePath, JSON.stringify(data, null, 2));
}

function requireAuth(req, res, next) {
    if (!CLOUD_PASSWORD) {
        return res.status(503).json({ error: 'Cloud storage not configured' });
    }
    const auth = req.headers.authorization;
    if (!auth || !auth.startsWith('Bearer ') || auth.slice(7) !== CLOUD_PASSWORD) {
        return res.status(401).json({ error: 'Unauthorized' });
    }
    next();
}

function normalizeRelativePath(input) {
    if (typeof input !== 'string') return '';
    const normalized = path.posix.normalize('/' + input).replace(/^\//, '');
    if (normalized === '.') return '';
    if (normalized.includes('..')) {
        throw new Error('Invalid path');
    }
    return normalized;
}

function safeSegment(name) {
    return String(name || '')
        .trim()
        .replace(/[\\/]+/g, '_')
        .replace(/[^a-zA-Z0-9._ -]/g, '_')
        .slice(0, 120);
}

function resolveInUploadDir(relativePath = '') {
    const clean = normalizeRelativePath(relativePath);
    const resolved = path.resolve(UPLOAD_DIR, clean);
    if (!resolved.startsWith(path.resolve(UPLOAD_DIR))) {
        throw new Error('Invalid path');
    }
    return { clean, resolved };
}

function formatEntry(name, stat) {
    return {
        name,
        type: stat.isDirectory() ? 'folder' : 'file',
        size: stat.isDirectory() ? null : stat.size,
        modified: stat.mtime
    };
}

async function saveGithubBackup({ repo, branch, token, outputDir }) {
    if (!/^[a-zA-Z0-9_.-]+\/[a-zA-Z0-9_.-]+$/.test(repo)) {
        throw new Error('Repository must look like owner/name');
    }

    const safeRepoName = repo.replace('/', '-');
    const safeBranch = safeSegment(branch || 'default') || 'default';
    const stamp = new Date().toISOString().replace(/[:.]/g, '-');
    const filename = `${safeRepoName}-${safeBranch}-${stamp}.zip`;
    const destination = path.join(outputDir, filename);

    const url = new URL(`https://api.github.com/repos/${repo}/zipball`);
    if (branch) {
        url.searchParams.set('ref', branch);
    }

    const headers = {
        'User-Agent': 'mysite-cloud-backup',
        Accept: 'application/vnd.github+json'
    };

    if (token) {
        headers.Authorization = `Bearer ${token}`;
    }

    const response = await fetch(url, { headers, redirect: 'follow' });
    if (!response.ok || !response.body) {
        const text = await response.text();
        throw new Error(`GitHub backup failed (${response.status}): ${text.slice(0, 240)}`);
    }

    await pipeline(response.body, fs.createWriteStream(destination));

    return filename;
}

const upload = multer({
    storage: multer.diskStorage({
        destination: (req, file, cb) => {
            try {
                const { resolved } = resolveInUploadDir(req.query.path || '');
                fs.mkdirSync(resolved, { recursive: true });
                cb(null, resolved);
            } catch {
                cb(new Error('Invalid upload path'));
            }
        },
        filename: (req, file, cb) => {
            const safe = safeSegment(file.originalname) || 'upload.bin';
            let finalName = safe;
            const { resolved } = resolveInUploadDir(req.query.path || '');
            if (fs.existsSync(path.join(resolved, finalName))) {
                finalName = `${Date.now()}-${safe}`;
            }
            cb(null, finalName);
        }
    })
});

app.use(express.json());

app.post('/api/auth', (req, res) => {
    if (!CLOUD_PASSWORD) {
        return res.status(503).json({ error: 'Cloud storage not configured' });
    }
    if (req.body.password === CLOUD_PASSWORD) {
        return res.json({ ok: true });
    }
    return res.status(401).json({ error: 'Wrong password' });
});

app.get('/api/files', requireAuth, (req, res) => {
    try {
        const currentPath = normalizeRelativePath(req.query.path || '');
        const { resolved } = resolveInUploadDir(currentPath);
        if (!fs.existsSync(resolved)) {
            return res.json({ path: currentPath, entries: [] });
        }

        const entries = fs.readdirSync(resolved).map((name) => {
            const stat = fs.statSync(path.join(resolved, name));
            return formatEntry(name, stat);
        });

        entries.sort((a, b) => {
            if (a.type !== b.type) return a.type === 'folder' ? -1 : 1;
            return a.name.localeCompare(b.name);
        });

        return res.json({ path: currentPath, entries });
    } catch (error) {
        return res.status(400).json({ error: error.message || 'Invalid path' });
    }
});

app.post('/api/folders', requireAuth, (req, res) => {
    try {
        const parent = normalizeRelativePath(req.body.path || '');
        const name = safeSegment(req.body.name);
        if (!name) {
            return res.status(400).json({ error: 'Folder name required' });
        }

        const folderPath = parent ? `${parent}/${name}` : name;
        const { resolved } = resolveInUploadDir(folderPath);
        fs.mkdirSync(resolved, { recursive: false });
        return res.json({ ok: true, path: folderPath });
    } catch (error) {
        if ((error && error.code) === 'EEXIST') {
            return res.status(409).json({ error: 'Folder already exists' });
        }
        return res.status(400).json({ error: error.message || 'Failed to create folder' });
    }
});

app.post('/api/upload', requireAuth, upload.single('file'), (req, res) => {
    if (!req.file) return res.status(400).json({ error: 'No file' });
    return res.json({ name: req.file.filename, size: req.file.size });
});

app.post('/api/github-backup', requireAuth, async (req, res) => {
    try {
        const target = normalizeRelativePath(req.body.path || '');
        const { resolved } = resolveInUploadDir(target);
        fs.mkdirSync(resolved, { recursive: true });

        const filename = await saveGithubBackup({
            repo: String(req.body.repo || '').trim(),
            branch: String(req.body.branch || '').trim(),
            token: String(req.body.token || '').trim(),
            outputDir: resolved
        });

        return res.json({ ok: true, name: filename });
    } catch (error) {
        return res.status(400).json({ error: error.message || 'Backup failed' });
    }
});

app.get('/api/files/*', requireAuth, (req, res) => {
    try {
        const rel = normalizeRelativePath(req.params[0]);
        const { resolved } = resolveInUploadDir(rel);
        if (!fs.existsSync(resolved)) return res.status(404).json({ error: 'Not found' });

        const stat = fs.statSync(resolved);
        if (stat.isDirectory()) {
            return res.status(400).json({ error: 'Cannot download a folder' });
        }
        return res.download(resolved, path.basename(resolved));
    } catch (error) {
        return res.status(400).json({ error: error.message || 'Invalid path' });
    }
});

app.delete('/api/files/*', requireAuth, (req, res) => {
    try {
        const rel = normalizeRelativePath(req.params[0]);
        const { resolved } = resolveInUploadDir(rel);
        if (!fs.existsSync(resolved)) return res.status(404).json({ error: 'Not found' });

        const stat = fs.statSync(resolved);
        if (stat.isDirectory()) {
            fs.rmSync(resolved, { recursive: true, force: true });
        } else {
            fs.unlinkSync(resolved);
        }

        return res.json({ ok: true });
    } catch (error) {
        return res.status(400).json({ error: error.message || 'Invalid path' });
    }
});

// =============================================
// GUESTBOOK
// =============================================
const GUESTBOOK_MAX = 200;
const GUESTBOOK_RATE_MS = 30000; // 30s between entries per IP
const guestbookRateMap = new Map();

app.get('/api/guestbook', (req, res) => {
    const entries = readJSON(GUESTBOOK_FILE, []);
    return res.json(entries);
});

app.post('/api/guestbook', (req, res) => {
    const name = String(req.body.name || '').trim().slice(0, 40);
    const message = String(req.body.message || '').trim().slice(0, 200);
    if (!name || !message) {
        return res.status(400).json({ error: 'Name and message required' });
    }

    const ip = req.headers['x-forwarded-for'] || req.socket.remoteAddress || 'unknown';
    const now = Date.now();
    const lastPost = guestbookRateMap.get(ip) || 0;
    if (now - lastPost < GUESTBOOK_RATE_MS) {
        return res.status(429).json({ error: 'Please wait before posting again' });
    }
    guestbookRateMap.set(ip, now);

    const entries = readJSON(GUESTBOOK_FILE, []);
    entries.unshift({
        name,
        message,
        date: new Date().toISOString()
    });
    if (entries.length > GUESTBOOK_MAX) entries.length = GUESTBOOK_MAX;
    writeJSON(GUESTBOOK_FILE, entries);
    return res.json({ ok: true });
});

// =============================================
// ANALYTICS TRACKING
// =============================================
app.post('/api/track', (req, res) => {
    const event = String(req.body.event || '').trim().slice(0, 50);
    const value = String(req.body.value || '').trim().slice(0, 100);
    if (!event) return res.status(400).json({ error: 'Event required' });

    const analytics = readJSON(ANALYTICS_FILE, { pageViews: {}, commands: {}, games: {}, totalVisits: 0 });

    if (event === 'pageview') {
        analytics.pageViews[value] = (analytics.pageViews[value] || 0) + 1;
        analytics.totalVisits = (analytics.totalVisits || 0) + 1;
    } else if (event === 'command') {
        analytics.commands[value] = (analytics.commands[value] || 0) + 1;
    } else if (event === 'game') {
        analytics.games[value] = (analytics.games[value] || 0) + 1;
    }

    writeJSON(ANALYTICS_FILE, analytics);
    return res.json({ ok: true });
});

app.get('/api/stats', (req, res) => {
    const analytics = readJSON(ANALYTICS_FILE, { pageViews: {}, commands: {}, games: {}, totalVisits: 0 });
    return res.json(analytics);
});

// =============================================
// TYPING SPEED LEADERBOARD
// =============================================
const TYPING_MAX_ENTRIES = 50;

app.get('/api/typing-scores', (req, res) => {
    const scores = readJSON(TYPING_SCORES_FILE, []);
    return res.json(scores);
});

app.post('/api/typing-scores', (req, res) => {
    const name = String(req.body.name || '').trim().slice(0, 30);
    const wpm = parseInt(req.body.wpm, 10);
    const accuracy = parseInt(req.body.accuracy, 10);
    if (!name || isNaN(wpm) || wpm < 1 || wpm > 300) {
        return res.status(400).json({ error: 'Valid name and wpm required' });
    }

    const scores = readJSON(TYPING_SCORES_FILE, []);
    scores.push({
        name,
        wpm,
        accuracy: isNaN(accuracy) ? 0 : Math.min(100, Math.max(0, accuracy)),
        date: new Date().toISOString()
    });
    scores.sort((a, b) => b.wpm - a.wpm);
    if (scores.length > TYPING_MAX_ENTRIES) scores.length = TYPING_MAX_ENTRIES;
    writeJSON(TYPING_SCORES_FILE, scores);
    return res.json({ ok: true, rank: scores.findIndex(s => s.name === name && s.wpm === wpm) + 1 });
});

// =============================================
// HOT TAKES
// =============================================
app.get('/api/hottakes', (req, res) => {
    const takes = readJSON(HOTTAKES_FILE, []);
    return res.json(takes);
});

app.post('/api/hottakes', requireAuth, (req, res) => {
    const text = String(req.body.text || '').trim().slice(0, 300);
    const category = String(req.body.category || '').trim().slice(0, 30);
    const spiciness = Math.min(5, Math.max(1, parseInt(req.body.spiciness, 10) || 3));
    if (!text) return res.status(400).json({ error: 'Text required' });

    const takes = readJSON(HOTTAKES_FILE, []);
    takes.unshift({
        id: Date.now().toString(36) + Math.random().toString(36).slice(2, 6),
        text,
        category: category || 'General',
        spiciness,
        date: new Date().toISOString()
    });
    writeJSON(HOTTAKES_FILE, takes);
    return res.json({ ok: true });
});

app.put('/api/hottakes/:id', requireAuth, (req, res) => {
    const takes = readJSON(HOTTAKES_FILE, []);
    const idx = takes.findIndex(t => t.id === req.params.id);
    if (idx === -1) return res.status(404).json({ error: 'Not found' });

    if (req.body.text) takes[idx].text = String(req.body.text).trim().slice(0, 300);
    if (req.body.category) takes[idx].category = String(req.body.category).trim().slice(0, 30);
    if (req.body.spiciness) takes[idx].spiciness = Math.min(5, Math.max(1, parseInt(req.body.spiciness, 10) || 3));
    writeJSON(HOTTAKES_FILE, takes);
    return res.json({ ok: true });
});

app.delete('/api/hottakes/:id', requireAuth, (req, res) => {
    const takes = readJSON(HOTTAKES_FILE, []);
    const filtered = takes.filter(t => t.id !== req.params.id);
    if (filtered.length === takes.length) return res.status(404).json({ error: 'Not found' });
    writeJSON(HOTTAKES_FILE, filtered);
    return res.json({ ok: true });
});

// =============================================
// BLOG POSTS (Admin-managed)
// =============================================
app.get('/api/blogposts', (req, res) => {
    const posts = readJSON(BLOGPOSTS_FILE, []);
    return res.json(posts);
});

app.post('/api/blogposts', requireAuth, (req, res) => {
    const title = String(req.body.title || '').trim().slice(0, 200);
    const body = String(req.body.body || '').trim();
    const tags = Array.isArray(req.body.tags) ? req.body.tags.map(t => String(t).trim().slice(0, 20)).slice(0, 5) : [];
    const readTime = String(req.body.readTime || '').trim().slice(0, 20) || '5 min read';
    const featured = !!req.body.featured;
    if (!title || !body) return res.status(400).json({ error: 'Title and body required' });

    const posts = readJSON(BLOGPOSTS_FILE, []);
    const post = {
        id: Date.now().toString(36) + Math.random().toString(36).slice(2, 6),
        title, body, tags, readTime, featured,
        date: new Date().toISOString()
    };
    posts.unshift(post);
    writeJSON(BLOGPOSTS_FILE, posts);
    return res.json({ ok: true, id: post.id });
});

app.put('/api/blogposts/:id', requireAuth, (req, res) => {
    const posts = readJSON(BLOGPOSTS_FILE, []);
    const idx = posts.findIndex(p => p.id === req.params.id);
    if (idx === -1) return res.status(404).json({ error: 'Not found' });

    if (req.body.title) posts[idx].title = String(req.body.title).trim().slice(0, 200);
    if (req.body.body !== undefined) posts[idx].body = String(req.body.body).trim();
    if (req.body.tags) posts[idx].tags = Array.isArray(req.body.tags) ? req.body.tags.map(t => String(t).trim().slice(0, 20)).slice(0, 5) : posts[idx].tags;
    if (req.body.readTime) posts[idx].readTime = String(req.body.readTime).trim().slice(0, 20);
    if (req.body.featured !== undefined) posts[idx].featured = !!req.body.featured;
    writeJSON(BLOGPOSTS_FILE, posts);
    return res.json({ ok: true });
});

app.delete('/api/blogposts/:id', requireAuth, (req, res) => {
    const posts = readJSON(BLOGPOSTS_FILE, []);
    const filtered = posts.filter(p => p.id !== req.params.id);
    if (filtered.length === posts.length) return res.status(404).json({ error: 'Not found' });
    writeJSON(BLOGPOSTS_FILE, filtered);
    return res.json({ ok: true });
});

app.use(express.static(__dirname, { extensions: ['html'] }));

app.use((req, res) => {
    res.status(404).sendFile(path.join(__dirname, '404.html'));
});

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
