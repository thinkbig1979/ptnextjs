# Test Result Analyzer

The Test Result Analyzer is a utility that parses test output from Jest, Vitest, and Pytest test runners to extract structured test results, including pass/fail status, test counts, failure details, and coverage data.

## Overview

This module provides a single, unified interface for analyzing test results from different test frameworks. It handles the parsing complexity and returns a consistent, structured object regardless of the test framework used.

## Features

- **Multi-Framework Support**: Parses Jest, Vitest, and Pytest output
- **Auto-Detection**: Automatically identifies the test framework from output
- **Comprehensive Parsing**:
  - Test statistics (total, passed, failed, skipped)
  - Test suite/file counts
  - Detailed failure information (test name, error message, location, code snippet)
  - Coverage data (statements, branches, functions, lines)
  - Per-file coverage breakdown
- **Robust Error Handling**: Gracefully handles malformed, empty, or invalid output
- **Consistent API**: Returns the same data structure for all frameworks

## Installation

The analyzer is part of the Agent OS core library and requires no additional installation:

```javascript
const { analyzeTestResults } = require('./.agent-os/lib/test-result-analyzer');
```

## API Reference

### `analyzeTestResults(output, framework)`

Analyzes test output and returns structured results.

**Parameters:**
- `output` (string, required): Raw test output from Jest, Vitest, or Pytest
- `framework` (string, optional): Test framework hint ('jest', 'vitest', or 'pytest'). Auto-detects if omitted.

**Returns:** Object with the following structure:

```javascript
{
  framework: 'jest' | 'vitest' | 'pytest' | 'unknown',
  success: boolean,
  stats: {
    total: number,           // Total number of tests
    passed: number,          // Number of passing tests
    failed: number,          // Number of failing tests
    skipped: number,         // Number of skipped tests
    suitesTotal: number,     // Total test suites/files
    suitesPassed: number,    // Passing test suites/files
    suitesFailed: number     // Failing test suites/files
  },
  failures: Array<{
    testName: string,        // Full test name/path
    error: string,           // Error message
    location: string,        // File path and line number
    snippet: string          // Code snippet from failure
  }>,
  coverage: null | {
    overall: {
      statements: number,    // Overall statement coverage %
      branches: number,      // Overall branch coverage %
      functions: number,     // Overall function coverage %
      lines: number         // Overall line coverage %
    },
    files: {
      [filename]: {
        statements: number,
        branches: number,
        functions: number,
        lines: number,
        uncovered: string   // Uncovered line numbers
      }
    }
  },
  rawOutput: string,         // Original output for debugging
  error?: string            // Error message if parsing failed
}
```

## Usage Examples

### Basic Usage with Auto-Detection

```javascript
const { analyzeTestResults } = require('./.agent-os/lib/test-result-analyzer');

// Run tests and capture output
const { exec } = require('child_process');

exec('npm test', (error, stdout, stderr) => {
  const output = stdout + stderr;
  const results = analyzeTestResults(output);

  console.log(`Framework: ${results.framework}`);
  console.log(`Success: ${results.success}`);
  console.log(`Tests: ${results.stats.passed}/${results.stats.total} passed`);

  if (!results.success) {
    console.log(`\nFailures:`);
    results.failures.forEach(failure => {
      console.log(`  - ${failure.testName}`);
      console.log(`    ${failure.error}`);
      console.log(`    ${failure.location}`);
    });
  }
});
```

### Explicit Framework Specification

```javascript
const { analyzeTestResults } = require('./.agent-os/lib/test-result-analyzer');
const { execSync } = require('child_process');

// Jest
const jestOutput = execSync('npx jest', { encoding: 'utf8' });
const jestResults = analyzeTestResults(jestOutput, 'jest');

// Vitest
const vitestOutput = execSync('npx vitest run', { encoding: 'utf8' });
const vitestResults = analyzeTestResults(vitestOutput, 'vitest');

// Pytest
const pytestOutput = execSync('pytest --tb=short', { encoding: 'utf8' });
const pytestResults = analyzeTestResults(pytestOutput, 'pytest');
```

### Working with Pytest

```javascript
const { analyzeTestResults } = require('./.agent-os/lib/test-result-analyzer');
const { execSync } = require('child_process');

// Run pytest with coverage
try {
  const output = execSync('pytest --cov=src --cov-report=term', { encoding: 'utf8' });
  const results = analyzeTestResults(output, 'pytest');

  console.log(`Framework: ${results.framework}`);
  console.log(`Tests: ${results.stats.passed}/${results.stats.total} passed`);

  if (!results.success) {
    console.log('\nFailures:');
    results.failures.forEach(failure => {
      console.log(`  ${failure.testName} (${failure.location})`);
      console.log(`    Error: ${failure.error}`);
    });
  }

  if (results.coverage) {
    console.log(`\nCoverage: ${results.coverage.overall.statements}%`);
  }
} catch (error) {
  // Pytest exits with non-zero on failures, but we still get output
  const results = analyzeTestResults(error.stdout + error.stderr, 'pytest');
  console.log('Tests failed:', results.stats.failed);
}
```

### Checking Coverage Thresholds

```javascript
const { analyzeTestResults } = require('./.agent-os/lib/test-result-analyzer');

const output = /* ... test output with coverage ... */;
const results = analyzeTestResults(output);

const COVERAGE_THRESHOLD = 85;

if (results.coverage) {
  const { statements, branches, functions, lines } = results.coverage.overall;

  if (statements < COVERAGE_THRESHOLD ||
      branches < COVERAGE_THRESHOLD ||
      functions < COVERAGE_THRESHOLD ||
      lines < COVERAGE_THRESHOLD) {
    console.error('Coverage below threshold!');
    console.log(`Statements: ${statements}%`);
    console.log(`Branches: ${branches}%`);
    console.log(`Functions: ${functions}%`);
    console.log(`Lines: ${lines}%`);
    process.exit(1);
  }
} else {
  console.warn('No coverage data found in test output');
}
```

### Analyzing Per-File Coverage

```javascript
const { analyzeTestResults } = require('./.agent-os/lib/test-result-analyzer');

const output = /* ... test output with coverage ... */;
const results = analyzeTestResults(output);

if (results.coverage && results.coverage.files) {
  Object.entries(results.coverage.files).forEach(([filename, coverage]) => {
    if (coverage.lines < 80) {
      console.log(`Low coverage in ${filename}: ${coverage.lines}%`);
      console.log(`  Uncovered lines: ${coverage.uncovered}`);
    }
  });
}
```

### Integration with TDD State Manager

```javascript
const { analyzeTestResults } = require('./.agent-os/lib/test-result-analyzer');
const { TDDStateManager } = require('./.agent-os/lib/tdd-state-manager');

const stateManager = new TDDStateManager('/path/to/project');

// Run tests
const testOutput = /* ... run tests ... */;
const results = analyzeTestResults(testOutput);

// Update TDD state
const state = stateManager.getCurrentState();
state.lastTestRun = {
  timestamp: new Date().toISOString(),
  success: results.success,
  stats: results.stats,
  coverage: results.coverage,
  failures: results.failures
};
stateManager.saveState(state);

// Check if tests must pass before allowing commits
if (state.tddMode === 'strict' && !results.success) {
  console.error('Tests must pass in strict TDD mode!');
  process.exit(1);
}
```

### Error Handling

```javascript
const { analyzeTestResults } = require('./.agent-os/lib/test-result-analyzer');

const output = /* ... potentially invalid output ... */;
const results = analyzeTestResults(output);

if (results.framework === 'unknown') {
  console.error('Failed to parse test output:');
  console.error(results.error);

  // Fall back to basic success detection
  const hasFailures = output.includes('FAIL') || output.includes('failed');
  console.log(`Basic detection: ${hasFailures ? 'failures detected' : 'possibly passing'}`);
}
```

## Supported Output Formats

### Jest

The analyzer recognizes Jest output containing:
- Test suite results: `PASS` or `FAIL` followed by file path
- Summary line: `Test Suites: X failed, Y passed, Z total`
- Test counts: `Tests: X failed, Y skipped, Z passed, W total`
- Failure blocks: `● Test Suite › Test Name`
- Coverage tables with `% Stmts | % Branch | % Funcs | % Lines`

### Vitest

The analyzer recognizes Vitest output containing:
- Test file results: `✓` or `✗` followed by file path
- Summary line: `Test Files  X failed | Y passed (Z)`
- Test counts: `Tests  X failed | Y skipped | Z passed (W)`
- Failure blocks: `FAIL  file.ts > Test Suite > Test Name`
- Coverage tables with `% Stmts | % Branch | % Funcs | % Lines`

### Pytest

The analyzer recognizes Pytest output containing:
- Test session start: `===== test session starts =====`
- Test file results: `tests/test_*.py` with status indicators (`.` for pass, `F` for fail, `s` for skip)
- Summary line: `===== X passed, Y failed, Z skipped in N.NNs =====`
- Collected items: `collected N items`
- Failure blocks: `_______ test_name _______` with error details
- Coverage tables from pytest-cov: `Name     Stmts   Miss Branch BrPart  Cover   Missing`
- Special markers: `x` for xfail (expected failures), `X` for xpass (unexpected passes)

## Framework Detection

The analyzer auto-detects the framework using the following heuristics:

**Pytest indicators (checked first):**
- `test session starts` in output
- `rootdir:` configuration line
- `tests/test_*.py` file patterns
- Summary lines with `===== N passed`

**Jest indicators:**
- `Test Suites:` in output
- `PASS  tests/` pattern
- Jest-style failure markers (`●`)

**Vitest indicators:**
- `Test Files` in output
- `✓ tests/` pattern
- Vitest-style failure markers (`✗`, `FAIL`, `❯`)

If you know the framework in advance, explicitly passing it as the second parameter improves performance and accuracy.

## Error Handling

The analyzer handles various error conditions gracefully:

1. **Null/Undefined Input**: Returns error result with message "Invalid test output"
2. **Empty String**: Returns error result with message "Empty test output provided"
3. **Malformed Output**: Returns error result with message "Unable to parse test output"
4. **Unknown Framework**: Returns error result when auto-detection fails

All error results have:
- `framework: 'unknown'`
- `success: false`
- Empty stats and failures arrays
- `error` field with descriptive message

## Performance

The analyzer is designed for efficient parsing:

- **Single Pass**: Most parsing uses single-pass algorithms
- **Regex-Based**: Uses optimized regular expressions
- **Minimal Allocation**: Reuses patterns and minimizes object creation
- **Fast Auto-Detection**: Framework detection checks simple patterns first

Typical performance:
- Small output (< 1KB): < 1ms
- Medium output (1-10KB): 1-5ms
- Large output (> 10KB): 5-20ms

## Best Practices

1. **Always check `results.success`** before assuming tests passed
2. **Check `results.framework`** to ensure output was parsed correctly
3. **Handle `results.error`** when framework is 'unknown'
4. **Use explicit framework parameter** when you know the test runner
5. **Store `results.rawOutput`** for debugging when parsing fails
6. **Check for null coverage** - not all test runs include coverage data
7. **Validate coverage thresholds** before marking builds as successful

## Integration Points

The Test Result Analyzer integrates with:

1. **TDD State Manager** (`lib/tdd-state-manager.js`): Store test results and enforce TDD policies
2. **Quality Hooks** (`lib/quality-hooks.js`): Run tests automatically after file changes
3. **Task Orchestrator**: Validate tests pass before marking tasks complete
4. **CI/CD Pipelines**: Parse test results and enforce quality gates
5. **Development Workflows**: Provide immediate feedback on test status

## Testing

The analyzer itself has comprehensive test coverage (98%+) with:

- Real Jest and Vitest output fixtures
- Edge case handling (special characters, long errors, malformed output)
- Framework auto-detection validation
- Coverage parsing verification
- Consistent return value structure validation

Run the tests:

```bash
npm test -- tests/test-result-analyzer.test.js
```

Run tests with coverage:

```bash
npm test -- tests/test-result-analyzer.test.js --coverage
```

## Troubleshooting

### Issue: Framework not detected

**Symptom**: `results.framework === 'unknown'`

**Solutions**:
1. Check that output contains recognizable patterns (e.g., "Test Suites:" for Jest)
2. Ensure output is complete (not truncated)
3. Pass framework explicitly as second parameter
4. Check `results.error` for specific parsing error

### Issue: Coverage is null when it should be present

**Symptom**: `results.coverage === null` but coverage was generated

**Solutions**:
1. Ensure coverage table is included in output
2. Check that test command includes coverage flags (`--coverage` for Jest, `--coverage` for Vitest)
3. Verify coverage table format matches expected structure
4. Look for coverage data in `results.rawOutput`

### Issue: Failures not extracted correctly

**Symptom**: `results.failures` is empty but tests failed

**Solutions**:
1. Check that failure details are in the output (not just summary)
2. Verify output includes full failure blocks with error messages
3. Check for non-standard error formats
4. Examine `results.rawOutput` for actual failure format

### Issue: Stats don't match expected values

**Symptom**: Test counts are incorrect

**Solutions**:
1. Verify output contains complete summary lines
2. Check for multiple test runs in same output (use only one)
3. Look for summary format changes in newer test framework versions
4. Compare parsed values with manual count from `results.rawOutput`

## Version History

- **v1.1.0** (2024-10): Added Pytest support
  - Pytest output parsing (passing, failing, skipped tests)
  - Pytest coverage data extraction (pytest-cov)
  - Pytest failure detail parsing
  - Support for xfail/xpass markers
  - Verbose and brief output format support
  - Auto-detection for Pytest output
  - 21 additional test cases
- **v1.0.0** (2024-10): Initial implementation with Jest and Vitest support
  - Multi-framework parsing
  - Auto-detection
  - Coverage parsing
  - Comprehensive error handling
  - 98% test coverage

## Related Documentation

- **TDD State Manager**: `instructions/utilities/tdd-state-manager.md`
- **Quality Hooks**: `instructions/utilities/quality-hooks-guide.md`
- **Testing Standards**: `standards/testing/test-strategies.md`
- **Orchestrated Execution**: `ORCHESTRATED_EXECUTION_GUIDE.md`

## Support

For issues, enhancements, or questions about the Test Result Analyzer:

1. Check this documentation for common scenarios
2. Review test fixtures in `tests/fixtures/` for expected input formats
3. Examine test suite in `tests/test-result-analyzer.test.js` for usage examples
4. Check the source code in `lib/test-result-analyzer.js` for implementation details
