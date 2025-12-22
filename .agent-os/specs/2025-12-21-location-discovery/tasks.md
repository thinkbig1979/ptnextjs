# Tasks: Location-Based Vendor Discovery

> **Spec**: .agent-os/specs/2025-12-21-location-discovery/
> **Created**: 2025-12-21
> **Feature Type**: FRONTEND_ONLY
> **Total Tasks**: 11
> **Estimated Time**: ~7-8 hours (sequential) | ~3-4 hours (parallel)

---

## Phase 2: Hooks Implementation

| Status | ID | Task | Agent | Time | Dependencies |
|:------:|----|----- |-------|------|--------------|
| [ ] | impl-location-preference-hook | [Implement useLocationPreference Hook](tasks/task-impl-location-preference-hook.md) | frontend-react-specialist | 30-40m | - |
| [ ] | impl-nearby-vendors-category-hook | [Implement useNearbyVendorsByCategory Hook](tasks/task-impl-nearby-vendors-category-hook.md) | frontend-react-specialist | 45-60m | impl-location-preference-hook |

## Phase 3: Component Implementation

| Status | ID | Task | Agent | Time | Dependencies |
|:------:|----|----- |-------|------|--------------|
| [ ] | impl-nearby-vendor-card | [Implement NearbyVendorCard Component](tasks/task-impl-nearby-vendor-card.md) | frontend-react-specialist | 25-35m | - |
| [ ] | impl-vendors-near-you | [Implement VendorsNearYou Component](tasks/task-impl-vendors-near-you.md) | frontend-react-specialist | 45-60m | impl-location-preference-hook, impl-nearby-vendors-category-hook, impl-nearby-vendor-card |
| [ ] | impl-category-select | [Implement CategorySelect Component](tasks/task-impl-category-select.md) | frontend-react-specialist | 20-25m | - |

## Phase 4: Integration

| Status | ID | Task | Agent | Time | Dependencies |
|:------:|----|----- |-------|------|--------------|
| [ ] | integrate-product-page | [Integrate VendorsNearYou into Product Page](tasks/task-integrate-product-page.md) | frontend-react-specialist | 30-40m | impl-vendors-near-you |
| [ ] | enhance-vendors-client | [Enhance VendorsClient with Category Filter](tasks/task-enhance-vendors-client.md) | frontend-react-specialist | 45-60m | impl-category-select |
| [ ] | update-vendors-page | [Update Vendors Page Data Passing](tasks/task-update-vendors-page.md) | frontend-react-specialist | 15-20m | enhance-vendors-client |

## Phase 5: Testing

| Status | ID | Task | Agent | Time | Dependencies |
|:------:|----|----- |-------|------|--------------|
| [ ] | test-unit-hooks | [Write Unit Tests for Hooks](tasks/task-test-unit-hooks.md) | test-architect | 45-60m | impl-location-preference-hook, impl-nearby-vendors-category-hook |
| [ ] | test-unit-components | [Write Unit Tests for Components](tasks/task-test-unit-components.md) | test-architect | 45-60m | impl-nearby-vendor-card, impl-vendors-near-you, impl-category-select |
| [ ] | test-e2e | [Write E2E Tests](tasks/task-test-e2e.md) | test-architect | 60-90m | integrate-product-page, enhance-vendors-client |

---

## Dependency Graph

```
Phase 2 (Hooks):
  impl-location-preference-hook ──┐
                                  ├──► impl-nearby-vendors-category-hook
                                  │
Phase 3 (Components):             │
  impl-nearby-vendor-card ────────┼──► impl-vendors-near-you
                                  │
  impl-category-select ───────────┼──► enhance-vendors-client
                                  │
Phase 4 (Integration):            │
  impl-vendors-near-you ──────────┴──► integrate-product-page
  impl-category-select ──────────────► enhance-vendors-client ──► update-vendors-page

Phase 5 (Testing):
  impl-*-hook ──────────────────────► test-unit-hooks
  impl-*-component ─────────────────► test-unit-components
  integrate-*, enhance-* ───────────► test-e2e
```

## Parallel Execution Opportunities

**Wave 1** (can run simultaneously):
- `impl-location-preference-hook`
- `impl-nearby-vendor-card`
- `impl-category-select`

**Wave 2** (after Wave 1):
- `impl-nearby-vendors-category-hook` (needs hook)
- `enhance-vendors-client` (needs CategorySelect)

**Wave 3** (after Wave 2):
- `impl-vendors-near-you` (needs hooks + card)
- `update-vendors-page` (needs vendors-client)

**Wave 4** (after Wave 3):
- `integrate-product-page`

**Wave 5** (after Wave 4 or in parallel with Wave 3-4):
- `test-unit-hooks` (can start after hooks complete)
- `test-unit-components` (can start after components complete)
- `test-e2e` (needs integration complete)

---

## Summary

| Metric | Value |
|--------|-------|
| Total Tasks | 11 |
| Phase 2 (Hooks) | 2 tasks |
| Phase 3 (Components) | 3 tasks |
| Phase 4 (Integration) | 3 tasks |
| Phase 5 (Testing) | 3 tasks |
| Sequential Time | ~7-8 hours |
| Parallel Time | ~3-4 hours |
| Parallelization Efficiency | ~50% time savings |

## Existing Beads Tasks

These beads tasks are related to this spec:
- `ptnextjs-gu2g` - "Vendors Near You" feature
- `ptnextjs-6pti` - Product-vendor matching

---

## Next Steps

Run `/execute-tasks` to begin implementation with orchestrated parallel execution.
