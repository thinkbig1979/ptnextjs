# Task: test-2 - Write Data Persistence Tests

**Spec:** Docker VPS Deployment Infrastructure
**Phase:** Testing & Validation
**Status:** Not Started
**Assigned Agent:** test-architect
**Estimated Time:** 30 minutes
**Dependencies:** core-9

---

## Description

Write tests validating data persists correctly across container restarts, updates, and rebuilds using Docker named volumes.

---

## Specifics

**Test file:** `tests/integration/data-persistence.test.ts`

**Test scenarios:**
1. Database data survives container restart
2. Media uploads survive container restart
3. Data persists after image rebuild
4. Data survives update deployment
5. Volume mounts work correctly

---

## Acceptance Criteria

- [ ] Test file created
- [ ] Database persistence tests
- [ ] Media persistence tests
- [ ] Restart survival tests
- [ ] Update survival tests
- [ ] All tests pass

---

## Implementation Notes

```typescript
describe('Data Persistence', () => {
  it('should persist database data across restarts', async () => {
    // Create test data
    // Restart container
    // Verify data still exists
  });

  it('should persist media uploads across restarts', async () => {
    // Upload test file
    // Restart container
    // Verify file still accessible
  });

  it('should survive image rebuild', async () => {
    // Create data
    // Rebuild image
    // Verify data intact
  });

  it('should survive update deployment', async () => {
    // Create data
    // Run update.sh
    // Verify data intact
  });
});
```

---

## Next Steps

After implementation, proceed to test-3 (environment configuration tests).
