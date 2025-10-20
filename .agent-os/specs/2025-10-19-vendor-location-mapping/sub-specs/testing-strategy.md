# Testing Strategy

> Spec: Vendor Location Mapping
> Created: 2025-10-19
> Testing Framework: Jest + React Testing Library + Playwright

## Testing Framework

**Primary Testing Framework**: Jest 29+ with React Testing Library

**Justification**: Standard testing stack for Next.js applications, excellent support for React components

**Testing Tool Ecosystem**:
- **Unit Tests**: Jest for utilities and hooks
- **Component Tests**: React Testing Library for UI components
- **E2E Tests**: Playwright for full user workflows
- **Mocking**: Jest mocks for geocoding API

**Test Runner Configuration**:
- **Jest Config**: Use Next.js default Jest configuration
- **Coverage**: nyc/istanbul for coverage reports
- **Watch Mode**: `npm run test:watch` for development

## Test Types Coverage

### Unit Tests: Utility Functions

**Target**: `lib/utils/distance.ts` - Haversine distance calculation

**Test Cases**:
```typescript
describe('calculateDistance', () => {
  it('calculates distance between two coordinates correctly', () => {
    const monaco = { lat: 43.7384, lng: 7.4246 }
    const nice = { lat: 43.7102, lng: 7.2620 }
    const distance = calculateDistance(monaco.lat, monaco.lng, nice.lat, nice.lng)

    // Distance between Monaco and Nice is approximately 10 miles
    expect(distance).toBeCloseTo(10, 0)
  })

  it('returns 0 for identical coordinates', () => {
    const distance = calculateDistance(43.7384, 7.4246, 43.7384, 7.4246)
    expect(distance).toBe(0)
  })

  it('handles coordinates across the antimeridian', () => {
    // Test edge case with longitude wrapping
    const distance = calculateDistance(0, 179, 0, -179)
    expect(distance).toBeGreaterThan(0)
  })
})
```

**Coverage Target**: 100% for distance calculation utility

### Integration Tests: Custom Hooks

**Target**: `lib/hooks/useLocationFilter.ts` - Location filtering logic

**Test Cases**:
```typescript
describe('useLocationFilter', () => {
  const mockVendors = [
    { id: '1', name: 'Vendor A', location: { lat: 43.7384, lng: 7.4246 } },
    { id: '2', name: 'Vendor B', location: { lat: 43.7102, lng: 7.2620 } },
    { id: '3', name: 'Vendor C', location: null }
  ]

  it('filters vendors within specified radius', () => {
    const { result } = renderHook(() => useLocationFilter(mockVendors))

    act(() => {
      result.current.setLocationSearch({ lat: 43.7384, lng: 7.4246, address: 'Monaco' }, 15)
    })

    // Vendor A is at center (0 miles), Vendor B is ~10 miles, both within 15 mile radius
    expect(result.current.filteredVendors).toHaveLength(2)
  })

  it('sorts filtered vendors by distance', () => {
    const { result } = renderHook(() => useLocationFilter(mockVendors))

    act(() => {
      result.current.setLocationSearch({ lat: 43.7384, lng: 7.4246, address: 'Monaco' }, 50)
    })

    // Closest vendor should be first
    expect(result.current.filteredVendors[0].id).toBe('1')
  })

  it('excludes vendors without location data', () => {
    const { result } = renderHook(() => useLocationFilter(mockVendors))

    act(() => {
      result.current.setLocationSearch({ lat: 43.7384, lng: 7.4246, address: 'Monaco' }, 100)
    })

    // Vendor C has no location, should be excluded
    expect(result.current.filteredVendors).not.toContainEqual(expect.objectContaining({ id: '3' }))
  })
})
```

**Coverage Target**: 90%+ for hook logic

### Component Tests: UI Components

**Target**: `components/vendor/VendorLocationMap.tsx`

**Test Cases**:
```typescript
describe('VendorLocationMap', () => {
  it('renders map with correct center and marker', () => {
    render(
      <VendorLocationMap
        latitude={43.7384}
        longitude={7.4246}
        vendorName="Test Vendor"
        address="Monaco"
      />
    )

    expect(screen.getByTestId('vendor-map')).toBeInTheDocument()
    // Mock mapbox-gl to verify map initialization
  })

  it('displays fallback message when map fails to load', () => {
    // Mock map initialization error
    jest.spyOn(console, 'error').mockImplementation()

    render(
      <VendorLocationMap
        latitude={43.7384}
        longitude={7.4246}
        vendorName="Test Vendor"
      />
    )

    // Should show address fallback
    expect(screen.getByText(/location not available/i)).toBeInTheDocument()
  })
})
```

**Target**: `components/vendor/LocationSearchFilter.tsx`

**Test Cases**:
```typescript
describe('LocationSearchFilter', () => {
  it('validates required fields before submission', async () => {
    const mockOnSearch = jest.fn()
    render(<LocationSearchFilter onLocationSearch={mockOnSearch} />)

    const submitButton = screen.getByRole('button', { name: /search/i })
    await userEvent.click(submitButton)

    // Should not call onLocationSearch with empty fields
    expect(mockOnSearch).not.toHaveBeenCalled()
    expect(screen.getByText(/location is required/i)).toBeInTheDocument()
  })

  it('calls geocoding API and emits search parameters', async () => {
    const mockOnSearch = jest.fn()
    global.fetch = jest.fn().mockResolvedValue({
      ok: true,
      json: async () => ([{ lat: '43.7384', lon: '7.4246', display_name: 'Monaco' }])
    })

    render(<LocationSearchFilter onLocationSearch={mockOnSearch} />)

    const locationInput = screen.getByPlaceholderText(/enter location/i)
    const radiusSelect = screen.getByRole('combobox', { name: /radius/i })
    const submitButton = screen.getByRole('button', { name: /search/i })

    await userEvent.type(locationInput, 'Monaco')
    await userEvent.selectOptions(radiusSelect, '25')
    await userEvent.click(submitButton)

    await waitFor(() => {
      expect(mockOnSearch).toHaveBeenCalledWith({
        lat: 43.7384,
        lng: 7.4246,
        address: 'Monaco',
        radius: 25
      })
    })
  })

  it('displays error when geocoding fails', async () => {
    global.fetch = jest.fn().mockResolvedValue({
      ok: true,
      json: async () => ([]) // Empty array = location not found
    })

    render(<LocationSearchFilter onLocationSearch={jest.fn()} />)

    const locationInput = screen.getByPlaceholderText(/enter location/i)
    const submitButton = screen.getByRole('button', { name: /search/i })

    await userEvent.type(locationInput, 'InvalidLocation123')
    await userEvent.click(submitButton)

    await waitFor(() => {
      expect(screen.getByText(/location not found/i)).toBeInTheDocument()
    })
  })
})
```

**Coverage Target**: 85%+ for UI components

### End-to-End Tests: Full User Workflows

**Framework**: Playwright

**Test Scenarios**:

**E2E Test 1: View Vendor Location Map**
```typescript
test('displays vendor location on map', async ({ page }) => {
  await page.goto('/vendors/test-vendor-with-location')

  // Wait for map to load
  await page.waitForSelector('[data-testid="vendor-map"]')

  // Verify map canvas exists
  const mapCanvas = page.locator('.mapboxgl-canvas')
  await expect(mapCanvas).toBeVisible()

  // Verify marker popup shows vendor name
  await page.click('.mapboxgl-marker')
  await expect(page.locator('.mapboxgl-popup')).toContainText('Test Vendor')
})

test('shows fallback for vendor without location', async ({ page }) => {
  await page.goto('/vendors/test-vendor-no-location')

  // Map should not be present
  const map = page.locator('[data-testid="vendor-map"]')
  await expect(map).not.toBeVisible()

  // Fallback message should display
  await expect(page.locator('text=Location not available')).toBeVisible()
})
```

**E2E Test 2: Search Vendors by Location**
```typescript
test('searches and filters vendors by location', async ({ page }) => {
  await page.goto('/vendors')

  // Fill in location search
  await page.fill('input[placeholder*="location"]', 'Monaco')
  await page.selectOption('select[name="radius"]', '50')
  await page.click('button:has-text("Search")')

  // Wait for results to update
  await page.waitForSelector('[data-testid="vendor-card"]')

  // Verify distance badges appear
  const distanceBadges = page.locator('text=/\\d+ miles away/')
  await expect(distanceBadges.first()).toBeVisible()

  // Verify results are sorted by distance
  const firstVendorDistance = await distanceBadges.first().textContent()
  const secondVendorDistance = await distanceBadges.nth(1).textContent()

  const dist1 = parseInt(firstVendorDistance.match(/\d+/)[0])
  const dist2 = parseInt(secondVendorDistance.match(/\d+/)[0])
  expect(dist1).toBeLessThanOrEqual(dist2)
})

test('handles no results within radius', async ({ page }) => {
  await page.goto('/vendors')

  await page.fill('input[placeholder*="location"]', 'Antarctica')
  await page.selectOption('select[name="radius"]', '10')
  await page.click('button:has-text("Search")')

  await expect(page.locator('text=No vendors found')).toBeVisible()
})
```

**Coverage Target**: All critical user paths covered

## Test Data Management

**Test Data Strategy**:
- **Mock Vendor Data**: Create fixtures with various location scenarios (with location, without location, different distances)
- **Mock Geocoding Responses**: Use jest.fn() to mock Nominatim API responses
- **Test Database**: Use in-memory SQLite for integration tests with Payload CMS

**Mock Data Example**:
```typescript
// __mocks__/vendors.ts
export const mockVendorsWithLocation = [
  {
    id: '1',
    name: 'Monaco Marine Tech',
    slug: 'monaco-marine-tech',
    location: {
      address: 'Monaco, Monaco',
      latitude: 43.7384,
      longitude: 7.4246
    }
  },
  {
    id: '2',
    name: 'Nice Nautical',
    slug: 'nice-nautical',
    location: {
      address: 'Nice, France',
      latitude: 43.7102,
      longitude: 7.2620
    }
  },
  {
    id: '3',
    name: 'Paris Parts Co',
    slug: 'paris-parts',
    location: null
  }
]
```

**Test Environment Configuration**:
- **Development**: Use `.env.test` for test-specific config
- **CI/CD**: Mock all external APIs (geocoding, map tiles)

## Continuous Integration

**Automated Testing Pipeline**:
1. **On Pull Request**: Run all unit and component tests
2. **On Merge to Main**: Run full test suite including E2E tests
3. **Before Deploy**: Run smoke tests on staging build

**Test Reporting**:
- **Coverage Reports**: Generate HTML coverage report with jest --coverage
- **Test Results**: Display in GitHub Actions with annotations for failures

**Quality Gate Enforcement**:
- **Minimum Coverage**: 80% overall, 90% for new code
- **Zero Test Failures**: All tests must pass before merge
- **Performance Budget**: E2E tests must complete within 5 minutes

**CI Configuration Example** (GitHub Actions):
```yaml
name: Test
on: [pull_request]
jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
      - run: npm ci
      - run: npm run test:coverage
      - run: npm run test:e2e
      - uses: codecov/codecov-action@v3
```
