'use client';

import { useEffect } from 'react';
import type { Control, UseFormWatch, UseFormSetValue } from 'react-hook-form';
import {
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { FileText } from 'lucide-react';
import { FormSection } from './FormSection';
import { HelpTooltip, CharacterCounter } from '@/components/help';
import type { ExtendedProductFormValues } from './types';

// Hoisted RegExp patterns for slug generation (avoids recreation on each call)
const NON_ALPHANUMERIC_REGEX = /[^a-z0-9]+/g;
const LEADING_TRAILING_DASH_REGEX = /^-+|-+$/g;
const SLUG_VALIDATION_REGEX = /[^a-z0-9-]/g;

interface BasicInfoSectionProps {
  control: Control<ExtendedProductFormValues>;
  watch: UseFormWatch<ExtendedProductFormValues>;
  setValue: UseFormSetValue<ExtendedProductFormValues>;
  errorCount?: number;
}

/**
 * Generate URL-friendly slug from product name (uses hoisted regex)
 */
function generateSlug(name: string): string {
  return name
    .toLowerCase()
    .replace(NON_ALPHANUMERIC_REGEX, '-')
    .replace(LEADING_TRAILING_DASH_REGEX, '');
}

/**
 * BasicInfoSection - Basic product information fields
 *
 * Fields:
 * - name (required) - Product name with character counter
 * - description (required) - Full product description
 * - shortDescription (optional) - Brief summary for listings
 * - slug (auto-generated, editable) - URL-friendly identifier
 *
 * This section is always expanded and available to all tiers.
 */
export function BasicInfoSection({
  control,
  watch,
  setValue,
  errorCount = 0,
}: BasicInfoSectionProps) {
  // Auto-generate slug when name changes
  useEffect(() => {
    const subscription = watch((value, { name: fieldName }) => {
      if (fieldName === 'name' && value.name) {
        // Only auto-generate if slug is empty or matches previous auto-generated value
        const currentSlug = value.slug;
        const newSlug = generateSlug(value.name);

        // Auto-update slug if it's empty or if it was auto-generated (not manually edited)
        if (!currentSlug || currentSlug === generateSlug(value.name || '')) {
          setValue('slug', newSlug, { shouldValidate: false });
        }
      }
    });
    return () => subscription.unsubscribe();
  }, [watch, setValue]);

  const nameValue = watch('name') || '';
  const shortDescriptionValue = watch('shortDescription') || '';

  return (
    <FormSection
      title="Basic Information"
      description="Essential product details"
      icon={<FileText className="h-5 w-5" />}
      defaultOpen={true}
      errorCount={errorCount}
      testId="basic-info-section"
    >
      <div className="space-y-4">
        {/* Name Field */}
        <FormField
          control={control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1.5">
                  <FormLabel>
                    Product Name <span className="text-destructive">*</span>
                  </FormLabel>
                  <HelpTooltip
                    content="Clear, descriptive name customers will search for. Use specific terms that describe your product."
                    title="Product Name"
                    iconSize={14}
                  />
                </div>
                <CharacterCounter current={nameValue.length} max={255} />
              </div>
              <FormControl>
                <Input
                  placeholder="Premium Marine Navigation System X5"
                  maxLength={255}
                  {...field}
                />
              </FormControl>
              <FormDescription>
                The name as it will appear in search results and listings.
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Description Field */}
        <FormField
          control={control}
          name="description"
          render={({ field }) => (
            <FormItem>
              <div className="flex items-center gap-1.5">
                <FormLabel>
                  Description <span className="text-destructive">*</span>
                </FormLabel>
                <HelpTooltip
                  content="Comprehensive description including key features, benefits, and use cases. This is the full description shown on the product page."
                  title="Full Description"
                  iconSize={14}
                />
              </div>
              <FormControl>
                <Textarea
                  placeholder="Describe your product in detail including features, specifications, and benefits..."
                  className="min-h-[120px] resize-y"
                  {...field}
                />
              </FormControl>
              <FormDescription>
                Detailed description shown on the product page. Include key features and benefits.
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Short Description Field */}
        <FormField
          control={control}
          name="shortDescription"
          render={({ field }) => (
            <FormItem>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1.5">
                  <FormLabel>Short Description</FormLabel>
                  <HelpTooltip
                    content="Appears in product cards and search results. Keep it concise and impactful to attract customer attention."
                    title="Short Description"
                    iconSize={14}
                  />
                </div>
                <CharacterCounter current={shortDescriptionValue.length} max={500} />
              </div>
              <FormControl>
                <Textarea
                  placeholder="A brief, compelling summary of your product..."
                  className="min-h-[80px] resize-y"
                  maxLength={500}
                  {...field}
                  value={field.value || ''}
                />
              </FormControl>
              <FormDescription>
                Brief summary for listings and search results (max 500 characters).
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Slug Field */}
        <FormField
          control={control}
          name="slug"
          render={({ field }) => (
            <FormItem>
              <div className="flex items-center gap-1.5">
                <FormLabel>URL Slug</FormLabel>
                <HelpTooltip
                  content="URL path for this product. Auto-generated from the name but can be customized. Use lowercase letters, numbers, and hyphens only."
                  title="URL Slug"
                  iconSize={14}
                />
              </div>
              <FormControl>
                <Input
                  placeholder="premium-marine-navigation-system-x5"
                  maxLength={255}
                  {...field}
                  value={field.value || ''}
                  onChange={(e) => {
                    // Only allow lowercase letters, numbers, and hyphens (uses hoisted regex)
                    const value = e.target.value
                      .toLowerCase()
                      .replace(SLUG_VALIDATION_REGEX, '');
                    field.onChange(value);
                  }}
                />
              </FormControl>
              <FormDescription>
                Auto-generated from product name. Edit to customize the URL path.
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />
      </div>
    </FormSection>
  );
}

export default BasicInfoSection;
