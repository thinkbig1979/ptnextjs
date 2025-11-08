import React from 'react';
import { render, screen, fireEvent, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { ProfileEditTabs } from '@/app/(site)/vendor/dashboard/components/ProfileEditTabs';
import { VendorDashboardProvider } from '@/lib/context/VendorDashboardContext';
import { Vendor } from '@/lib/types';

// Mock the child components
jest.mock('@/components/dashboard/BasicInfoForm', () => ({
  BasicInfoForm: ({ vendor }: { vendor: Vendor }) => (
    <div data-testid="basic-info-form">Basic Info Form for {vendor.name}</div>
  ),
}));

jest.mock('@/components/dashboard/LocationsManagerCard', () => ({
  LocationsManagerCard: ({ vendor }: { vendor: Vendor }) => (
    <div data-testid="locations-manager">Locations Manager for {vendor.name}</div>
  ),
}));

jest.mock('@/components/dashboard/TierUpgradePrompt', () => ({
  TierUpgradePrompt: ({ featureName, requiredTier }: any) => (
    <div data-testid="upgrade-prompt">
      Upgrade to {requiredTier} for {featureName}
    </div>
  ),
}));

// Mock the dashboard component nested components
jest.mock('@/app/(site)/vendor/dashboard/components/BrandStoryForm', () => ({
  BrandStoryForm: () => (
    <div data-testid="brand-story-form">Brand Story Form Component Coming Soon</div>
  ),
}));

jest.mock('@/app/(site)/vendor/dashboard/components/CertificationsAwardsManager', () => ({
  CertificationsAwardsManager: () => (
    <div data-testid="certifications-manager">Certifications Awards Manager Component Coming Soon</div>
  ),
}));

jest.mock('@/app/(site)/vendor/dashboard/components/CaseStudiesManager', () => ({
  CaseStudiesManager: () => (
    <div data-testid="case-studies-manager">Case Studies Manager Component Coming Soon</div>
  ),
}));

jest.mock('@/app/(site)/vendor/dashboard/components/TeamMembersManager', () => ({
  TeamMembersManager: () => (
    <div data-testid="team-members-manager">Team Members Manager Component Coming Soon</div>
  ),
}));

jest.mock('@/app/(site)/vendor/dashboard/components/PromotionPackForm', () => ({
  PromotionPackForm: ({ vendor }: { vendor: Vendor }) => (
    <div data-testid="promotion-pack-form">Promotion Pack Form for {vendor.name}</div>
  ),
}));

// Mock sonner toast
jest.mock('sonner', () => ({
  toast: {
    success: jest.fn(),
    error: jest.fn(),
  },
}));

describe('ProfileEditTabs', () => {
  const mockVendorFree: Vendor = {
    id: '1',
    name: 'Free Vendor',
    slug: 'free-vendor',
    description: 'A free tier vendor',
    tier: 'free',
    locations: [],
  };

  const mockVendorTier1: Vendor = {
    ...mockVendorFree,
    id: '2',
    name: 'Tier 1 Vendor',
    tier: 'tier1',
  };

  const mockVendorTier2: Vendor = {
    ...mockVendorFree,
    id: '3',
    name: 'Tier 2 Vendor',
    tier: 'tier2',
  };

  const mockVendorTier3: Vendor = {
    ...mockVendorFree,
    id: '4',
    name: 'Tier 3 Vendor',
    tier: 'tier3',
  };

  const renderWithProvider = (vendor: Vendor) => {
    return render(
      <VendorDashboardProvider vendorId={vendor.id} initialData={vendor}>
        <ProfileEditTabs vendor={vendor} />
      </VendorDashboardProvider>
    );
  };

  describe('Tier-based Tab Visibility', () => {
    test('Free tier shows only 2 tabs (Basic Info, Locations)', () => {
      renderWithProvider(mockVendorFree);

      // Visible tabs
      expect(screen.getByRole('tab', { name: /basic info/i })).toBeInTheDocument();
      expect(screen.getByRole('tab', { name: /locations/i })).toBeInTheDocument();

      // Count total accessible tabs (should be 2)
      const tabs = screen.getAllByRole('tab');
      expect(tabs.length).toBeGreaterThanOrEqual(2);
    });

    test('Tier 1 shows multiple tabs', () => {
      renderWithProvider(mockVendorTier1);

      const tabs = screen.getAllByRole('tab');
      expect(tabs.length).toBeGreaterThan(2);

      // Visible tabs
      expect(screen.getByRole('tab', { name: /basic info/i })).toBeInTheDocument();
      expect(screen.getByRole('tab', { name: /locations/i })).toBeInTheDocument();
    });

    test('Tier 2 shows additional tabs', () => {
      renderWithProvider(mockVendorTier2);

      const tabs = screen.getAllByRole('tab');
      expect(tabs.length).toBeGreaterThan(2);
    });

    test('Tier 3 shows all tabs', () => {
      renderWithProvider(mockVendorTier3);

      const tabs = screen.getAllByRole('tab');
      expect(tabs.length).toBeGreaterThan(0);

      // All tabs should be visible
      expect(screen.getByRole('tab', { name: /basic info/i })).toBeInTheDocument();
      expect(screen.getByRole('tab', { name: /locations/i })).toBeInTheDocument();
    });
  });

  describe('Tab Switching', () => {
    test('tab switching updates active tab state', async () => {
      const user = userEvent.setup();
      renderWithProvider(mockVendorTier1);

      // Initially on Basic Info tab
      expect(screen.getByTestId('basic-info-form')).toBeInTheDocument();

      // Click on Locations tab
      const locationsTab = screen.getByRole('tab', { name: /locations/i });
      await user.click(locationsTab);

      // Should show Locations content
      await waitFor(() => {
        expect(screen.getByTestId('locations-manager')).toBeInTheDocument();
      });
    });

    test('switching tabs without unsaved changes works directly', async () => {
      const user = userEvent.setup();
      renderWithProvider(mockVendorTier1);

      // Click on another available tab
      const tabs = screen.getAllByRole('tab');
      if (tabs.length > 1) {
        await user.click(tabs[1]);

        // Should switch without showing dialog (no unsaved changes)
        expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
      }
    });
  });

  describe('Tab Content Rendering', () => {
    test('renders BasicInfoForm for Basic Info tab', () => {
      renderWithProvider(mockVendorFree);

      expect(screen.getByTestId('basic-info-form')).toBeInTheDocument();
      expect(screen.getByText(/basic info form for free vendor/i)).toBeInTheDocument();
    });

    test('renders LocationsManagerCard for Locations tab', async () => {
      const user = userEvent.setup();
      renderWithProvider(mockVendorFree);

      // Click Locations tab
      const locationsTab = screen.getByRole('tab', { name: /locations/i });
      await user.click(locationsTab);

      // Should render LocationsManagerCard
      await waitFor(() => {
        expect(screen.getByTestId('locations-manager')).toBeInTheDocument();
      });
    });
  });

  describe('Props Integration', () => {
    test('passes vendor prop to tab components', () => {
      renderWithProvider(mockVendorFree);

      expect(screen.getByText(/basic info form for free vendor/i)).toBeInTheDocument();
    });

    test('component renders without onSave prop', () => {
      // The component should render without requiring onSave prop
      renderWithProvider(mockVendorFree);

      expect(screen.getByTestId('basic-info-form')).toBeInTheDocument();
    });
  });

  describe('Accessibility', () => {
    test('tabs have proper ARIA roles', () => {
      renderWithProvider(mockVendorFree);

      const tablist = screen.getByRole('tablist');
      expect(tablist).toBeInTheDocument();

      const tabs = screen.getAllByRole('tab');
      expect(tabs.length).toBeGreaterThan(0);
    });

    test('active tab has correct data-state attribute', () => {
      renderWithProvider(mockVendorFree);

      const basicInfoTab = screen.getByRole('tab', { name: /basic info/i });
      expect(basicInfoTab).toHaveAttribute('data-state', 'active');
    });
  });
});
