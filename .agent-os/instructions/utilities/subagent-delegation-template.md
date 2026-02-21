# Subagent Delegation Template

> **Version**: 2.0.0
> **Purpose**: Standard template for constructing Task() prompts when delegating work to subagents
> **Problem Solved**: Ensures mandatory instructions, skills, and context are passed to every subagent
> **v2.0 Addition**: Model-tier selection for cost optimization

## The Problem

When orchestrators delegate work to subagents via `Task(subagent_type: "general-purpose")`:
1. Mandatory instruction loading requirements are NOT automatically inherited
2. Skill invocations required by config.yml are NOT triggered
3. Global CLAUDE.md context is NOT passed
4. Pattern lookup hierarchy is NOT enforced

This template solves all of these gaps.

---

## Model-Tier Selection

Match agent model to role complexity for cost optimization:

| Role | Model | Rationale |
|------|-------|-----------|
| Orchestrator/Lead | `opus` | Strategic decisions, minimal context usage |
| PM (coordinator) | `opus` | Delegation judgment, complexity assessment |
| QC Reviewer | `opus` | Must catch subtle architectural/security issues |
| Implementation | `sonnet` | Competent, follows specs, cost-effective |
| Test writing | `sonnet` | Follows patterns, needs some judgment |
| File ops, refactors | `haiku` | Mechanical, explicit instructions, cheapest |

**Rules:**
- All QC must be done by an Opus agent that did NOT do the implementation
- PM work is also reviewed by a QC reviewer (no self-QC, ever)
- Haiku workers get explicit step-by-step instructions only, narrow scope
- When model is not specified, defaults to the caller's model (current behavior)

### Task Sizing Guidance

Each task should consume 60-70% of the executing agent's context window:
- **Under 60%**: Task may be too small, consider combining with related work
- **60-70%**: Target range, leaves room for instruction loading and reporting
- **Over 70%**: Risk of PreCompact during execution, split the task
- **Over 85%**: Must split, agent will likely hit context limits

---

## Quick Reference: Copy-Paste Template

```javascript
Task(subagent_type: "general-purpose",
     model: "{MODEL_TIER}",  // opus | sonnet | haiku - see Model-Tier Selection
     prompt: `
═══════════════════════════════════════════════════════════════════
MANDATORY INSTRUCTION LOADING - DO NOT SKIP
═══════════════════════════════════════════════════════════════════

BEFORE performing ANY work, you MUST:

1. READ the instruction file for your role:
   @.agent-os/instructions/agents/{AGENT_ROLE}.md

2. INTERNALIZE all protocols, especially:
   - Pre-creation checklists
   - Quality gates you must pass
   - File organization standards
   - CI/CD safety requirements

3. CONFIRM understanding by stating:
   "I have read {AGENT_ROLE}.md and will follow:
    - [Key constraint 1]
    - [Key constraint 2]
    - [Key constraint 3]"

4. PROCEED with task only AFTER confirmation

═══════════════════════════════════════════════════════════════════
MANDATORY SKILL INVOCATIONS
═══════════════════════════════════════════════════════════════════

{SKILL_INVOCATIONS_FOR_PHASE}

These are REQUIRED tool invocations, not optional guidance.
Do not proceed without invoking required skills first.

═══════════════════════════════════════════════════════════════════
PATTERN LOOKUP HIERARCHY (MANDATORY ORDER)
═══════════════════════════════════════════════════════════════════

FIRST:  Check .agent-os/patterns/ (project-specific, takes PRECEDENCE)
SECOND: Invoke skills listed above (generic patterns)
THIRD:  Use WebSearch/WebFetch as fallback only

Project-specific patterns OVERRIDE skill patterns where both exist.

═══════════════════════════════════════════════════════════════════
GLOBAL EXECUTION REQUIREMENTS
═══════════════════════════════════════════════════════════════════

From user's global CLAUDE.md:
- Verify everything: Never assume code works
- Monitor tests actively with aggressive timeouts
- Server management: Check if tests auto-start servers, kill conflicts

═══════════════════════════════════════════════════════════════════
PROGRESS COMMENTS (bd comment)
═══════════════════════════════════════════════════════════════════

Use bd comment to add timestamped progress updates to tasks:

FREQUENCY:
- Every 5-10 tool calls, add a progress comment
- Always comment on key milestones

WHEN TO COMMENT:
- At task start: bd comment ${TASK_ID} "Starting: reviewing requirements"
- During work: bd comment ${TASK_ID} "Progress: implemented X, moving to Y"
- On blockers: bd comment ${TASK_ID} "BLOCKED: [reason]"
- On breakthroughs: bd comment ${TASK_ID} "Breakthrough: [discovery]"
- At completion: bd comment ${TASK_ID} "Complete: all tests passing"

COMMENT CONTENT:
- Be specific about what was done and what's next
- Include file names or function names when relevant
- Note decisions made or deviations from plan
- Keep comments concise but informative

═══════════════════════════════════════════════════════════════════
AGENT STATE PROTOCOL
═══════════════════════════════════════════════════════════════════

AGENT_ID: {AGENT_ID}

ON START:
  bd agent state {AGENT_ID} working

DURING WORK (every 10 tool calls):
  bd agent heartbeat {AGENT_ID}

ON COMPLETE:
  bd agent state {AGENT_ID} done

ON STOP (checkpoint):
  bd agent state {AGENT_ID} stopped

═══════════════════════════════════════════════════════════════════
TASK ASSIGNMENT
═══════════════════════════════════════════════════════════════════

TASK: {TASK_TITLE}
BEADS_ID: {TASK_ID}
AGENT_ID: {AGENT_ID}
ROLE: {AGENT_ROLE}
PHASE: {PHASE_NAME}

{SPECIFIC_TASK_REQUIREMENTS}

DELIVERABLES:
{DELIVERABLES_LIST}

ACCEPTANCE CRITERIA:
{ACCEPTANCE_CRITERIA_LIST}
`)
```

---

## Skill Invocations by Phase

Use these blocks for `{SKILL_INVOCATIONS_FOR_PHASE}`:

### Test Context Gathering (Phase 2.0)

```
BEFORE fetching test documentation, you MUST READ:

1. instructions/agents/test-context-gatherer.md
   - Provides library detection patterns
   - Documents fallback priority for docs

2. standards/testing-standards.md
   - Provides Vitest patterns
   - Provides Playwright patterns
   - Provides Convex patterns

These are Priority 0 - check them BEFORE DocFork, Context7, or WebSearch.
```

### Test Design (Phase 2.1)

```
BEFORE designing tests, you MUST READ:

1. standards/testing-standards.md
   - Vitest patterns for unit tests
   - Playwright patterns for E2E tests
   - Test architecture strategies

2. instructions/agents/test-architect.md
   - Test design guidance
```

### Implementation (Phase 3.0)

```
BEFORE writing implementation code, you MUST READ:

1. standards/global/coding-style.md
   - Code conventions

2. instructions/agents/implementation-specialist.md
   - Implementation guidance
```

### Security Review (Phase 4.0)

```
BEFORE performing security review, you MUST READ:

1. instructions/agents/security-sentinel.md
   - Security review guidance
   - OWASP Top 10 patterns
```

### Spec Creation

```
BEFORE writing specifications, you MUST READ:

1. standards/testing-standards.md
   - Testing patterns for test plan sections
   - Coding style for implementation guidance

If building UI specifications with shadcn:
2. mcp__shadcn__list_components()
3. mcp__shadcn__get_component_demo(componentName) for each component
```

---

## Complete Examples

### Example 1: Delegating Test Context Gathering

```javascript
Task(subagent_type: "general-purpose",
     prompt: `
═══════════════════════════════════════════════════════════════════
MANDATORY INSTRUCTION LOADING - DO NOT SKIP
═══════════════════════════════════════════════════════════════════

BEFORE performing ANY work, you MUST:

1. READ the instruction file for your role:
   @.agent-os/instructions/agents/test-context-gatherer.md

2. INTERNALIZE all protocols, especially:
   - Library detection requirements
   - Documentation source priority
   - Pattern extraction methodology
   - Context file output format

3. CONFIRM understanding by stating:
   "I have read test-context-gatherer.md and will follow:
    - Library detection from package.json/pyproject.toml
    - Source priority: Skills > DocFork > Context7 > WebSearch
    - Output to .agent-os/test-context/{TASK_ID}.json"

4. PROCEED with task only AFTER confirmation

═══════════════════════════════════════════════════════════════════
MANDATORY FILE READS
═══════════════════════════════════════════════════════════════════

BEFORE fetching test documentation, you MUST READ:

1. instructions/agents/test-context-gatherer.md
   - Provides library detection patterns
   - Documents fallback priority for docs

2. standards/testing-standards.md
   - Provides Vitest patterns
   - Provides Playwright patterns
   - Provides Convex patterns

These are Priority 0 - check them BEFORE DocFork, Context7, or WebSearch.

═══════════════════════════════════════════════════════════════════
PATTERN LOOKUP HIERARCHY (MANDATORY ORDER)
═══════════════════════════════════════════════════════════════════

FIRST:  Check .agent-os/patterns/testing/ (project-specific)
SECOND: Read standards/ files listed above (generic patterns)
THIRD:  Use DocFork MCP if available
FOURTH: Use Context7 MCP if available
FIFTH:  Use WebSearch/WebFetch as fallback only

Project-specific patterns OVERRIDE standard patterns where both exist.

═══════════════════════════════════════════════════════════════════
GLOBAL EXECUTION REQUIREMENTS
═══════════════════════════════════════════════════════════════════

From user's global CLAUDE.md:
- Verify everything: Never assume code works
- Monitor tests actively with aggressive timeouts
- Server management: Check if tests auto-start servers, kill conflicts

═══════════════════════════════════════════════════════════════════
TASK ASSIGNMENT
═══════════════════════════════════════════════════════════════════

TASK: Gather test context for task PRJ-042
ROLE: test-context-gatherer
PHASE: 2.0 - Test Context Gathering

SPECIFIC REQUIREMENTS:
- Scan package.json for testing libraries (vitest, playwright, jest, etc.)
- Detect framework versions
- Fetch version-specific patterns from standards/ first
- Fall back to MCPs and web search only if needed
- Save output to .agent-os/test-context/PRJ-042.json

DELIVERABLES:
- .agent-os/test-context/PRJ-042.json with detected libraries and patterns

ACCEPTANCE CRITERIA:
- All testing libraries in package.json are detected
- Patterns are loaded from standards/ (not just web search)
- Output file contains actionable patterns for test-architect
`)
```

### Example 2: Delegating Sub-Spec Creation

```javascript
Task(subagent_type: "general-purpose",
     prompt: `
═══════════════════════════════════════════════════════════════════
MANDATORY INSTRUCTION LOADING - DO NOT SKIP
═══════════════════════════════════════════════════════════════════

BEFORE performing ANY work, you MUST:

1. READ the instruction file for your role:
   @.agent-os/instructions/core/create-spec.md (sections 3.1-3.8)

2. INTERNALIZE all protocols, especially:
   - Spec structure and required sections
   - Pattern lookup hierarchy (Step 3.8)
   - Quality requirements for specs
   - shadcn MCP usage for UI specs

3. CONFIRM understanding by stating:
   "I have read create-spec.md and will follow:
    - Full spec structure with all required sections
    - Pattern lookup: project patterns > skills > web search
    - shadcn MCP for component references"

4. PROCEED with task only AFTER confirmation

═══════════════════════════════════════════════════════════════════
MANDATORY FILE READS
═══════════════════════════════════════════════════════════════════

BEFORE writing this specification, you MUST READ:

1. standards/testing-standards.md
   - Testing patterns for test plan sections
   - Coding style for implementation guidance

Since this is a UI specification:
2. mcp__shadcn__list_components() - discover available components
3. mcp__shadcn__get_component_demo(componentName) for each component you specify

Document which components you referenced in the spec.

═══════════════════════════════════════════════════════════════════
PATTERN LOOKUP HIERARCHY (MANDATORY ORDER)
═══════════════════════════════════════════════════════════════════

FIRST:  Check .agent-os/patterns/ (project-specific, takes PRECEDENCE)
SECOND: Read standards/ files listed above (generic patterns)
THIRD:  Use WebSearch/WebFetch as fallback only

Project-specific patterns OVERRIDE standard patterns where both exist.

═══════════════════════════════════════════════════════════════════
GLOBAL EXECUTION REQUIREMENTS
═══════════════════════════════════════════════════════════════════

From user's global CLAUDE.md:
- Verify everything: Never assume code works
- Monitor tests actively with aggressive timeouts
- Server management: Check if tests auto-start servers, kill conflicts

═══════════════════════════════════════════════════════════════════
TASK ASSIGNMENT
═══════════════════════════════════════════════════════════════════

TASK: Create UX/UI Sub-Spec for Project Composition Editor
ROLE: spec-writer
PHASE: Sub-spec creation

SPECIFIC REQUIREMENTS:
- Focus ONLY on UX/UI aspects
- Reference existing architecture from main spec
- Use shadcn components where appropriate
- Include interaction patterns and state management
- Document accessibility requirements

DELIVERABLES:
- .agent-os/specs/2025-11-26-project-composition-editor/sub-specs/ux-ui-spec.md

ACCEPTANCE CRITERIA:
- All UI components are specified with shadcn references
- Interaction patterns are documented
- State management approach is defined
- Accessibility (a11y) requirements included
- Component demos were fetched via mcp__shadcn__get_component_demo()
`)
```

---

## Verification Checklist

After delegating to a subagent, verify their response includes:

1. **Instruction Confirmation**: Did they state what they read and key constraints?
2. **Skill Invocations**: Did they call the required `Skill()` tools?
3. **Pattern Sources**: Did they check project-specific patterns first?
4. **Deliverables**: Did they produce all expected outputs?

If any are missing, the delegation prompt may need adjustment.

---

## Integration Points

This template is referenced by:
- `instructions/core/execute-tasks.md` (Step 1.9a)
- `instructions/core/create-spec.md` (subagent delegation)
- `instructions/core/create-tasks.md` (subagent delegation)

When spawning ANY subagent in orchestrated workflows, use this template.
