# Ryan McComb — personal site

Static pages plus a small Express server for APIs and local preview.

## Run locally

```bash
npm install
npm start
```

Optional: `PORT=1000 npm start`

## Writing style

See [`style.md`](style.md) for site copy rules (including: do not use em dashes).

## SEO / canonical URLs

Canonical links, Open Graph URLs, `robots.txt`, and `sitemap.xml` are generated from [`site-origin.json`](site-origin.json). After changing the `origin` field, run:

```bash
npm run seo:inject
```

## Environment variables

| Variable | Purpose |
|----------|---------|
| `PORT` | HTTP port (default `3000`) |
| `CLOUD_PASSWORD` | Bearer token for mutating `/api/*` routes in production. If unset on non-localhost, mutating APIs return `503`. |
| `NODE_ENV` | Set to `production` in production. |
| `TRUST_LOCALHOST_AUTH` | If `true`, allows unauthenticated mutating API access when the request host is `localhost` / `127.0.0.1` **even in production** (e.g. SSH tunnel). Default is off: in production, localhost still requires `CLOUD_PASSWORD` unless this is set. |
| `PUBLIC_SITE_URL` | Not used by the server; use `site-origin.json` + `seo:inject` for public URLs. |

## Security notes

- Set `CLOUD_PASSWORD` to a long random secret in production.
- The server uses **Helmet** for safer defaults; **Content-Security-Policy** is disabled because many pages use inline scripts (tightening CSP would require moving scripts to external files and/or nonces).
- **Rate limiting** applies to all `/api/*` routes; `/api/auth` has a stricter limit to reduce password guessing.
- Behind a reverse proxy (e.g. nginx), the app sets `trust proxy` in production so rate limits use the client IP from `X-Forwarded-For`.
