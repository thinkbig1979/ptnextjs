# Task IMPL-TEAM-MANAGER: Implement TeamMembersManager Component

**ID**: impl-team-manager
**Title**: Implement TeamMembersManager with photo upload and ordering (Tier 1+)
**Agent**: frontend-react-specialist
**Estimated Time**: 2 hours
**Dependencies**: impl-case-studies-manager
**Phase**: 3 - Frontend Implementation

## Context Requirements

Read: @.agent-os/specs/2025-10-24-tier-structure-implementation/sub-specs/technical-spec.md (lines 700-708)

## Objectives

1. Create TeamMembersManager component
2. Implement team member array manager: name, role, bio, photo, linkedinUrl, email, displayOrder
3. Create add/edit modal
4. Implement photo upload with crop functionality
5. Add drag-to-reorder for display order
6. Implement card preview showing photo, name, role
7. Add LinkedIn integration (validate URL format, show LinkedIn icon)
8. Implement email field with privacy note

## Acceptance Criteria

- [ ] Add Team Member button opens modal
- [ ] Form fields: name, role, bio (textarea), photo upload, linkedinUrl, email, displayOrder
- [ ] Photo upload with crop and preview
- [ ] LinkedIn URL validation and icon display
- [ ] Email field with note about privacy
- [ ] Drag-to-reorder team members (updates displayOrder)
- [ ] Card preview shows circular photo, name, role
- [ ] Edit opens pre-filled modal
- [ ] Delete confirmation
- [ ] Upgrade prompt for Free tier

## Testing Requirements

- Test add team member with photo
- Test photo upload and crop
- Test drag-to-reorder
- Test LinkedIn URL validation
- Test edit and delete
- Test card preview rendering

## Evidence Requirements

- app/portal/dashboard/components/TeamMembersManager.tsx
- Component tests, test results, screenshots
