---
version: 5.4.0
last-updated: 2026-01-15
description: Semantic coverage validation for specifications - ensures all workflow aspects are addressed
related-files:
  - instructions/core/spec-steps/step-13-14-review-validation.md
  - instructions/core/validate-quality.md
  - instructions/utilities/data-flow-tracing.md
  - instructions/utilities/integration-impact-analysis.md
---

# Post-Spec Coverage Checklist

## Purpose

This checklist validates **semantic coverage** - ensuring the specification addresses all aspects of the user workflow, not just structural completeness. Run this AFTER all spec files are created but BEFORE user review.

**Key Insight**: Structural validation (files exist, sections present) is necessary but insufficient. A spec can be structurally complete yet miss critical workflow aspects like error states, data validation, or navigation flows.

## When to Use

- After Step 12 (all spec files created) in `/create-spec`
- Before Step 13 (user review)
- As part of `/validate-quality` Step 2.8

## Coverage Categories

### 1. UI & User Workflow Coverage

```yaml
ui_workflow_validation:
  # For each user-facing feature, verify:
  
  screens_identified:
    check: "Have we identified ALL screens/views the user will interact with?"
    location: "sub-specs/ux-ui-spec.md → Route Structure"
    required_for: "frontend features"
    validation: |
      COUNT routes in ux-ui-spec.md
      VERIFY each route has:
        - Purpose description
        - Entry points (how user gets here)
        - Exit points (where user goes next)
      FLAG if any "TBD" or "TODO" in routes
    finding_if_missing:
      severity: P1
      title: "Incomplete screen/route inventory"

  navigation_flow:
    check: "Is the navigation flow between screens fully specified?"
    location: "sub-specs/ux-ui-spec.md → Navigation Structure"
    required_for: "multi-page features"
    validation: |
      FOR each screen:
        VERIFY: Can reach from at least one other screen OR is entry point
        VERIFY: Has at least one exit OR is terminal screen
        VERIFY: Back/cancel behavior specified
      BUILD navigation graph, CHECK for orphan screens
    finding_if_missing:
      severity: P2
      title: "Navigation flow incomplete or has orphan screens"

  empty_states:
    check: "Are empty states specified for all data-driven views?"
    location: "sub-specs/ux-ui-spec.md → Component Specifications"
    required_for: "features displaying lists or data"
    validation: |
      FOR each list/table/data view component:
        VERIFY: Empty state UI specified
        VERIFY: Empty state message/CTA defined
        VERIFY: First-time vs returning user empty state (if different)
    finding_if_missing:
      severity: P2
      title: "Missing empty state specifications"

  loading_states:
    check: "Are loading states specified for async operations?"
    location: "sub-specs/ux-ui-spec.md → Component Specifications"
    required_for: "features with API calls or async operations"
    validation: |
      FOR each async operation:
        VERIFY: Loading indicator type specified (skeleton, spinner, etc.)
        VERIFY: Partial loading behavior (if applicable)
        VERIFY: Loading state accessibility (aria-busy, etc.)
    finding_if_missing:
      severity: P2
      title: "Missing loading state specifications"

  error_states:
    check: "Are error states specified for all failure scenarios?"
    location: "sub-specs/ux-ui-spec.md → Component Specifications"
    required_for: "all user-facing features"
    validation: |
      FOR each form/action:
        VERIFY: Field-level error display specified
        VERIFY: Form-level error summary specified
        VERIFY: Error recovery path documented
      FOR each API call:
        VERIFY: Error message display location specified
        VERIFY: Retry mechanism (if applicable)
    finding_if_missing:
      severity: P1
      title: "Missing error state specifications"

  feedback_mechanisms:
    check: "Are user feedback mechanisms specified (toasts, confirmations, progress)?"
    location: "technical-spec.md → User Feedback OR sub-specs/ux-ui-spec.md"
    required_for: "features with user actions"
    validation: |
      FOR each destructive action:
        VERIFY: Confirmation dialog specified
      FOR each state-changing action:
        VERIFY: Success feedback specified (toast, redirect, inline)
      FOR long operations (>2s):
        VERIFY: Progress indicator specified
    finding_if_missing:
      severity: P2
      title: "Missing user feedback specifications"
```

### 2. Data & Backend Coverage

```yaml
data_backend_validation:
  # For each data entity, verify end-to-end coverage
  
  database_schema:
    check: "Are all necessary database schema changes identified?"
    location: "database-schema.md"
    required_for: "features with data persistence"
    validation: |
      FOR each new entity in spec:
        VERIFY: Table/collection defined
        VERIFY: All fields specified with types
        VERIFY: Indexes defined for query patterns
        VERIFY: Relationships/foreign keys defined
      FOR each existing entity modified:
        VERIFY: Migration strategy documented
    finding_if_missing:
      severity: P1
      title: "Incomplete database schema specification"

  api_endpoints:
    check: "Have we specified all API endpoints/mutations/queries needed?"
    location: "api-spec.md"
    required_for: "features with client-server communication"
    validation: |
      FOR each UI action that modifies data:
        VERIFY: Corresponding API endpoint exists
      FOR each data display:
        VERIFY: Corresponding query/fetch endpoint exists
      FOR each endpoint:
        VERIFY: Request/response schema defined
        VERIFY: Error responses documented
        VERIFY: Authentication requirements specified
    finding_if_missing:
      severity: P1
      title: "Missing API endpoint specifications"

  client_validation:
    check: "Is data validation covered on the client?"
    location: "technical-spec.md → Validation OR sub-specs/ux-ui-spec.md"
    required_for: "features with user input"
    validation: |
      FOR each form field:
        VERIFY: Validation rules specified (required, format, length, etc.)
        VERIFY: Real-time vs submit-time validation specified
        VERIFY: Error message text defined
    finding_if_missing:
      severity: P2
      title: "Missing client-side validation specifications"

  server_validation:
    check: "Is data validation covered on the server?"
    location: "technical-spec.md → Backend Implementation"
    required_for: "features with data persistence"
    validation: |
      FOR each API endpoint accepting data:
        VERIFY: Input validation rules specified
        VERIFY: Sanitization requirements documented
        VERIFY: Validation error response format defined
    finding_if_missing:
      severity: P1
      title: "Missing server-side validation specifications"

  data_migration:
    check: "Have we addressed data migration needs for existing records?"
    location: "database-schema.md → Migration Strategy"
    required_for: "features modifying existing data structures"
    validation: |
      IF schema changes affect existing data:
        VERIFY: Migration script approach documented
        VERIFY: Rollback strategy defined
        VERIFY: Data transformation rules specified
        VERIFY: Estimated migration time/impact noted
    finding_if_missing:
      severity: P1
      title: "Missing data migration strategy"
```

### 3. Edge Cases & Error Handling

```yaml
edge_case_validation:
  # Verify error scenarios and edge cases are addressed
  
  error_scenarios:
    check: "What happens when things go wrong? Are error scenarios handled?"
    location: "technical-spec.md → Error Handling"
    required_for: "all features"
    validation: |
      VERIFY sections exist for:
        - Network failure handling
        - Server error handling (500s)
        - Client error handling (400s)
        - Timeout handling
        - Partial failure handling (if batch operations)
    finding_if_missing:
      severity: P1
      title: "Missing error scenario handling"

  permission_checks:
    check: "Have we considered permission/authorization checks at every relevant step?"
    location: "technical-spec.md → Security OR api-spec.md"
    required_for: "features with access control"
    validation: |
      FOR each API endpoint:
        VERIFY: Required permissions/roles documented
        VERIFY: Unauthorized response behavior specified
      FOR each UI element:
        VERIFY: Visibility rules based on permissions
        VERIFY: Disabled vs hidden behavior for unauthorized actions
    finding_if_missing:
      severity: P1
      title: "Missing permission/authorization specifications"

  race_conditions:
    check: "Are there race conditions or concurrent access scenarios to address?"
    location: "technical-spec.md → Concurrency"
    required_for: "features with shared state or multi-user access"
    validation: |
      IDENTIFY shared resources (documents, records, settings)
      FOR each shared resource:
        VERIFY: Concurrent edit handling specified (optimistic locking, etc.)
        VERIFY: Conflict resolution strategy documented
        VERIFY: Real-time sync requirements (if applicable)
    finding_if_missing:
      severity: P2
      title: "Missing concurrency/race condition handling"

  boundary_conditions:
    check: "Are boundary conditions handled (empty, null, max values)?"
    location: "technical-spec.md → Validation"
    required_for: "features with numeric or text input"
    validation: |
      FOR each input field:
        VERIFY: Min/max values specified
        VERIFY: Empty/null handling specified
        VERIFY: Overflow/truncation behavior documented
      FOR each list/collection:
        VERIFY: Max items limit specified (if any)
        VERIFY: Pagination strategy for large datasets
    finding_if_missing:
      severity: P2
      title: "Missing boundary condition specifications"
```

### 4. Integration & Dependencies

```yaml
integration_validation:
  # Verify integration with existing system
  
  existing_feature_integration:
    check: "Does this feature integrate correctly with existing features?"
    location: "integration-requirements.md"
    required_for: "all features"
    validation: |
      IDENTIFY existing features in same domain
      FOR each related feature:
        VERIFY: Integration points documented
        VERIFY: Data sharing approach specified
        VERIFY: UI consistency with existing patterns
    finding_if_missing:
      severity: P2
      title: "Missing integration with existing features"

  dependency_identification:
    check: "Have we identified all dependencies on other systems or components?"
    location: "integration-requirements.md → External Dependencies"
    required_for: "features using external services"
    validation: |
      FOR each external service/API:
        VERIFY: Service identified and documented
        VERIFY: Failure handling specified
        VERIFY: Rate limits/quotas documented
        VERIFY: Authentication mechanism specified
    finding_if_missing:
      severity: P1
      title: "Missing external dependency specifications"

  breaking_changes:
    check: "Will this break or require changes to any existing functionality?"
    location: "integration-requirements.md → Impact Analysis"
    required_for: "features modifying shared code or APIs"
    validation: |
      SCAN for changes to:
        - Public API contracts
        - Shared components
        - Database schema
        - Configuration format
      FOR each breaking change:
        VERIFY: Migration path documented
        VERIFY: Deprecation strategy (if applicable)
        VERIFY: Affected consumers identified
    finding_if_missing:
      severity: P1
      title: "Breaking changes not documented"
```

### 5. Testing & Validation

```yaml
testing_validation:
  # Verify testing strategy is complete
  
  task_verifiability:
    check: "Can each task be verified independently?"
    location: "Each task file in tasks/"
    required_for: "all tasks"
    validation: |
      FOR each task:
        VERIFY: Acceptance criteria are specific and measurable
        VERIFY: Success can be determined without external context
        VERIFY: Test commands or verification steps included
    finding_if_missing:
      severity: P2
      title: "Tasks lack independent verifiability"

  testable_acceptance_criteria:
    check: "Have we specified acceptance criteria that are actually testable?"
    location: "spec.md → Success Metrics, task files"
    required_for: "all features"
    validation: |
      FOR each acceptance criterion:
        VERIFY: Contains specific, measurable outcome
        VERIFY: Does NOT contain vague terms (properly, correctly, appropriate)
        VERIFY: Can be automated or has clear manual test steps
    finding_if_missing:
      severity: P2
      title: "Acceptance criteria not testable"

  e2e_workflow_testing:
    check: "Is there a task for end-to-end testing of the complete workflow?"
    location: "sub-specs/e2e-test-strategy.md"
    required_for: "features with user workflows"
    validation: |
      FOR each user flow:
        VERIFY: E2E test task exists
        VERIFY: Happy path covered
        VERIFY: Key error paths covered
        VERIFY: E2E test blocks implementation completion
    finding_if_missing:
      severity: P1
      title: "Missing E2E test coverage for user workflows"
```

## Execution Protocol

```yaml
execution:
  trigger: "After all spec files created, before user review"
  
  process:
    1_gather_context:
      - READ: spec.md, technical-spec.md
      - READ: sub-specs/ux-ui-spec.md (if exists)
      - READ: database-schema.md, api-spec.md (if exist)
      - READ: integration-requirements.md
      - READ: sub-specs/e2e-test-strategy.md (if exists)
      - DETERMINE: Feature type (frontend-only, backend-only, full-stack)
    
    2_run_checklists:
      - EXECUTE: UI & User Workflow checks (if has frontend)
      - EXECUTE: Data & Backend checks (if has backend/data)
      - EXECUTE: Edge Cases checks (always)
      - EXECUTE: Integration checks (always)
      - EXECUTE: Testing checks (always)
    
    3_collect_findings:
      - AGGREGATE: All findings by severity (P1, P2, P3)
      - DEDUPLICATE: Merge related findings
      - PRIORITIZE: P1 first, then P2
    
    4_generate_report:
      - FORMAT: Coverage report with pass/fail per category
      - INCLUDE: Specific gaps with locations
      - PROVIDE: Remediation guidance

  output_format: |
    ═══════════════════════════════════════════════════════════════════
    POST-SPEC COVERAGE VALIDATION
    ═══════════════════════════════════════════════════════════════════
    
    Feature Type: [frontend-only | backend-only | full-stack]
    
    📋 UI & User Workflow Coverage:
       Screens Identified: [PASS/FAIL] - [count] screens
       Navigation Flow: [PASS/FAIL/NA]
       Empty States: [PASS/FAIL/NA] - [count]/[total] specified
       Loading States: [PASS/FAIL/NA] - [count]/[total] specified
       Error States: [PASS/FAIL] - [count]/[total] specified
       Feedback Mechanisms: [PASS/FAIL/NA]
    
    📊 Data & Backend Coverage:
       Database Schema: [PASS/FAIL/NA]
       API Endpoints: [PASS/FAIL/NA] - [count] endpoints
       Client Validation: [PASS/FAIL/NA]
       Server Validation: [PASS/FAIL/NA]
       Data Migration: [PASS/FAIL/NA]
    
    ⚠️ Edge Cases & Error Handling:
       Error Scenarios: [PASS/FAIL]
       Permission Checks: [PASS/FAIL/NA]
       Race Conditions: [PASS/FAIL/NA]
       Boundary Conditions: [PASS/FAIL]
    
    🔗 Integration & Dependencies:
       Existing Feature Integration: [PASS/FAIL]
       Dependency Identification: [PASS/FAIL]
       Breaking Changes: [PASS/FAIL/NA]
    
    ✅ Testing & Validation:
       Task Verifiability: [PASS/FAIL]
       Testable Acceptance Criteria: [PASS/FAIL]
       E2E Workflow Testing: [PASS/FAIL/NA]
    
    ───────────────────────────────────────────────────────────────────
    FINDINGS SUMMARY
    ───────────────────────────────────────────────────────────────────
    
    🔴 P1 (Must Fix): [count]
    [List each P1 finding with location and remediation]
    
    🟡 P2 (Should Fix): [count]
    [List each P2 finding with location and remediation]
    
    ═══════════════════════════════════════════════════════════════════

  enforcement:
    P1_findings: "BLOCK - Must address before proceeding to user review"
    P2_findings: "WARN - Recommend addressing, can proceed with justification"
    P3_findings: "INFO - Consider for improvement"
```

## Quick Reference

| Check | Location | Severity if Missing |
|-------|----------|-------------------|
| All screens identified | ux-ui-spec.md | P1 |
| Navigation flow complete | ux-ui-spec.md | P2 |
| Empty states specified | ux-ui-spec.md | P2 |
| Loading states specified | ux-ui-spec.md | P2 |
| Error states specified | ux-ui-spec.md | P1 |
| User feedback mechanisms | technical-spec.md | P2 |
| Database schema complete | database-schema.md | P1 |
| API endpoints specified | api-spec.md | P1 |
| Client validation rules | ux-ui-spec.md | P2 |
| Server validation rules | technical-spec.md | P1 |
| Data migration strategy | database-schema.md | P1 |
| Error handling documented | technical-spec.md | P1 |
| Permissions specified | api-spec.md | P1 |
| Race conditions addressed | technical-spec.md | P2 |
| Boundary conditions | technical-spec.md | P2 |
| Integration points | integration-requirements.md | P2 |
| Dependencies documented | integration-requirements.md | P1 |
| Breaking changes noted | integration-requirements.md | P1 |
| Tasks independently verifiable | tasks/ | P2 |
| Testable acceptance criteria | spec.md, tasks/ | P2 |
| E2E tests for workflows | e2e-test-strategy.md | P1 |
