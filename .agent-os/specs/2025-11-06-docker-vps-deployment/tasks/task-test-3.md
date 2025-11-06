# Task: test-3 - Write Environment Configuration Tests

**Spec:** Docker VPS Deployment Infrastructure
**Phase:** Testing & Validation
**Status:** Not Started
**Assigned Agent:** test-architect
**Estimated Time:** 25 minutes
**Dependencies:** core-7

---

## Description

Write tests validating environment variable configuration is loaded correctly and required variables are enforced.

---

## Specifics

**Test file:** `tests/integration/environment-config.test.ts`

**Test scenarios:**
1. Required variables are validated
2. Environment variables loaded correctly
3. Missing variables cause startup failure
4. Invalid values are rejected
5. Secret validation works

---

## Acceptance Criteria

- [ ] Test file created
- [ ] Variable validation tests
- [ ] Loading verification tests
- [ ] Error handling tests
- [ ] All tests pass

---

## Implementation Notes

```typescript
describe('Environment Configuration', () => {
  it('should validate required variables', async () => {
    // Test entrypoint.sh validation
  });

  it('should load all environment variables', async () => {
    // Verify variables accessible in container
  });

  it('should fail on missing PAYLOAD_SECRET', async () => {
    // Test startup failure
  });

  it('should fail on missing DATABASE_URL', async () => {
    // Test startup failure
  });

  it('should validate secret minimum length', async () => {
    // Test PAYLOAD_SECRET length check
  });
});
```

---

## Next Steps

After implementation, proceed to test-4 (backup/restore validation).
