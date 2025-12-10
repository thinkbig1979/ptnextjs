# Task: Create ProductForm Component (Sheet)

## Metadata
- **ID**: task-fe-3
- **Phase**: 3 - Frontend Implementation
- **Agent**: frontend-react-specialist
- **Time**: 40-50 min
- **Dependencies**: task-be-2 (validation schemas)
- **Status**: pending

## Description

Create the product form component that slides in as a Sheet for creating and editing products. Uses react-hook-form with Zod validation.

## Specifics

### File to Create
`components/dashboard/ProductForm.tsx`

### Component Props

```typescript
interface ProductFormProps {
  product?: Product;  // undefined = create, defined = edit
  vendorId: string;
  open: boolean;
  onSuccess: (product: Product) => void;
  onCancel: () => void;
}
```

### Required Form Fields (E2E Test Selectors)

**CRITICAL**: Form fields must match E2E test selectors:

1. **Name Input**:
   - Test selector: `input[name*="name"]`
   - Implementation: `<Input name="name" />`

2. **Description Textarea**:
   - Test selector: `textarea[name*="description"]`
   - Implementation: `<Textarea name="description" />`

3. **Save/Create Button**:
   - Test selector: `button:has-text("Save")` or `button:has-text("Create")`
   - Implementation: Create mode: "Create Product", Edit mode: "Save Changes"

### Component Structure

```tsx
'use client';

import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet';
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import type { Product } from '@/lib/types';

// Form schema (subset of full schema for form fields)
const ProductFormSchema = z.object({
  name: z.string().min(1, 'Name is required').max(255),
  description: z.string().min(1, 'Description is required'),
  shortDescription: z.string().max(500).optional(),
});

type ProductFormValues = z.infer<typeof ProductFormSchema>;

interface ProductFormProps {
  product?: Product;
  vendorId: string;
  open: boolean;
  onSuccess: (product: Product) => void;
  onCancel: () => void;
}

export function ProductForm({
  product,
  vendorId,
  open,
  onSuccess,
  onCancel,
}: ProductFormProps) {
  const isEdit = !!product;

  const form = useForm<ProductFormValues>({
    resolver: zodResolver(ProductFormSchema),
    defaultValues: {
      name: '',
      description: '',
      shortDescription: '',
    },
    mode: 'onChange',
  });

  const { isSubmitting } = form.formState;

  // Reset form when product changes (for edit mode)
  useEffect(() => {
    if (product) {
      form.reset({
        name: product.name || '',
        description: extractTextFromDescription(product.description),
        shortDescription: product.shortDescription || '',
      });
    } else {
      form.reset({
        name: '',
        description: '',
        shortDescription: '',
      });
    }
  }, [product, form]);

  const onSubmit = async (data: ProductFormValues) => {
    try {
      const url = isEdit
        ? `/api/portal/vendors/${vendorId}/products/${product.id}`
        : `/api/portal/vendors/${vendorId}/products`;

      const method = isEdit ? 'PUT' : 'POST';

      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });

      const result = await response.json();

      if (!response.ok) {
        if (result.error?.fields) {
          Object.entries(result.error.fields).forEach(([field, message]) => {
            form.setError(field as keyof ProductFormValues, {
              message: message as string,
            });
          });
        }
        throw new Error(result.error?.message || 'Failed to save product');
      }

      toast.success(isEdit ? 'Product updated successfully' : 'Product created successfully');
      onSuccess(result.data.product);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'An error occurred');
    }
  };

  return (
    <Sheet open={open} onOpenChange={(isOpen) => !isOpen && onCancel()}>
      <SheetContent side="right" className="w-full sm:max-w-lg overflow-y-auto">
        <SheetHeader className="mb-6">
          <SheetTitle>
            {isEdit ? 'Edit Product' : 'Add New Product'}
          </SheetTitle>
          <SheetDescription>
            {isEdit
              ? 'Update your product details below.'
              : 'Fill in the details to create a new product.'}
          </SheetDescription>
        </SheetHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Product Name *</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="e.g., Advanced Navigation System"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Description *</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Describe your product in detail..."
                      rows={4}
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="shortDescription"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Short Description</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="Brief summary for listings"
                      {...field}
                    />
                  </FormControl>
                  <FormDescription>Max 500 characters</FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="flex gap-3 pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={onCancel}
                disabled={isSubmitting}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting && (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                )}
                {isEdit ? 'Save Changes' : 'Create Product'}
              </Button>
            </div>
          </form>
        </Form>
      </SheetContent>
    </Sheet>
  );
}

// Helper to extract plain text from Lexical JSON
function extractTextFromDescription(description: unknown): string {
  if (typeof description === 'string') return description;
  if (!description || typeof description !== 'object') return '';

  try {
    const root = (description as { root?: { children?: { children?: { text?: string }[] }[] } }).root;
    if (!root?.children) return '';

    return root.children
      .flatMap((para) => para.children?.map((child) => child.text || '') || [])
      .join(' ');
  } catch {
    return '';
  }
}
```

## Acceptance Criteria

- [ ] Form opens in Sheet sliding from right
- [ ] Create mode shows empty form
- [ ] Edit mode pre-populates with product data
- [ ] Name input has `name="name"` attribute
- [ ] Description textarea has `name="description"` attribute
- [ ] Validation errors show inline
- [ ] Submit button shows "Create Product" or "Save Changes"
- [ ] Loading spinner during submission
- [ ] Success triggers `onSuccess` callback
- [ ] Cancel closes sheet without saving

## Testing Requirements

E2E tests verify:
- Name input fillable: `input[name*="name"]`
- Description fillable: `textarea[name*="description"]`
- Save button clickable: `button:has-text("Create")` or `button:has-text("Save")`

## Related Files

- `components/ui/sheet.tsx` - Sheet components
- `components/ui/form.tsx` - Form components
- `lib/validation/product-schema.ts` - Validation schemas
