# Subagent Delegation Template

> **Version**: 1.0.0
> **Purpose**: Standard template for constructing Task() prompts when delegating work to subagents
> **Problem Solved**: Ensures mandatory instructions, skills, and context are passed to every subagent

## The Problem

When orchestrators delegate work to subagents via `Task(subagent_type: "general-purpose")`:
1. Mandatory instruction loading requirements are NOT automatically inherited
2. Skill invocations required by config.yml are NOT triggered
3. Global CLAUDE.md context is NOT passed
4. Pattern lookup hierarchy is NOT enforced

This template solves all of these gaps.

---

## Quick Reference: Copy-Paste Template

```javascript
Task(subagent_type: "general-purpose",
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
TASK ASSIGNMENT
═══════════════════════════════════════════════════════════════════

TASK: {TASK_TITLE}
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
BEFORE fetching test documentation, you MUST invoke:

1. Skill(skill="agent-os-test-research")
   - Provides library detection patterns
   - Documents fallback priority for docs

2. Skill(skill="agent-os-patterns")
   - Provides Vitest patterns (vitest.md)
   - Provides Playwright patterns (playwright.md)
   - Provides Convex patterns (convex.md)

These skills are Priority 0 - check them BEFORE DocFork, Context7, or WebSearch.
```

### Test Design (Phase 2.1)

```
BEFORE designing tests, you MUST invoke:

1. Skill(skill="agent-os-patterns")
   - Load vitest.md for unit test patterns
   - Load playwright.md for E2E test patterns
   - Load test-strategies.md for test architecture

2. Skill(skill="agent-os-specialists")
   - Load test-design guidance
```

### Implementation (Phase 3.0)

```
BEFORE writing implementation code, you MUST invoke:

1. Skill(skill="agent-os-patterns")
   - Load coding-style.md for code conventions

2. Skill(skill="agent-os-specialists")
   - Load backend-nodejs.md OR frontend-react.md as appropriate
   - Load implementation.md for general guidance
```

### Security Review (Phase 4.0)

```
BEFORE performing security review, you MUST invoke:

1. Skill(skill="agent-os-specialists")
   - Load security review guidance
   - Reference OWASP Top 10 patterns
```

### Spec Creation

```
BEFORE writing specifications, you MUST invoke:

1. Skill(skill="agent-os-patterns")
   - Load testing patterns for test plan sections
   - Load coding-style.md for implementation guidance

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
MANDATORY SKILL INVOCATIONS
═══════════════════════════════════════════════════════════════════

BEFORE fetching test documentation, you MUST invoke:

1. Skill(skill="agent-os-test-research")
   - Provides library detection patterns
   - Documents fallback priority for docs

2. Skill(skill="agent-os-patterns")
   - Provides Vitest patterns (vitest.md)
   - Provides Playwright patterns (playwright.md)
   - Provides Convex patterns (convex.md)

These skills are Priority 0 - check them BEFORE DocFork, Context7, or WebSearch.

═══════════════════════════════════════════════════════════════════
PATTERN LOOKUP HIERARCHY (MANDATORY ORDER)
═══════════════════════════════════════════════════════════════════

FIRST:  Check .agent-os/patterns/testing/ (project-specific)
SECOND: Invoke skills listed above (generic patterns)
THIRD:  Use DocFork MCP if available
FOURTH: Use Context7 MCP if available
FIFTH:  Use WebSearch/WebFetch as fallback only

Project-specific patterns OVERRIDE skill patterns where both exist.

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
- Fetch version-specific patterns from skills first
- Fall back to MCPs and web search only if needed
- Save output to .agent-os/test-context/PRJ-042.json

DELIVERABLES:
- .agent-os/test-context/PRJ-042.json with detected libraries and patterns

ACCEPTANCE CRITERIA:
- All testing libraries in package.json are detected
- Patterns are loaded from skills (not just web search)
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
MANDATORY SKILL INVOCATIONS
═══════════════════════════════════════════════════════════════════

BEFORE writing this specification, you MUST invoke:

1. Skill(skill="agent-os-patterns")
   - Load testing patterns for test plan sections
   - Load coding-style.md for implementation guidance

Since this is a UI specification:
2. mcp__shadcn__list_components() - discover available components
3. mcp__shadcn__get_component_demo(componentName) for each component you specify

Document which components you referenced in the spec.

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
