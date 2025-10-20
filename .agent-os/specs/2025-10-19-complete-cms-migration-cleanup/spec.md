# Complete CMS Migration Cleanup & Partners Consolidation

**Status:** 📋 Specification
**Priority:** Medium
**Estimated Effort:** 2-3 hours
**Created:** 2025-10-19
**Type:** Technical Debt / Refactoring

---

## Executive Summary

Complete the Payload CMS migration by cleaning up legacy TinaCMS references, consolidating the Partners page into the Vendors page with a filter toggle, and removing spurious test data from the database.

**Key Objectives:**
1. Rename `tinacms-data-service.ts` to reflect its actual purpose (local markdown file reader)
2. Migrate remaining pages from TinaCMS service to Payload CMS service
3. Consolidate Partners page into Vendors page with partner/all toggle (matching Products page pattern)
4. Delete Partners page and associated code
5. Clean up spurious test vendors from database
6. Update documentation to reflect current architecture

---

## Background & Context

### Current State Issues

1. **Naming Confusion:** The codebase has both `tinacms-data-service.ts` and `payload-cms-data-service.ts`, despite no longer using TinaCMS
2. **Partial Migration:** Some pages still use the TinaCMS service while most use Payload CMS
3. **Duplicate Pages:** Partners and Vendors pages serve similar purposes but use different data sources
4. **Test Data Pollution:** Database contains spurious test vendors (e.g., "UI Pending 1760711705414")

### Migration Status

**✅ Migrated to Payload CMS:**
- `/vendors` (and detail pages)
- `/products` (and detail pages)
- `/yachts` (and detail pages)
- `/` (homepage)
- `/about`
- `/blog` (and detail pages)

**❌ Still Using TinaCMS Service:**
- `/partners` (and detail pages)
- `/contact`
- `/products/products-server.tsx` (partial - uses both services)
- Layout (for company info)

### Current Data Service Usage

```typescript
// Legacy service (reads markdown files, poorly named)
lib/tinacms-data-service.ts

// Current service (reads from Payload CMS)
lib/payload-cms-data-service.ts
```

---

## Requirements

### 1. Rename & Refactor TinaCMS Data Service

**Rename File:**
- From: `lib/tinacms-data-service.ts`
- To: `lib/markdown-content-service.ts`

**Update Class Name:**
- From: `class TinaCMSDataService`
- To: `class MarkdownContentService`

**Update Export:**
- From: `export const tinaCMSDataService`
- To: `export const markdownContentService`

**Rationale:** The service reads local markdown files for categories, company info, and legacy content. It has nothing to do with TinaCMS anymore.

### 2. Consolidate Partners into Vendors Page

**Current Pattern (Products Page):**
The `/products` page already has a working pattern with `VendorToggle` component:
- Toggle between "Partners" and "All Vendors"
- URL param: `?view=partners` or `?view=all`
- Component: `<VendorToggle value={vendorView} onChange={setVendorView} />`

**Apply Same Pattern to Vendors Page:**

**File: `app/(site)/vendors/page.tsx`**
```typescript
interface VendorsPageProps {
  searchParams?: Promise<{
    category?: string;
    search?: string;
    view?: "partners" | "all";  // ADD THIS
  }>;
}
```

**Updates Required:**
1. Add `view` search param support to `/vendors` page
2. Add `VendorToggle` component to `VendorsClient`
3. Update filtering logic to respect partner toggle
4. Update page title/description based on toggle state:
   - Partners view: "Technology Partners"
   - All view: "Vendors & Suppliers"

### 3. Delete Partners Page & Associated Code

**Files to Delete:**
```
app/(site)/partners/
├── page.tsx
├── partners-server.tsx
└── [slug]/
    ├── page.tsx
    └── _components/
        └── partner-detail-client.tsx
```

**Redirects to Add (next.config.js):**
```javascript
{
  source: '/partners',
  destination: '/vendors?view=partners',
  permanent: true
},
{
  source: '/partners/:slug',
  destination: '/vendors/:slug',
  permanent: true
}
```

### 4. Migrate Remaining Pages to Payload CMS

**Files to Update:**

**a) Contact Page (`app/(site)/contact/page.tsx`)**
- Currently uses: `tinaCMSDataService.getCompanyInfo()`
- Change to: `payloadCMSDataService.getCompanyInfo()`

**b) Layout (`app/(site)/layout.tsx`)**
- Currently uses: `tinaCMSDataService.getCompanyInfo()`
- Change to: `payloadCMSDataService.getCompanyInfo()`

**c) Products Server (`app/(site)/products/products-server.tsx`)**
- Currently uses both services
- Migrate to use only `payloadCMSDataService`

**After migration, verify:**
- Company info still displays correctly in footer
- Contact page renders properly
- No build errors

### 5. Clean Spurious Test Data from Database

**Identify Test Vendors:**
Look for vendors with patterns like:
- "UI Pending [timestamp]"
- "Test Vendor"
- "Demo Company"
- Any vendor not found in original TinaCMS markdown files

**Create Cleanup Script:**
```bash
scripts/cleanup-test-vendors.ts
```

**Script Logic:**
1. Query all vendors from Payload CMS
2. Cross-reference with `content/vendors/*.md` files
3. Identify vendors without corresponding markdown files
4. Log candidates for deletion
5. Require manual confirmation before deleting
6. Delete confirmed test vendors

**Safety Checks:**
- Never delete vendors with associated products
- Never delete vendors with real-looking data (email, website, description)
- Create backup before deletion
- Log all deletions for rollback capability

### 6. Update Documentation

**Files to Update:**

**a) CLAUDE.md**
```diff
- **TinaCMS** manages all content as markdown files in `content/` directory
+ **Content Sources:**
+ - **Payload CMS** manages dynamic content (vendors, products, yachts, blog, team)
+ - **Markdown files** (`content/`) provide static reference data (categories, company info)

- **TinaCMSDataService** (`lib/tinacms-data-service.ts`) provides unified data access layer
+ **Data Services:**
+ - **PayloadCMSDataService** (`lib/payload-cms-data-service.ts`) - primary data access layer
+ - **MarkdownContentService** (`lib/markdown-content-service.ts`) - static content and categories
```

**b) README (if exists)**
- Update architecture diagrams
- Update data flow documentation

**c) Package.json scripts**
- Remove any TinaCMS-specific scripts
- Update comments referencing TinaCMS

---

## Implementation Plan

### Phase 1: Service Renaming (30 min)

1. ✅ Rename `lib/tinacms-data-service.ts` → `lib/markdown-content-service.ts`
2. ✅ Update class name and export
3. ✅ Update all imports across codebase
4. ✅ Run type-check and build to verify
5. ✅ Test affected pages (contact, layout)

### Phase 2: Vendors Page Enhancement (45 min)

1. ✅ Add VendorToggle component to `/vendors` page
2. ✅ Add `view` param handling
3. ✅ Update filtering logic for partner toggle
4. ✅ Update page header based on view state
5. ✅ Test filtering behavior
6. ✅ Verify URL params persist correctly

### Phase 3: Partners Page Deletion (30 min)

1. ✅ Add redirects in `next.config.js`
2. ✅ Delete `app/(site)/partners/` directory
3. ✅ Remove partners-related components
4. ✅ Update navigation/sitemap if needed
5. ✅ Test redirects work correctly
6. ✅ Verify no broken links

### Phase 4: Complete CMS Migration (30 min)

1. ✅ Update contact page to use Payload CMS
2. ✅ Update layout to use Payload CMS
3. ✅ Update products-server.tsx
4. ✅ Test all updated pages
5. ✅ Verify company info displays correctly

### Phase 5: Database Cleanup (20 min)

1. ✅ Create cleanup script
2. ✅ Run script in dry-run mode
3. ✅ Review candidates for deletion
4. ✅ Backup database
5. ✅ Execute cleanup
6. ✅ Verify integrity

### Phase 6: Documentation (15 min)

1. ✅ Update CLAUDE.md
2. ✅ Update inline comments
3. ✅ Update package.json
4. ✅ Create migration notes

---

## Testing Strategy

### Manual Testing

**Vendors Page:**
- [ ] Toggle between Partners/All views
- [ ] Verify filtering works correctly
- [ ] Check URL params update
- [ ] Test search + category + toggle combination
- [ ] Verify pagination resets on toggle

**Redirects:**
- [ ] `/partners` → `/vendors?view=partners`
- [ ] `/partners/[slug]` → `/vendors/[slug]`

**Data Integrity:**
- [ ] All partner vendors still accessible
- [ ] Vendor detail pages work
- [ ] Product associations intact
- [ ] No missing images/data

**Pages Using Company Info:**
- [ ] Contact page displays company info
- [ ] Footer displays company info
- [ ] No console errors

### Automated Testing

**Update Tests:**
```bash
# Update test imports
__tests__/tinacms-data-service*.test.ts → markdown-content-service*.test.ts

# Update integration tests
app/__tests__/integration/*.test.ts
```

**Run Test Suite:**
```bash
npm run test
npm run type-check
npm run build
```

---

## Success Criteria

- [ ] No references to "tinacms" or "TinaCMS" in active code (only in git history/docs)
- [ ] All pages use `payloadCMSDataService` or `markdownContentService` appropriately
- [ ] Partners page deleted, redirects working
- [ ] Vendors page has partner toggle matching Products page UX
- [ ] All spurious test vendors removed from database
- [ ] Documentation updated to reflect current architecture
- [ ] All tests passing
- [ ] Production build succeeds
- [ ] No broken links or 404s

---

## Rollback Plan

### If Issues Arise:

**Phase 1-4 (Code Changes):**
```bash
git revert [commit-hash]
npm install
npm run build
```

**Phase 5 (Database Cleanup):**
```bash
# Restore from backup
mongorestore --db payload /backup/payload-[timestamp]
```

**Quick Rollback Checklist:**
1. Identify problematic change
2. Revert specific commits
3. Restore database if needed
4. Clear Next.js cache: `rm -rf .next`
5. Rebuild: `npm run build`
6. Verify functionality

---

## Risk Assessment

| Risk | Likelihood | Impact | Mitigation |
|------|-----------|--------|------------|
| Broken partner links | Low | High | Add comprehensive redirects |
| Missing company info | Low | Medium | Test thoroughly before deploy |
| Data loss | Very Low | High | Backup database before cleanup |
| SEO impact | Low | Medium | 301 redirects preserve ranking |
| Test failures | Medium | Low | Update tests progressively |

---

## Dependencies

**Required:**
- Payload CMS must have all company info data
- VendorToggle component must be working (already exists)
- Database backup capability

**Optional:**
- None

---

## Files Affected

### Modified:
```
lib/tinacms-data-service.ts → lib/markdown-content-service.ts
app/(site)/vendors/page.tsx
app/(site)/components/vendors-client.tsx
app/(site)/contact/page.tsx
app/(site)/layout.tsx
app/(site)/products/products-server.tsx
next.config.js
CLAUDE.md
package.json
```

### Deleted:
```
app/(site)/partners/page.tsx
app/(site)/partners/partners-server.tsx
app/(site)/partners/[slug]/page.tsx
app/(site)/partners/[slug]/_components/partner-detail-client.tsx
```

### Created:
```
scripts/cleanup-test-vendors.ts
.agent-os/specs/2025-10-19-complete-cms-migration-cleanup/MIGRATION_NOTES.md
```

---

## Follow-up Tasks

**After Completion:**
1. Monitor server logs for 404s from old partner URLs
2. Update sitemap.xml if auto-generated
3. Update any external documentation referencing partner pages
4. Consider migrating remaining markdown content to Payload CMS (categories, company info)

**Future Enhancements:**
1. Move categories from markdown to Payload CMS
2. Move company info from markdown to Payload CMS
3. Completely remove markdown-content-service once all data in Payload
4. Add category management UI in Payload admin

---

## Notes

- This refactoring maintains backward compatibility through redirects
- The VendorToggle pattern is already proven on the Products page
- No user-facing functionality is lost, just consolidated
- Database cleanup is conservative to avoid data loss
- Migration can be done incrementally if needed

---

## References

- [Payload CMS Migration PR #5](https://github.com/your-repo/pull/5)
- [Products Page Implementation](app/(site)/products/page.tsx)
- [VendorToggle Component](components/ui/vendor-toggle.tsx)
