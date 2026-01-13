---
version: 5.1.0
last-updated: 2026-01-02
related-files:
  - standards/testing/patterns/README.md
---


# Vitest Testing Patterns

Version compatibility: Vitest 1.x - 2.x

## Module Mocking

### Basic Module Mock

```typescript
// ✅ CORRECT: Use vi.mock (NOT jest.mock)
vi.mock('./module', () => ({
  default: vi.fn(),
  named_export: vi.fn()
}));
```

### Partial Module Mock

```typescript
// Keep some real implementations, mock others
vi.mock('./module', async (importOriginal) => {
  const actual = await importOriginal<typeof import('./module')>();
  return {
    ...actual,
    specific_function: vi.fn()
  };
});
```

### Mock with Factory

```typescript
vi.mock('./api-client', () => ({
  api_client: {
    get: vi.fn(),
    post: vi.fn(),
    delete: vi.fn()
  }
}));
```

### Hoisted Mocks

```typescript
// For mocks that need to run before imports
vi.hoisted(() => {
  return {
    mock_fn: vi.fn()
  };
});
```

## Mocking Functions

### Create Mock Function

```typescript
const mock_callback = vi.fn();
const mock_with_return = vi.fn().mockReturnValue('value');
const mock_async = vi.fn().mockResolvedValue({ data: 'result' });
```

### Mock Implementation

```typescript
const mock_fn = vi.fn().mockImplementation((arg) => {
  return arg * 2;
});

// One-time implementation
mock_fn.mockImplementationOnce(() => 'first call');
```

### Spy on Object Methods

```typescript
const spy = vi.spyOn(object, 'method');
spy.mockReturnValue('mocked');

// Restore original
spy.mockRestore();
```

## Assertions

### Basic Assertions

```typescript
expect(value).toBe(expected);           // Strict equality
expect(value).toEqual(expected);        // Deep equality
expect(value).toBeDefined();
expect(value).toBeNull();
expect(value).toBeTruthy();
expect(value).toBeFalsy();
```

### Mock Assertions

```typescript
expect(mock_fn).toHaveBeenCalled();
expect(mock_fn).toHaveBeenCalledTimes(2);
expect(mock_fn).toHaveBeenCalledWith('arg1', 'arg2');
expect(mock_fn).toHaveBeenLastCalledWith('last_arg');
expect(mock_fn).toHaveReturnedWith('value');
```

### Async Assertions

```typescript
// ✅ CORRECT: Use await with async assertions
await expect(async_fn()).resolves.toBe('value');
await expect(async_fn()).rejects.toThrow('error');

// ❌ WRONG: Missing await
expect(async_fn()).resolves.toBe('value');  // May not work as expected
```

### Array/Object Assertions

```typescript
expect(array).toContain(item);
expect(array).toHaveLength(3);
expect(object).toHaveProperty('key');
expect(object).toMatchObject({ partial: 'match' });
```

## Lifecycle Hooks

### Setup and Teardown

```typescript
beforeAll(async () => {
  // Run once before all tests in file
  await setup_database();
});

afterAll(async () => {
  // Run once after all tests in file
  await cleanup_database();
});

beforeEach(() => {
  // Run before each test
  vi.clearAllMocks();
});

afterEach(() => {
  // Run after each test
  vi.restoreAllMocks();
});
```

### Clearing Mocks

```typescript
// Clear mock call history (keeps implementation)
vi.clearAllMocks();
mock_fn.mockClear();

// Reset mock (clears calls and returns undefined)
vi.resetAllMocks();
mock_fn.mockReset();

// Restore original implementation
vi.restoreAllMocks();
mock_fn.mockRestore();
```

## Async Testing

### Async/Await Pattern

```typescript
it('handles async operations', async () => {
  const result = await fetch_data();
  expect(result).toBeDefined();
});
```

### Testing Promises

```typescript
it('resolves correctly', async () => {
  await expect(promise_fn()).resolves.toEqual({ data: 'value' });
});

it('rejects with error', async () => {
  await expect(failing_fn()).rejects.toThrow('Error message');
});
```

### Fake Timers

```typescript
beforeEach(() => {
  vi.useFakeTimers();
});

afterEach(() => {
  vi.useRealTimers();
});

it('handles timers', async () => {
  const callback = vi.fn();
  setTimeout(callback, 1000);

  vi.advanceTimersByTime(1000);

  expect(callback).toHaveBeenCalled();
});
```

## Test Organization

### Describe Blocks

```typescript
describe('UserService', () => {
  describe('createUser', () => {
    it('creates user with valid data', () => {});
    it('throws error for invalid email', () => {});
  });

  describe('deleteUser', () => {
    it('deletes existing user', () => {});
    it('throws error for non-existent user', () => {});
  });
});
```

### Test Modifiers

```typescript
it.skip('skips this test', () => {});
it.only('runs only this test', () => {});  // ⚠️ Remove before commit
it.todo('implement this test later');
it.each([
  [1, 1, 2],
  [2, 2, 4],
])('adds %i + %i = %i', (a, b, expected) => {
  expect(a + b).toBe(expected);
});
```

## Configuration

### vitest.config.ts

```typescript
import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    globals: true,
    environment: 'node',  // or 'jsdom' for browser
    setupFiles: ['./tests/setup.ts'],
    coverage: {
      provider: 'v8',
      reporter: ['text', 'html'],
    },
    testTimeout: 10000,
    hookTimeout: 10000,
  },
});
```

## Anti-Patterns to Avoid

### ❌ Using jest.mock

```typescript
// ❌ WRONG: Jest syntax doesn't work in Vitest
jest.mock('./module');

// ✅ CORRECT: Use vi.mock
vi.mock('./module');
```

### ❌ Missing await on async assertions

```typescript
// ❌ WRONG: May pass incorrectly
expect(asyncFn()).resolves.toBe(true);

// ✅ CORRECT: Always await
await expect(asyncFn()).resolves.toBe(true);
```

### ❌ Not clearing mocks between tests

```typescript
// ❌ WRONG: Mock state bleeds between tests
const mock = vi.fn();

it('test 1', () => {
  mock('call 1');
});

it('test 2', () => {
  // mock still has 'call 1' in history!
  expect(mock).toHaveBeenCalledTimes(1);  // FAILS
});

// ✅ CORRECT: Clear mocks in beforeEach
beforeEach(() => {
  vi.clearAllMocks();
});
```

### ❌ Using .only() in committed code

```typescript
// ❌ WRONG: Committed .only() skips other tests
it.only('this test', () => {});

// ✅ CORRECT: Remove .only() before commit
it('this test', () => {});
```
