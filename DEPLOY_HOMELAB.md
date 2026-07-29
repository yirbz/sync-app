# Homelab Deploy — Sync API

## Prerequisites

```bash
apt install docker.io docker-compose-v2 git
```

## Clone & Deploy

```bash
git clone https://github.com/yvniel09/sync-app.git /opt/sync-app
cd /opt/sync-app
cp .env.example .env
```

Edit `.env`:

```env
DB_PASSWORD=<random-32-chars>
JELLYFIN_URL=https://sync-app.duckdns.org
CORS_ORIGIN=https://sync-app.vercel.app
API_PORT=3001
```

Bring up:

```bash
docker compose up -d
```

## Reverse Proxy (Caddy)

Add to Caddyfile:

```
api.sync-app.duckdns.org {
    reverse_proxy localhost:3001
}
```

## Verify

```bash
curl https://api.sync-app.duckdns.org/api/health
# → {"status":"ok","timestamp":"..."}
```

## Maintenance

```bash
# Update
cd /opt/sync-app && git pull && docker compose up -d --build

# Logs
docker compose logs -f api

# DB reset
docker compose down -v && docker compose up -d

# Manual migration
docker compose exec api npx drizzle-kit push
```