'use client';

import React, { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Loader2, Save, Plus, X, Calendar, TrendingUp, Video, Globe } from 'lucide-react';
import { brandStorySchema, type BrandStoryFormData } from '@/lib/validation/vendorSchemas';
import { Vendor } from '@/lib/types';
import { useVendorDashboard } from '@/lib/context/VendorDashboardContext';
import { TierService } from '@/lib/services/TierService';
import { TierUpgradePrompt } from '@/components/dashboard/TierUpgradePrompt';
import { YearsInBusinessDisplay } from '@/components/vendors/YearsInBusinessDisplay';

export interface BrandStoryFormProps {
  vendor: Vendor;
  onSubmit?: (data: BrandStoryFormData) => Promise<void>;
}

/**
 * BrandStoryForm Component
 *
 * Form for editing brand story and extended company information (Tier 1+)
 *
 * Features:
 * - Social media links (website, LinkedIn, Twitter)
 * - Founded year with computed years in business display
 * - Social proof metrics (projects, employees, followers, satisfaction scores)
 * - Video introduction fields
 * - Long description
 * - Service areas array manager
 * - Company values array manager
 * - Tier 1+ access control with upgrade prompt
 */
export function BrandStoryForm({ vendor, onSubmit }: BrandStoryFormProps) {
  const { updateVendor, markDirty } = useVendorDashboard();
  const [showUpgradePrompt, setShowUpgradePrompt] = useState(false);

  const tierLevel = TierService.getTierLevel(vendor.tier);
  const hasAccess = tierLevel >= 1; // Tier 1+ required

  const {
    register,
    handleSubmit,
    formState: { errors, isDirty, isSubmitting },
    watch,
    reset,
  } = useForm<BrandStoryFormData>({
    resolver: zodResolver(brandStorySchema),
    defaultValues: {
      website: vendor.website || '',
      linkedinUrl: vendor.linkedinUrl || '',
      twitterUrl: vendor.twitterUrl || '',
      foundedYear: vendor.foundedYear || null,
      longDescription: vendor.longDescription || '',
      totalProjects: vendor.totalProjects || null,
      employeeCount: vendor.employeeCount || null,
      linkedinFollowers: vendor.linkedinFollowers || null,
      instagramFollowers: vendor.instagramFollowers || null,
      clientSatisfactionScore: vendor.clientSatisfactionScore || null,
      repeatClientPercentage: vendor.repeatClientPercentage || null,
      videoUrl: vendor.videoUrl || '',
      videoThumbnail: vendor.videoThumbnail || '',
      videoDuration: vendor.videoDuration || '',
      videoTitle: vendor.videoTitle || '',
      videoDescription: vendor.videoDescription || '',
      serviceAreas: (vendor.serviceAreas || []).map((area: any) => typeof area === 'string' ? area : area.area || area.value || ''),
      companyValues: (vendor.companyValues || []).map((val: any) => typeof val === 'string' ? val : val.value || ''),
    },
  });
  // TODO: Fix TypeScript issue with useFieldArray
  // const { fields: serviceAreasFields, append: appendServiceArea, remove: removeServiceArea } = useFieldArray({
  //   control,
  //   name: 'serviceAreas',
  // });
  // const { fields: companyValuesFields, append: appendCompanyValue, remove: removeCompanyValue } = useFieldArray({
  //   control,
  //   name: 'companyValues',
  // });

  // Temporary workaround - using state directly
  const [serviceAreasFields, setServiceAreasFields] = useState<Array<{id: string, value: string}>>(
    (vendor.serviceAreas || []).map((area: any, idx: number) => ({
      id: `area-${idx}`,
      value: typeof area === 'string' ? area : area.area || area.value || ''
    }))
  );
  const [companyValuesFields, setCompanyValuesFields] = useState<Array<{id: string, value: string}>>(
    (vendor.companyValues || []).map((value: any, idx: number) => ({
      id: `value-${idx}`,
      value: typeof value === 'string' ? value : value.value || ''
    }))
  );

  const appendServiceArea = (value: string) => {
    setServiceAreasFields([...serviceAreasFields, { id: `area-${Date.now()}`, value }]);
  };
  const removeServiceArea = (index: number) => {
    setServiceAreasFields(serviceAreasFields.filter((_, i) => i !== index));
  };
  const appendCompanyValue = (value: string) => {
    setCompanyValuesFields([...companyValuesFields, { id: `value-${Date.now()}`, value }]);
  };
  const removeCompanyValue = (index: number) => {
    setCompanyValuesFields(companyValuesFields.filter((_, i) => i !== index));
  };

  const foundedYear = watch('foundedYear');
  const longDescription = watch('longDescription');
  const longDescriptionLength = longDescription?.length || 0;

  // Mark form as dirty when values change
  useEffect(() => {
    markDirty(isDirty);
  }, [isDirty, markDirty]);

  const handleFormSubmit = async (data: BrandStoryFormData) => {
    if (!hasAccess) {
      setShowUpgradePrompt(true);
      return;
    }

    if (onSubmit) {
      await onSubmit(data);
    } else {
      // Update vendor in context
      updateVendor({
        website: data.website || undefined,
        linkedinUrl: data.linkedinUrl || undefined,
        twitterUrl: data.twitterUrl || undefined,
        foundedYear: data.foundedYear || undefined,
        longDescription: data.longDescription || undefined,
        totalProjects: data.totalProjects || undefined,
        employeeCount: data.employeeCount || undefined,
        linkedinFollowers: data.linkedinFollowers || undefined,
        instagramFollowers: data.instagramFollowers || undefined,
        clientSatisfactionScore: data.clientSatisfactionScore || undefined,
        repeatClientPercentage: data.repeatClientPercentage || undefined,
        videoUrl: data.videoUrl || undefined,
        videoThumbnail: data.videoThumbnail || undefined,
        videoDuration: data.videoDuration || undefined,
        videoTitle: data.videoTitle || undefined,
        videoDescription: data.videoDescription || undefined,
        serviceAreas: data.serviceAreas?.map((area: any) => typeof area === 'string' ? area : area.value || '') || undefined,
        companyValues: data.companyValues?.map((val: any) => typeof val === 'string' ? val : val.value || '') || undefined,
      });
    }

    // Reset form dirty state
    reset(data);
  };

  // Show upgrade prompt for Free tier users
  if (!hasAccess) {
    return (
      <TierUpgradePrompt
        currentTier={vendor.tier || 'free'}
        requiredTier="tier1"
        featureName="Brand Story"
      />
    );
  }

  return (
    <form onSubmit={handleSubmit(handleFormSubmit)}>
      <div className="space-y-6">
        {/* Company Links */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Globe className="h-5 w-5" />
              Company Links
            </CardTitle>
            <CardDescription>
              Social media and website links for your company.
            </CardDescription>
          </CardHeader>

          <CardContent className="space-y-4">
            {/* Website */}
            <div className="space-y-2">
              <Label htmlFor="website">Website</Label>
              <Input
                id="website"
                type="url"
                placeholder="https://example.com"
                {...register('website')}
                className={errors.website ? 'border-red-500' : ''}
              />
              {errors.website && (
                <p className="text-sm text-red-500">{errors.website.message}</p>
              )}
            </div>

            {/* LinkedIn */}
            <div className="space-y-2">
              <Label htmlFor="linkedinUrl">LinkedIn URL</Label>
              <Input
                id="linkedinUrl"
                type="url"
                placeholder="https://linkedin.com/company/..."
                {...register('linkedinUrl')}
                className={errors.linkedinUrl ? 'border-red-500' : ''}
              />
              {errors.linkedinUrl && (
                <p className="text-sm text-red-500">{errors.linkedinUrl.message}</p>
              )}
            </div>

            {/* Twitter */}
            <div className="space-y-2">
              <Label htmlFor="twitterUrl">Twitter URL</Label>
              <Input
                id="twitterUrl"
                type="url"
                placeholder="https://twitter.com/..."
                {...register('twitterUrl')}
                className={errors.twitterUrl ? 'border-red-500' : ''}
              />
              {errors.twitterUrl && (
                <p className="text-sm text-red-500">{errors.twitterUrl.message}</p>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Company History */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="h-5 w-5" />
              Company History
            </CardTitle>
            <CardDescription>
              When was your company founded?
            </CardDescription>
          </CardHeader>

          <CardContent className="space-y-4">
            {/* Founded Year */}
            <div className="space-y-2">
              <Label htmlFor="foundedYear">Founded Year</Label>
              <Input
                id="foundedYear"
                type="number"
                min={1800}
                max={new Date().getFullYear()}
                placeholder={String(new Date().getFullYear())}
                {...register('foundedYear', { valueAsNumber: true })}
                className={errors.foundedYear ? 'border-red-500' : ''}
              />
              {errors.foundedYear && (
                <p className="text-sm text-red-500">{errors.foundedYear.message}</p>
              )}
            </div>

            {/* Years in Business Display (Computed Field) */}
            {foundedYear && (
              <div className="p-4 bg-blue-50 dark:bg-blue-950/20 rounded-lg border border-blue-200 dark:border-blue-800">
                <div className="flex items-center gap-2">
                  <YearsInBusinessDisplay
                    foundedYear={foundedYear}
                    variant="badge"
                    showLabel={true}
                  />
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Long Description */}
        <Card>
          <CardHeader>
            <CardTitle>Detailed Description</CardTitle>
            <CardDescription>
              Tell your company's story in detail (max 5000 characters).
            </CardDescription>
          </CardHeader>

          <CardContent className="space-y-2">
            <Textarea
              id="longDescription"
              rows={8}
              placeholder="Share your company's history, mission, and what makes you unique..."
              {...register('longDescription')}
              className={errors.longDescription ? 'border-red-500' : ''}
            />
            {errors.longDescription && (
              <p className="text-sm text-red-500">{errors.longDescription.message}</p>
            )}
            <p className="text-sm text-muted-foreground dark:text-muted-foreground text-right">
              {longDescriptionLength} / 5000 characters
            </p>
          </CardContent>
        </Card>

        {/* Social Proof Metrics */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5" />
              Social Proof Metrics
            </CardTitle>
            <CardDescription>
              Showcase your achievements and credibility.
            </CardDescription>
          </CardHeader>

          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Total Projects */}
              <div className="space-y-2">
                <Label htmlFor="totalProjects">Total Projects Completed</Label>
                <Input
                  id="totalProjects"
                  type="number"
                  min={0}
                  placeholder="0"
                  {...register('totalProjects', { valueAsNumber: true })}
                  className={errors.totalProjects ? 'border-red-500' : ''}
                />
                {errors.totalProjects && (
                  <p className="text-sm text-red-500">{errors.totalProjects.message}</p>
                )}
              </div>

              {/* Employee Count */}
              <div className="space-y-2">
                <Label htmlFor="employeeCount">Number of Employees</Label>
                <Input
                  id="employeeCount"
                  type="number"
                  min={0}
                  placeholder="0"
                  {...register('employeeCount', { valueAsNumber: true })}
                  className={errors.employeeCount ? 'border-red-500' : ''}
                />
                {errors.employeeCount && (
                  <p className="text-sm text-red-500">{errors.employeeCount.message}</p>
                )}
              </div>

              {/* LinkedIn Followers */}
              <div className="space-y-2">
                <Label htmlFor="linkedinFollowers">LinkedIn Followers</Label>
                <Input
                  id="linkedinFollowers"
                  type="number"
                  min={0}
                  placeholder="0"
                  {...register('linkedinFollowers', { valueAsNumber: true })}
                  className={errors.linkedinFollowers ? 'border-red-500' : ''}
                />
                {errors.linkedinFollowers && (
                  <p className="text-sm text-red-500">{errors.linkedinFollowers.message}</p>
                )}
              </div>

              {/* Instagram Followers */}
              <div className="space-y-2">
                <Label htmlFor="instagramFollowers">Instagram Followers</Label>
                <Input
                  id="instagramFollowers"
                  type="number"
                  min={0}
                  placeholder="0"
                  {...register('instagramFollowers', { valueAsNumber: true })}
                  className={errors.instagramFollowers ? 'border-red-500' : ''}
                />
                {errors.instagramFollowers && (
                  <p className="text-sm text-red-500">{errors.instagramFollowers.message}</p>
                )}
              </div>

              {/* Client Satisfaction Score */}
              <div className="space-y-2">
                <Label htmlFor="clientSatisfactionScore">Client Satisfaction Score (0-100)</Label>
                <Input
                  id="clientSatisfactionScore"
                  type="number"
                  min={0}
                  max={100}
                  placeholder="95"
                  {...register('clientSatisfactionScore', { valueAsNumber: true })}
                  className={errors.clientSatisfactionScore ? 'border-red-500' : ''}
                />
                {errors.clientSatisfactionScore && (
                  <p className="text-sm text-red-500">{errors.clientSatisfactionScore.message}</p>
                )}
              </div>

              {/* Repeat Client Percentage */}
              <div className="space-y-2">
                <Label htmlFor="repeatClientPercentage">Repeat Client Rate (0-100%)</Label>
                <Input
                  id="repeatClientPercentage"
                  type="number"
                  min={0}
                  max={100}
                  placeholder="80"
                  {...register('repeatClientPercentage', { valueAsNumber: true })}
                  className={errors.repeatClientPercentage ? 'border-red-500' : ''}
                />
                {errors.repeatClientPercentage && (
                  <p className="text-sm text-red-500">{errors.repeatClientPercentage.message}</p>
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Video Introduction */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Video className="h-5 w-5" />
              Video Introduction
            </CardTitle>
            <CardDescription>
              Add a video to introduce your company to potential clients.
            </CardDescription>
          </CardHeader>

          <CardContent className="space-y-4">
            {/* Video URL */}
            <div className="space-y-2">
              <Label htmlFor="videoUrl">Video URL</Label>
              <Input
                id="videoUrl"
                type="url"
                placeholder="https://youtube.com/watch?v=..."
                {...register('videoUrl')}
                className={errors.videoUrl ? 'border-red-500' : ''}
              />
              {errors.videoUrl && (
                <p className="text-sm text-red-500">{errors.videoUrl.message}</p>
              )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Video Thumbnail */}
              <div className="space-y-2">
                <Label htmlFor="videoThumbnail">Thumbnail URL</Label>
                <Input
                  id="videoThumbnail"
                  type="url"
                  placeholder="https://..."
                  {...register('videoThumbnail')}
                  className={errors.videoThumbnail ? 'border-red-500' : ''}
                />
                {errors.videoThumbnail && (
                  <p className="text-sm text-red-500">{errors.videoThumbnail.message}</p>
                )}
              </div>

              {/* Video Duration */}
              <div className="space-y-2">
                <Label htmlFor="videoDuration">Duration (e.g., "2:30")</Label>
                <Input
                  id="videoDuration"
                  type="text"
                  placeholder="2:30"
                  maxLength={10}
                  {...register('videoDuration')}
                  className={errors.videoDuration ? 'border-red-500' : ''}
                />
                {errors.videoDuration && (
                  <p className="text-sm text-red-500">{errors.videoDuration.message}</p>
                )}
              </div>
            </div>

            {/* Video Title */}
            <div className="space-y-2">
              <Label htmlFor="videoTitle">Video Title</Label>
              <Input
                id="videoTitle"
                type="text"
                placeholder="Company Introduction"
                maxLength={200}
                {...register('videoTitle')}
                className={errors.videoTitle ? 'border-red-500' : ''}
              />
              {errors.videoTitle && (
                <p className="text-sm text-red-500">{errors.videoTitle.message}</p>
              )}
            </div>

            {/* Video Description */}
            <div className="space-y-2">
              <Label htmlFor="videoDescription">Video Description</Label>
              <Textarea
                id="videoDescription"
                rows={3}
                placeholder="Brief description of the video..."
                maxLength={1000}
                {...register('videoDescription')}
                className={errors.videoDescription ? 'border-red-500' : ''}
              />
              {errors.videoDescription && (
                <p className="text-sm text-red-500">{errors.videoDescription.message}</p>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Service Areas */}
        <Card>
          <CardHeader>
            <CardTitle>Service Areas</CardTitle>
            <CardDescription>
              Geographic regions or specializations where you provide services.
            </CardDescription>
          </CardHeader>

          <CardContent className="space-y-4">
            {serviceAreasFields.map((field, index) => (
              <div key={field.id} className="flex gap-2">
                <Input
                  placeholder="e.g., Mediterranean, Caribbean, Southeast Asia"
                  {...register(`serviceAreas.${index}` as const)}
                  className="flex-1"
                />
                <Button
                  type="button"
                  variant="outline"
                  size="icon"
                  onClick={() => removeServiceArea(index)}
                  aria-label="Remove service area"
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            ))}

            <Button
              type="button"
              variant="outline"
              onClick={() => appendServiceArea('')}
              className="w-full"
            >
              <Plus className="h-4 w-4 mr-2" />
              Add Service Area
            </Button>
          </CardContent>
        </Card>

        {/* Company Values */}
        <Card>
          <CardHeader>
            <CardTitle>Company Values</CardTitle>
            <CardDescription>
              Core principles and values that guide your company.
            </CardDescription>
          </CardHeader>

          <CardContent className="space-y-4">
            {companyValuesFields.map((field, index) => (
              <div key={field.id} className="flex gap-2">
                <Input
                  placeholder="e.g., Innovation, Quality, Integrity"
                  {...register(`companyValues.${index}` as const)}
                  className="flex-1"
                />
                <Button
                  type="button"
                  variant="outline"
                  size="icon"
                  onClick={() => removeCompanyValue(index)}
                  aria-label="Remove company value"
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            ))}

            <Button
              type="button"
              variant="outline"
              onClick={() => appendCompanyValue('')}
              className="w-full"
            >
              <Plus className="h-4 w-4 mr-2" />
              Add Company Value
            </Button>
          </CardContent>
        </Card>

        {/* Save Button */}
        <Card>
          <CardFooter className="flex justify-end pt-6">
            <Button
              type="submit"
              disabled={!isDirty || isSubmitting}
              className="min-w-[120px]"
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
      </div>
    </form>
  );
}
