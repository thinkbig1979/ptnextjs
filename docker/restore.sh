#!/bin/bash
# Restore script for Docker VPS deployment
# Restores SQLite database and media uploads from backup

set -e  # Exit on error

if [ -z "$1" ]; then
  echo "❌ Error: Backup name required"
  echo "Usage: ./restore.sh <backup-name>"
  echo "Example: ./restore.sh ptnextjs-backup-20251106-120000"
  echo ""
  echo "Available backups:"
  ls -1 backups/ | grep -E 'ptnextjs-backup.*-db.tar.gz' | sed 's/-db.tar.gz//'
  exit 1
fi

BACKUP_NAME=$1
BACKUP_DIR="./backups"

if [ ! -f "${BACKUP_DIR}/${BACKUP_NAME}-db.tar.gz" ]; then
  echo "❌ Error: Backup not found: ${BACKUP_NAME}"
  exit 1
fi

echo "🔄 Starting restore from: ${BACKUP_NAME}"
echo "⚠️  WARNING: This will overwrite current data!"
read -p "Continue? (yes/no): " confirm

if [ "$confirm" != "yes" ]; then
  echo "❌ Restore cancelled"
  exit 0
fi

# Stop containers
echo "🛑 Stopping containers..."
docker-compose down

# Restore database
echo "📦 Restoring database..."
docker run --rm \
  -v ptnextjs-payload-db:/data \
  -v "$(pwd)/${BACKUP_DIR}:/backup" \
  alpine \
  sh -c "rm -rf /data/* && tar xzf /backup/${BACKUP_NAME}-db.tar.gz -C /data"

# Restore media
echo "📦 Restoring media files..."
docker run --rm \
  -v ptnextjs-media-uploads:/media \
  -v "$(pwd)/${BACKUP_DIR}:/backup" \
  alpine \
  sh -c "rm -rf /media/* && tar xzf /backup/${BACKUP_NAME}-media.tar.gz -C /media"

# Start containers
echo "🚀 Starting containers..."
docker-compose up -d

echo ""
echo "✅ Restore complete!"
echo "📝 View logs: docker-compose logs -f app"
