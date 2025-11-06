# Task: core-8 - Create entrypoint.sh Startup Script

**Spec:** Docker VPS Deployment Infrastructure
**Phase:** Core Docker Infrastructure (TDD GREEN)
**Status:** Not Started
**Assigned Agent:** backend-nodejs-specialist
**Estimated Time:** 30 minutes
**Dependencies:** core-2

---

## Description

Create a robust container entrypoint script that handles environment validation, database connection waiting, schema initialization, and graceful application startup with proper error handling.

---

## Specifics

**File location:** `/home/edwin/development/ptnextjs/entrypoint.sh`

**Responsibilities:**
1. Validate required environment variables
2. Wait for PostgreSQL database to be ready
3. Run database migrations (if needed)
4. Initialize Payload CMS schema
5. Start Next.js server
6. Handle errors gracefully
7. Support health check probes

**Execution context:**
- Runs as container CMD in Dockerfile
- Executes as non-root user (nodejs)
- Must be executable (chmod +x)
- Should handle signals (SIGTERM, SIGINT)

---

## Acceptance Criteria

- [ ] entrypoint.sh created at project root
- [ ] Bash shebang and error handling configured
- [ ] Environment variable validation implemented
- [ ] Database connection retry logic implemented
- [ ] PostgreSQL readiness check (pg_isready)
- [ ] Database migration execution (if applicable)
- [ ] Payload CMS schema initialization
- [ ] Next.js server startup command
- [ ] Graceful shutdown handling
- [ ] Informative logging throughout
- [ ] Script is executable (chmod +x)
- [ ] Script runs successfully in Docker container
- [ ] Exit codes follow convention (0=success, 1=error)

---

## Testing Requirements

**Local testing:**
```bash
# Make executable
chmod +x entrypoint.sh

# Test with valid environment
export DATABASE_URL="postgresql://payload:password@localhost:5432/payload"
export PAYLOAD_SECRET="test-secret-minimum-32-characters"
export NEXT_PUBLIC_SERVER_URL="http://localhost:3000"
./entrypoint.sh

# Test with missing environment variable
unset PAYLOAD_SECRET
./entrypoint.sh
# Expected: Error and exit

# Test database wait logic (no database running)
./entrypoint.sh
# Expected: Retry attempts, then timeout
```

**Docker testing:**
```bash
# Build image
docker build -t ptnextjs:test .

# Test entrypoint with docker-compose
docker-compose up
# Expected: Containers start, app waits for db, then starts

# Test graceful shutdown
docker-compose stop
# Expected: Clean shutdown, no errors

# Clean up
docker-compose down -v
```

---

## Evidence Requirements

**Completion evidence:**
1. entrypoint.sh committed with execute permissions
2. Successful startup log showing all validation steps
3. Database wait retry log screenshots
4. Graceful shutdown demonstration
5. Error handling validation (missing env vars)

**Documentation:**
- Inline comments explaining each section
- Error messages clear and actionable
- Troubleshooting guide reference

---

## Context Requirements

**Required knowledge:**
- Bash scripting best practices
- PostgreSQL connection testing (pg_isready)
- Docker container lifecycle
- Signal handling in containers
- Environment variable validation

**Files to reference:**
- docker-compose.yml (core-3) - environment variables
- .env.production.example (core-7) - required variables
- Dockerfile (core-2) - execution context

---

## Implementation Notes

**entrypoint.sh structure:**

```bash
#!/bin/bash
set -e  # Exit on error
set -u  # Exit on undefined variable

# ============================================
# CONFIGURATION
# ============================================

MAX_DB_RETRIES=30
DB_RETRY_INTERVAL=2
TIMEOUT=60

# ============================================
# LOGGING FUNCTIONS
# ============================================

log_info() {
  echo "[INFO] $(date '+%Y-%m-%d %H:%M:%S') - $1"
}

log_error() {
  echo "[ERROR] $(date '+%Y-%m-%d %H:%M:%S') - $1" >&2
}

log_warn() {
  echo "[WARN] $(date '+%Y-%m-%d %H:%M:%S') - $1"
}

# ============================================
# ENVIRONMENT VALIDATION
# ============================================

log_info "Validating environment variables..."

# Required variables
REQUIRED_VARS=(
  "DATABASE_URL"
  "PAYLOAD_SECRET"
  "NEXT_PUBLIC_SERVER_URL"
)

for var in "${REQUIRED_VARS[@]}"; do
  if [ -z "${!var:-}" ]; then
    log_error "Required environment variable $var is not set"
    exit 1
  fi
done

log_info "Environment validation passed"

# ============================================
# DATABASE CONNECTION WAIT
# ============================================

log_info "Waiting for PostgreSQL to be ready..."

# Extract database connection details from DATABASE_URL
# Format: postgresql://user:password@host:port/database
DB_HOST=$(echo "$DATABASE_URL" | sed -n 's/.*@\([^:]*\).*/\1/p')
DB_PORT=$(echo "$DATABASE_URL" | sed -n 's/.*:\([0-9]*\)\/.*/\1/p')
DB_USER=$(echo "$DATABASE_URL" | sed -n 's/.*:\/\/\([^:]*\).*/\1/p')

if [ -z "$DB_PORT" ]; then
  DB_PORT=5432
fi

log_info "Database: $DB_HOST:$DB_PORT (user: $DB_USER)"

# Wait for PostgreSQL with retry logic
retries=0
until [ $retries -ge $MAX_DB_RETRIES ]; do
  if pg_isready -h "$DB_HOST" -p "$DB_PORT" -U "$DB_USER" > /dev/null 2>&1; then
    log_info "PostgreSQL is ready!"
    break
  fi

  retries=$((retries + 1))
  log_warn "PostgreSQL not ready yet (attempt $retries/$MAX_DB_RETRIES)"
  sleep $DB_RETRY_INTERVAL
done

if [ $retries -ge $MAX_DB_RETRIES ]; then
  log_error "Failed to connect to PostgreSQL after $MAX_DB_RETRIES attempts"
  exit 1
fi

# ============================================
# DATABASE SCHEMA INITIALIZATION
# ============================================

log_info "Initializing database schema..."

# Payload CMS auto-creates schema on first connection
# This is handled by Payload, no manual migration needed
# But we can add a connection test here

log_info "Schema initialization will be handled by Payload CMS on startup"

# ============================================
# STARTUP INFORMATION
# ============================================

log_info "Starting application..."
log_info "Node version: $(node --version)"
log_info "Environment: ${NODE_ENV:-production}"
log_info "Server URL: $NEXT_PUBLIC_SERVER_URL"

# ============================================
# GRACEFUL SHUTDOWN HANDLER
# ============================================

shutdown() {
  log_info "Received shutdown signal, gracefully stopping..."
  # Next.js server will handle SIGTERM gracefully
  exit 0
}

trap shutdown SIGTERM SIGINT

# ============================================
# START APPLICATION
# ============================================

log_info "Executing Next.js standalone server..."

# Execute the Next.js server
# Using exec to replace shell process (proper signal handling)
exec node server.js
```

**Key features:**

1. **Environment validation:**
   - Checks all required variables before startup
   - Fails fast with clear error messages
   - Prevents silent failures

2. **Database wait logic:**
   - Uses pg_isready for connection testing
   - Implements retry with exponential backoff
   - Configurable timeout and retry count
   - Extracts connection details from DATABASE_URL

3. **Error handling:**
   - set -e: Exit on any error
   - set -u: Exit on undefined variable
   - Clear error messages with timestamps
   - Proper exit codes (0=success, 1=error)

4. **Logging:**
   - Structured log format with timestamps
   - Different log levels (INFO, WARN, ERROR)
   - Helpful context in all messages
   - Easy to parse for monitoring

5. **Signal handling:**
   - Trap SIGTERM and SIGINT
   - Graceful shutdown support
   - Proper process cleanup

6. **Security:**
   - No hardcoded secrets
   - No sensitive data in logs
   - Runs as non-root user (defined in Dockerfile)

**Database connection parsing:**
```bash
# Example DATABASE_URL:
# postgresql://payload:password@db:5432/payload

# Extract host: db
# Extract port: 5432
# Extract user: payload

# Uses sed regex to parse URL components
```

**Retry logic:**
```
Attempt 1: Wait 2s
Attempt 2: Wait 2s
...
Attempt 30: Wait 2s
Total max wait: 60 seconds
```

**Integration with Dockerfile:**
```dockerfile
# In Dockerfile (core-2)
COPY --chown=nodejs:nodejs entrypoint.sh /app/
RUN chmod +x /app/entrypoint.sh
CMD ["/app/entrypoint.sh"]
```

**Common pitfalls:**

- Don't forget chmod +x (script must be executable)
- Don't use `source` or `.` (use exec for CMD)
- Do use `exec` for final command (signal handling)
- Do validate all environment variables early
- Do implement proper retry logic (database startup delay)
- Do log helpful messages for debugging

**Troubleshooting scenarios:**

1. **Database connection timeout:**
   - Check DATABASE_URL format
   - Verify database container running
   - Check network connectivity
   - Increase MAX_DB_RETRIES if needed

2. **Missing environment variable:**
   - Check .env.production file
   - Verify docker-compose.yml mounts
   - Review error message for specific variable

3. **Permission denied:**
   - Verify entrypoint.sh is executable
   - Check file ownership (should be nodejs user)
   - Review Dockerfile COPY --chown command

---

## Next Steps

After completing this task:
1. Test entrypoint.sh locally
2. Integrate with Dockerfile
3. Test in Docker Compose stack
4. Proceed to core-9 (verify integration tests pass)

**Critical path task:** This script is essential for proper container startup. Must be robust and well-tested.
