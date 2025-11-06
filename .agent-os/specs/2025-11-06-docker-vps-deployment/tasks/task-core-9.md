# Task: core-9 - Verify Docker Stack Tests Pass (GREEN)

**Spec:** Docker VPS Deployment Infrastructure
**Phase:** Core Docker Infrastructure (TDD GREEN Verification)
**Status:** Not Started
**Assigned Agent:** test-architect
**Estimated Time:** 30 minutes
**Dependencies:** core-2, core-3, core-8

---

## Description

Execute the Docker stack integration tests (written in core-1) and verify they now PASS after implementing the Docker infrastructure. This completes the TDD GREEN phase for core infrastructure.

---

## Specifics

**Test execution:**
- Run integration tests from task core-1
- Verify ALL tests now pass (GREEN phase)
- Document any remaining failures
- Fix implementation issues if tests fail
- Achieve 100% test pass rate

**Success criteria:**
- All container startup tests pass
- All service connectivity tests pass
- All data persistence tests pass
- All environment configuration tests pass
- Zero test failures

**If tests fail:**
1. Analyze failure reasons
2. Identify missing implementation
3. Fix infrastructure code
4. Re-run tests until GREEN

---

## Acceptance Criteria

- [ ] All integration tests executed
- [ ] Container startup tests: PASSING
- [ ] Service connectivity tests: PASSING
- [ ] Data persistence tests: PASSING
- [ ] Environment configuration tests: PASSING
- [ ] Zero test failures
- [ ] Test execution time documented
- [ ] Test coverage report generated
- [ ] All infrastructure components validated
- [ ] GREEN phase completion confirmed

---

## Testing Requirements

**Test execution:**
```bash
# Run Docker stack integration tests
npm run test:integration -- docker-stack.test.ts

# Expected output: All tests PASS
# ✓ Container Startup
#   ✓ should start application container
#   ✓ should start PostgreSQL container
#   ✓ should create named volumes
# ✓ Service Connectivity
#   ✓ should respond to HTTP requests
#   ✓ should connect to PostgreSQL
# ✓ Data Persistence
#   ✓ should persist data across restarts
# ✓ Environment Configuration
#   ✓ should load environment variables

# Generate coverage report
npm run test:coverage -- docker-stack.test.ts

# Manual verification
docker-compose up -d
docker-compose ps
# All services should show "healthy"

docker-compose down -v
```

**Validation checklist:**
- [ ] Dockerfile builds successfully
- [ ] docker-compose.yml starts all services
- [ ] PostgreSQL container healthy
- [ ] Application container healthy
- [ ] Database connection established
- [ ] Health check endpoint responding
- [ ] Data persists across restarts
- [ ] Environment variables loaded
- [ ] Volumes created correctly
- [ ] Network connectivity working

---

## Evidence Requirements

**Completion evidence:**
1. Test execution output showing ALL PASS
2. Test coverage report (100% of infrastructure)
3. docker-compose ps showing healthy services
4. Docker logs showing successful startup
5. Screenshot of GREEN test suite

**Documentation:**
- Test results summary
- Performance metrics (startup time)
- Any issues encountered and resolved
- Recommendations for future improvements

---

## Context Requirements

**Required knowledge:**
- Integration test interpretation
- Docker debugging techniques
- Log analysis
- Troubleshooting container issues

**Files to reference:**
- Test file: `tests/integration/docker-stack.test.ts` (core-1)
- All Docker infrastructure files (core-2 through core-8)

**Dependencies:**
- Dockerfile (core-2)
- docker-compose.yml (core-3)
- entrypoint.sh (core-8)
- payload.config.ts (core-6)
- next.config.js (core-5)

---

## Implementation Notes

**Test execution workflow:**

1. **Pre-execution checks:**
   ```bash
   # Ensure clean state
   docker-compose down -v
   docker system prune -f

   # Verify no port conflicts
   lsof -i :3000
   lsof -i :5432
   ```

2. **Run tests:**
   ```bash
   # Execute integration tests
   npm run test:integration -- docker-stack.test.ts --verbose

   # Watch for specific test output
   # - Container startup times
   # - Health check response times
   # - Database connection latency
   ```

3. **Analyze results:**
   - GREEN: All tests pass → Proceed to next phase
   - RED: Some tests fail → Debug and fix

4. **Debug failing tests:**
   ```bash
   # Check container logs
   docker-compose logs app
   docker-compose logs db

   # Inspect container state
   docker-compose ps
   docker inspect ptnextjs_app_1

   # Test connectivity manually
   docker-compose exec app wget -O- http://localhost:3000/api/health
   docker-compose exec app pg_isready -h db -U payload
   ```

**Common failure scenarios:**

1. **Container won't start:**
   - Check Dockerfile syntax
   - Verify entrypoint.sh is executable
   - Review environment variables
   - Check for missing dependencies

2. **Database connection fails:**
   - Verify DATABASE_URL format
   - Check PostgreSQL container status
   - Verify network connectivity
   - Review entrypoint.sh wait logic

3. **Health check fails:**
   - Health endpoint not implemented yet (expected - Phase 3)
   - Temporarily modify test to skip health check
   - Add TODO to implement in health-2

4. **Data persistence fails:**
   - Check volume configuration
   - Verify volume mounts
   - Test with docker volume inspect

5. **Environment variables not loaded:**
   - Check .env.production file
   - Verify docker-compose.yml env mapping
   - Review entrypoint.sh validation

**Fixing implementation issues:**

```bash
# If tests fail, iterate:
1. Identify failing test
2. Review related infrastructure code
3. Make fix
4. Rebuild: docker-compose build
5. Re-test: npm run test:integration
6. Repeat until GREEN
```

**Performance benchmarks:**

Expected timings:
- Container startup: < 30 seconds
- Database ready: < 15 seconds
- Application ready: < 45 seconds (total)
- Health check response: < 500ms
- Test suite execution: < 2 minutes

**Test result interpretation:**

```
PASS tests/integration/docker-stack.test.ts
  ✓ Docker Stack Integration (45.2s)
    ✓ Container Startup (20.1s)
      ✓ should start application container (15.2s)
      ✓ should start PostgreSQL container (3.1s)
      ✓ should create named volumes (1.8s)
    ✓ Service Connectivity (18.5s)
      ✓ should respond to HTTP requests (12.3s)
      ✓ should connect to PostgreSQL (6.2s)
    ✓ Data Persistence (5.1s)
      ✓ should persist data across restarts (5.1s)
    ✓ Environment Configuration (1.5s)
      ✓ should load environment variables (1.5s)

Test Suites: 1 passed, 1 total
Tests:       8 passed, 8 total
Time:        45.2s
```

**Success criteria validation:**

- [ ] All 8 tests pass
- [ ] Total execution time < 60 seconds
- [ ] No warnings in output
- [ ] Clean shutdown (no hanging containers)

**Note on health check tests:**

If health check endpoint not yet implemented (Phase 3):
- Modify test to skip health check validation temporarily
- Add TODO comment referencing task health-2
- Plan to re-run full suite after Phase 3

**TDD Phase completion:**

Upon achieving GREEN:
- ✓ RED phase: Tests written (core-1)
- ✓ GREEN phase: Tests passing (core-9)
- → REFACTOR phase: Optional optimization (future)

---

## Next Steps

After completing this task:
1. Document GREEN achievement
2. Create test results summary
3. Proceed to Phase 3 (Health Checks)
4. Prepare for health-1 (Health Check Tests)

**Milestone:** Core Docker infrastructure complete and validated. Ready for health check implementation.

**Critical path completion:** This task marks the completion of the core infrastructure implementation. All subsequent phases build on this foundation.
