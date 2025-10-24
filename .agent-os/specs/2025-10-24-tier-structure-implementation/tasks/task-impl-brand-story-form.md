# Task IMPL-BRAND-STORY-FORM: Implement BrandStoryForm Component

**ID**: impl-brand-story-form
**Title**: Implement BrandStoryForm with computed years in business (Tier 1+)
**Agent**: frontend-react-specialist
**Estimated Time**: 2.5 hours
**Dependencies**: impl-basic-info-form
**Phase**: 3 - Frontend Implementation

## Context Requirements

Read: @.agent-os/specs/2025-10-24-tier-structure-implementation/sub-specs/technical-spec.md (lines 663-678)

## Objectives

1. Create BrandStoryForm component with React Hook Form + Zod
2. Implement fields: website, linkedinUrl, twitterUrl, foundedYear, totalProjects, employeeCount, followers, satisfaction scores
3. Implement YearsInBusinessDisplay computed field (read-only, auto-updates from foundedYear)
4. Add video introduction section (videoUrl, videoThumbnail, videoDuration, videoTitle, videoDescription)
5. Add RichTextEditor for longDescription
6. Add ServiceAreas array manager (add/edit/delete service areas)
7. Add CompanyValues array manager
8. Show tier upgrade prompt to Free tier users
9. Validate year range (1800 - current year) and score ranges (0-100)

## Acceptance Criteria

- [ ] Form with all fields specified in technical spec
- [ ] foundedYear input triggers YearsInBusinessDisplay update
- [ ] YearsInBusinessDisplay shows "X years in business" or "Not specified"
- [ ] Video introduction section with URL validation
- [ ] Rich text editor for longDescription using @payloadcms/richtext-lexical
- [ ] ServiceAreas array manager (CRUD operations)
- [ ] CompanyValues array manager
- [ ] Upgrade prompt shown to Free tier (cannot edit, shows benefits)
- [ ] Validation: foundedYear 1800-2025, scores 0-100, URLs valid format
- [ ] Save functionality integrated with context

## Testing Requirements

- Test yearsInBusiness computation (2010 → 15 years)
- Test edge cases (null foundedYear, future year)
- Test service areas CRUD operations
- Test rich text editor content save/load
- Test upgrade prompt display for Free tier
- Test form validation (year ranges, score ranges, URL formats)

## Evidence Requirements

- app/portal/dashboard/components/BrandStoryForm.tsx
- components/dashboard/YearsInBusinessDisplay.tsx
- Component tests, test results, screenshots
