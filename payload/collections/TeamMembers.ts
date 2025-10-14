import type { CollectionConfig } from 'payload';
import { isAdmin } from '../access/rbac';

const TeamMembers: CollectionConfig = {
  slug: 'team-members',
  admin: {
    useAsTitle: 'name',
    defaultColumns: ['name', 'role', 'displayOrder', 'published', 'createdAt'],
    group: 'Content',
  },
  access: {
    // Only admins can CRUD team members
    create: isAdmin,
    read: () => true, // Public can read published team members
    update: isAdmin,
    delete: isAdmin,
  },
  fields: [
    {
      name: 'name',
      type: 'text',
      required: true,
      maxLength: 255,
      admin: {
        description: 'Team member full name',
      },
    },
    {
      name: 'role',
      type: 'text',
      required: true,
      maxLength: 255,
      admin: {
        description: 'Job title or role',
      },
    },
    {
      name: 'bio',
      type: 'textarea',
      maxLength: 2000,
      admin: {
        description: 'Team member biography',
      },
    },

    // Contact Information
    {
      name: 'photo',
      type: 'text',
      maxLength: 500,
      admin: {
        description: 'Profile photo URL',
      },
    },
    {
      name: 'email',
      type: 'email',
      admin: {
        description: 'Contact email address',
      },
    },

    // Social Media Links
    {
      name: 'linkedinUrl',
      type: 'text',
      maxLength: 500,
      admin: {
        description: 'LinkedIn profile URL',
      },
    },
    {
      name: 'twitterUrl',
      type: 'text',
      maxLength: 500,
      admin: {
        description: 'Twitter/X profile URL',
      },
    },

    // Display Options
    {
      name: 'displayOrder',
      type: 'number',
      defaultValue: 0,
      admin: {
        position: 'sidebar',
        description: 'Display order (lower numbers appear first)',
      },
    },
    {
      name: 'published',
      type: 'checkbox',
      defaultValue: true,
      admin: {
        position: 'sidebar',
        description: 'Make team member visible to public',
      },
    },
  ],
  timestamps: true,
};

export default TeamMembers;
