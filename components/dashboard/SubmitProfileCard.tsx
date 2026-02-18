'use client';

import React, { useState, useMemo } from 'react';
import { useVendorDashboard } from '@/lib/context/VendorDashboardContext';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
  AlertCircle,
  CheckCircle2,
  Send,
  Loader2,
  FileCheck,
} from 'lucide-react';
import { toast } from 'sonner';

interface MissingField {
  field: string;
  label: string;
}

/**
 * SubmitProfileCard Component
 *
 * Displays a card allowing vendors to submit their profile for review.
 * - Shows validation status (missing required fields)
 * - Submit button is disabled until all required fields are filled
 * - Hidden if profile has already been submitted
 *
 * Required fields for submission:
 * - description
 * - logo
 * - contactPhone
 */
export function SubmitProfileCard() {
  const { vendor, isLoading, refreshVendor } = useVendorDashboard();
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Extract primitive values for dependency optimization
  // This prevents unnecessary useMemo re-runs when vendor object changes but these fields don't
  const vendorDescription = vendor?.description;
  const vendorLogo = vendor?.logo;
  const vendorContactPhone = vendor?.contactPhone;

  /**
   * Check which mandatory fields are missing
   * Using primitives in dependency array to avoid unnecessary re-computations
   */
  const missingFields = useMemo((): MissingField[] => {
    if (!vendor) return [];

    const missing: MissingField[] = [];

    if (!vendorDescription || vendorDescription.trim() === '') {
      missing.push({ field: 'description', label: 'Company Description' });
    }

    if (!vendorLogo) {
      missing.push({ field: 'logo', label: 'Company Logo' });
    }

    if (!vendorContactPhone || vendorContactPhone.trim() === '') {
      missing.push({ field: 'contactPhone', label: 'Contact Phone' });
    }

    return missing;
  }, [vendor, vendorDescription, vendorLogo, vendorContactPhone]);

  const isReadyToSubmit = missingFields.length === 0;
  const isAlreadySubmitted = vendor?.profileSubmitted === true;

  /**
   * Handle profile submission
   */
  const handleSubmit = async (): Promise<void> => {
    if (!vendor?.id) {
      toast.error('Unable to submit profile. Please try again.');
      return;
    }

    setIsSubmitting(true);

    try {
      const response = await fetch(
        `/api/portal/vendors/${vendor.id}/submit-profile`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          credentials: 'include',
        }
      );

      const result = await response.json();

      if (!response.ok) {
        const errorMessage =
          result.error?.message || 'Failed to submit profile';
        toast.error(errorMessage);

        return;
      }

      // Success
      toast.success('Profile submitted for review!');

      // Refresh vendor data to update profileSubmitted status
      await refreshVendor();
    } catch (error) {
      console.error('[SubmitProfileCard] Error:', error);
      toast.error('An error occurred. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Don't show the card if vendor data is not loaded
  if (isLoading || !vendor) {
    return null;
  }

  // Don't show the card if profile is already submitted
  if (isAlreadySubmitted) {
    return (
      <Card className="border-green-200 dark:border-green-800 bg-green-50 dark:bg-green-950/30">
        <CardContent className="py-6">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-green-100 dark:bg-green-900/50 rounded-full">
              <FileCheck
                className="h-5 w-5 text-green-600 dark:text-green-400"
                aria-hidden="true"
              />
            </div>
            <div>
              <p className="font-medium text-green-800 dark:text-green-200">
                Profile Submitted
              </p>
              <p className="text-sm text-green-600 dark:text-green-400">
                Your profile is under review. You&apos;ll be notified when
                it&apos;s approved.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="overflow-hidden border-0 shadow-md dark:shadow-lg">
      <CardHeader className="py-3 bg-gradient-to-r from-cyan-50 to-transparent dark:from-cyan-950/30 dark:to-transparent">
        <div className="flex items-center gap-2">
          <div className="p-1.5 bg-cyan-100 dark:bg-cyan-900/50 rounded-md">
            <Send
              className="h-4 w-4 text-cyan-600 dark:text-cyan-400"
              aria-hidden="true"
            />
          </div>
          <CardTitle className="text-base">Submit Profile for Review</CardTitle>
        </div>
      </CardHeader>
      <CardContent className="space-y-3 pt-3 pb-4">
        {isReadyToSubmit ? (
          <>
            <div className="flex items-center gap-2 p-2 bg-green-50 dark:bg-green-950/30 rounded-md">
              <CheckCircle2
                className="h-4 w-4 text-green-600 dark:text-green-400"
                aria-hidden="true"
              />
              <p className="text-sm text-green-700 dark:text-green-300">
                Ready to submit
              </p>
            </div>
            <Button
              className="w-full"
              size="sm"
              disabled={isSubmitting}
              onClick={handleSubmit}
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="mr-1.5 h-3.5 w-3.5 animate-spin" />
                  Submitting...
                </>
              ) : (
                <>
                  <Send className="mr-1.5 h-3.5 w-3.5" />
                  Submit for Review
                </>
              )}
            </Button>
          </>
        ) : (
          <>
            <p className="text-sm text-muted-foreground">
              Complete your profile before submitting for review:
            </p>
            <div className="space-y-1.5">
              {missingFields.map(({ field, label }) => (
                <a
                  key={field}
                  href="/vendor/dashboard/profile"
                  className="flex items-center gap-2 p-2 bg-yellow-50 dark:bg-yellow-950/30 rounded-md text-yellow-700 dark:text-yellow-300 hover:bg-yellow-100 dark:hover:bg-yellow-900/40 transition-colors"
                >
                  <AlertCircle
                    className="h-4 w-4 text-yellow-600 dark:text-yellow-400 flex-shrink-0"
                    aria-hidden="true"
                  />
                  <span className="text-sm font-medium">Add {label}</span>
                </a>
              ))}
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
}

export default SubmitProfileCard;
