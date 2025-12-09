---
description: Execute comprehensive quality validation for Agent OS artifacts
globs:
alwaysApply: false
version: 1.0
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
