# Testing Strategy

> Spec: Location Name-Based Search
> Created: 2025-10-22
> Testing Framework: Jest, React Testing Library, Playwright
> Coverage Target: 80% minimum

## Testing Framework

**Primary Testing Framework**: Jest with React Testing Library

**Justification**:
- Jest is already configured in the Next.js project
- React Testing Library aligns with testing best practices (test user behavior, not implementation)
- Playwright already used for E2E tests in project

**Testing Tool Ecosystem**:
- **Unit/Integration**: Jest + React Testing Library
- **E2E**: Playwright
- **Mocking**: Mock Service Worker (MSW) for API mocking
- **Coverage**: Jest's built-in coverage reporter

**Test Runner Configuration**:
```javascript
// jest.config.js
{
  testEnvironment: 'jsdom',
  setupFilesAfterEnv: ['<rootDir>/jest.setup.js'],
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/$1'
  },
  collectCoverageFrom: [
    'components/**/*.{ts,tsx}',
    'app/api/**/*.{ts,tsx}',
    '!**/*.d.ts',
    '!**/node_modules/**'
  ],
  coverageThresholds: {
    global: {
      branches: 80,
      functions: 80,
      lines: 80,
      statements: 80
    }
  }
}
```

## Test Types and Coverage

### Unit Tests: Component-Level Testing

**LocationSearchFilter Component Tests**

**File**: `__tests__/components/LocationSearchFilter.test.tsx`

**Test Cases**:

1. **Rendering Tests**:
   ```typescript
   describe('LocationSearchFilter - Rendering', () => {
     test('renders location search input with correct placeholder', () => {
       render(<LocationSearchFilter onSearch={jest.fn()} onReset={jest.fn()} />);
       expect(screen.getByPlaceholderText(/enter city name/i)).toBeInTheDocument();
     });

     test('renders search button in enabled state when input is valid', () => {
       render(<LocationSearchFilter onSearch={jest.fn()} onReset={jest.fn()} />);
       const input = screen.getByRole('textbox');
       fireEvent.change(input, { target: { value: 'Monaco' } });
       expect(screen.getByRole('button', { name: /search/i })).not.toBeDisabled();
     });

     test('renders reset button only when search is active', () => {
       const { rerender } = render(<LocationSearchFilter onSearch={jest.fn()} onReset={jest.fn()} />);
       expect(screen.queryByRole('button', { name: /reset/i })).not.toBeInTheDocument();

       // After search, reset button should appear
       fireEvent.click(screen.getByRole('button', { name: /search/i }));
       // ... simulate search completion
       expect(screen.getByRole('button', { name: /reset/i })).toBeInTheDocument();
     });
   });
   ```

2. **User Interaction Tests**:
   ```typescript
   describe('LocationSearchFilter - User Interactions', () => {
     test('calls API with correct query when search button clicked', async () => {
       const mockFetch = jest.spyOn(global, 'fetch').mockResolvedValue({
         ok: true,
         json: async () => ({ features: [mockMonacoFeature] })
       } as Response);

       render(<LocationSearchFilter onSearch={jest.fn()} onReset={jest.fn()} />);

       fireEvent.change(screen.getByRole('textbox'), { target: { value: 'Monaco' } });
       fireEvent.click(screen.getByRole('button', { name: /search/i }));

       await waitFor(() => {
         expect(mockFetch).toHaveBeenCalledWith(
           expect.stringContaining('/api/geocode?q=Monaco')
         );
       });
     });

     test('auto-applies single result without showing dialog', async () => {
       const onSearchMock = jest.fn();
       // Mock API response with single result
       global.fetch = jest.fn().mockResolvedValue({
         ok: true,
         json: async () => ({ features: [mockMonacoFeature] })
       });

       render(<LocationSearchFilter onSearch={onSearchMock} onReset={jest.fn()} />);

       fireEvent.change(screen.getByRole('textbox'), { target: { value: 'Monaco' } });
       fireEvent.click(screen.getByRole('button', { name: /search/i }));

       await waitFor(() => {
         expect(onSearchMock).toHaveBeenCalledWith(
           { latitude: 43.7384, longitude: 7.4246 },
           expect.any(Number)
         );
       });
     });

     test('shows LocationResultSelector when multiple results returned', async () => {
       global.fetch = jest.fn().mockResolvedValue({
         ok: true,
         json: async () => ({ features: [mockParisFrance, mockParisTexas] })
       });

       render(<LocationSearchFilter onSearch={jest.fn()} onReset={jest.fn()} />);

       fireEvent.change(screen.getByRole('textbox'), { target: { value: 'Paris' } });
       fireEvent.click(screen.getByRole('button', { name: /search/i }));

       await waitFor(() => {
         expect(screen.getByText(/Paris, Île-de-France, France/i)).toBeInTheDocument();
         expect(screen.getByText(/Paris, Texas, United States/i)).toBeInTheDocument();
       });
     });
   });
   ```

3. **Error Handling Tests**:
   ```typescript
   describe('LocationSearchFilter - Error Handling', () => {
     test('displays error message when API call fails', async () => {
       global.fetch = jest.fn().mockRejectedValue(new Error('Network error'));

       render(<LocationSearchFilter onSearch={jest.fn()} onReset={jest.fn()} />);

       fireEvent.change(screen.getByRole('textbox'), { target: { value: 'Monaco' } });
       fireEvent.click(screen.getByRole('button', { name: /search/i }));

       await waitFor(() => {
         expect(screen.getByText(/unable to connect/i)).toBeInTheDocument();
       });
     });

     test('displays no results message when API returns empty array', async () => {
       global.fetch = jest.fn().mockResolvedValue({
         ok: true,
         json: async () => ({ features: [] })
       });

       render(<LocationSearchFilter onSearch={jest.fn()} onReset={jest.fn()} />);

       fireEvent.change(screen.getByRole('textbox'), { target: { value: 'asdfasdf' } });
       fireEvent.click(screen.getByRole('button', { name: /search/i }));

       await waitFor(() => {
         expect(screen.getByText(/no locations found/i)).toBeInTheDocument();
       });
     });

     test('validates minimum input length', () => {
       render(<LocationSearchFilter onSearch={jest.fn()} onReset={jest.fn()} />);

       fireEvent.change(screen.getByRole('textbox'), { target: { value: 'M' } });
       fireEvent.click(screen.getByRole('button', { name: /search/i }));

       expect(screen.getByText(/enter at least 2 characters/i)).toBeInTheDocument();
     });
   });
   ```

**LocationResultSelector Component Tests**

**File**: `__tests__/components/LocationResultSelector.test.tsx`

**Test Cases**:

1. **Rendering Tests**:
   ```typescript
   describe('LocationResultSelector - Rendering', () => {
     test('renders all location results with proper formatting', () => {
       const results = [mockParisFrance, mockParisTexas, mockParisCanada];
       render(
         <LocationResultSelector
           results={results}
           isOpen={true}
           onSelect={jest.fn()}
           onCancel={jest.fn()}
         />
       );

       expect(screen.getByText(/Paris, Île-de-France, France/i)).toBeInTheDocument();
       expect(screen.getByText(/Paris, Texas, United States/i)).toBeInTheDocument();
       expect(screen.getByText(/Paris, Ontario, Canada/i)).toBeInTheDocument();
     });

     test('displays MapPin icon for each result', () => {
       const results = [mockParisFrance, mockParisTexas];
       render(
         <LocationResultSelector
           results={results}
           isOpen={true}
           onSelect={jest.fn()}
           onCancel={jest.fn()}
         />
       );

       const icons = screen.getAllByTestId('map-pin-icon');
       expect(icons).toHaveLength(2);
     });
   });
   ```

2. **Interaction Tests**:
   ```typescript
   describe('LocationResultSelector - Interactions', () => {
     test('calls onSelect with correct feature when result clicked', () => {
       const onSelectMock = jest.fn();
       const results = [mockParisFrance, mockParisTexas];

       render(
         <LocationResultSelector
           results={results}
           isOpen={true}
           onSelect={onSelectMock}
           onCancel={jest.fn()}
         />
       );

       fireEvent.click(screen.getByText(/Paris, Île-de-France, France/i));

       expect(onSelectMock).toHaveBeenCalledWith(mockParisFrance);
     });

     test('calls onCancel when cancel button clicked', () => {
       const onCancelMock = jest.fn();

       render(
         <LocationResultSelector
           results={[mockParisFrance]}
           isOpen={true}
           onSelect={jest.fn()}
           onCancel={onCancelMock}
         />
       );

       fireEvent.click(screen.getByRole('button', { name: /cancel/i }));

       expect(onCancelMock).toHaveBeenCalled();
     });

     test('supports keyboard navigation through results', () => {
       const results = [mockParisFrance, mockParisTexas];

       render(
         <LocationResultSelector
           results={results}
           isOpen={true}
           onSelect={jest.fn()}
           onCancel={jest.fn()}
         />
       );

       const firstResult = screen.getByText(/Paris, Île-de-France, France/i);
       firstResult.focus();

       fireEvent.keyDown(firstResult, { key: 'ArrowDown' });

       const secondResult = screen.getByText(/Paris, Texas, United States/i);
       expect(secondResult).toHaveFocus();
     });
   });
   ```

### Integration Tests: API Route Testing

**Geocoding API Route Tests**

**File**: `__tests__/api/geocode.test.ts`

**Test Cases**:

1. **Request Validation Tests**:
   ```typescript
   describe('GET /api/geocode - Validation', () => {
     test('returns 400 when query parameter missing', async () => {
       const response = await GET(new Request('http://localhost/api/geocode'));

       expect(response.status).toBe(400);
       const data = await response.json();
       expect(data.error.code).toBe('INVALID_QUERY');
     });

     test('returns 400 when query is too short', async () => {
       const response = await GET(new Request('http://localhost/api/geocode?q=M'));

       expect(response.status).toBe(400);
       expect(await response.json()).toMatchObject({
         error: { code: 'INVALID_QUERY' }
       });
     });

     test('accepts valid query with default parameters', async () => {
       const mockPhotonResponse = { features: [mockMonacoFeature] };
       global.fetch = jest.fn().mockResolvedValue({
         ok: true,
         json: async () => mockPhotonResponse
       });

       const response = await GET(new Request('http://localhost/api/geocode?q=Monaco'));

       expect(response.status).toBe(200);
     });
   });
   ```

2. **Photon API Integration Tests**:
   ```typescript
   describe('GET /api/geocode - Photon Integration', () => {
     test('calls Photon API with correct parameters', async () => {
       const mockFetch = jest.spyOn(global, 'fetch').mockResolvedValue({
         ok: true,
         json: async () => ({ features: [] })
       } as Response);

       await GET(new Request('http://localhost/api/geocode?q=Monaco&limit=10'));

       expect(mockFetch).toHaveBeenCalledWith(
         expect.stringContaining('photon.komoot.io/api'),
         expect.any(Object)
       );

       const callUrl = mockFetch.mock.calls[0][0] as string;
       expect(callUrl).toContain('q=Monaco');
       expect(callUrl).toContain('limit=10');
     });

     test('forwards Photon response to client', async () => {
       const mockPhotonResponse = { features: [mockMonacoFeature, mockMiamiFeature] };
       global.fetch = jest.fn().mockResolvedValue({
         ok: true,
         json: async () => mockPhotonResponse
       });

       const response = await GET(new Request('http://localhost/api/geocode?q=M'));
       const data = await response.json();

       expect(data.features).toHaveLength(2);
       expect(data.features[0]).toMatchObject(mockMonacoFeature);
     });

     test('handles Photon API errors gracefully', async () => {
       global.fetch = jest.fn().mockResolvedValue({
         ok: false,
         status: 503
       });

       const response = await GET(new Request('http://localhost/api/geocode?q=Monaco'));

       expect(response.status).toBe(500);
       expect(await response.json()).toMatchObject({
         error: { code: 'GEOCODING_FAILED' }
       });
     });
   });
   ```

3. **Rate Limiting Tests**:
   ```typescript
   describe('GET /api/geocode - Rate Limiting', () => {
     test('allows requests under rate limit', async () => {
       global.fetch = jest.fn().mockResolvedValue({
         ok: true,
         json: async () => ({ features: [] })
       });

       for (let i = 0; i < 10; i++) {
         const response = await GET(new Request('http://localhost/api/geocode?q=Test'));
         expect(response.status).toBe(200);
       }
     });

     test('blocks requests exceeding rate limit', async () => {
       global.fetch = jest.fn().mockResolvedValue({
         ok: true,
         json: async () => ({ features: [] })
       });

       // Make 10 allowed requests
       for (let i = 0; i < 10; i++) {
         await GET(new Request('http://localhost/api/geocode?q=Test', {
           headers: { 'x-forwarded-for': '192.168.1.1' }
         }));
       }

       // 11th request should be rate limited
       const response = await GET(new Request('http://localhost/api/geocode?q=Test', {
         headers: { 'x-forwarded-for': '192.168.1.1' }
       }));

       expect(response.status).toBe(429);
       expect(await response.json()).toMatchObject({
         error: { code: 'RATE_LIMIT' }
       });
     });
   });
   ```

### End-to-End Tests: Complete Workflow Validation

**E2E Test Scenarios**

**File**: `tests/e2e/location-search.spec.ts`

**Test Cases**:

1. **Simple Location Search Workflow**:
   ```typescript
   test('user can search for vendors by city name', async ({ page }) => {
     await page.goto('/vendors');

     // Enter location name
     await page.fill('[data-testid="location-input"]', 'Monaco');

     // Click search
     await page.click('[data-testid="search-button"]');

     // Wait for loading to complete
     await page.waitForSelector('[data-testid="search-button"]:not([disabled])');

     // Verify vendor list is filtered
     await expect(page.locator('[data-testid="vendor-card"]')).toHaveCount.greaterThan(0);

     // Verify result count message
     await expect(page.locator('[data-testid="result-count"]')).toContainText(/vendors found within/i);

     // Verify distance badges appear
     const firstVendor = page.locator('[data-testid="vendor-card"]').first();
     await expect(firstVendor.locator('[data-testid="distance-badge"]')).toBeVisible();
   });
   ```

2. **Ambiguous Location Selection Workflow**:
   ```typescript
   test('user can select correct location from multiple results', async ({ page }) => {
     await page.goto('/vendors');

     // Search for ambiguous location
     await page.fill('[data-testid="location-input"]', 'Paris');
     await page.click('[data-testid="search-button"]');

     // Wait for result selector dialog
     await page.waitForSelector('[role="dialog"]');

     // Verify multiple options shown
     await expect(page.locator('[role="dialog"]')).toContainText('Paris, Île-de-France, France');
     await expect(page.locator('[role="dialog"]')).toContainText('Paris, Texas, United States');

     // Select Paris, France
     await page.click('text=Paris, Île-de-France, France');

     // Wait for dialog to close
     await page.waitForSelector('[role="dialog"]', { state: 'hidden' });

     // Verify filter applied
     await expect(page.locator('[data-testid="result-count"]')).toBeVisible();
   });
   ```

3. **Error Handling Workflow**:
   ```typescript
   test('displays error message for invalid location search', async ({ page }) => {
     await page.goto('/vendors');

     // Search for non-existent location
     await page.fill('[data-testid="location-input"]', 'ZZZZInvalidCity');
     await page.click('[data-testid="search-button"]');

     // Wait for error message
     await expect(page.locator('[data-testid="error-message"]')).toBeVisible();
     await expect(page.locator('[data-testid="error-message"]')).toContainText(/no locations found/i);

     // Verify search input is preserved
     await expect(page.locator('[data-testid="location-input"]')).toHaveValue('ZZZZInvalidCity');
   });
   ```

4. **Reset Functionality Workflow**:
   ```typescript
   test('user can reset location filter to show all vendors', async ({ page }) => {
     await page.goto('/vendors');

     // Apply location filter
     await page.fill('[data-testid="location-input"]', 'Monaco');
     await page.click('[data-testid="search-button"]');
     await page.waitForSelector('[data-testid="result-count"]');

     // Get filtered vendor count
     const filteredCount = await page.locator('[data-testid="vendor-card"]').count();

     // Click reset
     await page.click('[data-testid="reset-button"]');

     // Verify all vendors shown again
     const allVendorsCount = await page.locator('[data-testid="vendor-card"]').count();
     expect(allVendorsCount).toBeGreaterThan(filteredCount);

     // Verify input cleared
     await expect(page.locator('[data-testid="location-input"]')).toHaveValue('');

     // Verify reset button hidden
     await expect(page.locator('[data-testid="reset-button"]')).toBeHidden();
   });
   ```

5. **Advanced Coordinate Input Workflow**:
   ```typescript
   test('advanced users can still input coordinates directly', async ({ page }) => {
     await page.goto('/vendors');

     // Expand advanced options
     await page.click('text=Advanced Options');
     await page.waitForSelector('[data-testid="coordinate-input"]', { state: 'visible' });

     // Enter coordinates
     await page.fill('[data-testid="coordinate-input"]', '43.7384, 7.4246');
     await page.click('[data-testid="search-by-coordinates-button"]');

     // Verify filter applied
     await expect(page.locator('[data-testid="result-count"]')).toBeVisible();
     await expect(page.locator('[data-testid="vendor-card"]')).toHaveCount.greaterThan(0);
   });
   ```

6. **Performance Test**:
   ```typescript
   test('location search completes within 3 seconds', async ({ page }) => {
     await page.goto('/vendors');

     const startTime = Date.now();

     await page.fill('[data-testid="location-input"]', 'Monaco');
     await page.click('[data-testid="search-button"]');
     await page.waitForSelector('[data-testid="result-count"]');

     const duration = Date.now() - startTime;

     expect(duration).toBeLessThan(3000);
   });
   ```

## Test Data Management

### Test Fixtures

**File**: `__tests__/fixtures/photon-responses.ts`

```typescript
export const mockMonacoFeature: PhotonFeature = {
  type: 'Feature',
  geometry: {
    type: 'Point',
    coordinates: [7.4246, 43.7384]
  },
  properties: {
    name: 'Monaco',
    country: 'Monaco',
    countrycode: 'MC',
    osm_type: 'R',
    osm_key: 'place',
    osm_value: 'city'
  }
};

export const mockParisFrance: PhotonFeature = {
  type: 'Feature',
  geometry: {
    type: 'Point',
    coordinates: [2.3522, 48.8566]
  },
  properties: {
    name: 'Paris',
    city: 'Paris',
    state: 'Île-de-France',
    country: 'France',
    countrycode: 'FR',
    osm_type: 'R',
    osm_key: 'place',
    osm_value: 'city'
  }
};

export const mockParisTexas: PhotonFeature = {
  type: 'Feature',
  geometry: {
    type: 'Point',
    coordinates: [-95.5555, 33.6609]
  },
  properties: {
    name: 'Paris',
    city: 'Paris',
    state: 'Texas',
    country: 'United States',
    countrycode: 'US',
    osm_type: 'R',
    osm_key: 'place',
    osm_value: 'city'
  }
};
```

### Mock Service Worker Setup

**File**: `__tests__/mocks/handlers.ts`

```typescript
import { rest } from 'msw';

export const handlers = [
  // Mock geocoding API endpoint
  rest.get('/api/geocode', (req, res, ctx) => {
    const query = req.url.searchParams.get('q');

    if (!query) {
      return res(
        ctx.status(400),
        ctx.json({ error: { code: 'INVALID_QUERY', message: 'Query parameter required' } })
      );
    }

    if (query.toLowerCase() === 'monaco') {
      return res(ctx.json({ features: [mockMonacoFeature] }));
    }

    if (query.toLowerCase() === 'paris') {
      return res(ctx.json({ features: [mockParisFrance, mockParisTexas] }));
    }

    // Default: return empty results
    return res(ctx.json({ features: [] }));
  })
];
```

### Test Environment Configuration

**File**: `jest.setup.js`

```javascript
import '@testing-library/jest-dom';
import { server } from './__tests__/mocks/server';

// Establish API mocking before all tests
beforeAll(() => server.listen());

// Reset handlers after each test
afterEach(() => server.resetHandlers());

// Clean up after all tests
afterAll(() => server.close());

// Mock window.matchMedia for responsive components
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: jest.fn().mockImplementation(query => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: jest.fn(),
    removeListener: jest.fn(),
    addEventListener: jest.fn(),
    removeEventListener: jest.fn(),
    dispatchEvent: jest.fn(),
  })),
});
```

## Continuous Integration

### Automated Testing Pipeline

**GitHub Actions Workflow** (`.github/workflows/test.yml`):

```yaml
name: Test Location Search Feature

on:
  pull_request:
    branches: [main]
  push:
    branches: [feature/location-name-search]

jobs:
  unit-tests:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: '18'

      - name: Install dependencies
        run: npm ci

      - name: Run unit tests
        run: npm run test -- --coverage

      - name: Upload coverage
        uses: codecov/codecov-action@v3

  e2e-tests:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
      - uses: microsoft/playwright-github-action@v1

      - name: Install dependencies
        run: npm ci

      - name: Install Playwright
        run: npx playwright install --with-deps

      - name: Run E2E tests
        run: npm run test:e2e

      - name: Upload test results
        if: failure()
        uses: actions/upload-artifact@v3
        with:
          name: playwright-report
          path: test-results/
```

### Test Reporting and Metrics

**Coverage Report**: Generated by Jest, uploaded to Codecov

**Key Metrics to Track**:
- Overall coverage percentage (target: ≥80%)
- Branch coverage (target: ≥80%)
- E2E test pass rate (target: 100%)
- Average test execution time (monitor for regressions)

### Quality Gate Enforcement

**Pre-Merge Requirements**:
- ✅ All unit tests passing
- ✅ All E2E tests passing
- ✅ Coverage threshold met (80%)
- ✅ No TypeScript errors
- ✅ No console errors in E2E tests

**CI Pipeline Checks**:
```bash
# Type checking
npm run type-check

# Linting
npm run lint

# Unit tests with coverage
npm run test -- --coverage

# E2E tests
npm run test:e2e

# Build verification
npm run build
```

## Test Execution Schedule

**During Development**:
- Unit tests: Run on every file save (watch mode)
- Integration tests: Run before each commit
- E2E tests: Run before pushing to remote

**CI/CD Pipeline**:
- All tests run on every PR
- Full test suite runs on merge to main
- Nightly runs for regression detection

**Manual Testing**:
- Cross-browser testing before release (Chrome, Firefox, Safari)
- Mobile device testing (iOS Safari, Chrome Android)
- Accessibility audit with screen reader
