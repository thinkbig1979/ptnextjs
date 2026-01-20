---
version: 5.4.0
last-updated: 2026-01-15
description: Data flow validation - traces each data entity through the full stack
related-files:
  - instructions/utilities/post-spec-coverage-checklist.md
  - instructions/core/spec-steps/step-13-14-review-validation.md
  - instructions/core/validate-quality.md
---

# Data Flow Tracing

## Purpose

Validates that each data entity in the specification has complete coverage from creation to display. Prevents gaps where data is created but never displayed, or displayed but never persisted.

**Key Insight**: Specifications often focus on individual layers (UI, API, DB) without verifying the connections between them. This checklist traces data through the entire stack.

## When to Use

- After spec files created, before user review
- As part of `/validate-quality` Step 2.8
- When reviewing full-stack feature specifications

## Data Flow Model

```
┌─────────────────────────────────────────────────────────────────┐
│                        DATA LIFECYCLE                           │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│   CREATE UI  →  API Endpoint  →  Validation  →  DB Write       │
│   (form)        (POST/mutation)   (server)      (insert)        │
│                                                                 │
│   READ UI    ←  API Response  ←  Query        ←  DB Read       │
│   (display)     (GET/query)      (server)       (select)        │
│                                                                 │
│   UPDATE UI  →  API Endpoint  →  Validation  →  DB Update      │
│   (edit form)   (PUT/PATCH)      (server)       (update)        │
│                                                                 │
│   DELETE UI  →  API Endpoint  →  Auth Check  →  DB Delete      │
│   (button)      (DELETE)         (server)       (delete)        │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

## Tracing Protocol

### Step 1: Identify Data Entities

```yaml
entity_identification:
  sources:
    - database-schema.md (tables/collections)
    - api-spec.md (request/response types)
    - technical-spec.md (data models)
    - spec.md (core concepts)
  
  extract:
    FOR each entity:
      - name: Entity name
      - fields: List of fields
      - relationships: Related entities
      - operations: CRUD operations needed
```

### Step 2: Trace Each Entity

```yaml
trace_template:
  entity: "[ENTITY_NAME]"
  
  create_flow:
    ui_entry_point:
      location: "Where does user initiate creation?"
      spec_reference: "ux-ui-spec.md section"
      verified: true/false
    
    form_fields:
      location: "What fields does user fill?"
      spec_reference: "ux-ui-spec.md component"
      matches_schema: true/false
      verified: true/false
    
    client_validation:
      location: "What validation before submit?"
      spec_reference: "ux-ui-spec.md or technical-spec.md"
      verified: true/false
    
    api_endpoint:
      location: "Which endpoint receives data?"
      spec_reference: "api-spec.md"
      method: "POST/mutation"
      verified: true/false
    
    server_validation:
      location: "What server-side validation?"
      spec_reference: "technical-spec.md or api-spec.md"
      verified: true/false
    
    db_write:
      location: "How is data persisted?"
      spec_reference: "database-schema.md"
      verified: true/false
    
    success_feedback:
      location: "How does user know it worked?"
      spec_reference: "ux-ui-spec.md"
      verified: true/false
  
  read_flow:
    display_location:
      location: "Where is data shown to user?"
      spec_reference: "ux-ui-spec.md"
      verified: true/false
    
    api_query:
      location: "Which endpoint fetches data?"
      spec_reference: "api-spec.md"
      method: "GET/query"
      verified: true/false
    
    db_read:
      location: "What query retrieves data?"
      spec_reference: "database-schema.md (indexes)"
      verified: true/false
    
    loading_state:
      location: "What shows while loading?"
      spec_reference: "ux-ui-spec.md"
      verified: true/false
    
    empty_state:
      location: "What shows if no data?"
      spec_reference: "ux-ui-spec.md"
      verified: true/false
    
    error_state:
      location: "What shows if fetch fails?"
      spec_reference: "ux-ui-spec.md"
      verified: true/false
  
  update_flow:
    edit_entry_point:
      location: "Where does user initiate edit?"
      spec_reference: "ux-ui-spec.md"
      verified: true/false
    
    pre_populated_form:
      location: "How is existing data loaded into form?"
      spec_reference: "ux-ui-spec.md or technical-spec.md"
      verified: true/false
    
    api_endpoint:
      location: "Which endpoint receives update?"
      spec_reference: "api-spec.md"
      method: "PUT/PATCH/mutation"
      verified: true/false
    
    optimistic_update:
      location: "Is UI updated before server confirms?"
      spec_reference: "technical-spec.md"
      required: depends_on_ux
      verified: true/false/na
    
    conflict_handling:
      location: "What if another user edited?"
      spec_reference: "technical-spec.md"
      required: if_multi_user
      verified: true/false/na
  
  delete_flow:
    delete_trigger:
      location: "Where does user initiate delete?"
      spec_reference: "ux-ui-spec.md"
      verified: true/false
    
    confirmation:
      location: "Is there a confirmation dialog?"
      spec_reference: "ux-ui-spec.md"
      required: true_for_destructive
      verified: true/false
    
    api_endpoint:
      location: "Which endpoint handles delete?"
      spec_reference: "api-spec.md"
      method: "DELETE/mutation"
      verified: true/false
    
    cascade_behavior:
      location: "What happens to related data?"
      spec_reference: "database-schema.md"
      verified: true/false
    
    undo_capability:
      location: "Can user undo delete?"
      spec_reference: "technical-spec.md"
      required: depends_on_criticality
      verified: true/false/na
```

### Step 3: Generate Gap Report

```yaml
gap_detection:
  for_each_entity:
    create_gaps:
      - "UI form exists but no API endpoint"
      - "API endpoint exists but no DB schema"
      - "DB schema exists but no create UI"
      - "No client validation specified"
      - "No server validation specified"
      - "No success feedback specified"
    
    read_gaps:
      - "Data stored but never displayed"
      - "Display exists but no fetch endpoint"
      - "No loading state specified"
      - "No empty state specified"
      - "No error state specified"
    
    update_gaps:
      - "Can create but not edit"
      - "Edit UI but no update endpoint"
      - "No pre-population of existing data"
      - "No conflict handling for multi-user"
    
    delete_gaps:
      - "Can create but not delete"
      - "Delete button but no confirmation"
      - "No cascade behavior specified"
      - "No endpoint for delete"
```

## Execution Protocol

```yaml
execution:
  input:
    - database-schema.md
    - api-spec.md
    - technical-spec.md
    - sub-specs/ux-ui-spec.md
  
  process:
    1_extract_entities:
      - PARSE database-schema.md for tables/collections
      - PARSE api-spec.md for data types
      - CREATE entity list with fields
    
    2_trace_each_entity:
      FOR each entity:
        - TRACE create flow (UI → API → DB)
        - TRACE read flow (DB → API → UI)
        - TRACE update flow (if applicable)
        - TRACE delete flow (if applicable)
        - RECORD gaps found
    
    3_cross_reference:
      - VERIFY API request types match DB schema
      - VERIFY API response types match UI expectations
      - VERIFY form fields match API request schema
      - VERIFY display fields match API response schema
    
    4_generate_report:
      - LIST all entities traced
      - LIST gaps per entity
      - PRIORITIZE by severity
      - PROVIDE remediation guidance

  output_format: |
    ═══════════════════════════════════════════════════════════════════
    DATA FLOW TRACING REPORT
    ═══════════════════════════════════════════════════════════════════
    
    Entities Analyzed: [count]
    
    ┌─────────────────────────────────────────────────────────────────┐
    │ ENTITY: [Name]                                                  │
    ├─────────────────────────────────────────────────────────────────┤
    │ CREATE: [✓ Complete | ⚠ Gaps | ✗ Missing]                      │
    │   UI Entry Point: [✓/✗] [location]                             │
    │   Form Fields: [✓/✗] [count] fields                            │
    │   Client Validation: [✓/✗]                                     │
    │   API Endpoint: [✓/✗] [method] [path]                          │
    │   Server Validation: [✓/✗]                                     │
    │   DB Write: [✓/✗] [table]                                      │
    │   Success Feedback: [✓/✗]                                      │
    │                                                                 │
    │ READ: [✓ Complete | ⚠ Gaps | ✗ Missing]                        │
    │   Display Location: [✓/✗] [location]                           │
    │   API Query: [✓/✗] [method] [path]                             │
    │   DB Read: [✓/✗] [indexed: yes/no]                             │
    │   Loading State: [✓/✗]                                         │
    │   Empty State: [✓/✗]                                           │
    │   Error State: [✓/✗]                                           │
    │                                                                 │
    │ UPDATE: [✓ Complete | ⚠ Gaps | ✗ Missing | N/A]                │
    │   [details if applicable]                                       │
    │                                                                 │
    │ DELETE: [✓ Complete | ⚠ Gaps | ✗ Missing | N/A]                │
    │   [details if applicable]                                       │
    └─────────────────────────────────────────────────────────────────┘
    
    [Repeat for each entity]
    
    ───────────────────────────────────────────────────────────────────
    GAP SUMMARY
    ───────────────────────────────────────────────────────────────────
    
    🔴 Critical Gaps (P1):
    - [Entity]: [Gap description] → [Remediation]
    
    🟡 Important Gaps (P2):
    - [Entity]: [Gap description] → [Remediation]
    
    ═══════════════════════════════════════════════════════════════════

  severity_mapping:
    P1_critical:
      - "Data can be created but never displayed"
      - "Data can be displayed but never created"
      - "API endpoint has no corresponding UI"
      - "DB schema has no API endpoints"
      - "No server validation for user input"
    
    P2_important:
      - "Missing loading state"
      - "Missing empty state"
      - "Missing error state"
      - "No client validation"
      - "No delete confirmation"
      - "No optimistic updates"
    
    P3_nice_to_have:
      - "No undo capability"
      - "No conflict handling (single-user feature)"
```

## Integration with Other Checklists

```yaml
integration:
  post_spec_coverage:
    - Data flow tracing feeds into "Data & Backend Coverage" section
    - Gap findings become P1/P2 findings in coverage report
  
  integration_impact:
    - Entity relationships inform integration analysis
    - Cascade behaviors affect impact on existing features
  
  validate_quality:
    - Data flow gaps reduce "Technical Depth" score
    - Missing validations reduce "Implementation Readiness" score
```

## Quick Reference Matrix

| Entity Aspect | Create | Read | Update | Delete |
|---------------|--------|------|--------|--------|
| UI Entry Point | Required | Required | If editable | If deletable |
| Form/Display | Required | Required | Required | Confirmation |
| Client Validation | Required | N/A | Required | N/A |
| API Endpoint | Required | Required | Required | Required |
| Server Validation | Required | N/A | Required | Auth check |
| DB Operation | Required | Required | Required | Required |
| Success Feedback | Required | Loading state | Required | Required |
| Error Handling | Required | Required | Required | Required |
| Empty State | N/A | Required | N/A | N/A |
