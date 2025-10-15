# Database Schema

This is the database schema implementation for the spec detailed in @.agent-os/specs/2025-10-14-complete-tinacms-payload-migration/spec.md

## Overview

This migration transforms the content management system from file-based (TinaCMS markdown) to database-backed (Payload CMS with PostgreSQL/SQLite). The database schema supports all TinaCMS collections with enhanced relational capabilities.

## Database Technology

**Development**: SQLite (file-based, zero-configuration)
**Production**: PostgreSQL 17+ (scalable, production-ready)
**Migration Strategy**: Payload CMS migration functions ensure portability between SQLite and PostgreSQL

## Schema Changes

### New Tables (Created by Payload CMS)

#### 1. `yachts` Table
**Purpose**: Store yacht profiles with comprehensive specifications

```sql
CREATE TABLE yachts (
  id SERIAL PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  slug VARCHAR(255) NOT NULL UNIQUE,
  description TEXT,
  image TEXT,
  images JSONB, -- Array of image URLs

  -- Specifications
  length DECIMAL(10,2), -- meters
  beam DECIMAL(10,2),
  draft DECIMAL(10,2),
  displacement DECIMAL(10,2), -- tons
  builder VARCHAR(255),
  designer VARCHAR(255),
  launch_year INTEGER,
  delivery_year INTEGER,
  home_port VARCHAR(255),
  flag VARCHAR(255),
  classification VARCHAR(255),

  -- Performance
  cruising_speed DECIMAL(10,2), -- knots
  max_speed DECIMAL(10,2),
  range DECIMAL(10,2), -- nautical miles

  -- Accommodation
  guests INTEGER,
  crew INTEGER,

  -- Complex nested data (stored as JSONB)
  timeline JSONB, -- Array of timeline events
  supplier_map JSONB, -- Array of vendor relationships
  sustainability_score JSONB, -- Sustainability metrics object
  customizations JSONB, -- Array of customizations
  maintenance_history JSONB, -- Array of maintenance records

  -- Relationships (foreign keys)
  category_id INTEGER REFERENCES categories(id),

  -- Metadata
  featured BOOLEAN DEFAULT FALSE,

  -- SEO
  seo JSONB,

  -- Timestamps
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_yachts_slug ON yachts(slug);
CREATE INDEX idx_yachts_featured ON yachts(featured);
CREATE INDEX idx_yachts_category ON yachts(category_id);
```

#### 2. `blog_posts` Table
**Purpose**: Store blog posts with rich content

```sql
CREATE TABLE blog_posts (
  id SERIAL PRIMARY KEY,
  title VARCHAR(255) NOT NULL,
  slug VARCHAR(255) NOT NULL UNIQUE,
  excerpt TEXT,
  content JSONB, -- Lexical editor rich text
  author_id INTEGER REFERENCES users(id),
  published_at TIMESTAMP,
  featured_image TEXT,
  published BOOLEAN DEFAULT FALSE,
  read_time VARCHAR(50),

  -- SEO
  seo JSONB,

  -- Timestamps
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_blog_posts_slug ON blog_posts(slug);
CREATE INDEX idx_blog_posts_published ON blog_posts(published);
CREATE INDEX idx_blog_posts_published_at ON blog_posts(published_at);
```

#### 3. `blog_posts_categories` Table (Many-to-Many)
```sql
CREATE TABLE blog_posts_categories (
  id SERIAL PRIMARY KEY,
  blog_post_id INTEGER REFERENCES blog_posts(id) ON DELETE CASCADE,
  category_id INTEGER REFERENCES categories(id) ON DELETE CASCADE,
  UNIQUE(blog_post_id, category_id)
);
```

#### 4. `blog_posts_tags` Table (Many-to-Many)
```sql
CREATE TABLE blog_posts_tags (
  id SERIAL PRIMARY KEY,
  blog_post_id INTEGER REFERENCES blog_posts(id) ON DELETE CASCADE,
  tag_id INTEGER REFERENCES tags(id) ON DELETE CASCADE,
  UNIQUE(blog_post_id, tag_id)
);
```

#### 5. `team_members` Table
**Purpose**: Store team member profiles

```sql
CREATE TABLE team_members (
  id SERIAL PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  role VARCHAR(255) NOT NULL,
  bio JSONB, -- Rich text
  image TEXT,
  email VARCHAR(255),
  linkedin TEXT,
  "order" INTEGER DEFAULT 999,

  -- Timestamps
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_team_members_order ON team_members("order");
```

#### 6. `company_info` Table (Singleton)
**Purpose**: Store global company information

```sql
CREATE TABLE company_info (
  id SERIAL PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  tagline TEXT,
  description JSONB, -- Rich text
  founded INTEGER,
  location VARCHAR(255),
  address TEXT,
  phone VARCHAR(50),
  email VARCHAR(255) NOT NULL,
  story JSONB, -- Rich text
  logo TEXT,

  -- Complex data
  social_media JSONB, -- { facebook, twitter, linkedin, instagram, youtube }
  seo JSONB,

  -- Timestamps
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Only one company info record should exist
CREATE UNIQUE INDEX idx_company_info_singleton ON company_info((id = 1));
```

#### 7. `categories` Table (Enhanced)
**Purpose**: Product and blog categorization

```sql
CREATE TABLE categories (
  id SERIAL PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  slug VARCHAR(255) NOT NULL UNIQUE,
  description TEXT,
  icon TEXT, -- Lucide icon name or URL
  color VARCHAR(50), -- Hex color code
  "order" INTEGER,

  -- Timestamps
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_categories_slug ON categories(slug);
CREATE INDEX idx_categories_order ON categories("order");
```

#### 8. `tags` Table (NEW)
**Purpose**: Flexible tagging system

```sql
CREATE TABLE tags (
  id SERIAL PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  slug VARCHAR(255) NOT NULL UNIQUE,
  description TEXT,
  color VARCHAR(50),
  usage_count INTEGER DEFAULT 0,

  -- Timestamps
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_tags_slug ON tags(slug);
CREATE INDEX idx_tags_usage_count ON tags(usage_count);
```

#### 9. `vendors_tags` Table (Many-to-Many)
```sql
CREATE TABLE vendors_tags (
  id SERIAL PRIMARY KEY,
  vendor_id INTEGER REFERENCES vendors(id) ON DELETE CASCADE,
  tag_id INTEGER REFERENCES tags(id) ON DELETE CASCADE,
  UNIQUE(vendor_id, tag_id)
);
```

#### 10. `products_tags` Table (Many-to-Many)
```sql
CREATE TABLE products_tags (
  id SERIAL PRIMARY KEY,
  product_id INTEGER REFERENCES products(id) ON DELETE CASCADE,
  tag_id INTEGER REFERENCES tags(id) ON DELETE CASCADE,
  UNIQUE(product_id, tag_id)
);
```

#### 11. `yachts_tags` Table (Many-to-Many)
```sql
CREATE TABLE yachts_tags (
  id SERIAL PRIMARY KEY,
  yacht_id INTEGER REFERENCES yachts(id) ON DELETE CASCADE,
  tag_id INTEGER REFERENCES tags(id) ON DELETE CASCADE,
  UNIQUE(yacht_id, tag_id)
);
```

### Modified Tables (Enhanced Existing)

#### 1. `vendors` Table - Enhanced Fields

**Add columns**:

```sql
ALTER TABLE vendors
  ADD COLUMN image TEXT,
  ADD COLUMN founded INTEGER,
  ADD COLUMN location VARCHAR(255),
  ADD COLUMN partner BOOLEAN DEFAULT TRUE,
  ADD COLUMN services JSONB, -- Array of services
  ADD COLUMN statistics JSONB, -- Array of statistics
  ADD COLUMN achievements JSONB, -- Array of achievements
  ADD COLUMN category_id INTEGER REFERENCES categories(id),
  ADD COLUMN certifications JSONB, -- Enhanced certifications array
  ADD COLUMN awards JSONB, -- Array of awards
  ADD COLUMN social_proof JSONB, -- Social proof metrics object
  ADD COLUMN video_introduction JSONB, -- Video introduction object
  ADD COLUMN case_studies JSONB, -- Array of case studies
  ADD COLUMN innovation_highlights JSONB, -- Array of innovations
  ADD COLUMN team_members JSONB, -- Array of team members
  ADD COLUMN yacht_projects JSONB, -- Array of yacht projects
  ADD COLUMN seo JSONB; -- SEO settings object

CREATE INDEX idx_vendors_category ON vendors(category_id);
CREATE INDEX idx_vendors_partner ON vendors(partner);
```

#### 2. `products` Table - Enhanced Fields

**Add columns**:

```sql
ALTER TABLE products
  ADD COLUMN price TEXT,
  ADD COLUMN features JSONB, -- Array of features
  ADD COLUMN benefits JSONB, -- Array of benefits
  ADD COLUMN services JSONB, -- Array of services
  ADD COLUMN pricing JSONB, -- Pricing configuration object
  ADD COLUMN action_buttons JSONB, -- Array of action buttons
  ADD COLUMN badges JSONB, -- Array of badges
  ADD COLUMN comparison_metrics JSONB, -- Array of metrics
  ADD COLUMN integration_compatibility JSONB, -- Integration compatibility object
  ADD COLUMN owner_reviews JSONB, -- Array of reviews
  ADD COLUMN visual_demo JSONB, -- Visual demo object (360°, 3D, video)
  ADD COLUMN seo JSONB; -- SEO settings object
```

## JSONB Field Structures

### vendors.certifications
```json
[
  {
    "name": "ISO 9001:2015",
    "issuer": "Lloyd's Register",
    "year": 2020,
    "expiryDate": "2025-12-31",
    "certificateUrl": "https://...",
    "logo": "/media/cert-logo.png"
  }
]
```

### vendors.case_studies
```json
[
  {
    "title": "Luxury Yacht Integration Project",
    "slug": "luxury-yacht-integration",
    "client": "M/Y Eclipse",
    "challenge": "Complex AV integration...",
    "solution": "Implemented custom...",
    "results": "Achieved 99.9% uptime...",
    "images": ["/media/case1.jpg"],
    "technologies": ["Crestron", "Lutron"]
  }
]
```

### products.comparison_metrics
```json
[
  {
    "metricId": "power-consumption",
    "name": "Power Consumption",
    "value": 150,
    "unit": "W",
    "category": "efficiency",
    "weight": 0.8,
    "toleranceMin": 100,
    "toleranceMax": 200,
    "benchmarkValue": 180
  }
]
```

### products.visual_demo
```json
{
  "type": "360-image",
  "title": "Product 360° View",
  "description": "Interactive 360° product demonstration",
  "imageUrl": "/media/product-360.jpg",
  "hotspots": [
    {
      "positionX": 100,
      "positionY": 200,
      "title": "Feature Highlight",
      "description": "Premium materials",
      "action": "highlight"
    }
  ]
}
```

### yachts.timeline
```json
[
  {
    "date": "2020-03-15",
    "event": "Keel Laying",
    "description": "Construction began...",
    "category": "milestone",
    "location": "Hamburg, Germany",
    "images": ["/media/keel-laying.jpg"]
  }
]
```

### yachts.supplier_map
```json
[
  {
    "vendor": "<vendor_id>",
    "discipline": "Electronics",
    "systems": ["Navigation", "Communication", "Entertainment"],
    "role": "primary",
    "projectPhase": "Outfitting"
  }
]
```

## Data Migration

### Migration Sequence

1. **Categories** (independent)
2. **Tags** (independent)
3. **Company Info** (independent)
4. **Team Members** (independent)
5. **Vendors** (depends on Categories, Tags)
6. **Products** (depends on Vendors, Categories, Tags)
7. **Yachts** (depends on Vendors, Categories, Tags)
8. **Blog Posts** (depends on Categories, Tags)

### Data Validation

**Pre-Migration Checks**:
- Validate all markdown files parse correctly
- Check for missing required fields
- Validate reference integrity (vendor references, category references)
- Check for duplicate slugs

**Post-Migration Validation**:
- Verify record counts match
- Validate all relationships (foreign keys)
- Check JSONB data structure validity
- Verify media paths

## Performance Considerations

### Indexes

**Already created**:
- Primary keys on all tables
- Unique indexes on slug fields
- Foreign key indexes for relationships
- Composite indexes for many-to-many tables

**Query Optimization**:
- JSONB indexes for frequently queried nested data
- Full-text search indexes on description/content fields (if needed)

### Caching Strategy

- Application-level caching (5-minute TTL) in PayloadCMSDataService
- Database query caching in PostgreSQL
- Static generation caches all data at build time

## Rollback Strategy

1. **Pre-Migration Backup**:
   - Export all markdown files to backup directory
   - Create database snapshot before migration

2. **Migration Validation**:
   - Run migration in test environment first
   - Validate all data before production migration

3. **Rollback Plan**:
   - Keep TinaCMS markdown files untouched during migration
   - Database restore from snapshot if issues occur
   - Frontend can be rolled back to TinaCMSDataService if needed

## Migration Scripts

Location: `scripts/migrate-tinacms-to-payload/`

**Scripts**:
- `index.ts` - Main migration orchestrator
- `migrate-categories.ts` - Migrate categories from markdown
- `migrate-tags.ts` - Migrate tags from markdown
- `migrate-vendors.ts` - Migrate vendors with all enhanced fields
- `migrate-products.ts` - Migrate products with all enhanced fields
- `migrate-yachts.ts` - Migrate yacht profiles
- `migrate-blog-posts.ts` - Migrate blog posts
- `migrate-team-members.ts` - Migrate team members
- `migrate-company-info.ts` - Migrate company information
- `utils/parse-markdown.ts` - Markdown parsing utilities
- `utils/transform-media-paths.ts` - Media path transformation
- `utils/validate-data.ts` - Data validation utilities

## Rationale

**Why PostgreSQL for Production**:
- Proven scalability for high-traffic applications
- JSONB support for complex nested structures
- Full-text search capabilities
- Advanced indexing options
- Production-grade reliability and performance

**Why SQLite for Development**:
- Zero-configuration setup
- File-based database (simple backup/restore)
- Fast development iteration
- Payload CMS migration functions handle differences

**Why JSONB for Complex Data**:
- Preserves TinaCMS nested structure flexibility
- Efficient storage for variable-length arrays
- Queryable JSON data when needed
- Simpler than creating separate tables for every array field
