# TierDowngradeRequestForm - UI Reference

## Component Visual Structure

```
┌─────────────────────────────────────────────────────────────────┐
│ Request Tier Downgrade                                          │
│ Select a lower tier and understand what features you will lose │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│ ┌─────────────────────────────────────────────────────────────┐│
│ │ ⚠️ Important: Feature Loss Warning                          ││
│ │                                                              ││
│ │ Downgrading your tier will immediately remove access to     ││
│ │ premium features. This may result in:                       ││
│ │                                                              ││
│ │ • Reduced product listing limits                            ││
│ │ • Loss of featured placements and priority rankings         ││
│ │ • Removal of advanced analytics and insights                ││
│ │ • Reduced location capacity                                 ││
│ │ • Loss of custom branding options                           ││
│ └─────────────────────────────────────────────────────────────┘│
│   (Yellow/Orange alert box - highly visible)                   │
│                                                                 │
│ Target Tier *                                                   │
│ ┌─────────────────────────────────────────────────────────────┐│
│ │ Select a lower tier                          ▼              ││
│ └─────────────────────────────────────────────────────────────┘│
│ Current tier: Tier 3                                            │
│                                                                 │
│ ┌─────────────────────────────────────────────────────────────┐│
│ │ Features You Will Lose:                                     ││
│ │                                                              ││
│ │ • Up to 25 products                                         ││
│ │ • 5 featured products                                       ││
│ │ • Up to 5 business locations                                ││
│ │ • Custom branding colors                                    ││
│ │ • Advanced analytics                                        ││
│ │ • Homepage featured listing                                 ││
│ │ • Priority email support (12hrs)                            ││
│ │ • Unlimited products                                        ││
│ │ • Unlimited featured products                               ││
│ │ • Up to 10 business locations                               ││
│ │ • Priority search ranking                                   ││
│ │ • Dedicated account manager                                 ││
│ │ • Premium email support (4hrs)                              ││
│ │ • 12 promotion credits/month                                ││
│ └─────────────────────────────────────────────────────────────┘│
│   (Orange box - appears when tier selected)                    │
│                                                                 │
│ Reason for Downgrade (Optional)                                │
│ ┌─────────────────────────────────────────────────────────────┐│
│ │ Please share your reason for downgrading (optional)...     ││
│ │                                                              ││
│ │                                                              ││
│ │                                                              ││
│ └─────────────────────────────────────────────────────────────┘│
│ Minimum 20 characters if provided                              │
│                                                                 │
│ ┌─────────────────────────────────────────────────────────────┐│
│ │ ☐ I understand the consequences                            ││
│ │                                                              ││
│ │   I acknowledge that downgrading will immediately remove    ││
│ │   access to the features listed above, and I accept the     ││
│ │   limitations of the Tier 1 tier.                           ││
│ └─────────────────────────────────────────────────────────────┘│
│   (Orange confirmation box with checkbox)                      │
│                                                                 │
│                                      [ Cancel ]  [ Submit  ]    │
│                                                   Downgrade     │
│                                                   Request       │
└─────────────────────────────────────────────────────────────────┘
```

## State Variations

### 1. Initial State (No Tier Selected)
- Warning alert visible
- Target tier dropdown showing placeholder
- Features lost section NOT visible
- Reason textarea empty
- Confirmation checkbox disabled
- Submit button disabled (form invalid)

### 2. Tier Selected State
- Warning alert visible
- Target tier dropdown showing selected tier
- **Features lost section NOW VISIBLE** (orange box)
- Reason textarea empty
- Confirmation checkbox enabled but unchecked
- Submit button disabled (confirmation not checked)

### 3. Tier Selected + Confirmation Checked
- All previous elements visible
- Confirmation checkbox checked
- Submit button ENABLED

### 4. Submitting State
- All form fields disabled
- Submit button shows "Submitting..." text
- Submit button disabled
- Cancel button disabled

### 5. Error State
- Toast notification appears at top
- Form remains in current state
- Fields re-enabled
- User can retry

### 6. Success State
- Success toast notification
- Form resets to initial state
- onSuccess callback invoked

## Color Scheme

### Warning/Alert Elements
- **Background**: `bg-yellow-50` / `bg-orange-50`
- **Border**: `border-yellow-300` / `border-orange-200`
- **Text**: `text-yellow-900` / `text-orange-900`
- **Icon**: `text-yellow-600` / `text-orange-600`
- **Description**: `text-yellow-800` / `text-orange-800`

### Submit Button (Destructive)
- **Variant**: `destructive`
- **Colors**: Red theme (shadcn destructive colors)

### Form Elements
- **Labels**: Default text color
- **Inputs**: Default border and background
- **Descriptions**: `text-muted-foreground`
- **Errors**: `text-destructive`

## Responsive Behavior

### Desktop (> 768px)
- Form fields full width within card
- Two-column button layout (Cancel left, Submit right)
- Adequate padding and spacing

### Tablet (768px - 1024px)
- Same as desktop
- May have narrower max-width

### Mobile (< 768px)
- Full width form
- Stacked button layout
- Reduced padding
- Textarea may be smaller

## Accessibility Features

### ARIA Labels
- Select trigger: `aria-label="Target Tier"`
- Textarea: `aria-label="Reason for Downgrade"`
- Checkbox: `aria-label="Confirmation"`

### Keyboard Navigation
- Tab order: Tier select → Textarea → Checkbox → Cancel → Submit
- Enter key submits form (when valid)
- Escape key can trigger cancel (if implemented)

### Screen Reader Support
- Alert has `role="alert"`
- Form validation errors announced
- Submit button state changes announced

## User Flow

```
1. User opens form (sees warning immediately)
   ↓
2. Selects lower tier from dropdown
   ↓
3. Features lost section appears dynamically
   ↓
4. User reviews lost features
   ↓
5. (Optional) User enters reason in textarea
   ↓
6. User checks confirmation checkbox
   ↓
7. Submit button becomes enabled
   ↓
8. User clicks "Submit Downgrade Request"
   ↓
9. Form submits to API
   ↓
10. Success toast appears
   ↓
11. Form resets OR parent closes modal
```

## Form Validation States

### Target Tier Field
- **Empty**: Error message "Please select a tier"
- **Valid**: No error message

### Reason Field (Optional)
- **Empty**: Valid (optional field)
- **1-19 chars**: Error "Vendor notes must be at least 20 characters"
- **20-500 chars**: Valid
- **501+ chars**: Error "Vendor notes cannot exceed 500 characters"

### Confirmation Checkbox
- **Unchecked**: Error "You must confirm..."
- **Checked**: Valid

## Interaction Details

### Tier Selection Dropdown
- Shows tiers in ascending order (free, tier1, tier2, tier3)
- Only includes tiers BELOW current tier
- Example for Tier 3 vendor:
  ```
  Free
  Tier 1
  Tier 2
  ```

### Features Lost Calculation
- Dynamically calculated based on:
  - Current tier
  - Selected target tier
- Shows ALL features from tiers between target and current
- Removes duplicate features

### Confirmation Checkbox Behavior
- Disabled when no tier selected (grayed out)
- Enabled when tier selected
- Must be checked for form to be valid
- Clicking unchecks and checks (toggle)

## Error Messages

### API Errors
- **401**: "Your session has expired. Please log in again."
  - Redirects to `/vendor/login` after 1.5s
- **403**: "You do not have permission to perform this action."
  - Redirects to `/vendor/dashboard` after 1.5s
- **409**: "You already have a pending downgrade request"
- **400**: Shows server message or "Please fix the errors in the form"
- **500**: "Server error. Please try again later."
- **Network**: "Failed to submit request. Please try again."

### Success Message
- "Tier downgrade request submitted successfully!"

## Component Behavior

### Null Rendering
If `currentTier === 'free'`, component returns null (doesn't render).

### onSuccess Callback
- Called after successful API response
- Passes response data as parameter
- Parent can use to close modal, refresh data, etc.

### onCancel Callback
- Called when Cancel button clicked
- Parent can use to close modal/dialog

## Toast Notifications

### Position
- Default shadcn/sonner position (usually top-right)

### Duration
- Auto-dismiss after ~5 seconds
- User can dismiss manually

### Types
- **Success**: Green checkmark icon
- **Error**: Red X icon

## Loading States

### Submit Button
- **Normal**: "Submit Downgrade Request"
- **Loading**: "Submitting..."
- **Disabled**: Grayed out, not clickable

### Form Fields During Submission
- All fields disabled
- Grayed out appearance
- Not interactive
