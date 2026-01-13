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
import { cn } from '@/lib/utils';
import { FileText } from 'lucide-react';
import { FormSection } from './FormSection';
import type { ExtendedProductFormValues } from './types';

interface BasicInfoSectionProps {
  control: Control<ExtendedProductFormValues>;
  watch: UseFormWatch<ExtendedProductFormValues>;
  setValue: UseFormSetValue<ExtendedProductFormValues>;
  errorCount?: number;
}

/**
 * Generate URL-friendly slug from product name
 */
function generateSlug(name: string): string {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

/**
 * Character count indicator component
 */
function CharacterCount({ current, max }: { current: number; max: number }) {
  return (
    <span
      className={cn(
        'text-xs tabular-nums',
        current > max ? 'text-destructive' : 'text-muted-foreground'
      )}
    >
      {current}/{max}
    </span>
  );
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
                <FormLabel>
                  Product Name <span className="text-destructive">*</span>
                </FormLabel>
                <CharacterCount current={nameValue.length} max={255} />
              </div>
              <FormControl>
                <Input
                  placeholder="Enter product name"
                  maxLength={255}
                  {...field}
                />
              </FormControl>
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
              <FormLabel>
                Description <span className="text-destructive">*</span>
              </FormLabel>
              <FormControl>
                <Textarea
                  placeholder="Detailed product description"
                  className="min-h-[120px] resize-y"
                  {...field}
                />
              </FormControl>
              <FormDescription>
                Comprehensive description of the product. Supports plain text.
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
                <FormLabel>Short Description</FormLabel>
                <CharacterCount current={shortDescriptionValue.length} max={500} />
              </div>
              <FormControl>
                <Textarea
                  placeholder="Brief summary for product listings"
                  className="min-h-[80px] resize-y"
                  maxLength={500}
                  {...field}
                  value={field.value || ''}
                />
              </FormControl>
              <FormDescription>
                Brief summary shown in product listings and search results.
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
              <FormLabel>URL Slug</FormLabel>
              <FormControl>
                <Input
                  placeholder="product-url-slug"
                  maxLength={255}
                  {...field}
                  value={field.value || ''}
                  onChange={(e) => {
                    // Only allow lowercase letters, numbers, and hyphens
                    const value = e.target.value
                      .toLowerCase()
                      .replace(/[^a-z0-9-]/g, '');
                    field.onChange(value);
                  }}
                />
              </FormControl>
              <FormDescription>
                Auto-generated from product name. Edit to customize.
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
