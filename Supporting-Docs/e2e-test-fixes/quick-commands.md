# E2E Test Fixes - Quick Commands Reference

## Beads Commands

### View All Epics
```bash
bd list | grep "EPIC:"
```

### View Specific Epic with Dependencies
```bash
bd show <epic-id>
# Examples:
bd show ptnextjs-bu7h  # Computed Fields Epic
bd show ptnextjs-h8a9  # Notification Epic
bd show ptnextjs-u0t9  # Migration Epic
```

### Update Task Status
```bash
bd status <task-id> <status>
# Examples:
bd status ptnextjs-zkbu in-progress
bd status ptnextjs-zkbu done
```

### Add Notes to Task
```bash
bd comment <task-id> "Your comment here"
# Example:
bd comment ptnextjs-zkbu "Root cause: foundedYear validation logic missing future year check"
```

## Epic IDs Quick Reference

| Epic ID | Category | Count |
|---------|----------|-------|
| ptnextjs-bu7h | Computed Fields | 6 |
| ptnextjs-hmz9 | Dashboard Integration | 3 |
| ptnextjs-io2s | Data Integrity | 3 |
| ptnextjs-08pd | Logout Functionality | 1 |
| ptnextjs-u0t9 | Migration | 15 |
| ptnextjs-1voc | Mobile Viewport | 2 |
| ptnextjs-h8a9 | Notifications | 11 |
| ptnextjs-7jit | Partner Filter | 4 |
| ptnextjs-emit | Product Tests | 8 |
| ptnextjs-ly2w | Promotion Pack Form | 1 |
| ptnextjs-hds7 | Tier Restriction Flow | 4 |
| ptnextjs-sq8w | Vendor Tests | 8 |
| ptnextjs-2sgh | Verification Tests | 10 |

## Test Execution Commands

### Run Single Test
```bash
npx playwright test <file>:<line> --project=chromium
# Example:
npx playwright test computed-fields.spec.ts:69 --project=chromium
```

### Run Entire Test File
```bash
npx playwright test <file> --project=chromium
# Example:
npx playwright test computed-fields.spec.ts --project=chromium
```

### Run with UI Mode (for debugging)
```bash
npx playwright test <file>:<line> --project=chromium --ui
# Example:
npx playwright test computed-fields.spec.ts:69 --project=chromium --ui
```

### Run with Headed Browser (see what's happening)
```bash
npx playwright test <file>:<line> --project=chromium --headed
# Example:
npx playwright test computed-fields.spec.ts:69 --project=chromium --headed
```

### Run with Debug Mode
```bash
npx playwright test <file>:<line> --project=chromium --debug
# Example:
npx playwright test computed-fields.spec.ts:69 --project=chromium --debug
```

## Workflow Example

### Working on a Computed Fields Issue

1. **Mark task as in-progress:**
```bash
bd status ptnextjs-zkbu in-progress
```

2. **Run the failing test:**
```bash
npx playwright test computed-fields.spec.ts:69 --project=chromium
```

3. **Debug if needed:**
```bash
npx playwright test computed-fields.spec.ts:69 --project=chromium --headed
```

4. **Make code changes** (edit relevant files)

5. **Re-run test to verify fix:**
```bash
npx playwright test computed-fields.spec.ts:69 --project=chromium
```

6. **Add findings as comment:**
```bash
bd comment ptnextjs-zkbu "Fixed by adding future year validation in lib/services/vendor-validation.ts"
```

7. **Mark as done:**
```bash
bd status ptnextjs-zkbu done
```

8. **Check epic progress:**
```bash
bd show ptnextjs-bu7h
```

## Common Test File Locations

All E2E tests are located in `/home/edwin/development/ptnextjs/e2e/`

### By Category:
- **Computed Fields:** `e2e/computed-fields.spec.ts`
- **Dashboard:** `e2e/dashboard-integration.spec.ts`
- **Data Integrity:** `e2e/concurrent-updates.spec.ts`, `e2e/foreign-key-constraints.spec.ts`
- **Logout:** `e2e/logout-functionality.spec.ts`
- **Migration:** `e2e/migration.spec.ts`
- **Mobile:** `e2e/mobile-viewport.spec.ts`
- **Notifications:** `e2e/registration-email.spec.ts`, `e2e/tier-change-email.spec.ts`
- **Partner Filter:** `e2e/partner-filter-validation.spec.ts`
- **Products:** `e2e/product-*.spec.ts`
- **Promotion Pack:** `e2e/promotion-pack-form.spec.ts`
- **Tier Restrictions:** `e2e/tier-restriction-flow.spec.ts`
- **Vendors:** `e2e/vendor-*.spec.ts`
- **Verification:** `e2e/verify-*.spec.ts`

## Progress Tracking

### View All Open Tasks
```bash
bd list --status=open
```

### View All In-Progress Tasks
```bash
bd list --status=in-progress
```

### View All Done Tasks
```bash
bd list --status=done
```

### Count Tasks by Status
```bash
echo "Open: $(bd list --status=open | wc -l)"
echo "In Progress: $(bd list --status=in-progress | wc -l)"
echo "Done: $(bd list --status=done | wc -l)"
```

## Tips

1. **Always run tests in isolation first** - Use the specific line number to run only the failing test
2. **Use --headed mode for visual debugging** - Helps understand what the test is doing
3. **Check epic dependencies** - Some fixes may unblock multiple tests
4. **Update beads as you go** - Keep task status and comments up to date
5. **Look for patterns** - Multiple failures in same file often share root cause

## Reporting Progress

After completing a batch of fixes, generate a summary:

```bash
# Count completed tasks per epic
bd list --status=done | grep "Fix:" | wc -l

# List completed epics
bd list --status=done | grep "EPIC:"
```

## Next Steps Reference

See `/home/edwin/development/ptnextjs/Supporting-Docs/e2e-test-fixes/beads-tasks-summary.md` for:
- Detailed test descriptions
- Expected behavior for each test
- Recommended priority order
- Common patterns to watch for
