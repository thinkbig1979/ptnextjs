# Tasks: Enhanced Vendor Product Form

## Metadata
- **Spec**: 2026-01-13-enhanced-vendor-product-form
- **Version**: 2.2.1 (Updated with gap analysis)
- **Generated**: 2026-01-13
- **Total Tasks**: 22
- **Estimated Time**: ~13-15 hours
- **Feature Type**: Full-Stack (backend tier validation + frontend form)
- **Granularity Score**: 0.90

## Active Pattern Constraints

All tasks in this spec follow these patterns:
- **Forms**: React Hook Form + Zod validation
- **UI**: shadcn/ui components
- **State**: useFieldArray for dynamic arrays
- **Tier Access**: useTierAccess hook + TierService (frontend) + TierValidationService (backend)

Pattern source: Codebase analysis

---

## Phase 0: Backend Prerequisites (CRITICAL)

| Status | ID | Task | Agent | Time | Dependencies | Details |
|--------|-----|------|-------|------|--------------|---------|
| [ ] | **be-tier-validation** | **[P0 SECURITY]** Add backend tier validation to products API | backend-nodejs-specialist | 45-60m | none | [→](tasks/task-be-tier-validation.md) |
| [ ] | be-api-categories-tags | Create /api/categories and /api/tags routes | backend-nodejs-specialist | 30-40m | none | [→](tasks/task-be-api-categories-tags.md) |

**Note**: `be-tier-validation` is **security-critical** - currently the products API has NO tier checking!

---

## Phase 1: Pre-Execution (Foundation)

| Status | ID | Task | Agent | Time | Dependencies | Details |
|--------|-----|------|-------|------|--------------|---------|
| [ ] | pre-1-types | Create TypeScript types and extended Zod schemas | implementation-specialist | 20-30m | none | [→](tasks/task-pre-1-types.md) |
| [ ] | pre-2-form-section | Create FormSection collapsible wrapper | frontend-react-specialist | 30-40m | pre-1-types | [→](tasks/task-pre-2-form-section.md) |

---

## Phase 2: Frontend Implementation (Components)

| Status | ID | Task | Agent | Time | Dependencies | Details |
|--------|-----|------|-------|------|--------------|---------|
| [ ] | impl-basic-info | Implement BasicInfoSection | frontend-react-specialist | 25-35m | pre-1-types, pre-2-form-section | [→](tasks/task-impl-basic-info.md) |
| [ ] | impl-images | Implement ImagesSection with array management | frontend-react-specialist | 45-60m | pre-1-types, pre-2-form-section | [→](tasks/task-impl-images.md) |
| [ ] | impl-specifications | Implement SpecificationsSection | frontend-react-specialist | 30-40m | pre-1-types, pre-2-form-section | [→](tasks/task-impl-specifications.md) |
| [ ] | impl-features | Implement FeaturesSection with icons | frontend-react-specialist | 40-50m | pre-1-types, pre-2-form-section | [→](tasks/task-impl-features.md) |
| [ ] | impl-pricing | Implement PricingSection | frontend-react-specialist | 25-35m | pre-1-types, pre-2-form-section | [→](tasks/task-impl-pricing.md) |
| [ ] | impl-categories-tags | Implement CategoriesTagsSection + hook | frontend-react-specialist | 45-55m | pre-1-types, pre-2-form-section, be-api-categories-tags | [→](tasks/task-impl-categories-tags.md) |
| [ ] | impl-action-buttons | Implement ActionButtonsSection | frontend-react-specialist | 35-45m | pre-1-types, pre-2-form-section | [→](tasks/task-impl-action-buttons.md) |
| [ ] | impl-badges | Implement BadgesSection | frontend-react-specialist | 25-35m | pre-1-types, pre-2-form-section | [→](tasks/task-impl-badges.md) |
| [ ] | impl-seo | Implement SeoSection | frontend-react-specialist | 25-30m | pre-1-types, pre-2-form-section | [→](tasks/task-impl-seo.md) |
| [ ] | impl-array-reordering | Add drag-and-drop reordering to array sections | frontend-react-specialist | 40-50m | impl-images, impl-specifications, impl-features | [→](tasks/task-impl-array-reordering.md) |

---

## Phase 3: Integration

| Status | ID | Task | Agent | Time | Dependencies | Details |
|--------|-----|------|-------|------|--------------|---------|
| [ ] | impl-full-page-route | Create full-page form routes (/new, /[id]/edit) | frontend-react-specialist | 45-55m | pre-1-types, pre-2-form-section, impl-basic-info | [→](tasks/task-impl-full-page-route.md) |
| [ ] | int-form-assembly | Assemble all sections into ProductForm | frontend-react-specialist | 45-60m | impl-* (all) | [→](tasks/task-int-form-assembly.md) |
| [ ] | impl-product-list-nav | Update ProductList navigation to full-page form | frontend-react-specialist | 25-35m | impl-full-page-route | [→](tasks/task-impl-product-list-nav.md) |
| [ ] | int-tier-gating | Implement tier gating across sections | frontend-react-specialist | 30-40m | int-form-assembly, be-tier-validation | [→](tasks/task-int-tier-gating.md) |
| [ ] | int-draft-autosave | Implement draft autosave hook | frontend-react-specialist | 30-40m | int-form-assembly | [→](tasks/task-int-draft-autosave.md) |

---

## Phase 4: Validation & Testing

| Status | ID | Task | Agent | Time | Dependencies | Details |
|--------|-----|------|-------|------|--------------|---------|
| [ ] | val-mobile-responsive | Mobile responsiveness audit & fixes | quality-assurance | 35-45m | int-form-assembly | [→](tasks/task-val-mobile-responsive.md) |
| [ ] | val-accessibility | Accessibility audit (WCAG 2.1 AA) | quality-assurance | 40-50m | int-form-assembly | [→](tasks/task-val-accessibility.md) |
| [ ] | test-unit | Unit tests for all components & hooks | test-architect | 60-90m | int-form-assembly | [→](tasks/task-test-unit.md) |
| [ ] | test-e2e | E2E tests for critical user journeys | pwtester | 45-60m | int-form-assembly, int-tier-gating | [→](tasks/task-test-e2e.md) |

---

## Dependency Graph

```
                     ┌─────────────────────────────────────────┐
                     │         PHASE 0: BACKEND                │
                     │                                         │
    be-tier-validation (P0 SECURITY)      be-api-categories-tags
           │                                      │
           │                                      │
           └──────────────────┬───────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────────────┐
│                        PHASE 1: FOUNDATION                              │
│                                                                         │
│  pre-1-types ──────► pre-2-form-section                                │
│                              │                                          │
└──────────────────────────────┼──────────────────────────────────────────┘
                               │
┌──────────────────────────────┼──────────────────────────────────────────┐
│                        PHASE 2: COMPONENTS                              │
│                              │                                          │
│      ┌──────────┬────────────┼───────────┬───────────┬────────────┐    │
│      ▼          ▼            ▼           ▼           ▼            ▼    │
│ impl-basic  impl-images  impl-specs  impl-features  impl-pricing  ...  │
│      │          │            │           │                             │
│      │          └────────────┼───────────┘                             │
│      │                       │                                          │
│      │                       ▼                                          │
│      │              impl-array-reordering                               │
│      │                       │                                          │
│      └───────────────────────┼──────────────────────────────────────────┘
│                              │
│      impl-full-page-route ◄──┘                                          │
│              │                                                          │
└──────────────┼──────────────────────────────────────────────────────────┘
               │
┌──────────────┼──────────────────────────────────────────────────────────┐
│              │           PHASE 3: INTEGRATION                           │
│              ▼                                                          │
│      int-form-assembly ◄──── (all impl-* tasks)                        │
│              │                                                          │
│    ┌─────────┼─────────────────┐                                       │
│    │         │                 │                                        │
│    ▼         ▼                 ▼                                        │
│ int-tier  int-draft    impl-product-list-nav                           │
│  gating   autosave                                                      │
│    │                                                                    │
└────┼────────────────────────────────────────────────────────────────────┘
     │
┌────┼────────────────────────────────────────────────────────────────────┐
│    │              PHASE 4: VALIDATION                                   │
│    │                                                                    │
│    │    ┌──────────────────────┬────────────────┐                      │
│    │    │                      │                │                      │
│    ▼    ▼                      ▼                ▼                      │
│ val-mobile  val-accessibility  test-unit    test-e2e                   │
│                                                                         │
└─────────────────────────────────────────────────────────────────────────┘
```

---

## Critical Path

```
be-tier-validation (P0) ─┐
                         ├──► int-tier-gating ──► test-e2e
pre-1-types ─► pre-2-form-section ─► impl-* ─► int-form-assembly ─┘
```

**Blocker Alert**: `be-tier-validation` MUST be completed before `int-tier-gating` to ensure proper security testing.

---

## Parallel Execution Opportunities

### Wave 0 (Backend - can run in parallel)
- be-tier-validation
- be-api-categories-tags

### Wave 1 (After pre-2-form-section)
After `pre-2-form-section` completes, 8 impl tasks can run in parallel:
- impl-basic-info, impl-images, impl-specifications, impl-features
- impl-pricing, impl-action-buttons, impl-badges, impl-seo

(impl-categories-tags waits for be-api-categories-tags)

### Wave 2 (After components)
- impl-array-reordering
- impl-full-page-route

### Wave 3 (After integration)
- int-tier-gating, int-draft-autosave, impl-product-list-nav, val-mobile-responsive

### Wave 4 (Final)
- val-accessibility, test-unit, test-e2e

---

## Summary

| Metric | Value |
|--------|-------|
| **Total Tasks** | 22 |
| **Backend (P0)** | 2 |
| **Foundation** | 2 |
| **Implementation** | 10 |
| **Integration** | 5 |
| **Validation/Testing** | 4 |
| **Sequential Time** | ~13-15 hours |
| **Parallel Time** | ~5-6 hours |
| **Time Savings** | 55-60% with parallel execution |
| **Max Parallelism** | 8 tasks (Wave 1) |

---

## Execution Commands

```bash
# View ready tasks
bd ready

# Start a task
bd update <task-id> --status=in_progress

# Complete a task
bd close <task-id>

# Run tests
npm run test           # Unit tests
npm run test:e2e       # E2E tests
npm run type-check     # TypeScript validation
```

---

## Notes

- **SECURITY FIRST**: Complete `be-tier-validation` before frontend work to ensure API is secure
- **API Routes**: `be-api-categories-tags` must complete before `impl-categories-tags`
- **Test After Each Section**: Run `npm run type-check` after completing each implementation task
- **Mobile First**: Consider mobile layout when implementing sections
- **Tier Testing**: Test with free, tier1, and tier2 accounts during integration phase
