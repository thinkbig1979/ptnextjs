'use client';

import React from 'react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { useRouter } from 'next/navigation';
import { TierBadge } from '@/components/vendors/TierBadge';
import { UpgradePromptCard } from '@/components/dashboard/UpgradePromptCard';
import { HelpCircle, FileText, Mail } from 'lucide-react';
import { Tier } from '@/lib/services/TierService';

export interface DashboardSidebarProps {
  /**
   * Current vendor tier
   */
  tier: Tier | string;

  /**
   * Vendor name
   */
  vendorName?: string;
}

/**
 * DashboardSidebar Component
 *
 * Displays tier information, upgrade prompts, quick actions, and help links
 * in a sidebar layout for the vendor dashboard.
 *
 * Features:
 * - Tier information badge
 * - Upgrade prompt (for non-Tier 3 vendors)
 * - Quick action buttons
 * - Help and documentation links
 */
export function DashboardSidebar({ tier, vendorName }: DashboardSidebarProps) {
  const router = useRouter();
  const normalizedTier = (tier as Tier) || 'free';
  const isMaxTier = normalizedTier === 'tier3';

  return (
    <aside className="space-y-6 sticky top-8">
      {/* Tier Information Card */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Subscription Tier</CardTitle>
          <CardDescription>Your current plan level</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-foreground dark:text-muted-foreground">
              Current Tier
            </span>
            <TierBadge tier={normalizedTier} size="md" />
          </div>

          {!isMaxTier && (
            <>
              <Separator />
              <div className="pt-2">
                <p className="text-xs text-muted-foreground dark:text-muted-foreground mb-3">
                  Upgrade to unlock more features and grow your business.
                </p>
                <Button
                  variant="outline"
                  size="sm"
                  className="w-full"
                  onClick={() => router.push('/vendor/dashboard/subscription')}
                >
                  View Subscription Options
                </Button>
              </div>
            </>
          )}

          {isMaxTier && (
            <>
              <Separator />
              <p className="text-xs text-green-600 dark:text-green-400 font-medium">
                You&apos;re on the highest tier with access to all premium features!
              </p>
            </>
          )}
        </CardContent>
      </Card>

      {/* Upgrade Prompt (if not Tier 3) */}
      {!isMaxTier && (
        <UpgradePromptCard
          currentTier={normalizedTier}
          targetTier={normalizedTier === 'free' ? 'tier1' : normalizedTier === 'tier1' ? 'tier2' : 'tier3'}
          feature="Premium Features"
          variant="card"
        />
      )}

      {/* Quick Actions Card */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Quick Actions</CardTitle>
          <CardDescription>Common tasks and tools</CardDescription>
        </CardHeader>
        <CardContent className="space-y-2">
          <Button
            variant="ghost"
            className="w-full justify-start"
            onClick={() => router.push('/vendor/dashboard/profile')}
          >
            <FileText className="mr-3 h-4 w-4" aria-hidden="true" />
            Edit Profile
          </Button>
          <Button
            variant="ghost"
            className="w-full justify-start"
            onClick={() => router.push('/contact')}
          >
            <Mail className="mr-3 h-4 w-4" aria-hidden="true" />
            Contact Support
          </Button>
          <Button
            variant="ghost"
            className="w-full justify-start"
            onClick={() => window.open('/help', '_blank')}
          >
            <HelpCircle className="mr-3 h-4 w-4" aria-hidden="true" />
            Help Center
          </Button>
        </CardContent>
      </Card>

      {/* Help Links Card */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Resources</CardTitle>
          <CardDescription>Documentation and guides</CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          <a
            href="/docs/getting-started"
            target="_blank"
            rel="noopener noreferrer"
            className="block text-sm text-primary hover:text-primary/80 dark:text-primary dark:hover:text-primary/80"
          >
            Getting Started Guide
          </a>
          <a
            href="/docs/features"
            target="_blank"
            rel="noopener noreferrer"
            className="block text-sm text-primary hover:text-primary/80 dark:text-primary dark:hover:text-primary/80"
          >
            Feature Documentation
          </a>
          <a
            href="/docs/best-practices"
            target="_blank"
            rel="noopener noreferrer"
            className="block text-sm text-primary hover:text-primary/80 dark:text-primary dark:hover:text-primary/80"
          >
            Best Practices
          </a>
        </CardContent>
      </Card>
    </aside>
  );
}

export default DashboardSidebar;
