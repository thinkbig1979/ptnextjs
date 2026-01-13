import type { SectionHelp, FieldHelp } from '../types';

/**
 * Help content for the tier/subscription system
 */

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
