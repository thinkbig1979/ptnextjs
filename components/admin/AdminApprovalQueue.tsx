'use client';

import React, { useCallback, useEffect, useState } from 'react';
import { CheckCircle, Loader2, XCircle } from 'lucide-react';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Textarea } from '@/components/ui/textarea';
import { toast } from 'sonner';

/**
 * API Response Types
 */
interface ApiErrorResponse {
  error?: string;
}

interface ApiSuccessResponse {
  pending?: PendingVendor[];
}

/**
 * Pending Vendor Interface
 */
interface PendingVendor {
  user: {
    id: string;
    email: string;
    role: string;
    status: string;
    createdAt: string;
  };
  vendor: {
    id: string;
    companyName: string;
    contactPhone?: string;
  } | null;
}

/**
 * AdminApprovalQueue Component
 *
 * Displays pending vendor registrations in a table with approve/reject actions.
 * Features:
 * - Table display of pending vendors
 * - Approve action with confirmation dialog
 * - Reject action with reason input dialog
 * - Toast notifications for success/error
 * - Loading states
 * - Empty state
 */
export default function AdminApprovalQueue(): React.ReactElement {
  const [vendors, setVendors] = useState<PendingVendor[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  // Dialog states
  const [approveDialogOpen, setApproveDialogOpen] = useState<boolean>(false);
  const [rejectDialogOpen, setRejectDialogOpen] = useState<boolean>(false);
  const [selectedVendor, setSelectedVendor] = useState<PendingVendor | null>(null);
  const [rejectionReason, setRejectionReason] = useState<string>('');

  /**
   * Fetch pending vendors from API
   * Wrapped in useCallback to stabilize the function reference
   */
  const fetchPendingVendors = useCallback(async (): Promise<void> => {
    try {
      setIsLoading(true);
      setError(null);

      const response = await fetch('/api/admin/vendors/pending', {
        method: 'GET',
        credentials: 'include',
      });

      if (!response.ok) {
        const data = (await response.json()) as ApiErrorResponse;
        throw new Error(data.error || 'Failed to fetch pending vendors');
      }

      const data = (await response.json()) as ApiSuccessResponse;
      setVendors(data.pending || []);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to load pending vendors';
      setError(message);
      toast.error(message);
    } finally {
      setIsLoading(false);
    }
  }, []);

  /**
   * Fetch pending vendors on mount
   */
  useEffect(() => {
    fetchPendingVendors();
  }, [fetchPendingVendors]);

  /**
   * Open approve confirmation dialog
   */
  const handleApproveClick = (vendor: PendingVendor): void => {
    setSelectedVendor(vendor);
    setApproveDialogOpen(true);
  };

  /**
   * Open reject dialog with reason input
   */
  const handleRejectClick = (vendor: PendingVendor): void => {
    setSelectedVendor(vendor);
    setRejectionReason('');
    setRejectDialogOpen(true);
  };

  /**
   * Approve vendor
   */
  const handleApprove = async (): Promise<void> => {
    if (!selectedVendor) return;

    try {
      setActionLoading(selectedVendor.user.id);

      const response = await fetch(`/api/admin/vendors/${selectedVendor.user.id}/approve`, {
        method: 'POST',
        credentials: 'include',
      });

      if (!response.ok) {
        const data = (await response.json()) as ApiErrorResponse;
        throw new Error(data.error || 'Failed to approve vendor');
      }

      // Remove vendor from list
      setVendors((prev) => prev.filter((v) => v.user.id !== selectedVendor.user.id));

      toast.success(`${selectedVendor.vendor?.companyName || selectedVendor.user.email} has been approved successfully.`);

      // Close dialog
      setApproveDialogOpen(false);
      setSelectedVendor(null);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to approve vendor';
      toast.error(message);

      // Close dialog on error
      setApproveDialogOpen(false);
      setSelectedVendor(null);
    } finally {
      setActionLoading(null);
    }
  };

  /**
   * Reject vendor with reason
   */
  const handleReject = async (): Promise<void> => {
    if (!selectedVendor) return;

    // Validate rejection reason
    if (!rejectionReason.trim()) {
      toast.error('Please provide a reason for rejection.');
      return;
    }

    try {
      setActionLoading(selectedVendor.user.id);

      const response = await fetch(`/api/admin/vendors/${selectedVendor.user.id}/reject`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({ rejectionReason }),
      });

      if (!response.ok) {
        const data = (await response.json()) as ApiErrorResponse;
        throw new Error(data.error || 'Failed to reject vendor');
      }

      // Remove vendor from list
      setVendors((prev) => prev.filter((v) => v.user.id !== selectedVendor.user.id));

      toast.success(`${selectedVendor.vendor?.companyName || selectedVendor.user.email} has been rejected.`);

      // Close dialog
      setRejectDialogOpen(false);
      setSelectedVendor(null);
      setRejectionReason('');
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to reject vendor';
      toast.error(message);

      // Close dialog on error
      setRejectDialogOpen(false);
      setSelectedVendor(null);
      setRejectionReason('');
    } finally {
      setActionLoading(null);
    }
  };

  /**
   * Format date for display
   */
  const formatDate = (dateString: string): string => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  /**
   * Loading state
   */
  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12" data-testid="loading-spinner">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        <span className="ml-2 text-muted-foreground">Loading pending vendors...</span>
      </div>
    );
  }

  /**
   * Error state
   */
  if (error) {
    return (
      <div className="rounded-md border border-destructive bg-destructive/10 p-4" role="alert">
        <p className="text-sm text-destructive">{error}</p>
        <Button onClick={fetchPendingVendors} variant="outline" size="sm" className="mt-2">
          Retry
        </Button>
      </div>
    );
  }

  /**
   * Empty state
   */
  if (vendors.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center rounded-md border border-dashed py-12">
        <CheckCircle className="h-12 w-12 text-muted-foreground" />
        <h3 className="mt-4 text-lg font-semibold">No Pending Approvals</h3>
        <p className="mt-2 text-sm text-muted-foreground">
          All vendor registrations have been reviewed.
        </p>
      </div>
    );
  }

  return (
    <>
      {/* Status announcements for screen readers */}
      <div role="status" aria-live="polite" className="sr-only">
        {vendors.length === 0
          ? 'No pending vendor approvals'
          : `${vendors.length} pending vendor ${vendors.length === 1 ? 'approval' : 'approvals'}`}
      </div>

      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Company Name</TableHead>
              <TableHead>Contact Email</TableHead>
              <TableHead>Phone</TableHead>
              <TableHead>Registration Date</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {vendors.map((vendor) => (
              <TableRow key={vendor.user.id}>
                <TableCell className="font-medium">
                  {vendor.vendor?.companyName || 'N/A'}
                </TableCell>
                <TableCell>{vendor.user.email}</TableCell>
                <TableCell>{vendor.vendor?.contactPhone || 'N/A'}</TableCell>
                <TableCell>{formatDate(vendor.user.createdAt)}</TableCell>
                <TableCell>
                  <Badge variant="outline" className="bg-yellow-50 text-yellow-700">
                    Pending
                  </Badge>
                </TableCell>
                <TableCell className="text-right">
                  <div className="flex justify-end gap-2">
                    <Button
                      onClick={() => handleApproveClick(vendor)}
                      disabled={actionLoading === vendor.user.id}
                      size="sm"
                      variant="default"
                      aria-label={`Approve ${vendor.vendor?.companyName || vendor.user.email}`}
                    >
                      {actionLoading === vendor.user.id ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        <>
                          <CheckCircle className="mr-1 h-4 w-4" />
                          Approve
                        </>
                      )}
                    </Button>
                    <Button
                      onClick={() => handleRejectClick(vendor)}
                      disabled={actionLoading === vendor.user.id}
                      size="sm"
                      variant="destructive"
                      aria-label={`Reject ${vendor.vendor?.companyName || vendor.user.email}`}
                    >
                      <XCircle className="mr-1 h-4 w-4" />
                      Reject
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      {/* Approve Confirmation Dialog */}
      <Dialog open={approveDialogOpen} onOpenChange={setApproveDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Approve Vendor Registration</DialogTitle>
            <DialogDescription>
              Are you sure you want to approve{' '}
              <strong>{selectedVendor?.vendor?.companyName || selectedVendor?.user.email}</strong>?
              This will grant them access to the vendor portal.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              onClick={() => setApproveDialogOpen(false)}
              variant="outline"
              disabled={actionLoading !== null}
            >
              Cancel
            </Button>
            <Button
              onClick={handleApprove}
              disabled={actionLoading !== null}
            >
              {actionLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Approving...
                </>
              ) : (
                'Approve'
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Reject Dialog with Reason */}
      <Dialog open={rejectDialogOpen} onOpenChange={setRejectDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Reject Vendor Registration</DialogTitle>
            <DialogDescription>
              Please provide a reason for rejecting{' '}
              <strong>{selectedVendor?.vendor?.companyName || selectedVendor?.user.email}</strong>.
              This reason will be sent to the vendor.
            </DialogDescription>
          </DialogHeader>
          <div className="py-4">
            <Textarea
              id="rejection-reason-input"
              placeholder="Enter rejection reason..."
              value={rejectionReason}
              onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setRejectionReason(e.target.value)}
              rows={4}
              className="w-full"
              aria-label="Rejection reason"
              aria-required="true"
            />
          </div>
          <DialogFooter>
            <Button
              onClick={() => setRejectDialogOpen(false)}
              variant="outline"
              disabled={actionLoading !== null}
            >
              Cancel
            </Button>
            <Button
              onClick={handleReject}
              variant="destructive"
              disabled={actionLoading !== null}
            >
              {actionLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Rejecting...
                </>
              ) : (
                'Reject'
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
