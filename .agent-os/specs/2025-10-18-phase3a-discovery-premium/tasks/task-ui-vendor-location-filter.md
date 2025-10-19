# Task: ui-vendor-location-filter - Build Vendor Location Filter Component

## Task Metadata
- **Task ID**: ui-vendor-location-filter
- **Phase**: Phase 3A: Frontend Components
- **Agent**: frontend-react-specialist
- **Estimated Time**: 45-60 minutes
- **Dependencies**: [task-api-vendor-geography-endpoints]
- **Status**: [ ] Not Started

## Task Description
Build an interactive location filter component that allows users to filter vendors by country, state/province, and city. Implement URL query parameter persistence for shareable filter links and optional proximity search with geolocation support.

## Specifics
- **File to Create**:
  - `/home/edwin/development/ptnextjs/components/VendorLocationFilter.tsx`
- **Component Structure**:
  ```typescript
  'use client'
  
  import { useSearchParams, useRouter } from 'next/navigation'
  import { useState, useEffect } from 'react'
  import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
  import { Button } from '@/components/ui/button'
  import { Slider } from '@/components/ui/slider'
  import { MapPin, X } from 'lucide-react'
  
  interface VendorLocationFilterProps {
    onFilterChange?: (filters: LocationFilters) => void
  }
  
  interface LocationFilters {
    country?: string
    state?: string
    city?: string
    proximity?: { lat: number, lon: number, radius: number }
  }
  
  export function VendorLocationFilter({ onFilterChange }: VendorLocationFilterProps) {
    // State management
    // URL query param sync
    // Geolocation integration
    // Filter cascade (country → states → cities)
    // Render UI
  }
  ```
- **UI Layout**:
  ```
  ┌─────────────────────────────────────────┐
  │ Filter by Location                      │
  ├─────────────────────────────────────────┤
  │ Country:    [Select Country ▼]          │
  │ State:      [Select State ▼]            │
  │ City:       [Select City ▼]             │
  ├─────────────────────────────────────────┤
  │ ☐ Search by Proximity                   │
  │   Radius: [━━━━○━━━━] 50 km            │
  │   [📍 Use My Location]                  │
  ├─────────────────────────────────────────┤
  │ [Clear Filters]                         │
  └─────────────────────────────────────────┘
  ```

## Acceptance Criteria
- [ ] Component renders with shadcn Select dropdowns for country, state, city
- [ ] Country dropdown populated from API or static list
- [ ] State dropdown filters based on selected country
- [ ] City dropdown filters based on selected state
- [ ] URL query params update when filters change (?country=US&state=CA)
- [ ] Filter state loads from URL on component mount (shareable links)
- [ ] Clear Filters button resets all selections and updates URL
- [ ] Proximity search toggle shows/hides radius slider
- [ ] Radius slider range: 1-1000 km with step of 5
- [ ] "Use My Location" button requests geolocation permission
- [ ] Geolocation success populates lat/lon for proximity search
- [ ] Geolocation denial handled gracefully with error message
- [ ] Component is responsive (stacks vertically on mobile)
- [ ] Accessible (ARIA labels, keyboard navigation)

## Testing Requirements
- **Component Tests**:
  - Test component renders with default state (no filters)
  - Test country selection updates URL params
  - Test state dropdown disabled until country selected
  - Test city dropdown disabled until state selected
  - Test Clear Filters resets all dropdowns and URL
  - Mock useSearchParams to test URL param loading
  - Mock navigator.geolocation for proximity tests
  - Test geolocation success populates coordinates
  - Test geolocation denial shows error message
- **Integration Tests**:
  - Render component on /vendors page
  - Select country, verify API called with ?country=US
  - Select state, verify API called with ?country=US&state=CA
  - Copy URL, open in new tab, verify filters load from URL
  - Enable proximity search, set radius to 100km
  - Verify API called with lat, lon, radius params
- **Accessibility Tests**:
  - Tab through all filter controls with keyboard
  - Screen reader announces filter changes
  - ARIA labels present on all form controls

## Evidence Required
- Component file with complete implementation
- Test results showing all scenarios pass
- Screenshot of filter UI in desktop and mobile layouts
- Video/GIF showing filter cascade in action
- Proof of URL param persistence (shareable link test)

## Context Requirements
- shadcn/ui Select component documentation
- Next.js useSearchParams and useRouter hooks
- Geolocation API documentation
- tasks-sqlite.md section 3.1 for design guidance

## Implementation Notes
- **URL Query Param Sync**:
  ```typescript
  const searchParams = useSearchParams()
  const router = useRouter()
  const [country, setCountry] = useState(searchParams.get('country') || '')
  
  const updateFilters = (key: string, value: string) => {
    const params = new URLSearchParams(searchParams)
    if (value) {
      params.set(key, value)
    } else {
      params.delete(key)
    }
    router.push(`?${params.toString()}`, { scroll: false })
  }
  ```
- **Filter Cascade Logic**:
  ```typescript
  // When country changes, reset state and city
  const handleCountryChange = (newCountry: string) => {
    setCountry(newCountry)
    setState('')
    setCity('')
    updateFilters('country', newCountry)
  }
  
  // Fetch available states for selected country
  useEffect(() => {
    if (country) {
      fetchStates(country).then(setAvailableStates)
    }
  }, [country])
  ```
- **Geolocation Integration**:
  ```typescript
  const handleUseMyLocation = () => {
    if (!navigator.geolocation) {
      setError('Geolocation not supported by your browser')
      return
    }
    
    navigator.geolocation.getCurrentPosition(
      (position) => {
        setLat(position.coords.latitude)
        setLon(position.coords.longitude)
        setProximityEnabled(true)
      },
      (error) => {
        if (error.code === error.PERMISSION_DENIED) {
          setError('Location permission denied. Please enable location access.')
        } else {
          setError('Unable to retrieve your location.')
        }
      }
    )
  }
  ```
- **Responsive Design**:
  ```tsx
  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
    {/* Country */}
    {/* State */}
    {/* City */}
  </div>
  ```
- **Performance**:
  - Debounce filter changes to avoid excessive API calls
  - Cache available states/cities to reduce redundant fetches
  - Use loading skeletons while fetching filter options

## Quality Gates
- [ ] No hydration errors (client-only with 'use client')
- [ ] URL updates don't cause page reload (scroll: false)
- [ ] Geolocation permission handled securely
- [ ] Filter cascade prevents orphaned selections
- [ ] Accessibility score >90 on Lighthouse

## Related Files
- Main Tasks: `tasks-sqlite.md` section 3.1
- Technical Spec: `sub-specs/technical-spec.md` (VendorLocationFilter)
- shadcn Components: Select, Button, Slider
- API Endpoints: GET /api/vendors with filter params

## Next Steps After Completion
- Integrate with vendor listing page (app/vendors/page.tsx)
- Connect to VendorServiceAreaMap component (task-ui-vendor-service-map)
- Add analytics tracking for filter usage
