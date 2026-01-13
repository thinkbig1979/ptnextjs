'use client';

import React, { useState, useCallback, useMemo, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { MapPin, Plus, Edit, Loader2, Trash2, Check } from 'lucide-react';
import { toast } from 'sonner';
import { VendorLocation } from '@/lib/types';
import { useTierAccess } from '@/hooks/useTierAccess';
import { LocationFormFields } from './LocationFormFields';
import { TierUpgradePrompt } from './TierUpgradePrompt';
import { HelpTooltip } from '@/components/help';

export interface LocationsManagerCardProps {
  vendor: {
    id: string;
    name: string;
    tier: string;
    locations?: VendorLocation[];
  };
  onUpdate?: (updatedLocations: VendorLocation[]) => void;
}

/**
 * LocationsManagerCard Component
 *
 * Allows all vendors to manage their office locations.
 * Free/Tier1: 1 location (HQ only)
 * Tier2: 5 locations
 * Tier3: Unlimited locations
 */
export function LocationsManagerCard({ vendor, onUpdate }: LocationsManagerCardProps) {
  const { tier, upgradePath, canAddLocation, maxLocations } = useTierAccess('multipleLocations', vendor.tier);

  const [locations, setLocations] = useState<VendorLocation[]>(vendor.locations || []);
  const [editingIndex, setEditingIndex] = useState<number | null>(null);
  const [deleteConfirmIndex, setDeleteConfirmIndex] = useState<number | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  // Sync locations state with vendor.locations prop when it changes
  useEffect(() => {
    if (vendor.locations && vendor.locations.length > 0) {
      setLocations(vendor.locations);
    }
  }, [vendor.locations]);

  /**
   * Find the HQ location index
   */
  const hqIndex = useMemo(() => {
    return locations.findIndex((loc) => loc.isHQ);
  }, [locations]);

  /**
   * Check if location is currently being edited
   */
  const isEditing = editingIndex !== null;

  /**
   * Add a new empty location
   */
  const handleAddLocation = useCallback(() => {
    // Check tier limits before allowing add - use max of state and prop counts
    const currentCount = Math.max(locations.length, vendor.locations?.length || 0);
    if (!canAddLocation(currentCount)) {
      toast.error(`You've reached the maximum of ${maxLocations} location${maxLocations === 1 ? '' : 's'} for your ${tier} tier. Upgrade to add more.`);
      return;
    }

    const newLocation: VendorLocation = {
      id: `temp-${Date.now()}`,
      locationName: '',
      address: '',
      city: '',
      country: '',
      postalCode: '',
      latitude: undefined,
      longitude: undefined,
      isHQ: locations.length === 0, // First location is HQ by default
    };
    setLocations((prev) => [...prev, newLocation]);
    setEditingIndex(locations.length); // Start editing the new location
  }, [locations.length, vendor.locations?.length, canAddLocation, maxLocations, tier]);

  /**
   * Update a specific location
   */
  const handleUpdateLocation = useCallback(
    (index: number, updatedLocation: VendorLocation) => {
      setLocations((prev) => {
        const newLocations = [...prev];

        // If setting this location as HQ, unset HQ from all others
        if (updatedLocation.isHQ && index !== hqIndex) {
          newLocations.forEach((loc, i) => {
            if (i !== index) {
              loc.isHQ = false;
            }
          });
        }

        newLocations[index] = updatedLocation;
        return newLocations;
      });
    },
    [hqIndex]
  );

  /**
   * Delete a location (with confirmation)
   */
  const handleDeleteLocation = useCallback((index: number) => {
    setDeleteConfirmIndex(index);
  }, []);

  /**
   * Confirm deletion
   */
  const confirmDelete = useCallback(() => {
    if (deleteConfirmIndex === null) return;

    const locationToDelete = locations[deleteConfirmIndex];

    // Prevent deleting HQ location
    if (locationToDelete.isHQ) {
      toast.error('Cannot delete headquarters location');
      setDeleteConfirmIndex(null);
      return;
    }

    setLocations((prev) => prev.filter((_, i) => i !== deleteConfirmIndex));
    setDeleteConfirmIndex(null);

    // If we were editing this location, clear the editing state
    if (editingIndex === deleteConfirmIndex) {
      setEditingIndex(null);
    }

    toast.success('Location deleted');
  }, [deleteConfirmIndex, locations, editingIndex]);

  /**
   * Save all locations to backend
   */
  const handleSaveLocations = useCallback(async () => {
    // Validate that we have at least one location
    if (locations.length === 0) {
      toast.error('You must have at least one location');
      return;
    }

    // Validate that we have exactly one HQ
    const hqCount = locations.filter((loc) => loc.isHQ).length;
    if (hqCount === 0) {
      toast.error('You must designate one location as headquarters');
      return;
    }
    if (hqCount > 1) {
      toast.error('Only one location can be designated as headquarters');
      return;
    }

    // Validate that all required fields are filled
    for (const loc of locations) {
      if (!loc.address || !loc.city || !loc.country || loc.latitude === undefined || loc.longitude === undefined) {
        toast.error('All locations must have address, city, country, and coordinates');
        return;
      }
    }

    setIsSaving(true);

    try {
      // Call the backend API to update vendor locations
      const response = await fetch(`/api/portal/vendors/${vendor.id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include', // Include auth cookies
        body: JSON.stringify({
          locations: locations,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to save locations');
      }

      const updatedVendor = await response.json();

      // Update local state with server response
      setLocations(updatedVendor.locations || locations);
      setEditingIndex(null);

      // Call the onUpdate callback if provided
      onUpdate?.(updatedVendor.locations || locations);

      toast.success('Locations saved successfully');
    } catch (error) {
      console.error('Error saving locations:', error);
      toast.error(error instanceof Error ? error.message : 'Failed to save locations');
    } finally {
      setIsSaving(false);
    }
  }, [locations, vendor.id, onUpdate]);

  /**
   * Toggle edit mode for a location
   */
  const handleEditLocation = useCallback((index: number) => {
    setEditingIndex((prev) => (prev === index ? null : index));
  }, []);

  // Check if the vendor can add more locations based on their tier
  // Use the maximum of state and prop counts to ensure we don't allow adding when at limit
  const effectiveLocationCount = Math.max(locations.length, vendor.locations?.length || 0);
  const canAddMore = canAddLocation(effectiveLocationCount);
  const atLocationLimit = !canAddMore && effectiveLocationCount > 0;

  return (
    <>
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <MapPin className="h-5 w-5" />
                Manage Locations
              </CardTitle>
              <CardDescription>
                Add and manage your office locations. One location must be designated as headquarters.
              </CardDescription>
              {/* Tier Limit Indicator */}
              <p className="text-sm text-muted-foreground mt-1">
                {locations.length} of {maxLocations === Infinity ? 'unlimited' : maxLocations} location{maxLocations === 1 ? '' : 's'} used ({tier})
              </p>
            </div>
            <div className="flex items-center gap-2">
              <Button onClick={handleAddLocation} size="sm" disabled={isEditing || !canAddMore}>
                <Plus className="h-4 w-4 mr-2" />
                Add Location
              </Button>
              <HelpTooltip
                title="Location Limits"
                content="Location limits by tier: Free/Tier 1 allows 1 location (HQ only), Tier 2 allows up to 5 locations, Tier 3 allows unlimited locations."
                side="left"
              />
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          {locations.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground dark:text-muted-foreground">
              <MapPin className="h-12 w-12 mx-auto mb-3 opacity-50" />
              <p>No locations added yet. Click "Add Location" to get started.</p>
            </div>
          ) : (
            <div className="space-y-4">
              {locations.map((location, index) => (
                <div key={location.id || index} className="relative">
                  {/* Location Header */}
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <h3 className="font-medium text-foreground dark:text-white">
                        {location.locationName || location.city || `Location ${index + 1}`}
                      </h3>
                      {location.isHQ && (
                        <Badge variant="default" className="text-xs">
                          Headquarters
                        </Badge>
                      )}
                    </div>
                    {editingIndex !== index && (
                      <div className="flex items-center gap-2">
                        <Button
                          onClick={() => handleEditLocation(index)}
                          variant="ghost"
                          size="sm"
                          aria-label="Edit"
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        {!location.isHQ && (
                          <Button
                            onClick={() => handleDeleteLocation(index)}
                            variant="ghost"
                            size="sm"
                            aria-label="Delete"
                          >
                            <Trash2 className="h-4 w-4 text-red-600" />
                          </Button>
                        )}
                      </div>
                    )}
                  </div>

                  {/* Location Display or Edit Form */}
                  {editingIndex === index ? (
                    <div className="space-y-3">
                      <LocationFormFields
                        location={location}
                        isHQ={location.isHQ || false}
                        onChange={(updated) => handleUpdateLocation(index, updated)}
                        onDelete={() => handleDeleteLocation(index)}
                        canEdit={true}
                      />
                      <div className="flex justify-end">
                        <Button
                          onClick={() => setEditingIndex(null)}
                          variant="outline"
                          size="sm"
                          className="gap-1"
                        >
                          <Check className="h-4 w-4" />
                          Done Editing
                        </Button>
                      </div>
                    </div>
                  ) : (
                    <div className="p-4 bg-muted dark:bg-muted rounded-lg text-sm space-y-1">
                      {location.address && (
                        <p className="text-foreground dark:text-muted-foreground">{location.address}</p>
                      )}
                      {(location.city || location.country) && (
                        <p className="text-muted-foreground dark:text-muted-foreground">
                          {[location.city, location.country].filter(Boolean).join(', ')}
                        </p>
                      )}
                      {location.latitude !== undefined && location.longitude !== undefined && (
                        <p className="text-muted-foreground dark:text-muted-foreground text-xs">
                          {location.latitude.toFixed(4)}, {location.longitude.toFixed(4)}
                        </p>
                      )}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}

          {/* Tier Limit Notice */}
          {atLocationLimit && (
            <div className="p-4 bg-muted/50 dark:bg-muted/30 rounded-lg border border-border">
              <p className="text-sm text-muted-foreground mb-2">
                You&apos;ve reached the maximum of {maxLocations} location{maxLocations === 1 ? '' : 's'} for your {tier} tier.
              </p>
              <TierUpgradePrompt
                currentTier={tier}
                requiredTier={upgradePath}
                featureName="More Locations"
                upgradePath={upgradePath}
                compact={true}
              />
            </div>
          )}

          {/* Save Button */}
          {locations.length > 0 && (
            <div className="pt-4 border-t border-border dark:border-border">
              <Button
                onClick={handleSaveLocations}
                disabled={isSaving || isLoading}
                className="w-full sm:w-auto"
                size="lg"
              >
                {isSaving ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Saving...
                  </>
                ) : (
                  'Save Locations'
                )}
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Delete Confirmation Dialog */}
      <Dialog open={deleteConfirmIndex !== null} onOpenChange={(open) => !open && setDeleteConfirmIndex(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Location</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete this location? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteConfirmIndex(null)}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={confirmDelete}>
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}

export default LocationsManagerCard;
