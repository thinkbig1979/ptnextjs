/**
 * Metadata and status fields
 * - Published, featured, partner flags
 * - Registration status
 * - SEO metadata
 */

import type { Field } from 'payload';
import { lexicalEditor } from '@payloadcms/richtext-lexical';
import { isAdmin } from '../../access/rbac';

export const metadataFields: Field[] = [
  // Publishing and Status
  {
    name: 'published',
    type: 'checkbox',
    defaultValue: false,
    admin: {
      position: 'sidebar',
      description: 'Publish this vendor profile (admin only)',
    },
    access: {
      // @ts-expect-error - Payload CMS 3.x field-level access type compatibility
      update: isAdmin, // Only admins can publish
    },
  },
  {
    name: 'featured',
    type: 'checkbox',
    defaultValue: false,
    admin: {
      position: 'sidebar',
      description: 'Feature this vendor on homepage (admin only)',
    },
    access: {
      // @ts-expect-error - Payload CMS 3.x field-level access type compatibility
      update: isAdmin, // Only admins can feature vendors
    },
  },
  {
    name: 'partner',
    type: 'checkbox',
    defaultValue: false,
    admin: {
      position: 'sidebar',
      description: 'Mark as partner (vs. supplier)',
    },
  },
  {
    name: 'registrationStatus',
    type: 'select',
    options: [
      { label: 'Pending Review', value: 'pending' },
      { label: 'Approved', value: 'approved' },
      { label: 'Rejected', value: 'rejected' },
    ],
    defaultValue: 'pending',
    admin: {
      position: 'sidebar',
      description: 'Vendor registration approval status',
    },
    access: {
      // @ts-expect-error - Payload CMS 3.x field-level access type compatibility
      update: isAdmin, // Only admins can change registration status
    },
  },
  {
    name: 'rejectionReason',
    type: 'textarea',
    maxLength: 1000,
    admin: {
      position: 'sidebar',
      description: 'Reason for rejection (shown to vendor)',
      condition: (data) => data?.registrationStatus === 'rejected',
    },
    access: {
      // @ts-expect-error - Payload CMS 3.x field-level access type compatibility
      update: isAdmin, // Only admins can set rejection reason
    },
  },

  // SEO Metadata
  {
    name: 'metaTitle',
    type: 'text',
    maxLength: 255,
    admin: {
      description: 'SEO meta title (defaults to company name)',
    },
  },
  {
    name: 'metaDescription',
    type: 'textarea',
    maxLength: 500,
    admin: {
      description: 'SEO meta description (defaults to description)',
    },
  },
  {
    name: 'metaKeywords',
    type: 'text',
    maxLength: 500,
    admin: {
      description: 'SEO keywords (comma-separated)',
    },
  },

  // Admin Notes
  {
    name: 'adminNotes',
    type: 'richText',
    editor: lexicalEditor(),
    admin: {
      position: 'sidebar',
      description: 'Internal admin notes (not visible to vendor or public)',
    },
    access: {
      read: isAdmin,
      // @ts-expect-error - Payload CMS 3.x field-level access type compatibility
      update: isAdmin,
    },
  },
];
