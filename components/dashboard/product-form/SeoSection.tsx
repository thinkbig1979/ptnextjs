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
import { Search, Info } from 'lucide-react';
import { cn } from '@/lib/utils';
import { FormSection } from './FormSection';
import { HelpTooltip, CharacterCounter } from '@/components/help';
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
function SeoCharacterCounter({
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
        {/* SEO Guidelines Info Box */}
        <div className="flex items-start gap-2 p-3 bg-muted/50 rounded-lg text-sm text-muted-foreground">
          <Info className="h-4 w-4 mt-0.5 flex-shrink-0" />
          <div>
            <p className="font-medium text-foreground">SEO Best Practices</p>
            <p>Meta titles appear in browser tabs and search results. Meta descriptions show below the title in Google. Keep them concise and compelling to improve click-through rates.</p>
          </div>
        </div>

        {/* Meta Title */}
        <FormField
          control={control}
          name="seo.metaTitle"
          render={({ field }) => (
            <FormItem>
              <div className="flex justify-between items-center">
                <div className="flex items-center gap-1.5">
                  <FormLabel>Meta Title</FormLabel>
                  <HelpTooltip
                    content="Appears in browser tabs and search engine results. Keep under 60 characters for full display in Google. Include your primary keyword near the beginning."
                    title="Meta Title"
                    iconSize={14}
                  />
                </div>
                <SeoCharacterCounter
                  current={metaTitle.length}
                  recommended={60}
                  max={100}
                />
              </div>
              <FormControl>
                <Input
                  placeholder={productName || 'Premium Navigation System X5 | Marine Electronics'}
                  maxLength={100}
                  disabled={disabled}
                  {...field}
                  value={field.value || ''}
                />
              </FormControl>
              <FormDescription>
                Leave empty to use product name. Recommended: 50-60 characters for full display.
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
                <div className="flex items-center gap-1.5">
                  <FormLabel>Meta Description</FormLabel>
                  <HelpTooltip
                    content="The description shown in Google search results. Make it compelling to encourage clicks. Include relevant keywords naturally. Keep under 155 characters for full display."
                    title="Meta Description"
                    iconSize={14}
                  />
                </div>
                <SeoCharacterCounter
                  current={metaDescription.length}
                  recommended={160}
                  max={300}
                />
              </div>
              <FormControl>
                <Textarea
                  placeholder="Professional-grade marine navigation with GPS, AIS, and radar integration. Trusted by superyacht captains worldwide."
                  className="resize-none min-h-[80px]"
                  rows={3}
                  maxLength={300}
                  disabled={disabled}
                  {...field}
                  value={field.value || ''}
                />
              </FormControl>
              <FormDescription>
                Shown in search engine results. Recommended: 150-160 characters for full display.
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
              <div className="flex items-center gap-1.5">
                <FormLabel>Keywords</FormLabel>
                <HelpTooltip
                  content="Comma-separated keywords for search optimization. Include terms customers use when searching. While less important for Google, keywords help with internal search and related products."
                  title="SEO Keywords"
                  iconSize={14}
                />
              </div>
              <FormControl>
                <Input
                  placeholder="marine navigation, GPS, yacht electronics, AIS, radar"
                  maxLength={500}
                  disabled={disabled}
                  {...field}
                  value={field.value || ''}
                />
              </FormControl>
              <FormDescription>
                Comma-separated keywords for search optimization and product discovery.
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* SEO Preview */}
        <div className="rounded-lg border p-4 bg-muted/50">
          <p className="text-xs text-muted-foreground mb-3 font-medium">Google Search Result Preview:</p>
          <div className="space-y-1 bg-background p-3 rounded border">
            <p className="text-blue-600 dark:text-blue-400 text-lg hover:underline cursor-pointer truncate font-medium">
              {metaTitle || productName || 'Product Title'}
            </p>
            <p className="text-green-700 dark:text-green-500 text-sm truncate">
              www.example.com/products/{productSlug || 'product-slug'}
            </p>
            <p className="text-sm text-muted-foreground line-clamp-2">
              {metaDescription || 'Your product description will appear here in search results. A compelling description increases click-through rates.'}
            </p>
          </div>
        </div>
      </div>
    </FormSection>
  );
}

export default SeoSection;
