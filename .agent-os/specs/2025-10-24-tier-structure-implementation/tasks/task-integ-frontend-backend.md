# Task INTEG-FRONTEND-BACKEND: Integrate Frontend Dashboard with Backend APIs

**ID**: integ-frontend-backend
**Title**: Integrate frontend dashboard with backend APIs and verify full data flow
**Agent**: integration-coordinator
**Estimated Time**: 2 hours
**Dependencies**: integ-api-contract
**Phase**: 4 - Frontend-Backend Integration

## Context Requirements

Read these files:
- @.agent-os/specs/2025-10-24-tier-structure-implementation/sub-specs/technical-spec.md (lines 1297-1323, 1418-1431) - Integration specification
- @app/portal/dashboard/page.tsx - Dashboard page
- @lib/contexts/VendorDashboardContext.tsx - Dashboard context
- All backend API routes

## Objectives

1. Wire up VendorDashboard to use real backend APIs (not mocks)
2. Verify authentication flow works end-to-end
3. Test all form save operations hit correct API endpoints
4. Verify tier validation errors display correctly in UI
5. Test optimistic updates and error rollback
6. Verify computed fields display correctly after saves
7. Test location limit enforcement through full stack
8. Verify all array managers (certifications, awards, etc.) save correctly

## Acceptance Criteria

- [ ] Dashboard fetches vendor via GET /api/portal/vendors/[id]
- [ ] Authentication redirects to login if token invalid
- [ ] All form saves call PUT /api/portal/vendors/[id]
- [ ] Tier validation errors show inline with correct field highlighting
- [ ] Optimistic updates work (immediate UI update, rollback on error)
- [ ] yearsInBusiness recomputed and displayed after foundedYear save
- [ ] Location manager enforces tier limits (error when exceeding)
- [ ] Certifications, awards, case studies save and reload correctly
- [ ] Team members save with correct display order
- [ ] Video introduction fields save and display
- [ ] Rich text (longDescription) saves and renders correctly
- [ ] No data loss or corruption during saves

## Testing Requirements

- Test complete vendor profile edit flow (all tabs)
- Test tier validation error display (attempt to save tier-restricted field)
- Test location limit enforcement (Free tier add 2nd location)
- Test optimistic update with network error (verify rollback)
- Test computed field update (change foundedYear, verify yearsInBusiness)
- Test array manager save (add certification, reload, verify present)
- Test authentication expiration during editing
- Test concurrent edit handling (if applicable)

## Evidence Requirements

- Integration test results (full dashboard workflow)
- Screenshots of successful saves
- Screenshots of tier validation errors in UI
- Screenshot of optimistic update with rollback
- Network request logs showing correct API calls
- Data verification (database records match UI)
