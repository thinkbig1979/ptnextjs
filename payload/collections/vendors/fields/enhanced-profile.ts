/**
 * Enhanced profile fields (Tier 1+)
 * - Social media URLs
 * - Website
 * - Founded year
 */

import type { Field } from 'payload';
import { sanitizeUrlHook } from '../../../../lib/utils/url';
import { tier1UpdateAccess, tier1Condition, publicReadAccess } from '../access/tier-access';

export const enhancedProfileFields: Field[] = [
  // Founded Year (Tier 1+ - for years in business computation)
  {
    name: 'foundedYear',
    type: 'number',
    min: 1800,
    max: new Date().getFullYear(),
    admin: {
      description: 'Year company was founded (used to compute years in business) (Tier 1+ only)',
      condition: tier1Condition,
    },
    access: {
      read: publicReadAccess,
      update: tier1UpdateAccess,
    },
  },

  // Website
  {
    name: 'website',
    type: 'text',
    maxLength: 500,
    admin: {
      description: 'Company website (Tier 1+ only)',
      condition: tier1Condition,
    },
    hooks: {
      beforeChange: [sanitizeUrlHook],
    },
    access: {
      read: publicReadAccess,
      update: tier1UpdateAccess,
    },
  },

  // LinkedIn URL
  {
    name: 'linkedinUrl',
    type: 'text',
    maxLength: 500,
    admin: {
      description: 'LinkedIn profile URL (Tier 1+ only)',
      condition: tier1Condition,
    },
    hooks: {
      beforeChange: [sanitizeUrlHook],
    },
    access: {
      read: publicReadAccess,
      update: tier1UpdateAccess,
    },
  },

  // Twitter URL
  {
    name: 'twitterUrl',
    type: 'text',
    maxLength: 500,
    admin: {
      description: 'Twitter/X profile URL (Tier 1+ only)',
      condition: tier1Condition,
    },
    hooks: {
      beforeChange: [sanitizeUrlHook],
    },
    access: {
      read: publicReadAccess,
      update: tier1UpdateAccess,
    },
  },
];
