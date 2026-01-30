#!/bin/sh
# Docker entrypoint script for Next.js + Payload CMS
# Handles database schema synchronization and cache warmup before starting the application
# Supports both PostgreSQL (production) and SQLite (development)

set -e

echo "🚀 Starting Paul Thames Platform..."

# Detect database type from DATABASE_URL
if echo "$DATABASE_URL" | grep -q "^postgres"; then
    echo "📦 PostgreSQL database detected"
    DB_TYPE="postgres"
elif echo "$DATABASE_URL" | grep -q "^file:"; then
    echo "📦 SQLite database detected"
    DB_TYPE="sqlite"
else
    echo "⚠️  Unknown database type, assuming PostgreSQL"
    DB_TYPE="postgres"
fi

# Wait for database to be ready (PostgreSQL only - handled by depends_on healthcheck in compose)
# This is a fallback in case healthcheck isn't configured
if [ "$DB_TYPE" = "postgres" ]; then
    echo "⏳ Ensuring PostgreSQL is ready..."
    # The compose healthcheck should handle this, but wait a moment just in case
    sleep 2
fi

# =============================================================================
# DATABASE SCHEMA SYNCHRONIZATION STRATEGY
# =============================================================================
# Payload CMS with push: true in payload.config.ts uses Drizzle's push mode
# to automatically sync schema changes. This happens when Payload initializes,
# which occurs on the first request to a Payload-powered endpoint.
#
# Problem: The homepage may try to query new columns before Payload initializes.
# Solution: After server starts, hit the Payload admin endpoint FIRST to trigger
#           schema sync before warming up public pages.
#
# For SQLite: Run legacy migration script for custom migrations.
# =============================================================================

if [ "$DB_TYPE" = "sqlite" ] && [ -f "/app/run-migrations.js" ]; then
    echo "🔄 Running SQLite migrations..."
    node /app/run-migrations.js
    echo "✅ Migrations complete"
fi

# Start the Next.js server
# HOSTNAME=0.0.0.0 ensures server binds to all interfaces (required for Docker)
echo "🌐 Starting Next.js server..."
HOSTNAME=0.0.0.0 node server.js &
SERVER_PID=$!

# Wait for server to be healthy (two-phase check)
echo "⏳ Waiting for server to be ready..."

# Use 127.0.0.1 instead of localhost for Docker compatibility
SERVER_URL="http://127.0.0.1:3000"

# Phase 1: Wait for port to be open (fast check)
echo "   Phase 1: Checking if port 3000 is open..."
PORT_ATTEMPTS=0
while [ $PORT_ATTEMPTS -lt 60 ]; do
    if wget --quiet --timeout=2 --spider "$SERVER_URL" 2>/dev/null; then
        echo "   ✓ Port 3000 is responding"
        break
    fi
    PORT_ATTEMPTS=$((PORT_ATTEMPTS + 1))
    sleep 1
done

# =============================================================================
# SCHEMA SYNC: Hit Payload admin endpoint FIRST
# =============================================================================
# This triggers Payload initialization which runs Drizzle push mode.
# We do this BEFORE the health check and cache warmup to ensure schema
# is synced before any public pages try to query new columns.
# =============================================================================

if [ "$DB_TYPE" = "postgres" ]; then
    echo "🔄 Triggering Payload schema sync..."
    echo "   Hitting /admin to initialize Payload and sync database schema"

    SYNC_ATTEMPTS=0
    while [ $SYNC_ATTEMPTS -lt 10 ]; do
        # Request the admin page - this initializes Payload and triggers push mode
        # We use --timeout=30 because schema sync can take time on first run
        HTTP_CODE=$(wget --quiet --timeout=30 --server-response --spider "${SERVER_URL}/admin" 2>&1 | grep "HTTP/" | tail -1 | awk '{print $2}')

        if [ "$HTTP_CODE" = "200" ] || [ "$HTTP_CODE" = "302" ] || [ "$HTTP_CODE" = "307" ]; then
            echo "   ✓ Payload initialized (HTTP $HTTP_CODE)"
            echo "✅ Schema synchronization complete"
            break
        fi

        SYNC_ATTEMPTS=$((SYNC_ATTEMPTS + 1))
        if [ $SYNC_ATTEMPTS -lt 10 ]; then
            echo "   ⏳ Waiting for Payload... (attempt $SYNC_ATTEMPTS/10)"
            sleep 3
        fi
    done

    if [ $SYNC_ATTEMPTS -eq 10 ]; then
        echo "   ⚠️  Could not confirm Payload initialization"
        echo "   Schema may sync on first admin access"
    fi
fi

# Phase 2: Wait for health endpoint (confirms app is fully ready)
echo "   Phase 2: Checking health endpoint..."
HEALTH_ATTEMPTS=0
while [ $HEALTH_ATTEMPTS -lt 30 ]; do
    if wget --quiet --timeout=5 --spider "$SERVER_URL/api/health" 2>/dev/null; then
        TOTAL_TIME=$((PORT_ATTEMPTS + HEALTH_ATTEMPTS))
        echo "✅ Server is healthy! (took ~${TOTAL_TIME} seconds)"
        break
    fi
    HEALTH_ATTEMPTS=$((HEALTH_ATTEMPTS + 1))
    sleep 2
done

if [ $HEALTH_ATTEMPTS -eq 30 ]; then
    echo "⚠️  Health endpoint not responding, but port is open."
    echo "   Server may still be initializing. Continuing with warmup..."
fi

# Cache warmup - pre-populate ISR cache for main pages
echo "🔥 Warming up cache..."
WARMUP_URLS="/ /vendors /products /blog /about /contact"
for url in $WARMUP_URLS; do
    # Use longer timeout for page generation (ISR can be slow on first hit)
    HTTP_CODE=$(wget --quiet --timeout=30 --server-response --spider "${SERVER_URL}${url}" 2>&1 | grep "HTTP/" | tail -1 | awk '{print $2}')
    if [ "$HTTP_CODE" = "200" ] || [ "$HTTP_CODE" = "304" ]; then
        echo "   ✓ ${url}"
    else
        echo "   ✗ ${url} (HTTP ${HTTP_CODE:-timeout})"
    fi
done
echo "✅ Cache warmup complete!"

# Wait for the server process (keep container running)
wait $SERVER_PID
