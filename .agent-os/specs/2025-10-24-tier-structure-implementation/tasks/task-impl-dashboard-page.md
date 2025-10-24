# Task IMPL-DASHBOARD-PAGE: Implement VendorDashboard Page Component

**ID**: impl-dashboard-page
**Title**: Implement VendorDashboard page with authentication and layout
**Agent**: frontend-react-specialist
**Estimated Time**: 1.5 hours
**Dependencies**: impl-frontend-services
**Phase**: 3 - Frontend Implementation

## Context Requirements

Read these files:
- @.agent-os/specs/2025-10-24-tier-structure-implementation/sub-specs/technical-spec.md (lines 621-631, 990-1038, 1100-1127) - Dashboard specification
- @app/portal/dashboard/page.tsx - Existing dashboard (if any)
- @components/dashboard/LocationsManagerCard.tsx - Existing location UI

## Objectives

1. Create VendorDashboard page at app/portal/dashboard/page.tsx
2. Implement authentication check (redirect to login if not authenticated)
3. Fetch current user's vendor profile using useVendorProfile()
4. Wrap page with VendorDashboardContext provider
5. Implement page layout (header, main content, optional sidebar)
6. Create DashboardHeader component (breadcrumbs, title, action buttons)
7. Create DashboardSidebar component (tier info, quick actions)
8. Implement loading state (skeleton loader)
9. Implement error state (error message with retry)
10. Wire up ProfileEditTabs container

## Acceptance Criteria

- [ ] Page created at app/portal/dashboard/page.tsx
- [ ] Authentication check redirects unauthenticated users to /login
- [ ] useVendorProfile() fetches current user's vendor
- [ ] VendorDashboardContext wraps all dashboard content
- [ ] DashboardHeader displays breadcrumbs, title, Preview and Save buttons
- [ ] DashboardSidebar shows tier badge and upgrade prompt (if not Tier 3)
- [ ] Loading state shows skeleton loaders for content
- [ ] Error state shows error message with retry button
- [ ] Page layout responsive (sidebar hidden on mobile/tablet)
- [ ] ProfileEditTabs integrated and receives vendor data
- [ ] TypeScript types for all props and state

## Testing Requirements

- Test redirect to login when unauthenticated
- Test loading state displays skeleton
- Test error state displays error message
- Test successful vendor profile load
- Test Save button triggers saveVendor() action
- Test Preview button opens profile in new tab
- Test responsive layout (sidebar visibility)

## Evidence Requirements

- app/portal/dashboard/page.tsx
- app/portal/dashboard/components/DashboardHeader.tsx
- app/portal/dashboard/components/DashboardSidebar.tsx
- Component tests (React Testing Library)
- Test execution results
- Screenshots of loading, error, and success states
