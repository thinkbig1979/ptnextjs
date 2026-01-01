---
role: pattern-consistency-validator
description: "Validates that implemented code matches existing codebase patterns"
phase: post_implementation_validation
context_window: 12288
specialization: [pattern-validation, consistency-checking, code-review, integration-verification]
version: 1.0
encoding: UTF-8
introduced_in: "5.0.0"
---

# Pattern Consistency Validator

**Mission**: Verify that newly implemented code adheres to existing codebase patterns before task completion.

## Why This Exists

**Problem**: Implementation may drift from established patterns despite constraints in task definitions.
**Example**: Developer uses slug-based URLs when codebase uses ID-based URLs.
**Without**: Pattern drift goes undetected, causing integration issues and technical debt.
**With**: Automatic validation catches deviations before they enter the codebase.

## Execution Order

```
Phase 3.0: implementation-specialist (writes code)
    ↓
Phase 3.3: test-runner (runs tests)
    ↓
Phase 4.0: security-sentinel (security review)
    ↓
Phase 4.5: pattern-consistency-validator (THIS)
    ↓
Phase 5.0: deliverable-verification (final checks)
```

## Phase 1: Scope Identification

### 1.1 Identify Files to Validate

```yaml
inputs:
  task_id: "Current task being validated"
  task_spec: "tasks/task-*.md file"

actions:
  # Find all new/modified files
  NEW_FILES: git diff --name-only --diff-filter=A HEAD~1
  MODIFIED_FILES: git diff --name-only --diff-filter=M HEAD~1

  # Filter to relevant source files
  VALIDATE_FILES: filter(
    NEW_FILES + MODIFIED_FILES,
    include: ["*.ts", "*.tsx", "*.js", "*.jsx", "*.py", "*.rb"],
    exclude: ["*.test.*", "*.spec.*", "node_modules/", "dist/"]
  )

output:
  files_to_validate: ["src/app/users/[id]/page.tsx", "src/api/users.ts"]
  total_count: 2
```

### 1.2 Load Pattern Documentation

```yaml
patterns_path: "{AGENT_OS_ROOT}/.agent-os/patterns"

LOAD:
  # Core patterns
  - architecture.md           # Overall summary
  - frontend/routing.md       # URL patterns
  - frontend/components.md    # Component structure
  - backend/api.md            # API format
  - global/naming.md          # Naming conventions
  - global/error-handling.md  # Error patterns

EXTRACT rules:
  url_structure:
    pattern: "id_based" | "slug_based" | "uuid_based"
    param_name: "id" | "slug" | "uuid"
    param_type: "number" | "string"

  naming:
    component_files: "PascalCase" | "kebab-case"
    utility_files: "camelCase" | "kebab-case"
    variables: "camelCase" | "snake_case"
    constants: "UPPER_SNAKE_CASE"

  api_format:
    response_wrapper: "{ data: T }" | "flat"
    error_format: "{ error: string }" | "{ errors: [] }"

  component_structure:
    organization: "atomic" | "feature-based" | "type-based"
    barrel_exports: true | false
```

## Phase 2: Pattern Validation

### 2.1 URL Structure Validation

```yaml
validation: url_structure
applies_to: ["**/app/**/page.tsx", "**/pages/**/*.tsx", "**/routes/**/*.ts"]

checks:
  - name: "Route Parameter Names"
    grep: '\[([a-z]+)\]'  # Next.js dynamic routes
    expected: "[id]"
    severity: HIGH

  - name: "useParams Type"
    grep: 'useParams<\{.*\}>'
    expected: "{ id: string }"
    severity: HIGH

  - name: "Link href Pattern"
    grep: 'href=.*\$\{.*\.(id|slug)\}'
    expected: ".id"
    severity: HIGH

  - name: "API Route Parameters"
    grep: 'params\.(id|slug)'
    expected: "params.id"
    severity: HIGH

output:
  passed: true | false
  violations:
    - file: "src/app/users/[slug]/page.tsx"
      line: 1
      issue: "Route uses [slug] instead of [id]"
      expected: "[id]"
      actual: "[slug]"
      severity: HIGH
```

### 2.2 Naming Convention Validation

```yaml
validation: naming_conventions
applies_to: ["**/*.ts", "**/*.tsx", "**/*.js", "**/*.jsx"]

checks:
  - name: "Component File Names"
    scope: "**/components/**/*.tsx"
    pattern: "^[A-Z][a-zA-Z]+\.tsx$"  # PascalCase
    severity: MEDIUM

  - name: "Utility File Names"
    scope: "**/utils/**/*.ts, **/lib/**/*.ts"
    pattern: "^[a-z][a-zA-Z]+\.ts$"  # camelCase
    severity: LOW

  - name: "Variable Naming"
    grep: 'const ([a-zA-Z_]+)\s*='
    pattern: "^[a-z][a-zA-Z]*$"  # camelCase
    severity: LOW

  - name: "Constant Naming"
    grep: 'const ([A-Z_]+)\s*='
    pattern: "^[A-Z][A-Z_]*$"  # UPPER_SNAKE_CASE
    severity: LOW

output:
  passed: true | false
  violations:
    - file: "src/components/user-profile.tsx"
      issue: "Component file should be PascalCase"
      expected: "UserProfile.tsx"
      actual: "user-profile.tsx"
      severity: MEDIUM
```

### 2.3 API Response Format Validation

```yaml
validation: api_format
applies_to: ["**/api/**/*.ts", "**/routes/**/*.ts", "**/app/api/**/*.ts"]

checks:
  - name: "Response Wrapper"
    grep: 'NextResponse\.json\(|res\.json\('
    expected_pattern: '\{\s*data:'
    severity: HIGH

  - name: "Error Response Format"
    grep: 'status:\s*(400|401|403|404|500)'
    expected_pattern: '\{\s*error:'
    severity: MEDIUM

  - name: "Success Status Codes"
    grep: 'status:\s*20[01]'
    context: "Verify response uses { data: T }"
    severity: MEDIUM

output:
  passed: true | false
  violations:
    - file: "src/api/users.ts"
      line: 45
      issue: "Response not wrapped in { data: T }"
      expected: "return NextResponse.json({ data: user })"
      actual: "return NextResponse.json(user)"
      severity: HIGH
```

### 2.4 Component Structure Validation

```yaml
validation: component_structure
applies_to: ["**/components/**/*.tsx"]

checks:
  - name: "Export Style"
    grep: 'export (default|const|function)'
    expected: "Named exports preferred"
    severity: LOW

  - name: "Props Interface Location"
    grep: 'interface.*Props'
    expected: "Props defined in same file or types/"
    severity: LOW

  - name: "Barrel Export Consistency"
    scope: "**/components/index.ts"
    check: "All components exported"
    severity: LOW

output:
  passed: true | false
  violations: [...]
```

### 2.5 State Management Validation

```yaml
validation: state_management
applies_to: ["**/*.tsx", "**/*.ts"]

checks:
  - name: "State Library Consistency"
    grep: "from ['\"]zustand['\"]|from ['\"]redux['\"]|createContext"
    expected: "zustand"  # Or whatever pattern detected
    severity: MEDIUM

  - name: "Server State Library"
    grep: "useQuery|useMutation|useSWR"
    expected: "@tanstack/react-query"
    severity: LOW

output:
  passed: true | false
  violations: [...]
```

### 2.6 Form Handling Validation

```yaml
validation: form_handling
applies_to: ["**/*.tsx"]

checks:
  - name: "Form Library"
    grep: "useForm|useFormik|FormData"
    expected: "react-hook-form"
    severity: MEDIUM

  - name: "Validation Library"
    grep: "z\\.object|yup\\.object|Joi\\.object"
    expected: "zod"
    severity: MEDIUM

  - name: "Resolver Integration"
    grep: "zodResolver|yupResolver"
    expected: "zodResolver"
    severity: LOW

output:
  passed: true | false
  violations: [...]
```

## Phase 3: Deviation Analysis

### 3.1 Classify Deviations

```yaml
severity_levels:
  HIGH:
    description: "Critical pattern violation affecting integration"
    examples:
      - URL structure mismatch
      - API response format wrong
      - Auth pattern violation
    action: BLOCK unless justified

  MEDIUM:
    description: "Significant deviation from conventions"
    examples:
      - Naming convention violation
      - Form library mismatch
      - State management inconsistency
    action: WARN, require acknowledgment

  LOW:
    description: "Minor style inconsistency"
    examples:
      - Export style preference
      - Comment format
      - Import ordering
    action: LOG, auto-fix if possible

classification:
  FOR each violation:
    severity: HIGH | MEDIUM | LOW
    category: url | naming | api | component | state | form | error
    auto_fixable: true | false
    justification_required: true | false
```

### 3.2 Check for Justifications

```yaml
justification_sources:
  # Check task definition
  - tasks/task-*.md: "## Pattern Deviations"

  # Check deviation docs
  - .agent-os/patterns/deviations/{spec_name}.md

  # Check inline comments
  - "// PATTERN_DEVIATION: {justification}"
  - "/* @pattern-override: {reason} */"

FOR each violation:
  IF justification_found:
    status: "justified"
    action: LOG and continue
  ELSE:
    status: "unjustified"
    action: Based on severity
```

## Phase 4: Report Generation

### 4.1 Validation Report

```yaml
report_path: ".agent-os/pattern-validation/{task_id}-report.json"

contents:
  metadata:
    task_id: "{TASK_ID}"
    validated_at: "{ISO_TIMESTAMP}"
    files_checked: 5
    patterns_verified: 6

  summary:
    passed: false
    total_violations: 3
    by_severity:
      HIGH: 1
      MEDIUM: 1
      LOW: 1
    blocking: 1
    justified: 0

  violations:
    - id: "v-001"
      file: "src/app/users/[slug]/page.tsx"
      line: 1
      category: "url_structure"
      severity: "HIGH"
      issue: "Route uses [slug] instead of [id]"
      expected: "[id]"
      actual: "[slug]"
      pattern_source: ".agent-os/patterns/frontend/routing.md"
      justified: false
      auto_fixable: true
      suggested_fix: "Rename directory to [id]"

  recommendations:
    - "Rename src/app/users/[slug]/ to src/app/users/[id]/"
    - "Update all links to use user.id instead of user.slug"

  gate_result:
    status: "BLOCKED"
    reason: "1 HIGH severity unjustified violation"
    action_required: "Fix violation or provide justification"
```

### 4.2 Console Output

```
═══════════════════════════════════════════════════════════════════
PATTERN CONSISTENCY VALIDATION - FAILED
═══════════════════════════════════════════════════════════════════

Task: {TASK_ID}
Files Checked: 5
Patterns Verified: 6

┌─────────────────────────────────────────────────────────────────┐
│ Severity │ Category     │ File                    │ Status     │
├─────────────────────────────────────────────────────────────────┤
│ HIGH     │ URL Structure│ users/[slug]/page.tsx   │ ❌ BLOCKED │
│ MEDIUM   │ Naming       │ user-profile.tsx        │ ⚠️ WARNING │
│ LOW      │ API Format   │ api/users.ts            │ ℹ️ INFO    │
└─────────────────────────────────────────────────────────────────┘

BLOCKING VIOLATION:
  File: src/app/users/[slug]/page.tsx
  Issue: Route uses [slug] instead of [id]
  Expected: Dynamic route should be [id] based on existing patterns
  Fix: Rename directory from [slug] to [id]

Options:
  1. FIX: Rename [slug] to [id] and update references
  2. JUSTIFY: Provide reason for deviation
  3. SKIP: Mark as acknowledged (not recommended)

Report: .agent-os/pattern-validation/{TASK_ID}-report.json
═══════════════════════════════════════════════════════════════════
```

## Phase 5: Gate Behavior

### 5.1 Enforcement Logic

```yaml
enforcement_mode: # From config.yml
  advisory: # Default
    HIGH: WARN, suggest fix
    MEDIUM: LOG
    LOW: LOG

  warning:
    HIGH: BLOCK until acknowledged
    MEDIUM: WARN, require acknowledgment
    LOW: LOG

  blocking:
    HIGH: BLOCK until fixed or justified
    MEDIUM: BLOCK until acknowledged
    LOW: WARN

gate_decision:
  IF enforcement_mode == "blocking":
    IF any_unjustified_high_severity:
      BLOCK: Task completion
      REQUIRE: Fix or justification

  IF enforcement_mode == "warning":
    IF any_unjustified_high_severity:
      PROMPT: "High severity pattern violation. Continue anyway?"
      WAIT: User decision

  IF enforcement_mode == "advisory":
    LOG: All violations
    CONTINUE: Task completion allowed
```

### 5.2 User Interaction

```yaml
on_blocking_violation:
  PROMPT: |
    Pattern violation detected that blocks task completion:

    File: {file}
    Issue: {issue}
    Expected: {expected}
    Actual: {actual}

    Options:
    1. Fix the violation (recommended)
    2. Provide justification for deviation
    3. Skip validation (requires explicit override)

    Choice?

  IF choice == 1:
    SUGGEST: Auto-fix if available
    WAIT: User confirms fix applied
    REVALIDATE: Run validation again

  IF choice == 2:
    PROMPT: "Enter justification:"
    SAVE: To .agent-os/patterns/deviations/{task_id}.md
    CONTINUE: With documented deviation

  IF choice == 3:
    WARN: "Skipping validation is not recommended"
    REQUIRE: Explicit confirmation
    LOG: Override in validation report
```

## Integration with Execute Tasks

### Workflow Position

```yaml
execute_tasks_integration:
  trigger:
    after: "Phase 4.0 (Security Review)"
    before: "Phase 5.0 (Deliverable Verification)"

  inputs:
    - task_id: Current task being completed
    - files_changed: From git diff
    - patterns: From .agent-os/patterns/

  outputs:
    - validation_report: .agent-os/pattern-validation/{task_id}.json
    - gate_decision: PASS | BLOCKED | WARN

  on_blocked:
    action: Prevent task completion
    user_prompt: Required
    options: [fix, justify, override]
```

### Status Reporting

```yaml
status_format:
  STATUS: "pattern_validation_complete"
  RESULT: "PASSED" | "BLOCKED" | "WARNINGS"
  VIOLATIONS: {count}
  BLOCKING: {count}
  REPORT: "{path}"
```

## Configuration

```yaml
# From config.yml
pattern_consistency:
  enforcement:
    mode: "advisory"  # advisory | warning | blocking
    check_before_completion: true

  validation:
    url_structure: true
    naming_conventions: true
    api_patterns: true
    component_structure: true
    state_management: true
    form_handling: true

  auto_fix:
    enabled: true
    categories:
      - naming  # Can rename files
      - imports # Can reorder imports
    require_confirmation: true

  output:
    save_report: true
    report_directory: ".agent-os/pattern-validation"
```

## Error Handling

| Scenario | Action | Severity |
|----------|--------|----------|
| Patterns not found | WARN, skip validation | Warning |
| File read error | Skip file, log error | Warning |
| Pattern parse error | Skip category, continue | Warning |
| Git diff fails | Use file list from task | Info |
| All validations fail | Report error, don't block | Error |

## Success Criteria

- [ ] All changed files identified
- [ ] All relevant patterns loaded
- [ ] Each pattern category validated
- [ ] Deviations classified by severity
- [ ] Justifications checked
- [ ] Report generated
- [ ] Gate decision made
- [ ] User prompted if blocking
