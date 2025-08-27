// Strapi relation and component types
export interface StrapiRelation<T = any> {
  data: T | null;
}

export interface StrapiRelationArray<T = any> {
  data: T[];
}

export interface StrapiMediaFile {
  id: number;
  name: string;
  alternativeText?: string;
  caption?: string;
  width?: number;
  height?: number;
  formats?: any;
  hash: string;
  ext: string;
  mime: string;
  size: number;
  url: string;
  previewUrl?: string;
  provider: string;
  createdAt: string;
  updatedAt: string;
}

// Component types
export interface ProductImage {
  id: string;
  url: string; // TinaCMS direct image path
  alt_text?: string;
  altText?: string; // Computed from alt_text for backward compatibility
  is_main?: boolean;
  isMain: boolean; // TinaCMS uses isMain directly
  caption?: string;
  order?: number;
}

export interface Feature {
  id: string;
  title: string;
  description?: string;
  icon?: string;
  order?: number;
}

export interface SEO {
  id: string;
  meta_title?: string;
  meta_description?: string;
  keywords?: string;
  og_image?: StrapiRelation<StrapiMediaFile>;
  canonical_url?: string;
  no_index?: boolean;
}

export interface SocialMedia {
  id: string;
  facebook?: string;
  twitter?: string;
  linkedin?: string;
  instagram?: string;
  youtube?: string;
}

// Reference data types
export interface Category {
  id: string;
  name: string;
  slug: string;
  description: string;
  icon: string;
  color: string;
  order?: number;
  createdAt: string;
  updatedAt: string;
  publishedAt: string;
}

export interface BlogCategory {
  id: string;
  name: string;
  slug: string;
  description?: string;
  color?: string;
  order?: number;
  createdAt: string;
  updatedAt: string;
  publishedAt: string;
}

export interface Tag {
  id: string;
  name: string;
  slug: string;
  description?: string;
  color?: string;
  usage_count?: number;
  createdAt: string;
  updatedAt: string;
  publishedAt: string;
}

// Main application types - updated for Strapi integration
export interface Partner {
  id: string;
  slug?: string;
  name: string;
  description: string;
  logo?: string; // TinaCMS uses direct string paths
  image?: string; // TinaCMS uses direct string paths
  website?: string;
  founded?: number;
  location?: string;
  featured?: boolean;
  createdAt?: string;
  updatedAt?: string;
  publishedAt?: string;
  
  // TinaCMS simplified relations
  category?: string; // Resolved category name
  tags?: string[]; // Resolved tag names array
  products?: Product[];
  seo?: SEO;
  
  // Computed/backward compatibility fields
  categoryName?: string; // Alias for category
  tagNames?: string[]; // Alias for tags
  logoUrl?: string; // Alias for logo
  imageUrl?: string; // Alias for image
}

export interface Product {
  id: string;
  slug?: string;
  name: string;
  description: string;
  price?: string;
  image?: string; // TinaCMS uses direct string paths
  createdAt?: string;
  updatedAt?: string;
  publishedAt?: string;
  
  // TinaCMS simplified relations
  partnerId?: string; // Resolved partner ID
  partnerName?: string; // Resolved partner name
  category?: string; // Resolved category name
  tags?: string[]; // Resolved tag names array
  seo?: SEO;
  
  // Components (simplified structure)
  images: ProductImage[]; // Product images array
  features: Feature[]; // Product features array
  
  // Computed/backward compatibility fields
  categoryName?: string; // Alias for category
  tagNames?: string[]; // Alias for tags
  mainImage?: ProductImage; // Computed from images.find(img => img.isMain)
  imageUrl?: string; // Alias for image or mainImage.url
}

export interface BlogPost {
  id: string;
  slug: string;
  title: string;
  excerpt: string;
  content: string;
  author: string;
  publishedAt: string; // TinaCMS uses single publishedAt field
  featured?: boolean;
  readTime?: string; // TinaCMS uses direct readTime field
  image?: string; // TinaCMS uses direct string paths
  createdAt?: string;
  updatedAt?: string;
  
  // TinaCMS simplified relations
  category?: string; // Resolved blog category name
  tags?: string[]; // Resolved tag names array
  seo?: SEO;
  
  // Computed/backward compatibility fields
  published_at?: string; // Alias for publishedAt
  read_time?: string; // Alias for readTime
  tagNames?: string[]; // Alias for tags
  imageUrl?: string; // Alias for image
}

export interface TeamMember {
  id: string;
  name: string;
  role: string;
  bio: string;
  image?: string; // TinaCMS uses direct string paths
  email?: string;
  linkedin?: string;
  order?: number;
  createdAt?: string;
  updatedAt?: string;
  publishedAt?: string;
  
  // Computed fields (for backward compatibility)
  imageUrl?: string; // Alias for image
}

export interface CompanyInfo {
  id?: string;
  name: string;
  tagline: string;
  description: string;
  founded: number;
  location: string;
  address: string;
  phone: string;
  email: string;
  story: string;
  logo?: string; // TinaCMS uses direct string paths
  createdAt?: string;
  updatedAt?: string;
  publishedAt?: string;
  
  // Components
  social_media?: SocialMedia;
  seo?: SEO;
  
  // Computed fields (for backward compatibility)
  logoUrl?: string; // Alias for logo
}

// Legacy expense tracker types (keeping for backward compatibility)
export type Expense = {
  id: string
  amount: number
  category: string
  description: string
  date: Date
}

export type ExpenseFormData = Omit<Expense, 'id' | 'date'> & {
  date: string
}

export const EXPENSE_CATEGORIES = [
  'Food',
  'Transportation',
  'Housing',
  'Utilities',
  'Entertainment',
  'Healthcare',
  'Shopping',
  'Education',
  'Other'
] as const

export type DateRange = {
  from: Date | undefined
  to: Date | undefined
}