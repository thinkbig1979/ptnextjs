# Technical Specification

This is the technical specification for the spec detailed in @.agent-os/specs/2025-10-14-complete-tinacms-payload-migration/spec.md

## Feature Classification

**Feature Type**: FULL_STACK

**Frontend Required**: YES
**Backend Required**: YES

**Justification**: This is a complete CMS migration requiring backend schema migration (Payload collections), data migration scripts, and frontend data layer replacement throughout the application.

---

## Backend Implementation

### Payload CMS Collections Enhancement

#### **1. Vendors Collection - Enhanced Fields**

**Purpose**: Add all missing TinaCMS vendor fields to Payload schema

Current minimal fields: companyName, slug, description, logo, website, linkedinUrl, twitterUrl, basic certifications array

**Missing fields to add**:

```typescript
// Enhanced Profile Fields (from TinaCMS)
{
  name: 'image',
  type: 'text', // Company overview image URL
},
{
  name: 'founded',
  type: 'number', // Founded year
},
{
  name: 'location',
  type: 'text', // Company location
},
{
  name: 'partner',
  type: 'checkbox', // Is strategic partner vs supplier
  defaultValue: true,
},
{
  name: 'services',
  type: 'array', // Services & support offerings
  fields: [
    { name: 'service', type: 'text', required: true },
  ],
},
{
  name: 'statistics',
  type: 'array', // Company statistics
  fields: [
    { name: 'label', type: 'text', required: true },
    { name: 'value', type: 'text', required: true },
    { name: 'order', type: 'number' },
  ],
},
{
  name: 'achievements',
  type: 'array', // Why Choose Us achievements
  fields: [
    { name: 'title', type: 'text', required: true },
    { name: 'description', type: 'textarea', required: true },
    { name: 'icon', type: 'text' }, // Lucide icon name
    { name: 'order', type: 'number' },
  ],
},
{
  name: 'category',
  type: 'relationship',
  relationTo: 'categories', // Primary technology category
},
{
  name: 'tags',
  type: 'relationship',
  relationTo: 'tags',
  hasMany: true, // Technology tags
},
{
  name: 'certifications',
  type: 'array', // ENHANCED from current basic array
  fields: [
    { name: 'name', type: 'text', required: true },
    { name: 'issuer', type: 'text', required: true },
    { name: 'year', type: 'number' },
    { name: 'expiryDate', type: 'date' },
    { name: 'certificateUrl', type: 'text' },
    { name: 'logo', type: 'text' }, // Certification logo URL
  ],
},
{
  name: 'awards',
  type: 'array', // Awards & recognition
  fields: [
    { name: 'title', type: 'text', required: true },
    { name: 'year', type: 'number', required: true },
    { name: 'organization', type: 'text' },
    { name: 'category', type: 'text' },
    { name: 'description', type: 'richText' },
  ],
},
{
  name: 'socialProof',
  type: 'group', // Social proof metrics
  fields: [
    { name: 'followers', type: 'number' },
    { name: 'projectsCompleted', type: 'number' },
    { name: 'yearsInBusiness', type: 'number' },
    { name: 'customerList', type: 'array', fields: [{ name: 'customer', type: 'text' }] },
  ],
},
{
  name: 'videoIntroduction',
  type: 'group', // Company video
  fields: [
    { name: 'videoUrl', type: 'text' },
    { name: 'thumbnailImage', type: 'text' },
    { name: 'title', type: 'text' },
    { name: 'description', type: 'textarea' },
  ],
},
{
  name: 'caseStudies',
  type: 'array', // Project case studies
  fields: [
    { name: 'title', type: 'text', required: true },
    { name: 'slug', type: 'text', required: true },
    { name: 'client', type: 'text' },
    { name: 'challenge', type: 'richText', required: true },
    { name: 'solution', type: 'richText', required: true },
    { name: 'results', type: 'richText' },
    { name: 'images', type: 'array', fields: [{ name: 'image', type: 'text' }] },
    { name: 'technologies', type: 'array', fields: [{ name: 'tech', type: 'text' }] },
  ],
},
{
  name: 'innovationHighlights',
  type: 'array', // Technology innovations
  fields: [
    { name: 'technology', type: 'text', required: true },
    { name: 'description', type: 'richText' },
    { name: 'uniqueApproach', type: 'textarea' },
    { name: 'benefitsToClients', type: 'array', fields: [{ name: 'benefit', type: 'text' }] },
  ],
},
{
  name: 'teamMembers',
  type: 'array', // Interactive org chart team members
  fields: [
    { name: 'name', type: 'text', required: true },
    { name: 'position', type: 'text', required: true },
    { name: 'bio', type: 'richText' },
    { name: 'photo', type: 'text' }, // Photo URL
    { name: 'linkedinUrl', type: 'text' },
    { name: 'expertise', type: 'array', fields: [{ name: 'area', type: 'text' }] },
  ],
},
{
  name: 'yachtProjects',
  type: 'array', // Yacht projects portfolio
  fields: [
    { name: 'yachtName', type: 'text', required: true },
    { name: 'systems', type: 'array', fields: [{ name: 'system', type: 'text' }], required: true },
    { name: 'projectYear', type: 'number' },
    { name: 'role', type: 'text' },
    { name: 'description', type: 'textarea' },
  ],
},
{
  name: 'seo',
  type: 'group', // SEO settings
  fields: [
    { name: 'metaTitle', type: 'text' },
    { name: 'metaDescription', type: 'textarea' },
    { name: 'keywords', type: 'text' },
    { name: 'ogImage', type: 'text' },
  ],
},
```

#### **2. Products Collection - Enhanced Fields**

**Purpose**: Add all missing TinaCMS product fields to Payload schema

Current minimal fields: name, slug, description, shortDescription, images array (url, altText, isMain, caption), categories relationship, specifications array (label, value)

**Missing fields to add**:

```typescript
// Missing from current implementation
{
  name: 'price',
  type: 'text', // Price information or "Contact for pricing"
},
{
  name: 'tags',
  type: 'relationship',
  relationTo: 'tags',
  hasMany: true,
},
{
  name: 'features',
  type: 'array', // Key features
  fields: [
    { name: 'title', type: 'text', required: true },
    { name: 'description', type: 'textarea' },
    { name: 'icon', type: 'text' },
    { name: 'order', type: 'number' },
  ],
},
{
  name: 'benefits',
  type: 'array', // Product benefits
  fields: [
    { name: 'benefit', type: 'text', required: true },
    { name: 'icon', type: 'text' },
    { name: 'order', type: 'number' },
  ],
},
{
  name: 'services',
  type: 'array', // Installation & support services
  fields: [
    { name: 'title', type: 'text', required: true },
    { name: 'description', type: 'textarea', required: true },
    { name: 'icon', type: 'text' },
    { name: 'order', type: 'number' },
  ],
},
{
  name: 'pricing',
  type: 'group', // Pricing configuration
  fields: [
    { name: 'displayText', type: 'text' },
    { name: 'subtitle', type: 'text' },
    { name: 'showContactForm', type: 'checkbox' },
    { name: 'currency', type: 'text' },
  ],
},
{
  name: 'actionButtons',
  type: 'array', // Configurable CTA buttons
  fields: [
    { name: 'label', type: 'text', required: true },
    { name: 'type', type: 'select', options: ['primary', 'secondary', 'outline'], required: true },
    { name: 'action', type: 'select', options: ['contact', 'quote', 'download', 'external_link', 'video'], required: true },
    { name: 'actionData', type: 'text' },
    { name: 'icon', type: 'text' },
    { name: 'order', type: 'number' },
  ],
},
{
  name: 'badges',
  type: 'array', // Quality badges
  fields: [
    { name: 'label', type: 'text', required: true },
    { name: 'type', type: 'select', options: ['secondary', 'outline', 'success', 'warning', 'info'], required: true },
    { name: 'icon', type: 'text' },
    { name: 'order', type: 'number' },
  ],
},
{
  name: 'comparisonMetrics',
  type: 'array', // Performance comparison data
  fields: [
    { name: 'metricId', type: 'text', required: true },
    { name: 'name', type: 'text', required: true },
    { name: 'value', type: 'number', required: true },
    { name: 'unit', type: 'text' },
    { name: 'category', type: 'select', options: ['performance', 'efficiency', 'reliability', 'physical', 'environmental'] },
    { name: 'weight', type: 'number' }, // 0.0 - 1.0
    { name: 'toleranceMin', type: 'number' },
    { name: 'toleranceMax', type: 'number' },
    { name: 'benchmarkValue', type: 'number' },
  ],
},
{
  name: 'integrationCompatibility',
  type: 'group',
  fields: [
    {
      name: 'supportedProtocols',
      type: 'array',
      fields: [{ name: 'protocol', type: 'text' }]
    },
    {
      name: 'systemRequirements',
      type: 'group',
      fields: [
        { name: 'powerSupply', type: 'text' },
        { name: 'mounting', type: 'text' },
        { name: 'operatingTemp', type: 'text' },
        { name: 'certification', type: 'text' },
        { name: 'ipRating', type: 'text' },
      ],
    },
    {
      name: 'compatibilityMatrix',
      type: 'array',
      fields: [
        { name: 'system', type: 'text', required: true },
        { name: 'compatibility', type: 'select', options: ['full', 'partial', 'adapter', 'none'], required: true },
        { name: 'notes', type: 'textarea' },
        { name: 'requirements', type: 'array', fields: [{ name: 'requirement', type: 'text' }] },
        { name: 'complexity', type: 'select', options: ['simple', 'moderate', 'complex'] },
        { name: 'estimatedCost', type: 'text' },
      ],
    },
  ],
},
{
  name: 'ownerReviews',
  type: 'array', // Customer reviews
  fields: [
    { name: 'reviewId', type: 'text', required: true },
    { name: 'ownerName', type: 'text', required: true },
    { name: 'yachtName', type: 'text' },
    { name: 'yachtLength', type: 'text' },
    { name: 'rating', type: 'number', required: true }, // 0-5
    { name: 'title', type: 'text', required: true },
    { name: 'review', type: 'textarea', required: true },
    { name: 'pros', type: 'array', fields: [{ name: 'pro', type: 'text' }] },
    { name: 'cons', type: 'array', fields: [{ name: 'con', type: 'text' }] },
    { name: 'installationDate', type: 'date' },
    { name: 'verified', type: 'checkbox' },
    { name: 'helpful', type: 'number' }, // Helpful votes count
    { name: 'images', type: 'array', fields: [{ name: 'image', type: 'text' }] },
    { name: 'useCase', type: 'select', options: ['commercial_charter', 'private_use', 'racing', 'expedition', 'day_sailing'] },
  ],
},
{
  name: 'visualDemo',
  type: 'group', // 360° images, 3D models, interactive demos
  fields: [
    { name: 'type', type: 'select', options: ['360-image', '3d-model', 'video', 'interactive'], required: true },
    { name: 'title', type: 'text', required: true },
    { name: 'description', type: 'textarea' },
    { name: 'imageUrl', type: 'text' }, // For 360° images
    { name: 'modelUrl', type: 'text' }, // For 3D models (.glb, .gltf)
    { name: 'videoUrl', type: 'text' }, // For video demos
    {
      name: 'hotspots',
      type: 'array', // Interactive points on 360° images
      fields: [
        { name: 'positionX', type: 'number', required: true },
        { name: 'positionY', type: 'number', required: true },
        { name: 'title', type: 'text', required: true },
        { name: 'description', type: 'text' },
        { name: 'action', type: 'select', options: ['highlight', 'zoom', 'info', 'navigate'] },
      ],
    },
    { name: 'animations', type: 'array', fields: [{ name: 'animation', type: 'text' }] },
    {
      name: 'cameraPositions',
      type: 'array', // Predefined camera positions for 3D models
      fields: [
        { name: 'name', type: 'text', required: true },
        { name: 'positionX', type: 'number' },
        { name: 'positionY', type: 'number' },
        { name: 'positionZ', type: 'number' },
      ],
    },
  ],
},
{
  name: 'seo',
  type: 'group', // SEO settings
  fields: [
    { name: 'metaTitle', type: 'text' },
    { name: 'metaDescription', type: 'textarea' },
    { name: 'keywords', type: 'text' },
    { name: 'ogImage', type: 'text' },
  ],
},
```

#### **3. NEW Collection: Yachts**

**Purpose**: Create complete Yacht collection missing from Payload

**Collection Schema**:

```typescript
const Yachts: CollectionConfig = {
  slug: 'yachts',
  admin: {
    useAsTitle: 'name',
    defaultColumns: ['name', 'length', 'builder', 'launchYear', 'featured'],
    group: 'Content',
  },
  access: {
    create: isAdmin,
    read: () => true,
    update: isAdmin,
    delete: isAdmin,
  },
  fields: [
    // Basic Information
    { name: 'name', type: 'text', required: true }, // M/Y Eclipse
    { name: 'slug', type: 'text', required: true, unique: true },
    { name: 'description', type: 'richText', required: true },
    { name: 'image', type: 'text' }, // Main yacht image
    { name: 'images', type: 'array', fields: [{ name: 'image', type: 'text' }] }, // Gallery

    // Specifications
    { name: 'length', type: 'number' }, // meters
    { name: 'beam', type: 'number' },
    { name: 'draft', type: 'number' },
    { name: 'displacement', type: 'number' }, // tons
    { name: 'builder', type: 'text' }, // Shipyard
    { name: 'designer', type: 'text' }, // Naval architect
    { name: 'launchYear', type: 'number' },
    { name: 'deliveryYear', type: 'number' },
    { name: 'homePort', type: 'text' },
    { name: 'flag', type: 'text' },
    { name: 'classification', type: 'text' }, // Lloyd's Register, ABS, etc.

    // Performance
    { name: 'cruisingSpeed', type: 'number' }, // knots
    { name: 'maxSpeed', type: 'number' },
    { name: 'range', type: 'number' }, // nautical miles

    // Accommodation
    { name: 'guests', type: 'number' },
    { name: 'crew', type: 'number' },

    // Timeline
    {
      name: 'timeline',
      type: 'array',
      fields: [
        { name: 'date', type: 'date', required: true },
        { name: 'event', type: 'text', required: true },
        { name: 'description', type: 'textarea' },
        { name: 'category', type: 'select', options: ['launch', 'delivery', 'refit', 'milestone', 'service'], required: true },
        { name: 'location', type: 'text' },
        { name: 'images', type: 'array', fields: [{ name: 'image', type: 'text' }] },
      ],
    },

    // Supplier Map
    {
      name: 'supplierMap',
      type: 'array',
      fields: [
        { name: 'vendor', type: 'relationship', relationTo: 'vendors', required: true },
        { name: 'discipline', type: 'text', required: true }, // Electronics, Lighting, Security
        { name: 'systems', type: 'array', fields: [{ name: 'system', type: 'text' }], required: true },
        { name: 'role', type: 'select', options: ['primary', 'subcontractor', 'consultant'], required: true },
        { name: 'projectPhase', type: 'text' },
      ],
    },

    // Sustainability Score
    {
      name: 'sustainabilityScore',
      type: 'group',
      fields: [
        { name: 'co2Emissions', type: 'number' }, // kg equivalent
        { name: 'energyEfficiency', type: 'number' }, // kWh/nm
        { name: 'wasteManagement', type: 'select', options: ['excellent', 'good', 'fair', 'poor'] },
        { name: 'waterConservation', type: 'select', options: ['excellent', 'good', 'fair', 'poor'] },
        { name: 'materialSustainability', type: 'select', options: ['excellent', 'good', 'fair', 'poor'] },
        { name: 'overallScore', type: 'number' }, // 1-100
        { name: 'certifications', type: 'array', fields: [{ name: 'certification', type: 'text' }] },
      ],
    },

    // Customizations
    {
      name: 'customizations',
      type: 'array',
      fields: [
        { name: 'category', type: 'text', required: true },
        { name: 'description', type: 'textarea', required: true },
        { name: 'vendor', type: 'text' },
        { name: 'images', type: 'array', fields: [{ name: 'image', type: 'text' }] },
        { name: 'cost', type: 'text' },
        { name: 'completedDate', type: 'date' },
      ],
    },

    // Maintenance History
    {
      name: 'maintenanceHistory',
      type: 'array',
      fields: [
        { name: 'date', type: 'date', required: true },
        { name: 'type', type: 'select', options: ['routine', 'repair', 'upgrade', 'inspection'], required: true },
        { name: 'system', type: 'text', required: true },
        { name: 'description', type: 'textarea', required: true },
        { name: 'vendor', type: 'text' },
        { name: 'cost', type: 'text' },
        { name: 'nextService', type: 'date' },
        { name: 'status', type: 'select', options: ['completed', 'in-progress', 'scheduled'], required: true },
      ],
    },

    // Relationships
    { name: 'category', type: 'relationship', relationTo: 'categories' },
    { name: 'tags', type: 'relationship', relationTo: 'tags', hasMany: true },

    // Metadata
    { name: 'featured', type: 'checkbox', defaultValue: false },

    // SEO
    {
      name: 'seo',
      type: 'group',
      fields: [
        { name: 'metaTitle', type: 'text' },
        { name: 'metaDescription', type: 'textarea' },
        { name: 'keywords', type: 'text' },
        { name: 'ogImage', type: 'text' },
        { name: 'canonicalUrl', type: 'text' },
        { name: 'noIndex', type: 'checkbox' },
      ],
    },
  ],
  timestamps: true,
};
```

#### **4. NEW Collection: BlogPosts**

**Purpose**: Create blog posts collection missing from Payload

```typescript
const BlogPosts: CollectionConfig = {
  slug: 'blog-posts',
  admin: {
    useAsTitle: 'title',
    defaultColumns: ['title', 'author', 'publishedAt', 'published'],
    group: 'Content',
  },
  access: {
    create: isAdmin,
    read: () => true,
    update: isAdmin,
    delete: isAdmin,
  },
  fields: [
    { name: 'title', type: 'text', required: true },
    { name: 'slug', type: 'text', required: true, unique: true },
    { name: 'excerpt', type: 'textarea', required: true },
    { name: 'content', type: 'richText', editor: lexicalEditor({}), required: true },
    { name: 'author', type: 'relationship', relationTo: 'users' }, // Or text field
    { name: 'publishedAt', type: 'date' },
    { name: 'featuredImage', type: 'text' },
    { name: 'categories', type: 'relationship', relationTo: 'categories', hasMany: true },
    { name: 'tags', type: 'relationship', relationTo: 'tags', hasMany: true },
    { name: 'published', type: 'checkbox', defaultValue: false },
    { name: 'readTime', type: 'text' }, // "5 min read"
    {
      name: 'seo',
      type: 'group',
      fields: [
        { name: 'metaTitle', type: 'text' },
        { name: 'metaDescription', type: 'textarea' },
        { name: 'keywords', type: 'text' },
        { name: 'ogImage', type: 'text' },
      ],
    },
  ],
  timestamps: true,
};
```

#### **5. NEW Collection: TeamMembers**

```typescript
const TeamMembers: CollectionConfig = {
  slug: 'team-members',
  admin: {
    useAsTitle: 'name',
    defaultColumns: ['name', 'role', 'order'],
    group: 'Content',
  },
  access: {
    create: isAdmin,
    read: () => true,
    update: isAdmin,
    delete: isAdmin,
  },
  fields: [
    { name: 'name', type: 'text', required: true },
    { name: 'role', type: 'text', required: true },
    { name: 'bio', type: 'richText', editor: lexicalEditor({}) },
    { name: 'image', type: 'text' },
    { name: 'email', type: 'email' },
    { name: 'linkedin', type: 'text' },
    { name: 'order', type: 'number', defaultValue: 999 },
  ],
  timestamps: true,
};
```

#### **6. NEW Collection: CompanyInfo**

```typescript
const CompanyInfo: CollectionConfig = {
  slug: 'company-info',
  admin: {
    useAsTitle: 'name',
    group: 'Settings',
  },
  access: {
    create: isAdmin,
    read: () => true,
    update: isAdmin,
    delete: () => false, // Prevent deletion
  },
  fields: [
    { name: 'name', type: 'text', required: true },
    { name: 'tagline', type: 'text' },
    { name: 'description', type: 'richText', editor: lexicalEditor({}) },
    { name: 'founded', type: 'number' },
    { name: 'location', type: 'text' },
    { name: 'address', type: 'textarea' },
    { name: 'phone', type: 'text' },
    { name: 'email', type: 'email', required: true },
    { name: 'story', type: 'richText', editor: lexicalEditor({}) },
    { name: 'logo', type: 'text' },
    {
      name: 'socialMedia',
      type: 'group',
      fields: [
        { name: 'facebook', type: 'text' },
        { name: 'twitter', type: 'text' },
        { name: 'linkedin', type: 'text' },
        { name: 'instagram', type: 'text' },
        { name: 'youtube', type: 'text' },
      ],
    },
    {
      name: 'seo',
      type: 'group',
      fields: [
        { name: 'metaTitle', type: 'text' },
        { name: 'metaDescription', type: 'textarea' },
        { name: 'keywords', type: 'text' },
        { name: 'ogImage', type: 'text' },
      ],
    },
  ],
  timestamps: true,
};
```

#### **7. NEW Collection: Categories**

```typescript
const Categories: CollectionConfig = {
  slug: 'categories',
  admin: {
    useAsTitle: 'name',
    defaultColumns: ['name', 'slug', 'order'],
    group: 'Taxonomy',
  },
  access: {
    create: isAdmin,
    read: () => true,
    update: isAdmin,
    delete: isAdmin,
  },
  fields: [
    { name: 'name', type: 'text', required: true },
    { name: 'slug', type: 'text', required: true, unique: true },
    { name: 'description', type: 'textarea' },
    { name: 'icon', type: 'text' }, // Lucide icon name or URL
    { name: 'color', type: 'text' }, // Hex color code
    { name: 'order', type: 'number' },
  ],
  timestamps: true,
};
```

#### **8. NEW Collection: Tags**

```typescript
const Tags: CollectionConfig = {
  slug: 'tags',
  admin: {
    useAsTitle: 'name',
    defaultColumns: ['name', 'slug', 'usageCount'],
    group: 'Taxonomy',
  },
  access: {
    create: isAdmin,
    read: () => true,
    update: isAdmin,
    delete: isAdmin,
  },
  fields: [
    { name: 'name', type: 'text', required: true },
    { name: 'slug', type: 'text', required: true, unique: true },
    { name: 'description', type: 'textarea' },
    { name: 'color', type: 'text' },
    { name: 'usageCount', type: 'number', defaultValue: 0 },
  ],
  timestamps: true,
};
```

### Database Migration Scripts

#### **Migration Strategy**

**Phase 1: Schema Migration**
1. Update existing Payload collections (Vendors, Products) with all missing fields
2. Create new Payload collections (Yachts, BlogPosts, TeamMembers, CompanyInfo, Categories, Tags)
3. Run Payload migrations to update database schema

**Phase 2: Data Migration**
1. Create migration scripts in `scripts/migrate-tinacms-to-payload/`
2. Read all markdown files from content/ directories
3. Parse frontmatter and body content
4. Transform to Payload format with proper field mapping
5. Insert into Payload database via API
6. Validate data integrity and relationships

**Migration Script Structure**:

```typescript
// scripts/migrate-tinacms-to-payload/index.ts
import { getPayload } from 'payload';
import config from '@/payload.config';
import fs from 'fs';
import path from 'path';
import matter from 'gray-matter';

async function migrateContent() {
  const payload = await getPayload({ config });

  // Phase 1: Migrate Categories (no dependencies)
  await migrateCategories(payload);

  // Phase 2: Migrate Tags (no dependencies)
  await migrateTags(payload);

  // Phase 3: Migrate Vendors (depends on Categories, Tags)
  await migrateVendors(payload);

  // Phase 4: Migrate Products (depends on Vendors, Categories, Tags)
  await migrateProducts(payload);

  // Phase 5: Migrate Yachts (depends on Vendors, Categories, Tags)
  await migrateYachts(payload);

  // Phase 6: Migrate Blog Posts (depends on Categories, Tags)
  await migrateBlogPosts(payload);

  // Phase 7: Migrate Team Members (no dependencies)
  await migrateTeamMembers(payload);

  // Phase 8: Migrate Company Info (no dependencies)
  await migrateCompanyInfo(payload);

  console.log('✅ All content migrated successfully');
}

async function migrateVendors(payload: any) {
  const vendorsDir = path.join(process.cwd(), 'content/vendors');
  const files = fs.readdirSync(vendorsDir).filter(f => f.endsWith('.md'));

  for (const file of files) {
    const filePath = path.join(vendorsDir, file);
    const fileContent = fs.readFileSync(filePath, 'utf-8');
    const { data, content } = matter(fileContent);

    // Transform TinaCMS data to Payload format
    const vendorData = {
      companyName: data.name,
      slug: data.slug,
      description: content || data.description,
      logo: transformMediaPath(data.logo),
      image: transformMediaPath(data.image),
      website: data.website,
      founded: data.founded,
      location: data.location,
      featured: data.featured || false,
      partner: data.partner !== false, // Default true for backward compat
      published: true, // Existing content is published

      // Enhanced fields
      services: data.services || [],
      statistics: data.statistics || [],
      achievements: data.achievements || [],
      certifications: data.certifications || [],
      awards: data.awards || [],
      socialProof: data.socialProof || {},
      videoIntroduction: data.videoIntroduction || {},
      caseStudies: data.caseStudies || [],
      innovationHighlights: data.innovationHighlights || [],
      teamMembers: data.teamMembers || [],
      yachtProjects: data.yachtProjects || [],
      seo: data.seo || {},

      // Relationships (resolve after categories/tags migrated)
      // category: await resolveCategoryId(data.category),
      // tags: await resolveTagIds(data.tags),
    };

    await payload.create({
      collection: 'vendors',
      data: vendorData,
    });

    console.log(`✅ Migrated vendor: ${vendorData.companyName}`);
  }
}

// Similar functions for other collections...
```

---

## Frontend Implementation

### Complete Data Service Replacement

#### **Current State**
- Application uses `TinaCMSDataService` (`lib/tinacms-data-service.ts`)
- Pages import and use `tinaCMSDataService` singleton
- Data fetched from markdown files via TinaCMS client

#### **Target State**
- Application uses `PayloadCMSDataService` exclusively (`lib/payload-cms-data-service.ts`)
- All pages updated to import `payloadCMSDataService`
- Data fetched from Payload REST API
- TinaCMS service deprecated (kept for reference)

#### **PayloadCMSDataService Enhancement**

**Purpose**: Ensure PayloadCMSDataService has complete feature parity with TinaCMSDataService

**Current PayloadCMSDataService**: Basic implementation exists with vendor/product/blog/team methods

**Required Enhancements**:

1. **Add Yacht Methods**:
```typescript
async getAllYachts(): Promise<Yacht[]>
async getYachtBySlug(slug: string): Promise<Yacht | null>
async getYachtById(id: string): Promise<Yacht | null>
async getFeaturedYachts(): Promise<Yacht[]>
async getYachtsByCategory(category: string): Promise<Yacht[]>
async getYachtSlugs(): Promise<string[]>
```

2. **Add Category Methods**:
```typescript
async getCategories(): Promise<Category[]>
async getCategoryBySlug(slug: string): Promise<Category | null>
```

3. **Add Tag Methods**:
```typescript
async getTags(): Promise<Tag[]>
async getTagBySlug(slug: string): Promise<Tag | null>
```

4. **Add Company Info Methods**:
```typescript
async getCompanyInfo(): Promise<CompanyInfo>
```

5. **Enhanced Transform Methods** for all new fields in vendors/products

### Frontend Page Updates

**Files to Update**:

1. **Vendor Pages**:
   - `app/vendors/page.tsx` - List all vendors from Payload
   - `app/vendors/[slug]/page.tsx` - Vendor detail from Payload

2. **Product Pages**:
   - `app/products/page.tsx` - List all products from Payload
   - `app/products/[slug]/page.tsx` - Product detail from Payload

3. **Yacht Pages**:
   - `app/yachts/page.tsx` - List all yachts from Payload
   - `app/yachts/[slug]/page.tsx` - Yacht detail from Payload

4. **Blog Pages**:
   - `app/blog/page.tsx` - List blog posts from Payload
   - `app/blog/[slug]/page.tsx` - Blog post detail from Payload

5. **Team Pages**:
   - `app/team/page.tsx` - Team members from Payload

6. **Company Pages**:
   - `app/about/page.tsx` - Company info from Payload

7. **Homepage**:
   - `app/page.tsx` - Featured content from Payload

**Update Pattern** (same for all pages):

```typescript
// OLD (TinaCMS)
import tinaCMSDataService from '@/lib/tinacms-data-service';
const vendors = await tinaCMSDataService.getAllVendors();

// NEW (Payload)
import payloadCMSDataService from '@/lib/payload-cms-data-service';
const vendors = await payloadCMSDataService.getAllVendors();
```

### Component Updates

**Components using data service**:
- All components currently using TinaCMS data structures should continue working (data shape maintained)
- No component changes required if PayloadCMSDataService transforms data correctly
- Verify all enhanced fields render properly (certifications, awards, case studies, etc.)

---

## Testing Strategy

### Data Migration Testing

1. **Pre-Migration Validation**:
   - Count all TinaCMS markdown files (vendors, products, yachts, blog posts, team, company info)
   - Validate all markdown files parse correctly
   - Document expected data counts

2. **Migration Validation**:
   - Verify record counts match (TinaCMS markdown count = Payload database count)
   - Validate all relationships resolved correctly (vendor ↔ products, categories ↔ content)
   - Check media paths transformed correctly
   - Verify rich text content preserved

3. **Post-Migration Testing**:
   - Browse all vendor profiles - verify all fields display
   - Browse all product pages - verify comparison metrics, reviews, visual demos
   - Browse yacht profiles - verify timeline, supplier map, maintenance history
   - Verify blog posts with rich content
   - Check team member profiles
   - Verify company info on about page

### Frontend Integration Testing

1. **Static Generation Testing**:
   - Run `npm run build` - verify all pages build successfully
   - Check build time (should be < 5 minutes)
   - Verify all dynamic routes generated correctly

2. **Page Functionality Testing**:
   - Test vendor list page - filtering, search, categories
   - Test product list page - filtering by vendor, category
   - Test vendor detail pages - all sections render (certifications, awards, case studies, team, projects)
   - Test product detail pages - images gallery, specifications, comparison metrics, reviews, visual demos
   - Test yacht profiles - timeline, supplier map, sustainability score, maintenance history
   - Test blog list and detail pages
   - Test team page
   - Test about/company page

3. **Performance Testing**:
   - Measure page load times
   - Verify caching working correctly (5-minute TTL)
   - Check API response times from Payload

### E2E Testing

Create Playwright tests for critical paths:
1. Homepage → Vendor list → Vendor detail with all enhanced sections
2. Homepage → Product list → Product detail with comparison/reviews/demos
3. Yacht profiles navigation and content display
4. Blog post navigation and content display

---

## Implementation Roadmap

### Phase 1: Backend Schema Migration (Days 1-2)

1. Update Vendors collection with all missing fields
2. Update Products collection with all missing fields
3. Create new collections (Yachts, BlogPosts, TeamMembers, CompanyInfo, Categories, Tags)
4. Run Payload migrations
5. Test Payload admin interface for all collections

### Phase 2: Data Migration Scripts (Days 3-4)

1. Create migration script structure
2. Implement parsers for each content type (vendors, products, yachts, blog, team, company)
3. Implement data transformers (TinaCMS → Payload format)
4. Implement relationship resolvers (categories, tags, vendors)
5. Create validation and rollback mechanisms
6. Run migration in test environment
7. Validate data integrity

### Phase 3: Frontend Data Service Enhancement (Day 5)

1. Add missing methods to PayloadCMSDataService (yachts, categories, tags, company info)
2. Enhance transform methods for all new vendor/product fields
3. Test all data service methods
4. Update TypeScript types if needed

### Phase 4: Frontend Page Migration (Days 6-7)

1. Update all pages to use PayloadCMSDataService instead of TinaCMSDataService
2. Verify all pages build and render correctly
3. Test enhanced content display (certifications, awards, case studies, metrics, reviews, demos)
4. Fix any component rendering issues

### Phase 5: Testing & Validation (Days 8-9)

1. Run full test suite
2. Manual QA of all pages
3. Performance testing
4. Build time validation
5. Fix any issues

### Phase 6: Production Migration (Day 10)

1. Backup production database
2. Run migration scripts in production
3. Deploy frontend changes
4. Verify production site
5. Monitor for issues

---

## Success Criteria

1. **Schema Completeness**: All 8+ Payload collections created with 100% TinaCMS field parity
2. **Data Migration Success**: All markdown content migrated with 0% data loss, all relationships intact
3. **Frontend Integration**: Application runs exclusively on Payload CMS with zero TinaCMS dependencies
4. **Build Performance**: Static site generation completes in < 5 minutes
5. **Feature Parity**: All existing features work identically with Payload data source
6. **Enhanced Features**: New fields render correctly (certifications, awards, case studies, comparison metrics, reviews, visual demos, yacht timelines, supplier maps, maintenance history)
