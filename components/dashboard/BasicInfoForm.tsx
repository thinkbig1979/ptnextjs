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
  const { updateVendor, markDirty } = useVendorDashboard();

  const {
    register,
    handleSubmit,
    formState: { errors, isDirty, isSubmitting },
    watch,
    reset,
  } = useForm<BasicInfoFormData>({
    resolver: zodResolver(basicInfoSchema),
    defaultValues: {
      companyName: vendor.name || '',
      slug: vendor.slug || '',
      description: vendor.description || '',
      logo: vendor.logo || '',
      contactEmail: vendor.contactEmail || '',
      contactPhone: vendor.contactPhone || '',
    },
  });

  const description = watch('description');
  const descriptionLength = description?.length || 0;

  // Mark form as dirty when values change
  useEffect(() => {
    markDirty(isDirty);
  }, [isDirty, markDirty]);

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
    }

    // Reset form dirty state
    reset(data);
  };

  return (
    <form onSubmit={handleSubmit(handleFormSubmit)}>
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
              placeholder="Your Company Name"
              className={errors.companyName ? 'border-red-500' : ''}
            />
            {errors.companyName && (
              <p className="text-sm text-red-500">{errors.companyName.message}</p>
            )}
          </div>

          {/* Slug (Read-only) */}
          <div className="space-y-2">
            <Label htmlFor="slug">URL Slug</Label>
            <Input
              id="slug"
              {...register('slug')}
              disabled
              className="bg-gray-100 dark:bg-gray-800 cursor-not-allowed"
            />
            <p className="text-xs text-gray-500">
              Your profile will be available at: /vendors/{watch('slug')}
            </p>
            {errors.slug && (
              <p className="text-sm text-red-500">{errors.slug.message}</p>
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
              placeholder="Brief description of your company (10-500 characters)"
              rows={4}
              className={errors.description ? 'border-red-500' : ''}
            />
            <div className="flex justify-between items-center">
              <div>
                {errors.description && (
                  <p className="text-sm text-red-500">{errors.description.message}</p>
                )}
              </div>
              <p className={`text-xs ${descriptionLength > 500 ? 'text-red-500' : 'text-gray-500'}`}>
                {descriptionLength} / 500
              </p>
            </div>
          </div>

          {/* Logo URL */}
          <div className="space-y-2">
            <Label htmlFor="logo">Logo URL</Label>
            <Input
              id="logo"
              type="url"
              {...register('logo')}
              placeholder="https://example.com/logo.png"
              className={errors.logo ? 'border-red-500' : ''}
            />
            {errors.logo && (
              <p className="text-sm text-red-500">{errors.logo.message}</p>
            )}
            {watch('logo') && (
              <div className="mt-2 p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                <p className="text-xs text-gray-500 mb-2">Logo Preview:</p>
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
              placeholder="contact@company.com"
              className={errors.contactEmail ? 'border-red-500' : ''}
            />
            {errors.contactEmail && (
              <p className="text-sm text-red-500">{errors.contactEmail.message}</p>
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
              className={errors.contactPhone ? 'border-red-500' : ''}
            />
            {errors.contactPhone && (
              <p className="text-sm text-red-500">{errors.contactPhone.message}</p>
            )}
          </div>
        </CardContent>

        <CardFooter>
          <Button
            type="submit"
            disabled={!isDirty || isSubmitting}
            className="w-full sm:w-auto"
          >
            {isSubmitting ? (
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
