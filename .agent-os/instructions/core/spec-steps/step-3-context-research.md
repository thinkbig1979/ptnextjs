---
version: 5.1.0
last-updated: 2026-01-02
related-files:
  - instructions/core/create-spec.md
---


# Steps 3-3.8: Context Gathering and Research

## Step 3: Context Gathering

**Subagent**: context-fetcher

```
IF both files in context:
  SKIP
ELSE:
  READ missing:
    - mission-lite.md (if not in context)
    - tech-stack.md (if not in context)
```

## Step 3.5: Research Agents (Compound Engineering)

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
- >=50% fail: Warn, ask user
- All fail: Proceed with basic spec

## Step 3.8: Load Patterns via Skills

**MANDATORY TOOL INVOCATION**

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
