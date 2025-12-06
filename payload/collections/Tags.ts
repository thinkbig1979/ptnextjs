import type { CollectionConfig } from 'payload';

import { isAdmin } from '../access/rbac';

const Tags: CollectionConfig = {
  slug: 'tags',
  admin: {
    useAsTitle: 'name',
    defaultColumns: ['name', 'slug', 'usageCount', 'updatedAt'],
    group: 'Content',
  },
  access: {
    // Admin-only write access, public read access
    create: isAdmin,
    read: () => true, // Public can read all tags
    update: isAdmin,
    delete: isAdmin,
  },
  fields: [
    {
      name: 'name',
      type: 'text',
      required: true,
      unique: true,
      maxLength: 255,
      admin: {
        description: 'Tag name (must be unique)',
      },
    },
    {
      name: 'slug',
      type: 'text',
      required: true,
      unique: true,
      index: true,
      maxLength: 255,
      admin: {
        description: 'URL-friendly slug (auto-generated from name)',
        readOnly: true,
      },
      hooks: {
        beforeValidate: [
          ({ value, data, operation }) => {
            // Auto-generate slug from name on create or if slug is missing
            if (operation === 'create' || !value) {
              if (data?.name) {
                // Use slugify pattern: lowercase, strict mode (remove special chars)
                return data.name
                  .toLowerCase()
                  .replace(/[^a-z0-9]+/g, '-')
                  .replace(/^-+|-+$/g, '');
              }
            }
            return value;
          },
        ],
      },
      validate: (value: unknown) => {
        // Validate slug format (lowercase, hyphenated)
        if (value && typeof value === 'string' && !/^[a-z0-9-]+$/.test(value)) {
          return 'Invalid slug format. Must be lowercase alphanumeric with hyphens only.';
        }
        return true;
      },
    },
    {
      name: 'description',
      type: 'textarea',
      maxLength: 1000,
      admin: {
        description: 'Optional tag description',
      },
    },
    {
      name: 'color',
      type: 'text',
      maxLength: 7,
      defaultValue: '#0066cc',
      admin: {
        description: 'Display color (hex format: #RRGGBB)',
      },
      validate: (value: unknown) => {
        // Validate hex color format
        if (value && typeof value === 'string' && !/^#[0-9A-Fa-f]{6}$/.test(value)) {
          return 'Invalid color format. Must be a 6-digit hex code (e.g., #FF5733).';
        }
        return true;
      },
    },
    {
      name: 'usageCount',
      type: 'number',
      required: true,
      defaultValue: 0,
      admin: {
        description: 'Number of times this tag is referenced (computed automatically)',
        readOnly: true,
        position: 'sidebar',
      },
      access: {
        // Block manual updates to usageCount
        update: () => false,
      },
    },
  ],
  timestamps: true,
  hooks: {
    beforeChange: [
      // Compute usageCount based on references
      async ({ req, data, operation }) => {
        // Only compute usageCount on updates (create starts at 0)
        if (operation === 'update' && req.payload) {
          const tagId = data.id;
          let totalUsage = 0;

          try {
            // Count references in vendors
            const vendorCount = await req.payload.count({
              collection: 'vendors',
              where: {
                tags: {
                  contains: tagId,
                },
              },
            });
            totalUsage += vendorCount.totalDocs;

            // Count references in products (if collection exists)
            try {
              const productCount = await req.payload.count({
                collection: 'products',
                where: {
                  tags: {
                    contains: tagId,
                  },
                },
              });
              totalUsage += productCount.totalDocs;
            } catch (e) {
              // Products collection might not exist yet
            }

            // Count references in blog posts (if collection exists)
            try {
              const blogCount = await req.payload.count({
                collection: 'blog-posts',
                where: {
                  tags: {
                    contains: tagId,
                  },
                },
              });
              totalUsage += blogCount.totalDocs;
            } catch (e) {
              // Blog posts collection might not exist yet
            }

            // Count references in yachts (if collection exists)
            try {
              const yachtCount = await req.payload.count({
                collection: 'yachts',
                where: {
                  tags: {
                    contains: tagId,
                  },
                },
              });
              totalUsage += yachtCount.totalDocs;
            } catch (e) {
              // Yachts collection might not exist yet
            }

            data.usageCount = totalUsage;
          } catch (error) {
            // If counting fails, keep existing usageCount
            console.error('Error computing usageCount:', error);
          }
        }

        return data;
      },
    ],
  },
};

export default Tags;
