---
version: 5.1.0
last-updated: 2026-01-02
---


# Best Practices

## Compounding Engineering Philosophy

### Core Principle

Write code that compounds in value. Each feature should make the next easier to build.

### Key Concepts

| Concept | Description |
|---------|-------------|
| **Reusability First** | Extract patterns into reusable components/functions/services |
| **Composability** | Small, focused modules with clear interfaces |
| **Knowledge Capture** | Document why, not just what |
| **Systematic Improvement** | Leave code better than you found it |

### Compounding vs Non-Compounding

```typescript
// NON-COMPOUNDING: One-off, duplicated logic
async function processUserData(data) {
  if (!data.email || !data.email.includes('@')) throw new Error('Invalid email');
  data.email = data.email.toLowerCase().trim();
  const user = await db.query('INSERT INTO users VALUES...', [data.email]);
  return user;
}

// COMPOUNDING: Reusable utilities
import { validateUserSchema } from '@/lib/validation/schemas';
import { sanitizeInput } from '@/lib/security/sanitization';

export async function processUserData(data: unknown): Promise<ProcessedUser> {
  const validated = validateUserSchema(data);
  const sanitized = sanitizeInput(validated);
  return await userRepository.create(sanitized);
}
```

**Benefits**: Each subsequent feature becomes 60-80% faster to implement.

### Anti-Patterns

- Premature abstraction (wait for 2-3 concrete examples)
- Over-engineering (small utilities, not frameworks)
- Copy-paste development
- Undocumented patterns
- Ignoring technical debt

---

## Test-Driven Development (TDD)

### Core Workflow

1. **RED**: Write failing tests
2. **GREEN**: Minimal code to pass
3. **REFACTOR**: Improve quality while keeping tests green

### Enforcement Levels

| Level | Coverage | When to Use |
|-------|----------|-------------|
| **STRICT** | 95% min | Critical: financial, security, data integrity |
| **STANDARD** | 85% min | Production features, APIs, business logic |
| **RELAXED** | 60% min | Prototypes, learning, internal tools |

### Feature Type Enforcement

| Type | Level | Rationale |
|------|-------|-----------|
| Data Validation | STRICT | Invalid data causes cascading failures |
| Security/Auth | STRICT | Severe consequences for bugs |
| Financial | STRICT | Monetary loss, legal liability |
| Core Business Logic | STANDARD | Important but not critical |
| UI Components | STANDARD/RELAXED | Visual testing often more effective |
| Prototypes | RELAXED | May be discarded |

---

## RED Phase: Failing Tests

### Test Categories

| Type | Speed | % of Tests | Purpose |
|------|-------|------------|---------|
| Unit | <100ms | 70-80% | Isolated functions, mocked deps |
| Integration | <30s | 15-20% | Component interactions, real DB |
| API | <1s | 5-10% | Endpoint validation |
| Database | <300ms | 3-5% | Schema, constraints |
| Edge Cases | <100ms | 5-10% | Boundary conditions |

### Expected Failure Messages

| Error Type | Indicates |
|------------|-----------|
| `ReferenceError: X is not defined` | Function not created |
| `404 Not Found` | Route not created |
| `relation "X" does not exist` | Table not created |
| `AssertionError: expected undefined` | Missing property |

### RED Phase Checklist

- [ ] All planned tests written
- [ ] All tests fail with expected messages
- [ ] Test structure follows conventions
- [ ] Test data and fixtures created
- [ ] Tests are independent and deterministic

---

## GREEN Phase: Minimal Implementation

### Principles

1. **Implement only what tests require** - No "future-proofing"
2. **Use standard libraries** - Don't reinvent solved problems
3. **No premature abstraction** - Wait for patterns to emerge
4. **Single responsibility** - Each function does one thing
5. **Clear over clever** - Self-documenting code

### Code Simplicity Constraints

| Metric | STRICT | STANDARD | RELAXED |
|--------|--------|----------|---------|
| Lines/function | 50 max | 75 max | 100 max |
| Cyclomatic complexity | 10 max | 15 max | 20 max |
| Nesting depth | 3 max | 4 max | No limit |
| Parameters | 5 max | 6 max | No limit |

### GREEN Phase Checklist

- [ ] All tests pass
- [ ] Coverage target met
- [ ] No over-implementation
- [ ] Code follows simplicity constraints
- [ ] Uses standard libraries

---

## REFACTOR Phase

- Maintain passing tests
- Improve readability and maintainability
- Extract duplicated code
- Improve naming
- Document patterns

---

## Coverage Targets

### By Enforcement Level

| Level | Minimum | Target | Warning |
|-------|---------|--------|---------|
| STRICT | 95% | 98% | 90% |
| STANDARD | 85% | 90% | 80% |
| RELAXED | 60% | 70% | 50% |

### Coverage Types

| Type | Description |
|------|-------------|
| Statement | Lines executed |
| Branch | if/else paths tested |
| Function | Functions called (target 100%) |
| Line | Physical lines executed |

### Exclusions

Exclude from coverage requirements:
- Type definitions (`.d.ts`)
- Config files (`*.config.{js,ts}`)
- Migrations
- Test utilities
- Generated code

---

## Common Anti-Patterns

| Anti-Pattern | Problem | Solution |
|--------------|---------|----------|
| Implementation before tests | Poor coverage, afterthought tests | Follow RED-GREEN-REFACTOR |
| All tests at once | Overwhelming failures | Write incrementally |
| Over-engineering | Unnecessary complexity | Minimal implementation |
| Skipping REFACTOR | Technical debt | Always refactor after GREEN |
| Ignoring failures | Regressions | Fix immediately, never skip |
| Coupled to implementation | Brittle tests | Test behavior, not internals |

---

## Integration with Agent OS

| Workflow | Step | Action |
|----------|------|--------|
| Spec Creation | 4.5 | TDD workflow definition |
| Task Creation | - | TDD acceptance criteria |
| Task Execution | - | TDD phase validation |
| Quality Hooks | - | Automatic TDD validation |

---

## Resources

- Example specs: `examples/specs-with-tdd/`
- Template: `templates/spec-templates/standard-spec-template.md`
- Config: `config.yml` -> `tdd_enforcement`
