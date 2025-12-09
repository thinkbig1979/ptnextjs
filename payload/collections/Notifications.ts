import type { CollectionConfig } from 'payload';

/**
 * Notifications Collection
 *
 * Stores in-app notifications for users. Notifications are created when:
 * - Tier upgrade/downgrade requests are submitted (admin notification)
 * - Tier upgrade/downgrade requests are approved (vendor notification)
 * - Tier upgrade/downgrade requests are rejected (vendor notification)
 *
 * Each user can only see their own notifications.
 */
const Notifications: CollectionConfig = {
  slug: 'notifications',
  labels: {
    singular: 'Notification',
    plural: 'Notifications',
  },
  admin: {
    useAsTitle: 'title',
    defaultColumns: ['title', 'type', 'user', 'read', 'createdAt'],
    group: 'System',
    description: 'In-app notifications for users',
  },
  access: {
    // Users can only read their own notifications
    read: ({ req: { user } }) => {
      if (!user) return false;

      // Admins can read all notifications
      if (user.role === 'admin') {
        return true;
      }

      // Vendors can only read their own notifications
      return {
        user: {
          equals: user.id,
        },
      };
    },
    // Only system (hooks) and admins can create notifications
    create: ({ req: { user } }) => {
      // Allow server-side creation (hooks don't have user context)
      if (!user) return true;

      // Admins can manually create notifications
      return user.role === 'admin';
    },
    // Users can update their own notifications (mark as read)
    update: ({ req: { user } }) => {
      if (!user) return false;

      // Admins can update all notifications
      if (user.role === 'admin') {
        return true;
      }

      // Vendors can only update their own notifications
      return {
        user: {
          equals: user.id,
        },
      };
    },
    // Only admins can delete notifications
    delete: ({ req: { user } }) => {
      return user?.role === 'admin';
    },
  },
  fields: [
    {
      name: 'user',
      type: 'relationship',
      relationTo: 'users',
      required: true,
      index: true,
      admin: {
        description: 'The user who will receive this notification',
      },
    },
    {
      name: 'type',
      type: 'select',
      required: true,
      index: true,
      options: [
        { label: 'Tier Upgrade Submitted', value: 'tier_upgrade_submitted' },
        { label: 'Tier Upgrade Approved', value: 'tier_upgrade_approved' },
        { label: 'Tier Upgrade Rejected', value: 'tier_upgrade_rejected' },
        { label: 'Tier Downgrade Submitted', value: 'tier_downgrade_submitted' },
        { label: 'Tier Downgrade Approved', value: 'tier_downgrade_approved' },
        { label: 'Tier Downgrade Rejected', value: 'tier_downgrade_rejected' },
      ],
      admin: {
        description: 'Type of notification',
      },
    },
    {
      name: 'title',
      type: 'text',
      required: true,
      admin: {
        description: 'Notification title/headline',
      },
    },
    {
      name: 'message',
      type: 'textarea',
      required: true,
      admin: {
        description: 'Notification message body',
      },
    },
    {
      name: 'read',
      type: 'checkbox',
      defaultValue: false,
      index: true,
      admin: {
        description: 'Whether the user has read this notification',
      },
    },
    {
      name: 'metadata',
      type: 'json',
      admin: {
        description: 'Additional metadata about the notification (vendorId, requestId, etc.)',
      },
    },
  ],
  timestamps: true,
  hooks: {
    // Automatically set createdAt index for sorting
    beforeChange: [
      async ({ data }) => {
        // Ensure read status is boolean
        if (typeof data.read !== 'boolean') {
          data.read = false;
        }
        return data;
      },
    ],
  },
};

export default Notifications;
