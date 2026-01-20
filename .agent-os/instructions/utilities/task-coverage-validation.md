---
version: 5.4.1
last-updated: 2026-01-15
description: Validates that generated tasks fully cover spec semantic requirements
related-files:
  - instructions/core/create-tasks.md
  - instructions/utilities/post-spec-coverage-checklist.md
  - instructions/utilities/data-flow-tracing.md
  - instructions/utilities/integration-impact-analysis.md
---

# Task Coverage Validation

## Purpose

Validates that the generated tasks fully cover the specification's semantic requirements. Runs after task generation but before presenting tasks to user.

**Key Insight**: A spec can be semantically complete, but task generation may miss aspects. This validation ensures every workflow, data flow, and integration point has corresponding tasks.

## When to Use

- After task generation in `/create-tasks` (Step 1.8)
- Before presenting tasks to user for review
- As part of task quality validation

## Coverage Mapping

### 1. Workflow Coverage → Task Mapping

```yaml
workflow_to_task_mapping:
  # For each UI workflow element, verify task exists
  
  screens_and_routes:
    spec_source: "sub-specs/ux-ui-spec.md → Route Structure"
    task_requirement: |
      FOR each route in spec:
        VERIFY: Task exists to implement route/page
        PATTERN: impl-page-{route-name} OR impl-route-{route-name}
    finding_if_missing:
      severity: P1
      title: "Missing task for route: {route}"
  
  navigation_components:
    spec_source: "sub-specs/ux-ui-spec.md → Navigation Structure"
    task_requirement: |
      IF navigation changes specified:
        VERIFY: Task exists for navigation implementation
        PATTERN: impl-navigation-* OR impl-nav-*
    finding_if_missing:
      severity: P2
      title: "Missing task for navigation changes"
  
  empty_states:
    spec_source: "sub-specs/ux-ui-spec.md → Component Specifications"
    task_requirement: |
      FOR each component with empty state in spec:
        VERIFY: Component task includes empty state in acceptance criteria
        OR: Separate task for empty states exists
    finding_if_missing:
      severity: P2
      title: "Empty state not covered in tasks for: {component}"
  
  loading_states:
    spec_source: "sub-specs/ux-ui-spec.md → Component Specifications"
    task_requirement: |
      FOR each async component in spec:
        VERIFY: Task acceptance criteria includes loading state
    finding_if_missing:
      severity: P2
      title: "Loading state not covered in tasks for: {component}"
  
  error_states:
    spec_source: "sub-specs/ux-ui-spec.md → Component Specifications"
    task_requirement: |
      FOR each form/action in spec:
        VERIFY: Task acceptance criteria includes error handling
    finding_if_missing:
      severity: P1
      title: "Error state not covered in tasks for: {component}"
  
  user_feedback:
    spec_source: "technical-spec.md → User Feedback"
    task_requirement: |
      FOR each feedback mechanism (toast, confirmation, progress):
        VERIFY: Task exists or acceptance criteria includes it
    finding_if_missing:
      severity: P2
      title: "User feedback mechanism not covered: {mechanism}"
```

### 2. Data Flow Coverage → Task Mapping

```yaml
data_flow_to_task_mapping:
  # For each data entity, verify CRUD tasks exist
  
  entity_creation:
    spec_source: "database-schema.md, api-spec.md"
    task_requirement: |
      FOR each entity that can be created:
        VERIFY: Tasks exist for:
          - UI form (impl-form-{entity} OR impl-create-{entity}-form)
          - API endpoint (impl-api-{entity}-create OR impl-{entity}-mutation)
          - Validation (included in above OR separate task)
        VERIFY: Task dependencies correct (form depends on API)
    finding_if_missing:
      severity: P1
      title: "Missing create flow tasks for entity: {entity}"
  
  entity_display:
    spec_source: "database-schema.md, api-spec.md, ux-ui-spec.md"
    task_requirement: |
      FOR each entity that is displayed:
        VERIFY: Tasks exist for:
          - Display component (impl-{entity}-list OR impl-{entity}-display)
          - API query (impl-api-{entity}-query OR impl-{entity}-query)
        VERIFY: Display task acceptance criteria includes:
          - Loading state
          - Empty state
          - Error state
    finding_if_missing:
      severity: P1
      title: "Missing read/display tasks for entity: {entity}"
  
  entity_update:
    spec_source: "database-schema.md, api-spec.md"
    task_requirement: |
      FOR each entity that can be updated:
        IF update specified in spec:
          VERIFY: Tasks exist for:
            - Edit form/UI (impl-edit-{entity} OR impl-{entity}-edit)
            - API endpoint (impl-api-{entity}-update)
    finding_if_missing:
      severity: P1
      title: "Missing update flow tasks for entity: {entity}"
  
  entity_deletion:
    spec_source: "database-schema.md, api-spec.md"
    task_requirement: |
      FOR each entity that can be deleted:
        IF delete specified in spec:
          VERIFY: Tasks exist for:
            - Delete UI (confirmation dialog in acceptance criteria)
            - API endpoint (impl-api-{entity}-delete)
    finding_if_missing:
      severity: P2
      title: "Missing delete flow tasks for entity: {entity}"
  
  validation_layers:
    spec_source: "technical-spec.md → Validation"
    task_requirement: |
      FOR each form/input:
        VERIFY: Client validation in frontend task acceptance criteria
        VERIFY: Server validation in API task acceptance criteria
    finding_if_missing:
      severity: P1
      title: "Missing validation coverage for: {form}"
  
  data_migration:
    spec_source: "database-schema.md → Migration Strategy"
    task_requirement: |
      IF schema changes affect existing data:
        VERIFY: Migration task exists (impl-migration-* OR task-migrate-*)
    finding_if_missing:
      severity: P1
      title: "Missing data migration task"
```

### 3. Integration Coverage → Task Mapping

```yaml
integration_to_task_mapping:
  # For each integration point, verify task coverage
  
  breaking_changes:
    spec_source: "integration-requirements.md → Breaking Changes"
    task_requirement: |
      FOR each breaking change documented:
        VERIFY: Task exists for migration/deprecation handling
        VERIFY: Task exists for client notification (if external API)
    finding_if_missing:
      severity: P1
      title: "Missing task for breaking change: {change}"
  
  affected_features:
    spec_source: "integration-requirements.md → Affected Features"
    task_requirement: |
      FOR each affected feature with required changes:
        VERIFY: Task exists to update affected feature
        OR: Acceptance criteria in main task covers it
    finding_if_missing:
      severity: P2
      title: "Missing task for affected feature update: {feature}"
  
  external_dependencies:
    spec_source: "integration-requirements.md → External Dependencies"
    task_requirement: |
      FOR each external service integration:
        VERIFY: Task exists for integration implementation
        VERIFY: Error handling for service failure in acceptance criteria
    finding_if_missing:
      severity: P1
      title: "Missing task for external integration: {service}"
  
  permission_changes:
    spec_source: "technical-spec.md → Security, api-spec.md"
    task_requirement: |
      IF new permissions/roles introduced:
        VERIFY: Task exists for permission implementation
        VERIFY: UI tasks include permission checks in acceptance criteria
    finding_if_missing:
      severity: P1
      title: "Missing task for permission implementation"
```

### 4. Testing Coverage → Task Mapping

```yaml
testing_to_task_mapping:
  # Verify test tasks align with implementation
  
  e2e_test_coverage:
    spec_source: "sub-specs/e2e-test-strategy.md"
    task_requirement: |
      FOR each user flow in e2e-test-strategy:
        VERIFY: test-user-flow-{name} task exists
        VERIFY: test task BLOCKS impl-user-flow-{name}
    finding_if_missing:
      severity: P1
      title: "Missing E2E test task for user flow: {flow}"
  
  browser_validation:
    spec_source: "sub-specs/e2e-test-strategy.md → Browser Matrix"
    task_requirement: |
      FOR each user flow:
        VERIFY: validate-browser-{flow} task exists
        OR: Browser validation in test task acceptance criteria
    finding_if_missing:
      severity: P2
      title: "Missing browser validation task for: {flow}"
  
  accessibility_testing:
    spec_source: "sub-specs/e2e-test-strategy.md → Accessibility"
    task_requirement: |
      IF UI feature:
        VERIFY: Accessibility testing in test task acceptance criteria
        PATTERN: "axe-core" OR "WCAG" OR "accessibility scan"
    finding_if_missing:
      severity: P2
      title: "Missing accessibility testing requirement"
```

## Execution Protocol

```yaml
execution:
  trigger: "After task generation, before user review (Step 1.8)"
  
  input:
    - Generated tasks (tasks.md + tasks/*.md)
    - Specification files (spec.md, technical-spec.md, etc.)
    - Sub-specs (ux-ui-spec.md, e2e-test-strategy.md, etc.)
  
  process:
    1_extract_spec_requirements:
      - PARSE ux-ui-spec.md for routes, components, states
      - PARSE database-schema.md for entities
      - PARSE api-spec.md for endpoints
      - PARSE integration-requirements.md for touchpoints
      - PARSE e2e-test-strategy.md for user flows
      - BUILD requirements inventory
    
    2_extract_task_coverage:
      - PARSE tasks.md for task list
      - PARSE tasks/*.md for acceptance criteria
      - BUILD task coverage map
    
    3_map_requirements_to_tasks:
      - FOR each workflow requirement: Find matching task
      - FOR each data entity: Find CRUD tasks
      - FOR each integration point: Find handling task
      - FOR each test requirement: Find test task
      - RECORD gaps
    
    4_analyze_acceptance_criteria:
      - FOR each task: Check if acceptance criteria covers:
        - States (loading, empty, error)
        - Validation (client, server)
        - Error handling
        - Accessibility
      - RECORD missing criteria
    
    5_generate_report:
      - AGGREGATE findings by severity
      - CALCULATE coverage score
      - PROVIDE remediation (missing tasks to add)

  output_format: |
    ═══════════════════════════════════════════════════════════════════
    TASK COVERAGE VALIDATION
    ═══════════════════════════════════════════════════════════════════
    
    Spec: {spec_name}
    Tasks Generated: {count}
    
    📋 WORKFLOW COVERAGE
    ───────────────────────────────────────────────────────────────────
    Routes/Pages:     {covered}/{total} [{percentage}%]
    Components:       {covered}/{total} [{percentage}%]
    Empty States:     {covered}/{total} [{percentage}%]
    Loading States:   {covered}/{total} [{percentage}%]
    Error States:     {covered}/{total} [{percentage}%]
    Feedback:         {covered}/{total} [{percentage}%]
    
    📊 DATA FLOW COVERAGE
    ───────────────────────────────────────────────────────────────────
    | Entity | Create | Read | Update | Delete | Validation |
    |--------|--------|------|--------|--------|------------|
    | {name} | ✓/✗    | ✓/✗  | ✓/✗/NA | ✓/✗/NA | ✓/✗        |
    
    🔗 INTEGRATION COVERAGE
    ───────────────────────────────────────────────────────────────────
    Breaking Changes: {covered}/{total}
    Affected Features: {covered}/{total}
    External Deps: {covered}/{total}
    Permissions: {covered}/{total}
    
    ✅ TESTING COVERAGE
    ───────────────────────────────────────────────────────────────────
    E2E Tests:        {covered}/{total} user flows
    Browser Validation: {covered}/{total}
    Accessibility:    {present}/{required}
    
    ⚠️ GAPS FOUND
    ───────────────────────────────────────────────────────────────────
    🔴 P1 (Must Add): {count}
    - {gap}: {remediation}
    
    🟡 P2 (Should Add): {count}
    - {gap}: {remediation}
    
    📝 SUGGESTED TASKS TO ADD
    ───────────────────────────────────────────────────────────────────
    {For each P1 gap, suggest task to add with title and key AC}
    
    Coverage Score: {score}% ({status})
    ═══════════════════════════════════════════════════════════════════

  scoring:
    workflow_weight: 0.30
    data_flow_weight: 0.35
    integration_weight: 0.20
    testing_weight: 0.15
    
    status_mapping:
      ">= 95%": "EXCELLENT - Ready for execution"
      "90-94%": "GOOD - Minor gaps, can proceed"
      "80-89%": "ACCEPTABLE - Should address gaps"
      "< 80%": "INSUFFICIENT - Must add missing tasks"
```

## Enforcement

```yaml
enforcement:
  P1_gaps:
    action: BLOCK
    message: "Cannot proceed with P1 task coverage gaps"
    requirement: "Must add missing tasks before execution"
  
  P2_gaps:
    action: WARN
    message: "P2 gaps found - recommend adding tasks"
    options:
      - "ADD: Create missing tasks"
      - "CONTINUE: Proceed with acknowledgment"
      - "ABORT: Return to task generation"
  
  score_threshold:
    minimum: 0.85
    if_below:
      action: WARN
      message: "Task coverage score {score}% below threshold 85%"
```

## Quick Reference

| Spec Element | Required Task Pattern | Severity if Missing |
|--------------|----------------------|---------------------|
| Route/Page | impl-page-*, impl-route-* | P1 |
| Form | impl-form-*, impl-create-*-form | P1 |
| API Create | impl-api-*-create, impl-*-mutation | P1 |
| API Read | impl-api-*-query, impl-*-query | P1 |
| API Update | impl-api-*-update | P1 |
| API Delete | impl-api-*-delete | P2 |
| Data Migration | impl-migration-*, task-migrate-* | P1 |
| E2E Test | test-user-flow-* | P1 |
| Browser Validation | validate-browser-* | P2 |
| Breaking Change | task-migrate-*, impl-deprecation-* | P1 |
| Permission | impl-permission-*, impl-auth-* | P1 |
| Empty State | In component task AC | P2 |
| Loading State | In component task AC | P2 |
| Error State | In component task AC | P1 |
| Validation | In form/API task AC | P1 |
