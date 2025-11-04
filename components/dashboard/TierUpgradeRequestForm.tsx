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

export interface TierUpgradeRequestFormProps {
  vendorId: string;
  currentTier: 'free' | 'tier1' | 'tier2' | 'tier3';
  onSuccess?: (data?: any) => void;
  onCancel?: () => void;
}

// Zod validation schema
const tierUpgradeRequestSchema = z.object({
  requestedTier: z.enum(['tier1', 'tier2', 'tier3'], {
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
});

type TierUpgradeRequestFormData = z.infer<typeof tierUpgradeRequestSchema>;

// Tier display labels
const TIER_LABELS: Record<string, string> = {
  tier1: 'Tier 1',
  tier2: 'Tier 2',
  tier3: 'Tier 3',
};

// Get available tiers based on current tier
function getAvailableTiers(currentTier: 'free' | 'tier1' | 'tier2' | 'tier3'): string[] {
  const tierHierarchy = ['free', 'tier1', 'tier2', 'tier3'];
  const currentIndex = tierHierarchy.indexOf(currentTier);
  return tierHierarchy.slice(currentIndex + 1).filter(tier => tier !== 'free');
}

export function TierUpgradeRequestForm({
  vendorId,
  currentTier,
  onSuccess,
  onCancel
}: TierUpgradeRequestFormProps) {
  const [isSubmitting, setIsSubmitting] = React.useState(false);

  const form = useForm<TierUpgradeRequestFormData>({
    resolver: zodResolver(tierUpgradeRequestSchema),
    defaultValues: {
      requestedTier: undefined,
      vendorNotes: '',
    },
  });

  const vendorNotes = form.watch('vendorNotes');
  const notesLength = vendorNotes?.length || 0;

  // Don't render form if already at max tier
  if (currentTier === 'tier3') {
    return null;
  }

  const availableTiers = getAvailableTiers(currentTier);

  const onSubmit = async (data: TierUpgradeRequestFormData) => {
    setIsSubmitting(true);

    try {
      const response = await fetch(
        `/api/portal/vendors/${vendorId}/tier-upgrade-request`,
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
        if (response.status === 409) {
          toast.error('You already have a pending upgrade request');
        } else if (response.status === 400) {
          toast.error(result.message || 'Please fix the errors in the form');
        } else {
          toast.error('Failed to submit request. Please try again.');
        }
        setIsSubmitting(false);
        return;
      }

      // Success
      toast.success('Tier upgrade request submitted successfully!');
      form.reset();

      if (onSuccess) {
        onSuccess(result.data);
      }
    } catch (error) {
      console.error('Error submitting tier upgrade request:', error);
      toast.error('Failed to submit request. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Request Tier Upgrade</CardTitle>
        <CardDescription>
          Select the tier you would like to upgrade to and provide details about your needs
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            {/* Requested Tier Select */}
            <FormField
              control={form.control}
              name="requestedTier"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Requested Tier</FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    value={field.value}
                    disabled={isSubmitting}
                    name="requestedTier"
                  >
                    <FormControl>
                      <SelectTrigger aria-label="Requested Tier">
                        <SelectValue placeholder="Select a tier" />
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
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Vendor Notes Textarea */}
            <FormField
              control={form.control}
              name="vendorNotes"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>
                    Vendor Notes <span className="text-muted-foreground">(Optional)</span>
                  </FormLabel>
                  <FormControl>
                    <Textarea
                      {...field}
                      placeholder="Please provide details about why you need this upgrade..."
                      disabled={isSubmitting}
                      aria-label="Vendor Notes"
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
                disabled={isSubmitting}
              >
                {isSubmitting ? 'Submitting...' : 'Submit Request'}
              </Button>
            </div>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}
