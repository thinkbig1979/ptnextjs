# Batch 12 E2E Test Syntax Fixes - Required Changes

## Summary

9 files need fixes for:
1. **Missing BASE_URL constant** (3 files) - Files that use `${BASE_URL}` but don't define it
2. **Emoji encoding issues** (all 9 files) - Replace unicode emojis with ASCII equivalents

## Files Requiring BASE_URL Constant

### 1. `/home/edwin/development/ptnextjs/tests/e2e/verify-data-mapping.spec.ts`

**Issue**: Uses `${BASE_URL}` on lines 18, 28 but constant not defined

**Fix**: Add after line 5 (`const execAsync = promisify(exec);`):
```typescript
const BASE_URL = process.env.PLAYWRIGHT_BASE_URL || 'http://localhost:3000';
```

**Emoji Fixes**:
- Line 25: `✓` → `[OK]`
- Line 54: `❌` → `[FAIL]`
- Line 59: `✓` → `[OK]`
- Line 93: `❌` → `[FAIL]`
- Line 120: `❌` → `[FAIL]`
- Line 136: `✅` → `[OK]`

### 2. `/home/edwin/development/ptnextjs/tests/e2e/verify-featured-priority.spec.ts`

**Issue**: Uses `${BASE_URL}` on line 5 but constant not defined

**Fix**: Add after line 1 (after import statement):
```typescript
const BASE_URL = process.env.PLAYWRIGHT_BASE_URL || 'http://localhost:3000';
```

**Emoji Fixes**: None (no emojis in this file)

### 3. `/home/edwin/development/ptnextjs/tests/e2e/verify-form-save.spec.ts`

**Issue**: Uses `${BASE_URL}` on line 46 but constant not defined

**Fix**: Add after line 6 (after `TEST_VENDOR` const):
```typescript
const BASE_URL = process.env.PLAYWRIGHT_BASE_URL || 'http://localhost:3000';
```

**Emoji Fixes**:
- Line 77: `❌` → `[FAIL]`
- Line 106: `❌` → `[FAIL]`
- Lines 146-148: `❌` → `[FAIL]`, `✅` → `[OK]` (3 instances)
- Line 154: `✅` → `[OK]`

## Files Requiring Only Emoji Fixes

### 4. `/home/edwin/development/ptnextjs/tests/e2e/verify-free-tier-product-restrictions.spec.ts`

**Emoji Fixes**:
- Line 21: `✅` → `[OK]`
- Line 35: `✅` → `[OK]`
- Line 51: `✅` → `[OK]`
- Line 66: `✅` → `[OK]`
- Line 82: `✅` → `[OK]`
- Line 94: `⚠️` → `[WARN]`
- Line 104: `✅` → `[OK]`

### 5. `/home/edwin/development/ptnextjs/tests/e2e/verify-integration-seeded-data.spec.ts`

**Emoji Fixes** (extensive):
- Line 21: `📦` → `[DOC]`
- Line 32: `✅` → `[OK]`
- Line 40-50: Multiple `✓` → `[OK]`
- Line 54: `⚠️` → `[WARN]`
- Line 60: `✅` → `[OK]`
- Line 71-83: Multiple `✓` → `[OK]`
- Line 87: `📊` → `[INFO]`
- Line 102: `🎯` → `[INFO]`
- Line 106: `✓` → `[OK]`
- Line 109, 112: `⚠️` → `[WARN]`
- Lines 114, 145-156: Multiple `✅` → `[OK]`

### 6. `/home/edwin/development/ptnextjs/tests/e2e/verify-product-reviews-display.spec.ts`

**Emoji Fixes**:
- Line 29: `✅` → `[OK]`
- Line 40, 52: `⚠️` → `[WARN]`
- Line 52: `❌` → `[FAIL]`

### 7. `/home/edwin/development/ptnextjs/tests/e2e/verify-product-reviews-full-display.spec.ts`

**Emoji Fixes**:
- Lines 22, 27, 33, 38, 50, 62: `✅` → `[OK]`
- Line 57: `📸` → `[INFO]`
- Line 64: `🎉` → `[OK]`

### 8. `/home/edwin/development/ptnextjs/tests/e2e/verify-single-form.spec.ts`

**Emoji Fixes**:
- Line 52: `✅` → `[OK]`

### 9. `/home/edwin/development/ptnextjs/tests/e2e/verify-vendor-category.spec.ts`

**Emoji Fixes**:
- Line 30: `✅` → `[OK]`
- Line 53: `✅` → `[OK]`
- Line 72: `✅` → `[OK]`

## Automated Fix Scripts

Three fix scripts have been created in project root:

1. `/home/edwin/development/ptnextjs/fix-batch-12-sed.sh` - Bash script using sed
2. `/home/edwin/development/ptnextjs/fix_batch_12_final.py` - Python with detailed logging
3. `/home/edwin/development/ptnextjs/do_fix_batch_12.py` - Compact Python script (recommended)

### Run the Fix

Execute the compact Python script:
```bash
cd /home/edwin/development/ptnextjs
python3 do_fix_batch_12.py
```

This will:
- Add BASE_URL constants to 3 files that need it
- Replace all emojis with ASCII equivalents in all 9 files
- Report which files were modified

## Verification

After running the fix, verify:

1. No emojis remain:
```bash
cd /home/edwin/development/ptnextjs/tests/e2e
grep -r "✓\|✅\|❌\|⚠️\|📦\|📊\|🎯\|📸\|🎉" verify-*.spec.ts
```

2. BASE_URL defined where used:
```bash
for f in verify-data-mapping.spec.ts verify-featured-priority.spec.ts verify-form-save.spec.ts; do
  grep -q '\${BASE_URL}' "$f" && grep -q 'const BASE_URL' "$f" && echo "[OK] $f" || echo "[FAIL] $f"
done
```

## Impact

These are **CRITICAL** syntax errors that prevent tests from running:
- Missing `BASE_URL` causes ReferenceError at runtime
- Emoji encoding can cause parsing issues in some environments

All fixes are non-functional changes (no test logic affected).
