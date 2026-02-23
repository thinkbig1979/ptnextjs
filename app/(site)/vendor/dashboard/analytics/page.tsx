'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Eye, Search, MousePointerClick, Package } from 'lucide-react';
import { useVendorDashboard } from '@/lib/context/VendorDashboardContext';
import { TierService } from '@/lib/services/TierService';
import { TierUpgradePrompt } from '@/components/dashboard/TierUpgradePrompt';

/**
 * Vendor Analytics Dashboard
 *
 * Shows profile views, product performance, search appearances, and contact clicks.
 * Gated to Tier 2+ vendors.
 * Currently uses placeholder data - backend analytics tracking to be implemented.
 */
export default function AnalyticsPage() {
  const { vendor } = useVendorDashboard();

  if (!vendor) {
    return (
      <div className="animate-pulse space-y-6">
        <div className="h-8 bg-muted rounded w-1/4" />
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="h-40 bg-muted rounded-lg" />
          ))}
        </div>
      </div>
    );
  }

  const tierLevel = TierService.getTierLevel(vendor.tier);
  if (tierLevel < 2) {
    return (
      <div className="space-y-6">
        <h1 className="text-2xl font-bold">Analytics</h1>
        <TierUpgradePrompt
          currentTier={vendor.tier || 'free'}
          requiredTier="tier2"
          featureName="Analytics Dashboard"
        />
      </div>
    );
  }

  // Placeholder analytics data - will be replaced with real data from backend
  const stats = [
    {
      title: 'Profile Views',
      value: '--',
      description: 'Total views this month',
      icon: Eye,
      trend: 'Analytics tracking coming soon',
    },
    {
      title: 'Search Appearances',
      value: '--',
      description: 'Times appeared in search results',
      icon: Search,
      trend: 'Analytics tracking coming soon',
    },
    {
      title: 'Contact Clicks',
      value: '--',
      description: 'Click-throughs on contact info',
      icon: MousePointerClick,
      trend: 'Analytics tracking coming soon',
    },
    {
      title: 'Product Views',
      value: '--',
      description: 'Total product page views',
      icon: Package,
      trend: 'Analytics tracking coming soon',
    },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Analytics</h1>
        <p className="text-muted-foreground mt-1">
          Track your profile performance and engagement metrics.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {stats.map((stat) => (
          <Card key={stat.title}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">{stat.title}</CardTitle>
              <stat.icon className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stat.value}</div>
              <CardDescription className="text-xs mt-1">
                {stat.description}
              </CardDescription>
              <p className="text-xs text-muted-foreground mt-2">{stat.trend}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Performance Overview</CardTitle>
          <CardDescription>
            Detailed analytics and charts will be available here once tracking is enabled.
            This feature is in development.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="h-64 flex items-center justify-center border-2 border-dashed border-muted rounded-lg">
            <p className="text-muted-foreground">Analytics charts coming soon</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
