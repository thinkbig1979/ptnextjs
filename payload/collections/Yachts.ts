import type { CollectionConfig } from 'payload';
import { lexicalEditor } from '@payloadcms/richtext-lexical';
import { isAdmin } from '../access/rbac';

/**
 * Yachts Collection
 *
 * Comprehensive yacht management with timeline tracking, supplier relationships,
 * sustainability scoring, and maintenance history.
 */
const Yachts: CollectionConfig = {
  slug: 'yachts',
  admin: {
    useAsTitle: 'name',
    defaultColumns: ['name', 'builder', 'lengthMeters', 'launchYear', 'updatedAt'],
    group: 'Content',
  },
  access: {
    // Admin-only write access, public read access
    create: isAdmin,
    read: () => true, // Public can read all yachts
    update: isAdmin,
    delete: isAdmin,
  },
  fields: [
    // ========================================
    // BASIC FIELDS
    // ========================================
    {
      name: 'name',
      type: 'text',
      required: true,
      unique: true,
      maxLength: 255,
      admin: {
        description: 'Yacht name (must be unique)',
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
    },
    {
      name: 'tagline',
      type: 'text',
      maxLength: 500,
      admin: {
        description: 'Short tagline or catchphrase',
      },
    },
    {
      name: 'description',
      type: 'richText',
      editor: lexicalEditor({}),
      required: true,
      admin: {
        description: 'Full yacht description',
      },
    },
    {
      name: 'heroImage',
      type: 'upload',
      relationTo: 'media',
      admin: {
        description: 'Main hero image for yacht',
      },
    },

    // ========================================
    // SPECIFICATIONS GROUP
    // ========================================
    {
      name: 'builder',
      type: 'text',
      maxLength: 255,
      admin: {
        description: 'Yacht builder/shipyard name',
      },
    },
    {
      name: 'lengthMeters',
      type: 'number',
      admin: {
        description: 'Overall length in meters',
      },
    },
    {
      name: 'beamMeters',
      type: 'number',
      admin: {
        description: 'Maximum beam/width in meters',
      },
    },
    {
      name: 'draftMeters',
      type: 'number',
      admin: {
        description: 'Draft depth in meters',
      },
    },
    {
      name: 'tonnage',
      type: 'number',
      admin: {
        description: 'Gross tonnage (GT)',
      },
    },
    {
      name: 'launchYear',
      type: 'number',
      required: true,
      admin: {
        description: 'Year the yacht was launched (required)',
      },
    },
    {
      name: 'deliveryDate',
      type: 'date',
      admin: {
        description: 'Delivery date to owner',
      },
    },
    {
      name: 'flagState',
      type: 'text',
      maxLength: 100,
      admin: {
        description: 'Flag state/registry country',
      },
    },
    {
      name: 'classification',
      type: 'text',
      maxLength: 255,
      admin: {
        description: 'Classification society (e.g., DNV, Lloyds)',
      },
    },

    // ========================================
    // TIMELINE ARRAY (5 properties, 8 categories)
    // ========================================
    {
      name: 'timeline',
      type: 'array',
      admin: {
        description: 'Project timeline events',
      },
      fields: [
        {
          name: 'date',
          type: 'date',
          required: true,
          admin: {
            description: 'Event date',
          },
        },
        {
          name: 'title',
          type: 'text',
          required: true,
          maxLength: 255,
          admin: {
            description: 'Event title/name',
          },
        },
        {
          name: 'description',
          type: 'textarea',
          maxLength: 2000,
          admin: {
            description: 'Event description',
          },
        },
        {
          name: 'category',
          type: 'select',
          options: [
            { label: 'Design', value: 'design' },
            { label: 'Construction', value: 'construction' },
            { label: 'Launch', value: 'launch' },
            { label: 'Sea Trials', value: 'sea_trials' },
            { label: 'Delivery', value: 'delivery' },
            { label: 'Refit', value: 'refit' },
            { label: 'Tech Installation', value: 'tech_installation' },
            { label: 'Certification', value: 'certification' },
          ],
          admin: {
            description: 'Event category (8 options)',
          },
        },
        {
          name: 'image',
          type: 'upload',
          relationTo: 'media',
          admin: {
            description: 'Optional event image',
          },
        },
      ],
    },

    // ========================================
    // SUPPLIER MAP ARRAY (vendor/product relationships, 10 system categories)
    // ========================================
    {
      name: 'supplierMap',
      type: 'array',
      admin: {
        description: 'Vendor and product relationships for installed systems',
      },
      fields: [
        {
          name: 'vendor',
          type: 'relationship',
          relationTo: 'vendors',
          required: true,
          hasMany: false,
          admin: {
            description: 'Vendor that supplied the system',
          },
        },
        {
          name: 'products',
          type: 'relationship',
          relationTo: 'products',
          hasMany: true,
          admin: {
            description: 'Products installed by this vendor',
          },
        },
        {
          name: 'systemCategory',
          type: 'select',
          options: [
            { label: 'Navigation', value: 'navigation' },
            { label: 'Communication', value: 'communication' },
            { label: 'Entertainment', value: 'entertainment' },
            { label: 'Automation', value: 'automation' },
            { label: 'Security', value: 'security' },
            { label: 'Propulsion', value: 'propulsion' },
            { label: 'Power', value: 'power' },
            { label: 'HVAC', value: 'hvac' },
            { label: 'Water', value: 'water' },
            { label: 'Safety', value: 'safety' },
          ],
          admin: {
            description: 'System category (10 options)',
          },
        },
        {
          name: 'installationDate',
          type: 'date',
          admin: {
            description: 'Installation date',
          },
        },
        {
          name: 'notes',
          type: 'textarea',
          maxLength: 1000,
          admin: {
            description: 'Additional notes about the installation',
          },
        },
      ],
    },

    // ========================================
    // SUSTAINABILITY GROUP (8 fields)
    // ========================================
    {
      name: 'co2EmissionsTonsPerYear',
      type: 'number',
      admin: {
        description: 'Annual CO2 emissions in tons',
      },
    },
    {
      name: 'energyEfficiencyRating',
      type: 'select',
      options: [
        { label: 'A+', value: 'a_plus' },
        { label: 'A', value: 'a' },
        { label: 'B', value: 'b' },
        { label: 'C', value: 'c' },
        { label: 'D', value: 'd' },
        { label: 'E', value: 'e' },
      ],
      admin: {
        description: 'Energy efficiency rating (6 options)',
      },
    },
    {
      name: 'hybridPropulsion',
      type: 'checkbox',
      defaultValue: false,
      admin: {
        description: 'Has hybrid propulsion system',
      },
    },
    {
      name: 'solarPanelCapacityKw',
      type: 'number',
      admin: {
        description: 'Solar panel capacity in kilowatts',
      },
    },
    {
      name: 'batteryStorageKwh',
      type: 'number',
      admin: {
        description: 'Battery storage capacity in kilowatt-hours',
      },
    },
    {
      name: 'sustainabilityFeatures',
      type: 'array',
      admin: {
        description: 'Additional sustainability features',
      },
      fields: [
        {
          name: 'feature',
          type: 'text',
          required: true,
          maxLength: 255,
          admin: {
            description: 'Feature name',
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
      ],
    },
    {
      name: 'greenCertifications',
      type: 'array',
      admin: {
        description: 'Environmental certifications',
      },
      fields: [
        {
          name: 'certification',
          type: 'text',
          required: true,
          maxLength: 255,
          admin: {
            description: 'Certification name',
          },
        },
      ],
    },

    // ========================================
    // MAINTENANCE HISTORY ARRAY (6 fields)
    // ========================================
    {
      name: 'maintenanceHistory',
      type: 'array',
      admin: {
        description: 'Maintenance and service history',
      },
      fields: [
        {
          name: 'date',
          type: 'date',
          required: true,
          admin: {
            description: 'Maintenance date',
          },
        },
        {
          name: 'type',
          type: 'select',
          required: true,
          options: [
            { label: 'Scheduled', value: 'scheduled' },
            { label: 'Repair', value: 'repair' },
            { label: 'Upgrade', value: 'upgrade' },
            { label: 'Refit', value: 'refit' },
            { label: 'Tech Update', value: 'tech_update' },
          ],
          admin: {
            description: 'Type of maintenance (5 options)',
          },
        },
        {
          name: 'description',
          type: 'textarea',
          required: true,
          maxLength: 2000,
          admin: {
            description: 'Detailed description of work performed',
          },
        },
        {
          name: 'vendor',
          type: 'relationship',
          relationTo: 'vendors',
          hasMany: false,
          admin: {
            description: 'Vendor that performed the work',
          },
        },
        {
          name: 'cost',
          type: 'text',
          maxLength: 100,
          admin: {
            description: 'Cost of maintenance (e.g., "$50,000")',
          },
        },
        {
          name: 'location',
          type: 'text',
          maxLength: 255,
          admin: {
            description: 'Location where maintenance was performed',
          },
        },
      ],
    },

    // ========================================
    // ADDITIONAL FIELDS
    // ========================================
    {
      name: 'gallery',
      type: 'array',
      admin: {
        description: 'Image gallery',
      },
      fields: [
        {
          name: 'image',
          type: 'upload',
          relationTo: 'media',
          required: true,
          admin: {
            description: 'Gallery image',
          },
        },
        {
          name: 'caption',
          type: 'text',
          maxLength: 500,
          admin: {
            description: 'Image caption',
          },
        },
      ],
    },
    {
      name: 'videoTour',
      type: 'text',
      maxLength: 500,
      admin: {
        description: 'Video tour URL (YouTube, Vimeo, etc.)',
      },
    },
    {
      name: 'websiteUrl',
      type: 'text',
      maxLength: 500,
      admin: {
        description: 'Official yacht website URL',
      },
      validate: (value: unknown) => {
        if (value && typeof value === 'string' && value.length > 0) {
          // Basic URL validation
          if (!/^https?:\/\/.+/.test(value)) {
            return 'URL must start with http:// or https://';
          }
        }
        return true;
      },
    },
    {
      name: 'featured',
      type: 'checkbox',
      defaultValue: false,
      admin: {
        position: 'sidebar',
        description: 'Feature this yacht on homepage/listings',
      },
    },
    {
      name: 'status',
      type: 'select',
      defaultValue: 'active',
      options: [
        { label: 'Design', value: 'design' },
        { label: 'Construction', value: 'construction' },
        { label: 'Trials', value: 'trials' },
        { label: 'Active', value: 'active' },
        { label: 'Refit', value: 'refit' },
      ],
      admin: {
        position: 'sidebar',
        description: 'Current yacht status (5 options)',
      },
    },

    // ========================================
    // RELATIONSHIPS
    // ========================================
    {
      name: 'categories',
      type: 'relationship',
      relationTo: 'categories',
      hasMany: true,
      admin: {
        position: 'sidebar',
        description: 'Yacht categories',
      },
    },
    {
      name: 'tags',
      type: 'relationship',
      relationTo: 'tags',
      hasMany: true,
      admin: {
        position: 'sidebar',
        description: 'Yacht tags',
      },
    },
  ],
  timestamps: true,
  hooks: {
    beforeChange: [
      // Optional: Sort timeline events by date descending (most recent first)
      async ({ data }) => {
        if (data.timeline && Array.isArray(data.timeline)) {
          data.timeline.sort((a, b) => {
            const dateA = new Date(a.date).getTime();
            const dateB = new Date(b.date).getTime();
            return dateB - dateA; // Descending order
          });
        }
        return data;
      },
    ],
  },
};

export default Yachts;
