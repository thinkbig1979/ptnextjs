# Content Architecture Design - Phase 2.2

## Overview
Optimal Strapi content type architecture design based on relationship mapping and application requirements.

**Generated**: 2025-08-25  
**Phase**: 2.2 - Content Architecture Design  
**Purpose**: Design optimal Strapi content type structure with reusable components and proper internationalization

---

## 1. Content Type Classifications

### Collection Types (7)
```yaml
Primary Content:
  - partners: Partner companies and organizations
  - products: Products and services offered by partners  
  - blog-posts: Blog articles and content marketing
  - team-members: Company team member profiles

Reference Data:
  - categories: Technology categories for partners/products
  - blog-categories: Separate blog content categories  
  - tags: Multi-purpose tagging system
```

### Single Types (1)
```yaml
Global Content:
  - company-info: Company information and settings (singleton)
```

### Components (4)
```yaml
Product Components:
  - product.product-image: Repeatable product image component
  - product.feature: Repeatable product feature component
  
Shared Components:  
  - shared.seo: SEO metadata component
  - shared.social-media: Social media links component
```

---

## 2. Collection Type Detailed Design

### 2.1 Partners Collection
```yaml
Collection Name: partners
Display Name: Partners
Description: Marine technology companies and organizations

Fields:
  # Basic Information
  - name: 
      type: text
      required: true
      unique: true
      min_length: 2
      max_length: 100
  
  - slug:
      type: uid
      target_field: name
      required: true
      
  - description:
      type: richtext
      required: true
      min_length: 50
      max_length: 2000
      
  # Media
  - logo:
      type: media
      multiple: false
      allowed_types: [images]
      required: false
      
  - image:
      type: media  
      multiple: false
      allowed_types: [images]
      required: false
      description: "Company overview/hero image"
      
  # Contact Information
  - website:
      type: string
      format: url
      required: false
      
  - location:
      type: string
      max_length: 100
      required: false
      
  - founded:
      type: integer
      min: 1800
      max: 2025
      required: false
      
  # Status
  - featured:
      type: boolean
      default: false
      required: false
      
  # SEO Component
  - seo:
      type: component
      component: shared.seo
      required: false
      
Relations:
  - category: manyToOne → categories (required)
  - tags: manyToMany → tags (min: 1)
  - products: oneToMany ← products
```

### 2.2 Products Collection
```yaml
Collection Name: products
Display Name: Products
Description: Products and services offered by partners

Fields:
  # Basic Information
  - name:
      type: text
      required: true
      min_length: 2
      max_length: 200
      
  - slug:
      type: uid
      target_field: name
      required: true
      
  - description:
      type: richtext
      required: true
      min_length: 50
      max_length: 3000
      
  # Product Details
  - price:
      type: string
      max_length: 50
      required: false
      description: "Pricing information or 'Contact for pricing'"
      
  # Legacy Image Support (deprecated)
  - image:
      type: media
      multiple: false
      allowed_types: [images] 
      required: false
      description: "Legacy single image - use product_images instead"
      
  # SEO Component
  - seo:
      type: component
      component: shared.seo
      required: false

Components:
  - product_images:
      type: component
      component: product.product-image
      repeatable: true
      min: 1
      required: true
      
  - features:
      type: component
      component: product.feature
      repeatable: true
      min: 1
      required: true
      
Relations:
  - partner: manyToOne → partners (required)
  - category: manyToOne → categories (required)
  - tags: manyToMany → tags (min: 1)
```

### 2.3 Blog Posts Collection
```yaml
Collection Name: blog-posts
Display Name: Blog Posts
Description: Blog articles and content marketing

Fields:
  # Content
  - title:
      type: text
      required: true
      min_length: 5
      max_length: 200
      
  - slug:
      type: uid
      target_field: title
      required: true
      
  - excerpt:
      type: text
      required: true
      min_length: 50
      max_length: 300
      description: "Blog post summary"
      
  - content:
      type: richtext
      required: true
      min_length: 200
      
  # Publishing
  - author:
      type: string
      required: true
      max_length: 100
      
  - published_at:
      type: datetime
      required: true
      
  - featured:
      type: boolean
      default: false
      required: false
      
  - read_time:
      type: string
      max_length: 20
      required: false
      description: "e.g., '5 min read'"
      
  # Media
  - image:
      type: media
      multiple: false
      allowed_types: [images]
      required: false
      description: "Featured image"
      
  # SEO Component
  - seo:
      type: component
      component: shared.seo
      required: false
      
Relations:
  - blog_category: manyToOne → blog-categories (required)
  - tags: manyToMany → tags (min: 1)
```

### 2.4 Team Members Collection
```yaml
Collection Name: team-members
Display Name: Team Members
Description: Company team member profiles

Fields:
  # Basic Information
  - name:
      type: text
      required: true
      min_length: 2
      max_length: 100
      
  - role:
      type: string
      required: true
      max_length: 100
      description: "Job title or role"
      
  - bio:
      type: richtext
      required: true
      min_length: 50
      max_length: 1000
      
  # Media
  - image:
      type: media
      multiple: false
      allowed_types: [images]
      required: false
      description: "Profile photo"
      
  # Contact
  - email:
      type: email
      required: false
      
  - linkedin:
      type: string
      format: url
      required: false
      regex: "^https://([a-z]+\\.)?linkedin\\.com/in/[a-zA-Z0-9-]+/?$"
      
  # Display Order
  - order:
      type: integer
      required: false
      description: "Display order on team page"
      
Relations: None
```

### 2.5 Categories Collection  
```yaml
Collection Name: categories
Display Name: Categories
Description: Technology categories for partners and products

Fields:
  # Basic Information
  - name:
      type: text
      required: true
      unique: true
      max_length: 100
      
  - slug:
      type: uid
      target_field: name
      required: true
      
  - description:
      type: text
      required: true
      min_length: 20
      max_length: 500
      
  # Visual
  - icon:
      type: string
      required: true
      description: "Icon name or URL"
      
  - color:
      type: string
      required: true
      regex: "^#[0-9A-Fa-f]{6}$"
      description: "Brand color in hex format"
      
  # Display Order  
  - order:
      type: integer
      required: false
      description: "Display order in navigation"
      
Relations:
  - partners: oneToMany ← partners
  - products: oneToMany ← products
```

### 2.6 Blog Categories Collection
```yaml
Collection Name: blog-categories  
Display Name: Blog Categories
Description: Categories specifically for blog content

Fields:
  # Basic Information
  - name:
      type: text
      required: true
      unique: true
      max_length: 100
      
  - slug:
      type: uid
      target_field: name
      required: true
      
  - description:
      type: text
      required: false
      max_length: 500
      
  # Visual
  - color:
      type: string
      required: false
      regex: "^#[0-9A-Fa-f]{6}$"
      default: "#0066CC"
      
Relations:
  - blog_posts: oneToMany ← blog-posts
```

### 2.7 Tags Collection
```yaml
Collection Name: tags
Display Name: Tags
Description: Multi-purpose tagging system

Fields:
  # Basic Information
  - name:
      type: text
      required: true
      unique: true
      max_length: 50
      
  - slug:
      type: uid
      target_field: name
      required: true
      
  - description:
      type: text
      required: false
      max_length: 200
      
  # Usage Statistics (computed)
  - usage_count:
      type: integer
      required: false
      description: "Number of times tag is used (computed)"
      
Relations:
  - partners: manyToMany ← partners
  - products: manyToMany ← products  
  - blog_posts: manyToMany ← blog-posts
```

---

## 3. Single Type Design

### 3.1 Company Info Single Type
```yaml
Single Type Name: company-info
Display Name: Company Information
Description: Company-wide information and settings

Fields:
  # Basic Information
  - name:
      type: text
      required: true
      max_length: 100
      description: "Company name"
      
  - tagline:
      type: text
      required: true
      max_length: 200
      description: "Company tagline/slogan"
      
  - description:
      type: richtext
      required: true
      min_length: 100
      max_length: 1000
      description: "Company description"
      
  # Company Details
  - founded:
      type: integer
      required: true
      min: 1800
      max: 2025
      
  - location:
      type: string
      required: true
      max_length: 100
      
  - address:
      type: richtext
      required: true
      max_length: 500
      description: "Physical address"
      
  # Contact
  - phone:
      type: string
      required: true
      regex: "^\\+?[1-9]\\d{1,14}$"
      
  - email:
      type: email
      required: true
      
  # Content
  - story:
      type: richtext
      required: true
      min_length: 200
      description: "Company story/about content"
      
  # Media
  - logo:
      type: media
      multiple: false
      allowed_types: [images]
      required: false
      
  # Social Media
  - social_media:
      type: component
      component: shared.social-media
      required: false
      
  # SEO
  - seo:
      type: component
      component: shared.seo
      required: false

Relations: None (Single Type)
```

---

## 4. Component Design

### 4.1 Product Image Component
```yaml
Component Name: product.product-image
Display Name: Product Image
Description: Repeatable product image with metadata

Fields:
  - image:
      type: media
      multiple: false
      allowed_types: [images]
      required: true
      
  - alt_text:
      type: string
      max_length: 200
      required: false
      description: "Alt text for accessibility"
      
  - is_main:
      type: boolean
      default: false
      required: true
      description: "Mark as main product image"
      
  - caption:
      type: text
      max_length: 300
      required: false
      description: "Image caption"
      
  - order:
      type: integer
      required: false
      description: "Display order"

Business Rules:
  - Only one image per product should have is_main: true
  - Alt text should be provided for accessibility
  - First image becomes main if none specified
```

### 4.2 Product Feature Component
```yaml
Component Name: product.feature
Display Name: Product Feature
Description: Repeatable product feature with title and description

Fields:
  - title:
      type: text
      required: true
      max_length: 100
      description: "Feature title/name"
      
  - description:
      type: richtext
      required: false
      max_length: 500
      description: "Detailed feature description"
      
  - icon:
      type: string
      required: false
      description: "Feature icon name"
      
  - order:
      type: integer
      required: false
      description: "Display order"
```

### 4.3 SEO Shared Component
```yaml
Component Name: shared.seo
Display Name: SEO Metadata
Description: Reusable SEO metadata component

Fields:
  - meta_title:
      type: string
      max_length: 60
      required: false
      description: "Custom page title for SEO"
      
  - meta_description:
      type: text
      max_length: 160
      required: false
      description: "Meta description for search engines"
      
  - keywords:
      type: text
      max_length: 255
      required: false
      description: "Comma-separated keywords"
      
  - og_image:
      type: media
      multiple: false
      allowed_types: [images]
      required: false
      description: "Open Graph image for social sharing"
      
  - canonical_url:
      type: string
      format: url
      required: false
      description: "Canonical URL if different from default"
      
  - no_index:
      type: boolean
      default: false
      description: "Prevent search engine indexing"
```

### 4.4 Social Media Shared Component
```yaml
Component Name: shared.social-media
Display Name: Social Media Links  
Description: Reusable social media links component

Fields:
  - facebook:
      type: string
      format: url
      required: false
      
  - twitter:
      type: string
      format: url
      required: false
      
  - linkedin:
      type: string
      format: url
      required: false
      
  - instagram:
      type: string
      format: url
      required: false
      
  - youtube:
      type: string
      format: url
      required: false
```

---

## 5. Field Type Optimizations

### Media Field Strategy
```yaml
Image Handling:
  - Use Strapi media library for all images
  - Enable image transformations and resizing
  - Configure allowed file types and sizes
  - Set up CDN integration for performance

Recommended Settings:
  - Max file size: 5MB per image
  - Allowed formats: JPEG, PNG, WebP
  - Auto-generate alt text from filename
  - Enable responsive image variants
```

### Rich Text Configuration
```yaml
Rich Text Fields:
  - partner.description
  - product.description  
  - blog-post.content
  - team-member.bio
  - company-info.description
  - company-info.story

Recommended Plugins:
  - Paragraph, heading styles
  - Bold, italic, underline
  - Lists (ordered/unordered)
  - Links with target options
  - Images with alignment
  - Code blocks for technical content
```

### UID Field Configuration
```yaml
Slug Generation:
  - Auto-generate from target field
  - URL-safe character filtering
  - Uniqueness validation
  - Manual override capability
  
Pattern: /^[a-z0-9]+(?:-[a-z0-9]+)*$/
```

---

## 6. Internationalization Strategy

### Current Scope
```yaml
Status: Not Required (English Only)
Reasoning: 
  - Marine technology industry primarily English
  - Partner companies international but English-focused
  - Content creators are English-speaking
  - Target audience uses English professionally
```

### Future i18n Preparation
```yaml
If i18n Required Later:
  Enable i18n Plugin: @strapi/plugin-i18n
  
  Translatable Fields:
    Partners: name, description
    Products: name, description, features
    Blog Posts: title, excerpt, content
    Categories: name, description
    
  Non-translatable Fields:
    - Media files
    - URLs and contact info
    - Technical specifications
    - Dates and numbers
    
  Locale Strategy:
    - Default: en (English)
    - Additional: de, fr, es (if needed)
```

---

## 7. Performance Optimization

### Database Indexes
```yaml
Required Indexes:
  # Foreign Keys (auto-created)
  - products.partner_id
  - products.category_id
  - partners.category_id
  - blog_posts.blog_category_id
  
  # Junction Tables (auto-created)
  - partners_tags_links (partner_id, tag_id)
  - products_tags_links (product_id, tag_id)
  - blog_posts_tags_links (blog_post_id, tag_id)
  
  # Query Optimization
  - partners.featured
  - blog_posts.featured
  - partners.slug
  - products.slug
  - blog_posts.slug
```

### Content Delivery
```yaml
Static Generation Strategy:
  - Build-time data fetching
  - Pre-generated static pages
  - CDN deployment for global performance
  
Caching Strategy:
  - Service layer caching (5 min TTL)
  - Component-level memoization
  - Image CDN caching
```

---

## 8. Content Management Workflow

### Content Creation Process
```yaml
1. Reference Data Setup:
   - Create Categories
   - Create Tags
   - Setup Company Info

2. Partner Onboarding:
   - Create Partner entry
   - Assign Category and Tags
   - Upload Logo and Images
   
3. Product Management:
   - Create Product entries
   - Link to Partners
   - Add Product Images
   - Define Features
   
4. Content Publishing:
   - Create Blog Posts
   - Assign Categories and Tags
   - Schedule Publishing
```

### Content Validation
```yaml
Pre-publish Validation:
  - Required fields completed
  - Image alt text provided
  - SEO metadata present
  - Relationship integrity
  - Slug uniqueness
```

---

## 9. API Design Considerations

### Endpoint Structure
```yaml
Collection Endpoints:
  - GET /api/partners?populate=category,tags
  - GET /api/products?populate=partner,category,product_images.image
  - GET /api/blog-posts?populate=blog_category,tags
  
Single Type Endpoints:  
  - GET /api/company-info?populate=social_media
  
Component Endpoints:
  - Components served via parent entities
  - No direct component endpoints
```

### Population Strategy
```yaml
Default Population:
  - Essential relations only
  - Avoid deep nesting by default
  - Use specific population for detailed views

Performance Guidelines:
  - Limit population depth to 2 levels
  - Use pagination for large collections
  - Cache frequently accessed combinations
```

---

## 10. Migration Considerations

### Content Migration Order
```yaml
1. Create Component Definitions:
   - product.product-image
   - product.feature
   - shared.seo
   - shared.social-media

2. Create Reference Collections:
   - categories
   - blog-categories
   - tags

3. Create Main Collections:
   - partners (with relations)
   - products (with components)
   - blog-posts
   - team-members

4. Create Single Type:
   - company-info
```

### Data Transformation
```yaml
String Arrays → Relations:
  - Extract unique tags from string arrays
  - Create Tag entities
  - Populate many-to-many relations

String References → Relations:
  - Map category strings to Category entities
  - Update foreign key references

Components:
  - Transform features array to Feature components
  - Handle ProductImage component migration
```

---

## Next Phase: Schema Generation

The content architecture design provides:

1. **8 well-defined content types** with proper field configurations
2. **4 reusable components** for modular content management
3. **Optimized relationships** with proper cardinalities and constraints  
4. **Performance considerations** with indexing and caching strategies
5. **Clear migration path** from current string-based to relation-based structure

**Recommendation**: Proceed to Phase 3.1 (Strapi Schema Generation) to create actual schema.json files based on this architecture design.