import type { CollectionConfig } from 'payload';
import { isAdmin } from '../access/rbac';

const Categories: CollectionConfig = {
  slug: 'categories',
  admin: {
    useAsTitle: 'name',
    defaultColumns: ['name', 'slug', 'parentCategory', 'published', 'order'],
    group: 'Content',
  },
  access: {
    // Only admins can CRUD categories
    create: isAdmin,
    read: () => true, // Public can read published categories
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
        description: 'Category name',
      },
    },
    {
      name: 'slug',
      type: 'text',
      required: true,
      unique: true,
      maxLength: 255,
      admin: {
        description: 'URL-friendly slug (auto-generated from name)',
      },
      hooks: {
        beforeValidate: [
          ({ value, data }) => {
            if (!value && data?.name) {
              // Auto-generate slug from category name
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
      type: 'textarea',
      maxLength: 1000,
      admin: {
        description: 'Category description',
      },
    },

    // Hierarchical Category Structure (Self-referencing)
    {
      name: 'parentCategory',
      type: 'relationship',
      relationTo: 'categories',
      hasMany: false,
      admin: {
        description: 'Parent category (leave empty for top-level category)',
      },
    },

    // Category Display Options
    {
      name: 'icon',
      type: 'text',
      maxLength: 100,
      admin: {
        description: 'Icon name (e.g., "Ship", "Anchor", "Compass")',
      },
    },
    {
      name: 'color',
      type: 'text',
      maxLength: 50,
      admin: {
        description: 'Display color (hex code or Tailwind color)',
      },
    },
    {
      name: 'order',
      type: 'number',
      defaultValue: 0,
      admin: {
        description: 'Display order (lower numbers appear first)',
      },
    },

    // Metadata
    {
      name: 'published',
      type: 'checkbox',
      defaultValue: true,
      admin: {
        position: 'sidebar',
        description: 'Make category visible to public',
      },
    },
  ],
  timestamps: true,
  hooks: {
    beforeChange: [
      // Prevent circular parent relationships
      async ({ req, data, operation, originalDoc }) => {
        if (data.parentCategory) {
          // Check if parent is not self
          if (operation === 'update' && data.parentCategory === originalDoc?.id) {
            throw new Error('A category cannot be its own parent');
          }

          // TODO: Add recursive check to prevent circular dependencies
          // (e.g., A -> B -> C -> A)
        }

        return data;
      },
    ],
  },
};

export default Categories;
