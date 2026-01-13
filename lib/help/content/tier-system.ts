import type { SectionHelp, FieldHelp } from '../types';

/**
 * Help content for the tier/subscription system
 */

/** Tier explanation content */
export interface TierExplanation {
  tier: 'free' | 'tier1' | 'tier2' | 'tier3';
  name: string;
  description: string;
  highlights: string[];
}

/** Detailed tier explanations */
export const tierExplanations: TierExplanation[] = [
  {
    tier: 'free',
    name: 'Free',
    description: 'Basic listing with 1 location. Perfect for getting started.',
    highlights: [
      'Basic company profile',
      '1 product listing',
      '1 business location',
      'Standard email support',
    ],
  },
  {
    tier: 'tier1',
    name: 'Tier 1',
    description: 'Enhanced profile with brand story, team, media gallery. Up to 1 location.',
    highlights: [
      'Up to 5 products',
      'Video introduction',
      'Team member profiles',
      'Social media links',
      'Priority email support (24hrs)',
    ],
  },
  {
    tier: 'tier2',
    name: 'Tier 2',
    description: 'Full product catalog and up to 5 locations. Best for growing businesses.',
    highlights: [
      'Up to 25 products',
      '5 featured products',
      'Up to 5 business locations',
      'Custom branding colors',
      'Advanced analytics',
      'Homepage featured listing',
    ],
  },
  {
    tier: 'tier3',
    name: 'Tier 3',
    description: 'Unlimited locations, promotion pack, premium features.',
    highlights: [
      'Unlimited products',
      'Up to 10 business locations',
      'Priority search ranking',
      'Dedicated account manager',
      'Premium email support (4hrs)',
      '12 promotion credits/month',
    ],
  },
];

/** Get tier explanation by tier key */
export function getTierExplanation(tier: 'free' | 'tier1' | 'tier2' | 'tier3'): TierExplanation | undefined {
  return tierExplanations.find((t) => t.tier === tier);
}

/** Individual tier feature explanations */
export const tierFeatureHelp: Record<string, FieldHelp> = {
  profileVisibility: {
    fieldName: 'profileVisibility',
    tooltip: {
      text: 'Higher tiers receive priority placement in search results and category listings.',
      title: 'Profile Visibility',
    },
  },
  locationCount: {
    fieldName: 'locationCount',
    tooltip: {
      text: 'The number of business locations you can list on your profile.',
      title: 'Location Limit',
    },
  },
  productCount: {
    fieldName: 'productCount',
    tooltip: {
      text: 'The maximum number of products or services you can showcase.',
      title: 'Product Limit',
    },
  },
  featuredListing: {
    fieldName: 'featuredListing',
    tooltip: {
      text: 'Featured vendors appear in highlighted sections and receive additional exposure.',
      title: 'Featured Listing',
    },
  },
  analyticsAccess: {
    fieldName: 'analyticsAccess',
    tooltip: {
      text: 'Access to profile views, search appearances, and engagement metrics.',
      title: 'Analytics Dashboard',
    },
  },
  prioritySupport: {
    fieldName: 'prioritySupport',
    tooltip: {
      text: 'Faster response times and dedicated support for premium tier members.',
      title: 'Priority Support',
    },
  },
};

export const tierSystemHelp: SectionHelp = {
  sectionId: 'tier-system',
  title: 'Subscription Tiers',
  description: 'Choose the right tier for your business needs and growth goals',
  fields: Object.values(tierFeatureHelp),
};

export default tierSystemHelp;
