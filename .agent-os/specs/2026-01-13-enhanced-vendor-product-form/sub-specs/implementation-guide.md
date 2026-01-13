# Implementation Guide: Enhanced Vendor Product Form

## Implementation Phases

### Phase 1: Foundation (Tasks 1-3)
- Create component structure and types
- Implement FormSection wrapper
- Refactor existing BasicInfoSection

### Phase 2: Array Fields (Tasks 4-7)
- ImagesSection with useFieldArray
- SpecificationsSection
- FeaturesSection
- ActionButtons and Badges sections

### Phase 3: Relationships (Task 8)
- Categories/Tags fetch hook
- Multi-select combobox
- CategoriesTagsSection

### Phase 4: Advanced Fields (Tasks 9-10)
- PricingSection
- SeoSection

### Phase 5: Integration (Tasks 11-13)
- Full form assembly
- Tier gating implementation
- Draft autosave

### Phase 6: Polish (Tasks 14-15)
- Mobile responsiveness
- Accessibility audit
- Performance optimization

## Task Breakdown

### Task 1: Project Setup and Types

**Objective**: Create file structure and type definitions.

**Files to Create**:
```
components/dashboard/product-form/
├── index.ts
└── types.ts
```

**Implementation**:

```typescript
// components/dashboard/product-form/types.ts
import { z } from 'zod';
import {
  ProductImageSchema,
  SpecificationSchema,
  FeatureSchema,
  PricingSchema,
} from '@/lib/validation/product-schema';

export const ActionButtonSchema = z.object({
  label: z.string().min(1).max(100),
  type: z.enum(['primary', 'secondary', 'outline']),
  action: z.enum(['contact', 'quote', 'download', 'external_link', 'video']),
  actionData: z.string().max(500).optional(),
  icon: z.string().max(100).optional(),
  order: z.number().int().min(0).optional(),
});

export const BadgeSchema = z.object({
  label: z.string().min(1).max(100),
  type: z.enum(['secondary', 'outline', 'success', 'warning', 'info']),
  icon: z.string().max(100).optional(),
  order: z.number().int().min(0).optional(),
});

export const SeoSchema = z.object({
  metaTitle: z.string().max(100).optional(),
  metaDescription: z.string().max(300).optional(),
  keywords: z.string().max(500).optional(),
});

export const ExtendedProductFormSchema = z.object({
  name: z.string().min(1, 'Product name is required').max(255),
  description: z.string().min(1, 'Description is required'),
  shortDescription: z.string().max(500).optional(),
  slug: z.string().max(255).regex(/^[a-z0-9-]*$/).optional(),
  images: z.array(ProductImageSchema).optional().default([]),
  price: z.string().max(100).optional(),
  pricing: PricingSchema.optional(),
  specifications: z.array(SpecificationSchema).optional().default([]),
  features: z.array(FeatureSchema).optional().default([]),
  categories: z.array(z.string()).optional().default([]),
  tags: z.array(z.string()).optional().default([]),
  actionButtons: z.array(ActionButtonSchema).optional().default([]),
  badges: z.array(BadgeSchema).optional().default([]),
  seo: SeoSchema.optional(),
});

export type ExtendedProductFormValues = z.infer<typeof ExtendedProductFormSchema>;
export type ActionButton = z.infer<typeof ActionButtonSchema>;
export type Badge = z.infer<typeof BadgeSchema>;
export type Seo = z.infer<typeof SeoSchema>;
```

**Acceptance Criteria**:
- [ ] Types compile without errors
- [ ] Schemas validate correctly
- [ ] Index exports all types

---

### Task 2: FormSection Component

**Objective**: Create collapsible section wrapper with tier gating.

**File**: `components/dashboard/product-form/FormSection.tsx`

**Implementation**:

```typescript
'use client';

import { useState } from 'react';
import { ChevronDown, ChevronRight, Lock } from 'lucide-react';
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '@/components/ui/collapsible';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

interface FormSectionProps {
  title: string;
  description?: string;
  children: React.ReactNode;
  defaultOpen?: boolean;
  tierRequired?: 'tier1' | 'tier2';
  currentTier?: string;
  errorCount?: number;
  className?: string;
}

export function FormSection({
  title,
  description,
  children,
  defaultOpen = false,
  tierRequired,
  currentTier = 'free',
  errorCount = 0,
  className,
}: FormSectionProps) {
  const [isOpen, setIsOpen] = useState(defaultOpen);

  const tierOrder = { free: 0, tier1: 1, tier2: 2 };
  const isLocked = tierRequired &&
    tierOrder[currentTier as keyof typeof tierOrder] <
    tierOrder[tierRequired];

  return (
    <Collapsible
      open={isOpen && !isLocked}
      onOpenChange={setIsOpen}
      className={cn('border rounded-lg', className)}
    >
      <CollapsibleTrigger asChild>
        <Button
          variant="ghost"
          className="w-full justify-between p-4 h-auto"
          disabled={isLocked}
        >
          <div className="flex items-center gap-2">
            {isOpen && !isLocked ? (
              <ChevronDown className="h-4 w-4" />
            ) : (
              <ChevronRight className="h-4 w-4" />
            )}
            <span className="font-medium">{title}</span>
            {errorCount > 0 && (
              <Badge variant="destructive" className="ml-2">
                {errorCount} {errorCount === 1 ? 'error' : 'errors'}
              </Badge>
            )}
          </div>
          <div className="flex items-center gap-2">
            {isLocked && (
              <>
                <Lock className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm text-muted-foreground">
                  Requires {tierRequired === 'tier2' ? 'Tier 2' : 'Tier 1'}
                </span>
              </>
            )}
          </div>
        </Button>
      </CollapsibleTrigger>
      <CollapsibleContent>
        <div className="p-4 pt-0 space-y-4">
          {description && (
            <p className="text-sm text-muted-foreground">{description}</p>
          )}
          {children}
        </div>
      </CollapsibleContent>
    </Collapsible>
  );
}
```

**Acceptance Criteria**:
- [ ] Sections expand/collapse
- [ ] Locked state shows upgrade prompt
- [ ] Error badge displays when errors exist

---

### Task 3: BasicInfoSection Refactor

**Objective**: Extract basic fields into dedicated section.

**File**: `components/dashboard/product-form/BasicInfoSection.tsx`

**Implementation**:
- Move name, description, shortDescription, slug fields
- Add slug auto-generation from name
- Add character counters

---

### Task 4: ImagesSection

**Objective**: Implement image array management.

**Key Features**:
- URL input with validation
- Thumbnail preview
- Main image radio selection
- Alt text and caption
- Remove with undo

**Implementation Notes**:
```typescript
const { fields, append, remove, update } = useFieldArray({
  control,
  name: 'images',
});

// Validate image URL
const validateImageUrl = async (url: string) => {
  return new Promise<boolean>((resolve) => {
    const img = new Image();
    img.onload = () => resolve(true);
    img.onerror = () => resolve(false);
    img.src = url;
    setTimeout(() => resolve(false), 5000); // Timeout
  });
};
```

---

### Task 5: SpecificationsSection

**Objective**: Label/value pair array.

**Implementation**:
- Two-column grid layout
- Add new row focuses first input
- Remove with confirmation

---

### Task 6: FeaturesSection

**Objective**: Features with icons.

**Implementation**:
- Title (required), description, icon
- Lucide icon picker (simple input for v1)
- Expandable feature cards

---

### Task 7: ActionButtons & BadgesSection

**Objective**: CTA and badge configuration.

**Implementation**:
- Similar array pattern
- Type/style selects
- Preview of badge appearance

---

### Task 8: CategoriesTagsSection

**Objective**: Multi-select relationships.

**New Hook**:
```typescript
// hooks/useProductFormData.ts
export function useProductFormData() {
  const { data: categories, isLoading: categoriesLoading } = useSWR(
    '/api/categories',
    fetcher
  );
  const { data: tags, isLoading: tagsLoading } = useSWR(
    '/api/tags',
    fetcher
  );

  return {
    categories: categories?.docs || [],
    tags: tags?.docs || [],
    isLoading: categoriesLoading || tagsLoading,
  };
}
```

**API Routes Needed**:
- `GET /api/categories` - List all categories
- `GET /api/tags` - List all tags

---

### Task 9: PricingSection

**Objective**: Pricing configuration.

**Fields**:
- price (text)
- pricing.displayText
- pricing.subtitle
- pricing.currency (select)
- pricing.showContactForm (switch)

---

### Task 10: SeoSection

**Objective**: SEO metadata.

**Features**:
- Character counters for meta title/description
- Preview snippets (future enhancement)

---

### Task 11: Full Form Assembly

**Objective**: Integrate all sections into ProductForm.

**Implementation**:
```typescript
export function ProductForm({ ... }) {
  const form = useForm<ExtendedProductFormValues>({
    resolver: zodResolver(ExtendedProductFormSchema),
    defaultValues: { ... },
  });

  const { categories, tags, isLoading } = useProductFormData();
  const vendorTier = useVendorTier(); // Get current vendor's tier

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)}>
        <BasicInfoSection control={form.control} />

        <FormSection title="Images" tierRequired="tier2" currentTier={vendorTier}>
          <ImagesSection control={form.control} />
        </FormSection>

        <FormSection title="Pricing" tierRequired="tier2" currentTier={vendorTier}>
          <PricingSection control={form.control} />
        </FormSection>

        {/* ... more sections */}

        <Button type="submit">Save Product</Button>
      </form>
    </Form>
  );
}
```

---

### Task 12: Tier Gating Implementation

**Objective**: Enforce tier restrictions.

**Implementation**:
- Fetch vendor tier from context/API
- Pass to FormSection components
- Backend validation (already exists via collection hooks)

---

### Task 13: Draft Autosave

**Objective**: Prevent data loss.

**Implementation**:
```typescript
// hooks/useFormDraft.ts
export function useFormDraft<T>(
  key: string,
  form: UseFormReturn<T>,
  interval = 30000
) {
  // Load on mount
  useEffect(() => {
    const draft = localStorage.getItem(key);
    if (draft) {
      const parsed = JSON.parse(draft);
      form.reset(parsed);
    }
  }, []);

  // Save periodically
  useEffect(() => {
    const timer = setInterval(() => {
      localStorage.setItem(key, JSON.stringify(form.getValues()));
    }, interval);
    return () => clearInterval(timer);
  }, []);

  return {
    clearDraft: () => localStorage.removeItem(key),
    hasDraft: () => !!localStorage.getItem(key),
  };
}
```

---

### Task 14: Mobile Responsiveness

**Objective**: Ensure usability on mobile.

**Implementation**:
- Test all sections at mobile breakpoint
- Adjust layouts (grid → stack)
- Increase touch targets
- Bottom sheet for complex selects

---

### Task 15: Accessibility Audit

**Objective**: WCAG 2.1 AA compliance.

**Checklist**:
- [ ] All form fields have labels
- [ ] Error messages announced
- [ ] Focus management on section toggle
- [ ] Keyboard navigation works
- [ ] Color contrast meets requirements
- [ ] Screen reader testing passed

## Dependencies Between Tasks

```
Task 1 (Types) ──────┬──► Task 2 (FormSection)
                     │
                     ├──► Task 3 (BasicInfo)
                     │
                     ├──► Task 4 (Images)
                     │
                     ├──► Task 5 (Specs)
                     │
                     ├──► Task 6 (Features)
                     │
                     ├──► Task 7 (Buttons/Badges)
                     │
                     ├──► Task 9 (Pricing)
                     │
                     └──► Task 10 (SEO)

Task 8 (Categories) ──► Requires API routes

Tasks 2-10 ──────────► Task 11 (Assembly)

Task 11 ─────────────► Task 12 (Tier Gating)
                       Task 13 (Autosave)

Task 11 ─────────────► Task 14 (Mobile)
                       Task 15 (A11y)
```

## Testing Checkpoints

### After Phase 1
- [ ] Types compile
- [ ] FormSection opens/closes
- [ ] Basic fields work

### After Phase 2
- [ ] Can add/remove images
- [ ] Can add/remove specs
- [ ] Can add/remove features

### After Phase 3
- [ ] Categories load and select
- [ ] Tags load and select

### After Phase 4
- [ ] Pricing saves correctly
- [ ] SEO fields save correctly

### After Phase 5
- [ ] Full form submits
- [ ] Tier gating enforced
- [ ] Drafts save/restore

### After Phase 6
- [ ] Mobile layouts correct
- [ ] Screen reader passes
- [ ] No console errors

## Risk Mitigation

| Risk | Mitigation |
|------|------------|
| Schema changes break form | Run type-check after each task |
| Array operations lose data | Test add/remove extensively before integration |
| Performance issues | Profile after adding each section |
| API incompatibility | Test submission after each section added |
