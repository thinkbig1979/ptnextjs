import type { CollectionConfig } from 'payload';

import { lexicalEditor } from '@payloadcms/richtext-lexical';
import { revalidatePath } from 'next/cache';

import { payloadCMSDataService } from '../../lib/payload-cms-data-service';

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
      admin: {
        description: 'Featured image for blog post',
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
    afterChange: [
      // Clear caches and trigger ISR revalidation after blog post changes
      async ({ doc, operation, previousDoc }) => {
        console.log(`[BlogPosts] afterChange triggered: operation=${operation}, slug=${doc.slug}`);

        try {
          // Clear in-memory data service cache for blog posts
          // This ensures fresh data is fetched on the next request
          payloadCMSDataService.clearBlogCache(doc.slug);

          // If slug changed, also clear the old slug cache
          if (previousDoc?.slug && previousDoc.slug !== doc.slug) {
            payloadCMSDataService.clearBlogCache(previousDoc.slug);
          }

          console.log('[BlogPosts] In-memory cache cleared');
        } catch (cacheError) {
          console.error('[BlogPosts] Failed to clear cache:', cacheError);
        }

        try {
          // Trigger Next.js ISR revalidation for affected pages
          // This tells Next.js to regenerate the static pages on the next request
          revalidatePath('/blog');
          revalidatePath(`/blog/${doc.slug}`);

          // If slug changed, also revalidate the old path
          if (previousDoc?.slug && previousDoc.slug !== doc.slug) {
            revalidatePath(`/blog/${previousDoc.slug}`);
          }

          console.log(`[BlogPosts] ISR revalidation triggered for /blog and /blog/${doc.slug}`);
        } catch (revalidateError) {
          console.error('[BlogPosts] Failed to trigger ISR revalidation:', revalidateError);
        }

        return doc;
      },
    ],
    afterDelete: [
      // Clear caches and trigger ISR revalidation after blog post deletion
      async ({ doc }) => {
        console.log(`[BlogPosts] afterDelete triggered: slug=${doc.slug}`);

        try {
          // Clear in-memory data service cache
          payloadCMSDataService.clearBlogCache(doc.slug);
          console.log('[BlogPosts] In-memory cache cleared after deletion');
        } catch (cacheError) {
          console.error('[BlogPosts] Failed to clear cache after deletion:', cacheError);
        }

        try {
          // Trigger ISR revalidation
          revalidatePath('/blog');
          revalidatePath(`/blog/${doc.slug}`);
          console.log(`[BlogPosts] ISR revalidation triggered after deletion`);
        } catch (revalidateError) {
          console.error('[BlogPosts] Failed to trigger ISR revalidation after deletion:', revalidateError);
        }

        return doc;
      },
    ],
  },
};

export default BlogPosts;
