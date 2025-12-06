/**
 * Social proof fields (Tier 1+)
 * - Total projects
 * - Years in business
 * - Employee count
 * - Social media followers
 * - Client satisfaction metrics
 */

import type { Field } from 'payload';
import { tier1UpdateAccess, tier1Condition, publicReadAccess } from '../access/tier-access';

export const socialProofFields: Field[] = [
  {
    name: 'totalProjects',
    type: 'number',
    admin: {
      description: 'Total number of completed projects (Tier 1+ only)',
      condition: tier1Condition,
    },
    access: {
      read: publicReadAccess,
      // @ts-expect-error - Payload CMS 3.x field-level access type compatibility
      update: tier1UpdateAccess,
    },
  },
  {
    name: 'yearsInBusiness',
    type: 'number',
    admin: {
      description: 'Years in business (Tier 1+ only)',
      condition: tier1Condition,
    },
    access: {
      read: publicReadAccess,
      // @ts-expect-error - Payload CMS 3.x field-level access type compatibility
      update: tier1UpdateAccess,
    },
  },
  {
    name: 'employeeCount',
    type: 'number',
    admin: {
      description: 'Number of employees (Tier 1+ only)',
      condition: tier1Condition,
    },
    access: {
      read: publicReadAccess,
      // @ts-expect-error - Payload CMS 3.x field-level access type compatibility
      update: tier1UpdateAccess,
    },
  },
  {
    name: 'linkedinFollowers',
    type: 'number',
    admin: {
      description: 'LinkedIn follower count (Tier 1+ only)',
      condition: tier1Condition,
    },
    access: {
      read: publicReadAccess,
      // @ts-expect-error - Payload CMS 3.x field-level access type compatibility
      update: tier1UpdateAccess,
    },
  },
  {
    name: 'instagramFollowers',
    type: 'number',
    admin: {
      description: 'Instagram follower count (Tier 1+ only)',
      condition: tier1Condition,
    },
    access: {
      read: publicReadAccess,
      // @ts-expect-error - Payload CMS 3.x field-level access type compatibility
      update: tier1UpdateAccess,
    },
  },
  {
    name: 'clientSatisfactionScore',
    type: 'number',
    min: 0,
    max: 10,
    admin: {
      description: 'Client satisfaction score (0-10) (Tier 1+ only)',
      condition: tier1Condition,
    },
    access: {
      read: publicReadAccess,
      // @ts-expect-error - Payload CMS 3.x field-level access type compatibility
      update: tier1UpdateAccess,
    },
  },
  {
    name: 'repeatClientPercentage',
    type: 'number',
    min: 0,
    max: 100,
    admin: {
      description: 'Repeat client percentage (0-100) (Tier 1+ only)',
      condition: tier1Condition,
    },
    access: {
      read: publicReadAccess,
      // @ts-expect-error - Payload CMS 3.x field-level access type compatibility
      update: tier1UpdateAccess,
    },
  },
];
