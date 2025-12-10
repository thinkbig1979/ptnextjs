# Tasks: Vendor Product Management

> **Spec**: 2025-12-09-vendor-product-management
> **Created**: 2025-12-10
> **Total Tasks**: 18
> **Estimated Time**: 8-10 hours (sequential) | 4-5 hours (parallel)
> **Granularity Score**: 0.92/1.0

## Task Summary

| Phase | Tasks | Est. Time | Parallel Opportunities |
|-------|-------|-----------|------------------------|
| Phase 2: Backend | 6 | 3h | 2 parallel streams |
| Phase 3: Frontend | 7 | 3.5h | 2 parallel streams |
| Phase 4: Integration | 3 | 1.5h | Sequential |
| Phase 5: Validation | 2 | 1h | Sequential |

---

## Phase 2: Backend Implementation

### 2.1 Core Backend Infrastructure

- [ ] **task-be-1** - Create ProductService business logic
  - Agent: `backend-nodejs-specialist`
  - Time: 30-40 min
  - Depends: none
  - [Details](tasks/task-be-1.md)

- [ ] **task-be-2** - Create product validation schemas (Zod)
  - Agent: `backend-nodejs-specialist`
  - Time: 20-25 min
  - Depends: none
  - [Details](tasks/task-be-2.md)

### 2.2 API Routes

- [ ] **task-be-3** - Implement GET/POST /api/portal/vendors/[id]/products
  - Agent: `backend-nodejs-specialist`
  - Time: 35-45 min
  - Depends: task-be-1, task-be-2
  - [Details](tasks/task-be-3.md)

- [ ] **task-be-4** - Implement GET/PUT/DELETE /api/portal/vendors/[id]/products/[productId]
  - Agent: `backend-nodejs-specialist`
  - Time: 35-45 min
  - Depends: task-be-1, task-be-2
  - [Details](tasks/task-be-4.md)

- [ ] **task-be-5** - Implement PATCH /api/portal/vendors/[id]/products/[productId]/publish
  - Agent: `backend-nodejs-specialist`
  - Time: 20-25 min
  - Depends: task-be-1
  - [Details](tasks/task-be-5.md)

### 2.3 Backend Integration Verification

- [ ] **task-be-6** - Verify backend API endpoints with manual testing
  - Agent: `quality-assurance`
  - Time: 20-25 min
  - Depends: task-be-3, task-be-4, task-be-5
  - [Details](tasks/task-be-6.md)

---

## Phase 3: Frontend Implementation

### 3.1 UI Components (Independent)

- [ ] **task-fe-1** - Create ProductCard component
  - Agent: `frontend-react-specialist`
  - Time: 25-30 min
  - Depends: task-be-2 (types)
  - [Details](tasks/task-fe-1.md)

- [ ] **task-fe-2** - Create ProductDeleteDialog component
  - Agent: `frontend-react-specialist`
  - Time: 15-20 min
  - Depends: none
  - [Details](tasks/task-fe-2.md)

- [ ] **task-fe-3** - Create ProductForm component (Sheet)
  - Agent: `frontend-react-specialist`
  - Time: 40-50 min
  - Depends: task-be-2 (validation schemas)
  - [Details](tasks/task-fe-3.md)

### 3.2 Container Component

- [ ] **task-fe-4** - Create useVendorProducts SWR hook
  - Agent: `frontend-react-specialist`
  - Time: 15-20 min
  - Depends: task-be-3
  - [Details](tasks/task-fe-4.md)

- [ ] **task-fe-5** - Create ProductList container component
  - Agent: `frontend-react-specialist`
  - Time: 35-45 min
  - Depends: task-fe-1, task-fe-2, task-fe-3, task-fe-4
  - [Details](tasks/task-fe-5.md)

### 3.3 Page Integration

- [ ] **task-fe-6** - Update dashboard products page
  - Agent: `frontend-react-specialist`
  - Time: 20-25 min
  - Depends: task-fe-5
  - [Details](tasks/task-fe-6.md)

- [ ] **task-fe-7** - Add TypeScript types for Product API responses
  - Agent: `frontend-react-specialist`
  - Time: 15-20 min
  - Depends: task-be-3 (API contract)
  - [Details](tasks/task-fe-7.md)

---

## Phase 4: Integration

- [ ] **task-int-1** - Frontend-Backend data flow integration
  - Agent: `integration-coordinator`
  - Time: 30-35 min
  - Depends: task-fe-6, task-be-6
  - [Details](tasks/task-int-1.md)

- [ ] **task-int-2** - E2E test selector alignment
  - Agent: `quality-assurance`
  - Time: 25-30 min
  - Depends: task-int-1
  - [Details](tasks/task-int-2.md)

- [ ] **task-int-3** - Error handling and edge cases
  - Agent: `integration-coordinator`
  - Time: 25-30 min
  - Depends: task-int-1
  - [Details](tasks/task-int-3.md)

---

## Phase 5: Final Validation

- [ ] **task-val-1** - Run and pass all E2E tests
  - Agent: `quality-assurance`
  - Time: 30-40 min
  - Depends: task-int-2, task-int-3
  - [Details](tasks/task-val-1.md)

- [ ] **task-val-2** - Final quality review and TypeScript check
  - Agent: `quality-assurance`
  - Time: 20-25 min
  - Depends: task-val-1
  - [Details](tasks/task-val-2.md)

---

## Dependency Graph

```
Phase 2 (Backend):
task-be-1 ──┬──► task-be-3 ──┬──► task-be-6
task-be-2 ──┤              │
            ├──► task-be-4 ──┤
            └──► task-be-5 ──┘

Phase 3 (Frontend):
task-be-2 ──► task-fe-1 ──┬──► task-fe-5 ──► task-fe-6
            task-fe-2 ──┤
task-be-2 ──► task-fe-3 ──┤
task-be-3 ──► task-fe-4 ──┘
task-be-3 ──► task-fe-7

Phase 4 (Integration):
task-fe-6 ──┬──► task-int-1 ──┬──► task-int-2 ──► task-val-1
task-be-6 ──┘              └──► task-int-3 ──┘

Phase 5 (Validation):
task-val-1 ──► task-val-2
```

## Parallel Execution Opportunities

### Wave 1 (No dependencies)
- task-be-1 (ProductService)
- task-be-2 (Zod schemas)
- task-fe-2 (DeleteDialog - no backend needed)

### Wave 2 (After Wave 1)
- task-be-3 (GET/POST route)
- task-be-4 (CRUD route)
- task-be-5 (Publish route)
- task-fe-1 (ProductCard)
- task-fe-3 (ProductForm)

### Wave 3 (After Wave 2)
- task-be-6 (Backend verification)
- task-fe-4 (SWR hook)
- task-fe-7 (Types)

### Wave 4 (After Wave 3)
- task-fe-5 (ProductList)

### Wave 5 (After Wave 4)
- task-fe-6 (Dashboard page)

### Wave 6 (After Wave 5)
- task-int-1, task-int-2, task-int-3 (Integration)

### Wave 7 (Final)
- task-val-1, task-val-2 (Validation)

---

## Success Metrics

- [ ] All 6 E2E tests pass (Tests 9.1-9.7 in 09-product-management.spec.ts)
- [ ] No TypeScript errors (`npm run type-check`)
- [ ] No ESLint errors (`npm run lint`)
- [ ] API response times < 500ms
- [ ] All CRUD operations work end-to-end
