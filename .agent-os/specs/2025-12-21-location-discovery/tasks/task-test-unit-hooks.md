# Task: Write Unit Tests for Location Hooks

## Metadata
- **Task ID**: test-unit-hooks
- **Phase**: 5 - Testing
- **Agent**: test-architect
- **Estimated Time**: 45-60 min
- **Dependencies**: impl-location-preference-hook, impl-nearby-vendors-category-hook
- **Status**: pending

## Description

Write comprehensive unit tests for the two new location-related hooks.

## Specifics

### Test Files to Create

#### 1. `hooks/__tests__/useLocationPreference.test.ts`

```typescript
import { renderHook, act } from '@testing-library/react';
import { useLocationPreference } from '../useLocationPreference';

describe('useLocationPreference', () => {
  beforeEach(() => {
    localStorage.clear();
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  describe('initial state', () => {
    it('returns null when no stored location', () => {});
    it('returns stored location when valid', () => {});
    it('clears expired location automatically', () => {});
    it('handles invalid JSON gracefully', () => {});
  });

  describe('setLocation', () => {
    it('stores location with timestamp', () => {});
    it('updates state immediately', () => {});
  });

  describe('clearLocation', () => {
    it('removes from localStorage', () => {});
    it('updates state to null', () => {});
  });

  describe('SSR behavior', () => {
    it('returns null when window is undefined', () => {});
  });
});
```

#### 2. `hooks/__tests__/useNearbyVendorsByCategory.test.ts`

```typescript
import { renderHook } from '@testing-library/react';
import { useNearbyVendorsByCategory } from '../useNearbyVendorsByCategory';

const mockVendors = [/* test fixtures */];
const mockProducts = [/* test fixtures */];

describe('useNearbyVendorsByCategory', () => {
  describe('category filtering', () => {
    it('returns only vendors with products in category', () => {});
    it('returns empty when no vendors match category', () => {});
  });

  describe('location filtering', () => {
    it('filters by distance when location provided', () => {});
    it('returns all category vendors when no location', () => {});
    it('respects radius parameter', () => {});
  });

  describe('vendor exclusion', () => {
    it('excludes specified vendor ID', () => {});
  });

  describe('productsInCategory count', () => {
    it('calculates correct product count per vendor', () => {});
  });

  describe('sorting and limiting', () => {
    it('sorts by distance ascending', () => {});
    it('limits to maxResults', () => {});
  });
});
```

### Test Fixtures
Create reusable fixtures in `hooks/__tests__/fixtures/`:
- `vendors.ts` - Mock vendor data with locations
- `products.ts` - Mock product data with categories

## Acceptance Criteria

- [ ] All test files created and passing
- [ ] >90% code coverage for both hooks
- [ ] Edge cases covered (empty arrays, null values)
- [ ] SSR scenario tested for useLocationPreference
- [ ] localStorage mocking works correctly

## Testing Requirements

Run tests:
```bash
npm run test -- --watch hooks/__tests__/useLocationPreference.test.ts
npm run test -- --watch hooks/__tests__/useNearbyVendorsByCategory.test.ts
```

## Related Files
- `hooks/useLocationPreference.ts`
- `hooks/useNearbyVendorsByCategory.ts`
- `hooks/__tests__/*.test.ts` - Existing test patterns
