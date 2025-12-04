#!/bin/sh
# Docker entrypoint script for Next.js + Payload CMS
# Handles database migrations and cache warmup before starting the application

set -e

echo "🚀 Starting Paul Thames Platform..."

# Check if database exists
if [ -f "/data/payload.db" ]; then
    echo "📦 Existing database found at /data/payload.db"

    # Run Payload migrations if available
    if [ -f "/app/run-migrations.js" ]; then
        echo "🔄 Running database migrations..."
        node /app/run-migrations.js
        echo "✅ Migrations complete"
    fi
else
    echo "📦 No existing database - will be created on first start"
fi

# Start the Next.js server in background
echo "🌐 Starting Next.js server..."
node server.js &
SERVER_PID=$!

# Wait for server to be healthy (two-phase check)
echo "⏳ Waiting for server to be ready..."

# Phase 1: Wait for port to be open (fast check)
echo "   Phase 1: Checking if port 3000 is open..."
PORT_ATTEMPTS=0
while [ $PORT_ATTEMPTS -lt 60 ]; do
    if wget --quiet --timeout=2 --spider http://localhost:3000 2>/dev/null; then
        echo "   ✓ Port 3000 is responding"
        break
    fi
    PORT_ATTEMPTS=$((PORT_ATTEMPTS + 1))
    sleep 1
done

# Phase 2: Wait for health endpoint (confirms app is fully ready)
echo "   Phase 2: Checking health endpoint..."
HEALTH_ATTEMPTS=0
while [ $HEALTH_ATTEMPTS -lt 30 ]; do
    if wget --quiet --timeout=5 --spider http://localhost:3000/api/health 2>/dev/null; then
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
    if wget --quiet --spider "http://localhost:3000${url}" 2>/dev/null; then
        echo "   ✓ ${url}"
    else
        echo "   ✗ ${url} (failed)"
    fi
done
echo "✅ Cache warmup complete!"

# Wait for the server process (keep container running)
wait $SERVER_PID
