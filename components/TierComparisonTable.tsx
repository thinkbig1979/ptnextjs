'use client';

import * as React from 'react';
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Check, X } from 'lucide-react';
import { cn } from '@/lib/utils';

export interface TierComparisonTableProps {
  currentTier?: 'free' | 'tier1' | 'tier2' | 'tier3';
  highlightTier?: 'free' | 'tier1' | 'tier2' | 'tier3';
  className?: string;
}

type TierKey = 'free' | 'tier1' | 'tier2' | 'tier3';

interface FeatureValue {
  free: React.ReactNode;
  tier1: React.ReactNode;
  tier2: React.ReactNode;
  tier3: React.ReactNode;
}

interface Feature {
  name: string;
  values: FeatureValue;
}

interface FeatureCategory {
  name: string;
  features: Feature[];
}

const TIER_LABELS: Record<TierKey, string> = {
  free: 'Free',
  tier1: 'Tier 1',
  tier2: 'Tier 2',
  tier3: 'Tier 3',
};

const FEATURE_CATEGORIES: FeatureCategory[] = [
  {
    name: 'Listings & Products',
    features: [
      {
        name: 'Products Listed',
        values: { free: '1', tier1: '5', tier2: '25', tier3: 'Unlimited' },
      },
      {
        name: 'Product Images per Product',
        values: { free: '1', tier1: '3', tier2: '10', tier3: 'Unlimited' },
      },
      {
        name: 'Featured Products',
        values: { free: false, tier1: '1', tier2: '5', tier3: 'Unlimited' },
      },
    ],
  },
  {
    name: 'Locations',
    features: [
      {
        name: 'Business Locations',
        values: { free: '1', tier1: '1', tier2: '5', tier3: '10' },
      },
      {
        name: 'Interactive Map Display',
        values: { free: false, tier1: true, tier2: true, tier3: true },
      },
    ],
  },
  {
    name: 'Profile & Branding',
    features: [
      {
        name: 'Company Logo',
        values: { free: true, tier1: true, tier2: true, tier3: true },
      },
      {
        name: 'Company Description',
        values: { free: '100 chars', tier1: '250 chars', tier2: '500 chars', tier3: 'Unlimited' },
      },
      {
        name: 'Social Media Links',
        values: { free: false, tier1: true, tier2: true, tier3: true },
      },
      {
        name: 'Custom Branding Colors',
        values: { free: false, tier1: false, tier2: true, tier3: true },
      },
    ],
  },
  {
    name: 'Marketing & Visibility',
    features: [
      {
        name: 'Search Result Priority',
        values: { free: 'Low', tier1: 'Medium', tier2: 'High', tier3: 'Highest' },
      },
      {
        name: 'Homepage Featured Listing',
        values: { free: false, tier1: false, tier2: true, tier3: true },
      },
      {
        name: 'Promotion Pack Credits',
        values: { free: '0', tier1: '2', tier2: '6', tier3: '12' },
      },
    ],
  },
  {
    name: 'Analytics & Insights',
    features: [
      {
        name: 'Profile Views',
        values: { free: 'Basic', tier1: 'Basic', tier2: 'Advanced', tier3: 'Advanced' },
      },
      {
        name: 'Product Clicks',
        values: { free: false, tier1: 'Basic', tier2: 'Advanced', tier3: 'Advanced' },
      },
      {
        name: 'Contact Button Clicks',
        values: { free: false, tier1: false, tier2: true, tier3: true },
      },
    ],
  },
  {
    name: 'Support',
    features: [
      {
        name: 'Email Support',
        values: { free: 'Standard', tier1: 'Priority', tier2: 'Priority', tier3: 'Premium' },
      },
      {
        name: 'Response Time',
        values: { free: '48hrs', tier1: '24hrs', tier2: '12hrs', tier3: '4hrs' },
      },
      {
        name: 'Account Manager',
        values: { free: false, tier1: false, tier2: false, tier3: true },
      },
    ],
  },
];

const BooleanCell: React.FC<{ value: boolean }> = ({ value }): React.JSX.Element => {
  if (value) {
    return (
      <span className="inline-flex items-center justify-center" aria-label="Available">
        <Check className="h-5 w-5 text-green-600" data-testid="check-icon" />
      </span>
    );
  }
  return (
    <span className="inline-flex items-center justify-center" aria-label="Not available">
      <X className="h-4 w-4 text-muted-foreground" data-testid="x-icon" />
    </span>
  );
};

const FeatureValueCell: React.FC<{ value: React.ReactNode }> = ({ value }): React.JSX.Element => {
  if (typeof value === 'boolean') {
    return <BooleanCell value={value} />;
  }
  return <>{value}</>;
};

export function TierComparisonTable({
  currentTier,
  highlightTier,
  className,
}: TierComparisonTableProps): React.JSX.Element {
  const validCurrentTier: TierKey | null =
    currentTier && ['free', 'tier1', 'tier2', 'tier3'].includes(currentTier)
      ? currentTier
      : null;

  const validHighlightTier: TierKey | null =
    highlightTier && ['free', 'tier1', 'tier2', 'tier3'].includes(highlightTier)
      ? highlightTier
      : null;

  const getColumnClass = (tier: TierKey): string => {
    if (validCurrentTier === tier) {
      return 'bg-primary/5 border-l-2 border-r-2 border-primary font-bold';
    }
    if (validHighlightTier === tier && !validCurrentTier) {
      return 'bg-accent/5 border-l border-r border-accent';
    }
    return '';
  };

  const tierKeys: TierKey[] = ['free', 'tier1', 'tier2', 'tier3'];

  return (
    <div className={cn('w-full overflow-x-auto', className)}>
      <Table>
        <TableCaption>Compare subscription tier features</TableCaption>
        <TableHeader>
          <TableRow>
            <TableHead className="w-[200px] sticky left-0 bg-background z-10">
              Feature
            </TableHead>
            {tierKeys.map((tier) => (
              <TableHead
                key={tier}
                className={cn('text-center', getColumnClass(tier))}
              >
                {TIER_LABELS[tier]}
                {validCurrentTier === tier && (
                  <div className="mt-1 flex justify-center">
                    <Badge variant="default" className="text-xs">
                      Current Plan
                    </Badge>
                  </div>
                )}
              </TableHead>
            ))}
          </TableRow>
        </TableHeader>
        <TableBody>
          {FEATURE_CATEGORIES.map((category) => (
            <React.Fragment key={category.name}>
              <TableRow className="bg-muted/50 hover:bg-muted/50">
                <TableCell
                  colSpan={5}
                  className="font-bold border-t-2 border-b sticky left-0 bg-muted/50 z-10"
                >
                  {category.name}
                </TableCell>
              </TableRow>
              {category.features.map((feature) => (
                <TableRow key={feature.name}>
                  <TableHead
                    scope="row"
                    className="font-normal text-foreground sticky left-0 bg-background z-10"
                  >
                    {feature.name}
                  </TableHead>
                  {tierKeys.map((tier) => (
                    <TableCell
                      key={tier}
                      className={cn('text-center', getColumnClass(tier))}
                    >
                      <FeatureValueCell value={feature.values[tier]} />
                    </TableCell>
                  ))}
                </TableRow>
              ))}
            </React.Fragment>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
