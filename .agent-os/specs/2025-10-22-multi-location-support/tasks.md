# Spec Tasks - Multi-Location Support for Vendors

> Spec: Multi-Location Support for Vendors
> Generated: 2025-10-23
> Updated: 2025-10-23 (Added PRE-3 for location-name-search coordination)
> Total Tasks: 20
> Estimated Total Time: 7.25-9.25 hours

## Task Overview

This tasks file provides a lightweight overview of all tasks. Individual task detail files are located in the `tasks/` directory and contain comprehensive implementation requirements, acceptance criteria, testing specifications, and evidence requirements.

---

## Phase 1: Pre-Execution Analysis

**Purpose**: Analyze codebase and plan integration strategy before implementation begins.

**Estimated Phase Time**: 16-25 minutes

| Task ID | Title | Agent | Time | Status | Details |
|---------|-------|-------|------|--------|---------|
| PRE-1 | Pre-Execution Codebase Analysis | context-fetcher | 3-5 min | [ ] Not Started | @tasks/task-pre-1.md |
| PRE-2 | Integration Strategy and Dependency Planning | context-fetcher | 3-5 min | [ ] Not Started | @tasks/task-pre-2.md |
| PRE-3 | Update useLocationFilter Hook for Multi-Location | frontend-react-specialist | 10-15 min | [ ] Not Started | @tasks/task-pre-3-update-location-filter.md |

**Phase Dependencies**:
- None (PRE-1 and PRE-2 are starting points)
- **PRE-3 depends on**: location-name-search feature being deployed (provides useLocationFilter hook)

**Critical Note**: PRE-3 updates the existing `useLocationFilter` hook from location-name-search to support the new `locations[]` array format. This update maintains backward compatibility during the transition period.

---

## Phase 2: Backend Implementation

**Purpose**: Implement database schema, migration, API endpoints, and business logic.

**Estimated Phase Time**: 2-3 hours

| Task ID | Title | Agent | Time | Status | Details |
|---------|-------|-------|------|--------|---------|
| TEST-BACKEND-SCHEMA | Backend Schema Test Design | test-architect | 20-25 min | [ ] Not Started | @tasks/task-test-backend-schema.md |
| IMPL-BACKEND-SCHEMA | Database Schema Implementation | backend-nodejs-specialist | 30-35 min | [ ] Not Started | @tasks/task-impl-backend-schema.md |
| IMPL-BACKEND-MIGRATION | Data Migration Script | backend-nodejs-specialist | 25-30 min | [ ] Not Started | @tasks/task-impl-backend-migration.md |
| IMPL-BACKEND-API | API Endpoint Implementation | backend-nodejs-specialist | 35-40 min | [ ] Not Started | @tasks/task-impl-backend-api.md |
| TEST-BACKEND-INTEGRATION | Backend Integration Testing | test-architect | 25-30 min | [ ] Not Started | @tasks/task-test-backend-integration.md |

**Phase Dependencies**: PRE-2 → All Phase 2 tasks

**Key Deliverables**:
- Modified Payload CMS vendors collection with locations array field
- VendorLocation TypeScript interface in lib/types.ts
- Migration script converting single location to locations array
- PATCH /api/vendors/:id endpoint handling locations updates
- GET /api/vendors/search endpoint for location-based queries
- LocationService and SearchService business logic
- Comprehensive backend test suite with >80% coverage

---

## Phase 3: Frontend Implementation

**Purpose**: Build UI components, forms, map integration, and tier-based access control.

**Estimated Phase Time**: 3-4 hours

| Task ID | Title | Agent | Time | Status | Details |
|---------|-------|-------|------|--------|---------|
| TEST-FRONTEND-UI | Frontend UI Test Design | test-architect | 20-25 min | [ ] Not Started | @tasks/task-test-frontend-ui.md |
| IMPL-NAVIGATION | Navigation Integration | frontend-react-specialist | 15-20 min | [ ] Not Started | @tasks/task-impl-navigation.md |
| IMPL-DASHBOARD-LOCATIONS | Dashboard Locations Manager | frontend-react-specialist | 30-35 min | [ ] Not Started | @tasks/task-impl-dashboard-locations.md |
| IMPL-GEOCODING | Geocoding Integration | frontend-react-specialist | 20-25 min | [ ] Not Started | @tasks/task-impl-geocoding.md |
| IMPL-MAP-COMPONENT | Map Component Implementation | frontend-react-specialist | 25-30 min | [ ] Not Started | @tasks/task-impl-map-component.md |
| IMPL-PUBLIC-PROFILE | Public Profile Locations Display | frontend-react-specialist | 25-30 min | [ ] Not Started | @tasks/task-impl-public-profile.md |
| IMPL-TIER-GATING | Tier-Based Access Control | frontend-react-specialist | 20-25 min | [ ] Not Started | @tasks/task-impl-tier-gating.md |
| TEST-FRONTEND-INTEGRATION | Frontend Integration Testing | test-architect | 25-30 min | [ ] Not Started | @tasks/task-test-frontend-integration.md |

**Phase Dependencies**:
- PRE-2 → TEST-FRONTEND-UI, IMPL-NAVIGATION, IMPL-MAP-COMPONENT
- TEST-FRONTEND-UI → All IMPL-* tasks
- IMPL-NAVIGATION → IMPL-DASHBOARD-LOCATIONS, IMPL-PUBLIC-PROFILE
- IMPL-MAP-COMPONENT → IMPL-PUBLIC-PROFILE
- IMPL-TIER-GATING → TEST-FRONTEND-INTEGRATION

**Key Deliverables**:
- LocationsManagerCard component for dashboard profile management
- LocationFormFields component with validation
- TierUpgradePrompt component for tier0/1 vendors
- GeocodingButton with geocode.maps.co API integration
- LocationMapPreview component with react-leaflet
- LocationsDisplaySection for public vendor profiles
- TierGate component and TierService for access control
- Comprehensive frontend test suite with >80% coverage
- "Locations" tab added to vendor public profile navigation

---

## Phase 4: Frontend-Backend Integration

**Purpose**: Validate API contracts and test complete workflows across full stack.

**Estimated Phase Time**: 1.5-2 hours

| Task ID | Title | Agent | Time | Status | Details |
|---------|-------|------|--------|---------|
| INTEG-API-CONTRACT | API Contract Validation | integration-coordinator | 20-25 min | [ ] Not Started | @tasks/task-integ-api-contract.md |
| INTEG-FRONTEND-BACKEND | Frontend-Backend Integration | integration-coordinator | 25-30 min | [ ] Not Started | @tasks/task-integ-frontend-backend.md |
| TEST-E2E-WORKFLOW | End-to-End Workflow Testing | test-architect | 30-35 min | [ ] Not Started | @tasks/task-test-e2e-workflow.md |

**Phase Dependencies**:
- TEST-BACKEND-INTEGRATION, TEST-FRONTEND-INTEGRATION → INTEG-API-CONTRACT
- INTEG-API-CONTRACT → INTEG-FRONTEND-BACKEND
- INTEG-FRONTEND-BACKEND → TEST-E2E-WORKFLOW

**Key Deliverables**:
- API contract tests validating request/response structures
- Full-stack integration tests (UI → API → Database → API → UI)
- End-to-end Playwright tests covering all user stories
- Verified data consistency across all layers
- Browser compatibility validation (Chrome, Firefox, Safari)

---

## Phase 5: Final Validation

**Purpose**: Comprehensive quality validation and production readiness verification.

**Estimated Phase Time**: 30-35 minutes

| Task ID | Title | Agent | Time | Status | Details |
|---------|-------|-------|------|--------|---------|
| FINAL-VALIDATION | Final Quality Validation | quality-assurance | 30-35 min | [ ] Not Started | @tasks/task-final-validation.md |

**Phase Dependencies**: TEST-E2E-WORKFLOW → FINAL-VALIDATION

**Key Deliverables**:
- All test suites passing (unit, integration, E2E)
- Production build successful
- Performance audit (Lighthouse >90)
- Accessibility audit (WCAG 2.1 AA compliance)
- Browser compatibility verified
- Migration guide document
- Updated CLAUDE.md with feature details
- Feature documentation for end users

---

## Dependency Graph

```
Phase 0: External Dependency
  [location-name-search feature deployed]
    ↓ (provides /api/geocode and useLocationFilter hook)
    ↓
Phase 1: Pre-Execution
  PRE-1 (context-fetcher)
    ↓
  PRE-2 (context-fetcher)
    ↓
  PRE-3 (frontend-react-specialist) ← Updates useLocationFilter hook
    ↓
    ├─────────────────────────────────────────┐
    ↓                                         ↓
Phase 2: Backend                    Phase 3: Frontend
  TEST-BACKEND-SCHEMA                 TEST-FRONTEND-UI
    ↓                                   ↓
  IMPL-BACKEND-SCHEMA          ┌──────┼──────┬─────────────┐
    ↓                          ↓      ↓      ↓             ↓
  IMPL-BACKEND-MIGRATION    IMPL-   IMPL-  IMPL-        IMPL-
    ↓                      NAVIGATION GEOCODING MAP-     TIER-
  IMPL-BACKEND-API            ↓               ↓ COMPONENT GATING
    ↓                         ↓               ↓    ↓        ↓
  TEST-BACKEND-INTEGRATION    ↓               ↓    ↓        ↓
    ↓                    IMPL-DASHBOARD- ←────┘    ↓        ↓
    ↓                    LOCATIONS               IMPL-      ↓
    ↓                         ↓                  PUBLIC-    ↓
    ↓                         ↓                  PROFILE    ↓
    ↓                         ↓                     ↓       ↓
    ↓                         └─────────────────────┴───────┘
    ↓                                   ↓
    ↓                         TEST-FRONTEND-INTEGRATION
    ↓                                   ↓
    └───────────────┬───────────────────┘
                    ↓
Phase 4: Integration
  INTEG-API-CONTRACT
    ↓
  INTEG-FRONTEND-BACKEND
    ↓
  TEST-E2E-WORKFLOW
    ↓
Phase 5: Final
  FINAL-VALIDATION
```

---

## Task Execution Guide

### For context-fetcher Agent
Execute Phase 1 analysis tasks sequentially:
1. PRE-1: Analyze codebase structure and patterns
2. PRE-2: Plan integration strategy and dependencies

### For frontend-react-specialist Agent
Execute Phase 1 coordination task:
1. PRE-3: Update useLocationFilter hook to support locations[] array
   - **Critical**: This updates shared infrastructure used by both features
   - **Must complete before**: Backend schema implementation begins
   - **Tests required**: All existing tests must pass + new multi-location tests

### For backend-nodejs-specialist Agent
Execute Phase 2 backend tasks in order:
1. Wait for TEST-BACKEND-SCHEMA (test-architect)
2. IMPL-BACKEND-SCHEMA: Implement schema changes
3. IMPL-BACKEND-MIGRATION: Create migration script
4. IMPL-BACKEND-API: Implement API endpoints

### For frontend-react-specialist Agent
Execute Phase 3 frontend tasks with dependencies:
1. Wait for TEST-FRONTEND-UI (test-architect)
2. IMPL-NAVIGATION: Add navigation elements
3. IMPL-GEOCODING: Implement geocoding (parallel with navigation)
4. IMPL-MAP-COMPONENT: Build map component (parallel with above)
5. IMPL-TIER-GATING: Implement tier access (parallel with above)
6. IMPL-DASHBOARD-LOCATIONS: Build dashboard UI (after navigation)
7. IMPL-PUBLIC-PROFILE: Build public profile display (after map component + navigation)
8. Wait for TEST-FRONTEND-INTEGRATION (test-architect)

### For test-architect Agent
Execute test tasks at phase boundaries:
1. TEST-BACKEND-SCHEMA: Before backend implementation starts
2. TEST-FRONTEND-UI: Before frontend implementation starts
3. TEST-BACKEND-INTEGRATION: After backend implementation complete
4. TEST-FRONTEND-INTEGRATION: After frontend implementation complete
5. TEST-E2E-WORKFLOW: After integration phase complete

### For integration-coordinator Agent
Execute Phase 4 integration tasks sequentially:
1. INTEG-API-CONTRACT: Validate API contracts
2. INTEG-FRONTEND-BACKEND: Test full-stack integration
3. Wait for TEST-E2E-WORKFLOW (test-architect)

### For quality-assurance Agent
Execute final validation:
1. FINAL-VALIDATION: Comprehensive quality check and production readiness

---

## Task Generation Summary

This task breakdown follows Agent OS v2.1 optimized structure:

- **Master File**: Lightweight overview (~100 lines) for task selection
- **Detail Files**: 19 comprehensive task files in tasks/ directory
- **Context Optimization**: Load only relevant task details when executing
- **Agent Specialization**: Tasks assigned to appropriate specialist agents
- **Dependency Clarity**: Clear dependency graph for orchestrated execution
- **Evidence Requirements**: Each task specifies required evidence for completion
- **Testing Requirements**: Comprehensive testing at every phase
- **Quality Gates**: Clear quality criteria for each task

**Usage**:
- Review this file to understand task overview and dependencies
- Reference individual task detail files in tasks/ directory for implementation
- Follow dependency graph to determine execution order
- Use agent assignments to delegate to appropriate specialist agents

---

**Next Steps**:
1. Execute PRE-1 with context-fetcher agent to begin codebase analysis
2. Follow dependency graph for subsequent task execution
3. Verify all acceptance criteria before marking tasks complete
4. Collect evidence artifacts as specified in each task detail file
