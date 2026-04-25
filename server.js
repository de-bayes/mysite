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
  // Trust the first proxy hop so req.ip and rate limiters see the client (Vercel, etc.).
  app.set('trust proxy', 1);
}
const PORT = process.env.PORT || 1123;
const CLOUD_PASSWORD = process.env.CLOUD_PASSWORD;
const WRITING_DIR = path.join(__dirname, 'writing');

const CANONICAL_TOP_LEVEL_PATHS = new Set([
  '/about',
  '/experience',
  '/projects',
  '/writing',
  '/photos',
  '/press',
  '/resume',
]);

function getWritingPages() {
  if (!fs.existsSync(WRITING_DIR)) return new Map();
  return new Map(
    fs
      .readdirSync(WRITING_DIR, { withFileTypes: true })
      .filter((entry) => entry.isDirectory())
      .map((entry) => [entry.name, path.join(WRITING_DIR, entry.name, 'index.html')])
      .filter(([, filePath]) => fs.existsSync(filePath))
  );
}

const WRITING_PAGES = getWritingPages();

// =============================================
// Auth
// =============================================
function isLocalhost(req) {
  const host = req.hostname || req.headers.host || '';
  return (
    host === 'localhost' ||
    host === '127.0.0.1' ||
    host.startsWith('localhost:') ||
    host.startsWith('127.0.0.1:')
  );
}

/** In production, localhost-only auth bypass requires TRUST_LOCALHOST_AUTH=true */
function allowLocalhostAuthBypass(req) {
  return isLocalhost(req) && (NODE_ENV !== 'production' || TRUST_LOCALHOST_AUTH);
}

/** @returns {'bypass'|'blocked'|'ok'} */
function cloudAuthGate(req, res) {
  if (!CLOUD_PASSWORD && allowLocalhostAuthBypass(req)) return 'bypass';
  if (!CLOUD_PASSWORD) {
    res.status(503).json({ error: 'Cloud storage not configured' });
    return 'blocked';
  }
  return 'ok';
}

function requireAuth(req, res, next) {
  const gate = cloudAuthGate(req, res);
  if (gate === 'bypass') return next();
  if (gate === 'blocked') return;
  const auth = req.headers.authorization;
  if (!auth || !auth.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Unauthorized' });
  }
  const token = auth.slice(7);
  // timingSafeEqual requires equal-length buffers (otherwise it throws); length mismatch stops here without a timing compare.
  if (
    token.length !== CLOUD_PASSWORD.length ||
    !crypto.timingSafeEqual(Buffer.from(token), Buffer.from(CLOUD_PASSWORD))
  ) {
    return res.status(401).json({ error: 'Unauthorized' });
  }
  next();
}

// =============================================
// Middleware
// =============================================
app.use(
  helmet({
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
        formAction: ["'self'"],
      },
    },
    crossOriginEmbedderPolicy: false,
  })
);

app.use(express.json());

const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 300,
  standardHeaders: true,
  legacyHeaders: false,
});

const apiWriteLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 120,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: 'Too many write requests, try again later' },
});

app.use('/api/', apiLimiter);

// =============================================
// RESUME (read/write resume.html)
// =============================================
const RESUME_FILE = path.join(__dirname, 'resume.html');

app.get('/api/resume', requireAuth, async (req, res) => {
  try {
    const html = await fsp.readFile(RESUME_FILE, 'utf8');
    // Capture resume-inner only: closes through resume shell, optional </main>, then flag-footer (site chrome).
    const resumeInnerEnd =
      /<div class="resume-inner">([\s\S]*?)<\/div>\s*<\/div>\s*<\/div>\s*(?:<\/main>\s*)?<div class="flag-footer">/;
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
    const resumePutRe =
      /(<div class="resume-inner">)([\s\S]*?)(<\/div>\s*<\/div>\s*<\/div>\s*(?:<\/main>\s*)?<div class="flag-footer">)/;
    html = html.replace(resumePutRe, '$1\n' + content + '\n            $3');
    await fsp.writeFile(RESUME_FILE, html);
    return res.json({ ok: true });
  } catch (err) {
    console.error('Failed to save resume:', err);
    return res.status(500).json({ error: 'Failed to save resume' });
  }
});

// =============================================
// OG image API
// =============================================
let _ogDeps = null;
async function getOGDeps() {
  if (_ogDeps) return _ogDeps;
  const [{ default: satori }, { Resvg }] = await Promise.all([
    import('satori'),
    import('@resvg/resvg-js'),
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

function sendOgPng(res, png) {
  res.set('Content-Type', 'image/png');
  res.set('Cache-Control', 'public, max-age=31536000, immutable');
  res.send(png);
}

app.get('/api/og', apiLimiter, async (req, res) => {
  try {
    const title = String(req.query.title || '')
      .slice(0, 140)
      .trim();
    const desc = String(req.query.desc || '')
      .slice(0, 220)
      .trim();
    const type = String(req.query.type || 'article')
      .slice(0, 20)
      .trim();
    if (!title) return res.status(400).send('Missing title');

    const cacheKey = `${title}||${desc}||${type}`;
    if (ogRenderCache.has(cacheKey)) {
      return sendOgPng(res, ogRenderCache.get(cacheKey));
    }

    const { satori, Resvg, interFont400, interFont700 } = await getOGDeps();
    const label = type === 'article' ? 'Essay' : type.charAt(0).toUpperCase() + type.slice(1);
    const titleSize = title.length > 70 ? 44 : title.length > 50 ? 48 : 54;

    const element = {
      type: 'div',
      props: {
        style: {
          display: 'flex',
          flexDirection: 'column',
          width: '100%',
          height: '100%',
          backgroundColor: '#151515',
          fontFamily: 'Inter',
        },
        children: [
          {
            type: 'div',
            props: {
              style: {
                display: 'flex',
                flexDirection: 'column',
                flex: 1,
                padding: '56px 72px 44px 72px',
                justifyContent: 'space-between',
              },
              children: [
                {
                  type: 'div',
                  props: {
                    style: {
                      display: 'flex',
                      color: '#555',
                      fontSize: 17,
                      letterSpacing: 3,
                      textTransform: 'uppercase',
                      fontWeight: 400,
                    },
                    children: 'mccomb.ca',
                  },
                },
                {
                  type: 'div',
                  props: {
                    style: {
                      display: 'flex',
                      color: '#e8e8e8',
                      fontSize: titleSize,
                      fontWeight: 700,
                      lineHeight: 1.2,
                      maxWidth: '1040px',
                    },
                    children: title,
                  },
                },
                {
                  type: 'div',
                  props: {
                    style: { display: 'flex', flexDirection: 'column' },
                    children: [
                      ...(desc
                        ? [
                            {
                              type: 'div',
                              props: {
                                style: {
                                  display: 'flex',
                                  color: '#777',
                                  fontSize: 21,
                                  lineHeight: 1.5,
                                  maxWidth: '940px',
                                  marginBottom: 18,
                                },
                                children: desc,
                              },
                            },
                          ]
                        : []),
                      {
                        type: 'div',
                        props: {
                          style: {
                            display: 'flex',
                            color: '#e06b1f',
                            fontSize: 14,
                            fontWeight: 600,
                            letterSpacing: 3,
                            textTransform: 'uppercase',
                          },
                          children: label,
                        },
                      },
                    ],
                  },
                },
              ],
            },
          },
          {
            type: 'div',
            props: {
              style: { display: 'flex', height: 5, backgroundColor: '#e06b1f', width: '100%' },
              children: '',
            },
          },
        ],
      },
    };

    const svg = await satori(element, {
      width: 1200,
      height: 630,
      fonts: [
        { name: 'Inter', data: interFont400, weight: 400, style: 'normal' },
        { name: 'Inter', data: interFont700, weight: 700, style: 'normal' },
      ],
    });

    const resvg = new Resvg(svg, { fitTo: { mode: 'width', value: 1200 } });
    const png = Buffer.from(resvg.render().asPng());

    if (ogRenderCache.size >= OG_CACHE_MAX) ogRenderCache.delete(ogRenderCache.keys().next().value);
    ogRenderCache.set(cacheKey, png);

    return sendOgPng(res, png);
  } catch (err) {
    console.error('OG image generation error:', err);
    return res.status(500).send('Failed to generate image');
  }
});

// =============================================
// Request normalization
// =============================================
const BLOCKED_FILES = new Set([
  'server.js',
  'package.json',
  'package-lock.json',
  'resume.md',
  'style.md',
  '.env',
  'node_modules',
  'data',
  'site-data',
  'archive',
]);
app.use((req, res, next) => {
  const base = req.path.replace(/^\//, '').split('/')[0];
  // Top-level segment would be served as a static path; block repo-only names.
  if (BLOCKED_FILES.has(base) || base.startsWith('.'))
    return res.status(404).sendFile(path.join(__dirname, '404.html'));
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

// =============================================
// Routes
// =============================================
app.get(['/now', '/now/', '/now.html'], (_req, res) => res.redirect(301, '/'));

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

app.get('/racecalls-summary.json', (_req, res) =>
  res.sendFile(path.join(__dirname, 'site-data', 'racecalls-summary.json'))
);

app.get(['/racecalls', '/racecalls/', '/racecalls.html'], (_req, res) => res.redirect(301, '/'));
app.get(['/admin', '/admin/', '/admin.html'], (_req, res) => res.redirect(301, '/'));

// =============================================
// Static files & error handling
// =============================================
app.use(express.static(__dirname, { extensions: ['html'] }));

app.use((err, req, res, next) => {
  if (res.headersSent) return next(err);
  console.error(err);
  return res.status(500).json({ error: 'Internal server error' });
});

app.use((req, res) => {
  res.status(404).sendFile(path.join(__dirname, '404.html'));
});

if (require.main === module) {
  const host = '0.0.0.0';
  const server = app.listen(PORT, host, () => {
    console.log(`Local site:  http://127.0.0.1:${PORT}/`);
    if (process.env.PORT) {
      console.log('(using PORT from environment; unset PORT to use the default in server.js)');
    }
  });
  server.on('error', function (err) {
    if (err && err.code === 'EADDRINUSE') {
      console.error(
        `Port ${PORT} is already in use. Stop the other process, or run: PORT=1124 npm start`
      );
    } else {
      console.error(err);
    }
    process.exit(1);
  });
}

module.exports = app;
