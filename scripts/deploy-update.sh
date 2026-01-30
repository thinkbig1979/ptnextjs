#!/bin/bash

# =============================================================================
# PTNEXTJS PRODUCTION UPGRADE SCRIPT (PostgreSQL Version)
# =============================================================================

set -e  # Exit on any error

# Define paths
PROJECT_DIR="/home/pt/ptnextjs"
COMPOSE_DIR="/home/dockge/stacks/ptnext-app"
ENV_FILE=".env.production"
BACKUP_DIR="$COMPOSE_DIR/backups"

# Color codes
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m'

echo -e "${YELLOW}Starting update and redeploy process...${NC}"

# Pull latest code
echo -e "${YELLOW}Pulling latest changes from git...${NC}"
cd "$PROJECT_DIR" || { echo -e "${RED}Failed to cd to $PROJECT_DIR${NC}"; exit 1; }
git pull || { echo -e "${RED}Git pull failed${NC}"; exit 1; }
echo -e "${GREEN}Git pull completed${NC}"

# Change to compose directory
cd "$COMPOSE_DIR" || { echo -e "${RED}Failed to cd to $COMPOSE_DIR${NC}"; exit 1; }

# ============================================================================
# DATABASE BACKUP (PostgreSQL)
# ============================================================================
echo -e "${YELLOW}Backing up PostgreSQL database...${NC}"
mkdir -p "$BACKUP_DIR"

# Source env file to get DB credentials
set -a
source "$ENV_FILE"
set +a

BACKUP_FILE="$BACKUP_DIR/payload-$(date +%Y%m%d-%H%M%S).sql.gz"

if docker exec ptnextjs-postgres pg_isready -U "$POSTGRES_USER" -d "$POSTGRES_DB" > /dev/null 2>&1; then
    docker exec ptnextjs-postgres pg_dump -U "$POSTGRES_USER" -d "$POSTGRES_DB" | gzip > "$BACKUP_FILE" || {
        echo -e "${RED}Database backup failed${NC}"; exit 1;
    }
    echo -e "${GREEN}Database backed up to: $BACKUP_FILE${NC}"

    # Keep only last 5 backups
    ls -t "$BACKUP_DIR"/payload-*.sql.gz 2>/dev/null | tail -n +6 | xargs -r rm --
    echo -e "${YELLOW}Old backups cleaned (keeping last 5)${NC}"
else
    echo -e "${YELLOW}PostgreSQL container not running - skipping backup${NC}"
fi

# Verify required build-time vars
echo -e "${YELLOW}Verifying build-time environment variables...${NC}"
REQUIRED_VARS=("NEXT_PUBLIC_SERVER_URL" "NEXT_PUBLIC_SITE_URL" "NEXT_PUBLIC_BASE_URL" "NEXT_PUBLIC_HCAPTCHA_SITE_KEY" "PAYLOAD_SECRET" "POSTGRES_USER"
"POSTGRES_PASSWORD" "POSTGRES_DB")
MISSING_VARS=()
for var in "${REQUIRED_VARS[@]}"; do
    if ! grep -q "^${var}=" "$ENV_FILE" 2>/dev/null; then
        MISSING_VARS+=("$var")
    fi
done
if [ ${#MISSING_VARS[@]} -ne 0 ]; then
    echo -e "${RED}Missing required variables: ${MISSING_VARS[*]}${NC}"
    exit 1
fi
echo -e "${GREEN}All required variables present${NC}"

# Sync media files (fix path to match volume mount)
echo -e "${YELLOW}Syncing media files...${NC}"
MEDIA_TARGET="${MEDIA_PATH:-$COMPOSE_DIR/media}"
mkdir -p "$MEDIA_TARGET"
if [ -d "$PROJECT_DIR/public/media" ] && [ "$(ls -A $PROJECT_DIR/public/media 2>/dev/null)" ]; then
    cp -r "$PROJECT_DIR/public/media/"* "$MEDIA_TARGET/" 2>/dev/null || true
    echo -e "${GREEN}Media files synced to $MEDIA_TARGET${NC}"
else
    echo -e "${YELLOW}No media files to sync${NC}"
fi

# Build new image with build args for NEXT_PUBLIC vars
echo -e "${YELLOW}Building new image (old container still running)...${NC}"
docker compose --env-file "$ENV_FILE" build \
    --build-arg NEXT_PUBLIC_SERVER_URL="$NEXT_PUBLIC_SERVER_URL" \
    --build-arg NEXT_PUBLIC_BASE_URL="$NEXT_PUBLIC_BASE_URL" \
    --build-arg NEXT_PUBLIC_SITE_URL="$NEXT_PUBLIC_SITE_URL" \
    --build-arg NEXT_PUBLIC_HCAPTCHA_SITE_KEY="$NEXT_PUBLIC_HCAPTCHA_SITE_KEY" \
    --no-cache || { echo -e "${RED}Build failed${NC}"; exit 1; }

# Capture timestamp before container swap
DEPLOY_TIME=$(date -u +%Y-%m-%dT%H:%M:%SZ)

# Swap containers
echo -e "${YELLOW}Swapping to new container...${NC}"
docker compose --env-file "$ENV_FILE" up -d --force-recreate app || { echo -e "${RED}Failed to start new container${NC}"; exit 1; }

# Clean up
echo -e "${YELLOW}Cleaning up old images...${NC}"
docker image prune -f

# Health check
echo -e "${YELLOW}Waiting for app to be healthy...${NC}"
for i in {1..30}; do
    if curl -sf http://localhost:${PORT:-3000}/api/health > /dev/null 2>&1; then
        echo -e "${GREEN}App is healthy!${NC}"
        break
    fi
    if [ $i -eq 30 ]; then
        echo -e "${RED}App failed to become healthy in 30 seconds${NC}"
        echo -e "${YELLOW}Check logs with: docker compose logs app${NC}"
    fi
    sleep 1
done

echo -e "${GREEN}Deployment completed!${NC}"

# Show logs from this deployment only
echo -e "${YELLOW}Showing container logs from this deployment (Ctrl+C to exit):${NC}"
docker compose --env-file "$ENV_FILE" logs -f --since="$DEPLOY_TIME"
