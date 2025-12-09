---
description: Spec Creation Rules for Agent OS
globs:
alwaysApply: false
version: 1.1
encoding: UTF-8
---

# Spec Creation Rules

Generate detailed feature specifications aligned with product roadmap and mission.

## CRITICAL: Subagent Delegation

When delegating via `Task()`, MUST use template:
`@.agent-os/instructions/utilities/subagent-delegation-template.md`

**Why**: Subagents don't inherit:
- Mandatory skill invocations (Step 3.8)
- Pattern lookup hierarchy
- shadcn MCP requirements for UI specs

**Required in ALL delegation prompts**:
```yaml
mandatory_inclusions:
  1_skill_invocation: |
    BEFORE writing spec: Skill(skill="agent-os-patterns")
    For UI: mcp__shadcn__list_components(), mcp__shadcn__get_component_demo()
  
  2_pattern_lookup: |
    FIRST: .agent-os/patterns/ (project-specific)
    SECOND: skills (generic patterns)
    THIRD: WebSearch (fallback)
  
  3_confirmation: |
    CONFIRM patterns/demos loaded in spec
```

## Prerequisites

Run BEFORE create-spec:
- `plan-product.md` (new products) OR
- `analyze-product.md` (existing codebases)

Ensures:
- `.agent-os/product/mission-lite.md`
- `.agent-os/product/tech-stack.md`

<pre_flight_check>
  EXECUTE: @.agent-os/instructions/meta/pre-flight.md
</pre_flight_check>

## Process Flow

### Step 0: Detect Agent OS Root

```
SEARCH .agent-os/:
  1. Check CWD
  2. Walk up parents
  3. Error if not found

STORE: AGENT_OS_ROOT = directory containing .agent-os/

ERROR: If not found, "Run plan-product or analyze-product first"
```

### Step 1: Prerequisite Verification

```
CHECK: {AGENT_OS_ROOT}/.agent-os/product/mission-lite.md
CHECK: {AGENT_OS_ROOT}/.agent-os/product/tech-stack.md

ERROR if missing: "Run plan-product or analyze-product first"
```

### Step 2: Spec Initiation

**Subagent**: context-fetcher

**Option A** - "what's next?":
1. Read `roadmap.md`
2. Find next uncompleted item
3. Suggest to user
4. Wait approval

**Option B** - User describes spec:
- Accept any format/detail level
- Proceed to detail selection

### Step 2.5: Detail Level Selection

```
Present options:
  Quick (5-10 min read):
    - Small features, bug fixes
    - 1 file: minimal-spec-template.md
  
  More (15-25 min read):
    - Medium features, new components
    - 2-3 files: standard-spec-template.md
  
  A Lot (45-60 min read):
    - Major features, system redesigns
    - 5-8 files: All sub-spec templates

STORE: SPEC_DETAIL_LEVEL = [minimal | standard | comprehensive]
```

**Selection Guidance**:
| Level | Time | Scope | Examples |
|-------|------|-------|----------|
| Minimal | <4h | Clear requirements, no new architecture | UI tweaks, config, simple CRUD |
| Standard | 4-16h | Moderate complexity, new components | API endpoints, forms, auth features |
| Comprehensive | >16h | High complexity, architectural decisions | Payments, real-time, major refactors |

**Factors**: Time, Complexity, Integration, Risk, Team, Documentation needs

### Step 3: Context Gathering

**Subagent**: context-fetcher

```
IF both files in context:
  SKIP
ELSE:
  READ missing:
    - mission-lite.md (if not in context)
    - tech-stack.md (if not in context)
```

### Step 3.5: Research Agents (Compound Engineering)

Execute 4 research agents in parallel:

| Agent | Purpose | Context |
|-------|---------|---------|
| repo-research-analyst | Codebase patterns | 16KB |
| best-practices-researcher | External best practices | 12KB |
| framework-docs-researcher | Framework docs | 12KB |
| git-history-analyzer | History analysis | 12KB |

**Output Format** (each agent):
```yaml
agent: [name]
research_type: [codebase|best_practices|framework_docs|git_history]
findings:
  - category: [category]
    title: [title]
    description: [details]
    relevance: [how applies]
    examples: [code examples]
    recommendations: [actions]
    references: [links/paths]
```

**Synthesis**:
1. Collect findings from all agents
2. Identify key insights
3. Generate recommendations
4. Prepare integration guidance

**Save**: `{AGENT_OS_ROOT}/.agent-os/specs/YYYY-MM-DD-spec-name/research-findings.yml`

**Error Handling**:
- <50% fail: Continue with available
- ≥50% fail: Warn, ask user
- All fail: Proceed with basic spec

### Step 3.8: Load Patterns via Skills

**⚠️ MANDATORY TOOL INVOCATION**

**Step 1**: Check project patterns FIRST:
```
CHECK: .agent-os/patterns/
  - frontend/typescript.md
  - backend/python.md
  - backend/rails.md
  - backend/api.md
  - global/error-handling.md

Project patterns take PRECEDENCE
```

**Step 2**: Invoke global skill:
```
Skill(skill="agent-os-patterns")

READ relevant references:
  - references/testing/vitest.md
  - references/testing/playwright.md
  - references/testing/convex.md
  - references/testing/test-strategies.md
  - references/global/coding-style.md
```

**Verification**:
- [ ] Checked .agent-os/patterns/
- [ ] Skill tool invoked
- [ ] References loaded
- [ ] Patterns available

### Step 4: Requirements Clarification

**Subagent**: context-fetcher

**Areas**:
- Scope: in_scope, out_of_scope
- Technical: functionality, UI/UX, integrations

```
IF clarification_needed:
  ASK numbered_questions
  WAIT user_response
ELSE:
  PROCEED
```

### Step 4.5: TDD Workflow Definition

**Purpose**: Establish test-first strategy upfront

**When**: Always for new features, API endpoints, data models, business logic, integrations, critical bugs

**Skip**: Pure docs, config-only, UI styling, version bumps

**Sequence**:
1. Determine enforcement level (5-10 min)
2. Design RED phase (15-30 min)
3. Design GREEN phase (15-30 min)
4. Design REFACTOR phase (10-20 min)
5. Set coverage targets (5-10 min)

#### Enforcement Levels

| Level | Use When | Behavior |
|-------|----------|----------|
| STRICT | Critical production, security, financial, data integrity | Block on violations |
| STANDARD | Standard features, API endpoints, business logic | Warn on violations |
| RELAXED | Prototyping, spikes, legacy integration | Log only |

#### RED Phase Design

```markdown
### RED Phase: Failing Tests

**Objective**: Write tests that fail because feature not implemented

#### Unit Tests
1. **test_user_validation_requires_email**
   - Purpose: Verify user model requires email
   - Expected Failure: `ValidationError: email is required`
   - Test Data: User without email

[Continue for all tests...]

**Test Execution Order**:
1. Unit tests (parallel)
2. Integration tests (sequential)
3. Edge cases (parallel)

**RED Phase Complete When**:
- [ ] All tests written
- [ ] All tests execute (no syntax errors)
- [ ] All fail with expected messages
```

#### GREEN Phase Design

```markdown
### GREEN Phase: Minimal Implementation

**Minimal Principles**:
- Max 50 lines/function
- Max complexity: 10
- Use stdlib over custom
- No premature abstraction

#### Implementation Steps
1. **Implement User email validation**
   - Files: `models/user.js`
   - Code: Add `email` required + validator
   - Tests Passing: `test_user_validation_requires_email`, `test_email_format_validation`
   - LOC: ~10
   - Checkpoint: Email validates presence/format

[Continue...]

**GREEN Phase Complete When**:
- [ ] All tests pass
- [ ] Coverage met
- [ ] No over-implementation
```

#### REFACTOR Phase Design

```markdown
### REFACTOR Phase: Code Quality

1. **Extract email validation logic**
   - Current: Duplicated in model/API
   - Target: Shared `validateEmail()` utility
   - Files: `models/user.js`, `api/users.js`, `utils/validation.js` (new)
   - Effort: Small (15-20 min)
   - Priority: Should
   - Benefit: DRY, single source of truth

[Continue...]

**REFACTOR Phase Complete When**:
- [ ] Must refactorings done
- [ ] Tests passing
- [ ] Coverage maintained
```

#### Coverage Targets

| Level | Min | Target | Warning |
|-------|-----|--------|---------|
| STRICT | 90% | 95% | 85% |
| STANDARD | 85% | 90% | 80% |
| RELAXED | 75% | 85% | 70% |

**Adjust by feature**:
- Business logic: +5%
- Data validation: +5%
- Security: +10%
- UI components: -5% (logic only)

**TDD Acceptance Criteria**:
- [ ] RED: Tests written, failing with expected errors
- [ ] GREEN: Tests passing, minimal implementation
- [ ] REFACTOR: Must refactorings done
- [ ] Coverage: Meets minimum ([NUMBER]%)
- [ ] Test-First: Tests created before implementation
- [ ] Quality Gates: All passed

**Skip Criteria** (ALL must be true):
- [ ] Pure documentation
- [ ] Config-only
- [ ] UI styling only
- [ ] Version bump (no API changes)
- [ ] No tests required/possible

### Step 5: Ultra-Thinking Protocol

Systematic deep analysis using 3 templates.

**When**: New features, architecture changes, security, performance-critical, complex workflows

**Skip** (ALL true):
- [ ] <50 lines in single file
- [ ] No new dependencies/integrations
- [ ] No auth/authz/validation changes
- [ ] No performance-critical paths
- [ ] No schema/data model changes
- [ ] No new user-facing features

#### Analysis 1: Stakeholder Perspective (30-120 min)

Template: `templates/ultra-thinking/stakeholder-analysis.md`

For each perspective (Developer, Operations, User, Security, Business, QA):
- Rate impact (1-5)
- Document positive/negative
- Propose mitigations
- Identify conflicts
- Define success criteria

**Output**:
```markdown
## Stakeholder Analysis

**Developer Impact**: [1-5] ⭐
- Positive: [benefits]
- Negative: [concerns]
- Mitigation: [how to address]

[Repeat for Operations, User, Security, Business, QA]

### Conflicts
1. [A] vs [B]: [conflict]
   - Resolution: [approach]
   - Trade-off: [what we optimize for]

### Success Criteria by Stakeholder
- Developer: [metrics]
- Operations: [metrics]
- User: [metrics]
- Security: [metrics]
- Business: [metrics]
- QA: [metrics]
```

#### Analysis 2: Scenario Exploration (30-120 min)

Template: `templates/ultra-thinking/scenario-exploration.md`

**Categories**:
- Edge Cases: Empty input, max size, concurrent access
- Failures: Infrastructure, data, dependencies
- Scale: High volume, large data, slow networks
- Security: Injection, auth bypass, privilege escalation, DoS
- User: Unexpected usage, mistakes, multi-device
- Integration: Third-party changes, consistency, migrations
- Operational: Deployment, monitoring, maintenance

For each scenario:
- Likelihood (Very Likely → Very Unlikely)
- Impact (Critical → Minimal)
- Risk = Likelihood × Impact
- Priority (P1/P2/P3)

**P1 Mitigation**:
1. Prevention (design to prevent)
2. Detection (identify when occurs)
3. Graceful degradation (handle elegantly)
4. Recovery (restore normal)

**Output**:
```markdown
## Scenario Exploration

### High Risk (P1): [COUNT]

#### Scenario: [NAME]
**Category**: [category]
**Likelihood**: [level]
**Impact**: [level]
**Current Handling**: [approach or "Unhandled"]

**Mitigation**:
1. Prevention: [strategy]
2. Detection: [strategy]
3. Degradation: [strategy]
4. Recovery: [strategy]

**Implementation**: P1
**Effort**: [Small/Medium/Large]

[Repeat for all P1 scenarios]
```

#### Analysis 3: Multi-Angle Review (30-90 min)

Template: `templates/ultra-thinking/multi-angle-review.md`

**Angles**:
- Technical Excellence: Quality, architecture, debt
- Business Value: ROI, competitive advantage, alignment
- Risk Management: Technical risks, security, compliance
- Team Collaboration: Onboarding, docs, velocity
- User Experience: Usability, accessibility, performance
- Long-term Vision: Scalability, maintainability, evolution

For each angle:
- Strengths
- Concerns
- Rating (1-5)
- Recommendations

**Output**:
```markdown
## Multi-Angle Review

#### 1. Technical Excellence 🔧
**Rating**: [1-5] ⭐
**Strengths**: [list]
**Concerns**: [list]
**Recommendations**: [list]

[Repeat for all 6 angles]

### Synthesis
**Overall**: [Average] ⭐
**Recommendation**: [✅ Proceed | ⚠️ Caution | ❌ Needs Revision]

**Critical Issues** (must address):
1. [issue]

**Important Improvements** (should address):
1. [improvement]

**Nice-to-Have**:
1. [enhancement]

### Implementation Readiness
- [ ] Technical architecture sound
- [ ] Business value clear/measurable
- [ ] Risks identified/mitigated
- [ ] Team can execute
- [ ] UX meets standards
- [ ] Long-term maintainability acceptable

**Ready**: [YES/NO/CONDITIONAL]
```

**Final Spec Update**:
1. Consolidate findings
2. Update core sections
3. Save analysis artifacts:
   - `analysis-stakeholder.md`
   - `analysis-scenarios.md`
   - `analysis-multi-angle.md`
4. Reference in main spec

**Time Investment**:
| Complexity | Stakeholder | Scenarios | Multi-Angle | Total |
|------------|-------------|-----------|-------------|-------|
| Simple | 30-60 | 30-60 | 30-90 | 1.5-3h |
| Moderate | 60-90 | 60-90 | 45-90 | 2.5-4h |
| Complex | 90-120 | 90-120 | 60-90 | 4-5.5h |

### Step 6: Date Determination

**Subagent**: date-checker

Output: YYYY-MM-DD format
Store for folder naming

### Step 7: Spec Folder Creation

**Subagent**: file-creator

```
CREATE: {AGENT_OS_ROOT}/.agent-os/specs/YYYY-MM-DD-spec-name/

Rules:
  - kebab-case
  - Max 5 words
  - Descriptive

Examples:
  - 2025-03-15-password-reset-flow
  - 2025-03-16-user-profile-dashboard
```

### Step 8: Create spec.md

**Subagent**: file-creator

File: `{AGENT_OS_ROOT}/.agent-os/specs/YYYY-MM-DD-spec-name/spec.md`

```markdown
# Spec Requirements Document

> Spec: [SPEC_NAME]
> Created: [CURRENT_DATE]

## Overview
[1-2 sentences: goal and objective]

## User Stories

### [STORY_TITLE]
As a [USER_TYPE], I want to [ACTION], so that [BENEFIT].
[DETAILED_WORKFLOW]

## Spec Scope
1. **[FEATURE]** - [ONE_SENTENCE]
2. **[FEATURE]** - [ONE_SENTENCE]

## Out of Scope
- [EXCLUDED_1]
- [EXCLUDED_2]

## Expected Deliverable
1. [TESTABLE_OUTCOME_1]
2. [TESTABLE_OUTCOME_2]
```

### Step 9: Create spec-lite.md

**Subagent**: file-creator

File: `{AGENT_OS_ROOT}/.agent-os/specs/YYYY-MM-DD-spec-name/spec-lite.md`

```markdown
# Spec Summary (Lite)

[1-3 sentences summarizing goal and objective]
```

Example: "Implement secure password reset via email verification to reduce support tickets and enable self-service account recovery. Users can request reset link, receive time-limited token via email, and set new password following security best practices."

### Step 9.5: Create UX/UI Spec (Conditional)

**Subagent**: file-creator

**Condition**: `IF spec_requires_frontend_or_ui`

File: `{AGENT_OS_ROOT}/.agent-os/specs/YYYY-MM-DD-spec-name/sub-specs/ux-ui-spec.md`

**⚠️ CRITICAL**: Architecture-first approach. Specifying components WITHOUT navigation = unusable feature.

**Template**: `@.agent-os/instructions/utilities/ux-ui-specification-checklist.md`

#### Phase 1: Application Architecture (REQUIRED FIRST)

**1.1 Feature Classification**
```
**Feature Type**: [FULL_STACK | FRONTEND_ONLY | BACKEND_ONLY]
**Frontend Required**: [YES | NO]
**Backend Required**: [YES | NO]
**Justification**: [why]
```

**1.2 Route Structure**
```
/route-path-1                → [Page] - [Purpose]
/route-path-2/:id            → [Page] - [Purpose]

**Integration**: [how integrates with existing nav]
**Parent Route**: [if nested]
**Guards**: [auth requirements]

❌ NEVER: "Routes (TBD)"
✅ ALWAYS: Explicit list with exact paths
```

**1.3 Global Layout Integration**
```
**Strategy**: [NEW_LAYOUT | EXTEND_EXISTING | USE_EXISTING]

IF NEW_LAYOUT:
┌─────────────────────────────────┐
│ Header: [HEIGHT] [STICKY] [CONTENTS] │
├──────────┬──────────────────────┤
│ Sidebar  │ Main Content         │
│ [WIDTH]  │ [MAX-WIDTH] [SCROLL] │
└──────────┴──────────────────────┘

**Components**:
- [FILE_PATH]: [Component] - [Purpose]

IF EXTEND_EXISTING:
- Existing: [FILE_PATH]
- Modifications: [changes]
- New: [FILE_PATHs]

IF USE_EXISTING:
- Existing: [FILE_PATH]
- No changes

❌ NEVER: "Layout (TBD)"
✅ ALWAYS: Explicit decision with paths
```

**1.4 Navigation Structure**
```
**Primary Nav**: [HOW_FEATURE_APPEARS]
**Component**: [FILE_PATH]

**Items to Add/Modify**:
- **[Label]**: [Route] - [Icon] - [Position]

**Active State**: [ROUTER_HOOK | MANUAL_STATE]
**Mobile**: [HAMBURGER | BOTTOM_TABS | COLLAPSIBLE]
  - Breakpoint: [PIXELS]
  - Component: [FILE_PATH]

**Breadcrumbs** (if applicable):
- Pattern: [HOME > SECTION > PAGE]
- Generation: [AUTO | MANUAL]
- Component: [FILE_PATH]

**Entry Points**:
1. [Entry Point 1]: [How accessed] - [From where]
2. [Entry Point 2]: [Alternative]

❌ NEVER: "Navigation (TBD)"
✅ ALWAYS: Explicit items with labels/routes/positioning
```

**1.5 User Flow Architecture**
```
#### Flow 1: [NAME]
1. **Start**: [PAGE] at [ROUTE]
2. **Trigger**: [ACTION] - Click "[TEXT]" ([COMPONENT])
3. **Navigation**: Navigate to [ROUTE] or [MODAL]
4. **Page Loads**: [COMPONENT] renders with [DATA]
5. **User Interaction**: [WHAT_USER_DOES]
6. **Validation**: [CLIENT_SIDE_APPROACH]
7. **Submit**: [WHAT_HAPPENS] - [API_CALL]
8. **Success**:
   - Notification: [TOAST/ALERT] with "[MESSAGE]"
   - Navigation: [WHERE_NEXT]
   - UI Update: [WHAT_CHANGES]
9. **Error**:
   - Display: [HOW_SHOWN]
   - Form State: [PRESERVED | CLEARED]
   - Recovery: [CAN_RETRY | MUST_START_OVER]

❌ NEVER: "User clicks somewhere"
✅ ALWAYS: Step-by-step with exact components/routes/states
```

#### Phase 2: Layout Systems (REQUIRED SECOND)

**2.1 Container Specifications**
```tsx
<div className="max-w-[MAX] mx-auto px-[MOBILE] md:px-[TABLET] lg:px-[DESKTOP] py-[MOBILE] md:py-[TABLET] lg:py-[DESKTOP]">
```

| Breakpoint | H Padding | V Padding | Max Width | Tailwind |
|------------|-----------|-----------|-----------|----------|
| Mobile (<768) | [PX] | [PX] | [VALUE] | px-[X] py-[Y] |
| Tablet (768-1023) | [PX] | [PX] | [VALUE] | md:px-[X] md:py-[Y] |
| Desktop (≥1024) | [PX] | [PX] | [VALUE] | lg:px-[X] lg:py-[Y] max-w-[X] |

❌ NEVER: "Card padding: 20px" (no responsive/classes)
✅ ALWAYS: Full responsive spec with Tailwind
```

**2.2 Spacing System**

| Context | Desktop | Tablet | Mobile | Tailwind | Use Case |
|---------|---------|--------|--------|----------|----------|
| Page container H | [PX] | [PX] | [PX] | px-[X] md:px-[Y] | Outer margins |
| Page container V | [PX] | [PX] | [PX] | py-[X] md:py-[Y] | Top/bottom |
| Section spacing | [PX] | [PX] | [PX] | space-y-[X] md:space-y-[Y] | Between sections |
| Card padding | [PX] | [PX] | [PX] | p-[X] md:p-[Y] | Internal |
| Card grid gaps | [PX] | [PX] | [PX] | gap-[X] md:gap-[Y] | Between cards |

**2.3 Typography System**

**H1 - Page Title**
```tsx
<h1 className="text-[SIZE] font-[WEIGHT] leading-[HEIGHT] text-gray-900 dark:text-gray-50">
```
- Size: [PX] ([REM])
- Weight: [NUMBER] ([NAME])
- Line Height: [VALUE]
- Use: Once per page
- Spacing After: [PX] (`mb-[X]`)

**H2 - Section Header**
- Size: [PX] ([REM])
- Weight: [NUMBER] ([NAME])
- Use: Major sections
- Spacing After: [PX] (`mb-[X]`)

**H3 - Subsection/Card**
- Size: [PX] ([REM])
- Weight: [NUMBER] ([NAME])
- Use: Cards, dialogs, subsections
- Spacing After: [PX] (`mb-[X]`)

**Body - Default**
```tsx
<p className="text-[SIZE] leading-[HEIGHT] text-gray-700 dark:text-gray-300">
```

**Body - Small**
```tsx
<p className="text-[SIZE] leading-[HEIGHT] text-gray-600 dark:text-gray-400">
```
- Use: Timestamps, metadata, auxiliary

**Hierarchy Rules**:
1. H1 largest - immediate focal point
2. H2 creates content blocks - [SPACING] before
3. H3 stands out - min [SPACING] after
4. Body comfortable reading line-height ([VALUE])
5. Metadata de-emphasized via size AND color

**2.4 Page Layout Patterns**

For each page:

```
#### [PAGE_NAME] Layout ([ROUTE])

**Pattern**: [Dashboard Grid | Form Centered | List + Detail | Master-Detail | Wizard]

**Structure**:
┌─────────────────────────────┐
│ Header ([H1] [Actions])     │
├─────────────────────────────┤
│ Main Content                │
│ - [GRID/FLEX]: [SPECS]      │
│ - [RESPONSIVE]              │
│                             │
│ Sidebar (if applicable):   │
│ - Width: [VALUE]            │
└─────────────────────────────┘

**Component Hierarchy**:
[PageComponent] ([FILE_PATH])
├── [PageHeader] ([FILE_PATH])
│   ├── [Breadcrumbs]
│   ├── [H1 Title]
│   └── [ActionButtons]
├── [MainContent] ([GRID/FLEX])
│   ├── [Component1] ([FILE_PATH])
│   └── [Component2] ([FILE_PATH])
└── [Sidebar] ([FILE_PATH])

**Responsive**:
- Desktop (≥1024): [3-col grid, full sidebar]
- Tablet (768-1023): [2-col, collapsible sidebar]
- Mobile (<768): [Single col, drawer]

**Implementation**:
```tsx
<div className="[CONTAINER_CLASSES]">
  <header className="[HEADER_CLASSES]">
    <h1 className="[H1_CLASSES]">[Title]</h1>
    <div className="[ACTIONS_CLASSES]">
      {/* Actions */}
    </div>
  </header>
  <div className="[LAYOUT_CLASSES]">
    {/* Content */}
  </div>
</div>
```

#### Phase 3: Component Patterns (REQUIRED THIRD)

**3.1 Component Library Strategy**

**Library**: [NAME | Custom]

**IF using library**:

| Component | Import | Purpose | Variants | Props | Usage |
|-----------|--------|---------|----------|-------|-------|
| Button | `import { Button } from '[PATH]'` | [purpose] | primary, secondary, destructive | variant, size, disabled, loading | form submit, actions |
| Card | `import { Card, CardHeader } from '[PATH]'` | [purpose] | - | className | content grouping |

**Example**:
```tsx
<Button variant="primary" size="md" onClick={handleSubmit}>
  Submit
</Button>
```

**Custom Components** (built on library):
- **[NAME]**: Combines [base] for [purpose]
  - Built from: [COMPONENTS]
  - Purpose: [USE_CASE]
  - File: [PATH]
  - Props: [PROPS]

**IF custom**:

**Base Primitives**:

**Button** ([FILE_PATH]):
- Props: variant, size, disabled, loading, onClick, children
- States:
  - Default: [STYLES with Tailwind]
  - Hover: [HOVER]
  - Active: [ACTIVE]
  - Disabled: [DISABLED]
  - Loading: [LOADING with spinner]
- Implementation:
```tsx
export function Button({ variant, size, disabled, loading, onClick, children }: ButtonProps) {
  return (
    <button
      className={cn(
        'base-classes',
        variant === 'primary' && 'primary-classes',
        disabled && 'disabled-classes'
      )}
      onClick={onClick}
      disabled={disabled || loading}
    >
      {loading && <Spinner className="mr-2" />}
      {children}
    </button>
  )
}
```

[Continue for Card, Modal, Form components]

**Styling**: [CSS Modules | Tailwind | Styled Components | CSS-in-JS]

**3.2 Component Specifications**

For EACH component:

```
#### [COMPONENT_NAME] (e.g., TemplateCard)

**Purpose**: [User problem solved]
**File**: [FILE_PATH]

**Props**:
```typescript
interface [Name]Props {
  prop1: type
  prop2: type
  onAction?: () => void
}
```

**Structure & Spacing**:
```tsx
<Card className="p-[VALUE] space-y-[VALUE]">
  <CardHeader className="pb-[VALUE] border-b border-gray-[VALUE]">
    <CardTitle className="[TYPOGRAPHY]">[Title]</CardTitle>
    <div className="flex gap-[VALUE] text-[SIZE]">
      [Metadata]
    </div>
  </CardHeader>
  <CardContent className="pt-[VALUE] space-y-[VALUE]">
    <p className="[TYPOGRAPHY] line-clamp-[VALUE]">[Description]</p>
  </CardContent>
  <CardFooter className="pt-[VALUE] border-t flex justify-between">
    <div className="flex gap-[VALUE]">[Actions]</div>
    <p className="text-[SIZE] text-gray-[VALUE]">[Timestamp]</p>
  </CardFooter>
</Card>
```

**Spacing Breakdown**:
- Card padding: [PX] (`p-[VALUE]`)
- Header bottom: [PX] (`pb-[VALUE]`) + border
- Title to metadata: [PX] (`space-y-[VALUE]`)
- Content top/bottom: [PX] (`pt-[VALUE]`, `pb-[VALUE]`)
- Actions gap: [PX] (`gap-[VALUE]`)

**State Variations**:
- Default: [BASE]
- Hover: `hover:shadow-md hover:-translate-y-0.5 transition-all duration-150`
- Active: [ACTIVE]
- Disabled: `opacity-50 cursor-not-allowed`
- Loading: [SKELETON/SPINNER]
- Error: `border-red-500 bg-red-50`
- Empty: [EMPTY_STATE]

**Responsive**:
- Desktop: [FULL_SPEC]
- Tablet: [ADJUSTMENTS]
- Mobile: [MOBILE_LAYOUT]

**Accessibility**:
- ARIA: [LABELS]
- Keyboard: [TAB_ORDER, ENTER]
- Screen reader: [ANNOUNCEMENTS]
- Focus: [FOCUS_RING]

**Integration**:
```tsx
// In TemplateLibraryPage
<div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
  {templates.map(t => (
    <TemplateCard
      key={t.id}
      title={t.title}
      onUse={() => handleUse(t.id)}
    />
  ))}
</div>
```

❌ NEVER: "Card with padding and title"
✅ ALWAYS: Complete spec with markup, spacing, states, responsive, a11y, integration

[Repeat for EVERY component]

#### Phase 4: Interaction Patterns (REQUIRED LAST)

**4.1 Interactive States**

**Hover**:
- Buttons: `hover:bg-[COLOR] hover:shadow-md transition-colors duration-150`
- Cards: `hover:shadow-lg hover:-translate-y-1 transition-all duration-200`
- Links: `hover:text-[COLOR] hover:underline transition-colors duration-100`

**Active**:
- Buttons: `active:scale-95 transition-transform duration-75`
- Cards: `active:shadow-sm active:translate-y-0 transition-all duration-75`

**Focus** (WCAG 2.1 AA):
- All interactive: `focus:outline-none focus:ring-2 focus:ring-[COLOR] focus:ring-offset-2`
- Keyboard: Tab order follows visual hierarchy

**Loading**:
- Buttons: [SPINNER, disabled]
- Pages: [SKELETON/SPINNER]
- Components: [SHIMMER/PULSE]

**Error**:
- Fields: `border-red-500 text-red-900 placeholder-red-300 focus:ring-red-500`
- Inline: `text-sm text-red-600 mt-1`
- Banners: [ALERT with error styling]

**Empty**:
- Lists: [ILLUSTRATION, HEADING, DESCRIPTION, CTA]
- Search: [MESSAGE, SUGGESTIONS, CLEAR_BUTTON]
- First-time: [ONBOARDING, TUTORIAL_LINK]

**4.2 Animations**

**Page Transitions**:
- Route changes: [FADE/SLIDE/NONE]
- Duration: [MS]
- Easing: [EASE_IN_OUT/LINEAR/CUBIC_BEZIER]

**Component Animations**:
- Modal: `transition-opacity duration-300 ease-in-out` + `transition-transform duration-300`
- Dropdown: `transition-all duration-200 ease-out`
- Toast: Slide from [TOP_RIGHT/BOTTOM_RIGHT], fade after [SECONDS]

**Micro-interactions**:
- Button press: `active:scale-95`
- Card hover: `hover:-translate-y-1` + shadow
- Checkbox: [ANIMATION 150ms]
- Spinner: [ROTATION infinite]

**Performance**:
- GPU: Use `transform`/`opacity` (not `top`/`left`/`width`/`height`)
- Will-change: Sparingly on frequently animated
- Reduced motion: Respect `prefers-reduced-motion`

**4.3 Form Validation**

**Approach**: [Zod | Yup | CUSTOM]

**Timing**:
- On blur: Validate when user leaves field
- On submit: Validate entire form
- Real-time (optional): Password strength, username availability

**Error Display**:
- Inline: Below each invalid field
- Summary: Top of form if multiple errors
- Highlighting: Red border on invalid

**Success**:
- Toast: "[ACTION] successful" with checkmark
- Redirect: Navigate to [PAGE] after [DELAY]
- UI update: Show created/updated item immediately

**Validation Gates** (BEFORE next step):

✅ **Phase 1**:
- [ ] All routes explicit (no "TBD")
- [ ] Navigation fully specified (no "if exists")
- [ ] Layout integration defined (NEW|EXTEND|USE)
- [ ] User entry points identified
- [ ] User flows step-by-step

✅ **Phase 2**:
- [ ] Container specs with responsive
- [ ] Spacing usage matrix with Tailwind
- [ ] Typography with hierarchy rules
- [ ] Page layouts with component hierarchy

✅ **Phase 3**:
- [ ] Component library strategy
- [ ] All components: markup, spacing, states
- [ ] Accessibility for each
- [ ] Integration examples

✅ **Phase 4**:
- [ ] Interactive states (hover, active, focus, loading, error, empty)
- [ ] Animations/transitions
- [ ] Form validation/feedback

✅ **Code Readiness**:
**Question**: "Can developer implement without ANY questions?"
- [ ] No ambiguity
- [ ] No missing architectural decisions
- [ ] No conditional language for core ("if exists", "TBD")
- [ ] Complete code examples with Tailwind

**IF developer would ask questions: INCOMPLETE**

**Anti-Patterns**:

❌ NEVER:
1. "If Exists" language ("Layout (TBD)", "Routes (if needed)")
2. Pixels without Tailwind ("padding: 20px" vs "p-5")
3. Missing responsive ("width: 1200px" vs "mobile 100%, desktop 1200px")
4. Vague components ("Use card" vs [full spec])
5. Polish before foundation (Day 1: animations, Day 8: realize no nav)

✅ ALWAYS:
1. Explicit architectural decisions
2. Responsive with Tailwind classes
3. Complete component specs
4. Foundation → Components → Polish

**Success Indicators**:
- ✅ Zero clarification questions during implementation
- ✅ All architectural decisions explicit
- ✅ Complete code examples
- ✅ Usage matrices for design tokens
- ✅ Passed Code Readiness Test

**Failed Indicators**:
- ❌ "How should I..." questions
- ❌ "if exists", "TBD", "optional" for core
- ❌ Missing navigation/routing
- ❌ Pixels without Tailwind
- ❌ Ambiguous layout/spacing

### Step 10: Create Technical Spec

**Subagent**: file-creator

File: `{AGENT_OS_ROOT}/.agent-os/specs/YYYY-MM-DD-spec-name/sub-specs/technical-spec.md`

```markdown
# Technical Specification

## Feature Classification

**Feature Type**: [BACKEND_ONLY | FRONTEND_ONLY | FULL_STACK]
**Frontend Required**: [YES | NO]
**Backend Required**: [YES | NO]
**Justification**: [why]

---

## Frontend Implementation (if applicable)

### UI Components

#### **[COMPONENT_1]**
- Type: [Page | Form | Modal | Card | List]
- Purpose: [User problem solved]
- Interactions: [Click, submit, select]
- State: [Local | Global | API]
- Routing: [URL path]

### Frontend State Management

**Pattern**: [Context API | Pinia | Zustand | Redux]

**Stores**:
- **[STORE]**: [What manages]
  - Shape: [TypeScript interface/JSON]
  - Actions: [List]
  - Computed: [Derived state]

### Frontend Routing

**Routes**:
- **[PATH]**: [Component] - [Purpose]

**Guards**: [Auth/authz requirements]

### UI Specifications

**Design**:
- Responsive: [mobile, tablet, desktop]
- Accessibility: [WCAG 2.1 AA]
- Loading: [How show async]
- Error: [How display errors]
- Empty: [What when no data]

**Form Validations** (if applicable):
- **[FIELD]**: [Rules]

### Component Architecture

**Strategy**: {DETECTED_FROM_TECH_STACK}

{IF component_library in tech_stack}
**Library**: {NAME} ({VERSION})

**Components to Use**:
- **{COMPONENT}** (`{IMPORT}`): {PURPOSE}
  - Usage: {USE_CASES}
  - Variants: {VARIANTS}
  - Props: {KEY_PROPS}

**Custom** (built on library):
- **{CUSTOM}**: Combines {base} for {purpose}
  - Built from: {COMPONENTS}
  - Purpose: {USE_CASE}
  - Props: {PROPS}

{ELSE}
**Library**: None (custom)

**Base Primitives**:
- **Button**: Reusable button
  - Props: variant, size, disabled, loading, onClick
  - Styling: {CSS_APPROACH}
  - States: default, hover, active, disabled, loading

- **Card**: Container for grouping
  - Props: title, children, actions, footer
  - Styling: {CSS_APPROACH}

- **Modal**: Overlay dialog
  - Props: isOpen, onClose, title, children
  - Implementation: Portal with backdrop

- **Form**: Input, Select, Checkbox, Radio, Textarea
  - Validation: {LIBRARY_OR_CUSTOM}
  - Error handling: {APPROACH}

**Custom Complex**:
- **{COMPONENT}**: {DESCRIPTION}
  - Built from: {PRIMITIVES}
  - Purpose: {USE_CASE}
{ENDIF}

### Page Layout Architecture

**Approach**: {DETECTED_FROM_TECH_STACK}

**Global Layout**:
```
┌─────────────────────────┐
│  Header (h-{HEIGHT})    │
├──────┬──────────────────┤
│{NAV} │  Main Content    │
└──────┴──────────────────┘
```

**Implementation**:
{IF library_has_layout}
- Using: {LIBRARY_LAYOUT_COMPONENTS}
- Grid: {CONFIGURATION}
- Breakpoints: {RESPONSIVE}
{ELSE}
- Using: CSS Grid for page, Flexbox for components
- Grid: {COLUMNS, GAP, RESPONSIVE}
- Breakpoints: {from tech-stack or 640px, 1024px}
{ENDIF}

**Page-Specific**:

#### {PAGE} Layout
- Pattern: [Dashboard Grid | Form Centered | List+Detail | Master-Detail | Wizard]
- Structure:
  ```
  - Header: {BREADCRUMBS, TITLE, ACTIONS}
  - Main: {PRIMARY_SECTIONS}
  - Sidebar: {FILTERS, METADATA} (if applicable)
  ```
- Responsive:
  - Desktop (≥1024): {3-col, full sidebar}
  - Tablet (640-1024): {2-col, collapsible sidebar}
  - Mobile (<640): {Single col, drawer}

**Component Hierarchy**:
```
{PageComponent}
├── {HeaderComponent}
│   ├── {Breadcrumbs}
│   ├── {PageTitle}
│   └── {ActionButtons}
├── {MainContent}
│   ├── {Component1}
│   └── {Component2}
└── {Sidebar}
```

### Navigation Architecture

**Pattern**: {DETECTED or Hybrid}

**Structure**:
```
{Primary Nav}
├── {Route1} ({PATH})
├── {Route2} ({PATH})
│   ├── {SubRoute1}
│   └── {SubRoute2}
└── {UserMenu}
```

**Implementation**:
{IF library_has_nav}
- Primary: {LIBRARY_NAV_COMPONENT}
- Mobile: {LIBRARY_MOBILE_MENU}
- Breadcrumbs: {LIBRARY_BREADCRUMB}
- User Menu: {LIBRARY_DROPDOWN}
{ELSE}
- Primary: Custom {NavSidebar | NavBar}
  - Structure: {DESCRIPTION}
  - Styling: {CSS_APPROACH}
  - Mobile: {DRAWER/OVERLAY}
- Breadcrumbs: Custom
  - Generation: {AUTO | MANUAL}
- User Menu: Custom dropdown
  - Trigger: {AVATAR_CLICK | USERNAME_CLICK}
{ENDIF}

**Components**:

{IF sidebar_nav}
- **{MainNav}**: Sidebar
  - Position: {fixed-left | sticky}
  - Width: {240px desktop, full mobile overlay}
  - Active: {HIGHLIGHT_APPROACH}
  - Collapsible: {YES/NO}
  - Mobile: {OVERLAY_DRAWER}
{ENDIF}

{IF top_bar}
- **{TopNav}**: Horizontal bar
  - Layout: {FLEX_DESCRIPTION}
  - Sticky: {YES/NO}
  - Mobile: {HAMBURGER | STACK}
{ENDIF}

- **{Breadcrumbs}**: On {all | specific}
  - Pattern: {Home > Section > Page}
  - Implementation: {LIBRARY | CUSTOM}

- **{UserMenu}**: Account dropdown
  - Location: {top-right}
  - Trigger: {INTERACTION}
  - Items: {LIST}

**State**:
- Active Route: {ROUTER_HOOK | MANUAL}
- Mobile Menu: {LOCAL | GLOBAL}
- Breadcrumb Data: {AUTO | MANUAL}

### User Flow & Interaction

**Primary Flows**:

#### Flow {N}: {NAME}
1. **Start**: {PAGE}
2. **Trigger**: {ACTION} - Click "{TEXT}" ({COMPONENT from library/custom})
3. **Action**: {WHAT_HAPPENS}
   - {IF nav}: Navigate to {ROUTE}
   - {IF modal}: Open {MODAL}
   - {IF state}: Update {STATE}
4. **Loads**: {COMPONENT} renders
   - Uses {FORM/DISPLAY_COMPONENTS}
   - Validation: {APPROACH}
   - Loading: {INDICATOR}
5. **Interaction**: {WHAT_USER_DOES}
   - Real-time: {VALIDATION, SUGGESTIONS}
   - Errors: {HOW_DISPLAYED}
6. **Submit**: {FINAL_ACTION}
   - Loading: {BUTTON_SPINNER, OVERLAY}
   - API: {METHOD} {ENDPOINT}
7. **Success**:
   - Notification: {TOAST/ALERT from library/custom}
   - Navigation: {WHERE}
   - UI: {CHANGES}
8. **Error**:
   - Display: {COMPONENT_LOCATION}
   - Form: {PRESERVED | CLEARED}
   - Recovery: {WHAT_USER_CAN_DO}

**Component Interaction**:

- **{PATTERN}** (Master-Detail, Modal Workflow, etc):
  - {COMPONENT_A} (using {LIBRARY or custom}) →
  - User: {CLICK, SELECT} →
  - {COMPONENT_B} {displays, updates, navigates}
  - State: {HOW_COMMUNICATE}
  - Data: {COMPONENT_A → STATE → COMPONENT_B}

**Form Submission** (standardized):
1. User fills ({FORM_IMPLEMENTATION: library/custom})
2. Client validation: {LIBRARY and APPROACH}
3. Submit button: {LOADING_STATE}
4. API: {METHOD} {ENDPOINT}
5. Success: {NOTIFICATION} + {NAVIGATION/UPDATE}
6. Error: {ERROR_DISPLAY} + {FORM_HANDLING}

### Component Integration Map

**How Components Work Together**:

#### {FEATURE} Integration
```
User Action: {INITIAL}
↓
{PAGE_COMPONENT} {WHAT_DOES}
↓
Data flows:
  ├→ {CHILD_1} (receives {DATA})
  ├→ {CHILD_2} (receives {DATA})
  └→ {CHILD_3} (receives {DATA})
↓
User interacts: {INTERACTION}
↓
{RESULTING_ACTION}
```

#### Page → Container → Presentational
```
{PageComponent} (manages routing, fetches data)
  ↓ passes data props
{ContainerComponent} (manages state, handles events)
  ↓ passes data + handlers
{PresentationalComponent} (displays only, emits events)
  ↑ emits interaction events
{ContainerComponent} (handles events, updates state/calls API)
  ↑ updates page state
{PageComponent}
```

**State Flow**:
- **Global** ({STATE_SOLUTION}):
  - Auth, user prefs, theme
  - Accessed: {HOW}

- **Shared** (props/context):
  - {PARENT} manages
  - Passes to: {CHILDREN}

- **API Data**:
  - Fetched: {WHERE}
  - Cached: {STRATEGY}
  - Shared: {METHOD}

---

## Backend Implementation (if applicable)

### API Endpoints

#### **[METHOD] [ENDPOINT]**

**Purpose**: [What does]
**Authentication**: [Required | Public]
**Authorization**: [Role requirements]

**Request**:
```typescript
interface RequestBody {
  field1: string
  field2: number
}
interface QueryParams {
  param1?: string
}
```

**Response**:
```typescript
interface SuccessResponse {
  success: true
  data: { /* shape */ }
}
interface ErrorResponse {
  success: false
  error: {
    code: string
    message: string
  }
}
```

**Status Codes**:
- 200: Success
- 400: Validation error
- 401: Unauthorized
- 403: Forbidden
- 500: Server error

### Business Logic

**Core Rules**:
1. [Rule 1]
2. [Rule 2]

**Validation**:
- Server-side: [What validate]
- Data Integrity: [Uniqueness, referential integrity]
- Business Constraints: [Domain rules]

**Service Layer**:
- **[SERVICE]**: [Responsibility]
  - Methods: [List]
  - Dependencies: [What depends on]

### Database Schema

**Tables/Collections**:

#### **[TABLE]**
```sql
CREATE TABLE table_name (
  id UUID PRIMARY KEY,
  field1 VARCHAR(255) NOT NULL,
  field2 INTEGER,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);
CREATE INDEX idx_field1 ON table_name(field1);
```

**Relationships**: [Description]
**Migrations**: [What migrations needed]

---

## Frontend-Backend Integration (if full-stack)

### API Contract

**Owner**: Backend provides, Frontend consumes

**Type Sharing**:
- [Shared TypeScript package]
- [OpenAPI/Swagger codegen]
- [Manual definitions]

**Data Flow**:
1. User action in Frontend →
2. API call to Backend →
3. Backend processes/responds →
4. Frontend updates UI

### Integration Points

**Frontend Calls Backend For**:
- [User action] → [API endpoint]

**Error Handling**:
- Network: [How frontend handles failures]
- Validation: [How backend errors displayed]
- Auth: [Redirect to login, token refresh]

### Testing Strategy

**Frontend**:
- Unit: components
- Integration: state management
- Mock: backend API responses

**Backend**:
- Unit: business logic
- Integration: API endpoints
- Database: integration tests

**E2E**:
- Full workflows UI → DB
- Critical path scenarios
- Error handling scenarios

---

## Implementation Architecture

### Component Structure

#### **[PRIMARY_COMPONENT]**
- Responsibilities: [LIST]
- Implementation: [APPROACH]
- Dependencies: [LIST]
- Interfaces: [CONTRACTS]

### Data Flow

1. **[STEP_1]**: [DETAILS] →
2. **[STEP_2]**: [DETAILS] →
3. **[STEP_3]**: [DETAILS]

### State Management

**Pattern**: [PATTERN]
**Implementation**: [DETAILS]

**Stores**:
- **[STORE_1]**: [STRUCTURE]
- **[STORE_2]**: [STRUCTURE]

### Error Handling

**Strategy**: [STRATEGY]

**Scenarios**:
- **[SCENARIO_1]**: [HANDLING]
- **[SCENARIO_2]**: [HANDLING]

**Format**:
```json
{
  "success": false,
  "error": {
    "code": "[CODE]",
    "message": "[USER_FRIENDLY]",
    "details": "[TECHNICAL]",
    "timestamp": "[ISO]"
  }
}
```

## Integration Points

### Existing Code Dependencies

#### **[DEPENDENCY_1]**
- Purpose: [WHY]
- Interface: [REQUIREMENTS]
- Data exchange: [DETAILS]
- Error handling: [APPROACH]

### API Contracts

#### **[METHOD] [ENDPOINT]**

**Purpose**: [WHAT]

**Request**:
```json
{
  "[FIELD_1]": "[TYPE_1]",
  "[FIELD_2]": "[TYPE_2]"
}
```

**Response**:
```json
{
  "[FIELD_1]": "[TYPE_1]"
}
```

**Errors**: [DETAILS]

### Database Interactions

#### **[TABLE]**

**Operations**: [LIST]

**Queries**:
- **[QUERY_1]**: [IMPLEMENTATION]

**Indexes**: [LIST]
**Constraints**: [LIST]

### External Services

#### **[SERVICE]**

**Protocol**: [PROTOCOL]
**Authentication**: [METHOD]

**Endpoints**:
- **[ENDPOINT_1]**: [USAGE]

**Rate Limiting**: [LIMITS]
**Error Handling**: [APPROACH]
**Timeout**: [SETTINGS]

## Implementation Patterns

### Design Patterns

**Primary**:
- **[PATTERN]**: [USAGE_GUIDANCE]

**Rationale**: [JUSTIFICATION]

### Code Organization

```
[ROOT]/
├── src/
│   ├── components/
│   │   └── [FEATURE_COMPONENTS]/
│   ├── services/
│   │   └── [FEATURE_SERVICES]/
│   ├── utils/
│   │   └── [FEATURE_UTILITIES]/
│   ├── types/
│   │   └── [FEATURE_TYPES]/
│   └── tests/
│       └── [FEATURE_TESTS]/
└── docs/
    └── [FEATURE_DOCS]/
```

**Guidelines**:
- Components: [STRUCTURE]
- Services: [STRUCTURE]
- Utilities: [STRUCTURE]
- Tests: [STRUCTURE]

### Naming Conventions

- Components: [PATTERN]
- Services: [PATTERN]
- Utilities: [PATTERN]
- Types: [PATTERN]
- Constants: [PATTERN]

**Variables**:
- Functions: [CONVENTION]
- Variables: [CONVENTION]
- Methods: [CONVENTION]

### Coding Standards

Reference: `@.agent-os/standards/best-practices.md`

**Key Standards**:
- Indentation: 2 spaces (never tabs)
- Line length: Max 100 chars
- Comments: Explain "why" not "what"
- Error handling: Always include proper handling
- Type safety: Use TypeScript where applicable

**Quality**:
- Test coverage: Min 80% for new code
- Documentation: All public APIs documented
- Performance: [STANDARDS]
- Security: [STANDARDS]

## Performance Criteria

### Response Time

**Target**: [TIME]
**Measurement**: [POINTS]
**Optimization**: [STRATEGIES]

### Throughput

**Target**: [THROUGHPUT]
**Load Testing**: [SCENARIOS]
**Scalability**: [REQUIREMENTS]

### Concurrency

**Concurrent Users**: [LIMIT]
**Resource Management**: [STRATEGY]
**Bottleneck Prevention**: [MEASURES]

## Security Requirements

### Authentication

**Method**: [METHOD]
**Token Management**: [STRATEGY]
**Session Handling**: [APPROACH]

### Authorization

**Model**: [MODEL]
**Permission Validation**: [STRATEGY]
**Access Control**: [IMPLEMENTATION]

### Data Protection

**Encryption**: [STANDARD]
**Data at Rest**: [PROTECTION]
**Data in Transit**: [PROTECTION]
**Sensitive Data**: [HANDLING]

### Input Validation

**Approach**: [APPROACH]
**Sanitization**: [RULES]
**Injection Prevention**: [MEASURES]

## Quality Validation

### Technical Depth

- Implementation Readiness: Sufficient detail for immediate implementation
- Technical Accuracy: Validated for accuracy/feasibility
- Completeness: All required details present

### Integration

- Compatibility: Compatible with existing codebase/architecture
- Dependencies: All identified, integration points defined
- API Contracts: Consistent and complete

### Performance

- Benchmarks: Measurable and achievable
- Resources: Validated requirements/optimizations
- Scalability: Realistic and well-defined

### Security

- Standards Compliance: Verified
- Vulnerability Assessment: Identified/addressed
- Auth/Authz: Secure implementation

## Technical Requirements

- [REQUIREMENT_1]
- [REQUIREMENT_2]

## External Dependencies (Conditional)

[ONLY_IF_NEW_DEPENDENCIES]
- **[LIBRARY]** - [PURPOSE]
- Justification: [REASON]
- Version: [SPECIFICATIONS]
```

### Step 10.1-10.5: Create Sub-Specs

**Subagent**: file-creator

**10.1 Implementation Guide**
- Template: `@.agent-os/templates/spec-templates/implementation-guide-template.md`
- File: `sub-specs/implementation-guide.md`
- Content: Development approach, architecture overview, implementation strategy, development workflow, QA

**10.2 Testing Strategy**
- Template: `@.agent-os/templates/spec-templates/testing-strategy-template.md`
- File: `sub-specs/testing-strategy.md`
- Content: Testing framework, test types, data management, CI

**10.3 Integration Requirements**
- Template: `@.agent-os/templates/spec-templates/integration-requirements-template.md`
- File: `sub-specs/integration-requirements.md`
- Content: System integration, API requirements, database integration, external services, compatibility

**10.4 Quality Gates**
- Template: `@.agent-os/templates/spec-templates/quality-gates-template.md`
- File: `sub-specs/quality-gates.md`
- Content: Quality metrics, validation criteria, automated checks, compliance

**10.5 Architecture Decisions**
- Template: `@.agent-os/templates/spec-templates/architecture-decisions-template.md`
- File: `sub-specs/architecture-decisions.md`
- Content: Decision records, technical constraints, design principles, technology choices

### Step 11: Create Database Schema (Conditional)

**Condition**: `IF spec_requires_database_changes`

File: `sub-specs/database-schema.md`

```markdown
# Database Schema

## Changes
- New tables
- New columns
- Modifications
- Migrations

## Specifications
- Exact SQL/migration syntax
- Indexes and constraints
- Foreign key relationships

## Rationale
- Reason for each change
- Performance considerations
- Data integrity rules
```

### Step 12: Create API Spec (Conditional)

**Condition**: `IF spec_requires_api_changes`

File: `sub-specs/api-spec.md`

```markdown
# API Specification

## Endpoints

### [METHOD] [PATH]

**Purpose**: [DESCRIPTION]
**Parameters**: [LIST]
**Response**: [FORMAT]
**Errors**: [POSSIBLE_ERRORS]

## Controllers
- Action names
- Business logic
- Error handling

## Purpose
- Endpoint rationale
- Integration with features
```

### Step 13: Enhanced User Review

```
Present comprehensive package:

**Core**:
- spec.md
- spec-lite.md

**Technical**:
- technical-spec.md
- implementation-guide.md
- testing-strategy.md
- integration-requirements.md
- quality-gates.md
- architecture-decisions.md

**Conditional**:
- database-schema.md (if created)
- api-spec.md (if created)

**Summary**:
- Total files: [COUNT]
- Implementation-ready: ✓
- Testing strategy: ✓
- Integration requirements: ✓
- Quality gates: ✓
- Architecture decisions: ✓

Please review. When ready, run /create-tasks.
```

**Validation** (before presenting):
- [ ] All 6 core files created
- [ ] Cross-file consistency
- [ ] Technical depth meets implementation-readiness
- [ ] Template variables substituted
- [ ] Quality gates defined

### Step 14: Specification Quality Validation

**Subagent**: quality-assurance

Execute QualityGateValidator system.

**Categories**:

| Category | Target | Validates |
|----------|--------|-----------|
| Completeness | ≥95% | All 8 core files, no placeholders |
| Technical Depth | ≥90% | Code examples, schemas, API endpoints |
| Implementation Readiness | ≥90% | File paths, functions, API endpoints, components |
| Documentation Quality | ≥85% | Content depth, examples, organization |
| Consistency | ≥95% | Cross-file spec name/date/references |
| Reference Format | ≥95% | `file_path:line_number` format compliance |

**Valid Reference Formats**:
- ✅ `src/models/user.rb:42`
- ✅ `app/controllers/auth.ts:105-120`
- ✅ `@.agent-os/standards/rails-patterns.md:250`
- ✅ `../lib/utils.ts:15`
- 🔴 `user.rb line 42` (use `:` not "line")
- 🔴 `auth_controller.ts` (missing line number)
- 🔴 `models/user.rb#42` (use `:` not `#`)

**Validation Flow**:
1. Load quality config (`.agent-os/quality-config.yml` or defaults)
2. Execute `QualityGateValidator.validateSpecification(specPath)`
3. Generate quality report with scores/recommendations
4. Enforce quality gates based on thresholds
5. Provide actionable recommendations

**Actions**:

**Pass** (≥90% overall, all category thresholds met):
```
✅ PROCEED to user review
📊 Display quality summary (Overall: [SCORE]%, Categories: [BREAKDOWN])
🎯 Status: "Meets all quality standards"
```

**Fail** (<90% overall OR critical threshold missed):
```
⚠️ Identify specific issues/gaps
🔧 Auto-correct minor issues (template vars, formatting)
📋 Escalate major issues for manual review
💡 Provide actionable recommendations
🔄 Retry validation after corrections
```

**Quality Report** includes:
- Overall score and status
- Category-by-category breakdown
- Specific issues with file locations
- Actionable recommendations by priority
- Before/after comparison if re-validated

**Integration**:
- Automatic validation before user review
- No additional user input for standard validation
- Present quality results with specification delivery

**Quality Improvement Loop**:
1. Present quality report with recommendations
2. Implement automatic fixes where possible
3. Request user guidance for complex improvements
4. Re-validate after improvements
5. Continue until quality gates satisfied

<post_flight_check>
  EXECUTE: @.agent-os/instructions/meta/post-flight.md
</post_flight_check>
