/**
 * Tier 2+ specific fields
 * - Product limit information
 */

import type { Field } from 'payload';
import { tier2UpdateAccess, tier2Condition, publicReadAccess } from '../access/tier-access';

export const tier2Fields: Field[] = [
  {
    name: 'productLimit',
    type: 'number',
    admin: {
      description: 'Product limit for tier 2 vendors (managed by admin)',
      condition: tier2Condition,
      readOnly: true,
    },
    access: {
      read: publicReadAccess,
      update: ({ req: { user } }) => user?.role === 'admin',
    },
  },
];
