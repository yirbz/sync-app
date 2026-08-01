# Production Deployment — Vercel PWA + Homelab Backend

## Architecture

```
Users ──► Vercel (PWA/Next.js)
               │
               ├──► https://sync-app.duckdns.org  (Jellyfin — media & auth)
               │
               └──► https://api.sync-app.duckdns.org  (Sync API — rooms, chat)
                              │
                              ├──► PostgreSQL
                              └──► Jellyfin (internal: http://jellyfin:8096)
```

---

## 1. Vercel — Environment Variables

Set these in **Vercel Dashboard → Project → Settings → Environment Variables**:

| Variable | Value | Scope |
|---|---|---|
| `NEXT_PUBLIC_API_URL` | `https://api.sync-app.duckdns.org/api` | Production |
| `NEXT_PUBLIC_API_URL` | `http://10.0.0.18:3001/api` | Preview / Dev (optional) |

No build-time secrets needed — the PWA talks to the homelab API and Jellyfin directly from the browser.

### Build Settings (auto-detected by Vercel)

| Setting | Value |
|---|---|
| Framework | Next.js |
| Build Command | `next build` (default) |
| Output Directory | `.next` (default) |
| Install Command | `npm ci` (default) |

---

## 2. Homelab — Environment Variables (`.env`)

| Variable | Value | Notes |
|---|---|---|
| `DB_PASSWORD` | `<random-32-chars>` | PostgreSQL password |
| `JELLYFIN_URL` | `https://sync-app.duckdns.org` | External URL — used to validate Jellyfin tokens from the PWA |
| `JELLYFIN_INTERNAL_URL` | `http://jellyfin:8096` | Internal Docker network URL — used for SyncPlay API calls (no NAT loopback needed) |
| `CORS_ORIGIN` | `https://sync-app.vercel.app` | Allow the Vercel domain. Comma-separate multiple: `https://sync-app.vercel.app,https://sync-app-git-main.vercel.app` |
| `API_PORT` | `3001` | Container port |

### Why two Jellyfin URLs?

- `JELLYFIN_URL` (external) is used by the auth middleware to validate user tokens via `Users/Me` — the browser already authenticated against this URL.
- `JELLYFIN_INTERNAL_URL` (internal) is used by the rooms API to create SyncPlay groups on Jellyfin — this call happens server-side inside Docker, so it uses the internal network (`http://jellyfin:8096`) to avoid NAT loopback issues.

---

## 3. DNS (DuckDNS)

| Record | Target |
|---|---|
| `sync-app.duckdns.org` | Homelab public IP |
| `api.sync-app.duckdns.org` | Homelab public IP |

---

## 4. Reverse Proxy (Caddy)

Config at `/opt/jellyfin/caddy/Caddyfile`:

```
sync-app.duckdns.org {
    reverse_proxy jellyfin:8096
}

api.sync-app.duckdns.org {
    reverse_proxy api:3001
}

http://sync-app.duckdns.org {
    redir https://sync-app.duckdns.org{uri}
}

http://api.sync-app.duckdns.org {
    redir https://api.sync-app.duckdns.org{uri}
}
```

The `api` container must be on the same Docker network as Caddy (`yvniel_jellyfin-net`). Configured in `docker-compose.yml`:

```yaml
networks:
  yvniel_jellyfin-net:
    external: true
```

---

## 5. Deployment Checklist

- [ ] DuckDNS records point to homelab public IP
- [ ] Ports 80/443 open on homelab firewall
- [ ] Caddy running with both subdomains configured
- [ ] Docker stack deployed: `docker compose up -d --build`
- [ ] API healthy: `curl https://api.sync-app.duckdns.org/api/health`
- [ ] Docker network `yvniel_jellyfin-net` exists and has `api` + `caddy` + `jellyfin`
- [ ] Vercel project linked to GitHub repo
- [ ] `NEXT_PUBLIC_API_URL` set in Vercel env vars
- [ ] Vercel deployment triggered and builds successfully
- [ ] CORS configured in `.env` — includes Vercel production domain
- [ ] Jellyfin users created for each friend

### Verify CORS

```bash
curl -H "Origin: https://sync-app.vercel.app" -I https://api.sync-app.duckdns.org/api/health
# → access-control-allow-origin: https://sync-app.vercel.app
```

---

## 6. Troubleshooting

| Symptom | Likely Cause | Fix |
|---|---|---|
| Room creation fails (502) | API cannot reach Jellyfin SyncPlay | Check `JELLYFIN_INTERNAL_URL` — must resolve inside Docker |
| Auth fails (401) | Token validation fails | Check `JELLYFIN_URL` — must be the public Jellyfin URL the user logged into |
| CORS error in browser | `CORS_ORIGIN` missing the Vercel domain | Add `https://sync-app.vercel.app` to `CORS_ORIGIN` |
| API unreachable from Vercel | DuckDNS / Caddy misconfigured | Verify `api.sync-app.duckdns.org` resolves and Caddy proxy is active |
