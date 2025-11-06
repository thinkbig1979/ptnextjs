# Task: health-5 - Create health-check.sh Validation Script

**Spec:** Docker VPS Deployment Infrastructure
**Phase:** Health Checks & Monitoring
**Status:** Not Started
**Assigned Agent:** backend-nodejs-specialist
**Estimated Time:** 20 minutes
**Dependencies:** health-3

---

## Description

Create a standalone health check validation script for manual testing and monitoring that tests both health endpoints and provides detailed status information.

---

## Specifics

**File location:** `/home/edwin/development/ptnextjs/scripts/health-check.sh`

**Features:**
- Test /api/health endpoint
- Test /api/health/ready endpoint
- Display response times
- Show detailed status
- Support both local and remote URLs
- Color-coded output
- Exit codes (0=healthy, 1=unhealthy)

**Usage:**
```bash
# Default (localhost)
./scripts/health-check.sh

# Custom URL
./scripts/health-check.sh https://yourdomain.com

# Verbose mode
./scripts/health-check.sh --verbose

# Check only readiness
./scripts/health-check.sh --ready-only
```

---

## Acceptance Criteria

- [ ] Script created in scripts/ directory
- [ ] Tests both health endpoints
- [ ] Displays response times
- [ ] Color-coded output (green=healthy, red=unhealthy)
- [ ] Supports custom URLs
- [ ] Verbose mode available
- [ ] Proper exit codes
- [ ] Error handling for connection failures
- [ ] Executable (chmod +x)
- [ ] Works in Docker container
- [ ] Documentation in script header

---

## Implementation Notes

```bash
#!/bin/bash
# Health Check Validation Script
# Tests application health and readiness endpoints
# Usage: ./health-check.sh [URL] [--verbose] [--ready-only]

set -e

# Colors
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Configuration
BASE_URL="${1:-http://localhost:3000}"
VERBOSE=false
READY_ONLY=false

# Parse arguments
for arg in "$@"; do
  case $arg in
    --verbose) VERBOSE=true ;;
    --ready-only) READY_ONLY=true ;;
  esac
done

# Functions
log_success() {
  echo -e "${GREEN}✓${NC} $1"
}

log_error() {
  echo -e "${RED}✗${NC} $1"
}

log_info() {
  echo -e "${YELLOW}ℹ${NC} $1"
}

check_endpoint() {
  local endpoint=$1
  local url="${BASE_URL}${endpoint}"

  log_info "Checking ${url}..."

  # Make request and capture response
  local start_time=$(date +%s%3N)
  local response=$(curl -s -w "\n%{http_code}" "$url" 2>&1)
  local end_time=$(date +%s%3N)
  local duration=$((end_time - start_time))

  local http_code=$(echo "$response" | tail -n1)
  local body=$(echo "$response" | head -n-1)

  # Check status code
  if [ "$http_code" -eq 200 ]; then
    log_success "Endpoint healthy (HTTP $http_code, ${duration}ms)"

    if [ "$VERBOSE" = true ]; then
      echo "$body" | jq '.' 2>/dev/null || echo "$body"
    fi

    return 0
  elif [ "$http_code" -eq 503 ]; then
    log_error "Endpoint not ready (HTTP $http_code, ${duration}ms)"

    if [ "$VERBOSE" = true ]; then
      echo "$body" | jq '.' 2>/dev/null || echo "$body"
    fi

    return 1
  else
    log_error "Endpoint failed (HTTP $http_code, ${duration}ms)"

    if [ "$VERBOSE" = true ]; then
      echo "Response: $body"
    fi

    return 1
  fi
}

# Main execution
echo "================================================"
echo "Health Check Validation"
echo "Base URL: ${BASE_URL}"
echo "================================================"
echo ""

EXIT_CODE=0

# Check basic health (unless --ready-only)
if [ "$READY_ONLY" = false ]; then
  if ! check_endpoint "/api/health"; then
    EXIT_CODE=1
  fi
  echo ""
fi

# Check readiness
if ! check_endpoint "/api/health/ready"; then
  EXIT_CODE=1
fi

echo ""
echo "================================================"
if [ $EXIT_CODE -eq 0 ]; then
  log_success "All health checks passed"
else
  log_error "Some health checks failed"
fi
echo "================================================"

exit $EXIT_CODE
```

**Key features:**
- Color-coded terminal output
- Response time measurement
- JSON formatting (if jq available)
- Verbose mode for debugging
- Flexible URL configuration
- Proper exit codes for scripting

**Usage examples:**
```bash
# Local development
./scripts/health-check.sh

# Production server
./scripts/health-check.sh https://yourdomain.com

# With verbose output
./scripts/health-check.sh --verbose

# Only test readiness
./scripts/health-check.sh --ready-only

# Use in CI/CD
./scripts/health-check.sh https://staging.example.com && echo "Deploy successful"
```

---

## Testing Requirements

```bash
# Make executable
chmod +x scripts/health-check.sh

# Test local
./scripts/health-check.sh

# Test with verbose
./scripts/health-check.sh --verbose

# Test with database down
docker-compose stop db
./scripts/health-check.sh
# Expected: Fails on readiness check
docker-compose start db

# Test in Docker
docker-compose exec app /app/scripts/health-check.sh
```

---

## Next Steps

After implementation:
1. Test all script modes
2. Integrate into deployment scripts
3. Document in deployment guide
4. Proceed to Phase 4 (Deployment Automation)
