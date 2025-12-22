# Task: Write Unit Tests for Location Components

## Metadata
- **Task ID**: test-unit-components
- **Phase**: 5 - Testing
- **Agent**: test-architect
- **Estimated Time**: 45-60 min
- **Dependencies**: impl-nearby-vendor-card, impl-vendors-near-you, impl-category-select
- **Status**: completed

## Description

Write comprehensive unit tests for the three new location-related components.

## Specifics

### Test Files to Create

#### 1. `components/products/__tests__/NearbyVendorCard.test.tsx`

```typescript
import { render, screen } from '@testing-library/react';
import { NearbyVendorCard } from '../NearbyVendorCard';

const mockVendor = {/* test fixture */};

describe('NearbyVendorCard', () => {
  it('renders vendor name', () => {});
  it('renders vendor city and country', () => {});
  it('renders tier badge', () => {});
  it('links to correct vendor page', () => {});
  it('shows distance when provided', () => {});
  it('hides distance section when not provided', () => {});
  it('handles missing location gracefully', () => {});
  it('applies hover styles', () => {});
});
```

#### 2. `components/products/__tests__/VendorsNearYou.test.tsx`

```typescript
import { render, screen, waitFor } from '@testing-library/react';
import { VendorsNearYou } from '../VendorsNearYou';

// Mock the hooks
jest.mock('@/hooks/useLocationPreference');
jest.mock('@/hooks/useNearbyVendorsByCategory');

describe('VendorsNearYou', () => {
  describe('loading state', () => {
    it('shows skeleton cards while loading', () => {});
  });

  describe('no location state', () => {
    it('shows "Set your location" prompt', () => {});
    it('links to vendors page', () => {});
  });

  describe('no results state', () => {
    it('shows "No vendors found" message', () => {});
    it('displays search radius in message', () => {});
  });

  describe('results state', () => {
    it('renders vendor cards', () => {});
    it('limits to maxVendors', () => {});
    it('shows "View all vendors" link', () => {});
    it('link includes category param', () => {});
  });

  describe('vendor exclusion', () => {
    it('excludes currentVendorId from results', () => {});
  });
});
```

#### 3. `components/vendors/__tests__/CategorySelect.test.tsx`

```typescript
import { render, screen, fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { CategorySelect } from '../CategorySelect';

const mockCategories = [
  { id: '1', name: 'Navigation', slug: 'navigation' },
  { id: '2', name: 'Safety', slug: 'safety' },
];

describe('CategorySelect', () => {
  it('renders with placeholder', () => {});
  it('shows all categories in dropdown', () => {});
  it('calls onChange with category slug on selection', () => {});
  it('calls onChange with null when "All Categories" selected', () => {});
  it('shows selected category name', () => {});
  it('applies custom className', () => {});
  it('handles empty categories array', () => {});
  it('is keyboard accessible', () => {});
});
```

### Testing Utilities
- Use `@testing-library/react` for rendering
- Use `@testing-library/user-event` for interactions
- Mock Next.js router if needed

## Acceptance Criteria

- [ ] All test files created and passing
- [ ] >90% code coverage for components
- [ ] All component states tested
- [ ] Accessibility basics verified
- [ ] Mock hooks work correctly

## Testing Requirements

Run tests:
```bash
npm run test -- --watch components/products/__tests__/
npm run test -- --watch components/vendors/__tests__/CategorySelect.test.tsx
```

## Related Files
- `components/products/NearbyVendorCard.tsx`
- `components/products/VendorsNearYou.tsx`
- `components/vendors/CategorySelect.tsx`
