# Styling Violations - Fix Examples

## Complete Before/After Examples

### Example 1: Vendor Dashboard Page (`app/(site)/vendor/dashboard/page.tsx`)

**BEFORE**:
```tsx
<div className="min-h-screen bg-gray-50 dark:bg-gray-900">
  <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
    <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
      Vendor Dashboard
    </h1>
    <p className="text-gray-600 dark:text-gray-400">
      Manage your vendor profile and products
    </p>
  </div>

  {/* Profile Completion Card */}
  <div className="bg-white dark:bg-gray-950 rounded-lg shadow">
    <div className="p-6">
      <p className="text-sm font-medium text-gray-700">Profile Completion</p>
      <span className="text-sm font-semibold text-gray-900">{profileCompletion}%</span>
      <div className="w-full bg-gray-200 rounded-full h-2">
        <div style={{ width: `${profileCompletion}%` }} />
      </div>
    </div>
    <div className="pt-2 border-t border-gray-200">
      <span className="text-sm text-gray-600">Approval Status</span>
    </div>
  </div>
</div>
```

**AFTER**:
```tsx
<div className="min-h-screen bg-background">
  <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
    <h1 className="text-3xl font-bold text-foreground mb-2">
      Vendor Dashboard
    </h1>
    <p className="text-muted-foreground">
      Manage your vendor profile and products
    </p>
  </div>

  {/* Profile Completion Card */}
  <div className="bg-card rounded-lg shadow">
    <div className="p-6">
      <p className="text-sm font-medium text-foreground">Profile Completion</p>
      <span className="text-sm font-semibold text-foreground">{profileCompletion}%</span>
      <div className="w-full bg-muted rounded-full h-2">
        <div style={{ width: `${profileCompletion}%` }} />
      </div>
    </div>
    <div className="pt-2 border-t border-border">
      <span className="text-sm text-muted-foreground">Approval Status</span>
    </div>
  </div>
</div>
```

**Changes Made**:
- ✅ `bg-gray-50 dark:bg-gray-900` → `bg-background`
- ✅ `text-gray-900 dark:text-white` → `text-foreground`
- ✅ `text-gray-600 dark:text-gray-400` → `text-muted-foreground`
- ✅ `bg-white dark:bg-gray-950` → `bg-card`
- ✅ `bg-gray-200` → `bg-muted`
- ✅ `border-gray-200` → `border-border`

---

### Example 2: Interactive Org Chart (`components/enhanced-profiles/InteractiveOrgChart.tsx`)

**BEFORE**:
```tsx
export const InteractiveOrgChart = ({ team }: Props) => {
  if (!team || team.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12">
        <Users className="w-12 h-12 mx-auto text-gray-400 mb-4" />
        <p className="text-gray-600 dark:text-gray-400">
          No team members added yet
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {team.map((member) => (
        <div
          key={member.id}
          className="bg-gray-200 dark:bg-gray-700 rounded-full flex items-center justify-center"
        >
          <Users className={cn("text-gray-400", compact ? "w-6 h-6" : "w-8 h-8")} />
          <h3 className={cn("font-semibold text-gray-900 dark:text-gray-100 mb-1", ...)}>
            {member.name}
          </h3>
          <p className={cn("text-gray-600 dark:text-gray-400 mb-2", ...)}>
            {member.role}
          </p>
          <a
            href={member.linkedin}
            className="inline-flex items-center gap-1 text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 mt-2 text-xs transition-colors"
          >
            View Profile →
          </a>
        </div>
      ))}
    </div>
  );
};
```

**AFTER**:
```tsx
export const InteractiveOrgChart = ({ team }: Props) => {
  if (!team || team.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12">
        <Users className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
        <p className="text-muted-foreground">
          No team members added yet
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {team.map((member) => (
        <div
          key={member.id}
          className="bg-muted rounded-full flex items-center justify-center"
        >
          <Users className={cn("text-muted-foreground", compact ? "w-6 h-6" : "w-8 h-8")} />
          <h3 className={cn("font-semibold text-foreground mb-1", ...)}>
            {member.name}
          </h3>
          <p className={cn("text-muted-foreground mb-2", ...)}>
            {member.role}
          </p>
          <a
            href={member.linkedin}
            className="inline-flex items-center gap-1 text-accent hover:text-accent/80 mt-2 text-xs transition-colors"
          >
            View Profile →
          </a>
        </div>
      ))}
    </div>
  );
};
```

**Changes Made**:
- ✅ `text-gray-400` → `text-muted-foreground`
- ✅ `text-gray-600 dark:text-gray-400` → `text-muted-foreground`
- ✅ `bg-gray-200 dark:bg-gray-700` → `bg-muted`
- ✅ `text-gray-900 dark:text-gray-100` → `text-foreground`
- ✅ `text-blue-600 dark:text-blue-400 hover:text-blue-800` → `text-accent hover:text-accent/80`

---

### Example 3: Vendor Navigation (`components/vendor/VendorNavigation.tsx`)

**BEFORE**:
```tsx
<div
  className={`flex flex-col h-full bg-white dark:bg-slate-900 border-r border-gray-200 dark:border-slate-800 ${className || ''}`}
>
  <div className="p-4 border-b border-gray-200">
    <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
      Vendor Portal
    </h2>
    {user && (
      <p className="text-sm text-gray-600 dark:text-gray-400 truncate">
        {user.email}
      </p>
    )}
  </div>

  <nav className="flex-1 overflow-y-auto p-4">
    {navItems.map((item) => (
      <Link
        key={item.href}
        href={item.href}
        className={
          isActive
            ? 'bg-blue-50 dark:bg-blue-950 text-blue-700 dark:text-blue-300'
            : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-slate-800 hover:text-gray-900 dark:hover:text-white'
        }
      >
        {item.label}
      </Link>
    ))}
  </nav>
</div>
```

**AFTER**:
```tsx
<div
  className={`flex flex-col h-full bg-card border-r border-border ${className || ''}`}
>
  <div className="p-4 border-b border-border">
    <h2 className="text-lg font-semibold text-foreground mb-2">
      Vendor Portal
    </h2>
    {user && (
      <p className="text-sm text-muted-foreground truncate">
        {user.email}
      </p>
    )}
  </div>

  <nav className="flex-1 overflow-y-auto p-4">
    {navItems.map((item) => (
      <Link
        key={item.href}
        href={item.href}
        className={
          isActive
            ? 'bg-accent/10 text-accent'
            : 'text-foreground hover:bg-muted'
        }
      >
        {item.label}
      </Link>
    ))}
  </nav>
</div>
```

**Changes Made**:
- ✅ `bg-white dark:bg-slate-900` → `bg-card`
- ✅ `border-gray-200 dark:border-slate-800` → `border-border`
- ✅ `text-gray-900 dark:text-white` → `text-foreground`
- ✅ `text-gray-600 dark:text-gray-400` → `text-muted-foreground`
- ✅ `bg-blue-50 dark:bg-blue-950 text-blue-700 dark:text-blue-300` → `bg-accent/10 text-accent`
- ✅ `text-gray-700 dark:text-gray-300 hover:bg-gray-100` → `text-foreground hover:bg-muted`

---

### Example 4: Location Map Preview (`components/vendor/LocationMapPreview.tsx`)

**BEFORE**:
```tsx
return (
  <div>
    {!mounted ? (
      <div
        className="bg-gray-100 rounded-lg flex items-center justify-center"
        style={{ height: '400px' }}
      >
        <span className="text-gray-500">Map loading...</span>
      </div>
    ) : locations.length === 0 ? (
      <div
        className="bg-gray-50 rounded-lg flex items-center justify-center"
        style={{ height: '400px' }}
      >
        <span className="text-gray-500">No locations to display</span>
      </div>
    ) : (
      <div className="rounded-lg overflow-hidden border border-gray-200">
        <MapContainer center={defaultCenter} zoom={8} style={{ height: '400px' }}>
          {locations.map((location) => (
            <Popup key={location.id}>
              <p className="font-bold text-blue-600">
                {location.address || 'Office Location'}
              </p>
            </Popup>
          ))}
        </MapContainer>
      </div>
    )}
  </div>
);
```

**AFTER**:
```tsx
return (
  <div>
    {!mounted ? (
      <div
        className="bg-muted rounded-lg flex items-center justify-center"
        style={{ height: '400px' }}
      >
        <span className="text-muted-foreground">Map loading...</span>
      </div>
    ) : locations.length === 0 ? (
      <div
        className="bg-background rounded-lg flex items-center justify-center"
        style={{ height: '400px' }}
      >
        <span className="text-muted-foreground">No locations to display</span>
      </div>
    ) : (
      <div className="rounded-lg overflow-hidden border border-border">
        <MapContainer center={defaultCenter} zoom={8} style={{ height: '400px' }}>
          {locations.map((location) => (
            <Popup key={location.id}>
              <p className="font-bold text-accent">
                {location.address || 'Office Location'}
              </p>
            </Popup>
          ))}
        </MapContainer>
      </div>
    )}
  </div>
);
```

**Changes Made**:
- ✅ `bg-gray-100` → `bg-muted`
- ✅ `text-gray-500` → `text-muted-foreground`
- ✅ `bg-gray-50` → `bg-background`
- ✅ `border-gray-200` → `border-border`
- ✅ `text-blue-600` → `text-accent`

---

### Example 5: Progress Bar Component

**BEFORE**:
```tsx
<div className="flex flex-col gap-4">
  <div>
    <div className="flex justify-between mb-2">
      <label className="text-sm font-medium text-gray-700">Loading Progress</label>
      <span className="text-sm text-gray-600">{progress}%</span>
    </div>
    <div className="w-full bg-gray-200 rounded-full h-2">
      <div
        className="bg-blue-600 h-2 rounded-full transition-all"
        style={{ width: `${progress}%` }}
      />
    </div>
  </div>
</div>
```

**AFTER**:
```tsx
<div className="flex flex-col gap-4">
  <div>
    <div className="flex justify-between mb-2">
      <label className="text-sm font-medium text-foreground">Loading Progress</label>
      <span className="text-sm text-muted-foreground">{progress}%</span>
    </div>
    <div className="w-full bg-muted rounded-full h-2">
      <div
        className="bg-accent h-2 rounded-full transition-all"
        style={{ width: `${progress}%` }}
      />
    </div>
  </div>
</div>
```

**Changes Made**:
- ✅ `text-gray-700` → `text-foreground`
- ✅ `text-gray-600` → `text-muted-foreground`
- ✅ `bg-gray-200` → `bg-muted`
- ✅ `bg-blue-600` → `bg-accent`

---

### Example 6: Badge Component

**BEFORE**:
```tsx
const BadgeVariants = {
  tier1: {
    className: 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300',
    label: 'Tier 1'
  },
  tier2: {
    className: 'bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300',
    label: 'Tier 2'
  }
};

export function TierBadge({ tier }: Props) {
  const variant = BadgeVariants[tier];
  return <Badge className={variant.className}>{variant.label}</Badge>;
}
```

**AFTER**:
```tsx
export function TierBadge({ tier }: Props) {
  const variants = {
    tier1: {
      className: 'bg-muted text-muted-foreground',
      label: 'Tier 1'
    },
    tier2: {
      className: 'bg-accent/10 text-accent',
      label: 'Tier 2'
    }
  };

  const variant = variants[tier];
  return <Badge className={variant.className}>{variant.label}</Badge>;
}
```

**Changes Made**:
- ✅ `bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300` → `bg-muted text-muted-foreground`
- ✅ `bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300` → `bg-accent/10 text-accent`

---

### Example 7: Form Input Label

**BEFORE**:
```tsx
<div className="space-y-2">
  <label htmlFor="email" className="text-sm font-medium text-gray-700 dark:text-gray-300">
    Email Address
  </label>
  <input
    id="email"
    type="email"
    placeholder="your@email.com"
    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md text-gray-900 dark:text-white bg-white dark:bg-gray-950"
  />
  <p className="text-xs text-gray-500">We'll never share your email address</p>
</div>
```

**AFTER**:
```tsx
<div className="space-y-2">
  <label htmlFor="email" className="text-sm font-medium text-foreground">
    Email Address
  </label>
  <input
    id="email"
    type="email"
    placeholder="your@email.com"
    className="w-full px-3 py-2 border border-border rounded-md text-foreground bg-card"
  />
  <p className="text-xs text-muted-foreground">We'll never share your email address</p>
</div>
```

**Changes Made**:
- ✅ `text-gray-700 dark:text-gray-300` → `text-foreground`
- ✅ `border-gray-300 dark:border-gray-600` → `border-border`
- ✅ `text-gray-900 dark:text-white bg-white dark:bg-gray-950` → `text-foreground bg-card`
- ✅ `text-gray-500` → `text-muted-foreground`

---

### Example 8: Hover States

**BEFORE**:
```tsx
<a
  href={link.href}
  className="inline-flex items-center gap-2 text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 transition-colors"
>
  {link.label}
  <ArrowRight className="w-4 h-4" />
</a>

<button className="text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 px-3 py-2 rounded">
  Toggle
</button>
```

**AFTER**:
```tsx
<a
  href={link.href}
  className="inline-flex items-center gap-2 text-accent hover:text-accent/80 transition-colors"
>
  {link.label}
  <ArrowRight className="w-4 h-4" />
</a>

<button className="text-foreground hover:bg-muted px-3 py-2 rounded">
  Toggle
</button>
```

**Changes Made**:
- ✅ `text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300` → `text-accent hover:text-accent/80`
- ✅ `text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800` → `text-foreground hover:bg-muted`

---

### Example 9: Disabled State

**BEFORE**:
```tsx
<input
  type="text"
  disabled
  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 bg-gray-100 dark:bg-gray-800 text-gray-500 dark:text-gray-400 cursor-not-allowed"
/>

<button disabled className="bg-gray-200 dark:bg-gray-700 text-gray-600 dark:text-gray-400 cursor-not-allowed">
  Submit
</button>
```

**AFTER**:
```tsx
<input
  type="text"
  disabled
  className="w-full px-3 py-2 border border-border bg-muted text-muted-foreground cursor-not-allowed"
/>

<button disabled className="bg-muted text-muted-foreground cursor-not-allowed">
  Submit
</button>
```

**Changes Made**:
- ✅ `border-gray-300 dark:border-gray-600` → `border-border`
- ✅ `bg-gray-100 dark:bg-gray-800` → `bg-muted`
- ✅ `text-gray-500 dark:text-gray-400` → `text-muted-foreground`
- ✅ `bg-gray-200 dark:bg-gray-700` → `bg-muted`

---

### Example 10: Skeleton/Loading States

**BEFORE**:
```tsx
export function CardSkeleton() {
  return (
    <div className="bg-white dark:bg-gray-900 rounded-lg p-6 animate-pulse">
      <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded mb-4"></div>
      <div className="space-y-2">
        <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded"></div>
        <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-5/6"></div>
      </div>
    </div>
  );
}
```

**AFTER**:
```tsx
export function CardSkeleton() {
  return (
    <div className="bg-card rounded-lg p-6 animate-pulse">
      <div className="h-4 bg-muted rounded mb-4"></div>
      <div className="space-y-2">
        <div className="h-3 bg-muted rounded"></div>
        <div className="h-3 bg-muted rounded w-5/6"></div>
      </div>
    </div>
  );
}
```

**Changes Made**:
- ✅ `bg-white dark:bg-gray-900` → `bg-card`
- ✅ `bg-gray-200 dark:bg-gray-700` → `bg-muted`

---

## Quick Reference: Search and Replace

For IDE bulk replacements, use these patterns in order:

```
# Text Colors - Do these first
"text-gray-300" → "text-muted-foreground"
"text-gray-400" → "text-muted-foreground"
"text-gray-500" → "text-muted-foreground"
"text-gray-600" → "text-muted-foreground"
"text-gray-600 dark:text-gray-400" → "text-muted-foreground"
"text-gray-700" → "text-foreground"
"text-gray-700 dark:text-gray-300" → "text-foreground"
"text-gray-800" → "text-foreground"
"text-gray-900" → "text-foreground"
"text-gray-900 dark:text-gray-100" → "text-foreground"
"text-gray-900 dark:text-white" → "text-foreground"

# Accent Colors
"text-blue-500" → "text-accent"
"text-blue-600" → "text-accent"
"text-blue-700" → "text-accent"
"text-blue-800" → "text-accent"
"text-blue-600 dark:text-blue-400" → "text-accent"
"text-blue-700 dark:text-blue-300" → "text-accent"
"text-blue-800 dark:text-blue-200" → "text-accent"

# Background Colors
"bg-gray-50" → "bg-background"
"bg-gray-50 dark:bg-gray-900" → "bg-background"
"bg-gray-100" → "bg-muted"
"bg-gray-100 dark:bg-gray-800" → "bg-muted"
"bg-gray-200" → "bg-muted"
"bg-gray-200 dark:bg-gray-700" → "bg-muted"
"bg-white" → "bg-card"
"bg-white dark:bg-gray-900" → "bg-card"
"bg-white dark:bg-slate-900" → "bg-card"

# Border Colors
"border-gray-200" → "border-border"
"border-gray-200 dark:border-gray-700" → "border-border"
"border-gray-300" → "border-border"
"border-gray-300 dark:border-gray-700" → "border-border"

# Hover States
"hover:text-blue-800" → "hover:text-accent/80"
"hover:bg-gray-100" → "hover:bg-muted"
"hover:bg-gray-100 dark:hover:bg-gray-800" → "hover:bg-muted"
```

---

## Testing After Fixes

### Dark Mode Toggle Test
```tsx
// app/(site)/components/theme-toggle.tsx is available
// Test by clicking the theme toggle in the UI

1. Load page in light mode
2. Verify all colors match design system
3. Click theme toggle
4. Verify all colors change appropriately
5. Verify text contrast (measure with Lighthouse)
6. Repeat for each modified page
```

### WCAG Contrast Test
Use Chrome DevTools:
```
1. Open DevTools
2. Elements tab
3. Accessibility panel
4. Check contrast ratio for text elements
5. Verify WCAG AA minimum: 4.5:1 for normal text, 3:1 for large text
```

### Visual Regression Test
```tsx
// Before merging, run:
npm run test:e2e
// or visually inspect key pages in light and dark mode
```

---

**Generated**: 2025-11-06
**Status**: Ready for implementation
