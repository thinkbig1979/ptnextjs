import type { CollectionConfig } from 'payload';

import { isAdmin } from '../access/rbac';

const AuditLogs: CollectionConfig = {
  slug: 'audit_logs',
  admin: {
    useAsTitle: 'event',
    description: 'Authentication audit trail',
    defaultColumns: ['event', 'email', 'ipAddress', 'timestamp'],
    group: 'System',
  },
  access: {
    // Only admins can read audit logs
    read: isAdmin,
    // Only server can create (via local API)
    create: () => false,
    // No updates allowed
    update: () => false,
    // No deletes allowed
    delete: () => false,
  },
  fields: [
    {
      name: 'event',
      type: 'select',
      required: true,
      options: [
        { label: 'Login Success', value: 'LOGIN_SUCCESS' },
        { label: 'Login Failed', value: 'LOGIN_FAILED' },
        { label: 'Logout', value: 'LOGOUT' },
        { label: 'Token Refresh', value: 'TOKEN_REFRESH' },
        { label: 'Token Refresh Failed', value: 'TOKEN_REFRESH_FAILED' },
        { label: 'Password Changed', value: 'PASSWORD_CHANGED' },
        { label: 'Account Suspended', value: 'ACCOUNT_SUSPENDED' },
        { label: 'Account Approved', value: 'ACCOUNT_APPROVED' },
        { label: 'Account Rejected', value: 'ACCOUNT_REJECTED' },
      ],
      admin: {
        description: 'Type of authentication event',
      },
    },
    {
      name: 'user',
      type: 'relationship',
      relationTo: 'users',
      admin: {
        description: 'User who triggered the event (if authenticated)',
      },
    },
    {
      name: 'email',
      type: 'text',
      required: true,
      admin: {
        description: 'Email address (preserved even if user deleted)',
      },
    },
    {
      name: 'ipAddress',
      type: 'text',
      admin: {
        description: 'Client IP address',
      },
    },
    {
      name: 'userAgent',
      type: 'text',
      admin: {
        description: 'Browser/client user agent string',
      },
    },
    {
      name: 'tokenId',
      type: 'text',
      admin: {
        description: 'JWT token ID (jti) for token-related events',
      },
    },
    {
      name: 'metadata',
      type: 'json',
      admin: {
        description: 'Additional event-specific data',
      },
    },
    {
      name: 'timestamp',
      type: 'date',
      required: true,
      defaultValue: () => new Date().toISOString(),
      admin: {
        date: {
          displayFormat: 'MMM d, yyyy h:mm:ss a',
        },
        description: 'When the event occurred',
      },
    },
  ],
  timestamps: false, // Using custom timestamp field
};

export default AuditLogs;
