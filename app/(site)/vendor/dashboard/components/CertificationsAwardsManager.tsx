'use client';

import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import {
  Loader2, Save, Plus, Edit2, Trash2, Award, Medal, Building2,
  Calendar, Link2, Image as ImageIcon
} from 'lucide-react';
import { VendorCertification, VendorAward, Vendor } from '@/lib/types';
import { useVendorDashboard } from '@/lib/context/VendorDashboardContext';
import { TierService } from '@/lib/services/TierService';
import { TierUpgradePrompt } from '@/components/dashboard/TierUpgradePrompt';
import { HelpTooltip } from '@/components/help';

// Validation schemas
const certificationSchema = z.object({
  name: z.string().min(1, 'Certification name is required').max(200),
  issuer: z.string().min(1, 'Issuer is required').max(200),
  year: z.number().min(1900).max(new Date().getFullYear()).optional().nullable(),
  expiryDate: z.string().optional(),
  certificateUrl: z.string().url('Must be a valid URL').optional().or(z.literal('')),
  logo: z.string().url('Must be a valid URL').optional().or(z.literal('')),
});

const awardSchema = z.object({
  title: z.string().min(1, 'Award title is required').max(200),
  year: z.number().min(1900).max(new Date().getFullYear()),
  organization: z.string().max(200).optional(),
  category: z.string().max(100).optional(),
  description: z.string().max(1000).optional(),
});

type CertificationFormData = z.infer<typeof certificationSchema>;
type AwardFormData = z.infer<typeof awardSchema>;

// FIX #4: Centralized default values
const CERT_DEFAULT_VALUES: CertificationFormData = {
  name: '',
  issuer: '',
  year: null,
  expiryDate: '',
  certificateUrl: '',
  logo: '',
};

const AWARD_DEFAULT_VALUES: AwardFormData = {
  title: '',
  year: new Date().getFullYear(),
  organization: '',
  category: '',
  description: '',
};

export interface CertificationsAwardsManagerProps {
  vendor: Vendor;
}

/**
 * CertificationsAwardsManager Component
 *
 * Manages certifications and awards for vendor profiles (Tier 1+)
 *
 * Features:
 * - Certifications CRUD with name, issuer, year, expiry, URL, logo
 * - Awards CRUD with title, year, organization, category, description
 * - Add/edit modals with form validation
 * - Delete confirmation dialogs
 * - Image upload for logos and award images
 * - List view with cards
 * - Search/filter functionality
 * - Tier 1+ access control with upgrade prompt
 */
export function CertificationsAwardsManager({ vendor }: CertificationsAwardsManagerProps) {
  // FIX #1: Add saveVendor to destructured context
  const { updateVendor, saveVendor, markDirty } = useVendorDashboard();
  const [certifications, setCertifications] = useState<VendorCertification[]>(vendor.certifications || []);
  const [awards, setAwards] = useState<VendorAward[]>(vendor.awards || []);

  // Modal states
  const [certModalOpen, setCertModalOpen] = useState(false);
  const [awardModalOpen, setAwardModalOpen] = useState(false);
  const [editingCertIndex, setEditingCertIndex] = useState<number | null>(null);
  const [editingAwardIndex, setEditingAwardIndex] = useState<number | null>(null);
  const [deletingCertIndex, setDeletingCertIndex] = useState<number | null>(null);
  const [deletingAwardIndex, setDeletingAwardIndex] = useState<number | null>(null);

  // Search states
  const [certSearch, setCertSearch] = useState('');
  const [awardSearch, setAwardSearch] = useState('');
  const [isSaving, setIsSaving] = useState(false);

  const tierLevel = TierService.getTierLevel(vendor.tier);
  const hasAccess = tierLevel >= 1; // Tier 1+ required

  // Sync local state with vendor prop when it changes (e.g., after save)
  useEffect(() => {
    setCertifications(vendor.certifications || []);
    setAwards(vendor.awards || []);
  }, [vendor.certifications, vendor.awards]);

  // Certification form (FIX #4: Use centralized defaults)
  const certForm = useForm<CertificationFormData>({
    resolver: zodResolver(certificationSchema),
    defaultValues: CERT_DEFAULT_VALUES,
  });

  // Award form (FIX #4: Use centralized defaults)
  const awardForm = useForm<AwardFormData>({
    resolver: zodResolver(awardSchema),
    defaultValues: AWARD_DEFAULT_VALUES,
  });

  // Mark as dirty when data changes
  useEffect(() => {
    const hasChanges =
      JSON.stringify(certifications) !== JSON.stringify(vendor.certifications || []) ||
      JSON.stringify(awards) !== JSON.stringify(vendor.awards || []);
    markDirty(hasChanges);
  }, [certifications, awards, vendor.certifications, vendor.awards, markDirty]);

  // Open cert modal for add/edit
  const openCertModal = (index: number | null = null) => {
    if (index !== null) {
      const cert = certifications[index];
      certForm.reset({
        name: cert.name,
        issuer: cert.issuer,
        year: cert.year || null,
        expiryDate: cert.expiryDate || '',
        certificateUrl: cert.certificateUrl || '',
        logo: cert.logo || '',
      });
      setEditingCertIndex(index);
    } else {
      // FIX #4: Use centralized defaults
      certForm.reset(CERT_DEFAULT_VALUES);
      setEditingCertIndex(null);
    }
    setCertModalOpen(true);
  };

  // Open award modal for add/edit
  const openAwardModal = (index: number | null = null) => {
    if (index !== null) {
      const award = awards[index];
      awardForm.reset({
        title: award.title,
        year: award.year,
        organization: award.organization || '',
        category: award.category || '',
        description: award.description || '',
      });
      setEditingAwardIndex(index);
    } else {
      // FIX #4: Use centralized defaults
      awardForm.reset(AWARD_DEFAULT_VALUES);
      setEditingAwardIndex(null);
    }
    setAwardModalOpen(true);
  };

  // Save certification
  const saveCertification = (data: CertificationFormData) => {
    const newCert: VendorCertification = {
      name: data.name,
      issuer: data.issuer,
      year: data.year || undefined,
      expiryDate: data.expiryDate || undefined,
      certificateUrl: data.certificateUrl || undefined,
      logo: data.logo || undefined,
    };

    if (editingCertIndex !== null) {
      // Update existing
      const updated = [...certifications];
      updated[editingCertIndex] = newCert;
      setCertifications(updated);
    } else {
      // Add new
      setCertifications([...certifications, newCert]);
    }

    setCertModalOpen(false);
    setEditingCertIndex(null);
  };

  // Save award
  const saveAward = (data: AwardFormData) => {
    const newAward: VendorAward = {
      title: data.title,
      year: data.year,
      organization: data.organization || undefined,
      category: data.category || undefined,
      description: data.description || undefined,
    };

    if (editingAwardIndex !== null) {
      // Update existing
      const updated = [...awards];
      updated[editingAwardIndex] = newAward;
      setAwards(updated);
    } else {
      // Add new
      setAwards([...awards, newAward]);
    }

    setAwardModalOpen(false);
    setEditingAwardIndex(null);
  };

  // Delete certification
  const deleteCertification = (index: number) => {
    setCertifications(prev => prev.filter((_, i) => i !== index));
    setDeletingCertIndex(null);
  };

  // Delete award
  const deleteAward = (index: number) => {
    setAwards(prev => prev.filter((_, i) => i !== index));
    setDeletingAwardIndex(null);
  };

  // FIX #1: Save all changes using correct two-step pattern
  const handleSave = async () => {
    if (!hasAccess) return;

    setIsSaving(true);
    try {
      // Step 1: Update context state
      updateVendor({
        certifications: certifications.length > 0 ? certifications : undefined,
        awards: awards.length > 0 ? awards : undefined,
      });

      // Step 2: Save to API (no parameters)
      await saveVendor();
    } finally {
      setIsSaving(false);
    }
  };

  // Filter functions
  const filteredCertifications = certifications.filter(cert =>
    cert.name.toLowerCase().includes(certSearch.toLowerCase()) ||
    cert.issuer.toLowerCase().includes(certSearch.toLowerCase())
  );

  const filteredAwards = awards.filter(award =>
    award.title.toLowerCase().includes(awardSearch.toLowerCase()) ||
    (award.organization?.toLowerCase().includes(awardSearch.toLowerCase()) ?? false)
  );

  // Show upgrade prompt for Free tier
  if (!hasAccess) {
    return (
      <TierUpgradePrompt
        currentTier={vendor.tier || 'free'}
        featureName="Certifications & Awards"
        requiredTier="tier1"
        upgradePath="/subscription/upgrade"
      />
    );
  }

  return (
    <div className="space-y-6">
      {/* Certifications Section */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Medal className="h-5 w-5" />
                Certifications
                <HelpTooltip
                  content="Official credentials from recognized industry bodies (e.g., ISO, ABYC)."
                  title="Certification"
                />
              </CardTitle>
              <CardDescription>
                Professional certifications and credentials ({certifications.length})
              </CardDescription>
            </div>
            <Button onClick={() => openCertModal()} size="sm">
              <Plus className="h-4 w-4 mr-2" />
              Add Certification
            </Button>
          </div>
        </CardHeader>

        <CardContent>
          {/* Search */}
          {certifications.length > 0 && (
            <div className="mb-4">
              <Input
                placeholder="Search certifications..."
                value={certSearch}
                onChange={(e) => setCertSearch(e.target.value)}
                className="max-w-sm"
              />
            </div>
          )}

          {/* List */}
          {certifications.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              <Medal className="h-12 w-12 mx-auto mb-3 opacity-50" />
              <p>No certifications added yet.</p>
              <p className="text-sm mt-1">Click "Add Certification" to get started.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {certifications.map((cert, certIndex) => {
                // Inline filter check
                const matchesSearch = cert.name.toLowerCase().includes(certSearch.toLowerCase()) ||
                                      cert.issuer.toLowerCase().includes(certSearch.toLowerCase());

                if (!matchesSearch) return null;

                return (
                  <Card key={certIndex} className="border-2">
                    <CardContent className="p-4">
                      <div className="flex items-start justify-between mb-2">
                        <div className="flex-1">
                          <h4 className="font-semibold text-lg">{cert.name}</h4>
                          <p className="text-sm text-muted-foreground dark:text-muted-foreground flex items-center gap-1">
                            <Building2 className="h-3 w-3" />
                            {cert.issuer}
                          </p>
                        </div>
                        {cert.logo && (
                          <div className="w-12 h-12 bg-muted dark:bg-muted rounded flex items-center justify-center flex-shrink-0 ml-2">
                            <ImageIcon className="h-6 w-6 text-muted-foreground" />
                          </div>
                        )}
                      </div>

                      <div className="flex flex-wrap gap-2 mb-3">
                        {cert.year && (
                          <Badge variant="outline" className="text-xs">
                            <Calendar className="h-3 w-3 mr-1" />
                            {cert.year}
                          </Badge>
                        )}
                        {cert.expiryDate && (
                          <Badge variant="outline" className="text-xs">
                            Expires: {cert.expiryDate}
                          </Badge>
                        )}
                        {cert.certificateUrl && (
                          <Badge variant="outline" className="text-xs">
                            <Link2 className="h-3 w-3 mr-1" />
                            Certificate
                          </Badge>
                        )}
                      </div>

                      <div className="flex gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => openCertModal(certIndex)}
                        >
                          <Edit2 className="h-3 w-3 mr-1" />
                          Edit
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setDeletingCertIndex(certIndex)}
                        >
                          <Trash2 className="h-3 w-3 mr-1" />
                          Delete
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                );
              }).filter(Boolean)}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Awards Section */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Award className="h-5 w-5" />
                Awards & Recognition
                <HelpTooltip
                  content="Industry recognition or honors received for excellence in your field."
                  title="Award"
                />
              </CardTitle>
              <CardDescription>
                Industry awards and achievements ({awards.length})
              </CardDescription>
            </div>
            <Button onClick={() => openAwardModal()} size="sm">
              <Plus className="h-4 w-4 mr-2" />
              Add Award
            </Button>
          </div>
        </CardHeader>

        <CardContent>
          {/* Search */}
          {awards.length > 0 && (
            <div className="mb-4">
              <Input
                placeholder="Search awards..."
                value={awardSearch}
                onChange={(e) => setAwardSearch(e.target.value)}
                className="max-w-sm"
              />
            </div>
          )}

          {/* List */}
          {awards.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              <Award className="h-12 w-12 mx-auto mb-3 opacity-50" />
              <p>No awards added yet.</p>
              <p className="text-sm mt-1">Click "Add Award" to get started.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {awards.map((award, awardIndex) => {
                // Inline filter check
                const matchesSearch = award.title.toLowerCase().includes(awardSearch.toLowerCase()) ||
                                      (award.organization?.toLowerCase().includes(awardSearch.toLowerCase()) ?? false);

                if (!matchesSearch) return null;

                return (
                  <Card key={awardIndex} className="border-2">
                    <CardContent className="p-4">
                      <div className="flex items-start justify-between mb-2">
                        <div className="flex-1">
                          <h4 className="font-semibold text-lg">{award.title}</h4>
                          {award.organization && (
                            <p className="text-sm text-muted-foreground dark:text-muted-foreground flex items-center gap-1">
                              <Building2 className="h-3 w-3" />
                              {award.organization}
                            </p>
                          )}
                        </div>
                      </div>

                      <div className="flex flex-wrap gap-2 mb-3">
                        <Badge variant="outline" className="text-xs">
                          <Calendar className="h-3 w-3 mr-1" />
                          {award.year}
                        </Badge>
                        {award.category && (
                          <Badge variant="outline" className="text-xs">
                            {award.category}
                          </Badge>
                        )}
                      </div>

                      {award.description && (
                        <p className="text-sm text-muted-foreground dark:text-muted-foreground mb-3 line-clamp-2">
                          {award.description}
                        </p>
                      )}

                      <div className="flex gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => openAwardModal(awardIndex)}
                        >
                          <Edit2 className="h-3 w-3 mr-1" />
                          Edit
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setDeletingAwardIndex(awardIndex)}
                        >
                          <Trash2 className="h-3 w-3 mr-1" />
                          Delete
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                );
              }).filter(Boolean)}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Save Button */}
      <Card>
        <CardFooter className="flex justify-end pt-6">
          <Button
            onClick={handleSave}
            disabled={isSaving}
            className="min-w-[120px]"
          >
            {isSaving ? (
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

      {/* Certification Modal - FIX #5: Add form reset on close */}
      <Dialog open={certModalOpen} onOpenChange={(open) => {
        setCertModalOpen(open);
        if (!open) {
          certForm.reset(CERT_DEFAULT_VALUES);
          setEditingCertIndex(null);
        }
      }}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {editingCertIndex !== null ? 'Edit Certification' : 'Add Certification'}
            </DialogTitle>
            <DialogDescription>
              Add professional certifications and credentials to showcase your expertise.
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={certForm.handleSubmit(saveCertification)} className="space-y-4">
            {/* Name */}
            <div className="space-y-2">
              <Label htmlFor="cert-name">Certification Name *</Label>
              <Input
                id="cert-name"
                {...certForm.register('name')}
                placeholder="e.g., ISO 9001:2015"
              />
              {certForm.formState.errors.name && (
                <p className="text-sm text-red-500">{certForm.formState.errors.name.message}</p>
              )}
            </div>

            {/* Issuer */}
            <div className="space-y-2">
              <Label htmlFor="cert-issuer">Issuing Organization *</Label>
              <Input
                id="cert-issuer"
                {...certForm.register('issuer')}
                placeholder="e.g., International Organization for Standardization"
              />
              {certForm.formState.errors.issuer && (
                <p className="text-sm text-red-500">{certForm.formState.errors.issuer.message}</p>
              )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Year */}
              <div className="space-y-2">
                <Label htmlFor="cert-year">Year Obtained</Label>
                <Input
                  id="cert-year"
                  type="number"
                  min={1900}
                  max={new Date().getFullYear()}
                  {...certForm.register('year', { valueAsNumber: true })}
                  placeholder={String(new Date().getFullYear())}
                />
                {certForm.formState.errors.year && (
                  <p className="text-sm text-red-500">{certForm.formState.errors.year.message}</p>
                )}
              </div>

              {/* Expiry Date */}
              <div className="space-y-2">
                <Label htmlFor="cert-expiry">Expiry Date</Label>
                <Input
                  id="cert-expiry"
                  type="date"
                  {...certForm.register('expiryDate')}
                />
                {certForm.formState.errors.expiryDate && (
                  <p className="text-sm text-red-500">{certForm.formState.errors.expiryDate.message}</p>
                )}
              </div>
            </div>

            {/* Certificate URL */}
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <Label htmlFor="cert-url">Certificate URL</Label>
                <HelpTooltip
                  content="URL to verify or view the certification document online."
                  title="Verification URL"
                />
              </div>
              <Input
                id="cert-url"
                type="url"
                {...certForm.register('certificateUrl')}
                placeholder="https://..."
              />
              {certForm.formState.errors.certificateUrl && (
                <p className="text-sm text-red-500">{certForm.formState.errors.certificateUrl.message}</p>
              )}
            </div>

            {/* Logo URL */}
            <div className="space-y-2">
              <Label htmlFor="cert-logo">Logo URL</Label>
              <Input
                id="cert-logo"
                type="url"
                {...certForm.register('logo')}
                placeholder="https://..."
              />
              {certForm.formState.errors.logo && (
                <p className="text-sm text-red-500">{certForm.formState.errors.logo.message}</p>
              )}
              <p className="text-xs text-muted-foreground">Upload your logo to an image host and paste the URL here.</p>
            </div>

            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setCertModalOpen(false)}>
                Cancel
              </Button>
              <Button type="submit">
                {editingCertIndex !== null ? 'Update' : 'Add'} Certification
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Award Modal - FIX #5: Add form reset on close */}
      <Dialog open={awardModalOpen} onOpenChange={(open) => {
        setAwardModalOpen(open);
        if (!open) {
          awardForm.reset(AWARD_DEFAULT_VALUES);
          setEditingAwardIndex(null);
        }
      }}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {editingAwardIndex !== null ? 'Edit Award' : 'Add Award'}
            </DialogTitle>
            <DialogDescription>
              Add industry awards and recognition to showcase your achievements.
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={awardForm.handleSubmit(saveAward)} className="space-y-4">
            {/* Title */}
            <div className="space-y-2">
              <Label htmlFor="award-title">Award Title *</Label>
              <Input
                id="award-title"
                {...awardForm.register('title')}
                placeholder="e.g., Best Superyacht Builder 2024"
              />
              {awardForm.formState.errors.title && (
                <p className="text-sm text-red-500">{awardForm.formState.errors.title.message}</p>
              )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Year */}
              <div className="space-y-2">
                <Label htmlFor="award-year">Year *</Label>
                <Input
                  id="award-year"
                  type="number"
                  min={1900}
                  max={new Date().getFullYear()}
                  {...awardForm.register('year', { valueAsNumber: true })}
                />
                {awardForm.formState.errors.year && (
                  <p className="text-sm text-red-500">{awardForm.formState.errors.year.message}</p>
                )}
              </div>

              {/* Category */}
              <div className="space-y-2">
                <Label htmlFor="award-category">Category</Label>
                <Input
                  id="award-category"
                  {...awardForm.register('category')}
                  placeholder="e.g., Innovation, Design"
                />
                {awardForm.formState.errors.category && (
                  <p className="text-sm text-red-500">{awardForm.formState.errors.category.message}</p>
                )}
              </div>
            </div>

            {/* Organization */}
            <div className="space-y-2">
              <Label htmlFor="award-org">Awarding Organization</Label>
              <Input
                id="award-org"
                {...awardForm.register('organization')}
                placeholder="e.g., ShowBoats International"
              />
              {awardForm.formState.errors.organization && (
                <p className="text-sm text-red-500">{awardForm.formState.errors.organization.message}</p>
              )}
            </div>

            {/* Description */}
            <div className="space-y-2">
              <Label htmlFor="award-desc">Description</Label>
              <Textarea
                id="award-desc"
                rows={4}
                {...awardForm.register('description')}
                placeholder="Brief description of the award and what it recognizes..."
                maxLength={1000}
              />
              {awardForm.formState.errors.description && (
                <p className="text-sm text-red-500">{awardForm.formState.errors.description.message}</p>
              )}
              <p className="text-xs text-muted-foreground">Max 1000 characters</p>
            </div>

            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setAwardModalOpen(false)}>
                Cancel
              </Button>
              <Button type="submit">
                {editingAwardIndex !== null ? 'Update' : 'Add'} Award
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* FIX #3: Delete Certification Confirmation Dialog */}
      <Dialog open={deletingCertIndex !== null} onOpenChange={() => setDeletingCertIndex(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Certification</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete this certification? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeletingCertIndex(null)}>
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={() => deletingCertIndex !== null && deleteCertification(deletingCertIndex)}
            >
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* FIX #3: Delete Award Confirmation Dialog */}
      <Dialog open={deletingAwardIndex !== null} onOpenChange={() => setDeletingAwardIndex(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Award</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete this award? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeletingAwardIndex(null)}>
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={() => deletingAwardIndex !== null && deleteAward(deletingAwardIndex)}
            >
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
