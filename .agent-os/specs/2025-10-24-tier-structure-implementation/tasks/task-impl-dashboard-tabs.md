# Task IMPL-DASHBOARD-TABS: Implement ProfileEditTabs Container

**ID**: impl-dashboard-tabs
**Title**: Implement ProfileEditTabs tabbed container with tier-aware tab visibility
**Agent**: frontend-react-specialist
**Estimated Time**: 1.5 hours
**Dependencies**: impl-dashboard-page
**Phase**: 3 - Frontend Implementation

## Context Requirements

Read these files:
- @.agent-os/specs/2025-10-24-tier-structure-implementation/sub-specs/technical-spec.md (lines 634-648, 1000-1038) - Tabs specification
- @components/ui/tabs.tsx - shadcn Tabs component
- @lib/hooks/useTierAccess.ts - Tier access hook

## Objectives

1. Create ProfileEditTabs component at app/portal/dashboard/components/ProfileEditTabs.tsx
2. Use shadcn Tabs component for tab navigation
3. Implement tier-aware tab visibility (Free: 2 tabs, Tier1: 7 tabs, Tier2: 8 tabs, Tier3: 9 tabs)
4. Create tab list with TabsTrigger for each section
5. Create TabsContent for each tab section
6. Implement active tab state management
7. Show locked icon on tabs requiring higher tier
8. Implement responsive tabs (dropdown on mobile)
9. Wire up form components for each tab
10. Handle form dirty state and navigation warnings

## Acceptance Criteria

- [ ] ProfileEditTabs component created with shadcn Tabs
- [ ] Tier-aware tab visibility: Free (Basic Info, Locations), Tier1+ (adds Brand Story, Certifications, Case Studies, Team), Tier2+ (adds Products), Tier3 (adds Promotion)
- [ ] TabsTrigger displays lock icon for unavailable tabs
- [ ] Clicking locked tab shows upgrade prompt
- [ ] Active tab state synced with VendorDashboardContext
- [ ] Each TabsContent renders appropriate form component
- [ ] Responsive: tabs horizontal on desktop, dropdown select on mobile
- [ ] Form dirty state tracked, warns before tab switch if unsaved changes
- [ ] TypeScript props interface with vendor, onSave, tier
- [ ] All tab content components properly wired up

## Testing Requirements

- Test Free tier shows only 2 tabs (Basic Info, Locations)
- Test Tier 1 shows 7 tabs
- Test Tier 2 shows 8 tabs (includes Products)
- Test Tier 3 shows all 9 tabs
- Test clicking locked tab shows upgrade prompt
- Test tab switching updates active tab state
- Test unsaved changes warning on tab switch
- Test responsive tabs behavior (mobile dropdown)

## Evidence Requirements

- app/portal/dashboard/components/ProfileEditTabs.tsx
- Component tests
- Test execution results
- Screenshots showing tier-specific tab visibility
- Screenshot of unsaved changes warning dialog
