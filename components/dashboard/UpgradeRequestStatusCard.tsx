'use client';

import * as React from 'react';
import { format } from 'date-fns';
import { toast } from '@/components/ui/sonner';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
  CardFooter,
} from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { ArrowRight, Calendar, User } from 'lucide-react';

export interface UpgradeRequestStatusCardProps {
  request: TierUpgradeRequest;
  onCancel?: (requestId: string) => Promise<void>;
  showActions?: boolean;
}

export interface TierUpgradeRequest {
  id: string;
  vendorId: string;
  currentTier: string;
  requestedTier: string;
  status: 'pending' | 'approved' | 'rejected' | 'cancelled';
  vendorNotes?: string;
  rejectionReason?: string;
  requestedAt: string;
  reviewedAt?: string;
  reviewedBy?: {
    id: string;
    name: string;
  };
}

// Tier display labels
const TIER_LABELS: Record<string, string> = {
  free: 'Free',
  tier1: 'Tier 1',
  tier2: 'Tier 2',
  tier3: 'Tier 3',
};

// Get status badge variant and className
function getStatusBadgeProps(status: string) {
  switch (status) {
    case 'pending':
      return {
        variant: 'outline' as const,
        className: 'bg-yellow-50 text-yellow-700 dark:bg-yellow-900/20 dark:text-yellow-300',
      };
    case 'approved':
      return {
        variant: 'outline' as const,
        className: 'bg-green-50 text-green-700 dark:bg-green-900/20 dark:text-green-300',
      };
    case 'rejected':
      return {
        variant: 'destructive' as const,
        className: '',
      };
    case 'cancelled':
      return {
        variant: 'secondary' as const,
        className: '',
      };
    default:
      return {
        variant: 'default' as const,
        className: '',
      };
  }
}

export function UpgradeRequestStatusCard({
  request,
  onCancel,
  showActions = false,
}: UpgradeRequestStatusCardProps) {
  const [isCancelling, setIsCancelling] = React.useState(false);

  const handleCancel = async () => {
    try {
      setIsCancelling(true);

      const response = await fetch(
        `/api/portal/vendors/${request.vendorId}/tier-upgrade-request/${request.id}`,
        { method: 'DELETE' }
      );

      if (!response.ok) {
        throw new Error('Failed to cancel request');
      }

      toast.success('Request cancelled successfully');
      await onCancel?.(request.id);
    } catch (error) {
      toast.error('Failed to cancel request');
      console.error('Failed to cancel tier upgrade request:', error);
    } finally {
      setIsCancelling(false);
    }
  };

  const badgeProps = getStatusBadgeProps(request.status);
  const canCancel = request.status === 'pending' && showActions;

  return (
    <Card className="hover-lift">
      <CardHeader>
        <div className="flex items-start justify-between">
          <div className="space-y-1">
            <CardTitle className="flex items-center gap-2">
              <span>Tier Upgrade Request</span>
              <Badge variant={badgeProps.variant} className={badgeProps.className}>
                {request.status.charAt(0).toUpperCase() + request.status.slice(1)}
              </Badge>
            </CardTitle>
            <CardDescription className="flex items-center gap-2 text-sm">
              <Calendar className="h-4 w-4" />
              Requested on {format(new Date(request.requestedAt), 'MMM dd, yyyy')}
            </CardDescription>
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Tier Upgrade Info */}
        <div className="flex items-center gap-2 text-sm">
          <span className="font-medium">{TIER_LABELS[request.currentTier]}</span>
          <ArrowRight className="h-4 w-4 text-muted-foreground" />
          <span className="font-medium text-primary">{TIER_LABELS[request.requestedTier]}</span>
        </div>

        {/* Vendor Notes */}
        {request.vendorNotes && (
          <>
            <Separator />
            <div className="space-y-2">
              <h4 className="text-sm font-medium">Business Justification</h4>
              <p className="text-sm text-muted-foreground">{request.vendorNotes}</p>
            </div>
          </>
        )}

        {/* Reviewer Info */}
        {request.reviewedBy && (
          <>
            <Separator />
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <User className="h-4 w-4" />
              <span>Reviewed by {request.reviewedBy.name}</span>
              {request.reviewedAt && (
                <span className="text-xs">
                  on {format(new Date(request.reviewedAt), 'MMM dd, yyyy')}
                </span>
              )}
            </div>
          </>
        )}

        {/* Rejection Reason */}
        {request.status === 'rejected' && request.rejectionReason && (
          <>
            <Separator />
            <div className="space-y-2 rounded-lg bg-destructive/10 p-3">
              <h4 className="text-sm font-medium text-destructive">Rejection Reason</h4>
              <p className="text-sm text-destructive/90">{request.rejectionReason}</p>
            </div>
          </>
        )}
      </CardContent>

      {/* Cancel Action */}
      {canCancel && (
        <CardFooter className="flex justify-end">
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button variant="outline" size="sm" disabled={isCancelling}>
                Cancel Request
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                <AlertDialogDescription>
                  This will cancel your tier upgrade request. You can submit a new request at
                  any time.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancel</AlertDialogCancel>
                <AlertDialogAction onClick={handleCancel} disabled={isCancelling}>
                  Continue
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </CardFooter>
      )}
    </Card>
  );
}
