'use client';

import * as React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { toast } from '@/components/ui/sonner';
import {
  Form,
  FormField,
  FormItem,
  FormLabel,
  FormControl,
  FormDescription,
  FormMessage
} from '@/components/ui/form';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription
} from '@/components/ui/card';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Checkbox } from '@/components/ui/checkbox';
import { AlertTriangle } from 'lucide-react';

export interface TierDowngradeRequestFormProps {
  vendorId: string;
  currentTier: 'free' | 'tier1' | 'tier2' | 'tier3';
  onSuccess?: (data?: any) => void;
  onCancel?: () => void;
  /** Current number of locations the vendor has */
  locationCount?: number;
  /** Current number of products the vendor has */
  productCount?: number;
}

// Zod validation schema
const tierDowngradeRequestSchema = z.object({
  requestedTier: z.enum(['free', 'tier1', 'tier2', 'tier3'], {
    required_error: 'Please select a tier',
  }),
  vendorNotes: z.string().superRefine((val, ctx) => {
    if (val && val.length > 0 && val.length < 20) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'Vendor notes must be at least 20 characters',
      });
    }
    if (val && val.length > 500) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'Vendor notes cannot exceed 500 characters',
      });
    }
  }).optional(),
  confirmation: z.boolean().refine((val) => val === true, {
    message: 'You must confirm that you understand the consequences of downgrading',
  }),
});

type TierDowngradeRequestFormData = z.infer<typeof tierDowngradeRequestSchema>;

// Tier display labels
const TIER_LABELS: Record<string, string> = {
  free: 'Free',
  tier1: 'Tier 1',
  tier2: 'Tier 2',
  tier3: 'Tier 3',
};

// Feature descriptions for each tier
const TIER_FEATURES: Record<string, string[]> = {
  free: [
    'Basic profile only',
    '1 product listing',
    '1 business location',
    'No social media links',
    'No video introduction',
    'Standard email support (48hrs)',
  ],
  tier1: [
    'Up to 5 products',
    '1 featured product',
    'Video introduction',
    'Team member profiles',
    'Case studies & certifications',
    'Social media links',
    'Priority email support (24hrs)',
  ],
  tier2: [
    'Up to 25 products',
    '5 featured products',
    'Up to 5 business locations',
    'Custom branding colors',
    'Advanced analytics',
    'Homepage featured listing',
    'Priority email support (12hrs)',
  ],
  tier3: [
    'Unlimited products',
    'Unlimited featured products',
    'Up to 10 business locations',
    'Priority search ranking',
    'Dedicated account manager',
    'Premium email support (4hrs)',
    '12 promotion credits/month',
  ],
};

// Get available lower tiers based on current tier
function getAvailableLowerTiers(currentTier: 'free' | 'tier1' | 'tier2' | 'tier3'): string[] {
  const tierHierarchy = ['free', 'tier1', 'tier2', 'tier3'];
  const currentIndex = tierHierarchy.indexOf(currentTier);
  return tierHierarchy.slice(0, currentIndex);
}

// Get features that will be lost when downgrading to a specific tier
function getFeaturesLost(currentTier: string, targetTier: string): string[] {
  const tierHierarchy = ['free', 'tier1', 'tier2', 'tier3'];
  const currentIndex = tierHierarchy.indexOf(currentTier);
  const targetIndex = tierHierarchy.indexOf(targetTier);

  const featuresLost: string[] = [];

  // Collect features from all tiers between target and current
  for (let i = targetIndex + 1; i <= currentIndex; i++) {
    const tier = tierHierarchy[i];
    featuresLost.push(...TIER_FEATURES[tier]);
  }

  return [...new Set(featuresLost)]; // Remove duplicates
}

// Tier limits for locations and products
const TIER_LIMITS: Record<string, { locations: number; products: number }> = {
  free: { locations: 1, products: 1 },
  tier1: { locations: 1, products: 5 },
  tier2: { locations: 5, products: 25 },
  tier3: { locations: 10, products: Infinity },
};

// Calculate what will be archived when downgrading
interface ArchiveImpact {
  locationsToArchive: number;
  productsToArchive: number;
  hasImpact: boolean;
}

function calculateArchiveImpact(
  targetTier: string,
  currentLocationCount: number,
  currentProductCount: number
): ArchiveImpact {
  const limits = TIER_LIMITS[targetTier];
  if (!limits) {
    return { locationsToArchive: 0, productsToArchive: 0, hasImpact: false };
  }

  const locationsToArchive = Math.max(0, currentLocationCount - limits.locations);
  const productsToArchive = Math.max(0, currentProductCount - limits.products);

  return {
    locationsToArchive,
    productsToArchive,
    hasImpact: locationsToArchive > 0 || productsToArchive > 0,
  };
}

export function TierDowngradeRequestForm({
  vendorId,
  currentTier,
  onSuccess,
  onCancel,
  locationCount = 0,
  productCount = 0,
}: TierDowngradeRequestFormProps) {
  const [isSubmitting, setIsSubmitting] = React.useState(false);

  const form = useForm<TierDowngradeRequestFormData>({
    resolver: zodResolver(tierDowngradeRequestSchema),
    mode: 'onBlur',
    defaultValues: {
      requestedTier: undefined,
      vendorNotes: '',
      confirmation: false,
    },
  });

  const selectedTier = form.watch('requestedTier');
  const vendorNotes = form.watch('vendorNotes');
  const notesLength = vendorNotes?.length || 0;

  // Don't render form if already at lowest tier
  if (currentTier === 'free') {
    return null;
  }

  const availableTiers = getAvailableLowerTiers(currentTier);
  const featuresLost = selectedTier ? getFeaturesLost(currentTier, selectedTier) : [];
  const archiveImpact = selectedTier
    ? calculateArchiveImpact(selectedTier, locationCount, productCount)
    : { locationsToArchive: 0, productsToArchive: 0, hasImpact: false };

  const onSubmit = async (data: TierDowngradeRequestFormData) => {
    setIsSubmitting(true);

    try {
      const response = await fetch(
        `/api/portal/vendors/${vendorId}/tier-downgrade-request`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            requestedTier: data.requestedTier,
            vendorNotes: data.vendorNotes || undefined,
          }),
        }
      );

      const result = await response.json();

      if (!response.ok) {
        // Handle specific error cases
        if (response.status === 401) {
          toast.error('Your session has expired. Please log in again.');
          setTimeout(() => { window.location.href = '/vendor/login'; }, 1500);
          return;
        } else if (response.status === 403) {
          toast.error('You do not have permission to perform this action.');
          setTimeout(() => { window.location.href = '/vendor/dashboard'; }, 1500);
          return;
        } else if (response.status === 409) {
          toast.error('You already have a pending downgrade request');
        } else if (response.status === 400) {
          toast.error(result.message || 'Please fix the errors in the form');
        } else if (response.status === 500) {
          toast.error('Server error. Please try again later.');
        } else {
          toast.error('Failed to submit request. Please try again.');
        }
        setIsSubmitting(false);
        return;
      }

      // Success
      toast.success('Tier downgrade request submitted successfully!');
      form.reset();

      if (onSuccess) {
        onSuccess(result.data);
      }
    } catch (error) {
      console.error('Error submitting tier downgrade request:', error);
      toast.error('Failed to submit request. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Request Tier Downgrade</CardTitle>
        <CardDescription>
          Select a lower tier and understand what features you will lose
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            {/* Warning Alert */}
            <Alert variant="warning">
              <AlertTriangle className="h-4 w-4" />
              <AlertTitle>Important: Feature Loss Warning</AlertTitle>
              <AlertDescription>
                Downgrading your tier will immediately remove access to premium features.
                This may result in:
                <ul className="list-disc list-inside mt-2 space-y-1">
                  <li>Reduced product listing limits</li>
                  <li>Loss of featured placements and priority rankings</li>
                  <li>Removal of advanced analytics and insights</li>
                  <li>Reduced location capacity</li>
                  <li>Loss of custom branding options</li>
                </ul>
              </AlertDescription>
            </Alert>

            {/* Requested Tier Select */}
            <FormField
              control={form.control}
              name="requestedTier"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Target Tier</FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    value={field.value}
                    disabled={isSubmitting}
                    name="requestedTier"
                  >
                    <FormControl>
                      <SelectTrigger aria-label="Target Tier">
                        <SelectValue placeholder="Select a lower tier" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {availableTiers.map((tier) => (
                        <SelectItem key={tier} value={tier}>
                          {TIER_LABELS[tier]}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormDescription>
                    Current tier: <strong>{TIER_LABELS[currentTier]}</strong>
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Features Lost Display */}
            {selectedTier && featuresLost.length > 0 && (
              <div className="rounded-lg border border-warning/50 bg-warning/10 p-4 dark:border-warning dark:bg-warning/15">
                <h4 className="font-semibold text-warning-foreground mb-2">
                  Features You Will Lose:
                </h4>
                <ul className="list-disc list-inside space-y-1 text-sm text-warning-foreground">
                  {featuresLost.map((feature) => (
                    <li key={`feature-${feature}`}>{feature}</li>
                  ))}
                </ul>
              </div>
            )}

            {/* Archive Impact Warning - Critical downgrade warnings */}
            {selectedTier && archiveImpact.hasImpact && (
              <Alert variant="destructive">
                <AlertTriangle className="h-4 w-4" />
                <AlertTitle>Content Will Be Archived</AlertTitle>
                <AlertDescription className="space-y-2">
                  <p>Based on your current content, the following will be archived (hidden from public view):</p>
                  <ul className="list-disc list-inside space-y-1 mt-2">
                    {archiveImpact.locationsToArchive > 0 && (
                      <li>
                        <strong>{archiveImpact.locationsToArchive} location{archiveImpact.locationsToArchive > 1 ? 's' : ''}</strong>
                        {' '}will be archived. You have {locationCount} location{locationCount > 1 ? 's' : ''}, but {TIER_LABELS[selectedTier]} allows only {TIER_LIMITS[selectedTier]?.locations}.
                      </li>
                    )}
                    {archiveImpact.productsToArchive > 0 && (
                      <li>
                        <strong>{archiveImpact.productsToArchive} product{archiveImpact.productsToArchive > 1 ? 's' : ''}</strong>
                        {' '}will be archived. You have {productCount} product{productCount > 1 ? 's' : ''}, but {TIER_LABELS[selectedTier]} allows only {TIER_LIMITS[selectedTier]?.products}.
                      </li>
                    )}
                  </ul>
                  <p className="text-sm mt-2 italic">
                    Archived content is preserved and can be restored if you upgrade again later.
                  </p>
                </AlertDescription>
              </Alert>
            )}

            {/* Vendor Notes Textarea */}
            <FormField
              control={form.control}
              name="vendorNotes"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>
                    Reason for Downgrade <span className="text-muted-foreground">(Optional)</span>
                  </FormLabel>
                  <FormControl>
                    <Textarea
                      {...field}
                      placeholder="Please share your reason for downgrading (optional)..."
                      disabled={isSubmitting}
                      aria-label="Reason for Downgrade"
                      className="min-h-[120px]"
                    />
                  </FormControl>
                  <FormDescription>
                    {notesLength > 0 && (
                      <span className={notesLength > 500 ? 'text-destructive' : ''}>
                        {notesLength}/500 characters
                      </span>
                    )}
                    {notesLength === 0 && (
                      <span className="text-muted-foreground">
                        Minimum 20 characters if provided
                      </span>
                    )}
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Confirmation Checkbox */}
            <FormField
              control={form.control}
              name="confirmation"
              render={({ field }) => (
                <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border border-warning/50 bg-warning/10 p-4 dark:border-warning dark:bg-warning/15">
                  <FormControl>
                    <Checkbox
                      checked={field.value}
                      onCheckedChange={field.onChange}
                      disabled={isSubmitting || !selectedTier}
                      aria-label="Confirmation"
                      className="border-warning data-[state=checked]:bg-warning data-[state=checked]:text-warning-foreground"
                    />
                  </FormControl>
                  <div className="space-y-1 leading-none">
                    <FormLabel className="text-sm font-medium text-warning-foreground">
                      I understand the consequences
                    </FormLabel>
                    <FormDescription className="text-warning-foreground/80">
                      I acknowledge that downgrading will immediately remove access to the features listed above,
                      and I accept the limitations of the {selectedTier ? TIER_LABELS[selectedTier] : 'selected'} tier.
                    </FormDescription>
                    <FormMessage />
                  </div>
                </FormItem>
              )}
            />

            {/* Form Actions */}
            <div className="flex gap-3 justify-end">
              {onCancel && (
                <Button
                  type="button"
                  variant="outline"
                  onClick={onCancel}
                  disabled={isSubmitting}
                >
                  Cancel
                </Button>
              )}
              <Button
                type="submit"
                variant="destructive"
                disabled={isSubmitting}
              >
                {isSubmitting ? 'Submitting...' : 'Submit Downgrade Request'}
              </Button>
            </div>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}
