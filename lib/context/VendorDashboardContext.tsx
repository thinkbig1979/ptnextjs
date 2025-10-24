'use client';

import React, { createContext, useContext, useState, useCallback, useMemo } from 'react';
import useSWR from 'swr';
import { Vendor } from '@/lib/types';
import { computeYearsInBusiness } from '@/components/vendors/YearsInBusinessDisplay';
import { toast } from 'sonner';

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
  saveVendor: () => Promise<void>;
  setActiveTab: (tab: string) => void;
  refreshVendor: () => Promise<void>;
  markDirty: (dirty: boolean) => void;
}

const VendorDashboardContext = createContext<VendorDashboardContextValue | undefined>(undefined);

const fetcher = (url: string) => fetch(url).then((res) => {
  if (!res.ok) throw new Error('Failed to fetch vendor');
  return res.json();
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
  const { data, error, mutate, isLoading } = useSWR<Vendor>(
    vendorId ? `/api/portal/vendors/${vendorId}` : null,
    fetcher,
    {
      fallbackData: initialData,
      revalidateOnFocus: false,
      onSuccess: (data) => {
        setLocalVendor(data);
      },
    }
  );

  const vendor = localVendor || data;

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
   */
  const saveVendor = useCallback(async () => {
    if (!vendor || !vendorId) {
      toast.error('No vendor data to save');
      return;
    }

    setIsSaving(true);

    try {
      const response = await fetch(`/api/portal/vendors/${vendorId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(vendor),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to save vendor');
      }

      const updatedVendor = await response.json();

      // Update SWR cache
      await mutate(updatedVendor, { revalidate: false });
      setLocalVendor(updatedVendor);
      setIsDirty(false);

      toast.success('Profile saved successfully');
    } catch (error) {
      console.error('Error saving vendor:', error);
      toast.error(error instanceof Error ? error.message : 'Failed to save profile');
      throw error;
    } finally {
      setIsSaving(false);
    }
  }, [vendor, vendorId, mutate]);

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
