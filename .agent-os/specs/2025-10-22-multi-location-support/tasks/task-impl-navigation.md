# Task: IMPL-NAVIGATION - Navigation Integration

## Task Metadata
- **Task ID**: IMPL-NAVIGATION
- **Phase**: Phase 3 - Frontend Implementation
- **Agent**: frontend-react-specialist
- **Estimated Time**: 15-20 minutes
- **Dependencies**: PRE-2
- **Status**: [ ] Not Started

## Task Description
Integrate multi-location feature into existing navigation structure. Add "Locations" tab to vendor public profile page and ensure dashboard profile navigation remains consistent. No new routes required, just tab/section additions to existing pages.

## Specifics
- **Files to Modify**:
  - `/home/edwin/development/ptnextjs/app/vendors/[slug]/page.tsx` - Add Locations tab to vendor profile
  - `/home/edwin/development/ptnextjs/components/vendors/VendorProfileTabs.tsx` - Add tab component (if tabs component exists)

- **Key Requirements**:
  - Add "Locations" tab to vendor public profile page tab navigation
  - Position Locations tab between "About" and "Products" tabs
  - Ensure tab navigation works with keyboard (accessibility)
  - Add scroll-to-section behavior when tab clicked
  - Maintain existing tab styling and responsive behavior
  - Ensure dashboard profile page has visible "Locations" section (no new nav needed)

- **Technical Details**:
  - Use shadcn/ui Tabs component if not already implemented
  - Use Next.js Link for client-side navigation if using URL-based tabs
  - Implement accessible tab navigation (ARIA roles, keyboard support)
  - Ensure mobile responsive collapse/expand for tabs
  - Follow existing tab patterns in vendor profile page

## Acceptance Criteria
- [ ] "Locations" tab added to vendor public profile page
- [ ] Tab appears in correct position (between About and Products)
- [ ] Tab navigation works with mouse and keyboard
- [ ] Tab styling matches existing tabs
- [ ] Tab is responsive on mobile, tablet, desktop
- [ ] Dashboard profile page has clear "Locations" section header
- [ ] Navigation changes compile without errors
- [ ] Accessibility requirements met (ARIA labels, keyboard navigation)

## Testing Requirements
- **Functional Testing**:
  - Click Locations tab - verify tab switches to locations content
  - Use keyboard (Tab, Enter) to navigate - verify works correctly
  - Test on mobile - verify tab navigation is usable
- **Manual Verification**:
  - Visually verify tab styling matches existing tabs
  - Verify tab order is correct
  - Verify dashboard profile page shows Locations section clearly
- **Browser Testing**: Test in Chrome, Firefox, Safari on desktop and mobile
- **Error Testing**: Verify no console errors when switching tabs

## Evidence Required
- Updated files showing tab integration
- Screenshot of vendor profile page with new Locations tab
- Screenshot of dashboard profile page with Locations section
- Browser test results showing tab navigation works correctly
- Accessibility audit results (Lighthouse or axe DevTools)

## Context Requirements
- Existing vendor profile page structure from PRE-1 analysis
- Technical spec navigation architecture section
- shadcn/ui Tabs component documentation
- Existing tab navigation patterns in codebase

## Implementation Notes
- Follow existing tab implementation patterns exactly
- Ensure Locations tab is visible to all users (not tier-gated in nav)
- Content within tab will be tier-gated, but tab itself shows for all
- Keep navigation changes minimal and non-breaking
- Test thoroughly before marking complete

## Quality Gates
- [ ] Tab navigation works correctly in all browsers
- [ ] Accessibility audit passes (no new violations)
- [ ] Mobile responsive behavior works correctly
- [ ] No breaking changes to existing navigation

## Related Files
- Spec: @.agent-os/specs/2025-10-22-multi-location-support/spec.md
- Technical Spec: @.agent-os/specs/2025-10-22-multi-location-support/sub-specs/technical-spec.md
- Related Tasks: IMPL-DASHBOARD-LOCATIONS, IMPL-PUBLIC-PROFILE
