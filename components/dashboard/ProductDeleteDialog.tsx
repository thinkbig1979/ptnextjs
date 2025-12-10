'use client';

import type { Product } from '@/lib/types';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';

export interface ProductDeleteDialogProps {
  product: Product | null;
  open: boolean;
  onConfirm: () => void;
  onCancel: () => void;
  isDeleting?: boolean;
}

/**
 * ProductDeleteDialog
 *
 * Confirmation dialog for product deletion using shadcn/ui AlertDialog.
 * Provides a clear warning message and requires explicit user confirmation.
 *
 * @param product - The product to delete (null when dialog should be closed)
 * @param open - Whether the dialog is currently open
 * @param onConfirm - Callback when user confirms deletion
 * @param onCancel - Callback when user cancels deletion
 * @param isDeleting - Optional loading state during deletion (disables buttons)
 */
export function ProductDeleteDialog({
  product,
  open,
  onConfirm,
  onCancel,
  isDeleting = false,
}: ProductDeleteDialogProps) {
  return (
    <AlertDialog open={open} onOpenChange={(isOpen) => !isOpen && onCancel()}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Delete Product</AlertDialogTitle>
          <AlertDialogDescription>
            Are you sure you want to delete &quot;{product?.name || 'this product'}&quot;? This action cannot be undone.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={isDeleting} onClick={onCancel}>
            Cancel
          </AlertDialogCancel>
          <AlertDialogAction
            onClick={(e) => {
              e.preventDefault();
              onConfirm();
            }}
            disabled={isDeleting}
            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
          >
            {isDeleting ? 'Deleting...' : 'Delete'}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
