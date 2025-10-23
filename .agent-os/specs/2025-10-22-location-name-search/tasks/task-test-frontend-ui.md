# Task: test-frontend-ui - Design Frontend UI Test Suite

**Metadata:**
- **Task ID:** test-frontend-ui
- **Phase:** Phase 3: Frontend Implementation
- **Agent:** test-architect
- **Estimated Time:** 15-20 min
- **Dependencies:** test-backend-integration
- **Status:** Pending
- **Priority:** High

## Description

Design comprehensive test suite for location search UI components covering user interactions, state management, API integration, and edge cases.

## Specifics

**Test Categories:**

1. **LocationResultSelector Component Tests:**
   - Render with multiple results
   - Result selection triggers onSelect callback
   - Cancel button triggers onCancel callback
   - Dialog open/close state management
   - ScrollArea scrolls with many results (>10)
   - Display formatting (City, Region, Country)
   - MapPin icon rendering
   - Keyboard navigation (arrow keys, enter, escape)
   - Accessibility (ARIA labels, roles)

2. **LocationSearchFilter Component Tests:**
   - Location name input rendering
   - Input debouncing (300ms delay)
   - Loading state display during API call
   - Single result auto-apply behavior
   - Multiple results show selector dialog
   - Result selection updates coordinates
   - Distance slider interaction
   - Advanced coordinate input toggle (Collapsible)
   - Manual coordinate input fallback
   - Reset functionality clears all filters
   - Error state display (API errors, network errors)
   - Empty results handling ("No locations found")

3. **Unit Mismatch Fix Tests:**
   - useLocationFilter calculates distance in km
   - UI displays distance as "km"
   - Distance conversion accuracy (test with known coordinates)
   - Existing vendor filtering still works
   - isWithinDistance uses km correctly

4. **State Management Tests:**
   - locationInput state updates
   - searchResults state populated from API
   - showResultSelector state controls dialog
   - isLoading state during async operations
   - selectedCoordinates state after selection
   - Form state persistence during interactions

5. **API Integration Tests:**
   - Successful geocoding API call
   - API error handling (400, 429, 500, 503)
   - Network error handling
   - Rate limit error display
   - Retry logic (if implemented)
   - API response transformation

6. **User Interaction Tests:**
   - Type location name → debounced API call
   - Single result → coordinates auto-applied
   - Multiple results → dialog opens
   - Select result → dialog closes, filter applied
   - Cancel dialog → no filter applied
   - Adjust distance slider → filter updates
   - Toggle advanced mode → coordinate inputs shown
   - Enter manual coordinates → filter applied
   - Reset button → all inputs cleared

**Files to Create:**
- `/home/edwin/development/ptnextjs/tests/unit/components/LocationResultSelector.test.tsx` (NEW)
- `/home/edwin/development/ptnextjs/tests/unit/components/LocationSearchFilter.test.tsx` (NEW)
- `/home/edwin/development/ptnextjs/tests/unit/hooks/useLocationFilter.test.ts` (NEW)

**Test Framework:**
- React Testing Library for component tests
- Jest for unit tests
- Mock Service Worker (MSW) for API mocking
- @testing-library/user-event for user interactions

## Acceptance Criteria

- [ ] Component test suites cover all user interactions
- [ ] State management tests verify correct state updates
- [ ] API integration tests with mocked responses
- [ ] Unit mismatch fix tests verify km calculations
- [ ] Accessibility tests included (ARIA, keyboard nav)
- [ ] Error scenarios have dedicated tests
- [ ] Loading states tested
- [ ] All tests follow Testing Library best practices
- [ ] Test coverage > 90% for new components

## Testing Requirements

**Functional Testing:**
- Test suite validates component behavior
- All tests runnable with `npm test`
- Tests are independent and isolated

**Manual Verification:**
- Review test scenarios match specification
- Validate mock data represents real cases
- Confirm accessibility tests are comprehensive

**Evidence Required:**
- Complete test suite files
- Test execution report (all passing against stub components)
- Coverage report showing >90% coverage
- Accessibility test results

## Context Requirements

**Required Context:**
- @.agent-os/specs/2025-10-22-location-name-search/spec.md
- @.agent-os/specs/2025-10-22-location-name-search/sub-specs/technical-spec.md
- @.agent-os/specs/2025-10-22-location-name-search/tasks/task-pre-2.md
- Existing component structure from pre-1 analysis

**Assumptions:**
- React Testing Library is configured
- Jest is configured for React components
- MSW is available for API mocking
- TypeScript test support configured

## Implementation Notes

**Test Structure Pattern:**

```typescript
describe('LocationResultSelector', () => {
  it('should display multiple results in scrollable list', () => {
    // Arrange: Render with 10 results
    // Act: Verify ScrollArea renders
    // Assert: All results visible
  });

  it('should call onSelect when result is clicked', async () => {
    // Arrange: Render with results
    // Act: User clicks a result
    // Assert: onSelect called with correct result
  });
});

describe('LocationSearchFilter', () => {
  it('should debounce location input and call geocode API', async () => {
    // Arrange: Render component
    // Act: Type "Monaco" quickly
    // Assert: Only one API call after 300ms
  });

  it('should auto-apply filter when single result returned', async () => {
    // Arrange: Mock API returns single result
    // Act: Type location name
    // Assert: Filter applied without dialog
  });

  it('should show selector dialog when multiple results returned', async () => {
    // Arrange: Mock API returns 3 results
    // Act: Type location name
    // Assert: Dialog opens with 3 results
  });
});

describe('useLocationFilter (unit fix)', () => {
  it('should calculate distance in kilometers', () => {
    // Test with known coordinates
    // Monaco to Nice: ~20 km
    const distance = calculateDistance(
      { lat: 43.7384, lon: 7.4246 },  // Monaco
      { lat: 43.7102, lon: 7.2620 }   // Nice
    );
    expect(distance).toBeCloseTo(20, 1);  // ~20 km
  });
});
```

**Mock API Responses:**

```typescript
// MSW handler for geocode API
rest.get('/api/geocode', (req, res, ctx) => {
  const query = req.url.searchParams.get('q');

  if (query === 'Monaco') {
    return res(ctx.json({
      success: true,
      results: [
        {
          coordinates: { lat: 43.7384, lon: 7.4246 },
          display_name: 'Monaco, Monaco',
          type: 'city',
          country: 'Monaco'
        }
      ]
    }));
  }

  if (query === 'Paris') {
    return res(ctx.json({
      success: true,
      results: [
        { /* Paris, France */ },
        { /* Paris, Texas */ },
        { /* Paris, Tennessee */ }
      ]
    }));
  }
});
```

**User Event Examples:**

```typescript
import userEvent from '@testing-library/user-event';

const user = userEvent.setup();

// Type in input with debounce
await user.type(screen.getByLabelText('Location'), 'Monaco');
await waitFor(() => {
  expect(screen.getByText('Monaco, Monaco')).toBeInTheDocument();
}, { timeout: 500 });

// Click result
await user.click(screen.getByText('Monaco, Monaco'));
expect(onSelect).toHaveBeenCalledWith(expect.objectContaining({
  coordinates: { lat: 43.7384, lon: 7.4246 }
}));
```

**Accessibility Tests:**

```typescript
it('should have proper ARIA labels', () => {
  render(<LocationSearchFilter />);

  expect(screen.getByLabelText('Location')).toBeInTheDocument();
  expect(screen.getByRole('slider', { name: /distance/i })).toBeInTheDocument();
  expect(screen.getByRole('button', { name: /reset/i })).toBeInTheDocument();
});

it('should support keyboard navigation in result selector', async () => {
  const user = userEvent.setup();
  render(<LocationResultSelector results={mockResults} />);

  // Navigate with arrow keys
  await user.keyboard('{ArrowDown}');
  expect(screen.getAllByRole('option')[0]).toHaveFocus();

  // Select with Enter
  await user.keyboard('{Enter}');
  expect(onSelect).toHaveBeenCalled();

  // Cancel with Escape
  await user.keyboard('{Escape}');
  expect(onCancel).toHaveBeenCalled();
});
```

## Quality Gates

- [ ] All test categories have complete coverage
- [ ] Tests follow Testing Library best practices
- [ ] Mock data represents real-world scenarios
- [ ] Accessibility tests included
- [ ] Tests are independent and deterministic
- [ ] Test execution time < 10 seconds
- [ ] No console errors during test execution

## Related Files

**Spec Files:**
- @.agent-os/specs/2025-10-22-location-name-search/spec.md
- @.agent-os/specs/2025-10-22-location-name-search/sub-specs/technical-spec.md

**Test Files:**
- /home/edwin/development/ptnextjs/tests/unit/components/LocationResultSelector.test.tsx (NEW)
- /home/edwin/development/ptnextjs/tests/unit/components/LocationSearchFilter.test.tsx (NEW)
- /home/edwin/development/ptnextjs/tests/unit/hooks/useLocationFilter.test.ts (NEW)

**Related Tasks:**
- task-test-backend-integration (prerequisite)
- task-impl-frontend-location-result-selector (implements code to pass tests)
- task-impl-frontend-location-search-filter (implements code to pass tests)
- task-impl-frontend-unit-mismatch-fix (implements fix to pass tests)
