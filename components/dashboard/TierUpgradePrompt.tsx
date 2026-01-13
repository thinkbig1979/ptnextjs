'use client';

import React from 'react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Lock, ArrowUpCircle, Check } from 'lucide-react';
import Link from 'next/link';
import { getTierExplanation } from '@/lib/help/content/tier-system';

export interface TierUpgradePromptProps {
  currentTier: string;
  requiredTier: string;
  featureName: string;
  upgradePath?: string;
  className?: string;
  compact?: boolean;
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
  compact = false,
}: TierUpgradePromptProps) {
  // Compact version for inline use
  if (compact) {
    return (
      <div className={`flex flex-wrap items-center gap-3 ${className}`}>
        <div className="flex items-center gap-2 text-sm">
          <Badge variant="outline" className="capitalize">
            {currentTier}
          </Badge>
          <span className="text-muted-foreground">→</span>
          <Badge variant="default" className="capitalize bg-blue-600">
            {requiredTier}
          </Badge>
        </div>
        <Link href={upgradePath}>
          <Button size="sm" variant="outline">
            <ArrowUpCircle className="mr-2 h-4 w-4" />
            Upgrade
          </Button>
        </Link>
      </div>
    );
  }

  // Full version with card
  // Get feature benefits for the required tier
  const tierKey = requiredTier.toLowerCase().replace(' ', '') as 'free' | 'tier1' | 'tier2' | 'tier3';
  const tierExplanation = getTierExplanation(tierKey);

  return (
    <Card className={`border-blue-200 dark:border-blue-800 ${className}`}>
      <CardHeader>
        <div className="flex items-center gap-3 mb-2">
          <Lock className="h-6 w-6 text-accent dark:text-accent" />
          <CardTitle>Upgrade to Unlock</CardTitle>
        </div>
        <CardDescription>
          This feature requires a higher tier subscription to access.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <h3 className="text-sm font-medium text-foreground dark:text-muted-foreground mb-2">
            Feature: <span className="text-foreground dark:text-white">{featureName}</span>
          </h3>
          <div className="flex items-center gap-3 text-sm">
            <div>
              <span className="text-muted-foreground dark:text-muted-foreground">Your tier:</span>{' '}
              <Badge variant="outline" className="ml-1 capitalize">
                {currentTier}
              </Badge>
            </div>
            <span className="text-muted-foreground">→</span>
            <div>
              <span className="text-muted-foreground dark:text-muted-foreground">Required:</span>{' '}
              <Badge variant="default" className="ml-1 capitalize bg-blue-600">
                {requiredTier}
              </Badge>
            </div>
          </div>
        </div>

        {/* Feature Benefits */}
        {tierExplanation && (
          <div className="bg-blue-50 dark:bg-blue-950/30 rounded-lg p-4 border border-blue-100 dark:border-blue-800">
            <h4 className="text-sm font-semibold text-blue-700 dark:text-blue-300 mb-2">
              Benefits of {tierExplanation.name}:
            </h4>
            <p className="text-sm text-blue-600 dark:text-blue-400 mb-3">
              {tierExplanation.description}
            </p>
            <ul className="space-y-1.5">
              {tierExplanation.highlights.slice(0, 5).map((benefit, index) => (
                <li key={index} className="flex items-center gap-2 text-sm text-blue-700 dark:text-blue-300">
                  <Check className="h-4 w-4 text-green-600 dark:text-green-400 flex-shrink-0" />
                  {benefit}
                </li>
              ))}
            </ul>
          </div>
        )}

        <div className="pt-2">
          <Link href={upgradePath}>
            <Button className="w-full sm:w-auto" size="lg">
              <ArrowUpCircle className="mr-2 h-5 w-5" />
              Upgrade to {requiredTier}
            </Button>
          </Link>
          <p className="text-xs text-muted-foreground dark:text-muted-foreground mt-2">
            Unlock this feature and more with a higher tier subscription.
          </p>
        </div>
      </CardContent>
    </Card>
  );
}

export default TierUpgradePrompt;
