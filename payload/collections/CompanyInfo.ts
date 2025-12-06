import type { CollectionConfig } from 'payload';

import { lexicalEditor } from '@payloadcms/richtext-lexical';

import { isAdmin } from '../access/rbac';

const CompanyInfo: CollectionConfig = {
  slug: 'company-info',
  admin: {
    useAsTitle: 'name',
    group: 'Settings',
    description: 'Global company information and settings',
  },
  access: {
    // Only admins can CRUD company info
    create: isAdmin,
    read: () => true, // Public can read company info
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
        description: 'Company name',
      },
    },
    {
      name: 'tagline',
      type: 'text',
      maxLength: 500,
      admin: {
        description: 'Company tagline or slogan',
      },
    },
    {
      name: 'description',
      type: 'textarea',
      maxLength: 5000,
      admin: {
        description: 'Company description',
      },
    },
    {
      name: 'story',
      type: 'richText',
      editor: lexicalEditor({}),
      admin: {
        description: 'Company story (full history)',
      },
    },
    {
      name: 'mission',
      type: 'textarea',
      maxLength: 2000,
      admin: {
        description: 'Company mission statement',
      },
    },

    // Company Details
    {
      name: 'founded',
      type: 'number',
      admin: {
        description: 'Year founded',
      },
    },
    {
      name: 'location',
      type: 'text',
      maxLength: 255,
      admin: {
        description: 'Company location',
      },
    },
    {
      name: 'address',
      type: 'textarea',
      maxLength: 500,
      admin: {
        description: 'Physical address',
      },
    },

    // Contact Information
    {
      name: 'phone',
      type: 'text',
      maxLength: 50,
      admin: {
        description: 'Main phone number',
      },
    },
    {
      name: 'email',
      type: 'email',
      required: true,
      admin: {
        description: 'Main contact email',
      },
    },
    {
      name: 'businessHours',
      type: 'text',
      maxLength: 255,
      admin: {
        description: 'Business hours (e.g., "Monday - Friday: 9:00 AM - 5:00 PM CET")',
      },
    },

    // Branding
    {
      name: 'logo',
      type: 'upload',
      relationTo: 'media',
      required: false,
      admin: {
        description: 'Company logo',
      },
    },

    // Social Media
    {
      name: 'socialMedia',
      type: 'group',
      admin: {
        description: 'Social media links',
      },
      fields: [
        {
          name: 'facebook',
          type: 'text',
          maxLength: 500,
        },
        {
          name: 'twitter',
          type: 'text',
          maxLength: 500,
        },
        {
          name: 'linkedin',
          type: 'text',
          maxLength: 500,
        },
        {
          name: 'instagram',
          type: 'text',
          maxLength: 500,
        },
        {
          name: 'youtube',
          type: 'text',
          maxLength: 500,
        },
      ],
    },

    // SEO
    {
      name: 'seo',
      type: 'group',
      admin: {
        description: 'SEO metadata',
      },
      fields: [
        {
          name: 'metaTitle',
          type: 'text',
          maxLength: 255,
        },
        {
          name: 'metaDescription',
          type: 'textarea',
          maxLength: 500,
        },
        {
          name: 'keywords',
          type: 'text',
          maxLength: 1000,
        },
        {
          name: 'ogImage',
          type: 'upload',
          relationTo: 'media',
          required: false,
          admin: {
            description: 'Open Graph image for social sharing',
          },
        },
      ],
    },
  ],
  timestamps: true,
};

export default CompanyInfo;
