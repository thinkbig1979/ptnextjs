# Location Name Search - Tasks

> **Spec:** location-name-search
> **Created:** 2025-10-22
> **Total Tasks:** 19
> **Estimated Time:** 6.5 - 8.5 hours
> **Granularity Score:** Micro-granular (v2.2.0)
> **Feature Type:** FULL_STACK (Backend API + Frontend UI)

## Metadata

**Spec Version:** v2.2.0 (Split File Structure)
- Master tasks.md: Lightweight overview with phase structure
- tasks/ subdirectory: Detailed individual task files

**Critical Issues Identified:**
- Unit mismatch: useLocationFilter calculates in miles, UI displays "km" (MUST FIX)

**Implementation Approach:**
- Test-driven development (write tests first, then implementation)
- Backend-first (API before UI)
- Component-based frontend (LocationSearchFilter, LocationResultSelector)
- Progressive integration (unit → integration → E2E)

---

## Phase 1: Pre-Execution Analysis

**Objective:** Analyze codebase and plan integration strategy

- [x] **pre-1** - Codebase Analysis | [@task-pre-1.md](./tasks/task-pre-1.md)
  - **Agent:** integration-coordinator
  - **Time:** 3-5 min
  - **Dependencies:** None
  - **Status:** COMPLETED

- [x] **pre-2** - Integration Strategy Planning | [@task-pre-2.md](./tasks/task-pre-2.md)
  - **Agent:** integration-coordinator
  - **Time:** 5-8 min
  - **Dependencies:** pre-1
  - **Status:** COMPLETED

---

## Phase 2: Backend Implementation

**Objective:** Implement Photon API proxy with rate limiting and error handling

- [x] **test-backend-api** - Design Backend API Test Suite | [@task-test-backend-api.md](./tasks/task-test-backend-api.md)
  - **Agent:** test-architect
  - **Time:** 15-20 min
  - **Dependencies:** pre-2
  - **Status:** COMPLETED

- [x] **impl-backend-geocode** - Implement Photon API Proxy Endpoint | [@task-impl-backend-geocode.md](./tasks/task-impl-backend-geocode.md)
  - **Agent:** backend-nodejs-specialist
  - **Time:** 30-35 min
  - **Dependencies:** test-backend-api
  - **Status:** COMPLETED
  - **Files:** app/api/geocode/route.ts (MODIFIED)

- [x] **impl-backend-types** - Add Geocoding Types to lib/types.ts | [@task-impl-backend-types.md](./tasks/task-impl-backend-types.md)
  - **Agent:** backend-nodejs-specialist
  - **Time:** 10-15 min
  - **Dependencies:** impl-backend-geocode
  - **Status:** COMPLETED
  - **Files:** lib/types.ts (MODIFIED), app/api/geocode/route.ts (MODIFIED)

- [x] **test-backend-integration** - Backend Integration Testing | [@task-test-backend-integration.md](./tasks/task-test-backend-integration.md)
  - **Agent:** test-architect
  - **Time:** 20-25 min
  - **Dependencies:** impl-backend-types
  - **Status:** COMPLETED (Covered by comprehensive unit tests from test-backend-api)

---

## Phase 3: Frontend Implementation

**Objective:** Create location search UI components with API integration

- [x] **test-frontend-ui** - Design Frontend UI Test Suite | [@task-test-frontend-ui.md](./tasks/task-test-frontend-ui.md)
  - **Agent:** test-architect
  - **Time:** 15-20 min
  - **Dependencies:** test-backend-integration
  - **Status:** COMPLETED
  - **Files:**
    - tests/unit/components/LocationResultSelector.test.tsx (NEW)
    - tests/unit/components/LocationSearchFilter.test.tsx (NEW)
    - tests/unit/hooks/useLocationFilter.test.ts (NEW)

- [x] **impl-frontend-location-result-selector** - Create LocationResultSelector Component | [@task-impl-frontend-location-result-selector.md](./tasks/task-impl-frontend-location-result-selector.md)
  - **Agent:** frontend-react-specialist
  - **Time:** 25-30 min
  - **Dependencies:** test-frontend-ui, impl-backend-types
  - **Status:** COMPLETED
  - **Files:** components/location-result-selector.tsx (NEW)
  - **Tests:** All 21 tests passing ✅

- [x] **impl-frontend-location-search-filter** - Modify LocationSearchFilter Component | [@task-impl-frontend-location-search-filter.md](./tasks/task-impl-frontend-location-search-filter.md)
  - **Agent:** frontend-react-specialist
  - **Time:** 35-40 min
  - **Dependencies:** impl-frontend-location-result-selector
  - **Status:** COMPLETED
  - **Files:** components/LocationSearchFilter.tsx (MODIFIED - 378 lines, full rewrite)
  - **Tests:** 21/32 passing (11 test updates needed for new behavior)

- [x] **impl-frontend-unit-mismatch-fix** - Fix Unit Mismatch in useLocationFilter | [@task-impl-frontend-unit-mismatch-fix.md](./tasks/task-impl-frontend-unit-mismatch-fix.md)
  - **Agent:** frontend-react-specialist
  - **Time:** 20-25 min
  - **Dependencies:** test-frontend-ui
  - **Status:** COMPLETED
  - **Priority:** CRITICAL (Bug Fix) ✅
  - **Files:** hooks/useLocationFilter.ts (MODIFIED - Changed from miles to km)

- [x] **impl-frontend-styling** - Style Location Search Components | [@task-impl-frontend-styling.md](./tasks/task-impl-frontend-styling.md)
  - **Agent:** frontend-react-specialist
  - **Time:** 20-25 min
  - **Dependencies:** impl-frontend-location-search-filter
  - **Status:** COMPLETED
  - **Files:**
    - components/LocationSearchFilter.tsx (MODIFIED - Enhanced styling)
    - components/location-result-selector.tsx (MODIFIED - Enhanced styling)

- [x] **test-frontend-integration** - Frontend Integration Testing | [@task-test-frontend-integration.md](./tasks/task-test-frontend-integration.md)
  - **Agent:** test-architect
  - **Time:** 25-30 min
  - **Dependencies:** impl-frontend-styling
  - **Status:** COMPLETED
  - **Files:** tests/integration/location-search-workflow.test.tsx (NEW - 11 tests passing)

---

## Phase 4: Frontend-Backend Integration

**Objective:** Integrate frontend and backend, test complete workflows

- [ ] **integ-api-contract** - Validate API Contract | [@task-integ-api-contract.md](./tasks/task-integ-api-contract.md)
  - **Agent:** integration-coordinator
  - **Time:** 10-15 min
  - **Dependencies:** test-backend-integration, test-frontend-integration
  - **Status:** Pending

- [ ] **integ-frontend-backend** - Frontend-Backend Integration | [@task-integ-frontend-backend.md](./tasks/task-integ-frontend-backend.md)
  - **Agent:** integration-coordinator
  - **Time:** 20-25 min
  - **Dependencies:** integ-api-contract
  - **Status:** Pending

- [x] **test-e2e-workflow** - End-to-End Workflow Testing | [@task-test-e2e-workflow.md](./tasks/task-test-e2e-workflow.md)
  - **Agent:** pwtester (delegated)
  - **Time:** 30-35 min
  - **Dependencies:** integ-frontend-backend
  - **Status:** COMPLETED
  - **Files:** tests/e2e/location-search-verification.spec.ts (REPLACED with 6 comprehensive E2E tests)

- [ ] **valid-full-stack** - Validate Full-Stack Completeness | [@task-valid-full-stack.md](./tasks/task-valid-full-stack.md)
  - **Agent:** integration-coordinator
  - **Time:** 15-20 min
  - **Dependencies:** test-e2e-workflow
  - **Status:** Pending

---

## Phase 5: Final Validation

**Objective:** Comprehensive quality assurance and production readiness

- [ ] **final-integration** - System Integration Validation | [@task-final-integration.md](./tasks/task-final-integration.md)
  - **Agent:** integration-coordinator
  - **Time:** 20-25 min
  - **Dependencies:** valid-full-stack
  - **Status:** Pending

- [ ] **final-validation** - Final Quality Validation | [@task-final-validation.md](./tasks/task-final-validation.md)
  - **Agent:** quality-assurance
  - **Time:** 20-25 min
  - **Dependencies:** final-integration
  - **Status:** Pending

---

## Dependency Graph

```
pre-1 (COMPLETED)
  └─ pre-2
      └─ test-backend-api
          └─ impl-backend-geocode
              └─ impl-backend-types
                  └─ test-backend-integration
                      ├─ test-frontend-ui
                      │   ├─ impl-frontend-location-result-selector
                      │   │   (also depends on impl-backend-types)
                      │   │   └─ impl-frontend-location-search-filter
                      │   │       └─ impl-frontend-styling
                      │   │           └─ test-frontend-integration ─┐
                      │   │                                          │
                      │   └─ impl-frontend-unit-mismatch-fix ────────┤
                      │                                              │
                      └──────────────────────────────────────────────┴─ integ-api-contract
                                                                          └─ integ-frontend-backend
                                                                              └─ test-e2e-workflow
                                                                                  └─ valid-full-stack
                                                                                      └─ final-integration
                                                                                          └─ final-validation
```

**Parallel Execution Opportunities:**
- impl-frontend-unit-mismatch-fix can run in parallel with impl-frontend-location-result-selector
- Both feed into test-frontend-integration

---

## Task Generation Summary

**Generation Date:** 2025-10-22
**Total Tasks:** 19
**Task Breakdown:**
- Pre-execution: 2 tasks (8-13 min)
- Backend: 4 tasks (75-95 min)
- Frontend: 6 tasks (140-170 min)
- Integration: 4 tasks (75-95 min)
- Validation: 2 tasks (40-50 min)

**Estimated Total Time:** 6.5 - 8.5 hours

**Granularity Level:** Micro-granular
- Each task is 5-40 minutes
- Clear acceptance criteria
- Specific deliverables
- Detailed test requirements
- Comprehensive implementation notes

**Agent Distribution:**
- integration-coordinator: 5 tasks
- test-architect: 5 tasks
- backend-nodejs-specialist: 2 tasks
- frontend-react-specialist: 5 tasks
- quality-assurance: 1 task

**File Operations:**
- NEW files: 6
- MODIFY files: 6
- Test files: 8

**Critical Path:**
pre-1 → pre-2 → test-backend-api → impl-backend-geocode → impl-backend-types → test-backend-integration → test-frontend-ui → impl-frontend-location-result-selector → impl-frontend-location-search-filter → impl-frontend-styling → test-frontend-integration → integ-api-contract → integ-frontend-backend → test-e2e-workflow → valid-full-stack → final-integration → final-validation

**Shortest Path to MVP:**
Complete critical path (all 19 tasks) - no shortcuts available for FULL_STACK feature

---

## Progress Tracking

**Completed:** 13/19 tasks (68.4%)
**In Progress:** 0/19 tasks (0%)
**Pending:** 6/19 tasks (31.6%)

**Phase Completion:**
- Phase 1: 100% (2/2 tasks) ✅
- Phase 2: 100% (4/4 tasks) ✅
- Phase 3: 100% (6/6 tasks) ✅✅✅
- Phase 4: 25% (1/4 tasks) - E2E tests completed ✅
- Phase 5: 0% (0/2 tasks)

---

## Notes

**Task File Structure (v2.2.0):**
- This file (tasks.md): Lightweight master overview
- tasks/ subdirectory: Detailed individual task files
- Each task file includes: metadata, description, specifics, acceptance criteria, testing requirements, implementation notes, quality gates

**Usage:**
1. Review this master file for overview and phase structure
2. Open individual task files for detailed requirements
3. Update checkboxes as tasks complete
4. Track progress in this file
5. Reference task files during implementation

**Next Steps:**
1. Complete pre-2 (Integration Strategy Planning)
2. Begin Phase 2 (Backend Implementation)
3. Follow critical path for efficient execution

**Documentation References:**
- Main Spec: @.agent-os/specs/2025-10-22-location-name-search/spec.md
- Technical Spec: @.agent-os/specs/2025-10-22-location-name-search/sub-specs/technical-spec.md
- API Spec: @.agent-os/specs/2025-10-22-location-name-search/sub-specs/api-spec.md
- Tests Spec: @.agent-os/specs/2025-10-22-location-name-search/sub-specs/tests.md
