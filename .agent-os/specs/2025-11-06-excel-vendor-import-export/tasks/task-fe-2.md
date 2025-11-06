# Task FE-2: Add Navigation Link to Sidebar

**Status:** 🔒 Blocked (waiting for FE-1)
**Agent:** frontend-react-specialist
**Estimated Time:** 1 hour
**Phase:** Frontend Implementation
**Dependencies:** FE-1

## Objective

Add "Data Management" navigation link to the vendor dashboard sidebar.

## Context Requirements

- Find and review VendorNavigation component
- Review existing navigation items and structure
- Follow navigation patterns

## Acceptance Criteria

- [ ] Navigation link added to sidebar
- [ ] Icon selected (Database or FileSpreadsheet icon)
- [ ] Link labeled "Data Management"
- [ ] Active state highlighting works
- [ ] Positioned appropriately in menu
- [ ] Mobile navigation works

## Detailed Specifications

Add to VendorNavigation component:

```typescript
{
  label: 'Data Management',
  href: '/vendor/dashboard/data-management',
  icon: Database, // or FileSpreadsheet from lucide-react
}
```

Position: After "Profile" or "Locations", before "Settings"

## Testing Requirements

- Manual test: Click navigation link
- Verify active state
- Test mobile menu

## Evidence Requirements

- [ ] Navigation link visible (screenshot)
- [ ] Active state works
- [ ] Mobile navigation works

## Success Metrics

- Link navigates correctly
- Matches design system
- Mobile responsive
