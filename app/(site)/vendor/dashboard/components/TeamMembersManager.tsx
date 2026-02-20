'use client';

import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Alert, AlertDescription } from '@/components/ui/alert';
import {
  Loader2, Save, Plus, Edit2, Trash2, GripVertical, Mail,
  User, Linkedin, Info
} from 'lucide-react';
import { TeamMember, Vendor } from '@/lib/types';
import { useVendorDashboard } from '@/lib/context/VendorDashboardContext';
import { TierService } from '@/lib/services/TierService';
import { TierUpgradePrompt } from '@/components/dashboard/TierUpgradePrompt';
import { HelpTooltip, CharacterCounter } from '@/components/help';

// Validation schema
const teamMemberSchema = z.object({
  name: z.string().min(1, 'Name is required').max(200),
  role: z.string().min(1, 'Role is required').max(200),
  bio: z.string().max(1000).optional().or(z.literal('')),
  image: z.string().url('Must be a valid URL').optional().or(z.literal('')),
  linkedin: z.string()
    .refine((val) => {
      if (!val || val === '') return true;
      return /^https?:\/\/(www\.)?linkedin\.com\/in\/[a-zA-Z0-9_-]+\/?$/.test(val);
    }, 'Must be a valid LinkedIn profile URL (e.g., https://linkedin.com/in/username)')
    .optional()
    .or(z.literal('')),
  email: z.string().email('Must be a valid email').optional().or(z.literal('')),
  order: z.number().min(0).optional().nullable(),
});

type TeamMemberFormData = z.infer<typeof teamMemberSchema>;

// Default values
const TEAM_MEMBER_DEFAULT_VALUES: TeamMemberFormData = {
  name: '',
  role: '',
  bio: '',
  image: '',
  linkedin: '',
  email: '',
  order: null,
};

export interface TeamMembersManagerProps {
  vendor: Vendor;
}

/**
 * TeamMembersManager Component
 *
 * Manages team members for vendor profiles (Tier 1+)
 *
 * Features:
 * - Team member CRUD with name, role, bio, photo, LinkedIn, email
 * - Photo upload with preview
 * - LinkedIn URL validation with icon display
 * - Email field with privacy note
 * - Drag-to-reorder for display order
 * - Card preview with circular photo, name, role
 * - Delete confirmation dialogs
 * - Tier 1+ access control with upgrade prompt
 */
export function TeamMembersManager({ vendor }: TeamMembersManagerProps) {
  const { updateVendor, saveVendor, markDirty } = useVendorDashboard();
  const [teamMembers, setTeamMembers] = useState<TeamMember[]>(vendor.teamMembers || []);
  const [prevVendorTeamMembers, setPrevVendorTeamMembers] = useState(vendor.teamMembers);

  // Sync with vendor prop changes (avoids useEffect double-render)
  if (vendor.teamMembers !== prevVendorTeamMembers) {
    setPrevVendorTeamMembers(vendor.teamMembers);
    setTeamMembers(vendor.teamMembers || []);
  }

  // Modal states
  const [modalOpen, setModalOpen] = useState(false);
  const [editingIndex, setEditingIndex] = useState<number | null>(null);
  const [deletingIndex, setDeletingIndex] = useState<number | null>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);

  // Drag and drop state
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null);

  // Search state
  const [searchQuery, setSearchQuery] = useState('');
  const [isSaving, setIsSaving] = useState(false);

  const tierLevel = TierService.getTierLevel(vendor.tier);
  const hasTierAccess = tierLevel >= 1;

  // Form setup
  const {
    register,
    handleSubmit,
    formState: { errors, isDirty },
    reset,
    watch,
    setValue,
  } = useForm<TeamMemberFormData>({
    resolver: zodResolver(teamMemberSchema),
    defaultValues: TEAM_MEMBER_DEFAULT_VALUES,
  });

  // Watch fields for UI updates
  const watchedImage = watch('image');
  const watchedLinkedin = watch('linkedin');
  const watchedBio = watch('bio');
  const bioLength = watchedBio?.length || 0;

  // Filter team members by search
  const filteredMembers = teamMembers.filter((member) =>
    member.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    member.role.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Sort by order
  const sortedMembers = [...filteredMembers].sort((a, b) => (a.order || 0) - (b.order || 0));

  // Handle add new team member
  const handleAdd = () => {
    if (!hasTierAccess) return;
    setEditingIndex(null);
    reset(TEAM_MEMBER_DEFAULT_VALUES);
    setModalOpen(true);
  };

  // Handle edit team member
  const handleEdit = (index: number) => {
    const actualIndex = teamMembers.indexOf(sortedMembers[index]);
    const member = teamMembers[actualIndex];
    setEditingIndex(actualIndex);
    reset({
      name: member.name,
      role: member.role,
      bio: member.bio || '',
      image: member.image || '',
      linkedin: member.linkedin || '',
      email: member.email || '',
      order: member.order || null,
    });
    setModalOpen(true);
  };

  // Handle delete confirmation
  const handleDeleteClick = (index: number) => {
    const actualIndex = teamMembers.indexOf(sortedMembers[index]);
    setDeletingIndex(actualIndex);
    setDeleteDialogOpen(true);
  };

  // Handle delete team member
  const handleDeleteConfirm = async () => {
    if (deletingIndex === null) return;

    const updatedMembers = teamMembers.filter((_, i) => i !== deletingIndex);
    setTeamMembers(updatedMembers);
    updateVendor({ teamMembers: updatedMembers });
    markDirty(true);

    setDeleteDialogOpen(false);
    setDeletingIndex(null);

    // Auto-save - pass merged data directly to avoid React setState race condition
    const mergedVendor = { ...vendor, teamMembers: updatedMembers };
    setIsSaving(true);
    try {
      await saveVendor(mergedVendor as Vendor);
    } catch {
      // Error toast is handled by saveVendor in VendorDashboardContext
    } finally {
      setIsSaving(false);
    }
  };

  // Handle form submit
  const onSubmit = async (data: TeamMemberFormData) => {
    let updatedMembers: TeamMember[];

    if (editingIndex !== null) {
      // Edit existing
      updatedMembers = teamMembers.map((member, i) =>
        i === editingIndex
          ? {
              ...member,
              name: data.name,
              role: data.role,
              bio: data.bio || '',
              image: data.image || undefined,
              linkedin: data.linkedin || undefined,
              email: data.email || undefined,
              order: data.order || member.order || 0,
              updatedAt: new Date().toISOString(),
            }
          : member
      );
    } else {
      // Add new
      const newMember: TeamMember = {
        id: `team-${Date.now()}`,
        name: data.name,
        role: data.role,
        bio: data.bio || '',
        image: data.image || undefined,
        linkedin: data.linkedin || undefined,
        email: data.email || undefined,
        order: data.order || teamMembers.length,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      updatedMembers = [...teamMembers, newMember];
    }

    setTeamMembers(updatedMembers);
    updateVendor({ teamMembers: updatedMembers });
    markDirty(true);
    setModalOpen(false);
    reset(TEAM_MEMBER_DEFAULT_VALUES);

    // Auto-save - pass merged data directly to avoid React setState race condition
    const mergedVendor = { ...vendor, teamMembers: updatedMembers };
    setIsSaving(true);
    try {
      await saveVendor(mergedVendor as Vendor);
    } catch {
      // Error toast is handled by saveVendor in VendorDashboardContext
    } finally {
      setIsSaving(false);
    }
  };

  // Drag and drop handlers
  const handleDragStart = (index: number) => {
    setDraggedIndex(index);
  };

  const handleDragOver = (e: React.DragEvent, index: number) => {
    e.preventDefault();
    if (draggedIndex === null || draggedIndex === index) return;

    const items = [...sortedMembers];
    const draggedItem = items[draggedIndex];
    items.splice(draggedIndex, 1);
    items.splice(index, 0, draggedItem);

    // Update order based on new positions
    const reorderedMembers = items.map((item, i) => ({
      ...item,
      order: i,
      updatedAt: new Date().toISOString(),
    }));

    setTeamMembers(reorderedMembers);
    setDraggedIndex(index);
  };

  const handleDragEnd = async () => {
    setDraggedIndex(null);
    updateVendor({ teamMembers });
    markDirty(true);

    // Auto-save - pass merged data directly to avoid React setState race condition
    const mergedVendor = { ...vendor, teamMembers };
    setIsSaving(true);
    try {
      await saveVendor(mergedVendor as Vendor);
    } catch {
      // Error toast is handled by saveVendor in VendorDashboardContext
    } finally {
      setIsSaving(false);
    }
  };

  // If no tier access, show upgrade prompt
  if (!hasTierAccess) {
    return (
      <TierUpgradePrompt
        currentTier={vendor.tier || 'free'}
        requiredTier="tier1"
        featureName="Team Members"
      />
    );
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <User className="h-5 w-5" />
                Team Members
              </CardTitle>
              <CardDescription>
                Showcase your team with photos, roles, and professional profiles
              </CardDescription>
            </div>
            <Button onClick={handleAdd} disabled={isSaving}>
              <Plus className="h-4 w-4 mr-2" />
              Add Team Member
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {/* Search */}
          <div className="mb-4">
            <Input
              type="text"
              placeholder="Search team members..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="max-w-sm"
            />
          </div>

          {/* Team Member Cards */}
          {sortedMembers.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              <User className="h-12 w-12 mx-auto mb-4 opacity-20" />
              <p>No team members yet. Add your first team member to get started.</p>
            </div>
          ) : (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {sortedMembers.map((member, index) => (
                <Card
                  key={member.id}
                  draggable
                  onDragStart={() => handleDragStart(index)}
                  onDragOver={(e) => handleDragOver(e, index)}
                  onDragEnd={handleDragEnd}
                  className={`cursor-move hover:shadow-md transition-shadow ${
                    draggedIndex === index ? 'opacity-50' : ''
                  }`}
                >
                  <CardContent className="pt-6">
                    <div className="flex items-start gap-4">
                      <GripVertical className="h-5 w-5 text-muted-foreground mt-1 flex-shrink-0" />
                      <div className="flex-1 min-w-0">
                        {/* Photo */}
                        <div className="mb-4">
                          {member.image ? (
                            <img
                              src={member.image}
                              alt={member.name}
                              className="h-20 w-20 rounded-full object-cover mx-auto"
                            />
                          ) : (
                            <div className="h-20 w-20 rounded-full bg-muted flex items-center justify-center mx-auto">
                              <User className="h-10 w-10 text-muted-foreground" />
                            </div>
                          )}
                        </div>

                        {/* Name and Role */}
                        <div className="text-center mb-3">
                          <h3 className="font-semibold text-base truncate">{member.name}</h3>
                          <p className="text-sm text-muted-foreground truncate">{member.role}</p>
                        </div>

                        {/* Bio excerpt */}
                        {member.bio && (
                          <p className="text-xs text-muted-foreground line-clamp-2 mb-3">
                            {member.bio}
                          </p>
                        )}

                        {/* Links */}
                        <div className="flex items-center justify-center gap-2 mb-3">
                          {member.linkedin && (
                            <a
                              href={member.linkedin}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-accent hover:text-accent"
                            >
                              <Linkedin className="h-4 w-4" />
                            </a>
                          )}
                          {member.email && (
                            <a
                              href={`mailto:${member.email}`}
                              className="text-muted-foreground hover:text-foreground"
                            >
                              <Mail className="h-4 w-4" />
                            </a>
                          )}
                        </div>

                        {/* Actions */}
                        <div className="flex gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleEdit(index)}
                            className="flex-1"
                          >
                            <Edit2 className="h-3 w-3 mr-1" />
                            Edit
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleDeleteClick(index)}
                            className="flex-1"
                          >
                            <Trash2 className="h-3 w-3 mr-1" />
                            Delete
                          </Button>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </CardContent>
        {isSaving && (
          <CardFooter>
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Loader2 className="h-4 w-4 animate-spin" />
              Saving changes...
            </div>
          </CardFooter>
        )}
      </Card>

      {/* Add/Edit Modal */}
      <Dialog open={modalOpen} onOpenChange={setModalOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {editingIndex !== null ? 'Edit Team Member' : 'Add Team Member'}
            </DialogTitle>
            <DialogDescription>
              Add team members to showcase your expertise and build trust with potential clients.
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            {/* Name */}
            <div className="space-y-2">
              <Label htmlFor="name">
                Name <span className="text-red-500">*</span>
              </Label>
              <Input
                id="name"
                {...register('name')}
                placeholder="e.g., John Smith"
              />
              {errors.name && (
                <p className="text-sm text-red-500">{errors.name.message}</p>
              )}
            </div>

            {/* Role */}
            <div className="space-y-2">
              <Label htmlFor="role">
                Role / Title <span className="text-red-500">*</span>
              </Label>
              <Input
                id="role"
                {...register('role')}
                placeholder="e.g., Chief Engineer, Sales Director"
              />
              {errors.role && (
                <p className="text-sm text-red-500">{errors.role.message}</p>
              )}
            </div>

            {/* Bio */}
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <Label htmlFor="bio">Bio</Label>
                <HelpTooltip
                  content="Brief professional biography highlighting expertise and experience."
                  title="Bio"
                />
              </div>
              <Textarea
                id="bio"
                {...register('bio')}
                placeholder="Brief professional biography..."
                rows={4}
                className="resize-none"
              />
              {errors.bio && (
                <p className="text-sm text-red-500">{errors.bio.message}</p>
              )}
              <div className="flex justify-end">
                <CharacterCounter current={bioLength} max={1000} />
              </div>
            </div>

            {/* Photo URL */}
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <Label htmlFor="image">Photo URL</Label>
                <HelpTooltip
                  content="Use a professional headshot. Square images (1:1 ratio) work best."
                  title="Team Photo"
                />
              </div>
              <Input
                id="image"
                {...register('image')}
                placeholder="https://example.com/photo.jpg"
              />
              {errors.image && (
                <p className="text-sm text-red-500">{errors.image.message}</p>
              )}
              {watchedImage && (
                <div className="mt-2">
                  <img
                    src={watchedImage}
                    alt="Preview"
                    className="h-24 w-24 rounded-full object-cover"
                    onError={(e) => {
                      (e.target as HTMLImageElement).style.display = 'none';
                    }}
                  />
                </div>
              )}
            </div>

            {/* LinkedIn URL */}
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <Label htmlFor="linkedin" className="flex items-center gap-2">
                  <Linkedin className="h-4 w-4 text-accent" />
                  LinkedIn Profile URL
                </Label>
                <HelpTooltip
                  content="Enter full LinkedIn profile URL (e.g., https://linkedin.com/in/username)."
                  title="LinkedIn Profile"
                />
              </div>
              <Input
                id="linkedin"
                {...register('linkedin')}
                placeholder="https://linkedin.com/in/username"
              />
              {errors.linkedin && (
                <p className="text-sm text-red-500">{errors.linkedin.message}</p>
              )}
              {watchedLinkedin && !errors.linkedin && (
                <a
                  href={watchedLinkedin}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-sm text-accent hover:underline inline-flex items-center gap-1"
                >
                  <Linkedin className="h-3 w-3" />
                  View LinkedIn Profile
                </a>
              )}
            </div>

            {/* Email */}
            <div className="space-y-2">
              <Label htmlFor="email" className="flex items-center gap-2">
                <Mail className="h-4 w-4" />
                Email
              </Label>
              <Input
                id="email"
                type="email"
                {...register('email')}
                placeholder="email@example.com"
              />
              {errors.email && (
                <p className="text-sm text-red-500">{errors.email.message}</p>
              )}
              <Alert>
                <Info className="h-4 w-4" />
                <AlertDescription className="text-xs">
                  This email will be visible on your public profile. Only include if you want to receive inquiries.
                </AlertDescription>
              </Alert>
            </div>

            {/* Display Order */}
            <div className="space-y-2">
              <Label htmlFor="order">Display Order</Label>
              <Input
                id="order"
                type="number"
                {...register('order', { valueAsNumber: true })}
                placeholder="0"
                min="0"
              />
              {errors.order && (
                <p className="text-sm text-red-500">{errors.order.message}</p>
              )}
              <p className="text-xs text-muted-foreground">
                Lower numbers appear first. You can also drag and drop to reorder.
              </p>
            </div>

            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => setModalOpen(false)}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={!isDirty}>
                <Save className="h-4 w-4 mr-2" />
                {editingIndex !== null ? 'Update' : 'Add'} Team Member
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Team Member</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete{' '}
              <strong>
                {deletingIndex !== null ? teamMembers[deletingIndex]?.name : ''}
              </strong>
              ? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setDeleteDialogOpen(false)}
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={handleDeleteConfirm}
            >
              <Trash2 className="h-4 w-4 mr-2" />
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
