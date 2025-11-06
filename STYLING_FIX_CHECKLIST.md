# Styling Violations Fix Checklist

## Pre-Implementation Setup

- [ ] Read STYLING_AUDIT_SUMMARY.txt (5-10 minutes)
- [ ] Review STYLING_AUDIT_REPORT.md sections 1-3 (15-20 minutes)
- [ ] Review STYLING_FIX_EXAMPLES.md for patterns (10-15 minutes)
- [ ] Clone/pull latest code
- [ ] Install dependencies: `npm install`
- [ ] Verify dev server runs: `npm run dev`
- [ ] Navigate to theme toggle: check it works
- [ ] Open app/globals.css to reference theme variables

**Estimated time**: 30-45 minutes

---

## Phase 1: Critical Dashboard Pages (Days 1-2)

### File 1: `app/(site)/vendor/dashboard/page.tsx`
**Violations**: 14 | **Severity**: CRITICAL | **Estimated Time**: 45 min

- [ ] Find all `text-gray-*` instances
  - [ ] `text-gray-700` → `text-foreground`
  - [ ] `text-gray-900` → `text-foreground`
  - [ ] `text-gray-600` (with dark prefix) → `text-muted-foreground`
- [ ] Find all `bg-gray-*` instances
  - [ ] `bg-gray-50 dark:bg-gray-900` → `bg-background`
  - [ ] `bg-gray-200` (progress bar) → `bg-muted`
- [ ] Find all `border-gray-*` instances
  - [ ] `border-gray-200` → `border-border`
- [ ] Test in light mode
- [ ] Test in dark mode
- [ ] Verify contrast in both modes
- [ ] Commit: `fix(dashboard): Replace hard-coded colors with semantic theme classes`

**Testing Checklist**:
- [ ] Page loads without errors
- [ ] Light mode: all colors appear correct
- [ ] Dark mode: all colors adapt properly
- [ ] Toggle between modes: smooth transition
- [ ] Check contrast with DevTools accessibility panel

---

### File 2: `app/(site)/vendor/dashboard/components/DashboardHeader.tsx`
**Violations**: 7 | **Severity**: HIGH | **Estimated Time**: 20 min

- [ ] Replace text color violations
  - [ ] `text-gray-900 dark:text-white` → `text-foreground`
- [ ] Replace background violations
  - [ ] `bg-white dark:bg-gray-950` → `bg-card`
- [ ] Replace border violations
  - [ ] `border-gray-200 dark:border-gray-800` → `border-border`
- [ ] Test in both light and dark modes
- [ ] Verify header appearance
- [ ] Commit: `fix(dashboard): Update DashboardHeader theme classes`

---

### File 3: `app/(site)/vendor/dashboard/components/DashboardSkeleton.tsx`
**Violations**: 5 | **Severity**: HIGH | **Estimated Time**: 15 min

- [ ] Replace background violations
  - [ ] `bg-gray-50 dark:bg-gray-900` → `bg-background`
  - [ ] `bg-white dark:bg-gray-950` → `bg-card`
- [ ] Replace border violations
  - [ ] `border-gray-200 dark:border-gray-800` → `border-border`
- [ ] Test skeleton loading state in both modes
- [ ] Commit: `fix(dashboard): Update DashboardSkeleton theme classes`

---

### File 4: `app/(site)/vendor/dashboard/components/DashboardError.tsx`
**Violations**: 2 | **Severity**: MEDIUM | **Estimated Time**: 10 min

- [ ] Replace background: `bg-gray-50 dark:bg-gray-900` → `bg-background`
- [ ] Replace text color: `text-gray-600 dark:text-gray-400` → `text-muted-foreground`
- [ ] Test error state in both modes
- [ ] Commit: `fix(dashboard): Update DashboardError theme classes`

---

### File 5: `app/(site)/vendor/dashboard/components/DashboardSidebar.tsx`
**Violations**: 5 | **Severity**: MEDIUM | **Estimated Time**: 20 min

- [ ] Replace all text-gray violations
  - [ ] `text-gray-700 dark:text-gray-300` → `text-foreground`
  - [ ] `text-gray-600 dark:text-gray-400` → `text-muted-foreground`
- [ ] Replace all text-blue violations
  - [ ] `text-blue-600 dark:text-blue-400` → `text-accent`
- [ ] Test sidebar navigation in both modes
- [ ] Verify active/inactive link states
- [ ] Commit: `fix(dashboard): Update DashboardSidebar theme classes`

---

### File 6: `app/(site)/vendor/login/page.tsx`
**Violations**: 5 | **Severity**: HIGH | **Estimated Time**: 15 min

- [ ] Replace background violations
  - [ ] `bg-gray-50 dark:bg-slate-950` → `bg-background`
  - [ ] `bg-white dark:bg-slate-900` → `bg-card`
- [ ] Replace text violations
  - [ ] `text-gray-900 dark:text-white` → `text-foreground`
  - [ ] `text-gray-600 dark:text-gray-400` → `text-muted-foreground`
- [ ] Replace border violations
  - [ ] `border-gray-200 dark:border-slate-800` → `border-border`
- [ ] Test login form in both modes
- [ ] Verify form contrast
- [ ] Commit: `fix(auth): Update login page theme classes`

**Phase 1 Summary**:
- [ ] All 6 files completed
- [ ] Commit message: `fix: Phase 1 - Critical dashboard pages styling compliance`
- [ ] Total time: 2-3 hours
- [ ] Test command: `npm run dev` and manually verify dashboard

---

## Phase 2: Profile & Subscription Pages (Days 3-4)

### File 7: `app/(site)/vendor/dashboard/profile/page.tsx`
**Violations**: 9 | **Estimated Time**: 40 min

- [ ] Replace all text-gray violations (6 instances)
- [ ] Replace all text-blue violations (3 instances)
- [ ] Test profile page in light mode
- [ ] Test profile page in dark mode
- [ ] Verify form inputs appear correct
- [ ] Commit: `fix(profile): Replace hard-coded colors with semantic classes`

---

### File 8: `app/(site)/vendor/dashboard/subscription/page.tsx`
**Violations**: 9 | **Estimated Time**: 40 min

- [ ] Replace all text-gray violations
- [ ] Replace all text-blue violations
- [ ] Test subscription page in light mode
- [ ] Test subscription page in dark mode
- [ ] Verify tier display correctness
- [ ] Commit: `fix(subscription): Replace hard-coded colors with semantic classes`

---

### File 9: `app/(site)/vendor/dashboard/components/ProfileEditTabs.tsx`
**Violations**: 8 | **Estimated Time**: 35 min

- [ ] Replace background violations
  - [ ] `bg-gray-50 dark:bg-gray-800/50` → `bg-muted`
- [ ] Replace text violations
  - [ ] `text-gray-*` → appropriate semantic class
- [ ] Replace border violations
  - [ ] `border-gray-*` → `border-border`
- [ ] Test form tabs in both modes
- [ ] Commit: `fix(dashboard): Update ProfileEditTabs theme classes`

---

### File 10: `app/(site)/vendor/dashboard/components/CertificationsAwardsManager.tsx`
**Violations**: 10 | **Estimated Time**: 45 min

- [ ] Replace 7 text-gray violations
- [ ] Replace 3 background violations
- [ ] Test empty state in both modes
- [ ] Test with data in both modes
- [ ] Verify image placeholders appear correct
- [ ] Commit: `fix(dashboard): Update CertificationsAwardsManager theme classes`

---

### File 11: `app/(site)/vendor/dashboard/components/TeamMembersManager.tsx`
**Violations**: 5 | **Estimated Time**: 20 min

- [ ] Replace text-blue violations (3 instances)
  - [ ] `text-blue-600 hover:text-blue-800` → `text-accent hover:text-accent/80`
  - [ ] `text-blue-600` → `text-accent`
- [ ] Test LinkedIn links in both modes
- [ ] Commit: `fix(dashboard): Update TeamMembersManager theme classes`

---

### File 12: `app/(site)/vendor/dashboard/components/BrandStoryForm.tsx`
**Violations**: 1 | **Estimated Time**: 5 min

- [ ] Replace `text-gray-500 dark:text-gray-400` → `text-muted-foreground`
- [ ] Quick visual test
- [ ] Commit: `fix(dashboard): Update BrandStoryForm theme classes`

**Phase 2 Summary**:
- [ ] All 6 files completed
- [ ] Commit message: `fix: Phase 2 - Profile and subscription pages styling compliance`
- [ ] Total time: 3-4 hours
- [ ] Test command: `npm run dev` and navigate dashboard sections

---

## Phase 3: Core Components (Days 5-6)

### File 13: `components/enhanced-profiles/InteractiveOrgChart.tsx`
**Violations**: 13 | **Estimated Time**: 50 min

- [ ] Replace 11 text-gray violations
- [ ] Replace 2 background violations
- [ ] Test empty state
- [ ] Test with team data
- [ ] Test links in both modes
- [ ] Commit: `fix(components): Update InteractiveOrgChart theme classes`

---

### File 14: `components/enhanced-profiles/AwardsSection.tsx`
**Violations**: 9 | **Estimated Time**: 35 min

- [ ] Replace 7 text violations
- [ ] Replace 1 background violation
- [ ] Replace 1 text-blue violation
- [ ] Test empty state in both modes
- [ ] Test with awards in both modes
- [ ] Commit: `fix(components): Update AwardsSection theme classes`

---

### File 15: `components/enhanced-profiles/VideoIntroduction.tsx`
**Violations**: 7 | **Estimated Time**: 30 min

- [ ] Replace 5 text-gray violations
- [ ] Replace 2 background violations
- [ ] **NOTE**: Keep `bg-gray-900` for video player overlay (fullscreen)
- [ ] Test video state in both modes
- [ ] Test play button visibility
- [ ] Commit: `fix(components): Update VideoIntroduction theme classes`

---

### File 16: `components/enhanced-profiles/CertificationBadge.tsx`
**Violations**: 5 | **Estimated Time**: 20 min

- [ ] Replace 3 text-gray violations
- [ ] Replace 1 text-blue violation
- [ ] Test badge display in both modes
- [ ] Commit: `fix(components): Update CertificationBadge theme classes`

---

### File 17: `components/enhanced-profiles/SocialProofMetrics.tsx`
**Violations**: 5 | **Estimated Time**: 20 min

- [ ] Replace 4 background violations
- [ ] Replace 1 text-blue violation
- [ ] Test metrics display in both modes
- [ ] Commit: `fix(components): Update SocialProofMetrics theme classes`

---

### File 18: `components/vendor/LocationMapPreview.tsx`
**Violations**: 9 | **Estimated Time**: 35 min

- [ ] Replace 4 text-gray violations
- [ ] Replace 3 background violations
- [ ] Replace 1 text-blue violation
- [ ] Replace 1 border violation
- [ ] Test map loading state
- [ ] Test empty state
- [ ] Test with locations
- [ ] Test in both modes
- [ ] Commit: `fix(components): Update LocationMapPreview theme classes`

---

### File 19: `components/product-comparison/VisualDemo.tsx`
**Violations**: 8 | **Estimated Time**: 45 min

- [ ] Replace 4 text-gray violations
- [ ] Replace 2 background violations
- [ ] Replace 2 text violations
- [ ] **NOTE**: Keep white/gray for fullscreen video player (special case)
- [ ] Test video loading states
- [ ] Test in both modes
- [ ] Commit: `fix(components): Update VisualDemo theme classes`

---

### File 20: `components/yacht-profiles/MaintenanceHistory.tsx`
**Violations**: 6 | **Estimated Time**: 25 min

- [ ] Replace 2 text-gray violations
- [ ] Replace 1 text-blue violation
- [ ] **NOTE**: Badge colors - these may need custom variants
- [ ] Test maintenance history display
- [ ] Test status badges in both modes
- [ ] Commit: `fix(components): Update MaintenanceHistory theme classes`

---

### File 21: `components/product-comparison/IntegrationNotes.tsx`
**Violations**: 5 | **Estimated Time**: 20 min

- [ ] Replace badge violations (may need custom variants)
- [ ] Test compatibility badges in both modes
- [ ] Commit: `fix(components): Update IntegrationNotes theme classes`

---

### File 22: `components/dashboard/LocationsManagerCard.tsx`
**Violations**: 8 | **Estimated Time**: 35 min

- [ ] Replace 5 text-gray violations
- [ ] Replace 3 background violations
- [ ] Test location list in both modes
- [ ] Test empty state
- [ ] Test form display
- [ ] Commit: `fix(components): Update LocationsManagerCard theme classes`

---

### File 23: `components/ui/progressive-image.tsx`
**Violations**: 8 | **Estimated Time**: 35 min

- [ ] Replace 8 background violations
- [ ] Replace 6 text violations
- [ ] Test image loading skeleton
- [ ] Test error state
- [ ] Test in both modes
- [ ] Commit: `fix(ui): Update progressive-image theme classes`

---

**Phase 3 Summary**:
- [ ] 10+ component files completed
- [ ] Commit message: `fix: Phase 3 - Core components styling compliance`
- [ ] Total time: 4-5 hours
- [ ] Run tests: `npm run test`

---

## Phase 4: Remaining Components (Days 7)

### Quick Fixes (Lower Priority)

- [ ] `components/ui/optimized-avatar.tsx` (3 violations, 15 min)
- [ ] `components/ui/lazy-media.tsx` (3 violations, 15 min)
- [ ] `components/VendorLocationCard.tsx` (6 violations, 25 min)
- [ ] `components/LocationSearchFilter.tsx` (4 violations, 15 min)
- [ ] `components/VendorMap.tsx` (3 violations, 15 min)
- [ ] `components/shared/TierGate.tsx` (6 violations, 25 min)
- [ ] `components/cta-section.tsx` (2 violations, 10 min)
- [ ] `app/(site)/vendor/registration-pending/page.tsx` (1 violation, 5 min)
- [ ] `components/yacht-profiles/YachtTimeline.tsx` (2 violations, 10 min)
- [ ] `components/yacht-profiles/SustainabilityScore.tsx` (4 violations, 15 min)
- [ ] `components/yacht-profiles/SupplierMap.tsx` (3 violations, 15 min)
- [ ] `components/dashboard/BasicInfoForm.tsx` (3 violations, 15 min)
- [ ] Other remaining files (10+ more files, ~2 hours)

**Phase 4 Summary**:
- [ ] All remaining files completed
- [ ] Commit message: `fix: Phase 4 - Remaining components styling compliance`
- [ ] Total time: 2-3 hours

---

## Phase 5: Testing & Validation (Days 7-8)

### Dark Mode Testing

- [ ] Toggle theme on `/vendor/dashboard`
- [ ] Toggle theme on `/vendor/dashboard/profile`
- [ ] Toggle theme on `/vendor/dashboard/subscription`
- [ ] Toggle theme on `/vendor/login`
- [ ] Toggle theme on product pages
- [ ] Toggle theme on vendor profiles
- [ ] Verify all colors change appropriately
- [ ] No colors remain hard-coded

### Contrast Testing

- [ ] Open Chrome DevTools (F12)
- [ ] Go to Elements > Accessibility panel
- [ ] Check contrast ratio for key text elements
- [ ] Verify WCAG AA minimum: 4.5:1 for normal text
- [ ] Test in light mode: ✓ All pass
- [ ] Test in dark mode: ✓ All pass
- [ ] Check common areas:
  - [ ] Navigation menu
  - [ ] Form labels
  - [ ] Body text
  - [ ] Secondary text
  - [ ] Links

### Functionality Testing

- [ ] Run: `npm run type-check`
  - [ ] ✓ No TypeScript errors
- [ ] Run: `npm run lint`
  - [ ] ✓ No linting errors
- [ ] Run: `npm run test`
  - [ ] ✓ All tests pass
- [ ] Run: `npm run build`
  - [ ] ✓ Build succeeds

### Visual Regression Testing

- [ ] Take screenshots in light mode (key pages)
- [ ] Take screenshots in dark mode (same pages)
- [ ] Compare with design system
- [ ] Verify no visual regressions
- [ ] Check for any missed hard-coded colors

### Performance Testing

- [ ] Run Lighthouse audit on dashboard
- [ ] Check Accessibility score: 90+
- [ ] Check Performance impact: No regression
- [ ] Check for any new warnings

---

## Pull Request Preparation

- [ ] Create feature branch: `git checkout -b fix/styling-compliance`
- [ ] Ensure all commits are squashed or logical
- [ ] Write PR title: `fix: Complete styling compliance - replace hard-coded colors with semantic theme classes`
- [ ] Write PR description:
  ```
  ## Summary
  Comprehensive audit and remediation of styling standards violations.

  ## Changes
  - Replaced 185+ hard-coded color classes with semantic theme variables
  - Updated text colors: text-gray-* → text-foreground/text-muted-foreground
  - Updated backgrounds: bg-gray-* → bg-background/bg-muted/bg-card
  - Updated borders: border-gray-* → border-border
  - Updated accents: text-blue-* → text-accent
  - Removed manual dark: prefixes (handled by CSS variables)

  ## Testing
  - ✓ Light mode: All pages render correctly
  - ✓ Dark mode: All pages render correctly with proper contrast
  - ✓ Theme toggle: Smooth transitions between modes
  - ✓ WCAG AA: All text meets contrast standards (4.5:1)
  - ✓ TypeScript: No errors
  - ✓ ESLint: No errors
  - ✓ Tests: All passing

  ## Files Changed
  - 55+ components and pages
  - 0 new files
  - 0 removed files

  Related to: #[issue-number]
  ```
- [ ] Add checklist to PR:
  - [ ] Code follows style guide
  - [ ] Dark mode toggle tested
  - [ ] Contrast verified (WCAG AA)
  - [ ] No console warnings/errors
  - [ ] Tests passing
  - [ ] Build successful

---

## Post-Merge Actions

- [ ] Monitor production for any visual issues
- [ ] Collect user feedback on theme switching
- [ ] Consider adding ESLint rule to prevent future violations
- [ ] Update component library documentation
- [ ] Create internal documentation on theme system
- [ ] Schedule follow-up review: 1 week post-merge

---

## Troubleshooting Guide

### Issue: Text is invisible in dark mode

**Cause**: Forgot to update text color class
**Solution**: Replace with `text-foreground` or `text-muted-foreground`

### Issue: Colors don't change when toggling theme

**Cause**: Using hard-coded colors or wrong semantic class
**Solution**: Ensure using semantic classes, not manual dark: prefixes

### Issue: Build fails with TypeScript errors

**Cause**: Incomplete or invalid class names
**Solution**: Verify class names are spelled correctly in Tailwind

### Issue: Contrast ratio too low

**Cause**: Insufficient contrast in dark mode
**Solution**: Use `text-foreground` instead of lighter shade

### Issue: Can't find a specific violation

**Solution**: Search for pattern in STYLING_VIOLATIONS_INDEX.md

---

## Time Tracking

| Phase | Status | Time | Notes |
|-------|--------|------|-------|
| Setup | - | 30-45 min | Environment prep |
| Phase 1 | - | 2-3 hrs | 6 critical files |
| Phase 2 | - | 3-4 hrs | 6 profile files |
| Phase 3 | - | 4-5 hrs | 10+ component files |
| Phase 4 | - | 2-3 hrs | Remaining files |
| Phase 5 | - | 4-6 hrs | Testing & validation |
| **TOTAL** | | **15-21 hrs** | **Full remediation** |

---

## Sign-Off

- [ ] All violations identified
- [ ] All fixes implemented
- [ ] All tests passing
- [ ] Dark mode verified
- [ ] Contrast verified
- [ ] PR created and approved
- [ ] Merged to main
- [ ] Deployed to staging/production

**Developer**: ________________
**Date Completed**: ________________
**Reviewer**: ________________
**Approval Date**: ________________

---

**Good luck! Reference the documentation files if you get stuck:**
- STYLING_AUDIT_SUMMARY.txt - Overview
- STYLING_AUDIT_REPORT.md - Detailed analysis
- STYLING_FIX_EXAMPLES.md - Code examples
- STYLING_VIOLATIONS_INDEX.md - File lookup
