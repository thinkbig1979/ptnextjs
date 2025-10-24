# Task IMPL-BASIC-INFO-FORM: Implement BasicInfoForm Component

**ID**: impl-basic-info-form
**Title**: Implement BasicInfoForm for core vendor information (all tiers)
**Agent**: frontend-react-specialist
**Estimated Time**: 2 hours
**Dependencies**: impl-dashboard-tabs
**Phase**: 3 - Frontend Implementation

## Context Requirements

Read these files:
- @.agent-os/specs/2025-10-24-tier-structure-implementation/sub-specs/technical-spec.md (lines 654-661) - BasicInfoForm specification
- @components/ui/form.tsx - shadcn Form components
- @components/ui/input.tsx, textarea.tsx - shadcn inputs
- @lib/validation/vendorSchemas.ts - Zod schemas

## Objectives

1. Create BasicInfoForm component at app/portal/dashboard/components/BasicInfoForm.tsx
2. Use React Hook Form with Zod validation
3. Implement form fields: companyName, slug, description, contactEmail, contactPhone
4. Integrate MediaUploader for logo upload
5. Implement real-time validation with error messages
6. Show character counts for text fields
7. Implement auto-save or save button
8. Show loading state during save
9. Handle validation errors from API
10. Use shadcn Form, Input, Textarea, Label, FormMessage components

## Acceptance Criteria

- [ ] BasicInfoForm component created with React Hook Form
- [ ] Zod schema validates all fields (companyName required, email format, etc.)
- [ ] Form fields: companyName (text), slug (text, read-only), description (textarea, 500 char max), contactEmail (email), contactPhone (tel)
- [ ] Logo upload field with preview using MediaUploader component
- [ ] Real-time validation shows errors below fields
- [ ] Character count displayed for description field
- [ ] Save button disabled when form invalid or saving
- [ ] Loading spinner on save button during save
- [ ] API validation errors displayed inline
- [ ] Success toast on successful save
- [ ] TypeScript props interface (vendor, onSubmit, disabled)

## Testing Requirements

- Test form validation (required fields, email format, max lengths)
- Test successful form submission
- Test API error handling (display inline errors)
- Test logo upload preview
- Test character count updates
- Test save button disabled states
- Test read-only slug field

## Evidence Requirements

- app/portal/dashboard/components/BasicInfoForm.tsx
- components/ui/MediaUploader.tsx (if new)
- Component tests
- Test execution results
- Screenshots showing form, validation errors, success state
