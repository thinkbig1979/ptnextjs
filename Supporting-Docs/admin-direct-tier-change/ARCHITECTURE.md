# AdminDirectTierChange Component Architecture

## Component Hierarchy

```
AdminDirectTierChange (Client Component)
├── Card
│   ├── CardHeader
│   │   ├── CardTitle: "Admin Tier Control"
│   │   └── CardDescription: "Directly change vendor tier..."
│   └── CardContent
│       ├── Current Tier Display
│       │   ├── Label: "Current Tier"
│       │   ├── Badge: {TIER_NAMES[currentTier]}
│       │   └── Description: {TIER_DESCRIPTIONS[currentTier]}
│       ├── Tier Selection
│       │   ├── Label: "New Tier"
│       │   └── Select
│       │       ├── SelectTrigger
│       │       ├── SelectValue
│       │       └── SelectContent
│       │           └── SelectItem (x4 tiers)
│       └── Button: "Change Tier"
│
└── Dialog (Confirmation)
    ├── DialogHeader
    │   ├── DialogTitle: "Confirm Tier Change"
    │   └── DialogDescription: "You are about to change..."
    ├── DialogContent
    │   ├── Current/New Tier Grid
    │   └── Conditional Warning/Confirmation Box
    │       ├── Icon (AlertTriangle | CheckCircle)
    │       └── Message
    └── DialogFooter
        ├── Button: "Cancel"
        └── Button: "Confirm Change"
```

---

## Data Flow Diagram

```
┌──────────────────────────────────────────────────────────┐
│                    Parent Component                       │
│  (e.g., Admin Vendor Detail Page)                        │
└───────────────┬──────────────────────────────────────────┘
                │ Props ▼
                │ - vendorId: string
                │ - currentTier: Tier
                │ - vendorName: string
                │ - onSuccess?: () => void
                │
┌───────────────▼──────────────────────────────────────────┐
│         AdminDirectTierChange Component                   │
│                                                           │
│  State:                                                   │
│  ├── selectedTier: string                                │
│  ├── confirmDialogOpen: boolean                          │
│  └── isSubmitting: boolean                               │
│                                                           │
│  Computed:                                                │
│  ├── hasChanged = selectedTier !== currentTier           │
│  └── isDowngrade = TIER_HIERARCHY[selected] < current    │
└───────────┬───────────────────────────────┬──────────────┘
            │                               │
            │ User Actions                  │ API Calls
            ▼                               ▼
┌───────────────────────┐      ┌──────────────────────────┐
│   User Interactions   │      │   Backend API            │
│                       │      │                          │
│ 1. Select tier        │      │ PUT /api/admin/vendors/  │
│ 2. Click "Change"     │      │     [id]/tier            │
│ 3. Review confirmation│      │                          │
│ 4. Click "Confirm"    │──────▶ Body: { tier: string }  │
│                       │      │                          │
│                       │◀─────│ Response:                │
│                       │      │ - 200: Success           │
│                       │      │ - 400/401/403/404: Error │
└───────────────────────┘      └──────────────────────────┘
            │
            │ Result
            ▼
┌───────────────────────────────────────────────────────────┐
│                    User Feedback                          │
│                                                           │
│  Success:                      Error:                    │
│  ├── Toast: "Tier updated"     ├── Toast: "Error..."    │
│  ├── Close dialog              ├── Keep dialog open     │
│  └── Call onSuccess()          └── Enable retry         │
└───────────────────────────────────────────────────────────┘
            │
            │ (if onSuccess provided)
            ▼
┌───────────────────────────────────────────────────────────┐
│              Parent Component Callback                    │
│  - Refresh vendor data                                    │
│  - Update UI state                                        │
│  - Navigate to different page                            │
│  - Show additional confirmation                          │
└───────────────────────────────────────────────────────────┘
```

---

## State Management Flow

### 1. Initial State
```typescript
const [selectedTier, setSelectedTier] = useState<string>(currentTier);
const [confirmDialogOpen, setConfirmDialogOpen] = useState(false);
const [isSubmitting, setIsSubmitting] = useState(false);
```

### 2. Tier Selection
```
User selects tier
    ↓
setSelectedTier(newTier)
    ↓
hasChanged = true
    ↓
Button enabled
```

### 3. Confirmation Dialog
```
User clicks "Change Tier"
    ↓
Check: hasChanged?
    ├─ Yes → setConfirmDialogOpen(true)
    └─ No → Show toast "No change"
    ↓
Dialog renders with:
    ├─ Current tier
    ├─ New tier
    └─ Warning/Confirmation box (based on isDowngrade())
```

### 4. Submission Flow
```
User clicks "Confirm"
    ↓
setIsSubmitting(true)
    ↓
API Call
    ↓
    ├─ Success:
    │   ├─ Show success toast
    │   ├─ setConfirmDialogOpen(false)
    │   ├─ Call onSuccess()
    │   └─ setIsSubmitting(false)
    │
    └─ Error:
        ├─ Show error toast
        ├─ Keep dialog open
        └─ setIsSubmitting(false)
```

---

## Component Dependencies

### External Packages
```typescript
import React, { useState } from 'react';
```

### shadcn/ui Components
```typescript
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
```

### Custom Hooks
```typescript
import { useToast } from '@/hooks/use-toast';
```

### Icons
```typescript
import { AlertTriangle, CheckCircle, Loader2 } from 'lucide-react';
```

### Constants
```typescript
import { TIER_NAMES, TIER_DESCRIPTIONS, TIER_HIERARCHY } from '@/lib/constants/tierConfig';
```

---

## API Integration Architecture

### Request Flow
```
Component
    ↓
fetch('/api/admin/vendors/[id]/tier', {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    credentials: 'include',  // ← Sends auth cookies
    body: JSON.stringify({ tier: selectedTier })
})
    ↓
Next.js API Route Handler
    ↓
Extract admin from cookies/headers
    ↓
Validate admin role
    ↓
Validate tier value
    ↓
Get Payload CMS instance
    ↓
Fetch vendor (verify exists)
    ↓
Update vendor.tier
    ↓
Log tier change
    ↓
Return success response
```

### Response Flow
```
API Response
    ↓
Component receives response
    ↓
Check response.ok
    ├─ true:
    │   ├─ Parse JSON
    │   ├─ Show success toast
    │   ├─ Close dialog
    │   └─ Call onSuccess()
    │
    └─ false:
        ├─ Parse error JSON
        ├─ Show error toast
        └─ Keep dialog open
```

---

## Security Architecture

### Client-Side Security
1. **Component Rendering:**
   - Should only render for admin users
   - Parent component responsible for auth check
   - No sensitive data exposed in component

2. **API Communication:**
   - Uses `credentials: 'include'` for auth cookies
   - Sends only tier value (no sensitive data)
   - Error messages sanitized (no backend stack traces)

### Backend Security (API Route)
1. **Authentication:**
   - Extract token from cookie or Authorization header
   - Validate token using authService
   - Verify user exists and is active

2. **Authorization:**
   - Check user.role === 'admin'
   - Return 403 if not admin
   - Log unauthorized access attempts

3. **Input Validation:**
   - Validate tier value against allowed values
   - Validate vendor ID format
   - Sanitize all inputs

4. **Audit Trail:**
   - Log all tier changes
   - Include: vendorId, previous tier, new tier, timestamp
   - (Future: Include admin user ID)

---

## Event Flow Diagram

```
┌─────────────────────────────────────────────────────────────┐
│                    Component Mount                           │
│  - Initialize state with currentTier                         │
│  - Dialog closed by default                                  │
└────────────────────┬────────────────────────────────────────┘
                     │
                     ▼
┌─────────────────────────────────────────────────────────────┐
│              Event: User Selects Tier                        │
│  - setSelectedTier(newTier)                                  │
│  - hasChanged computed                                       │
│  - Button state updated                                      │
└────────────────────┬────────────────────────────────────────┘
                     │
                     ▼
┌─────────────────────────────────────────────────────────────┐
│         Event: User Clicks "Change Tier"                     │
│  - Validate hasChanged                                       │
│  - If true: setConfirmDialogOpen(true)                       │
│  - If false: Show toast                                      │
└────────────────────┬────────────────────────────────────────┘
                     │
                     ▼
┌─────────────────────────────────────────────────────────────┐
│              Event: Dialog Opens                             │
│  - Render current/new tier comparison                        │
│  - Compute isDowngrade()                                     │
│  - Show appropriate warning/confirmation                     │
└────────────────────┬────────────────────────────────────────┘
                     │
        ┌────────────┴────────────┐
        │                         │
        ▼                         ▼
┌──────────────┐        ┌──────────────────┐
│Event: Cancel │        │Event: Confirm    │
│- Close dialog│        │- setSubmitting   │
│- No API call │        │- API call        │
│- No changes  │        │- Handle response │
└──────────────┘        └────────┬─────────┘
                                 │
                    ┌────────────┴────────────┐
                    │                         │
                    ▼                         ▼
            ┌──────────────┐        ┌──────────────┐
            │API Success   │        │API Error     │
            │- Success toast│        │- Error toast │
            │- Close dialog│        │- Keep dialog │
            │- onSuccess() │        │- Allow retry │
            └──────────────┘        └──────────────┘
```

---

## Error Handling Architecture

### Error Types & Handling

```typescript
try {
  const response = await fetch(...);
  const data = await response.json();

  if (!response.ok) {
    // HTTP Error
    throw new Error(data.error || 'Failed to update vendor tier');
  }

  // Success path
  toast({ title: 'Tier updated', ... });
  onSuccess?.();

} catch (error) {
  // Network Error or Thrown Error
  const message = error instanceof Error
    ? error.message
    : 'Failed to update tier';

  toast({
    title: 'Error',
    description: message,
    variant: 'destructive',
  });
}
```

### Error Categories

1. **Network Errors:**
   - No internet connection
   - DNS resolution failure
   - Request timeout
   - **Handling:** Generic error toast

2. **Authentication Errors (401):**
   - No token provided
   - Invalid token
   - Expired token
   - **Handling:** Error toast + redirect to login

3. **Authorization Errors (403):**
   - Not admin role
   - Insufficient permissions
   - **Handling:** Error toast

4. **Validation Errors (400):**
   - Invalid tier value
   - Missing tier parameter
   - **Handling:** Error toast with specific message

5. **Not Found Errors (404):**
   - Vendor doesn't exist
   - **Handling:** Error toast

6. **Server Errors (500):**
   - Database error
   - Unexpected backend error
   - **Handling:** Generic error toast

---

## Performance Considerations

### Optimization Strategies

1. **State Management:**
   - Minimal state (only 3 state variables)
   - No unnecessary re-renders
   - Computed values (hasChanged, isDowngrade)

2. **API Calls:**
   - Single API call per confirmation
   - No polling or redundant requests
   - Proper error handling prevents retry loops

3. **Component Rendering:**
   - Dialog lazy-loaded (only when opened)
   - Select options static (no dynamic fetching)
   - Icons imported only once

4. **Event Handlers:**
   - Functions defined inline (React handles optimization)
   - No event listener leaks
   - Proper cleanup on unmount

### Potential Bottlenecks

1. **None identified** - Component is lightweight
2. **API latency** - Depends on backend performance
3. **Network speed** - Beyond component control

---

## Testing Architecture

### Unit Tests Structure

```typescript
describe('AdminDirectTierChange', () => {
  // Rendering Tests
  it('renders current tier information');

  // Interaction Tests
  it('disables change button when no tier is selected');
  it('enables change button when different tier is selected');
  it('shows confirmation dialog when button clicked');

  // Logic Tests
  it('shows downgrade warning when downgrading');
  it('shows upgrade confirmation when upgrading');

  // API Tests
  it('successfully updates tier via API');
  it('handles API errors gracefully');
  it('allows canceling confirmation dialog');
});
```

### Mocking Strategy

```typescript
// Mock useToast hook
jest.mock('@/hooks/use-toast', () => ({
  useToast: jest.fn(() => ({ toast: mockToast })),
}));

// Mock fetch API
global.fetch = jest.fn(() =>
  Promise.resolve({
    ok: true,
    json: async () => ({ ... }),
  })
);
```

---

## Accessibility Architecture

### ARIA Attributes
- Dialog has `role="dialog"`, `aria-labelledby`, `aria-describedby`
- Select has proper `aria-label`
- Buttons have descriptive text (no icon-only buttons)

### Keyboard Navigation
- Tab: Navigate between form fields
- Enter: Submit form, confirm dialog
- Escape: Close dialog
- Arrow keys: Navigate select options

### Focus Management
- Dialog traps focus when open
- Focus returns to trigger button when closed
- Clear focus indicators on all interactive elements

### Screen Reader Support
- All interactive elements labeled
- State changes announced (loading, success, error)
- Error messages associated with form fields

---

## Extensibility Points

### Future Enhancement Hooks

1. **Additional Validation:**
   ```typescript
   // Add custom validation before API call
   if (customValidation && !customValidation(selectedTier)) {
     return;
   }
   ```

2. **Custom Confirmation:**
   ```typescript
   // Add custom confirmation step
   if (requiresSpecialApproval(selectedTier)) {
     // Show additional confirmation
   }
   ```

3. **Analytics Tracking:**
   ```typescript
   // Track tier changes
   analytics.track('admin_tier_change', {
     vendorId,
     oldTier: currentTier,
     newTier: selectedTier,
   });
   ```

4. **Email Notifications:**
   ```typescript
   // Send notification after success
   await emailService.sendTierChangeNotification({
     vendorId,
     newTier: selectedTier,
   });
   ```

---

## Deployment Considerations

### Build Process
- Component is client-side (`'use client'`)
- No server-side rendering needed
- Included in client bundle

### Environment Variables
- None required for component
- API endpoint hardcoded (relative path)
- Backend may require env vars

### Monitoring
- Component logs errors to console
- Backend logs tier changes
- Consider adding client-side error tracking (Sentry, etc.)

---

**Architecture Version:** 1.0.0
**Last Updated:** 2025-12-05
