import type { CollectionConfig } from 'payload';
import { lexicalEditor } from '@payloadcms/richtext-lexical';
import { isAdmin } from '../access/rbac';

const Products: CollectionConfig = {
  slug: 'products',
  admin: {
    useAsTitle: 'name',
    defaultColumns: ['name', 'vendor', 'published', 'createdAt'],
    group: 'Content',
  },
  access: {
    // Admins can CRUD all products
    // Tier 2 vendors can CRUD their own products
    create: ({ req: { user } }) => {
      if (!user) return false;
      if (user.role === 'admin') return true;
      // Only tier2 vendors can create products
      // This will be validated by checking vendor.tier in beforeChange hook
      return user.role === 'vendor';
    },
    read: () => true, // Public can read published products
    update: ({ req: { user } }) => {
      if (!user) return false;
      if (user.role === 'admin') return true;
      // Vendors can only update products linked to their vendor profile
      return {
        'vendor.user': {
          equals: user.id,
        },
      };
    },
    delete: ({ req: { user } }) => {
      if (!user) return false;
      if (user.role === 'admin') return true;
      return {
        'vendor.user': {
          equals: user.id,
        },
      };
    },
  },
  fields: [
    // Vendor Relationship (Required - products belong to vendors)
    {
      name: 'vendor',
      type: 'relationship',
      relationTo: 'vendors',
      required: true,
      hasMany: false,
      admin: {
        position: 'sidebar',
        description: 'Vendor that owns this product',
      },
    },

    // Basic Product Information
    {
      name: 'name',
      type: 'text',
      required: true,
      maxLength: 255,
      admin: {
        description: 'Product name',
      },
    },
    {
      name: 'slug',
      type: 'text',
      required: true,
      unique: true,
      maxLength: 255,
      admin: {
        description: 'URL-friendly slug (auto-generated from product name)',
      },
      hooks: {
        beforeValidate: [
          ({ value, data }) => {
            if (!value && data?.name) {
              // Auto-generate slug from product name
              return data.name
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
      type: 'richText',
      editor: lexicalEditor({}),
      required: true,
      admin: {
        description: 'Full product description',
      },
    },
    {
      name: 'shortDescription',
      type: 'textarea',
      maxLength: 500,
      admin: {
        description: 'Short product summary for listings',
      },
    },

    // Product Images
    {
      name: 'images',
      type: 'array',
      admin: {
        description: 'Product images',
      },
      fields: [
        {
          name: 'url',
          type: 'text',
          required: true,
          maxLength: 500,
        },
        {
          name: 'altText',
          type: 'text',
          maxLength: 255,
        },
        {
          name: 'isMain',
          type: 'checkbox',
          defaultValue: false,
          admin: {
            description: 'Mark as main product image',
          },
        },
        {
          name: 'caption',
          type: 'text',
          maxLength: 255,
        },
      ],
    },

    // Categories and Tags
    {
      name: 'categories',
      type: 'relationship',
      relationTo: 'categories',
      hasMany: true,
      admin: {
        description: 'Product categories',
      },
    },

    // Product Specifications (JSONB-like structure)
    {
      name: 'specifications',
      type: 'array',
      admin: {
        description: 'Technical specifications',
      },
      fields: [
        {
          name: 'label',
          type: 'text',
          required: true,
          maxLength: 100,
        },
        {
          name: 'value',
          type: 'text',
          required: true,
          maxLength: 500,
        },
      ],
    },

    // Metadata
    {
      name: 'published',
      type: 'checkbox',
      defaultValue: false,
      admin: {
        position: 'sidebar',
        description: 'Make product visible to public',
      },
      access: {
        // @ts-expect-error - Payload CMS 3.x canary types may have incompatibilities with field-level access
        update: isAdmin, // Only admins can publish products
      },
    },
  ],
  timestamps: true,
  hooks: {
    beforeChange: [
      // Validate that vendor has tier2 access
      async ({ req, data, operation }) => {
        if (operation === 'create' && req.user?.role === 'vendor') {
          // Fetch vendor to check tier
          const vendor = await req.payload.find({
            collection: 'vendors',
            where: {
              user: {
                equals: req.user.id,
              },
            },
          });

          if (!vendor.docs[0] || vendor.docs[0].tier !== 'tier2') {
            throw new Error(
              'Product creation requires Tier 2 subscription. Please upgrade your account.'
            );
          }
        }

        return data;
      },
    ],
  },
};

export default Products;
