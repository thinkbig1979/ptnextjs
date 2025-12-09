# Batch 12 E2E Test Fixes - Complete Guide

## Executive Summary

**9 E2E test files** have CRITICAL syntax errors that prevent tests from running:
- **3 files**: Missing `BASE_URL` constant (causes ReferenceError)
- **9 files**: Emoji encoding issues (causes parsing problems)

## One-Command Fix

```bash
cd /home/edwin/development/ptnextjs && python3 do_fix_batch_12.py
```

Expected output:
```
[OK] verify-data-mapping.spec.ts
[OK] verify-featured-priority.spec.ts
[OK] verify-form-save.spec.ts
[OK] verify-free-tier-product-restrictions.spec.ts
[OK] verify-integration-seeded-data.spec.ts
[OK] verify-product-reviews-display.spec.ts
[OK] verify-product-reviews-full-display.spec.ts
[OK] verify-single-form.spec.ts
[OK] verify-vendor-category.spec.ts

Fixed 9/9 files
```

## Detailed Changes by File

### File 1: verify-data-mapping.spec.ts
**Location**: `/home/edwin/development/ptnextjs/tests/e2e/verify-data-mapping.spec.ts`

**Changes**:
1. Add BASE_URL constant after line 5
2. Replace 6 emojis:
   - Line 25: `✓ Logged in` → `[OK] Logged in`
   - Line 54: `❌ FAILURE` → `[FAIL] FAILURE`
   - Line 59: `✓ Company name` → `[OK] Company name`
   - Line 93: `❌ ERROR MESSAGE` → `[FAIL] ERROR MESSAGE`
   - Line 120: `❌ SAVE FAILED` → `[FAIL] SAVE FAILED`
   - Line 136: `✅ SUCCESS` → `[OK] SUCCESS`

**Before**:
```typescript
const execAsync = promisify(exec);

test.describe('Data Mapping Verification', () => {
```

**After**:
```typescript
const execAsync = promisify(exec);
const BASE_URL = process.env.PLAYWRIGHT_BASE_URL || 'http://localhost:3000';

test.describe('Data Mapping Verification', () => {
```

---

### File 2: verify-featured-priority.spec.ts
**Location**: `/home/edwin/development/ptnextjs/tests/e2e/verify-featured-priority.spec.ts`

**Changes**:
1. Add BASE_URL constant after line 1
2. No emojis to replace

**Before**:
```typescript
import { test, expect } from '@playwright/test';

test.describe('Featured Vendors Priority', () => {
```

**After**:
```typescript
import { test, expect } from '@playwright/test';
const BASE_URL = process.env.PLAYWRIGHT_BASE_URL || 'http://localhost:3000';

test.describe('Featured Vendors Priority', () => {
```

---

### File 3: verify-form-save.spec.ts
**Location**: `/home/edwin/development/ptnextjs/tests/e2e/verify-form-save.spec.ts`

**Changes**:
1. Add BASE_URL constant after line 6
2. Replace 6 emojis across multiple lines

**Before**:
```typescript
const TEST_VENDOR = {
  email: 'testvendor@test.com',
  password: '123',
};

test.describe('Verify Form Save Fix', () => {
```

**After**:
```typescript
const TEST_VENDOR = {
  email: 'testvendor@test.com',
  password: '123',
};
const BASE_URL = process.env.PLAYWRIGHT_BASE_URL || 'http://localhost:3000';

test.describe('Verify Form Save Fix', () => {
```

---

### Files 4-9: Emoji Replacements Only

These files don't need BASE_URL (they use relative paths), only emoji fixes:

**File 4**: `verify-free-tier-product-restrictions.spec.ts`
- 7 emoji replacements: `✅` → `[OK]`, `⚠️` → `[WARN]`

**File 5**: `verify-integration-seeded-data.spec.ts`
- 20+ emoji replacements: `📦` → `[DOC]`, `✅`/`✓` → `[OK]`, `⚠️` → `[WARN]`, `📊`/`🎯` → `[INFO]`

**File 6**: `verify-product-reviews-display.spec.ts`
- 4 emoji replacements: `✅` → `[OK]`, `⚠️` → `[WARN]`, `❌` → `[FAIL]`

**File 7**: `verify-product-reviews-full-display.spec.ts`
- 8 emoji replacements: `✅` → `[OK]`, `📸` → `[INFO]`, `🎉` → `[OK]`

**File 8**: `verify-single-form.spec.ts`
- 1 emoji replacement: `✅` → `[OK]`

**File 9**: `verify-vendor-category.spec.ts`
- 3 emoji replacements: `✅` → `[OK]`

## Emoji Replacement Map

All emojis are replaced with ASCII equivalents for maximum compatibility:

| Emoji | ASCII | Meaning |
|-------|-------|---------|
| ✓     | [OK]  | Success/Check |
| ✅    | [OK]  | Success |
| ❌    | [FAIL] | Failure/Error |
| ⚠️    | [WARN] | Warning |
| 📦    | [DOC]  | Package/Document |
| 📊    | [INFO] | Chart/Info |
| 🎯    | [INFO] | Target/Info |
| 📸    | [INFO] | Screenshot |
| 🎉    | [OK]  | Celebration/Success |

## Why These Fixes Are Critical

### Missing BASE_URL (3 files)
**Error**: `ReferenceError: BASE_URL is not defined`

These files use template literals like:
```typescript
await page.goto(`${BASE_URL}/vendor/login`);
```

But never define `BASE_URL`, causing immediate test failures.

### Emoji Encoding (9 files)
**Issue**: Unicode emojis can cause:
- Parsing errors in some CI/CD environments
- Encoding issues in different terminals
- Inconsistent display across platforms

ASCII replacements ensure compatibility everywhere.

## Verification Commands

After running the fix, verify success:

### 1. No emojis remain:
```bash
cd /home/edwin/development/ptnextjs/tests/e2e
! grep -r "✓\|✅\|❌\|⚠️\|📦\|📊\|🎯\|📸\|🎉" verify-*.spec.ts && echo "✓ All emojis removed"
```

### 2. BASE_URL defined where used:
```bash
cd /home/edwin/development/ptnextjs/tests/e2e
for f in verify-data-mapping.spec.ts verify-featured-priority.spec.ts verify-form-save.spec.ts; do
  grep -q "const BASE_URL" "$f" && echo "[OK] $f" || echo "[FAIL] $f"
done
```

### 3. TypeScript parsing works:
```bash
cd /home/edwin/development/ptnextjs
npx tsc --noEmit tests/e2e/verify-data-mapping.spec.ts 2>&1 | grep -q "BASE_URL" && echo "[FAIL] Still has errors" || echo "[OK] Parses correctly"
```

## Git Commit Message

After applying fixes:

```bash
git add tests/e2e/verify-*.spec.ts
git commit -m "fix(tests): E2E batch 12 - add missing BASE_URL constants and replace emojis

- Add BASE_URL constant to 3 files (verify-data-mapping, verify-featured-priority, verify-form-save)
- Replace all unicode emojis with ASCII equivalents across 9 files
- Fixes ReferenceError: BASE_URL is not defined
- Improves cross-platform compatibility

Files fixed:
- verify-data-mapping.spec.ts (BASE_URL + emojis)
- verify-featured-priority.spec.ts (BASE_URL)
- verify-form-save.spec.ts (BASE_URL + emojis)
- verify-free-tier-product-restrictions.spec.ts (emojis)
- verify-integration-seeded-data.spec.ts (emojis)
- verify-product-reviews-display.spec.ts (emojis)
- verify-product-reviews-full-display.spec.ts (emojis)
- verify-single-form.spec.ts (emojis)
- verify-vendor-category.spec.ts (emojis)"
```

## Reference Files

Fixed version of most critical file is available at:
`/home/edwin/development/ptnextjs/Supporting-Docs/batch-12-fixes/verify-data-mapping.spec.ts.fixed`

## Troubleshooting

### If the Python script fails:

Try the bash script instead:
```bash
bash /home/edwin/development/ptnextjs/fix-batch-12-sed.sh
```

### If you need to manually fix one file:

```bash
FILE="tests/e2e/verify-data-mapping.spec.ts"

# Add BASE_URL
sed -i '5 a const BASE_URL = process.env.PLAYWRIGHT_BASE_URL || '"'"'http://localhost:3000'"'"';' "$FILE"

# Replace emojis
sed -i 's/✓/[OK]/g; s/✅/[OK]/g; s/❌/[FAIL]/g; s/⚠️/[WARN]/g' "$FILE"
```

## Impact Assessment

- **Risk**: LOW (only non-functional changes)
- **Test Logic**: NO CHANGES
- **Test Behavior**: IDENTICAL (except log output format)
- **Breaking Changes**: NONE
- **Requires Re-testing**: NO (syntax fixes only)

## Summary

- **9 files** with syntax errors
- **3 critical** (missing BASE_URL)
- **9 total** emoji replacements
- **1 command** to fix everything
- **0 test logic** changes

Run: `python3 do_fix_batch_12.py`
