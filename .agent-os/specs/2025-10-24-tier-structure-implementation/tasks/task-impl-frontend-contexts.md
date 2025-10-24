# Task IMPL-FRONTEND-CONTEXTS: Implement Frontend Context Providers

**ID**: impl-frontend-contexts
**Title**: Implement TierAccessContext and VendorDashboardContext
**Agent**: frontend-react-specialist
**Estimated Time**: 1.5 hours
**Dependencies**: test-frontend-ui
**Phase**: 3 - Frontend Implementation

## Context Requirements

Read these files:
- @.agent-os/specs/2025-10-24-tier-structure-implementation/sub-specs/technical-spec.md (lines 751-765, 1432-1468) - State management specification
- @lib/contexts/ - Existing context patterns (if any)
- @hooks/useTierAccess.ts - Existing tier access hook

## Objectives

### TierAccessContext (lib/contexts/TierAccessContext.tsx)
1. Create context provider with tier state
2. Implement `canAccessField(fieldName)` utility
3. Implement `canAccessFeature(featureName)` utility
4. Implement `getLocationLimit()` utility
5. Provide feature flags based on tier
6. Use TierValidationService for validation logic

### VendorDashboardContext (lib/contexts/VendorDashboardContext.tsx)
1. Create context provider for dashboard state
2. Integrate with SWR for vendor data fetching
3. Implement `updateVendor(data)` action
4. Implement `saveVendor()` action with API call
5. Implement `setActiveTab(tab)` action
6. Implement `refreshVendor()` action
7. Provide computed values (yearsInBusiness)
8. Handle loading, saving, and error states

## Acceptance Criteria

### TierAccessContext
- [ ] Context provider component created
- [ ] canAccessField() correctly checks tier permissions
- [ ] canAccessFeature() validates feature access
- [ ] getLocationLimit() returns correct limits (1, 3, 10, unlimited)
- [ ] Feature flags computed from tier
- [ ] Hook (useTierAccess) exports context values
- [ ] TypeScript types for all context values

### VendorDashboardContext
- [ ] Context provider component created
- [ ] SWR integration for vendor data fetching
- [ ] updateVendor() updates local state optimistically
- [ ] saveVendor() makes PUT API call
- [ ] setActiveTab() updates active tab state
- [ ] refreshVendor() triggers SWR revalidation
- [ ] yearsInBusiness computed from foundedYear
- [ ] Loading, saving, error states managed
- [ ] Hook (useVendorDashboard) exports context values
- [ ] TypeScript types for all actions and state

## Testing Requirements

- Unit tests for TierAccessContext utilities
- Unit tests for tier validation logic
- Integration tests for VendorDashboardContext with mocked API
- Test optimistic updates in dashboard context
- Test error handling in saveVendor action
- Test computed field (yearsInBusiness) calculation

## Evidence Requirements

- lib/contexts/TierAccessContext.tsx
- lib/contexts/VendorDashboardContext.tsx
- lib/hooks/useTierAccess.ts (updated)
- lib/hooks/useVendorDashboard.ts
- Test files with 80%+ coverage
- Test execution results
