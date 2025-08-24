// Main application types
export interface Partner {
  id: string;
  slug?: string;
  name: string;
  category: string;
  description: string;
  logo?: string;
  image?: string; // Partner overview/company image
  website?: string;
  founded?: number;
  location?: string;
  tags: string[];
  featured?: boolean;
}

export interface ProductImage {
  id: string;
  url: string;
  altText?: string;
  isMain: boolean;
}

export interface Product {
  id: string;
  slug?: string;
  name: string;
  partnerId: string;
  partnerName: string;
  category: string;
  description: string;
  image?: string; // For backward compatibility
  images: ProductImage[];
  mainImage?: ProductImage;
  features: string[];
  price?: string;
  tags: string[];
}

export interface BlogPost {
  id: string;
  slug: string;
  title: string;
  excerpt: string;
  content: string;
  author: string;
  publishedAt: string;
  category: string;
  tags: string[];
  image?: string;
  featured?: boolean;
  readTime?: string;
}

export interface TeamMember {
  id: string;
  name: string;
  role: string;
  bio: string;
  image?: string;
  email?: string;
  linkedin?: string;
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