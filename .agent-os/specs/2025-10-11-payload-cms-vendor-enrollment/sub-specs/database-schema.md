# Database Schema

This is the database schema implementation for the spec detailed in @.agent-os/specs/2025-10-11-payload-cms-vendor-enrollment/spec.md

## Schema Overview

The database schema consists of 7 core tables supporting the Payload CMS migration and vendor self-enrollment features:

1. **users** - User accounts (vendors and admins) with authentication
2. **vendors** - Vendor company profiles with tiered access
3. **products** - Products and services offered by vendors
4. **categories** - Hierarchical categorization for products and content
5. **blog_posts** - Blog content with author attribution
6. **team_members** - Team member profiles
7. **company_info** - Platform company information (key-value store)

### Database Environment Strategy

**Development**: SQLite (file-based, zero configuration)
- Database file: `./payload.db`
- Perfect for local development and testing
- No external database server required

**Production**: PostgreSQL (scalable, concurrent connections)
- Hosted database (Vercel Postgres, AWS RDS, Supabase, etc.)
- Connection pooling for high concurrency
- Advanced features (replication, backups, monitoring)

**Schema Management**: Payload CMS 3+ migration functions
- All schema changes defined in Payload migrations
- Automatic database compatibility layer
- Run migrations: `npm run payload migrate`
- Migrations work identically on SQLite and PostgreSQL

## Entity Relationship Diagram

```
┌──────────────────────────────────────────────────────────────┐
│                         users                                 │
│ ──────────────────────────────────────────────────────────── │
│ id (UUID, PK)                                                 │
│ email (VARCHAR, UNIQUE)                                       │
│ password_hash (VARCHAR)                                       │
│ role (VARCHAR: 'admin' | 'vendor')                            │
│ status (VARCHAR: 'pending' | 'approved' | 'rejected' | ...)  │
│ rejection_reason (TEXT, nullable)                             │
│ created_at, updated_at, approved_at, rejected_at (TIMESTAMP)  │
└────┬─────────────────────────────────────────────────────────┘
     │ 1:1
     │
┌────▼─────────────────────────────────────────────────────────┐
│                         vendors                               │
│ ──────────────────────────────────────────────────────────── │
│ id (UUID, PK)                                                 │
│ user_id (UUID, FK → users.id, UNIQUE)                        │
│ company_name (VARCHAR)                                        │
│ slug (VARCHAR, UNIQUE)                                        │
│ tier (VARCHAR: 'free' | 'tier1' | 'tier2')                   │
│ description (TEXT) [FREE]                                     │
│ logo (VARCHAR)                                                │
│ contact_email, contact_phone (VARCHAR)                        │
│ website, linkedin_url, twitter_url (VARCHAR) [TIER 1+]       │
│ certifications (TEXT[]) [TIER 1+]                             │
│ featured, published (BOOLEAN)                                 │
│ created_at, updated_at (TIMESTAMP)                            │
└────┬─────────────────────────────────────────────────────────┘
     │ 1:N
     │
┌────▼─────────────────────────────────────────────────────────┐
│                         products                              │
│ ──────────────────────────────────────────────────────────── │
│ id (UUID, PK)                                                 │
│ vendor_id (UUID, FK → vendors.id)                             │
│ name (VARCHAR)                                                │
│ slug (VARCHAR, UNIQUE)                                        │
│ description (TEXT)                                            │
│ short_description (VARCHAR)                                   │
│ images (TEXT[])                                               │
│ categories (TEXT[])                                           │
│ specifications (JSONB)                                        │
│ published (BOOLEAN)                                           │
│ created_at, updated_at (TIMESTAMP)                            │
└──────────────────────────────────────────────────────────────┘

┌──────────────────────────────────────────────────────────────┐
│                         categories                            │
│ ──────────────────────────────────────────────────────────── │
│ id (UUID, PK)                                                 │
│ name (VARCHAR)                                                │
│ slug (VARCHAR, UNIQUE)                                        │
│ description (TEXT)                                            │
│ parent_id (UUID, FK → categories.id, nullable) [SELF-REF]    │
│ icon (VARCHAR)                                                │
│ published (BOOLEAN)                                           │
│ created_at, updated_at (TIMESTAMP)                            │
└──────────────────────────────────────────────────────────────┘

┌──────────────────────────────────────────────────────────────┐
│                         blog_posts                            │
│ ──────────────────────────────────────────────────────────── │
│ id (UUID, PK)                                                 │
│ author_id (UUID, FK → users.id, nullable)                    │
│ title (VARCHAR)                                               │
│ slug (VARCHAR, UNIQUE)                                        │
│ content (TEXT)                                                │
│ excerpt (VARCHAR)                                             │
│ featured_image (VARCHAR)                                      │
│ categories (TEXT[])                                           │
│ tags (TEXT[])                                                 │
│ published (BOOLEAN)                                           │
│ published_at (TIMESTAMP, nullable)                            │
│ created_at, updated_at (TIMESTAMP)                            │
└──────────────────────────────────────────────────────────────┘

┌──────────────────────────────────────────────────────────────┐
│                         team_members                          │
│ ──────────────────────────────────────────────────────────── │
│ id (UUID, PK)                                                 │
│ name (VARCHAR)                                                │
│ role (VARCHAR)                                                │
│ bio (TEXT)                                                    │
│ photo (VARCHAR)                                               │
│ email (VARCHAR, nullable)                                     │
│ linkedin_url, twitter_url (VARCHAR, nullable)                 │
│ display_order (INTEGER, default 0)                            │
│ published (BOOLEAN, default true)                             │
│ created_at, updated_at (TIMESTAMP)                            │
└──────────────────────────────────────────────────────────────┘

┌──────────────────────────────────────────────────────────────┐
│                         company_info                          │
│ ──────────────────────────────────────────────────────────── │
│ id (UUID, PK)                                                 │
│ key (VARCHAR, UNIQUE)                                         │
│ value (JSONB)                                                 │
│ created_at, updated_at (TIMESTAMP)                            │
└──────────────────────────────────────────────────────────────┘
```

## Table Definitions

### users Table

**Purpose**: Store user accounts for authentication and authorization

```sql
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email VARCHAR(255) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  role VARCHAR(20) NOT NULL CHECK (role IN ('admin', 'vendor')),
  status VARCHAR(20) NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected', 'suspended')),
  rejection_reason TEXT,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  approved_at TIMESTAMP,
  rejected_at TIMESTAMP
);

-- Indexes
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_role_status ON users(role, status);
CREATE INDEX idx_users_status_created ON users(status, created_at) WHERE status = 'pending';

-- Triggers
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
```

**Column Descriptions**:
- `id`: Primary key, auto-generated UUID
- `email`: User's email address, used for login, must be unique
- `password_hash`: Bcrypt-hashed password (12 rounds), never stored in plain text
- `role`: User role, either 'admin' (platform admin) or 'vendor' (vendor account)
- `status`: Account status, starts as 'pending', admin changes to 'approved' or 'rejected'
- `rejection_reason`: If rejected, reason provided by admin (optional)
- `approved_at`: Timestamp when admin approved account
- `rejected_at`: Timestamp when admin rejected account

**Constraints**:
- `UNIQUE(email)`: Email addresses must be unique across all users
- `CHECK(role IN (...))`: Only valid roles allowed
- `CHECK(status IN (...))`: Only valid statuses allowed
- `NOT NULL` on email, password_hash, role, status: Required fields

**Indexing Strategy**:
- `idx_users_email`: Fast lookup by email for login
- `idx_users_role_status`: Fast filtering by role and status for admin queries
- `idx_users_status_created`: Conditional index for pending users ordered by creation time (approval queue)

---

### vendors Table

**Purpose**: Store vendor company profiles with tier-based feature access

```sql
CREATE TABLE vendors (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID UNIQUE REFERENCES users(id) ON DELETE CASCADE,
  company_name VARCHAR(255) NOT NULL,
  slug VARCHAR(255) UNIQUE NOT NULL,
  tier VARCHAR(20) NOT NULL DEFAULT 'free' CHECK (tier IN ('free', 'tier1', 'tier2')),

  -- Basic Info (Free Tier)
  description TEXT,
  logo VARCHAR(500),
  contact_email VARCHAR(255) NOT NULL,
  contact_phone VARCHAR(50),

  -- Enhanced Profile (Tier 1+)
  website VARCHAR(500),
  linkedin_url VARCHAR(500),
  twitter_url VARCHAR(500),
  certifications TEXT[], -- Array of certification names

  -- Metadata
  featured BOOLEAN DEFAULT FALSE,
  published BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Indexes
CREATE INDEX idx_vendors_user_id ON vendors(user_id);
CREATE INDEX idx_vendors_slug ON vendors(slug);
CREATE INDEX idx_vendors_tier ON vendors(tier);
CREATE INDEX idx_vendors_published_featured ON vendors(published, featured);

-- Trigger
CREATE TRIGGER update_vendors_updated_at BEFORE UPDATE ON vendors
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
```

**Column Descriptions**:
- `id`: Primary key, auto-generated UUID
- `user_id`: Foreign key to users table, one-to-one relationship, cascading delete
- `company_name`: Vendor's company name
- `slug`: URL-friendly slug for vendor profile page (e.g., "marine-tech-solutions")
- `tier`: Subscription tier ('free', 'tier1', 'tier2'), determines feature access
- `description`: Company description (markdown supported), free tier field
- `logo`: Path to vendor logo image
- `contact_email`: Public contact email for vendor
- `contact_phone`: Public contact phone for vendor (optional)
- `website`: Company website URL (tier 1+ only)
- `linkedin_url`: LinkedIn company page URL (tier 1+ only)
- `twitter_url`: Twitter/X profile URL (tier 1+ only)
- `certifications`: Array of certification names (tier 1+ only)
- `featured`: Whether vendor is featured on homepage (admin-controlled)
- `published`: Whether vendor profile is publicly visible (admin-controlled)

**Tier-Based Field Access**:
- **Free Tier**: company_name, description, logo, contact_email, contact_phone
- **Tier 1**: All free tier fields + website, social links, certifications
- **Tier 2**: All tier 1 fields + ability to manage products (separate table)

**Constraints**:
- `UNIQUE(user_id)`: Each user can have only one vendor profile
- `UNIQUE(slug)`: Slugs must be unique for URL routing
- `CHECK(tier IN (...))`: Only valid tiers allowed
- `NOT NULL` on company_name, slug, contact_email: Required fields
- `ON DELETE CASCADE`: Deleting user deletes associated vendor profile

**Indexing Strategy**:
- `idx_vendors_user_id`: Fast lookup of vendor by user ID
- `idx_vendors_slug`: Fast lookup for public vendor pages by slug
- `idx_vendors_tier`: Filter vendors by subscription tier
- `idx_vendors_published_featured`: Composite index for featured vendor queries on homepage

---

### products Table

**Purpose**: Store products and services offered by tier 2 vendors

```sql
CREATE TABLE products (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  vendor_id UUID REFERENCES vendors(id) ON DELETE CASCADE,
  name VARCHAR(255) NOT NULL,
  slug VARCHAR(255) UNIQUE NOT NULL,
  description TEXT,
  short_description VARCHAR(500),
  images TEXT[], -- Array of image URLs
  categories TEXT[], -- Array of category slugs or IDs
  specifications JSONB, -- Flexible key-value specs
  published BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Indexes
CREATE INDEX idx_products_vendor_id ON products(vendor_id);
CREATE INDEX idx_products_slug ON products(slug);
CREATE INDEX idx_products_published ON products(published);
CREATE INDEX idx_products_categories ON products USING GIN(categories);

-- Trigger
CREATE TRIGGER update_products_updated_at BEFORE UPDATE ON products
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
```

**Column Descriptions**:
- `id`: Primary key, auto-generated UUID
- `vendor_id`: Foreign key to vendors table, many-to-one relationship
- `name`: Product name
- `slug`: URL-friendly slug for product page
- `description`: Full product description (markdown supported)
- `short_description`: Brief description for listings
- `images`: Array of image URLs (multiple product photos)
- `categories`: Array of category identifiers for filtering
- `specifications`: Flexible JSON field for product-specific specs (dimensions, power, materials, etc.)
- `published`: Whether product is publicly visible

**Access Control**:
- Only tier 2 vendors can create and manage products
- Enforced at API and Payload CMS access control levels

**Constraints**:
- `UNIQUE(slug)`: Product slugs must be unique for URL routing
- `NOT NULL` on vendor_id, name, slug: Required fields
- `ON DELETE CASCADE`: Deleting vendor deletes all their products

**Indexing Strategy**:
- `idx_products_vendor_id`: Fast lookup of products by vendor
- `idx_products_slug`: Fast lookup for public product pages
- `idx_products_published`: Filter published products for public display
- `idx_products_categories`: GIN index for efficient array membership queries

---

### categories Table

**Purpose**: Hierarchical categorization for products and blog content

```sql
CREATE TABLE categories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(255) NOT NULL,
  slug VARCHAR(255) UNIQUE NOT NULL,
  description TEXT,
  parent_id UUID REFERENCES categories(id) ON DELETE SET NULL,
  icon VARCHAR(100),
  published BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Indexes
CREATE INDEX idx_categories_slug ON categories(slug);
CREATE INDEX idx_categories_parent_id ON categories(parent_id);
CREATE INDEX idx_categories_published ON categories(published);

-- Trigger
CREATE TRIGGER update_categories_updated_at BEFORE UPDATE ON categories
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
```

**Column Descriptions**:
- `id`: Primary key, auto-generated UUID
- `name`: Category display name
- `slug`: URL-friendly slug for category pages
- `description`: Category description
- `parent_id`: Foreign key to categories table for hierarchy (nullable for top-level categories)
- `icon`: Icon identifier for UI display
- `published`: Whether category is publicly visible

**Hierarchy Example**:
```
Marine Technology (parent_id = NULL)
  ├── Navigation (parent_id = marine-tech-id)
  │   ├── GPS Systems (parent_id = navigation-id)
  │   └── Radar (parent_id = navigation-id)
  └── Communication (parent_id = marine-tech-id)
      ├── VHF Radios (parent_id = communication-id)
      └── Satellite (parent_id = communication-id)
```

**Constraints**:
- `UNIQUE(slug)`: Category slugs must be unique
- `NOT NULL` on name, slug: Required fields
- `ON DELETE SET NULL`: Deleting parent category sets children's parent_id to NULL (orphans)

**Indexing Strategy**:
- `idx_categories_slug`: Fast lookup by slug
- `idx_categories_parent_id`: Fast lookup of child categories
- `idx_categories_published`: Filter published categories

---

### blog_posts Table

**Purpose**: Blog posts with author attribution and categorization

```sql
CREATE TABLE blog_posts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title VARCHAR(500) NOT NULL,
  slug VARCHAR(500) UNIQUE NOT NULL,
  content TEXT NOT NULL,
  excerpt VARCHAR(1000),
  author_id UUID REFERENCES users(id) ON DELETE SET NULL,
  featured_image VARCHAR(500),
  categories TEXT[],
  tags TEXT[],
  published BOOLEAN DEFAULT FALSE,
  published_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Indexes
CREATE INDEX idx_blog_posts_slug ON blog_posts(slug);
CREATE INDEX idx_blog_posts_published ON blog_posts(published, published_at);
CREATE INDEX idx_blog_posts_author_id ON blog_posts(author_id);

-- Trigger
CREATE TRIGGER update_blog_posts_updated_at BEFORE UPDATE ON blog_posts
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
```

**Column Descriptions**:
- `id`: Primary key, auto-generated UUID
- `title`: Blog post title
- `slug`: URL-friendly slug for blog post page
- `content`: Full blog post content (markdown supported)
- `excerpt`: Brief summary for listings
- `author_id`: Foreign key to users table (admin or vendor can author posts)
- `featured_image`: Hero image URL
- `categories`: Array of category identifiers
- `tags`: Array of tag strings for filtering
- `published`: Whether post is publicly visible
- `published_at`: Timestamp when post was published (for sorting)

**Constraints**:
- `UNIQUE(slug)`: Post slugs must be unique
- `NOT NULL` on title, slug, content: Required fields
- `ON DELETE SET NULL`: Deleting author preserves post but removes attribution

**Indexing Strategy**:
- `idx_blog_posts_slug`: Fast lookup by slug
- `idx_blog_posts_published`: Composite index for published posts ordered by date
- `idx_blog_posts_author_id`: Fast lookup of posts by author

---

### team_members Table

**Purpose**: Team member profiles for "About Us" / "Team" page

```sql
CREATE TABLE team_members (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(255) NOT NULL,
  role VARCHAR(255) NOT NULL,
  bio TEXT,
  photo VARCHAR(500),
  email VARCHAR(255),
  linkedin_url VARCHAR(500),
  twitter_url VARCHAR(500),
  display_order INTEGER DEFAULT 0,
  published BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Indexes
CREATE INDEX idx_team_members_display_order ON team_members(display_order);
CREATE INDEX idx_team_members_published ON team_members(published);

-- Trigger
CREATE TRIGGER update_team_members_updated_at BEFORE UPDATE ON team_members
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
```

**Column Descriptions**:
- `id`: Primary key, auto-generated UUID
- `name`: Team member's full name
- `role`: Job title or role description
- `bio`: Biography or description
- `photo`: Headshot image URL
- `email`: Public contact email (optional)
- `linkedin_url`: LinkedIn profile URL (optional)
- `twitter_url`: Twitter/X profile URL (optional)
- `display_order`: Order for display on team page (lower numbers first)
- `published`: Whether profile is publicly visible

**Constraints**:
- `NOT NULL` on name, role: Required fields

**Indexing Strategy**:
- `idx_team_members_display_order`: Sorting for team page display
- `idx_team_members_published`: Filter published profiles

---

### company_info Table

**Purpose**: Key-value store for platform company information (flexible schema)

```sql
CREATE TABLE company_info (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  key VARCHAR(100) UNIQUE NOT NULL,
  value JSONB NOT NULL,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Indexes
CREATE INDEX idx_company_info_key ON company_info(key);

-- Trigger
CREATE TRIGGER update_company_info_updated_at BEFORE UPDATE ON company_info
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
```

**Column Descriptions**:
- `id`: Primary key, auto-generated UUID
- `key`: Unique identifier for company info item
- `value`: JSON value storing flexible data structure
- `created_at`, `updated_at`: Standard timestamps

**Example Data**:
```json
{
  "key": "contact_info",
  "value": {
    "email": "info@platform.com",
    "phone": "+1-555-0100",
    "address": {
      "street": "123 Marine Way",
      "city": "Fort Lauderdale",
      "state": "FL",
      "zip": "33301"
    }
  }
}

{
  "key": "social_media",
  "value": {
    "facebook": "https://facebook.com/platform",
    "twitter": "https://twitter.com/platform",
    "linkedin": "https://linkedin.com/company/platform"
  }
}

{
  "key": "about_us",
  "value": {
    "mission": "Empowering marine technology vendors...",
    "founded": "2025",
    "team_size": 12
  }
}
```

**Constraints**:
- `UNIQUE(key)`: Each key can only appear once
- `NOT NULL` on key, value: Required fields

**Indexing Strategy**:
- `idx_company_info_key`: Fast lookup by key

---

## Data Migrations

### Payload CMS Migration Strategy

**Important**: All schema changes MUST be managed through Payload CMS 3 migration functions to ensure database portability between SQLite (development) and PostgreSQL (production).

**Payload Migration Workflow**:

1. **Define Collections in Payload Config** (`payload.config.ts`):
```typescript
export default buildConfig({
  collections: [
    {
      slug: 'users',
      fields: [
        { name: 'email', type: 'email', required: true, unique: true },
        { name: 'role', type: 'select', options: ['admin', 'vendor'], required: true },
        // ... other fields
      ],
    },
    {
      slug: 'vendors',
      fields: [
        { name: 'userId', type: 'relationship', relationTo: 'users', required: true },
        { name: 'companyName', type: 'text', required: true },
        // ... other fields
      ],
    },
    // ... other collections
  ],
})
```

2. **Generate Migration** (when schema changes):
```bash
npm run payload migrate:create
# Creates migration file: migrations/YYYYMMDD_HHMMSS_migration_name.ts
```

3. **Run Migrations**:
```bash
# Development (SQLite)
npm run payload migrate

# Production (PostgreSQL)
DATABASE_URL=postgresql://... npm run payload migrate
```

4. **Migration File Structure**:
```typescript
// migrations/20251011_create_vendors_table.ts
import { MigrateUpArgs, MigrateDownArgs } from '@payloadcms/db-sqlite'

export async function up({ payload }: MigrateUpArgs): Promise<void> {
  // Payload automatically creates tables based on collections
  // Custom logic only if needed:
  await payload.db.drizzle.run(sql`
    CREATE INDEX IF NOT EXISTS idx_vendors_slug ON vendors(slug)
  `)
}

export async function down({ payload }: MigrateDownArgs): Promise<void> {
  await payload.db.drizzle.run(sql`
    DROP INDEX IF EXISTS idx_vendors_slug
  `)
}
```

### Initial Schema Creation via Payload CMS

**Step 1**: Define all collections in `payload.config.ts` (see Payload Migration Strategy above)

**Step 2**: Run initial migration:
```bash
npm run payload migrate
```

This automatically creates all tables, indexes, and constraints based on collection definitions.

**Step 3**: Seed admin user:
```typescript
// scripts/seed-admin.ts
import payload from 'payload'

async function seedAdmin() {
  await payload.init({ local: true })

  await payload.create({
    collection: 'users',
    data: {
      email: 'admin@platform.com',
      password: 'change-me-on-first-login',
      role: 'admin',
      status: 'approved',
      approvedAt: new Date(),
    },
  })

  console.log('Admin user created')
  process.exit(0)
}

seedAdmin()
```

### TinaCMS → Payload CMS Migration Scripts

**Migration Order**:
1. Users (create admin accounts)
2. Vendors (migrate from content/vendors/*.md)
3. Categories (migrate from content/categories/*.md)
4. Products (migrate from content/products/*.md, resolve vendor references)
5. Blog Posts (migrate from content/blog/*.md)
6. Team Members (migrate from content/team/*.md)
7. Company Info (migrate from content/company/*.md)

**Sample Migration Script** (vendors):
```typescript
// scripts/migration/migrate-vendors.ts
import fs from 'fs'
import path from 'path'
import matter from 'gray-matter'
import payload from 'payload'

export async function migrateVendors() {
  const vendorsDir = path.join(process.cwd(), 'content/vendors')
  const files = fs.readdirSync(vendorsDir).filter((f) => f.endsWith('.md'))

  console.log(`Migrating ${files.length} vendors...`)

  for (const file of files) {
    const filePath = path.join(vendorsDir, file)
    const fileContent = fs.readFileSync(filePath, 'utf-8')
    const { data, content } = matter(fileContent)

    // Create user account for vendor
    const user = await payload.create({
      collection: 'users',
      data: {
        email: data.contact?.email || `${data.slug}@example.com`,
        passwordHash: 'migrated-no-password', // Vendors must reset password
        role: 'vendor',
        status: 'approved', // Existing vendors pre-approved
        approvedAt: new Date(),
      },
    })

    // Create vendor profile
    await payload.create({
      collection: 'vendors',
      data: {
        userId: user.id,
        companyName: data.name,
        slug: data.slug || file.replace('.md', ''),
        tier: 'free', // Default tier, admins can upgrade
        description: content,
        logo: transformMediaPath(data.logo),
        contactEmail: data.contact?.email,
        contactPhone: data.contact?.phone,
        website: data.website,
        featured: data.featured === true,
        published: data.published !== false,
      },
    })

    console.log(`✓ Migrated vendor: ${data.name}`)
  }

  console.log('Vendor migration complete!')
}
```

---

## Performance Optimization

### Indexing Strategy Summary

**Users Table**:
- Email lookup for login (unique index)
- Role + status filtering for admin queries (composite index)
- Pending users queue (conditional index)

**Vendors Table**:
- User ID lookup (foreign key index)
- Slug lookup for public pages (unique index)
- Tier filtering (tier index)
- Featured vendor queries (composite index on published + featured)

**Products Table**:
- Vendor ID lookup (foreign key index)
- Slug lookup for public pages (unique index)
- Published products (published index)
- Category filtering (GIN index on array)

**Categories Table**:
- Slug lookup (unique index)
- Parent-child queries (parent_id index)
- Published categories (published index)

**Blog Posts Table**:
- Slug lookup (unique index)
- Published posts ordered by date (composite index)
- Author posts (author_id index)

**Team Members Table**:
- Display order sorting (display_order index)
- Published profiles (published index)

**Company Info Table**:
- Key lookup (unique index)

### Query Optimization Guidelines

**Use Indexes for WHERE Clauses**:
```sql
-- Good: Uses idx_vendors_slug
SELECT * FROM vendors WHERE slug = 'marine-tech-solutions';

-- Good: Uses idx_vendors_published_featured
SELECT * FROM vendors WHERE published = true AND featured = true;

-- Bad: No index on description (full table scan)
SELECT * FROM vendors WHERE description LIKE '%navigation%';
```

**Use LIMIT for Pagination**:
```sql
-- Always paginate list queries
SELECT * FROM vendors WHERE published = true
ORDER BY created_at DESC
LIMIT 20 OFFSET 0;
```

**Avoid N+1 Queries**:
```sql
-- Bad: Query products for each vendor (N+1)
SELECT * FROM vendors;
-- Then for each vendor:
SELECT * FROM products WHERE vendor_id = ?;

-- Good: Single query with JOIN
SELECT
  v.*,
  json_agg(p.*) AS products
FROM vendors v
LEFT JOIN products p ON p.vendor_id = v.id
WHERE v.published = true
GROUP BY v.id;
```

**Use EXPLAIN ANALYZE**:
```sql
-- Check query performance
EXPLAIN ANALYZE
SELECT * FROM vendors
WHERE published = true AND tier = 'tier2'
ORDER BY created_at DESC
LIMIT 20;
```

---

## Data Integrity

### Foreign Key Constraints

**users → vendors**:
- `vendors.user_id REFERENCES users.id ON DELETE CASCADE`
- Deleting user deletes vendor profile (intentional, user owns vendor)

**vendors → products**:
- `products.vendor_id REFERENCES vendors.id ON DELETE CASCADE`
- Deleting vendor deletes all products (intentional, vendor owns products)

**categories → categories**:
- `categories.parent_id REFERENCES categories.id ON DELETE SET NULL`
- Deleting parent category orphans children (prevents cascade deletion of entire tree)

**users → blog_posts**:
- `blog_posts.author_id REFERENCES users.id ON DELETE SET NULL`
- Deleting author preserves blog posts (intentional, content outlives author)

### Unique Constraints

- `users.email`: Prevent duplicate accounts
- `vendors.user_id`: Ensure one vendor profile per user
- `vendors.slug`: Prevent URL collisions
- `products.slug`: Prevent URL collisions
- `categories.slug`: Prevent URL collisions
- `blog_posts.slug`: Prevent URL collisions
- `company_info.key`: Prevent duplicate keys

### Check Constraints

- `users.role IN ('admin', 'vendor')`: Valid roles only
- `users.status IN ('pending', 'approved', 'rejected', 'suspended')`: Valid statuses only
- `vendors.tier IN ('free', 'tier1', 'tier2')`: Valid tiers only

### Not Null Constraints

**Critical fields that cannot be null**:
- All primary keys (id)
- All foreign keys (except nullable relationships like parent_id, author_id)
- Authentication fields (email, password_hash)
- Business-critical fields (company_name, product name, etc.)

---

## Backup and Recovery

### Backup Strategy

**Automated Daily Backups**:
- Full database backup every 24 hours
- Incremental backups every 6 hours (optional, for faster recovery)
- Retention: 7 days of daily backups, 4 weeks of weekly backups

**Point-in-Time Recovery (PITR)**:
- Write-Ahead Logging (WAL) enabled
- WAL archives retained for 7 days
- Can restore to any point in time within retention window

### Recovery Procedures

**Full Restore**:
```bash
# Restore from backup file
pg_restore -h localhost -U postgres -d marine_tech_prod backup.dump

# Verify data integrity
psql -h localhost -U postgres -d marine_tech_prod -c "SELECT COUNT(*) FROM vendors;"
```

**Point-in-Time Recovery**:
```bash
# Restore base backup
pg_restore -h localhost -U postgres -d marine_tech_prod base_backup.dump

# Replay WAL to specific timestamp
pg_waldump -p /var/lib/postgresql/wal -e 2025-10-11T12:00:00
```

### Disaster Recovery Plan

1. **Detect Issue**: Monitoring alerts for data loss, corruption, or service outage
2. **Assess Impact**: Determine scope (single table, full database, infrastructure)
3. **Notify Stakeholders**: Inform team and users of issue
4. **Restore from Backup**: Use most recent backup or PITR as appropriate
5. **Validate Data**: Run integrity checks, spot-check critical data
6. **Resume Service**: Bring application back online
7. **Post-Mortem**: Document incident, identify root cause, implement preventions

**Recovery Time Objective (RTO)**: < 4 hours from detection to service restoration
**Recovery Point Objective (RPO)**: < 24 hours of data loss (daily backup frequency)
