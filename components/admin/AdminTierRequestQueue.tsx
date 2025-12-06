'use client';

import React, { useCallback, useEffect, useState } from 'react';
import { ArrowDown, ArrowRight, ArrowUp, CheckCircle, Loader2, XCircle } from 'lucide-react';

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
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';

/**
 * API Response Types
 */
interface ApiErrorResponse {
  error?: string;
  message?: string;
}

interface ApiSuccessResponse {
  data?: TierUpgradeRequest[];
  requests?: TierUpgradeRequest[];
}

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
  requestType: 'upgrade' | 'downgrade';
  vendorNotes?: string;
  status: 'pending' | 'approved' | 'rejected' | 'cancelled';
  requestedAt: string;
}

/**
 * Request Type Filter Values
 */
type RequestTypeFilter = 'all' | 'upgrade' | 'downgrade';

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
 * Displays pending tier upgrade/downgrade requests in a table with approve/reject actions.
 * Features:
 * - Table display of pending requests
 * - Filter by request type (upgrade/downgrade)
 * - Visual distinction between upgrade and downgrade requests
 * - Approve action with confirmation dialog
 * - Reject action with reason input dialog
 * - Toast notifications for success/error
 * - Loading states
 * - Empty state
 * - Tier visual comparison (current → requested)
 */
export default function AdminTierRequestQueue(): React.ReactElement {
  const [requests, setRequests] = useState<TierUpgradeRequest[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [requestTypeFilter, setRequestTypeFilter] = useState<RequestTypeFilter>('all');

  // Dialog states
  const [approveDialogOpen, setApproveDialogOpen] = useState<boolean>(false);
  const [rejectDialogOpen, setRejectDialogOpen] = useState<boolean>(false);
  const [selectedRequest, setSelectedRequest] = useState<TierUpgradeRequest | null>(null);
  const [rejectionReason, setRejectionReason] = useState<string>('');

  const { toast } = useToast();

  /**
   * Fetch pending tier upgrade requests from API
   * Wrapped in useCallback to stabilize the function reference
   */
  const fetchPendingRequests = useCallback(async (): Promise<void> => {
    try {
      setIsLoading(true);
      setError(null);

      const params = new URLSearchParams({
        status: 'pending',
      });

      // Add requestType filter if not 'all'
      if (requestTypeFilter !== 'all') {
        params.append('requestType', requestTypeFilter);
      }

      const response = await fetch(`/api/admin/tier-upgrade-requests?${params.toString()}`, {
        method: 'GET',
        credentials: 'include',
      });

      if (!response.ok) {
        const data = (await response.json()) as ApiErrorResponse;
        throw new Error(data.error || data.message || 'Failed to fetch pending tier requests');
      }

      const data = (await response.json()) as ApiSuccessResponse;
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
  }, [requestTypeFilter, toast]);

  /**
   * Fetch pending requests on mount and when filter changes
   */
  useEffect(() => {
    fetchPendingRequests();
  }, [fetchPendingRequests]);

  /**
   * Open approve confirmation dialog
   */
  const handleApproveClick = (request: TierUpgradeRequest): void => {
    setSelectedRequest(request);
    setApproveDialogOpen(true);
  };

  /**
   * Open reject dialog with reason input
   */
  const handleRejectClick = (request: TierUpgradeRequest): void => {
    setSelectedRequest(request);
    setRejectionReason('');
    setRejectDialogOpen(true);
  };

  /**
   * Approve tier upgrade request
   */
  const handleApprove = async (): Promise<void> => {
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
        const data = (await response.json()) as ApiErrorResponse;
        throw new Error(data.error || data.message || 'Failed to approve tier request');
      }

      // Remove request from list
      setRequests((prev) => prev.filter((r) => r.id !== selectedRequest.id));

      // Show success toast
      const requestTypeName = selectedRequest.requestType === 'upgrade' ? 'upgrade' : 'downgrade';
      toast({
        title: 'Tier Request Approved',
        description: `${selectedRequest.vendor.companyName}'s ${requestTypeName} to ${TIER_LABELS[selectedRequest.requestedTier]} has been approved successfully.`,
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
  const handleReject = async (): Promise<void> => {
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
        const data = (await response.json()) as ApiErrorResponse;
        throw new Error(data.error || data.message || 'Failed to reject tier request');
      }

      // Remove request from list
      setRequests((prev) => prev.filter((r) => r.id !== selectedRequest.id));

      // Show success toast
      const requestTypeName = selectedRequest.requestType === 'upgrade' ? 'upgrade' : 'downgrade';
      toast({
        title: 'Tier Request Rejected',
        description: `${selectedRequest.vendor.companyName}'s ${requestTypeName} request has been rejected.`,
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
  const formatDate = (dateString: string): string => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  /**
   * Get request type badge component
   */
  const getRequestTypeBadge = (requestType: 'upgrade' | 'downgrade'): React.ReactElement => {
    if (requestType === 'upgrade') {
      return (
        <Badge variant="default" className="bg-success hover:bg-success/90 text-success-foreground">
          <ArrowUp className="mr-1 h-3 w-3" />
          Upgrade
        </Badge>
      );
    }
    return (
      <Badge variant="default" className="bg-warning hover:bg-warning/90 text-warning-foreground">
        <ArrowDown className="mr-1 h-3 w-3" />
        Downgrade
      </Badge>
    );
  };

  /**
   * Get row styling based on request type
   */
  const getRowClassName = (requestType: 'upgrade' | 'downgrade'): string => {
    if (requestType === 'downgrade') {
      return 'bg-warning/5 hover:bg-warning/10';
    }
    return '';
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

  return (
    <>
      {/* Filter Controls */}
      <div className="mb-4 flex items-center gap-4">
        <div className="flex items-center gap-2">
          <label htmlFor="request-type-filter" className="text-sm font-medium">
            Request Type:
          </label>
          <Select
            value={requestTypeFilter}
            onValueChange={(value: 'all' | 'upgrade' | 'downgrade') => setRequestTypeFilter(value)}
          >
            <SelectTrigger id="request-type-filter" className="w-[180px]">
              <SelectValue placeholder="Select type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Requests</SelectItem>
              <SelectItem value="upgrade">Upgrades Only</SelectItem>
              <SelectItem value="downgrade">Downgrades Only</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Status announcements for screen readers */}
      <div role="status" aria-live="polite" className="sr-only">
        {requests.length === 0
          ? 'No pending tier requests'
          : `${requests.length} pending tier ${requests.length === 1 ? 'request' : 'requests'}`}
      </div>

      {/* Empty state */}
      {requests.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-md border border-dashed py-12">
          <CheckCircle className="h-12 w-12 text-muted-foreground" />
          <h3 className="mt-4 text-lg font-semibold">No Pending Tier Requests</h3>
          <p className="mt-2 text-sm text-muted-foreground">
            {requestTypeFilter === 'all'
              ? 'All tier change requests have been reviewed.'
              : `No pending ${requestTypeFilter} requests.`}
          </p>
        </div>
      ) : (
        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Type</TableHead>
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
                <TableRow key={request.id} className={getRowClassName(request.requestType)}>
                  <TableCell>
                    {getRequestTypeBadge(request.requestType)}
                  </TableCell>
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
                      <Badge
                        variant="default"
                        className={`text-xs ${
                          request.requestType === 'upgrade'
                            ? 'bg-success text-success-foreground'
                            : 'bg-warning text-warning-foreground'
                        }`}
                      >
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
                        aria-label={`Approve ${request.vendor.companyName}'s tier ${request.requestType} request`}
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
                        aria-label={`Reject ${request.vendor.companyName}'s tier ${request.requestType} request`}
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
      )}

      {/* Approve Confirmation Dialog */}
      <Dialog open={approveDialogOpen} onOpenChange={setApproveDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              Approve Tier {selectedRequest?.requestType === 'upgrade' ? 'Upgrade' : 'Downgrade'} Request
            </DialogTitle>
            <DialogDescription>
              Are you sure you want to approve{' '}
              <strong>{selectedRequest?.vendor.companyName}</strong>&apos;s{' '}
              {selectedRequest?.requestType === 'upgrade' ? 'upgrade' : 'downgrade'} request?
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
          {selectedRequest?.requestType === 'downgrade' && (
            <div className="rounded-md border border-warning/50 bg-warning/10 p-3 dark:border-warning dark:bg-warning/15">
              <p className="text-sm font-medium text-warning-foreground">Downgrade Warning:</p>
              <p className="mt-1 text-sm text-warning-foreground/80">
                The vendor will lose access to features available in their current tier.
                Make sure they understand the limitations of the lower tier.
              </p>
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
            <DialogTitle>
              Reject Tier {selectedRequest?.requestType === 'upgrade' ? 'Upgrade' : 'Downgrade'} Request
            </DialogTitle>
            <DialogDescription>
              Please provide a reason for rejecting{' '}
              <strong>{selectedRequest?.vendor.companyName}</strong>&apos;s tier{' '}
              {selectedRequest?.requestType === 'upgrade' ? 'upgrade' : 'downgrade'} request.
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
              id="rejection-reason-input"
              placeholder="Enter rejection reason (e.g., 'Please provide more details about your business needs')"
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
