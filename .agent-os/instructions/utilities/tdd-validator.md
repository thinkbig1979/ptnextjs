# TDD Validator

## Overview

The TDD Validator enforces test-first development by validating TDD state before implementation. It ensures that agents follow the RED-GREEN-REFACTOR cycle by blocking or warning about implementation attempts before tests are written and passing.

**Module**: `lib/tdd-validator.js`

## Purpose

- Enforce test-first development workflow
- Prevent implementation without failing tests (RED phase)
- Prevent implementation while tests are failing
- Support three enforcement levels (STRICT, STANDARD, RELAXED)
- Integrate with TDD State Manager and Test Result Analyzer
- Provide clear, actionable guidance when violations occur

## Architecture

### Integration Points

```
┌─────────────────────────────────────────────────────────────┐
│                     TDD Validator                           │
│                                                             │
│  ┌──────────────────┐    ┌──────────────────┐            │
│  │  File Type       │    │  Enforcement     │            │
│  │  Detection       │    │  Level Handler   │            │
│  └──────────────────┘    └──────────────────┘            │
│           │                        │                       │
│           └────────────┬───────────┘                       │
│                        │                                   │
│              ┌─────────▼─────────┐                        │
│              │  Phase Validator   │                        │
│              └─────────┬─────────┘                        │
└────────────────────────┼───────────────────────────────────┘
                         │
         ┌───────────────┼───────────────┐
         │               │               │
         ▼               ▼               ▼
┌────────────────┐  ┌─────────────┐  ┌──────────────┐
│ TDD State      │  │ Test Result │  │ Quality      │
│ Manager        │  │ Analyzer    │  │ Hooks        │
└────────────────┘  └─────────────┘  └──────────────┘
```

## Enforcement Levels

The TDD Validator supports three enforcement levels, mapped from TDD State Manager levels:

### STRICT (State Manager: STRICT)

**Behavior**: Blocks implementation without passing tests

**Use Cases**:
- Critical production features
- Security-sensitive code
- Financial transactions
- Data integrity operations

**Validation Rules**:
- INIT phase: Blocks all implementation file writes
- RED phase: Blocks all implementation file writes
- GREEN phase: Allows implementation
- REFACTOR phase: Allows implementation
- COMPLETE phase: Allows implementation

### STANDARD (State Manager: BALANCED)

**Behavior**: Warns but allows implementation

**Use Cases**:
- Standard feature development
- Iterative prototyping with tests
- Educational environments
- Most production code

**Validation Rules**:
- INIT phase: Warns but allows implementation
- RED phase: Warns but allows implementation
- GREEN phase: Allows implementation (no warning)
- REFACTOR phase: Allows implementation (no warning)
- COMPLETE phase: Allows implementation (no warning)

### RELAXED (State Manager: MINIMAL)

**Behavior**: Logs only, always allows

**Use Cases**:
- Rapid prototyping
- Spike development
- Legacy code integration
- Learning TDD

**Validation Rules**:
- All phases: Logs but allows implementation

## File Type Classification

The validator automatically classifies files into categories and applies different rules:

### Test Files (Always Allowed)

**Patterns**:
- `*.test.js`, `*.test.ts`, `*.test.jsx`, `*.test.tsx`
- `*.spec.js`, `*.spec.ts`, `*.spec.jsx`, `*.spec.tsx`
- `__tests__/` directory
- `/tests/` or `/test/` directory
- `test_*.py` (Python)
- `*_test.py` (Python)
- `*_spec.rb` (Ruby)
- `/spec/` directory (Ruby)
- `*_test.rb` (Ruby)

**Behavior**: Always allowed regardless of TDD phase or enforcement level

### Documentation Files (Always Allowed)

**Patterns**:
- `*.md` (Markdown)
- `README`, `CHANGELOG`, `LICENSE`
- `/docs/` or `/doc/` directory

**Behavior**: Always allowed regardless of TDD phase or enforcement level

### Configuration Files (Always Allowed)

**Patterns**:
- `package.json`, `tsconfig.json`
- `jest.config.js`, `vitest.config.js`
- `.eslintrc*`, `.prettierrc*`, `.babelrc*`
- `webpack.config.*`, `rollup.config.*`, `vite.config.*`
- `pytest.ini`, `setup.py`, `requirements.txt`
- `Gemfile`, `.rubocop*`
- `composer.json`, `phpunit.xml`
- `Cargo.toml`, `go.mod`

**Behavior**: Always allowed regardless of TDD phase or enforcement level

### Implementation Files (Validated)

**Definition**: Any file that is not a test, documentation, or configuration file

**Behavior**: Subject to TDD phase and enforcement level validation

## API Reference

### Class: TDDValidator

#### Constructor

```javascript
const validator = new TDDValidator();
```

Initializes a new TDD Validator instance with:
- TDD State Manager integration
- File type patterns
- Enforcement level mappings

#### Method: validateTestFirst(state, filePath)

Validates if a file modification is allowed based on current TDD state.

**Parameters**:
- `state` (Object): Current TDD state from TDD State Manager
  - `current_phase`: Current TDD phase (INIT, RED, GREEN, REFACTOR, COMPLETE)
  - `enforcement_level`: Enforcement level (STRICT, BALANCED, MINIMAL)
  - `test_failures`: Number of failing tests
- `filePath` (string): Absolute path to file being modified

**Returns**: Promise<Object> with validation result:
```javascript
{
  valid: boolean,              // Overall validation result
  phase: string,               // Current TDD phase
  enforcementLevel: string,    // Normalized enforcement level
  shouldBlock: boolean,        // True if operation should be blocked
  shouldWarn: boolean,         // True if warning should be shown
  message: string,             // Human-readable message
  reason: string,              // Short reason code
  guidance: string|null,       // Detailed guidance for remediation
  filePath: string,            // File path being validated
  error?: string,              // Error message if validation failed
  testFailures?: number        // Number of failing tests (if applicable)
}
```

**Example**:
```javascript
const validator = new TDDValidator();
const state = await stateManager.loadState('task-123');

const result = await validator.validateTestFirst(state, '/src/user.js');

if (!result.valid && result.shouldBlock) {
  console.error(result.message);
  console.log(result.guidance);
  throw new Error('TDD validation failed');
}

if (!result.valid && result.shouldWarn) {
  console.warn(result.message);
  console.log(result.guidance);
}
```

#### Method: isTestFile(filePath)

Checks if a file is a test file.

**Parameters**:
- `filePath` (string): Path to check

**Returns**: boolean - True if test file

**Example**:
```javascript
validator.isTestFile('/tests/user.test.js');  // true
validator.isTestFile('/src/user.js');          // false
```

#### Method: isDocumentationFile(filePath)

Checks if a file is a documentation file.

**Parameters**:
- `filePath` (string): Path to check

**Returns**: boolean - True if documentation file

**Example**:
```javascript
validator.isDocumentationFile('/README.md');     // true
validator.isDocumentationFile('/src/user.js');   // false
```

#### Method: isConfigurationFile(filePath)

Checks if a file is a configuration file.

**Parameters**:
- `filePath` (string): Path to check

**Returns**: boolean - True if configuration file

**Example**:
```javascript
validator.isConfigurationFile('/package.json');  // true
validator.isConfigurationFile('/src/user.js');   // false
```

#### Method: isImplementationFile(filePath)

Checks if a file is an implementation file.

**Parameters**:
- `filePath` (string): Path to check

**Returns**: boolean - True if implementation file

**Example**:
```javascript
validator.isImplementationFile('/src/user.js');       // true
validator.isImplementationFile('/tests/user.test.js'); // false
```

### Framework Detection

The TDD Validator includes automatic test framework detection to discover and execute project tests.

#### Method: detectFramework(projectPath)

Detects the test framework used in a project.

**Parameters**:
- `projectPath` (string): Absolute path to project root

**Returns**: string|null - Framework name or null if not detected

**Supported Frameworks**:
- `'jest'` - Jest testing framework
- `'vitest'` - Vitest testing framework
- `'pytest'` - Python pytest framework
- `'rspec'` - Ruby RSpec framework
- `'phpunit'` - PHP PHPUnit framework

**Detection Strategy**:
1. Checks for explicit config files (highest precedence):
   - `jest.config.js`, `jest.config.ts`
   - `vitest.config.js`, `vitest.config.ts`
   - `pytest.ini`, `setup.py`
   - `Rakefile` (with RSpec content)
   - `phpunit.xml`, `phpunit.xml.dist`

2. Checks package.json scripts (fallback):
   - Looks for framework name in `test` script

3. Checks devDependencies (final fallback):
   - Detects from installed packages

**Example**:
```javascript
const framework = validator.detectFramework('/path/to/project');
console.log(framework);  // 'jest'
```

#### Method: detectAllFrameworks(projectPath)

Detects all test frameworks in a project (for multi-framework projects).

**Parameters**:
- `projectPath` (string): Absolute path to project root

**Returns**: string[] - Array of framework names

**Example**:
```javascript
const frameworks = validator.detectAllFrameworks('/path/to/project');
console.log(frameworks);  // ['jest', 'pytest']
```

#### Method: getTestCommand(projectPath, framework)

Gets the test execution command for a detected framework.

**Parameters**:
- `projectPath` (string): Absolute path to project root
- `framework` (string, optional): Framework override (auto-detects if not provided)

**Returns**: string|null - Test execution command or null

**Command Examples**:
- Jest/Vitest: `npm test`, `pnpm test`, `yarn test`
- pytest: `pytest`
- RSpec: `bundle exec rspec`
- PHPUnit: `vendor/bin/phpunit`

**Example**:
```javascript
const command = validator.getTestCommand('/path/to/project');
console.log(command);  // 'npm test'
```

#### Method: getAllTestCommands(projectPath)

Gets test commands for all detected frameworks.

**Parameters**:
- `projectPath` (string): Absolute path to project root

**Returns**: Object - Map of framework names to commands

**Example**:
```javascript
const commands = validator.getAllTestCommands('/path/to/project');
console.log(commands);
// {
//   jest: 'npm test',
//   pytest: 'pytest'
// }
```

#### Method: detectPackageManager(projectPath)

Detects the package manager from lock files.

**Parameters**:
- `projectPath` (string): Absolute path to project root

**Returns**: string - Package manager name ('npm', 'pnpm', 'yarn')

**Detection Strategy**:
- Checks for `pnpm-lock.yaml` → returns 'pnpm'
- Checks for `yarn.lock` → returns 'yarn'
- Checks for `package-lock.json` → returns 'npm'
- Defaults to 'npm'

**Example**:
```javascript
const pm = validator.detectPackageManager('/path/to/project');
console.log(pm);  // 'pnpm'
```

#### Method: getFrameworkConfig(projectPath, framework)

Retrieves framework-specific configuration.

**Parameters**:
- `projectPath` (string): Absolute path to project root
- `framework` (string): Framework name

**Returns**: Object|null - Framework configuration or null

**Configuration Examples**:

**pytest**:
```javascript
{
  testPaths: ['tests']
}
```

**RSpec**:
```javascript
{
  pattern: 'spec/**/*_spec.rb'
}
```

**Jest/Vitest/PHPUnit**:
```javascript
{
  configFile: 'jest.config.js'
}
```

**Example**:
```javascript
const config = validator.getFrameworkConfig('/path/to/project', 'pytest');
console.log(config.testPaths);  // ['tests']
```

## Usage Examples

### Example 1: Strict Mode Validation

```javascript
const TDDValidator = require('./lib/tdd-validator');
const TDDStateManager = require('./lib/tdd-state-manager');

const validator = new TDDValidator();
const stateManager = new TDDStateManager();

// Initialize state in STRICT mode
const state = stateManager.initializeState('critical-feature', 'STRICT');

// Try to implement before tests (INIT phase)
const result1 = await validator.validateTestFirst(state, '/src/payment.js');
console.log(result1);
// {
//   valid: false,
//   shouldBlock: true,
//   message: 'Test-first violation: No tests have been written yet',
//   guidance: 'Follow test-first development:\n1. Write failing tests...'
// }

// Transition to RED phase (tests written and failing)
stateManager.transitionTo(state, 'RED');
const result2 = await validator.validateTestFirst(state, '/src/payment.js');
console.log(result2);
// {
//   valid: false,
//   shouldBlock: true,
//   message: 'Test-first violation: Tests are currently failing...'
// }

// Transition to GREEN phase (tests passing)
stateManager.transitionTo(state, 'GREEN');
const result3 = await validator.validateTestFirst(state, '/src/payment.js');
console.log(result3);
// {
//   valid: true,
//   shouldBlock: false,
//   message: 'Implementation allowed in GREEN phase'
// }
```

### Example 2: Standard Mode (Warnings)

```javascript
// Initialize state in BALANCED mode (maps to STANDARD)
const state = stateManager.initializeState('feature-123', 'BALANCED');

// Try to implement before tests (INIT phase)
const result = await validator.validateTestFirst(state, '/src/feature.js');
console.log(result);
// {
//   valid: false,
//   shouldBlock: false,
//   shouldWarn: true,
//   message: 'Warning: Test-first violation: No tests have been written yet',
//   guidance: 'Follow test-first development:...\nContinuing in STANDARD mode...'
// }

// Implementation is allowed but warning is shown
```

### Example 3: Relaxed Mode (Logging Only)

```javascript
// Initialize state in MINIMAL mode (maps to RELAXED)
const state = stateManager.initializeState('prototype-spike', 'MINIMAL');

// Try to implement before tests (INIT phase)
const result = await validator.validateTestFirst(state, '/src/spike.js');
console.log(result);
// {
//   valid: true,
//   shouldBlock: false,
//   shouldWarn: false,
//   message: 'Log: Test-first violation: No tests have been written yet',
//   guidance: 'Follow test-first development:...\nContinuing in RELAXED mode...'
// }

// Implementation is allowed with log message
```

### Example 4: File Type Handling

```javascript
const state = stateManager.initializeState('feature', 'STRICT');

// Test file - always allowed
const testResult = await validator.validateTestFirst(state, '/tests/feature.test.js');
console.log(testResult.valid);  // true

// Documentation - always allowed
const docResult = await validator.validateTestFirst(state, '/README.md');
console.log(docResult.valid);  // true

// Configuration - always allowed
const configResult = await validator.validateTestFirst(state, '/package.json');
console.log(configResult.valid);  // true

// Implementation - validated based on phase
const implResult = await validator.validateTestFirst(state, '/src/feature.js');
console.log(implResult.valid);  // false (INIT phase, STRICT mode)
```

### Example 5: Framework Detection and Test Execution

```javascript
const TDDValidator = require('./lib/tdd-validator');
const validator = new TDDValidator();

// Detect framework in project
const projectPath = '/path/to/project';
const framework = validator.detectFramework(projectPath);
console.log(`Detected framework: ${framework}`);  // 'jest'

// Get test execution command
const testCommand = validator.getTestCommand(projectPath);
console.log(`Run tests with: ${testCommand}`);  // 'npm test'

// Handle multi-framework projects
const allFrameworks = validator.detectAllFrameworks(projectPath);
console.log('All frameworks:', allFrameworks);  // ['jest', 'pytest']

const allCommands = validator.getAllTestCommands(projectPath);
console.log('Test commands:', allCommands);
// {
//   jest: 'npm test',
//   pytest: 'pytest'
// }

// Get framework configuration
const config = validator.getFrameworkConfig(projectPath, 'pytest');
console.log('Test paths:', config.testPaths);  // ['tests']

// Execute tests programmatically
const { exec } = require('child_process');
const command = validator.getTestCommand(projectPath);
if (command) {
  exec(command, { cwd: projectPath }, (error, stdout, stderr) => {
    if (error) {
      console.error('Tests failed:', stderr);
    } else {
      console.log('Tests passed:', stdout);
    }
  });
}
```

## Integration with Orchestration

### Step 2.2: Pre-Implementation Validation

```javascript
// In execute-task-orchestrated.md Step 2.2 (Implementation)

// Load TDD state
const state = await stateManager.loadState(taskId);

// Validate test-first before delegating to implementation-specialist
const validation = await validator.validateTestFirst(state, targetFilePath);

if (!validation.valid && validation.shouldBlock) {
  console.error('❌ TDD Validation Failed:');
  console.error(validation.message);
  console.log('\n' + validation.guidance);

  throw new Error('Cannot proceed with implementation: TDD validation failed');
}

if (!validation.valid && validation.shouldWarn) {
  console.warn('⚠️  TDD Warning:');
  console.warn(validation.message);
  console.log('\n' + validation.guidance);
}

// Proceed with implementation...
```

## Error Messages and Guidance

### INIT Phase Violation

**Message**: "Test-first violation: No tests have been written yet"

**Guidance**:
```
Follow test-first development:
1. Write failing tests for [filename]
2. Run tests to confirm RED phase (tests fail)
3. Implement minimal code to pass tests
4. Verify GREEN phase (tests pass)
```

### RED Phase Violation

**Message**: "Test-first violation: Tests are currently failing (N failures)"

**Guidance**:
```
You are in RED phase with failing tests:
1. Implement minimal code to make tests pass
2. Run tests to verify implementation
3. Transition to GREEN phase when all tests pass
4. Then refactor if needed

Current failures: N
```

## Testing

**Test Suite**: `tests/tdd-validator.test.js`

**Coverage**: 88.05% (statements), 75.67% (branches), 100% (functions), 87.87% (lines)

**Test Categories**:
- Constructor initialization
- Test-first validation
- Enforcement level behaviors (STRICT, STANDARD, RELAXED)
- File type detection (test, doc, config, implementation)
- Error messages and guidance
- Integration with TDD State Manager
- Integration with Test Result Analyzer
- Edge cases (missing state, invalid paths, unknown phases)
- Performance (<100ms validation time)
- Multi-language support (JS/TS, Python, Ruby)
- Framework detection (Jest, Vitest, pytest, RSpec, PHPUnit)
- Test command generation
- Package manager detection (npm, pnpm, yarn)
- Multi-framework project support
- Framework configuration parsing

**Running Tests**:
```bash
# Run all TDD validator tests
npm test -- tests/tdd-validator.test.js

# Run with coverage
npm test -- tests/tdd-validator.test.js --coverage

# Run specific test suite
npm test -- tests/tdd-validator.test.js -t "enforcement levels"
```

## Performance

**Validation Time**: <100ms per validation (typically 1-5ms)

**Optimization**:
- Pattern matching uses compiled regex (fast)
- No file system operations (state passed in)
- No async operations for file type detection
- Minimal object creation

## Troubleshooting

### Issue: Validation blocking when it shouldn't

**Cause**: TDD state may be in wrong phase

**Solution**:
1. Check current phase: `state.current_phase`
2. Verify phase history: `state.phase_history`
3. Ensure tests have run and state updated to GREEN

### Issue: Validation not blocking when it should

**Cause**: Enforcement level may be too permissive

**Solution**:
1. Check enforcement level: `state.enforcement_level`
2. Verify configuration in spec or config.yml
3. For critical features, use STRICT mode

### Issue: Test files being validated

**Cause**: File type detection may be failing

**Solution**:
1. Check file path matches test patterns
2. Use absolute paths, not relative
3. Verify file extension and directory structure

### Issue: Wrong enforcement level applied

**Cause**: State Manager uses different level names

**Solution**:
- Validator maps automatically:
  - MINIMAL → RELAXED
  - BALANCED → STANDARD
  - STRICT → STRICT
- Check state.enforcement_level value

## Best Practices

1. **Always use with TDD State Manager**: Don't create state manually
2. **Pass absolute file paths**: Relative paths may not match patterns
3. **Check validation result completely**: Don't just check `valid` boolean
4. **Show guidance to users**: Help them understand what to do next
5. **Log warnings even in STANDARD mode**: Track TDD compliance metrics
6. **Use STRICT mode for critical code**: Security, payments, data integrity
7. **Use STANDARD mode for most code**: Balance enforcement with flexibility
8. **Use RELAXED mode sparingly**: Prototypes and spikes only

## Future Enhancements

- **Over-implementation detection**: Warn when implementation exceeds test scope
- **Coverage target validation**: Enforce minimum coverage thresholds
- **Test quality metrics**: Check test assertion quality
- **Custom file type patterns**: Allow configuration of file type rules
- **Validation caching**: Cache results for unchanged files
- **Multi-file validation**: Validate entire changesets atomically
- **Additional framework support**: Mocha, Jasmine, Karma, TAP, etc.
- **Framework version detection**: Detect and handle framework version differences

## References

- TDD State Manager: `instructions/utilities/tdd-state-manager.md`
- Test Result Analyzer: `instructions/utilities/test-result-analyzer.md`
- TDD Enforcement Spec: `.agent-os/specs/2025-10-26-tdd-enforcement/tdd-enforcement-v2.8-spec.md`
- Quality Hooks Guide: `instructions/utilities/quality-hooks-guide.md`

## Change Log

### v1.1.0 (2025-10-26)
- Added framework detection (Jest, Vitest, pytest, RSpec, PHPUnit)
- Added test command generation with package manager detection
- Added multi-framework project support
- Added framework configuration parsing
- Extended test suite to 74 tests (88% coverage)
- Added 5 framework detection methods
- Added support for config file detection (jest.config.js, vitest.config.ts, etc.)
- Added package manager detection (npm, pnpm, yarn)

### v1.0.0 (2025-10-26)
- Initial implementation
- Support for STRICT, STANDARD, RELAXED enforcement levels
- File type detection (test, doc, config, implementation)
- Integration with TDD State Manager
- Integration with Test Result Analyzer
- Comprehensive test suite (65 tests, 82% coverage)
- Multi-language support (JS/TS, Python, Ruby)
- Clear error messages with remediation guidance
