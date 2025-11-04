# Task: impl-frontend-form - Implement TierUpgradeRequestForm Component

## Task Metadata
- **Task ID**: impl-frontend-form
- **Phase**: Phase 3: Frontend Implementation
- **Agent**: frontend-react-specialist
- **Estimated Time**: 30-35 minutes
- **Dependencies**: [impl-frontend-comparison]
- **Status**: [ ] Not Started
- **Beads Reference**: ptnextjs-6909

## Task Description
Implement the TierUpgradeRequestForm component that allows vendors to submit tier upgrade requests with tier selection and optional business justification notes.

## Specifics
- **Files to Create/Modify**:
  - `components/dashboard/TierUpgradeRequestForm.tsx` (create)

- **Key Requirements**:
  - React Hook Form integration with Zod validation
  - Tier dropdown showing only higher tiers than current
  - Optional notes textarea (min 20 chars, max 500 chars)
  - API integration with POST /api/portal/vendors/[id]/tier-upgrade-request
  - Toast notifications on success/error
  - Loading states during submission

- **Technical Details** (from technical-spec.md lines 63-145):
  - Props: `currentTier`, `vendorId`, `onSuccess`, `onCancel`
  - State: `isSubmitting`, `error`
  - shadcn/ui components: Form, Select, Textarea, Button, Card, Alert
  - Validation schema prevents downgrades and enforces note length
  - Form disabled during submission

## Acceptance Criteria
- [ ] Component file created at specified path
- [ ] Props interface matches technical spec
- [ ] Tier dropdown only shows tiers higher than current
- [ ] Zod validation schema implemented correctly
- [ ] API call handles success and error cases
- [ ] Toast notifications displayed appropriately
- [ ] Form is disabled during submission
- [ ] Component renders without errors
- [ ] Validation errors display correctly

## Testing Requirements
- **Functional Testing**: 
  - Form renders with correct tier options
  - Validation prevents invalid submissions
  - API integration works correctly
  - Success callback is triggered
- **Manual Verification**:
  - UI matches design specifications
  - Loading states are visible
  - Error messages are user-friendly

## Evidence Required
- Component file exists at `components/dashboard/TierUpgradeRequestForm.tsx`
- Screenshot of form in various states (default, loading, error)
- Test output showing component tests passing

## Context Requirements
- Component Architecture from @.agent-os/specs/2025-11-04-tier-upgrade-request-system/sub-specs/technical-spec.md (lines 63-145)
- Existing form patterns in `components/dashboard/`
- shadcn/ui component documentation
- React Hook Form and Zod integration patterns

## Implementation Notes
- Use existing form patterns from LocationsManagerCard or similar components
- Follow project's form validation conventions
- Ensure accessibility (proper labels, ARIA attributes)
- Mobile-responsive design
- Follow project's TypeScript conventions

## Quality Gates
- [ ] TypeScript types are complete and correct
- [ ] Component follows React best practices
- [ ] Accessibility requirements met
- [ ] Component is properly documented with JSDoc comments
- [ ] No console errors or warnings

## Related Files
- Spec: @.agent-os/specs/2025-11-04-tier-upgrade-request-system/spec.md
- Technical Spec: @.agent-os/specs/2025-11-04-tier-upgrade-request-system/sub-specs/technical-spec.md (lines 63-145)
- TierComparisonTable: components/TierComparisonTable.tsx (prerequisite)
- Beads Issue: ptnextjs-6909 (Vendor Dashboard UI)
