/**
 * Example Usage: AdminDirectTierChange Component
 *
 * This file demonstrates various ways to integrate the AdminDirectTierChange
 * component into admin pages.
 */

import AdminDirectTierChange from '@/components/admin/AdminDirectTierChange';

/**
 * Example 1: Basic Usage in Admin Vendor Detail Page
 */
export function VendorDetailPageExample() {
  const vendor = {
    id: 'vendor-123',
    companyName: 'Acme Superyacht Services',
    tier: 'tier1' as const,
  };

  return (
    <div className="space-y-6">
      <h1>Vendor Admin Panel: {vendor.companyName}</h1>

      {/* Other vendor details */}
      <div className="grid gap-6 md:grid-cols-2">
        {/* Tier Control Sidebar */}
        <aside>
          <AdminDirectTierChange
            vendorId={vendor.id}
            currentTier={vendor.tier}
            vendorName={vendor.companyName}
          />
        </aside>

        {/* Main Content */}
        <main>
          {/* Vendor information, locations, etc. */}
        </main>
      </div>
    </div>
  );
}

/**
 * Example 2: With Success Callback for Data Refresh
 */
export function WithRefreshExample() {
  const vendor = {
    id: 'vendor-456',
    companyName: 'Marine Tech Solutions',
    tier: 'free' as const,
  };

  const handleTierUpdated = () => {
    // Refresh vendor data
    console.log('Refreshing vendor data...');
    // You might want to:
    // - Refetch vendor data from API
    // - Update local state
    // - Show additional confirmation
    // - Navigate to different page
    window.location.reload();
  };

  return (
    <AdminDirectTierChange
      vendorId={vendor.id}
      currentTier={vendor.tier}
      vendorName={vendor.companyName}
      onSuccess={handleTierUpdated}
    />
  );
}

/**
 * Example 3: In Admin Dashboard with Multiple Vendors
 */
export function AdminDashboardExample() {
  const vendors = [
    {
      id: 'vendor-1',
      companyName: 'Vendor A',
      tier: 'free' as const,
    },
    {
      id: 'vendor-2',
      companyName: 'Vendor B',
      tier: 'tier2' as const,
    },
  ];

  return (
    <div className="space-y-4">
      <h2>Quick Tier Management</h2>
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {vendors.map((vendor) => (
          <AdminDirectTierChange
            key={vendor.id}
            vendorId={vendor.id}
            currentTier={vendor.tier}
            vendorName={vendor.companyName}
            onSuccess={() => {
              console.log(`Updated tier for ${vendor.companyName}`);
            }}
          />
        ))}
      </div>
    </div>
  );
}

/**
 * Example 4: Conditional Rendering Based on Admin Role
 */
export function ConditionalRenderExample() {
  const user = {
    role: 'admin', // or 'vendor', 'user'
  };

  const vendor = {
    id: 'vendor-789',
    companyName: 'Premium Yacht Co.',
    tier: 'tier3' as const,
  };

  // Only show tier control to admins
  if (user.role !== 'admin') {
    return (
      <div>
        <p>Current Tier: {vendor.tier}</p>
        <p className="text-muted-foreground">
          Contact admin to change tier
        </p>
      </div>
    );
  }

  return (
    <AdminDirectTierChange
      vendorId={vendor.id}
      currentTier={vendor.tier}
      vendorName={vendor.companyName}
    />
  );
}

/**
 * Example 5: With Custom Success Handler and Logging
 */
export function WithLoggingExample() {
  const vendor = {
    id: 'vendor-999',
    companyName: 'Elite Marine Services',
    tier: 'tier1' as const,
  };

  const handleTierChange = async () => {
    // Log the tier change
    console.log('Tier change successful:', {
      vendorId: vendor.id,
      vendorName: vendor.companyName,
      timestamp: new Date().toISOString(),
    });

    // Send analytics event
    // analytics.track('admin_tier_change', { vendorId: vendor.id });

    // Refresh data from API
    try {
      const response = await fetch(`/api/admin/vendors/${vendor.id}`);
      const updatedVendor = await response.json();
      console.log('Updated vendor data:', updatedVendor);
    } catch (error) {
      console.error('Failed to refresh vendor data:', error);
    }
  };

  return (
    <AdminDirectTierChange
      vendorId={vendor.id}
      currentTier={vendor.tier}
      vendorName={vendor.companyName}
      onSuccess={handleTierChange}
    />
  );
}

/**
 * Example 6: In Modal/Sidebar for Quick Access
 */
export function InModalExample() {
  const [isOpen, setIsOpen] = useState(false);
  const vendor = {
    id: 'vendor-111',
    companyName: 'Coastal Yacht Supplies',
    tier: 'tier2' as const,
  };

  return (
    <>
      <button onClick={() => setIsOpen(true)}>
        Manage Tier
      </button>

      {isOpen && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center">
          <div className="bg-white rounded-lg p-6 max-w-md w-full">
            <h2 className="text-xl font-bold mb-4">Tier Management</h2>
            <AdminDirectTierChange
              vendorId={vendor.id}
              currentTier={vendor.tier}
              vendorName={vendor.companyName}
              onSuccess={() => {
                setIsOpen(false);
                // Refresh parent data
              }}
            />
            <button
              onClick={() => setIsOpen(false)}
              className="mt-4 w-full"
            >
              Close
            </button>
          </div>
        </div>
      )}
    </>
  );
}

/**
 * Example 7: Integration with Vendor Search/List Page
 */
export function VendorListIntegrationExample() {
  const vendors = [
    { id: '1', companyName: 'Vendor 1', tier: 'free' as const },
    { id: '2', companyName: 'Vendor 2', tier: 'tier1' as const },
  ];

  const [selectedVendorId, setSelectedVendorId] = useState<string | null>(null);

  const selectedVendor = vendors.find((v) => v.id === selectedVendorId);

  return (
    <div className="grid grid-cols-2 gap-6">
      {/* Vendor List */}
      <div>
        <h2>Vendors</h2>
        <ul>
          {vendors.map((vendor) => (
            <li key={vendor.id}>
              <button onClick={() => setSelectedVendorId(vendor.id)}>
                {vendor.companyName} - {vendor.tier}
              </button>
            </li>
          ))}
        </ul>
      </div>

      {/* Tier Control */}
      <div>
        <h2>Tier Control</h2>
        {selectedVendor ? (
          <AdminDirectTierChange
            vendorId={selectedVendor.id}
            currentTier={selectedVendor.tier}
            vendorName={selectedVendor.companyName}
            onSuccess={() => {
              // Refresh vendor list
              console.log('Vendor tier updated, refreshing list...');
            }}
          />
        ) : (
          <p className="text-muted-foreground">
            Select a vendor to manage their tier
          </p>
        )}
      </div>
    </div>
  );
}

// Note: Add missing import
import { useState } from 'react';
