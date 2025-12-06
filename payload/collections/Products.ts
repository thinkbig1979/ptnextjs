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

    // ============================================================================
    // ENHANCED FIELDS - Product Showcase Features
    // ============================================================================

    // Tags Relationship
    {
      name: 'tags',
      type: 'relationship',
      relationTo: 'tags',
      hasMany: true,
      admin: {
        description: 'Product tags for categorization and filtering',
      },
    },

    // Pricing Information
    {
      name: 'price',
      type: 'text',
      maxLength: 100,
      admin: {
        description: 'Price information or "Contact for pricing"',
      },
    },
    {
      name: 'pricing',
      type: 'group',
      label: 'Pricing Configuration',
      admin: {
        description: 'Detailed pricing display settings',
      },
      fields: [
        {
          name: 'displayText',
          type: 'text',
          maxLength: 100,
          admin: {
            description: 'Main pricing text to display',
          },
        },
        {
          name: 'subtitle',
          type: 'text',
          maxLength: 200,
          admin: {
            description: 'Pricing subtitle or additional context',
          },
        },
        {
          name: 'showContactForm',
          type: 'checkbox',
          defaultValue: true,
          admin: {
            description: 'Display contact form for pricing inquiry',
          },
        },
        {
          name: 'currency',
          type: 'text',
          maxLength: 10,
          admin: {
            description: 'Currency code (e.g., USD, EUR, GBP)',
          },
        },
      ],
    },

    // Features Array
    {
      name: 'features',
      type: 'array',
      label: 'Key Features',
      admin: {
        description: 'Product key features and highlights',
      },
      fields: [
        {
          name: 'title',
          type: 'text',
          required: true,
          maxLength: 200,
          admin: {
            description: 'Feature title',
          },
        },
        {
          name: 'description',
          type: 'textarea',
          maxLength: 1000,
          admin: {
            description: 'Feature description',
          },
        },
        {
          name: 'icon',
          type: 'text',
          maxLength: 100,
          admin: {
            description: 'Lucide icon name or icon URL',
          },
        },
        {
          name: 'order',
          type: 'number',
          admin: {
            description: 'Display order (lower numbers first)',
          },
        },
      ],
    },

    // Benefits Array
    {
      name: 'benefits',
      type: 'array',
      label: 'Product Benefits',
      admin: {
        description: 'Benefits customers gain from this product',
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
        {
          name: 'icon',
          type: 'text',
          maxLength: 100,
          admin: {
            description: 'Lucide icon name or icon URL',
          },
        },
        {
          name: 'order',
          type: 'number',
          admin: {
            description: 'Display order (lower numbers first)',
          },
        },
      ],
    },

    // Services Array
    {
      name: 'services',
      type: 'array',
      label: 'Installation & Support Services',
      admin: {
        description: 'Installation, configuration, and support services offered',
      },
      fields: [
        {
          name: 'title',
          type: 'text',
          required: true,
          maxLength: 200,
          admin: {
            description: 'Service title',
          },
        },
        {
          name: 'description',
          type: 'textarea',
          required: true,
          maxLength: 1000,
          admin: {
            description: 'Service description',
          },
        },
        {
          name: 'icon',
          type: 'text',
          maxLength: 100,
          admin: {
            description: 'Lucide icon name or icon URL',
          },
        },
        {
          name: 'order',
          type: 'number',
          admin: {
            description: 'Display order (lower numbers first)',
          },
        },
      ],
    },

    // Action Buttons Array
    {
      name: 'actionButtons',
      type: 'array',
      label: 'Call-to-Action Buttons',
      admin: {
        description: 'Configurable CTA buttons for product page',
      },
      fields: [
        {
          name: 'label',
          type: 'text',
          required: true,
          maxLength: 100,
          admin: {
            description: 'Button text',
          },
        },
        {
          name: 'type',
          type: 'select',
          required: true,
          options: [
            { label: 'Primary', value: 'primary' },
            { label: 'Secondary', value: 'secondary' },
            { label: 'Outline', value: 'outline' },
          ],
          admin: {
            description: 'Button style type',
          },
        },
        {
          name: 'action',
          type: 'select',
          required: true,
          options: [
            { label: 'Contact Form', value: 'contact' },
            { label: 'Request Quote', value: 'quote' },
            { label: 'Download Resources', value: 'download' },
            { label: 'External Link', value: 'external_link' },
            { label: 'Play Video', value: 'video' },
          ],
          admin: {
            description: 'Button action type',
          },
        },
        {
          name: 'actionData',
          type: 'text',
          maxLength: 500,
          admin: {
            description: 'Action data (URL for external link, video ID, etc.)',
          },
        },
        {
          name: 'icon',
          type: 'text',
          maxLength: 100,
          admin: {
            description: 'Lucide icon name',
          },
        },
        {
          name: 'order',
          type: 'number',
          admin: {
            description: 'Display order (lower numbers first)',
          },
        },
      ],
    },

    // Badges Array
    {
      name: 'badges',
      type: 'array',
      label: 'Quality Badges',
      admin: {
        description: 'Quality badges and certifications to display',
      },
      fields: [
        {
          name: 'label',
          type: 'text',
          required: true,
          maxLength: 100,
          admin: {
            description: 'Badge label text',
          },
        },
        {
          name: 'type',
          type: 'select',
          required: true,
          options: [
            { label: 'Secondary', value: 'secondary' },
            { label: 'Outline', value: 'outline' },
            { label: 'Success', value: 'success' },
            { label: 'Warning', value: 'warning' },
            { label: 'Info', value: 'info' },
          ],
          admin: {
            description: 'Badge style type',
          },
        },
        {
          name: 'icon',
          type: 'text',
          maxLength: 100,
          admin: {
            description: 'Lucide icon name or icon URL',
          },
        },
        {
          name: 'order',
          type: 'number',
          admin: {
            description: 'Display order (lower numbers first)',
          },
        },
      ],
    },

    // ============================================================================
    // COMPARISON & BENCHMARKING
    // ============================================================================

    // Comparison Metrics Array
    {
      name: 'comparisonMetrics',
      type: 'array',
      label: 'Performance & Comparison Metrics',
      admin: {
        description: 'Quantifiable metrics for product comparison and benchmarking',
      },
      fields: [
        {
          name: 'metricName',
          type: 'text',
          required: true,
          maxLength: 200,
          admin: {
            description: 'e.g., "Range", "Power Output", "Response Time"',
          },
        },
        {
          name: 'value',
          type: 'text',
          required: true,
          maxLength: 100,
          admin: {
            description: 'Metric value with units, e.g., "50 nautical miles", "2000W"',
          },
        },
        {
          name: 'numericValue',
          type: 'number',
          admin: {
            description: 'Numeric value for programmatic comparison',
          },
        },
        {
          name: 'unit',
          type: 'text',
          maxLength: 50,
          admin: {
            description: 'Unit of measurement (meters, watts, ms, etc.)',
          },
        },
        {
          name: 'category',
          type: 'select',
          options: [
            { label: 'Performance', value: 'performance' },
            { label: 'Physical Specs', value: 'physical' },
            { label: 'Power & Energy', value: 'power' },
            { label: 'Capacity', value: 'capacity' },
            { label: 'Quality & Reliability', value: 'quality' },
            { label: 'Environmental', value: 'environmental' },
          ],
          admin: {
            description: 'Metric category for grouping',
          },
        },
        {
          name: 'compareHigherBetter',
          type: 'checkbox',
          defaultValue: true,
          admin: {
            description: 'Is higher value better for this metric?',
          },
        },
        {
          name: 'industryAverage',
          type: 'text',
          maxLength: 100,
          admin: {
            description: 'Industry average for context',
          },
        },
      ],
    },

    // ============================================================================
    // INTEGRATION & COMPATIBILITY
    // ============================================================================

    {
      name: 'integrationCompatibility',
      type: 'group',
      label: 'Integration & Compatibility',
      admin: {
        description: 'Technical integration details and compatibility information',
      },
      fields: [
        // Supported Protocols
        {
          name: 'supportedProtocols',
          type: 'array',
          label: 'Supported Protocols & Standards',
          admin: {
            description: 'Communication protocols and industry standards supported',
          },
          fields: [
            {
              name: 'protocol',
              type: 'text',
              required: true,
              maxLength: 100,
              admin: {
                description: 'Protocol name (e.g., NMEA 2000, Modbus, MQTT)',
              },
            },
            {
              name: 'version',
              type: 'text',
              maxLength: 50,
              admin: {
                description: 'Protocol version',
              },
            },
            {
              name: 'notes',
              type: 'textarea',
              maxLength: 500,
              admin: {
                description: 'Additional protocol notes',
              },
            },
          ],
        },

        // Integration Partners
        {
          name: 'integrationPartners',
          type: 'array',
          label: 'Compatible Systems & Partners',
          admin: {
            description: 'Third-party systems this product integrates with',
          },
          fields: [
            {
              name: 'partner',
              type: 'text',
              required: true,
              maxLength: 200,
              admin: {
                description: 'Partner/system name',
              },
            },
            {
              name: 'integrationType',
              type: 'text',
              maxLength: 100,
              admin: {
                description: 'Type of integration (API, Plugin, Native, etc.)',
              },
            },
            {
              name: 'certificationLevel',
              type: 'select',
              dbName: 'cert_level',
              options: [
                { label: 'Certified', value: 'certified' },
                { label: 'Compatible', value: 'compatible' },
                { label: 'Beta', value: 'beta' },
              ],
              admin: {
                description: 'Certification/compatibility level',
              },
            },
          ],
        },

        // API Availability
        {
          name: 'apiAvailable',
          type: 'checkbox',
          defaultValue: false,
          admin: {
            description: 'Does product offer API access?',
          },
        },
        {
          name: 'apiDocumentationUrl',
          type: 'text',
          maxLength: 500,
          admin: {
            description: 'URL to API documentation',
            condition: (data) => data.integrationCompatibility?.apiAvailable === true,
          },
        },

        // SDK Languages
        {
          name: 'sdkLanguages',
          type: 'array',
          label: 'SDK Programming Languages',
          admin: {
            description: 'Programming languages with SDK support',
          },
          fields: [
            {
              name: 'language',
              type: 'text',
              maxLength: 50,
              admin: {
                description: 'Programming language (e.g., JavaScript, Python, Java)',
              },
            },
          ],
        },

        // System Requirements
        {
          name: 'systemRequirements',
          type: 'group',
          label: 'System Requirements',
          admin: {
            description: 'Technical system requirements for installation and operation',
          },
          fields: [
            {
              name: 'powerSupply',
              type: 'text',
              maxLength: 200,
              admin: {
                description: 'Power supply requirements (e.g., "12V/24V DC, 50-100W")',
              },
            },
            {
              name: 'mounting',
              type: 'text',
              maxLength: 200,
              admin: {
                description: 'Mounting requirements (e.g., "Flush mount, DIN rail compatible")',
              },
            },
            {
              name: 'operatingTemp',
              type: 'text',
              maxLength: 100,
              admin: {
                description: 'Operating temperature range (e.g., "-20°C to +60°C")',
              },
            },
            {
              name: 'certification',
              type: 'text',
              maxLength: 200,
              admin: {
                description: 'Required certifications (e.g., "CE, FCC, IMO Compliant")',
              },
            },
            {
              name: 'ipRating',
              type: 'text',
              maxLength: 50,
              admin: {
                description: 'IP rating (e.g., "IP67 Marine Grade")',
              },
            },
          ],
        },

        // Compatibility Matrix
        {
          name: 'compatibilityMatrix',
          type: 'array',
          label: 'Compatibility Matrix',
          dbName: 'compat_matrix',
          admin: {
            description: 'Detailed compatibility information with other systems',
          },
          fields: [
            {
              name: 'system',
              type: 'text',
              required: true,
              maxLength: 200,
              admin: {
                description: 'System/product name (e.g., "Garmin GPSMAP", "Raymarine Axiom")',
              },
            },
            {
              name: 'compatibility',
              type: 'select',
              required: true,
              dbName: 'compat',
              options: [
                { label: 'Full Compatibility', value: 'full' },
                { label: 'Partial Compatibility', value: 'partial' },
                { label: 'Requires Adapter', value: 'adapter' },
                { label: 'Not Compatible', value: 'none' },
              ],
              admin: {
                description: 'Level of compatibility with this system',
              },
            },
            {
              name: 'notes',
              type: 'textarea',
              maxLength: 1000,
              admin: {
                description: 'Additional compatibility notes or details',
              },
            },
            {
              name: 'requirements',
              type: 'array',
              label: 'Requirements',
              admin: {
                description: 'List of requirements for this integration',
              },
              fields: [
                {
                  name: 'requirement',
                  type: 'text',
                  maxLength: 500,
                  admin: {
                    description: 'Specific requirement for this integration',
                  },
                },
              ],
            },
            {
              name: 'complexity',
              type: 'select',
              options: [
                { label: 'Simple', value: 'simple' },
                { label: 'Moderate', value: 'moderate' },
                { label: 'Complex', value: 'complex' },
              ],
              admin: {
                description: 'Integration complexity level',
              },
            },
            {
              name: 'estimatedCost',
              type: 'text',
              maxLength: 100,
              admin: {
                description: 'Estimated integration cost (e.g., "$500-$1000", "Contact for quote")',
              },
            },
          ],
        },
      ],
    },

    // ============================================================================
    // OWNER REVIEWS & TESTIMONIALS
    // ============================================================================

    {
      name: 'ownerReviews',
      type: 'array',
      label: 'Owner Reviews & Testimonials',
      admin: {
        description: 'Real-world reviews from yacht owners and captains',
      },
      fields: [
        {
          name: 'reviewerName',
          type: 'text',
          required: true,
          maxLength: 200,
          admin: {
            description: 'Name of the reviewer',
          },
        },
        {
          name: 'reviewerRole',
          type: 'text',
          required: true,
          maxLength: 100,
          admin: {
            description: 'e.g., "Captain", "Owner", "Chief Engineer"',
          },
        },
        {
          name: 'yachtName',
          type: 'text',
          maxLength: 200,
          admin: {
            description: 'Name of yacht (if disclosable)',
          },
        },
        {
          name: 'yacht',
          type: 'relationship',
          relationTo: 'yachts',
          admin: {
            description: 'Link to yacht profile (if exists)',
          },
        },
        {
          name: 'overallRating',
          type: 'number',
          required: true,
          min: 1,
          max: 5,
          admin: {
            description: 'Overall rating out of 5',
          },
        },
        {
          name: 'ratings',
          type: 'group',
          label: 'Detailed Ratings',
          admin: {
            description: 'Breakdown of ratings by category',
          },
          fields: [
            {
              name: 'reliability',
              type: 'number',
              min: 1,
              max: 5,
              admin: {
                description: 'Reliability rating (1-5)',
              },
            },
            {
              name: 'easeOfUse',
              type: 'number',
              min: 1,
              max: 5,
              admin: {
                description: 'Ease of use rating (1-5)',
              },
            },
            {
              name: 'performance',
              type: 'number',
              min: 1,
              max: 5,
              admin: {
                description: 'Performance rating (1-5)',
              },
            },
            {
              name: 'support',
              type: 'number',
              min: 1,
              max: 5,
              admin: {
                description: 'Support quality rating (1-5)',
              },
            },
            {
              name: 'valueForMoney',
              type: 'number',
              min: 1,
              max: 5,
              admin: {
                description: 'Value for money rating (1-5)',
              },
            },
          ],
        },
        {
          name: 'reviewText',
          type: 'richText',
          required: true,
          editor: lexicalEditor({}),
          admin: {
            description: 'Detailed review text',
          },
        },
        {
          name: 'pros',
          type: 'array',
          label: 'Pros',
          admin: {
            description: 'List of positive aspects',
          },
          fields: [
            {
              name: 'pro',
              type: 'text',
              maxLength: 500,
            },
          ],
        },
        {
          name: 'cons',
          type: 'array',
          label: 'Cons',
          admin: {
            description: 'List of negative aspects',
          },
          fields: [
            {
              name: 'con',
              type: 'text',
              maxLength: 500,
            },
          ],
        },
        {
          name: 'reviewDate',
          type: 'date',
          required: true,
          admin: {
            description: 'Date review was written',
          },
        },
        {
          name: 'verified',
          type: 'checkbox',
          defaultValue: false,
          admin: {
            description: 'Verified purchase/installation',
          },
        },
        {
          name: 'featured',
          type: 'checkbox',
          defaultValue: false,
          admin: {
            description: 'Feature this review prominently',
          },
        },
      ],
    },

    // ============================================================================
    // VISUAL DEMO & INTERACTIVE CONTENT
    // ============================================================================

    {
      name: 'visualDemoContent',
      type: 'group',
      label: 'Visual Demo & Interactive Content',
      admin: {
        description: 'Interactive product demonstrations and 3D content',
      },
      fields: [
        // 360° Product Images
        {
          name: 'images360',
          type: 'array',
          label: '360° Product Images',
          admin: {
            description: 'Images for 360-degree product view',
          },
          fields: [
            {
              name: 'image',
              type: 'upload',
              relationTo: 'media',
              required: true,
            },
            {
              name: 'angle',
              type: 'number',
              admin: {
                description: 'Rotation angle in degrees (0-360)',
              },
            },
            {
              name: 'label',
              type: 'text',
              maxLength: 100,
              admin: {
                description: 'Label for this angle',
              },
            },
          ],
        },

        // 3D Model
        {
          name: 'model3d',
          type: 'group',
          label: '3D Model',
          admin: {
            description: '3D model for interactive viewing',
          },
          fields: [
            {
              name: 'modelUrl',
              type: 'text',
              maxLength: 500,
              admin: {
                description: 'URL to 3D model file (GLTF, GLB, OBJ)',
              },
            },
            {
              name: 'thumbnailImage',
              type: 'upload',
              relationTo: 'media',
              admin: {
                description: 'Thumbnail preview image',
              },
            },
            {
              name: 'allowDownload',
              type: 'checkbox',
              defaultValue: false,
              admin: {
                description: 'Allow users to download the 3D model',
              },
            },
          ],
        },

        // Interactive Hotspots
        {
          name: 'interactiveHotspots',
          type: 'array',
          label: 'Interactive Hotspots',
          admin: {
            description: 'Interactive points of interest on product images',
          },
          fields: [
            {
              name: 'image',
              type: 'upload',
              relationTo: 'media',
              required: true,
              admin: {
                description: 'Base image for hotspots',
              },
            },
            {
              name: 'hotspots',
              type: 'array',
              label: 'Hotspots',
              admin: {
                description: 'Interactive points on the image',
              },
              fields: [
                {
                  name: 'x',
                  type: 'number',
                  required: true,
                  admin: {
                    description: 'X coordinate (percentage, 0-100)',
                  },
                },
                {
                  name: 'y',
                  type: 'number',
                  required: true,
                  admin: {
                    description: 'Y coordinate (percentage, 0-100)',
                  },
                },
                {
                  name: 'title',
                  type: 'text',
                  required: true,
                  maxLength: 200,
                  admin: {
                    description: 'Hotspot title',
                  },
                },
                {
                  name: 'description',
                  type: 'textarea',
                  maxLength: 1000,
                  admin: {
                    description: 'Hotspot description',
                  },
                },
                {
                  name: 'featureImage',
                  type: 'upload',
                  relationTo: 'media',
                  admin: {
                    description: 'Optional detail image for this hotspot',
                  },
                },
              ],
            },
          ],
        },

        // Video Walkthrough
        {
          name: 'videoWalkthrough',
          type: 'group',
          label: 'Video Product Walkthrough',
          admin: {
            description: 'Video demonstration of the product',
          },
          fields: [
            {
              name: 'videoUrl',
              type: 'text',
              maxLength: 500,
              admin: {
                description: 'YouTube or Vimeo URL',
              },
            },
            {
              name: 'thumbnail',
              type: 'upload',
              relationTo: 'media',
              admin: {
                description: 'Video thumbnail image',
              },
            },
            {
              name: 'duration',
              type: 'number',
              admin: {
                description: 'Duration in seconds',
              },
            },
            {
              name: 'chapters',
              type: 'array',
              label: 'Video Chapters',
              admin: {
                description: 'Chapters for video navigation',
              },
              fields: [
                {
                  name: 'timestamp',
                  type: 'number',
                  required: true,
                  admin: {
                    description: 'Timestamp in seconds',
                  },
                },
                {
                  name: 'title',
                  type: 'text',
                  required: true,
                  maxLength: 200,
                  admin: {
                    description: 'Chapter title',
                  },
                },
              ],
            },
          ],
        },

        // Augmented Reality Preview
        {
          name: 'augmentedRealityPreview',
          type: 'group',
          label: 'AR Preview',
          admin: {
            description: 'Augmented reality model files',
          },
          fields: [
            {
              name: 'arModelUrl',
              type: 'text',
              maxLength: 500,
              admin: {
                description: 'USDZ file for iOS AR',
              },
            },
            {
              name: 'glbModelUrl',
              type: 'text',
              maxLength: 500,
              admin: {
                description: 'GLB file for Android AR',
              },
            },
            {
              name: 'scaleReference',
              type: 'text',
              maxLength: 200,
              admin: {
                description: 'Real-world scale reference',
              },
            },
          ],
        },
      ],
    },

    // ============================================================================
    // DOCUMENTATION & SUPPORT
    // ============================================================================

    // Technical Documentation
    {
      name: 'technicalDocumentation',
      type: 'array',
      label: 'Technical Documentation',
      admin: {
        description: 'Technical manuals and documentation',
      },
      fields: [
        {
          name: 'title',
          type: 'text',
          required: true,
          maxLength: 200,
          admin: {
            description: 'Document title',
          },
        },
        {
          name: 'type',
          type: 'select',
          options: [
            { label: 'User Manual', value: 'manual' },
            { label: 'Technical Specification', value: 'spec' },
            { label: 'Installation Guide', value: 'installation' },
            { label: 'Integration Guide', value: 'integration' },
            { label: 'API Documentation', value: 'api' },
            { label: 'Troubleshooting', value: 'troubleshooting' },
          ],
          admin: {
            description: 'Document type',
          },
        },
        {
          name: 'fileUrl',
          type: 'text',
          maxLength: 500,
          admin: {
            description: 'URL to document file (PDF, etc.)',
          },
        },
        {
          name: 'language',
          type: 'text',
          maxLength: 10,
          defaultValue: 'en',
          admin: {
            description: 'Document language code',
          },
        },
        {
          name: 'version',
          type: 'text',
          maxLength: 50,
          admin: {
            description: 'Document version',
          },
        },
      ],
    },

    // Warranty & Support
    {
      name: 'warrantySupport',
      type: 'group',
      label: 'Warranty & Support',
      admin: {
        description: 'Warranty and support information',
      },
      fields: [
        {
          name: 'warrantyYears',
          type: 'number',
          admin: {
            description: 'Standard warranty period in years',
          },
        },
        {
          name: 'warrantyDetails',
          type: 'textarea',
          maxLength: 2000,
          admin: {
            description: 'Detailed warranty terms',
          },
        },
        {
          name: 'extendedWarrantyAvailable',
          type: 'checkbox',
          defaultValue: false,
          admin: {
            description: 'Is extended warranty available?',
          },
        },
        {
          name: 'supportChannels',
          type: 'array',
          label: 'Support Channels',
          admin: {
            description: 'Available support channels',
          },
          fields: [
            {
              name: 'channel',
              type: 'text',
              maxLength: 100,
              admin: {
                description: 'Support channel (e.g., Email, Phone, Chat)',
              },
            },
          ],
        },
        {
          name: 'supportResponseTime',
          type: 'text',
          maxLength: 100,
          admin: {
            description: 'e.g., "24 hours", "Same business day"',
          },
        },
      ],
    },

    // ============================================================================
    // SEO
    // ============================================================================

    {
      name: 'seo',
      type: 'group',
      label: 'SEO Settings',
      admin: {
        description: 'Search engine optimization settings',
      },
      fields: [
        {
          name: 'metaTitle',
          type: 'text',
          maxLength: 100,
          admin: {
            description: 'SEO title (leave empty to use product name)',
          },
        },
        {
          name: 'metaDescription',
          type: 'textarea',
          maxLength: 300,
          admin: {
            description: 'SEO meta description',
          },
        },
        {
          name: 'keywords',
          type: 'text',
          maxLength: 500,
          admin: {
            description: 'SEO keywords (comma-separated)',
          },
        },
        {
          name: 'ogImage',
          type: 'text',
          maxLength: 500,
          admin: {
            description: 'Open Graph image URL for social sharing',
          },
        },
      ],
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
