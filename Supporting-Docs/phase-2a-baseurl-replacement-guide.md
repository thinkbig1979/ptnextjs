# Phase 2A: Replace Hardcoded localhost:3000 with baseURL

## Status: Ready for Execution

## Overview
This task replaces ~96 occurrences of hardcoded `localhost:3000` URLs across 52 E2E test files with proper baseURL usage from Playwright config.

## Current State
- **Playwright config** (`playwright.config.ts`) has `baseURL: 'http://localhost:3000'` configured
- **96 total occurrences** of hardcoded localhost:3000 across 52 test files
- **24 files** already have `BASE_URL` constant defined
- **28 files** need `BASE_URL` constant added

## Replacement Patterns

### Pattern 1: page.goto() with Full URLs → Relative URLs
```typescript
// BEFORE
await page.goto('http://localhost:3000/vendors');

// AFTER
await page.goto('/vendors');
```

### Pattern 2: Const URL Definitions → Template Literals
```typescript
// BEFORE
const ADMIN_LOGIN_URL = 'http://localhost:3000/admin/login';

// AFTER
const BASE_URL = process.env.PLAYWRIGHT_BASE_URL || 'http://localhost:3000';
const ADMIN_LOGIN_URL = `${BASE_URL}/admin/login`;
```

### Pattern 3: fetch() Calls → Template Literals
```typescript
// BEFORE
const response = await fetch('http://localhost:3000/api/vendors');

// AFTER
const response = await fetch(`${BASE_URL}/api/vendors`);
```

## High Priority Files (12 files with most occurrences)

1. **dual-auth-system.spec.ts** - 8 occurrences
2. **admin-approval-flow.spec.ts** - 5 occurrences
3. **bug-fixes-verification.spec.ts** - 5 occurrences
4. **vendor-featured-sorting.spec.ts** - 5 occurrences
5. **product-description-rendering.spec.ts** - 5 occurrences
6. **vendor-registration-integration.spec.ts** - 4 occurrences
7. **verify-featured-priority.spec.ts** - 4 occurrences
8. **vendor-dashboard-flow.spec.ts** - 4 occurrences
9. **admin-panel.spec.ts** - 3 occurrences
10. **admin-login-visual.spec.ts** - 3 occurrences
11. **vendor-search-visual-check.spec.ts** - 3 occurrences
12. **tier-restriction-flow.spec.ts** - 3 occurrences

## Execution

### Option 1: Automated Script (Recommended)
I've created a Node.js script that handles all replacements automatically:

```bash
cd /home/edwin/development/ptnextjs
node scripts/fix-baseurl.js
```

**Features:**
- Automatically adds `BASE_URL` constant if missing
- Converts `page.goto()` calls to relative URLs
- Updates const URL definitions to template literals
- Updates fetch() calls to use BASE_URL
- Provides detailed progress and summary

### Option 2: Manual Shell Script
Alternative bash script for system administrators who prefer shell:

```bash
cd /home/edwin/development/ptnextjs
chmod +x scripts/fix-baseurl-high-priority.sh
./scripts/fix-baseurl-high-priority.sh
```

### Option 3: Manual Python Script
For environments with Python installed:

```bash
cd /home/edwin/development/ptnextjs
python3 scripts/update-baseurl.py
```

## Verification

After running the script, verify the changes:

```bash
# Check remaining occurrences
grep -r "localhost:3000" tests/e2e/*.spec.ts | wc -l

# Should show significant reduction or zero for high-priority files

# Verify a specific file
cat tests/e2e/dual-auth-system.spec.ts | grep -E "BASE_URL|page.goto"
```

## Expected Results

### Before
- 96 total localhost:3000 occurrences
- Mixed URL patterns (hardcoded, template literals, relative)
- Some files missing BASE_URL constant

### After
- ~50-60 occurrences remaining (in helper files, comments, or already properly structured)
- All high-priority test files (12 files) updated
- Consistent BASE_URL usage across test suite
- All `page.goto()` calls use relative URLs
- All API fetch calls use BASE_URL template literals

## Files Created

1. **/home/edwin/development/ptnextjs/scripts/fix-baseurl.js** - Node.js automated script
2. **/home/edwin/development/ptnextjs/scripts/fix-baseurl-high-priority.sh** - Bash script
3. **/home/edwin/development/ptnextjs/scripts/update-baseurl.py** - Python script
4. **/home/edwin/development/ptnextjs/Supporting-Docs/phase-2a-baseurl-replacement-guide.md** - This guide

## Testing After Changes

Run a subset of tests to verify changes work correctly:

```bash
cd /home/edwin/development/ptnextjs

# Test a single file
npx playwright test tests/e2e/dual-auth-system.spec.ts

# Test all high-priority files
npx playwright test tests/e2e/admin-approval-flow.spec.ts \
  tests/e2e/vendor-featured-sorting.spec.ts \
  tests/e2e/product-description-rendering.spec.ts

# Run full E2E suite
npm run test:e2e
```

## Rollback Plan

If issues arise, all scripts create backups (`.bak` files for bash script):

```bash
# Restore from git if needed
git checkout tests/e2e/*.spec.ts

# Or restore from backups (if using bash script)
find tests/e2e -name "*.bak" -exec bash -c 'mv "$0" "${0%.bak}"' {} \;
```

## Next Steps

After successful execution:

1. Run verification grep commands
2. Execute test suite to ensure no breakage
3. Update bd bead status:
   ```bash
   bd update ptnextjs-ykjs --status=complete
   bd close ptnextjs-ykjs
   ```
4. Commit changes:
   ```bash
   git add tests/e2e/
   git commit -m "refactor(tests): replace hardcoded localhost:3000 with baseURL

   - Add BASE_URL constant to test files missing it
   - Convert page.goto() calls to relative URLs
   - Update fetch() and const URLs to use BASE_URL template literals
   - Affects 12 high-priority test files with 50+ replacements

   Related: ptnextjs-ykjs"
   ```

## Notes

- Some occurrences in helper files (`database-seed-helpers.ts`, `vendor-onboarding-helpers.ts`) already use `API_BASE` or `BASE_URL` and may not need changes
- The `global-setup.ts` file correctly uses `PLAYWRIGHT_BASE_URL` environment variable
- Files in `vendor-onboarding/` subdirectory already follow best practices
- Comments and documentation may still contain localhost:3000 (acceptable)

## Troubleshooting

### Script doesn't run
```bash
# Make executable
chmod +x scripts/fix-baseurl.js
chmod +x scripts/fix-baseurl-high-priority.sh

# Or run with interpreter directly
node scripts/fix-baseurl.js
bash scripts/fix-baseurl-high-priority.sh
```

### Tests fail after changes
- Check that BASE_URL is properly defined at file level
- Verify relative URLs start with `/`
- Ensure template literals use `${BASE_URL}` not `$BASE_URL`
- Check for double backticks or other syntax errors

### Remaining localhost:3000 after script
- May be in comments (acceptable)
- May be in README or documentation files (acceptable)
- May be in complex string concatenations (manual fix needed)
- May be in test data or mock responses (evaluate case-by-case)

## Success Criteria

- [ ] All 12 high-priority files updated
- [ ] Zero localhost:3000 in `page.goto()` calls (use relative URLs)
- [ ] All files have BASE_URL constant defined
- [ ] fetch() calls use BASE_URL template literals
- [ ] Tests pass after changes
- [ ] Bead updated and closed

---

**Created:** 2025-12-08
**Task:** ptnextjs-ykjs Phase 2A
**Author:** Claude (Sonnet 4.5)
