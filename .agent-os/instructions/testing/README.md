# Testing Instructions Index

**Version**: 1.0.0  
**Agent OS**: v4.2.0  
**Purpose**: Quick reference for all testing-related instructions and their relationships

---

## Quick Reference

| Need To... | Read This |
|------------|-----------|
| Understand canonical values (timeouts, locations, hierarchies) | `@standards/testing-standards.md` |
| Create tests | `@instructions/agents/test-architect.md` |
| Gather test context before writing tests | `@instructions/agents/test-context-gatherer.md` |
| Run tests | `@.claude/commands/run-tests.md` |
| Understand test execution protocol | `@instructions/utilities/test-execution-protocol.md` |
| Validate test/code alignment | `@instructions/utilities/test-code-alignment-checklist.md` |
| Understand orchestration flow | `@instructions/core/execute-task-orchestrated.md` |
| Check test infrastructure standards | `@standards/test-infrastructure.md` |

---

## File Dependency Map

```
┌─────────────────────────────────────────────────────────────────┐
│                    CANONICAL REFERENCE                          │
│              @standards/testing-standards.md                    │
│  (ALL other testing files reference this for canonical values)  │
└──────────────────────────┬──────────────────────────────────────┘
                           │
         ┌─────────────────┼─────────────────┐
         ▼                 ▼                 ▼
┌─────────────────┐ ┌─────────────────┐ ┌─────────────────┐
│ test-architect  │ │ test-context-   │ │ test-infra-     │
│     .md         │ │  gatherer.md    │ │  structure.md   │
│ (test creation) │ │ (context first) │ │ (impl details)  │
└────────┬────────┘ └────────┬────────┘ └─────────────────┘
         │                   │
         │    ┌──────────────┘
         ▼    ▼
┌─────────────────────────────────────────┐
│     execute-task-orchestrated.md        │
│              (orchestration)            │
│                                         │
│  Step 2.0 → test-context-gatherer       │
│  Step 2.1 → test-architect (RED)        │
│  Step 2.2 → implementation (GREEN)      │
│  Step 2.2a → alignment validation       │
└─────────────────────────────────────────┘
         │
         ▼
┌─────────────────────────────────────────┐
│      test-execution-protocol.md         │
│         (shared execution steps)        │
│                                         │
│  Used by:                               │
│  - execute-task-orchestrated.md         │
│  - run-tests.md (standalone command)    │
└─────────────────────────────────────────┘
```

---

## Config Toggles

All testing features are controlled by `config.yml`:

| Section | Toggle | Controls |
|---------|--------|----------|
| `test_infrastructure` | `enabled` | All infrastructure standards |
| `test_context_gathering` | `enabled` | Step 2.0 context gathering |
| `test_context_gathering.gate_enforcement` | `enabled` | Blocking gate before test-architect |
| `tdd_enforcement` | `enabled` | RED/GREEN/REFACTOR phases |
| `test_code_alignment` | `enabled` | Step 2.2a alignment validation |
| `test_code_alignment.pattern_documentation` | `required` | patterns-used.json mandatory |
| `test_execution_monitoring` | `enabled` | Streaming reporters |
| `skills_integration` | `enabled` | Skill invocations in Step 2.0 |

---

## Workflow Phases

### Phase 2.0: Test Context Gathering
- **Owner**: test-context-gatherer agent
- **Input**: package.json, pyproject.toml, Gemfile
- **Output**: `.agent-os/test-context/[TASK_ID].json`
- **Skills Invoked**: agent-os-test-research, agent-os-patterns

### Phase 2.1: Test Architecture (RED Phase)
- **Owner**: test-architect agent
- **Input**: Context from Step 2.0, acceptance criteria
- **Output**: Test files, `.agent-os/test-context/[TASK_ID]-patterns-used.json`
- **Gate**: Tests must FAIL (missing implementation)

### Phase 2.2: Implementation (GREEN Phase)
- **Owner**: implementation-specialist agent
- **Input**: patterns-used.json from Step 2.1
- **Output**: Implementation code that passes tests
- **Gate**: Tests must PASS

### Phase 2.2a: Alignment Validation
- **Owner**: Orchestrator
- **Input**: Implementation code, test patterns
- **Output**: Alignment report
- **Gate**: All 4 checks must pass (Pattern, Structure, Bypass, Coverage)

---

## Key Verification Gates

| Gate | Location | Blocks If |
|------|----------|-----------|
| Framework Isolation | Step 1.6 | Playwright testDir != ./tests/e2e |
| Test Context Complete | Step 2.0 | Context file doesn't exist |
| RED Phase Valid | Step 2.1 | Tests don't fail correctly |
| Pattern Documentation | Step 2.1 | patterns-used.json missing |
| Alignment Valid | Step 2.2a | Any alignment check fails |

---

## Common Issues and Solutions

### "Vitest cannot be imported"
**Cause**: Playwright testDir includes unit test files  
**Solution**: Set `testDir: './tests/e2e'` in playwright.config.ts  
**Reference**: `@standards/testing-standards.md` Section 3

### Tests pass before implementation
**Cause**: Tests not validating real behavior  
**Solution**: Review test assertions, ensure they fail when impl missing  
**Reference**: `@instructions/agents/test-architect.md` Pre-Creation Checklist

### Pattern documentation missing
**Cause**: test-architect didn't create patterns-used.json  
**Solution**: Request test-architect to document patterns used  
**Reference**: `@standards/testing-standards.md` Section 6

### Skills not invoked
**Cause**: Unclear ownership between orchestrator and test-context-gatherer  
**Solution**: test-context-gatherer OWNS skill invocations  
**Reference**: `@instructions/agents/test-context-gatherer.md` Phase 2

---

## Version History

### v1.0.0 (v4.2.0)
- Initial testing instructions index
- Created as part of testing alignment initiative
- Consolidates navigation across 50+ testing files
