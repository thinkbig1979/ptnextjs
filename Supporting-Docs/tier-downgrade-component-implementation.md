# TierDowngradeRequestForm Component Implementation

## Overview
Created the `TierDowngradeRequestForm` component as part of the tier management system. This component allows vendors to request a downgrade to a lower subscription tier with appropriate warnings and confirmations.

## Component Location
- **File**: `/home/edwin/development/ptnextjs/components/dashboard/TierDowngradeRequestForm.tsx`

## Key Features

### 1. Tier Selection
- Shows only LOWER tiers than the current tier
- Dynamic tier hierarchy:
  - If current is tier3: shows tier2, tier1, free
  - If current is tier2: shows tier1, free
  - If current is tier1: shows free only
  - If current is free: component doesn't render (already at lowest)

### 2. Warning System
- Prominent yellow warning alert at the top of the form
- Lists general consequences of downgrading
- Dynamic "Features You Will Lose" section that updates based on selected tier
- Shows specific features from all tiers between current and target

### 3. Confirmation Requirement
- Mandatory checkbox before submission
- User must acknowledge understanding of consequences
- Checkbox is disabled until a target tier is selected
- Clear language about immediate feature loss

### 4. Form Fields

#### Target Tier (Required)
- Select dropdown showing only lower tiers
- Displays current tier in form description

#### Reason for Downgrade (Optional)
- Textarea for vendor notes
- 20-500 character validation if provided
- Character counter with validation feedback

#### Confirmation (Required)
- Checkbox with clear warning message
- Must be checked before form can be submitted

### 5. Form Submission
- **Endpoint**: POST `/api/portal/vendors/{vendorId}/tier-downgrade-request`
- **Payload**:
  ```json
  {
    "requestedTier": "tier1" | "tier2" | "tier3" | "free",
    "vendorNotes": "optional reason string"
  }
  ```

### 6. Error Handling
- 401: Session expired - redirects to login
- 403: Permission denied - redirects to dashboard
- 409: Pending request already exists
- 400: Validation errors
- 500: Server error
- Network errors handled with user-friendly messages

## Tier Features Reference

The component includes a comprehensive feature matrix:

### Free Tier
- Basic profile only
- 1 product listing
- 1 business location
- No social media links
- No video introduction
- Standard email support (48hrs)

### Tier 1
- Up to 5 products
- 1 featured product
- Video introduction
- Team member profiles
- Case studies & certifications
- Social media links
- Priority email support (24hrs)

### Tier 2
- Up to 25 products
- 5 featured products
- Up to 5 business locations
- Custom branding colors
- Advanced analytics
- Homepage featured listing
- Priority email support (12hrs)

### Tier 3
- Unlimited products
- Unlimited featured products
- Up to 10 business locations
- Priority search ranking
- Dedicated account manager
- Premium email support (4hrs)
- 12 promotion credits/month

## Component Props

```typescript
interface TierDowngradeRequestFormProps {
  vendorId: string;
  currentTier: 'free' | 'tier1' | 'tier2' | 'tier3';
  onSuccess?: (data?: any) => void;
  onCancel?: () => void;
}
```

## Usage Example

```tsx
import { TierDowngradeRequestForm } from '@/components/dashboard/TierDowngradeRequestForm';

function VendorDashboard() {
  const handleSuccess = (data) => {
    // Handle successful submission
    console.log('Downgrade request submitted:', data);
    // Refresh data, close modal, etc.
  };

  const handleCancel = () => {
    // Handle cancellation
    console.log('User cancelled downgrade request');
  };

  return (
    <TierDowngradeRequestForm
      vendorId="vendor-123"
      currentTier="tier3"
      onSuccess={handleSuccess}
      onCancel={handleCancel}
    />
  );
}
```

## Styling & Design

### Color Scheme
- **Warning Elements**: Yellow (orange-50, orange-200, orange-600, orange-800, orange-900)
- **Destructive Actions**: Red (uses shadcn destructive variant)
- **Info Elements**: Blue (primary colors)

### Components Used
- Card, CardHeader, CardTitle, CardDescription, CardContent
- Form, FormField, FormItem, FormLabel, FormControl, FormDescription, FormMessage
- Select, SelectContent, SelectItem, SelectTrigger, SelectValue
- Textarea
- Button (destructive variant for submit)
- Alert, AlertTitle, AlertDescription
- Checkbox
- AlertTriangle icon from lucide-react

## Validation

### Zod Schema
```typescript
{
  requestedTier: enum(['free', 'tier1', 'tier2', 'tier3']) - required
  vendorNotes: string - optional, 20-500 chars if provided
  confirmation: boolean - must be true
}
```

### Real-time Validation
- Form validation mode: `onBlur`
- Character counter updates live
- Error messages appear below fields
- Submit button enabled only when form is valid

## Key Implementation Details

### 1. Helper Functions

#### getAvailableLowerTiers()
Returns array of tiers below current tier in hierarchy.

#### getFeaturesLost()
Calculates and returns unique list of features that will be lost when downgrading from current tier to target tier.

### 2. Conditional Rendering
- Component returns null if current tier is 'free' (no downgrade possible)
- Features lost section only shows when a target tier is selected
- Confirmation checkbox disabled until tier selected

### 3. State Management
- Uses react-hook-form for form state
- Watches selectedTier and vendorNotes for dynamic UI updates
- Local isSubmitting state for loading states

## Testing Considerations

### Unit Tests Needed
1. Component renders correctly for each tier
2. Correct lower tiers shown in dropdown
3. Features lost calculation accuracy
4. Form validation works correctly
5. Confirmation checkbox requirement enforced
6. Submit button disabled during submission
7. Error handling for each status code
8. Success callback invoked correctly

### Integration Tests Needed
1. Form submission to API endpoint
2. Response handling for success/error cases
3. Toast notifications display correctly
4. Navigation on auth errors

## Pattern Consistency

This component follows the same patterns as `TierUpgradeRequestForm`:
- Similar prop interface
- Consistent error handling
- Same validation approach
- Matching styling with shadcn/ui
- Similar user feedback mechanisms

### Key Differences from Upgrade Form
1. Shows LOWER tiers instead of higher
2. Adds prominent warning system
3. Includes confirmation checkbox requirement
4. Uses destructive button variant
5. Different messaging focused on feature loss
6. Dynamic features lost display

## API Integration

### Expected Request
```http
POST /api/portal/vendors/{vendorId}/tier-downgrade-request
Content-Type: application/json

{
  "requestedTier": "tier1",
  "vendorNotes": "Optional reason for downgrade..."
}
```

### Expected Response (Success)
```json
{
  "success": true,
  "data": {
    "id": "request-id",
    "status": "pending",
    ...
  }
}
```

### Expected Response (Error)
```json
{
  "success": false,
  "message": "Error message here"
}
```

## Future Enhancements

Potential improvements for future iterations:
1. Cost comparison display (show pricing for each tier)
2. Effective date selection (schedule downgrade for future date)
3. Data retention warnings (what happens to excess data)
4. Alternative suggestions (show if downgrade isn't needed)
5. Live chat support link in warning area
6. Comparison table integrated in form
7. Undo option for recent requests

## Dependencies

### NPM Packages
- react-hook-form
- @hookform/resolvers
- zod
- lucide-react

### Internal Dependencies
- @/components/ui/* (shadcn/ui components)
- @/lib/utils (cn utility)

## Maintenance Notes

When updating this component:
1. Keep tier hierarchy consistent with backend
2. Update TIER_FEATURES when tier limits change
3. Maintain parity with TierUpgradeRequestForm patterns
4. Test all tier combinations thoroughly
5. Verify API endpoint changes reflected in fetch call
