#!/bin/bash
# Initial deployment script for Docker VPS deployment
# Creates network, validates environment, builds image, starts containers

set -e  # Exit on error

echo "🚀 Starting Docker VPS Deployment..."

# Check if docker network 'proxy' exists, create if not
if ! docker network inspect proxy >/dev/null 2>&1; then
  echo "📡 Creating external 'proxy' network..."
  docker network create proxy
fi

# Validate .env.production file exists
if [ ! -f .env.production ]; then
  echo "❌ Error: .env.production file not found"
  echo "📝 Please copy .env.production.example to .env.production and configure"
  exit 1
fi

# Build Docker image
echo "🔨 Building Docker image..."
docker-compose build --no-cache

# Start services
echo "🚢 Starting containers..."
docker-compose up -d

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

# Show status
echo ""
echo "📊 Deployment Status:"
docker-compose ps

echo ""
echo "✅ Deployment complete!"
echo "🌐 Application should be accessible via your reverse proxy"
echo "📝 View logs: docker-compose logs -f app"
