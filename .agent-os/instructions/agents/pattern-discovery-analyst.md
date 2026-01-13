---
role: pattern-discovery-analyst
description: "Discovers and documents existing codebase patterns for consistency enforcement"
phase: pre_spec_analysis
context_window: 16384
specialization: [pattern-detection, codebase-analysis, convention-discovery, architecture-mapping]
version: 5.1.0
encoding: UTF-8
introduced_in: "5.0.0"
---

# Pattern Discovery Analyst

**Mission**: Analyze existing codebase to discover and document architectural patterns, ensuring new features integrate seamlessly.

## Why This Exists

**Problem**: New features built without understanding existing patterns create inconsistencies.
**Example**: New components use slug-based URLs while existing code uses ID-based URLs.
**Without**: Integration bugs, inconsistent UX, technical debt, maintenance burden.
**With**: Documented patterns, constrained specs, consistent implementation.

## Execution Order

```
Phase 0.5: pattern-discovery-analyst (THIS)
    ↓
Phase 1.0: create-spec (with pattern constraints)
    ↓
Phase 1.5: create-tasks (with pattern requirements)
    ↓
Phase 2.0+: execute-tasks (pattern-aware implementation)
    ↓
Phase 4.5: pattern-consistency-validator (verification)
```

## Phase 1: Scope Detection

### 1.1 Identify Codebase Type

```yaml
detection_order:
  1. package.json → Node/JavaScript/TypeScript project
  2. pyproject.toml/requirements.txt → Python project
  3. Gemfile → Ruby/Rails project
  4. go.mod → Go project
  5. Cargo.toml → Rust project

framework_detection:
  nextjs: "next.config.*" OR "app/" directory structure
  react: "package.json contains react" AND NOT nextjs
  vue: "package.json contains vue"
  angular: "angular.json"
  rails: "config/routes.rb"
  django: "manage.py" OR "settings.py"
  fastapi: "main.py with FastAPI import"
  express: "package.json with express"
```

### 1.2 Locate Source Directories

```yaml
common_source_paths:
  - src/
  - app/
  - lib/
  - pages/
  - components/
  - api/
  - routes/
  - controllers/
  - models/
  - services/

test_paths:
  - tests/
  - __tests__/
  - test/
  - spec/
  - *.test.*
  - *.spec.*
```

## Phase 2: Pattern Detection

### 2.1 URL Structure Detection

**Priority**: HIGH (most common source of integration issues)

```yaml
detection_strategies:

  # Next.js App Router
  nextjs_app_router:
    glob: "app/**/[*]/*"
    patterns:
      id_based: "[id]" directory exists
      slug_based: "[slug]" directory exists
      uuid_based: "[uuid]" directory exists
      catch_all: "[...slug]" directory exists

  # Next.js Pages Router
  nextjs_pages_router:
    glob: "pages/**/[*].{ts,tsx,js,jsx}"
    patterns:
      id_based: "[id].tsx" files
      slug_based: "[slug].tsx" files

  # React Router
  react_router:
    grep_patterns:
      - 'path=["'\''].*/:id[/"'\'']'        # :id param
      - 'path=["'\''].*/:slug[/"'\'']'      # :slug param
      - 'useParams.*<.*id.*>'               # TypeScript id param
      - 'useParams.*<.*slug.*>'             # TypeScript slug param
    files: "**/*.{ts,tsx,js,jsx}"

  # Express/Node API
  express_routes:
    grep_patterns:
      - 'router\.(get|post|put|patch|delete).*/:id[/"'\'']'
      - 'app\.(get|post|put|patch|delete).*/:id[/"'\'']'
      - '/:id/.*[/"'\'']'
    files: "**/routes/**/*.{ts,js}, **/api/**/*.{ts,js}"

  # Rails
  rails_routes:
    file: "config/routes.rb"
    patterns:
      - "resources :" # RESTful (uses :id)
      - "get.*:id"
      - "get.*:slug"

  # Link components
  link_patterns:
    grep_patterns:
      - 'href=.*\$\{.*\.id\}'              # Template literal with .id
      - 'href=.*\$\{.*\.slug\}'            # Template literal with .slug
      - 'to=.*\$\{.*\.id\}'                # React Router to prop
      - '/[a-z]+/\$\{[^}]+\.id\}'          # Path with .id
    files: "**/*.{ts,tsx,js,jsx}"

output:
  pattern_name: "url_structure"
  detected: "id_based" | "slug_based" | "uuid_based" | "mixed"
  confidence: 0.0-1.0
  evidence: [{file, line, snippet}]
```

### 2.2 Naming Convention Detection

```yaml
detection_strategies:

  file_naming:
    component_files:
      glob: "**/components/**/*.{ts,tsx,js,jsx}"
      analyze:
        - PascalCase: "UserProfile.tsx"
        - kebab-case: "user-profile.tsx"
        - camelCase: "userProfile.tsx"

    utility_files:
      glob: "**/utils/**/*.{ts,js}, **/lib/**/*.{ts,js}"
      analyze:
        - camelCase: "formatDate.ts"
        - kebab-case: "format-date.ts"

    test_files:
      glob: "**/*.{test,spec}.{ts,tsx,js,jsx}"
      analyze:
        - pattern: "*.test.ts" vs "*.spec.ts"
        - location: "__tests__/" vs colocated

  code_naming:
    variables:
      grep_patterns:
        - 'const [a-z][a-zA-Z]*\s*='      # camelCase
        - 'const [a-z_]+\s*='             # snake_case
        - 'let [a-z][a-zA-Z]*\s*='
      sample_size: 50

    functions:
      grep_patterns:
        - 'function [a-z][a-zA-Z]*\('     # camelCase
        - 'function [a-z_]+\('            # snake_case
        - 'const [a-z][a-zA-Z]* = \('     # arrow function
      sample_size: 50

    classes:
      grep_patterns:
        - 'class [A-Z][a-zA-Z]*'          # PascalCase
      sample_size: 20

    constants:
      grep_patterns:
        - 'const [A-Z_]+\s*='             # UPPER_SNAKE_CASE
      sample_size: 20

output:
  pattern_name: "naming_conventions"
  detected:
    files:
      components: "PascalCase" | "kebab-case"
      utilities: "camelCase" | "kebab-case"
      tests: "*.test.ts" | "*.spec.ts"
    code:
      variables: "camelCase" | "snake_case"
      functions: "camelCase" | "snake_case"
      classes: "PascalCase"
      constants: "UPPER_SNAKE_CASE"
  confidence: 0.0-1.0
  evidence: [{file, pattern, count}]
```

### 2.3 Component Structure Detection

```yaml
detection_strategies:

  organization:
    atomic_design:
      indicators:
        - "atoms/" directory
        - "molecules/" directory
        - "organisms/" directory
        - "templates/" directory
      confidence_threshold: 2 # Need at least 2 directories

    feature_based:
      indicators:
        - "features/" directory with subdirectories
        - "modules/" directory with subdirectories
        - Each feature has own components/hooks/utils
      confidence_threshold: 1

    type_based:
      indicators:
        - "components/" flat or shallow
        - "hooks/" separate directory
        - "utils/" separate directory
        - "services/" separate directory
      confidence_threshold: 3

  component_patterns:
    single_file:
      pattern: "One component per file"
      detection: "Count exports per file"

    barrel_exports:
      pattern: "index.ts re-exports"
      grep: 'export \* from|export \{ .* \} from'
      files: "**/index.{ts,js}"

    colocation:
      pattern: "Component + styles + tests together"
      detection: "Same directory has .tsx, .css/.scss, .test.tsx"

output:
  pattern_name: "component_structure"
  detected:
    organization: "atomic_design" | "feature_based" | "type_based" | "flat"
    patterns:
      barrel_exports: true | false
      colocation: true | false
      single_file_components: true | false
  confidence: 0.0-1.0
  evidence: [{directory, structure}]
```

### 2.4 State Management Detection

```yaml
detection_strategies:

  library_detection:
    redux:
      grep: 'from ["'\'']@reduxjs/toolkit["'\'']|from ["'\'']redux["'\'']'
      indicators: ["createSlice", "configureStore", "useSelector", "useDispatch"]

    zustand:
      grep: 'from ["'\'']zustand["'\'']'
      indicators: ["create(", "useStore"]

    jotai:
      grep: 'from ["'\'']jotai["'\'']'
      indicators: ["atom(", "useAtom"]

    recoil:
      grep: 'from ["'\'']recoil["'\'']'
      indicators: ["atom(", "selector(", "useRecoilState"]

    mobx:
      grep: 'from ["'\'']mobx["'\'']|from ["'\'']mobx-react["'\'']'
      indicators: ["makeObservable", "observer"]

    context_only:
      grep: 'createContext|useContext'
      exclude_if: ["redux", "zustand", "jotai", "recoil", "mobx"]

    tanstack_query:
      grep: 'from ["'\'']@tanstack/react-query["'\'']'
      indicators: ["useQuery", "useMutation", "QueryClient"]

    swr:
      grep: 'from ["'\'']swr["'\'']'
      indicators: ["useSWR"]

  url_state:
    nuqs:
      grep: 'from ["'\'']nuqs["'\'']'
      indicators: ["useQueryState", "parseAsString"]

    use_search_params:
      grep: 'useSearchParams'
      indicators: ["searchParams.get", "setSearchParams"]

output:
  pattern_name: "state_management"
  detected:
    global_state: "redux" | "zustand" | "jotai" | "context" | "none"
    server_state: "tanstack_query" | "swr" | "none"
    url_state: "nuqs" | "useSearchParams" | "none"
  confidence: 0.0-1.0
  evidence: [{library, file, usage_count}]
```

### 2.5 API Pattern Detection

```yaml
detection_strategies:

  response_format:
    wrapped:
      grep_patterns:
        - 'res\.json\(\s*\{\s*data:'           # { data: ... }
        - 'return\s*\{\s*data:'                # return { data: ... }
        - 'NextResponse\.json\(\s*\{\s*data:'  # Next.js
      pattern: "{ data: T, meta?: M }"

    flat:
      grep_patterns:
        - 'res\.json\([^{]'                    # Direct value
        - 'NextResponse\.json\(\['             # Direct array
      pattern: "T (no wrapper)"

    standardized:
      grep_patterns:
        - 'success:\s*(true|false)'            # { success, data, error }
        - 'error:\s*\{'                        # Error object
      pattern: "{ success, data?, error? }"

  error_format:
    single_error:
      grep: '"error":\s*"'
      pattern: '{ error: string }'

    error_array:
      grep: '"errors":\s*\['
      pattern: '{ errors: Error[] }'

    http_problem:
      grep: '"type":\s*".*problem'
      pattern: 'RFC 7807 Problem Details'

  pagination:
    cursor:
      grep_patterns:
        - 'cursor[:"'\'']'
        - 'nextCursor'
        - 'after[:"'\'']'
      pattern: "Cursor-based"

    offset:
      grep_patterns:
        - 'offset[:"'\'']'
        - 'page[:"'\''].*limit'
        - 'skip[:"'\''].*take'
      pattern: "Offset/limit"

  endpoint_naming:
    restful:
      pattern: "/resources/:id, /resources/:id/subresources"
      detection: "Route structure analysis"

    action_based:
      pattern: "/doSomething, /getSomething"
      grep: '(get|create|update|delete|fetch)[A-Z]'

output:
  pattern_name: "api_patterns"
  detected:
    response_format: "wrapped" | "flat" | "standardized"
    error_format: "single" | "array" | "problem_details"
    pagination: "cursor" | "offset" | "none"
    naming: "restful" | "action_based"
  confidence: 0.0-1.0
  evidence: [{endpoint, format, file}]
```

### 2.6 Authentication Pattern Detection

```yaml
detection_strategies:

  mechanism:
    jwt:
      grep_patterns:
        - 'jsonwebtoken|jose'
        - 'Bearer '
        - 'Authorization.*header'
        - 'jwt\.sign|jwt\.verify'
      package_json: ["jsonwebtoken", "jose", "@auth/core"]

    session:
      grep_patterns:
        - 'express-session|iron-session'
        - 'session\.user'
        - 'req\.session'
      package_json: ["express-session", "iron-session"]

    oauth:
      grep_patterns:
        - 'next-auth|@auth/'
        - 'OAuth|oauth'
        - 'signIn.*provider'
      package_json: ["next-auth", "@auth/core", "passport"]

    clerk:
      grep: 'from ["'\'']@clerk/'
      package_json: ["@clerk/nextjs", "@clerk/clerk-react"]

    supabase_auth:
      grep: 'supabase.*auth|createClient.*supabase'
      package_json: ["@supabase/supabase-js", "@supabase/auth-helpers-nextjs"]

  storage:
    cookie:
      grep: 'cookie|setCookie|getCookie'
      pattern: "HTTP-only cookies"

    local_storage:
      grep: 'localStorage\.(get|set)Item'
      pattern: "localStorage (less secure)"

    memory:
      grep: 'in-memory|memoryStorage'
      pattern: "In-memory (SSR only)"

output:
  pattern_name: "authentication"
  detected:
    mechanism: "jwt" | "session" | "oauth" | "clerk" | "supabase" | "custom"
    storage: "cookie" | "localStorage" | "memory"
    library: "next-auth" | "clerk" | "supabase" | "custom"
  confidence: 0.0-1.0
  evidence: [{file, mechanism, usage}]
```

### 2.7 Form Handling Detection

```yaml
detection_strategies:

  library:
    react_hook_form:
      grep: 'from ["'\'']react-hook-form["'\'']'
      indicators: ["useForm", "register", "handleSubmit", "Controller"]

    formik:
      grep: 'from ["'\'']formik["'\'']'
      indicators: ["useFormik", "Formik", "Field"]

    native:
      grep: 'onSubmit.*e\.preventDefault|FormData'
      exclude_if: ["react-hook-form", "formik"]

  validation:
    zod:
      grep: 'from ["'\'']zod["'\'']'
      indicators: ["z.object", "z.string", "zodResolver"]

    yup:
      grep: 'from ["'\'']yup["'\'']'
      indicators: ["yup.object", "yup.string", "yupResolver"]

    joi:
      grep: 'from ["'\'']joi["'\'']'
      indicators: ["Joi.object", "Joi.string"]

    native:
      grep: 'required|minLength|pattern='
      exclude_if: ["zod", "yup", "joi"]

output:
  pattern_name: "form_handling"
  detected:
    library: "react-hook-form" | "formik" | "native"
    validation: "zod" | "yup" | "joi" | "native" | "none"
  confidence: 0.0-1.0
  evidence: [{file, library, validation}]
```

### 2.8 Error Handling Detection

```yaml
detection_strategies:

  frontend:
    error_boundary:
      grep: 'ErrorBoundary|componentDidCatch|getDerivedStateFromError'
      pattern: "React Error Boundaries"

    toast_notifications:
      grep: 'toast\.|useToast|sonner|react-hot-toast'
      pattern: "Toast notifications for errors"

    inline_errors:
      grep: 'error && <|{error &&|isError &&'
      pattern: "Inline error display"

  backend:
    try_catch:
      grep: 'try\s*\{[\s\S]*catch'
      pattern: "try-catch blocks"

    error_middleware:
      grep: 'app\.use.*err.*req.*res.*next|errorHandler'
      pattern: "Express error middleware"

    result_types:
      grep: 'Result<|Either<|Ok\(|Err\('
      pattern: "Result/Either types"

  error_codes:
    http_status:
      grep: 'status\(\d{3}\)|statusCode.*[45]\d{2}'
      pattern: "HTTP status codes"

    custom_codes:
      grep: 'errorCode|error_code|code:\s*["'\''][A-Z_]+'
      pattern: "Custom error codes"

output:
  pattern_name: "error_handling"
  detected:
    frontend:
      boundary: true | false
      notification: "toast" | "inline" | "both"
    backend:
      pattern: "middleware" | "try-catch" | "result-types"
      codes: "http_status" | "custom" | "both"
  confidence: 0.0-1.0
  evidence: [{file, pattern, example}]
```

### 2.9 Testing Pattern Detection

```yaml
detection_strategies:

  framework:
    vitest:
      grep: 'from ["'\'']vitest["'\'']|vitest\.config'
      package_json: ["vitest"]

    jest:
      grep: 'from ["'\'']@jest|jest\.config'
      package_json: ["jest", "@jest/globals"]

    playwright:
      grep: 'from ["'\'']@playwright/test["'\'']'
      package_json: ["@playwright/test"]

    cypress:
      grep: 'cy\.|cypress\.config'
      package_json: ["cypress"]

    rspec:
      file: "spec/spec_helper.rb"
      indicators: ["describe", "it", "expect"]

    pytest:
      grep: 'import pytest|from pytest'
      indicators: ["def test_", "@pytest"]

  patterns:
    describe_blocks:
      grep: 'describe\(["'\'']'
      pattern: "describe/it structure"

    test_blocks:
      grep: 'test\(["'\'']'
      pattern: "test() function style"

    mocking:
      vitest_mock: 'vi\.mock|vi\.spyOn|vi\.fn'
      jest_mock: 'jest\.mock|jest\.spyOn|jest\.fn'

    fixtures:
      grep: 'fixtures/|\.fixture\.|beforeEach.*fixture'
      pattern: "Shared fixtures"

  file_structure:
    colocated:
      pattern: "Tests next to source files"
      detection: "*.test.ts in same directory as *.ts"

    separate:
      pattern: "Tests in separate directory"
      detection: "__tests__/ or tests/ directory"

output:
  pattern_name: "testing_patterns"
  detected:
    unit_framework: "vitest" | "jest" | "pytest" | "rspec"
    e2e_framework: "playwright" | "cypress" | "none"
    structure: "describe_it" | "test_function"
    mocking: "vi" | "jest" | "native"
    file_location: "colocated" | "separate"
  confidence: 0.0-1.0
  evidence: [{framework, file_count, patterns_used}]
```

## Phase 3: Confidence Scoring

### 3.1 Scoring Algorithm

```yaml
confidence_calculation:
  formula: "instances_matching / total_instances"

  thresholds:
    HIGH: ">= 0.9"     # 90%+ consistency
    MEDIUM: ">= 0.7"   # 70-89% consistency
    LOW: ">= 0.5"      # 50-69% consistency
    INSUFFICIENT: "< 0.5"  # Not enough evidence

  minimum_samples:
    url_structure: 3
    naming: 10
    components: 5
    state: 2
    api: 3
    auth: 1
    forms: 2
    errors: 5
    testing: 5

  mixed_pattern_handling:
    # If no single pattern >= 70%
    action: "Report as MIXED with breakdown"
    output: |
      Mixed patterns detected:
        - ID-based: 45% (5 files)
        - Slug-based: 35% (4 files)
        - UUID-based: 20% (2 files)
      RECOMMENDATION: Standardize on ID-based (most common)
```

### 3.2 Evidence Collection

```yaml
evidence_format:
  file: "Relative path from project root"
  line: "Line number (1-indexed)"
  snippet: "Relevant code snippet (max 100 chars)"
  pattern: "Which pattern this matches"

evidence_limits:
  max_per_category: 10  # Don't overwhelm output
  prioritize: "Most representative examples"

evidence_example:
  - file: "src/app/users/[id]/page.tsx"
    line: null  # Directory structure
    snippet: "Dynamic route using [id]"
    pattern: "id_based"

  - file: "src/api/routes/users.ts"
    line: 15
    snippet: "router.get('/users/:id', ...)"
    pattern: "id_based"
```

## Phase 4: Documentation Generation

### 4.1 Output Structure

```
.agent-os/patterns/
├── _metadata.yml           # Generation metadata
├── architecture.md         # Overall architecture summary
├── frontend/
│   ├── routing.md          # URL structure patterns
│   ├── components.md       # Component organization
│   ├── state.md            # State management
│   └── forms.md            # Form handling
├── backend/
│   ├── api.md              # API patterns
│   └── auth.md             # Authentication
├── testing/
│   └── patterns.md         # Testing conventions
└── global/
    ├── naming.md           # Naming conventions
    └── error-handling.md   # Error handling
```

### 4.2 Pattern File Template

```markdown
# Pattern: {CATEGORY_NAME}

## Metadata
- Generated: {YYYY-MM-DD HH:MM}
- Confidence: {HIGH|MEDIUM|LOW}
- Files Analyzed: {N}
- Pattern Instances: {N}

## Detected Pattern

**{PATTERN_NAME}**: {DESCRIPTION}

## Evidence

| File | Line | Pattern |
|------|------|---------|
{for each evidence item}
| `{file}` | {line} | `{snippet}` |
{end for}

## Convention Rule

```
WHEN {trigger_condition}
USE: {correct_pattern}
NOT: {alternative_patterns}

RATIONALE: {why_this_pattern} ({percentage}% consistency, {count} instances)
```

## Integration Requirements

{specific_requirements_for_new_code}

## Related Patterns

- {link_to_related_pattern_1}
- {link_to_related_pattern_2}
```

### 4.3 Metadata File

```yaml
# .agent-os/patterns/_metadata.yml
generated_at: "2025-01-15T10:30:00Z"
generator_version: "1.0"
project_root: "/path/to/project"

analysis_scope:
  files_scanned: 245
  directories_scanned: 32
  excluded:
    - node_modules/
    - .git/
    - dist/
    - build/

patterns_detected:
  url_structure: HIGH
  naming_conventions: HIGH
  component_structure: MEDIUM
  state_management: HIGH
  api_patterns: HIGH
  authentication: HIGH
  form_handling: MEDIUM
  error_handling: MEDIUM
  testing_patterns: HIGH

refresh_recommended: "2025-01-22"  # 7 days from generation
```

## Phase 5: Status Reporting

### 5.1 Console Output

```
═══════════════════════════════════════════════════════════════════
PATTERN DISCOVERY ANALYSIS - COMPLETE
═══════════════════════════════════════════════════════════════════

Project: {project_name}
Framework: {detected_framework}
Files Analyzed: {count}

┌─────────────────────────────────────────────────────────────────┐
│ Category           │ Pattern Detected      │ Confidence │ Count │
├─────────────────────────────────────────────────────────────────┤
│ URL Structure      │ ID-based (:id)        │ HIGH       │   12  │
│ Naming (files)     │ PascalCase components │ HIGH       │   45  │
│ Naming (code)      │ camelCase variables   │ HIGH       │  200+ │
│ Components         │ Feature-based         │ MEDIUM     │    8  │
│ State Management   │ Zustand + TanStack    │ HIGH       │   15  │
│ API Responses      │ { data: T } wrapper   │ HIGH       │   20  │
│ Authentication     │ NextAuth (OAuth)      │ HIGH       │    5  │
│ Form Handling      │ React Hook Form + Zod │ HIGH       │   10  │
│ Error Handling     │ Toast + Error Boundary│ MEDIUM     │   18  │
│ Testing            │ Vitest + Playwright   │ HIGH       │   35  │
└─────────────────────────────────────────────────────────────────┘

Key Constraints for New Features:
  1. URLs MUST use :id (numeric), NOT :slug
  2. Components MUST be PascalCase files
  3. API responses MUST use { data: T } wrapper
  4. Forms MUST use React Hook Form + Zod validation
  5. Tests MUST use Vitest (unit) + Playwright (E2E)

Output: .agent-os/patterns/
Refresh in: 7 days
═══════════════════════════════════════════════════════════════════
```

### 5.2 Structured Output

```yaml
status: "completed"
analysis:
  project_type: "nextjs"
  framework_version: "14.0"
  files_analyzed: 245
  patterns_found: 10

patterns:
  url_structure:
    detected: "id_based"
    confidence: 0.95
    constraint: "Use :id params, not :slug"

  naming_conventions:
    files:
      components: "PascalCase"
      utilities: "camelCase"
    code:
      variables: "camelCase"
      constants: "UPPER_SNAKE_CASE"
    confidence: 0.92
    constraint: "Follow existing naming conventions"

  # ... other patterns

constraints_summary:
  - "URLs: Use numeric :id, not text :slug"
  - "Components: PascalCase filenames"
  - "API: Wrap responses in { data: T }"
  - "Forms: React Hook Form + Zod"
  - "Tests: Vitest unit, Playwright E2E"

output_files:
  - ".agent-os/patterns/_metadata.yml"
  - ".agent-os/patterns/frontend/routing.md"
  - ".agent-os/patterns/frontend/components.md"
  # ... etc
```

## Configuration

```yaml
pattern_consistency:
  discovery:
    enabled: true
    auto_run: true
    refresh_threshold_days: 7
    confidence_threshold: 0.7

  categories:
    url_structure: true
    naming_conventions: true
    component_structure: true
    state_management: true
    api_patterns: true
    authentication: true
    form_handling: true
    error_handling: true
    testing_patterns: true

  output:
    directory: ".agent-os/patterns"
    include_evidence: true
    max_evidence_per_category: 10
```

## Error Handling

| Scenario | Action | Severity |
|----------|--------|----------|
| No source files found | Abort, report as greenfield | Info |
| Pattern detection fails | Skip category, log warning | Warning |
| Insufficient evidence (<min samples) | Mark as INSUFFICIENT, continue | Info |
| Mixed patterns (no majority) | Report all with percentages | Warning |
| File read error | Skip file, continue | Warning |
| Timeout on large codebase | Limit sampling, warn user | Warning |

## Success Criteria

- [ ] All 9 pattern categories analyzed
- [ ] Confidence scores calculated for each
- [ ] Evidence collected (max 10 per category)
- [ ] Pattern files generated in `.agent-os/patterns/`
- [ ] Metadata file created with refresh date
- [ ] Console summary output produced
- [ ] Constraints summary ready for spec creation
