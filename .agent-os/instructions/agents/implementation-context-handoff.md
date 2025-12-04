---
# EXECUTION ROLE SUPPLEMENT
# This file provides guidance for the GREEN phase context handoff.
# It supplements implementation-specialist with test pattern awareness.
#
# Usage: Read this file BEFORE writing implementation code.
# Prerequisite: test-architect must have created pattern documentation.

role: implementation-context-handoff
description: "Context handoff between test design and implementation phases"
phase: green_phase_context
version: 1.0.0
encoding: UTF-8
requires: [test-architect]
---

# Implementation Context Handoff Guide

## Purpose

This guide ensures implementation code properly integrates with test patterns.
Following this guide prevents the common problem of "tests need rework" after implementation.

## When to Use This Guide

Use this guide:
- BEFORE writing any implementation code
- AFTER test-architect has created tests (RED phase complete)
- When entering GREEN phase of TDD cycle

## Step 1: Locate Pattern Documentation

**FIRST**: Find and read the pattern documentation file:

```
FILE: .agent-os/test-context/[TASK_ID]-patterns-used.json
```

If this file does NOT exist:
```
❌ STOP: Cannot proceed without pattern documentation

The test-architect did not create pattern documentation.
This is a workflow violation.

ACTION: 
1. Return to task orchestrator
2. Request test-architect to create pattern documentation
3. Wait for pattern file to be created

REFERENCE: @.agent-os/instructions/agents/test-architect.md
           (See: Post-Creation Pattern Documentation section)
```

If the file EXISTS, proceed to Step 2.

## Step 2: Extract Key Patterns

Read the pattern file and extract these critical sections:

### 2.1 Mocking Patterns

```yaml
From patterns_used.mocking:
  approach: [What mocking approach tests use]
  example: [Actual code example]
  modules_mocked: [List of mocked modules]
  notes: [Special considerations]

YOUR IMPLEMENTATION MUST:
  - Export the functions/classes that tests mock
  - Call the mocked modules (not bypass them)
  - Use the same import paths tests mock
```

**Example Translation**:
```javascript
// Test uses: vi.mock('./services/api', () => ({ fetchData: vi.fn() }))
// 
// Implementation MUST:
// 1. Import from './services/api'
// 2. Actually call fetchData() - don't hardcode the response
// 3. Export functions that use fetchData()

// CORRECT:
import { fetchData } from './services/api';
export async function getData() {
  return await fetchData('/endpoint');  // Will be intercepted by mock
}

// WRONG:
export async function getData() {
  return { data: 'hardcoded' };  // Bypasses mock entirely!
}
```

### 2.2 Assertion Patterns

```yaml
From patterns_used.assertions:
  library: [Assertion library used]
  common_patterns: [List of assertion methods]
  async_assertions: [Async assertion pattern]

YOUR IMPLEMENTATION MUST:
  - Return data structures that match assertion expectations
  - Throw error types that tests catch
  - Use async patterns compatible with test assertions
```

**Example Translation**:
```javascript
// Test uses: expect(result).toEqual({ user: { id: 1, name: 'Test' } })
//
// Implementation MUST return exactly this structure:

// CORRECT:
return { user: { id: userId, name: userName } };

// WRONG (different structure):
return { userData: { userId: id, userName: name } };  // Tests will fail!
```

### 2.3 Async Handling

```yaml
From patterns_used.async_handling:
  pattern: [async/await | promises | callbacks]
  timeout_configured: [true/false]
  timeout_value: [milliseconds]

YOUR IMPLEMENTATION MUST:
  - Use matching async pattern
  - Complete within timeout window
  - Not create unhandled promises
```

### 2.4 E2E Patterns (if applicable)

```yaml
From patterns_used.e2e_patterns:
  locators: [data-testid | css | xpath | role]
  waiting: [waitForSelector | waitForURL | etc]
  assertions: [page assertion patterns]

YOUR IMPLEMENTATION MUST:
  - Include the expected data-testid attributes
  - Render expected text content
  - Navigate to expected URLs
```

**Example Translation**:
```javascript
// Test uses: await page.click('[data-testid="submit-btn"]')
//
// Component MUST have:

// CORRECT:
<button data-testid="submit-btn">Submit</button>

// WRONG (missing attribute):
<button id="submit">Submit</button>  // E2E test can't find it!
```

## Step 3: Review Server Requirements

```yaml
From server_requirements:
  - Check which servers tests expect to be running
  - Verify health endpoints
  - Understand what services implementation should call
```

If tests mock an API, your implementation should actually call that API
(the mock will intercept it during tests).

## Step 4: Review Critical Notes

Read ALL items in `critical_notes`:

```yaml
From critical_notes:
  - These are explicit instructions from test-architect
  - They document assumptions made during test design
  - Violating these will cause test failures
```

Common critical notes:
- "API client must be mocked - tests do not call real endpoints"
  → Implementation MUST use the API client (mock intercepts)
- "Auth state managed via fixtures, not real sessions"
  → Implementation should read auth from expected source
- "Database operations mocked - no real DB calls in tests"
  → Implementation should use DB client (mock intercepts)

## Step 5: Document Your Understanding

Before writing implementation, confirm your understanding:

```
═══════════════════════════════════════════════════════════════════
IMPLEMENTATION CONTEXT HANDOFF - CONFIRMED
═══════════════════════════════════════════════════════════════════

I have read: .agent-os/test-context/[TASK_ID]-patterns-used.json

Patterns I will honor:
  • Mocking: [approach] - will call mocked modules, not bypass
  • Assertions: [library] - will return expected data structures
  • Async: [pattern] - will use compatible async handling
  • E2E: [locators] - will include expected attributes

Server requirements understood: [list]

Critical notes acknowledged:
  • [note 1]
  • [note 2]

PROCEEDING TO IMPLEMENTATION...
═══════════════════════════════════════════════════════════════════
```

## Step 6: Implement with Pattern Awareness

During implementation:

### DO:
- Call the modules that tests mock
- Return data structures that match test assertions
- Use async patterns compatible with test expectations
- Include E2E locators (data-testid) that tests use
- Throw error types that tests catch

### DON'T:
- Hardcode responses that bypass mocked functions
- Return different data structures than tests expect
- Use incompatible async patterns
- Omit data-testid attributes E2E tests need
- Throw generic errors when tests expect specific types

## Step 7: Pre-Completion Validation

Before marking implementation complete, verify:

```yaml
alignment_checklist:
  - [ ] All mocked modules are called (not bypassed)
  - [ ] Data structures match test assertions
  - [ ] Error types match test expectations
  - [ ] E2E locators are present (if applicable)
  - [ ] Async patterns are compatible
  - [ ] Critical notes are honored
```

Run tests to verify:
```bash
# With real-time monitoring (recommended)
node ~/.agent-os/hooks/lib/test-monitor.js pnpm test

# Basic execution
pnpm test
```

All tests should pass. If tests fail:
1. Review the failure message
2. Compare against pattern documentation
3. Identify the misalignment
4. Fix implementation to match patterns

## Common Misalignment Patterns

### Problem: Tests fail but code "looks correct"

**Cause**: Implementation bypasses mocked functions

```javascript
// Test mocks: vi.mock('./api', () => ({ fetch: vi.fn().mockResolvedValue(data) }))
// Test expects: getData() to return the mocked data

// BROKEN (bypasses mock):
export function getData() {
  return localStorage.getItem('cachedData'); // Never calls mock!
}

// FIXED (uses mock):
export async function getData() {
  return await api.fetch('/data'); // Mock intercepts this
}
```

### Problem: Assertion errors on structure

**Cause**: Implementation returns different structure

```javascript
// Test expects: { user: { id, name } }
// Implementation returns: { data: { user_id, user_name } }

// BROKEN:
return { data: { user_id: id, user_name: name } };

// FIXED:
return { user: { id, name } };
```

### Problem: E2E tests can't find elements

**Cause**: Missing or different locators

```jsx
// Test uses: page.getByTestId('login-form')

// BROKEN:
<form id="loginForm">

// FIXED:
<form data-testid="login-form">
```

## Reference

- Pattern documentation: `.agent-os/test-context/[TASK_ID]-patterns-used.json`
- Alignment checklist: `@.agent-os/instructions/utilities/test-code-alignment-checklist.md`
- Test architect guide: `@.agent-os/instructions/agents/test-architect.md`
- Orchestration workflow: `@.agent-os/instructions/core/execute-task-orchestrated.md` (Step 2.1a)
