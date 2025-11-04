'use client';

import React, { ReactNode } from 'react';
import { useAuth } from '@/lib/context/AuthContext';
import { hasTierAccess, type VendorTier } from '@/lib/utils/tier-validator';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Lock, ArrowUpCircle } from 'lucide-react';

export interface TierGateProps {
  /**
   * Minimum tier required to access the content
   */
  requiredTier: VendorTier;

  /**
   * Content to show if user has access
   */
  children: ReactNode;

  /**
   * Optional custom fallback content for users without access
   */
  fallback?: ReactNode;

  /**
   * Optional className for styling
   */
  className?: string;

  /**
   * Whether to show the default upgrade message
   * @default true
   */
  showUpgradeMessage?: boolean;
}

/**
 * TierGate Component
 *
 * Conditional rendering wrapper that shows content based on user's subscription tier.
 * Displays upgrade message for users without sufficient tier access.
 *
 * Features:
 * - Tier hierarchy validation (tier2 > tier1 > free)
 * - Admin bypass (admins see all content)
 * - Custom fallback content support
 * - Default upgrade message with tier badge
 *
 * @example
 * ```tsx
 * <TierGate requiredTier="tier1">
 *   <PremiumFeature />
 * </TierGate>
 * ```
 */
export function TierGate({
  requiredTier,
  children,
  fallback,
  className = '',
  showUpgradeMessage = true,
}: TierGateProps) {
  const { tier, role } = useAuth();

  // Determine if user has access
  const currentTier = (tier || 'free') as VendorTier;
  const isAdmin = role === 'admin';
  const hasAccess = hasTierAccess(currentTier, requiredTier, isAdmin);

  // If user has access, render children
  if (hasAccess) {
    return <div className={className}>{children}</div>;
  }

  // If user doesn't have access, render fallback or default upgrade message
  if (fallback) {
    return <div className={className}>{fallback}</div>;
  }

  // Default upgrade message
  if (!showUpgradeMessage) {
    return null;
  }

  const tierLabels: Record<VendorTier, string> = {
    free: 'Free Tier',
    tier1: 'Tier 1',
    tier2: 'Tier 2',
    tier3: 'Tier 3',
  };

  return (
    <div className={className}>
      <Alert className="border-blue-200 dark:border-blue-900 bg-blue-50 dark:bg-blue-950">
        <Lock className="h-4 w-4 text-blue-600 dark:text-blue-400" />
        <AlertTitle className="text-blue-900 dark:text-blue-100 flex items-center gap-2">
          Premium Feature
          <Badge variant="default" className="bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 hover:bg-blue-200 dark:hover:bg-blue-800">
            {tierLabels[requiredTier]}
          </Badge>
        </AlertTitle>
        <AlertDescription className="text-blue-800 dark:text-blue-200">
          <p className="mb-2">
            This feature requires <strong>{tierLabels[requiredTier]}</strong> or higher.
          </p>
          <button
            type="button"
            className="inline-flex items-center gap-1 text-sm font-medium text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 underline"
            onClick={() => {
              // In a real app, this would navigate to upgrade page
              console.log('Navigate to upgrade page');
            }}
          >
            <ArrowUpCircle className="h-4 w-4" />
            Upgrade to {tierLabels[requiredTier]}
          </button>
        </AlertDescription>
      </Alert>
    </div>
  );
}
