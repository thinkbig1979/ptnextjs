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

# Wait for server to be healthy
echo "⏳ Waiting for server to be ready..."
MAX_ATTEMPTS=30
ATTEMPT=0
while [ $ATTEMPT -lt $MAX_ATTEMPTS ]; do
    if wget --quiet --spider http://localhost:3000/api/health 2>/dev/null; then
        echo "✅ Server is healthy!"
        break
    fi
    ATTEMPT=$((ATTEMPT + 1))
    sleep 2
done

if [ $ATTEMPT -eq $MAX_ATTEMPTS ]; then
    echo "⚠️  Server health check timed out, continuing anyway..."
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
