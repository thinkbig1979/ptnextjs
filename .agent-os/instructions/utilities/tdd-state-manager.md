# TDD State Manager

Tracks and enforces RED-GREEN-REFACTOR cycle throughout task execution.

**Module**: `lib/tdd-state-manager.js`

## State Model

```javascript
{
  task_id: "task-001",
  current_phase: "RED",              // INIT | RED | GREEN | REFACTOR | COMPLETE
  enforcement_level: "STRICT",       // MINIMAL | BALANCED | STRICT
  phase_history: [{phase, timestamp}],
  created_at: "ISO_TIMESTAMP",
  updated_at: "ISO_TIMESTAMP",
  test_count: 10,
  test_failures: 2,
  blocked_transitions: [{from, to, timestamp, reason}]
}
```

## Valid Transitions

```
INIT → RED → GREEN → REFACTOR → RED (cycle)
                  ↘           ↘
                   COMPLETE ← COMPLETE
```

| From | Valid Next |
|------|------------|
| INIT | RED |
| RED | GREEN |
| GREEN | REFACTOR, COMPLETE |
| REFACTOR | RED, COMPLETE |
| COMPLETE | (none - terminal) |

## Enforcement Levels

| Level | Behavior |
|-------|----------|
| MINIMAL | Track state, flexible enforcement |
| BALANCED | Encourage TDD, warn on skips |
| STRICT | Require full cycle, block incomplete |

## API

### Initialize State
```javascript
const stateManager = new TDDStateManager();
const state = stateManager.initializeState('task-001', 'STRICT');
```

### Transition
```javascript
state = stateManager.transitionTo(state, 'RED');
state = stateManager.transitionTo(state, 'GREEN');
```

### Persist
```javascript
await stateManager.saveState(state);
const loaded = await stateManager.loadState('task-001');
await stateManager.cleanupState('task-001');
```

### Metrics
```javascript
state = stateManager.updateTestMetrics(state, 25, 3);
const rate = stateManager.getTestSuccessRate(state); // 0.88
const cycle = stateManager.getCurrentCycle(state);    // 2
```

### Validate
```javascript
const isValid = stateManager.validateState(state);
```

## Usage Example

```javascript
// Basic TDD workflow
let state = stateManager.initializeState('feature-001', 'STRICT');
await stateManager.saveState(state);

// RED phase
state = stateManager.transitionTo(state, 'RED');
state = stateManager.updateTestMetrics(state, 10, 10); // All failing
await stateManager.saveState(state);

// GREEN phase
state = stateManager.transitionTo(state, 'GREEN');
state = stateManager.updateTestMetrics(state, 10, 0); // All passing
await stateManager.saveState(state);

// REFACTOR phase
state = stateManager.transitionTo(state, 'REFACTOR');
await stateManager.saveState(state);

// Complete
state = stateManager.transitionTo(state, 'COMPLETE');
await stateManager.cleanupState('feature-001');
```

## Error Handling

```javascript
try {
  state = stateManager.transitionTo(state, 'GREEN'); // Invalid from INIT
} catch (error) {
  console.error(error.message); // "Invalid transition from INIT to GREEN"
  console.log(state.blocked_transitions); // Records the attempt
}
```

## State Files

Location: `.agent-os/tdd-state/[task-id].json`

## Best Practices

1. Always save state after transitions
2. Update test metrics after running tests
3. Handle errors gracefully
4. Validate state after loading
5. Clean up completed tasks
