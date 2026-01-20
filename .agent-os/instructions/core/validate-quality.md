---
description: Execute comprehensive quality validation for Agent OS artifacts
globs:
alwaysApply: false
version: 5.4.0
encoding: UTF-8
---

# Quality Validation Execution Instructions

Execute comprehensive quality validation using QualityGateValidator with configurable thresholds and detailed reporting.

<pre_flight_check>
EXECUTE: @.agent-os/instructions/meta/pre-flight.md
</pre_flight_check>

<process_flow>

<step number="1" name="validation_setup">

### Step 1: Validation Setup and Target Identification

<target_detection>
**User-Specified**: Use provided path, validate exists, determine type from structure
**Auto-Detection**: If no path → scan for: `spec.md`/`tasks.md` (spec), `src/`/`lib/`/`*.{js,ts}` (impl)

**Classification**:
- **Specification**: Directory with spec.md + multiple .md files → completeness, technical depth, implementation readiness
- **Task**: Single tasks.md with checklist format → granularity, dependencies, testability
- **Implementation**: Directory with source code → code quality, test coverage, documentation
</target_detection>

<configuration_loading>
**Load**: `.agent-os/quality-config.yml` (if exists), else built-in defaults, override with CLI params

**Default Thresholds**:
- min_completeness: 0.90
- min_technical_depth: 0.85
- min_implementation_readiness: 0.90
- min_test_coverage: 0.85
- min_documentation_quality: 0.80
</configuration_loading>

**Actions**:
- Initialize QualityGateValidator with configuration
- Detect target type and path
- Load project-specific quality configuration
- Prepare validation environment

</step>

<step number="2" name="quality_assessment_execution">

### Step 2: Execute Quality Assessment

<specification_validation>
IF target_type == "specification":
EXECUTE: QualityGateValidator.validateSpecification(specPath)

**Completeness Check**:
- Required files: spec.md, technical-spec.md, implementation-guide.md
- Optional bonus: database-schema.md, api-spec.md
- Score: (present_required / total_required) + bonus_optional

**Technical Depth**:
- Count: code blocks, function signatures, API endpoints, DB schema references
- Score: aggregate technical indicator presence/quality

**Implementation Readiness**:
- Extract: file paths, function names, API endpoints, DB operations
- Validate: error handling, testing requirements
- Score: implementation-specific detail density

**Documentation Quality**:
- Analyze: word count, depth, examples, diagrams, TOC
- Score: documentation completeness and utility
</specification_validation>

<task_validation>
IF target_type == "task_list":
EXECUTE: QualityGateValidator.validateTaskList(tasksPath)

**Granularity**: Parse tasks, analyze length/specificity, check impl details/acceptance criteria
**Dependencies**: Extract deps, build graph, check cycles, validate consistency
**Testability**: Check acceptance criteria, verifiable outcomes, specific deliverables
**Specificity**: Extract file paths, function names, time estimates, technical details
</task_validation>

<full_stack_coupling_validation>
IF target_type == "specification":
EXECUTE: validateFullStackCoupling(specPath)

**Backend-Frontend Pairing**:
- IF database-schema.md OR api-spec.md exists:
  - REQUIRE: Frontend Implementation section with UI Components
  - ERROR_IF_MISSING: "Backend APIs/database specified but no frontend UI components"
- IF Frontend Implementation exists:
  - CHECK: API endpoints OR Backend Implementation OR explicit "static/no backend" note
  - WARNING_IF_MISSING: "Frontend UI specified but no backend APIs"

**Integration Specification** (if both frontend+backend):
- REQUIRE: Frontend-Backend Integration section
- VALIDATE: API Contract, Integration Points, data flow, error handling
- ERROR_IF_MISSING: "Full-stack feature missing integration specification"

**E2E Testing** (if full-stack):
- REQUIRE: E2E testing in Testing Strategy OR full user workflows
- WARNING_IF_MISSING: "Full-stack feature should include E2E testing"

**Scoring**:
- Backend without frontend (user-facing): -0.20
- Frontend without backend (data persistence needed): -0.10
- Missing integration section: -0.15
- Missing E2E tests: -0.10
- Complete full-stack spec: +0.10
</full_stack_coupling_validation>

<implementation_validation>
IF target_type == "implementation":
EXECUTE: QualityGateValidator.validateImplementation(implementationPath)

**Code Quality**: Style consistency, naming, commenting, complexity, maintainability
**Test Coverage**: Test files, frameworks, coverage breadth/depth, unit/integration/edge cases
**Documentation**: README, inline docs, API docs, usage examples, currency/accuracy
**Performance**: Algorithmic complexity, efficiency, optimization opportunities, resource usage, scalability
</implementation_validation>

**Actions**:
- Execute appropriate validation based on target type
- Analyze comprehensive quality metrics
- Generate detailed scoring and assessment data
- Calculate overall quality score using weighted factors

</step>

<step number="2.5" name="multi_agent_parallel_review">

### Step 2.5: Multi-Agent Parallel Review (Compound Engineering)

Execute specialized review agents in parallel to identify issues, patterns, and improvements.

<agent_selection_by_target>
| Target Type | Agents |
|-------------|--------|
| **Specification** | All 6 agents (security-sentinel, performance-oracle, architecture-strategist, pattern-recognition-specialist, code-simplicity-reviewer, data-integrity-guardian) |
| **Implementation** | All 6 agents (full code analysis) |
| **Task** | 3 agents (architecture-strategist, pattern-recognition-specialist, code-simplicity-reviewer) |
</agent_selection_by_target>

<parallel_execution_protocol>
**Strategy**:
- LAUNCH: All agents simultaneously via Task tool
- PROVIDE: Target path, target type, context window allocation, finding format requirements
- TIMEOUT: 15 min max; continue with completed agents if timeout
- COLLECT: Individual agent findings as they complete

**Finding Format** (standardized YAML):
```yaml
agent: [agent_name]
target: [file_path or specification_section]
findings:
  - id: [unique_finding_id]
    category: [Security|Performance|Architecture|Quality|Data|Patterns|Simplicity]
    severity: [CRITICAL|HIGH|MEDIUM|LOW|INFO]
    title: [Brief finding title]
    description: [Detailed explanation]
    location: [file:line or section_name]
    impact: [What could happen / why this matters]
    recommendation: [How to fix or improve]
    effort: [Small|Medium|Large]
    references: [Related documentation or standards]
```

**Context Allocation**:
- security-sentinel: 16KB | performance-oracle: 12KB | architecture-strategist: 16KB
- pattern-recognition-specialist: 12KB | code-simplicity-reviewer: 8KB | data-integrity-guardian: 12KB
- TOTAL: 76KB (leaves headroom for synthesis)

**Context Filtering**: Only relevant files per specialty, exclude binaries/deps/generated, focus changed files
</parallel_execution_protocol>

<error_handling_parallel_review>
**Agent Failure**:
- LOG: Agent name, error, timestamp
- CONTINUE: With remaining agents (degraded but functional)
- IF >50% fail: WARN incomplete review, ASK user to continue/retry, FALLBACK to sequential if persistent

**Finding Validation**: Require all fields (id, category, severity, title, location, recommendation), validate severity/category, correct format if possible, skip if uncorrectable
</error_handling_parallel_review>

**Actions**:
- Launch all selected review agents in parallel
- Execute agents simultaneously with optimized context windows
- Collect standardized findings from each agent
- Validate finding format and required fields
- Prepare findings for synthesis in Step 2.6

</step>

<step number="2.6" name="finding_synthesis_and_categorization">

### Step 2.6: Finding Synthesis and Categorization

Consolidate findings, remove duplicates, assign priorities, estimate effort, prepare actionable recommendations.

<synthesis_process>

**1. Collect and Organize**:
- GATHER: All agent findings
- GROUP: By file/component
- IDENTIFY: Hotspots (multiple findings per file)

**2. Categorize and Tag**:
| Category | Description |
|----------|-------------|
| Security | Vulnerabilities, compliance, attack vectors |
| Performance | Bottlenecks, inefficiencies, scalability |
| Architecture | Design patterns, structural issues, coupling |
| Quality | Code quality, maintainability, testability |
| Data | Data integrity, validation, consistency |
| Patterns | Anti-patterns, reusability opportunities |
| Simplicity | Complexity, over-engineering, clarity |

ADD: Secondary tags (language-specific, framework-specific, domain-specific, impact area)

**3. Deduplicate** (3-pass algorithm):

**Pass 1 - Exact Duplicates**:
```
FOR each finding F1:
  FOR each other finding F2:
    IF (F1.file == F2.file) AND (F1.line == F2.line):
      MERGE F1 and F2
```

**Pass 2 - Fuzzy Matches**:
```
FOR each remaining finding F1:
  FOR each other finding F2:
    IF F1.file != F2.file: CONTINUE
    
    similarity_score = len(words1 ∩ words2) / len(words1 ∪ words2)
    
    IF similarity_score > 0.80:
      MERGE F1 and F2
    
    # Keyword overlap check
    security_keywords = ["sql", "injection", "xss", "csrf", "auth", "bypass", "rce", "command", "deserialization", "ssrf"]
    performance_keywords = ["n+1", "query", "slow", "bottleneck", "memory", "leak", "cache", "index"]
    
    IF 2+ shared keywords AND same file AND lines within 50:
      MERGE F1 and F2
```

**Pass 3 - Related Clustering**:
```
FOR each remaining finding F1:
  FOR each other finding F2:
    same_component = (F1.file == F2.file) OR (extract_class(F1.file) == extract_class(F2.file))
    IF NOT same_component: CONTINUE
    
    # Related category pairs
    related_patterns = [
      ("security", "data-integrity"), ("performance", "architecture"),
      ("architecture", "quality"), ("security", "quality")
    ]
    
    IF (F1.category, F2.category) in related_patterns:
      CREATE/ADD TO cluster
    
    IF F1.category == F2.category AND abs(F1.line - F2.line) < 20:
      CREATE/ADD TO cluster
```

**Merge Strategy**:
```yaml
merged_finding:
  id: [PRIMARY_FINDING_ID]
  merged_from: [LIST_OF_MERGED_IDS]
  severity: [HIGHEST_AMONG_DUPLICATES]
  title: "[MOST_SPECIFIC_TITLE] (identified by N agents)"
  description: |
    [PRIMARY_DESCRIPTION]
    
    Additional perspectives:
    - [AGENT_2]: [AGENT_2_DESCRIPTION]
    - [AGENT_3]: [AGENT_3_DESCRIPTION]
  impact: [COMBINED_IMPACTS]
  recommendations: [DEDUPLICATED_SORTED_BY_SPECIFICITY]
  source_agents: [agent-1, agent-2, agent-3]
  confidence_boost: +20 points per additional agent
```

**Cluster Structure**:
```yaml
cluster:
  cluster_id: [COMPONENT]-cluster-[NUM]
  cluster_type: [root-cause|symptom-group|related-issues]
  component: [FILE_OR_CLASS]
  finding_count: [NUM]
  root_cause: [IF_IDENTIFIED]
  findings: [LIST_WITH_PRIORITIES]
  cluster_severity: [HIGHEST_IN_CLUSTER]
  holistic_recommendation: |
    [COMPREHENSIVE_SOLUTION_FOR_ROOT_CAUSE]
  estimated_effort: [COMBINED]
```

**Deduplication Report**:
- Total findings (before): [count]
- Pass 1 - Exact duplicates: [count]
- Pass 2 - Fuzzy matches: [count]
- Pass 3 - Clusters: [count] findings in [cluster_count] clusters
- Final unique findings: [count]
- Deduplication rate: [percentage]%

**4. Severity Assignment**:

**Base Severity Score** (0-100):
```
1. Impact (0-40 points):
   - Data Loss/Corruption: 40
   - Security Breach (auth bypass, SQL injection): 40
   - System Unavailable/Crash: 35
   - Significant Performance Degradation (>2s): 30
   - UX Degradation (1-2s): 20
   - Maintainability Issues: 15
   - Code Quality/Style: 10
   - Documentation Gaps: 5

2. Affected Users (0-25 points):
   - All users (100%): 25
   - Most users (>50%): 20
   - Some users (10-50%): 15
   - Few users (<10%): 10
   - Developers only: 5

3. Likelihood (0-20 points):
   - Certain (every use): 20
   - Very Likely (>75%): 15
   - Probable (25-75%): 10
   - Possible (<25%): 5
   - Rare (edge case): 2

4. Exploitability (0-15 points, security only):
   - No auth required, trivial: 15
   - Low complexity (OWASP Top 10): 12
   - Medium complexity: 8
   - High complexity: 4
   - Very high complexity: 2
   - N/A (not security): 0

TOTAL = Impact + Users + Likelihood + Exploitability

Severity Mapping:
- P1 (CRITICAL) 🔴: Score ≥ 70
- P2 (IMPORTANT) 🟡: Score 40-69
- P3 (NICE-TO-HAVE) 🔵: Score < 40
```

**Automatic P1** (regardless of score):
- SQL injection, auth bypass, authorization bypass, RCE, command injection
- LDAP/NoSQL injection, deserialization, SSRF (internal network), hard-coded credentials
- PII/PHI exposure unencrypted, GDPR/HIPAA/PCI-DSS violations, data loss/corruption

**Automatic P2** (regardless of score):
- XSS (stored/reflected), CSRF (state-changing), missing rate limiting (auth endpoints)
- Insufficient security logging, path traversal, open redirects, missing HTTPS (sensitive)
- Weak crypto, missing input validation (user data)

**Score Adjustments** (+10 each):
- Affects auth/authz flows | payment/financial | PII/PHI handling
- 2+ agents flagged independently | high-churn code (>10 commits/3mo)
- Public API/user-facing | cascading failure potential

**Score Adjustments** (-10 each):
- Internal tools/admin only | requires unlikely conditions
- Deprecated code (scheduled removal) | workaround exists/documented

**5. Effort Estimation**:

**Effort Score** (0-100):
```
1. Scope (0-40 points):
   - Single file, single function: 5
   - Single file, multiple functions: 10
   - 2-3 related files: 20
   - 4-10 files: 30
   - 10+ files or system-wide: 40

2. Risk (0-25 points):
   - Documentation only: 0
   - Configuration change: 5
   - New code (additive): 8
   - Refactoring (low-risk): 12
   - Security patch (critical path): 20
   - Data migration/schema change: 25

3. Testing (0-20 points):
   - No tests needed: 0
   - Simple unit tests: 5
   - Unit + integration: 10
   - E2E tests required: 15
   - Security/performance testing: 20

4. Dependencies (0-10 points):
   - No dependencies: 0
   - 1-2 internal: 3
   - 3-5 internal: 6
   - External API changes: 8
   - Breaking changes (public API): 10

5. Expertise (0-5 points):
   - Common pattern, documented: 0
   - Framework-specific: 2
   - Security expertise: 4
   - Specialized domain knowledge: 5

TOTAL = Scope + Risk + Testing + Dependencies + Expertise

Effort Mapping:
- Small (1-2 hrs): 0-25
- Medium (3-8 hrs): 26-60
- Large (1-3 days): 61-100
```

**Effort Adjustments**:
- INCREASE (+1 level): Legacy code/poor docs, no tests, multi-team coordination, prod hotfix, regulatory/compliance
- DECREASE (-1 level, min Small): Automated tools available, similar fix recently done, comprehensive test suite, well-documented, incremental possible

**Cluster Efficiency**:
- Root-cause cluster: effort × 0.6
- Symptom-group cluster: effort × 0.8
- Related-issues cluster: effort × 0.9

**ROI Calculation**:
```
ROI_Score = (Impact_Score × Severity_Multiplier) / Effort_Score

Impact_Score (1-10):
- Critical user-facing: 10 | Important workflow: 8 | Secondary features: 6
- Internal tools/admin: 4 | Developer experience: 3 | Docs/polish: 1

Severity_Multiplier:
- P1: 3.0 | P2: 2.0 | P3: 1.0

Effort_Score:
- Small (1-2 hrs): 1 | Medium (3-8 hrs): 3 | Large (1-3 days): 8

Prioritization:
1. Quick Wins (ROI > 10)
2. Major Projects (ROI 5-10, P1)
3. Incremental (ROI 3-5, P2)
4. Backlog (ROI < 3 or P3)

SORT: Severity (P1→P2→P3) → ROI (high→low) → Effort (Small→Large within ROI)
```

**Quick Wins** (flag with 🔥):
- ROI ≥ 10
- OR (P1 AND Small effort)
- OR (P2 AND Small effort AND Impact ≥ 6)

**6. Generate Recommendations**:
```markdown
## [ID]: [Title]

**Severity**: [P1/P2/P3] | **Category**: [Category] | **Effort**: [Small/Medium/Large] | **ROI**: [score]

**Location**: [file:line]

**Problem**: [Clear description]

**Impact**: [What could happen]

**Recommendation**: [Specific actionable steps]

**Example Solution**:
```[lang]
[Code example]
```

**References**: [Documentation/guides/advisories]

**Agents**: [List of agents]
```

</synthesis_process>

<synthesis_output_format>

**Summary Statistics**:
```
📊 Finding Synthesis Summary

Total Findings: [count]
- 🔴 Critical (P1): [count] - Must address before proceeding
- 🟡 Important (P2): [count] - Should address for quality
- 🔵 Nice-to-Have (P3): [count] - Consider for improvement

Category Breakdown:
Security: [count] | Performance: [count] | Architecture: [count]
Quality: [count] | Data: [count] | Patterns: [count] | Simplicity: [count]

Effort Estimation:
Small (1-2 hrs): [count] | Medium (3-8 hrs): [count] | Large (1-3 days): [count]
Total estimated effort: [hours/days]

Deduplication: [original] → [final] ([percentage]% reduction)

Agent Participation:
security-sentinel: [count] | performance-oracle: [count] | architecture-strategist: [count]
pattern-recognition: [count] | code-simplicity: [count] | data-integrity: [count]
```

**Prioritized Findings**: List by P1 → P2 → P3 with full details per finding

**Quick Wins** ⚡: High impact, low effort (ROI > 5, Small effort, P1/P2)

**Code Hotspots** 🔥: Files with 3+ findings, recommend comprehensive refactoring

</synthesis_output_format>

<triage_integration_preparation>
**Prepare for Triage**:
- Provide all findings in standardized format
- Priority ordering: P1 → P2 → P3 → ROI within severity
- Include effort estimates, category tags, quick wins, hotspots

**State Persistence**:
```
SAVE: [target]/.quality-validation/findings-[timestamp].yml

FORMAT:
  validation_timestamp: [ISO_timestamp]
  target_path: [path]
  target_type: [type]
  agents_executed: [list]
  summary: [stats]
  findings: [all findings]

USE FOR: Triage input, progress tracking, before/after comparison, quality trends
```
</triage_integration_preparation>

**Actions**:
- Synthesize all agent findings into actionable recommendations
- Deduplicate: Remove duplicates, merge related findings
- Prioritize: Assign severity, calculate ROI
- Estimate: Provide realistic effort estimates
- Prepare: Format for quality report and optional triage
- Persist: Save findings state for tracking

</step>

<step number="2.7" name="ui_specification_validation">

### Step 2.7: UI Specification Validation (v5.1.0+)

**Trigger**: When target is a specification that includes frontend/UI components.

**Purpose**: Ensure UI specifications include mandatory E2E test strategy, accessibility requirements, and browser validation criteria.

<ui_spec_detection>
```yaml
ui_spec_indicators:
  # Check for UI-related content in spec files
  CHECK: spec.md, technical-spec.md, ux-ui-spec.md

  HAS_UI_IF:
    - Contains "UI Components" section
    - Contains "Frontend Implementation" section
    - Contains "User Interface" or "User Flow"
    - References .tsx, .jsx, .vue, .svelte files
    - Contains route definitions (/path, /route)
    - References form components or form validation

  IF has_ui_content:
    EXECUTE: UI-specific validation
  ELSE:
    SKIP: UI validation (backend-only spec)
```
</ui_spec_detection>

<e2e_test_strategy_validation>
**Check**: E2E Test Strategy Exists (MANDATORY for UI specs)

```yaml
e2e_strategy_check:
  LOOK_FOR: sub-specs/e2e-test-strategy.md

  IF NOT exists:
    FINDING:
      severity: P1 (CRITICAL)
      category: Testing
      title: "Missing E2E Test Strategy"
      description: |
        UI specification lacks E2E test strategy document.
        This is MANDATORY for all UI features per Agent OS v5.1.0.
      recommendation: |
        Create sub-specs/e2e-test-strategy.md with:
        1. User flow inventory with tier assignments
        2. Critical path tests (smoke tier)
        3. Feature tests (core tier)
        4. data-testid specifications for all interactive elements
        5. Accessibility testing requirements
        6. Browser validation matrix
      reference: "@instructions/core/create-spec.md Step 9.6"

  IF exists:
    VALIDATE contents:

    # 1. User Flow Inventory
    CHECK: "User Flow Inventory" section exists
    VERIFY: Each flow has tier assignment (smoke/core/regression)
    IF missing:
      FINDING: P2, "E2E strategy missing user flow inventory"

    # 2. data-testid Specifications
    CHECK: "data-testid Elements" table exists
    COUNT: data-testid entries
    IF count < (form_elements_in_spec):
      FINDING: P2, "Incomplete data-testid specifications"
      DETAIL: "Found {count} data-testid entries, spec has {form_count} form elements"

    # 3. Tier Assignments
    CHECK: Each user flow has tier (smoke/core/regression)
    VERIFY: At least 1 smoke tier test for critical paths
    IF no_smoke_tests:
      FINDING: P2, "No smoke tier tests defined for critical paths"

    # 4. Accessibility Requirements
    CHECK: "Accessibility Testing Requirements" section exists
    VERIFY: Per-page accessibility matrix defined
    IF missing:
      FINDING: P2, "Missing accessibility testing requirements"

    # 5. Browser Matrix
    CHECK: "Browser Validation Matrix" section exists
    VERIFY: At least Chrome + Mobile defined
    IF missing:
      FINDING: P3, "Missing browser validation matrix"
```
</e2e_test_strategy_validation>

<ux_ui_spec_validation>
**Check**: UX/UI Specification Completeness

```yaml
ux_ui_spec_check:
  LOOK_FOR: sub-specs/ux-ui-spec.md

  IF spec_requires_frontend AND NOT exists:
    FINDING:
      severity: P1 (CRITICAL)
      category: Architecture
      title: "Missing UX/UI Specification"
      description: |
        Frontend feature lacks UX/UI specification.
        Architecture-first approach requires routes, navigation,
        and layout to be defined BEFORE component implementation.
      recommendation: |
        Create sub-specs/ux-ui-spec.md following:
        @instructions/utilities/ux-ui-specification-checklist.md
      reference: "@instructions/core/create-spec.md Step 9.5"

  IF exists:
    VALIDATE phases:

    # Phase 1: Application Architecture (REQUIRED)
    CHECK: Route Structure defined (no "TBD")
    CHECK: Navigation Structure defined (no "if exists")
    CHECK: Layout Integration specified
    CHECK: User Entry Points documented
    CHECK: User Flows step-by-step

    IF any_missing_phase1:
      FINDING:
        severity: P1 (CRITICAL)
        title: "Incomplete UX/UI Architecture (Phase 1)"
        description: "Cannot proceed without complete architecture specification"

    # Phase 2: Layout Systems
    CHECK: Container Specifications with responsive classes
    CHECK: Spacing System with Tailwind classes
    CHECK: Typography System defined

    IF any_missing_phase2:
      FINDING: P2, "Incomplete layout system specification"

    # Phase 3: Component Patterns
    CHECK: Component Library Strategy defined
    CHECK: Component specifications include:
      - Props interface
      - State variations (default, hover, active, disabled, loading, error)
      - Responsive behavior
      - Accessibility requirements

    IF any_missing_phase3:
      FINDING: P2, "Incomplete component specifications"

    # Phase 4: Interaction Patterns
    CHECK: Interactive states defined
    CHECK: Form validation approach specified

    IF any_missing_phase4:
      FINDING: P3, "Incomplete interaction patterns"

    # Anti-Pattern Detection
    SCAN for:
      - "TBD" or "TODO" in routes/navigation
      - "if exists" language
      - Pixels without Tailwind classes
      - Missing responsive specifications
      - Components without state variations

    FOR each anti_pattern:
      FINDING: P2, "UX/UI anti-pattern: {pattern}"
```
</ux_ui_spec_validation>

<ui_task_validation>
**Check**: UI Tasks Have Correct Dependencies

```yaml
ui_task_dependency_check:
  IF target_type == "task_list":
    SCAN: tasks.md for UI implementation tasks

    FOR each impl-user-flow-* task:
      # Check E2E test dependency
      VERIFY: test-user-flow-* task exists
      VERIFY: test-user-flow-* BLOCKS impl-user-flow-*

      IF NOT blocking_dependency:
        FINDING:
          severity: P1 (CRITICAL)
          category: Testing
          title: "E2E test not blocking implementation"
          description: |
            Task {impl_task} can complete without E2E tests passing.
            Per v5.1.0, E2E tests MUST block implementation completion.
          recommendation: |
            Add to task file:
            blocking_dependencies:
              - task_id: test-user-flow-{name}
                type: e2e_test
                must_pass: true
          reference: "@instructions/core/create-tasks.md"

    FOR each impl-frontend-components task:
      # Check data-testid requirement
      VERIFY: Acceptance criteria includes "data-testid attributes"

      IF NOT includes_testid_requirement:
        FINDING:
          severity: P2
          category: Testing
          title: "Missing data-testid requirement in component task"
          recommendation: "Add to AC: 'Include data-testid attributes per e2e-strategy'"

    # Check validate-browser task exists
    FOR each user_flow:
      VERIFY: validate-browser-{flow} task exists
      VERIFY: Depends on test-user-flow-{flow}

      IF NOT exists:
        FINDING:
          severity: P2
          category: Quality
          title: "Missing browser validation task for {flow}"
          recommendation: "Add validate-browser-{flow} task per create-tasks.md"
```
</ui_task_validation>

<ui_acceptance_criteria_validation>
**Check**: UI Tasks Have Complete Acceptance Criteria

```yaml
ui_acceptance_criteria_check:
  FOR each frontend task in tasks/:
    READ: task file

    CHECK acceptance_criteria contains:

    # For component tasks
    IF task_type == "component":
      REQUIRE:
        - [ ] Unit tests pass
        - [ ] Accessibility scan passes (0 critical violations)
        - [ ] data-testid attributes present

      RECOMMEND:
        - [ ] Responsive design verified
        - [ ] Keyboard navigation works

    # For user flow tasks
    IF task_type == "user_flow":
      REQUIRE:
        - [ ] E2E tests pass
        - [ ] Accessibility scan passes (WCAG 2.1 AA)
        - [ ] Browser validation completed

      RECOMMEND:
        - [ ] Performance targets met (LCP < 2.5s, CLS < 0.1)
        - [ ] Evidence documented

    # For page tasks
    IF task_type == "page":
      REQUIRE:
        - [ ] E2E tests pass
        - [ ] Accessibility scan passes
        - [ ] Core Web Vitals measured

    FOR each missing_requirement:
      FINDING:
        severity: P2
        category: Quality
        title: "Missing required acceptance criterion"
        description: "Task {task_id} missing: {requirement}"
        recommendation: "Add to acceptance criteria: {requirement}"
        reference: "@instructions/utilities/ui-acceptance-criteria-checklist.md"
```
</ui_acceptance_criteria_validation>

<ui_validation_summary>
**Output**: UI Validation Summary

```
═══════════════════════════════════════════════════════════════════
UI SPECIFICATION VALIDATION - SUMMARY
═══════════════════════════════════════════════════════════════════

📋 E2E Test Strategy:
   Status: [PRESENT/MISSING]
   User Flows Defined: [COUNT]
   Smoke Tests: [COUNT]
   data-testid Coverage: [COUNT]/[TOTAL] ([PERCENT]%)
   Accessibility Requirements: [DEFINED/MISSING]
   Browser Matrix: [DEFINED/MISSING]

🎨 UX/UI Specification:
   Status: [PRESENT/MISSING]
   Phase 1 (Architecture): [COMPLETE/INCOMPLETE]
   Phase 2 (Layout): [COMPLETE/INCOMPLETE]
   Phase 3 (Components): [COMPLETE/INCOMPLETE]
   Phase 4 (Interactions): [COMPLETE/INCOMPLETE]
   Anti-Patterns Found: [COUNT]

📝 Task Dependencies:
   UI Tasks: [COUNT]
   E2E Blocking Dependencies: [COUNT]/[REQUIRED]
   Browser Validation Tasks: [COUNT]/[REQUIRED]
   Missing data-testid Requirements: [COUNT]

🔍 Acceptance Criteria:
   Tasks with Complete UI AC: [COUNT]/[TOTAL]
   Missing Requirements: [COUNT]

⚠️ UI-Specific Findings:
   P1 (Critical): [COUNT] - Block implementation
   P2 (Important): [COUNT] - Should address
   P3 (Nice-to-have): [COUNT] - Consider

═══════════════════════════════════════════════════════════════════
```
</ui_validation_summary>

**Actions**:
- Validate E2E test strategy exists and is complete
- Validate UX/UI specification follows architecture-first approach
- Verify UI task dependencies (E2E tests block implementation)
- Check acceptance criteria completeness
- Generate UI-specific findings

</step>

<step number="2.8" name="semantic_coverage_validation">

### Step 2.8: Semantic Coverage Validation (v5.4.0+)

**Purpose**: Validate that specifications address all aspects of user workflows, data flows, and integration impacts - not just structural completeness.

**Key Insight**: A specification can be structurally complete (all files exist, all sections filled) yet miss critical workflow aspects like error states, data validation paths, or integration impacts.

<semantic_coverage_protocol>

**Reference Checklists**:
- `@.agent-os/instructions/utilities/post-spec-coverage-checklist.md`
- `@.agent-os/instructions/utilities/data-flow-tracing.md`
- `@.agent-os/instructions/utilities/integration-impact-analysis.md`

**Execution**:
```yaml
semantic_coverage_validation:
  # 1. Classify feature type
  CLASSIFY target:
    frontend_only: Has UI components, no database/API changes
    backend_only: Has database/API, no user-facing UI
    full_stack: Has both UI and backend components

  # 2. Run Post-Spec Coverage Checklist
  EXECUTE: post-spec-coverage-checklist
  
  ui_workflow_checks:  # If has frontend
    - screens_identified: "All screens/views user interacts with"
    - navigation_flow: "Complete path between screens"
    - empty_states: "What shows when no data"
    - loading_states: "What shows during async ops"
    - error_states: "What shows when things fail"
    - feedback_mechanisms: "Toasts, confirmations, progress"
  
  data_backend_checks:  # If has backend
    - database_schema: "All tables/fields defined"
    - api_endpoints: "All endpoints specified"
    - client_validation: "Frontend validation rules"
    - server_validation: "Backend validation rules"
    - data_migration: "Migration strategy if modifying existing"
  
  edge_case_checks:  # Always
    - error_scenarios: "Network, server, client errors handled"
    - permission_checks: "Auth at every relevant step"
    - race_conditions: "Concurrent access scenarios"
    - boundary_conditions: "Empty, null, max values"
  
  integration_checks:  # Always
    - existing_feature_integration: "Works with current features"
    - dependency_identification: "External deps documented"
    - breaking_changes: "Impact on existing functionality"
  
  testing_checks:  # Always
    - task_verifiability: "Each task independently testable"
    - testable_acceptance_criteria: "Specific, measurable criteria"
    - e2e_workflow_tests: "Complete workflow coverage"

  # 3. Run Data Flow Tracing (if has data entities)
  IF has_database_schema OR has_api_spec:
    EXECUTE: data-flow-tracing
    
    FOR each data_entity:
      TRACE create_flow:
        - UI entry point → Form fields → Client validation
        - API endpoint → Server validation → DB write
        - Success feedback
      
      TRACE read_flow:
        - Display location → API query → DB read
        - Loading state → Empty state → Error state
      
      TRACE update_flow: (if applicable)
        - Edit entry point → Pre-populated form
        - API endpoint → Conflict handling
      
      TRACE delete_flow: (if applicable)
        - Delete trigger → Confirmation
        - API endpoint → Cascade behavior
      
      FLAG gaps:
        - "Data stored but never displayed"
        - "Display exists but no persistence"
        - "API endpoint with no UI"
        - "Missing validation layer"

  # 4. Run Integration Impact Analysis
  EXECUTE: integration-impact-analysis
  
  IDENTIFY touchpoints:
    - shared_components: "UI components used elsewhere"
    - shared_data: "Tables accessed by other features"
    - shared_apis: "Endpoints used by other clients"
    - navigation_integration: "Links to/from existing pages"
    - auth_integration: "Permission/role changes"
  
  DETECT breaking_changes:
    - api_breaking: "Removed/changed endpoints"
    - db_breaking: "Schema changes affecting queries"
    - component_breaking: "Changed props/behavior"
    - config_breaking: "Changed env vars/settings"
  
  ASSESS regression_risk:
    - high_risk_areas: "Full regression needed"
    - medium_risk_areas: "Targeted tests needed"
    - affected_features: "Features to verify"

  # 5. Aggregate findings
  COLLECT findings by severity:
    P1_critical:
      - "Data can be created but never displayed"
      - "Missing server validation for user input"
      - "Breaking API change without migration"
      - "Missing error handling for critical path"
      - "Security gap in permission checks"
    
    P2_important:
      - "Missing loading/empty/error states"
      - "No client validation"
      - "Breaking component changes"
      - "Missing E2E test for workflow"
    
    P3_nice_to_have:
      - "No undo capability"
      - "Missing optimistic updates"
      - "Documentation gaps"

  # 6. Calculate semantic coverage score
  CALCULATE score:
    workflow_coverage: (checks_passed / total_workflow_checks)
    data_flow_coverage: (complete_flows / total_entities)
    integration_coverage: (touchpoints_documented / total_touchpoints)
    
    semantic_score: weighted_average(
      workflow_coverage * 0.4,
      data_flow_coverage * 0.35,
      integration_coverage * 0.25
    )
```
</semantic_coverage_protocol>

<semantic_coverage_output>

**Output Format**:
```
═══════════════════════════════════════════════════════════════════
SEMANTIC COVERAGE VALIDATION
═══════════════════════════════════════════════════════════════════

Feature Type: [frontend_only | backend_only | full_stack]
Semantic Coverage Score: [SCORE]/1.0

📋 WORKFLOW COVERAGE
───────────────────────────────────────────────────────────────────
UI & User Workflow:
  Screens Identified:     [✓/✗] {count} screens
  Navigation Flow:        [✓/✗/NA]
  Empty States:           [✓/✗/NA] {count}/{total}
  Loading States:         [✓/✗/NA] {count}/{total}
  Error States:           [✓/✗] {count}/{total}
  Feedback Mechanisms:    [✓/✗/NA]

Data & Backend:
  Database Schema:        [✓/✗/NA]
  API Endpoints:          [✓/✗/NA] {count} endpoints
  Client Validation:      [✓/✗/NA]
  Server Validation:      [✓/✗/NA]
  Data Migration:         [✓/✗/NA]

Edge Cases:
  Error Scenarios:        [✓/✗]
  Permission Checks:      [✓/✗/NA]
  Race Conditions:        [✓/✗/NA]
  Boundary Conditions:    [✓/✗]

📊 DATA FLOW TRACING
───────────────────────────────────────────────────────────────────
Entities Analyzed: {count}

| Entity | Create | Read | Update | Delete | Gaps |
|--------|--------|------|--------|--------|------|
| {name} | ✓/✗    | ✓/✗  | ✓/✗/NA | ✓/✗/NA | {n}  |

Flow Gaps Found: {count}
- {entity}: {gap_description}

🔗 INTEGRATION IMPACT
───────────────────────────────────────────────────────────────────
Touchpoints: {count}
Breaking Changes: {count}
Affected Features: {count}
Regression Risk: [HIGH/MEDIUM/LOW]

Breaking Changes:
- {type}: {description} → {remediation}

Affected Features:
- {feature}: {impact} [{risk_level}]

⚠️ FINDINGS
───────────────────────────────────────────────────────────────────
🔴 P1 (Must Fix): {count}
- {finding}: {location} → {remediation}

🟡 P2 (Should Fix): {count}
- {finding}: {location} → {remediation}

🔵 P3 (Nice to Have): {count}
- {finding}: {location} → {remediation}

═══════════════════════════════════════════════════════════════════
```
</semantic_coverage_output>

<semantic_coverage_enforcement>

**Enforcement Rules**:
```yaml
enforcement:
  P1_findings:
    action: BLOCK
    message: "Cannot proceed with P1 semantic coverage gaps"
    requirement: "Must address all P1 findings before user review"
  
  P2_findings:
    action: WARN
    message: "P2 gaps found - recommend addressing"
    options:
      - "ADDRESS: Fix P2 gaps"
      - "CONTINUE: Proceed with acknowledgment"
      - "ABORT: Cancel spec creation"
    if_continue:
      SAVE: ".agent-os/specs/{spec_folder}/coverage-acknowledgment.md"
  
  P3_findings:
    action: INFO
    message: "P3 improvements available"
    no_blocking: true

  score_threshold:
    minimum: 0.85
    if_below:
      action: WARN
      message: "Semantic coverage score {score} below threshold 0.85"
```
</semantic_coverage_enforcement>

**Actions**:
- Execute post-spec coverage checklist
- Trace data flows for all entities
- Analyze integration impacts
- Aggregate and prioritize findings
- Enforce coverage thresholds
- Generate semantic coverage report

</step>

<step number="3" name="quality_report_generation">

### Step 3: Generate Comprehensive Quality Report

<report_structure>

**Header**:
```
📊 Quality Validation Report
- Target Type: [specification|task_list|implementation]
- Target Path: [path]
- Validation Timestamp: [ISO_timestamp]
- Validator Version: [version]
- Configuration: [threshold_summary]
```

**Overall Score**:
```
🎯 Overall Quality Score: [SCORE]/1.0 ([STATUS])

Status Mapping:
- 0.90+:    🟢 Excellent - Ready for implementation/deployment
- 0.80-0.89: 🟡 Good - Minor improvements recommended
- 0.70-0.79: 🟠 Acceptable - Some enhancements needed
- 0.60-0.69: 🔴 Needs Improvement - Significant issues
- <0.60:     ⚫ Inadequate - Major rework required
```

**Detailed Breakdown**:
```
📈 Quality Category Breakdown

FOR each category:
- [Category]: [Score]/1.0 ([Pass/Fail/Warning])
  - Threshold: [configured]
  - Details: [metrics]
  - Issues: [problems]
```

**Issues Identified**:
```
⚠️ Issues Identified ([TOTAL])

Priority:
🔴 High Priority ([COUNT]) - Must address before proceeding
🟡 Medium Priority ([COUNT]) - Should address for quality
🔵 Low Priority ([COUNT]) - Consider for future

FOR each issue:
- [Issue_Type]: [Description]
  - Location: [File/Section]
  - Impact: [Quality impact]
  - Recommendation: [Specific action]
```

**Recommendations**:
```
💡 Actionable Recommendations ([COUNT])

🎯 Immediate Actions Required:
FOR each critical:
  1. [Issue]: [Action]
     - Location: [Where]
     - Expected Outcome: [Success criteria]
     - Estimated Effort: [Time/complexity]

🔧 Improvement Opportunities:
FOR each enhancement:
  1. [Enhancement]: [Suggestion]
     - Benefit: [Why this matters]
     - Implementation: [How to implement]
     - Priority: [High/Medium/Low]

📚 Best Practice Recommendations:
FOR each gap:
  1. [Practice]: [Recommended]
     - Reference: [Standard/Documentation]
     - Implementation Guide: [How to apply]
```

**Quality Gates**:
```
✅ Quality Gate Status

- Passed Gates: [list]
- Failed Gates: [list]
- Warning Gates: [list]

Threshold Analysis:
FOR each threshold:
  - [Name]: [Actual] vs [Required] ([Pass/Fail])
```

</report_structure>

**Actions**:
- Generate comprehensive quality report
- Format structured markdown with clear sections
- Include specific file paths, line numbers, concrete recommendations
- Prioritize issues by impact and effort

</step>

<step number="4" name="actionable_guidance_provision">

### Step 4: Provide Actionable Guidance and Follow-up Options

<actionable_guidance>

**Quality Improvement Roadmap**:
```
🚀 Quality Improvement Roadmap

Phase 1: Critical Issues (Required)
FOR each high-priority:
  □ Step [N]: [Action]
    - File: [exact_path]
    - Change: [what_to_modify]
    - Validation: [verify_fix]
    - Time Estimate: [effort]

Phase 2: Quality Enhancements (Recommended)
FOR each medium-priority:
  □ Step [N]: [Action]
    - Benefit: [quality_improvement]
    - Implementation: [guide]
    - Success Metrics: [measure]

Phase 3: Best Practice Adoption (Optional)
FOR each best practice:
  □ Step [N]: [Action]
    - Standard: [reference]
    - Application: [project_guidance]
    - Long-term Benefit: [maintenance/scalability]
```

**Implementation Templates**: Code templates, config examples, documentation templates with before/after examples for complex recommendations

</actionable_guidance>

<follow_up_options>

**Re-validation Options**:
- Immediate Re-run: Validate again after critical fixes
- Progress Tracking: Compare before/after quality scores
- Incremental Validation: Validate specific categories after targeted improvements
- Full Re-assessment: Complete quality re-evaluation after all changes

**Continuous Quality Monitoring**:
- Automated Quality Checks: Pre-commit hooks for quality validation
- CI/CD Integration: Quality gates in deployment pipelines
- Periodic Assessment: Schedule regular quality reviews
- Quality Metrics Dashboard: Track quality trends over time

**Integration with Agent OS Workflows**:
- create-spec.md: Automatic validation before user review
- create-tasks.md: Task quality validation during generation
- execute-tasks.md: Implementation quality validation during execution
- Custom Workflow: Add quality gates to custom workflows

</follow_up_options>

<user_interaction>

**Improvement Confirmation**:
```
PROMPT: "Would you like me to help implement any of these improvements?"
OPTIONS:
  - Yes, help with critical issues first
  - Yes, provide implementation guidance for [specific issue]
  - No, I'll implement these myself
  - Re-run validation after I make changes
```

**Customization Options**:
```
OFFER: "Would you like to customize quality thresholds for this project?"
PROVIDE: Template for .agent-os/quality-config.yml
EXPLAIN: How different thresholds affect validation results
```

</user_interaction>

**Actions**:
- Provide clear, actionable guidance for quality improvements
- Offer follow-up validation and monitoring options
- Engage user interaction for immediate improvement assistance
- Integrate quality validation with existing Agent OS workflows

</step>

</process_flow>

<error_handling>

| Error Type | Scenarios | Action |
|------------|-----------|--------|
| **File Access** | Missing files/directories, permission issues, corrupted/unreadable files | Provide clear error messages with resolution guidance |
| **Parsing** | Malformed markdown (task lists), invalid config files, unexpected formats | Graceful degradation with partial validation results |
| **Configuration** | Invalid quality thresholds, missing config files, conflicting settings | Fall back to defaults with warning messages |
| **Empty Targets** | Empty spec directories, empty task files, empty impl directories | Provide guidance on minimum content requirements |
| **Partial Implementations** | Incomplete specs, work-in-progress implementations, draft task lists | Adjust expectations and provide appropriate guidance |

</error_handling>

<post_flight_check>
EXECUTE: @.agent-os/instructions/meta/post-flight.md
</post_flight_check>
