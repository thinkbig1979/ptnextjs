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

  /**
   * Check which mandatory fields are missing
   */
  const missingFields = useMemo((): MissingField[] => {
    if (!vendor) return [];

    const missing: MissingField[] = [];

    if (!vendor.description || vendor.description.trim() === '') {
      missing.push({ field: 'description', label: 'Company Description' });
    }

    if (!vendor.logo) {
      missing.push({ field: 'logo', label: 'Company Logo' });
    }

    if (!vendor.contactPhone || vendor.contactPhone.trim() === '') {
      missing.push({ field: 'contactPhone', label: 'Contact Phone' });
    }

    return missing;
  }, [vendor]);

  const isReadyToSubmit = missingFields.length === 0;
  const isAlreadySubmitted = vendor?.profileSubmitted === true;

  /**
   * Handle profile submission
   */
  const handleSubmit = async () => {
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

        if (result.error?.missingFields) {
          console.log(
            '[SubmitProfileCard] Missing fields:',
            result.error.missingFields
          );
        }
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
      <CardHeader className="bg-gradient-to-r from-cyan-50 to-transparent dark:from-cyan-950/30 dark:to-transparent">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-cyan-100 dark:bg-cyan-900/50 rounded-lg">
            <Send
              className="h-5 w-5 text-cyan-600 dark:text-cyan-400"
              aria-hidden="true"
            />
          </div>
          <div>
            <CardTitle>Submit Profile for Review</CardTitle>
            <CardDescription>
              Complete your profile and submit it for admin approval
            </CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-4 pt-6">
        {/* Validation Status */}
        {isReadyToSubmit ? (
          <div className="flex items-center gap-2 p-3 bg-green-50 dark:bg-green-950/30 rounded-lg">
            <CheckCircle2
              className="h-5 w-5 text-green-600 dark:text-green-400"
              aria-hidden="true"
            />
            <p className="text-sm text-green-700 dark:text-green-300">
              All required fields are complete. You can submit your profile.
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            <div className="flex items-start gap-2 p-3 bg-yellow-50 dark:bg-yellow-950/30 rounded-lg">
              <AlertCircle
                className="h-5 w-5 text-yellow-600 dark:text-yellow-400 flex-shrink-0 mt-0.5"
                aria-hidden="true"
              />
              <div>
                <p className="text-sm font-medium text-yellow-700 dark:text-yellow-300">
                  Complete the following required fields:
                </p>
                <ul className="mt-2 space-y-1">
                  {missingFields.map(({ field, label }) => (
                    <li
                      key={field}
                      className="text-sm text-yellow-600 dark:text-yellow-400"
                    >
                      &bull; {label}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        )}

        {/* Submit Button */}
        <Button
          className="w-full"
          disabled={!isReadyToSubmit || isSubmitting}
          onClick={handleSubmit}
        >
          {isSubmitting ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Submitting...
            </>
          ) : (
            <>
              <Send className="mr-2 h-4 w-4" />
              Submit Profile for Review
            </>
          )}
        </Button>

        {!isReadyToSubmit && (
          <p className="text-xs text-muted-foreground text-center">
            Complete all required fields above to enable submission
          </p>
        )}
      </CardContent>
    </Card>
  );
}

export default SubmitProfileCard;
