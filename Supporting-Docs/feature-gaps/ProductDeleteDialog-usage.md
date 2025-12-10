# ProductDeleteDialog Component

## Overview
A reusable confirmation dialog component for product deletion using shadcn/ui AlertDialog.

## File Location
`/home/edwin/development/ptnextjs/components/dashboard/ProductDeleteDialog.tsx`

## Usage Example

```tsx
import { ProductDeleteDialog } from '@/components/dashboard/ProductDeleteDialog';
import { useState } from 'react';

function ProductManagementCard() {
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<{ id: string; name: string } | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const handleDeleteClick = (product: { id: string; name: string }) => {
    setSelectedProduct(product);
    setDeleteDialogOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (!selectedProduct) return;

    setIsDeleting(true);
    try {
      // Call your delete API
      await fetch(`/api/products/${selectedProduct.id}`, {
        method: 'DELETE',
      });

      // Handle success (e.g., refresh product list, show toast)
      setDeleteDialogOpen(false);
      setSelectedProduct(null);
    } catch (error) {
      // Handle error
      console.error('Failed to delete product:', error);
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <>
      {/* Your product list UI with delete buttons */}
      <button onClick={() => handleDeleteClick({ id: '1', name: 'Product Name' })}>
        Delete
      </button>

      {/* Delete confirmation dialog */}
      <ProductDeleteDialog
        productName={selectedProduct?.name || ''}
        isOpen={deleteDialogOpen}
        onOpenChange={setDeleteDialogOpen}
        onConfirm={handleConfirmDelete}
        isDeleting={isDeleting}
      />
    </>
  );
}
```

## Props

| Prop | Type | Required | Description |
|------|------|----------|-------------|
| `productName` | `string` | Yes | The name of the product to delete (displayed in confirmation message) |
| `isOpen` | `boolean` | Yes | Whether the dialog is currently open |
| `onOpenChange` | `(open: boolean) => void` | Yes | Callback when dialog open state changes |
| `onConfirm` | `() => void` | Yes | Callback when user confirms deletion |
| `isDeleting` | `boolean` | No | Optional loading state during deletion (disables buttons and shows "Deleting..." text) |

## Features

1. **Confirmation Dialog**: Uses shadcn AlertDialog for accessible confirmation
2. **Product Name Display**: Shows the product name in the confirmation message
3. **Cancel and Delete Buttons**:
   - Cancel button (outline variant)
   - Delete button (destructive variant with red styling)
4. **Loading State**:
   - Disables both buttons when `isDeleting` is true
   - Changes Delete button text to "Deleting..."
5. **Keyboard Accessible**: Full keyboard navigation support via AlertDialog
6. **Prevent Default**: onClick handler prevents default AlertDialogAction behavior

## Styling

- Uses destructive color scheme for the Delete button
- Follows shadcn/ui design patterns
- Responsive layout (mobile-friendly)

## Integration Notes

- Component is marked as `'use client'` for client-side interactivity
- Uses proper HTML entity encoding for quotes (`&quot;`)
- Follows TypeScript best practices with exported interface
- Consistent with existing dialog patterns in the codebase
