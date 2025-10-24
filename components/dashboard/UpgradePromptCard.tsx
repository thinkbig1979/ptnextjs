'use client';

import React from 'react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Lock, ArrowRight, Check } from 'lucide-react';
import { Tier } from '@/lib/services/TierService';

export interface UpgradePromptCardProps {
  currentTier: Tier;
  targetTier: Tier;
  feature: string;
  benefits?: string[];
  onContactSales?: () => void;
  variant?: 'card' | 'inline';
  className?: string;
}

const TIER_LABELS: Record<Tier, string> = {
  free: 'Free',
  tier1: 'Tier 1',
  tier2: 'Tier 2',
  tier3: 'Tier 3',
};

const DEFAULT_BENEFITS: Record<Tier, string[]> = {
  free: [],
  tier1: [
    'Enhanced brand storytelling',
    'Certifications & awards showcase',
    'Case studies with testimonials',
    'Team member profiles',
    'Video introductions',
    'Up to 3 office locations',
  ],
  tier2: [
    'Unlimited office locations',
    'Advanced analytics dashboard',
    'API access for integrations',
    'Custom domain support',
    'Priority support',
  ],
  tier3: [
    'Featured placement on homepage',
    'Editorial content coverage',
    'Search result highlighting',
    'Dedicated account manager',
    'Premium listing priority',
  ],
};

/**
 * UpgradePromptCard Component
 *
 * Displays upgrade prompt for locked features with benefits and CTA
 *
 * @param currentTier - User's current tier level
 * @param targetTier - Required tier to unlock feature
 * @param feature - Name of locked feature
 * @param benefits - List of benefits (defaults to tier benefits)
 * @param onContactSales - Callback for contact sales button
 * @param variant - Display variant ('card' or 'inline')
 * @param className - Additional CSS classes
 */
export function UpgradePromptCard({
  currentTier,
  targetTier,
  feature,
  benefits,
  onContactSales,
  variant = 'card',
  className = '',
}: UpgradePromptCardProps) {
  const benefitsList = benefits || DEFAULT_BENEFITS[targetTier] || [];

  const handleContactSales = () => {
    if (onContactSales) {
      onContactSales();
    } else {
      // Default behavior: mailto
      window.location.href = 'mailto:sales@example.com?subject=Upgrade%20Inquiry';
    }
  };

  const content = (
    <>
      <CardHeader>
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-2">
            <Lock className="h-5 w-5 text-gray-400" />
            <CardTitle className="text-xl">Unlock {feature}</CardTitle>
          </div>
          <Badge variant="outline" className="bg-amber-50 text-amber-700 dark:bg-amber-900/20 dark:text-amber-300">
            {TIER_LABELS[targetTier]} Feature
          </Badge>
        </div>
        <CardDescription>
          Upgrade from {TIER_LABELS[currentTier]} to {TIER_LABELS[targetTier]} to access this feature and more.
        </CardDescription>
      </CardHeader>

      {benefitsList.length > 0 && (
        <CardContent>
          <div className="space-y-3">
            <p className="text-sm font-medium text-gray-700 dark:text-gray-300">
              What you'll get with {TIER_LABELS[targetTier]}:
            </p>
            <ul className="space-y-2">
              {benefitsList.map((benefit, index) => (
                <li key={index} className="flex items-start gap-2 text-sm text-gray-600 dark:text-gray-400">
                  <Check className="h-4 w-4 text-green-600 dark:text-green-400 mt-0.5 flex-shrink-0" />
                  <span>{benefit}</span>
                </li>
              ))}
            </ul>
          </div>
        </CardContent>
      )}

      <CardFooter className="flex flex-col sm:flex-row gap-3">
        <Button onClick={handleContactSales} className="w-full sm:w-auto" size="lg">
          Contact Sales
          <ArrowRight className="ml-2 h-4 w-4" />
        </Button>
        <Button variant="outline" className="w-full sm:w-auto" size="lg" asChild>
          <a href="/pricing" target="_blank">
            View Pricing
          </a>
        </Button>
      </CardFooter>
    </>
  );

  if (variant === 'inline') {
    return <div className={`border-2 border-dashed border-gray-300 dark:border-gray-700 rounded-lg p-6 ${className}`}>{content}</div>;
  }

  return <Card className={className}>{content}</Card>;
}

export default UpgradePromptCard;
