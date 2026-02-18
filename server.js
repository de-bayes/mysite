const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const { pipeline } = require('stream/promises');

const app = express();
const PORT = process.env.PORT || 3000;
const CLOUD_PASSWORD = process.env.CLOUD_PASSWORD;
const UPLOAD_DIR = fs.existsSync('/data') ? '/data/uploads' : path.join(__dirname, 'uploads');
const DEFAULT_CAPACITY_BYTES = Number(process.env.CLOUD_CAPACITY_BYTES || (10 * 1024 ** 3));

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
    if (normalized.includes('..')) throw new Error('Invalid path');
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
    const root = path.resolve(UPLOAD_DIR);
    const resolved = path.resolve(root, clean);
    if (!resolved.startsWith(root)) throw new Error('Invalid path');
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

function parseGithubRepoInput(input, explicitBranch = '') {
    const raw = String(input || '').trim();
    if (!raw) throw new Error('Repository is required');

    let repo = raw;
    let branch = String(explicitBranch || '').trim();

    if (/^https?:\/\//i.test(raw)) {
        const url = new URL(raw);
        if (!/github\.com$/i.test(url.hostname)) throw new Error('Only github.com URLs are supported');
        const parts = url.pathname.split('/').filter(Boolean);
        if (parts.length < 2) throw new Error('Invalid GitHub URL');
        repo = `${parts[0]}/${parts[1].replace(/\.git$/, '')}`;
        if (!branch && parts[2] === 'tree' && parts[3]) branch = parts.slice(3).join('/');
    }

    if (!/^[a-zA-Z0-9_.-]+\/[a-zA-Z0-9_.-]+$/.test(repo)) {
        throw new Error('Repository must look like owner/name or full GitHub URL');
    }

    return { repo, branch };
}

function gatherStorageStats(dirPath) {
    let usedBytes = 0;
    let fileCount = 0;
    let folderCount = 0;

    if (!fs.existsSync(dirPath)) return { usedBytes, fileCount, folderCount };

    for (const name of fs.readdirSync(dirPath)) {
        const full = path.join(dirPath, name);
        const stat = fs.statSync(full);
        if (stat.isDirectory()) {
            folderCount += 1;
            const nested = gatherStorageStats(full);
            usedBytes += nested.usedBytes;
            fileCount += nested.fileCount;
            folderCount += nested.folderCount;
        } else {
            usedBytes += stat.size;
            fileCount += 1;
        }
    }

    return { usedBytes, fileCount, folderCount };
}

function movePathInsideUpload(sourcePath, destinationDirRel) {
    const sourceRel = normalizeRelativePath(sourcePath);
    const destRel = normalizeRelativePath(destinationDirRel);

    const { resolved: source } = resolveInUploadDir(sourceRel);
    const { resolved: destinationDir } = resolveInUploadDir(destRel);

    if (!fs.existsSync(source)) throw new Error(`Not found: ${sourceRel}`);
    fs.mkdirSync(destinationDir, { recursive: true });

    const basename = path.basename(source);
    let destination = path.join(destinationDir, basename);

    const sourceStat = fs.statSync(source);
    const candidateRel = normalizeRelativePath(path.join(destRel, basename));

    if (sourceStat.isDirectory() && candidateRel.startsWith(sourceRel + '/')) {
        throw new Error(`Cannot move folder into itself: ${sourceRel}`);
    }

    if (fs.existsSync(destination)) {
        destination = path.join(destinationDir, `${Date.now()}-${basename}`);
    }

    fs.renameSync(source, destination);
    return normalizeRelativePath(path.relative(UPLOAD_DIR, destination));
}

async function saveGithubBackup({ repoInput, branchInput, token, outputDir }) {
    const { repo, branch } = parseGithubRepoInput(repoInput, branchInput);

    const safeRepoName = repo.replace('/', '-');
    const safeBranch = safeSegment(branch || 'default') || 'default';
    const stamp = new Date().toISOString().replace(/[:.]/g, '-');
    const filename = `${safeRepoName}-${safeBranch}-${stamp}.zip`;
    const destination = path.join(outputDir, filename);

    const url = new URL(`https://api.github.com/repos/${repo}/zipball`);
    if (branch) url.searchParams.set('ref', branch);

    const headers = { 'User-Agent': 'mysite-cloud-backup', Accept: 'application/vnd.github+json' };
    if (token) headers.Authorization = `Bearer ${token}`;

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
            if (fs.existsSync(path.join(resolved, finalName))) finalName = `${Date.now()}-${safe}`;
            cb(null, finalName);
        }
    })
});

app.use(express.json());

app.post('/api/auth', (req, res) => {
    if (!CLOUD_PASSWORD) return res.status(503).json({ error: 'Cloud storage not configured' });
    if (req.body.password === CLOUD_PASSWORD) return res.json({ ok: true });
    return res.status(401).json({ error: 'Wrong password' });
});

app.get('/api/files', requireAuth, (req, res) => {
    try {
        const currentPath = normalizeRelativePath(req.query.path || '');
        const { resolved } = resolveInUploadDir(currentPath);
        if (!fs.existsSync(resolved)) return res.json({ path: currentPath, entries: [] });

        const entries = fs.readdirSync(resolved).map((name) => formatEntry(name, fs.statSync(path.join(resolved, name))));
        entries.sort((a, b) => {
            if (a.type !== b.type) return a.type === 'folder' ? -1 : 1;
            return a.name.localeCompare(b.name);
        });

        return res.json({ path: currentPath, entries });
    } catch (error) {
        return res.status(400).json({ error: error.message || 'Invalid path' });
    }
});

app.get('/api/storage-stats', requireAuth, (req, res) => {
    try {
        const stats = gatherStorageStats(UPLOAD_DIR);
        const usedPercent = Math.round((stats.usedBytes / DEFAULT_CAPACITY_BYTES) * 10000) / 100;
        return res.json({
            ...stats,
            capacityBytes: DEFAULT_CAPACITY_BYTES,
            usedPercent: Number.isFinite(usedPercent) ? usedPercent : 0
        });
    } catch (error) {
        return res.status(500).json({ error: error.message || 'Failed to compute stats' });
    }
});

app.post('/api/folders', requireAuth, (req, res) => {
    try {
        const parent = normalizeRelativePath(req.body.path || '');
        const name = safeSegment(req.body.name);
        if (!name) return res.status(400).json({ error: 'Folder name required' });

        const folderPath = parent ? `${parent}/${name}` : name;
        const { resolved } = resolveInUploadDir(folderPath);
        fs.mkdirSync(resolved, { recursive: false });
        return res.json({ ok: true, path: folderPath });
    } catch (error) {
        if (error && error.code === 'EEXIST') return res.status(409).json({ error: 'Folder already exists' });
        return res.status(400).json({ error: error.message || 'Failed to create folder' });
    }
});

app.post('/api/upload', requireAuth, upload.single('file'), (req, res) => {
    if (!req.file) return res.status(400).json({ error: 'No file' });
    return res.json({ name: req.file.filename, size: req.file.size });
});

app.post('/api/files/bulk', requireAuth, (req, res) => {
    try {
        const action = String(req.body.action || '');
        const paths = Array.isArray(req.body.paths) ? req.body.paths : [];
        const destination = normalizeRelativePath(req.body.destination || '');

        if (!['delete', 'move'].includes(action)) return res.status(400).json({ error: 'Invalid bulk action' });
        if (!paths.length) return res.status(400).json({ error: 'No paths provided' });

        const results = [];
        for (const p of paths) {
            const rel = normalizeRelativePath(p);
            if (!rel) continue;

            const { resolved } = resolveInUploadDir(rel);
            if (!fs.existsSync(resolved)) continue;

            if (action === 'delete') {
                const stat = fs.statSync(resolved);
                if (stat.isDirectory()) fs.rmSync(resolved, { recursive: true, force: true });
                else fs.unlinkSync(resolved);
                results.push({ path: rel, status: 'deleted' });
            }

            if (action === 'move') {
                const movedTo = movePathInsideUpload(rel, destination);
                results.push({ path: rel, status: 'moved', destination: movedTo });
            }
        }

        return res.json({ ok: true, action, results });
    } catch (error) {
        return res.status(400).json({ error: error.message || 'Bulk action failed' });
    }
});

app.post('/api/github-backup', requireAuth, async (req, res) => {
    try {
        const target = normalizeRelativePath(req.body.path || '');
        const { resolved } = resolveInUploadDir(target);
        fs.mkdirSync(resolved, { recursive: true });

        const filename = await saveGithubBackup({
            repoInput: req.body.repo,
            branchInput: req.body.branch,
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
        if (stat.isDirectory()) return res.status(400).json({ error: 'Cannot download a folder' });
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
        if (stat.isDirectory()) fs.rmSync(resolved, { recursive: true, force: true });
        else fs.unlinkSync(resolved);
        return res.json({ ok: true });
    } catch (error) {
        return res.status(400).json({ error: error.message || 'Invalid path' });
    }
});

app.use(express.static(__dirname, { extensions: ['html'] }));

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
