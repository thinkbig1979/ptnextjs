# Test Documentation Index

> **Version**: 1.0.0 | Agent OS v5.1.0
> **Purpose**: Central index for all test-related documentation

---

## Quick Reference

| Task | Document |
|------|----------|
| **Run tests** | `test-execution-protocol.md` |
| **Place E2E tests** | `e2e-test-placement-checklist.md` |
| **TDD alignment** | `test-code-alignment-checklist.md` |
| **Parse test results** | `test-result-analyzer.md` |
| **UI component testing** | `ui-component-testing-strategy.md` |

---

## By Workflow Phase

### Before Writing Tests
1. `e2e-test-placement-checklist.md` - Decide tier (smoke/core/regression)
2. `@standards/testing-standards.md` - Canonical values (timeouts, thresholds)

### During TDD
1. `test-code-alignment-checklist.md` - RED→GREEN alignment
2. `@instructions/agents/test-architect.md` - Test design patterns

### Running Tests
1. `test-execution-protocol.md` - Streaming execution
2. `test-result-analyzer.md` - Parse/analyze results

### Post-Implementation
1. `ui-component-testing-strategy.md` - UI validation
2. `@instructions/core/validate-browser.md` - Browser validation gate

---

## Document Purposes

### test-execution-protocol.md (260 lines)
**When**: Running tests with streaming output
**Key content**: Server pre-flight, streaming reporter setup, failure classification

### e2e-test-placement-checklist.md (372 lines)
**When**: Creating new E2E tests
**Key content**: Tier decision matrix (smoke/core/regression), directory structure

### test-code-alignment-checklist.md (373 lines)
**When**: TDD workflow (RED→GREEN phases)
**Key content**: Pattern documentation, context handoff, alignment validation

### test-result-analyzer.md (455 lines)
**When**: Parsing test output programmatically
**Key content**: API reference for `analyzeTestResults()` function

### ui-component-testing-strategy.md (521 lines)
**When**: Testing React/Vue UI components
**Key content**: Test type decision tree, component testing patterns

---

## Related Agent Instructions

| Agent | Document | Purpose |
|-------|----------|---------|
| test-architect | `@instructions/agents/test-architect.md` | Test design (RED phase) |
| test-runner | `@instructions/agents/test-runner.md` | Test execution |
| test-context-gatherer | `@instructions/agents/test-context-gatherer.md` | Context collection |
| test-integrity-analyzer | `@instructions/agents/test-integrity-analyzer.md` | Integrity analysis |

---

## Standards Reference

| Document | Purpose |
|----------|---------|
| `@standards/testing-standards.md` | Canonical values |
| `@standards/e2e-ui-testing-standards.md` | E2E-specific standards |
| `@standards/testing/test-strategies.md` | Strategy patterns |
