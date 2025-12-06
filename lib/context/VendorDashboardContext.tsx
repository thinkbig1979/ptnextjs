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

    if (!dataToSave) {
      toast.error('No vendor data to save');
      return;
    }

    setIsSaving(true);

    try {
      const url = `/api/portal/vendors/${dataToSave.id}`;

      // Filter payload to only include updatable fields and convert empty strings
      const payloadToSend = filterVendorPayload(dataToSave);

      // Use vendor.id for PUT (actual vendor ID, not user ID)
      const response = await fetch(url, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include', // Include authentication cookies
        body: JSON.stringify(payloadToSend),
      });

      const responseData = await response.json();

      if (!response.ok) {
        // Handle nested error structure from API
        const errorMessage = typeof responseData.error === 'string'
          ? responseData.error
          : responseData.error?.message || 'Failed to save vendor';
        throw new Error(errorMessage);
      }

      // Extract vendor from nested data structure: { success: true, data: { vendor, message } }
      const updatedVendor = responseData.data?.vendor || responseData.data || responseData;

      // Update SWR cache
      await mutate(updatedVendor, { revalidate: false });
      setLocalVendor(updatedVendor);
      setIsDirty(false);

      toast.success('Profile saved successfully');
    } catch (error) {
      if (process.env.NODE_ENV !== 'production') {
        console.error('[VendorDashboardContext] Error saving vendor:', error);
      }
      toast.error(error instanceof Error ? error.message : 'Failed to save profile');
      throw error;
    } finally {
      setIsSaving(false);
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
