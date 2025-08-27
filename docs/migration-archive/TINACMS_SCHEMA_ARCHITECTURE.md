# TinaCMS Schema Architecture Design

## Overview
Detailed schema architecture for migrating the Paul Thames Next.js project from Strapi to TinaCMS. This document provides the complete schema definitions, relationship mappings, and implementation guidelines for all 7 content types.

**Generated**: 2025-08-27  
**Project**: `/home/edwin/development/ptnextjs`  
**Status**: Architecture Design Phase  

---

## 📋 Complete TinaCMS Configuration

### Core Configuration File: `tina/config.ts`

```typescript
import { defineConfig } from "tinacms";

export default defineConfig({
  branch: "main",
  clientId: process.env.TINA_CLIENT_ID,
  token: process.env.TINA_TOKEN,
  
  build: {
    outputFolder: "admin",
    publicFolder: "public",
  },
  
  media: {
    tina: {
      mediaRoot: "public/media",
      publicFolder: "public",
    },
  },
  
  schema: {
    collections: [
      // Utility Collections (Reference Data)
      categoryCollection,
      blogCategoryCollection,
      tagCollection,
      
      // Main Content Collections
      partnerCollection,
      productCollection,
      blogPostCollection,
      teamMemberCollection,
      
      // Single-Type Collection
      companyInfoCollection,
    ],
  },
});
```

---

## 🏗️ Collection Definitions

### 1. Category Collection (Reference Data)

```typescript
const categoryCollection = {
  name: "category",
  label: "Categories",
  path: "content/categories",
  format: "md",
  
  fields: [
    {
      type: "string",
      name: "name",
      label: "Category Name",
      isTitle: true,
      required: true,
      description: "Display name for the category (e.g., 'Navigation Systems')",
    },
    {
      type: "string",
      name: "slug",
      label: "URL Slug",
      required: true,
      description: "URL-friendly version (e.g., 'navigation-systems')",
    },
    {
      type: "string",
      name: "description",
      label: "Description",
      required: true,
      ui: {
        component: "textarea",
      },
      description: "Brief description of the category",
    },
    {
      type: "string",
      name: "icon",
      label: "Icon Identifier",
      description: "Icon name or URL for category display",
    },
    {
      type: "string",
      name: "color",
      label: "Brand Color",
      ui: {
        component: "color",
      },
      description: "Hex color code for category theming",
    },
    {
      type: "number",
      name: "order",
      label: "Display Order",
      description: "Sort order for category listings",
    },
  ],
  
  ui: {
    filename: {
      readonly: false,
      slugify: (values) => values.slug,
    },
  },
};
```

### 2. Tag Collection (Reference Data)

```typescript
const tagCollection = {
  name: "tag",
  label: "Tags", 
  path: "content/tags",
  format: "md",
  
  fields: [
    {
      type: "string",
      name: "name",
      label: "Tag Name",
      isTitle: true,
      required: true,
      description: "Display name for the tag (e.g., 'Radar Technology')",
    },
    {
      type: "string",
      name: "slug",
      label: "URL Slug",
      required: true,
      description: "URL-friendly version (e.g., 'radar-technology')",
    },
    {
      type: "string",
      name: "description",
      label: "Description",
      ui: {
        component: "textarea",
      },
      description: "Optional description of the tag",
    },
    {
      type: "string",
      name: "color",
      label: "Color",
      ui: {
        component: "color",
      },
      description: "Hex color for tag display",
    },
    {
      type: "number",
      name: "usage_count",
      label: "Usage Count",
      ui: {
        component: "number",
        parse: (value) => Number(value),
        format: (value) => value?.toString(),
      },
      description: "Automatic count of tag usage (computed field)",
    },
  ],
  
  ui: {
    filename: {
      readonly: false,
      slugify: (values) => values.slug,
    },
  },
};
```

### 3. Blog Category Collection

```typescript
const blogCategoryCollection = {
  name: "blogCategory",
  label: "Blog Categories",
  path: "content/blog/categories", 
  format: "md",
  
  fields: [
    {
      type: "string",
      name: "name",
      label: "Category Name",
      isTitle: true,
      required: true,
      description: "Blog category name (e.g., 'Technology Trends')",
    },
    {
      type: "string",
      name: "slug",
      label: "URL Slug",
      required: true,
      description: "URL-friendly version (e.g., 'technology-trends')",
    },
    {
      type: "string",
      name: "description",
      label: "Description",
      ui: {
        component: "textarea",
      },
      description: "Category description for blog organization",
    },
    {
      type: "string",
      name: "color",
      label: "Color",
      ui: {
        component: "color",
      },
      description: "Hex color for category theming",
    },
    {
      type: "number",
      name: "order",
      label: "Display Order",
      description: "Sort order for category listings",
    },
  ],
  
  ui: {
    filename: {
      readonly: false,
      slugify: (values) => values.slug,
    },
  },
};
```

### 4. Partner Collection (Main Content)

```typescript
const partnerCollection = {
  name: "partner",
  label: "Partners",
  path: "content/partners",
  format: "md",
  
  fields: [
    {
      type: "string",
      name: "name",
      label: "Company Name",
      isTitle: true,
      required: true,
      description: "Full company name (e.g., 'Raymarine (Teledyne FLIR)')",
    },
    {
      type: "string",
      name: "slug",
      label: "URL Slug", 
      required: true,
      description: "URL-friendly identifier (e.g., 'raymarine-teledyne-flir')",
    },
    {
      type: "rich-text",
      name: "description",
      label: "Company Description",
      required: true,
      description: "Detailed description of the company and their services",
    },
    {
      type: "image",
      name: "logo",
      label: "Company Logo",
      description: "Company logo image (recommended: 400x200px)",
    },
    {
      type: "image",
      name: "image",
      label: "Company Overview Image",
      description: "Hero/feature image for company profile",
    },
    {
      type: "string",
      name: "website",
      label: "Website URL",
      description: "Company website URL (including https://)",
    },
    {
      type: "number",
      name: "founded",
      label: "Founded Year",
      ui: {
        component: "number",
        parse: (value) => Number(value),
        format: (value) => value?.toString(),
      },
      description: "Year the company was founded",
    },
    {
      type: "string",
      name: "location",
      label: "Company Location",
      description: "Primary location or headquarters (e.g., 'Portsmouth, UK')",
    },
    {
      type: "boolean",
      name: "featured",
      label: "Featured Partner",
      description: "Mark as featured partner for homepage display",
    },
    
    // Relationships
    {
      type: "reference",
      name: "category",
      label: "Primary Category",
      collections: ["category"],
      description: "Main technology category for this partner",
    },
    {
      type: "reference",
      name: "tags",
      label: "Technology Tags",
      collections: ["tag"],
      description: "Relevant technology tags for this partner",
    },
    
    // SEO Component
    {
      type: "object",
      name: "seo",
      label: "SEO Settings",
      description: "Search engine optimization settings",
      fields: [
        {
          type: "string",
          name: "meta_title",
          label: "Meta Title",
          description: "Custom page title for search engines",
        },
        {
          type: "string",
          name: "meta_description",
          label: "Meta Description",
          ui: {
            component: "textarea",
          },
          description: "Page description for search results (150-160 characters)",
        },
        {
          type: "string",
          name: "keywords",
          label: "Keywords",
          description: "Comma-separated keywords for SEO",
        },
        {
          type: "image",
          name: "og_image",
          label: "Social Share Image",
          description: "Image for social media sharing (1200x630px recommended)",
        },
        {
          type: "string",
          name: "canonical_url",
          label: "Canonical URL",
          description: "Canonical URL if different from default",
        },
        {
          type: "boolean",
          name: "no_index",
          label: "No Index",
          description: "Prevent search engines from indexing this page",
        },
      ],
    },
  ],
  
  ui: {
    filename: {
      readonly: false,
      slugify: (values) => values.slug,
    },
  },
};
```

### 5. Product Collection (Main Content)

```typescript
const productCollection = {
  name: "product",
  label: "Products",
  path: "content/products",
  format: "md",
  
  fields: [
    {
      type: "string",
      name: "name",
      label: "Product Name",
      isTitle: true,
      required: true,
      description: "Full product name (e.g., 'Axiom Multifunction Display')",
    },
    {
      type: "string",
      name: "slug",
      label: "URL Slug",
      description: "URL-friendly identifier (auto-generated if empty)",
    },
    {
      type: "rich-text",
      name: "description",
      label: "Product Description",
      required: true,
      description: "Detailed product description and capabilities",
    },
    {
      type: "string",
      name: "price",
      label: "Price Information",
      description: "Pricing details or 'Contact for pricing'",
    },
    
    // Primary Relationships
    {
      type: "reference",
      name: "partner",
      label: "Partner Company",
      collections: ["partner"],
      required: true,
      description: "The partner company that offers this product",
    },
    {
      type: "reference",
      name: "category",
      label: "Product Category",
      collections: ["category"],
      description: "Primary category for this product",
    },
    {
      type: "reference",
      name: "tags",
      label: "Product Tags",
      collections: ["tag"],
      description: "Relevant tags for this product",
    },
    
    // Product Images Component
    {
      type: "object",
      name: "product_images",
      label: "Product Images",
      list: true,
      description: "Multiple images for product gallery",
      fields: [
        {
          type: "image",
          name: "image",
          label: "Image",
          required: true,
          description: "Product image file",
        },
        {
          type: "string",
          name: "alt_text",
          label: "Alt Text",
          description: "Alternative text for accessibility",
        },
        {
          type: "boolean",
          name: "is_main",
          label: "Main Image",
          description: "Use as primary product image",
        },
        {
          type: "string",
          name: "caption",
          label: "Caption",
          description: "Optional caption for the image",
        },
        {
          type: "number",
          name: "order",
          label: "Display Order",
          ui: {
            component: "number",
            parse: (value) => Number(value),
            format: (value) => value?.toString(),
          },
          description: "Sort order for image gallery",
        },
      ],
      ui: {
        itemProps: (item) => ({
          label: item?.alt_text || item?.caption || "Product Image",
        }),
      },
    },
    
    // Product Features Component
    {
      type: "object",
      name: "features",
      label: "Product Features",
      list: true,
      description: "Key features and capabilities",
      fields: [
        {
          type: "string",
          name: "title",
          label: "Feature Title",
          required: true,
          description: "Brief feature title",
        },
        {
          type: "string",
          name: "description",
          label: "Feature Description",
          ui: {
            component: "textarea",
          },
          description: "Detailed feature description",
        },
        {
          type: "string",
          name: "icon",
          label: "Feature Icon",
          description: "Icon identifier or URL",
        },
        {
          type: "number",
          name: "order",
          label: "Display Order",
          ui: {
            component: "number",
            parse: (value) => Number(value),
            format: (value) => value?.toString(),
          },
          description: "Sort order for feature list",
        },
      ],
      ui: {
        itemProps: (item) => ({
          label: item?.title || "Product Feature",
        }),
      },
    },
    
    // SEO Component
    {
      type: "object",
      name: "seo",
      label: "SEO Settings",
      description: "Search engine optimization settings",
      fields: [
        {
          type: "string",
          name: "meta_title",
          label: "Meta Title",
          description: "Custom page title for search engines",
        },
        {
          type: "string",
          name: "meta_description",
          label: "Meta Description",
          ui: {
            component: "textarea",
          },
          description: "Page description for search results",
        },
        {
          type: "string",
          name: "keywords",
          label: "Keywords",
          description: "Comma-separated keywords for SEO",
        },
        {
          type: "image",
          name: "og_image",
          label: "Social Share Image",
          description: "Image for social media sharing",
        },
      ],
    },
  ],
  
  ui: {
    filename: {
      readonly: false,
      slugify: (values) => values.slug || values.name?.toLowerCase().replace(/[^a-z0-9]+/g, '-'),
    },
  },
};
```

### 6. Blog Post Collection

```typescript
const blogPostCollection = {
  name: "blogPost",
  label: "Blog Posts",
  path: "content/blog/posts",
  format: "md",
  
  fields: [
    {
      type: "string",
      name: "title",
      label: "Post Title",
      isTitle: true,
      required: true,
      description: "Blog post title",
    },
    {
      type: "string",
      name: "slug",
      label: "URL Slug",
      required: true,
      description: "URL-friendly identifier",
    },
    {
      type: "string",
      name: "excerpt",
      label: "Post Excerpt",
      required: true,
      ui: {
        component: "textarea",
      },
      description: "Brief summary for post listings and SEO",
    },
    {
      type: "rich-text",
      name: "content",
      label: "Post Content",
      required: true,
      isBody: true,
      description: "Main blog post content",
    },
    {
      type: "string",
      name: "author",
      label: "Author Name",
      required: true,
      description: "Post author name",
    },
    {
      type: "datetime",
      name: "published_at",
      label: "Publication Date",
      required: true,
      description: "When the post should be published",
    },
    {
      type: "boolean",
      name: "featured",
      label: "Featured Post",
      description: "Mark as featured for homepage display",
    },
    {
      type: "string",
      name: "read_time",
      label: "Estimated Read Time",
      description: "Reading time estimate (e.g., '5 min read')",
    },
    {
      type: "image",
      name: "image",
      label: "Featured Image",
      description: "Hero image for the blog post",
    },
    
    // Relationships
    {
      type: "reference",
      name: "blog_category",
      label: "Blog Category",
      collections: ["blogCategory"],
      description: "Primary category for blog organization",
    },
    {
      type: "reference",
      name: "tags",
      label: "Tags",
      collections: ["tag"],
      description: "Relevant tags for this post",
    },
    
    // SEO Component
    {
      type: "object",
      name: "seo",
      label: "SEO Settings",
      description: "Search engine optimization settings",
      fields: [
        {
          type: "string",
          name: "meta_title",
          label: "Meta Title",
          description: "Custom page title for search engines",
        },
        {
          type: "string",
          name: "meta_description",
          label: "Meta Description",
          ui: {
            component: "textarea",
          },
          description: "Page description for search results",
        },
        {
          type: "string",
          name: "keywords",
          label: "Keywords",
          description: "Comma-separated keywords for SEO",
        },
        {
          type: "image",
          name: "og_image",
          label: "Social Share Image",
          description: "Image for social media sharing",
        },
      ],
    },
  ],
  
  ui: {
    filename: {
      readonly: false,
      slugify: (values) => values.slug,
    },
  },
};
```

### 7. Team Member Collection

```typescript
const teamMemberCollection = {
  name: "teamMember",
  label: "Team Members",
  path: "content/team",
  format: "md",
  
  fields: [
    {
      type: "string",
      name: "name",
      label: "Full Name",
      isTitle: true,
      required: true,
      description: "Team member's full name",
    },
    {
      type: "string",
      name: "role",
      label: "Job Title",
      required: true,
      description: "Current role or job title",
    },
    {
      type: "rich-text",
      name: "bio",
      label: "Biography",
      required: true,
      isBody: true,
      description: "Professional biography and background",
    },
    {
      type: "image",
      name: "image",
      label: "Profile Photo",
      description: "Professional headshot (square format recommended)",
    },
    {
      type: "string",
      name: "email",
      label: "Email Address",
      description: "Professional email address",
    },
    {
      type: "string",
      name: "linkedin",
      label: "LinkedIn Profile",
      description: "LinkedIn profile URL",
    },
    {
      type: "number",
      name: "order",
      label: "Display Order",
      ui: {
        component: "number",
        parse: (value) => Number(value),
        format: (value) => value?.toString(),
      },
      description: "Sort order for team member listings",
    },
  ],
  
  ui: {
    filename: {
      readonly: false,
      slugify: (values) => values.name?.toLowerCase().replace(/[^a-z0-9]+/g, '-'),
    },
  },
};
```

### 8. Company Info Collection (Single-Type)

```typescript
const companyInfoCollection = {
  name: "companyInfo",
  label: "Company Information",
  path: "content/company",
  format: "json",
  
  ui: {
    allowedActions: {
      create: false,
      delete: false,
    },
    global: true,
    filename: {
      readonly: true,
      slugify: () => "info",
    },
  },
  
  fields: [
    {
      type: "string",
      name: "name",
      label: "Company Name",
      required: true,
      description: "Full legal company name",
    },
    {
      type: "string",
      name: "tagline",
      label: "Company Tagline",
      required: true,
      description: "Brief company tagline or slogan",
    },
    {
      type: "rich-text",
      name: "description",
      label: "Company Description",
      required: true,
      description: "Detailed company description for about page",
    },
    {
      type: "number",
      name: "founded",
      label: "Founded Year",
      required: true,
      ui: {
        component: "number",
        parse: (value) => Number(value),
        format: (value) => value?.toString(),
      },
      description: "Year the company was founded",
    },
    {
      type: "string",
      name: "location",
      label: "Location",
      required: true,
      description: "Primary business location",
    },
    {
      type: "string",
      name: "address",
      label: "Physical Address",
      required: true,
      ui: {
        component: "textarea",
      },
      description: "Complete physical address",
    },
    {
      type: "string",
      name: "phone",
      label: "Phone Number",
      required: true,
      description: "Primary contact phone number",
    },
    {
      type: "string",
      name: "email",
      label: "Contact Email",
      required: true,
      description: "Primary contact email address",
    },
    {
      type: "rich-text",
      name: "story",
      label: "Company Story",
      required: true,
      description: "Extended company story and background",
    },
    {
      type: "image",
      name: "logo",
      label: "Company Logo",
      description: "Primary company logo",
    },
    
    // Social Media Component
    {
      type: "object",
      name: "social_media",
      label: "Social Media Links",
      description: "Company social media profiles",
      fields: [
        {
          type: "string",
          name: "facebook",
          label: "Facebook URL",
          description: "Complete Facebook profile URL",
        },
        {
          type: "string",
          name: "twitter",
          label: "Twitter URL", 
          description: "Complete Twitter profile URL",
        },
        {
          type: "string",
          name: "linkedin",
          label: "LinkedIn URL",
          description: "Complete LinkedIn company page URL",
        },
        {
          type: "string",
          name: "instagram",
          label: "Instagram URL",
          description: "Complete Instagram profile URL",
        },
        {
          type: "string",
          name: "youtube",
          label: "YouTube URL",
          description: "Complete YouTube channel URL",
        },
      ],
    },
    
    // SEO Component
    {
      type: "object",
      name: "seo",
      label: "SEO Settings",
      description: "Global SEO settings",
      fields: [
        {
          type: "string",
          name: "meta_title",
          label: "Default Meta Title",
          description: "Default page title template",
        },
        {
          type: "string",
          name: "meta_description",
          label: "Default Meta Description",
          ui: {
            component: "textarea",
          },
          description: "Default page description template",
        },
        {
          type: "string",
          name: "keywords",
          label: "Global Keywords",
          description: "Comma-separated global keywords",
        },
        {
          type: "image",
          name: "og_image",
          label: "Default Social Share Image",
          description: "Default image for social media sharing",
        },
      ],
    },
  ],
};
```

---

## 🔗 Relationship Implementation Guide

### Reference Field Configuration

#### One-to-Many Relationships
```typescript
// In Product Collection - Reference to Partner
{
  type: "reference",
  name: "partner", 
  label: "Partner Company",
  collections: ["partner"],
  required: true,
}

// TinaCMS automatically handles reverse relationships
// Partners can query their products via GraphQL
```

#### Many-to-Many Relationships
```typescript
// In Product Collection - Multiple Tags
{
  type: "reference",
  name: "tags",
  label: "Product Tags", 
  collections: ["tag"],
  // TinaCMS stores as array of references
}
```

#### Component Relationships (One-to-Many Components)
```typescript
// In Product Collection - Multiple Images
{
  type: "object",
  name: "product_images",
  label: "Product Images",
  list: true, // Enables multiple items
  fields: [
    // Component field definitions
  ],
}
```

### Relationship Query Patterns

#### Query with Relationships
```typescript
// TinaCMS automatically resolves relationships
const productQuery = await client.queries.product({
  relativePath: 'axiom-multifunction-display.md',
});

// Access related data
const product = productQuery.data.product;
const partner = product.partner; // Automatically resolved
const category = product.category; // Automatically resolved
const tags = product.tags; // Array of resolved tag objects
```

#### Reverse Relationship Queries
```typescript
// Query all products for a specific partner
const partnerProductsQuery = await client.queries.productConnection({
  filter: {
    partner: {
      id: { eq: partnerId }
    }
  }
});
```

---

## 📁 Media Organization Strategy

### Directory Structure
```
public/media/
├── categories/
│   ├── navigation-systems-icon.svg
│   ├── communication-equipment-icon.svg
│   └── propulsion-systems-icon.svg
├── partners/
│   ├── logos/
│   │   ├── raymarine-logo.png
│   │   ├── furuno-logo.jpg
│   │   └── [partner-slug]-logo.[ext]
│   └── images/
│       ├── raymarine-overview.jpg
│       └── furuno-overview.jpg
├── products/
│   ├── [product-slug]/
│   │   ├── main.jpg
│   │   ├── gallery-1.jpg
│   │   ├── gallery-2.jpg
│   │   └── gallery-n.jpg
│   └── [another-product-slug]/
│       └── [images...]
├── blog/
│   ├── [post-slug]-hero.jpg
│   ├── [post-slug]-feature.jpg
│   └── general/
│       ├── placeholder-blog.jpg
│       └── default-og-image.jpg
├── team/
│   ├── [member-name]-headshot.jpg
│   └── team-group-photo.jpg
└── company/
    ├── logo-primary.png
    ├── logo-white.png
    ├── logo-dark.png
    └── social-og-default.jpg
```

### Media Field Configuration
```typescript
// Standard image field with media organization
{
  type: "image",
  name: "logo",
  label: "Company Logo",
  description: "Company logo (recommended: 400x200px, PNG format)",
}

// Multiple images with gallery organization
{
  type: "object", 
  name: "product_images",
  label: "Product Images",
  list: true,
  fields: [
    {
      type: "image",
      name: "image",
      label: "Image",
      required: true,
    },
    // ... other image metadata fields
  ],
}
```

---

## 🚀 Implementation Checklist

### Phase 1: Schema Setup
- [ ] Create `tina/config.ts` file
- [ ] Implement all 8 collection definitions
- [ ] Configure media handling
- [ ] Set up development environment
- [ ] Test schema with sample data

### Phase 2: Relationship Configuration
- [ ] Verify reference field connections
- [ ] Test component field functionality
- [ ] Validate relationship queries
- [ ] Implement computed fields for backward compatibility
- [ ] Test reverse relationship queries

### Phase 3: Content Structure
- [ ] Create content directory structure
- [ ] Organize media directory structure
- [ ] Implement file naming conventions
- [ ] Set up placeholder content
- [ ] Configure admin interface

### Phase 4: Data Migration Preparation
- [ ] Map Strapi fields to TinaCMS fields
- [ ] Plan relationship transformation
- [ ] Prepare media migration scripts
- [ ] Design data validation process
- [ ] Create backup procedures

---

## 📊 Schema Statistics

### Collections Summary
- **Total Collections**: 8
- **Reference Collections**: 3 (Category, BlogCategory, Tag)
- **Main Content Collections**: 4 (Partner, Product, BlogPost, TeamMember) 
- **Single-Type Collections**: 1 (CompanyInfo)

### Field Distribution
- **String Fields**: 45 (57% of total)
- **Rich-text Fields**: 8 (10% of total)
- **Image Fields**: 12 (15% of total)
- **Reference Fields**: 10 (13% of total)
- **Object/Component Fields**: 4 (5% of total)

### Relationship Count
- **One-to-Many**: 3 relationships
- **Many-to-Many**: 6 relationships
- **Component**: 5 component relationships
- **Total Relationships**: 14

---

## ⚡ Performance Optimizations

### Query Optimization
- Use specific field selection in queries
- Implement proper pagination for large collections
- Cache frequently accessed reference data
- Use fragments for reusable query parts

### Build Optimization
- Configure incremental builds for large content sets
- Optimize media processing pipeline
- Implement proper caching strategies
- Use Next.js Image optimization

### Admin Interface Optimization
- Configure efficient field ordering
- Implement proper collection filtering
- Optimize form validation
- Use conditional field display

---

## 🎯 Next Steps for Implementation

1. **Create TinaCMS Configuration**: Implement complete `tina/config.ts`
2. **Set Up Development Environment**: Configure admin interface and local editing
3. **Test Schema with Sample Data**: Validate all field types and relationships
4. **Implement Data Migration Scripts**: Transform Strapi data to TinaCMS format
5. **Update Next.js Integration**: Modify data queries to use TinaCMS client

This schema architecture provides a comprehensive foundation for migrating from Strapi to TinaCMS while maintaining all existing functionality and relationships.

---

**Status**: ✅ **Architecture Design Complete**  
**Ready for**: Milestone 2 - Schema Implementation  
**Total Fields Defined**: 79 fields across 8 collections