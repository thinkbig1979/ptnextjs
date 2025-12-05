# Tier Request Type Frontend Update

## Task: ptnextjs-e30
**Update admin tier request queue to show upgrade/downgrade type**

## Summary

Updated the admin tier request queue component to display and filter by request type (upgrade/downgrade), providing visual distinction and improved admin workflow.

## Changes Made

### 1. Component: `components/admin/AdminTierRequestQueue.tsx`

#### Interface Updates
- Added `requestType: 'upgrade' | 'downgrade'` field to `TierUpgradeRequest` interface

#### New Features

**Request Type Filter**
- Added dropdown filter to show:
  - All Requests
  - Upgrades Only
  - Downgrades Only
- Filter dynamically updates API query parameters

**Visual Distinctions**
- **Type Badge Column**: New column displaying request type with icon
  - Upgrades: Green badge with up arrow
  - Downgrades: Amber badge with down arrow

- **Row Styling**: Different background colors
  - Upgrades: Default white background
  - Downgrades: Subtle amber tint (`bg-amber-50/50`)

- **Tier Change Badge**: Color-coded based on request type
  - Upgrades: Green background (`bg-green-600`)
  - Downgrades: Amber background (`bg-amber-600`)

**Dialog Enhancements**
- Updated dialog titles to show "Upgrade" or "Downgrade"
- Added warning box for downgrade requests:
  - Shows amber-colored alert about feature loss
  - Reminds admin that vendor will lose access to current tier features

**Toast Messages**
- Dynamic messages that include request type (upgrade/downgrade)
- Example: "Company's upgrade to Tier 2 has been approved"

#### Technical Implementation

**State Management**
```typescript
const [requestTypeFilter, setRequestTypeFilter] = useState<'all' | 'upgrade' | 'downgrade'>('all');
```

**API Query Building**
```typescript
const params = new URLSearchParams({ status: 'pending' });
if (requestTypeFilter !== 'all') {
  params.append('requestType', requestTypeFilter);
}
```

**Badge Component**
```typescript
const getRequestTypeBadge = (requestType: 'upgrade' | 'downgrade') => {
  if (requestType === 'upgrade') {
    return <Badge className="bg-green-600">
      <ArrowUp className="mr-1 h-3 w-3" />
      Upgrade
    </Badge>;
  } else {
    return <Badge className="bg-amber-600">
      <ArrowDown className="mr-1 h-3 w-3" />
      Downgrade
    </Badge>;
  }
};
```

### 2. Type Definitions: `lib/types.ts`

#### Updates Needed
```typescript
// Add to TierUpgradeRequest interface
export interface TierUpgradeRequest {
  // ... existing fields
  /** Request type (upgrade or downgrade) */
  requestType: 'upgrade' | 'downgrade';
  // ... rest of fields
}

// Add to TierUpgradeRequestFilters interface
export interface TierUpgradeRequestFilters {
  // ... existing fields
  /** Filter by request type */
  requestType?: 'upgrade' | 'downgrade';
  // ... rest of fields
}
```

## UI/UX Improvements

1. **Clear Type Identification**: Request type is immediately visible in first column
2. **Visual Hierarchy**: Color coding helps admins quickly scan and prioritize
3. **Contextual Warnings**: Downgrade requests show warnings about feature loss
4. **Flexible Filtering**: Admins can focus on specific request types
5. **Consistent Language**: All text dynamically updates based on request type

## Color Scheme

| Element | Upgrade | Downgrade |
|---------|---------|-----------|
| Type Badge | Green (`bg-green-600`) | Amber (`bg-amber-600`) |
| Row Background | Default white | Amber tint (`bg-amber-50/50`) |
| Tier Badge | Green | Amber |
| Icon | ArrowUp | ArrowDown |

## Backend Integration

The backend already supports:
- `requestType` field in database schema
- Request type filtering via API query parameter
- Auto-detection of request type based on tier comparison
- Validation ensuring one pending request per type per vendor

## Testing Checklist

- [ ] Filter dropdown shows all three options
- [ ] Filtering by "Upgrades Only" shows only upgrade requests
- [ ] Filtering by "Downgrades Only" shows only downgrade requests
- [ ] Type badge displays correctly with icon
- [ ] Row styling applies correctly for downgrades
- [ ] Dialog titles reflect correct request type
- [ ] Downgrade warning shows only for downgrade requests
- [ ] Toast messages use correct terminology
- [ ] API calls include requestType parameter when filtering
- [ ] Type checking passes with no errors

## Files Modified

1. `/home/edwin/development/ptnextjs/components/admin/AdminTierRequestQueue.tsx`
2. `/home/edwin/development/ptnextjs/lib/types.ts` (types need to be updated)

## Next Steps

1. Apply the component update (AdminTierRequestQueue.new.tsx → AdminTierRequestQueue.tsx)
2. Update lib/types.ts with requestType fields
3. Run type checking: `npm run type-check`
4. Test filtering functionality
5. Verify visual distinctions in UI
