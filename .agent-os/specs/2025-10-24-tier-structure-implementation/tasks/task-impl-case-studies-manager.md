# Task IMPL-CASE-STUDIES-MANAGER: Implement CaseStudiesManager Component

**ID**: impl-case-studies-manager
**Title**: Implement CaseStudiesManager with rich content editor (Tier 1+)
**Agent**: frontend-react-specialist
**Estimated Time**: 3 hours
**Dependencies**: impl-certifications-manager
**Phase**: 3 - Frontend Implementation

## Context Requirements

Read: @.agent-os/specs/2025-10-24-tier-structure-implementation/sub-specs/technical-spec.md (lines 690-698)

## Objectives

1. Create CaseStudiesManager component
2. Implement case study array manager with fields: title, yachtName, yacht (relationship), projectDate, challenge, solution, results, testimonyQuote, testimonyAuthor, testimonyRole, images, featured
3. Create full-screen modal editor for case studies
4. Implement rich text editors for challenge, solution, results
5. Add image gallery upload (multiple images)
6. Implement yacht lookup/search for relationship field
7. Add featured toggle (star icon)
8. Implement list view with cards showing title, yacht, date
9. Add filter by featured

## Acceptance Criteria

- [ ] Add Case Study button opens full-screen modal
- [ ] Form fields: title, yachtName, yacht relationship lookup, projectDate, challenge (textarea), solution (textarea), results (textarea), testimony section, images array, featured checkbox
- [ ] Rich text editors for challenge, solution, results
- [ ] Multiple image upload with preview gallery
- [ ] Yacht relationship field with autocomplete search
- [ ] Featured toggle in list view (star icon)
- [ ] Edit opens pre-filled modal
- [ ] Delete confirmation dialog
- [ ] List view shows cards with title, yacht name, date, featured indicator
- [ ] Filter by featured case studies
- [ ] Upgrade prompt for Free tier

## Testing Requirements

- Test add case study with all fields
- Test image gallery upload
- Test yacht relationship lookup
- Test featured toggle
- Test rich text content save/load
- Test edit and delete flows
- Test filter by featured

## Evidence Requirements

- app/portal/dashboard/components/CaseStudiesManager.tsx
- Component tests, test results, screenshots of modal and list
