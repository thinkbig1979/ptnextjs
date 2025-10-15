# Task IMPL-FRONTEND-PAGE-UPDATES: Update All Pages to Use PayloadCMSDataService

## Task Metadata
- **Task ID**: impl-frontend-page-updates
- **Phase**: Phase 3 - Frontend Implementation
- **Agent Assignment**: implementation-specialist
- **Estimated Time**: 5 hours
- **Dependencies**: impl-frontend-yacht-methods, impl-frontend-category-tag-methods, impl-frontend-company-methods, impl-frontend-enhanced-transforms
- **Status**: Ready for Implementation
- **Priority**: Critical

## Task Description

Update all Next.js pages to use PayloadCMSDataService instead of TinaCMSDataService. This is a drop-in replacement that should require minimal code changes beyond import statements.

## Specifics

### Pages to Update (Technical Spec lines 877-914)

#### 1. app/vendors/page.tsx
```typescript
// Before:
import { TinaCMSDataService } from '@/lib/tinacms-data-service';
const dataService = TinaCMSDataService.getInstance();

// After:
import { PayloadCMSDataService } from '@/lib/payload-cms-data-service';
const dataService = PayloadCMSDataService.getInstance();
```

**Changes:**
- Update import statement
- Verify data structure compatibility
- Test page rendering

#### 2. app/vendors/[slug]/page.tsx
**Changes:**
- Update import statement
- Verify vendor detail page works
- Test enhanced fields render (certifications, awards, case studies)

#### 3. app/products/page.tsx
**Changes:**
- Update import statement
- Verify products list page works

#### 4. app/products/[slug]/page.tsx
**Changes:**
- Update import statement
- Verify product detail page works
- Test enhanced fields render (comparison metrics, reviews, visual demos)

#### 5. app/yachts/page.tsx (NEW)
**Changes:**
- Create new page for yachts listing
- Use getYachts() or getFeaturedYachts()
- Display yacht cards with specifications

#### 6. app/yachts/[slug]/page.tsx (NEW)
**Changes:**
- Create new page for yacht details
- Use getYachtBySlug()
- Display timeline, supplier map, sustainability metrics

#### 7. app/blog/page.tsx
**Changes:**
- Update import statement
- Verify blog listing works

#### 8. app/blog/[slug]/page.tsx
**Changes:**
- Update import statement
- Verify blog post detail works
- Test Lexical rich text renders

#### 9. app/team/page.tsx
**Changes:**
- Update import statement
- Verify team listing works

#### 10. app/about/page.tsx
**Changes:**
- Update import statement
- Use getCompanyInfo() if needed

#### 11. app/page.tsx (Homepage)
**Changes:**
- Update import statement
- Use getFeaturedVendors(), getFeaturedProducts(), getFeaturedYachts()
- Verify homepage renders correctly

### Static Generation Verification

Update `next.config.js` if needed:
- Ensure static export mode still works
- Verify all pages generate statically
- Test build time < 5 minutes

### Data Structure Compatibility

Ensure PayloadCMSDataService returns data in same shape as TinaCMSDataService:
- Vendor interface matches
- Product interface matches
- Blog interface matches
- Team interface matches
- Category interface matches

## Acceptance Criteria

- [ ] All 11 pages updated with new import statements
- [ ] 2 new yacht pages created (list, detail)
- [ ] All pages render correctly with Payload data
- [ ] Enhanced fields display on vendor/product detail pages
- [ ] Yacht timeline and supplier map display correctly
- [ ] Static site generation works
- [ ] Build time < 5 minutes
- [ ] No console errors
- [ ] No TypeScript errors

## Testing Requirements

### Manual Testing Per Page
1. **Vendors List** (`/vendors`)
   - Page loads without errors
   - All vendors display
   - Images load correctly
   - Links work

2. **Vendor Detail** (`/vendors/[slug]`)
   - Vendor details load
   - Enhanced fields display (certifications, awards)
   - Case studies render
   - Team members display
   - Yacht projects portfolio displays

3. **Products List** (`/products`)
   - All products display
   - Vendor relationships work
   - Categories filter works

4. **Product Detail** (`/products/[slug]`)
   - Product details load
   - Vendor relationship displays
   - Comparison metrics table displays
   - Owner reviews display
   - Visual demo content works (360° images, 3D models)

5. **Yachts List** (`/yachts`) - NEW
   - All yachts display
   - Specifications show
   - Images load

6. **Yacht Detail** (`/yachts/[slug]`) - NEW
   - Yacht details load
   - Timeline displays chronologically
   - Supplier map shows vendors and products
   - Sustainability metrics display
   - Maintenance history displays

7. **Blog List** (`/blog`)
   - All posts display
   - Categories work

8. **Blog Detail** (`/blog/[slug]`)
   - Post content renders (Lexical→HTML)
   - Images display

9. **Team** (`/team`)
   - All team members display
   - Photos load

10. **About** (`/about`)
    - Company info displays

11. **Homepage** (`/`)
    - Featured vendors display
    - Featured products display
    - Featured yachts display (new)

### Build Testing
```bash
npm run build
# Verify:
# - Build completes successfully
# - No errors during static generation
# - Build time < 5 minutes
# - All pages in .next/server/app/
```

### Integration Testing
- Test all internal links work
- Test vendor→product relationships
- Test yacht→vendor relationships
- Test product→vendor relationships

## Evidence Required

**Code Files:**
1. Updated `app/vendors/page.tsx`
2. Updated `app/vendors/[slug]/page.tsx`
3. Updated `app/products/page.tsx`
4. Updated `app/products/[slug]/page.tsx`
5. Created `app/yachts/page.tsx`
6. Created `app/yachts/[slug]/page.tsx`
7. Updated `app/blog/page.tsx`
8. Updated `app/blog/[slug]/page.tsx`
9. Updated `app/team/page.tsx`
10. Updated `app/about/page.tsx`
11. Updated `app/page.tsx`

**Test Results:**
- Screenshots of all 11 pages rendering correctly
- Build output showing successful static generation
- Build time measurement
- No console errors screenshot

**Verification Checklist:**
- [ ] All 11 pages updated
- [ ] 2 new yacht pages created
- [ ] Import statements all updated
- [ ] All pages render without errors
- [ ] Enhanced fields display correctly
- [ ] Static build works
- [ ] Build time < 5 minutes
- [ ] No TypeScript errors
- [ ] No console errors

## Context Requirements

**Technical Spec Sections:**
- Lines 877-914: Frontend Page Updates
- Lines 583-655: Frontend Data Service Architecture

**Existing Code:**
- Current page files in `app/` directory
- Existing component usage patterns

**Related Tasks:**
- All impl-frontend-* tasks (data service must be complete)
- test-frontend-integration (will validate these updates)

## Quality Gates

- [ ] All import statements updated correctly
- [ ] Data structure compatibility maintained (no breaking changes)
- [ ] All pages render without errors
- [ ] Enhanced fields display correctly on detail pages
- [ ] Yacht pages created and functional
- [ ] Static generation works
- [ ] Build time < 5 minutes
- [ ] No TypeScript errors
- [ ] No linting errors
- [ ] No runtime console errors

## Notes

- This is a critical integration point (backend→frontend)
- Import change should be the ONLY required change for most pages
- Enhanced fields will display on detail pages (vendors, products)
- Yacht pages are new - reference existing page patterns
- Test thoroughly before marking complete
- Verify all relationships resolve correctly (depth parameter important)
- Static generation is critical - must work at build time
- Consider adding loading states if pages become slower
- Document any pages that require additional changes beyond import
