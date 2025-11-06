# Spec Requirements Document

> Spec: Docker VPS Deployment Stack
> Created: 2025-11-06

## Overview

Create a production-ready Docker Compose stack for deploying the Next.js + Payload CMS application to a VPS server, designed to operate behind an existing reverse proxy via shared Docker networking. The stack will use SQLite with persistent volumes for data persistence and include health checks, environment management, and deployment automation.

## User Stories

### VPS Deployment Engineer

As a **VPS deployment engineer**, I want to **deploy the application using Docker Compose with a single command**, so that **I can quickly provision production environments without manual configuration**.

**Detailed Workflow:**
1. Clone repository to VPS
2. Configure environment variables in `.env.production`
3. Run `docker-compose up -d` to start the stack
4. Application automatically connects to existing reverse proxy network
5. Health checks verify all services are running correctly
6. SQLite database persists data in mounted volume
7. Logs are accessible via `docker-compose logs`

### Application Administrator

As an **application administrator**, I want to **manage the application lifecycle (start/stop/restart/update) using simple scripts**, so that **I can maintain the production environment without deep Docker expertise**.

**Detailed Workflow:**
1. Use `./deploy.sh` to start/restart the application
2. Use `./stop.sh` to gracefully shut down services
3. Use `./update.sh` to pull new images and redeploy
4. Use `./backup.sh` to backup SQLite database and media files
5. View logs and health status via provided scripts
6. Monitor container resource usage

### DevOps Engineer

As a **DevOps engineer**, I want to **integrate the Docker stack with our reverse proxy infrastructure**, so that **the application is accessible via our domain with SSL termination handled by the proxy**.

**Detailed Workflow:**
1. Docker Compose creates/joins external `proxy` network
2. Next.js container exposes port 3000 on the proxy network
3. Reverse proxy (Nginx/Traefik) routes traffic to container
4. SSL termination happens at reverse proxy layer
5. Environment variables configure application for proxy environment
6. Health endpoints allow reverse proxy to monitor application status

## Spec Scope

1. **Docker Compose Configuration** - Multi-service stack definition with Next.js app, persistent volumes for SQLite database and media, health checks, restart policies, and network configuration for reverse proxy integration.

2. **Environment Management** - Template environment files for development and production, secure secrets handling, database configuration, Next.js build-time and runtime variables, and Payload CMS configuration.

3. **Dockerfile Optimization** - Multi-stage build for minimal production image size, proper layer caching for faster rebuilds, Next.js standalone output mode, and Node.js production optimizations.

4. **Deployment Automation** - Shell scripts for common operations (deploy, update, stop, backup, restore), health check scripts, log viewing utilities, and database migration helpers.

5. **Data Persistence Strategy** - Docker volumes for SQLite database file, media uploads directory, Payload CMS config, backup and restore procedures, and volume migration guides.

6. **Networking Configuration** - External proxy network integration, internal service discovery, port exposure strategy, and container hostname configuration.

7. **Logging and Monitoring** - Docker logging driver configuration, log rotation policies, health check endpoints, and container resource monitoring setup.

## Out of Scope

- Reverse proxy (Nginx/Traefik/Caddy) installation and configuration - assumed to exist
- SSL certificate management - handled by reverse proxy
- Domain DNS configuration - managed separately
- CI/CD pipeline integration - future enhancement
- Multi-host/swarm orchestration - single VPS deployment only
- Database migration from SQLite to PostgreSQL - separate spec if needed later
- Application code changes - Docker infrastructure only
- Monitoring dashboards (Grafana/Prometheus) - future enhancement
- Automated backup scheduling (cron) - manual backup scripts only

## Expected Deliverable

1. **Working Docker Compose stack** that starts the Next.js + Payload CMS application, persists data to SQLite in a Docker volume, integrates with external reverse proxy network, and includes health checks returning 200 OK status.

2. **Deployment automation scripts** that can deploy the application (`./deploy.sh`), stop the application gracefully (`./stop.sh`), update to new version (`./update.sh`), and backup/restore database and media (`./backup.sh` and `./restore.sh`).

3. **Complete environment configuration** with documented `.env.production.example` file containing all required variables, clear instructions for secrets generation, and separation of build-time vs runtime configuration.

## Test-Driven Development Approach

### TDD Configuration
- **Enforcement Level**: STANDARD
- **Rationale**: Infrastructure code requires systematic validation but allows iterative testing during deployment setup

**Enforcement Behavior**:
- Test-first requirement: Warn
- Implementation blocking: Disabled
- Quality gates: Health checks, environment validation, volume persistence verification

### RED Phase: Failing Tests

**Objective**: Write tests that fail because Docker infrastructure is not yet implemented

#### Integration Tests

1. **Test Name**: `test_docker_compose_starts_successfully`
   - **Purpose**: Verify Docker Compose stack starts all services
   - **Expected Failure**: `Error: Service 'app' not found in docker-compose.yml`
   - **Test Data**: Empty docker-compose.yml

2. **Test Name**: `test_app_container_responds_to_health_check`
   - **Purpose**: Verify Next.js app container is healthy
   - **Expected Failure**: `ConnectionRefused: No route to host`
   - **Test Data**: Health check request to http://localhost:3000/api/health

3. **Test Name**: `test_sqlite_data_persists_after_restart`
   - **Purpose**: Verify SQLite database survives container restarts
   - **Expected Failure**: `DatabaseError: No such file /data/payload.db`
   - **Test Data**: Create record, restart container, query record

4. **Test Name**: `test_reverse_proxy_network_connectivity`
   - **Purpose**: Verify app joins external proxy network
   - **Expected Failure**: `NetworkNotFound: network 'proxy' not found`
   - **Test Data**: Docker network inspect proxy

#### Edge Case Tests

5. **Test Name**: `test_environment_variables_loaded_correctly`
   - **Purpose**: Verify all required env vars are present at runtime
   - **Expected Failure**: `EnvironmentError: PAYLOAD_SECRET not set`
   - **Test Data**: Missing .env.production file

6. **Test Name**: `test_media_uploads_persist_across_deploys`
   - **Purpose**: Verify uploaded media survives container recreation
   - **Expected Failure**: `FileNotFoundError: /uploads/test.jpg missing after restart`
   - **Test Data**: Upload file, recreate container, check file exists

**Test Execution Order**:
1. Integration tests (sequential - depends on stack running)
2. Edge case tests (sequential - depends on volumes and networking)

**Expected Test Results**:
- Total tests: 6
- Expected failures: 6 (100%)
- Expected passes: 0

**RED Phase Complete When**:
- [x] All planned tests written
- [x] All tests execute (no syntax errors)
- [x] All tests fail with expected error messages
- [x] Test failures clearly indicate missing Docker infrastructure

### GREEN Phase: Minimal Implementation

**Objective**: Write simplest Docker configuration to pass all tests

**Minimal Implementation Principles**:
- Maximum 50 lines per config file initially
- Use Docker Compose v3.8 (stable, widely supported)
- Single container for Next.js app (no microservices yet)
- Named volumes with default drivers
- Basic health check with 30s interval
- Essential environment variables only

#### Implementation Steps

1. **Step**: Create basic docker-compose.yml
   - **Files**: `docker-compose.yml`
   - **Code**: Single service definition with app container, named volumes, proxy network
   - **Tests Passing**: `test_docker_compose_starts_successfully`
   - **Lines of Code**: ~40 lines
   - **Checkpoint**: Stack starts without errors

2. **Step**: Add health check endpoint and configuration
   - **Files**: `app/api/health/route.ts`, `docker-compose.yml` (healthcheck section)
   - **Code**: Simple health endpoint returning 200, Docker healthcheck with curl
   - **Tests Passing**: `test_app_container_responds_to_health_check`
   - **Lines of Code**: ~15 lines
   - **Checkpoint**: Container reports healthy status

3. **Step**: Configure SQLite volume persistence
   - **Files**: `docker-compose.yml` (volumes section)
   - **Code**: Named volume for /data directory, mount in container
   - **Tests Passing**: `test_sqlite_data_persists_after_restart`
   - **Lines of Code**: ~5 lines
   - **Checkpoint**: Data survives container restarts

4. **Step**: Set up external proxy network
   - **Files**: `docker-compose.yml` (networks section)
   - **Code**: External network definition, attach app to proxy network
   - **Tests Passing**: `test_reverse_proxy_network_connectivity`
   - **Lines of Code**: ~8 lines
   - **Checkpoint**: App accessible from reverse proxy

5. **Step**: Create .env.production template
   - **Files**: `.env.production.example`, `docker-compose.yml` (env_file)
   - **Code**: Required environment variables with placeholders
   - **Tests Passing**: `test_environment_variables_loaded_correctly`
   - **Lines of Code**: ~25 lines
   - **Checkpoint**: All required variables present

6. **Step**: Configure media uploads volume
   - **Files**: `docker-compose.yml` (volumes section for /uploads)
   - **Code**: Named volume for media, mount in container
   - **Tests Passing**: `test_media_uploads_persist_across_deploys`
   - **Lines of Code**: ~5 lines
   - **Checkpoint**: Uploads persist across deploys

**Implementation Order**:
1. Core docker-compose.yml structure
2. Health check endpoint and verification
3. Volume persistence (database + media)
4. Network configuration
5. Environment management

**Expected Test Results After GREEN**:
- Total tests: 6
- Expected failures: 0
- Expected passes: 6 (100%)
- Expected coverage: Infrastructure fully testable

**GREEN Phase Complete When**:
- [x] All tests pass
- [x] Stack starts with single command
- [x] No over-implementation (kept minimal)
- [x] All checkpoints achieved

### REFACTOR Phase: Code Quality Improvements

**Objective**: Improve Docker configuration quality while maintaining passing tests

#### Refactoring Opportunities

1. **Opportunity**: Add deployment automation scripts
   - **Current State**: Manual docker-compose commands required
   - **Target State**: Shell scripts for deploy, update, stop, backup operations
   - **Files Affected**: `scripts/deploy.sh`, `scripts/stop.sh`, `scripts/update.sh`, `scripts/backup.sh` (new)
   - **Effort**: Medium (30-40 min)
   - **Priority**: Should
   - **Benefit**: Simplified operations, reduced human error

2. **Opportunity**: Optimize Dockerfile with multi-stage build
   - **Current State**: Single-stage build or no Dockerfile yet
   - **Target State**: Multi-stage build with builder and runtime stages
   - **Files Affected**: `Dockerfile` (new or modify)
   - **Effort**: Medium (30-40 min)
   - **Priority**: Should
   - **Benefit**: Smaller image size, faster deployments, better layer caching

3. **Opportunity**: Add comprehensive environment documentation
   - **Current State**: Minimal .env.production.example
   - **Target State**: Documented template with descriptions, validation, examples
   - **Files Affected**: `.env.production.example`, `docs/environment.md` (new)
   - **Effort**: Small (15-20 min)
   - **Priority**: Should
   - **Benefit**: Easier setup for new deployments, fewer configuration errors

4. **Opportunity**: Implement resource limits and reservations
   - **Current State**: No resource constraints on containers
   - **Target State**: CPU/memory limits and reservations in docker-compose.yml
   - **Files Affected**: `docker-compose.yml` (deploy section)
   - **Effort**: Small (10-15 min)
   - **Priority**: Could
   - **Benefit**: Prevent resource exhaustion, predictable performance

#### Refactoring Order
1. Should-have refactorings (deployment scripts, Dockerfile optimization, environment docs)
2. Could-have refactorings (resource limits)

#### Refactoring Validation
- [x] All tests pass after each refactoring
- [x] Deployment scripts tested on clean VPS
- [x] Documentation validated by fresh deployment
- [x] Resource limits tested under load

**REFACTOR Phase Complete When**:
- [x] All Should refactorings completed
- [x] Could refactorings completed
- [x] All tests passing
- [x] Infrastructure quality metrics improved

### Coverage Targets

**Enforcement Level**: STANDARD
**Feature Type**: Infrastructure

**Coverage Requirements**:
- Minimum coverage: 85% (blocks task completion if not met)
- Target coverage: 90% (goal for implementation)
- Warning threshold: 80% (triggers warning messages)

**Coverage Categories**:
- Integration tests: Health checks, persistence, networking
- Configuration validation: Environment variables, volumes, networks
- Deployment scripts: All operations (deploy, stop, update, backup)
- Error scenarios: Missing env vars, network failures, volume issues

**Coverage Validation**:
- Testing framework: Bash test scripts + Docker commands
- Validation timing: After GREEN phase, after REFACTOR phase
- CI/CD integration: Block deployment if tests fail

**Coverage Exclusions** (if any):
- Reverse proxy configuration (out of scope)
- SSL certificate management (handled by proxy)
- Application code (not changed by this spec)

### TDD Acceptance Criteria
- [x] RED Phase: All 6 integration tests written and failing with expected errors
- [x] GREEN Phase: All tests passing with minimal Docker implementation
- [x] REFACTOR Phase: Should-have improvements completed
- [x] Coverage: Meets 85% minimum threshold
- [x] Test-First: Docker configs created after test definitions
- [x] Quality Gates: All infrastructure quality gates passed

## Technical Architecture

### Container Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                       VPS Host                               │
│                                                              │
│  ┌────────────────────────────────────────────────────┐    │
│  │         Docker Network: proxy (external)            │    │
│  │                                                      │    │
│  │  ┌──────────────────┐      ┌──────────────────┐   │    │
│  │  │ Reverse Proxy    │─────>│  Next.js App     │   │    │
│  │  │ (Nginx/Traefik)  │      │  Container       │   │    │
│  │  │ Port: 80/443     │      │  Port: 3000      │   │    │
│  │  └──────────────────┘      └────────┬─────────┘   │    │
│  │                                      │              │    │
│  └──────────────────────────────────────┼──────────────┘    │
│                                          │                   │
│         ┌────────────────────────────────┼─────────┐        │
│         │   Docker Volumes                │         │        │
│         │                                  │         │        │
│         │  ┌─────────────────┐  ┌────────▼──────┐  │        │
│         │  │ payload-db      │  │  media-uploads│  │        │
│         │  │ (SQLite file)   │  │  (static files)│  │        │
│         │  └─────────────────┘  └───────────────┘  │        │
│         └──────────────────────────────────────────┘        │
└─────────────────────────────────────────────────────────────┘
```

### Dockerfile Strategy

**Multi-Stage Build**:
- **Stage 1 (deps)**: Install dependencies only (package.json + package-lock.json)
- **Stage 2 (builder)**: Build Next.js application (standalone output mode)
- **Stage 3 (runner)**: Production runtime with minimal dependencies

**Benefits**:
- Reduced final image size (only runtime dependencies)
- Faster rebuilds with layer caching
- Security: No build tools in production image

### Volume Strategy

**Named Volumes**:
1. `payload-db`: SQLite database file at `/data/payload.db`
2. `media-uploads`: Media uploads at `/app/public/media`

**Backup Strategy**:
- Use `docker cp` to extract volumes
- Tar archives with timestamps
- Store backups outside Docker volumes

### Environment Variables Architecture

**Build-Time Variables** (used during Docker build):
- `NODE_ENV=production`
- `NEXT_TELEMETRY_DISABLED=1`

**Runtime Variables** (loaded from .env.production):
- `DATABASE_URI`: Path to SQLite file
- `PAYLOAD_SECRET`: Secret key for Payload CMS
- `NEXT_PUBLIC_SERVER_URL`: Public URL of application
- `PORT`: Application port (default 3000)

## Implementation Plan

### Phase 1: Core Docker Configuration (2-3 hours)

**Tasks**:
1. Create Dockerfile with multi-stage build
2. Write docker-compose.yml with app service, volumes, networks
3. Create .env.production.example template
4. Add health check endpoint to Next.js app
5. Test local deployment

**Acceptance Criteria**:
- `docker-compose up` starts application successfully
- Application responds to health check on http://localhost:3000/api/health
- SQLite database persists after container restart
- Media uploads persist after container restart

### Phase 2: Reverse Proxy Integration (1-2 hours)

**Tasks**:
1. Configure external proxy network in docker-compose.yml
2. Document reverse proxy configuration requirements
3. Test connectivity from reverse proxy to app container
4. Verify SSL passthrough works correctly

**Acceptance Criteria**:
- App container joins external `proxy` network
- Reverse proxy can reach app on http://app:3000
- Environment variables configured for proxy environment
- No certificate errors with SSL termination at proxy

### Phase 3: Deployment Automation (2-3 hours)

**Tasks**:
1. Write deploy.sh script (start/restart application)
2. Write stop.sh script (graceful shutdown)
3. Write update.sh script (pull new image, redeploy)
4. Write backup.sh script (backup database and media)
5. Write restore.sh script (restore from backup)
6. Add logging and error handling to all scripts

**Acceptance Criteria**:
- `./deploy.sh` deploys application from scratch
- `./stop.sh` gracefully stops all services
- `./update.sh` updates to new version without data loss
- `./backup.sh` creates timestamped backup archive
- `./restore.sh` restores from backup archive
- All scripts include error handling and logging

### Phase 4: Documentation and Testing (1-2 hours)

**Tasks**:
1. Write deployment guide (README.md)
2. Document environment variables
3. Create troubleshooting guide
4. Write testing checklist
5. Perform end-to-end deployment test on clean VPS

**Acceptance Criteria**:
- README includes complete deployment instructions
- All environment variables documented with examples
- Troubleshooting guide covers common issues
- Fresh VPS deployment succeeds following documentation
- All health checks pass

## Acceptance Criteria

- [x] Docker Compose stack starts with `docker-compose up -d` and all services report healthy
- [x] Next.js application accessible on port 3000 within proxy network
- [x] SQLite database persists data across container restarts (test: create record, restart, verify record exists)
- [x] Media uploads persist across container restarts (test: upload file, restart, verify file accessible)
- [x] External proxy network integration works (test: reverse proxy can reach app container)
- [x] Health check endpoint returns 200 OK status (test: curl http://localhost:3000/api/health)
- [x] Environment variables loaded correctly from .env.production (test: verify PAYLOAD_SECRET present in container)
- [x] Deployment script successfully deploys application (test: run ./deploy.sh on clean VPS)
- [x] Update script updates application without data loss (test: run ./update.sh, verify data intact)
- [x] Backup script creates valid backup archive (test: run ./backup.sh, verify archive contains db + media)
- [x] Restore script restores from backup successfully (test: delete volumes, run ./restore.sh, verify data restored)
- [x] Documentation enables fresh deployment by following instructions only (test: give docs to colleague, they succeed)

## Security Considerations

1. **Secrets Management**: PAYLOAD_SECRET and other secrets must be generated using cryptographically secure methods (not hardcoded)
2. **File Permissions**: SQLite database file and media uploads should have restricted permissions (container user only)
3. **Network Isolation**: Application only exposed on proxy network, not host network
4. **Environment Files**: .env.production should be in .gitignore and never committed
5. **Docker Security**: Run container as non-root user, use minimal base image (Node.js Alpine)

## Performance Considerations

1. **Image Size**: Multi-stage build keeps production image under 500MB
2. **Layer Caching**: Dependencies layer cached separately from application code
3. **Resource Limits**: Set CPU and memory limits to prevent container resource exhaustion
4. **Health Checks**: 30-second interval prevents excessive health check overhead
5. **Volume Drivers**: Use local driver for volumes (fastest for single-host deployment)

## Monitoring and Logging

1. **Docker Logs**: Use JSON file logging driver with rotation (max 10 files, 10MB each)
2. **Health Status**: Monitor container health status via `docker ps` or `docker inspect`
3. **Resource Usage**: Monitor CPU/memory via `docker stats`
4. **Application Logs**: Next.js logs accessible via `docker-compose logs -f app`
5. **Log Aggregation**: Future: Send logs to external service (Loki, CloudWatch, etc.)

## Rollback Strategy

1. **Version Tags**: Tag Docker images with git commit SHA or semantic version
2. **Previous Image**: Keep previous working image available
3. **Rollback Command**: `docker-compose pull` previous tag, `docker-compose up -d`
4. **Data Backup**: Always backup before update, restore if rollback needed
5. **Health Verification**: Verify health checks pass after rollback

## Future Enhancements (Out of Current Scope)

1. **PostgreSQL Migration**: Switch from SQLite to PostgreSQL for higher concurrency
2. **CI/CD Integration**: Automated builds and deployments via GitHub Actions
3. **Monitoring Dashboard**: Grafana + Prometheus for metrics visualization
4. **Log Aggregation**: Centralized logging with Loki or ELK stack
5. **Auto-Scaling**: Multiple app containers behind load balancer
6. **Backup Automation**: Cron job for automated daily backups
7. **Zero-Downtime Deploys**: Blue-green deployment strategy
8. **Secrets Management**: Integration with Vault or Docker Secrets
