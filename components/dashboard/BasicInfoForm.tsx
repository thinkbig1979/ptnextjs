'use client';

import React, { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Loader2, Save } from 'lucide-react';
import { basicInfoSchema, type BasicInfoFormData } from '@/lib/validation/vendorSchemas';
import { Vendor } from '@/lib/types';
import { useVendorDashboard } from '@/lib/context/VendorDashboardContext';
import { HelpTooltip, CharacterCounter } from '@/components/help';

export interface BasicInfoFormProps {
  vendor: Vendor;
  onSubmit?: (data: BasicInfoFormData) => Promise<void>;
}

/**
 * BasicInfoForm Component
 *
 * Form for editing core vendor information (available to all tiers)
 *
 * Fields:
 * - Company Name
 * - Slug (read-only)
 * - Description (500 char max)
 * - Logo URL
 * - Contact Email
 * - Contact Phone
 */
export function BasicInfoForm({ vendor, onSubmit }: BasicInfoFormProps) {
  const { updateVendor, saveVendor, markDirty, isSaving } = useVendorDashboard();

  const {
    register,
    handleSubmit,
    formState: { errors, isDirty, isSubmitting, isValid },
    watch,
    reset,
    trigger,
  } = useForm<BasicInfoFormData>({
    resolver: zodResolver(basicInfoSchema),
    mode: 'onChange', // Validate on change to expose errors immediately
    defaultValues: {
      companyName: vendor.name || '',
      slug: vendor.slug || '',
      description: vendor.description || '',
      logo: vendor.logo || undefined, // undefined for optional fields to skip validation
      contactEmail: vendor.contactEmail || '',
      contactPhone: vendor.contactPhone || undefined, // undefined for optional fields
    },
  });

  const description = watch('description');
  const descriptionLength = description?.length || 0;

  // Mark form as dirty when values change
  useEffect(() => {
    markDirty(isDirty);
  }, [isDirty, markDirty]);

  /**
   * CRITICAL FIX: Reset form when vendor data changes
   *
   * This ensures that React Hook Form's isDirty detection works correctly
   * when the vendor prop updates (e.g., from async context updates).
   * Without this, the form's baseline doesn't match the actual vendor data,
   * causing isDirty to incorrectly report false even when fields are modified.
   */
  useEffect(() => {
    reset({
      companyName: vendor.name || '',
      slug: vendor.slug || '',
      description: vendor.description || '',
      logo: vendor.logo || undefined, // undefined for optional fields
      contactEmail: vendor.contactEmail || '',
      contactPhone: vendor.contactPhone || undefined, // undefined for optional fields
    });
    // Clear dirty flag when vendor resets
    markDirty(false);
  }, [
    vendor.id,
    vendor.name,
    vendor.slug,
    vendor.description,
    vendor.logo,
    vendor.contactEmail,
    vendor.contactPhone,
    reset,
    markDirty,
  ]);

  const handleFormSubmit = async (data: BasicInfoFormData) => {
    if (onSubmit) {
      await onSubmit(data);
    } else {
      // Update vendor in context
      updateVendor({
        name: data.companyName,
        slug: data.slug,
        description: data.description,
        logo: data.logo || undefined,
        contactEmail: data.contactEmail,
        contactPhone: data.contactPhone || undefined,
      });

      // Save to backend
      await saveVendor();
    }

    // Reset form dirty state
    reset(data);
  };

  const handleFormError = (formErrors: Record<string, { message?: string }>): void => {
    if (process.env.NODE_ENV !== 'production') {
      console.error('[BasicInfoForm] Validation failed:', formErrors);
    }
  };

  return (
    <form onSubmit={handleSubmit(handleFormSubmit, handleFormError)}>
      <Card>
        <CardHeader>
          <CardTitle>Basic Information</CardTitle>
          <CardDescription>
            Core company details visible to all visitors.
          </CardDescription>
        </CardHeader>

        <CardContent className="space-y-6">
          {/* Company Name */}
          <div className="space-y-2">
            <Label htmlFor="companyName">
              Company Name <span className="text-red-500">*</span>
            </Label>
            <Input
              id="companyName"
              {...register('companyName')}
              placeholder="e.g., Acme Marine Services"
              className={errors.companyName ? 'border-destructive' : ''}
            />
            <p className="text-xs text-muted-foreground">
              Your official business name as customers will see it.
            </p>
            {errors.companyName && (
              <p className="text-sm text-destructive">{errors.companyName.message}</p>
            )}
          </div>

          {/* Slug (Read-only) */}
          <div className="space-y-2">
            <div className="flex items-center gap-1.5">
              <Label htmlFor="slug">URL Slug</Label>
              <HelpTooltip
                content="Your unique URL path. This cannot be changed after creation and is used to identify your company in web addresses."
                title="URL Slug"
                iconSize={14}
              />
            </div>
            <Input
              id="slug"
              {...register('slug')}
              disabled
              className="bg-muted dark:bg-muted cursor-not-allowed"
            />
            <p className="text-xs text-muted-foreground">
              Your profile will be available at: /vendors/{watch('slug')}
            </p>
            {errors.slug && (
              <p className="text-sm text-destructive">{errors.slug.message}</p>
            )}
          </div>

          {/* Description */}
          <div className="space-y-2">
            <Label htmlFor="description">
              Company Description <span className="text-red-500">*</span>
            </Label>
            <Textarea
              id="description"
              {...register('description')}
              placeholder="Describe your company and the services you provide..."
              rows={4}
              className={errors.description ? 'border-destructive' : ''}
            />
            <div className="flex justify-between items-center">
              <p className="text-xs text-muted-foreground">
                Brief summary shown in search results and profile header.
              </p>
              <CharacterCounter
                current={descriptionLength}
                min={10}
                max={500}
              />
            </div>
            {errors.description && (
              <p className="text-sm text-destructive">{errors.description.message}</p>
            )}
          </div>

          {/* Logo URL */}
          <div className="space-y-2">
            <div className="flex items-center gap-1.5">
              <Label htmlFor="logo">Logo URL</Label>
              <HelpTooltip
                content="Direct link to your company logo image. For best results, use a square image (recommended: 400x400px PNG or JPG)."
                title="Logo URL"
                iconSize={14}
              />
            </div>
            <Input
              id="logo"
              type="url"
              {...register('logo')}
              placeholder="https://example.com/your-logo.png"
              className={errors.logo ? 'border-destructive' : ''}
            />
            <p className="text-xs text-muted-foreground">
              Enter a direct link to your company logo image.
            </p>
            {errors.logo && (
              <p className="text-sm text-destructive">{errors.logo.message}</p>
            )}
            {watch('logo') && (
              <div className="mt-2 p-4 bg-muted dark:bg-muted rounded-lg">
                <p className="text-xs text-muted-foreground mb-2">Logo Preview:</p>
                <img
                  src={watch('logo') || ''}
                  alt="Logo preview"
                  className="h-16 w-auto object-contain"
                  onError={(e) => {
                    (e.target as HTMLImageElement).style.display = 'none';
                  }}
                />
              </div>
            )}
          </div>

          {/* Contact Email */}
          <div className="space-y-2">
            <Label htmlFor="contactEmail">
              Contact Email <span className="text-red-500">*</span>
            </Label>
            <Input
              id="contactEmail"
              type="email"
              {...register('contactEmail')}
              placeholder="contact@yourcompany.com"
              className={errors.contactEmail ? 'border-destructive' : ''}
            />
            <p className="text-xs text-muted-foreground">
              Public email displayed on your profile for customer inquiries.
            </p>
            {errors.contactEmail && (
              <p className="text-sm text-destructive">{errors.contactEmail.message}</p>
            )}
          </div>

          {/* Contact Phone */}
          <div className="space-y-2">
            <Label htmlFor="contactPhone">Contact Phone</Label>
            <Input
              id="contactPhone"
              type="tel"
              {...register('contactPhone')}
              placeholder="+1 (555) 123-4567"
              className={errors.contactPhone ? 'border-destructive' : ''}
            />
            <p className="text-xs text-muted-foreground">
              Business phone for customer inquiries (optional).
            </p>
            {errors.contactPhone && (
              <p className="text-sm text-destructive">{errors.contactPhone.message}</p>
            )}
          </div>
        </CardContent>

        <CardFooter>
          <Button
            type="submit"
            disabled={!isDirty || isSubmitting || isSaving}
            className="w-full sm:w-auto"
          >
            {(isSubmitting || isSaving) ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Saving...
              </>
            ) : (
              <>
                <Save className="mr-2 h-4 w-4" />
                Save Changes
              </>
            )}
          </Button>
        </CardFooter>
      </Card>
    </form>
  );
}

export default BasicInfoForm;
