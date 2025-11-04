# Agent Naming Conventions Guide

## Purpose

This document establishes naming conventions for Agent OS specialist agents to ensure consistency, clarity, and discoverability across the agent ecosystem. Following these conventions helps maintain a coherent architecture where agent names clearly communicate their role and responsibilities.

## Core Principles

### 1. Descriptive and Specific
Agent names should immediately convey what the agent does without requiring additional context.

**Good**: `security-sentinel`, `test-architect`, `integration-coordinator`
**Poor**: `agent-5`, `helper`, `utility`

### 2. Role-Based Naming
Names should reflect the agent's primary role or responsibility within the system.

**Good**: `documentation-generator`, `error-recovery-coordinator`
**Poor**: `doc-writer`, `error-fixer`

### 3. Avoid Ambiguity
Names should be unambiguous and not overlap with other agents' responsibilities.

**Good**: `data-integrity-guardian`, `implementation-specialist`
**Poor**: `data-agent`, `code-agent` (too generic)

### 4. Kebab-Case Format
All agent names use lowercase with hyphens (kebab-case) for consistency with file naming conventions.

**Format**: `component-component` or `role-specialty`

**Examples**: `security-sentinel`, `frontend-react-specialist`, `performance-oracle`

## Established Naming Patterns

### Pattern 1: Role-Specialty (`{role}-{specialty}`)

Use when the agent has a clearly defined role with a specific area of focus.

**Structure**: `{primary-role}-{specialization}`

**Examples**:
- `security-sentinel` - Security auditing and vulnerability detection
- `test-architect` - Test design and implementation
- `implementation-specialist` - Code implementation and feature building
- `integration-coordinator` - System integration and API management
- `documentation-generator` - Technical documentation creation

**When to Use**:
- Agent has a well-defined professional role (architect, specialist, coordinator, etc.)
- The specialty clarifies the domain of expertise
- The role-specialty combination is intuitive and self-explanatory

**Agent Name Formula**:
```
{role}-{specialty}
  ↓        ↓
 What    Domain

security-sentinel
   ↓         ↓
security   audit/protection
```

### Pattern 2: Specialty-Function (`{specialty}-{function}`)

Use when the agent is defined by what it does rather than a traditional role.

**Structure**: `{domain-specialty}-{primary-function}`

**Examples**:
- `performance-oracle` - Performance analysis and optimization
- `context-optimizer` - Context window optimization
- `context-fetcher` - Context retrieval and loading
- `pattern-recognition-specialist` - Code pattern analysis
- `data-integrity-guardian` - Data validation and consistency

**When to Use**:
- Agent performs a specific function rather than fulfilling a broad role
- The function is the primary defining characteristic
- No clear traditional role name applies

**Agent Name Formula**:
```
{specialty}-{function}
     ↓          ↓
   Domain    Action

performance-oracle
     ↓          ↓
performance  analysis/prediction
```

### Pattern 3: Technology-Specialty (`{technology}-{specialty}`)

Use for agents specialized in specific technologies, frameworks, or languages.

**Structure**: `{tech-stack}-{specialty-role}`

**Examples**:
- `frontend-react-specialist` - React/Next.js frontend development
- `frontend-vue-specialist` - Vue.js frontend development
- `backend-nodejs-specialist` - Node.js/TypeScript backend development

**When to Use**:
- Agent is deeply specialized in a specific technology
- Multiple similar agents exist for different technologies (e.g., frontend-react, frontend-vue)
- Technology expertise is the primary differentiator

**Agent Name Formula**:
```
{technology}-{specialty}
      ↓           ↓
  Framework    Expertise

frontend-react-specialist
    ↓        ↓        ↓
  Layer   Tech   Role level
```

### Pattern 4: Compound-Function (`{adjective}-{function}`)

Use for utility agents that perform specific, often meta-level tasks.

**Structure**: `{descriptor}-{function}`

**Examples**:
- `best-practices-researcher` - Research and identify best practices
- `code-simplicity-reviewer` - Review code for simplicity and clarity
- `git-history-analyzer` - Analyze git commit history and patterns
- `framework-docs-researcher` - Research framework documentation

**When to Use**:
- Agent performs research, analysis, or meta-level work
- The function is narrow and specific
- The descriptor clarifies the scope or approach

**Agent Name Formula**:
```
{descriptor}-{function}
     ↓           ↓
  Qualifier   Action

best-practices-researcher
     ↓              ↓
  What kind     What it does
```

## Naming Decision Tree

```
START: What is the agent's primary purpose?
  │
  ├─ Is it specialized in a specific technology/framework?
  │  └─ YES → Use Pattern 3: {technology}-{specialty}
  │            Example: frontend-react-specialist, backend-rails-specialist
  │
  ├─ Does it have a traditional professional role (architect, coordinator, etc.)?
  │  └─ YES → Use Pattern 1: {role}-{specialty}
  │            Example: security-sentinel, test-architect, integration-coordinator
  │
  ├─ Does it perform a specific analytical or utility function?
  │  └─ YES → Use Pattern 4: {descriptor}-{function}
  │            Example: best-practices-researcher, code-simplicity-reviewer
  │
  └─ Is it defined by what it does (action-oriented)?
     └─ YES → Use Pattern 2: {specialty}-{function}
               Example: performance-oracle, context-optimizer, error-recovery-coordinator
```

## Naming Guidelines

### DO

✅ **Use descriptive, specific names**
- `security-sentinel` (clear security focus)
- `documentation-generator` (clear documentation creation)

✅ **Match the agent's primary responsibility**
- `test-architect` designs tests
- `implementation-specialist` writes code
- `integration-coordinator` manages integrations

✅ **Use consistent role titles across agents**
- `specialist` - Deep expertise in domain
- `architect` - Design and structure focus
- `coordinator` - Orchestration and management
- `sentinel` - Monitoring and protection
- `guardian` - Validation and enforcement
- `oracle` - Analysis and insights
- `researcher` - Investigation and discovery

✅ **Consider discoverability**
- Would a developer understand this agent's purpose from the name alone?
- Does the name differentiate this agent from others?

### DON'T

❌ **Use overly generic names**
- `helper`, `utility`, `manager` (too vague)
- `code-agent`, `test-agent` (lacks specificity)

❌ **Use abbreviations or acronyms**
- `sec-audit` → use `security-sentinel`
- `doc-gen` → use `documentation-generator`
- `perf-opt` → use `performance-oracle`

❌ **Include version numbers or dates**
- `security-sentinel-v2` → use `security-sentinel` (version in frontmatter)
- `test-architect-2025` → use `test-architect`

❌ **Use redundant words**
- `security-security-agent` → use `security-sentinel`
- `test-test-architect` → use `test-architect`

❌ **Mix naming patterns inconsistently**
- If you have `frontend-react-specialist`, maintain pattern with `frontend-vue-specialist` (not `vue-frontend-agent`)

## Role Title Glossary

Common role titles used across Agent OS agents:

| Role Title | Meaning | Example Agents |
|-----------|---------|----------------|
| `specialist` | Deep domain expertise, implementation focus | `implementation-specialist`, `frontend-react-specialist`, `pattern-recognition-specialist` |
| `architect` | Design, structure, and planning focus | `test-architect`, `architecture-strategist` |
| `coordinator` | Orchestration, integration, and management | `integration-coordinator`, `error-recovery-coordinator` |
| `sentinel` | Monitoring, protection, and enforcement | `security-sentinel` |
| `guardian` | Validation, integrity, and consistency | `data-integrity-guardian` |
| `oracle` | Analysis, insights, and predictions | `performance-oracle` |
| `researcher` | Investigation, discovery, and recommendation | `best-practices-researcher`, `framework-docs-researcher` |
| `generator` | Creation and production of artifacts | `documentation-generator` |
| `optimizer` | Efficiency and performance improvements | `context-optimizer` |
| `analyzer` | Examination and understanding | `git-history-analyzer` |
| `reviewer` | Evaluation and feedback | `code-simplicity-reviewer` |
| `fetcher` | Retrieval and loading | `context-fetcher` |
| `strategist` | High-level planning and direction | `architecture-strategist` |

## File Naming Convention

Agent definition files follow the same naming convention as agent names:

**Format**: `{agent-name}.md`

**Examples**:
- `security-sentinel.md`
- `test-architect.md`
- `frontend-react-specialist.md`
- `performance-oracle.md`

**Location**: `/home/edwin/.agent-os/instructions/agents/`

## Name Length Guidelines

**Optimal Length**: 2-3 words (components separated by hyphens)

**Examples**:
- 2 words: `test-architect`, `security-sentinel` ✅
- 3 words: `frontend-react-specialist`, `error-recovery-coordinator` ✅
- 4+ words: Acceptable if necessary, but consider if it can be simplified

**Maximum Length**: 4 words
- Try to avoid names longer than 4 components
- If a name requires 5+ words, consider whether the agent's scope is too broad

## Examples by Category

### Security Agents
- `security-sentinel` - Security auditing and vulnerability detection
- `compliance-validator` - Compliance and regulatory validation (if added)
- `threat-analyzer` - Threat detection and analysis (if added)

### Testing Agents
- `test-architect` - Test design and implementation
- `test-automation-specialist` - Test automation engineering (if added)
- `quality-assurance-orchestrator` - QA coordination (if added)

### Implementation Agents
- `implementation-specialist` - General code implementation
- `frontend-react-specialist` - React/Next.js implementation
- `frontend-vue-specialist` - Vue.js implementation
- `backend-nodejs-specialist` - Node.js/TypeScript implementation

### Documentation Agents
- `documentation-generator` - Technical documentation creation
- `api-documentation-specialist` - API documentation focus (if added)

### Integration Agents
- `integration-coordinator` - System integration and APIs
- `data-sync-orchestrator` - Data synchronization (if added)

### Analysis Agents
- `performance-oracle` - Performance analysis and optimization
- `pattern-recognition-specialist` - Code pattern analysis
- `git-history-analyzer` - Git history and trend analysis
- `code-simplicity-reviewer` - Simplicity and clarity analysis

### Research Agents
- `best-practices-researcher` - Best practices investigation
- `framework-docs-researcher` - Framework documentation research

### Utility Agents
- `context-optimizer` - Context window optimization
- `context-fetcher` - Context retrieval and loading
- `error-recovery-coordinator` - Error handling and recovery
- `data-integrity-guardian` - Data validation and consistency
- `file-creator` - File creation and scaffolding

### Architecture Agents
- `architecture-strategist` - System architecture and design

## Validation Checklist

Before finalizing a new agent name, verify:

- [ ] **Clarity**: Does the name clearly communicate the agent's purpose?
- [ ] **Uniqueness**: Is this name distinct from existing agents?
- [ ] **Pattern Consistency**: Does it follow one of the established patterns?
- [ ] **Format**: Is it in kebab-case with 2-4 components?
- [ ] **Discoverability**: Would a developer understand this agent from the name?
- [ ] **No Abbreviations**: Are all words spelled out fully?
- [ ] **Appropriate Role Title**: Does the role title accurately reflect the agent's function?
- [ ] **Technology Specificity**: If tech-specific, is the technology clearly indicated?

## Renaming Existing Agents

If renaming an existing agent for consistency:

1. **Assess Impact**: Check all references in instructions, commands, and configuration
2. **Update Agent File**: Rename the `.md` file in `instructions/agents/`
3. **Update Frontmatter**: Ensure `agent_type` in frontmatter matches new name
4. **Update References**: Search for old name across all `.agent-os/` files
5. **Document Change**: Note the rename in version history or changelog
6. **Maintain Backward Compatibility**: Consider using old name as alias temporarily

## Future Considerations

As the Agent OS ecosystem grows:

- **Namespacing**: Consider introducing namespaces for very large agent collections (e.g., `security/sentinel`, `security/compliance-validator`)
- **Capability Tags**: Consider adding capability tags in frontmatter to complement names
- **Agent Hierarchy**: Consider parent-child relationships for specialized variants (e.g., `frontend-specialist` → `frontend-react-specialist`)

## Examples of Good Names (Real Agents)

| Agent Name | Pattern | Rationale |
|-----------|---------|-----------|
| `security-sentinel` | Role-Specialty | Clear security role, "sentinel" implies monitoring/protection |
| `test-architect` | Role-Specialty | Traditional role (architect) with domain (testing) |
| `implementation-specialist` | Role-Specialty | Professional role with broad implementation focus |
| `integration-coordinator` | Role-Specialty | Coordinator role for integration domain |
| `performance-oracle` | Specialty-Function | Oracle suggests analysis/insights for performance |
| `context-optimizer` | Specialty-Function | Optimization function for context domain |
| `frontend-react-specialist` | Technology-Specialty | Technology-specific (React) frontend specialist |
| `best-practices-researcher` | Compound-Function | Research function with descriptor (best practices) |
| `data-integrity-guardian` | Specialty-Function | Guardian role for data integrity |
| `documentation-generator` | Specialty-Function | Generation function for documentation |
| `error-recovery-coordinator` | Specialty-Function | Coordination of error recovery |
| `code-simplicity-reviewer` | Specialty-Function | Review function focused on simplicity |

## Process for Naming New Agents

1. **Define Purpose**: Write a 1-2 sentence description of the agent's primary responsibility
2. **Identify Key Characteristics**:
   - Is it technology-specific? → Consider Pattern 3
   - Does it have a traditional role? → Consider Pattern 1
   - Is it function-oriented? → Consider Pattern 2
   - Is it analytical/research? → Consider Pattern 4
3. **Draft Name Options**: Create 2-3 name candidates using appropriate patterns
4. **Test Clarity**: Ask "Would this name be clear to someone unfamiliar with the agent?"
5. **Check Uniqueness**: Verify no conflicts with existing agents
6. **Validate Against Checklist**: Use the validation checklist above
7. **Choose Final Name**: Select the clearest, most descriptive option
8. **Document**: Add to this guide with rationale

## Conclusion

Consistent, clear naming conventions enable:
- **Developer Efficiency**: Quickly find and understand agents
- **System Coherence**: Maintain architectural clarity as system scales
- **Onboarding**: New team members can navigate agent ecosystem easily
- **Discoverability**: Agents are self-documenting through their names

When in doubt, prioritize clarity and descriptiveness over brevity. A slightly longer name that clearly communicates purpose is better than a short, ambiguous one.

---

**Version**: 1.0
**Last Updated**: 2025-10-26
**Maintainer**: Agent OS Engineering Team
