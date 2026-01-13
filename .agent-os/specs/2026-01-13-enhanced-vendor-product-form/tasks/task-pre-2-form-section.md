# Task: pre-2-form-section

## Metadata
- **Phase**: 1 - Pre-Execution
- **Agent**: frontend-react-specialist
- **Estimated Time**: 30-40 min
- **Dependencies**: pre-1-types
- **Status**: pending

## Description

Create a reusable FormSection component that provides collapsible sections with tier gating, error counting, and accessibility features.

## Specifics

### Files to Create
- `components/dashboard/product-form/FormSection.tsx`

### Files to Reference
- `components/ui/accordion.tsx` - shadcn accordion component
- `components/ui/card.tsx` - Card component for section styling
- `hooks/useTierAccess.ts` - Tier checking pattern

### Technical Details

**Props Interface:**
```typescript
interface FormSectionProps {
  title: string;
  description?: string;
  children: React.ReactNode;
  defaultOpen?: boolean;
  tierRequired?: 'tier1' | 'tier2' | 'tier3';
  currentTier?: string;
  icon?: React.ReactNode;
  errorCount?: number;
  testId?: string;
}
```

**Features:**
1. Collapsible accordion-style section
2. Header shows: icon, title, tier badge (if restricted), error count badge
3. Locked state when tier requirement not met
4. Upgrade prompt inside locked sections
5. ARIA attributes for accessibility

**Visual States:**
- Default: Collapsed with chevron
- Expanded: Full content visible
- Locked: Grayed out, lock icon, "Requires Tier X" badge
- Has Errors: Red error count badge on header

## Acceptance Criteria

- [ ] Section expands/collapses on header click
- [ ] Locked sections show upgrade prompt instead of form fields
- [ ] Error count badge displays when errorCount > 0
- [ ] Keyboard accessible (Enter/Space to toggle)
- [ ] ARIA attributes: aria-expanded, aria-controls
- [ ] Focus management: focus moves to first input on expand
- [ ] Screen reader announces expand/collapse state

## Testing Requirements

```typescript
describe('FormSection', () => {
  it('renders collapsed by default', () => {});
  it('expands when header clicked', () => {});
  it('shows locked state for tier-restricted content', () => {});
  it('shows error count badge when errors exist', () => {});
  it('prevents expansion when locked', () => {});
  it('is keyboard accessible', () => {});
  it('has correct ARIA attributes', () => {});
});
```

## Context Requirements

### Must Read Before Implementation
- `components/ui/accordion.tsx` - Full file
- `hooks/useTierAccess.ts` - Full file

### Pattern Constraints
- Use shadcn Accordion or Collapsible component
- Follow existing Card styling patterns
- Use Badge component for tier/error indicators

## Implementation Notes

```tsx
// Example structure
<div data-testid={testId}>
  <Collapsible open={isOpen} onOpenChange={setIsOpen}>
    <CollapsibleTrigger asChild>
      <button className="w-full flex items-center justify-between p-4">
        <div className="flex items-center gap-2">
          {icon}
          <span className="font-medium">{title}</span>
          {tierRequired && !hasAccess && (
            <Badge variant="outline">Requires {tierRequired}</Badge>
          )}
        </div>
        <div className="flex items-center gap-2">
          {errorCount > 0 && (
            <Badge variant="destructive">{errorCount} errors</Badge>
          )}
          <ChevronDown className={cn("transition-transform", isOpen && "rotate-180")} />
        </div>
      </button>
    </CollapsibleTrigger>
    <CollapsibleContent>
      {!hasAccess ? (
        <TierUpgradePrompt tier={tierRequired} />
      ) : (
        <div className="p-4 pt-0">{children}</div>
      )}
    </CollapsibleContent>
  </Collapsible>
</div>
```

## Related Files
- `components/dashboard/product-form/types.ts` - Types dependency
- All section components will use FormSection as wrapper
