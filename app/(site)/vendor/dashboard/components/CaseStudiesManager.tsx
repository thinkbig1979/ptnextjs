'use client';

import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import {
  Loader2, Save, Plus, Edit2, Trash2, Star, Calendar,
  Image as ImageIcon, X, Award, Briefcase
} from 'lucide-react';
import { Vendor } from '@/lib/types';
import { useVendorDashboard } from '@/lib/context/VendorDashboardContext';
import { TierService } from '@/lib/services/TierService';
import { TierUpgradePrompt } from '@/components/dashboard/TierUpgradePrompt';
import { caseStudySchema, type CaseStudyFormData } from '@/lib/validation/vendorSchemas';
import { HelpTooltip } from '@/components/help';
import { extractDescriptionText } from '@/lib/utils/lexical-helpers';

// Default values for form
const CASE_STUDY_DEFAULT_VALUES: CaseStudyFormData = {
  title: '',
  yachtName: null,
  yacht: null,
  projectDate: null,
  challenge: '',
  solution: '',
  results: '',
  testimonyQuote: null,
  testimonyAuthor: null,
  testimonyRole: null,
  images: null,
  featured: false,
};

export interface CaseStudiesManagerProps {
  vendor: Vendor;
}

/**
 * CaseStudiesManager Component
 *
 * Manages case studies for vendor profiles (Tier 1+)
 *
 * Features:
 * - Full-screen modal editor
 * - Rich text editors for challenge, solution, results
 * - Image gallery upload with preview
 * - Yacht relationship lookup
 * - Featured toggle (star icon)
 * - List view with cards showing title, yacht, date
 * - Filter by featured
 * - Tier 1+ access control with upgrade prompt
 */
export function CaseStudiesManager({ vendor }: CaseStudiesManagerProps) {
  const { updateVendor, saveVendor, markDirty } = useVendorDashboard();
  const [caseStudies, setCaseStudies] = useState<CaseStudyFormData[]>(
    (vendor.caseStudies as CaseStudyFormData[]) || []
  );
  const [prevVendorCaseStudies, setPrevVendorCaseStudies] = useState(vendor.caseStudies);

  // Sync with vendor prop changes (avoids useEffect double-render)
  if (vendor.caseStudies !== prevVendorCaseStudies) {
    setPrevVendorCaseStudies(vendor.caseStudies);
    setCaseStudies((vendor.caseStudies as CaseStudyFormData[]) || []);
  }

  // Modal states
  const [modalOpen, setModalOpen] = useState(false);
  const [editingIndex, setEditingIndex] = useState<number | null>(null);
  const [deletingIndex, setDeletingIndex] = useState<number | null>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);

  // Filter states
  const [searchQuery, setSearchQuery] = useState('');
  const [filterFeatured, setFilterFeatured] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  const tierLevel = TierService.getTierLevel(vendor.tier);
  const hasTierAccess = tierLevel >= 1;

  // Form setup
  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
    watch,
    setValue,
  } = useForm<CaseStudyFormData>({
    resolver: zodResolver(caseStudySchema),
    defaultValues: CASE_STUDY_DEFAULT_VALUES,
  });

  // Watch featured toggle
  const watchedFeatured = watch('featured');

  // Image management
  const [imageUrls, setImageUrls] = useState<string[]>([]);
  const [newImageUrl, setNewImageUrl] = useState('');

  // Open add modal
  const handleAdd = () => {
    setEditingIndex(null);
    reset(CASE_STUDY_DEFAULT_VALUES);
    setImageUrls([]);
    setModalOpen(true);
  };

  // Open edit modal
  const handleEdit = (index: number) => {
    const caseStudy = caseStudies[index];
    setEditingIndex(index);
    reset({
      ...caseStudy,
      // Convert Lexical JSON objects back to plain text for textarea editing
      challenge: extractDescriptionText(caseStudy.challenge),
      solution: extractDescriptionText(caseStudy.solution),
      results: extractDescriptionText(caseStudy.results),
      images: caseStudy.images || null,
    });
    setImageUrls(caseStudy.images || []);
    setModalOpen(true);
  };

  // Open delete dialog
  const handleDeleteClick = (index: number) => {
    setDeletingIndex(index);
    setDeleteDialogOpen(true);
  };

  // Confirm delete
  const handleDeleteConfirm = () => {
    if (deletingIndex === null) return;

    const updatedCaseStudies = caseStudies.filter((_, i) => i !== deletingIndex);
    setCaseStudies(updatedCaseStudies);
    updateVendor({ caseStudies: updatedCaseStudies });
    markDirty(true);
    setDeleteDialogOpen(false);
    setDeletingIndex(null);
  };

  // Cancel delete
  const handleDeleteCancel = () => {
    setDeleteDialogOpen(false);
    setDeletingIndex(null);
  };

  // Submit form (add/edit)
  const onSubmit = (data: CaseStudyFormData) => {
    const caseStudyData: CaseStudyFormData = {
      ...data,
      images: imageUrls.length > 0 ? imageUrls : null,
    };

    let updatedCaseStudies: CaseStudyFormData[];

    if (editingIndex !== null) {
      // Edit existing
      updatedCaseStudies = caseStudies.map((cs, i) => (i === editingIndex ? caseStudyData : cs));
    } else {
      // Add new
      updatedCaseStudies = [...caseStudies, caseStudyData];
    }

    setCaseStudies(updatedCaseStudies);
    updateVendor({ caseStudies: updatedCaseStudies });
    markDirty(true);
    setModalOpen(false);
    reset(CASE_STUDY_DEFAULT_VALUES);
    setImageUrls([]);
  };

  // Toggle featured
  const handleToggleFeatured = (index: number) => {
    const updatedCaseStudies = caseStudies.map((cs, i) =>
      i === index ? { ...cs, featured: !cs.featured } : cs
    );
    setCaseStudies(updatedCaseStudies);
    updateVendor({ caseStudies: updatedCaseStudies });
    markDirty(true);
  };

  // Image management functions
  const handleAddImage = () => {
    if (newImageUrl && newImageUrl.trim()) {
      try {
        new URL(newImageUrl); // Validate URL
        setImageUrls([...imageUrls, newImageUrl.trim()]);
        setNewImageUrl('');
      } catch {
        // Invalid URL - could show error toast here
        console.error('Invalid image URL');
      }
    }
  };

  const handleRemoveImage = (index: number) => {
    setImageUrls(imageUrls.filter((_, i) => i !== index));
  };

  // Filter case studies
  const filteredCaseStudies = caseStudies.filter((cs) => {
    const matchesSearch =
      !searchQuery ||
      cs.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (cs.yachtName && cs.yachtName.toLowerCase().includes(searchQuery.toLowerCase()));
    const matchesFeatured = !filterFeatured || cs.featured === true;
    return matchesSearch && matchesFeatured;
  });

  // Save changes to backend - pass merged data directly to avoid React setState race condition
  const handleSaveChanges = async () => {
    setIsSaving(true);
    try {
      const mergedVendor = { ...vendor, caseStudies };
      await saveVendor(mergedVendor as Vendor);
    } catch {
      // Error toast is handled by saveVendor in VendorDashboardContext
    } finally {
      setIsSaving(false);
    }
  };

  if (!hasTierAccess) {
    return (
      <TierUpgradePrompt
        currentTier={vendor.tier || 'free'}
        requiredTier="tier1"
        featureName="Case Studies"
      />
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Briefcase className="h-5 w-5" />
                Case Studies
              </CardTitle>
              <CardDescription>
                Showcase your successful projects with detailed case studies. Highlight challenges solved, solutions
                implemented, and results achieved.
              </CardDescription>
            </div>
            <Button onClick={handleAdd} size="sm">
              <Plus className="h-4 w-4 mr-2" />
              Add Case Study
            </Button>
          </div>
        </CardHeader>

        {/* Search and Filter */}
        <CardContent className="space-y-4">
          <div className="flex flex-col sm:flex-row gap-4">
            <Input
              placeholder="Search case studies..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="flex-1"
            />
            <div className="flex items-center space-x-2">
              <Switch
                id="filter-featured"
                checked={filterFeatured}
                onCheckedChange={setFilterFeatured}
              />
              <Label htmlFor="filter-featured" className="text-sm cursor-pointer">
                Featured only
              </Label>
            </div>
          </div>

          {/* Case Studies List */}
          <div className="space-y-4">
            {filteredCaseStudies.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <Briefcase className="h-12 w-12 mx-auto mb-3 opacity-50" />
                <p>
                  {caseStudies.length === 0
                    ? 'No case studies added yet. Add your first case study to showcase your work.'
                    : 'No case studies match your search criteria.'}
                </p>
              </div>
            ) : (
              filteredCaseStudies.map((caseStudy, index) => {
                // Find original index for edit/delete/toggle
                const originalIndex = caseStudies.findIndex(
                  (cs) => cs.title === caseStudy.title && cs.projectDate === caseStudy.projectDate
                );

                return (
                  <Card key={originalIndex} className="relative">
                    <CardHeader>
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <CardTitle className="text-lg">{caseStudy.title}</CardTitle>
                            {caseStudy.featured && (
                              <Badge variant="secondary" className="flex items-center gap-1">
                                <Star className="h-3 w-3 fill-current" />
                                Featured
                              </Badge>
                            )}
                          </div>
                          {caseStudy.yachtName && (
                            <CardDescription className="flex items-center gap-2">
                              <Award className="h-4 w-4" />
                              {caseStudy.yachtName}
                            </CardDescription>
                          )}
                          {caseStudy.projectDate && (
                            <CardDescription className="flex items-center gap-2 mt-1">
                              <Calendar className="h-4 w-4" />
                              {new Date(caseStudy.projectDate).toLocaleDateString('en-US', {
                                month: 'long',
                                year: 'numeric',
                              })}
                            </CardDescription>
                          )}
                        </div>
                        <div className="flex items-center gap-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleToggleFeatured(originalIndex)}
                            title={caseStudy.featured ? 'Unfeature' : 'Feature this case study'}
                          >
                            <Star
                              className={`h-4 w-4 ${
                                caseStudy.featured ? 'fill-yellow-400 text-yellow-400' : ''
                              }`}
                            />
                          </Button>
                          <Button variant="ghost" size="sm" onClick={() => handleEdit(originalIndex)}>
                            <Edit2 className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleDeleteClick(originalIndex)}
                            className="text-destructive hover:text-destructive"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-3">
                        <div>
                          <h4 className="text-sm font-medium mb-1">Challenge</h4>
                          <p className="text-sm text-muted-foreground line-clamp-2">
                            {extractDescriptionText(caseStudy.challenge)}
                          </p>
                        </div>
                        <div>
                          <h4 className="text-sm font-medium mb-1">Solution</h4>
                          <p className="text-sm text-muted-foreground line-clamp-2">
                            {extractDescriptionText(caseStudy.solution)}
                          </p>
                        </div>
                        {caseStudy.testimonyQuote && (
                          <div className="bg-muted/50 p-3 rounded-md border-l-4 border-primary">
                            <p className="text-sm italic">"{caseStudy.testimonyQuote}"</p>
                            {caseStudy.testimonyAuthor && (
                              <p className="text-xs text-muted-foreground mt-2">
                                — {caseStudy.testimonyAuthor}
                                {caseStudy.testimonyRole && `, ${caseStudy.testimonyRole}`}
                              </p>
                            )}
                          </div>
                        )}
                        {caseStudy.images && caseStudy.images.length > 0 && (
                          <div className="flex items-center gap-2 text-sm text-muted-foreground">
                            <ImageIcon className="h-4 w-4" />
                            {caseStudy.images.length} image{caseStudy.images.length > 1 ? 's' : ''}
                          </div>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                );
              })
            )}
          </div>
        </CardContent>

        {caseStudies.length > 0 && (
          <CardFooter className="flex justify-between">
            <p className="text-sm text-muted-foreground">
              {filteredCaseStudies.length} of {caseStudies.length} case studies
            </p>
            <Button onClick={handleSaveChanges} disabled={isSaving} className="min-w-[120px]">
              {isSaving ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Saving...
                </>
              ) : (
                <>
                  <Save className="h-4 w-4 mr-2" />
                  Save Changes
                </>
              )}
            </Button>
          </CardFooter>
        )}
      </Card>

      {/* Full-screen Modal Editor */}
      <Dialog open={modalOpen} onOpenChange={setModalOpen}>
        <DialogContent className="max-w-5xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {editingIndex !== null ? 'Edit Case Study' : 'Add Case Study'}
            </DialogTitle>
            <DialogDescription>
              Create a detailed case study showcasing your work. Include challenges, solutions, and results.
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            {/* Basic Information */}
            <div className="space-y-4">
              <h3 className="text-lg font-medium">Basic Information</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="title">
                    Case Study Title <span className="text-destructive">*</span>
                  </Label>
                  <Input
                    id="title"
                    {...register('title')}
                    placeholder="e.g., Complete Superyacht Refit Project"
                  />
                  {errors.title && (
                    <p className="text-sm text-destructive">{errors.title.message}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="yachtName">Yacht Name</Label>
                  <Input
                    id="yachtName"
                    {...register('yachtName')}
                    placeholder="e.g., M/Y Eclipse"
                  />
                  {errors.yachtName && (
                    <p className="text-sm text-destructive">{errors.yachtName.message}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="projectDate">Project Date</Label>
                  <Input
                    id="projectDate"
                    type="month"
                    {...register('projectDate')}
                  />
                  {errors.projectDate && (
                    <p className="text-sm text-destructive">{errors.projectDate.message}</p>
                  )}
                </div>

                <div className="space-y-2 flex items-center">
                  <Switch
                    id="featured"
                    checked={watchedFeatured || false}
                    onCheckedChange={(checked) => setValue('featured', checked)}
                  />
                  <Label htmlFor="featured" className="ml-2 cursor-pointer">
                    Featured Case Study
                  </Label>
                </div>
              </div>
            </div>

            {/* Project Details */}
            <div className="space-y-4">
              <h3 className="text-lg font-medium">Project Details</h3>

              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <Label htmlFor="challenge">
                    Challenge <span className="text-destructive">*</span>
                  </Label>
                  <HelpTooltip
                    content="Describe the client's problem or need that you addressed."
                    title="Challenge"
                  />
                </div>
                <Textarea
                  id="challenge"
                  {...register('challenge')}
                  placeholder="Describe the challenge or problem that needed to be solved..."
                  rows={4}
                  className="resize-y"
                />
                {errors.challenge && (
                  <p className="text-sm text-destructive">{errors.challenge.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <Label htmlFor="solution">
                    Solution <span className="text-destructive">*</span>
                  </Label>
                  <HelpTooltip
                    content="Explain the approach and methods you used to solve the problem."
                    title="Solution"
                  />
                </div>
                <Textarea
                  id="solution"
                  {...register('solution')}
                  placeholder="Explain the solution you implemented..."
                  rows={4}
                  className="resize-y"
                />
                {errors.solution && (
                  <p className="text-sm text-destructive">{errors.solution.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <Label htmlFor="results">
                    Results <span className="text-destructive">*</span>
                  </Label>
                  <HelpTooltip
                    content="Describe measurable outcomes and benefits achieved for the client."
                    title="Results"
                  />
                </div>
                <Textarea
                  id="results"
                  {...register('results')}
                  placeholder="Describe the outcomes and measurable results..."
                  rows={4}
                  className="resize-y"
                />
                {errors.results && (
                  <p className="text-sm text-destructive">{errors.results.message}</p>
                )}
              </div>
            </div>

            {/* Client Testimony */}
            <div className="space-y-4">
              <h3 className="text-lg font-medium">Client Testimony (Optional)</h3>

              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <Label htmlFor="testimonyQuote">Quote</Label>
                  <HelpTooltip
                    content="Direct quote from the client about their experience working with you."
                    title="Client Quote"
                  />
                </div>
                <Textarea
                  id="testimonyQuote"
                  {...register('testimonyQuote')}
                  placeholder="Enter client testimonial..."
                  rows={3}
                />
                {errors.testimonyQuote && (
                  <p className="text-sm text-destructive">{errors.testimonyQuote.message}</p>
                )}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <Label htmlFor="testimonyAuthor">Author Name</Label>
                    <HelpTooltip
                      content="Name of the person providing the testimonial."
                      title="Author Name"
                    />
                  </div>
                  <Input
                    id="testimonyAuthor"
                    {...register('testimonyAuthor')}
                    placeholder="e.g., John Smith"
                  />
                  {errors.testimonyAuthor && (
                    <p className="text-sm text-destructive">{errors.testimonyAuthor.message}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <Label htmlFor="testimonyRole">Author Role</Label>
                    <HelpTooltip
                      content="Title or role of the person (e.g., Yacht Owner, Captain)."
                      title="Author Role"
                    />
                  </div>
                  <Input
                    id="testimonyRole"
                    {...register('testimonyRole')}
                    placeholder="e.g., Yacht Owner"
                  />
                  {errors.testimonyRole && (
                    <p className="text-sm text-destructive">{errors.testimonyRole.message}</p>
                  )}
                </div>
              </div>
            </div>

            {/* Image Gallery */}
            <div className="space-y-4">
              <h3 className="text-lg font-medium">Image Gallery (Optional)</h3>

              <div className="space-y-2">
                <Label>Add Image URL</Label>
                <div className="flex gap-2">
                  <Input
                    value={newImageUrl}
                    onChange={(e) => setNewImageUrl(e.target.value)}
                    placeholder="https://example.com/image.jpg"
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        handleAddImage();
                      }
                    }}
                  />
                  <Button type="button" onClick={handleAddImage} variant="secondary">
                    <Plus className="h-4 w-4" />
                  </Button>
                </div>
              </div>

              {imageUrls.length > 0 && (
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                  {imageUrls.map((url, index) => (
                    <div key={`image-${url || index}`} className="relative group">
                      <div className="aspect-video bg-muted rounded-md overflow-hidden">
                        <img
                          src={url}
                          alt={`Image ${index + 1}`}
                          className="w-full h-full object-cover"
                          onError={(e) => {
                            e.currentTarget.src = '';
                            e.currentTarget.alt = 'Invalid image';
                          }}
                        />
                      </div>
                      <Button
                        type="button"
                        variant="destructive"
                        size="sm"
                        className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity"
                        onClick={() => handleRemoveImage(index)}
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  setModalOpen(false);
                  reset(CASE_STUDY_DEFAULT_VALUES);
                  setImageUrls([]);
                }}
              >
                Cancel
              </Button>
              <Button type="submit">
                {editingIndex !== null ? 'Update' : 'Add'} Case Study
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Case Study</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete this case study? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={handleDeleteCancel}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={handleDeleteConfirm}>
              <Trash2 className="h-4 w-4 mr-2" />
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
