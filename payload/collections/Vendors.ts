import type { CollectionConfig } from 'payload';
import { isAdmin, isVendor } from '../access/rbac';

const Vendors: CollectionConfig = {
  slug: 'vendors',
  admin: {
    useAsTitle: 'companyName',
    defaultColumns: ['companyName', 'tier', 'published', 'featured', 'createdAt'],
    group: 'Content',
  },
  access: {
    // Admins can CRUD all vendors
    // Vendors can only read/update their own vendor profile
    create: isAdmin,
    read: () => true, // Public can read published vendors (filtered in frontend)
    update: ({ req: { user }, id }) => {
      if (!user) return false;
      if (user.role === 'admin') return true;
      // Vendors can only update their own profile
      return {
        'user': {
          equals: user.id,
        },
      };
    },
    delete: isAdmin,
  },
  fields: [
    // User Relationship (one-to-one with Users collection)
    {
      name: 'user',
      type: 'relationship',
      relationTo: 'users',
      required: true,
      unique: true,
      hasMany: false,
      admin: {
        position: 'sidebar',
        description: 'Associated user account',
      },
      access: {
        // @ts-expect-error - Payload CMS 3.x field-level access type compatibility
        update: isAdmin, // Only admins can change user relationship
      },
    },

    // Tier Configuration
    {
      name: 'tier',
      type: 'select',
      options: [
        { label: 'Free - Basic Profile', value: 'free' },
        { label: 'Tier 1 - Enhanced Profile', value: 'tier1' },
        { label: 'Tier 2 - Full Product Management', value: 'tier2' },
      ],
      defaultValue: 'free',
      required: true,
      admin: {
        position: 'sidebar',
        description: 'Subscription tier determines available features',
      },
      access: {
        // @ts-expect-error - Payload CMS 3.x field-level access type compatibility
        update: isAdmin, // Only admins can change tier
      },
    },

    // Basic Information (Available to all tiers)
    {
      name: 'companyName',
      type: 'text',
      required: true,
      maxLength: 255,
      admin: {
        description: 'Company name (visible to all tiers)',
      },
    },
    {
      name: 'slug',
      type: 'text',
      required: true,
      unique: true,
      maxLength: 255,
      admin: {
        description: 'URL-friendly slug (auto-generated from company name)',
      },
      hooks: {
        beforeValidate: [
          ({ value, data }) => {
            if (!value && data?.companyName) {
              // Auto-generate slug from company name
              return data.companyName
                .toLowerCase()
                .replace(/[^a-z0-9]+/g, '-')
                .replace(/^-+|-+$/g, '');
            }
            return value;
          },
        ],
      },
    },
    {
      name: 'description',
      type: 'textarea',
      maxLength: 5000,
      admin: {
        description: 'Company description (visible to all tiers)',
      },
    },
    {
      name: 'logo',
      type: 'text',
      maxLength: 500,
      admin: {
        description: 'Logo URL (visible to all tiers)',
      },
    },
    {
      name: 'contactEmail',
      type: 'email',
      required: true,
      admin: {
        description: 'Contact email address',
      },
    },
    {
      name: 'contactPhone',
      type: 'text',
      maxLength: 50,
      admin: {
        description: 'Contact phone number',
      },
    },

    // Enhanced Profile Fields (Tier 1+)
    {
      name: 'website',
      type: 'text',
      maxLength: 500,
      admin: {
        description: 'Company website (Tier 1+ only)',
        condition: (data) => data.tier === 'tier1' || data.tier === 'tier2',
      },
      access: {
        read: () => true,
        update: ({ req: { user }, data }) => {
          if (!user) return false;
          if (user.role === 'admin') return true;
          // Vendors can only edit if they have tier1 or tier2
          return data?.tier === 'tier1' || data?.tier === 'tier2';
        },
      },
    },
    {
      name: 'linkedinUrl',
      type: 'text',
      maxLength: 500,
      admin: {
        description: 'LinkedIn profile URL (Tier 1+ only)',
        condition: (data) => data.tier === 'tier1' || data.tier === 'tier2',
      },
      access: {
        read: () => true,
        update: ({ req: { user }, data }) => {
          if (!user) return false;
          if (user.role === 'admin') return true;
          return data?.tier === 'tier1' || data?.tier === 'tier2';
        },
      },
    },
    {
      name: 'twitterUrl',
      type: 'text',
      maxLength: 500,
      admin: {
        description: 'Twitter/X profile URL (Tier 1+ only)',
        condition: (data) => data.tier === 'tier1' || data.tier === 'tier2',
      },
      access: {
        read: () => true,
        update: ({ req: { user }, data }) => {
          if (!user) return false;
          if (user.role === 'admin') return true;
          return data?.tier === 'tier1' || data?.tier === 'tier2';
        },
      },
    },
    {
      name: 'certifications',
      type: 'array',
      admin: {
        description: 'Company certifications (Tier 1+ only)',
        condition: (data) => data.tier === 'tier1' || data.tier === 'tier2',
      },
      access: {
        read: () => true,
        update: ({ req: { user }, data }) => {
          if (!user) return false;
          if (user.role === 'admin') return true;
          return data?.tier === 'tier1' || data?.tier === 'tier2';
        },
      },
      fields: [
        {
          name: 'certification',
          type: 'text',
          required: true,
          maxLength: 255,
        },
      ],
    },

    // Metadata
    {
      name: 'featured',
      type: 'checkbox',
      defaultValue: false,
      admin: {
        position: 'sidebar',
        description: 'Feature this vendor on homepage',
      },
      access: {
        // @ts-expect-error - Payload CMS 3.x field-level access type compatibility
        update: isAdmin, // Only admins can feature vendors
      },
    },
    {
      name: 'published',
      type: 'checkbox',
      defaultValue: false,
      admin: {
        position: 'sidebar',
        description: 'Make vendor profile public',
      },
      access: {
        // @ts-expect-error - Payload CMS 3.x field-level access type compatibility
        update: isAdmin, // Only admins can publish vendors
      },
    },
  ],
  timestamps: true,
  hooks: {
    beforeChange: [
      // Validate tier restrictions
      async ({ req, data, operation }) => {
        if (operation === 'update' && req.user?.role !== 'admin') {
          const tier = data.tier || 'free';

          // Check if vendor is trying to update tier1+ fields without permission
          const tier1Fields = ['website', 'linkedinUrl', 'twitterUrl', 'certifications'];
          const restrictedFields = tier1Fields.filter((field) => {
            return data[field] !== undefined && (tier !== 'tier1' && tier !== 'tier2');
          });

          if (restrictedFields.length > 0) {
            throw new Error(
              `Tier restricted: Fields ${restrictedFields.join(', ')} require Tier 1 or higher`
            );
          }
        }

        return data;
      },
    ],
  },
};

export default Vendors;
