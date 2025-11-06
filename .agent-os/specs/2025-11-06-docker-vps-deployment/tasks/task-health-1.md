# Task: health-1 - Write Health Check Endpoint Tests (RED)

**Spec:** Docker VPS Deployment Infrastructure
**Phase:** Health Checks & Monitoring (TDD RED)
**Status:** Not Started
**Assigned Agent:** test-architect
**Estimated Time:** 25 minutes
**Dependencies:** core-9

---

## Description

Write comprehensive tests for health check endpoints BEFORE implementing them (TDD RED phase). Tests should validate basic health status, database connectivity, and readiness probes.

---

## Specifics

**Test file location:** `tests/integration/health-checks.test.ts`

**Endpoints to test:**
1. `/api/health` - Basic health check (always returns 200 if app running)
2. `/api/health/ready` - Readiness check (includes database connectivity)

**Test scenarios:**

**Basic Health Check:**
- Returns HTTP 200 status
- Returns JSON response
- Includes status field (value: "ok")
- Includes timestamp
- Responds quickly (< 100ms)

**Readiness Check:**
- Returns HTTP 200 when database connected
- Returns HTTP 503 when database unavailable
- Includes database connection status
- Includes status field
- Includes timestamp
- Tests database connectivity
- Responds within 1 second

**Expected result:** ALL TESTS SHOULD FAIL (RED phase - endpoints don't exist yet)

---

## Acceptance Criteria

- [ ] Health check test file created
- [ ] Basic health check tests implemented
- [ ] Readiness check tests implemented
- [ ] Database connectivity tests implemented
- [ ] Response format validation tests
- [ ] Performance tests (response time)
- [ ] Error handling tests (database down)
- [ ] All tests currently FAIL (RED phase)
- [ ] Test code follows project standards
- [ ] Setup/teardown properly configured

---

## Testing Requirements

**Test structure:**
```typescript
describe('Health Check Endpoints', () => {
  describe('GET /api/health', () => {
    it('should return 200 status', async () => {
      const response = await request(app).get('/api/health');
      expect(response.status).toBe(200);
    });

    it('should return JSON response', async () => {
      const response = await request(app).get('/api/health');
      expect(response.type).toBe('application/json');
    });

    it('should include status field', async () => {
      const response = await request(app).get('/api/health');
      expect(response.body).toHaveProperty('status', 'ok');
    });

    it('should include timestamp', async () => {
      const response = await request(app).get('/api/health');
      expect(response.body).toHaveProperty('timestamp');
      expect(new Date(response.body.timestamp)).toBeInstanceOf(Date);
    });

    it('should respond quickly', async () => {
      const start = Date.now();
      await request(app).get('/api/health');
      const duration = Date.now() - start;
      expect(duration).toBeLessThan(100);
    });
  });

  describe('GET /api/health/ready', () => {
    it('should return 200 when database connected', async () => {
      const response = await request(app).get('/api/health/ready');
      expect(response.status).toBe(200);
    });

    it('should include database status', async () => {
      const response = await request(app).get('/api/health/ready');
      expect(response.body).toHaveProperty('database');
      expect(response.body.database).toHaveProperty('connected');
    });

    it('should test database connectivity', async () => {
      const response = await request(app).get('/api/health/ready');
      expect(response.body.database.connected).toBe(true);
    });

    it('should return 503 when database unavailable', async () => {
      // Stop database
      await stopDatabase();

      const response = await request(app).get('/api/health/ready');
      expect(response.status).toBe(503);
      expect(response.body.database.connected).toBe(false);

      // Restart database
      await startDatabase();
    });

    it('should respond within 1 second', async () => {
      const start = Date.now();
      await request(app).get('/api/health/ready');
      const duration = Date.now() - start;
      expect(duration).toBeLessThan(1000);
    });
  });
});
```

**Test execution:**
```bash
npm run test:integration -- health-checks.test.ts
# Expected: All tests FAIL (endpoints not implemented)
```

---

## Evidence Requirements

**Completion evidence:**
1. Test file committed: `tests/integration/health-checks.test.ts`
2. Test execution screenshot showing FAILING tests
3. Code review approval
4. Test plan documentation

**Documentation:**
- Expected endpoint behavior documented
- Response format specifications
- Error scenarios defined

---

## Context Requirements

**Required knowledge:**
- HTTP health check patterns
- Database connection testing
- Response time testing
- Error handling patterns

**Files to reference:**
- Spec: `.agent-os/specs/2025-11-06-docker-vps-deployment/spec.md`
- Existing API routes: `app/api/`
- Test patterns: `tests/`

**Dependencies to verify:**
```bash
# Should already be installed
npm list supertest
npm list @types/supertest
```

---

## Implementation Notes

**Response format specifications:**

**Basic health check (/api/health):**
```json
{
  "status": "ok",
  "timestamp": "2025-11-06T12:34:56.789Z",
  "uptime": 12345,
  "environment": "production"
}
```

**Readiness check (/api/health/ready):**
```json
{
  "status": "ready",
  "timestamp": "2025-11-06T12:34:56.789Z",
  "database": {
    "connected": true,
    "responseTime": 45
  },
  "services": {
    "payload": true
  }
}
```

**Error response (database down):**
```json
{
  "status": "unavailable",
  "timestamp": "2025-11-06T12:34:56.789Z",
  "database": {
    "connected": false,
    "error": "Connection timeout"
  }
}
```

**Test utilities to create:**

```typescript
// Helper to stop/start database for testing
async function stopDatabase() {
  await execAsync('docker-compose stop db');
  await new Promise(resolve => setTimeout(resolve, 2000));
}

async function startDatabase() {
  await execAsync('docker-compose start db');
  await waitForDatabase();
}

async function waitForDatabase() {
  // Wait for database to be ready
  // Use pg_isready or similar
}
```

**Performance benchmarks:**
- Basic health: < 100ms
- Readiness check (db up): < 1 second
- Readiness check (db down): < 2 seconds (timeout)

**Edge cases to test:**
1. Database temporarily unavailable (connection timeout)
2. Database recovering (intermittent failures)
3. Concurrent health check requests
4. Health check during application startup
5. Health check during graceful shutdown

**TDD RED Phase Strategy:**
1. Write tests describing desired health check behavior
2. Include comprehensive response validation
3. Test both success and failure scenarios
4. Use realistic timeouts and expectations
5. ALL TESTS SHOULD FAIL (endpoints don't exist)

**Integration with Docker health checks:**
These tests validate the endpoints that Docker HEALTHCHECK will use:
```dockerfile
HEALTHCHECK --interval=30s --timeout=10s --retries=3 \
  CMD wget --quiet --tries=1 --spider http://localhost:3000/api/health
```

---

## Next Steps

After completing this task:
1. Verify ALL tests are RED (failing)
2. Document test failure reasons
3. Proceed to health-2 (Implement /api/health)
4. Proceed to health-3 (Implement /api/health/ready)
5. Verify tests turn GREEN after implementation

**Critical:** Do NOT implement endpoints in this task. This is test-writing ONLY (RED phase).
