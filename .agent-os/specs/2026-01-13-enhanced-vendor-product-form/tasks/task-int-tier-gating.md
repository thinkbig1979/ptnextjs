# Task: int-tier-gating

## Metadata
- **Phase**: 3 - Integration
- **Agent**: frontend-react-specialist
- **Estimated Time**: 30-40 min
- **Dependencies**: int-form-assembly
- **Status**: pending

## Description

Implement tier gating logic across all form sections. Ensure vendors only see and can use features appropriate to their subscription tier.

## Specifics

### Files to Modify
- `components/dashboard/ProductForm.tsx` - Pass tier to sections
- `components/dashboard/product-form/FormSection.tsx` - Enforce tier access

### Files to Reference
- `hooks/useTierAccess.ts` - Tier checking hook
- `lib/services/TierService.ts` - Tier definitions

### Technical Details

**Tier Access Matrix:**
| Section | Free | Tier 1 | Tier 2+ |
|---------|------|--------|---------|
| Basic Info | ✅ | ✅ | ✅ |
| Images | ❌ | ❌ | ✅ |
| Pricing | ❌ | ❌ | ✅ |
| Specifications | ❌ | ❌ | ✅ |
| Features | ❌ | ❌ | ✅ |
| Categories/Tags | ❌ | ❌ | ✅ |
| Action Buttons | ❌ | ❌ | ✅ |
| Badges | ❌ | ❌ | ✅ |
| SEO | ❌ | ❌ | ✅ |

**Features:**
1. Get vendor tier from context/props
2. Pass tier to FormSection wrapper
3. FormSection renders locked state for restricted tiers
4. Backend still validates tier (defense in depth)
5. Upgrade prompt links to tier upgrade page

**Locked Section Content:**
```
┌─────────────────────────────────────────────────────────────────┐
│ [▶] Product Images                              🔒 Requires T2  │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│     ┌─────────────────────────────────────────────────┐        │
│     │    🔒 Upgrade to Tier 2 to add product images  │        │
│     │                                                 │        │
│     │    Product images help showcase your products   │        │
│     │    and increase customer engagement by 3x.      │        │
│     │                                                 │        │
│     │              [Upgrade Now →]                    │        │
│     └─────────────────────────────────────────────────┘        │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

## Acceptance Criteria

- [ ] Free tier sees all enhanced sections locked
- [ ] Tier 1 sees enhanced sections locked
- [ ] Tier 2+ sees all sections unlocked
- [ ] Locked sections show upgrade prompt
- [ ] Upgrade button links to upgrade page/modal
- [ ] Form still submits with basic fields only for lower tiers
- [ ] Backend validation prevents tier bypass attempts
- [ ] Tier information updates without page reload (if tier changes)

## Testing Requirements

```typescript
describe('Tier Gating', () => {
  describe('free tier vendor', () => {
    it('shows locked state for Images section', () => {});
    it('shows locked state for Pricing section', () => {});
    it('shows upgrade prompt in locked sections', () => {});
    it('allows submitting basic fields only', () => {});
  });

  describe('tier2 vendor', () => {
    it('shows all sections unlocked', () => {});
    it('allows submitting all fields', () => {});
  });

  describe('upgrade prompt', () => {
    it('links to upgrade page', () => {});
    it('shows feature benefits', () => {});
  });
});
```

## Context Requirements

### Must Read Before Implementation
- `hooks/useTierAccess.ts` - Full file
- `lib/services/TierService.ts` - Tier hierarchy and features

### Pattern Constraints
- Use existing useTierAccess hook
- Match existing upgrade prompt styling
- Tier should come from vendor context

## Implementation Notes

```tsx
// In ProductForm.tsx - get vendor tier
const { vendor } = useVendorDashboard(); // or props
const vendorTier = vendor?.tier || 'free';

// Pass to all sections
<FormSection
  title="Product Images"
  tierRequired="tier2"
  currentTier={vendorTier}
  icon={<Image />}
>
  <ImagesSection control={control} />
</FormSection>

// In FormSection.tsx - tier checking
interface FormSectionProps {
  tierRequired?: 'tier1' | 'tier2' | 'tier3';
  currentTier?: string;
  // ... other props
}

export default function FormSection({
  tierRequired,
  currentTier = 'free',
  children,
  ...props
}: FormSectionProps) {
  const hasAccess = tierRequired
    ? TierService.isTierOrHigher(currentTier as Tier, tierRequired as Tier)
    : true;

  return (
    <Collapsible {...}>
      <CollapsibleTrigger>
        {/* Header with lock icon if !hasAccess */}
      </CollapsibleTrigger>
      <CollapsibleContent>
        {hasAccess ? (
          children
        ) : (
          <TierUpgradePrompt
            requiredTier={tierRequired}
            feature={props.title}
          />
        )}
      </CollapsibleContent>
    </Collapsible>
  );
}

// TierUpgradePrompt component
const TierUpgradePrompt = ({
  requiredTier,
  feature,
}: {
  requiredTier: string;
  feature: string;
}) => (
  <div className="flex flex-col items-center justify-center py-12 px-4 text-center">
    <Lock className="h-12 w-12 text-muted-foreground mb-4" />
    <h4 className="text-lg font-medium mb-2">
      Upgrade to {requiredTier.replace('tier', 'Tier ')} to access {feature}
    </h4>
    <p className="text-sm text-muted-foreground mb-4 max-w-md">
      Unlock premium features including product images, technical specifications,
      and SEO settings to showcase your products professionally.
    </p>
    <Button asChild>
      <Link href="/dashboard/subscription">
        Upgrade Now
        <ArrowRight className="ml-2 h-4 w-4" />
      </Link>
    </Button>
  </div>
);
```

## Related Files
- `components/dashboard/product-form/FormSection.tsx` - Section wrapper
- `components/dashboard/ProductForm.tsx` - Main form
- `hooks/useTierAccess.ts` - Tier checking
- `app/(site)/vendor/dashboard/subscription/page.tsx` - Upgrade page
