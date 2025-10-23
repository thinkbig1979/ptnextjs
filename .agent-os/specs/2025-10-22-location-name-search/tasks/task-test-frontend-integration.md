# Task: test-frontend-integration - Frontend Integration Testing

**Metadata:**
- **Task ID:** test-frontend-integration
- **Phase:** Phase 3: Frontend Implementation
- **Agent:** test-architect
- **Estimated Time:** 25-30 min
- **Dependencies:** impl-frontend-styling
- **Status:** Pending
- **Priority:** High

## Description

Perform comprehensive integration testing of the complete location search workflow, verifying that all frontend components work together correctly with the geocoding API.

## Specifics

**Testing Scope:**

1. **Complete User Workflows:**
   - Simple search → Single result → Auto-apply → Filter vendors
   - Ambiguous search → Multiple results → Select from dialog → Filter vendors
   - Empty search → No results message → Try different search
   - Error handling → API error → Retry/fallback
   - Manual coordinates → Advanced mode → Enter coords → Filter vendors
   - Reset workflow → Clear all → Return to default state

2. **Component Integration:**
   - LocationSearchFilter ↔ LocationResultSelector communication
   - LocationSearchFilter ↔ useLocationFilter coordination
   - LocationSearchFilter ↔ vendors-client integration
   - State synchronization between components

3. **API Integration:**
   - Real API calls to /api/geocode (mocked for tests)
   - Debounced input handling
   - Loading state management
   - Error response handling
   - Response transformation and display

4. **State Management Integration:**
   - Input state → API call → Results state → UI update
   - Selection state → Coordinates update → Filter application
   - Reset state → Clear all data → Return to initial state
   - Error state → Display → Clear on new input

5. **Edge Cases:**
   - Rapid typing (debouncing works)
   - Multiple rapid searches
   - Search while previous request pending
   - Dialog open during new search
   - Component unmount during API call

**Files to Create:**
- `/home/edwin/development/ptnextjs/tests/integration/location-search-workflow.test.tsx` (NEW)

**Test Environment:**
- React Testing Library for component rendering
- Mock Service Worker (MSW) for API mocking
- Jest for test execution
- @testing-library/user-event for realistic user interactions

## Acceptance Criteria

- [ ] All user workflows tested end-to-end
- [ ] Component integration verified
- [ ] API integration with mocked responses working
- [ ] State management across components validated
- [ ] Edge cases handled gracefully
- [ ] Debouncing verified
- [ ] Loading states tested
- [ ] Error handling tested
- [ ] All tests pass (100%)
- [ ] Test execution time < 30 seconds

## Testing Requirements

**Functional Testing:**
- Run integration tests: `npm test -- location-search-workflow.test.tsx`
- All tests must pass
- No flaky tests (run 5 times to verify stability)

**Manual Verification:**
- Start dev server: `npm run dev`
- Manual workflow testing:
  ```
  1. Navigate to vendors page
  2. Type "Monaco" → Verify single result auto-applies
  3. Reset filter
  4. Type "Paris" → Verify dialog opens with multiple results
  5. Select "Paris, France" → Verify filter applies
  6. Adjust distance slider → Verify vendor list updates
  7. Reset filter → Verify all vendors shown
  8. Toggle advanced mode → Enter coordinates manually
  9. Type invalid location → Verify error message
  10. Test rapid typing → Verify only final value triggers API call
  ```

**Browser Testing:**
- Chrome: All workflows work
- Firefox: Dialog and API calls work
- Safari: State management correct
- Mobile Safari: Touch interactions work
- Mobile Chrome: Responsive behavior correct

**Error Scenarios:**
- API returns 400 → Error message displayed
- API returns 429 → Rate limit message displayed
- API returns 500 → Service error message displayed
- Network timeout → Network error message displayed
- Empty results → "No locations found" displayed

**Evidence Required:**
- All integration tests passing
- Manual workflow test results
- Screenshots/video of complete workflow
- Performance metrics:
  - Time from input to API call (should be ~300ms)
  - Time from selection to filter applied (<100ms)
  - Dialog open/close animation smooth
- Browser compatibility test results

## Context Requirements

**Required Context:**
- @.agent-os/specs/2025-10-22-location-name-search/spec.md
- @.agent-os/specs/2025-10-22-location-name-search/tasks/task-impl-frontend-location-search-filter.md
- @.agent-os/specs/2025-10-22-location-name-search/tasks/task-impl-frontend-location-result-selector.md
- @.agent-os/specs/2025-10-22-location-name-search/tasks/task-impl-frontend-styling.md
- All implemented frontend components

**Assumptions:**
- Dev server can run locally
- MSW is configured for API mocking
- All frontend components implemented
- Unit mismatch fix applied

## Implementation Notes

**Test Structure:**

```typescript
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { setupServer } from 'msw/node';
import { rest } from 'msw';
import { VendorsClient } from '@/app/(site)/components/vendors-client';

const server = setupServer(
  rest.get('/api/geocode', (req, res, ctx) => {
    const query = req.url.searchParams.get('q');

    // Mock different responses based on query
    if (query === 'Monaco') {
      return res(ctx.json({
        success: true,
        results: [{
          coordinates: { lat: 43.7384, lon: 7.4246 },
          display_name: 'Monaco, Monaco',
          type: 'city',
          country: 'Monaco'
        }]
      }));
    }

    if (query === 'Paris') {
      return res(ctx.json({
        success: true,
        results: [
          {
            coordinates: { lat: 48.8566, lon: 2.3522 },
            display_name: 'Paris, Île-de-France, France',
            type: 'city',
            country: 'France',
            region: 'Île-de-France'
          },
          {
            coordinates: { lat: 33.6609, lon: -95.5555 },
            display_name: 'Paris, Texas, United States',
            type: 'city',
            country: 'United States',
            region: 'Texas'
          }
        ]
      }));
    }

    if (query === 'invalid') {
      return res(ctx.status(400), ctx.json({
        success: false,
        error: 'Invalid query',
        code: 'INVALID_QUERY'
      }));
    }

    return res(ctx.json({ success: true, results: [] }));
  })
);

beforeAll(() => server.listen());
afterEach(() => server.resetHandlers());
afterAll(() => server.close());

describe('Location Search Workflow Integration', () => {
  describe('Simple search workflow', () => {
    it('should auto-apply filter when single result returned', async () => {
      const user = userEvent.setup();
      const mockVendors = [
        { id: '1', name: 'Vendor 1', coordinates: { lat: 43.7, lon: 7.4 } },
        { id: '2', name: 'Vendor 2', coordinates: { lat: 45.0, lon: 8.0 } }
      ];

      render(<VendorsClient vendors={mockVendors} />);

      // Type location
      const input = screen.getByLabelText(/location/i);
      await user.type(input, 'Monaco');

      // Wait for debounce and API call
      await waitFor(() => {
        expect(screen.queryByTestId('loading-spinner')).not.toBeInTheDocument();
      }, { timeout: 500 });

      // Verify filter applied (only Vendor 1 should be visible)
      expect(screen.getByText('Vendor 1')).toBeInTheDocument();
      expect(screen.queryByText('Vendor 2')).not.toBeInTheDocument();
    });
  });

  describe('Ambiguous search workflow', () => {
    it('should show selector dialog for multiple results', async () => {
      const user = userEvent.setup();
      render(<VendorsClient vendors={mockVendors} />);

      // Type ambiguous location
      await user.type(screen.getByLabelText(/location/i), 'Paris');

      // Wait for dialog to appear
      await waitFor(() => {
        expect(screen.getByRole('dialog')).toBeInTheDocument();
      });

      // Verify multiple results shown
      expect(screen.getByText(/Paris, Île-de-France, France/i)).toBeInTheDocument();
      expect(screen.getByText(/Paris, Texas, United States/i)).toBeInTheDocument();

      // Select first result
      await user.click(screen.getByText(/Paris, Île-de-France, France/i));

      // Verify dialog closes
      await waitFor(() => {
        expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
      });

      // Verify filter applied
      // (Test that vendors are filtered based on Paris, France coordinates)
    });
  });

  describe('Error handling workflow', () => {
    it('should display error message for invalid search', async () => {
      const user = userEvent.setup();
      render(<VendorsClient vendors={mockVendors} />);

      await user.type(screen.getByLabelText(/location/i), 'invalid');

      await waitFor(() => {
        expect(screen.getByText(/invalid query/i)).toBeInTheDocument();
      });

      // Verify error icon displayed
      expect(screen.getByTestId('alert-circle-icon')).toBeInTheDocument();
    });
  });

  describe('Reset workflow', () => {
    it('should clear all filters and return to initial state', async () => {
      const user = userEvent.setup();
      render(<VendorsClient vendors={mockVendors} />);

      // Apply filter
      await user.type(screen.getByLabelText(/location/i), 'Monaco');
      await waitFor(() => {
        expect(screen.queryByTestId('loading-spinner')).not.toBeInTheDocument();
      });

      // Verify filter applied
      expect(screen.getByText('Vendor 1')).toBeInTheDocument();

      // Reset
      await user.click(screen.getByRole('button', { name: /reset/i }));

      // Verify all vendors shown
      expect(screen.getByText('Vendor 1')).toBeInTheDocument();
      expect(screen.getByText('Vendor 2')).toBeInTheDocument();

      // Verify input cleared
      expect(screen.getByLabelText(/location/i)).toHaveValue('');
    });
  });

  describe('Advanced coordinate input workflow', () => {
    it('should allow manual coordinate entry', async () => {
      const user = userEvent.setup();
      render(<VendorsClient vendors={mockVendors} />);

      // Toggle advanced mode
      await user.click(screen.getByText(/advanced/i));

      // Enter coordinates
      await user.type(screen.getByLabelText(/latitude/i), '43.7384');
      await user.type(screen.getByLabelText(/longitude/i), '7.4246');

      // Verify filter applied
      expect(screen.getByText('Vendor 1')).toBeInTheDocument();
    });
  });

  describe('Debouncing behavior', () => {
    it('should debounce rapid typing', async () => {
      const user = userEvent.setup({ delay: null }); // No delay for rapid typing
      let apiCallCount = 0;

      server.use(
        rest.get('/api/geocode', (req, res, ctx) => {
          apiCallCount++;
          return res(ctx.json({ success: true, results: [] }));
        })
      );

      render(<VendorsClient vendors={mockVendors} />);

      // Type rapidly
      const input = screen.getByLabelText(/location/i);
      await user.type(input, 'Monaco', { delay: 10 }); // 10ms between keystrokes

      // Wait for debounce period
      await new Promise(resolve => setTimeout(resolve, 400));

      // Should only have one API call despite multiple keystrokes
      expect(apiCallCount).toBe(1);
    });
  });
});
```

**Performance Benchmarks:**

```typescript
describe('Performance benchmarks', () => {
  it('should complete search workflow in reasonable time', async () => {
    const startTime = performance.now();

    // Execute complete workflow
    await user.type(input, 'Monaco');
    await waitFor(() => {
      expect(screen.queryByTestId('loading-spinner')).not.toBeInTheDocument();
    });

    const endTime = performance.now();
    const duration = endTime - startTime;

    // Should complete in < 500ms (including 300ms debounce)
    expect(duration).toBeLessThan(500);
  });
});
```

## Quality Gates

- [ ] All user workflows tested and passing
- [ ] Component integration verified
- [ ] API integration working with mocked data
- [ ] State management consistent
- [ ] Debouncing verified
- [ ] Error handling comprehensive
- [ ] Performance benchmarks met
- [ ] No flaky tests
- [ ] Test coverage > 95%

## Related Files

**Spec Files:**
- @.agent-os/specs/2025-10-22-location-name-search/spec.md
- @.agent-os/specs/2025-10-22-location-name-search/sub-specs/technical-spec.md

**Implementation Files:**
- /home/edwin/development/ptnextjs/components/LocationSearchFilter.tsx
- /home/edwin/development/ptnextjs/components/location-result-selector.tsx
- /home/edwin/development/ptnextjs/hooks/useLocationFilter.ts
- /home/edwin/development/ptnextjs/app/(site)/components/vendors-client.tsx

**Test Files:**
- /home/edwin/development/ptnextjs/tests/integration/location-search-workflow.test.tsx (NEW)

**Related Tasks:**
- task-impl-frontend-styling (prerequisite)
- task-integ-api-contract (validates API contract)
- task-integ-frontend-backend (next integration phase)
