# Task IMPL-TIER-COMPONENTS: Implement Tier-Specific UI Components

**ID**: impl-tier-components
**Title**: Implement TierBadge, YearsInBusinessDisplay, UpgradePromptCard
**Agent**: frontend-react-specialist
**Estimated Time**: 2 hours
**Dependencies**: impl-vendor-card
**Phase**: 3 - Frontend Implementation

## Context Requirements

Read: @.agent-os/specs/2025-10-24-tier-structure-implementation/sub-specs/technical-spec.md (lines 731-748, 884-914)

## Objectives

### TierBadge Component
1. Create TierBadge component using shadcn Badge
2. Display tier level with color coding (Free: gray, Tier1: blue, Tier2: purple, Tier3: gold)
3. Add tier icon/emoji
4. Support size variants (sm, md, lg)

### YearsInBusinessDisplay Component
1. Create YearsInBusinessDisplay component
2. Compute years from foundedYear prop
3. Display as badge or inline text with icon
4. Handle null/invalid years gracefully
5. Show "Established [year]" format

### UpgradePromptCard Component
1. Create UpgradePromptCard using shadcn Card and Dialog
2. Display locked feature name and benefits list
3. Show pricing comparison (current vs target tier)
4. Add "Contact Sales" CTA button
5. Support inline card variant and modal variant

## Acceptance Criteria

### TierBadge
- [ ] Component at components/vendors/TierBadge.tsx
- [ ] Props: tier, size (optional)
- [ ] Color coding: Free (gray/secondary), Tier1 (blue), Tier2 (purple), Tier3 (gold)
- [ ] Displays: "Free", "Tier 1", "Tier 2", "Tier 3"
- [ ] Size variants work (sm, md, lg)
- [ ] TypeScript types

### YearsInBusinessDisplay
- [ ] Component at components/vendors/YearsInBusinessDisplay.tsx
- [ ] Props: foundedYear, showLabel (boolean)
- [ ] Computes: currentYear - foundedYear
- [ ] Displays: "15 years in business" or "Established 2010"
- [ ] Handles null foundedYear: shows "Not specified" or hides
- [ ] Badge or inline text format
- [ ] Calendar icon

### UpgradePromptCard
- [ ] Component at components/dashboard/UpgradePromptCard.tsx
- [ ] Props: currentTier, targetTier, feature, benefits (array), onContactSales
- [ ] Card variant for inline display
- [ ] Modal variant for full screen
- [ ] Benefits list with checkmarks
- [ ] Tier comparison table
- [ ] "Contact Sales" button triggers onContactSales callback
- [ ] Close button on modal

## Testing Requirements

- Test TierBadge for all 4 tiers (color and text)
- Test TierBadge size variants
- Test YearsInBusinessDisplay computation (2010 → 15 years)
- Test YearsInBusinessDisplay with null foundedYear
- Test UpgradePromptCard card variant
- Test UpgradePromptCard modal variant
- Test contact sales button click

## Evidence Requirements

- components/vendors/TierBadge.tsx
- components/vendors/YearsInBusinessDisplay.tsx
- components/dashboard/UpgradePromptCard.tsx
- Component tests, screenshots of all variants
