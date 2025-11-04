# TDD State Manager

## Overview

The TDD State Manager is a core utility for Agent OS v2.7+ that tracks and enforces the RED-GREEN-REFACTOR cycle throughout task execution. It ensures proper Test-Driven Development practices by maintaining state, validating transitions, and persisting TDD cycle information to JSON files.

## Purpose

The TDD State Manager provides:

- **State Tracking**: Maintains current TDD phase and complete phase history
- **Transition Validation**: Enforces valid state transitions according to TDD principles
- **Test Metrics**: Tracks test counts and success rates
- **State Persistence**: Saves and loads state from JSON files
- **Enforcement Levels**: Supports MINIMAL, BALANCED, and STRICT enforcement modes

## State Model

### State Object Structure

```javascript
{
  task_id: "task-001",                    // Unique task identifier
  current_phase: "RED",                   // Current TDD phase
  enforcement_level: "STRICT",            // Enforcement strictness level
  phase_history: [                        // Complete phase transition history
    {
      phase: "INIT",
      timestamp: "2025-10-26T10:30:00.000Z"
    },
    {
      phase: "RED",
      timestamp: "2025-10-26T10:32:15.000Z"
    }
  ],
  created_at: "2025-10-26T10:30:00.000Z", // State creation timestamp
  updated_at: "2025-10-26T10:32:15.000Z", // Last update timestamp
  test_count: 10,                         // Total number of tests
  test_failures: 2,                       // Number of failing tests
  blocked_transitions: [                  // Record of invalid transition attempts
    {
      from: "INIT",
      to: "GREEN",
      timestamp: "2025-10-26T10:31:00.000Z",
      reason: "Invalid transition from INIT to GREEN"
    }
  ]
}
```

### TDD Phases

The state manager recognizes five distinct phases:

1. **INIT**: Initial state before TDD cycle begins
2. **RED**: Writing failing tests phase
3. **GREEN**: Implementing minimum code to pass tests phase
4. **REFACTOR**: Code improvement and optimization phase
5. **COMPLETE**: Task completion after successful TDD cycles

### Enforcement Levels

Three enforcement levels control TDD strictness:

- **MINIMAL**: Basic state tracking with flexible enforcement
- **BALANCED**: Standard enforcement with some flexibility
- **STRICT**: Full TDD enforcement with no shortcuts (default)

All enforcement levels follow the same state transition rules - the level affects how the orchestrator responds to state violations, not the state machine itself.

## Valid State Transitions

The TDD State Manager enforces the following state transition rules:

```
INIT → RED
  ↓
RED → GREEN
  ↓
GREEN → REFACTOR → RED (iterative cycle)
  ↓         ↓
  ↓    COMPLETE
  ↓
COMPLETE
```

### Transition Rules

| From Phase | Valid Next Phases | Description |
|------------|-------------------|-------------|
| INIT | RED | Must start by writing failing tests |
| RED | GREEN | After tests fail, implement code to pass them |
| GREEN | REFACTOR, COMPLETE | After tests pass, either refactor or complete |
| REFACTOR | RED, COMPLETE | After refactoring, start new cycle or complete |
| COMPLETE | (none) | Terminal state, no transitions allowed |

### Invalid Transitions (Blocked)

The following transitions are explicitly blocked:

- INIT → GREEN, REFACTOR, COMPLETE (must start with RED)
- RED → REFACTOR, COMPLETE (must go through GREEN)
- GREEN → RED (cannot skip refactor to return to RED)
- COMPLETE → any phase (terminal state)

When an invalid transition is attempted, the state manager:
1. Throws an error with a clear message
2. Records the blocked transition in `blocked_transitions` array
3. Does not modify the `current_phase`

## API Reference

### Class: `TDDStateManager`

#### Constructor

```javascript
const TDDStateManager = require('../lib/tdd-state-manager');
const stateManager = new TDDStateManager();
```

Creates a new TDD State Manager instance. The state directory is automatically set to `.agent-os/tdd-state/`.

#### Methods

##### `initializeState(taskId, enforcementLevel = 'STRICT')`

Initialize a new TDD state for a task.

**Parameters:**
- `taskId` (string, required): Unique task identifier
- `enforcementLevel` (string, optional): Enforcement level - 'MINIMAL', 'BALANCED', or 'STRICT' (default: 'STRICT')

**Returns:** State object

**Throws:** Error if `taskId` is missing or empty

**Example:**
```javascript
const state = stateManager.initializeState('task-001', 'STRICT');
// Returns initial state with current_phase = 'INIT'
```

##### `transitionTo(state, toPhase)`

Transition state to a new phase with validation.

**Parameters:**
- `state` (object, required): Current state object
- `toPhase` (string, required): Target phase ('RED', 'GREEN', 'REFACTOR', or 'COMPLETE')

**Returns:** Updated state object

**Throws:**
- Error if state is missing
- Error if target phase is unknown
- Error if transition is invalid

**Example:**
```javascript
let state = stateManager.initializeState('task-001');
state = stateManager.transitionTo(state, 'RED');
state = stateManager.transitionTo(state, 'GREEN');
// state.current_phase is now 'GREEN'
```

##### `saveState(state)`

Save state to JSON file in `.agent-os/tdd-state/[task-id].json`.

**Parameters:**
- `state` (object, required): State object to save

**Returns:** Promise<void>

**Example:**
```javascript
await stateManager.saveState(state);
// State saved to .agent-os/tdd-state/task-001.json
```

##### `loadState(taskId)`

Load state from JSON file.

**Parameters:**
- `taskId` (string, required): Task identifier

**Returns:** Promise<object> - Loaded state object

**Throws:**
- Error if state file not found
- Error if JSON is malformed
- Error if state structure is invalid

**Example:**
```javascript
const state = await stateManager.loadState('task-001');
console.log(state.current_phase); // e.g., 'GREEN'
```

##### `cleanupState(taskId)`

Delete state file for a task.

**Parameters:**
- `taskId` (string, required): Task identifier

**Returns:** Promise<object> - Cleanup result with `success` and `task_id` fields

**Example:**
```javascript
const result = await stateManager.cleanupState('task-001');
// { success: true, task_id: 'task-001' }
```

##### `validateState(state)`

Validate state object structure and values.

**Parameters:**
- `state` (object, required): State object to validate

**Returns:** boolean - `true` if valid, `false` otherwise

**Example:**
```javascript
const isValid = stateManager.validateState(state);
if (!isValid) {
  console.error('Invalid state structure');
}
```

##### `updateTestMetrics(state, testCount, testFailures)`

Update test metrics in state.

**Parameters:**
- `state` (object, required): Current state
- `testCount` (number, required): Total number of tests
- `testFailures` (number, required): Number of failing tests

**Returns:** Updated state object

**Example:**
```javascript
const updatedState = stateManager.updateTestMetrics(state, 25, 3);
// state.test_count = 25, state.test_failures = 3
```

##### `getTestSuccessRate(state)`

Calculate test success rate.

**Parameters:**
- `state` (object, required): Current state

**Returns:** number - Success rate from 0.0 to 1.0

**Example:**
```javascript
const successRate = stateManager.getTestSuccessRate(state);
console.log(`Success rate: ${(successRate * 100).toFixed(1)}%`);
// Success rate: 88.0%
```

##### `getCurrentCycle(state)`

Get current TDD cycle number (0-based).

**Parameters:**
- `state` (object, required): Current state

**Returns:** number - Cycle number (counts how many times RED phase was entered)

**Example:**
```javascript
const cycle = stateManager.getCurrentCycle(state);
console.log(`Currently in cycle ${cycle}`);
// Currently in cycle 2
```

## Usage Examples

### Basic TDD Workflow

```javascript
const TDDStateManager = require('../lib/tdd-state-manager');
const stateManager = new TDDStateManager();

// 1. Initialize state for a task
let state = stateManager.initializeState('feature-001', 'STRICT');

// 2. Save initial state
await stateManager.saveState(state);

// 3. Transition to RED phase (write failing tests)
state = stateManager.transitionTo(state, 'RED');
await stateManager.saveState(state);

// 4. Run tests and update metrics
state = stateManager.updateTestMetrics(state, 10, 10); // All tests failing
await stateManager.saveState(state);

// 5. Transition to GREEN phase (implement code)
state = stateManager.transitionTo(state, 'GREEN');
await stateManager.saveState(state);

// 6. Run tests and update metrics
state = stateManager.updateTestMetrics(state, 10, 0); // All tests passing
const successRate = stateManager.getTestSuccessRate(state);
console.log(`Test success rate: ${(successRate * 100)}%`); // 100%

// 7. Transition to REFACTOR phase
state = stateManager.transitionTo(state, 'REFACTOR');
await stateManager.saveState(state);

// 8. Complete the task
state = stateManager.transitionTo(state, 'COMPLETE');
await stateManager.saveState(state);

// 9. Cleanup when done
await stateManager.cleanupState('feature-001');
```

### Iterative TDD Cycles

```javascript
// Start task
let state = stateManager.initializeState('feature-002');

// First cycle
state = stateManager.transitionTo(state, 'RED');
state = stateManager.transitionTo(state, 'GREEN');
state = stateManager.transitionTo(state, 'REFACTOR');

// Second cycle (add more tests)
state = stateManager.transitionTo(state, 'RED');
state = stateManager.updateTestMetrics(state, 15, 3);
state = stateManager.transitionTo(state, 'GREEN');
state = stateManager.updateTestMetrics(state, 15, 0);
state = stateManager.transitionTo(state, 'REFACTOR');

// Third cycle
state = stateManager.transitionTo(state, 'RED');
state = stateManager.transitionTo(state, 'GREEN');
state = stateManager.transitionTo(state, 'COMPLETE');

const cycle = stateManager.getCurrentCycle(state);
console.log(`Completed ${cycle} TDD cycles`); // Completed 3 TDD cycles
```

### Loading and Resuming State

```javascript
// Resume a task that was interrupted
try {
  const state = await stateManager.loadState('feature-003');

  console.log(`Resuming from phase: ${state.current_phase}`);
  console.log(`Completed ${state.phase_history.length - 1} transitions`);

  // Continue from where we left off
  if (state.current_phase === 'RED') {
    // Implement code to pass tests
    const newState = stateManager.transitionTo(state, 'GREEN');
    await stateManager.saveState(newState);
  }
} catch (error) {
  console.error(`Failed to resume: ${error.message}`);
}
```

### Error Handling

```javascript
let state = stateManager.initializeState('feature-004');

// Attempt invalid transition
try {
  state = stateManager.transitionTo(state, 'GREEN'); // Invalid: INIT → GREEN
} catch (error) {
  console.error(error.message);
  // "Invalid transition from INIT to GREEN"

  // Check blocked transitions
  console.log(state.blocked_transitions);
  // [{from: 'INIT', to: 'GREEN', timestamp: '...', reason: '...'}]
}

// Correct approach
state = stateManager.transitionTo(state, 'RED'); // Valid: INIT → RED
state = stateManager.transitionTo(state, 'GREEN'); // Valid: RED → GREEN
```

### State Validation

```javascript
// Validate before using loaded state
const loadedState = await stateManager.loadState('feature-005');

if (!stateManager.validateState(loadedState)) {
  throw new Error('Loaded state is corrupted or invalid');
}

// Proceed with valid state
const nextState = stateManager.transitionTo(loadedState, 'REFACTOR');
```

## Integration with Agent OS

### Task Orchestrator Integration

The TDD State Manager integrates with the task orchestrator to enforce TDD practices:

```javascript
// In execute-task-orchestrated.md workflow

// Step 1: Initialize TDD state
const tddStateManager = new TDDStateManager();
let tddState = tddStateManager.initializeState(taskId, enforcementLevel);
await tddStateManager.saveState(tddState);

// Step 2: RED phase - Write tests
tddState = tddStateManager.transitionTo(tddState, 'RED');
await executeTestArchitect(taskId, tddState);

// Step 3: GREEN phase - Implement code
tddState = tddStateManager.transitionTo(tddState, 'GREEN');
await executeImplementation(taskId, tddState);

// Step 4: REFACTOR phase (optional)
if (needsRefactoring) {
  tddState = tddStateManager.transitionTo(tddState, 'REFACTOR');
  await executeRefactoring(taskId, tddState);
}

// Step 5: Complete
tddState = stateManager.transitionTo(tddState, 'COMPLETE');
await tddStateManager.cleanupState(taskId);
```

### State File Location

State files are stored at:
```
.agent-os/tdd-state/[task-id].json
```

Example:
```
.agent-os/tdd-state/task-001.json
.agent-os/tdd-state/feature-auth-001.json
.agent-os/tdd-state/bug-fix-123.json
```

### Enforcement Level Mapping

| Enforcement Level | Task Execution Behavior |
|------------------|-------------------------|
| MINIMAL | Track state, but allow proceeding without full TDD cycle |
| BALANCED | Encourage TDD, warn on skipped phases, allow with confirmation |
| STRICT | Require complete TDD cycle, block task completion if cycle incomplete |

## Error Messages

### Common Errors

**Missing task_id:**
```
Error: task_id is required
```

**Invalid transition:**
```
Error: Invalid transition from INIT to GREEN
```

**Unknown phase:**
```
Error: Unknown phase: INVALID_PHASE
```

**State file not found:**
```
Error: State file not found for task: task-001
```

**Corrupted state file:**
```
Error: Failed to parse state file
```

**Invalid state structure:**
```
Error: Invalid state structure
```

**Missing state object:**
```
Error: State object is required
```

## Testing

The TDD State Manager has comprehensive test coverage:

- **Test Suite**: `tests/tdd-state-manager.test.js`
- **Test Count**: 51 tests
- **Code Coverage**: 96% statement coverage, 97.26% line coverage
- **Test Categories**:
  - State initialization (7 tests)
  - Valid state transitions (7 tests)
  - Invalid state transitions (7 tests)
  - State persistence (5 tests)
  - State loading (5 tests)
  - State cleanup (3 tests)
  - State validation (4 tests)
  - Test metrics tracking (4 tests)
  - Phase history (3 tests)
  - Edge cases and error handling (6 tests)

### Running Tests

```bash
# Run TDD State Manager tests
npm test -- tests/tdd-state-manager.test.js

# Run with coverage
npm test -- tests/tdd-state-manager.test.js --coverage --collectCoverageFrom='lib/tdd-state-manager.js'
```

## Best Practices

### 1. Always Save State After Transitions

```javascript
// Good
state = stateManager.transitionTo(state, 'RED');
await stateManager.saveState(state);

// Bad - state not persisted
state = stateManager.transitionTo(state, 'RED');
// Missing await stateManager.saveState(state);
```

### 2. Update Test Metrics Regularly

```javascript
// After running tests
const testResults = await runTests();
state = stateManager.updateTestMetrics(
  state,
  testResults.total,
  testResults.failures
);
await stateManager.saveState(state);
```

### 3. Handle Errors Gracefully

```javascript
try {
  state = stateManager.transitionTo(state, nextPhase);
} catch (error) {
  console.error(`Transition failed: ${error.message}`);
  // Log blocked transition
  console.log('Blocked transitions:', state.blocked_transitions);
  // Determine correct next phase
}
```

### 4. Validate State After Loading

```javascript
const state = await stateManager.loadState(taskId);
if (!stateManager.validateState(state)) {
  throw new Error('State validation failed - recreating state');
  state = stateManager.initializeState(taskId);
}
```

### 5. Clean Up Completed Tasks

```javascript
// After task completion
await stateManager.cleanupState(taskId);
```

## Advanced Features

### Tracking Multiple Cycles

The phase history tracks every transition, allowing analysis of TDD patterns:

```javascript
const state = await stateManager.loadState(taskId);

// Analyze TDD cycle count
const cycleCount = stateManager.getCurrentCycle(state);
console.log(`Task completed ${cycleCount} TDD cycles`);

// Analyze time spent in each phase
const phaseHistory = state.phase_history;
for (let i = 1; i < phaseHistory.length; i++) {
  const phase = phaseHistory[i];
  const prevPhase = phaseHistory[i - 1];

  const duration = new Date(phase.timestamp) - new Date(prevPhase.timestamp);
  console.log(`${prevPhase.phase}: ${duration}ms`);
}
```

### Blocked Transition Analysis

```javascript
// Identify common mistakes
const blockedTransitions = state.blocked_transitions;

const transitionCounts = blockedTransitions.reduce((acc, bt) => {
  const key = `${bt.from} → ${bt.to}`;
  acc[key] = (acc[key] || 0) + 1;
  return acc;
}, {});

console.log('Most common invalid transitions:', transitionCounts);
// { 'INIT → GREEN': 3, 'RED → COMPLETE': 1 }
```

### State Recovery

```javascript
// Recover from corrupted state
async function recoverState(taskId) {
  try {
    return await stateManager.loadState(taskId);
  } catch (error) {
    console.warn(`State recovery failed: ${error.message}`);
    console.log('Creating new state...');

    const newState = stateManager.initializeState(taskId);
    await stateManager.saveState(newState);
    return newState;
  }
}
```

## Troubleshooting

### State File Permissions

If you encounter permission errors:

```bash
chmod 755 .agent-os/tdd-state
chmod 644 .agent-os/tdd-state/*.json
```

### State Directory Missing

The state manager automatically creates the directory, but if issues persist:

```bash
mkdir -p .agent-os/tdd-state
```

### Invalid State Structure

If a state file is corrupted:

1. Delete the corrupted file: `rm .agent-os/tdd-state/[task-id].json`
2. Reinitialize state: `stateManager.initializeState(taskId)`
3. Save new state: `await stateManager.saveState(state)`

## Future Enhancements

Potential enhancements for future versions:

- State migration utilities for version upgrades
- State visualization dashboard
- Integration with metrics collection
- Automatic cycle time analysis
- Team-wide TDD compliance reporting
- State diff functionality for debugging

## References

- Agent OS v2.7.0 Documentation
- TDD Enforcement Specification: `specs/tdd-enforcement.md`
- Task Orchestration Guide: `ORCHESTRATED_EXECUTION_GUIDE.md`
- Quality Standards: `standards/best-practices.md`

## Version History

- **v1.0.0** (2025-10-26): Initial implementation with core state management, transition validation, persistence, and comprehensive test coverage.
