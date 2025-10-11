# Task: impl-vendor-dashboard - Implement Vendor Dashboard with Navigation

## Task Metadata
- **Task ID**: impl-vendor-dashboard
- **Phase**: Phase 3: Frontend Implementation
- **Agent**: frontend-react-specialist
- **Estimated Time**: 35-40 minutes
- **Dependencies**: [impl-vendor-login-form]
- **Status**: [ ] Not Started

## Task Description
Create VendorDashboard page with sidebar navigation, tier badge display, and protected route guard. Implement dashboard layout with navigation structure per technical spec.

## Specifics
- **Files to Create**:
  - `/home/edwin/development/ptnextjs/app/vendor/dashboard/page.tsx` - Dashboard home page
  - `/home/edwin/development/ptnextjs/app/vendor/dashboard/layout.tsx` - Dashboard layout with sidebar
  - `/home/edwin/development/ptnextjs/components/vendor/VendorNavigation.tsx` - Sidebar navigation component
  - `/home/edwin/development/ptnextjs/components/shared/SubscriptionTierBadge.tsx` - Tier badge component
- **shadcn/ui Components**: Card, Badge, Button
- **Navigation Structure**:
  - Dashboard (/vendor/dashboard)
  - Profile (/vendor/dashboard/profile)
  - Products (/vendor/dashboard/products) [Tier 2 only]
  - Settings (/vendor/dashboard/settings)
- **Layout**: Sidebar (240px) + Main content area
- **Route Guard**: Redirect to /vendor/login if not authenticated

## Acceptance Criteria
- [ ] Dashboard page created with layout
- [ ] VendorNavigation sidebar component created
- [ ] SubscriptionTierBadge displays current tier
- [ ] Navigation links highlight active route
- [ ] Products link hidden for non-tier2 vendors
- [ ] Route guard redirects unauthenticated users
- [ ] Responsive layout (sidebar collapses on mobile)

## Testing Requirements
- Unit tests: Navigation component, tier badge display logic
- Integration tests: Route guard redirect, navigation link active states
- Manual verification: Navigate dashboard, verify tier restrictions, test mobile layout

## Related Files
- Technical Spec: VendorDashboard component and Navigation Architecture
