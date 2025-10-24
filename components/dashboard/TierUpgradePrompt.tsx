'use client';

import React from 'react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Lock, ArrowUpCircle } from 'lucide-react';
import Link from 'next/link';

export interface TierUpgradePromptProps {
  currentTier: string;
  requiredTier: string;
  featureName: string;
  upgradePath?: string;
  className?: string;
}

/**
 * TierUpgradePrompt Component
 *
 * Displays a prompt to upgrade the vendor's tier to access a locked feature.
 * Shows current tier, required tier, and a call-to-action button.
 */
export function TierUpgradePrompt({
  currentTier,
  requiredTier,
  featureName,
  upgradePath = '/subscription/upgrade',
  className = '',
}: TierUpgradePromptProps) {
  return (
    <Card className={`border-blue-200 dark:border-blue-800 ${className}`}>
      <CardHeader>
        <div className="flex items-center gap-3 mb-2">
          <Lock className="h-6 w-6 text-blue-600 dark:text-blue-400" />
          <CardTitle>Upgrade to Unlock</CardTitle>
        </div>
        <CardDescription>
          This feature requires a higher tier subscription to access.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Feature: <span className="text-gray-900 dark:text-white">{featureName}</span>
          </h3>
          <div className="flex items-center gap-3 text-sm">
            <div>
              <span className="text-gray-600 dark:text-gray-400">Your tier:</span>{' '}
              <Badge variant="outline" className="ml-1 capitalize">
                {currentTier}
              </Badge>
            </div>
            <span className="text-gray-400">→</span>
            <div>
              <span className="text-gray-600 dark:text-gray-400">Required:</span>{' '}
              <Badge variant="default" className="ml-1 capitalize bg-blue-600">
                {requiredTier}
              </Badge>
            </div>
          </div>
        </div>

        <div className="pt-2">
          <Link href={upgradePath}>
            <Button className="w-full sm:w-auto" size="lg">
              <ArrowUpCircle className="mr-2 h-5 w-5" />
              Upgrade to {requiredTier}
            </Button>
          </Link>
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
            Unlock this feature and more with a higher tier subscription.
          </p>
        </div>
      </CardContent>
    </Card>
  );
}

export default TierUpgradePrompt;
