/**
 * TypeScript types for TinaCMS content
 * 
 * These types correspond to the TinaCMS schema configuration
 * and provide type safety for content throughout the application.
 */

// Base SEO fields used across multiple content types
export interface SEOFields {
  meta_title?: string;
  meta_description?: string;
  keywords?: string;
  og_image?: string;
  canonical_url?: string;
  no_index?: boolean;
}

// Category (Reference Data)
export interface Category {
  name: string;
  slug: string;
  description: string;
  icon?: string;
  color?: string;
  order?: number;
}

// Tag (Reference Data)
export interface Tag {
  name: string;
  slug: string;
  description?: string;
  color?: string;
  usage_count?: number;
}

// Blog Category (Reference Data)
export interface BlogCategory {
  name: string;
  slug: string;
  description?: string;
  color?: string;
  order?: number;
}

// Partner (Main Content)
export interface Partner {
  name: string;
  slug: string;
  description: string; // rich-text
  logo?: string;
  image?: string;
  website?: string;
  founded?: number;
  location?: string;
  featured?: boolean;
  category?: Category;
  tags?: Tag[];
  seo?: SEOFields;
}

// Product Image Component
export interface ProductImage {
  image: string;
  alt_text?: string;
  is_main?: boolean;
  caption?: string;
  order?: number;
}

// Product Feature Component
export interface ProductFeature {
  title: string;
  description?: string;
  icon?: string;
  order?: number;
}

// Product (Main Content)
export interface Product {
  name: string;
  slug?: string;
  description: string; // rich-text
  price?: string;
  partner: Partner;
  category?: Category;
  tags?: Tag[];
  product_images?: ProductImage[];
  features?: ProductFeature[];
  seo?: SEOFields;
}

// Blog Post (Main Content)
export interface BlogPost {
  title: string;
  slug: string;
  excerpt: string;
  content: string; // rich-text (isBody: true)
  author: string;
  published_at: string; // datetime
  featured?: boolean;
  read_time?: string;
  image?: string;
  blog_category?: BlogCategory;
  tags?: Tag[];
  seo?: SEOFields;
}

// Team Member (Main Content)
export interface TeamMember {
  name: string;
  role: string;
  bio: string; // rich-text (isBody: true)
  image?: string;
  email?: string;
  linkedin?: string;
  order?: number;
}

// Social Media Component
export interface SocialMedia {
  facebook?: string;
  twitter?: string;
  linkedin?: string;
  instagram?: string;
  youtube?: string;
}

// Company Info (Single-Type)
export interface CompanyInfo {
  name: string;
  tagline: string;
  description: string; // rich-text
  founded: number;
  location: string;
  address: string;
  phone: string;
  email: string;
  story: string; // rich-text
  logo?: string;
  social_media?: SocialMedia;
  seo?: SEOFields;
}

// Collection Query Response Types
export interface CategoryResponse {
  category: Category;
}

export interface PartnerResponse {
  partner: Partner;
}

export interface ProductResponse {
  product: Product;
}

export interface BlogPostResponse {
  blogPost: BlogPost;
}

export interface TeamMemberResponse {
  teamMember: TeamMember;
}

export interface CompanyInfoResponse {
  companyInfo: CompanyInfo;
}

// Collection Connection Types (for listing queries)
export interface CategoryConnection {
  categoryConnection: {
    edges: Array<{
      node: Category;
    }>;
  };
}

export interface PartnerConnection {
  partnerConnection: {
    edges: Array<{
      node: Partner;
    }>;
  };
}

export interface ProductConnection {
  productConnection: {
    edges: Array<{
      node: Product;
    }>;
  };
}

export interface BlogPostConnection {
  blogPostConnection: {
    edges: Array<{
      node: BlogPost;
    }>;
  };
}

export interface TeamMemberConnection {
  teamMemberConnection: {
    edges: Array<{
      node: TeamMember;
    }>;
  };
}

// Helper types for content processing
export interface ContentReference {
  relativePath: string;
}

export interface TinaMarkdownContent {
  body: string;
  [key: string]: any;
}

// Utility type for TinaCMS query variables
export interface TinaQueryVariables {
  relativePath: string;
  [key: string]: any;
}

// Content collection identifiers
export type CollectionName = 
  | 'category'
  | 'tag'
  | 'blogCategory'
  | 'partner'
  | 'product'
  | 'blogPost'
  | 'teamMember'
  | 'companyInfo';

// Generic TinaCMS response structure
export interface TinaResponse<T> {
  data: T;
  errors?: Array<{
    message: string;
    path?: string[];
  }>;
}