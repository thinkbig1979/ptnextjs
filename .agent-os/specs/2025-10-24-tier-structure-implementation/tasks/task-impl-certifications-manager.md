# Task IMPL-CERTIFICATIONS-MANAGER: Implement CertificationsAwardsManager Component

**ID**: impl-certifications-manager
**Title**: Implement CertificationsAwardsManager with CRUD operations (Tier 1+)
**Agent**: frontend-react-specialist
**Estimated Time**: 3 hours
**Dependencies**: impl-brand-story-form
**Phase**: 3 - Frontend Implementation

## Context Requirements

Read: @.agent-os/specs/2025-10-24-tier-structure-implementation/sub-specs/technical-spec.md (lines 680-688)

## Objectives

1. Create CertificationsAwardsManager component
2. Implement Certifications array manager (name, issuer, year, expiryDate, certificateNumber, logo, verificationUrl)
3. Implement Awards array manager (title, organization, year, category, description, image)
4. Create add/edit modals using shadcn Dialog
5. Implement delete confirmation dialog
6. Add image upload for certification logos and award images
7. Implement list view with cards showing key info
8. Add search/filter functionality
9. Show upgrade prompt to Free tier

## Acceptance Criteria

- [ ] Two sections: Certifications and Awards
- [ ] Add Certification button opens modal with form
- [ ] Certification form: all fields with validation (year required, URL format)
- [ ] Logo upload with preview
- [ ] Edit certification opens pre-filled modal
- [ ] Delete shows confirmation dialog
- [ ] Awards section with similar CRUD operations
- [ ] Award image upload with preview
- [ ] List view shows cards with key info and actions
- [ ] Upgrade prompt for Free tier users
- [ ] TypeScript types for Certification and Award

## Testing Requirements

- Test add certification flow
- Test edit certification
- Test delete with confirmation
- Test image upload for both certifications and awards
- Test form validation
- Test empty state messaging
- Test upgrade prompt for Free tier

## Evidence Requirements

- app/portal/dashboard/components/CertificationsAwardsManager.tsx
- Component tests, test results, screenshots
