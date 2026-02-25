'use client';

import React, { useState, useEffect } from 'react';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Lock, Info } from 'lucide-react';
import { Vendor } from '@/lib/types';
import { TierService, Tier } from '@/lib/services/TierService';
import { useVendorDashboard } from '@/lib/context/VendorDashboardContext';
import { BasicInfoForm } from '@/components/dashboard/BasicInfoForm';
import { LocationsManagerCard } from '@/components/dashboard/LocationsManagerCard';
import { TierUpgradePrompt } from '@/components/dashboard/TierUpgradePrompt';
import { MediaGalleryManager } from '@/components/dashboard/MediaGalleryManager';
import { BrandStoryForm } from './BrandStoryForm';
import { CertificationsAwardsManager } from './CertificationsAwardsManager';
import { CaseStudiesManager } from './CaseStudiesManager';
import { TeamMembersManager } from './TeamMembersManager';
import { PromotionPackForm } from './PromotionPackForm';

interface ProfileEditTabsProps {
  vendor: Vendor;
}

interface TabDefinition {
  id: string;
  label: string;
  minTier: number;
  component: React.ComponentType<any>;
  description: string;
}

/**
 * ProfileEditTabs Component
 *
 * Tabbed container for vendor profile editing with tier-based access control.
 *
 * Tier visibility:
 * - Free: Basic Info, Locations (2 tabs)
 * - Tier 1: + Brand Story, Certifications, Case Studies, Team, Media Gallery (7 tabs)
 * - Tier 3: + Promotion (8 tabs)
 *
 * Note: Products are managed separately at /vendor/dashboard/products
 */
export function ProfileEditTabs({ vendor }: ProfileEditTabsProps) {
  const { activeTab, setActiveTab, isDirty, markDirty, updateVendor, saveVendor } = useVendorDashboard();
  const [showUnsavedDialog, setShowUnsavedDialog] = useState(false);
  const [pendingTab, setPendingTab] = useState<string | null>(null);
  const [showUpgradePrompt, setShowUpgradePrompt] = useState(false);
  const [upgradePromptData, setUpgradePromptData] = useState<{
    featureName: string;
    requiredTier: Tier;
  } | null>(null);
  const [isDesktop, setIsDesktop] = useState(true);

  const tierLevel = TierService.getTierLevel(vendor.tier);

  /**
   * Wrapper function for form submissions
   * Updates vendor state and saves to backend
   */
  const handleFormSave = async (data: Partial<Vendor>) => {
    // Pass through form data as-is - API expects companyName field
    const vendorUpdates: Partial<Vendor> = { ...data };

    // Merge updates with current vendor data to avoid stale closure issue
    const updatedVendor = { ...vendor, ...vendorUpdates };

    // Update local state
    updateVendor(vendorUpdates);

    // Pass the updated vendor directly to avoid race condition
    await saveVendor(updatedVendor);
  };

  // Track viewport size to determine which UI to render
  useEffect(() => {
    // Initial check
    setIsDesktop(window.innerWidth >= 640);

    const handleResize = () => {
      setIsDesktop(window.innerWidth >= 640);
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Define all available tabs with tier requirements
  const allTabs: TabDefinition[] = [
    {
      id: 'basic',
      label: 'Basic Info',
      minTier: 0,
      component: BasicInfoForm,
      description: 'Core company information',
    },
    {
      id: 'locations',
      label: 'Locations',
      minTier: 0,
      component: LocationsManagerCard,
      description: 'Office locations and headquarters',
    },
    {
      id: 'brand',
      label: 'Brand Story',
      minTier: 1,
      component: BrandStoryForm,
      description: 'Company story and values',
    },
    {
      id: 'certifications',
      label: 'Certifications',
      minTier: 1,
      component: CertificationsAwardsManager,
      description: 'Industry certifications and awards',
    },
    {
      id: 'case-studies',
      label: 'Case Studies',
      minTier: 1,
      component: CaseStudiesManager,
      description: 'Showcase your best work',
    },
    {
      id: 'team',
      label: 'Team',
      minTier: 1,
      component: TeamMembersManager,
      description: 'Your team members',
    },
    {
      id: 'media-gallery',
      label: 'Media Gallery',
      minTier: 1,
      component: () => <MediaGalleryManager vendor={vendor} onSubmit={handleFormSave} />,
      description: 'Images and videos showcase',
    },
    {
      id: 'promotion',
      label: 'Promotion',
      minTier: 3,
      component: () => <PromotionPackForm vendor={vendor} />,
      description: 'Promotion and marketing content',
    },
  ];

  // Filter tabs based on current tier
  const visibleTabs = allTabs.filter((tab) => tierLevel >= tab.minTier);
  const lockedTabs = allTabs.filter((tab) => tierLevel < tab.minTier);

  // Ensure activeTab is valid for current tier
  useEffect(() => {
    const isActiveTabVisible = visibleTabs.some((tab) => tab.id === activeTab);
    if (!isActiveTabVisible && visibleTabs.length > 0) {
      setActiveTab(visibleTabs[0].id);
    }
  }, [activeTab, visibleTabs, setActiveTab]);

  /**
   * Handle tab change with unsaved changes check
   */
  const handleTabChange = (newTab: string) => {
    if (isDirty) {
      // Show unsaved changes dialog
      setShowUnsavedDialog(true);
      setPendingTab(newTab);
    } else {
      setActiveTab(newTab);
    }
  };

  /**
   * Handle locked tab click
   */
  const handleLockedTabClick = (tab: TabDefinition) => {
    const requiredTier = TierService.getTierFromLevel(tab.minTier);
    setUpgradePromptData({
      featureName: tab.label,
      requiredTier,
    });
    setShowUpgradePrompt(true);
  };

  /**
   * Confirm tab change (discard unsaved changes)
   */
  const confirmTabChange = () => {
    if (pendingTab) {
      setActiveTab(pendingTab);
      markDirty(false);
    }
    setShowUnsavedDialog(false);
    setPendingTab(null);
  };

  /**
   * Cancel tab change (stay on current tab)
   */
  const cancelTabChange = () => {
    setShowUnsavedDialog(false);
    setPendingTab(null);
  };

  /**
   * Get current tab component
   */
  const currentTab = visibleTabs.find((tab) => tab.id === activeTab) || visibleTabs[0];
  const CurrentTabComponent = currentTab?.component;

  return (
    <>
      <div className="w-full">
        {isDesktop ? (
          // Desktop Tabs - SINGLE RENDER
          <Tabs value={activeTab} onValueChange={handleTabChange}>
            <TabsList className="w-full justify-start overflow-x-auto">
              {visibleTabs.map((tab) => (
                <TabsTrigger key={tab.id} value={tab.id}>
                  {tab.label}
                </TabsTrigger>
              ))}
              {lockedTabs.map((tab) => (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => handleLockedTabClick(tab)}
                  className="inline-flex items-center justify-center whitespace-nowrap rounded-sm px-3 py-1.5 text-sm font-medium ring-offset-background transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 text-muted-foreground hover:text-foreground opacity-60"
                >
                  <Lock className="h-3 w-3 mr-1.5" />
                  {tab.label}
                </button>
              ))}
            </TabsList>

            <div className="mt-6">
              {activeTab !== 'basic' && activeTab !== 'locations' && (
                <div className="flex items-start gap-2.5 p-3 mb-6 rounded-lg bg-blue-50/70 dark:bg-blue-950/20 border border-blue-200/60 dark:border-blue-800/40 text-sm text-blue-800 dark:text-blue-300">
                  <Info className="h-4 w-4 mt-0.5 shrink-0" />
                  <p>
                    All fields in this section are optional. Empty fields are simply hidden from your public profile, so fill in only what's relevant to your business.
                  </p>
                </div>
              )}
              {CurrentTabComponent && (
                <CurrentTabComponent vendor={vendor} onSubmit={handleFormSave} />
              )}
            </div>
          </Tabs>
        ) : (
          // Mobile Dropdown - SINGLE RENDER
          <>
            <Select value={activeTab} onValueChange={handleTabChange}>
              <SelectTrigger className="w-full mb-6">
                <SelectValue placeholder="Select a section" />
              </SelectTrigger>
              <SelectContent>
                {visibleTabs.map((tab) => (
                  <SelectItem key={tab.id} value={tab.id}>
                    {tab.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            {/* Show locked tabs info */}
            {lockedTabs.length > 0 && (
              <div className="mb-6 p-4 border border-border dark:border-border rounded-lg bg-muted dark:bg-muted/50">
                <div className="flex items-center gap-2 mb-2">
                  <Lock className="h-4 w-4 text-muted-foreground" />
                  <p className="text-sm font-medium text-foreground dark:text-muted-foreground">
                    Locked Sections ({lockedTabs.length})
                  </p>
                </div>
                <p className="text-xs text-muted-foreground dark:text-muted-foreground">
                  Upgrade to unlock: {lockedTabs.map((t) => t.label).join(', ')}
                </p>
              </div>
            )}

            {/* Optional fields info note (mobile) */}
            {activeTab !== 'basic' && activeTab !== 'locations' && (
              <div className="flex items-start gap-2.5 p-3 mb-6 rounded-lg bg-blue-50/70 dark:bg-blue-950/20 border border-blue-200/60 dark:border-blue-800/40 text-sm text-blue-800 dark:text-blue-300">
                <Info className="h-4 w-4 mt-0.5 shrink-0" />
                <p>
                  All fields in this section are optional. Empty fields are simply hidden from your public profile, so fill in only what's relevant to your business.
                </p>
              </div>
            )}

            {/* Mobile Tab Content */}
            {CurrentTabComponent && (
              <CurrentTabComponent vendor={vendor} onSubmit={handleFormSave} />
            )}
          </>
        )}
      </div>

      {/* Unsaved Changes Dialog */}
      <Dialog open={showUnsavedDialog} onOpenChange={setShowUnsavedDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Unsaved Changes</DialogTitle>
            <DialogDescription>
              You have unsaved changes in the current section. If you switch tabs now, your changes will be lost.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="gap-2 sm:gap-0">
            <Button variant="outline" onClick={cancelTabChange}>
              Stay on This Tab
            </Button>
            <Button variant="destructive" onClick={confirmTabChange}>
              Discard Changes
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Upgrade Prompt Dialog */}
      <Dialog open={showUpgradePrompt} onOpenChange={setShowUpgradePrompt}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle className="sr-only">Upgrade Required</DialogTitle>
            <DialogDescription className="sr-only">
              This feature requires a higher tier subscription
            </DialogDescription>
          </DialogHeader>
          {upgradePromptData && (
            <TierUpgradePrompt
              currentTier={vendor.tier || 'free'}
              requiredTier={upgradePromptData.requiredTier}
              featureName={upgradePromptData.featureName}
              className="border-0"
            />
          )}
        </DialogContent>
      </Dialog>
    </>
  );
}

/**
 * Placeholder component for tabs that don't have implementations yet
 */
function PlaceholderComponent(title: string) {
  return function Placeholder() {
    return (
      <div className="p-8 border border-dashed border-border dark:border-border rounded-lg bg-muted dark:bg-muted/50 text-center">
        <p className="text-muted-foreground dark:text-muted-foreground text-sm">
          {title} form component coming soon
        </p>
      </div>
    );
  };
}

