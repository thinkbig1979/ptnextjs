# Task: test-1 - Write Deployment Script Integration Tests

**Spec:** Docker VPS Deployment Infrastructure
**Phase:** Testing & Validation
**Status:** Not Started
**Assigned Agent:** test-architect
**Estimated Time:** 35 minutes
**Dependencies:** deploy-1, deploy-2, deploy-3

---

## Description

Write integration tests validating deployment scripts work correctly in various scenarios including success paths, failure handling, and rollback capabilities.

---

## Specifics

**Test file:** `tests/integration/deployment-scripts.test.ts`

**Test scenarios:**
1. Initial deployment succeeds
2. Update deployment succeeds
3. Graceful shutdown works
4. Health check integration
5. Rollback on failure
6. Network creation
7. Environment validation

---

## Acceptance Criteria

- [ ] Test file created
- [ ] Deploy script tests
- [ ] Update script tests
- [ ] Stop script tests
- [ ] Error handling tests
- [ ] Rollback tests
- [ ] All tests pass
- [ ] Test coverage > 80%

---

## Implementation Notes

```typescript
describe('Deployment Scripts', () => {
  describe('deploy.sh', () => {
    it('should validate environment file', async () => {
      // Test .env.production check
    });

    it('should create proxy network', async () => {
      // Test network creation
    });

    it('should build and start services', async () => {
      // Test full deployment
    });

    it('should fail on invalid environment', async () => {
      // Test error handling
    });
  });

  describe('update.sh', () => {
    it('should create backup before update', async () => {
      // Test backup creation
    });

    it('should rebuild and restart services', async () => {
      // Test update process
    });

    it('should rollback on health check failure', async () => {
      // Test automatic rollback
    });
  });

  describe('stop.sh', () => {
    it('should stop services gracefully', async () => {
      // Test graceful shutdown
    });

    it('should preserve volumes by default', async () => {
      // Test volume preservation
    });
  });
});
```

---

## Next Steps

After implementation, proceed to test-2 (data persistence tests).
