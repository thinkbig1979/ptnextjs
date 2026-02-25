#!/bin/sh
# Docker entrypoint script for Next.js + Payload CMS
# Handles database schema synchronization and cache warmup before starting the application
# Supports both PostgreSQL (production) and SQLite (development)

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

# Wait for database to be ready (PostgreSQL only - handled by depends_on healthcheck in compose)
# This is a fallback in case healthcheck isn't configured
if [ "$DB_TYPE" = "postgres" ]; then
    echo "Ensuring PostgreSQL is ready..."
    sleep 2
fi

# =============================================================================
# DATABASE SCHEMA SYNCHRONIZATION STRATEGY
# =============================================================================
# Payload CMS with push: true in payload.config.ts uses Drizzle's push mode
# to automatically sync schema changes. This happens when Payload initializes,
# which occurs on the first request to a Payload-powered endpoint.
#
# IMPORTANT: We must use full GET requests (not HEAD/--spider) because Next.js
# short-circuits HEAD requests without fully rendering, so Payload never inits.
#
# For SQLite: Run legacy migration script for custom migrations.
# =============================================================================

if [ "$DB_TYPE" = "sqlite" ] && [ -f "/app/run-migrations.js" ]; then
    echo "Running SQLite migrations..."
    node /app/run-migrations.js
    echo "Migrations complete"
fi

# Start the Next.js server
# HOSTNAME=0.0.0.0 ensures server binds to all interfaces (required for Docker)
echo "Starting Next.js server..."
HOSTNAME=0.0.0.0 node server.js &
SERVER_PID=$!

# Wait for server to be healthy
echo "Waiting for server to be ready..."

# Use 127.0.0.1 instead of localhost for Docker compatibility
SERVER_URL="http://127.0.0.1:3000"

# Phase 1: Wait for port to be open (fast check)
echo "  Phase 1: Checking if port 3000 is open..."
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
    echo "Check server logs for startup errors"
    exit 1
fi

# =============================================================================
# SCHEMA SYNC: Hit Payload API with a full GET request
# =============================================================================
# /api/globals triggers Payload initialization which runs Drizzle push mode.
# We use a full GET request (-O /dev/null), NOT --spider (HEAD), because
# HEAD requests don't trigger full page rendering in Next.js, so Payload
# never initializes and schema changes are never applied.
# =============================================================================

if [ "$DB_TYPE" = "postgres" ]; then
    echo "Triggering Payload schema sync (full GET to /admin/login)..."

    SYNC_ATTEMPTS=0
    SYNC_SUCCESS=false
    while [ $SYNC_ATTEMPTS -lt 15 ]; do
        # Full GET request that forces Payload to initialize
        # -O /dev/null discards the response body
        HTTP_CODE=$(wget --timeout=60 --server-response -O /dev/null "${SERVER_URL}/admin/login" 2>&1 | grep "HTTP/" | tail -1 | awk '{print $2}')

        if [ "$HTTP_CODE" = "200" ] || [ "$HTTP_CODE" = "302" ] || [ "$HTTP_CODE" = "307" ]; then
            echo "  OK: Payload initialized (HTTP $HTTP_CODE)"
            SYNC_SUCCESS=true
            break
        fi

        SYNC_ATTEMPTS=$((SYNC_ATTEMPTS + 1))
        if [ $SYNC_ATTEMPTS -lt 15 ]; then
            echo "  Waiting for Payload... (attempt $SYNC_ATTEMPTS/15, got HTTP ${HTTP_CODE:-timeout})"
            sleep 3
        fi
    done

    if [ "$SYNC_SUCCESS" = "true" ]; then
        # Verify schema sync by hitting an API endpoint that queries the DB
        echo "  Verifying schema sync..."
        VERIFY_CODE=$(wget --timeout=30 --server-response -O /dev/null "${SERVER_URL}/api/health" 2>&1 | grep "HTTP/" | tail -1 | awk '{print $2}')
        if [ "$VERIFY_CODE" = "200" ]; then
            echo "OK: Schema synchronization verified"
        else
            echo "WARNING: Health check returned HTTP ${VERIFY_CODE:-timeout} after schema sync"
        fi
    else
        echo "ERROR: Could not trigger Payload initialization after 15 attempts"
        echo "  The database schema may be out of sync!"
        echo "  Check logs with: docker compose logs app"
        # Don't exit - let the server run so admin can diagnose
    fi
fi

# Phase 2: Wait for health endpoint (confirms app is fully ready)
echo "  Phase 2: Checking health endpoint..."
HEALTH_ATTEMPTS=0
while [ $HEALTH_ATTEMPTS -lt 30 ]; do
    if wget --quiet --timeout=5 --spider "$SERVER_URL/api/health" 2>/dev/null; then
        TOTAL_TIME=$((PORT_ATTEMPTS + HEALTH_ATTEMPTS))
        echo "OK: Server is healthy (took ~${TOTAL_TIME} seconds)"
        break
    fi
    HEALTH_ATTEMPTS=$((HEALTH_ATTEMPTS + 1))
    sleep 2
done

if [ $HEALTH_ATTEMPTS -eq 30 ]; then
    echo "WARNING: Health endpoint not responding, but port is open."
    echo "  Server may still be initializing. Continuing with warmup..."
fi

# Cache warmup - pre-populate ISR cache for main pages
# Uses full GET requests to ensure pages are actually rendered
echo "Warming up cache..."
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

# Wait for the server process (keep container running)
wait $SERVER_PID
