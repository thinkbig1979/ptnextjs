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
  image?: StrapiRelation<StrapiMediaFile>;
  url: string; // Computed from image.data.attributes.url
  alt_text?: string;
  altText?: string; // Computed from alt_text for backward compatibility
  is_main: boolean;
  isMain: boolean; // Computed from is_main for backward compatibility
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
  logo?: StrapiRelation<StrapiMediaFile>;
  image?: StrapiRelation<StrapiMediaFile>;
  website?: string;
  founded?: number;
  location?: string;
  featured?: boolean;
  createdAt: string;
  updatedAt: string;
  publishedAt: string;
  
  // Relations
  category?: StrapiRelation<Category>;
  tags?: StrapiRelationArray<Tag>;
  products?: StrapiRelationArray<Product>;
  seo?: SEO;
  
  // Computed/backward compatibility fields
  categoryName?: string; // Computed from category.data.attributes.name
  tagNames?: string[]; // Computed from tags.data[].attributes.name
  logoUrl?: string; // Computed from logo.data.attributes.url
  imageUrl?: string; // Computed from image.data.attributes.url
}

export interface Product {
  id: string;
  slug?: string;
  name: string;
  description: string;
  price?: string;
  image?: StrapiRelation<StrapiMediaFile>; // Legacy field for backward compatibility
  createdAt: string;
  updatedAt: string;
  publishedAt: string;
  
  // Relations
  partner?: StrapiRelation<Partner>;
  category?: StrapiRelation<Category>;
  tags?: StrapiRelationArray<Tag>;
  seo?: SEO;
  
  // Components
  product_images: ProductImage[];
  features: Feature[];
  
  // Computed/backward compatibility fields
  partnerId?: string; // Computed from partner.data.id
  partnerName?: string; // Computed from partner.data.attributes.name
  categoryName?: string; // Computed from category.data.attributes.name
  tagNames?: string[]; // Computed from tags.data[].attributes.name
  images?: ProductImage[]; // Alias for product_images
  mainImage?: ProductImage; // Computed from product_images.find(img => img.isMain)
  imageUrl?: string; // Computed from image.data.attributes.url or mainImage.url
}

export interface BlogPost {
  id: string;
  slug: string;
  title: string;
  excerpt: string;
  content: string;
  author: string;
  published_at: string;
  publishedAt: string; // Computed from published_at for backward compatibility
  featured?: boolean;
  read_time?: string;
  readTime?: string; // Computed from read_time for backward compatibility
  image?: StrapiRelation<StrapiMediaFile>;
  createdAt: string;
  updatedAt: string;
  
  // Relations
  blog_category?: StrapiRelation<BlogCategory>;
  tags?: StrapiRelationArray<Tag>;
  seo?: SEO;
  
  // Computed/backward compatibility fields
  category?: string; // Computed from blog_category.data.attributes.name
  tagNames?: string[]; // Computed from tags.data[].attributes.name
  imageUrl?: string; // Computed from image.data.attributes.url
}

export interface TeamMember {
  id: string;
  name: string;
  role: string;
  bio: string;
  image?: StrapiRelation<StrapiMediaFile>;
  email?: string;
  linkedin?: string;
  order?: number;
  createdAt: string;
  updatedAt: string;
  publishedAt: string;
  
  // Computed fields
  imageUrl?: string; // Computed from image.data.attributes.url
}

export interface CompanyInfo {
  id: string;
  name: string;
  tagline: string;
  description: string;
  founded: number;
  location: string;
  address: string;
  phone: string;
  email: string;
  story: string;
  logo?: StrapiRelation<StrapiMediaFile>;
  createdAt: string;
  updatedAt: string;
  publishedAt: string;
  
  // Components
  social_media?: SocialMedia;
  seo?: SEO;
  
  // Computed fields
  logoUrl?: string; // Computed from logo.data.attributes.url
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