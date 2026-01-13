'use client';

import { useEffect, useMemo, useCallback } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Form } from '@/components/ui/form';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter } from '@/components/ui/card';
import { Loader2, Save, X } from 'lucide-react';
import { toast } from '@/components/ui/sonner';

import {
  ExtendedProductFormSchema,
  ExtendedProductFormValues,
  defaultExtendedProductFormValues,
  TierLevel,
} from './types';

import { BasicInfoSection } from './BasicInfoSection';
import { PricingSection } from './PricingSection';
import { SeoSection } from './SeoSection';
import { BadgesSection } from './BadgesSection';
import { ImagesSection } from './ImagesSection';
import { SpecificationsSection } from './SpecificationsSection';
import { FeaturesSection } from './FeaturesSection';
import { ActionButtonsSection } from './ActionButtonsSection';
import { CategoriesTagsSection } from './CategoriesTagsSection';

import type { Product } from '@/lib/types';

interface EnhancedProductFormProps {
  product?: Product;
  vendorId: string;
  currentTier?: TierLevel;
  onSuccess: (product: Product) => void;
  onCancel: () => void;
}

/**
 * Helper to extract plain text from Lexical JSON description
 */
function extractTextFromDescription(description: unknown): string {
  if (typeof description === 'string') return description;
  if (!description || typeof description !== 'object') return '';

  try {
    const root = (description as { root?: { children?: { children?: { text?: string }[] }[] } }).root;
    if (!root?.children) return '';

    return root.children
      .flatMap((para) => para.children?.map((child) => child.text || '') || [])
      .join(' ');
  } catch {
    return '';
  }
}

/**
 * Transform Product data to form values
 * Maps from Product type (snake_case) to form values (camelCase)
 */
function productToFormValues(product: Product): Partial<ExtendedProductFormValues> {
  // Transform images to match form schema
  const images = (product.images || []).map((img) => ({
    url: img.url,
    isMain: img.isMain ?? img.is_main ?? false,
    altText: img.altText || img.alt_text || '',
    caption: img.caption || '',
  }));

  // Transform specifications
  const specifications = (product.specifications || []).map((spec) => ({
    label: spec.label,
    value: spec.value,
  }));

  // Transform features
  const features = (product.features || []).map((feat) => ({
    title: feat.title,
    description: feat.description || '',
    icon: feat.icon || '',
  }));

  // Transform action buttons (snake_case to camelCase)
  const actionButtons = (product.action_buttons || []).map((btn) => ({
    label: btn.label,
    type: btn.type,
    action: btn.action,
    actionData: btn.action_data || '',
    icon: btn.icon || '',
    order: btn.order ?? null,
  }));

  // Transform badges
  const badges = (product.badges || []).map((badge) => ({
    label: badge.label,
    type: badge.type,
    icon: badge.icon || '',
    order: badge.order ?? null,
  }));

  // Transform pricing (snake_case to camelCase)
  const pricing = product.pricing
    ? {
        displayText: product.pricing.display_text || '',
        subtitle: product.pricing.subtitle || '',
        showContactForm: product.pricing.show_contact_form ?? true,
        currency: product.pricing.currency || '',
      }
    : defaultExtendedProductFormValues.pricing;

  // Transform SEO (snake_case to camelCase)
  const seo = product.seo
    ? {
        metaTitle: product.seo.meta_title || '',
        metaDescription: product.seo.meta_description || '',
        keywords: product.seo.keywords || '',
        ogImage: '',
      }
    : defaultExtendedProductFormValues.seo;

  return {
    name: product.name || '',
    description: extractTextFromDescription(product.description),
    shortDescription: product.shortDescription || '',
    slug: product.slug || '',
    images,
    specifications,
    features,
    categories: [], // Category is a string in Product, but array in form - needs backend support
    tags: product.tags || [],
    actionButtons,
    badges,
    price: product.price || '',
    pricing,
    seo,
    published: product.published || false,
  };
}

/**
 * Count validation errors in a form state for a specific section
 */
function countSectionErrors(
  errors: Record<string, unknown>,
  fields: string[]
): number {
  return fields.reduce((count, field) => {
    if (errors[field]) {
      // Array fields might have nested errors
      const fieldError = errors[field];
      if (Array.isArray(fieldError)) {
        return count + fieldError.filter(Boolean).length;
      }
      return count + 1;
    }
    return count;
  }, 0);
}

/**
 * EnhancedProductForm - Full-page product form with all sections
 *
 * Combines all form sections:
 * - Basic Info (name, description, shortDescription, slug)
 * - Categories & Tags
 * - Images
 * - Specifications
 * - Features
 * - Pricing
 * - Action Buttons
 * - Badges
 * - SEO
 *
 * Features:
 * - React Hook Form + Zod validation
 * - Tier-gated sections
 * - Section error counting
 * - Create and edit modes
 */
export function EnhancedProductForm({
  product,
  vendorId,
  currentTier = 'tier2',
  onSuccess,
  onCancel,
}: EnhancedProductFormProps) {
  const isEdit = !!product;

  const form = useForm<ExtendedProductFormValues>({
    resolver: zodResolver(ExtendedProductFormSchema),
    defaultValues: defaultExtendedProductFormValues,
    mode: 'onChange',
  });

  const {
    control,
    watch,
    setValue,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting, isDirty },
  } = form;

  // Reset form when product changes (edit mode)
  useEffect(() => {
    if (product) {
      reset({
        ...defaultExtendedProductFormValues,
        ...productToFormValues(product),
      });
    } else {
      reset(defaultExtendedProductFormValues);
    }
  }, [product, reset]);

  // Calculate error counts for each section
  const sectionErrorCounts = useMemo(() => ({
    basicInfo: countSectionErrors(errors, ['name', 'description', 'shortDescription', 'slug']),
    categoriesTags: countSectionErrors(errors, ['categories', 'tags']),
    images: countSectionErrors(errors, ['images']),
    specifications: countSectionErrors(errors, ['specifications']),
    features: countSectionErrors(errors, ['features']),
    pricing: countSectionErrors(errors, ['price', 'pricing']),
    actionButtons: countSectionErrors(errors, ['actionButtons']),
    badges: countSectionErrors(errors, ['badges']),
    seo: countSectionErrors(errors, ['seo']),
  }), [errors]);

  const onSubmit = useCallback(async (data: ExtendedProductFormValues) => {
    try {
      const url = isEdit
        ? `/api/portal/vendors/${vendorId}/products/${product.id}`
        : `/api/portal/vendors/${vendorId}/products`;

      const method = isEdit ? 'PUT' : 'POST';

      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });

      const result = await response.json();

      if (!response.ok) {
        // Handle field-level validation errors from server
        if (result.error?.fields) {
          Object.entries(result.error.fields).forEach(([field, message]) => {
            form.setError(field as keyof ExtendedProductFormValues, {
              message: message as string,
            });
          });
        }
        throw new Error(result.error?.message || 'Failed to save product');
      }

      toast.success(isEdit ? 'Product updated successfully' : 'Product created successfully');
      onSuccess(result.data);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'An error occurred');
    }
  }, [isEdit, vendorId, product?.id, form, onSuccess]);

  return (
    <Form {...form}>
      <form onSubmit={handleSubmit(onSubmit)}>
        <Card>
          <CardContent className="pt-6 space-y-6">
            {/* Basic Information - always open, available to all tiers */}
            <BasicInfoSection
              control={control}
              watch={watch}
              setValue={setValue}
              errorCount={sectionErrorCounts.basicInfo}
            />

            {/* Categories & Tags - open by default */}
            <CategoriesTagsSection
              control={control}
              watch={watch}
              setValue={setValue}
              currentTier={currentTier}
              errorCount={sectionErrorCounts.categoriesTags}
              disabled={isSubmitting}
            />

            {/* Images */}
            <ImagesSection
              control={control}
              watch={watch}
              setValue={setValue}
              currentTier={currentTier}
              errorCount={sectionErrorCounts.images}
              disabled={isSubmitting}
            />

            {/* Specifications */}
            <SpecificationsSection
              control={control}
              currentTier={currentTier}
              errorCount={sectionErrorCounts.specifications}
              disabled={isSubmitting}
            />

            {/* Features */}
            <FeaturesSection
              control={control}
              currentTier={currentTier}
              errorCount={sectionErrorCounts.features}
              disabled={isSubmitting}
            />

            {/* Pricing */}
            <PricingSection
              control={control}
              currentTier={currentTier}
              errorCount={sectionErrorCounts.pricing}
              disabled={isSubmitting}
            />

            {/* Action Buttons - Tier 2+ */}
            <ActionButtonsSection
              control={control}
              watch={watch}
              currentTier={currentTier}
              errorCount={sectionErrorCounts.actionButtons}
              disabled={isSubmitting}
            />

            {/* Badges - Tier 2+ */}
            <BadgesSection
              control={control}
              watch={watch}
              currentTier={currentTier}
              errorCount={sectionErrorCounts.badges}
              disabled={isSubmitting}
            />

            {/* SEO */}
            <SeoSection
              control={control}
              watch={watch}
              currentTier={currentTier}
              errorCount={sectionErrorCounts.seo}
            />
          </CardContent>

          <CardFooter className="flex justify-between border-t pt-6">
            <Button
              type="button"
              variant="outline"
              onClick={onCancel}
              disabled={isSubmitting}
            >
              <X className="mr-2 h-4 w-4" />
              Cancel
            </Button>

            <div className="flex items-center gap-4">
              {isDirty && (
                <span className="text-sm text-muted-foreground">
                  Unsaved changes
                </span>
              )}
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                ) : (
                  <Save className="mr-2 h-4 w-4" />
                )}
                {isEdit ? 'Save Changes' : 'Create Product'}
              </Button>
            </div>
          </CardFooter>
        </Card>
      </form>
    </Form>
  );
}

export default EnhancedProductForm;
