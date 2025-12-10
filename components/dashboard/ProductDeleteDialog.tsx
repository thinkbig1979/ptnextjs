'use client';

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
  productName: string;
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  onConfirm: () => void;
  isDeleting?: boolean;
}

/**
 * ProductDeleteDialog
 *
 * Confirmation dialog for product deletion using shadcn/ui AlertDialog.
 * Provides a clear warning message and requires explicit user confirmation.
 *
 * @param productName - The name of the product to delete (displayed in confirmation message)
 * @param isOpen - Whether the dialog is currently open
 * @param onOpenChange - Callback when dialog open state changes
 * @param onConfirm - Callback when user confirms deletion
 * @param isDeleting - Optional loading state during deletion (disables buttons)
 */
export function ProductDeleteDialog({
  productName,
  isOpen,
  onOpenChange,
  onConfirm,
  isDeleting = false,
}: ProductDeleteDialogProps) {
  return (
    <AlertDialog open={isOpen} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Delete Product</AlertDialogTitle>
          <AlertDialogDescription>
            Are you sure you want to delete &quot;{productName}&quot;? This action cannot be undone.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={isDeleting}>Cancel</AlertDialogCancel>
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
