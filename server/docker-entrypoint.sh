#!/bin/sh
set -e

# Wait for Postgres to be ready
if [ -n "$DATABASE_URL" ]; then
  echo "Waiting for PostgreSQL..."
  DB_HOST=$(echo "$DATABASE_URL" | sed -n 's|.*@\(.*\):.*|\1|p')
  DB_PORT=$(echo "$DATABASE_URL" | sed -n 's|.*:\([0-9]*\)/.*|\1|p')
  until pg_isready -h "$DB_HOST" -p "${DB_PORT:-5432}" -q; do
    sleep 1
  done
  echo "PostgreSQL is ready"

  # Run migrations
  echo "Running database migrations..."
  npx drizzle-kit push 2>&1 || echo "Migration step had issues, continuing..."
fi

exec "$@"