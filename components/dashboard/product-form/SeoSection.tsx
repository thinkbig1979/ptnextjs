'use client';

import type { Control, UseFormWatch } from 'react-hook-form';
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
import { Search } from 'lucide-react';
import { cn } from '@/lib/utils';
import { FormSection } from './FormSection';
import type { ExtendedProductFormValues, TierLevel } from './types';

interface SeoSectionProps {
  control: Control<ExtendedProductFormValues>;
  watch: UseFormWatch<ExtendedProductFormValues>;
  currentTier?: TierLevel;
  errorCount?: number;
  disabled?: boolean;
}

/**
 * Character counter with color states for SEO best practices
 * - Green (muted): Under recommended (good)
 * - Yellow: At recommended limit (warning)
 * - Red: Over maximum (error)
 */
function CharacterCounter({
  current,
  recommended,
  max,
}: {
  current: number;
  recommended: number;
  max: number;
}) {
  const getColor = () => {
    if (current > max) return 'text-destructive';
    if (current > recommended) return 'text-yellow-600 dark:text-yellow-500';
    return 'text-muted-foreground';
  };

  return (
    <span className={cn('text-xs tabular-nums', getColor())}>
      {current}/{recommended}
      {current > recommended && ` (max: ${max})`}
    </span>
  );
}

/**
 * SeoSection - Search engine optimization settings
 *
 * Fields:
 * - seo.metaTitle - Page title for search engines (50-60 chars recommended)
 * - seo.metaDescription - Description for search results (150-160 chars recommended)
 * - seo.keywords - Comma-separated keywords
 *
 * Includes a live preview of how the page will appear in search results.
 * Requires tier2 access.
 */
export function SeoSection({
  control,
  watch,
  currentTier,
  errorCount = 0,
  disabled = false,
}: SeoSectionProps) {
  const metaTitle = watch('seo.metaTitle') || '';
  const metaDescription = watch('seo.metaDescription') || '';
  const productName = watch('name') || '';
  const productSlug = watch('slug') || '';

  return (
    <FormSection
      title="SEO Settings"
      description="Search engine optimization"
      icon={<Search className="h-5 w-5" />}
      tierRequired="tier2"
      currentTier={currentTier}
      errorCount={errorCount}
      testId="seo-section"
    >
      <div className="space-y-6">
        {/* Meta Title */}
        <FormField
          control={control}
          name="seo.metaTitle"
          render={({ field }) => (
            <FormItem>
              <div className="flex justify-between items-center">
                <FormLabel>Meta Title</FormLabel>
                <CharacterCounter
                  current={metaTitle.length}
                  recommended={60}
                  max={100}
                />
              </div>
              <FormControl>
                <Input
                  placeholder={productName || 'Enter meta title...'}
                  maxLength={100}
                  disabled={disabled}
                  {...field}
                  value={field.value || ''}
                />
              </FormControl>
              <FormDescription>
                Leave empty to use product name. Recommended: 50-60 characters.
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Meta Description */}
        <FormField
          control={control}
          name="seo.metaDescription"
          render={({ field }) => (
            <FormItem>
              <div className="flex justify-between items-center">
                <FormLabel>Meta Description</FormLabel>
                <CharacterCounter
                  current={metaDescription.length}
                  recommended={160}
                  max={300}
                />
              </div>
              <FormControl>
                <Textarea
                  placeholder="Describe your product for search engine results..."
                  className="resize-none min-h-[80px]"
                  rows={3}
                  maxLength={300}
                  disabled={disabled}
                  {...field}
                  value={field.value || ''}
                />
              </FormControl>
              <FormDescription>
                Shown in search engine results. Recommended: 150-160 characters.
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Keywords */}
        <FormField
          control={control}
          name="seo.keywords"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Keywords</FormLabel>
              <FormControl>
                <Input
                  placeholder="navigation, GPS, marine electronics, superyacht"
                  maxLength={500}
                  disabled={disabled}
                  {...field}
                  value={field.value || ''}
                />
              </FormControl>
              <FormDescription>
                Comma-separated keywords for search optimization.
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* SEO Preview */}
        <div className="rounded-lg border p-4 bg-muted/50">
          <p className="text-xs text-muted-foreground mb-2">Search Result Preview:</p>
          <div className="space-y-1">
            <p className="text-blue-600 dark:text-blue-400 text-lg hover:underline cursor-pointer truncate">
              {metaTitle || productName || 'Product Title'}
            </p>
            <p className="text-green-700 dark:text-green-500 text-sm truncate">
              www.example.com/products/{productSlug || 'product-slug'}
            </p>
            <p className="text-sm text-muted-foreground line-clamp-2">
              {metaDescription || 'Your product description will appear here in search results...'}
            </p>
          </div>
        </div>
      </div>
    </FormSection>
  );
}

export default SeoSection;
