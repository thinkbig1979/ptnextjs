---
version: 5.4.0
last-updated: 2026-01-15
description: Integration impact analysis - identifies effects on existing features and breaking changes
related-files:
  - instructions/utilities/post-spec-coverage-checklist.md
  - instructions/utilities/data-flow-tracing.md
  - instructions/core/spec-steps/step-13-14-review-validation.md
  - instructions/core/validate-quality.md
---

# Integration Impact Analysis

## Purpose

Validates that the specification accounts for its impact on existing features, identifies breaking changes, and ensures proper integration with the current system.

**Key Insight**: New features don't exist in isolation. This analysis prevents "it works in isolation but breaks production" scenarios by systematically checking integration points.

## When to Use

- After spec files created, before user review
- As part of `/validate-quality` Step 2.8
- When reviewing features that touch existing code

## Analysis Framework

### 1. Touchpoint Identification

```yaml
touchpoint_discovery:
  description: "Identify all places where new feature interacts with existing system"
  
  categories:
    shared_components:
      description: "UI components used by new feature that exist elsewhere"
      detection: |
        SCAN ux-ui-spec.md for component references
        FOR each component:
          SEARCH codebase: Is this component used elsewhere?
          IF yes: Flag as shared component touchpoint
      impact: "Changes to shared components affect all consumers"
    
    shared_data:
      description: "Database tables/entities accessed by new feature"
      detection: |
        SCAN database-schema.md for table references
        FOR each table:
          IF table exists: Flag as shared data touchpoint
          CHECK: Are we adding columns? Changing types? Adding constraints?
      impact: "Schema changes affect all code reading/writing this data"
    
    shared_apis:
      description: "API endpoints used or modified by new feature"
      detection: |
        SCAN api-spec.md for endpoint definitions
        FOR each endpoint:
          IF endpoint exists: Flag as API modification
          IF new endpoint uses existing data: Flag as integration point
      impact: "API changes affect all clients (frontend, mobile, integrations)"
    
    shared_services:
      description: "Backend services or utilities used by new feature"
      detection: |
        SCAN technical-spec.md for service references
        FOR each service:
          SEARCH codebase: Is this service used elsewhere?
          IF yes: Flag as shared service touchpoint
      impact: "Service changes affect all callers"
    
    navigation_integration:
      description: "How new feature integrates with app navigation"
      detection: |
        SCAN ux-ui-spec.md for route definitions
        CHECK: Does new feature link from existing pages?
        CHECK: Does new feature link TO existing pages?
        CHECK: Does new feature appear in existing navigation (sidebar, menu)?
      impact: "Navigation changes affect user mental model"
    
    authentication_integration:
      description: "How new feature interacts with auth system"
      detection: |
        SCAN technical-spec.md for auth requirements
        CHECK: New roles or permissions introduced?
        CHECK: Changes to existing permission checks?
        CHECK: New protected routes?
      impact: "Auth changes can lock users out or grant unintended access"
```

### 2. Breaking Change Detection

```yaml
breaking_change_analysis:
  description: "Identify changes that could break existing functionality"
  
  categories:
    api_breaking_changes:
      severity: P1
      patterns:
        - "Removing or renaming API endpoint"
        - "Removing required field from response"
        - "Adding required field to request"
        - "Changing field type in request/response"
        - "Changing authentication requirements"
        - "Changing rate limits significantly"
      detection: |
        FOR each API endpoint in api-spec.md:
          IF endpoint exists in codebase:
            COMPARE request schema: New required fields?
            COMPARE response schema: Removed fields? Type changes?
            CHECK auth requirements: More restrictive?
      remediation:
        - "Version the API (v2 endpoint)"
        - "Add deprecation period for old endpoint"
        - "Make new fields optional with defaults"
        - "Document migration path for clients"
    
    database_breaking_changes:
      severity: P1
      patterns:
        - "Removing column from table"
        - "Changing column type"
        - "Adding NOT NULL column without default"
        - "Changing primary key"
        - "Removing or changing indexes"
        - "Changing foreign key relationships"
      detection: |
        FOR each table change in database-schema.md:
          IF table exists in codebase:
            CHECK: Column removals?
            CHECK: Type changes?
            CHECK: Constraint additions?
            CHECK: Relationship changes?
      remediation:
        - "Create migration script with data transformation"
        - "Use backwards-compatible column additions"
        - "Add column as nullable first, backfill, then add constraint"
        - "Document rollback procedure"
    
    component_breaking_changes:
      severity: P2
      patterns:
        - "Changing required props"
        - "Removing props consumers depend on"
        - "Changing component behavior"
        - "Changing component styling (if used elsewhere)"
      detection: |
        FOR each component in ux-ui-spec.md:
          SEARCH codebase: Other usages of this component?
          IF found:
            COMPARE props: New required props?
            COMPARE behavior: Semantic changes?
      remediation:
        - "Create new component variant instead of modifying"
        - "Make new props optional with sensible defaults"
        - "Document behavioral changes"
    
    configuration_breaking_changes:
      severity: P2
      patterns:
        - "Changing environment variable names"
        - "Changing configuration file format"
        - "Adding required configuration"
        - "Changing default values with side effects"
      detection: |
        SCAN technical-spec.md for configuration references
        FOR each config change:
          CHECK: Name changes?
          CHECK: New required values?
          CHECK: Format changes?
      remediation:
        - "Support both old and new config names temporarily"
        - "Provide migration script for config files"
        - "Document all configuration changes"
```

### 3. Existing Feature Impact Assessment

```yaml
impact_assessment:
  description: "Assess how new feature affects existing features"
  
  assessment_matrix:
    for_each_touchpoint:
      identify:
        - affected_feature: "Name of existing feature"
        - integration_type: "shared_component | shared_data | shared_api | navigation"
        - change_type: "additive | modification | removal"
        - risk_level: "high | medium | low"
      
      evaluate:
        functionality_impact:
          question: "Will existing feature still work correctly?"
          check: |
            IF shared_data: Do queries still return expected shape?
            IF shared_api: Are existing clients compatible?
            IF shared_component: Are existing usages still valid?
          finding_if_no: "P1 - Feature [X] will break"
        
        performance_impact:
          question: "Will existing feature performance degrade?"
          check: |
            IF shared_data: Are we adding expensive queries? New indexes needed?
            IF shared_api: Are we adding load to shared endpoints?
            IF shared_service: Are we adding processing overhead?
          finding_if_yes: "P2 - Performance impact on [X]"
        
        ux_impact:
          question: "Will user experience of existing feature change?"
          check: |
            IF navigation_change: Is existing navigation still intuitive?
            IF shared_component: Does modified component still fit existing contexts?
            IF new_feature_prominent: Does it overshadow existing features?
          finding_if_yes: "P2 - UX impact on [X]"
        
        security_impact:
          question: "Does this affect security of existing features?"
          check: |
            IF auth_change: Are existing permission checks still correct?
            IF shared_data: Is data access still properly scoped?
            IF new_endpoints: Do they expose data used by other features?
          finding_if_yes: "P1 - Security impact on [X]"
```

### 4. Regression Risk Assessment

```yaml
regression_risk:
  description: "Identify areas requiring regression testing"
  
  risk_categories:
    high_risk:
      criteria:
        - "Shared data modified (schema changes)"
        - "Shared API modified (contract changes)"
        - "Authentication/authorization changes"
        - "Core service modifications"
      testing_requirement: "Full regression suite + manual verification"
      documentation_requirement: "Explicit regression test plan in spec"
    
    medium_risk:
      criteria:
        - "Shared component modified"
        - "Navigation changes"
        - "New feature in high-traffic area"
      testing_requirement: "Targeted regression tests"
      documentation_requirement: "List affected features in spec"
    
    low_risk:
      criteria:
        - "New isolated feature"
        - "Additive-only changes"
        - "No shared dependencies"
      testing_requirement: "Standard test coverage"
      documentation_requirement: "None additional"

  output:
    regression_test_plan:
      high_risk_areas: "[list]"
      affected_features: "[list]"
      recommended_tests: "[list]"
      manual_verification: "[list]"
```

## Execution Protocol

```yaml
execution:
  input:
    - spec.md
    - technical-spec.md
    - database-schema.md
    - api-spec.md
    - sub-specs/ux-ui-spec.md
    - integration-requirements.md
    - Existing codebase access
  
  process:
    1_discover_touchpoints:
      - SCAN spec files for references to existing entities
      - SEARCH codebase for usages of referenced components/services
      - BUILD touchpoint inventory
    
    2_detect_breaking_changes:
      - FOR each touchpoint: Compare new spec vs existing implementation
      - FLAG breaking patterns (API, DB, component, config)
      - ASSESS severity
    
    3_assess_feature_impact:
      - FOR each affected feature: Evaluate functionality/performance/UX/security
      - DOCUMENT impacts and mitigations
    
    4_calculate_regression_risk:
      - CATEGORIZE changes by risk level
      - GENERATE regression test recommendations
    
    5_generate_report:
      - COMPILE findings
      - PRIORITIZE by severity
      - PROVIDE remediation guidance

  output_format: |
    ═══════════════════════════════════════════════════════════════════
    INTEGRATION IMPACT ANALYSIS
    ═══════════════════════════════════════════════════════════════════
    
    Feature: [Spec Name]
    Analysis Date: [Date]
    
    ───────────────────────────────────────────────────────────────────
    TOUCHPOINT SUMMARY
    ───────────────────────────────────────────────────────────────────
    
    Shared Components: [count]
    - [Component]: Used in [Feature A], [Feature B]
    
    Shared Data: [count]
    - [Table]: Accessed by [Service X], [Feature Y]
    
    Shared APIs: [count]
    - [Endpoint]: Called by [Client A], [Integration B]
    
    Navigation Integration: [count]
    - Links from: [Page A], [Page B]
    - Links to: [Page C]
    
    ───────────────────────────────────────────────────────────────────
    BREAKING CHANGES
    ───────────────────────────────────────────────────────────────────
    
    🔴 API Breaking Changes: [count]
    - [Endpoint]: [Change description]
      Impact: [Who is affected]
      Remediation: [How to fix]
    
    🔴 Database Breaking Changes: [count]
    - [Table.Column]: [Change description]
      Impact: [What code is affected]
      Remediation: [Migration approach]
    
    🟡 Component Breaking Changes: [count]
    - [Component]: [Change description]
      Impact: [Which usages affected]
      Remediation: [How to update]
    
    ───────────────────────────────────────────────────────────────────
    AFFECTED FEATURES
    ───────────────────────────────────────────────────────────────────
    
    | Feature | Integration Type | Impact | Risk | Action Required |
    |---------|-----------------|--------|------|-----------------|
    | [Name]  | [Type]          | [Desc] | H/M/L| [Action]        |
    
    ───────────────────────────────────────────────────────────────────
    REGRESSION TEST PLAN
    ───────────────────────────────────────────────────────────────────
    
    High Risk (Full Regression):
    - [Feature/Area]: [Reason]
    
    Medium Risk (Targeted Tests):
    - [Feature/Area]: [Reason]
    
    Recommended Test Coverage:
    - [ ] [Test description]
    - [ ] [Test description]
    
    Manual Verification Required:
    - [ ] [Verification step]
    
    ───────────────────────────────────────────────────────────────────
    FINDINGS SUMMARY
    ───────────────────────────────────────────────────────────────────
    
    🔴 P1 (Must Address): [count]
    - [Finding]: [Location] → [Remediation]
    
    🟡 P2 (Should Address): [count]
    - [Finding]: [Location] → [Remediation]
    
    ═══════════════════════════════════════════════════════════════════
```

## Integration with Spec Validation

```yaml
validation_integration:
  post_spec_coverage:
    - Integration findings feed into "Integration & Dependencies" section
    - Breaking changes become P1 findings
  
  data_flow_tracing:
    - Shared data touchpoints inform data flow analysis
    - Schema changes affect data flow completeness
  
  validate_quality:
    - Breaking changes reduce "Implementation Readiness" score
    - Missing integration docs reduce "Completeness" score

  spec_requirements:
    if_breaking_changes_found:
      REQUIRE in spec:
        - Migration strategy section
        - Deprecation timeline (if applicable)
        - Client notification plan
        - Rollback procedure
    
    if_high_risk_regression:
      REQUIRE in spec:
        - Explicit regression test plan
        - Affected feature list
        - Manual verification checklist
```

## Severity Mapping

| Finding Type | Severity | Blocking |
|--------------|----------|----------|
| API breaking change without migration | P1 | Yes |
| DB schema change without migration | P1 | Yes |
| Security impact on existing feature | P1 | Yes |
| Component breaking change | P2 | No |
| Performance impact on existing feature | P2 | No |
| Navigation/UX impact | P2 | No |
| Configuration change | P2 | No |
| Low-risk regression areas | P3 | No |

## Quick Checklist

```
[ ] Identified all shared components affected
[ ] Identified all shared data/tables touched
[ ] Identified all shared APIs modified or consumed
[ ] Documented navigation integration points
[ ] Analyzed authentication/authorization impact
[ ] Flagged all breaking changes
[ ] Provided migration strategy for breaking changes
[ ] Listed affected features with risk levels
[ ] Created regression test plan
[ ] Documented rollback procedure (if high-risk)
```
