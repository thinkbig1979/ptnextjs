'use client';

import React, { useState, useEffect } from 'react';
import { useAuth } from '@/lib/context/AuthContext';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { toast } from 'sonner';
import { TierGate } from '@/components/shared/TierGate';
import { Loader2, Save, Package } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { LocationsManagerCard } from '@/components/dashboard/LocationsManagerCard';

/**
 * Profile update validation schema
 * All fields are optional for PATCH semantics
 */
const profileSchema = z.object({
  companyName: z
    .string()
    .min(2, { message: 'Company name must be at least 2 characters' })
    .max(100, { message: 'Company name must be less than 100 characters' })
    .optional(),

  description: z
    .string()
    .max(500, { message: 'Description must be less than 500 characters' })
    .optional(),

  logo: z
    .string()
    .url({ message: 'Invalid logo URL' })
    .optional()
    .or(z.literal('')),

  contactEmail: z
    .string()
    .email({ message: 'Invalid email format' })
    .max(255, { message: 'Email must be less than 255 characters' })
    .optional(),

  contactPhone: z
    .string()
    .regex(/^[\d\s\-\+\(\)]+$/, { message: 'Invalid phone number format' })
    .optional()
    .or(z.literal('')),

  website: z
    .string()
    .url({ message: 'Invalid website URL' })
    .optional()
    .or(z.literal('')),

  linkedinUrl: z
    .string()
    .url({ message: 'Invalid LinkedIn URL' })
    .optional()
    .or(z.literal('')),

  twitterUrl: z
    .string()
    .url({ message: 'Invalid Twitter URL' })
    .optional()
    .or(z.literal('')),

  certifications: z
    .string()
    .max(1000, { message: 'Certifications must be less than 1000 characters' })
    .optional(),
});

type ProfileFormData = z.infer<typeof profileSchema>;

export interface VendorProfileEditorProps {
  /**
   * Optional vendor data to pre-populate form
   * If not provided, will fetch from /api/portal/vendors/profile
   */
  initialData?: any;
}

/**
 * VendorProfileEditor Component
 *
 * Profile editing form for vendors with tier-based field restrictions.
 *
 * Features:
 * - Tier-gated fields (free, tier1, tier2)
 * - Pre-populated form from current profile
 * - PATCH semantics (only changed fields sent)
 * - Loading states for fetch and save
 * - Success/error handling with toast notifications
 * - Automatic data refresh after save
 *
 * Tier Field Access:
 * - Free: companyName, description, logo, contactEmail, contactPhone
 * - Tier1+: website, linkedinUrl, twitterUrl, certifications
 * - Tier2: Products managed separately (link shown)
 */
export function VendorProfileEditor({ initialData }: VendorProfileEditorProps) {
  const router = useRouter();
  const { tier, refreshUser } = useAuth();
  const [isLoading, setIsLoading] = useState(!initialData);
  const [isSaving, setIsSaving] = useState(false);
  const [vendorData, setVendorData] = useState<any>(initialData);
  const [vendorId, setVendorId] = useState<string | null>(null);

  const form = useForm<ProfileFormData>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      companyName: '',
      description: '',
      logo: '',
      contactEmail: '',
      contactPhone: '',
      website: '',
      linkedinUrl: '',
      twitterUrl: '',
      certifications: '',
    },
  });

  /**
   * Fetch current vendor profile data
   */
  useEffect(() => {
    if (initialData) {
      populateForm(initialData);
      return;
    }

    async function fetchProfile() {
      try {
        setIsLoading(true);
        const response = await fetch('/api/portal/vendors/profile', {
          method: 'GET',
          credentials: 'include',
        });

        if (!response.ok) {
          if (response.status === 401) {
            toast.error('Please log in to access your profile');
            router.push('/vendor/login');
            return;
          }

          if (response.status === 404) {
            toast.error('Your vendor profile could not be found');
            return;
          }

          throw new Error('Failed to fetch profile');
        }

        const data = await response.json();
        setVendorData(data.vendor);
        setVendorId(data.vendor.id);
        populateForm(data.vendor);
      } catch (error) {
        console.error('Error fetching profile:', error);
        toast.error('Failed to load your profile data');
      } finally {
        setIsLoading(false);
      }
    }

    fetchProfile();
  }, [initialData, router]);

  /**
   * Populate form with vendor data
   */
  function populateForm(data: any) {
    form.reset({
      companyName: data.companyName || '',
      description: data.description || '',
      logo: data.logo || '',
      contactEmail: data.contactEmail || '',
      contactPhone: data.contactPhone || '',
      website: data.website || '',
      linkedinUrl: data.linkedinUrl || '',
      twitterUrl: data.twitterUrl || '',
      certifications: data.certifications || '',
    });
  }

  /**
   * Handle form submission
   */
  const onSubmit = async (data: ProfileFormData) => {
    if (!vendorId) {
      toast.error('Vendor ID not available');
      return;
    }

    try {
      setIsSaving(true);

      // Only send changed fields (PATCH semantics)
      const changedFields: Partial<ProfileFormData> = {};
      Object.keys(data).forEach((key) => {
        const fieldKey = key as keyof ProfileFormData;
        if (data[fieldKey] !== form.formState.defaultValues?.[fieldKey]) {
          changedFields[fieldKey] = data[fieldKey];
        }
      });

      // If no fields changed, show message and return
      if (Object.keys(changedFields).length === 0) {
        toast.info('No fields were modified');
        return;
      }

      const response = await fetch(`/api/portal/vendors/${vendorId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify(changedFields),
      });

      const result = await response.json();

      if (!response.ok) {
        // Handle tier restriction errors
        if (response.status === 403) {
          toast.error(result.error?.message || 'Upgrade required to edit these fields');
          return;
        }

        // Handle validation errors
        if (response.status === 400) {
          if (result.error?.fields) {
            Object.entries(result.error.fields).forEach(([field, message]) => {
              form.setError(field as keyof ProfileFormData, {
                type: 'manual',
                message: message as string,
              });
            });
          }

          toast.error(result.error?.message || 'Please check your form inputs');
          return;
        }

        throw new Error(result.error?.message || 'Failed to update profile');
      }

      // Success
      toast.success(result.data?.message || 'Your profile has been updated successfully');

      // Update local state with new data
      setVendorData(result.data.vendor);
      populateForm(result.data.vendor);

      // Refresh user context (in case tier or other fields changed)
      await refreshUser();
    } catch (error) {
      console.error('Error updating profile:', error);
      toast.error(error instanceof Error ? error.message : 'Failed to update profile');
    } finally {
      setIsSaving(false);
    }
  };

  /**
   * Show loading state
   */
  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <Loader2 className="h-12 w-12 animate-spin text-accent mx-auto mb-4" />
          <p className="text-muted-foreground">Loading profile data...</p>
        </div>
      </div>
    );
  }

  const description = form.watch('description');
  const certifications = form.watch('certifications');

  return (
    <>
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
        {/* Basic Information Section (Free Tier) */}
        <Card>
          <CardHeader>
            <CardTitle>Basic Information</CardTitle>
            <CardDescription>
              Essential company details visible to all visitors
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Company Name */}
            <FormField
              control={form.control}
              name="companyName"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Company Name</FormLabel>
                  <FormControl>
                    <Input
                      type="text"
                      placeholder="Your Company Ltd"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Description */}
            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Description</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Tell visitors about your company..."
                      className="resize-none min-h-[120px]"
                      {...field}
                    />
                  </FormControl>
                  <FormDescription>
                    {description?.length || 0} / 500 characters
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Logo URL */}
            <FormField
              control={form.control}
              name="logo"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Logo URL</FormLabel>
                  <FormControl>
                    <Input
                      type="url"
                      placeholder="https://example.com/logo.png"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Contact Email */}
            <FormField
              control={form.control}
              name="contactEmail"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Contact Email</FormLabel>
                  <FormControl>
                    <Input
                      type="email"
                      placeholder="contact@example.com"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Contact Phone */}
            <FormField
              control={form.control}
              name="contactPhone"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Contact Phone</FormLabel>
                  <FormControl>
                    <Input
                      type="tel"
                      placeholder="+1 (555) 123-4567"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </CardContent>
        </Card>

        {/* Enhanced Profile Section (Tier 1+) */}
        <TierGate requiredTier="tier1">
          <Card>
            <CardHeader>
              <CardTitle>Enhanced Profile</CardTitle>
              <CardDescription>
                Additional information for tier 1+ subscribers
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Website */}
              <FormField
                control={form.control}
                name="website"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Website</FormLabel>
                    <FormControl>
                      <Input
                        type="url"
                        placeholder="https://example.com"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* LinkedIn URL */}
              <FormField
                control={form.control}
                name="linkedinUrl"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>LinkedIn URL</FormLabel>
                    <FormControl>
                      <Input
                        type="url"
                        placeholder="https://linkedin.com/company/..."
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Twitter URL */}
              <FormField
                control={form.control}
                name="twitterUrl"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Twitter URL</FormLabel>
                    <FormControl>
                      <Input
                        type="url"
                        placeholder="https://twitter.com/..."
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Certifications */}
              <FormField
                control={form.control}
                name="certifications"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Certifications</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="List your certifications and accreditations..."
                        className="resize-none min-h-[120px]"
                        {...field}
                      />
                    </FormControl>
                    <FormDescription>
                      {certifications?.length || 0} / 1000 characters
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </CardContent>
          </Card>
        </TierGate>

        {/* Products Section (Tier 2) */}
        {tier === 'tier2' && (
          <Card>
            <CardHeader>
              <CardTitle>Product Management</CardTitle>
              <CardDescription>
                Manage your product catalog (Tier 2 feature)
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground mb-4">
                Products are managed separately from your profile.
              </p>
              <Button
                type="button"
                variant="outline"
                onClick={() => router.push('/vendor/dashboard/products')}
              >
                <Package className="mr-2 h-4 w-4" />
                Manage Products
              </Button>
            </CardContent>
          </Card>
        )}

        {/* Save Button */}
        <div className="flex justify-end gap-4">
          <Button
            type="button"
            variant="outline"
            onClick={() => populateForm(vendorData)}
            disabled={isSaving}
          >
            Reset Changes
          </Button>
          <Button
            type="submit"
            disabled={isSaving}
          >
            {isSaving ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Saving...
              </>
            ) : (
              <>
                <Save className="mr-2 h-4 w-4" />
                Save Profile
              </>
            )}
          </Button>
        </div>
      </form>
    </Form>

    {/* Locations Manager Card - Separate from form */}
    {vendorData && (
      <div className="mt-6">
        <LocationsManagerCard
          vendor={{
            id: vendorId || '',
            name: vendorData.companyName || vendorData.name || '',
            tier: tier || 'free',
            locations: vendorData.locations || [],
          }}
          onUpdate={(updatedLocations) => {
            setVendorData((prev: any) => ({
              ...prev,
              locations: updatedLocations,
            }));
          }}
        />
      </div>
    )}
  </>
  );
}
