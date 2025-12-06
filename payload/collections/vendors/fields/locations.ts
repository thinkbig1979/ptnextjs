/**
 * Locations array field (Tier 1+)
 */

import type { Field } from 'payload';
import { tier1UpdateAccess, tier1Condition, publicReadAccess } from '../access/tier-access';

export const locationsField: Field = {
  name: 'locations',
  type: 'array',
  admin: {
    description: 'Office and service locations (Tier 1+ only)',
    condition: tier1Condition,
  },
  access: {
    read: publicReadAccess,
    // @ts-expect-error - Payload CMS 3.x field-level access type compatibility
    update: tier1UpdateAccess,
  },
  fields: [
    {
      name: 'address',
      type: 'text',
      required: true,
      maxLength: 500,
      admin: {
        description: 'Full address',
      },
    },
    {
      name: 'geocodingButton',
      type: 'ui',
      admin: {
        components: {
          Field: '/payload/fields/GeocodingButton',
        },
      },
    },
    {
      name: 'latitude',
      type: 'number',
      admin: {
        description: 'Latitude (auto-filled by geocoding)',
        readOnly: true,
      },
    },
    {
      name: 'longitude',
      type: 'number',
      admin: {
        description: 'Longitude (auto-filled by geocoding)',
        readOnly: true,
      },
    },
    {
      name: 'city',
      type: 'text',
      maxLength: 255,
      admin: {
        description: 'City',
      },
    },
    {
      name: 'state',
      type: 'text',
      maxLength: 255,
      admin: {
        description: 'State/Province',
      },
    },
    {
      name: 'country',
      type: 'text',
      required: true,
      maxLength: 255,
      admin: {
        description: 'Country',
      },
    },
    {
      name: 'postalCode',
      type: 'text',
      maxLength: 50,
      admin: {
        description: 'Postal/ZIP code',
      },
    },
    {
      name: 'phone',
      type: 'text',
      maxLength: 50,
      admin: {
        description: 'Location phone number',
      },
    },
    {
      name: 'email',
      type: 'email',
      admin: {
        description: 'Location email',
      },
    },
    {
      name: 'type',
      type: 'select',
      options: [
        { label: 'Headquarters', value: 'headquarters' },
        { label: 'Office', value: 'office' },
        { label: 'Showroom', value: 'showroom' },
        { label: 'Service Center', value: 'service' },
        { label: 'Warehouse', value: 'warehouse' },
      ],
      defaultValue: 'office',
    },
    {
      name: 'isPrimary',
      type: 'checkbox',
      defaultValue: false,
      admin: {
        description: 'Primary location',
      },
    },
  ],
};
