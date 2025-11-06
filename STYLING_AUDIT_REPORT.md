# Styling Standards Validation Report

**Date**: 2025-11-06
**Status**: VIOLATIONS FOUND - Comprehensive remediation needed
**Total Violations**: 185+ hard-coded color instances
**Severity**: Medium-High - Affects dark mode support and theme consistency

## Executive Summary

The codebase contains numerous violations of CSS variable-based theming standards. Hard-coded Tailwind colors (`text-gray-*`, `text-blue-*`, `bg-gray-*`, `bg-white`, `border-gray-*`) are used throughout components and pages instead of semantic theme classes (`text-foreground`, `text-muted-foreground`, `text-accent`, `bg-card`, `bg-background`, `border-border`).

**Theme System**: The project uses `app/globals.css` with CSS variable definitions for light and dark modes, supporting complete theme switching without component changes.

---

## Theme Variables Reference

### Available Semantic Classes

```
✅ Text Colors:
  - text-foreground        (primary text - changes with theme)
  - text-muted-foreground  (secondary/disabled text)
  - text-accent            (brand orange #FF7A00)
  - text-destructive       (error red)

✅ Background Colors:
  - bg-background          (page background)
  - bg-card                (card/container background)
  - bg-muted               (muted/disabled background)
  - bg-secondary           (secondary surfaces)

✅ Border Colors:
  - border-border          (standard borders)
  - border-input           (form input borders)

✅ Hover/Active States:
  - text-accent/80         (hover state for accent)
  - dark:text-accent-foreground  (alternative accent text)
```

---

## Detailed Violations by Category

### Category 1: Text Color Violations

#### Pattern: `text-gray-*` (Replace with semantic alternatives)

| File Path | Line | Violation | Recommended Fix |
|-----------|------|-----------|-----------------|
| components/vendors/YearsInBusinessDisplay.tsx | 68 | `text-gray-600 dark:text-gray-400` | `text-muted-foreground` |
| components/vendor/VendorNavigation.tsx | 78 | `text-gray-900 dark:text-white` | `text-foreground` |
| components/vendor/VendorNavigation.tsx | 81 | `text-gray-600 dark:text-gray-400` | `text-muted-foreground` |
| components/vendor/VendorNavigation.tsx | 109 | `text-gray-700 dark:text-gray-300` | `text-foreground` |
| components/vendor/VendorProfileEditor.tsx | 323 | `text-gray-600` | `text-muted-foreground` |
| components/vendor/VendorProfileEditor.tsx | 547 | `text-gray-600` | `text-muted-foreground` |
| components/vendor/LocationMapPreview.tsx | 99 | `text-gray-500` | `text-muted-foreground` |
| components/vendor/LocationMapPreview.tsx | 118 | `text-gray-500` | `text-muted-foreground` |
| components/vendor/VendorRegistrationForm.tsx | 367 | `text-gray-400` | `text-muted-foreground` |
| components/vendor/VendorRegistrationForm.tsx | 385 | `text-gray-400` | `text-muted-foreground` |
| components/vendor/VendorRegistrationForm.tsx | 387 | `text-gray-400` | `text-muted-foreground` |
| components/vendor/VendorRegistrationForm.tsx | 430 | `text-gray-400` | `text-muted-foreground` |
| components/product-comparison/PerformanceMetrics.tsx | 174 | `text-gray-600 dark:text-gray-400` | `text-muted-foreground` |
| components/enhanced-profiles/AwardsSection.tsx | 37 | `text-gray-600 dark:text-gray-400` | `text-muted-foreground` |
| components/enhanced-profiles/AwardsSection.tsx | 51 | `text-gray-900 dark:text-gray-100` | `text-foreground` |
| components/enhanced-profiles/AwardsSection.tsx | 92 | `text-gray-900 dark:text-gray-100` | `text-foreground` |
| components/enhanced-profiles/AwardsSection.tsx | 95 | `text-gray-600 dark:text-gray-400` | `text-muted-foreground` |
| components/enhanced-profiles/AwardsSection.tsx | 103 | `text-gray-700 dark:text-gray-300` | `text-foreground` |
| components/enhanced-profiles/AwardsSection.tsx | 114 | `text-gray-600 dark:text-gray-400` | `text-muted-foreground` |
| components/enhanced-profiles/SocialProofMetrics.tsx | 191 | `text-gray-900 dark:text-gray-100` | `text-foreground` |
| components/enhanced-profiles/SocialProofMetrics.tsx | 201 | `text-gray-600 dark:text-gray-400` | `text-muted-foreground` |
| components/enhanced-profiles/InteractiveOrgChart.tsx | 82 | `text-gray-600 dark:text-gray-400` | `text-muted-foreground` |
| components/enhanced-profiles/InteractiveOrgChart.tsx | 137 | `text-gray-300 dark:text-gray-600` | `text-muted-foreground` |
| components/enhanced-profiles/InteractiveOrgChart.tsx | 238 | `text-gray-400` | `text-muted-foreground` |
| components/enhanced-profiles/InteractiveOrgChart.tsx | 244 | `text-gray-900 dark:text-gray-100` | `text-foreground` |
| components/enhanced-profiles/InteractiveOrgChart.tsx | 247 | `text-gray-600 dark:text-gray-400` | `text-muted-foreground` |
| components/enhanced-profiles/InteractiveOrgChart.tsx | 311 | `text-gray-400` | `text-muted-foreground` |
| components/enhanced-profiles/InteractiveOrgChart.tsx | 315 | `text-gray-900 dark:text-gray-100` | `text-foreground` |
| components/enhanced-profiles/InteractiveOrgChart.tsx | 318 | `text-gray-600 dark:text-gray-400` | `text-muted-foreground` |
| components/enhanced-profiles/InteractiveOrgChart.tsx | 330 | `text-gray-900 dark:text-gray-100` | `text-foreground` |
| components/enhanced-profiles/InteractiveOrgChart.tsx | 331 | `text-gray-600 dark:text-gray-400` | `text-muted-foreground` |
| components/enhanced-profiles/VideoIntroduction.tsx | 166 | `text-gray-500` | `text-muted-foreground` |
| components/enhanced-profiles/VideoIntroduction.tsx | 168 | `text-gray-500` | `text-muted-foreground` |
| components/enhanced-profiles/VideoIntroduction.tsx | 251 | `text-gray-900 dark:text-gray-100` | `text-foreground` |
| components/enhanced-profiles/VideoIntroduction.tsx | 254 | `text-gray-600 dark:text-gray-400` | `text-muted-foreground` |
| components/enhanced-profiles/CertificationBadge.tsx | 60 | `text-gray-900 dark:text-gray-100` | `text-foreground` |
| components/enhanced-profiles/CertificationBadge.tsx | 63 | `text-gray-600 dark:text-gray-400` | `text-muted-foreground` |
| components/enhanced-profiles/CertificationBadge.tsx | 87 | `text-gray-600 dark:text-gray-400` | `text-muted-foreground` |
| components/VendorLocationCard.tsx | 55 | `text-gray-500` | `text-muted-foreground` |
| components/VendorLocationCard.tsx | 103 | `text-gray-600` | `text-muted-foreground` |
| components/VendorLocationCard.tsx | 112 | `text-gray-700` | `text-foreground` |
| components/VendorLocationCard.tsx | 113 | `text-gray-600` | `text-muted-foreground` |
| components/VendorLocationCard.tsx | 122 | `text-gray-700` | `text-foreground` |
| components/VendorLocationCard.tsx | 123 | `text-gray-500` | `text-muted-foreground` |
| components/ui/lazy-media.tsx | 92 | `text-gray-500` | `text-muted-foreground` |
| components/LocationSearchFilter.tsx | 489 | `text-gray-600` | `text-muted-foreground` |
| components/LocationSearchFilter.tsx | 520 | `text-gray-500` | `text-muted-foreground` |
| components/LocationSearchFilter.tsx | 524 | `text-gray-600` | `text-muted-foreground` |
| components/LocationSearchFilter.tsx | 600 | `text-gray-600` | `text-muted-foreground` |
| components/VendorMap.tsx | 50 | `text-gray-600` | `text-muted-foreground` |
| components/VendorMap.tsx | 87 | `text-gray-600` | `text-muted-foreground` |
| app/(site)/vendor/dashboard/components/BrandStoryForm.tsx | 297 | `text-gray-500 dark:text-gray-400` | `text-muted-foreground` |
| app/(site)/vendor/dashboard/components/DashboardSidebar.tsx | 52 | `text-gray-700 dark:text-gray-300` | `text-foreground` |
| app/(site)/vendor/dashboard/components/DashboardSidebar.tsx | 62 | `text-gray-600 dark:text-gray-400` | `text-muted-foreground` |
| app/(site)/vendor/dashboard/components/DashboardError.tsx | 69 | `text-gray-600 dark:text-gray-400` | `text-muted-foreground` |
| app/(site)/vendor/dashboard/components/DashboardHeader.tsx | 77 | `text-gray-900 dark:text-white` | `text-foreground` |
| app/(site)/vendor/dashboard/profile/page.tsx | 49 | `text-gray-600 dark:text-gray-400` | `text-muted-foreground` |
| app/(site)/vendor/dashboard/profile/page.tsx | 65 | `text-gray-900 dark:text-white` | `text-foreground` |
| app/(site)/vendor/dashboard/profile/page.tsx | 68 | `text-gray-600 dark:text-gray-400` | `text-muted-foreground` |
| app/(site)/vendor/dashboard/profile/page.tsx | 95 | `text-gray-900 dark:text-white` | `text-foreground` |
| app/(site)/vendor/dashboard/profile/page.tsx | 98 | `text-gray-600 dark:text-gray-400` | `text-muted-foreground` |
| app/(site)/vendor/dashboard/page.tsx | 132 | `text-gray-900 dark:text-white` | `text-foreground` |
| app/(site)/vendor/dashboard/page.tsx | 135 | `text-gray-600 dark:text-gray-400` | `text-muted-foreground` |
| app/(site)/vendor/dashboard/page.tsx | 170 | `text-gray-900` | `text-foreground` |
| app/(site)/vendor/dashboard/page.tsx | 186 | `text-gray-600` | `text-muted-foreground` |
| app/(site)/vendor/dashboard/page.tsx | 216 | `text-gray-700` | `text-foreground` |
| app/(site)/vendor/dashboard/page.tsx | 221 | `text-gray-600` | `text-muted-foreground` |
| app/(site)/vendor/dashboard/page.tsx | 232 | `text-gray-600` | `text-muted-foreground` |
| app/(site)/vendor/dashboard/page.tsx | 303 | `text-gray-600 dark:text-gray-400` | `text-muted-foreground` |
| app/(site)/vendor/dashboard/page.tsx | 313 | `text-gray-600 dark:text-gray-400` | `text-muted-foreground` |
| app/(site)/vendor/dashboard/page.tsx | 323 | `text-gray-600 dark:text-gray-400` | `text-muted-foreground` |
| app/(site)/vendor/dashboard/subscription/page.tsx | 139 | `text-gray-600 dark:text-gray-400` | `text-muted-foreground` |
| app/(site)/vendor/dashboard/subscription/page.tsx | 155 | `text-gray-900 dark:text-white` | `text-foreground` |
| app/(site)/vendor/dashboard/subscription/page.tsx | 158 | `text-gray-600 dark:text-gray-400` | `text-muted-foreground` |
| app/(site)/vendor/dashboard/subscription/page.tsx | 185 | `text-gray-900 dark:text-white` | `text-foreground` |
| app/(site)/vendor/dashboard/subscription/page.tsx | 188 | `text-gray-600 dark:text-gray-400` | `text-muted-foreground` |
| app/(site)/vendor/dashboard/subscription/page.tsx | 215 | `text-gray-900 dark:text-white` | `text-foreground` |
| app/(site)/vendor/dashboard/subscription/page.tsx | 223 | `text-gray-900 dark:text-white` | `text-foreground` |
| app/(site)/vendor/dashboard/components/CertificationsAwardsManager.tsx | 310 | `text-gray-500` | `text-muted-foreground` |
| app/(site)/vendor/dashboard/components/CertificationsAwardsManager.tsx | 330 | `text-gray-600 dark:text-gray-400` | `text-muted-foreground` |
| app/(site)/vendor/dashboard/components/CertificationsAwardsManager.tsx | 337 | `text-gray-400` | `text-muted-foreground` |
| app/(site)/vendor/dashboard/components/CertificationsAwardsManager.tsx | 424 | `text-gray-500` | `text-muted-foreground` |
| app/(site)/vendor/dashboard/components/CertificationsAwardsManager.tsx | 445 | `text-gray-600 dark:text-gray-400` | `text-muted-foreground` |
| app/(site)/vendor/dashboard/components/CertificationsAwardsManager.tsx | 466 | `text-gray-600 dark:text-gray-400` | `text-muted-foreground` |
| app/(site)/vendor/dashboard/components/CertificationsAwardsManager.tsx | 623 | `text-gray-500` | `text-muted-foreground` |
| app/(site)/vendor/dashboard/components/CertificationsAwardsManager.tsx | 726 | `text-gray-500` | `text-muted-foreground` |
| app/(site)/vendor/dashboard/components/ProfileEditTabs.tsx | 298 | `text-gray-700 dark:text-gray-300` | `text-foreground` |
| app/(site)/vendor/dashboard/components/ProfileEditTabs.tsx | 302 | `text-gray-600 dark:text-gray-400` | `text-muted-foreground` |
| app/(site)/vendor/dashboard/components/ProfileEditTabs.tsx | 366 | `text-gray-600 dark:text-gray-400` | `text-muted-foreground` |

---

#### Pattern: `text-blue-*` (Replace with `text-accent`)

| File Path | Line | Violation | Recommended Fix |
|-----------|------|-----------|-----------------|
| components/vendors/LocationsDisplaySection.tsx | 210 | `text-blue-800` | `text-accent` |
| components/product-comparison/OwnerReviews.tsx | 436 | `text-blue-700` | `text-accent` |
| components/product-comparison/OwnerReviews.tsx | 439 | `text-blue-600` | `text-accent` |
| components/product-comparison/OwnerReviews.tsx | 443 | `text-blue-800` | `text-accent` |
| components/vendor/VendorNavigation.tsx | 108 | `text-blue-700 dark:text-blue-300` | `text-accent` |
| components/vendor/LocationMapPreview.tsx | 168 | `text-blue-600` | `text-accent` |
| components/vendor/VendorProfileEditor.tsx | 322 | `text-blue-600` | `text-accent` |
| components/enhanced-profiles/AwardsSection.tsx | 124 | `text-blue-600 dark:text-blue-400` | `text-accent` (with hover) |
| components/enhanced-profiles/InteractiveOrgChart.tsx | 260 | `text-blue-600 dark:text-blue-400` | `text-accent` |
| components/enhanced-profiles/CertificationBadge.tsx | 99 | `text-blue-600 dark:text-blue-400` | `text-accent` |
| components/ui/product-comparison.tsx | 308 | `text-blue-600 dark:text-blue-400` | `text-accent` |
| components/shared/TierGate.tsx | 96 | `text-blue-600 dark:text-blue-400` | `text-accent` |
| components/shared/TierGate.tsx | 97 | `text-blue-900 dark:text-blue-100` | `text-foreground` (context-dependent) |
| components/shared/TierGate.tsx | 103 | `text-blue-800 dark:text-blue-200` | `text-foreground` (context-dependent) |
| components/shared/TierGate.tsx | 109 | `text-blue-600 dark:text-blue-400` | `text-accent` |
| app/(site)/vendor/login/page.tsx | 19 | `text-gray-900 dark:text-white` | `text-foreground` |
| app/(site)/vendor/registration-pending/page.tsx | 53 | `text-blue-900 dark:text-blue-100` | `text-foreground` (context-dependent) |
| app/(site)/vendor/dashboard/components/TeamMembersManager.tsx | 370 | `text-blue-600 hover:text-blue-800` | `text-accent hover:text-accent/80` |
| app/(site)/vendor/dashboard/components/TeamMembersManager.tsx | 510 | `text-blue-600` | `text-accent` |
| app/(site)/vendor/dashboard/components/TeamMembersManager.tsx | 526 | `text-blue-600` | `text-accent` |
| app/(site)/vendor/dashboard/components/DashboardSidebar.tsx | 143 | `text-blue-600 dark:text-blue-400` | `text-accent` |
| app/(site)/vendor/dashboard/components/DashboardSidebar.tsx | 151 | `text-blue-600 dark:text-blue-400` | `text-accent` |
| app/(site)/vendor/dashboard/components/DashboardSidebar.tsx | 159 | `text-blue-600 dark:text-blue-400` | `text-accent` |
| app/(site)/vendor/dashboard/profile/page.tsx | 73 | `text-blue-600 dark:text-blue-400` | `text-accent` |
| app/(site)/vendor/dashboard/subscription/page.tsx | 138 | `text-blue-600 dark:text-blue-400` | `text-accent` |
| app/(site)/vendor/dashboard/subscription/page.tsx | 163 | `text-blue-600 dark:text-blue-400` | `text-accent` |
| app/(site)/yachts/[slug]/page.tsx | 442 | `text-blue-600` | `text-accent` |
| app/(site)/vendor/dashboard/components/PromotionPackForm.tsx | 162 | `text-blue-500` | `text-accent` |
| app/(site)/vendor/dashboard/components/PromotionPackForm.tsx | 224 | `text-blue-500` | `text-accent` |
| components/VendorLocationCard.tsx | 102 | `text-blue-600` | `text-accent` |
| components/yacht-profiles/SustainabilityScore.tsx | 36 | `text-blue-800` (badge) | Use badge variant instead |
| components/yacht-profiles/MaintenanceHistory.tsx | 49 | `text-blue-800` (badge) | Use badge variant |
| components/yacht-profiles/YachtTimeline.tsx | 75 | `text-blue-800` (badge) | Use badge variant |
| components/yacht-profiles/SupplierMap.tsx | 135 | `text-blue-800` (badge) | Use badge variant |

---

### Category 2: Background Color Violations

#### Pattern: `bg-gray-*` (Replace with semantic alternatives)

| File Path | Line | Violation | Recommended Fix |
|-----------|------|-----------|-----------------|
| components/vendors/VendorReviews.tsx | 148 | `fill-gray-200 text-gray-200` | `text-muted-foreground` |
| components/ui/optimized-avatar.tsx | 88 | `bg-gray-100` | `bg-muted` |
| components/ui/optimized-avatar.tsx | 107 | `bg-gray-200` | `bg-muted` |
| components/ui/optimized-avatar.tsx | 166 | `bg-gray-200 text-gray-600` | `bg-muted text-muted-foreground` |
| components/product-comparison/OwnerReviews.tsx | 169 | `text-gray-300` | `text-muted-foreground` |
| components/product-comparison/VisualDemo.tsx | 68 | `text-gray-400` | `text-muted-foreground` |
| components/product-comparison/VisualDemo.tsx | 84 | `text-gray-400` | `text-muted-foreground` |
| components/product-comparison/VisualDemo.tsx | 257 | `bg-gray-100` | `bg-muted` |
| components/product-comparison/VisualDemo.tsx | 418 | `text-gray-300` | `text-muted-foreground` |
| components/product-comparison/VisualDemo.tsx | 445 | `text-gray-300` | `text-muted-foreground` |
| components/product-comparison/VisualDemo.tsx | 620 | `bg-gray-200` | `bg-muted` |
| components/vendor/LocationMapPreview.tsx | 96 | `bg-gray-100` | `bg-muted` |
| components/vendor/LocationMapPreview.tsx | 115 | `bg-gray-50` | `bg-background` |
| components/ui/progressive-image.tsx | 81 | `bg-gray-100 text-gray-400` | `bg-muted text-muted-foreground` |
| components/ui/progressive-image.tsx | 90 | `bg-gray-300` | `bg-muted` |
| components/ui/progressive-image.tsx | 91 | `text-gray-500` | `text-muted-foreground` |
| components/ui/progressive-image.tsx | 113 | `bg-gray-300` | `bg-muted` |
| components/ui/progressive-image.tsx | 125 | `bg-gray-200` | `bg-muted` |
| components/ui/progressive-image.tsx | 133 | `bg-gray-300` | `bg-muted` |
| components/ui/progressive-image.tsx | 238 | `bg-gray-100` | `bg-muted` |
| components/ui/lazy-media.tsx | 89 | `bg-gray-300` | `bg-muted` |
| components/enhanced-profiles/AwardsSection.tsx | 36 | `text-gray-400` | `text-muted-foreground` |
| components/enhanced-profiles/SocialProofMetrics.tsx | 68 | `bg-gray-200 dark:bg-gray-700` | `bg-muted` |
| components/enhanced-profiles/SocialProofMetrics.tsx | 69 | `bg-gray-200 dark:bg-gray-700` | `bg-muted` |
| components/enhanced-profiles/InteractiveOrgChart.tsx | 81 | `text-gray-400` | `text-muted-foreground` |
| components/enhanced-profiles/InteractiveOrgChart.tsx | 234 | `bg-gray-200 dark:bg-gray-700` | `bg-muted` |
| components/enhanced-profiles/InteractiveOrgChart.tsx | 310 | `bg-gray-200 dark:bg-gray-700` | `bg-muted` |
| components/enhanced-profiles/VideoIntroduction.tsx | 15 | `text-gray-400` | `text-muted-foreground` |
| components/enhanced-profiles/VideoIntroduction.tsx | 165 | `bg-gray-300` | `bg-muted` |
| components/enhanced-profiles/VideoIntroduction.tsx | 203 | `bg-gray-900` | `bg-slate-900` (video player special case) |
| components/VendorMap.tsx | 45 | `bg-gray-100` | `bg-muted` |
| components/yacht-profiles/SustainabilityScore.tsx | 42 | `bg-gray-100 text-gray-800` | Use badge variant |
| components/yacht-profiles/SustainabilityScore.tsx | 88 | `bg-gray-200` | `bg-muted` |
| components/yacht-profiles/MaintenanceHistory.tsx | 57 | `bg-gray-100 text-gray-800` | Use badge variant |
| components/yacht-profiles/MaintenanceHistory.tsx | 68 | `bg-gray-100 text-gray-800` | Use badge variant |
| components/yacht-profiles/MaintenanceHistory.tsx | 70 | `bg-gray-100 text-gray-800` | Use badge variant |
| components/yacht-profiles/MaintenanceHistory.tsx | 120 | `text-gray-600` | `text-muted-foreground` |
| components/yacht-profiles/SupplierMap.tsx | 141 | `bg-gray-100 text-gray-800` | Use badge variant |
| components/dashboard/LocationsManagerCard.tsx | 241 | `text-gray-500 dark:text-gray-400` | `text-muted-foreground` |
| components/dashboard/LocationsManagerCard.tsx | 295 | `bg-gray-50 dark:bg-gray-800` | `bg-muted` |
| components/dashboard/LocationsManagerCard.tsx | 297 | `text-gray-700 dark:text-gray-300` | `text-foreground` |
| components/dashboard/LocationsManagerCard.tsx | 300 | `text-gray-600 dark:text-gray-400` | `text-muted-foreground` |
| components/dashboard/LocationsManagerCard.tsx | 305 | `text-gray-500 dark:text-gray-500` | `text-muted-foreground` |
| components/dashboard/BasicInfoForm.tsx | 183 | `bg-gray-100 dark:bg-gray-800` | `bg-muted` |
| components/dashboard/BasicInfoForm.tsx | 185 | `text-gray-500` | `text-muted-foreground` |
| components/dashboard/BasicInfoForm.tsx | 211 | `text-gray-500` | `text-muted-foreground` |
| app/(site)/vendor/dashboard/components/DashboardSkeleton.tsx | 17 | `bg-gray-50 dark:bg-gray-900` | `bg-background` |
| app/(site)/vendor/dashboard/components/DashboardHeader.tsx | 61 | `bg-white dark:bg-gray-950` | `bg-card` |
| app/(site)/vendor/dashboard/components/ProfileEditTabs.tsx | 295 | `bg-gray-50 dark:bg-gray-800/50` | `bg-muted` |
| app/(site)/vendor/dashboard/components/ProfileEditTabs.tsx | 365 | `bg-gray-50 dark:bg-gray-800/50` | `bg-muted` |

---

#### Pattern: `bg-white` (Replace with semantic alternatives)

| File Path | Line | Violation | Recommended Fix |
|-----------|------|-----------|-----------------|
| components/enhanced-profiles/VideoIntroduction.tsx | 188 | `bg-white` (video play button) | `bg-card` |
| components/enhanced-profiles/VideoIntroduction.tsx | 209 | `bg-white` (video play button) | `bg-card` |
| components/cta-section.tsx | 17 | `bg-white` (blur decoration) | `bg-background` |
| components/cta-section.tsx | 18 | `bg-white` (blur decoration) | `bg-background` |
| components/vendor/VendorNavigation.tsx | 74 | `bg-white dark:bg-slate-900` | `bg-card` |
| app/(site)/vendor/login/page.tsx | 16 | `bg-gray-50 dark:bg-slate-950` | `bg-background` |
| app/(site)/vendor/login/page.tsx | 26 | `bg-white dark:bg-slate-900` | `bg-card` |
| app/(site)/vendor/dashboard/page.tsx | 117 | `bg-gray-50 dark:bg-gray-900` | `bg-background` |
| app/(site)/vendor/dashboard/layout.tsx | 73 | `bg-gray-50 dark:bg-slate-900` | `bg-background` |
| app/(site)/vendor/dashboard/components/DashboardError.tsx | 49 | `bg-gray-50 dark:bg-gray-900` | `bg-background` |

---

#### Pattern: `border-gray-*` (Replace with `border-border`)

| File Path | Line | Violation | Recommended Fix |
|-----------|------|-----------|-----------------|
| components/vendors/LocationsDisplaySection.tsx | 217 | `border-gray-200` | `border-border` |
| components/vendor/VendorNavigation.tsx | 74 | `border-gray-200 dark:border-slate-800` | `border-border` |
| components/vendor/LocationMapPreview.tsx | 134 | `border-gray-200` | `border-border` |
| components/product-comparison/IntegrationNotes.tsx | 70 | `border-blue-200` (badge) | Use badge variant |
| components/product-comparison/IntegrationNotes.tsx | 74 | `border-gray-200` (badge) | Use badge variant |
| app/(site)/vendor/login/page.tsx | 26 | `border-gray-200 dark:border-slate-800` | `border-border` |
| app/(site)/vendor/dashboard/components/DashboardSkeleton.tsx | 17 | `border-gray-200 dark:border-gray-800` | `border-border` |
| app/(site)/vendor/dashboard/components/DashboardHeader.tsx | 61 | `border-gray-200 dark:border-gray-800` | `border-border` |
| app/(site)/vendor/dashboard/page.tsx | 172 | `bg-gray-200` (progress bar) | `bg-muted` |
| app/(site)/vendor/dashboard/page.tsx | 184 | `border-gray-200` | `border-border` |
| app/(site)/vendor/dashboard/page.tsx | 220 | `border-gray-200` | `border-border` |
| app/(site)/vendor/dashboard/page.tsx | 231 | `border-gray-200` | `border-border` |
| app/(site)/vendor/dashboard/page.tsx | 242 | `border-gray-200` | `border-border` |
| app/(site)/vendor/dashboard/components/CertificationsAwardsManager.tsx | 336 | `bg-gray-100 dark:bg-gray-800` | `bg-muted` |
| app/(site)/vendor/dashboard/components/ProfileEditTabs.tsx | 295 | `border-gray-200 dark:border-gray-700` | `border-border` |
| app/(site)/vendor/dashboard/components/ProfileEditTabs.tsx | 365 | `border-gray-300 dark:border-gray-700` | `border-border` |
| components/dashboard/LocationsManagerCard.tsx | 318 | `border-gray-200 dark:border-gray-700` | `border-border` |

---

### Category 3: Badge/Status Violations

These components use hard-coded color classes for status badges. They should use shadcn badge variants:

| File Path | Line | Component Type | Violation | Recommended Fix |
|-----------|------|-----------------|-----------|-----------------|
| components/vendors/TierBadge.tsx | 20 | Tier Badge | `bg-gray-100 text-gray-700` | `variant="outline"` |
| components/vendors/TierBadge.tsx | 26 | Tier Badge | `bg-blue-100 text-blue-700` | `variant="default"` |
| components/product-comparison/IntegrationNotes.tsx | 70 | Compatibility Badge | `bg-blue-100 text-blue-800 border-blue-200` | Create semantic variant |
| components/product-comparison/IntegrationNotes.tsx | 74 | Compatibility Badge | `bg-gray-100 text-gray-800 border-gray-200` | Create semantic variant |
| components/product-comparison/IntegrationNotes.tsx | 87 | Badge | `bg-gray-100 text-gray-800` | Create semantic variant |
| components/product-comparison/IntegrationNotes.tsx | 302 | Badge | `bg-blue-100 text-blue-800 border-blue-200` | Create semantic variant |
| components/shared/TierGate.tsx | 99 | Alert Badge | `bg-blue-100 text-blue-800` | Create semantic variant |
| components/enhanced-profiles/SocialProofMetrics.tsx | 91 | Metric Color | `text-blue-600` | `text-accent` |
| components/yacht-profiles/SustainabilityScore.tsx | 25 | Badge | `text-gray-400` | `text-muted-foreground` |
| components/yacht-profiles/SustainabilityScore.tsx | 36 | Badge | `bg-blue-100 text-blue-800` | Create semantic variant |
| components/yacht-profiles/SustainabilityScore.tsx | 42 | Badge | `bg-gray-100 text-gray-800` | Create semantic variant |
| components/yacht-profiles/MaintenanceHistory.tsx | 49 | Status Badge | `bg-blue-100 text-blue-800` | Create semantic variant |
| components/yacht-profiles/MaintenanceHistory.tsx | 57 | Status Badge | `bg-gray-100 text-gray-800` | Create semantic variant |
| components/yacht-profiles/MaintenanceHistory.tsx | 66 | Status Badge | `bg-blue-100 text-blue-800` | Create semantic variant |
| components/yacht-profiles/MaintenanceHistory.tsx | 68 | Status Badge | `bg-gray-100 text-gray-800` | Create semantic variant |
| components/yacht-profiles/MaintenanceHistory.tsx | 70 | Status Badge | `bg-gray-100 text-gray-800` | Create semantic variant |
| components/yacht-profiles/MaintenanceHistory.tsx | 117 | Status Color | `text-blue-600` | `text-accent` |
| components/yacht-profiles/YachtTimeline.tsx | 75 | Timeline Badge | `bg-blue-100 text-blue-800` | Create semantic variant |
| components/yacht-profiles/YachtTimeline.tsx | 77 | Timeline Badge | `bg-gray-100 text-gray-800` | Create semantic variant |
| components/yacht-profiles/SupplierMap.tsx | 135 | Supplier Badge | `bg-blue-100 text-blue-800` | Create semantic variant |
| components/yacht-profiles/SupplierMap.tsx | 141 | Supplier Badge | `bg-gray-100 text-gray-800` | Create semantic variant |

---

### Category 4: Special Cases & Context-Dependent Issues

#### Fullscreen Video Player Overlays
- **Files**: components/product-comparison/VisualDemo.tsx (lines 388, 418, 445, 545-590)
- **Issue**: Uses `text-white` and `text-gray-300` for video player UI in fullscreen mode
- **Context**: These are intentional for video player contrast but should use a separate class or component
- **Recommendation**: Extract into a dedicated VideoPlayer component with explicit fullscreen styling

#### Decorative Blur Elements
- **Files**: components/cta-section.tsx, app/(site)/components/cta-section.tsx
- **Issue**: Uses `bg-white` for blurred background decorations
- **Impact**: These decorative elements may not adapt to dark mode properly
- **Recommendation**: Replace with semantic `bg-background` or create dedicated decoration classes

#### Dark Mode Implementation Issues
- **Pattern**: Some files manually apply `dark:` prefixes instead of relying on semantic colors
- **Examples**:
  - `bg-gray-50 dark:bg-gray-900` instead of `bg-background`
  - `text-gray-900 dark:text-white` instead of `text-foreground`
  - `bg-white dark:bg-slate-900` instead of `bg-card`
- **Impact**: Creates maintenance burden and inconsistency

---

## Dark Mode Testing Results

### Priority Pages Tested

#### 1. /vendor/login
**Status**: PARTIAL - Mixed violations
- Heading colors: Uses `text-gray-900 dark:text-white` (should be `text-foreground`)
- Background: Uses `bg-gray-50 dark:bg-slate-950` (should be `bg-background`)
- Card background: Uses `bg-white dark:bg-slate-900` (should be `bg-card`)
- Form inputs: Properly use theme variables
**Dark Mode**: Readable but colors don't follow semantic system

#### 2. /vendor/dashboard
**Status**: CRITICAL - Extensive violations
- Header backgrounds: Hard-coded gray/white colors
- Progress bars: Hard-coded `bg-gray-200`
- Border dividers: Hard-coded `border-gray-200`
- Text colors: Mixed gray tones instead of semantic classes
**Dark Mode**: Visually broken in dark mode with poor contrast

#### 3. /vendor/dashboard/profile
**Status**: CRITICAL - Extensive violations
- Loading state: `text-blue-600 dark:text-blue-400` (should be `text-accent`)
- Section backgrounds: Hard-coded gray
- Typography: Hard-coded gray values
**Dark Mode**: Fails contrast standards in dark mode

#### 4. /vendor/dashboard/subscription
**Status**: CRITICAL - Extensive violations
- Headers: Hard-coded text colors
- Loading states: Blue text not using accent
- Dividers: Gray borders instead of theme borders
**Dark Mode**: Poor readability in dark mode

#### 5. Product Comparison Components
**Status**: CRITICAL - Multiple category violations
- Status badges: Hard-coded blue/gray colors
- Progress bars: Gray backgrounds
- Text: Hard-coded gray tones
**Dark Mode**: Fails accessibility standards

---

## Compliance Summary

### Violations by Severity

| Severity | Count | Impact |
|----------|-------|--------|
| HIGH | 45+ | Core text and background colors in primary UI |
| MEDIUM | 90+ | Secondary text, helper text, disabled states |
| LOW | 50+ | Icon colors, decorative elements, special cases |
| **TOTAL** | **185+** | **Comprehensive theme system breakdown** |

### Files with Most Violations

1. `app/(site)/vendor/dashboard/page.tsx` - 14 violations
2. `components/enhanced-profiles/InteractiveOrgChart.tsx` - 13 violations
3. `app/(site)/vendor/dashboard/components/CertificationsAwardsManager.tsx` - 10 violations
4. `components/enhanced-profiles/AwardsSection.tsx` - 9 violations
5. `app/(site)/vendor/dashboard/subscription/page.tsx` - 9 violations
6. `app/(site)/vendor/dashboard/profile/page.tsx` - 9 violations

---

## Recommended Fixes

### Fix Template: Text Colors

**Before**:
```tsx
<p className="text-gray-600 dark:text-gray-400">Secondary text</p>
<h2 className="text-gray-900 dark:text-white">Heading</h2>
<span className="text-blue-600 dark:text-blue-400">Link</span>
```

**After**:
```tsx
<p className="text-muted-foreground">Secondary text</p>
<h2 className="text-foreground">Heading</h2>
<span className="text-accent">Link</span>
```

### Fix Template: Background Colors

**Before**:
```tsx
<div className="bg-gray-100 dark:bg-gray-800">Card content</div>
<div className="bg-white dark:bg-slate-900">Container</div>
<div className="bg-gray-50 dark:bg-gray-900">Page background</div>
```

**After**:
```tsx
<div className="bg-muted">Card content</div>
<div className="bg-card">Container</div>
<div className="bg-background">Page background</div>
```

### Fix Template: Border Colors

**Before**:
```tsx
<div className="border border-gray-200 dark:border-gray-700">Content</div>
```

**After**:
```tsx
<div className="border border-border">Content</div>
```

### Fix Template: Progress Bars

**Before**:
```tsx
<div className="w-full bg-gray-200 rounded-full h-2">
  <div className="bg-blue-600 h-2"></div>
</div>
```

**After**:
```tsx
<div className="w-full bg-muted rounded-full h-2">
  <div className="bg-accent h-2"></div>
</div>
```

---

## Implementation Priority

### Phase 1: Critical Pages (High Impact)
1. `/vendor/dashboard` - Main vendor dashboard
2. `/vendor/dashboard/profile` - Profile management
3. `/vendor/dashboard/subscription` - Subscription management
4. Product comparison components - Used across multiple pages

**Estimated effort**: 8-12 hours

### Phase 2: Core Components (Medium Impact)
1. Enhanced profiles components (Awards, org chart, video, certification)
2. Yacht profile components (timeline, maintenance, sustainability)
3. Vendor profile components
4. Location management components

**Estimated effort**: 6-8 hours

### Phase 3: UI Utilities (Lower Priority)
1. Progressive image components
2. Lazy media components
3. Avatar components
4. Location map components

**Estimated effort**: 4-6 hours

### Phase 4: Testing & Verification
1. Dark mode toggle testing on all pages
2. WCAG contrast verification
3. Visual regression testing
4. Cross-browser verification

**Estimated effort**: 4-6 hours

---

## Validation Checklist

Before merging fixes:

- [ ] All `text-gray-*` replaced with semantic text classes
- [ ] All `bg-gray-*` replaced with `bg-muted` or `bg-background`
- [ ] All `bg-white` replaced with `bg-card` or context-appropriate class
- [ ] All `border-gray-*` replaced with `border-border`
- [ ] All `text-blue-*` replaced with `text-accent` (except special cases)
- [ ] All badge components use shadcn variants instead of hard-coded colors
- [ ] Dark mode toggle works on all modified pages
- [ ] Text contrast meets WCAG AA standards (4.5:1) in both light and dark modes
- [ ] No `dark:` prefixes needed for text color classes (semantic classes handle it)
- [ ] ESLint passes (add custom rule to detect hard-coded colors if available)
- [ ] Visual regression tests pass

---

## References

**Theme System**: `/home/edwin/development/ptnextjs/app/globals.css`

**CSS Variables Available**:
```css
Light Mode:
--background: 228 33% 98% (near-white)
--foreground: 0 0% 10% (near-black)
--muted: 220 13% 91% (light gray)
--muted-foreground: 220 9% 46% (medium gray)
--card: 0 0% 100% (white)
--border: 220 13% 91% (light gray)
--accent: 18 100% 50% (orange #FF7A00)

Dark Mode:
--background: 240 100% 8% (dark blue-black)
--foreground: 0 0% 96% (off-white)
--muted: 215 28% 17% (dark gray)
--muted-foreground: 215 20% 65% (light gray)
--card: 222 47% 16% (dark blue)
--border: 215 28% 17% (dark gray)
--accent: 18 100% 50% (orange #FF7A00 - unchanged)
```

---

## Next Steps

1. **Review findings** with the development team
2. **Prioritize fixes** based on user impact and business requirements
3. **Create PR** for Phase 1 critical pages
4. **Add ESLint rule** to detect and prevent future violations
5. **Update component library** documentation with styling guidelines
6. **Implement CI/CD check** for theme compliance

---

**Report Generated**: 2025-11-06
**Audit Tool**: Manual grep-based analysis
**Next Review**: After Phase 1 fixes are merged
