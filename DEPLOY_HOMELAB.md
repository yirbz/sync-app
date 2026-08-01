# Homelab Deploy — Sync App

> Deploy the backend stack (PostgreSQL + Sync API) for the WatchTogether PWA.
> The frontend (PWA) deploys separately on Vercel.

## Prerequisites

```bash
# Docker & friends
apt install docker.io docker-compose-v2 git ufw

# DuckDNS already configured — DNS records:
#   sync-app.duckdns.org  →  <homelab-public-ip>
#   api.sync-app.duckdns.org  →  <homelab-public-ip>
```

Open firewall ports for Caddy:

```bash
ufw allow 80/tcp && ufw allow 443/tcp
```

## Clone & Configure

```bash
sudo git clone https://github.com/yvniel09/sync-app.git /opt/sync-app
sudo chown -R $USER:$USER /opt/sync-app
cd /opt/sync-app
cp .env.example .env
```

Edit `.env`:

```env
DB_PASSWORD=<random-32-chars>
JELLYFIN_URL=https://sync-app.duckdns.org
CORS_ORIGIN=http://localhost:3000,https://sync-app.vercel.app
API_PORT=3001
```

| Variable | Purpose |
|---|---|
| `DB_PASSWORD` | PostgreSQL password (generate: `openssl rand -hex 16`) |
| `JELLYFIN_URL` | Public URL of your Jellyfin server (where Caddy proxies to Jellyfin) |
| `CORS_ORIGIN` | Comma-separated origins allowed to call the API (dev + production) |
| `API_PORT` | Internal API port (default 3001, exposed by Docker) |

## Deploy

```bash
# Build & start
docker compose up -d --build

# Watch logs until healthy
docker compose logs -f api
```

## Reverse Proxy (Caddy)

> Caddy and Jellyfin should already be running on the `yvniel_jellyfin-net` network.

Edit `/opt/jellyfin/caddy/Caddyfile`:

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

Reload Caddy:

```bash
docker exec caddy caddy reload --config /etc/caddy/Caddyfile
```

## Vercel (PWA)

When deploying the frontend to Vercel, set this environment variable:

```env
NEXT_PUBLIC_API_URL=https://api.sync-app.duckdns.org/api
```

## Verify

```bash
# API health
curl https://api.sync-app.duckdns.org/api/health
# → {"status":"ok","timestamp":"..."}

# CORS headers (replace with your Vercel domain)
curl -H "Origin: https://sync-app.vercel.app" -I https://api.sync-app.duckdns.org/api/health
# → access-control-allow-origin: https://sync-app.vercel.app
```

## Maintenance

```bash
# Update
cd /opt/sync-app && git pull && docker compose up -d --build

# Logs
docker compose logs -f api

# DB reset (⚠️ deletes all data)
docker compose down -v && docker compose up -d

# Manual migration
docker compose exec api npx drizzle-kit push
```