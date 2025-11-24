#!/bin/sh
# Docker entrypoint script for Next.js + Payload CMS
# Handles database migrations before starting the application

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

# Start the Next.js server
echo "🌐 Starting Next.js server..."
exec node server.js
