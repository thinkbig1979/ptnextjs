# Task: impl-frontend-styling - Style Location Search Components

**Metadata:**
- **Task ID:** impl-frontend-styling
- **Phase:** Phase 3: Frontend Implementation
- **Agent:** frontend-react-specialist
- **Estimated Time:** 20-25 min
- **Dependencies:** impl-frontend-location-search-filter
- **Status:** Pending
- **Priority:** Medium

## Description

Apply comprehensive styling to location search components ensuring responsive design, proper spacing, visual hierarchy, loading states, and error states across all screen sizes.

## Specifics

**Styling Requirements:**

1. **LocationSearchFilter Styling:**
   - Responsive layout (mobile: vertical stack, desktop: compact)
   - Proper spacing between input, slider, and advanced section
   - Input with loading spinner positioned correctly
   - Error messages with icon and proper color
   - Smooth transitions for Collapsible expand/collapse
   - Focus states for accessibility
   - Touch-friendly targets (min 44x44px on mobile)

2. **LocationResultSelector Styling:**
   - Dialog responsive width (90% mobile, 500px desktop)
   - Result cards with hover states
   - Proper spacing in ScrollArea
   - Badge styling for location types
   - MapPin icon color and size
   - Cancel button styling
   - Focus indicators for keyboard navigation

3. **Loading States:**
   - Spinner animation (smooth rotation)
   - Disabled input appearance during loading
   - Reduced opacity for loading overlay
   - Loading message if needed

4. **Error States:**
   - Error message color (destructive/red)
   - AlertCircle icon styling
   - Error message spacing and padding
   - Dismissible error messages (optional)

5. **Empty States:**
   - "No locations found" message styling
   - Helpful suggestions (e.g., "Try a different search")
   - Proper spacing and typography

6. **Responsive Breakpoints:**
   - Mobile: < 640px (sm)
   - Tablet: 640px - 1024px (md)
   - Desktop: > 1024px (lg)

**Files to Modify:**
- `/home/edwin/development/ptnextjs/components/LocationSearchFilter.tsx` (add/refine classes)
- `/home/edwin/development/ptnextjs/components/location-result-selector.tsx` (add/refine classes)

**CSS/Styling Approach:**
- Use Tailwind CSS classes (project standard)
- Use shadcn/ui component variants
- Custom CSS only if absolutely necessary
- Follow existing project styling patterns

## Acceptance Criteria

- [ ] Components responsive on all screen sizes
- [ ] Loading states visually clear
- [ ] Error states properly styled with icons
- [ ] Empty states informative and styled
- [ ] Hover states on interactive elements
- [ ] Focus states for keyboard navigation
- [ ] Touch targets minimum 44x44px on mobile
- [ ] Smooth transitions for animations
- [ ] Consistent with existing project design
- [ ] No layout shifts during state changes
- [ ] Accessible color contrast (WCAG AA)
- [ ] Visual hierarchy clear and logical

## Testing Requirements

**Functional Testing:**
- Visual regression tests (if available)
- Responsive design tests at different viewports

**Manual Verification:**
- Test on real devices:
  - iPhone (Safari)
  - Android phone (Chrome)
  - iPad (Safari)
  - Desktop (Chrome, Firefox, Safari)

**Browser Testing:**
- Chrome: Styles render correctly
- Firefox: CSS compatibility verified
- Safari: Webkit-specific issues resolved
- Mobile browsers: Touch targets appropriate

**Responsive Testing:**
- 375px width (mobile)
- 768px width (tablet)
- 1024px width (desktop)
- 1920px width (large desktop)

**Error Scenarios:**
- Loading spinner doesn't cause layout shift
- Error message doesn't overflow container
- Long location names wrap properly
- Many results scroll smoothly

**Evidence Required:**
- Screenshots at all breakpoints:
  - Mobile (375px)
  - Tablet (768px)
  - Desktop (1024px)
- Screenshots of all states:
  - Default/empty
  - Loading
  - Success (with results)
  - Error
  - Empty results
- Lighthouse accessibility score > 90
- No console warnings about CSS

## Context Requirements

**Required Context:**
- @.agent-os/specs/2025-10-22-location-name-search/spec.md
- @.agent-os/specs/2025-10-22-location-name-search/tasks/task-impl-frontend-location-search-filter.md
- @.agent-os/specs/2025-10-22-location-name-search/tasks/task-impl-frontend-location-result-selector.md
- Existing project styling patterns
- shadcn/ui component documentation

**Assumptions:**
- Tailwind CSS is configured
- shadcn/ui theme is set up
- Project has consistent design system
- Dark mode support not required (or already handled by shadcn/ui)

## Implementation Notes

**LocationSearchFilter Styling Example:**

```tsx
<div className="space-y-6">
  {/* Location Search Input */}
  <div className="space-y-2">
    <Label htmlFor="location-search" className="text-sm font-medium">
      Location
    </Label>
    <div className="relative">
      <Input
        id="location-search"
        placeholder="Search by city, region, or postal code"
        value={locationInput}
        onChange={(e) => setLocationInput(e.target.value)}
        disabled={isLoading}
        className="pr-10 transition-opacity disabled:opacity-50"
      />
      {isLoading && (
        <Loader2 className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 animate-spin text-muted-foreground" />
      )}
    </div>

    {/* Error Message */}
    {error && (
      <div className="flex items-center gap-2 p-3 bg-destructive/10 border border-destructive/20 rounded-md">
        <AlertCircle className="h-4 w-4 text-destructive flex-shrink-0" />
        <span className="text-sm text-destructive">{error}</span>
      </div>
    )}
  </div>

  {/* Distance Slider */}
  <div className="space-y-3">
    <div className="flex items-center justify-between">
      <Label htmlFor="distance" className="text-sm font-medium">
        Distance
      </Label>
      <span className="text-sm font-medium text-muted-foreground">
        {distance} km
      </span>
    </div>
    <Slider
      id="distance"
      min={0}
      max={500}
      step={10}
      value={[distance]}
      onValueChange={([value]) => setDistance(value)}
      className="cursor-pointer"
    />
  </div>

  {/* Advanced Collapsible */}
  <Collapsible open={showAdvanced} onOpenChange={setShowAdvanced}>
    <CollapsibleTrigger asChild>
      <Button
        variant="ghost"
        className="w-full justify-between hover:bg-accent p-3"
      >
        <span className="text-sm font-medium">
          Advanced: Enter coordinates manually
        </span>
        <ChevronDown className={cn(
          "h-4 w-4 transition-transform duration-200",
          showAdvanced && "rotate-180"
        )} />
      </Button>
    </CollapsibleTrigger>
    <CollapsibleContent className="space-y-3 pt-3 pb-1">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <div className="space-y-2">
          <Label htmlFor="latitude" className="text-sm">
            Latitude
          </Label>
          <Input
            id="latitude"
            type="number"
            step="any"
            placeholder="e.g., 43.7384"
            value={latitude || ''}
            onChange={(e) => setLatitude(parseFloat(e.target.value) || 0)}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="longitude" className="text-sm">
            Longitude
          </Label>
          <Input
            id="longitude"
            type="number"
            step="any"
            placeholder="e.g., 7.4246"
            value={longitude || ''}
            onChange={(e) => setLongitude(parseFloat(e.target.value) || 0)}
          />
        </div>
      </div>
    </CollapsibleContent>
  </Collapsible>

  {/* Reset Button */}
  <Button
    variant="outline"
    onClick={handleReset}
    className="w-full sm:w-auto min-h-[44px] sm:min-h-[36px]"
  >
    Reset Filter
  </Button>
</div>
```

**LocationResultSelector Styling Example:**

```tsx
<Dialog open={isOpen} onOpenChange={(open) => !open && onCancel()}>
  <DialogContent className="w-[90vw] max-w-[500px] max-h-[80vh]">
    <DialogHeader className="space-y-3">
      <DialogTitle className="text-xl font-semibold">
        Select Location
      </DialogTitle>
      <DialogDescription className="text-sm text-muted-foreground">
        Multiple locations found. Please select the one you're looking for.
      </DialogDescription>
    </DialogHeader>

    <ScrollArea className="h-[400px] pr-4">
      <div role="listbox" className="space-y-2">
        {results.map((result, index) => (
          <Card
            key={index}
            role="option"
            tabIndex={0}
            className={cn(
              "p-4 cursor-pointer transition-all duration-150",
              "hover:bg-accent hover:shadow-sm",
              "focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2",
              "active:scale-[0.98]"
            )}
            onClick={() => onSelect(result)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                onSelect(result);
              }
            }}
          >
            <div className="flex items-start gap-3">
              <MapPin className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
              <div className="flex-1 min-w-0">
                <div className="font-medium text-sm leading-relaxed truncate">
                  {result.display_name}
                </div>
                {result.type && (
                  <Badge
                    variant="secondary"
                    className="mt-1.5 text-xs"
                  >
                    {result.type}
                  </Badge>
                )}
              </div>
            </div>
          </Card>
        ))}
      </div>
    </ScrollArea>

    <div className="flex justify-end gap-2 mt-4 pt-4 border-t">
      <Button
        variant="outline"
        onClick={onCancel}
        className="min-h-[44px] sm:min-h-[36px]"
      >
        Cancel
      </Button>
    </div>
  </DialogContent>
</Dialog>
```

**Responsive Utilities:**

```tsx
// Touch target mixin for mobile
const touchTarget = "min-h-[44px] sm:min-h-[36px]";

// Responsive spacing
const responsiveSpacing = "space-y-4 sm:space-y-6";

// Responsive grid
const responsiveGrid = "grid grid-cols-1 sm:grid-cols-2 gap-3";
```

**Animation Classes:**

```tsx
// Loading spinner
<Loader2 className="animate-spin" />

// Smooth transitions
<div className="transition-all duration-200 ease-in-out" />

// Collapsible chevron rotation
<ChevronDown className={cn(
  "transition-transform duration-200",
  isOpen && "rotate-180"
)} />
```

## Quality Gates

- [ ] Styles work on all target browsers
- [ ] Responsive at all breakpoints
- [ ] Accessibility contrast ratios met (WCAG AA)
- [ ] Touch targets meet minimum size (44x44px mobile)
- [ ] Animations smooth (60fps)
- [ ] No layout shifts during interactions
- [ ] Loading states visually clear
- [ ] Error states easily noticeable
- [ ] Focus indicators visible
- [ ] Consistent with project design system

## Related Files

**Spec Files:**
- @.agent-os/specs/2025-10-22-location-name-search/spec.md

**Implementation Files:**
- /home/edwin/development/ptnextjs/components/LocationSearchFilter.tsx (MODIFY)
- /home/edwin/development/ptnextjs/components/location-result-selector.tsx (MODIFY)

**Related Tasks:**
- task-impl-frontend-location-search-filter (prerequisite)
- task-impl-frontend-location-result-selector (prerequisite)
- task-test-frontend-integration (tests styled components)
