const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const { pipeline } = require('stream/promises');

const app = express();
const PORT = process.env.PORT || 3000;
const CLOUD_PASSWORD = process.env.CLOUD_PASSWORD;
const UPLOAD_DIR = fs.existsSync('/data') ? '/data/uploads' : path.join(__dirname, 'uploads');

fs.mkdirSync(UPLOAD_DIR, { recursive: true });

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

app.use(express.static(__dirname, { extensions: ['html'] }));

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
