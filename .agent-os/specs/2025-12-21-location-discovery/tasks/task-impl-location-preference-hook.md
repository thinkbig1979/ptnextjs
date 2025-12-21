# Task: Implement useLocationPreference Hook

## Metadata
- **Task ID**: impl-location-preference-hook
- **Phase**: 2 - Backend/Hooks
- **Agent**: frontend-react-specialist
- **Estimated Time**: 30-40 min
- **Dependencies**: None
- **Status**: pending

## Description

Create a React hook to persist and retrieve user's location preference from localStorage with 30-day expiry.

## Specifics

### File to Create
`hooks/useLocationPreference.ts`

### Interface Definitions
```typescript
interface StoredLocation {
  latitude: number;
  longitude: number;
  displayName: string;
  timestamp: number;
}

interface UseLocationPreferenceResult {
  location: StoredLocation | null;
  setLocation: (location: Omit<StoredLocation, 'timestamp'>) => void;
  clearLocation: () => void;
  isExpired: boolean;
}
```

### Implementation Requirements
1. localStorage key: `pt_user_location`
2. Default expiry: 30 days (configurable via parameter)
3. SSR-safe: Return null during server rendering
4. Auto-clear expired locations on read
5. Store timestamp on write for expiry calculation

### Key Behaviors
- `location`: Current stored location or null
- `setLocation`: Saves location with current timestamp
- `clearLocation`: Removes from localStorage
- `isExpired`: True if timestamp older than maxAge

## Acceptance Criteria

- [ ] Hook exports from `hooks/useLocationPreference.ts`
- [ ] Returns null during SSR (no hydration mismatch)
- [ ] Persists location to localStorage with timestamp
- [ ] Clears expired locations (>30 days) automatically
- [ ] `clearLocation()` removes stored data
- [ ] TypeScript types are properly exported
- [ ] No console errors in development

## Testing Requirements

### Unit Tests (`hooks/__tests__/useLocationPreference.test.ts`)
- Mock localStorage for testing
- Test SSR behavior (window undefined)
- Test read/write/clear operations
- Test expiry calculation
- Test invalid JSON handling (corrupt data)

## Related Files
- `lib/types.ts` - VendorCoordinates type reference
- `hooks/useLocationFilter.ts` - Pattern reference for hooks
