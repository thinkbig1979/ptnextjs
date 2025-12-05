# AdminDirectTierChange Component

## Overview

The `AdminDirectTierChange` component provides administrators with the ability to directly modify any vendor's subscription tier without requiring a request workflow. This is a privileged admin-only feature that bypasses the normal tier upgrade request process.

## Location

**Component:** `/components/admin/AdminDirectTierChange.tsx`
**Tests:** `/components/admin/__tests__/AdminDirectTierChange.test.tsx`

## Features

- **Direct Tier Control:** Admins can change vendor tiers instantly
- **All Tiers Available:** Select from Free, Professional, Business, or Enterprise
- **Upgrade/Downgrade Detection:** Automatically detects direction of tier change
- **Confirmation Dialog:** Requires confirmation before applying changes
- **Downgrade Warnings:** Shows warning when downgrading to prevent accidental feature loss
- **Upgrade Confirmation:** Shows positive confirmation for upgrades
- **API Integration:** Uses PUT `/api/admin/vendors/[id]/tier` endpoint
- **Toast Notifications:** Provides user feedback for success and errors
- **Loading States:** Disabled buttons during API calls

## Usage

```tsx
import AdminDirectTierChange from '@/components/admin/AdminDirectTierChange';

function VendorAdminPanel({ vendor }: { vendor: Vendor }) {
  const handleSuccess = () => {
    // Refresh vendor data or show additional confirmation
    console.log('Tier updated successfully');
  };

  return (
    <div>
      <AdminDirectTierChange
        vendorId={vendor.id}
        currentTier={vendor.tier}
        vendorName={vendor.companyName}
        onSuccess={handleSuccess}
      />
    </div>
  );
}
```

## Props

### `AdminDirectTierChangeProps`

| Prop | Type | Required | Description |
|------|------|----------|-------------|
| `vendorId` | `string` | Yes | Unique identifier of the vendor |
| `currentTier` | `'free' \| 'tier1' \| 'tier2' \| 'tier3'` | Yes | Current subscription tier |
| `vendorName` | `string` | Yes | Vendor company name (displayed in confirmations) |
| `onSuccess` | `() => void` | No | Callback function called after successful tier change |

## API Integration

### Endpoint

**PUT** `/api/admin/vendors/[id]/tier`

### Request Body

```json
{
  "tier": "free" | "tier1" | "tier2" | "tier3"
}
```

### Success Response (200)

```json
{
  "message": "Vendor tier updated successfully",
  "vendor": {
    "id": "vendor-123",
    "companyName": "Example Corp",
    "tier": "tier2",
    "updatedAt": "2025-12-05T10:30:00.000Z"
  }
}
```

### Error Responses

- **400 Bad Request:** Invalid tier value or missing tier parameter
- **401 Unauthorized:** Authentication required
- **403 Forbidden:** Admin access required
- **404 Not Found:** Vendor not found
- **500 Internal Server Error:** Server error

## User Flow

1. **View Current Tier:** Admin sees vendor's current tier displayed with a badge
2. **Select New Tier:** Admin uses dropdown to select desired tier (all tiers available)
3. **Initiate Change:** Admin clicks "Change Tier" button
4. **Confirmation Dialog:** Dialog opens showing:
   - Current tier
   - Selected new tier
   - Warning (if downgrade) or confirmation (if upgrade)
5. **Confirm or Cancel:** Admin confirms change or cancels
6. **API Call:** PUT request sent to update tier
7. **Feedback:** Toast notification shows success or error
8. **Callback:** `onSuccess` called if provided

## Tier Change Detection

### Upgrade
- Current tier hierarchy level < new tier hierarchy level
- Shows green "Upgrade Confirmation" message
- No data loss warnings needed

### Downgrade
- Current tier hierarchy level > new tier hierarchy level
- Shows yellow "Downgrade Warning" message
- Warns about potential feature loss
- Data preserved but may exceed new tier limits

### Tier Hierarchy
```
free (0) < tier1 (1) < tier2 (2) < tier3 (3)
```

## Styling

The component uses shadcn/ui components and Tailwind CSS:
- **Card:** Container with header and content sections
- **Select:** Dropdown for tier selection
- **Badge:** Display current tier
- **Dialog:** Confirmation modal
- **Button:** Action buttons with loading states
- **Icons:** Lucide React icons (AlertTriangle, CheckCircle, Loader2)

## Testing

Run tests with:
```bash
npm test -- AdminDirectTierChange.test.tsx
```

### Test Coverage
- Renders current tier information
- Disables button when tier unchanged
- Enables button when tier selected
- Shows confirmation dialog
- Shows downgrade warnings
- Shows upgrade confirmations
- Successfully updates via API
- Handles API errors gracefully
- Allows canceling confirmation

## Security Considerations

- **Admin-Only:** Component should only be rendered for authenticated admin users
- **API Validation:** Backend validates admin role before allowing tier changes
- **Audit Trail:** Backend logs all tier changes with timestamp and admin identifier
- **Confirmation Required:** Two-step process prevents accidental changes

## Example Integration

### Admin Vendor Detail Page

```tsx
// app/admin/vendors/[id]/page.tsx
import AdminDirectTierChange from '@/components/admin/AdminDirectTierChange';

export default async function AdminVendorDetailPage({
  params
}: {
  params: { id: string }
}) {
  const vendor = await getVendor(params.id);

  return (
    <div className="grid gap-6">
      <VendorDetailsCard vendor={vendor} />

      {/* Admin Tier Control */}
      <AdminDirectTierChange
        vendorId={vendor.id}
        currentTier={vendor.tier}
        vendorName={vendor.companyName}
        onSuccess={() => {
          // Refresh page or show notification
          window.location.reload();
        }}
      />

      <LocationsSection vendor={vendor} />
    </div>
  );
}
```

## Related Components

- **AdminTierRequestQueue:** Handles tier upgrade requests from vendors
- **TierUpgradeRequestForm:** Vendor-facing tier upgrade request form
- **TierComparisonTable:** Displays tier features side-by-side

## Related Services

- **TierValidationService:** Backend tier validation logic
- **EmailService:** Sends notifications (not triggered for admin direct changes)
- **LocationService:** Enforces tier-based location limits

## Future Enhancements

- [ ] Add reason field for tier changes (audit trail)
- [ ] Send email notification to vendor when admin changes tier
- [ ] Show tier change history (changelog)
- [ ] Batch tier changes for multiple vendors
- [ ] Tier change preview (show what features will be gained/lost)
- [ ] Undo last tier change functionality
