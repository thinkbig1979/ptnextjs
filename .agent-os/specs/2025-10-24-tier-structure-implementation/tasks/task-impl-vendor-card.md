# Task IMPL-VENDOR-CARD: Implement VendorCard Component

**ID**: impl-vendor-card
**Title**: Implement VendorCard for listings with tier badges and featured indicators
**Agent**: frontend-react-specialist
**Estimated Time**: 1.5 hours
**Dependencies**: impl-public-profile
**Phase**: 3 - Frontend Implementation

## Context Requirements

Read: @.agent-os/specs/2025-10-24-tier-structure-implementation/sub-specs/technical-spec.md (lines 720-729)

## Objectives

1. Create VendorCard component for vendor listings
2. Display logo, company name, description (truncated), tier badge
3. Show key metrics based on tier (locations count, years in business)
4. Add featured star icon for Tier 3 featured vendors
5. Implement hover effects and click to profile
6. Create responsive layout (horizontal on desktop, vertical on mobile)
7. Add loading skeleton variant

## Acceptance Criteria

- [ ] VendorCard component created
- [ ] Props: vendor, featured (boolean), showTierBadge (boolean)
- [ ] Displays: logo (with fallback), companyName, description (truncated 150 chars), TierBadge
- [ ] Shows yearsInBusiness badge (Tier 1+)
- [ ] Shows location count (all tiers)
- [ ] Featured star icon for featured vendors (Tier 3)
- [ ] Click navigates to /vendors/[slug]
- [ ] Hover effect (shadow, slight scale)
- [ ] Responsive: horizontal on desktop, vertical on mobile
- [ ] Loading skeleton variant
- [ ] TypeScript types for all props

## Testing Requirements

- Test card rendering with Free tier vendor
- Test card with Tier 1 vendor (years in business shown)
- Test featured vendor card (star icon visible)
- Test truncated description (long text)
- Test click navigation
- Test responsive layout
- Test loading skeleton

## Evidence Requirements

- components/vendors/VendorCard.tsx
- Component tests, screenshots of variants
