#!/bin/bash
# Update script for Docker VPS deployment
# Pulls latest code, backs up, rebuilds, and restarts containers

set -e  # Exit on error

echo "🔄 Starting application update..."

# Backup before update
echo "💾 Creating backup..."
bash docker/backup.sh

# Pull latest code
echo "📥 Pulling latest code..."
git pull

# Rebuild image
echo "🔨 Rebuilding Docker image..."
docker-compose build --no-cache

# Restart with zero downtime (if possible)
echo "♻️  Restarting containers..."
docker-compose up -d --force-recreate

# Wait for health check
echo "⏳ Waiting for application to be healthy..."
for i in {1..30}; do
  if docker inspect --format='{{.State.Health.Status}}' ptnextjs-app 2>/dev/null | grep -q "healthy"; then
    echo "✅ Application is healthy!"
    break
  fi
  echo "  Attempt $i/30: Waiting..."
  sleep 2
done

# Clean up old images
echo "🧹 Cleaning up old images..."
docker image prune -f

echo ""
echo "✅ Update complete!"
echo "📝 View logs: docker-compose logs -f app"
