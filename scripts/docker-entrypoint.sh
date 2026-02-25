#!/bin/sh
# Docker entrypoint script for Next.js + Payload CMS
# Handles database schema synchronization and cache warmup before starting the application

set -e

echo "Starting Paul Thames Platform..."

# Detect database type from DATABASE_URL
if echo "$DATABASE_URL" | grep -q "^postgres"; then
    echo "PostgreSQL database detected"
    DB_TYPE="postgres"
elif echo "$DATABASE_URL" | grep -q "^file:"; then
    echo "SQLite database detected"
    DB_TYPE="sqlite"
else
    echo "WARNING: Unknown database type, assuming PostgreSQL"
    DB_TYPE="postgres"
fi

# Wait for database to be ready (PostgreSQL only)
if [ "$DB_TYPE" = "postgres" ]; then
    echo "Ensuring PostgreSQL is ready..."
    sleep 2
fi

# SQLite legacy migrations
if [ "$DB_TYPE" = "sqlite" ] && [ -f "/app/run-migrations.js" ]; then
    echo "Running SQLite migrations..."
    node /app/run-migrations.js
    echo "Migrations complete"
fi

# Start the Next.js server in background
echo "Starting Next.js server..."
HOSTNAME=0.0.0.0 node server.js &
SERVER_PID=$!

SERVER_URL="http://127.0.0.1:3000"

# Phase 1: Wait for port to be open
echo "Phase 1: Waiting for port 3000..."
PORT_ATTEMPTS=0
while [ $PORT_ATTEMPTS -lt 60 ]; do
    if wget --quiet --timeout=2 --spider "$SERVER_URL" 2>/dev/null; then
        echo "  OK: Port 3000 is responding"
        break
    fi
    PORT_ATTEMPTS=$((PORT_ATTEMPTS + 1))
    sleep 1
done

if [ $PORT_ATTEMPTS -eq 60 ]; then
    echo "ERROR: Port 3000 never opened after 60 seconds"
    exit 1
fi

# =============================================================================
# Phase 2: Schema sync via /api/health/ready
# =============================================================================
# This endpoint calls getPayloadClient() which initializes Payload and triggers
# Drizzle's push: true mode. It then queries the DB to verify connectivity.
# A 200 response means: Payload initialized + schema pushed + DB queryable.
#
# We use a full GET request (-O /dev/null), NOT --spider (HEAD), because
# Next.js may short-circuit HEAD requests without fully initializing Payload.
# =============================================================================

echo "Phase 2: Triggering schema sync via /api/health/ready..."

SYNC_ATTEMPTS=0
SYNC_SUCCESS=false
while [ $SYNC_ATTEMPTS -lt 20 ]; do
    HTTP_CODE=$(wget --timeout=60 --server-response -O /dev/null "${SERVER_URL}/api/health/ready" 2>&1 | grep "HTTP/" | tail -1 | awk '{print $2}')

    if [ "$HTTP_CODE" = "200" ]; then
        echo "  OK: Payload initialized, schema synced, database connected"
        SYNC_SUCCESS=true
        break
    fi

    SYNC_ATTEMPTS=$((SYNC_ATTEMPTS + 1))
    echo "  Attempt $SYNC_ATTEMPTS/20: got HTTP ${HTTP_CODE:-timeout}, retrying in 3s..."
    sleep 3
done

if [ "$SYNC_SUCCESS" = "false" ]; then
    echo "ERROR: Schema sync failed after 20 attempts"
    echo "  The database schema may be out of sync!"
    echo "  Check logs: docker compose logs app"
    # Don't exit - let the server run for diagnostics
fi

# Phase 3: Cache warmup (only after schema sync succeeds)
if [ "$SYNC_SUCCESS" = "true" ]; then
    echo "Phase 3: Warming up cache..."
    WARMUP_URLS="/ /vendors /products /blog /about /contact"
    for url in $WARMUP_URLS; do
        HTTP_CODE=$(wget --timeout=30 --server-response -O /dev/null "${SERVER_URL}${url}" 2>&1 | grep "HTTP/" | tail -1 | awk '{print $2}')
        if [ "$HTTP_CODE" = "200" ] || [ "$HTTP_CODE" = "304" ]; then
            echo "  OK: ${url}"
        else
            echo "  FAIL: ${url} (HTTP ${HTTP_CODE:-timeout})"
        fi
    done
    echo "Cache warmup complete"
else
    echo "Skipping cache warmup due to schema sync failure"
fi

echo "Startup complete"

# Wait for the server process (keep container running)
wait $SERVER_PID
