const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs');

const app = express();
const PORT = process.env.PORT || 3000;
const CLOUD_PASSWORD = process.env.CLOUD_PASSWORD;
const UPLOAD_DIR = fs.existsSync('/data') ? '/data/uploads' : path.join(__dirname, 'uploads');

// Ensure upload directory exists
fs.mkdirSync(UPLOAD_DIR, { recursive: true });

// Auth middleware
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

// Sanitize filename to prevent path traversal
function safeName(name) {
    return path.basename(name).replace(/[^a-zA-Z0-9._-]/g, '_');
}

// Multer config
const upload = multer({
    storage: multer.diskStorage({
        destination: UPLOAD_DIR,
        filename: (req, file, cb) => {
            const safe = safeName(file.originalname);
            // If file exists, prepend timestamp
            if (fs.existsSync(path.join(UPLOAD_DIR, safe))) {
                cb(null, Date.now() + '-' + safe);
            } else {
                cb(null, safe);
            }
        }
    })
});

// API routes
app.use(express.json());

app.post('/api/auth', (req, res) => {
    if (!CLOUD_PASSWORD) {
        return res.status(503).json({ error: 'Cloud storage not configured' });
    }
    if (req.body.password === CLOUD_PASSWORD) {
        return res.json({ ok: true });
    }
    res.status(401).json({ error: 'Wrong password' });
});

app.get('/api/files', requireAuth, (req, res) => {
    const files = fs.readdirSync(UPLOAD_DIR).map(name => {
        const stat = fs.statSync(path.join(UPLOAD_DIR, name));
        return { name, size: stat.size, modified: stat.mtime };
    });
    files.sort((a, b) => new Date(b.modified) - new Date(a.modified));
    res.json(files);
});

app.post('/api/upload', requireAuth, upload.single('file'), (req, res) => {
    if (!req.file) return res.status(400).json({ error: 'No file' });
    res.json({ name: req.file.filename, size: req.file.size });
});

app.get('/api/files/:name', requireAuth, (req, res) => {
    const name = safeName(req.params.name);
    const filePath = path.join(UPLOAD_DIR, name);
    if (!fs.existsSync(filePath)) return res.status(404).json({ error: 'Not found' });
    res.download(filePath, name);
});

app.delete('/api/files/:name', requireAuth, (req, res) => {
    const name = safeName(req.params.name);
    const filePath = path.join(UPLOAD_DIR, name);
    if (!fs.existsSync(filePath)) return res.status(404).json({ error: 'Not found' });
    fs.unlinkSync(filePath);
    res.json({ ok: true });
});

// Serve static files (identical to `serve .`)
app.use(express.static(__dirname, { extensions: ['html'] }));

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
