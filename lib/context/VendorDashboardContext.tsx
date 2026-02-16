'use client';

import React, { createContext, useContext, useState, useCallback, useMemo } from 'react';
import useSWR from 'swr';
import { Vendor } from '@/lib/types';
import { computeYearsInBusiness } from '@/components/vendors/YearsInBusinessDisplay';
import { toast } from 'sonner';

/**
 * Fields that are allowed to be updated via the API
 * This is a safelist of fields that can be sent in update requests
 *
 * NOTE: 'name' is NOT included because:
 * 1. It's a computed field that mirrors 'companyName' (added by VendorComputedFieldsService)
 * 2. The API/database only uses 'companyName'
 * 3. If both are present, Object.entries iteration order could cause 'name' to overwrite 'companyName'
 */
const ALLOWED_UPDATE_FIELDS = new Set([
  'companyName',
  'slug',
  'description',
  // 'logo' is an upload field (media relationship) - managed separately via upload endpoint
  'contactEmail',
  'contactPhone',
  'website',
  'linkedinUrl',
  'twitterUrl',
  // Array fields - transformed server-side by VendorProfileService before reaching Payload
  'certifications',
  'awards',
  'teamMembers',
  'caseStudies',
  'mediaGallery',
  // 'locations' is managed separately via its own save flow
  'foundedYear',
  // 'longDescription' is a richText field (Lexical JSON) - plain text from Textarea will cause validation errors
  'totalProjects',
  'employeeCount',
  'linkedinFollowers',
  'instagramFollowers',
  'clientSatisfactionScore',
  'repeatClientPercentage',
  'videoUrl',
  // 'videoThumbnail' is an upload field (media relationship) - same as logo, managed separately
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
 * NOTE: The 'name' field is excluded from ALLOWED_UPDATE_FIELDS because it's
 * a computed field that mirrors 'companyName'. Only 'companyName' should be sent
 * to the API to ensure updates persist correctly.
 */
function filterVendorPayload(vendor: any): Record<string, any> {
  const filtered: Record<string, any> = {};

  Object.entries(vendor).forEach(([key, value]) => {
    // Only include fields that are in the allowed list
    if (!ALLOWED_UPDATE_FIELDS.has(key)) {
      return;
    }

    // Convert empty strings, null, and empty arrays to undefined for optional fields
    // Don't include undefined values or empty arrays in payload - let backend tier validation handle it
    if (value === '' || value === null || value === undefined) {
      return; // Skip this field entirely
    }

    // Skip empty arrays - they may be tier-restricted fields
    if (Array.isArray(value) && value.length === 0) {
      return;
    }

    // Filter empty entries from array fields (e.g., companyValues, serviceAreas)
    // Payload requires non-empty values for required sub-fields
    if (Array.isArray(value)) {
      const cleanedArray = value.filter((item: any) => {
        if (typeof item === 'string') return item.trim() !== '';
        if (typeof item === 'object' && item !== null) {
          // Filter objects with empty required fields (e.g., { value: '' })
          const vals = Object.values(item).filter(v => v !== null && v !== undefined);
          return vals.some(v => typeof v === 'string' ? v.trim() !== '' : true);
        }
        return true;
      });
      if (cleanedArray.length === 0) return;
      filtered[key] = cleanedArray;
      return;
    }

    // Coerce videoDuration to number - Payload expects number, form may send string
    if (key === 'videoDuration' && typeof value === 'string') {
      const str = value.trim();
      if (str === '') return;
      // Handle "MM:SS" format
      const mmssMatch = str.match(/^(\d+):(\d{1,2})$/);
      if (mmssMatch) {
        filtered[key] = parseInt(mmssMatch[1], 10) * 60 + parseInt(mmssMatch[2], 10);
      } else {
        const parsed = parseInt(str, 10);
        if (!isNaN(parsed)) {
          filtered[key] = parsed;
        }
      }
      return;
    }

    // Include the field
    filtered[key] = value;
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
