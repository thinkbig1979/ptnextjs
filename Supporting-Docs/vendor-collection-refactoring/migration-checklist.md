# Vendor Collection Refactoring - Migration Checklist

## Pre-Migration

- [ ] **Backup database:** Copy `data/payload.db` to safe location
- [ ] **Commit current state:** `git commit -am "Pre-refactor checkpoint"`
- [ ] **Run tests:** `npm run test` to establish baseline
- [ ] **Document current behavior:** Test admin UI and vendor pages

## Migration Steps

### 1. Update Import Paths

#### payload.config.ts
```bash
# File: /home/edwin/development/ptnextjs/payload.config.ts
# Line 29: Update import path
```

**Change:**
```diff
- import Vendors from './payload/collections/Vendors';
+ import Vendors from './payload/collections/vendors';
```

#### payload/collections/__tests__/Vendors.test.ts
```bash
# File: /home/edwin/development/ptnextjs/payload/collections/__tests__/Vendors.test.ts
# Line 14: Update import path
```

**Change:**
```diff
- import Vendors from '../Vendors';
+ import Vendors from '../vendors';
```

### 2. Backup and Remove Old File

```bash
# Backup old file
cp payload/collections/Vendors.ts payload/collections/Vendors.ts.backup

# Remove old file from git tracking
git rm payload/collections/Vendors.ts

# Keep backup locally for reference
mv payload/collections/Vendors.ts.backup ~/vendor-refactor-backup/Vendors.ts.backup
```

### 3. Verify TypeScript Compilation

```bash
npm run type-check
```

**Expected:** No errors

### 4. Verify Build

```bash
npm run build
```

**Expected:** Build succeeds without errors

### 5. Start Development Server

```bash
npm run dev
```

**Expected:** Server starts without errors

### 6. Test Admin UI

- [ ] Navigate to `http://localhost:3000/admin`
- [ ] Go to Collections → Vendors
- [ ] Verify all fields are visible
- [ ] Test tier conditions (change tier, check field visibility)
- [ ] Create new vendor
- [ ] Edit existing vendor
- [ ] Delete test vendor

### 7. Test Access Control

#### As Admin
- [ ] Can see all fields
- [ ] Can edit all fields
- [ ] Can change tier
- [ ] Can publish/unpublish

#### As Vendor (Tier 1)
- [ ] Can see tier 1 fields
- [ ] Cannot see tier 2/3 exclusive fields
- [ ] Cannot change own tier
- [ ] Cannot publish/unpublish

#### As Vendor (Tier 2)
- [ ] Can see tier 1 and 2 fields
- [ ] Cannot see tier 3 exclusive fields

#### As Vendor (Tier 3)
- [ ] Can see all fields
- [ ] Can edit promotion pack

### 8. Test Hooks

- [ ] Create new vendor → Admin receives registration email
- [ ] Approve vendor → Vendor receives approval email
- [ ] Reject vendor → Vendor receives rejection email
- [ ] Publish vendor → Vendor receives published email

### 9. Test Frontend

- [ ] Navigate to `/vendors`
- [ ] Verify vendors list displays correctly
- [ ] Click vendor profile
- [ ] Verify all fields render correctly
- [ ] Check different tier vendors show appropriate fields

### 10. Run Test Suite

```bash
npm run test
```

**Expected:** All tests pass

### 11. Test E2E (if available)

```bash
npm run test:e2e
```

**Expected:** All E2E tests pass

## Post-Migration Verification

### Database Integrity
- [ ] Existing vendor data intact
- [ ] All fields populated correctly
- [ ] Relationships preserved
- [ ] Media uploads accessible

### API Endpoints
- [ ] GET `/api/vendors` returns correct data
- [ ] GET `/api/vendors/[slug]` returns vendor details
- [ ] POST `/api/vendors` creates vendor
- [ ] PUT `/api/vendors/[id]` updates vendor
- [ ] DELETE `/api/vendors/[id]` deletes vendor

### Performance
- [ ] Admin UI loads quickly
- [ ] Vendor list page loads quickly
- [ ] No console errors
- [ ] No memory leaks

## Rollback Plan (if needed)

If issues occur:

```bash
# 1. Restore old file
git checkout HEAD~1 -- payload/collections/Vendors.ts

# 2. Revert payload.config.ts
git checkout HEAD~1 -- payload.config.ts

# 3. Remove new directory
rm -rf payload/collections/vendors

# 4. Restart server
npm run dev

# 5. Verify system works
```

## Success Criteria

- [ ] All TypeScript types resolve correctly
- [ ] Build completes without errors
- [ ] Dev server starts without errors
- [ ] Admin UI fully functional
- [ ] All fields visible and editable
- [ ] Access control works correctly
- [ ] Hooks fire as expected
- [ ] Frontend displays vendors correctly
- [ ] All tests pass
- [ ] No performance degradation
- [ ] No data loss

## Troubleshooting

### Issue: "Cannot find module './payload/collections/vendors'"

**Solution:** Check that:
- Directory exists: `payload/collections/vendors/`
- Index file exists: `payload/collections/vendors/index.ts`
- Export is default: `export default Vendors;`

### Issue: "Field access function type mismatch"

**Solution:** Ensure `@ts-expect-error` comments are in place for field-level access (Payload CMS 3.x type compatibility)

### Issue: "Hook not firing"

**Solution:** Check:
- Hooks imported correctly in `vendors/index.ts`
- Hook functions exported from `vendors/hooks/index.ts`
- Email service environment variables configured

### Issue: "Fields not showing in admin UI"

**Solution:** Verify:
- Tier conditions using correct syntax
- Field groups spread correctly with `...` operator
- Array fields exported as single field, not array

## Documentation Updates

After successful migration:

- [ ] Update CLAUDE.md if collection structure mentioned
- [ ] Update architecture documentation
- [ ] Update developer onboarding guide
- [ ] Create PR with detailed description

## Next Steps

After migration is stable:

1. **Phase 2 Planning:** Evaluate if separate collections needed
2. **Performance Monitoring:** Track query performance
3. **Developer Feedback:** Gather team input on new structure
4. **Additional Refactoring:** Apply pattern to other large collections

## Notes

- This migration is **zero downtime** - no database changes
- **Backward compatible** - all existing code continues to work
- **Incremental rollout** - can be deployed gradually
- **Reversible** - can rollback if issues found

## Contact

For issues or questions:
- Review `/home/edwin/development/ptnextjs/Supporting-Docs/vendor-collection-refactoring/phase1-summary.md`
- Check git history: `git log --oneline payload/collections/vendors/`
- Search for similar patterns in other collections
