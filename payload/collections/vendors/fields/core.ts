/**
 * Core vendor fields (available to all tiers)
 * - Basic company information
 * - Contact details
 * - Category and tags
 */

import type { Field } from 'payload';
import { isAdminFieldAccess } from '../../../access/rbac';
import { adminOnlyUpdateAccess } from '../access/tier-access';

export const coreFields: Field[] = [
  // User Relationship (one-to-one with Users collection)
  {
    name: 'user',
    type: 'relationship',
    relationTo: 'users',
    required: true,
    unique: true,
    hasMany: false,
    admin: {
      position: 'sidebar',
      description: 'Associated user account',
    },
    access: {
      update: isAdminFieldAccess, // Only admins can change user relationship
    },
  },

  // Tier Configuration
  {
    name: 'tier',
    type: 'select',
    options: [
      { label: 'Free - Basic Profile', value: 'free' },
      { label: 'Tier 1 - Enhanced Profile', value: 'tier1' },
      { label: 'Tier 2 - Full Product Management', value: 'tier2' },
      { label: 'Tier 3 - Premium Promoted Profile', value: 'tier3' },
    ],
    defaultValue: 'free',
    required: true,
    admin: {
      position: 'sidebar',
      description: 'Subscription tier determines available features',
    },
    access: {
      update: isAdminFieldAccess, // Only admins can change tier
    },
  },

  // Basic Information (Available to all tiers)
  {
    name: 'companyName',
    type: 'text',
    required: true,
    maxLength: 255,
    admin: {
      description: 'Company name (visible to all tiers)',
    },
  },
  {
    name: 'slug',
    type: 'text',
    required: true,
    unique: true,
    maxLength: 255,
    admin: {
      description: 'URL-friendly slug (auto-generated from company name)',
    },
    hooks: {
      beforeValidate: [
        ({ value, data }) => {
          if (!value && data?.companyName) {
            // Auto-generate slug from company name
            return data.companyName
              .toLowerCase()
              .replace(/[^a-z0-9]+/g, '-')
              .replace(/^-+|-+$/g, '');
          }
          return value;
        },
      ],
    },
  },
  {
    name: 'description',
    type: 'textarea',
    maxLength: 5000,
    admin: {
      description: 'Company description (visible to all tiers)',
    },
  },
  {
    name: 'logo',
    type: 'upload',
    relationTo: 'media',
    required: false,
    admin: {
      description: 'Company logo (visible to all tiers)',
    },
  },
  {
    name: 'contactEmail',
    type: 'email',
    required: true,
    admin: {
      description: 'Contact email address',
    },
  },
  {
    name: 'contactPhone',
    type: 'text',
    maxLength: 50,
    admin: {
      description: 'Contact phone number',
    },
  },

  // Category and Tags (Available to all tiers)
  {
    name: 'category',
    type: 'relationship',
    relationTo: 'categories',
    hasMany: false,
    admin: {
      description: 'Primary business category (e.g., Navigation, Communication, etc.)',
    },
  },
  {
    name: 'tags',
    type: 'relationship',
    relationTo: 'tags',
    hasMany: true,
    admin: {
      description: 'Additional tags for this vendor',
    },
  },
];
