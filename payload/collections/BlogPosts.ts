import type { CollectionConfig } from 'payload';
import { lexicalEditor } from '@payloadcms/richtext-lexical';
import { isAdmin } from '../access/rbac';

const BlogPosts: CollectionConfig = {
  slug: 'blog-posts',
  admin: {
    useAsTitle: 'title',
    defaultColumns: ['title', 'author', 'published', 'publishedAt', 'createdAt'],
    group: 'Content',
  },
  access: {
    // Only admins can CRUD blog posts
    create: isAdmin,
    read: () => true, // Public can read published blog posts
    update: isAdmin,
    delete: isAdmin,
  },
  fields: [
    {
      name: 'title',
      type: 'text',
      required: true,
      maxLength: 500,
      admin: {
        description: 'Blog post title',
      },
    },
    {
      name: 'slug',
      type: 'text',
      required: true,
      unique: true,
      maxLength: 500,
      admin: {
        description: 'URL-friendly slug (auto-generated from title)',
      },
      hooks: {
        beforeValidate: [
          ({ value, data }) => {
            if (!value && data?.title) {
              // Auto-generate slug from title
              return data.title
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
      name: 'content',
      type: 'richText',
      editor: lexicalEditor({}),
      required: true,
      admin: {
        description: 'Full blog post content',
      },
    },
    {
      name: 'excerpt',
      type: 'textarea',
      maxLength: 1000,
      admin: {
        description: 'Short summary for blog post listings',
      },
    },

    // Author
    {
      name: 'author',
      type: 'relationship',
      relationTo: 'users',
      hasMany: false,
      admin: {
        description: 'Blog post author',
      },
    },

    // Featured Image
    {
      name: 'featuredImage',
      type: 'upload',
      relationTo: 'media',
      required: false,
      admin: {
        description: 'Featured image for the blog post (displayed at the top of the article)',
      },
    },

    // Categories and Tags
    {
      name: 'categories',
      type: 'relationship',
      relationTo: 'categories',
      hasMany: true,
      admin: {
        description: 'Blog post categories',
      },
    },
    {
      name: 'tags',
      type: 'array',
      admin: {
        description: 'Blog post tags',
      },
      fields: [
        {
          name: 'tag',
          type: 'text',
          required: true,
          maxLength: 100,
        },
      ],
    },

    // Publication
    {
      name: 'published',
      type: 'checkbox',
      defaultValue: false,
      admin: {
        position: 'sidebar',
        description: 'Make blog post visible to public',
      },
    },
    {
      name: 'publishedAt',
      type: 'date',
      admin: {
        position: 'sidebar',
        description: 'Publication date and time',
        date: {
          displayFormat: 'MMM d, yyyy h:mm a',
        },
      },
    },
  ],
  timestamps: true,
  hooks: {
    beforeChange: [
      // Auto-set publishedAt when published
      async ({ data, operation, originalDoc }) => {
        if (operation === 'update' || operation === 'create') {
          // If publishing for first time, set publishedAt
          if (data.published && !originalDoc?.publishedAt) {
            data.publishedAt = new Date().toISOString();
          }
        }

        return data;
      },
    ],
  },
};

export default BlogPosts;
