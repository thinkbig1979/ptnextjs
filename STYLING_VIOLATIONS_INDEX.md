# Styling Violations - Quick Reference Index

## Files Requiring Remediation (Sorted by Violation Count)

### CRITICAL - 14+ violations

```
app/(site)/vendor/dashboard/page.tsx                    | 14 violations
components/enhanced-profiles/InteractiveOrgChart.tsx    | 13 violations
app/(site)/vendor/dashboard/components/CertificationsAwardsManager.tsx | 10 violations
components/enhanced-profiles/AwardsSection.tsx          | 9 violations
app/(site)/vendor/dashboard/subscription/page.tsx       | 9 violations
app/(site)/vendor/dashboard/profile/page.tsx            | 9 violations
```

### HIGH - 8-13 violations

```
components/vendor/LocationMapPreview.tsx                | 9 violations
app/(site)/vendor/dashboard/components/ProfileEditTabs.tsx | 8 violations
components/product-comparison/VisualDemo.tsx            | 8 violations
components/ui/progressive-image.tsx                     | 8 violations
app/(site)/vendor/dashboard/components/DashboardHeader.tsx | 7 violations
components/enhanced-profiles/VideoIntroduction.tsx      | 7 violations
components/dashboard/LocationsManagerCard.tsx           | 8 violations
```

### MEDIUM - 4-7 violations

```
components/vendor/VendorNavigation.tsx                  | 6 violations
components/enhanced-profiles/CertificationBadge.tsx     | 5 violations
app/(site)/vendor/dashboard/components/DashboardSkeleton.tsx | 5 violations
components/product-comparison/IntegrationNotes.tsx      | 5 violations
components/enhanced-profiles/SocialProofMetrics.tsx     | 5 violations
app/(site)/vendor/dashboard/components/TeamMembersManager.tsx | 5 violations
components/yacht-profiles/MaintenanceHistory.tsx        | 6 violations
components/VendorLocationCard.tsx                       | 6 violations
app/(site)/vendor/login/page.tsx                        | 5 violations
components/shared/TierGate.tsx                          | 6 violations
components/LocationSearchFilter.tsx                     | 4 violations
```

### LOW - 1-3 violations

```
components/vendors/TierBadge.tsx                        | 2 violations
components/vendors/YearsInBusinessDisplay.tsx           | 1 violation
components/vendors/LocationsDisplaySection.tsx          | 2 violations
components/vendors/VendorReviews.tsx                    | 1 violation
components/product-comparison/OwnerReviews.tsx          | 4 violations
components/product-comparison/PerformanceMetrics.tsx    | 1 violation
components/vendor/VendorProfileEditor.tsx               | 3 violations
components/vendor/VendorRegistrationForm.tsx            | 4 violations
components/ui/optimized-avatar.tsx                      | 3 violations
components/ui/lazy-media.tsx                            | 3 violations
components/ui/product-comparison.tsx                    | 1 violation
components/VendorMap.tsx                                | 3 violations
components/yacht-profiles/SustainabilityScore.tsx       | 4 violations
components/yacht-profiles/YachtTimeline.tsx             | 2 violations
components/yacht-profiles/SupplierMap.tsx               | 3 violations
components/dashboard/BasicInfoForm.tsx                  | 3 violations
components/cta-section.tsx                              | 2 violations
app/(site)/vendor/registration-pending/page.tsx         | 1 violation
app/(site)/vendor/dashboard/components/BrandStoryForm.tsx | 1 violation
app/(site)/vendor/dashboard/components/DashboardError.tsx | 2 violations
app/(site)/vendor/dashboard/components/PromotionPackForm.tsx | 2 violations
app/(site)/vendor/dashboard/components/DashboardSidebar.tsx | 5 violations
app/(site)/vendor/dashboard/layout.tsx                  | 2 violations
app/(site)/yachts/[slug]/page.tsx                       | 1 violation
```

---

## Violation Categories Summary

### Text Color Violations: ~85 instances

| Pattern | Count | Replacement |
|---------|-------|-------------|
| `text-gray-*` | 60+ | `text-muted-foreground` or `text-foreground` |
| `text-blue-*` | 25+ | `text-accent` |

### Background Color Violations: ~65 instances

| Pattern | Count | Replacement |
|---------|-------|-------------|
| `bg-gray-*` | 45+ | `bg-muted` or `bg-background` |
| `bg-white` | 10+ | `bg-card` or `bg-background` |
| `bg-gray-*` in progress bars | 5+ | `bg-muted` |
| `bg-gray-*` in skeletons | 5+ | `bg-muted` |

### Border Color Violations: ~20 instances

| Pattern | Count | Replacement |
|---------|-------|-------------|
| `border-gray-*` | 15+ | `border-border` |
| `border-blue-*` | 5+ | Remove or use semantic variant |

### Badge/Status Violations: ~15 instances

| Pattern | Count | Recommendation |
|---------|-------|-----------------|
| Hard-coded badge colors | 15+ | Use shadcn badge variants |
| `bg-blue-100 text-blue-800` | 8+ | Create status badge variant |
| `bg-gray-100 text-gray-800` | 7+ | Create disabled badge variant |

---

## Quick Fix Mapping

### Text Colors

```
text-gray-300           → text-muted-foreground
text-gray-400           → text-muted-foreground
text-gray-500           → text-muted-foreground
text-gray-600           → text-muted-foreground
text-gray-700           → text-foreground
text-gray-800           → text-foreground
text-gray-900           → text-foreground

text-blue-500           → text-accent
text-blue-600           → text-accent
text-blue-700           → text-accent
text-blue-800           → text-accent
text-blue-900           → text-foreground (context-dependent)
```

### Background Colors

```
bg-gray-50              → bg-background
bg-gray-100             → bg-muted
bg-gray-200             → bg-muted
bg-gray-300             → bg-muted
bg-gray-50/dark:bg-gray-900 → bg-background
bg-white/dark:bg-slate-900 → bg-card
bg-white/dark:bg-gray-950 → bg-card
```

### Border Colors

```
border-gray-200         → border-border
border-gray-300         → border-border
border-gray-700         → border-border
border-blue-200         → Use badge variant
```

---

## Phase 1 Priority Files (Dashboard)

These files must be fixed first for dark mode to work properly:

1. **app/(site)/vendor/dashboard/page.tsx**
   - Main dashboard page
   - 14 violations affecting layout and typography
   - Estimated fix time: 45 minutes

2. **app/(site)/vendor/dashboard/components/DashboardHeader.tsx**
   - Header section
   - 7 violations affecting contrast
   - Estimated fix time: 20 minutes

3. **app/(site)/vendor/dashboard/components/DashboardSkeleton.tsx**
   - Loading state
   - 5 violations
   - Estimated fix time: 15 minutes

4. **app/(site)/vendor/dashboard/components/DashboardError.tsx**
   - Error state
   - 2 violations
   - Estimated fix time: 10 minutes

5. **app/(site)/vendor/dashboard/components/DashboardSidebar.tsx**
   - Navigation sidebar
   - 5 violations
   - Estimated fix time: 20 minutes

6. **app/(site)/vendor/login/page.tsx**
   - Login form page
   - 5 violations
   - Estimated fix time: 15 minutes

---

## Phase 2 Priority Files (Profile & Subscription)

7. **app/(site)/vendor/dashboard/profile/page.tsx**
   - 9 violations
   - Estimated fix time: 40 minutes

8. **app/(site)/vendor/dashboard/subscription/page.tsx**
   - 9 violations
   - Estimated fix time: 40 minutes

9. **app/(site)/vendor/dashboard/components/ProfileEditTabs.tsx**
   - 8 violations
   - Estimated fix time: 35 minutes

10. **app/(site)/vendor/dashboard/components/CertificationsAwardsManager.tsx**
    - 10 violations
    - Estimated fix time: 45 minutes

11. **app/(site)/vendor/dashboard/components/TeamMembersManager.tsx**
    - 5 violations
    - Estimated fix time: 20 minutes

12. **app/(site)/vendor/dashboard/components/BrandStoryForm.tsx**
    - 1 violation
    - Estimated fix time: 5 minutes

---

## Phase 3 Priority Files (Components)

13. **components/enhanced-profiles/InteractiveOrgChart.tsx**
    - 13 violations
    - Estimated fix time: 50 minutes

14. **components/enhanced-profiles/AwardsSection.tsx**
    - 9 violations
    - Estimated fix time: 35 minutes

15. **components/enhanced-profiles/VideoIntroduction.tsx**
    - 7 violations
    - Estimated fix time: 30 minutes

16. **components/enhanced-profiles/CertificationBadge.tsx**
    - 5 violations
    - Estimated fix time: 20 minutes

17. **components/enhanced-profiles/SocialProofMetrics.tsx**
    - 5 violations
    - Estimated fix time: 20 minutes

18. **components/product-comparison/VisualDemo.tsx**
    - 8 violations (some are special fullscreen cases)
    - Estimated fix time: 45 minutes

19. **components/product-comparison/IntegrationNotes.tsx**
    - 5 violations
    - Estimated fix time: 20 minutes

20. **components/product-comparison/OwnerReviews.tsx**
    - 4 violations
    - Estimated fix time: 15 minutes

21. **components/yacht-profiles/MaintenanceHistory.tsx**
    - 6 violations
    - Estimated fix time: 25 minutes

22. **components/vendor/LocationMapPreview.tsx**
    - 9 violations
    - Estimated fix time: 35 minutes

---

## Dark Mode Testing Checklist

After fixing violations, verify:

- [ ] Light mode: All colors correct, good contrast
- [ ] Dark mode: All colors correct, WCAG AA contrast maintained
- [ ] Blue text: Changed to accent color (orange), visible in both modes
- [ ] Gray text: Changed to muted-foreground, readable in both modes
- [ ] Backgrounds: Properly adapted via CSS variables
- [ ] Borders: Using border-border class
- [ ] Progress bars: Accent color for fill, muted for background
- [ ] Badges: Status badges clearly distinguished
- [ ] Links: Accent color consistent

---

## ESLint Rule Recommendation

Add a custom ESLint rule to prevent future violations:

```javascript
// .eslintrc.custom-rules.js
module.exports = {
  rules: {
    'no-hardcoded-colors': {
      meta: { docs: { description: 'Prevent hard-coded Tailwind colors' } },
      create(context) {
        return {
          JSXAttribute(node) {
            if (node.name.name !== 'className') return;

            const value = node.value?.value || '';
            const hardcodedPattern = /\b(text|bg|border)-(gray|blue|white|red|green)-\d{3}\b/;

            if (hardcodedPattern.test(value)) {
              context.report({
                node,
                message: `Hard-coded color "${value}" found. Use semantic theme classes instead.`
              });
            }
          }
        };
      }
    }
  }
};
```

---

## Total Effort Estimate

| Phase | Files | Violations | Estimated Hours |
|-------|-------|-----------|-----------------|
| Phase 1 (Critical) | 6 | 45 | 2-3 |
| Phase 2 (Profile/Sub) | 6 | 50 | 3-4 |
| Phase 3 (Components) | 10 | 65 | 4-5 |
| Phase 4 (Testing) | - | - | 4-6 |
| **TOTAL** | **22** | **185** | **13-18 hours** |

---

**Generated**: 2025-11-06
**Status**: Action Required - Comprehensive Theme System Compliance Needed
