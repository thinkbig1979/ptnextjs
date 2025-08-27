# Complete Data Types Inventory - Phase 1

## Overview
Complete inventory of all data types and interfaces used in the Next.js application for Strapi CMS integration.

**Generated**: 2025-08-25  
**Source Analysis**: `/lib/types.ts`, `/lib/strapi-client.ts`, `/lib/static-data-service.ts`

---

## Core Application Types

### 1. Partner Interface
**Location**: `/lib/types.ts` lines 2-15  
**Purpose**: Marine technology company data structure

```typescript
interface Partner {
  id: string;           // Required - Unique identifier
  slug?: string;        // Optional - URL-friendly identifier
  name: string;         // Required - Company name
  category: string;     // Required - Technology category
  description: string;  // Required - Company description
  logo?: string;        // Optional - Company logo URL
  image?: string;       // Optional - Company overview image URL
  website?: string;     // Optional - Company website URL
  founded?: number;     // Optional - Founding year
  location?: string;    // Optional - Company location
  tags: string[];       // Required - Technology tags array
  featured?: boolean;   // Optional - Featured status flag
}
```

**Field Analysis**:
- **Required Fields**: id, name, category, description, tags
- **Optional Fields**: slug, logo, image, website, founded, location, featured
- **Relationships**: One-to-Many with Products
- **Validation Rules**: 
  - id must be unique
  - slug must be URL-safe if provided
  - tags must be non-empty array

---

### 2. ProductImage Interface
**Location**: `/lib/types.ts` lines 17-22  
**Purpose**: Component for handling multiple product images

```typescript
interface ProductImage {
  id: string;           // Required - Unique identifier
  url: string;          // Required - Image URL
  altText?: string;     // Optional - Alt text for accessibility
  isMain: boolean;      // Required - Main image flag
}
```

**Field Analysis**:
- **Required Fields**: id, url, isMain
- **Optional Fields**: altText
- **Component Relationship**: One-to-Many with Product
- **Validation Rules**:
  - Only one image per product should have isMain: true
  - URL must be valid image URL
  - altText recommended for accessibility

---

### 3. Product Interface
**Location**: `/lib/types.ts` lines 24-38  
**Purpose**: Product/service offerings from partners

```typescript
interface Product {
  id: string;                    // Required - Unique identifier
  slug?: string;                 // Optional - URL-friendly identifier
  name: string;                  // Required - Product name
  partnerId: string;             // Required - Foreign key to Partner
  partnerName: string;           // Required - Denormalized partner name
  category: string;              // Required - Product category
  description: string;           // Required - Product description
  image?: string;                // Optional - Legacy single image (deprecated)
  images: ProductImage[];        // Required - Multiple images array
  mainImage?: ProductImage;      // Optional - Computed main image
  features: string[];            // Required - Product features array
  price?: string;                // Optional - Pricing information
  tags: string[];                // Required - Product tags array
}
```

**Field Analysis**:
- **Required Fields**: id, name, partnerId, partnerName, category, description, images, features, tags
- **Optional Fields**: slug, image (legacy), mainImage, price
- **Relationships**: 
  - Many-to-One with Partner (via partnerId)
  - One-to-Many with ProductImage
  - Many-to-Many with Categories (via category field)
  - Many-to-Many with Tags
- **Validation Rules**:
  - partnerId must reference existing Partner
  - images array should not be empty
  - mainImage should be computed from images array

---

### 4. BlogPost Interface
**Location**: `/lib/types.ts` lines 40-53  
**Purpose**: Blog/content marketing articles

```typescript
interface BlogPost {
  id: string;           // Required - Unique identifier
  slug: string;         // Required - URL-friendly identifier
  title: string;        // Required - Post title
  excerpt: string;      // Required - Post summary
  content: string;      // Required - Full post content
  author: string;       // Required - Post author
  publishedAt: string;  // Required - Publication date (ISO string)
  category: string;     // Required - Post category
  tags: string[];       // Required - Post tags array
  image?: string;       // Optional - Featured image URL
  featured?: boolean;   // Optional - Featured status flag
  readTime?: string;    // Optional - Estimated read time
}
```

**Field Analysis**:
- **Required Fields**: id, slug, title, excerpt, content, author, publishedAt, category, tags
- **Optional Fields**: image, featured, readTime
- **Relationships**: 
  - Many-to-Many with Categories (via category field)
  - Many-to-Many with Tags
- **Validation Rules**:
  - slug must be unique
  - publishedAt must be valid ISO date string
  - tags array should not be empty

---

### 5. TeamMember Interface
**Location**: `/lib/types.ts` lines 55-63  
**Purpose**: Company team member profiles

```typescript
interface TeamMember {
  id: string;           // Required - Unique identifier
  name: string;         // Required - Member name
  role: string;         // Required - Job title/role
  bio: string;          // Required - Biography
  image?: string;       // Optional - Profile image URL
  email?: string;       // Optional - Contact email
  linkedin?: string;    // Optional - LinkedIn profile URL
}
```

**Field Analysis**:
- **Required Fields**: id, name, role, bio
- **Optional Fields**: image, email, linkedin
- **Relationships**: None (standalone entities)
- **Validation Rules**:
  - email must be valid email format if provided
  - linkedin must be valid URL if provided

---

## Derived/Service Types

### 6. Category Interface
**Location**: `/lib/static-data-service.ts` lines 9-16  
**Purpose**: Technology and content categorization

```typescript
interface Category {
  id: string;           // Required - Unique identifier
  name: string;         // Required - Category display name
  slug: string;         // Required - URL-friendly identifier
  description: string;  // Required - Category description
  icon: string;         // Required - Icon identifier/URL
  color: string;        // Required - Brand color (hex)
}
```

**Field Analysis**:
- **Required Fields**: All fields required
- **Relationships**: 
  - One-to-Many with Partners
  - One-to-Many with Products
  - One-to-Many with BlogPosts
- **Validation Rules**:
  - slug must be unique and URL-safe
  - color must be valid hex color format

---

### 7. CompanyInfo Interface
**Location**: `/lib/static-data-service.ts` lines 18-28  
**Purpose**: Single-type company information

```typescript
interface CompanyInfo {
  name: string;         // Required - Company name
  tagline: string;      // Required - Company tagline
  description: string;  // Required - Company description
  founded: number;      // Required - Founding year
  location: string;     // Required - Company location
  address: string;      // Required - Physical address
  phone: string;        // Required - Contact phone
  email: string;        // Required - Contact email
  story: string;        // Required - Company story/about
}
```

**Field Analysis**:
- **Required Fields**: All fields required
- **Type**: Single-type (only one instance)
- **Relationships**: None (standalone single entity)
- **Validation Rules**:
  - email must be valid email format
  - phone must be valid phone format
  - founded must be reasonable year (e.g., > 1800, < current year + 1)

---

## Legacy Types (For Removal)

### 8. Expense Types
**Location**: `/lib/types.ts` lines 65-93  
**Purpose**: Legacy expense tracker functionality (marked for removal)

```typescript
type Expense = {
  id: string
  amount: number
  category: string
  description: string
  date: Date
}

type ExpenseFormData = Omit<Expense, 'id' | 'date'> & {
  date: string
}

const EXPENSE_CATEGORIES = [
  'Food', 'Transportation', 'Housing', 'Utilities', 
  'Entertainment', 'Healthcare', 'Shopping', 'Education', 'Other'
] as const

type DateRange = {
  from: Date | undefined
  to: Date | undefined
}
```

**Status**: **MARKED FOR REMOVAL** - Not part of Strapi integration

---

## Strapi-Specific Types

### 9. StrapiResponse<T>
**Location**: `/lib/strapi-client.ts` lines 7-17  
**Purpose**: Generic Strapi API response wrapper

```typescript
interface StrapiResponse<T> {
  data: T;
  meta: {
    pagination?: {
      page: number;
      pageSize: number;
      pageCount: number;
      total: number;
    };
  };
}
```

### 10. StrapiEntry
**Location**: `/lib/strapi-client.ts` lines 19-25  
**Purpose**: Standard Strapi entity structure

```typescript
interface StrapiEntry {
  id: number;              // Strapi auto-generated ID
  attributes: any;         // Content attributes
  createdAt: string;       // ISO date string
  updatedAt: string;       // ISO date string
  publishedAt: string;     // ISO date string
}
```

---

## Summary Statistics

### Core Data Types: 7
1. Partner (18 entries)
2. Product (36+ entries)
3. ProductImage (Component)
4. BlogPost (8 entries)
5. TeamMember (4 entries)
6. Category (11 entries)
7. CompanyInfo (1 entry - single type)

### Legacy Types: 4 (to be removed)
- Expense, ExpenseFormData, EXPENSE_CATEGORIES, DateRange

### Supporting Types: 2
- StrapiResponse<T>, StrapiEntry

### Total Fields Analyzed: 52
- Required fields: 31
- Optional fields: 21
- Relationship fields: 8

---

## Key Relationships Identified

### Primary Relationships
1. **Partner → Products** (One-to-Many)
   - Field: `Product.partnerId` → `Partner.id`
   - Cardinality: One Partner can have many Products

2. **Products → ProductImages** (One-to-Many Component)
   - Field: `Product.images: ProductImage[]`
   - Cardinality: One Product can have many ProductImages

3. **Products ↔ Categories** (Many-to-Many via category field)
   - Field: `Product.category: string`
   - Implementation: String reference to Category.name

4. **Products ↔ Tags** (Many-to-Many)
   - Field: `Product.tags: string[]`
   - Implementation: String array

5. **BlogPosts ↔ Categories** (Many-to-Many via category field)
   - Field: `BlogPost.category: string`
   - Implementation: String reference to Category.name

6. **BlogPosts ↔ Tags** (Many-to-Many)
   - Field: `BlogPost.tags: string[]`
   - Implementation: String array

### Secondary Relationships
7. **Partners ↔ Categories** (Many-to-Many via category field)
   - Field: `Partner.category: string`
   - Implementation: String reference to Category.name

8. **Partners ↔ Tags** (Many-to-Many)
   - Field: `Partner.tags: string[]`
   - Implementation: String array

---

## Field Type Distribution

### String Fields: 35
- Simple strings: 27
- URLs: 5 (logo, image, website, etc.)
- ISO Date strings: 3 (publishedAt, createdAt, updatedAt)

### Array Fields: 6
- String arrays: 6 (tags, features)
- Object arrays: 1 (images: ProductImage[])

### Boolean Fields: 3
- Optional flags: 2 (featured, isMain)
- Required flags: 1 (isMain in ProductImage)

### Number Fields: 3
- Years: 1 (founded)
- IDs: 2 (Strapi auto-generated IDs)

### Complex Fields: 5
- Object references: 3 (mainImage, pagination meta)
- Component arrays: 1 (images)
- Generic types: 1 (StrapiResponse<T>)

---

## Validation Requirements Summary

### Unique Constraints
- Partner.id, Partner.slug (if provided)
- Product.id, Product.slug (if provided)  
- BlogPost.id, BlogPost.slug
- TeamMember.id
- Category.id, Category.slug

### Foreign Key Constraints
- Product.partnerId must reference existing Partner.id

### Format Validations
- Email fields must be valid email format
- URL fields must be valid URL format
- Date fields must be valid ISO date strings
- Color fields must be valid hex color format

### Business Logic Constraints
- Only one ProductImage per Product should have isMain: true
- Founded year should be reasonable (> 1800, < current year + 1)
- Tags arrays should not be empty for content items

---

## Next Phase: Analysis

The discovered data types reveal a well-structured content model with clear relationships. Key findings:

1. **7 core content types** ready for Strapi integration
2. **8 primary relationships** need Strapi relation configuration
3. **52 total fields** require schema definition
4. **Legacy expense types** can be safely removed
5. **Component structure** needed for ProductImage management

**Recommendation**: Proceed to Phase 2 (Analysis) to map relationships and design optimal Strapi content architecture.