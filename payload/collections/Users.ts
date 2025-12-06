import type { CollectionConfig } from 'payload';

import {
  sendUserApprovedEmail,
  sendUserRejectedEmail,
} from '../../lib/services/EmailService';

const Users: CollectionConfig = {
  slug: 'users',
  auth: {
    useAPIKey: false,
    tokenExpiration: 3600, // 1 hour in seconds
    verify: false, // Email verification (future enhancement)
    maxLoginAttempts: 5,
    lockTime: 15 * 60 * 1000, // 15 minutes
  },
  admin: {
    useAsTitle: 'email',
    defaultColumns: ['email', 'role', 'status', 'createdAt'],
    group: 'User Management',
  },
  access: {
    // Allow first user creation (when no users exist)
    // After that, only admins can create users
    create: async ({ req: { user, payload } }) => {
      // Allow creation if no users exist (first user)
      if (!user) {
        const existingUsers = await payload.find({
          collection: 'users',
          limit: 1,
        });
        return existingUsers.docs.length === 0;
      }
      // Otherwise, only admins can create users
      return user.role === 'admin';
    },
    read: ({ req: { user } }) => {
      if (!user) return false;
      if (user.role === 'admin') return true;
      return { id: { equals: user.id } }; // Vendors can only read their own record
    },
    update: ({ req: { user } }) => {
      if (!user) return false;
      if (user.role === 'admin') return true;
      return { id: { equals: user.id } }; // Vendors can only update their own record
    },
    delete: ({ req: { user } }) => user?.role === 'admin',
  },
  fields: [
    {
      name: 'role',
      type: 'select',
      options: [
        { label: 'Admin', value: 'admin' },
        { label: 'Vendor', value: 'vendor' },
      ],
      defaultValue: 'vendor',
      required: true,
      admin: {
        position: 'sidebar',
        description: 'User role determines access level',
      },
      access: {
        // Only admins can change roles
        update: ({ req: { user } }) => user?.role === 'admin',
      },
    },
    {
      name: 'status',
      type: 'select',
      options: [
        { label: 'Pending', value: 'pending' },
        { label: 'Approved', value: 'approved' },
        { label: 'Rejected', value: 'rejected' },
        { label: 'Suspended', value: 'suspended' },
      ],
      defaultValue: 'pending',
      required: true,
      admin: {
        position: 'sidebar',
        description: 'Account approval status',
      },
      access: {
        // Only admins can change status
        update: ({ req: { user } }) => user?.role === 'admin',
      },
    },
    {
      name: 'rejectionReason',
      type: 'textarea',
      admin: {
        position: 'sidebar',
        description: 'Reason for rejection (admin use only)',
        condition: (data) => data.status === 'rejected',
      },
      access: {
        read: ({ req: { user } }) => user?.role === 'admin',
        update: ({ req: { user } }) => user?.role === 'admin',
      },
    },
    {
      name: 'approvedAt',
      type: 'date',
      admin: {
        position: 'sidebar',
        readOnly: true,
        date: {
          displayFormat: 'MMM d, yyyy h:mm a',
        },
      },
    },
    {
      name: 'rejectedAt',
      type: 'date',
      admin: {
        position: 'sidebar',
        readOnly: true,
        condition: (data) => data.status === 'rejected',
        date: {
          displayFormat: 'MMM d, yyyy h:mm a',
        },
      },
    },
  ],
  timestamps: true,
  hooks: {
    beforeChange: [
      // Set approval/rejection timestamps when status changes
      async ({ data, originalDoc, operation }) => {
        if (operation !== 'update' || !originalDoc) {
          return data;
        }

        const wasStatus = originalDoc.status;
        const isNowStatus = data.status;

        // Set approvedAt timestamp when status changes to 'approved'
        if (isNowStatus === 'approved' && wasStatus !== 'approved') {
          data.approvedAt = new Date().toISOString();
        }

        // Set rejectedAt timestamp when status changes to 'rejected'
        if (isNowStatus === 'rejected' && wasStatus !== 'rejected') {
          data.rejectedAt = new Date().toISOString();
        }

        return data;
      },
    ],
    afterChange: [
      // Send email notifications on user approval/rejection
      async ({ doc, previousDoc, operation, req }) => {
        try {
          // Only process update operations with previous doc
          if (operation !== 'update' || !previousDoc) {
            return doc;
          }

          const wasStatus = previousDoc.status;
          const isNowStatus = doc.status;

          // Status didn't change - no email needed
          if (wasStatus === isNowStatus) {
            return doc;
          }

          // Get vendor info if linked (for vendor name in rejection email)
          let vendorName: string | undefined;
          if (doc.role === 'vendor') {
            try {
              const vendorDocs = await req.payload.find({
                collection: 'vendors',
                where: {
                  user: { equals: doc.id },
                },
                limit: 1,
              });
              if (vendorDocs.docs.length > 0) {
                vendorName = vendorDocs.docs[0].companyName;
              }
            } catch {
              // Silently continue without vendor name
            }
          }

          // User approved - status changed to 'approved'
          if (isNowStatus === 'approved' && wasStatus !== 'approved') {
            console.log('[EmailService] Sending user approved email...');
            await sendUserApprovedEmail({
              email: doc.email,
            });
          }

          // User rejected - status changed to 'rejected'
          if (isNowStatus === 'rejected' && wasStatus !== 'rejected') {
            console.log('[EmailService] Sending user rejected email...');
            await sendUserRejectedEmail({
              email: doc.email,
              vendorName,
              rejectionReason: doc.rejectionReason,
            });
          }
        } catch (error) {
          const errorMessage = error instanceof Error ? error.message : String(error);
          console.error('[EmailService] Failed to send user status email:', errorMessage);
          // Don't block document operations on email failure
        }
        return doc;
      },
    ],
  },
};

export default Users;
