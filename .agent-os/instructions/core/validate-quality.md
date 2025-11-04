---
description: Execute comprehensive quality validation for Agent OS artifacts
globs:
alwaysApply: false
version: 1.0
encoding: UTF-8
---

# Quality Validation Execution Instructions

## Overview

Execute comprehensive quality validation for Agent OS specifications, tasks, or implementations using the QualityGateValidator system with configurable thresholds and detailed reporting.

<pre_flight_check>
  EXECUTE: @.agent-os/instructions/meta/pre-flight.md
</pre_flight_check>

<process_flow>

<step number="1" name="validation_setup">

### Step 1: Validation Setup and Target Identification

Initialize validation environment and identify the target for quality assessment.

<target_detection>
  <user_specified>
    - Use provided path parameter
    - Validate path exists and is accessible
    - Determine target type based on path structure
  </user_specified>

  <auto_detection>
    IF no path provided:
      SCAN current working directory for:
        - "spec.md" OR "tasks.md" → specification validation
        - "src/" OR "lib/" OR "*.js" OR "*.ts" → implementation validation
        - Multiple candidates → prompt user for selection
  </auto_detection>

  <target_classification>
    <specification_targets>
      - Directory containing spec.md
      - Must have multiple .md files
      - Validates completeness, technical depth, implementation readiness
    </specification_targets>

    <task_targets>
      - Single tasks.md file
      - Contains markdown checklist format
      - Validates granularity, dependencies, testability
    </task_targets>

    <implementation_targets>
      - Directory with source code
      - Contains .js, .ts, .py, or other code files
      - Validates code quality, test coverage, documentation
    </implementation_targets>
  </target_classification>
</target_detection>

<configuration_loading>
  <quality_config>
    LOAD: .agent-os/quality-config.yml (if exists)
    DEFAULT: Built-in quality thresholds
    OVERRIDE: Command-line parameters (if provided)
  </quality_config>

  <threshold_configuration>
    - min_completeness: 0.90
    - min_technical_depth: 0.85
    - min_implementation_readiness: 0.90
    - min_test_coverage: 0.85
    - min_documentation_quality: 0.80
  </threshold_configuration>
</configuration_loading>

<instructions>
  ACTION: Initialize QualityGateValidator with configuration
  DETECT: Target type and path for validation
  LOAD: Project-specific quality configuration
  PREPARE: Validation environment and parameters
</instructions>

</step>

<step number="2" name="quality_assessment_execution">

### Step 2: Execute Quality Assessment

Perform comprehensive quality analysis based on target type and generate detailed metrics.

<specification_validation>
  IF target_type == "specification":
    EXECUTE: QualityGateValidator.validateSpecification(specPath)

    <validation_components>
      <completeness_check>
        - Scan for required files: spec.md, technical-spec.md, implementation-guide.md
        - Check for optional files: database-schema.md, api-spec.md
        - Validate file structure and organization
        - Score: (present_required / total_required) + bonus_optional
      </completeness_check>

      <technical_depth_analysis>
        - Analyze technical-spec.md for implementation details
        - Count code blocks, function signatures, API endpoints
        - Assess database schema references and data models
        - Score: aggregate of technical indicator presence and quality
      </technical_depth_analysis>

      <implementation_readiness_assessment>
        - Extract specific file paths and function names
        - Identify API endpoints and database operations
        - Validate error handling and testing requirements
        - Score: implementation-specific detail density
      </implementation_readiness_assessment>

      <documentation_quality_evaluation>
        - Analyze word count and content depth
        - Check for examples, diagrams, and visual aids
        - Validate table of contents and organization
        - Score: documentation completeness and utility
      </documentation_quality_evaluation>
    </validation_components>
</specification_validation>

<task_validation>
  IF target_type == "task_list":
    EXECUTE: QualityGateValidator.validateTaskList(tasksPath)

    <validation_components>
      <granularity_analysis>
        - Parse tasks from markdown checklist format
        - Analyze task length and specificity
        - Check for implementation details and acceptance criteria
        - Score: optimal task sizing and detail level
      </granularity_analysis>

      <dependency_validation>
        - Extract task dependencies from details
        - Build dependency graph and check for cycles
        - Validate dependency chain consistency
        - Score: dependency clarity and absence of circular references
      </dependency_validation>

      <testability_assessment>
        - Check for acceptance criteria in task details
        - Identify verifiable outcomes and specific deliverables
        - Validate measurable completion criteria
        - Score: task testability and verification potential
      </testability_assessment>

      <specificity_evaluation>
        - Extract file paths, function names, component names
        - Check for time estimates and effort indicators
        - Validate technical detail and implementation guidance
        - Score: task specificity and implementation clarity
      </specificity_evaluation>
    </validation_components>
</task_validation>

<full_stack_coupling_validation>
  IF target_type == "specification":
    EXECUTE: validateFullStackCoupling(specPath)

    <coupling_checks>
      <backend_frontend_pairing>
        - IF database-schema.md exists OR api-spec.md exists:
          REQUIRE: Frontend UI components specified in technical-spec.md
          VALIDATE:
            - Frontend Implementation section is present
            - UI Components subsection has content
            - At least one component specified
          ERROR_IF_MISSING: "Backend APIs/database specified but no frontend UI components found"

        - IF Frontend Implementation section exists:
          CHECK: Are there API endpoints to support the UI?
          VALIDATE:
            - API Specification section exists
            - OR Backend Implementation section exists
            - OR explicit note that frontend is static/no backend needed
          WARNING_IF_MISSING: "Frontend UI specified but no backend APIs found"
      </backend_frontend_pairing>

      <integration_specification>
        - IF both frontend and backend specified:
          REQUIRE: Frontend-Backend Integration section
          VALIDATE:
            - API Contract subsection exists
            - Integration Points subsection exists
            - Data flow described
            - Error handling strategy defined
          ERROR_IF_MISSING: "Full-stack feature missing integration specification"
      </integration_specification>

      <e2e_testing_requirement>
        - IF full-stack feature detected:
          REQUIRE: E2E testing strategy
          VALIDATE:
            - Testing Strategy mentions end-to-end tests
            - OR Full user workflows testing specified
          WARNING_IF_MISSING: "Full-stack feature should include E2E testing"
      </e2e_testing_requirement>
    </coupling_checks>

    <scoring>
      full_stack_coupling_score:
        - Backend without frontend: -0.20 (if user-facing)
        - Frontend without backend: -0.10 (if data persistence needed)
        - Missing integration section: -0.15
        - Missing E2E tests: -0.10
        - Complete full-stack spec: +0.10 bonus
    </scoring>
</full_stack_coupling_validation>

<implementation_validation>
  IF target_type == "implementation":
    EXECUTE: QualityGateValidator.validateImplementation(implementationPath)

    <validation_components>
      <code_quality_analysis>
        - Analyze code style consistency and conventions
        - Check for proper naming, commenting, and structure
        - Assess complexity and maintainability metrics
        - Score: code quality and maintainability
      </code_quality_analysis>

      <test_coverage_assessment>
        - Identify test files and testing frameworks
        - Analyze test coverage breadth and depth
        - Check for unit tests, integration tests, edge cases
        - Score: test coverage completeness and quality
      </test_coverage_assessment>

      <documentation_evaluation>
        - Check for README files and inline documentation
        - Analyze API documentation and usage examples
        - Validate documentation currency and accuracy
        - Score: documentation completeness and utility
      </documentation_evaluation>

      <performance_analysis>
        - Assess algorithmic complexity and efficiency
        - Check for performance optimization opportunities
        - Validate resource usage and scalability considerations
        - Score: performance optimization and efficiency
      </performance_analysis>
    </validation_components>
</implementation_validation>

<instructions>
  ACTION: Execute appropriate validation based on target type
  ANALYZE: Comprehensive quality metrics across all categories
  GENERATE: Detailed scoring and assessment data
  CALCULATE: Overall quality score using weighted factors
</instructions>

</step>

<step number="2.5" name="multi_agent_parallel_review">

### Step 2.5: Multi-Agent Parallel Review (Compound Engineering Integration)

Execute comprehensive multi-agent review in parallel using specialized review agents to identify issues, patterns, and improvement opportunities across multiple dimensions.

<agent_selection_by_target>
  <for_specification_targets>
    EXECUTE all specialized review agents for comprehensive spec analysis:
    - security-sentinel: Security vulnerability and compliance review
    - performance-oracle: Performance implications and bottleneck analysis
    - architecture-strategist: Architectural patterns and design quality
    - pattern-recognition-specialist: Code pattern and anti-pattern detection
    - code-simplicity-reviewer: Complexity and maintainability assessment
    - data-integrity-guardian: Data validation and integrity concerns
  </for_specification_targets>

  <for_implementation_targets>
    EXECUTE all specialized review agents for comprehensive code analysis:
    - security-sentinel: Security vulnerability scanning (OWASP Top 10)
    - performance-oracle: Performance bottlenecks and optimization opportunities
    - architecture-strategist: Architecture quality and design patterns
    - pattern-recognition-specialist: Code patterns and reusability analysis
    - code-simplicity-reviewer: Code complexity and simplification opportunities
    - data-integrity-guardian: Data validation and integrity implementation
  </for_implementation_targets>

  <for_task_targets>
    EXECUTE relevant review agents for task quality assessment:
    - architecture-strategist: Task structure and decomposition quality
    - pattern-recognition-specialist: Task pattern and dependency analysis
    - code-simplicity-reviewer: Task granularity and clarity assessment
  </for_task_targets>
</agent_selection_by_target>

<parallel_execution_protocol>
  <execution_strategy>
    LAUNCH agents in parallel using Task tool for maximum efficiency:

    FOR each selected agent:
      PROVIDE:
        - Target path (specification directory, code directory, or task file)
        - Target type (specification, implementation, or task_list)
        - Context window allocation (per agent limits from config.yml)
        - Finding format requirements (see below)

    EXECUTE: All agents simultaneously via parallel Task tool invocations

    COLLECT: Individual agent findings as they complete

    TIMEOUT: 15 minutes maximum for parallel execution
      IF any agent exceeds timeout:
        - Log warning about incomplete agent review
        - Continue with findings from successful agents
        - Report timeout in synthesis step
  </execution_strategy>

  <finding_format_standard>
    Each agent MUST return findings in standardized format:

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

    EXAMPLE FINDING:
    ```yaml
    agent: security-sentinel
    target: app/controllers/users_controller.rb
    findings:
      - id: sec-001
        category: Security
        severity: CRITICAL
        title: SQL Injection vulnerability in search query
        description: User input directly concatenated into SQL query without sanitization
        location: app/controllers/users_controller.rb:45
        impact: Attacker could execute arbitrary SQL queries, access sensitive data
        recommendation: Use ActiveRecord parameterized queries or sanitize inputs
        effort: Small
        references: OWASP Top 10 - A03:2021 Injection
    ```
  </finding_format_standard>

  <agent_context_optimization>
    Allocate context windows efficiently across agents:

    <context_allocation>
      - security-sentinel: 16KB (comprehensive security scanning)
      - performance-oracle: 12KB (performance analysis)
      - architecture-strategist: 16KB (design pattern analysis)
      - pattern-recognition-specialist: 12KB (pattern detection)
      - code-simplicity-reviewer: 8KB (complexity metrics)
      - data-integrity-guardian: 12KB (data validation analysis)

      TOTAL: 76KB across 6 agents (leaves context headroom for synthesis)
    </context_allocation>

    <context_filtering>
      FOR each agent:
        - FILTER: Only provide relevant files based on agent specialty
        - SEMANTIC: Use context-optimizer to prioritize critical code sections
        - EXCLUDE: Binary files, dependencies, generated code
        - FOCUS: Changed files for implementation reviews
    </context_filtering>
  </agent_context_optimization>
</parallel_execution_protocol>

<error_handling_parallel_review>
  <agent_failure_handling>
    IF agent fails to complete:
      - LOG: Agent name, error message, timestamp
      - CONTINUE: With remaining agents (degraded but functional)
      - REPORT: Failed agents in synthesis summary

    IF multiple agents fail (>50%):
      - WARN: Review may be incomplete
      - ASK: User whether to continue or retry
      - FALLBACK: Sequential execution if parallel execution consistently fails
  </agent_failure_handling>

  <finding_validation>
    FOR each agent's findings:
      VALIDATE:
        - Required fields present (id, category, severity, title, location, recommendation)
        - Severity level valid (CRITICAL|HIGH|MEDIUM|LOW|INFO)
        - Category valid and matches agent specialty
        - Location format correct (file:line or section_name)
        - Effort estimate provided (Small|Medium|Large)

      IF validation fails:
        - LOG: Invalid finding details
        - ATTEMPT: Auto-correct if possible (e.g., normalize severity levels)
        - SKIP: Finding if cannot be corrected
        - REPORT: Validation issues in synthesis
  </finding_validation>
</error_handling_parallel_review>

<instructions>
  ACTION: Launch all selected review agents in parallel
  EXECUTE: Agents simultaneously with optimized context windows
  COLLECT: Standardized findings from each agent
  VALIDATE: Finding format and required fields
  PREPARE: Findings for synthesis in Step 2.6
</instructions>

</step>

<step number="2.6" name="finding_synthesis_and_categorization">

### Step 2.6: Finding Synthesis and Categorization

Consolidate findings from all review agents, remove duplicates, assign priorities, estimate effort, and prepare actionable recommendations for user triage.

<synthesis_process>
  <step1_collection>
    ### 1. Collect and Organize All Findings

    GATHER findings from all completed agents:
      - security-sentinel findings
      - performance-oracle findings
      - architecture-strategist findings
      - pattern-recognition-specialist findings
      - code-simplicity-reviewer findings
      - data-integrity-guardian findings

    GROUP by file/component:
      - Organize findings by affected file or specification section
      - Identify components with multiple findings (hotspots)
      - Track finding count per file for priority scoring
  </step1_collection>

  <step2_categorization>
    ### 2. Categorize and Tag Findings

    ASSIGN primary category:
      - **Security**: Vulnerabilities, compliance issues, attack vectors
      - **Performance**: Bottlenecks, inefficiencies, scalability concerns
      - **Architecture**: Design patterns, structural issues, coupling
      - **Quality**: Code quality, maintainability, testability
      - **Data**: Data integrity, validation, consistency
      - **Patterns**: Anti-patterns, reusability opportunities
      - **Simplicity**: Complexity, over-engineering, clarity

    ADD secondary tags:
      - Language-specific (rails, typescript, python)
      - Framework-specific (activerecord, react, django)
      - Domain-specific (authentication, payment, api)
      - Impact area (frontend, backend, database, infrastructure)
  </step2_categorization>

  <step3_deduplication>
    ### 3. Deduplicate and Merge Similar Findings

    <deduplication_algorithm>
      EXECUTE deduplication in 3 passes for optimal results:

      **Pass 1: Exact Duplicate Detection**
      FOR each finding F1:
        FOR each other finding F2:
          IF exact_duplicate(F1, F2):
            MERGE F1 and F2

      DEFINE exact_duplicate(F1, F2):
        RETURN (F1.file == F2.file) AND (F1.line == F2.line)

      **Pass 2: Fuzzy Similarity Matching**
      FOR each remaining finding F1:
        FOR each other finding F2:
          IF fuzzy_match(F1, F2):
            MERGE F1 and F2

      DEFINE fuzzy_match(F1, F2):
        IF F1.file != F2.file:
          RETURN false

        similarity_score = calculate_similarity(F1.description, F2.description)

        RETURN (similarity_score > 0.80) OR keyword_overlap(F1, F2)

      DEFINE calculate_similarity(desc1, desc2):
        # Levenshtein distance-based similarity
        words1 = tokenize(lowercase(desc1))
        words2 = tokenize(lowercase(desc2))

        common_words = words1 ∩ words2
        total_words = words1 ∪ words2

        RETURN len(common_words) / len(total_words)

      DEFINE keyword_overlap(F1, F2):
        # Check for key security/performance terms
        security_keywords = ["sql", "injection", "xss", "csrf", "auth", "bypass",
                            "rce", "command", "deserialization", "ssrf"]
        performance_keywords = ["n+1", "query", "slow", "bottleneck", "memory",
                               "leak", "cache", "index"]

        F1_keywords = extract_keywords(F1.description, security_keywords + performance_keywords)
        F2_keywords = extract_keywords(F2.description, security_keywords + performance_keywords)

        IF len(F1_keywords ∩ F2_keywords) >= 2:
          # Same file + 2+ shared security/performance keywords = likely duplicate
          RETURN (F1.file == F2.file) AND (abs(F1.line - F2.line) < 50)

        RETURN false

      **Pass 3: Related Finding Clustering**
      FOR each remaining finding F1:
        FOR each other finding F2:
          IF related_findings(F1, F2):
            CREATE or ADD TO cluster

      DEFINE related_findings(F1, F2):
        # Same component (file or class)
        same_component = (F1.file == F2.file) OR
                        (extract_class(F1.file) == extract_class(F2.file))

        IF NOT same_component:
          RETURN false

        # Different categories but related root cause
        related_patterns = [
          ("security", "data-integrity"),    # Auth issues + validation
          ("performance", "architecture"),    # N+1 + coupling
          ("architecture", "quality"),        # Design + maintainability
          ("security", "quality"),            # Injection + input handling
        ]

        FOR (cat1, cat2) IN related_patterns:
          IF (F1.category == cat1 AND F2.category == cat2) OR
             (F1.category == cat2 AND F2.category == cat1):
            RETURN true

        # Same category, nearby lines
        IF F1.category == F2.category AND abs(F1.line - F2.line) < 20:
          RETURN true

        RETURN false
    </deduplication_algorithm>

    <merge_strategy>
      WHEN merging duplicate findings:

      **Merged Finding Structure**:
        ```yaml
        id: [PRIMARY_FINDING_ID]
        merged_from: [LIST_OF_MERGED_FINDING_IDS]
        file: [COMMON_FILE]
        line: [PRIMARY_LINE_NUMBER]
        category: [PRIMARY_CATEGORY]
        severity: [HIGHEST_SEVERITY_AMONG_DUPLICATES]

        title: "[MOST_SPECIFIC_TITLE] (identified by N agents)"

        description: |
          [PRIMARY_AGENT_DESCRIPTION]

          Additional perspectives:
          - [AGENT_2]: [AGENT_2_DESCRIPTION]
          - [AGENT_3]: [AGENT_3_DESCRIPTION]

        impact: |
          [COMBINED_IMPACT_FROM_ALL_AGENTS]

        recommendations: |
          [DEDUPLICATED_RECOMMENDATIONS_SORTED_BY_SPECIFICITY]

        source_agents: [agent-1, agent-2, agent-3]
        agent_count: 3
        confidence_boost: +20 points  # Multiple agents = higher confidence
        ```

      **Merge Rules**:
        1. **Severity**: Take HIGHEST severity among duplicates
        2. **Title**: Use most specific/technical title
        3. **Description**: Combine with "Additional perspectives" section
        4. **Impact**: Merge and deduplicate impact statements
        5. **Recommendations**: Combine and sort by specificity (concrete > general)
        6. **Effort**: Take MAXIMUM effort estimate (most pessimistic)
        7. **Line Number**: Use primary finding's line (first detected)
        8. **Confidence**: Boost severity score by +10 points per additional agent

      **Deduplication of Recommendations**:
        FOR each recommendation R1:
          FOR each other recommendation R2:
            IF very_similar(R1, R2):
              KEEP more specific recommendation
              DISCARD generic recommendation

        SORT remaining recommendations:
          1. Concrete code examples first
          2. Specific actionable steps next
          3. General guidance last
    </merge_strategy>

    <cluster_management>
      WHEN creating finding clusters:

      **Cluster Structure**:
        ```yaml
        cluster_id: [COMPONENT_NAME]-cluster-[NUMBER]
        cluster_type: [root-cause|symptom-group|related-issues]
        component: [FILE_OR_CLASS_NAME]
        finding_count: [NUMBER_OF_FINDINGS_IN_CLUSTER]

        root_cause: [IDENTIFIED_ROOT_CAUSE_IF_APPLICABLE]

        findings:
          - [FINDING_1_ID]: [P1] [TITLE]
          - [FINDING_2_ID]: [P2] [TITLE]
          - [FINDING_3_ID]: [P2] [TITLE]

        cluster_severity: [HIGHEST_SEVERITY_IN_CLUSTER]

        holistic_recommendation: |
          [COMPREHENSIVE_SOLUTION_ADDRESSING_ROOT_CAUSE]

          This cluster of [N] findings suggests [ROOT_CAUSE_DESCRIPTION].
          Recommended approach:
          1. [STEP_1_ADDRESSING_ROOT_CAUSE]
          2. [STEP_2_FIXING_SYMPTOMS]
          3. [STEP_3_PREVENTING_RECURRENCE]

        estimated_effort: [COMBINED_EFFORT]
        ```

      **Cluster Types**:
        - **root-cause**: Multiple symptoms from same root cause
          Example: 5 N+1 queries from tight coupling in service layer

        - **symptom-group**: Related issues in same component
          Example: Missing validation in 3 different endpoints of same controller

        - **related-issues**: Different categories, shared context
          Example: Performance + architecture issues in same data access layer

      **Cluster Identification Heuristics**:
        - 3+ findings in same file = likely cluster
        - 2+ security findings in same auth flow = cluster
        - 3+ performance findings with "query" or "database" = likely N+1 cluster
        - 4+ quality findings in same class = refactor opportunity cluster
    </cluster_management>

    <duplicate_tracking>
      REPORT deduplication metrics:

        **Deduplication Summary**:
        - Total findings (before deduplication): [count]
        - Pass 1 - Exact duplicates merged: [count]
        - Pass 2 - Fuzzy matches merged: [count]
        - Pass 3 - Related findings clustered: [count] findings in [cluster_count] clusters
        - Final unique findings: [count]
        - Overall deduplication rate: [percentage]%

        **Merge Statistics**:
        - Findings with 2+ agent agreement: [count] ([percentage]%)
        - Findings with 3+ agent agreement: [count] ([percentage]%)
        - Average agents per finding: [average]

        **Cluster Statistics**:
        - Total clusters created: [count]
        - Root-cause clusters: [count]
        - Symptom-group clusters: [count]
        - Related-issue clusters: [count]
        - Average findings per cluster: [average]
        - Largest cluster: [count] findings in [file/component]

        **Quality Indicators**:
        - High confidence findings (3+ agents): [count]
        - Potential false positives (1 agent, low score): [count]
        - Findings requiring manual review: [count]
    </duplicate_tracking>
  </step3_deduplication>

  <step4_severity_assignment>
    ### 4. Assign Final Severity and Priority

    <severity_calculation>
      FOR each finding:
        CALCULATE base severity score (0-100 scale):

        1. **Impact Assessment** (0-40 points):
           ASSIGN based on consequence category:
             - Data Loss/Corruption: 40 points
             - Security Breach (auth bypass, SQL injection): 40 points
             - System Unavailable/Crash: 35 points
             - Significant Performance Degradation (>2s delay): 30 points
             - User Experience Degradation (1-2s delay): 20 points
             - Maintainability Issues (technical debt): 15 points
             - Code Quality/Style Issues: 10 points
             - Documentation Gaps: 5 points

        2. **Affected User Base** (0-25 points):
           ASSIGN based on scope:
             - All users (100%): 25 points
             - Most users (>50%): 20 points
             - Some users (10-50%): 15 points
             - Few users (<10%): 10 points
             - Developers only: 5 points

        3. **Likelihood** (0-20 points):
           ASSESS probability of occurrence:
             - Certain (will happen on every use): 20 points
             - Very Likely (>75% probability): 15 points
             - Probable (25-75% probability): 10 points
             - Possible (<25% probability): 5 points
             - Rare (edge case scenario): 2 points

        4. **Exploitability** (0-15 points, security findings only):
           EVALUATE attack complexity:
             - No authentication required, trivial exploit: 15 points
             - Low complexity (OWASP Top 10): 12 points
             - Medium complexity (requires some effort): 8 points
             - High complexity (specialized knowledge): 4 points
             - Very high complexity (rare): 2 points
             - N/A (not security issue): 0 points

        TOTAL_SCORE = Impact + User_Base + Likelihood + Exploitability

        CONVERT score to severity level:
          - **P1 (CRITICAL)**: 🔴 Score ≥ 70
            Examples:
            - SQL injection (40 + 25 + 20 + 15 = 100)
            - Auth bypass (40 + 25 + 15 + 12 = 92)
            - Data corruption affecting all users (40 + 25 + 15 + 0 = 80)
            - System crash on common operation (35 + 25 + 20 + 0 = 80)
            - GDPR violation exposing PII (40 + 25 + 10 + 0 = 75)

          - **P2 (IMPORTANT)**: 🟡 Score 40-69
            Examples:
            - Performance bottleneck (30 + 20 + 15 + 0 = 65)
            - CSRF vulnerability (40 + 15 + 5 + 8 = 68)
            - Architecture coupling issue (15 + 5 + 15 + 0 = 35 → boost to 45 if high churn)
            - Missing test coverage on critical path (15 + 20 + 10 + 0 = 45)
            - Information disclosure (40 + 10 + 5 + 8 = 63)

          - **P3 (NICE-TO-HAVE)**: 🔵 Score < 40
            Examples:
            - Code complexity (10 + 5 + 5 + 0 = 20)
            - Pattern improvement (10 + 5 + 2 + 0 = 17)
            - Minor performance optimization (20 + 10 + 2 + 0 = 32)
            - Documentation enhancement (5 + 5 + 15 + 0 = 25)
    </severity_calculation>

    <severity_adjustments>
      APPLY severity adjustments based on context:

      **Automatic P1 Classification** (regardless of score):
        - SQL injection (any variant)
        - Authentication bypass
        - Authorization bypass (privilege escalation)
        - Remote code execution
        - Command injection
        - LDAP/NoSQL injection
        - Deserialization vulnerabilities
        - SSRF with potential for internal network access
        - Hard-coded credentials or secrets
        - PII/PHI exposure without encryption
        - GDPR/HIPAA/PCI-DSS violations
        - Data loss or corruption scenarios

      **Automatic P2 Classification** (regardless of score):
        - XSS (stored or reflected)
        - CSRF on state-changing operations
        - Missing rate limiting on authentication endpoints
        - Insufficient logging of security events
        - Path traversal vulnerabilities
        - Open redirects
        - Missing HTTPS on sensitive endpoints
        - Weak cryptographic algorithms
        - Missing input validation on user data

      **Score Boosting** (+10 points each):
        - Finding affects authentication/authorization flows
        - Finding affects payment or financial transactions
        - Finding affects PII/PHI handling
        - Multiple agents (2+) flagged the same issue independently
        - Finding is in high-churn code (>10 commits in last 3 months)
        - Finding affects public API or user-facing feature
        - Finding could lead to cascading failures

      **Score Reduction** (-10 points each):
        - Finding only affects internal tools or admin interface
        - Finding requires multiple unlikely conditions to trigger
        - Finding is in deprecated code scheduled for removal
        - Workaround exists and is documented
    </severity_adjustments>

    <severity_examples_by_category>
      **Security Findings**:
        - P1: SQL injection, auth bypass, RCE, hard-coded secrets
        - P2: XSS, CSRF, path traversal, weak crypto
        - P3: Missing security headers, outdated dependencies (no CVE)

      **Performance Findings**:
        - P1: N+1 queries causing >5s page load, memory leak crashing system
        - P2: Unoptimized queries causing 1-2s delays, missing indexes
        - P3: Inefficient algorithms with minimal user impact

      **Architecture Findings**:
        - P1: Circular dependencies causing build failures, data model inconsistencies
        - P2: Tight coupling hindering feature development, missing abstractions
        - P3: Code organization improvements, naming conventions

      **Data Integrity Findings**:
        - P1: Missing validation allowing corrupt data, no foreign key constraints
        - P2: Inconsistent validation across endpoints, missing uniqueness constraints
        - P3: Optional validation enhancements, better error messages
    </severity_examples_by_category>
  </step4_severity_assignment>

  <step5_effort_estimation>
    ### 5. Estimate Effort and Complexity

    <effort_algorithm>
      FOR each finding:
        CALCULATE effort score using weighted factors:

        1. **Scope Factor** (0-40 points):
           COUNT affected files/components:
             - Single file, single function: 5 points
             - Single file, multiple functions: 10 points
             - 2-3 related files: 20 points
             - 4-10 files: 30 points
             - 10+ files or system-wide: 40 points

        2. **Risk Factor** (0-25 points):
           ASSESS change risk:
             - Documentation only: 0 points
             - Configuration change: 5 points
             - New code (additive): 8 points
             - Refactoring (low-risk area): 12 points
             - Security patch (critical path): 20 points
             - Data migration or schema change: 25 points

        3. **Testing Factor** (0-20 points):
           ESTIMATE testing complexity:
             - No tests needed (docs/config): 0 points
             - Simple unit tests: 5 points
             - Unit + integration tests: 10 points
             - E2E tests required: 15 points
             - Security/performance testing: 20 points

        4. **Dependency Factor** (0-10 points):
           COUNT dependencies/integration points:
             - No dependencies: 0 points
             - 1-2 internal dependencies: 3 points
             - 3-5 internal dependencies: 6 points
             - External API changes: 8 points
             - Breaking changes to public API: 10 points

        5. **Expertise Factor** (0-5 points):
           ASSESS required knowledge:
             - Common pattern, well-documented: 0 points
             - Framework-specific knowledge: 2 points
             - Security expertise required: 4 points
             - Specialized domain knowledge: 5 points

        TOTAL_EFFORT_SCORE = Scope + Risk + Testing + Dependency + Expertise

        CONVERT to effort level:
          - **Small** (1-2 hours): Score 0-25
          - **Medium** (3-8 hours): Score 26-60
          - **Large** (1-3 days): Score 61-100
    </effort_algorithm>

    <effort_examples>
      **Small Effort Examples** (1-2 hours):
        - Add input validation (single file): 5 + 5 + 5 + 0 + 0 = 15
        - Fix typo in error message: 5 + 0 + 0 + 0 + 0 = 5
        - Update configuration file: 5 + 5 + 0 + 0 + 0 = 10
        - Add missing index to database: 5 + 8 + 5 + 3 + 0 = 21
        - Document API endpoint: 5 + 0 + 0 + 0 + 0 = 5

      **Medium Effort Examples** (3-8 hours):
        - Fix N+1 query (2 files): 20 + 12 + 10 + 3 + 0 = 45
        - Add CSRF protection: 10 + 20 + 10 + 6 + 2 = 48
        - Refactor authentication flow (3 files): 20 + 20 + 15 + 6 + 4 = 65 → capped to 60
        - Add missing test coverage: 10 + 8 + 15 + 0 + 0 = 33
        - Fix XSS vulnerability (2 endpoints): 10 + 20 + 15 + 3 + 2 = 50

      **Large Effort Examples** (1-3 days):
        - Redesign authorization system: 40 + 25 + 20 + 10 + 4 = 99
        - Fix SQL injection across codebase: 40 + 25 + 20 + 8 + 4 = 97
        - Migrate to new ORM: 40 + 25 + 15 + 10 + 5 = 95
        - Implement rate limiting system-wide: 30 + 20 + 20 + 10 + 2 = 82
        - Refactor tightly coupled services: 30 + 12 + 15 + 10 + 0 = 67
    </effort_examples>

    <effort_adjustments>
      APPLY adjustments based on context:

      **Increase Effort** (+1 level: Small→Medium, Medium→Large):
        - Finding is in legacy code with poor documentation
        - No existing tests for affected code
        - Change requires coordination with multiple teams
        - Production hotfix (requires immediate deployment)
        - Regulatory/compliance requirement (needs legal review)

      **Decrease Effort** (-1 level, minimum Small):
        - Automated refactoring tools available
        - Similar fix recently implemented (can copy pattern)
        - Comprehensive test suite exists
        - Well-documented codebase with examples
        - Non-critical, can implement incrementally

      **Effort Multipliers for Clusters**:
        IF finding is part of cluster:
          cluster_effort = SUM(individual_efforts)

          # Apply efficiency gains for batch fixes
          IF cluster_type == "root-cause":
            # Fixing root cause is often less than sum of symptoms
            cluster_effort = cluster_effort × 0.6

          IF cluster_type == "symptom-group":
            # Similar fixes have learning curve benefit
            cluster_effort = cluster_effort × 0.8

          IF cluster_type == "related-issues":
            # Related issues can be fixed together
            cluster_effort = cluster_effort × 0.9
    </effort_adjustments>

    <roi_calculation>
      CALCULATE return on investment for prioritization:

        ROI_Score = (Impact_Score × Severity_Multiplier) / Effort_Score

        WHERE:
          **Impact_Score** (1-10 scale):
            - Critical user-facing functionality: 10
            - Important user workflow: 8
            - Secondary features: 6
            - Internal tools/admin: 4
            - Developer experience: 3
            - Documentation/minor polish: 1

          **Severity_Multiplier**:
            - P1 (Critical): 3.0
            - P2 (Important): 2.0
            - P3 (Nice-to-have): 1.0

          **Effort_Score**:
            - Small (1-2 hrs): 1
            - Medium (3-8 hrs): 3
            - Large (1-3 days): 8

        **ROI Examples**:
          - P1, Impact 10, Small effort: (10 × 3.0) / 1 = 30.0 (🔥 QUICK WIN!)
          - P1, Impact 8, Medium effort: (8 × 3.0) / 3 = 8.0 (High priority)
          - P2, Impact 6, Small effort: (6 × 2.0) / 1 = 12.0 (Quick win)
          - P2, Impact 8, Large effort: (8 × 2.0) / 8 = 2.0 (Lower priority)
          - P3, Impact 4, Medium effort: (4 × 1.0) / 3 = 1.3 (Deprioritize)

        **Prioritization Strategy**:
          1. **Quick Wins**: ROI > 10 (High impact, low effort)
          2. **Major Projects**: ROI 5-10, P1 severity
          3. **Incremental Improvements**: ROI 3-5, P2 severity
          4. **Backlog**: ROI < 3 or P3 severity

        SORT findings by:
          1. Severity (P1 → P2 → P3)
          2. ROI score (highest → lowest)
          3. Effort (Small → Medium → Large, within same ROI band)
    </roi_calculation>

    <quick_wins_identification>
      IDENTIFY quick wins for immediate action:

      **Quick Win Criteria**:
        - ROI score ≥ 10
        - OR (P1 severity AND Small effort)
        - OR (P2 severity AND Small effort AND Impact ≥ 6)

      **Quick Win Categories**:
        - **Security Quick Wins**: P1 security, single file fix
          Example: Add missing input validation (1-2 hours, prevents SQL injection)

        - **Performance Quick Wins**: Significant perf gain, small change
          Example: Add database index (30 min, fixes slow query)

        - **Data Integrity Quick Wins**: Critical validation, easy add
          Example: Add NOT NULL constraint (1 hour, prevents data corruption)

        - **Quality Quick Wins**: High-impact refactor, localized
          Example: Extract complex method (2 hours, improves maintainability)

      FLAG quick wins in output:
        ```markdown
        🔥 **QUICK WIN** - High ROI (ROI: [score])
        - **Effort**: [Small]
        - **Impact**: [High]
        - **Recommendation**: Prioritize for immediate implementation
        ```
    </quick_wins_identification>
  </step5_effort_estimation>

  <step6_recommendation_generation>
    ### 6. Generate Actionable Recommendations

    FOR each finding:
      PROVIDE structured recommendation:

        ```markdown
        ## [Finding ID]: [Title]

        **Severity**: [P1/P2/P3] | **Category**: [Category] | **Effort**: [Small/Medium/Large]

        **Location**: [file:line]

        **Problem**:
        [Clear description of what's wrong or could be improved]

        **Impact**:
        [What could happen if not addressed]

        **Recommendation**:
        [Specific, actionable steps to fix]

        **Example Solution** (if applicable):
        ```[language]
        [Code example showing the fix]
        ```

        **References**:
        - [Related documentation]
        - [Best practice guides]
        - [Security advisories if applicable]

        **Agents**: [List of agents that identified this finding]
        ```

      PRIORITIZE recommendations:
        - Sort by severity (P1 → P2 → P3)
        - Within severity, sort by ROI score
        - Group related findings together
        - Highlight quick wins (high impact, low effort)
  </step6_recommendation_generation>
</synthesis_process>

<synthesis_output_format>
  <summary_statistics>
    📊 **Finding Synthesis Summary**

    **Total Findings**: [count]
    - 🔴 **Critical (P1)**: [count] - Must address before proceeding
    - 🟡 **Important (P2)**: [count] - Should address for quality
    - 🔵 **Nice-to-Have (P3)**: [count] - Consider for improvement

    **Category Breakdown**:
    - Security: [count]
    - Performance: [count]
    - Architecture: [count]
    - Quality: [count]
    - Data: [count]
    - Patterns: [count]
    - Simplicity: [count]

    **Effort Estimation**:
    - Small (1-2 hrs): [count] findings
    - Medium (3-8 hrs): [count] findings
    - Large (1-3 days): [count] findings
    - Total estimated effort: [hours/days]

    **Deduplication Metrics**:
    - Original findings: [count]
    - Duplicates removed: [count]
    - Final unique findings: [count]
    - Deduplication rate: [percentage]%

    **Agent Participation**:
    - security-sentinel: [count] findings
    - performance-oracle: [count] findings
    - architecture-strategist: [count] findings
    - pattern-recognition-specialist: [count] findings
    - code-simplicity-reviewer: [count] findings
    - data-integrity-guardian: [count] findings
  </summary_statistics>

  <prioritized_findings_list>
    🔴 **Critical Findings (P1)** - [count]

    FOR each P1 finding:
      [Display formatted finding with all details]

    🟡 **Important Findings (P2)** - [count]

    FOR each P2 finding:
      [Display formatted finding with all details]

    🔵 **Nice-to-Have Findings (P3)** - [count]

    FOR each P3 finding:
      [Display formatted finding with all details]
  </prioritized_findings_list>

  <quick_wins_identification>
    ⚡ **Quick Wins** (High Impact, Low Effort)

    IDENTIFY findings where:
      - Severity = P1 or P2
      - Effort = Small
      - ROI score > 5.0

    FOR each quick win:
      - [Finding ID]: [Title] (Effort: [Small], ROI: [score])
  </quick_wins_identification>

  <hotspot_analysis>
    🔥 **Code Hotspots** (Files with Multiple Issues)

    IDENTIFY files with 3+ findings:

    FOR each hotspot file:
      **[file_path]**: [count] findings ([P1_count] critical, [P2_count] important)
      - [List findings for this file]
      - **Recommendation**: Consider comprehensive refactoring of this component
  </hotspot_analysis>
</synthesis_output_format>

<triage_integration_preparation>
  <triage_handoff>
    PREPARE findings for triage command:

    IF user wants to proceed with triage:
      TRIGGER: triage command with synthesized findings

      PROVIDE to triage:
        - All findings in standardized format
        - Priority ordering (P1 → P2 → P3 → ROI within severity)
        - Effort estimates for planning
        - Category tags for filtering
        - Quick wins highlighted
        - Hotspot files identified

    ELSE:
      INCLUDE findings in quality report (Step 3)
      OFFER: "Run /triage to interactively process these findings"
  </triage_handoff>

  <state_persistence>
    SAVE synthesized findings to:
      [validation_target]/.quality-validation/findings-[timestamp].yml

    FORMAT:
      ```yaml
      validation_timestamp: [ISO_timestamp]
      target_path: [validated_path]
      target_type: [specification|implementation|task_list]
      agents_executed:
        - security-sentinel
        - performance-oracle
        - architecture-strategist
        - pattern-recognition-specialist
        - code-simplicity-reviewer
        - data-integrity-guardian
      summary:
        total_findings: [count]
        p1_findings: [count]
        p2_findings: [count]
        p3_findings: [count]
        total_effort_hours: [estimate]
      findings:
        - [... all findings in structured format ...]
      ```

    USE state file for:
      - Triage command input
      - Progress tracking
      - Before/after comparison
      - Quality trend analysis
  </state_persistence>
</triage_integration_preparation>

<instructions>
  ACTION: Synthesize all agent findings into actionable recommendations
  DEDUPLICATE: Remove duplicate and merge related findings
  PRIORITIZE: Assign severity and calculate ROI for optimal ordering
  ESTIMATE: Provide realistic effort estimates for planning
  PREPARE: Format findings for quality report and optional triage workflow
  PERSIST: Save findings state for tracking and follow-up
</instructions>

</step>

<step number="3" name="quality_report_generation">

### Step 3: Generate Comprehensive Quality Report

Create detailed quality report with scores, issues identification, and actionable recommendations.

<report_structure_generation>
  <header_section>
    📊 **Quality Validation Report**
    - **Target Type**: [specification|task_list|implementation]
    - **Target Path**: [validated_path]
    - **Validation Timestamp**: [ISO_timestamp]
    - **Validator Version**: [version]
    - **Configuration**: [threshold_summary]
  </header_section>

  <overall_score_section>
    🎯 **Overall Quality Score: [SCORE]/1.0 ([STATUS])**

    <status_mapping>
      - 0.90+ → 🟢 **Excellent** - Ready for implementation/deployment
      - 0.80-0.89 → 🟡 **Good** - Minor improvements recommended
      - 0.70-0.79 → 🟠 **Acceptable** - Some enhancements needed
      - 0.60-0.69 → 🔴 **Needs Improvement** - Significant issues to address
      - <0.60 → ⚫ **Inadequate** - Major rework required
    </status_mapping>
  </overall_score_section>

  <detailed_breakdown_section>
    📈 **Quality Category Breakdown**

    FOR each validation category:
      - **[Category Name]**: [Score]/1.0 ([Pass/Fail/Warning])
        - Threshold: [configured_threshold]
        - Details: [category_specific_metrics]
        - Issues: [identified_problems]
  </detailed_breakdown_section>

  <issues_identification_section>
    ⚠️ **Issues Identified ([TOTAL_COUNT])**

    <priority_categorization>
      🔴 **High Priority ([COUNT])** - Must address before proceeding
      🟡 **Medium Priority ([COUNT])** - Should address for quality improvement
      🔵 **Low Priority ([COUNT])** - Consider for future enhancement
    </priority_categorization>

    FOR each issue:
      - **[Issue_Type]**: [Description]
        - **Location**: [File/Section]
        - **Impact**: [Quality_impact_explanation]
        - **Recommendation**: [Specific_action_to_take]
  </issues_identification_section>

  <recommendations_section>
    💡 **Actionable Recommendations ([COUNT])**

    <immediate_actions>
      🎯 **Immediate Actions Required**
      FOR each critical issue:
        1. **[Issue]**: [Specific action needed]
           - **Location**: [Where to make changes]
           - **Expected Outcome**: [Success criteria]
           - **Estimated Effort**: [Time/complexity]
    </immediate_actions>

    <improvement_opportunities>
      🔧 **Improvement Opportunities**
      FOR each enhancement:
        1. **[Enhancement]**: [Improvement suggestion]
           - **Benefit**: [Why this matters]
           - **Implementation**: [How to implement]
           - **Priority**: [High/Medium/Low]
    </improvement_opportunities>

    <best_practices>
      📚 **Best Practice Recommendations**
      FOR each best practice gap:
        1. **[Practice]**: [Recommended practice]
           - **Reference**: [Standard/Documentation]
           - **Implementation Guide**: [How to apply]
    </best_practices>
  </recommendations_section>

  <quality_gates_section>
    ✅ **Quality Gate Status**

    <gate_results>
      - **Passed Gates**: [list_of_passed_gates]
      - **Failed Gates**: [list_of_failed_gates]
      - **Warning Gates**: [list_of_warning_gates]
    </gate_results>

    <threshold_analysis>
      FOR each configured threshold:
        - **[Threshold_Name]**: [Actual_Score] vs [Required_Score] ([Pass/Fail])
    </threshold_analysis>
  </quality_gates_section>
</report_structure_generation>

<instructions>
  ACTION: Generate comprehensive quality report
  FORMAT: Structured markdown with clear sections and actionable content
  INCLUDE: Specific file paths, line numbers, and concrete recommendations
  PRIORITIZE: Issues by impact and effort required for resolution
</instructions>

</step>

<step number="4" name="actionable_guidance_provision">

### Step 4: Provide Actionable Guidance and Follow-up Options

Present specific, implementable recommendations with clear next steps and follow-up validation options.

<actionable_guidance_formatting>
  <step_by_step_improvements>
    🚀 **Quality Improvement Roadmap**

    **Phase 1: Critical Issues (Required)**
    FOR each high-priority issue:
      □ **Step [N]**: [Specific action]
        - **File**: [exact_file_path]
        - **Change**: [what_to_modify]
        - **Validation**: [how_to_verify_fix]
        - **Time Estimate**: [estimated_effort]

    **Phase 2: Quality Enhancements (Recommended)**
    FOR each medium-priority improvement:
      □ **Step [N]**: [Enhancement action]
        - **Benefit**: [quality_improvement_expected]
        - **Implementation**: [step_by_step_guide]
        - **Success Metrics**: [how_to_measure_success]

    **Phase 3: Best Practice Adoption (Optional)**
    FOR each best practice recommendation:
      □ **Step [N]**: [Best practice implementation]
        - **Standard**: [reference_documentation]
        - **Application**: [project_specific_guidance]
        - **Long-term Benefit**: [maintenance_and_scalability_gains]
  </step_by_step_improvements>

  <implementation_templates>
    📝 **Implementation Templates**

    FOR complex recommendations:
      PROVIDE: Code templates, configuration examples, documentation templates
      INCLUDE: Before/after examples showing the improvement
      SPECIFY: Exact changes needed with file paths and line numbers
  </implementation_templates>
</actionable_guidance_formatting>

<follow_up_options>
  <re_validation_offering>
    🔄 **Re-validation Options**

    - **Immediate Re-run**: Validate again after implementing critical fixes
    - **Progress Tracking**: Compare before/after quality scores
    - **Incremental Validation**: Validate specific categories after targeted improvements
    - **Full Re-assessment**: Complete quality re-evaluation after all changes
  </re_validation_offering>

  <continuous_monitoring_setup>
    📊 **Continuous Quality Monitoring**

    - **Automated Quality Checks**: Set up pre-commit hooks for quality validation
    - **CI/CD Integration**: Add quality gates to deployment pipelines
    - **Periodic Assessment**: Schedule regular quality reviews
    - **Quality Metrics Dashboard**: Track quality trends over time
  </continuous_monitoring_setup>

  <integration_guidance>
    🔗 **Integration with Agent OS Workflows**

    - **create-spec.md Integration**: Automatic quality validation before user review
    - **create-tasks.md Integration**: Task quality validation during generation
    - **execute-tasks.md Integration**: Implementation quality validation during execution
    - **Custom Workflow Integration**: Add quality gates to custom workflows
  </integration_guidance>
</follow_up_options>

<user_interaction>
  <improvement_confirmation>
    PROMPT: "Would you like me to help implement any of these improvements?"
    OPTIONS:
      - "Yes, help with critical issues first"
      - "Yes, provide implementation guidance for [specific issue]"
      - "No, I'll implement these myself"
      - "Re-run validation after I make changes"
  </improvement_confirmation>

  <customization_options>
    OFFER: "Would you like to customize quality thresholds for this project?"
    PROVIDE: Template for .agent-os/quality-config.yml
    EXPLAIN: How different thresholds affect validation results
  </customization_options>
</user_interaction>

<instructions>
  ACTION: Provide clear, actionable guidance for quality improvements
  OFFER: Follow-up validation and monitoring options
  ENGAGE: User interaction for immediate improvement assistance
  INTEGRATE: Quality validation with existing Agent OS workflows
</instructions>

</step>

</process_flow>

<error_handling>

## Error Handling and Edge Cases

<validation_errors>
  <file_access_errors>
    - Missing files or directories
    - Permission issues
    - Corrupted or unreadable files
    - ACTION: Provide clear error messages with resolution guidance
  </file_access_errors>

  <parsing_errors>
    - Malformed markdown in task lists
    - Invalid configuration files
    - Unexpected file formats
    - ACTION: Graceful degradation with partial validation results
  </parsing_errors>

  <configuration_errors>
    - Invalid quality thresholds
    - Missing configuration files
    - Conflicting settings
    - ACTION: Fall back to defaults with warning messages
  </configuration_errors>
</validation_errors>

<edge_cases>
  <empty_targets>
    - Empty specification directories
    - Empty task files
    - Empty implementation directories
    - ACTION: Provide guidance on minimum content requirements
  </empty_targets>

  <partial_implementations>
    - Incomplete specifications
    - Work-in-progress implementations
    - Draft task lists
    - ACTION: Adjust expectations and provide appropriate guidance
  </partial_implementations>
</edge_cases>

</error_handling>

<post_flight_check>
  EXECUTE: @.agent-os/instructions/meta/post-flight.md
</post_flight_check>