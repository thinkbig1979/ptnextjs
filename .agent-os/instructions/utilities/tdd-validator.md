# TDD Validator

Enforces test-first development by validating TDD state before implementation.

**Module**: `lib/tdd-validator.js`

## Purpose

- Enforce RED-GREEN-REFACTOR cycle
- Block/warn implementation without failing tests
- Support STRICT, STANDARD, RELAXED enforcement
- Integrate with TDD State Manager

## Enforcement Levels

| Level | Behavior | Use Cases |
|-------|----------|-----------|
| **STRICT** | Blocks implementation without passing tests | Critical, security, financial |
| **STANDARD** | Warns but allows | Standard development |
| **RELAXED** | Logs only | Prototyping, spikes |

## File Classification

| Type | Patterns | Behavior |
|------|----------|----------|
| **Test** | `*.test.js`, `*.spec.ts`, `__tests__/`, `test_*.py` | Always allowed |
| **Docs** | `*.md`, `README`, `/docs/` | Always allowed |
| **Config** | `package.json`, `*.config.js`, `.eslintrc*` | Always allowed |
| **Implementation** | Everything else | Validated by phase |

## Validation Rules by Phase

| Phase | STRICT | STANDARD | RELAXED |
|-------|--------|----------|---------|
| INIT | Block | Warn | Log |
| RED | Block | Warn | Log |
| GREEN | Allow | Allow | Allow |
| REFACTOR | Allow | Allow | Allow |
| COMPLETE | Allow | Allow | Allow |

## API

### validateTestFirst(state, filePath)

```javascript
const result = await validator.validateTestFirst(state, '/src/user.js');

// Result:
{
  valid: boolean,
  phase: string,
  enforcementLevel: string,
  shouldBlock: boolean,
  shouldWarn: boolean,
  message: string,
  guidance: string|null,
  filePath: string
}
```

### File Type Detection

```javascript
validator.isTestFile('/tests/user.test.js');      // true
validator.isDocumentationFile('/README.md');       // true
validator.isConfigurationFile('/package.json');   // true
validator.isImplementationFile('/src/user.js');   // true
```

### Framework Detection

```javascript
validator.detectFramework('/project');           // 'jest'
validator.getTestCommand('/project');            // 'npm test'
validator.detectAllFrameworks('/project');       // ['jest', 'pytest']
validator.detectPackageManager('/project');      // 'pnpm'
```

## Usage Example

```javascript
const TDDValidator = require('./lib/tdd-validator');
const validator = new TDDValidator();

// In orchestration Step 2.2
const state = await stateManager.loadState(taskId);
const validation = await validator.validateTestFirst(state, targetFilePath);

if (!validation.valid && validation.shouldBlock) {
  console.error('❌ TDD Validation Failed:', validation.message);
  console.log(validation.guidance);
  throw new Error('TDD validation failed');
}

if (!validation.valid && validation.shouldWarn) {
  console.warn('⚠️ TDD Warning:', validation.message);
}
```

## Error Messages

**INIT Phase:**
> "Test-first violation: No tests have been written yet"
> Guidance: Write failing tests → Run tests → Implement → Verify

**RED Phase:**
> "Test-first violation: Tests are currently failing (N failures)"
> Guidance: Implement minimal code → Run tests → Transition to GREEN

## Troubleshooting

| Issue | Solution |
|-------|----------|
| Blocking unexpectedly | Check `state.current_phase`, ensure tests ran |
| Not blocking | Check `state.enforcement_level`, use STRICT |
| Test files validated | Check path matches test patterns, use absolute paths |

## Best Practices

1. Always use with TDD State Manager
2. Pass absolute file paths
3. Check full validation result (not just `valid`)
4. Show guidance to users
5. Use STRICT for critical code
6. Use RELAXED sparingly (spikes only)
