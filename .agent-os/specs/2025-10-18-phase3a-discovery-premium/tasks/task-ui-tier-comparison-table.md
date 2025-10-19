# Task: ui-tier-comparison-table - Build Tier Comparison Table Component

## Task Metadata
- **Task ID**: ui-tier-comparison-table
- **Phase**: Phase 3A: Frontend Components
- **Agent**: frontend-react-specialist
- **Estimated Time**: 35-45 minutes
- **Dependencies**: [task-api-tier-feature-service]
- **Status**: [ ] Not Started

## Task Description
Build a tier comparison table component that displays Free, Tier 1, and Tier 2 subscription options side-by-side with feature lists, pricing, and upgrade CTAs. Highlight the vendor's current tier and disable selection for already-active tiers.

## Specifics
- **File to Create**:
  - `/home/edwin/development/ptnextjs/components/TierComparisonTable.tsx`
- **Component Structure**:
  ```typescript
  'use client'
  
  import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/card'
  import { Button } from '@/components/ui/button'
  import { Badge } from '@/components/ui/badge'
  import { Check, X } from 'lucide-react'
  
  interface TierComparisonTableProps {
    currentTier: 'free' | 'tier1' | 'tier2'
    onSelectTier: (tier: 'tier1' | 'tier2') => void
  }
  
  const TIER_INFO = {
    free: {
      name: 'Free',
      price: '$0/month',
      features: ['Basic profile', 'Up to 5 products', 'Contact form'],
      description: 'Get started with basic vendor presence'
    },
    tier1: {
      name: 'Professional',
      price: '$99/month',
      features: ['Everything in Free', 'Up to 20 products', 'Certifications (3)', 'Team members (5)', 'Basic analytics'],
      description: 'Enhanced profile for growing businesses'
    },
    tier2: {
      name: 'Enterprise',
      price: '$299/month',
      features: ['Everything in Professional', 'Unlimited products', 'Case studies (10)', 'Media galleries', 'Service area maps', 'Advanced analytics', 'Featured placement', 'Priority support'],
      description: 'Complete marketing suite for industry leaders',
      recommended: true
    }
  }
  
  export function TierComparisonTable({ currentTier, onSelectTier }: TierComparisonTableProps) {
    // Render three tier cards side-by-side
  }
  ```
- **UI Layout** (Desktop):
  ```
  ┌────────────┬────────────┬────────────┐
  │   FREE     │ PROFESSIONAL│ ENTERPRISE │
  │  (Current) │             │(Recommended)│
  ├────────────┼────────────┼────────────┤
  │ $0/month   │ $99/month  │ $299/month │
  │            │            │            │
  │ ✓ Feature  │ ✓ Feature  │ ✓ Feature  │
  │ ✓ Feature  │ ✓ Feature  │ ✓ Feature  │
  │ ✗ Feature  │ ✓ Feature  │ ✓ Feature  │
  │            │            │            │
  │ [Current]  │ [Select]   │ [Select]   │
  └────────────┴────────────┴────────────┘
  ```

## Acceptance Criteria
- [ ] Component renders three tier cards (Free, Professional, Enterprise)
- [ ] Current tier card shows "Current Tier" badge
- [ ] Recommended tier (tier2) shows "Recommended" badge
- [ ] Each card displays tier name, price, and description
- [ ] Feature list shows checkmarks for included features
- [ ] Feature list shows X marks for excluded features
- [ ] "Select Tier" button triggers onSelectTier callback
- [ ] Current tier button is disabled with "Current Tier" label
- [ ] Free tier button is always disabled (can't downgrade to free via UI)
- [ ] Responsive: stacks vertically on mobile (<768px)
- [ ] Hover effects on tier cards
- [ ] Accessible (keyboard navigation, ARIA labels)

## Testing Requirements
- **Component Tests**:
  - Test renders with currentTier='free' highlights free card
  - Test currentTier='tier1' disables tier1 button
  - Test clicking tier2 button calls onSelectTier('tier2')
  - Test free tier button always disabled
  - Test recommended badge only shows on tier2
  - Test feature lists render with correct icons (Check/X)
  - Mock onSelectTier and verify callback args
- **Visual Regression Tests**:
  - Screenshot comparison for all three tier states
  - Test responsive breakpoints (mobile, tablet, desktop)
- **Accessibility Tests**:
  - Tab navigation through tier cards
  - Screen reader announces tier features
  - Focus visible on keyboard navigation

## Evidence Required
- Component file with complete implementation
- Test results showing all scenarios pass
- Screenshot of tier comparison in desktop layout
- Screenshot of tier comparison in mobile layout
- Video showing hover effects and button interactions

## Context Requirements
- shadcn/ui Card, Button, Badge components
- Tier feature configuration from task-api-tier-feature-service
- tasks-sqlite.md section 3.3 for design guidance
- Existing pricing and tier structure

## Implementation Notes
- **Tier Card Component**:
  ```tsx
  function TierCard({ tier, isCurrent, isRecommended, onSelect }) {
    return (
      <Card className={`relative ${isRecommended ? 'border-primary' : ''}`}>
        {isRecommended && (
          <Badge className="absolute -top-3 left-1/2 -translate-x-1/2">
            Recommended
          </Badge>
        )}
        {isCurrent && (
          <Badge variant="secondary" className="absolute -top-3 left-1/2 -translate-x-1/2">
            Current Tier
          </Badge>
        )}
        
        <CardHeader>
          <CardTitle>{TIER_INFO[tier].name}</CardTitle>
          <CardDescription>{TIER_INFO[tier].description}</CardDescription>
          <div className="text-3xl font-bold">{TIER_INFO[tier].price}</div>
        </CardHeader>
        
        <CardContent>
          <ul className="space-y-2">
            {TIER_INFO[tier].features.map((feature, idx) => (
              <li key={idx} className="flex items-start gap-2">
                <Check className="w-5 h-5 text-green-600 mt-0.5" />
                <span>{feature}</span>
              </li>
            ))}
          </ul>
        </CardContent>
        
        <CardFooter>
          <Button 
            onClick={() => onSelect(tier)}
            disabled={isCurrent || tier === 'free'}
            className="w-full"
          >
            {isCurrent ? 'Current Tier' : 'Select Plan'}
          </Button>
        </CardFooter>
      </Card>
    )
  }
  ```
- **Responsive Grid**:
  ```tsx
  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
    <TierCard tier="free" isCurrent={currentTier === 'free'} />
    <TierCard tier="tier1" isCurrent={currentTier === 'tier1'} onSelect={onSelectTier} />
    <TierCard tier="tier2" isCurrent={currentTier === 'tier2'} isRecommended onSelect={onSelectTier} />
  </div>
  ```
- **Feature List Enhancement**:
  - Consider fetching features from TierFeatureService for dynamic updates
  - Or hardcode for simplicity (easier to maintain marketing copy)
- **Future Enhancements**:
  - Add annual billing toggle (20% discount)
  - Add feature comparison tooltips
  - Add pricing calculator based on usage

## Quality Gates
- [ ] No layout shift when badges render
- [ ] Button states clear and unambiguous
- [ ] Pricing displayed prominently
- [ ] Feature lists easy to scan
- [ ] Call-to-action buttons stand out

## Related Files
- Main Tasks: `tasks-sqlite.md` section 3.3
- Technical Spec: `sub-specs/technical-spec.md` (TierComparisonTable)
- shadcn Components: Card, Button, Badge
- Tier Features: lib/config/tier-features.ts

## Next Steps After Completion
- Integrate into vendor subscription page (task-ui-vendor-subscription-page)
- Connect to tier upgrade form modal (task-ui-tier-upgrade-form)
- Add analytics tracking for tier selection clicks
