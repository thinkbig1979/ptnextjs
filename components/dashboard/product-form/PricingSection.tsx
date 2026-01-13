'use client';

import type { Control } from 'react-hook-form';
import {
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { DollarSign } from 'lucide-react';
import { FormSection } from './FormSection';
import type { ExtendedProductFormValues, TierLevel } from './types';

interface PricingSectionProps {
  control: Control<ExtendedProductFormValues>;
  currentTier?: TierLevel;
  errorCount?: number;
  disabled?: boolean;
}

const CURRENCIES = [
  { value: 'USD', label: 'USD - US Dollar' },
  { value: 'EUR', label: 'EUR - Euro' },
  { value: 'GBP', label: 'GBP - British Pound' },
  { value: 'CHF', label: 'CHF - Swiss Franc' },
  { value: 'AUD', label: 'AUD - Australian Dollar' },
  { value: 'CAD', label: 'CAD - Canadian Dollar' },
] as const;

/**
 * PricingSection - Product pricing configuration
 *
 * Fields:
 * - price - Main price display text
 * - pricing.displayText - Formatted pricing text
 * - pricing.subtitle - Additional pricing context
 * - pricing.currency - Currency code
 * - pricing.showContactForm - Toggle for contact form display
 *
 * Requires tier2 access.
 */
export function PricingSection({
  control,
  currentTier,
  errorCount = 0,
  disabled = false,
}: PricingSectionProps) {
  return (
    <FormSection
      title="Pricing"
      description="Configure product pricing display"
      icon={<DollarSign className="h-5 w-5" />}
      tierRequired="tier2"
      currentTier={currentTier}
      errorCount={errorCount}
      testId="pricing-section"
    >
      <div className="space-y-6">
        {/* Price Display Text */}
        <FormField
          control={control}
          name="price"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Price Display Text</FormLabel>
              <FormControl>
                <Input
                  placeholder='e.g., "From $12,500" or "Contact for Quote"'
                  maxLength={100}
                  disabled={disabled}
                  {...field}
                  value={field.value || ''}
                />
              </FormControl>
              <FormDescription>
                How the price appears on your product page
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Two-column layout for subtitle and currency */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FormField
            control={control}
            name="pricing.subtitle"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Pricing Subtitle</FormLabel>
                <FormControl>
                  <Input
                    placeholder="e.g., Installed price"
                    maxLength={200}
                    disabled={disabled}
                    {...field}
                    value={field.value || ''}
                  />
                </FormControl>
                <FormDescription>Additional context for the price</FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={control}
            name="pricing.currency"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Currency</FormLabel>
                <Select
                  onValueChange={field.onChange}
                  value={field.value || ''}
                  disabled={disabled}
                >
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select currency" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {CURRENCIES.map(({ value, label }) => (
                      <SelectItem key={value} value={value}>
                        {label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        {/* Contact Form Toggle */}
        <FormField
          control={control}
          name="pricing.showContactForm"
          render={({ field }) => (
            <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
              <div className="space-y-0.5">
                <FormLabel className="text-base">Show Contact Form</FormLabel>
                <FormDescription>
                  Display a contact form for pricing inquiries
                </FormDescription>
              </div>
              <FormControl>
                <Switch
                  checked={field.value ?? true}
                  onCheckedChange={field.onChange}
                  disabled={disabled}
                />
              </FormControl>
            </FormItem>
          )}
        />
      </div>
    </FormSection>
  );
}

export default PricingSection;
