#!/bin/bash
# Backup script for Docker VPS deployment
# Backs up SQLite database and media uploads

set -e  # Exit on error

BACKUP_DIR="./backups"
TIMESTAMP=$(date +%Y%m%d-%H%M%S)
BACKUP_NAME="ptnextjs-backup-${TIMESTAMP}"

echo "💾 Starting backup: ${BACKUP_NAME}"

# Create backup directory
mkdir -p "${BACKUP_DIR}"

# Backup SQLite database from volume
echo "📦 Backing up database..."
docker run --rm \
  -v ptnextjs-payload-db:/data:ro \
  -v "$(pwd)/${BACKUP_DIR}:/backup" \
  alpine \
  tar czf "/backup/${BACKUP_NAME}-db.tar.gz" -C /data .

# Backup media uploads from volume
echo "📦 Backing up media files..."
docker run --rm \
  -v ptnextjs-media-uploads:/media:ro \
  -v "$(pwd)/${BACKUP_DIR}:/backup" \
  alpine \
  tar czf "/backup/${BACKUP_NAME}-media.tar.gz" -C /media .

echo ""
echo "✅ Backup complete!"
echo "📂 Location: ${BACKUP_DIR}/${BACKUP_NAME}-*.tar.gz"
echo "💾 Database: ${BACKUP_NAME}-db.tar.gz"
echo "🖼️  Media: ${BACKUP_NAME}-media.tar.gz"
