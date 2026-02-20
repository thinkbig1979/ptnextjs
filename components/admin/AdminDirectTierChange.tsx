'use client';

import React, { useState } from 'react';
import { AlertTriangle, CheckCircle, Loader2 } from 'lucide-react';

import { TIER_DESCRIPTIONS, TIER_HIERARCHY, TIER_NAMES } from '@/lib/constants/tierConfig';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
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
import { toast } from 'sonner';

/**
 * Tier Type Definition
 */
type TierType = 'free' | 'tier1' | 'tier2' | 'tier3';

/**
 * API Response Types
 */
interface ApiErrorResponse {
  error?: string;
}

interface ApiSuccessResponse {
  message: string;
  vendor: {
    id: string;
    companyName: string;
    tier: string;
  };
}

/**
 * Component Props
 */
interface AdminDirectTierChangeProps {
  vendorId: string;
  currentTier: TierType;
  vendorName: string;
  onSuccess?: () => void;
}

/**
 * AdminDirectTierChange Component
 *
 * Allows admins to directly change any vendor's tier without request workflow.
 * Features:
 * - Display current tier with badge
 * - Dropdown to select new tier (all tiers available)
 * - Confirmation dialog with downgrade warnings
 * - API integration with PUT /api/admin/vendors/[id]/tier
 * - Toast notifications for success/error
 */
export default function AdminDirectTierChange({
  vendorId,
  currentTier,
  vendorName,
  onSuccess,
}: AdminDirectTierChangeProps): React.ReactElement {
  const [selectedTier, setSelectedTier] = useState<string>(currentTier);
  const [confirmDialogOpen, setConfirmDialogOpen] = useState<boolean>(false);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  // All available tiers
  const allTiers: TierType[] = ['free', 'tier1', 'tier2', 'tier3'];

  // Check if selected tier is a downgrade
  const isDowngrade = (): boolean => {
    return (
      TIER_HIERARCHY[selectedTier as keyof typeof TIER_HIERARCHY] < TIER_HIERARCHY[currentTier]
    );
  };

  // Check if tier has changed
  const hasChanged = selectedTier !== currentTier;

  /**
   * Open confirmation dialog
   */
  const handleChangeTierClick = (): void => {
    if (!hasChanged) {
      toast.info('Please select a different tier.');
      return;
    }
    setConfirmDialogOpen(true);
  };

  /**
   * Confirm and execute tier change
   */
  const handleConfirmChange = async (): Promise<void> => {
    setIsSubmitting(true);

    try {
      const response = await fetch(`/api/admin/vendors/${vendorId}/tier`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({
          tier: selectedTier,
        }),
      });

      const data = (await response.json()) as ApiSuccessResponse | ApiErrorResponse;

      if (!response.ok) {
        const errorData = data as ApiErrorResponse;
        throw new Error(errorData.error || 'Failed to update vendor tier');
      }

      // Success
      toast.success(`${vendorName} has been changed to ${TIER_NAMES[selectedTier as keyof typeof TIER_NAMES]}.`);

      setConfirmDialogOpen(false);

      // Call onSuccess callback if provided
      if (onSuccess) {
        onSuccess();
      }
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to update tier';
      toast.error(message);
    } finally {
      setIsSubmitting(false);
    }
  };

  /**
   * Cancel confirmation dialog
   */
  const handleCancelChange = (): void => {
    setConfirmDialogOpen(false);
  };

  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Admin Tier Control</CardTitle>
          <CardDescription>
            Directly change vendor tier (bypasses request workflow)
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Current Tier Display */}
          <div className="space-y-2">
            <label className="text-sm font-medium">Current Tier</label>
            <div className="flex items-center gap-2">
              <Badge variant="outline" className="text-sm">
                {TIER_NAMES[currentTier]}
              </Badge>
              <span className="text-xs text-muted-foreground">
                {TIER_DESCRIPTIONS[currentTier]}
              </span>
            </div>
          </div>

          {/* Tier Selection */}
          <div className="space-y-2">
            <label htmlFor="tier-select" className="text-sm font-medium">
              New Tier
            </label>
            <Select value={selectedTier} onValueChange={setSelectedTier}>
              <SelectTrigger id="tier-select">
                <SelectValue placeholder="Select tier" />
              </SelectTrigger>
              <SelectContent>
                {allTiers.map((tier) => (
                  <SelectItem key={tier} value={tier}>
                    {TIER_NAMES[tier]} - {TIER_DESCRIPTIONS[tier]}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Change Tier Button */}
          <Button
            onClick={handleChangeTierClick}
            disabled={!hasChanged}
            className="w-full"
          >
            Change Tier
          </Button>
        </CardContent>
      </Card>

      {/* Confirmation Dialog */}
      <Dialog open={confirmDialogOpen} onOpenChange={setConfirmDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Confirm Tier Change</DialogTitle>
            <DialogDescription>
              You are about to change the tier for <strong>{vendorName}</strong>
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            {/* Current and New Tier */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm font-medium text-muted-foreground">
                  Current Tier
                </p>
                <p className="text-lg font-semibold">
                  {TIER_NAMES[currentTier]}
                </p>
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">
                  New Tier
                </p>
                <p className="text-lg font-semibold">
                  {TIER_NAMES[selectedTier as keyof typeof TIER_NAMES]}
                </p>
              </div>
            </div>

            {/* Downgrade Warning */}
            {isDowngrade() && (
              <div className="flex items-start gap-2 rounded-md border border-warning/50 bg-warning/10 p-3 dark:border-warning dark:bg-warning/15">
                <AlertTriangle className="h-5 w-5 text-warning" />
                <div className="flex-1">
                  <p className="text-sm font-medium text-warning-foreground">
                    Downgrade Warning
                  </p>
                  <p className="mt-1 text-sm text-warning-foreground/80">
                    This vendor will lose access to features available in higher
                    tiers. Their data will be preserved but may exceed new tier
                    limits.
                  </p>
                </div>
              </div>
            )}

            {/* Upgrade Confirmation */}
            {!isDowngrade() && hasChanged && (
              <div className="flex items-start gap-2 rounded-md border border-success/50 bg-success/10 p-3 dark:border-success dark:bg-success/15">
                <CheckCircle className="h-5 w-5 text-success" />
                <div className="flex-1">
                  <p className="text-sm font-medium text-success-foreground">
                    Upgrade Confirmation
                  </p>
                  <p className="mt-1 text-sm text-success-foreground/80">
                    This vendor will gain access to additional features available
                    in {TIER_NAMES[selectedTier as keyof typeof TIER_NAMES]}.
                  </p>
                </div>
              </div>
            )}
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={handleCancelChange}
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button
              onClick={handleConfirmChange}
              disabled={isSubmitting}
              className="gap-2"
            >
              {isSubmitting && <Loader2 className="h-4 w-4 animate-spin" />}
              Confirm Change
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
