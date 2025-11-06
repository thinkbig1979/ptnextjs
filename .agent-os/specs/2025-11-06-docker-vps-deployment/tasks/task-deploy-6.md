# Task: deploy-6 - Create logs.sh Log Viewing Utility

**Spec:** Docker VPS Deployment Infrastructure
**Phase:** Deployment Automation
**Status:** Not Started
**Assigned Agent:** backend-nodejs-specialist
**Estimated Time:** 20 minutes
**Dependencies:** deploy-1

---

## Description

Create convenient log viewing utility for monitoring application and database logs with filtering, following, and formatting options.

---

## Specifics

**File:** `/home/edwin/development/ptnextjs/scripts/logs.sh`

**Features:**
- View application logs
- View database logs
- Follow mode (tail -f)
- Filter by service
- Timestamp display
- Error filtering
- Log export

**Usage:**
```bash
./scripts/logs.sh [app|db|all] [--follow] [--tail 100] [--errors-only]
```

---

## Acceptance Criteria

- [ ] Script created with log viewing logic
- [ ] Service selection (app/db/all)
- [ ] Follow mode support
- [ ] Tail line count configuration
- [ ] Error filtering
- [ ] Timestamp formatting
- [ ] Color-coded output
- [ ] Log export capability
- [ ] Executable

---

## Implementation Notes

```bash
#!/bin/bash

SERVICE="${1:-all}"
FOLLOW=false
TAIL=100
ERRORS_ONLY=false

for arg in "$@"; do
  case $arg in
    --follow|-f) FOLLOW=true ;;
    --tail) TAIL="$2"; shift 2 ;;
    --errors-only) ERRORS_ONLY=true ;;
  esac
done

log_info "Viewing logs for: $SERVICE"

# Build docker-compose logs command
CMD="docker-compose logs"

if [ "$FOLLOW" = true ]; then
  CMD="$CMD -f"
fi

CMD="$CMD --tail=$TAIL"

if [ "$SERVICE" != "all" ]; then
  CMD="$CMD $SERVICE"
fi

# Execute with optional error filtering
if [ "$ERRORS_ONLY" = true ]; then
  $CMD | grep -i "error\|exception\|fail"
else
  $CMD
fi
```

**Features:**
- Wrapper around docker-compose logs
- Service filtering
- Follow mode for real-time monitoring
- Error filtering with grep
- Configurable tail count

**Usage examples:**
```bash
# View last 100 lines from all services
./scripts/logs.sh

# Follow application logs
./scripts/logs.sh app --follow

# View last 500 database logs
./scripts/logs.sh db --tail 500

# View only errors
./scripts/logs.sh --errors-only

# Export logs to file
./scripts/logs.sh app --tail 1000 > app-logs.txt
```

---

## Testing Requirements

```bash
# Test all services
./scripts/logs.sh

# Test follow mode
./scripts/logs.sh app --follow
# Make request, verify logs update

# Test error filtering
./scripts/logs.sh --errors-only

# Test specific service
./scripts/logs.sh db
```

---

## Next Steps

After implementation, proceed to Phase 5 (Testing & Validation).
