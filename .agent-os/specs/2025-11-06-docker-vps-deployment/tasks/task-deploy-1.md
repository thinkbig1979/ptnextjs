# Task: deploy-1 - Create deploy.sh Initial Deployment Script

**Spec:** Docker VPS Deployment Infrastructure
**Phase:** Deployment Automation
**Status:** Not Started
**Assigned Agent:** backend-nodejs-specialist
**Estimated Time:** 40 minutes
**Dependencies:** core-9

---

## Description

Create comprehensive deployment script for initial application deployment and restarts. Handles environment validation, Docker image building, network setup, and container orchestration.

---

## Specifics

**File location:** `/home/edwin/development/ptnextjs/scripts/deploy.sh`

**Responsibilities:**
1. Validate environment (.env.production exists)
2. Create external proxy network (if not exists)
3. Build Docker images
4. Start services with docker-compose
5. Wait for healthy status
6. Run health checks
7. Display deployment summary

**Usage:**
```bash
./scripts/deploy.sh [--rebuild] [--no-cache]
```

---

## Acceptance Criteria

- [ ] Script created in scripts/ directory
- [ ] Environment validation implemented
- [ ] Network creation logic
- [ ] Docker build with caching
- [ ] Service orchestration
- [ ] Health check integration
- [ ] Rollback on failure
- [ ] Informative logging
- [ ] Error handling
- [ ] Executable (chmod +x)

---

## Implementation Notes

```bash
#!/bin/bash
set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(dirname "$SCRIPT_DIR")"
cd "$PROJECT_ROOT"

# Configuration
ENV_FILE=".env.production"
COMPOSE_FILE="docker-compose.yml"
NETWORK_NAME="proxy"
BUILD_CACHE=true

# Parse arguments
for arg in "$@"; do
  case $arg in
    --rebuild) BUILD_CACHE=false ;;
    --no-cache) BUILD_CACHE=false ;;
  esac
done

# Colors for output
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m'

log_info() { echo -e "${YELLOW}[INFO]${NC} $1"; }
log_success() { echo -e "${GREEN}[SUCCESS]${NC} $1"; }
log_error() { echo -e "${RED}[ERROR]${NC} $1"; }

# Validation
log_info "Validating environment..."
if [ ! -f "$ENV_FILE" ]; then
  log_error "Environment file $ENV_FILE not found"
  log_info "Copy .env.production.example and configure"
  exit 1
fi

# Create network
log_info "Ensuring proxy network exists..."
if ! docker network inspect "$NETWORK_NAME" > /dev/null 2>&1; then
  docker network create "$NETWORK_NAME"
  log_success "Created network: $NETWORK_NAME"
else
  log_info "Network $NETWORK_NAME already exists"
fi

# Build images
log_info "Building Docker images..."
if [ "$BUILD_CACHE" = true ]; then
  docker-compose build
else
  docker-compose build --no-cache
fi
log_success "Images built successfully"

# Start services
log_info "Starting services..."
docker-compose up -d
log_success "Services started"

# Wait for health
log_info "Waiting for application to be healthy..."
sleep 10

MAX_ATTEMPTS=12
ATTEMPT=0
while [ $ATTEMPT -lt $MAX_ATTEMPTS ]; do
  if docker-compose ps | grep -q "healthy"; then
    log_success "Application is healthy"
    break
  fi
  ATTEMPT=$((ATTEMPT + 1))
  log_info "Waiting... (attempt $ATTEMPT/$MAX_ATTEMPTS)"
  sleep 5
done

if [ $ATTEMPT -eq $MAX_ATTEMPTS ]; then
  log_error "Application failed to become healthy"
  docker-compose logs app
  exit 1
fi

# Run health check
log_info "Running health checks..."
if ./scripts/health-check.sh; then
  log_success "Health checks passed"
else
  log_error "Health checks failed"
  exit 1
fi

# Summary
log_success "Deployment completed successfully"
docker-compose ps
```

**Features:**
- Environment validation
- Network management
- Build caching control
- Health monitoring
- Failure handling
- Deployment summary

---

## Testing Requirements

```bash
# Test initial deployment
./scripts/deploy.sh

# Test rebuild
./scripts/deploy.sh --rebuild

# Test with missing .env
mv .env.production .env.production.bak
./scripts/deploy.sh
# Expected: Error about missing file
mv .env.production.bak .env.production

# Verify deployment
docker-compose ps
curl http://localhost:3000/api/health
```

---

## Next Steps

After implementation:
1. Test full deployment workflow
2. Document deployment process
3. Proceed to deploy-2 (update script)
