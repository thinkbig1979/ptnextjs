'use client';

import React, { useState, useEffect } from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { CheckCircle, XCircle, Loader2, ArrowRight } from 'lucide-react';

/**
 * Tier Upgrade Request Interface
 */
interface TierUpgradeRequest {
  id: string;
  vendor: {
    id: string;
    companyName: string;
    contactEmail?: string;
  };
  currentTier: string;
  requestedTier: string;
  vendorNotes?: string;
  status: 'pending' | 'approved' | 'rejected' | 'cancelled';
  requestedAt: string;
}

/**
 * Tier Display Labels
 */
const TIER_LABELS: Record<string, string> = {
  free: 'Free',
  tier1: 'Tier 1',
  tier2: 'Tier 2',
  tier3: 'Tier 3',
};

/**
 * AdminTierRequestQueue Component
 *
 * Displays pending tier upgrade requests in a table with approve/reject actions.
 * Features:
 * - Table display of pending requests
 * - Approve action with confirmation dialog
 * - Reject action with reason input dialog
 * - Toast notifications for success/error
 * - Loading states
 * - Empty state
 * - Tier visual comparison (current → requested)
 */
export default function AdminTierRequestQueue() {
  const [requests, setRequests] = useState<TierUpgradeRequest[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  // Dialog states
  const [approveDialogOpen, setApproveDialogOpen] = useState(false);
  const [rejectDialogOpen, setRejectDialogOpen] = useState(false);
  const [selectedRequest, setSelectedRequest] = useState<TierUpgradeRequest | null>(null);
  const [rejectionReason, setRejectionReason] = useState('');

  const { toast } = useToast();

  /**
   * Fetch pending requests on mount
   */
  useEffect(() => {
    fetchPendingRequests();
  }, []);

  /**
   * Fetch pending tier upgrade requests from API
   */
  const fetchPendingRequests = async () => {
    try {
      setIsLoading(true);
      setError(null);

      const response = await fetch('/api/admin/tier-upgrade-requests?status=pending', {
        method: 'GET',
        credentials: 'include',
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || data.message || 'Failed to fetch pending tier requests');
      }

      const data = await response.json();
      setRequests(data.data || data.requests || []);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to load pending tier requests';
      setError(message);
      toast({
        title: 'Error',
        description: message,
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  /**
   * Open approve confirmation dialog
   */
  const handleApproveClick = (request: TierUpgradeRequest) => {
    setSelectedRequest(request);
    setApproveDialogOpen(true);
  };

  /**
   * Open reject dialog with reason input
   */
  const handleRejectClick = (request: TierUpgradeRequest) => {
    setSelectedRequest(request);
    setRejectionReason('');
    setRejectDialogOpen(true);
  };

  /**
   * Approve tier upgrade request
   */
  const handleApprove = async () => {
    if (!selectedRequest) return;

    try {
      setActionLoading(selectedRequest.id);

      const response = await fetch(`/api/admin/tier-upgrade-requests/${selectedRequest.id}/approve`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || data.message || 'Failed to approve tier request');
      }

      // Remove request from list
      setRequests((prev) => prev.filter((r) => r.id !== selectedRequest.id));

      // Show success toast
      toast({
        title: 'Tier Request Approved',
        description: `${selectedRequest.vendor.companyName}'s upgrade to ${TIER_LABELS[selectedRequest.requestedTier]} has been approved successfully.`,
      });

      // Close dialog
      setApproveDialogOpen(false);
      setSelectedRequest(null);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to approve tier request';
      toast({
        title: 'Error',
        description: message,
        variant: 'destructive',
      });

      // Close dialog on error
      setApproveDialogOpen(false);
      setSelectedRequest(null);
    } finally {
      setActionLoading(null);
    }
  };

  /**
   * Reject tier upgrade request with reason
   */
  const handleReject = async () => {
    if (!selectedRequest) return;

    // Validate rejection reason
    if (!rejectionReason.trim()) {
      toast({
        title: 'Error',
        description: 'Please provide a reason for rejection.',
        variant: 'destructive',
      });
      return;
    }

    try {
      setActionLoading(selectedRequest.id);

      const response = await fetch(`/api/admin/tier-upgrade-requests/${selectedRequest.id}/reject`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({
          rejectionReason,
        }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || data.message || 'Failed to reject tier request');
      }

      // Remove request from list
      setRequests((prev) => prev.filter((r) => r.id !== selectedRequest.id));

      // Show success toast
      toast({
        title: 'Tier Request Rejected',
        description: `${selectedRequest.vendor.companyName}'s upgrade request has been rejected.`,
      });

      // Close dialog
      setRejectDialogOpen(false);
      setSelectedRequest(null);
      setRejectionReason('');
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to reject tier request';
      toast({
        title: 'Error',
        description: message,
        variant: 'destructive',
      });

      // Close dialog on error
      setRejectDialogOpen(false);
      setSelectedRequest(null);
      setRejectionReason('');
    } finally {
      setActionLoading(null);
    }
  };

  /**
   * Format date for display
   */
  const formatDate = (dateString: string) => {
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
        <span className="ml-2 text-muted-foreground">Loading pending tier requests...</span>
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
        <Button onClick={fetchPendingRequests} variant="outline" size="sm" className="mt-2">
          Retry
        </Button>
      </div>
    );
  }

  /**
   * Empty state
   */
  if (requests.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center rounded-md border border-dashed py-12">
        <CheckCircle className="h-12 w-12 text-muted-foreground" />
        <h3 className="mt-4 text-lg font-semibold">No Pending Tier Requests</h3>
        <p className="mt-2 text-sm text-muted-foreground">
          All tier upgrade requests have been reviewed.
        </p>
      </div>
    );
  }

  return (
    <>
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Company Name</TableHead>
              <TableHead>Contact Email</TableHead>
              <TableHead>Tier Change</TableHead>
              <TableHead>Vendor Notes</TableHead>
              <TableHead>Request Date</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {requests.map((request) => (
              <TableRow key={request.id}>
                <TableCell className="font-medium">
                  {request.vendor.companyName}
                </TableCell>
                <TableCell>{request.vendor.contactEmail || 'N/A'}</TableCell>
                <TableCell>
                  <div className="flex items-center gap-2">
                    <Badge variant="outline" className="text-xs">
                      {TIER_LABELS[request.currentTier]}
                    </Badge>
                    <ArrowRight className="h-3 w-3 text-muted-foreground" />
                    <Badge variant="default" className="text-xs">
                      {TIER_LABELS[request.requestedTier]}
                    </Badge>
                  </div>
                </TableCell>
                <TableCell className="max-w-xs">
                  {request.vendorNotes ? (
                    <div className="truncate text-sm text-muted-foreground" title={request.vendorNotes}>
                      {request.vendorNotes}
                    </div>
                  ) : (
                    <span className="text-xs text-muted-foreground italic">No notes provided</span>
                  )}
                </TableCell>
                <TableCell>{formatDate(request.requestedAt)}</TableCell>
                <TableCell className="text-right">
                  <div className="flex justify-end gap-2">
                    <Button
                      onClick={() => handleApproveClick(request)}
                      disabled={actionLoading === request.id}
                      size="sm"
                      variant="default"
                      aria-label={`Approve ${request.vendor.companyName}'s tier upgrade request`}
                    >
                      {actionLoading === request.id ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        <>
                          <CheckCircle className="mr-1 h-4 w-4" />
                          Approve
                        </>
                      )}
                    </Button>
                    <Button
                      onClick={() => handleRejectClick(request)}
                      disabled={actionLoading === request.id}
                      size="sm"
                      variant="destructive"
                      aria-label={`Reject ${request.vendor.companyName}'s tier upgrade request`}
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
            <DialogTitle>Approve Tier Upgrade Request</DialogTitle>
            <DialogDescription>
              Are you sure you want to approve{' '}
              <strong>{selectedRequest?.vendor.companyName}</strong>'s upgrade request?
              Their tier will be automatically updated from{' '}
              <strong>{selectedRequest && TIER_LABELS[selectedRequest.currentTier]}</strong> to{' '}
              <strong>{selectedRequest && TIER_LABELS[selectedRequest.requestedTier]}</strong>.
            </DialogDescription>
          </DialogHeader>
          {selectedRequest?.vendorNotes && (
            <div className="rounded-md bg-muted p-3">
              <p className="text-sm font-medium">Vendor Notes:</p>
              <p className="mt-1 text-sm text-muted-foreground">{selectedRequest.vendorNotes}</p>
            </div>
          )}
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
            <DialogTitle>Reject Tier Upgrade Request</DialogTitle>
            <DialogDescription>
              Please provide a reason for rejecting{' '}
              <strong>{selectedRequest?.vendor.companyName}</strong>'s tier upgrade request.
              This reason will be visible to the vendor.
            </DialogDescription>
          </DialogHeader>
          {selectedRequest?.vendorNotes && (
            <div className="rounded-md bg-muted p-3">
              <p className="text-sm font-medium">Vendor Notes:</p>
              <p className="mt-1 text-sm text-muted-foreground">{selectedRequest.vendorNotes}</p>
            </div>
          )}
          <div className="py-4">
            <Textarea
              placeholder="Enter rejection reason (e.g., 'Please provide more details about your business needs')"
              value={rejectionReason}
              onChange={(e) => setRejectionReason(e.target.value)}
              rows={4}
              className="w-full"
              aria-label="Rejection reason"
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
