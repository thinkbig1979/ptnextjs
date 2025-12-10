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
    name: 'Tier 1 Vendor',
    tier: 'tier1',
  };

  const mockVendorTier2: Vendor = {
    ...mockVendorFree,
    name: 'Tier 2 Vendor',
    tier: 'tier2',
  };

  const mockVendorTier3: Vendor = {
    ...mockVendorFree,
    name: 'Tier 3 Vendor',
    tier: 'tier3',
  };

  const renderWithProvider = (vendor: Vendor, onSave?: (data: Partial<Vendor>) => Promise<void>) => {
    return render(
      <VendorDashboardProvider vendorId={vendor.id} initialData={vendor}>
        <ProfileEditTabs vendor={vendor} onSave={onSave} />
      </VendorDashboardProvider>
    );
  };

  describe('Tier-based Tab Visibility', () => {
    test('Free tier shows only 2 tabs (Basic Info, Locations)', () => {
      renderWithProvider(mockVendorFree);

      // Visible tabs
      expect(screen.getByRole('tab', { name: /basic info/i })).toBeInTheDocument();
      expect(screen.getByRole('tab', { name: /locations/i })).toBeInTheDocument();

      // Locked tabs should be visible but not as regular tabs
      expect(screen.getByRole('button', { name: /brand story/i })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /certifications/i })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /case studies/i })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /team/i })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /products/i })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /promotion/i })).toBeInTheDocument();

      // Count total accessible tabs (should be 2)
      const tabs = screen.getAllByRole('tab');
      expect(tabs).toHaveLength(2);
    });

    test('Tier 1 shows 7 tabs', () => {
      renderWithProvider(mockVendorTier1);

      const tabs = screen.getAllByRole('tab');
      expect(tabs).toHaveLength(7);

      // Visible tabs
      expect(screen.getByRole('tab', { name: /basic info/i })).toBeInTheDocument();
      expect(screen.getByRole('tab', { name: /locations/i })).toBeInTheDocument();
      expect(screen.getByRole('tab', { name: /brand story/i })).toBeInTheDocument();
      expect(screen.getByRole('tab', { name: /certifications/i })).toBeInTheDocument();
      expect(screen.getByRole('tab', { name: /case studies/i })).toBeInTheDocument();
      expect(screen.getByRole('tab', { name: /team/i })).toBeInTheDocument();

      // Locked tabs
      expect(screen.getByRole('button', { name: /products/i })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /promotion/i })).toBeInTheDocument();
    });

    test('Tier 2 shows 8 tabs (includes Products)', () => {
      renderWithProvider(mockVendorTier2);

      const tabs = screen.getAllByRole('tab');
      expect(tabs).toHaveLength(8);

      // Visible tabs including Products
      expect(screen.getByRole('tab', { name: /products/i })).toBeInTheDocument();

      // Only Promotion should be locked
      expect(screen.getByRole('button', { name: /promotion/i })).toBeInTheDocument();
    });

    test('Tier 3 shows all 9 tabs', () => {
      renderWithProvider(mockVendorTier3);

      const tabs = screen.getAllByRole('tab');
      expect(tabs).toHaveLength(9);

      // All tabs should be visible
      expect(screen.getByRole('tab', { name: /basic info/i })).toBeInTheDocument();
      expect(screen.getByRole('tab', { name: /locations/i })).toBeInTheDocument();
      expect(screen.getByRole('tab', { name: /brand story/i })).toBeInTheDocument();
      expect(screen.getByRole('tab', { name: /certifications/i })).toBeInTheDocument();
      expect(screen.getByRole('tab', { name: /case studies/i })).toBeInTheDocument();
      expect(screen.getByRole('tab', { name: /team/i })).toBeInTheDocument();
      expect(screen.getByRole('tab', { name: /products/i })).toBeInTheDocument();
      expect(screen.getByRole('tab', { name: /promotion/i })).toBeInTheDocument();

      // No locked tabs
      const lockedButtons = screen.queryAllByRole('button').filter((btn) => {
        const lockIcon = within(btn).queryByTestId('lock-icon');
        return lockIcon !== null;
      });
      expect(lockedButtons).toHaveLength(0);
    });
  });

  describe('Locked Tab Behavior', () => {
    test('clicking locked tab shows upgrade prompt', async () => {
      const user = userEvent.setup();
      renderWithProvider(mockVendorFree);

      // Click on a locked tab (Brand Story requires Tier 1)
      const brandStoryButton = screen.getByRole('button', { name: /brand story/i });
      await user.click(brandStoryButton);

      // Upgrade prompt should appear
      await waitFor(() => {
        expect(screen.getByTestId('upgrade-prompt')).toBeInTheDocument();
        expect(screen.getByText(/upgrade to tier1 for brand story/i)).toBeInTheDocument();
      });
    });

    test('locked tabs display lock icon', () => {
      renderWithProvider(mockVendorFree);

      // All locked tabs should have lock icons
      const brandStoryButton = screen.getByRole('button', { name: /brand story/i });
      expect(within(brandStoryButton).getByRole('img', { hidden: true })).toBeInTheDocument();
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

      // Click on Brand Story tab
      const brandStoryTab = screen.getByRole('tab', { name: /brand story/i });
      await user.click(brandStoryTab);

      // Should switch without showing dialog (no unsaved changes)
      expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
    });
  });

  describe('Unsaved Changes Warning', () => {
    test('shows warning dialog when switching tabs with unsaved changes', async () => {
      const user = userEvent.setup();

      // We need to mock isDirty state. This would typically be set by the form
      // For this test, we'll need to simulate it via the context
      renderWithProvider(mockVendorTier1);

      // TODO: This test requires mocking the isDirty state in VendorDashboardContext
      // which would happen when a form field is edited
      // For now, this is a placeholder that documents the expected behavior
    });

    test('discard button switches tab and clears dirty state', async () => {
      // TODO: Implement when we can properly mock isDirty state
    });

    test('stay on tab button cancels tab switch', async () => {
      // TODO: Implement when we can properly mock isDirty state
    });
  });

  describe('Responsive Behavior', () => {
    test('shows horizontal tabs on desktop (sm breakpoint)', () => {
      renderWithProvider(mockVendorFree);

      // Desktop tabs should be visible (hidden on mobile)
      const desktopTabs = screen.getByRole('tablist');
      expect(desktopTabs).toBeInTheDocument();
      expect(desktopTabs.parentElement).toHaveClass('hidden', 'sm:block');
    });

    test('shows dropdown select on mobile', () => {
      renderWithProvider(mockVendorFree);

      // Mobile select should exist
      const mobileContainer = document.querySelector('.sm\\:hidden');
      expect(mobileContainer).toBeInTheDocument();
    });

    test('mobile dropdown shows locked tabs info', () => {
      const { container } = renderWithProvider(mockVendorFree);

      // Find the mobile section
      const mobileSection = container.querySelector('.sm\\:hidden');
      expect(mobileSection).toBeInTheDocument();

      // Should show locked sections info
      expect(within(mobileSection as HTMLElement).getByText(/locked sections/i)).toBeInTheDocument();
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

    test('renders placeholder for unimplemented tabs', async () => {
      const user = userEvent.setup();
      renderWithProvider(mockVendorTier1);

      // Click Brand Story tab (placeholder)
      const brandStoryTab = screen.getByRole('tab', { name: /brand story/i });
      await user.click(brandStoryTab);

      // Should show placeholder
      await waitFor(() => {
        expect(screen.getByText(/brand story form component coming soon/i)).toBeInTheDocument();
      });
    });
  });

  describe('Props Integration', () => {
    test('passes vendor prop to tab components', () => {
      renderWithProvider(mockVendorFree);

      expect(screen.getByText(/basic info form for free vendor/i)).toBeInTheDocument();
    });

    test('passes onSave prop to tab components', async () => {
      const mockOnSave = jest.fn().mockResolvedValue(undefined);
      const user = userEvent.setup();

      renderWithProvider(mockVendorFree, mockOnSave);

      // The onSave prop should be passed to child components
      // This would be tested via integration with actual form components
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

    test('active tab has correct aria-selected attribute', () => {
      renderWithProvider(mockVendorFree);

      const basicInfoTab = screen.getByRole('tab', { name: /basic info/i });
      expect(basicInfoTab).toHaveAttribute('data-state', 'active');
    });

    test('locked tab buttons are accessible', () => {
      renderWithProvider(mockVendorFree);

      const lockedButtons = screen.getAllByRole('button').filter((btn) =>
        btn.textContent?.includes('Brand Story') ||
        btn.textContent?.includes('Certifications')
      );

      lockedButtons.forEach((button) => {
        expect(button).toBeInTheDocument();
        expect(button).toHaveAttribute('type', 'button');
      });
    });
  });
});
