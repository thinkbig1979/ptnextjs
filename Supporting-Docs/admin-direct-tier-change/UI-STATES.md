# AdminDirectTierChange UI States

## Visual Component States

### 1. Initial State (Default View)

```
┌─────────────────────────────────────────┐
│ Admin Tier Control                      │
│ Directly change vendor tier (bypasses   │
│ request workflow)                        │
├─────────────────────────────────────────┤
│ Current Tier                             │
│ [Professional] Basic profile with...    │
│                                          │
│ New Tier                                 │
│ [Select tier ▼]                          │
│                                          │
│ [ Change Tier (disabled) ]              │
└─────────────────────────────────────────┘
```

**State Details:**
- Card with title and description
- Current tier shown as badge (outline style)
- Tier description shown in muted text
- Dropdown select (not opened)
- Button disabled (no change detected)

---

### 2. Dropdown Open State

```
┌─────────────────────────────────────────┐
│ Admin Tier Control                      │
│ Directly change vendor tier (bypasses   │
│ request workflow)                        │
├─────────────────────────────────────────┤
│ Current Tier                             │
│ [Professional] Basic profile with...    │
│                                          │
│ New Tier                                 │
│ ┌──────────────────────────────────┐   │
│ │ Free - Basic profile with...     │   │
│ │ Professional - Enhanced profile...│   │
│ │ Business - Business profile...    │   │
│ │ Enterprise - Enterprise profile...│   │
│ └──────────────────────────────────┘   │
│                                          │
│ [ Change Tier (disabled) ]              │
└─────────────────────────────────────────┘
```

**State Details:**
- Dropdown expanded
- All 4 tiers shown as options
- Each option shows tier name + description
- Current tier can be selected (results in no change)

---

### 3. Tier Selected (Different from Current)

```
┌─────────────────────────────────────────┐
│ Admin Tier Control                      │
│ Directly change vendor tier (bypasses   │
│ request workflow)                        │
├─────────────────────────────────────────┤
│ Current Tier                             │
│ [Professional] Basic profile with...    │
│                                          │
│ New Tier                                 │
│ [Business - Business profile with... ▼] │
│                                          │
│ [ Change Tier (enabled) ]               │
└─────────────────────────────────────────┘
```

**State Details:**
- Different tier selected (Business)
- Button now enabled
- Button has primary color (clickable)

---

### 4. Confirmation Dialog - Upgrade

```
Background overlay (dark transparent)
┌───────────────────────────────────────────┐
│ Confirm Tier Change                       │
│ You are about to change the tier for      │
│ Acme Superyacht Services                  │
├───────────────────────────────────────────┤
│                                            │
│ Current Tier       New Tier                │
│ Professional       Business                │
│                                            │
│ ┌────────────────────────────────────────┐│
│ │ ✓ Upgrade Confirmation                 ││
│ │ This vendor will gain access to        ││
│ │ additional features available in       ││
│ │ Business.                              ││
│ └────────────────────────────────────────┘│
│                                            │
│            [ Cancel ] [ Confirm Change ]   │
└───────────────────────────────────────────┘
```

**State Details:**
- Modal dialog over dark overlay
- Shows vendor name in bold
- Split view: Current tier vs New tier
- Green confirmation box with checkmark icon
- Two buttons: Cancel (outline) + Confirm (primary)

---

### 5. Confirmation Dialog - Downgrade

```
Background overlay (dark transparent)
┌───────────────────────────────────────────┐
│ Confirm Tier Change                       │
│ You are about to change the tier for      │
│ Premium Yacht Co.                         │
├───────────────────────────────────────────┤
│                                            │
│ Current Tier       New Tier                │
│ Enterprise         Professional            │
│                                            │
│ ┌────────────────────────────────────────┐│
│ │ ⚠ Downgrade Warning                    ││
│ │ This vendor will lose access to        ││
│ │ features available in higher tiers.    ││
│ │ Their data will be preserved but may   ││
│ │ exceed new tier limits.                ││
│ └────────────────────────────────────────┘│
│                                            │
│            [ Cancel ] [ Confirm Change ]   │
└───────────────────────────────────────────┘
```

**State Details:**
- Modal dialog over dark overlay
- Shows vendor name in bold
- Split view: Current tier vs New tier
- Yellow warning box with alert triangle icon
- Two buttons: Cancel (outline) + Confirm (primary)

---

### 6. Submitting State (Loading)

```
Background overlay (dark transparent)
┌───────────────────────────────────────────┐
│ Confirm Tier Change                       │
│ You are about to change the tier for      │
│ Acme Superyacht Services                  │
├───────────────────────────────────────────┤
│                                            │
│ Current Tier       New Tier                │
│ Professional       Business                │
│                                            │
│ ┌────────────────────────────────────────┐│
│ │ ✓ Upgrade Confirmation                 ││
│ │ This vendor will gain access to        ││
│ │ additional features available in       ││
│ │ Business.                              ││
│ └────────────────────────────────────────┘│
│                                            │
│     [ Cancel (disabled) ] [ ⟳ Confirm ]   │
└───────────────────────────────────────────┘
```

**State Details:**
- Same as confirmation dialog
- Cancel button disabled
- Confirm button shows spinner icon
- Button text still visible
- User cannot interact during API call

---

### 7. Success Toast Notification

```
┌─────────────────────────────────────────┐
│ Admin Tier Control                      │
│ ...component UI...                      │
└─────────────────────────────────────────┘

                    ┌─────────────────────┐
                    │ Tier updated        │
                    │ Acme Superyacht     │
                    │ Services has been   │
                    │ changed to Business.│
                    └─────────────────────┘
```

**State Details:**
- Toast appears in corner (usually top-right)
- Success variant (typically green/default)
- Shows vendor name and new tier
- Auto-dismisses after few seconds

---

### 8. Error Toast Notification

```
┌─────────────────────────────────────────┐
│ Admin Tier Control                      │
│ ...component UI...                      │
└─────────────────────────────────────────┘

                    ┌─────────────────────┐
                    │ Error               │
                    │ Vendor not found    │
                    └─────────────────────┘
```

**State Details:**
- Toast appears in corner
- Destructive variant (typically red)
- Shows error message
- Auto-dismisses after few seconds

---

## Color Schemes

### Badge Colors (Current Tier)
- Uses outline variant
- Follows tier branding from tierConfig

### Confirmation Box Colors

**Upgrade (Green):**
- Border: `border-green-500`
- Background: `bg-green-50` / `dark:bg-green-950`
- Icon: `text-green-600` / `dark:text-green-400`
- Text: `text-green-800` / `dark:text-green-200`

**Downgrade (Yellow/Warning):**
- Border: `border-yellow-500`
- Background: `bg-yellow-50` / `dark:bg-yellow-950`
- Icon: `text-yellow-600` / `dark:text-yellow-400`
- Text: `text-yellow-800` / `dark:text-yellow-200`

### Button States
- Disabled: Muted/gray, not clickable
- Enabled: Primary color (default blue)
- Loading: Shows spinner, maintains primary color

---

## Responsive Behavior

### Desktop (> 768px)
- Card full width in container
- Confirmation dialog: max-width with centered modal
- Two-column grid for current/new tier comparison

### Tablet (768px - 1024px)
- Card adapts to container width
- Dialog slightly narrower
- Grid maintains two columns

### Mobile (< 768px)
- Card full width
- Select dropdown full width
- Dialog full width with padding
- Grid may stack to single column (responsive)

---

## Accessibility Features

1. **Keyboard Navigation:**
   - Tab through form fields
   - Enter to open select
   - Arrow keys to navigate options
   - Escape to close dialog

2. **Screen Reader Support:**
   - Proper ARIA labels on select
   - Dialog has accessible title and description
   - Button states announced (enabled/disabled/loading)

3. **Focus Management:**
   - Focus trapped in dialog when open
   - Focus returns to trigger button when closed
   - Clear focus indicators

4. **Color Contrast:**
   - All text meets WCAG AA standards
   - Icons have appropriate contrast
   - Borders visible in both light/dark modes

---

## Animation & Transitions

1. **Dialog:**
   - Fade-in overlay
   - Slide-in/scale-in content
   - Smooth transitions (200-300ms)

2. **Select Dropdown:**
   - Smooth expand/collapse
   - Highlight on hover

3. **Button:**
   - Spinner rotation (continuous)
   - Subtle hover state
   - Click feedback

4. **Toast:**
   - Slide-in from corner
   - Auto-dismiss with fade-out
   - Swipe to dismiss (optional)

---

## Dark Mode

All components support dark mode:
- Card: Dark background with lighter border
- Select: Dark dropdown background
- Dialog: Dark modal with appropriate contrast
- Confirmation boxes: Dark variants of green/yellow
- Text: Light colors on dark backgrounds

---

## Component Dimensions

**Card:**
- Width: Full container width (flexible)
- Padding: Standard card padding (p-6)
- Height: Auto (content-based)

**Select:**
- Width: Full width within card
- Height: Standard input height (~40px)

**Dialog:**
- Max-width: ~500-600px
- Centered on screen
- Padding: Standard dialog padding

**Buttons:**
- Height: Standard button height (~40px)
- Full width in card
- Auto width in dialog footer
