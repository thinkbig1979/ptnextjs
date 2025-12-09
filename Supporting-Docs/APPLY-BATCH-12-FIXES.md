# Apply Batch 12 E2E Test Fixes

## Quick Fix - Run This Command

The simplest way to fix all 9 files is to run the compact Python script:

```bash
cd /home/edwin/development/ptnextjs
python3 do_fix_batch_12.py
```

This will automatically:
1. Add `const BASE_URL` to 3 files that use it but don't define it
2. Replace all emojis with ASCII equivalents in all 9 files

## Files That Will Be Fixed

### Critical (Missing BASE_URL - causes ReferenceError):
1. `tests/e2e/verify-data-mapping.spec.ts`
2. `tests/e2e/verify-featured-priority.spec.ts`
3. `tests/e2e/verify-form-save.spec.ts`

### Emoji Fixes Only:
4. `tests/e2e/verify-free-tier-product-restrictions.spec.ts`
5. `tests/e2e/verify-integration-seeded-data.spec.ts`
6. `tests/e2e/verify-product-reviews-display.spec.ts`
7. `tests/e2e/verify-product-reviews-full-display.spec.ts`
8. `tests/e2e/verify-single-form.spec.ts`
9. `tests/e2e/verify-vendor-category.spec.ts`

## Verification After Fix

Run these commands to verify the fixes:

### 1. Check for remaining emojis (should return nothing):
```bash
cd /home/edwin/development/ptnextjs/tests/e2e
grep -r "✓\|✅\|❌\|⚠️\|📦\|📊\|🎯\|📸\|🎉" verify-*.spec.ts
```

### 2. Verify BASE_URL is defined where used:
```bash
cd /home/edwin/development/ptnextjs/tests/e2e
for f in verify-data-mapping.spec.ts verify-featured-priority.spec.ts verify-form-save.spec.ts; do
  if grep -q '\${BASE_URL}' "$f"; then
    if grep -q 'const BASE_URL' "$f"; then
      echo "[OK] $f has BASE_URL defined"
    else
      echo "[FAIL] $f uses BASE_URL but doesn't define it!"
    fi
  fi
done
```

### 3. Try parsing one of the fixed files:
```bash
cd /home/edwin/development/ptnextjs
npx tsc --noEmit tests/e2e/verify-data-mapping.spec.ts
```

## What Gets Changed

### Example: verify-data-mapping.spec.ts

**BEFORE (Line 5-6):**
```typescript
const execAsync = promisify(exec);

test.describe('Data Mapping Verification', () => {
```

**AFTER (Line 5-7):**
```typescript
const execAsync = promisify(exec);
const BASE_URL = process.env.PLAYWRIGHT_BASE_URL || 'http://localhost:3000';

test.describe('Data Mapping Verification', () => {
```

**BEFORE (Line 25):**
```typescript
console.log('✓ Logged in successfully');
```

**AFTER (Line 26):**
```typescript
console.log('[OK] Logged in successfully');
```

## Alternative: Manual sed Commands

If you prefer to see each change as it happens:

```bash
cd /home/edwin/development/ptnextjs
bash fix-batch-12-sed.sh
```

## Rollback (If Needed)

If you need to undo the changes:

```bash
cd /home/edwin/development/ptnextjs
git checkout tests/e2e/verify-*.spec.ts
```

## Summary of Changes

- **3 files** get `const BASE_URL` added (critical fixes)
- **9 files** get emoji replacements (compatibility fixes)
- **0 files** have logic changes (all non-functional fixes)

## Next Steps After Applying Fixes

1. Run the fix script
2. Verify with the commands above
3. Commit the changes:
   ```bash
   git add tests/e2e/verify-*.spec.ts
   git commit -m "fix(tests): E2E batch 12 - add BASE_URL constants and replace emojis"
   ```
