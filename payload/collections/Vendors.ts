import type { CollectionConfig } from 'payload';
import { lexicalEditor } from '@payloadcms/richtext-lexical';
import { isAdmin } from '../access/rbac';
import { sanitizeUrlHook } from '../../lib/utils/url';

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
    update: ({ req: { user } }) => {
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
        { label: 'Tier 3 - Premium Promoted Profile', value: 'tier3' },
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
      type: 'upload',
      relationTo: 'media',
      required: false,
      admin: {
        description: 'Company logo (visible to all tiers)',
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

    // Founded Year (Tier 1+ - for years in business computation)
    {
      name: 'foundedYear',
      type: 'number',
      min: 1800,
      max: new Date().getFullYear(),
      admin: {
        description: 'Year company was founded (used to compute years in business) (Tier 1+ only)',
        condition: (data) => ['tier1', 'tier2', 'tier3'].includes(data.tier) || data.tier === 'tier3',
      },
      access: {
        read: () => true,
        update: ({ req: { user }, data }) => {
          if (!user) return false;
          if (user.role === 'admin') return true;
          return data?.tier === 'tier1' || data?.tier === 'tier2' || data?.tier === 'tier3';
        },
      },
    },

    // Enhanced Profile Fields (Tier 1+)
    {
      name: 'website',
      type: 'text',
      maxLength: 500,
      admin: {
        description: 'Company website (Tier 1+ only)',
        condition: (data) => ['tier1', 'tier2', 'tier3'].includes(data.tier),
      },
      hooks: {
        beforeChange: [sanitizeUrlHook],
      },
      access: {
        read: () => true,
        update: ({ req: { user }, data }) => {
          if (!user) return false;
          if (user.role === 'admin') return true;
          // Vendors can only edit if they have tier1 or tier2
          return ['tier1', 'tier2', 'tier3'].includes(data?.tier);
        },
      },
    },
    {
      name: 'linkedinUrl',
      type: 'text',
      maxLength: 500,
      admin: {
        description: 'LinkedIn profile URL (Tier 1+ only)',
        condition: (data) => ['tier1', 'tier2', 'tier3'].includes(data.tier),
      },
      hooks: {
        beforeChange: [sanitizeUrlHook],
      },
      access: {
        read: () => true,
        update: ({ req: { user }, data }) => {
          if (!user) return false;
          if (user.role === 'admin') return true;
          return ['tier1', 'tier2', 'tier3'].includes(data?.tier);
        },
      },
    },
    {
      name: 'twitterUrl',
      type: 'text',
      maxLength: 500,
      admin: {
        description: 'Twitter/X profile URL (Tier 1+ only)',
        condition: (data) => ['tier1', 'tier2', 'tier3'].includes(data.tier),
      },
      hooks: {
        beforeChange: [sanitizeUrlHook],
      },
      access: {
        read: () => true,
        update: ({ req: { user }, data }) => {
          if (!user) return false;
          if (user.role === 'admin') return true;
          return ['tier1', 'tier2', 'tier3'].includes(data?.tier);
        },
      },
    },
    {
      name: 'certifications',
      type: 'array',
      admin: {
        description: 'Company certifications (Tier 1+ only)',
        condition: (data) => ['tier1', 'tier2', 'tier3'].includes(data.tier),
      },
      access: {
        read: () => true,
        update: ({ req: { user }, data }) => {
          if (!user) return false;
          if (user.role === 'admin') return true;
          return ['tier1', 'tier2', 'tier3'].includes(data?.tier);
        },
      },
      fields: [
        {
          name: 'name',
          type: 'text',
          required: true,
          maxLength: 255,
          admin: {
            description: 'Certification name',
          },
        },
        {
          name: 'issuer',
          type: 'text',
          required: true,
          maxLength: 255,
          admin: {
            description: 'Issuing organization',
          },
        },
        {
          name: 'year',
          type: 'number',
          required: true,
          admin: {
            description: 'Year certification was obtained',
          },
        },
        {
          name: 'expiryDate',
          type: 'date',
          admin: {
            description: 'Certification expiry date',
          },
        },
        {
          name: 'certificateNumber',
          type: 'text',
          maxLength: 255,
          admin: {
            description: 'Certificate number or ID',
          },
        },
        {
          name: 'logo',
          type: 'upload',
          relationTo: 'media',
          admin: {
            description: 'Certification logo',
          },
        },
        {
          name: 'verificationUrl',
          type: 'text',
          maxLength: 500,
          admin: {
            description: 'URL to verify certification',
          },
          hooks: {
            beforeChange: [sanitizeUrlHook],
          },
        },
      ],
    },

    // Awards Array (Tier 1+)
    {
      name: 'awards',
      type: 'array',
      admin: {
        description: 'Company awards and recognitions (Tier 1+ only)',
        condition: (data) => ['tier1', 'tier2', 'tier3'].includes(data.tier),
      },
      access: {
        read: () => true,
        update: ({ req: { user }, data }) => {
          if (!user) return false;
          if (user.role === 'admin') return true;
          return ['tier1', 'tier2', 'tier3'].includes(data?.tier);
        },
      },
      fields: [
        {
          name: 'title',
          type: 'text',
          required: true,
          maxLength: 255,
          admin: {
            description: 'Award title',
          },
        },
        {
          name: 'organization',
          type: 'text',
          required: true,
          maxLength: 255,
          admin: {
            description: 'Awarding organization',
          },
        },
        {
          name: 'year',
          type: 'number',
          required: true,
          admin: {
            description: 'Year award was received',
          },
        },
        {
          name: 'category',
          type: 'text',
          maxLength: 255,
          admin: {
            description: 'Award category',
          },
        },
        {
          name: 'description',
          type: 'textarea',
          maxLength: 1000,
          admin: {
            description: 'Award description',
          },
        },
        {
          name: 'image',
          type: 'upload',
          relationTo: 'media',
          admin: {
            description: 'Award image or certificate',
          },
        },
      ],
    },

    // Social Proof Group (Tier 1+)
    {
      name: 'totalProjects',
      type: 'number',
      admin: {
        description: 'Total number of completed projects (Tier 1+ only)',
        condition: (data) => ['tier1', 'tier2', 'tier3'].includes(data.tier),
      },
      access: {
        read: () => true,
        update: ({ req: { user }, data }) => {
          if (!user) return false;
          if (user.role === 'admin') return true;
          return ['tier1', 'tier2', 'tier3'].includes(data?.tier);
        },
      },
    },
    {
      name: 'yearsInBusiness',
      type: 'number',
      admin: {
        description: 'Years in business (Tier 1+ only)',
        condition: (data) => ['tier1', 'tier2', 'tier3'].includes(data.tier),
      },
      access: {
        read: () => true,
        update: ({ req: { user }, data }) => {
          if (!user) return false;
          if (user.role === 'admin') return true;
          return ['tier1', 'tier2', 'tier3'].includes(data?.tier);
        },
      },
    },
    {
      name: 'employeeCount',
      type: 'number',
      admin: {
        description: 'Number of employees (Tier 1+ only)',
        condition: (data) => ['tier1', 'tier2', 'tier3'].includes(data.tier),
      },
      access: {
        read: () => true,
        update: ({ req: { user }, data }) => {
          if (!user) return false;
          if (user.role === 'admin') return true;
          return ['tier1', 'tier2', 'tier3'].includes(data?.tier);
        },
      },
    },
    {
      name: 'linkedinFollowers',
      type: 'number',
      admin: {
        description: 'LinkedIn follower count (Tier 1+ only)',
        condition: (data) => ['tier1', 'tier2', 'tier3'].includes(data.tier),
      },
      access: {
        read: () => true,
        update: ({ req: { user }, data }) => {
          if (!user) return false;
          if (user.role === 'admin') return true;
          return ['tier1', 'tier2', 'tier3'].includes(data?.tier);
        },
      },
    },
    {
      name: 'instagramFollowers',
      type: 'number',
      admin: {
        description: 'Instagram follower count (Tier 1+ only)',
        condition: (data) => ['tier1', 'tier2', 'tier3'].includes(data.tier),
      },
      access: {
        read: () => true,
        update: ({ req: { user }, data }) => {
          if (!user) return false;
          if (user.role === 'admin') return true;
          return ['tier1', 'tier2', 'tier3'].includes(data?.tier);
        },
      },
    },
    {
      name: 'clientSatisfactionScore',
      type: 'number',
      min: 0,
      max: 10,
      admin: {
        description: 'Client satisfaction score (0-10) (Tier 1+ only)',
        condition: (data) => ['tier1', 'tier2', 'tier3'].includes(data.tier),
      },
      access: {
        read: () => true,
        update: ({ req: { user }, data }) => {
          if (!user) return false;
          if (user.role === 'admin') return true;
          return ['tier1', 'tier2', 'tier3'].includes(data?.tier);
        },
      },
    },
    {
      name: 'repeatClientPercentage',
      type: 'number',
      min: 0,
      max: 100,
      admin: {
        description: 'Repeat client percentage (0-100) (Tier 1+ only)',
        condition: (data) => ['tier1', 'tier2', 'tier3'].includes(data.tier),
      },
      access: {
        read: () => true,
        update: ({ req: { user }, data }) => {
          if (!user) return false;
          if (user.role === 'admin') return true;
          return ['tier1', 'tier2', 'tier3'].includes(data?.tier);
        },
      },
    },

    // Video Introduction Group (Tier 1+)
    {
      name: 'videoUrl',
      type: 'text',
      maxLength: 500,
      admin: {
        description: 'Video introduction URL (Tier 1+ only)',
        condition: (data) => ['tier1', 'tier2', 'tier3'].includes(data.tier),
      },
      hooks: {
        beforeChange: [sanitizeUrlHook],
      },
      access: {
        read: () => true,
        update: ({ req: { user }, data }) => {
          if (!user) return false;
          if (user.role === 'admin') return true;
          return ['tier1', 'tier2', 'tier3'].includes(data?.tier);
        },
      },
    },
    {
      name: 'videoThumbnail',
      type: 'upload',
      relationTo: 'media',
      admin: {
        description: 'Video thumbnail image (Tier 1+ only)',
        condition: (data) => ['tier1', 'tier2', 'tier3'].includes(data.tier),
      },
      access: {
        read: () => true,
        update: ({ req: { user }, data }) => {
          if (!user) return false;
          if (user.role === 'admin') return true;
          return ['tier1', 'tier2', 'tier3'].includes(data?.tier);
        },
      },
    },
    {
      name: 'videoDuration',
      type: 'number',
      admin: {
        description: 'Video duration in seconds (Tier 1+ only)',
        condition: (data) => ['tier1', 'tier2', 'tier3'].includes(data.tier),
      },
      access: {
        read: () => true,
        update: ({ req: { user }, data }) => {
          if (!user) return false;
          if (user.role === 'admin') return true;
          return ['tier1', 'tier2', 'tier3'].includes(data?.tier);
        },
      },
    },
    {
      name: 'videoTitle',
      type: 'text',
      maxLength: 255,
      admin: {
        description: 'Video title (Tier 1+ only)',
        condition: (data) => ['tier1', 'tier2', 'tier3'].includes(data.tier),
      },
      access: {
        read: () => true,
        update: ({ req: { user }, data }) => {
          if (!user) return false;
          if (user.role === 'admin') return true;
          return ['tier1', 'tier2', 'tier3'].includes(data?.tier);
        },
      },
    },
    {
      name: 'videoDescription',
      type: 'textarea',
      maxLength: 1000,
      admin: {
        description: 'Video description (Tier 1+ only)',
        condition: (data) => ['tier1', 'tier2', 'tier3'].includes(data.tier),
      },
      access: {
        read: () => true,
        update: ({ req: { user }, data }) => {
          if (!user) return false;
          if (user.role === 'admin') return true;
          return ['tier1', 'tier2', 'tier3'].includes(data?.tier);
        },
      },
    },

    // Case Studies Array (Tier 1+)
    {
      name: 'caseStudies',
      type: 'array',
      admin: {
        description: 'Project case studies (Tier 1+ only)',
        condition: (data) => ['tier1', 'tier2', 'tier3'].includes(data.tier),
      },
      access: {
        read: () => true,
        update: ({ req: { user }, data }) => {
          if (!user) return false;
          if (user.role === 'admin') return true;
          return ['tier1', 'tier2', 'tier3'].includes(data?.tier);
        },
      },
      fields: [
        {
          name: 'title',
          type: 'text',
          required: true,
          maxLength: 255,
          admin: {
            description: 'Case study title',
          },
        },
        {
          name: 'yachtName',
          type: 'text',
          maxLength: 255,
          admin: {
            description: 'Name of yacht involved',
          },
        },
        {
          name: 'yacht',
          type: 'relationship',
          relationTo: 'yachts',
          hasMany: false,
          admin: {
            description: 'Related yacht',
          },
        },
        {
          name: 'projectDate',
          type: 'date',
          required: true,
          admin: {
            description: 'Project completion date',
          },
        },
        {
          name: 'challenge',
          type: 'richText',
          editor: lexicalEditor({}),
          required: true,
          admin: {
            description: 'Project challenge description',
          },
        },
        {
          name: 'solution',
          type: 'richText',
          editor: lexicalEditor({}),
          required: true,
          admin: {
            description: 'Solution provided',
          },
        },
        {
          name: 'results',
          type: 'richText',
          editor: lexicalEditor({}),
          required: true,
          admin: {
            description: 'Project results and outcomes',
          },
        },
        {
          name: 'testimonyQuote',
          type: 'textarea',
          maxLength: 1000,
          admin: {
            description: 'Client testimony quote',
          },
        },
        {
          name: 'testimonyAuthor',
          type: 'text',
          maxLength: 255,
          admin: {
            description: 'Testimony author name',
          },
        },
        {
          name: 'testimonyRole',
          type: 'text',
          maxLength: 255,
          admin: {
            description: 'Testimony author role',
          },
        },
        {
          name: 'images',
          type: 'array',
          admin: {
            description: 'Case study images',
          },
          fields: [
            {
              name: 'image',
              type: 'upload',
              relationTo: 'media',
              required: true,
              admin: {
                description: 'Case study image',
              },
            },
          ],
        },
        {
          name: 'featured',
          type: 'checkbox',
          defaultValue: false,
          admin: {
            description: 'Feature this case study',
          },
        },
      ],
    },

    // Innovation Highlights Array (Tier 1+)
    {
      name: 'innovationHighlights',
      type: 'array',
      admin: {
        description: 'Innovation and technology highlights (Tier 1+ only)',
        condition: (data) => ['tier1', 'tier2', 'tier3'].includes(data.tier),
      },
      access: {
        read: () => true,
        update: ({ req: { user }, data }) => {
          if (!user) return false;
          if (user.role === 'admin') return true;
          return ['tier1', 'tier2', 'tier3'].includes(data?.tier);
        },
      },
      fields: [
        {
          name: 'title',
          type: 'text',
          required: true,
          maxLength: 255,
          admin: {
            description: 'Innovation title',
          },
        },
        {
          name: 'description',
          type: 'richText',
          editor: lexicalEditor({}),
          required: true,
          admin: {
            description: 'Innovation description',
          },
        },
        {
          name: 'year',
          type: 'number',
          admin: {
            description: 'Year innovation was introduced',
          },
        },
        {
          name: 'patentNumber',
          type: 'text',
          maxLength: 255,
          admin: {
            description: 'Patent number (if applicable)',
          },
        },
        {
          name: 'benefits',
          type: 'array',
          admin: {
            description: 'Key benefits',
          },
          fields: [
            {
              name: 'benefit',
              type: 'text',
              required: true,
              maxLength: 500,
              admin: {
                description: 'Benefit description',
              },
            },
          ],
        },
        {
          name: 'image',
          type: 'upload',
          relationTo: 'media',
          admin: {
            description: 'Innovation image',
          },
        },
      ],
    },

    // Team Members Array (Tier 1+)
    {
      name: 'teamMembers',
      type: 'array',
      admin: {
        description: 'Team members (Tier 1+ only)',
        condition: (data) => ['tier1', 'tier2', 'tier3'].includes(data.tier),
      },
      access: {
        read: () => true,
        update: ({ req: { user }, data }) => {
          if (!user) return false;
          if (user.role === 'admin') return true;
          return ['tier1', 'tier2', 'tier3'].includes(data?.tier);
        },
      },
      fields: [
        {
          name: 'name',
          type: 'text',
          required: true,
          maxLength: 255,
          admin: {
            description: 'Team member name',
          },
        },
        {
          name: 'role',
          type: 'text',
          required: true,
          maxLength: 255,
          admin: {
            description: 'Role or position',
          },
        },
        {
          name: 'bio',
          type: 'textarea',
          maxLength: 2000,
          admin: {
            description: 'Biography',
          },
        },
        {
          name: 'photo',
          type: 'upload',
          relationTo: 'media',
          admin: {
            description: 'Team member photo',
          },
        },
        {
          name: 'linkedinUrl',
          type: 'text',
          maxLength: 500,
          admin: {
            description: 'LinkedIn profile URL',
          },
          hooks: {
            beforeChange: [sanitizeUrlHook],
          },
        },
        {
          name: 'email',
          type: 'email',
          admin: {
            description: 'Contact email',
          },
        },
        {
          name: 'displayOrder',
          type: 'number',
          defaultValue: 0,
          admin: {
            description: 'Display order (0 = first)',
          },
        },
      ],
    },

    // Yacht Projects Portfolio Array (Tier 1+)
    {
      name: 'yachtProjects',
      type: 'array',
      admin: {
        description: 'Yacht project portfolio (Tier 1+ only)',
        condition: (data) => ['tier1', 'tier2', 'tier3'].includes(data.tier),
      },
      access: {
        read: () => true,
        update: ({ req: { user }, data }) => {
          if (!user) return false;
          if (user.role === 'admin') return true;
          return ['tier1', 'tier2', 'tier3'].includes(data?.tier);
        },
      },
      fields: [
        {
          name: 'yacht',
          type: 'relationship',
          relationTo: 'yachts',
          hasMany: false,
          admin: {
            description: 'Related yacht',
          },
        },
        {
          name: 'yachtName',
          type: 'text',
          maxLength: 255,
          admin: {
            description: 'Yacht name (if not in database)',
          },
        },
        {
          name: 'role',
          type: 'text',
          required: true,
          maxLength: 255,
          admin: {
            description: 'Vendor role in project',
          },
        },
        {
          name: 'completionDate',
          type: 'date',
          admin: {
            description: 'Project completion date',
          },
        },
        {
          name: 'systemsInstalled',
          type: 'array',
          admin: {
            description: 'Systems installed',
          },
          fields: [
            {
              name: 'system',
              type: 'text',
              required: true,
              maxLength: 255,
              admin: {
                description: 'System name',
              },
            },
          ],
        },
        {
          name: 'image',
          type: 'upload',
          relationTo: 'media',
          admin: {
            description: 'Project image',
          },
        },
        {
          name: 'featured',
          type: 'checkbox',
          defaultValue: false,
          admin: {
            description: 'Feature this project',
          },
        },
      ],
    },

    // Long Description (Tier 1+)
    {
      name: 'longDescription',
      type: 'richText',
      editor: lexicalEditor({}),
      admin: {
        description: 'Extended company description with rich formatting (Tier 1+ only)',
        condition: (data) => ['tier1', 'tier2', 'tier3'].includes(data.tier),
      },
      access: {
        read: () => true,
        update: ({ req: { user }, data }) => {
          if (!user) return false;
          if (user.role === 'admin') return true;
          return ['tier1', 'tier2', 'tier3'].includes(data?.tier);
        },
      },
    },

    // Service Areas Array (Tier 1+)
    {
      name: 'serviceAreas',
      type: 'array',
      admin: {
        description: 'Service areas (Tier 1+ only)',
        condition: (data) => ['tier1', 'tier2', 'tier3'].includes(data.tier),
      },
      access: {
        read: () => true,
        update: ({ req: { user }, data }) => {
          if (!user) return false;
          if (user.role === 'admin') return true;
          return ['tier1', 'tier2', 'tier3'].includes(data?.tier);
        },
      },
      fields: [
        {
          name: 'area',
          type: 'text',
          required: true,
          maxLength: 255,
          admin: {
            description: 'Service area name',
          },
        },
        {
          name: 'description',
          type: 'textarea',
          maxLength: 1000,
          admin: {
            description: 'Area description',
          },
        },
        {
          name: 'icon',
          type: 'text',
          maxLength: 100,
          admin: {
            description: 'Icon name or identifier',
          },
        },
      ],
    },

    // Company Values Array (Tier 1+)
    {
      name: 'companyValues',
      type: 'array',
      admin: {
        description: 'Company values and principles (Tier 1+ only)',
        condition: (data) => ['tier1', 'tier2', 'tier3'].includes(data.tier),
      },
      access: {
        read: () => true,
        update: ({ req: { user }, data }) => {
          if (!user) return false;
          if (user.role === 'admin') return true;
          return ['tier1', 'tier2', 'tier3'].includes(data?.tier);
        },
      },
      fields: [
        {
          name: 'value',
          type: 'text',
          required: true,
          maxLength: 255,
          admin: {
            description: 'Value name',
          },
        },
        {
          name: 'description',
          type: 'textarea',
          maxLength: 1000,
          admin: {
            description: 'Value description',
          },
        },
      ],
    },

    // Locations Array (Multi-Location Support - Tier 2+)
    {
      name: 'locations',
      type: 'array',
      label: 'Locations',
      admin: {
        description: 'Company locations (Tier 2 vendors can have multiple locations). One location must be designated as Headquarters.',
        condition: (data) => data.tier === 'tier2' || (data.locations && data.locations.length > 0),
      },
      access: {
        read: () => true,
        update: ({ req: { user }, data }) => {
          if (!user) return false;
          if (user.role === 'admin') return true;
          // Vendors can update locations if they have tier2
          return data?.tier === 'tier2';
        },
      },
      fields: [
        {
          name: 'address',
          type: 'text',
          label: 'Full Address',
          maxLength: 500,
          admin: {
            placeholder: 'e.g., 123 Harbor View Drive, Fort Lauderdale, FL 33316',
            description: 'Complete mailing address (displayed publicly)',
          },
        },
        {
          name: 'geocodingButton',
          type: 'ui',
          admin: {
            components: {
              Field: '@/payload/fields/GeocodingButton#GeocodingButton',
            },
          },
        },
        {
          name: 'latitude',
          type: 'number',
          label: 'Latitude',
          min: -90,
          max: 90,
          admin: {
            step: 0.000001,
            placeholder: 'e.g., 26.122439',
            description: 'Latitude coordinate (-90 to 90). Visit https://geocode.maps.co to convert addresses to coordinates.',
          },
        },
        {
          name: 'longitude',
          type: 'number',
          label: 'Longitude',
          min: -180,
          max: 180,
          admin: {
            step: 0.000001,
            placeholder: 'e.g., -80.137314',
            description: 'Longitude coordinate (-180 to 180). Visit https://geocode.maps.co to convert addresses to coordinates.',
          },
        },
        {
          name: 'city',
          type: 'text',
          label: 'City',
          maxLength: 255,
          admin: {
            placeholder: 'e.g., Fort Lauderdale',
          },
        },
        {
          name: 'country',
          type: 'text',
          label: 'Country',
          maxLength: 255,
          admin: {
            placeholder: 'e.g., United States',
          },
        },
        {
          name: 'isHQ',
          type: 'checkbox',
          label: 'Is Headquarters',
          defaultValue: false,
          admin: {
            description: 'Designate this location as the company headquarters (exactly one location must be HQ)',
          },
        },
      ],
      validate: (value) => {
        if (!value || value.length === 0) {
          return true; // Empty array is valid
        }

        // Validate HQ uniqueness
        const hqLocations = value.filter((loc: any) => loc.isHQ === true);

        if (hqLocations.length === 0) {
          const allExplicitlyFalse = value.every((loc: any) => loc.isHQ === false);
          if (allExplicitlyFalse) {
            return 'Exactly one location must be designated as Headquarters';
          }
        }

        if (hqLocations.length > 1) {
          return 'Only one location can be designated as Headquarters';
        }

        return true;
      },
      hooks: {
        beforeChange: [
          ({ value }) => {
            if (!value || value.length === 0) {
              return value;
            }

            // Auto-designate first location as HQ if no HQ exists
            const hasHQ = value.some((loc: any) => loc.isHQ === true);

            if (!hasHQ) {
              const updated = [...value];
              updated[0] = { ...updated[0], isHQ: true };

              // Ensure all others are explicitly false
              for (let i = 1; i < updated.length; i++) {
                updated[i] = { ...updated[i], isHQ: false };
              }

              return updated;
            }

            return value;
          },
        ],
      },
    },

    // Legacy Location Information (Kept for backward compatibility during migration)
    {
      name: 'location',
      type: 'group',
      label: 'Location Information (Legacy - Use Locations Array Above)',
      admin: {
        description: 'DEPRECATED: This field will be migrated to locations array. Use the Locations array above for new data.',
        condition: (data) => data.location && Object.keys(data.location).length > 0,
      },
      fields: [
        {
          name: 'address',
          type: 'text',
          label: 'Full Address',
          admin: {
            placeholder: 'e.g., 123 Harbor View Drive, Fort Lauderdale, FL 33316',
            description: 'Complete mailing address (displayed publicly)',
          },
        },
        {
          name: 'geocodingButton',
          type: 'ui',
          admin: {
            components: {
              Field: '@/payload/fields/GeocodingButton#GeocodingButton',
            },
          },
        },
        {
          name: 'latitude',
          type: 'number',
          label: 'Latitude',
          min: -90,
          max: 90,
          admin: {
            step: 0.000001,
            placeholder: 'e.g., 26.122439',
            description: 'Latitude coordinate (-90 to 90). Visit https://geocode.maps.co to convert addresses to coordinates.',
          },
        },
        {
          name: 'longitude',
          type: 'number',
          label: 'Longitude',
          min: -180,
          max: 180,
          admin: {
            step: 0.000001,
            placeholder: 'e.g., -80.137314',
            description: 'Longitude coordinate (-180 to 180). Visit https://geocode.maps.co to convert addresses to coordinates.',
          },
        },
        {
          name: 'city',
          type: 'text',
          label: 'City',
          admin: {
            placeholder: 'e.g., Fort Lauderdale',
          },
        },
        {
          name: 'country',
          type: 'text',
          label: 'Country',
          admin: {
            placeholder: 'e.g., United States',
          },
        },
      ],
    },

    // Tier 2+ Feature Flags
    {
      name: 'featuredInCategory',
      type: 'checkbox',
      defaultValue: false,
      admin: {
        position: 'sidebar',
        description: 'Feature this vendor in category listings (Tier 2+)',
        condition: (data) => ['tier2', 'tier3'].includes(data.tier),
      },
      access: {
        // @ts-expect-error - Payload CMS 3.x field-level access type compatibility
        update: isAdmin, // Only admins can set featured status
      },
    },
    {
      name: 'advancedAnalytics',
      type: 'checkbox',
      defaultValue: false,
      admin: {
        position: 'sidebar',
        description: 'Enable advanced analytics dashboard (Tier 2+)',
        condition: (data) => ['tier2', 'tier3'].includes(data.tier),
      },
      access: {
        // @ts-expect-error - Payload CMS 3.x field-level access type compatibility
        update: isAdmin,
      },
    },
    {
      name: 'apiAccess',
      type: 'checkbox',
      defaultValue: false,
      admin: {
        position: 'sidebar',
        description: 'Enable API integration access (Tier 2+)',
        condition: (data) => ['tier2', 'tier3'].includes(data.tier),
      },
      access: {
        // @ts-expect-error - Payload CMS 3.x field-level access type compatibility
        update: isAdmin,
      },
    },
    {
      name: 'customDomain',
      type: 'text',
      maxLength: 255,
      admin: {
        position: 'sidebar',
        description: 'Custom domain for vendor profile (Tier 2+)',
        condition: (data) => ['tier2', 'tier3'].includes(data.tier),
      },
      access: {
        // @ts-expect-error - Payload CMS 3.x field-level access type compatibility
        update: isAdmin,
      },
    },

    // Tier 3 Promotion Pack
    {
      name: 'promotionPack',
      type: 'group',
      admin: {
        description: 'Premium promotion features (Tier 3 only)',
        condition: (data) => data.tier === 'tier3',
      },
      fields: [
        {
          name: 'homepageBanner',
          type: 'checkbox',
          defaultValue: false,
          admin: {
            description: 'Display banner on homepage',
          },
          access: {
            // @ts-expect-error - Payload CMS 3.x field-level access type compatibility
            update: isAdmin,
          },
        },
        {
          name: 'searchResultsPriority',
          type: 'number',
          min: 0,
          max: 100,
          defaultValue: 0,
          admin: {
            description: 'Search results priority (0-100, higher = more prominent)',
          },
          access: {
            // @ts-expect-error - Payload CMS 3.x field-level access type compatibility
            update: isAdmin,
          },
        },
        {
          name: 'categoryTopPlacement',
          type: 'checkbox',
          defaultValue: false,
          admin: {
            description: 'Pin to top of category listings',
          },
          access: {
            // @ts-expect-error - Payload CMS 3.x field-level access type compatibility
            update: isAdmin,
          },
        },
        {
          name: 'sponsoredContent',
          type: 'checkbox',
          defaultValue: false,
          admin: {
            description: 'Mark as sponsored content',
          },
          access: {
            // @ts-expect-error - Payload CMS 3.x field-level access type compatibility
            update: isAdmin,
          },
        },
        {
          name: 'monthlyFeaturedArticle',
          type: 'checkbox',
          defaultValue: false,
          admin: {
            description: 'Include in monthly featured articles',
          },
          access: {
            // @ts-expect-error - Payload CMS 3.x field-level access type compatibility
            update: isAdmin,
          },
        },
        {
          name: 'socialMediaShoutouts',
          type: 'number',
          min: 0,
          defaultValue: 0,
          admin: {
            description: 'Number of monthly social media shoutouts',
          },
          access: {
            // @ts-expect-error - Payload CMS 3.x field-level access type compatibility
            update: isAdmin,
          },
        },
        {
          name: 'emailNewsletterFeature',
          type: 'checkbox',
          defaultValue: false,
          admin: {
            description: 'Feature in email newsletters',
          },
          access: {
            // @ts-expect-error - Payload CMS 3.x field-level access type compatibility
            update: isAdmin,
          },
        },
      ],
    },

    // Tier 3 Editorial Content (Admin-Only)
    {
      name: 'editorialContent',
      type: 'array',
      admin: {
        description: 'Platform-curated editorial content and feature articles (Tier 3, Admin-Only)',
        condition: (data) => data.tier === 'tier3',
      },
      access: {
        create: isAdmin,
        read: () => true,
        update: isAdmin,
        delete: isAdmin,
      },
      fields: [
        {
          name: 'title',
          type: 'text',
          required: true,
          maxLength: 255,
          admin: {
            description: 'Article title',
          },
        },
        {
          name: 'content',
          type: 'richText',
          editor: lexicalEditor({}),
          required: true,
          admin: {
            description: 'Editorial content',
          },
        },
        {
          name: 'publishDate',
          type: 'date',
          required: true,
          admin: {
            description: 'Publication date',
          },
        },
        {
          name: 'author',
          type: 'text',
          required: true,
          maxLength: 255,
          admin: {
            description: 'Author name',
          },
        },
        {
          name: 'featured',
          type: 'checkbox',
          defaultValue: false,
          admin: {
            description: 'Feature this article',
          },
        },
        {
          name: 'category',
          type: 'text',
          maxLength: 100,
          admin: {
            description: 'Article category',
          },
        },
        {
          name: 'image',
          type: 'upload',
          relationTo: 'media',
          admin: {
            description: 'Article hero image',
          },
        },
      ],
    },

    // Metadata
    {
      name: 'partner',
      type: 'checkbox',
      defaultValue: false,
      admin: {
        position: 'sidebar',
        description: 'Mark as featured partner (distinct from regular vendor)',
      },
      access: {
        // @ts-expect-error - Payload CMS 3.x field-level access type compatibility
        update: isAdmin, // Only admins can mark as partner
      },
    },
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
        // Allow updates from scripts (no user context) or from admin users
        if (operation === 'update' && req.user && req.user.role !== 'admin') {
          const tier = data.tier || 'free';

          // Check if vendor is trying to update tier1+ fields without permission
          const tier1Fields = [
            'website', 'linkedinUrl', 'twitterUrl', 'certifications', 'awards',
            'totalProjects', 'foundedYear', 'yearsInBusiness', 'employeeCount', 'linkedinFollowers',
            'instagramFollowers', 'clientSatisfactionScore', 'repeatClientPercentage',
            'videoUrl', 'videoThumbnail', 'videoDuration', 'videoTitle', 'videoDescription',
            'caseStudies', 'innovationHighlights', 'teamMembers', 'yachtProjects',
            'longDescription', 'serviceAreas', 'companyValues'
          ];
          const restrictedFields = tier1Fields.filter((field) => {
            return data[field] !== undefined && !['tier1', 'tier2', 'tier3'].includes(tier);
          });

          if (restrictedFields.length > 0) {
            throw new Error(
              `Tier restricted: Fields ${restrictedFields.join(', ')} require Tier 1 or higher`
            );
          }

          // Validate tier2+ fields
          const tier2Fields = ['featuredInCategory', 'advancedAnalytics', 'apiAccess', 'customDomain'];
          const restrictedTier2Fields = tier2Fields.filter((field) => {
            return data[field] !== undefined && !['tier2', 'tier3'].includes(tier);
          });

          if (restrictedTier2Fields.length > 0) {
            throw new Error(
              `Tier restricted: Fields ${restrictedTier2Fields.join(', ')} require Tier 2 or higher`
            );
          }

          // Validate tier3 fields
          const tier3Fields = ['promotionPack', 'editorialContent'];
          const restrictedTier3Fields = tier3Fields.filter((field) => {
            return data[field] !== undefined && tier !== 'tier3';
          });

          if (restrictedTier3Fields.length > 0) {
            throw new Error(
              `Tier restricted: Fields ${restrictedTier3Fields.join(', ')} require Tier 3`
            );
          }

          // Validate multiple locations restriction (tier2+ only)
          if (data.locations && data.locations.length > 1 && !['tier2', 'tier3'].includes(tier)) {
            throw new Error(
              'Multiple locations require Tier 2 or higher subscription'
            );
          }
        }

        return data;
      },
    ],
  },
};

export default Vendors;
