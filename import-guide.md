# Strapi CMS Import Guide - Phase 3.2

## Overview
Complete step-by-step guide for importing all content types and data into Strapi CMS based on the comprehensive data type analysis.

**Generated**: 2025-08-25  
**Phase**: 3.2 - Migration Documentation  
**Prerequisites**: Strapi instance running with all schemas installed

---

## Pre-Import Checklist

### 1. Strapi Installation Verification
```bash
# Verify Strapi is running
curl http://localhost:1337/admin

# Check API endpoint
curl http://localhost:1337/api/partners
```

### 2. Schema Installation
Ensure all schema files are properly installed in your Strapi instance:

```
strapi-cms/src/api/
├── partner/content-types/partner/schema.json
├── product/content-types/product/schema.json
├── blog-post/content-types/blog-post/schema.json
├── team-member/content-types/team-member/schema.json
├── category/content-types/category/schema.json
├── blog-category/content-types/blog-category/schema.json
└── tag/content-types/tag/schema.json

strapi-cms/src/api/company-info/content-types/company-info/schema.json

strapi-cms/src/components/
├── product/product-image.json
├── product/feature.json
├── shared/seo.json
└── shared/social-media.json
```

### 3. Permissions Configuration
- Set up API tokens for import operations
- Configure public read permissions
- Verify admin access

---

## Import Process Overview

### Phase Order
1. **Reference Data**: Categories, Blog Categories, Tags
2. **Core Content**: Partners, Products  
3. **Editorial Content**: Blog Posts, Team Members
4. **Global Content**: Company Info
5. **Media Assets**: Images and files
6. **Validation & Testing**

---

## Phase 1: Reference Data Import

### Step 1.1: Categories Import

```bash
# Run migration script to generate category data
node migration-scripts/01-extract-reference-data.js

# Import categories via Strapi API
curl -X POST http://localhost:1337/api/categories \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_API_TOKEN" \
  -d @migration-data/categories.json
```

**Manual Alternative**: Use Strapi Admin Panel
1. Navigate to Content Manager → Categories
2. Create each category with the following data:

```json
{
  "name": "Navigation Systems",
  "slug": "navigation-systems", 
  "description": "Navigation Systems for marine technology",
  "icon": "compass",
  "color": "#0066CC",
  "order": 1
}
```

**Required Categories**:
- Navigation Systems
- Entertainment Technology  
- Propulsion Systems
- Water Management Systems
- Communication & Entertainment
- Safety Equipment

### Step 1.2: Blog Categories Import

```bash
# Import blog categories
curl -X POST http://localhost:1337/api/blog-categories \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_API_TOKEN" \
  -d @migration-data/blog-categories.json
```

**Required Blog Categories**:
- Technology Insights
- Industry News
- Product Spotlights
- Company Updates

### Step 1.3: Tags Import

```bash
# Import tags
curl -X POST http://localhost:1337/api/tags \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_API_TOKEN" \
  -d @migration-data/tags.json
```

**Validation**: Verify reference data
```bash
# Check counts
curl http://localhost:1337/api/categories | jq '.data | length'
curl http://localhost:1337/api/blog-categories | jq '.data | length'
curl http://localhost:1337/api/tags | jq '.data | length'
```

---

## Phase 2: Core Content Import

### Step 2.1: Partners Import

```bash
# Generate partner data
node migration-scripts/02-migrate-partners.js

# Import partners via API
curl -X POST http://localhost:1337/api/partners \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_API_TOKEN" \
  -d @migration-data/partners-strapi.json
```

**Manual Partner Entry Template**:
```json
{
  "data": {
    "name": "Raymarine (Teledyne FLIR)",
    "slug": "raymarine-teledyne-flir",
    "description": "Leading manufacturer of marine navigation equipment...",
    "website": "https://www.raymarine.com",
    "location": "Portsmouth, UK",
    "founded": 1923,
    "featured": true,
    "category": {"data": {"id": 1}},
    "tags": {"data": [{"id": 1}, {"id": 2}, {"id": 3}]}
  }
}
```

**Required Partners** (from source data):
1. Raymarine (Teledyne FLIR)
2. VBH (Van Berge Henegouwen)  
3. MTU (Rolls-Royce Power Systems)
4. Evac Group
5. Furuno Electric Co.
6. Triton Technical
7. VIKING Life-Saving Equipment

### Step 2.2: Products Import

```bash
# Generate product data
node migration-scripts/03-migrate-products.js

# Import products via API
curl -X POST http://localhost:1337/api/products \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_API_TOKEN" \
  -d @migration-data/products-strapi.json
```

**Manual Product Entry Template**:
```json
{
  "data": {
    "name": "Axiom Pro MFD Series",
    "slug": "axiom-pro-mfd-series",
    "description": "All-in-one GPS chartplotters with quad-core CPUs...",
    "price": "Contact for pricing",
    "partner": {"data": {"id": 1}},
    "category": {"data": {"id": 1}}, 
    "tags": {"data": [{"id": 1}, {"id": 2}]},
    "product_images": [
      {
        "image": null,
        "alt_text": "Axiom Pro MFD Series product image", 
        "is_main": true,
        "caption": null,
        "order": 1
      }
    ],
    "features": [
      {
        "title": "Quad-core CPU",
        "description": "High-performance processing",
        "icon": "cpu",
        "order": 1
      }
    ]
  }
}
```

**Validation**: Verify relationships
```bash
# Check partner-product relationships
curl "http://localhost:1337/api/partners?populate=products" | jq '.data[0].attributes.products.data | length'
```

---

## Phase 3: Editorial Content Import

### Step 3.1: Team Members Import

Create team member entries manually (data not in source):

```json
{
  "data": {
    "name": "John Smith",
    "role": "Chief Technology Officer", 
    "bio": "Over 15 years of experience in marine technology...",
    "email": "john.smith@company.com",
    "linkedin": "https://linkedin.com/in/johnsmith",
    "order": 1
  }
}
```

**Recommended Team Structure**:
- CEO/Founder
- CTO/Technical Lead
- Business Development Manager
- Customer Support Manager

### Step 3.2: Blog Posts Import

Create sample blog posts:

```json
{
  "data": {
    "title": "The Future of Marine Navigation Technology",
    "slug": "future-marine-navigation-technology",
    "excerpt": "Exploring emerging trends in marine navigation systems...",
    "content": "Full blog post content in rich text format...",
    "author": "John Smith",
    "published_at": "2025-01-15T10:00:00.000Z",
    "featured": true,
    "read_time": "5 min read",
    "blog_category": {"data": {"id": 1}},
    "tags": {"data": [{"id": 1}, {"id": 2}]}
  }
}
```

**Recommended Blog Topics**:
- Technology trends and innovations
- Partner spotlights and case studies  
- Product reviews and comparisons
- Industry news and updates

---

## Phase 4: Global Content Import

### Step 4.1: Company Info Import

```json
{
  "data": {
    "name": "Your Company Name",
    "tagline": "Leading Marine Technology Solutions",
    "description": "We connect marine technology professionals...",
    "founded": 2020,
    "location": "Your City, Country",
    "address": "123 Marine Drive, Your City, Country",
    "phone": "+1-555-123-4567",
    "email": "info@yourcompany.com",
    "story": "Our company was founded with the vision...",
    "social_media": {
      "facebook": "https://facebook.com/yourcompany",
      "linkedin": "https://linkedin.com/company/yourcompany",
      "twitter": "https://twitter.com/yourcompany"
    },
    "seo": {
      "meta_title": "Your Company - Marine Technology Solutions",
      "meta_description": "Leading provider of marine technology solutions...",
      "keywords": "marine technology, navigation, safety, propulsion"
    }
  }
}
```

---

## Phase 5: Media Assets Import

### Step 5.1: Prepare Media Files

Organize media files in the following structure:
```
media-import/
├── partners/
│   ├── logos/
│   │   ├── raymarine-logo.png
│   │   └── vbh-logo.png
│   └── images/
│       ├── raymarine-overview.jpg
│       └── vbh-facility.jpg
├── products/
│   ├── axiom-pro-main.jpg
│   ├── axiom-pro-gallery/
│   │   ├── front-view.jpg
│   │   └── interface-view.jpg
│   └── drs-cyclone-main.jpg
├── blog/
│   ├── navigation-tech-hero.jpg
│   └── industry-trends-hero.jpg
├── team/
│   ├── john-smith.jpg
│   └── jane-doe.jpg
└── company/
    └── company-logo.png
```

### Step 5.2: Upload Media Files

**Option 1: Strapi Admin Panel**
1. Navigate to Media Library
2. Create folders for organization
3. Upload files to appropriate folders
4. Note the media IDs for content updates

**Option 2: API Upload**
```bash
# Upload partner logo
curl -X POST http://localhost:1337/api/upload \
  -H "Authorization: Bearer YOUR_API_TOKEN" \
  -F "files=@media-import/partners/logos/raymarine-logo.png" \
  -F "fileInfo={\"name\":\"Raymarine Logo\",\"alternativeText\":\"Raymarine company logo\"}"
```

### Step 5.3: Update Content with Media References

After uploading media, update content entries with media IDs:

```bash
# Update partner with logo
curl -X PUT http://localhost:1337/api/partners/1 \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_API_TOKEN" \
  -d '{
    "data": {
      "logo": {"data": {"id": MEDIA_ID}}
    }
  }'
```

---

## Phase 6: Validation & Testing

### Step 6.1: Content Validation

Run validation scripts to ensure data integrity:

```bash
# Run CMS validation
node scripts/validate-cms.ts

# Check relationship integrity
curl "http://localhost:1337/api/partners?populate=*" | jq '.data[].attributes.products.data | length'

# Verify all required content exists
curl http://localhost:1337/api/categories | jq '.data | length'  # Should be 6+
curl http://localhost:1337/api/partners | jq '.data | length'    # Should be 7+  
curl http://localhost:1337/api/products | jq '.data | length'    # Should be 14+
curl http://localhost:1337/api/tags | jq '.data | length'        # Should be 20+
```

### Step 6.2: API Response Testing

Test all API endpoints with proper population:

```bash
# Test partner detail with products
curl "http://localhost:1337/api/partners/1?populate[0]=category&populate[1]=tags&populate[2]=products"

# Test product detail with relations
curl "http://localhost:1337/api/products/1?populate[0]=partner&populate[1]=category&populate[2]=tags&populate[3]=product_images&populate[4]=features"

# Test blog post with relations
curl "http://localhost:1337/api/blog-posts?populate[0]=blog_category&populate[1]=tags"

# Test company info with components
curl "http://localhost:1337/api/company-info?populate[0]=social_media&populate[1]=seo"
```

### Step 6.3: Performance Testing

```bash
# Test pagination
curl "http://localhost:1337/api/partners?pagination[page]=1&pagination[pageSize]=10"

# Test filtering
curl "http://localhost:1337/api/products?filters[category][name][\$eq]=Navigation%20Systems"

# Test search
curl "http://localhost:1337/api/partners?filters[\$or][0][name][\$containsi]=raymarine&filters[\$or][1][description][\$containsi]=radar"
```

---

## Import Troubleshooting

### Common Issues

#### 1. Relation Not Found Errors
```bash
# Check if referenced entity exists
curl http://localhost:1337/api/categories/1

# Verify relation data format
{
  "category": {"data": {"id": 1}}  // Correct
  "category": 1                    // Incorrect
}
```

#### 2. Component Validation Errors
```bash
# Verify component structure matches schema
{
  "product_images": [
    {
      "image": {"data": {"id": 1}},
      "alt_text": "Alt text",
      "is_main": true
    }
  ]
}
```

#### 3. Slug Uniqueness Errors
```bash
# Check for duplicate slugs
curl http://localhost:1337/api/partners | jq '.data[].attributes.slug' | sort | uniq -d
```

#### 4. Media Upload Issues
- Verify file size limits (default 5MB)
- Check allowed file types  
- Ensure proper file permissions
- Verify disk space available

### Rollback Procedures

#### 1. Content Rollback
```bash
# Delete all content (in reverse dependency order)
curl -X DELETE http://localhost:1337/api/products/ID
curl -X DELETE http://localhost:1337/api/partners/ID
curl -X DELETE http://localhost:1337/api/categories/ID
```

#### 2. Schema Rollback
- Remove schema files from Strapi
- Restart Strapi to rebuild database
- Database tables will be dropped automatically

#### 3. Media Cleanup
```bash
# Clear media library via admin panel
# Or delete uploads folder (if using local storage)
rm -rf strapi-cms/public/uploads/*
```

---

## Post-Import Configuration

### 1. SEO Optimization
- Add meta titles and descriptions to all content
- Upload Open Graph images  
- Configure canonical URLs
- Set up XML sitemap

### 2. Performance Optimization
- Configure CDN for media files
- Set up caching strategies
- Optimize database indexes
- Configure Redis for session storage

### 3. Security Configuration
- Review and restrict API permissions
- Set up rate limiting
- Configure CORS properly
- Enable audit logging
- Set up backup procedures

### 4. Content Workflow
- Train content editors on Strapi admin
- Set up draft/publish workflow
- Configure webhook for static site updates
- Document content guidelines

---

## Success Criteria

### Content Completeness
- ✅ All 7+ partners imported with proper relations
- ✅ All 14+ products imported with components
- ✅ 6+ categories with proper relationships  
- ✅ 20+ tags with usage tracking
- ✅ Sample blog posts with proper categorization
- ✅ Team member profiles
- ✅ Company information with SEO data

### API Functionality  
- ✅ All endpoints responding correctly
- ✅ Proper population of relations
- ✅ Filtering and search working
- ✅ Pagination configured
- ✅ Media serving properly

### Next.js Integration
- ✅ Static data service connecting successfully
- ✅ All pages generating without errors
- ✅ Images displaying correctly
- ✅ SEO metadata rendering
- ✅ Search functionality working

---

## Maintenance Procedures

### Regular Tasks
- **Weekly**: Review content for accuracy and completeness
- **Monthly**: Analyze usage statistics and performance
- **Quarterly**: Update partner and product information
- **Annually**: Review and update company information

### Content Updates
- New partner onboarding process
- Product lifecycle management
- Blog content calendar
- SEO performance monitoring

### Technical Maintenance
- Strapi security updates
- Database optimization
- Media file cleanup
- Backup verification

---

This import guide provides a complete roadmap for successfully migrating all content types to Strapi CMS with proper validation and testing procedures.