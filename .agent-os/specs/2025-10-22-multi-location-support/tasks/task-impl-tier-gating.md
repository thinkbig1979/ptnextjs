# Task: IMPL-TIER-GATING - Tier-Based Access Control

## Task Metadata
- **Task ID**: IMPL-TIER-GATING
- **Phase**: Phase 3 - Frontend Implementation
- **Agent**: frontend-react-specialist
- **Estimated Time**: 20-25 minutes
- **Dependencies**: TEST-FRONTEND-UI
- **Status**: [ ] Not Started

## Task Description
Implement TierGate component and tier-checking utilities for conditional rendering based on vendor subscription tier. Includes TierUpgradePrompt component for locked features, tier validation functions, and integration with dashboard and public profile components.

## Specifics
- **Files to Create**:
  - `/home/edwin/development/ptnextjs/components/ui/TierGate.tsx`
  - `/home/edwin/development/ptnextjs/lib/services/TierService.ts`
  - `/home/edwin/development/ptnextjs/lib/hooks/useTierAccess.ts`

- **Key Requirements**:
  - TierGate component for conditional rendering based on tier requirements
  - TierService with tier validation functions (canAccessMultipleLocations, etc.)
  - useTierAccess hook for checking feature access in components
  - TierUpgradePrompt component showing locked feature with upgrade CTA
  - Tier constants and feature mapping (tierFeatureMap)
  - Integration with LocationsManagerCard for locations access
  - Integration with LocationsDisplaySection for tier-filtered display

- **Technical Details**:
  - Define tier types: 'free' | 'tier1' | 'tier2'
  - TierGate props: requiredTier, currentTier, fallback (ReactNode)
  - TierService methods: canAccessFeature(tier, feature), getTierLevel(tier)
  - useTierAccess returns: { hasAccess: boolean, tier: string, upgradePath: string }
  - TierUpgradePrompt shows Lock icon, feature name, benefits, upgrade button
  - Use shadcn/ui Card, Button, Badge, Alert components

## Acceptance Criteria
- [ ] TierGate component created with conditional rendering logic
- [ ] TierService implements tier validation functions
- [ ] useTierAccess hook provides tier access checking
- [ ] TierUpgradePrompt component created with proper styling
- [ ] Tier constants defined (FREE, TIER1, TIER2)
- [ ] Feature mapping defined (tierFeatureMap with 'multipleLocations' feature)
- [ ] LocationsManagerCard uses TierGate for conditional rendering
- [ ] LocationsDisplaySection uses tier filtering for location display
- [ ] All tier combinations tested (free, tier1, tier2)
- [ ] All tests from TEST-FRONTEND-UI pass for TierGate

## Testing Requirements
- **Functional Testing**: Run TEST-FRONTEND-UI tests for TierGate - all tests must pass
- **Manual Verification**:
  - Login as tier2 vendor - verify LocationsManagerCard displays
  - Login as tier1 vendor - verify TierUpgradePrompt displays
  - Login as free vendor - verify TierUpgradePrompt displays
  - Click upgrade button - verify navigation to subscription page
  - View tier2 vendor profile - verify all locations display
  - View tier1 vendor profile - verify only HQ displays
- **Browser Testing**: Test in Chrome, Firefox, Safari using Playwright
- **Error Testing**:
  - Test with invalid tier value - verify graceful handling
  - Test with missing tier field - verify fallback behavior

## Evidence Required
- Created component, service, and hook files
- Test output showing all TierGate tests passing
- Screenshot of LocationsManagerCard for tier2 vendor
- Screenshot of TierUpgradePrompt for tier1 vendor
- Screenshot of tier-filtered location display on public profile
- Code snippets showing TierGate usage in components

## Context Requirements
- Technical spec tier-based access control section
- Test file from TEST-FRONTEND-UI
- Vendor interface with tier field
- Existing authentication patterns in codebase

## Implementation Notes
- Define tier hierarchy clearly (free < tier1 < tier2)
- Make tier checks case-insensitive for robustness
- Provide clear upgrade messaging in TierUpgradePrompt
- Ensure tier checks are consistent across frontend and backend
- Document tier feature mapping for future features
- Consider feature flags for gradual tier feature rollout

## Quality Gates
- [ ] All unit tests pass (from TEST-FRONTEND-UI)
- [ ] TierGate works correctly for all tier combinations
- [ ] TierUpgradePrompt displays correct upgrade messaging
- [ ] Tier filtering works correctly in LocationsDisplaySection
- [ ] No tier-related console errors or warnings

## Related Files
- Spec: @.agent-os/specs/2025-10-22-multi-location-support/spec.md
- Technical Spec: @.agent-os/specs/2025-10-22-multi-location-support/sub-specs/technical-spec.md
- Related Tasks: TEST-FRONTEND-UI, IMPL-DASHBOARD-LOCATIONS, IMPL-PUBLIC-PROFILE
