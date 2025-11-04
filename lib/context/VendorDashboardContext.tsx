'use client';

import React, { createContext, useContext, useState, useCallback, useMemo } from 'react';
import useSWR from 'swr';
import { Vendor } from '@/lib/types';
import { computeYearsInBusiness } from '@/components/vendors/YearsInBusinessDisplay';
import { toast } from 'sonner';

/**
 * Fields that are allowed to be updated via the API
 * This is a safelist of fields that can be sent in update requests
 */
const ALLOWED_UPDATE_FIELDS = new Set([
  'name',
  'companyName',
  'slug',
  'description',
  'logo',
  'contactEmail',
  'contactPhone',
  'website',
  'linkedinUrl',
  'twitterUrl',
  // Relational arrays are managed separately - DO NOT include:
  // 'certifications', 'awards', 'teamMembers', 'caseStudies', 'locations'
  'foundedYear',
  'longDescription',
  'totalProjects',
  'employeeCount',
  'linkedinFollowers',
  'instagramFollowers',
  'clientSatisfactionScore',
  'repeatClientPercentage',
  'videoUrl',
  'videoThumbnail',
  'videoDuration',
  'videoTitle',
  'videoDescription',
  'serviceAreas',
  'companyValues',
]);

/**
 * Filter vendor payload to only include updatable fields
 * and convert empty strings to undefined for optional fields
 *
 * CRITICAL FIX: Maps 'name' field to 'companyName' for Payload CMS compatibility.
 * The Vendor interface uses 'name', but Payload collection schema uses 'companyName'.
 */
function filterVendorPayload(vendor: any): Record<string, any> {
  const filtered: Record<string, any> = {};

  Object.entries(vendor).forEach(([key, value]) => {
    // Only include fields that are in the allowed list
    if (!ALLOWED_UPDATE_FIELDS.has(key)) {
      return;
    }

    // CRITICAL FIX: Map 'name' to 'companyName' for Payload CMS
    // This ensures data sent to Payload matches the database schema
    const payloadFieldName = key === 'name' ? 'companyName' : key;

    // Convert empty strings, null, and empty arrays to undefined for optional fields
    // Don't include undefined values or empty arrays in payload - let backend tier validation handle it
    if (value === '' || value === null || value === undefined) {
      return; // Skip this field entirely
    }

    // Skip empty arrays - they may be tier-restricted fields
    if (Array.isArray(value) && value.length === 0) {
      return;
    }

    // Include the field
    filtered[payloadFieldName] = value;
  });

  console.log('[VendorDashboardContext] Filtered payload:', {
    originalFields: Object.keys(vendor),
    filteredFields: Object.keys(filtered),
    excludedFields: Object.keys(vendor).filter(k => !ALLOWED_UPDATE_FIELDS.has(k)),
    nameMapped: 'name' in vendor && 'companyName' in filtered && !('name' in filtered),
  });

  return filtered;
}

export interface VendorDashboardContextValue {
  // Data
  vendor: Vendor | null;
  isLoading: boolean;
  error: Error | null;

  // Computed values
  yearsInBusiness: number | null;

  // State
  activeTab: string;
  isDirty: boolean;
  isSaving: boolean;

  // Actions
  updateVendor: (data: Partial<Vendor>) => void;
  saveVendor: (vendorData?: Vendor | null) => Promise<void>;
  setActiveTab: (tab: string) => void;
  refreshVendor: () => Promise<void>;
  markDirty: (dirty: boolean) => void;
}

const VendorDashboardContext = createContext<VendorDashboardContextValue | undefined>(undefined);

const fetcher = (url: string) => fetch(url).then(async (res) => {
  if (!res.ok) throw new Error('Failed to fetch vendor');
  const json = await res.json();
  console.log('[VendorDashboardContext] Fetcher received:', json);
  // API returns { success: true, data: vendor }, extract the vendor data
  return json.success ? json.data : json;
});

export interface VendorDashboardProviderProps {
  children: React.ReactNode;
  vendorId?: string;
  initialData?: Vendor;
}

/**
 * VendorDashboardProvider
 *
 * Provides vendor dashboard state and actions using SWR for data fetching
 */
export function VendorDashboardProvider({
  children,
  vendorId,
  initialData,
}: VendorDashboardProviderProps) {
  const [activeTab, setActiveTab] = useState<string>('basic');
  const [isDirty, setIsDirty] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [localVendor, setLocalVendor] = useState<Vendor | null>(initialData || null);

  // Fetch vendor data with SWR
  // Use byUserId=true to look up vendor by user_id
  const { data, error, mutate, isLoading } = useSWR<Vendor>(
    vendorId ? `/api/portal/vendors/${vendorId}?byUserId=true` : null,
    fetcher,
    {
      fallbackData: initialData,
      revalidateOnFocus: false,
      onSuccess: (data) => {
        console.log('[VendorDashboardContext] onSuccess - Vendor loaded:', {
          id: data?.id,
          hasName: 'name' in (data || {}),
          name: data?.name,
          hasCompanyName: 'companyName' in (data || {}),
          companyName: data?.companyName,
          contactEmail: data?.contactEmail,
        });
        setLocalVendor(data);
      },
    }
  );

  const vendor = localVendor || data || null;

  // Compute years in business
  const yearsInBusiness = useMemo(
    () => computeYearsInBusiness(vendor?.foundedYear),
    [vendor?.foundedYear]
  );

  /**
   * Update vendor data locally (optimistic update)
   */
  const updateVendor = useCallback((updates: Partial<Vendor>) => {
    setLocalVendor((prev) => {
      if (!prev) return prev;
      return { ...prev, ...updates };
    });
    setIsDirty(true);
  }, []);

  /**
   * Save vendor data to API
   * @param vendorData - Optional vendor data to save. If not provided, uses current vendor state.
   */
  const saveVendor = useCallback(async (vendorData?: Vendor | null) => {
    const dataToSave = vendorData || vendor;
    console.log('[VendorDashboardContext] saveVendor called');
    console.log('[VendorDashboardContext] vendor data:', dataToSave);

    if (!dataToSave) {
      console.error('[VendorDashboardContext] No vendor data to save');
      toast.error('No vendor data to save');
      return;
    }

    setIsSaving(true);
    console.log('[VendorDashboardContext] isSaving set to true');

    try {
      const url = `/api/portal/vendors/${dataToSave.id}`;

      // CRITICAL FIX: Filter payload to only include updatable fields and convert empty strings
      const payloadToSend = filterVendorPayload(dataToSave);

      console.log('[VendorDashboardContext] Making PUT request to:', url);
      console.log('[VendorDashboardContext] Filtered request body:', JSON.stringify(payloadToSend, null, 2));

      // Use vendor.id for PUT (actual vendor ID, not user ID)
      const response = await fetch(url, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include', // Include authentication cookies
        body: JSON.stringify(payloadToSend),
      });

      console.log('[VendorDashboardContext] Response status:', response.status);

      const responseData = await response.json();
      console.log('[VendorDashboardContext] Response data:', responseData);

      if (!response.ok) {
        // Handle nested error structure from API
        const errorMessage = typeof responseData.error === 'string'
          ? responseData.error
          : responseData.error?.message || 'Failed to save vendor';
        console.error('[VendorDashboardContext] API error:', errorMessage);
        throw new Error(errorMessage);
      }

      // Extract vendor from nested data structure: { success: true, data: { vendor, message } }
      const updatedVendor = responseData.data?.vendor || responseData.data || responseData;
      console.log('[VendorDashboardContext] Updated vendor:', updatedVendor);

      // Update SWR cache
      await mutate(updatedVendor, { revalidate: false });
      setLocalVendor(updatedVendor);
      setIsDirty(false);

      console.log('[VendorDashboardContext] Save successful');
      toast.success('Profile saved successfully');
    } catch (error) {
      console.error('[VendorDashboardContext] Error saving vendor:', error);
      toast.error(error instanceof Error ? error.message : 'Failed to save profile');
      throw error;
    } finally {
      setIsSaving(false);
      console.log('[VendorDashboardContext] isSaving set to false');
    }
  }, [vendor, mutate]);

  /**
   * Refresh vendor data from API
   */
  const refreshVendor = useCallback(async () => {
    await mutate();
  }, [mutate]);

  /**
   * Mark form as dirty or clean
   */
  const markDirty = useCallback((dirty: boolean) => {
    setIsDirty(dirty);
  }, []);

  const value: VendorDashboardContextValue = {
    vendor,
    isLoading,
    error: error || null,
    yearsInBusiness,
    activeTab,
    isDirty,
    isSaving,
    updateVendor,
    saveVendor,
    setActiveTab,
    refreshVendor,
    markDirty,
  };

  return (
    <VendorDashboardContext.Provider value={value}>
      {children}
    </VendorDashboardContext.Provider>
  );
}

/**
 * Hook to access VendorDashboard context
 */
export function useVendorDashboard(): VendorDashboardContextValue {
  const context = useContext(VendorDashboardContext);
  if (!context) {
    throw new Error('useVendorDashboard must be used within VendorDashboardProvider');
  }
  return context;
}

export default VendorDashboardContext;
