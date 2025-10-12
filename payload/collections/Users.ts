import type { CollectionConfig } from 'payload';

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
    // Admins can CRUD all users
    // Vendors can only read their own user record
    create: ({ req: { user } }) => user?.role === 'admin',
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
};

export default Users;
