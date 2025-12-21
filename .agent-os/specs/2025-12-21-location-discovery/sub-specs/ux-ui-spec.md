# UX/UI Specification

> Spec: Location-Based Vendor Discovery
> Created: 2025-12-21

## Phase 1: Application Architecture

### 1.1 Feature Classification

**Feature Type**: FRONTEND_ONLY (client-side filtering of existing data)
**Frontend Required**: YES
**Backend Required**: NO (uses existing PayloadCMS data service)
**Justification**: All vendor and product data already available via existing APIs. Location filtering is client-side using Haversine formula. No new API endpoints needed.

### 1.2 Route Structure

```
/products/[id]                    → ProductDetailPage - Add VendorsNearYou sidebar section
/vendors                          → VendorsPage - Enhance with category filter
```

**Integration**: Both routes already exist. Adding components to existing pages.
**Guards**: None required (public pages)

### 1.3 Global Layout Integration

**Strategy**: USE_EXISTING

- Existing: `app/(site)/layout.tsx`
- No layout changes required
- Components integrate into existing page structures

### 1.4 Navigation Structure

**No navigation changes required.**

Features are embedded in existing pages, not new routes.

### 1.5 User Flow Architecture

#### Flow 1: Product Page → Vendors Near You

1. **Start**: `/products/[id]` ProductDetailPage
2. **Page Loads**: VendorsNearYou component renders in sidebar
3. **Location Check**:
   - IF localStorage has saved location → use it
   - ELSE → show "Set your location" prompt
4. **Data Fetch**: Get all vendors, filter by:
   - Within radius of user location
   - Have products in same category as current product
5. **Display**: Show max 4 vendor cards sorted by distance
6. **User Interaction**: Click vendor card
7. **Navigation**: Navigate to `/vendors/[slug]`

#### Flow 2: Vendors Page → Combined Search

1. **Start**: `/vendors` VendorsPage
2. **Page Loads**: LocationSearchFilter + CategoryFilter render
3. **User Action**: Enter location in LocationSearchFilter
4. **User Action**: Select category from dropdown
5. **Filter Applied**: Vendors filtered by both criteria
6. **Results Display**: Vendor cards with distance + category product count
7. **User Interaction**: Click vendor card
8. **Navigation**: Navigate to `/vendors/[slug]`

---

## Phase 2: Layout Systems

### 2.1 VendorsNearYou Section (Product Page Sidebar)

**Location**: Inside existing sidebar, after "About the Manufacturer" card

```tsx
<aside className="lg:col-span-1 space-y-6">
  {/* Existing: Get This Product card */}
  <Card>...</Card>

  {/* Existing: About the Manufacturer card */}
  <Card>...</Card>

  {/* NEW: Vendors Near You */}
  <VendorsNearYou
    category={product.category}
    currentVendorId={product.vendorId}
    className="mt-6"
  />
</aside>
```

**Responsive Behavior**:
- Desktop (≥1024px): Sidebar right column, sticky
- Tablet (768-1023px): Full width below main content
- Mobile (<768px): Full width, stacked

### 2.2 Category Filter (Vendors Page)

**Location**: Above vendor grid, alongside existing LocationSearchFilter

```tsx
<div className="flex flex-col md:flex-row gap-4 mb-6">
  {/* Existing LocationSearchFilter */}
  <LocationSearchFilter
    className="flex-1"
    {...locationProps}
  />

  {/* NEW: Category Filter */}
  <CategorySelect
    categories={categories}
    value={selectedCategory}
    onChange={setSelectedCategory}
    className="w-full md:w-64"
  />
</div>
```

**Responsive**:
- Desktop: Side-by-side with gap-4
- Mobile: Stacked vertically

### 2.3 Spacing System

| Context | Desktop | Mobile | Tailwind |
|---------|---------|--------|----------|
| Section gap | 24px | 16px | `space-y-6 md:space-y-4` |
| Card padding | 16px | 12px | `p-4 md:p-3` |
| Filter row gap | 16px | 12px | `gap-4 md:gap-3` |
| Vendor card gap | 12px | 8px | `gap-3 md:gap-2` |

---

## Phase 3: Component Specifications

### 3.1 VendorsNearYou Component

**Purpose**: Show nearby vendors for a product category on product detail pages
**File**: `components/products/VendorsNearYou.tsx`

**Props**:
```typescript
interface VendorsNearYouProps {
  category: string;                    // Product category to match
  currentVendorId?: string;            // Exclude current product's vendor
  maxVendors?: number;                 // Default: 4
  defaultRadius?: number;              // Default: 500 (km)
  className?: string;
}
```

**Structure**:
```tsx
<Card className={cn("p-4", className)}>
  <CardHeader className="pb-3 px-0 pt-0">
    <CardTitle className="text-lg font-semibold flex items-center gap-2">
      <MapPin className="h-4 w-4 text-primary" />
      Vendors Near You
    </CardTitle>
  </CardHeader>

  <CardContent className="px-0 pb-0 space-y-3">
    {/* If no location set */}
    {!userLocation && (
      <div className="text-sm text-muted-foreground text-center py-4">
        <p className="mb-2">Set your location to find nearby vendors</p>
        <Button variant="outline" size="sm" asChild>
          <Link href="/vendors">Find Vendors</Link>
        </Button>
      </div>
    )}

    {/* If location set but no vendors */}
    {userLocation && vendors.length === 0 && (
      <p className="text-sm text-muted-foreground text-center py-4">
        No vendors found within {radius}km
      </p>
    )}

    {/* Vendor cards */}
    {vendors.map(vendor => (
      <NearbyVendorCard key={vendor.id} vendor={vendor} />
    ))}

    {/* See all link */}
    {vendors.length > 0 && (
      <Button variant="ghost" size="sm" className="w-full" asChild>
        <Link href={`/vendors?category=${category}`}>
          View all vendors
          <ArrowRight className="ml-2 h-4 w-4" />
        </Link>
      </Button>
    )}
  </CardContent>
</Card>
```

**States**:
- **Loading**: Skeleton cards (3 items)
- **No Location**: Prompt with link to vendors page
- **No Results**: "No vendors found" message
- **Results**: 1-4 vendor cards + "View all" link

### 3.2 NearbyVendorCard Component

**Purpose**: Compact vendor card for sidebar display
**File**: `components/products/NearbyVendorCard.tsx`

**Props**:
```typescript
interface NearbyVendorCardProps {
  vendor: Vendor;
  distance?: number;           // km
}
```

**Structure**:
```tsx
<Link
  href={`/vendors/${vendor.slug}`}
  className="block p-3 rounded-lg border hover:bg-muted/50 transition-colors"
>
  <div className="flex items-start justify-between gap-2">
    <div className="flex-1 min-w-0">
      <h4 className="font-medium text-sm truncate">{vendor.name}</h4>
      <p className="text-xs text-muted-foreground truncate">
        {vendor.location?.city}, {vendor.location?.country}
      </p>
    </div>
    <TierBadge tier={vendor.tier} size="sm" />
  </div>

  {distance !== undefined && (
    <div className="flex items-center gap-1 mt-2 text-xs text-muted-foreground">
      <Navigation className="h-3 w-3" />
      <span>{formatDistance(distance)} away</span>
    </div>
  )}
</Link>
```

**Hover State**: `hover:bg-muted/50 transition-colors duration-150`

### 3.3 CategorySelect Component

**Purpose**: Category dropdown filter for vendors page
**File**: `components/vendors/CategorySelect.tsx`

**Props**:
```typescript
interface CategorySelectProps {
  categories: Category[];
  value: string | null;
  onChange: (value: string | null) => void;
  className?: string;
}
```

**Structure**:
```tsx
<Select value={value ?? ""} onValueChange={v => onChange(v || null)}>
  <SelectTrigger className={cn("w-full", className)}>
    <SelectValue placeholder="All Categories" />
  </SelectTrigger>
  <SelectContent>
    <SelectItem value="">All Categories</SelectItem>
    {categories.map(cat => (
      <SelectItem key={cat.id} value={cat.slug}>
        {cat.name}
      </SelectItem>
    ))}
  </SelectContent>
</Select>
```

### 3.4 VendorCategoryProductCount Component

**Purpose**: Show product count in category on vendor cards (when category filter active)
**File**: `components/vendors/VendorCategoryProductCount.tsx`

**Props**:
```typescript
interface VendorCategoryProductCountProps {
  vendorId: string;
  category: string;
  products: Product[];
}
```

**Structure**:
```tsx
<Badge variant="secondary" className="text-xs">
  {count} product{count !== 1 ? 's' : ''} in {categoryName}
</Badge>
```

---

## Phase 4: Interaction Patterns

### 4.1 Location Persistence

**Storage Key**: `pt_user_location`

**Stored Data**:
```typescript
interface StoredLocation {
  latitude: number;
  longitude: number;
  displayName: string;      // e.g., "Monaco"
  timestamp: number;        // Date.now()
}
```

**Read on Page Load**:
```typescript
useEffect(() => {
  const stored = localStorage.getItem('pt_user_location');
  if (stored) {
    const location = JSON.parse(stored);
    // Check if less than 30 days old
    if (Date.now() - location.timestamp < 30 * 24 * 60 * 60 * 1000) {
      setUserLocation(location);
    }
  }
}, []);
```

**Write on Location Search**:
```typescript
const handleLocationSelect = (location: GeocodedLocation) => {
  const toStore = {
    latitude: location.lat,
    longitude: location.lon,
    displayName: location.display_name,
    timestamp: Date.now()
  };
  localStorage.setItem('pt_user_location', JSON.stringify(toStore));
  setUserLocation(toStore);
};
```

### 4.2 URL State (Vendors Page)

**Query Parameters**:
- `location` - Encoded location name (e.g., `Monaco`)
- `lat` - Latitude
- `lon` - Longitude
- `radius` - Search radius in km
- `category` - Category slug

**Example**: `/vendors?location=Monaco&lat=43.7384&lon=7.4246&radius=200&category=navigation`

**Sync with URL**:
```typescript
// Read from URL on mount
const searchParams = useSearchParams();
const initialCategory = searchParams.get('category');
const initialLat = searchParams.get('lat');
const initialLon = searchParams.get('lon');

// Update URL on filter change
const updateURL = (filters: Filters) => {
  const params = new URLSearchParams();
  if (filters.category) params.set('category', filters.category);
  if (filters.location) {
    params.set('lat', filters.location.lat.toString());
    params.set('lon', filters.location.lon.toString());
    params.set('location', filters.location.displayName);
  }
  router.push(`/vendors?${params.toString()}`);
};
```

### 4.3 Loading States

**VendorsNearYou Skeleton**:
```tsx
<Card className="p-4">
  <div className="flex items-center gap-2 mb-3">
    <Skeleton className="h-4 w-4 rounded" />
    <Skeleton className="h-5 w-32" />
  </div>
  <div className="space-y-3">
    {[1, 2, 3].map(i => (
      <div key={i} className="p-3 border rounded-lg">
        <Skeleton className="h-4 w-24 mb-1" />
        <Skeleton className="h-3 w-32" />
      </div>
    ))}
  </div>
</Card>
```

### 4.4 Empty States

**No Location Set** (VendorsNearYou):
- Icon: MapPin with question mark
- Text: "Set your location to find nearby vendors"
- CTA: "Find Vendors" button linking to `/vendors`

**No Vendors Found** (VendorsNearYou):
- Icon: Search with X
- Text: "No vendors found within {radius}km selling {category}"
- Suggestion: "Try expanding your search radius"

**No Results** (Vendors Page with filters):
- Icon: Search
- Text: "No vendors match your criteria"
- Actions: "Clear Filters" button, "Try different location" suggestion

---

## Validation Checklist

### Phase 1
- [x] Routes explicit (using existing routes)
- [x] Navigation specified (no changes needed)
- [x] Layout integration defined (USE_EXISTING)
- [x] User entry points identified
- [x] User flows step-by-step

### Phase 2
- [x] Container specs with responsive
- [x] Spacing usage matrix with Tailwind
- [x] Page layouts with component hierarchy

### Phase 3
- [x] Component specifications with props
- [x] All components: markup, spacing, states
- [x] Integration examples

### Phase 4
- [x] Interactive states (hover, loading, empty)
- [x] URL state persistence
- [x] localStorage persistence
