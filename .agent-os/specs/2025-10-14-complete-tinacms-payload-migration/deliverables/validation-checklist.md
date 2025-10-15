# Validation Checklist - TinaCMS to Payload CMS Migration

> Created: 2025-10-14
> Task: PRE-2
> Author: integration-coordinator

## Overview

This document provides actionable validation checklists for the TinaCMS to Payload CMS migration. Use these checklists to verify pre-migration readiness, post-migration success, and final sign-off criteria.

**Print this document and check off items as you validate them.**

---

## Pre-Migration Validation Checklist

**Date:** ________________
**Validated By:** ________________

### Content Inventory

- [ ] **Vendors count:** _____ (from TinaCMS `content/vendors/`)
- [ ] **Products count:** _____ (from TinaCMS `content/products/`)
- [ ] **Blog posts count:** _____ (from TinaCMS `content/blog/posts/`)
- [ ] **Product categories count:** _____ (from TinaCMS `content/categories/`)
- [ ] **Blog categories count:** _____ (from TinaCMS `content/blog/categories/`)
- [ ] **Team members count:** _____ (from TinaCMS `content/team/`)
- [ ] **Yachts count:** _____ (from TinaCMS `content/yachts/` if exists, else 0)
- [ ] **Company info exists:** Yes / No (from TinaCMS `content/company/info.json`)
- [ ] **Unique tags count:** _____ (extracted from all content)

**Total Entities:** _____ (sum of all counts above)

### Reference Integrity

- [ ] **All product → vendor references valid:** Pass / Fail
- [ ] **All product → category references valid:** Pass / Fail
- [ ] **All product → tag references valid:** Pass / Fail
- [ ] **All blog post → category references valid:** Pass / Fail
- [ ] **All blog post → tag references valid:** Pass / Fail
- [ ] **All vendor → category references valid:** Pass / Fail
- [ ] **All vendor → tag references valid:** Pass / Fail
- [ ] **All yacht → vendor references valid:** Pass / Fail
- [ ] **All yacht → category references valid:** Pass / Fail
- [ ] **All yacht → tag references valid:** Pass / Fail

**Total Broken References:** _____ (must be 0)

### Duplicate Slugs

- [ ] **Vendor slugs unique:** Pass / Fail (list duplicates: _______________)
- [ ] **Product slugs unique:** Pass / Fail (list duplicates: _______________)
- [ ] **Blog post slugs unique:** Pass / Fail (list duplicates: _______________)
- [ ] **Yacht slugs unique:** Pass / Fail (list duplicates: _______________)
- [ ] **Category slugs unique:** Pass / Fail (list duplicates: _______________)
- [ ] **Tag slugs unique:** Pass / Fail (list duplicates: _______________)

**Total Duplicate Slugs:** _____ (must be 0)

### Required Fields

- [ ] **All vendors have required fields (name, slug, description):** Pass / Fail
- [ ] **All products have required fields (name, slug, description, vendor):** Pass / Fail
- [ ] **All blog posts have required fields (title, slug, excerpt, author, published_at):** Pass / Fail
- [ ] **All team members have required fields (name, role):** Pass / Fail
- [ ] **All yachts have required fields (name, slug, description):** Pass / Fail

**Total Missing Required Fields:** _____ (must be 0)

### Media Files

- [ ] **All vendor logo paths accessible:** Pass / Fail
- [ ] **All vendor image paths accessible:** Pass / Fail
- [ ] **All product image paths accessible:** Pass / Fail
- [ ] **All blog post image paths accessible:** Pass / Fail
- [ ] **All team member image paths accessible:** Pass / Fail
- [ ] **All yacht image paths accessible:** Pass / Fail

**Total Missing Media Files:** _____ (must be 0)

### Orphaned Content

- [ ] **Unused categories:** _____ (list: _______________)
- [ ] **Unused tags:** _____ (list: _______________)
- [ ] **Vendors without products:** _____ (list: _______________)
- [ ] **Products without vendor:** _____ (list: _______________)

**Note:** Orphaned content is acceptable but should be documented.

### Pre-Migration Summary

- [ ] **All validation checks passed:** Yes / No
- [ ] **Pre-migration validation script exit code:** _____ (must be 0)
- [ ] **Backup created:** Yes / No (location: _______________)
- [ ] **Backup verified:** Yes / No
- [ ] **Git tag created:** Yes / No (tag: _______________)
- [ ] **Ready to proceed with migration:** Yes / No

**Pre-Migration Sign-Off:**

Name: ________________
Date: ________________
Signature: ________________

---

## Post-Migration Validation Checklist

**Date:** ________________
**Validated By:** ________________

### Entity Count Verification

| Collection | TinaCMS | Payload | Match (✓/✗) | Status |
|------------|---------|---------|-------------|--------|
| Vendors | _____ | _____ | ☐ | Pass / Fail |
| Products | _____ | _____ | ☐ | Pass / Fail |
| Blog Posts | _____ | _____ | ☐ | Pass / Fail |
| Categories | _____ | _____ | ☐ | Pass / Fail |
| Team Members | _____ | _____ | ☐ | Pass / Fail |
| Yachts | _____ | _____ | ☐ | Pass / Fail |
| Company Info | _____ | _____ | ☐ | Pass / Fail |
| Tags | _____ | _____ | ☐ | Pass / Fail |

**Total Entities Match:** Yes / No (100% required)

**Data Loss Detected:** Yes / No

**If data loss detected, list missing entities:**
- _______________________________________________
- _______________________________________________
- _______________________________________________

### Field-Level Data Comparison (10% Sample)

**Sample Size:** _____ entities per collection

- [ ] **Vendors (2 samples):** Pass / Fail
  - Sample 1 slug: _______________ Match: ☐
  - Sample 2 slug: _______________ Match: ☐

- [ ] **Products (5 samples):** Pass / Fail
  - Sample 1 slug: _______________ Match: ☐
  - Sample 2 slug: _______________ Match: ☐
  - Sample 3 slug: _______________ Match: ☐
  - Sample 4 slug: _______________ Match: ☐
  - Sample 5 slug: _______________ Match: ☐

- [ ] **Blog Posts (2 samples):** Pass / Fail
  - Sample 1 slug: _______________ Match: ☐
  - Sample 2 slug: _______________ Match: ☐

- [ ] **Categories (1 sample):** Pass / Fail
  - Sample 1 slug: _______________ Match: ☐

- [ ] **Team Members (1 sample):** Pass / Fail
  - Sample 1 name: _______________ Match: ☐

- [ ] **Yachts (1 sample):** Pass / Fail
  - Sample 1 slug: _______________ Match: ☐

**Total Field Mismatches:** _____ (document all mismatches below)

**Field Mismatch Details:**
1. Collection: _______________ | Slug: _______________ | Field: _______________ | Issue: _______________
2. Collection: _______________ | Slug: _______________ | Field: _______________ | Issue: _______________
3. Collection: _______________ | Slug: _______________ | Field: _______________ | Issue: _______________

### Rich Text Conversion Verification

**Blog Posts Checked:** _____ (minimum 10)

- [ ] **Headings (h1-h6) converted correctly:** Pass / Fail
- [ ] **Paragraphs preserved:** Pass / Fail
- [ ] **Lists (ordered/unordered) maintained:** Pass / Fail
- [ ] **Links functional:** Pass / Fail
- [ ] **Images included with correct paths:** Pass / Fail
- [ ] **Code blocks formatted properly:** Pass / Fail
- [ ] **Bold/italic/strikethrough preserved:** Pass / Fail

**Rich Text Conversion Errors:** _____ (list: _______________)

### Reference Resolution Validation

- [ ] **Product → Vendor relationships resolved:** Pass / Fail
  - Total product-vendor links: _____
  - Resolved successfully: _____
  - Broken links: _____

- [ ] **Product → Category relationships resolved:** Pass / Fail
  - Total product-category links: _____
  - Resolved successfully: _____
  - Broken links: _____

- [ ] **Blog Post → Category relationships resolved:** Pass / Fail
  - Total blog-category links: _____
  - Resolved successfully: _____
  - Broken links: _____

- [ ] **Content → Tag relationships resolved:** Pass / Fail
  - Total content-tag links: _____
  - Resolved successfully: _____
  - Broken links: _____

- [ ] **Yacht → Vendor relationships resolved:** Pass / Fail
  - Total yacht-vendor links: _____
  - Resolved successfully: _____
  - Broken links: _____

**Total Broken Relationships:** _____ (must be 0)

### Media Path Transformation

- [ ] **All image URLs start with `/media/` or `http`:** Pass / Fail
- [ ] **All transformed paths point to accessible files:** Pass / Fail
- [ ] **No broken image references:** Pass / Fail

**Total Invalid Media Paths:** _____ (must be 0)

**Invalid Media Path Examples:**
1. _______________________________________________
2. _______________________________________________
3. _______________________________________________

### Slug Uniqueness in Payload

- [ ] **Vendor slugs unique in database:** Pass / Fail
- [ ] **Product slugs unique in database:** Pass / Fail
- [ ] **Blog post slugs unique in database:** Pass / Fail
- [ ] **Yacht slugs unique in database:** Pass / Fail
- [ ] **Category slugs unique in database:** Pass / Fail
- [ ] **Tag slugs unique in database:** Pass / Fail

**Total Duplicate Slugs in Database:** _____ (must be 0)

### Data Integrity Validation

- [ ] **All required fields present in Payload:** Pass / Fail
- [ ] **No null values for required fields:** Pass / Fail
- [ ] **Dates in correct ISO 8601 format:** Pass / Fail
- [ ] **Numbers are numeric types:** Pass / Fail
- [ ] **Booleans are boolean types:** Pass / Fail
- [ ] **Arrays are array types:** Pass / Fail
- [ ] **Array element counts preserved:** Pass / Fail
- [ ] **All relationship IDs valid:** Pass / Fail
- [ ] **All enum values valid:** Pass / Fail
- [ ] **All image URLs valid format:** Pass / Fail

**Total Data Integrity Issues:** _____ (must be 0)

### Post-Migration Summary

- [ ] **All validation checks passed:** Yes / No
- [ ] **Post-migration validation script exit code:** _____ (must be 0)
- [ ] **Zero data loss confirmed (100% entity match):** Yes / No
- [ ] **100% field parity achieved:** Yes / No
- [ ] **All relationships intact:** Yes / No
- [ ] **All media paths valid:** Yes / No

**Post-Migration Sign-Off:**

Name: ________________
Date: ________________
Signature: ________________

---

## Application Build and Deployment Checklist

**Date:** ________________
**Validated By:** ________________

### Build Validation

- [ ] **Application builds successfully:** Pass / Fail
  - Build command: `npm run build`
  - Exit code: _____ (must be 0)
  - Build time: _____ minutes (must be < 5 minutes)

- [ ] **No TypeScript errors:** Pass / Fail
  - Total TS errors: _____ (must be 0)

- [ ] **No build errors:** Pass / Fail
  - Total build errors: _____ (must be 0)

- [ ] **Static pages generated successfully:** Pass / Fail
  - Total pages generated: _____

- [ ] **Build artifacts present in `.next/` directory:** Pass / Fail

### Development Server

- [ ] **Development server starts without errors:** Pass / Fail
  - Command: `npm run dev`
  - Server URL: http://localhost:3000
  - No console errors: ☐

### Page Rendering Validation

**Manual Testing Required - Check each page:**

#### Homepage (/)
- [ ] **Page loads without errors:** Pass / Fail
- [ ] **Featured partners section displays:** Pass / Fail
- [ ] **Featured products section displays:** Pass / Fail
- [ ] **Recent blog posts display:** Pass / Fail
- [ ] **Hero section renders:** Pass / Fail
- [ ] **All links work correctly:** Pass / Fail
- [ ] **Images load properly:** Pass / Fail

#### Vendors List (/vendors)
- [ ] **Page loads without errors:** Pass / Fail
- [ ] **Vendor list displays:** Pass / Fail (count: _____)
- [ ] **Vendor cards render correctly:** Pass / Fail
- [ ] **Category filtering works:** Pass / Fail
- [ ] **Featured filter works:** Pass / Fail
- [ ] **Search functionality operates:** Pass / Fail
- [ ] **Images load properly:** Pass / Fail

#### Vendor Detail (/vendors/[slug])
**Test 3 vendor detail pages:**

1. Slug: _______________
   - [ ] **Page loads:** Pass / Fail
   - [ ] **All base fields display:** Pass / Fail
   - [ ] **Certifications section renders:** Pass / Fail
   - [ ] **Awards section renders:** Pass / Fail
   - [ ] **Social proof displays:** Pass / Fail
   - [ ] **Video introduction shows:** Pass / Fail
   - [ ] **Case studies render:** Pass / Fail
   - [ ] **Innovation highlights display:** Pass / Fail
   - [ ] **Team members section shows:** Pass / Fail
   - [ ] **Yacht projects render:** Pass / Fail
   - [ ] **Related products display:** Pass / Fail

2. Slug: _______________
   - [ ] **Page loads:** Pass / Fail
   - [ ] **All content displays:** Pass / Fail

3. Slug: _______________
   - [ ] **Page loads:** Pass / Fail
   - [ ] **All content displays:** Pass / Fail

#### Products List (/products)
- [ ] **Page loads without errors:** Pass / Fail
- [ ] **Product list displays:** Pass / Fail (count: _____)
- [ ] **Product cards render correctly:** Pass / Fail
- [ ] **Images display properly:** Pass / Fail
- [ ] **Category filtering works:** Pass / Fail
- [ ] **Vendor filtering works:** Pass / Fail
- [ ] **Search functionality operates:** Pass / Fail

#### Product Detail (/products/[slug])
**Test 3 product detail pages:**

1. Slug: _______________
   - [ ] **Page loads:** Pass / Fail
   - [ ] **Product images gallery displays:** Pass / Fail
   - [ ] **Specifications table renders:** Pass / Fail
   - [ ] **Features section displays:** Pass / Fail
   - [ ] **Comparison metrics render:** Pass / Fail
   - [ ] **Integration compatibility shows:** Pass / Fail
   - [ ] **Owner reviews display:** Pass / Fail
   - [ ] **Visual demo content renders:** Pass / Fail
   - [ ] **Benefits section shows:** Pass / Fail
   - [ ] **Services section displays:** Pass / Fail
   - [ ] **Vendor information shows:** Pass / Fail

2. Slug: _______________
   - [ ] **Page loads:** Pass / Fail
   - [ ] **All content displays:** Pass / Fail

3. Slug: _______________
   - [ ] **Page loads:** Pass / Fail
   - [ ] **All content displays:** Pass / Fail

#### Yachts List (/yachts)
- [ ] **Page loads without errors:** Pass / Fail
- [ ] **Yacht list displays:** Pass / Fail (count: _____)
- [ ] **Yacht cards render correctly:** Pass / Fail
- [ ] **Images display properly:** Pass / Fail
- [ ] **Featured filter works:** Pass / Fail
- [ ] **Search functionality operates:** Pass / Fail

#### Yacht Detail (/yachts/[slug])
**Test all yacht detail pages:**

1. Slug: _______________
   - [ ] **Page loads:** Pass / Fail
   - [ ] **Yacht specifications display:** Pass / Fail
   - [ ] **Timeline renders correctly:** Pass / Fail
   - [ ] **Supplier map shows all vendors:** Pass / Fail
   - [ ] **Sustainability metrics display:** Pass / Fail
   - [ ] **Customizations section renders:** Pass / Fail
   - [ ] **Maintenance history appears:** Pass / Fail

2. Slug: _______________
   - [ ] **Page loads:** Pass / Fail
   - [ ] **All content displays:** Pass / Fail

3. Slug: _______________
   - [ ] **Page loads:** Pass / Fail
   - [ ] **All content displays:** Pass / Fail

#### Blog List (/blog)
- [ ] **Page loads without errors:** Pass / Fail
- [ ] **Blog post list displays:** Pass / Fail (count: _____)
- [ ] **Post cards render correctly:** Pass / Fail
- [ ] **Featured images display:** Pass / Fail
- [ ] **Category filtering works:** Pass / Fail
- [ ] **Featured posts appear:** Pass / Fail

#### Blog Post Detail (/blog/[slug])
**Test 3 blog post detail pages:**

1. Slug: _______________
   - [ ] **Page loads:** Pass / Fail
   - [ ] **Rich text content renders correctly:** Pass / Fail
   - [ ] **Images display properly:** Pass / Fail
   - [ ] **Code blocks formatted:** Pass / Fail
   - [ ] **Links work correctly:** Pass / Fail
   - [ ] **Author information appears:** Pass / Fail
   - [ ] **Category and tags display:** Pass / Fail

2. Slug: _______________
   - [ ] **Page loads:** Pass / Fail
   - [ ] **All content displays:** Pass / Fail

3. Slug: _______________
   - [ ] **Page loads:** Pass / Fail
   - [ ] **All content displays:** Pass / Fail

#### Team Page (/team)
- [ ] **Page loads without errors:** Pass / Fail
- [ ] **Team member list displays:** Pass / Fail (count: _____)
- [ ] **Member cards render correctly:** Pass / Fail
- [ ] **Photos load properly:** Pass / Fail
- [ ] **Bios display correctly:** Pass / Fail
- [ ] **LinkedIn links work:** Pass / Fail

#### About Page (/about)
- [ ] **Page loads without errors:** Pass / Fail
- [ ] **Company information displays:** Pass / Fail
- [ ] **Company story renders:** Pass / Fail
- [ ] **Logo displays:** Pass / Fail
- [ ] **Social media links work:** Pass / Fail

### Performance Validation

- [ ] **Homepage load time < 2 seconds:** Pass / Fail (actual: _____ seconds)
- [ ] **Vendor list load time < 2 seconds:** Pass / Fail (actual: _____ seconds)
- [ ] **Product list load time < 2 seconds:** Pass / Fail (actual: _____ seconds)
- [ ] **Blog list load time < 2 seconds:** Pass / Fail (actual: _____ seconds)
- [ ] **Build time < 5 minutes:** Pass / Fail (actual: _____ minutes)

### SEO Metadata

**Check 3 pages for SEO metadata:**

1. Page: _______________
   - [ ] **Meta title generated:** Pass / Fail
   - [ ] **Meta description generated:** Pass / Fail
   - [ ] **OG image present:** Pass / Fail

2. Page: _______________
   - [ ] **Meta title generated:** Pass / Fail
   - [ ] **Meta description generated:** Pass / Fail

3. Page: _______________
   - [ ] **Meta title generated:** Pass / Fail
   - [ ] **Meta description generated:** Pass / Fail

### Console Errors

- [ ] **No console errors in browser:** Pass / Fail
  - Total console errors: _____ (must be 0)
  - List any errors: _______________________________________________

- [ ] **No 404 errors:** Pass / Fail
  - Total 404s: _____ (must be 0)
  - List any 404s: _______________________________________________

### Application Summary

- [ ] **All pages build successfully:** Yes / No
- [ ] **All pages render correctly:** Yes / No
- [ ] **No console errors:** Yes / No
- [ ] **Performance acceptable:** Yes / No
- [ ] **SEO metadata generates:** Yes / No

**Application Build Sign-Off:**

Name: ________________
Date: ________________
Signature: ________________

---

## Final Sign-Off Criteria

**Date:** ________________
**Validated By:** ________________

### Critical Success Criteria

- [ ] **Zero data loss (100% entity count match):** Pass / Fail
  - TinaCMS entities: _____
  - Payload entities: _____
  - Match: Yes / No

- [ ] **100% field parity (all fields migrated):** Pass / Fail
  - Fields compared: _____
  - Fields matched: _____
  - Match rate: _____%

- [ ] **All relationships intact:** Pass / Fail
  - Total relationships: _____
  - Valid relationships: _____
  - Broken relationships: _____ (must be 0)

- [ ] **All media paths valid:** Pass / Fail
  - Total media paths: _____
  - Valid paths: _____
  - Invalid paths: _____ (must be 0)

- [ ] **Application builds successfully (<5 minutes):** Pass / Fail
  - Build time: _____ minutes

- [ ] **All pages render correctly:** Pass / Fail
  - Total pages: 11
  - Passing pages: _____
  - Failing pages: _____ (must be 0)

- [ ] **Static generation works:** Pass / Fail
  - Static pages generated: _____

- [ ] **No critical errors:** Pass / Fail
  - Total critical errors: _____ (must be 0)

### Performance Criteria

- [ ] **Build time < 5 minutes:** Pass / Fail (actual: _____ minutes)
- [ ] **Average page load time < 2 seconds:** Pass / Fail (actual: _____ seconds)
- [ ] **No performance regressions:** Pass / Fail

### Quality Criteria

- [ ] **All automated tests pass:** Pass / Fail
- [ ] **Validation scripts exit code 0:** Pass / Fail
- [ ] **No data integrity issues:** Pass / Fail
- [ ] **Rich text rendering correct:** Pass / Fail
- [ ] **SEO metadata complete:** Pass / Fail

### User Acceptance

- [ ] **Homepage functionality verified:** Pass / Fail
- [ ] **Vendor pages functionality verified:** Pass / Fail
- [ ] **Product pages functionality verified:** Pass / Fail
- [ ] **Yacht pages functionality verified:** Pass / Fail
- [ ] **Blog pages functionality verified:** Pass / Fail
- [ ] **Team page functionality verified:** Pass / Fail
- [ ] **About page functionality verified:** Pass / Fail

### Stakeholder Approval

**Project Manager:**
- Name: ________________
- Date: ________________
- Signature: ________________
- Approval: ☐ Approved ☐ Rejected

**Technical Lead:**
- Name: ________________
- Date: ________________
- Signature: ________________
- Approval: ☐ Approved ☐ Rejected

**QA Lead:**
- Name: ________________
- Date: ________________
- Signature: ________________
- Approval: ☐ Approved ☐ Rejected

---

## Migration Status

**Overall Migration Status:** ☐ SUCCESS ☐ FAILURE ☐ ROLLBACK REQUIRED

**If SUCCESS:**
- [ ] Backup can be archived (retain for 30 days)
- [ ] TinaCMS can be deprecated
- [ ] Documentation updated
- [ ] Team notified of success

**If FAILURE:**
- [ ] Rollback initiated
- [ ] Root cause documented
- [ ] Fix planned
- [ ] Retry scheduled

**Final Notes:**
_______________________________________________
_______________________________________________
_______________________________________________
_______________________________________________
_______________________________________________

---

## Document Control

**Version:** 1.0
**Created:** 2025-10-14
**Last Updated:** 2025-10-14
**Author:** integration-coordinator
**Approved By:** ________________
**Approval Date:** ________________

---

## Appendix: Quick Reference

### Command Reference

```bash
# Pre-migration validation
npm run validate:tinacms

# Run migration
npm run migrate:tinacms-to-payload

# Post-migration validation
npm run validate:migration

# Data integrity check
npm run validate:integrity -- --collection vendors --sample 10

# Rollback
npm run rollback:migration

# Build application
npm run build

# Start development server
npm run dev
```

### Exit Codes

- `0`: Success (all checks pass)
- `1`: Failure (validation issues detected)

### Report Locations

- Pre-migration: `validation-reports/pre-migration-YYYYMMDD-HHMMSS.json`
- Post-migration: `validation-reports/post-migration-YYYYMMDD-HHMMSS.json`
- Integrity: `validation-reports/integrity-{collection}-YYYYMMDD-HHMMSS.json`

### Backup Location

- `.agent-os/.backup-YYYYMMDD-HHMMSS/`

### Success Criteria Summary

- **0% data loss** (100% entity count match)
- **100% field parity**
- **100% relationship integrity**
- **100% media path validity**
- **<5 minute build time**
- **All pages render correctly**
- **All tests pass**

---

**End of Validation Checklist**
