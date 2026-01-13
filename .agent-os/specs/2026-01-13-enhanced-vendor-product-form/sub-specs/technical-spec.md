# Technical Specification: Enhanced Vendor Product Form

## Overview

This specification details the technical implementation for expanding the vendor product form from 3 fields to 25+ fields.

## Architecture

### Component Structure

```
components/dashboard/
├── ProductForm.tsx                    # Main form component (MODIFY)
├── product-form/
│   ├── index.ts                       # Re-exports
│   ├── BasicInfoSection.tsx           # Name, description, slug
│   ├── ImagesSection.tsx              # Image array management
│   ├── PricingSection.tsx             # Pricing configuration
│   ├── SpecificationsSection.tsx      # Label/value pairs
│   ├── FeaturesSection.tsx            # Features array
│   ├── CategoriesTagsSection.tsx      # Multi-select relationships
│   ├── ActionButtonsSection.tsx       # CTA configuration
│   ├── BadgesSection.tsx              # Quality badges
│   ├── SeoSection.tsx                 # SEO metadata
│   ├── FormSection.tsx                # Collapsible section wrapper
│   └── types.ts                       # Form-specific types
```

### Data Flow

```
┌─────────────────────────────────────────────────────────────────┐
│                        ProductForm.tsx                           │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │  React Hook Form + Zod (ProductFormSchema)               │   │
│  │  useFieldArray for: images, specs, features, buttons     │   │
│  └─────────────────────────────────────────────────────────┘   │
│                              │                                   │
│                              ▼                                   │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │  Form Sections (Accordion/Collapsible)                   │   │
│  │  - BasicInfoSection                                      │   │
│  │  - ImagesSection (Tier 2+)                              │   │
│  │  - PricingSection (Tier 2+)                             │   │
│  │  - SpecificationsSection (Tier 2+)                      │   │
│  │  - FeaturesSection (Tier 2+)                            │   │
│  │  - CategoriesTagsSection (Tier 2+)                      │   │
│  │  - ActionButtonsSection (Tier 2+)                       │   │
│  │  - BadgesSection (Tier 2+)                              │   │
│  │  - SeoSection (Tier 2+)                                 │   │
│  └─────────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼ onSubmit
┌─────────────────────────────────────────────────────────────────┐
│  API Route: /api/portal/vendors/[id]/products                   │
│  - Zod validation (CreateProductSchema / UpdateProductSchema)   │
│  - ProductService.createProduct / updateProduct                 │
│  - Payload CMS persistence                                      │
└─────────────────────────────────────────────────────────────────┘
```

## Form Schema Extension

### Current Schema (ProductForm.tsx)

```typescript
const ProductFormSchema = z.object({
  name: z.string().min(1).max(255),
  description: z.string().min(1),
  shortDescription: z.string().max(500).optional(),
});
```

### Extended Schema

```typescript
// components/dashboard/product-form/types.ts

import { z } from 'zod';

// Reuse from lib/validation/product-schema.ts
import {
  ProductImageSchema,
  SpecificationSchema,
  FeatureSchema,
  PricingSchema,
} from '@/lib/validation/product-schema';

// Action Button Schema (matches Products.ts collection)
export const ActionButtonSchema = z.object({
  label: z.string().min(1).max(100),
  type: z.enum(['primary', 'secondary', 'outline']),
  action: z.enum(['contact', 'quote', 'download', 'external_link', 'video']),
  actionData: z.string().max(500).optional(),
  icon: z.string().max(100).optional(),
  order: z.number().int().min(0).optional(),
});

// Badge Schema (matches Products.ts collection)
export const BadgeSchema = z.object({
  label: z.string().min(1).max(100),
  type: z.enum(['secondary', 'outline', 'success', 'warning', 'info']),
  icon: z.string().max(100).optional(),
  order: z.number().int().min(0).optional(),
});

// SEO Schema (matches Products.ts collection)
export const SeoSchema = z.object({
  metaTitle: z.string().max(100).optional(),
  metaDescription: z.string().max(300).optional(),
  keywords: z.string().max(500).optional(),
  ogImage: z.string().url().max(500).optional(),
});

// Extended Product Form Schema
export const ExtendedProductFormSchema = z.object({
  // Basic Info
  name: z.string().min(1, 'Product name is required').max(255),
  description: z.string().min(1, 'Description is required'),
  shortDescription: z.string().max(500).optional(),
  slug: z.string().max(255).regex(/^[a-z0-9-]*$/).optional(),

  // Images
  images: z.array(ProductImageSchema).optional().default([]),

  // Pricing
  price: z.string().max(100).optional(),
  pricing: PricingSchema.optional(),

  // Specifications
  specifications: z.array(SpecificationSchema).optional().default([]),

  // Features
  features: z.array(FeatureSchema).optional().default([]),

  // Relationships
  categories: z.array(z.string()).optional().default([]),
  tags: z.array(z.string()).optional().default([]),

  // Action Buttons
  actionButtons: z.array(ActionButtonSchema).optional().default([]),

  // Badges
  badges: z.array(BadgeSchema).optional().default([]),

  // SEO
  seo: SeoSchema.optional(),
});

export type ExtendedProductFormValues = z.infer<typeof ExtendedProductFormSchema>;
```

## Component Specifications

### 1. FormSection (Collapsible Wrapper)

```typescript
// components/dashboard/product-form/FormSection.tsx

interface FormSectionProps {
  title: string;
  description?: string;
  children: React.ReactNode;
  defaultOpen?: boolean;
  tierRequired?: 'tier1' | 'tier2';
  currentTier?: string;
  icon?: React.ReactNode;
}
```

**Implementation**:
- Use shadcn `Collapsible` or `Accordion`
- Show lock icon if tier not met
- Disabled state with "Upgrade to unlock" tooltip

### 2. ImagesSection

```typescript
interface ImagesSectionProps {
  control: Control<ExtendedProductFormValues>;
  disabled?: boolean;
}
```

**Features**:
- `useFieldArray` for `images`
- URL input with validation
- Thumbnail preview on valid URL
- Radio group for `isMain` selection
- Alt text and caption inputs
- Remove button with confirmation

**UI Components**:
- `Input` for URL
- `Checkbox` or `RadioGroup` for isMain
- `Button` for add/remove
- Image preview component

### 3. SpecificationsSection

```typescript
interface SpecificationsSectionProps {
  control: Control<ExtendedProductFormValues>;
  disabled?: boolean;
}
```

**Features**:
- `useFieldArray` for `specifications`
- Two-column layout: label | value
- Add/remove rows
- Drag handle for reordering (optional v1)

### 4. FeaturesSection

```typescript
interface FeaturesSectionProps {
  control: Control<ExtendedProductFormValues>;
  disabled?: boolean;
}
```

**Features**:
- `useFieldArray` for `features`
- Title input (required)
- Description textarea (optional)
- Icon selector (dropdown or input with Lucide icon name)
- Order number (auto-incremented)

### 5. CategoriesTagsSection

```typescript
interface CategoriesTagsSectionProps {
  control: Control<ExtendedProductFormValues>;
  categories: Array<{ id: string; name: string }>;
  tags: Array<{ id: string; name: string }>;
  disabled?: boolean;
}
```

**Features**:
- Fetch categories and tags on mount
- Multi-select combobox (shadcn `Command` + `Popover`)
- Selected items as removable badges
- Search/filter functionality

### 6. PricingSection

```typescript
interface PricingSectionProps {
  control: Control<ExtendedProductFormValues>;
  disabled?: boolean;
}
```

**Fields**:
- `price` (simple text)
- `pricing.displayText`
- `pricing.subtitle`
- `pricing.currency` (dropdown: USD, EUR, GBP, etc.)
- `pricing.showContactForm` (switch)

### 7. ActionButtonsSection

```typescript
interface ActionButtonsSectionProps {
  control: Control<ExtendedProductFormValues>;
  disabled?: boolean;
}
```

**Features**:
- `useFieldArray` for `actionButtons`
- Label input
- Type select (primary/secondary/outline)
- Action select (contact/quote/download/external_link/video)
- Action data input (conditional on action type)
- Icon selector

### 8. BadgesSection

```typescript
interface BadgesSectionProps {
  control: Control<ExtendedProductFormValues>;
  disabled?: boolean;
}
```

**Features**:
- `useFieldArray` for `badges`
- Label input
- Type select with preview
- Icon selector

### 9. SeoSection

```typescript
interface SeoSectionProps {
  control: Control<ExtendedProductFormValues>;
  productName: string; // For placeholder
  disabled?: boolean;
}
```

**Fields**:
- Meta title with character count
- Meta description with character count
- Keywords (comma-separated)
- OG Image URL (optional)

## API Integration

### Categories/Tags Fetch

```typescript
// New hook: hooks/useProductFormData.ts

export function useProductFormData() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [tags, setTags] = useState<Tag[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function fetchData() {
      const [categoriesRes, tagsRes] = await Promise.all([
        fetch('/api/categories'),
        fetch('/api/tags'),
      ]);
      // ... handle responses
    }
    fetchData();
  }, []);

  return { categories, tags, isLoading };
}
```

### Form Submission

```typescript
// Existing API already supports extended fields
// No API changes needed

const onSubmit = async (data: ExtendedProductFormValues) => {
  const response = await fetch(url, {
    method: isEdit ? 'PUT' : 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data), // Full extended data
  });
  // ... handle response
};
```

## State Management

### Form State

- React Hook Form handles all form state
- `useFieldArray` for dynamic arrays
- `watch` for dependent field updates (e.g., slug from name)

### Draft Autosave

```typescript
// hooks/useFormDraft.ts

export function useFormDraft<T>(
  formId: string,
  form: UseFormReturn<T>,
  interval: number = 30000
) {
  useEffect(() => {
    const saved = localStorage.getItem(`draft-${formId}`);
    if (saved) {
      form.reset(JSON.parse(saved));
    }
  }, []);

  useEffect(() => {
    const timer = setInterval(() => {
      const values = form.getValues();
      localStorage.setItem(`draft-${formId}`, JSON.stringify(values));
    }, interval);
    return () => clearInterval(timer);
  }, []);

  const clearDraft = () => localStorage.removeItem(`draft-${formId}`);
  return { clearDraft };
}
```

## Performance Considerations

### Lazy Loading Sections

```typescript
// Defer rendering of collapsed sections
const ImagesSection = dynamic(
  () => import('./product-form/ImagesSection'),
  { ssr: false }
);
```

### Debounced Validation

```typescript
// For image URL validation
const debouncedValidateImage = useMemo(
  () => debounce(validateImageUrl, 500),
  []
);
```

### Virtual Lists

For categories/tags with 100+ items:
```typescript
import { useVirtualizer } from '@tanstack/react-virtual';
```

## Error Handling

### Field-Level Errors

React Hook Form handles via Zod resolver.

### API Errors

```typescript
if (result.error?.fields) {
  Object.entries(result.error.fields).forEach(([field, message]) => {
    // Handle nested paths: "images.0.url"
    form.setError(field as FieldPath<ExtendedProductFormValues>, {
      message: message as string,
    });
  });
}
```

### Network Errors

```typescript
try {
  await submitForm();
} catch (error) {
  if (error instanceof TypeError && error.message === 'Failed to fetch') {
    toast.error('Network error. Please check your connection and try again.');
  }
}
```

## Accessibility

### Focus Management

```typescript
// On section expand
const sectionRef = useRef<HTMLDivElement>(null);
const onExpand = () => {
  setTimeout(() => {
    sectionRef.current?.querySelector('input')?.focus();
  }, 100);
};
```

### Announcements

```typescript
// For array operations
<div role="status" aria-live="polite" className="sr-only">
  {announcement}
</div>
```

### Keyboard Navigation

- Tab through all form controls
- Enter to expand/collapse sections
- Arrow keys in dropdowns
- Escape to close dropdowns

## Testing Strategy

See `testing-strategy.md` for full details.

### Unit Tests
- Each section component in isolation
- Form validation logic
- Array operations (add/remove/reorder)

### Integration Tests
- Full form submission flow
- Draft save/restore
- Tier gating behavior

### E2E Tests
- Create product with all fields
- Edit existing product
- Validation error scenarios
