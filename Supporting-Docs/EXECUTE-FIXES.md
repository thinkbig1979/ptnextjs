# Execute E2E Test Syntax Fixes - Batch 6

## Quick Start

Run ONE of the following commands to fix all E2E test syntax errors:

### Option 1: Perl Script (Most Reliable)
```bash
cd /home/edwin/development/ptnextjs
perl Supporting-Docs/fix-all-e2e-tests.pl
```

### Option 2: Python Script
```bash
cd /home/edwin/development/ptnextjs
python3 Supporting-Docs/fix-syntax.py
```

### Option 3: Bash Script
```bash
cd /home/edwin/development/ptnextjs
bash Supporting-Docs/fix-e2e-tests-final.sh
```

## What Gets Fixed

### 1. Mixed Quote Errors (138 instances across 46 files)
```typescript
// BEFORE:
await page.goto(`${BASE_URL}/admin/login');

// AFTER:
await page.goto(`${BASE_URL}/admin/login`);
```

### 2. Emoji Encoding Issues
```typescript
// BEFORE:
console.log(`✅ Test passed`);

// AFTER:
console.log(`[OK] Test passed`);
```

## Affected Files

The scripts will automatically find and fix all `.spec.ts` files in `tests/e2e/` including:

- `tier-restriction-flow.spec.ts` - 3 quote errors + multiple emojis
- `tier-downgrade-request-workflow.spec.ts` - 1 quote error
- `tier-upgrade-request/admin-workflow.spec.ts` - 15 quote errors
- `tier-upgrade-request/vendor-workflow.spec.ts` - 13 quote errors
- And 42 more files...

## Safety Features

- **Automatic backups**: `.bak` files created before modification
- **Idempotent**: Safe to run multiple times
- **Non-destructive**: Only fixes syntax, preserves all logic
- **Detailed reporting**: Shows exactly what was fixed

## Verification

After running the fix, verify no errors remain:

```bash
# Check for remaining mixed quote errors
grep -r "\`[^\`]*'" tests/e2e --include="*.spec.ts" | wc -l
# Should output: 0

# Try running a test
npx playwright test tests/e2e/tier-restriction-flow.spec.ts --headed
```

## File Locations

All fix scripts are in: `/home/edwin/development/ptnextjs/Supporting-Docs/`

- `fix-all-e2e-tests.pl` - Perl version (recommended)
- `fix-syntax.py` - Python version
- `fix-e2e-tests-final.sh` - Bash version
- `batch6-fix-summary.md` - Detailed analysis
- `EXECUTE-FIXES.md` - This file

## Expected Output

```
============================================================
E2E Test Syntax Error Fixer
============================================================

[FIXED] tests/e2e/tier-restriction-flow.spec.ts
  - Mixed quotes: 3
  - Emojis: 33

[FIXED] tests/e2e/tier-downgrade-request-workflow.spec.ts
  - Mixed quotes: 1

... (more files) ...

============================================================
Summary
============================================================
Files processed: 80
Files fixed: 46
Total quote fixes: 138
Total emoji replacements: 500+
```

## Next Steps After Fixing

1. **Commit the fixes**:
   ```bash
   git add tests/e2e/
   git commit -m "fix: resolve E2E test syntax errors (mixed quotes and emoji encoding)"
   ```

2. **Run test suite**:
   ```bash
   npm run test:e2e
   ```

3. **Clean up backups** (if tests pass):
   ```bash
   find tests/e2e -name "*.bak" -delete
   ```

## Troubleshooting

### If script doesn't run:
```bash
# Make executable
chmod +x Supporting-Docs/fix-all-e2e-tests.pl
chmod +x Supporting-Docs/fix-e2e-tests-final.sh

# Check Perl availability
perl --version

# Check Python availability
python3 --version
```

### If you get "File not found" errors:
The original task listed files that don't exist. The scripts fix **all existing** `.spec.ts` files in `tests/e2e/`, which includes similar/renamed versions of those files.

## Contact

If you encounter issues, check:
1. File paths are correct (absolute paths used)
2. You're in the project root directory
3. The test files exist (use `find tests/e2e -name "*.spec.ts"`)
