# Task IMPL-PUBLIC-PROFILE: Implement VendorProfilePage

**ID**: impl-public-profile
**Title**: Implement public-facing VendorProfilePage with tier-responsive sections
**Agent**: frontend-react-specialist
**Estimated Time**: 3 hours
**Dependencies**: impl-promotion-form
**Phase**: 3 - Frontend Implementation

## Context Requirements

Read: @.agent-os/specs/2025-10-24-tier-structure-implementation/sub-specs/technical-spec.md (lines 711-718, 965-989, 1128-1165)

## Objectives

1. Create VendorProfilePage at app/vendors/[slug]/page.tsx
2. Fetch vendor data via public API (GET /api/vendors/[slug])
3. Implement hero section (logo, name, description, tier badge, years in business)
4. Create tier-responsive sections (show/hide based on tier)
5. Implement sections: About, Locations Map, Certifications, Awards, Case Studies, Team, Products, Innovation
6. Add sidebar with contact card and social links
7. Implement responsive layout
8. Add meta tags for SEO
9. Use SWR for caching

## Acceptance Criteria

- [ ] Page created at app/vendors/[slug]/page.tsx
- [ ] Fetches vendor via GET /api/vendors/[slug] using SWR
- [ ] Hero section: VendorHero component with logo, name, description, TierBadge, YearsInBusinessDisplay
- [ ] About section (all tiers): longDescription with rich text rendering
- [ ] Locations section (all tiers): Map with tier-appropriate location count
- [ ] Certifications section (Tier 1+): Grid display with logos
- [ ] Awards section (Tier 1+): List with images and descriptions
- [ ] Case Studies section (Tier 1+): Cards with featured highlighted
- [ ] Team section (Tier 1+): Team member cards with photos
- [ ] Products section (Tier 2+): Product grid
- [ ] Sidebar: Contact card, social links, related vendors
- [ ] Responsive: 2-column on desktop, single column on mobile
- [ ] SEO meta tags: title, description, og:image

## Testing Requirements

- Test Free tier profile (basic info only)
- Test Tier 1 profile (extended sections)
- Test Tier 2 profile (products visible)
- Test Tier 3 profile (editorial content, featured badge)
- Test 404 for unpublished or non-existent vendor
- Test responsive layout
- Test SEO meta tags present

## Evidence Requirements

- app/vendors/[slug]/page.tsx
- components/vendors/VendorHero.tsx
- components/vendors/VendorAboutSection.tsx
- components/vendors/VendorCertificationsSection.tsx
- components/vendors/VendorCaseStudiesSection.tsx
- components/vendors/VendorTeamSection.tsx
- Component tests, screenshots for each tier
