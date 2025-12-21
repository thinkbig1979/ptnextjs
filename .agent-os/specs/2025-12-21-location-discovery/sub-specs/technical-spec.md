# Technical Specification

> Spec: Location-Based Vendor Discovery
> Created: 2025-12-21

## Feature Classification

**Feature Type**: FRONTEND_ONLY
**Frontend Required**: YES
**Backend Required**: NO
**Justification**: All required data available via existing PayloadCMS APIs. Location filtering uses client-side Haversine calculation. No new database queries or API endpoints needed.

---

## Frontend Implementation

### New Hooks

#### useNearbyVendorsByCategory

**File**: `hooks/useNearbyVendorsByCategory.ts`

**Purpose**: Combine location filtering with category matching for vendor discovery.

```typescript
interface UseNearbyVendorsByCategoryOptions {
  userLocation: VendorCoordinates | null;
  category: string;
  excludeVendorId?: string;
  radius?: number;              // Default: 500km
  maxResults?: number;          // Default: 10
}

interface UseNearbyVendorsByCategoryResult {
  vendors: VendorWithDistance[];
  isLoading: boolean;
  error: Error | null;
}

interface VendorWithDistance extends Vendor {
  distance: number;             // km from user location
  productsInCategory: number;   // count of products in specified category
}

export function useNearbyVendorsByCategory(
  options: UseNearbyVendorsByCategoryOptions
): UseNearbyVendorsByCategoryResult {
  // 1. Get all vendors (from cache or API)
  // 2. Get all products (from cache or API)
  // 3. Filter products by category
  // 4. Get unique vendor IDs from filtered products
  // 5. Filter vendors:
  //    - Must be in product vendor IDs
  //    - Must be within radius of userLocation
  //    - Exclude excludeVendorId
  // 6. Calculate distance for each vendor
  // 7. Sort by distance ascending
  // 8. Limit to maxResults
  // 9. Return with productsInCategory count
}
```

**Dependencies**:
- `lib/payload-cms-data-service.ts:getAllVendors()`
- `lib/payload-cms-data-service.ts:getProducts()`
- `lib/utils/location.ts:calculateDistance()`
- `lib/utils/location.ts:isWithinDistance()`

#### useLocationPreference

**File**: `hooks/useLocationPreference.ts`

**Purpose**: Persist and retrieve user's location preference from localStorage.

```typescript
interface StoredLocation {
  latitude: number;
  longitude: number;
  displayName: string;
  timestamp: number;
}

interface UseLocationPreferenceResult {
  location: StoredLocation | null;
  setLocation: (location: StoredLocation) => void;
  clearLocation: () => void;
  isExpired: boolean;
}

export function useLocationPreference(
  maxAgeMs: number = 30 * 24 * 60 * 60 * 1000  // 30 days
): UseLocationPreferenceResult {
  // localStorage key: 'pt_user_location'
  // Check timestamp on load, clear if expired
  // Return null during SSR (typeof window === 'undefined')
}
```

### New Components

#### VendorsNearYou

**File**: `components/products/VendorsNearYou.tsx`

```typescript
interface VendorsNearYouProps {
  category: string;
  currentVendorId?: string;
  maxVendors?: number;          // Default: 4
  defaultRadius?: number;       // Default: 500
  className?: string;
}
```

**Internal State**:
- `userLocation` from `useLocationPreference()`
- `vendors` from `useNearbyVendorsByCategory()`

**Data Flow**:
1. Read location from localStorage via hook
2. If location exists, fetch nearby vendors for category
3. Render vendor cards or empty state

#### NearbyVendorCard

**File**: `components/products/NearbyVendorCard.tsx`

```typescript
interface NearbyVendorCardProps {
  vendor: Vendor;
  distance?: number;
}
```

**Imports**:
- `components/vendors/TierBadge` - Existing tier badge
- `lib/utils/location:formatDistance` - Distance formatting

#### CategorySelect

**File**: `components/vendors/CategorySelect.tsx`

```typescript
interface CategorySelectProps {
  categories: Category[];
  value: string | null;
  onChange: (value: string | null) => void;
  placeholder?: string;         // Default: "All Categories"
  className?: string;
}
```

**Imports**:
- `@/components/ui/select` - shadcn Select components

### Modified Components

#### VendorsClient

**File**: `app/(site)/components/vendors-client.tsx`

**Changes**:
1. Add `selectedCategory` state
2. Add CategorySelect to filter row
3. Modify filter logic to include category
4. Update URL params to include category
5. Show product count per vendor when category selected

**New Props** (from parent page):
```typescript
interface VendorsClientProps {
  vendors: Vendor[];
  products: Product[];          // NEW: needed for category filtering
  categories: Category[];       // NEW: for dropdown options
}
```

#### ProductDetailPage

**File**: `app/(site)/products/[id]/page.tsx`

**Changes**:
1. Import VendorsNearYou component
2. Add to sidebar section after "About the Manufacturer" card
3. Pass product.category to component

```tsx
// In sidebar section:
<VendorsNearYou
  category={product.category}
  currentVendorId={product.vendorId}
/>
```

---

## Data Flow

### Product Page → VendorsNearYou

```
ProductDetailPage (server component)
  ↓ passes category, vendorId
VendorsNearYou (client component)
  ↓ reads from localStorage
useLocationPreference
  ↓ returns userLocation
useNearbyVendorsByCategory
  ↓ fetches vendors + products
PayloadCMSDataService (cached)
  ↓ returns filtered vendors
VendorsNearYou
  ↓ renders NearbyVendorCard[]
```

### Vendors Page → Combined Filter

```
VendorsPage (server component)
  ↓ passes vendors, products, categories
VendorsClient (client component)
  ↓ maintains filter state
  ├── LocationSearchFilter (existing)
  │     ↓ updates userLocation
  └── CategorySelect (new)
        ↓ updates selectedCategory
  ↓ combines filters
useLocationFilter (existing) + category filter
  ↓ returns filtered vendors
VendorCard[] with distance + product count
```

---

## State Management

### Client State (React useState)

| State | Location | Purpose |
|-------|----------|---------|
| `userLocation` | VendorsClient | Current search location |
| `selectedCategory` | VendorsClient | Selected category filter |
| `radius` | VendorsClient | Search radius (km) |

### Persistent State (localStorage)

| Key | Type | Expiry |
|-----|------|--------|
| `pt_user_location` | StoredLocation | 30 days |

### URL State (searchParams)

| Param | Type | Example |
|-------|------|---------|
| `lat` | number | `43.7384` |
| `lon` | number | `7.4246` |
| `location` | string | `Monaco` |
| `radius` | number | `200` |
| `category` | string | `navigation` |

---

## Integration Points

### Existing Code Dependencies

#### PayloadCMSDataService

**File**: `lib/payload-cms-data-service.ts`

**Used Methods**:
- `getAllVendors()`: Returns all vendors with locations
- `getProducts()`: Returns all products with vendorId and category
- `getCategories()`: Returns all categories

**Caching**: 5-minute TTL in-memory cache (existing behavior)

#### Location Utilities

**File**: `lib/utils/location.ts`

**Used Functions**:
- `calculateDistance(coord1, coord2, unit)`: Haversine formula
- `isWithinDistance(origin, target, maxDistance, unit)`: Radius check
- `formatDistance(distance, decimals)`: Display formatting

#### LocationSearchFilter

**File**: `components/LocationSearchFilter.tsx`

**Integration**: Used as-is on vendors page. VendorsNearYou uses stored location, not this component.

#### TierBadge

**File**: `components/vendors/TierBadge.tsx`

**Integration**: Used in NearbyVendorCard to show vendor tier.

---

## Error Handling

### Location Errors

| Scenario | Handling |
|----------|----------|
| localStorage unavailable (SSR) | Return null, show "Set location" prompt |
| Expired location (>30 days) | Clear and show "Set location" prompt |
| Invalid stored data | Clear and show "Set location" prompt |

### Data Fetch Errors

| Scenario | Handling |
|----------|----------|
| Vendors API error | Show error message, hide section |
| Products API error | Show error message, disable category filter |
| No vendors in category | Show "No vendors found" empty state |

### Filter Edge Cases

| Scenario | Handling |
|----------|----------|
| Category selected, no location | Show all vendors in category (no distance sort) |
| Location selected, no category | Show all vendors within radius |
| No results | Show empty state with "Clear Filters" button |

---

## Performance Considerations

### Data Loading

- **Vendors page**: Products and categories passed from server component (SSG)
- **Product page**: VendorsNearYou loads lazily (not blocking page render)
- **Caching**: PayloadCMSDataService has 5-min TTL, prevents redundant fetches

### Client-Side Filtering

- Filter operations are O(n) where n = vendor count
- Current scale: ~20 vendors - no performance concern
- For 1000+ vendors: Consider server-side filtering or pagination

### Bundle Size

- New components are small (<5KB each)
- No new external dependencies
- Uses existing shadcn/ui components

---

## Testing Strategy

### Unit Tests

| Component/Hook | Test Cases |
|----------------|------------|
| `useNearbyVendorsByCategory` | Filter by category, filter by distance, sort by distance, exclude vendor |
| `useLocationPreference` | Read from storage, write to storage, clear, expired data |
| `VendorsNearYou` | With location, without location, no results, loading |
| `CategorySelect` | Select category, clear selection, display options |

### Integration Tests

| Flow | Test Cases |
|------|------------|
| Product page | VendorsNearYou renders, links work, respects category |
| Vendors page | Combined filters work, URL state syncs, clear filters |

### E2E Tests

| Scenario | Steps |
|----------|-------|
| Find nearby vendors | Visit product → see nearby vendors → click one → verify navigation |
| Category search | Visit vendors → select location → select category → verify filtered results |
| Location persistence | Set location → refresh page → verify location remembered |

---

## File Manifest

### New Files

| File | Type | Purpose |
|------|------|---------|
| `hooks/useNearbyVendorsByCategory.ts` | Hook | Combined location+category filtering |
| `hooks/useLocationPreference.ts` | Hook | localStorage location persistence |
| `components/products/VendorsNearYou.tsx` | Component | Product page sidebar section |
| `components/products/NearbyVendorCard.tsx` | Component | Compact vendor card |
| `components/vendors/CategorySelect.tsx` | Component | Category dropdown filter |

### Modified Files

| File | Changes |
|------|---------|
| `app/(site)/products/[id]/page.tsx` | Add VendorsNearYou to sidebar |
| `app/(site)/components/vendors-client.tsx` | Add category filter, URL params |
| `app/(site)/vendors/page.tsx` | Pass products and categories to client |

---

## Implementation Order

1. **useLocationPreference** - Foundation for location storage
2. **useNearbyVendorsByCategory** - Core filtering logic
3. **NearbyVendorCard** - Display component
4. **VendorsNearYou** - Main product page section
5. **CategorySelect** - Vendors page filter component
6. **Integrate VendorsNearYou** - Add to product detail page
7. **Enhance VendorsClient** - Add category filtering + URL state
8. **Tests** - Unit and E2E tests
