# Task: Create ProductCard Component

## Metadata
- **ID**: task-fe-1
- **Phase**: 3 - Frontend Implementation
- **Agent**: frontend-react-specialist
- **Time**: 25-30 min
- **Dependencies**: task-be-2 (types)
- **Status**: pending

## Description

Create the ProductCard presentational component that displays a single product with its status, categories, and action buttons (Edit, Delete, Publish toggle).

## Specifics

### File to Create
`components/dashboard/ProductCard.tsx`

### Component Props

```typescript
interface ProductCardProps {
  product: Product;
  onEdit: (product: Product) => void;
  onDelete: (product: Product) => void;
  onPublishToggle: (product: Product, published: boolean) => void;
  isPublishing?: boolean;  // Disable switch during API call
}
```

### Required Elements (E2E Test Selectors)

**CRITICAL**: The following elements must match E2E test selectors:

1. **Product Name**: Must be visible text containing the product name
   - Test selector: `text=/Test Product 1/i`
   - Implementation: `<CardTitle>{product.name}</CardTitle>`

2. **Edit Button**: Must have "Edit" text
   - Test selector: `button:has-text("Edit")`
   - Implementation: `<Button>Edit</Button>`

3. **Delete Button**: Must have "Delete" text (not just icon)
   - Test selector: `button:has-text("Delete")`
   - Implementation: `<Button>Delete</Button>` or `<Button><Trash2 /><span className="sr-only">Delete</span></Button>`

4. **Publish Toggle**: Must be a switch with aria-label containing "publish"
   - Test selector: `[role="switch"][aria-label*="publish"]`
   - Implementation: `<Switch aria-label="Publish product" />`

5. **Status Badge**: Must show "Published" or "Draft"
   - Test selector: `text=/Published|Draft/i`
   - Implementation: `<Badge>{product.published ? "Published" : "Draft"}</Badge>`

### Component Structure

```tsx
'use client';

import { Card, CardHeader, CardTitle, CardContent, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Pencil, Trash2 } from 'lucide-react';
import type { Product } from '@/lib/types';

interface ProductCardProps {
  product: Product;
  onEdit: (product: Product) => void;
  onDelete: (product: Product) => void;
  onPublishToggle: (product: Product, published: boolean) => void;
  isPublishing?: boolean;
}

export function ProductCard({
  product,
  onEdit,
  onDelete,
  onPublishToggle,
  isPublishing = false,
}: ProductCardProps) {
  return (
    <Card className="overflow-hidden hover:shadow-md transition-shadow">
      <CardHeader className="pb-2">
        <div className="flex items-start justify-between gap-2">
          <CardTitle className="text-lg font-semibold line-clamp-1">
            {product.name}
          </CardTitle>
          <Badge variant={product.published ? 'default' : 'secondary'}>
            {product.published ? 'Published' : 'Draft'}
          </Badge>
        </div>
      </CardHeader>

      <CardContent className="pb-4">
        {product.shortDescription ? (
          <p className="text-sm text-muted-foreground line-clamp-2">
            {product.shortDescription}
          </p>
        ) : (
          <p className="text-sm text-muted-foreground italic">No description</p>
        )}

        {product.categories && product.categories.length > 0 && (
          <div className="flex flex-wrap gap-1 mt-2">
            {product.categories.slice(0, 3).map((cat) => (
              <Badge
                key={typeof cat === 'string' ? cat : cat.id}
                variant="outline"
                className="text-xs"
              >
                {typeof cat === 'string' ? cat : cat.name}
              </Badge>
            ))}
            {product.categories.length > 3 && (
              <Badge variant="outline" className="text-xs">
                +{product.categories.length - 3}
              </Badge>
            )}
          </div>
        )}
      </CardContent>

      <CardFooter className="pt-0 flex items-center justify-between border-t pt-4">
        <div className="flex items-center gap-2">
          <Switch
            checked={product.published}
            onCheckedChange={(checked) => onPublishToggle(product, checked)}
            disabled={isPublishing}
            aria-label="Publish product"
          />
          <span className="text-xs text-muted-foreground">
            {product.published ? 'Published' : 'Draft'}
          </span>
        </div>

        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => onEdit(product)}
          >
            <Pencil className="h-4 w-4 mr-1" />
            Edit
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onDelete(product)}
            className="text-destructive hover:text-destructive"
          >
            <Trash2 className="h-4 w-4 mr-1" />
            Delete
          </Button>
        </div>
      </CardFooter>
    </Card>
  );
}
```

## Acceptance Criteria

- [ ] Component renders product name visibly
- [ ] Edit button has visible "Edit" text
- [ ] Delete button has visible "Delete" text
- [ ] Switch has `aria-label="Publish product"`
- [ ] Badge shows "Published" or "Draft"
- [ ] Categories display with limit of 3 + count
- [ ] Hover state shows shadow effect
- [ ] Actions trigger correct callbacks
- [ ] No TypeScript errors

## Testing Requirements

E2E tests will verify:
- Product name visible: `text=/Test Product 1/i`
- Edit button clickable: `button:has-text("Edit")`
- Delete button clickable: `button:has-text("Delete")`
- Switch toggleable: `[role="switch"][aria-label*="publish"]`

## Related Files

- `components/ui/card.tsx` - Card components
- `components/ui/button.tsx` - Button component
- `components/ui/badge.tsx` - Badge component
- `components/ui/switch.tsx` - Switch component
- `lib/types.ts` - Product type
