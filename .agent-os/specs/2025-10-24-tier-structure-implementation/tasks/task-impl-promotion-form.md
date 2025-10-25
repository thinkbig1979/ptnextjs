# Task IMPL-PROMOTION-FORM: Implement PromotionPackForm Component

**ID**: impl-promotion-form
**Title**: Implement PromotionPackForm for Tier 3 promotional features
**Agent**: frontend-react-specialist
**Estimated Time**: 1 hour
**Dependencies**: impl-team-manager
**Phase**: 3 - Frontend Implementation

## Context Requirements

Read: @.agent-os/specs/2025-10-24-tier-structure-implementation/sub-specs/technical-spec.md (lines 353-395, 399-417)

## Objectives

1. Create PromotionPackForm component (Tier 3 only)
2. Display promotion pack feature checkboxes (read-only for vendor, admin-editable)
3. Show editorial content section (admin-managed)
4. Display featured placement status
5. Show search highlight status
6. Add "Contact us for promotion options" CTA
7. Display benefits of each promotion feature

## Acceptance Criteria

- [ ] PromotionPackForm shown only for Tier 3 vendors
- [ ] Checkboxes for: featuredPlacement, editorialCoverage, searchHighlight (read-only for non-admin)
- [ ] Editorial content list (read-only for vendor, shows admin-created content)
- [ ] Explanation of each promotion feature
- [ ] "Contact Sales for Custom Promotions" button
- [ ] Admin users can toggle feature checkboxes
- [ ] Vendors see status but cannot edit

## Testing Requirements

- Test Tier 3 vendor sees form (read-only features)
- Test admin can toggle promotion features
- Test editorial content display
- Test contact sales button
- Test hidden for non-Tier 3 users

## Evidence Requirements

- app/portal/dashboard/components/PromotionPackForm.tsx
- Component tests, test results, screenshots
