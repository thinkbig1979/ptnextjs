# Task: core-1 - Write Docker Stack Integration Tests (RED)

**Spec:** Docker VPS Deployment Infrastructure
**Phase:** Core Docker Infrastructure (TDD RED)
**Status:** Not Started
**Assigned Agent:** test-architect
**Estimated Time:** 40 minutes
**Dependencies:** pre-1

---

## Description

Write comprehensive integration tests for the Docker stack BEFORE implementing the infrastructure (TDD RED phase). Tests should validate Docker container startup, service connectivity, health checks, and data persistence.

---

## Specifics

**Test file location:** `tests/integration/docker-stack.test.ts`

**Test suites to create:**

1. **Docker Stack Startup Tests**
   - Container starts successfully
   - PostgreSQL container initializes
   - Application container connects to database
   - Named volumes are created
   - External network connection established

2. **Service Connectivity Tests**
   - Application responds on configured port
   - PostgreSQL accepts connections
   - Health check endpoint accessible
   - Database ready check functional

3. **Data Persistence Tests**
   - Data survives container restart
   - Volume mounts work correctly
   - Media uploads persist
   - Database state maintained

4. **Environment Configuration Tests**
   - Environment variables loaded correctly
   - Database URL configured properly
   - JWT secret present and valid
   - Required variables enforced

**Test framework:** Jest with Docker test utilities

**Expected result:** ALL TESTS SHOULD FAIL (RED phase - no implementation yet)

---

## Acceptance Criteria

- [ ] Integration test file created at correct location
- [ ] All 4 test suites implemented with descriptive names
- [ ] Tests use Docker Compose programmatically (dockerode or docker-compose npm package)
- [ ] Tests validate container health status
- [ ] Tests check service connectivity (HTTP requests)
- [ ] Tests verify data persistence across restarts
- [ ] Tests validate environment variable configuration
- [ ] All tests currently FAIL (RED phase confirmation)
- [ ] Test code follows project testing standards
- [ ] Tests include proper setup/teardown

---

## Testing Requirements

**Test structure:**
```typescript
describe('Docker Stack Integration', () => {
  beforeAll(async () => {
    // Start Docker Compose stack
  });

  afterAll(async () => {
    // Clean up containers and volumes
  });

  describe('Container Startup', () => {
    it('should start application container', async () => {
      // Test implementation
    });

    it('should start PostgreSQL container', async () => {
      // Test implementation
    });

    it('should create named volumes', async () => {
      // Test implementation
    });
  });

  describe('Service Connectivity', () => {
    it('should respond to HTTP requests', async () => {
      // Test implementation
    });

    it('should connect to PostgreSQL', async () => {
      // Test implementation
    });
  });

  describe('Data Persistence', () => {
    it('should persist data across restarts', async () => {
      // Test implementation
    });
  });

  describe('Environment Configuration', () => {
    it('should load environment variables', async () => {
      // Test implementation
    });
  });
});
```

**Test execution:**
```bash
npm run test:integration -- docker-stack.test.ts
```

**Expected outcome:** All tests FAIL (files don't exist yet)

---

## Evidence Requirements

**Completion evidence:**
1. Test file committed: `tests/integration/docker-stack.test.ts`
2. Test execution screenshot showing FAILING tests
3. Code review approval from quality-assurance agent
4. Test coverage report showing test structure

**Documentation:**
- Test plan document explaining test strategy
- Expected behaviors documented in test descriptions
- Setup/teardown logic documented

---

## Context Requirements

**Required knowledge:**
- Docker Compose test automation
- Integration testing patterns
- Node.js Docker client libraries (dockerode)
- HTTP request testing (supertest)
- PostgreSQL connection testing (pg library)

**Files to reference:**
- Spec: `.agent-os/specs/2025-11-06-docker-vps-deployment/spec.md`
- Existing test patterns: `tests/` directory
- Jest configuration: `jest.config.js`

**Dependencies to install:**
```bash
npm install --save-dev dockerode @types/dockerode docker-compose
```

---

## Implementation Notes

**TDD RED Phase Strategy:**
1. Write tests that describe desired Docker behavior
2. Tests should be comprehensive but focused
3. Use async/await for container operations
4. Include generous timeouts (container startup can be slow)
5. Clean up containers/volumes in afterAll hooks
6. Use environment variables for test configuration

**Test isolation:**
- Each test suite should be independent
- Use unique container names for parallel testing
- Clean up resources even if tests fail

**Docker test utilities:**
- Use dockerode for programmatic Docker control
- Consider docker-compose npm package for compose operations
- Implement retry logic for container readiness

**Key validations:**
- Container exit code = 0 (running)
- Health check status = healthy
- HTTP response status = 200
- Database connection successful
- Volume mounts correct paths

---

## Next Steps

After completing this task:
1. Verify ALL tests are RED (failing)
2. Document test failure reasons
3. Proceed to core-2 (Create Dockerfile)
4. Return to core-9 to verify tests pass (GREEN phase)

**Critical:** Do NOT implement Docker infrastructure in this task. This is test-writing ONLY.
