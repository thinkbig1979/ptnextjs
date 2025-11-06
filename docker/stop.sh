#!/bin/bash
# Graceful shutdown script for Docker VPS deployment

set -e  # Exit on error

echo "🛑 Stopping Docker containers..."

# Graceful stop (sends SIGTERM, waits for graceful shutdown)
docker-compose stop

# Optionally remove containers (keeps volumes)
read -p "Remove containers? (y/n): " remove
if [ "$remove" = "y" ]; then
  echo "🗑️  Removing containers..."
  docker-compose down
fi

echo ""
echo "✅ Containers stopped"
echo "💾 Data volumes preserved"
echo "🚀 Restart with: ./docker/deploy.sh"
