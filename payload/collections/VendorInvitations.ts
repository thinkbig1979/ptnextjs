import type { CollectionConfig } from 'payload';

import { isAdmin } from '../access/rbac';

const VendorInvitations: CollectionConfig = {
  slug: 'vendor-invitations',
  admin: {
    useAsTitle: 'email',
    defaultColumns: ['email', 'status', 'vendor', 'expiresAt', 'createdAt'],
    group: 'Content',
  },
  access: {
    create: isAdmin,
    read: isAdmin,
    update: isAdmin,
    delete: isAdmin,
  },
  fields: [
    {
      name: 'vendor',
      type: 'relationship',
      relationTo: 'vendors',
      required: true,
      index: true,
      admin: {
        description: 'The vendor profile this invitation is for',
      },
    },
    {
      name: 'email',
      type: 'email',
      required: true,
      index: true,
      admin: {
        description: 'Email address the invitation was sent to',
      },
    },
    {
      name: 'token',
      type: 'text',
      required: true,
      unique: true,
      index: true,
      admin: {
        description: 'Opaque invitation token (64-char hex)',
        readOnly: true,
      },
    },
    {
      name: 'status',
      type: 'select',
      options: [
        { label: 'Pending', value: 'pending' },
        { label: 'Claimed', value: 'claimed' },
        { label: 'Expired', value: 'expired' },
        { label: 'Revoked', value: 'revoked' },
      ],
      defaultValue: 'pending',
      required: true,
      admin: {
        description: 'Current status of the invitation',
      },
    },
    {
      name: 'expiresAt',
      type: 'date',
      required: true,
      admin: {
        description: 'When this invitation expires',
        date: {
          pickerAppearance: 'dayAndTime',
        },
      },
    },
    {
      name: 'claimedAt',
      type: 'date',
      admin: {
        description: 'When the invitation was claimed',
        date: {
          pickerAppearance: 'dayAndTime',
        },
      },
    },
    {
      name: 'claimedByUser',
      type: 'relationship',
      relationTo: 'users',
      admin: {
        description: 'The user who claimed this invitation',
      },
    },
  ],
  timestamps: true,
};

export default VendorInvitations;
