
// STEP 6: Payload CMS Isolated API Integration
// 
// This module provides functions to fetch data from the Payload CMS REST API
// running as a completely separate service. No routing coupling with Next.js.
//
// Architecture:
// - Payload CMS runs independently on port 3001
// - Next.js runs independently on port 3000  
// - Communication happens via explicit HTTP calls to CMS endpoints
// - No middleware proxying or routing conflicts

import { BlogPost, Partner, Product } from './types';

// Configuration for isolated CMS service
const PAYLOAD_API_BASE_URL = process.env.PAYLOAD_API_BASE_URL || 'http://localhost:3001/api';
const PAYLOAD_CMS_HOST = process.env.PAYLOAD_CMS_HOST || 'localhost';
const PAYLOAD_CMS_PORT = process.env.PAYLOAD_CMS_PORT || '3001';

// Construct full API URL for explicit service communication
const API_BASE_URL = process.env.PAYLOAD_API_BASE_URL || `http://${PAYLOAD_CMS_HOST}:${PAYLOAD_CMS_PORT}/api`;

// Generic API fetch function with error handling for isolated CMS service
async function apiRequest<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
  const url = `${API_BASE_URL}${endpoint}`;
  
  try {
    const response = await fetch(url, {
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
      ...options,
    });

    if (!response.ok) {
      throw new Error(`API request failed: ${response.status} ${response.statusText}`);
    }

    const data = await response.json();
    return data;
    
  } catch (error) {
    console.error(`API Error for ${endpoint}:`, error);
    // Return empty result for graceful fallback
    return { docs: [], totalDocs: 0, totalPages: 0, page: 1 } as T;
  }
}

// Type definitions for Payload API responses
interface PayloadResponse<T> {
  docs: T[];
  totalDocs: number;
  totalPages: number;
  page: number;
  hasPrevPage: boolean;
  hasNextPage: boolean;
  prevPage?: number;
  nextPage?: number;
}

interface PayloadCategory {
  id: string;
  name: string;
  slug: string;
  description?: string;
  type: 'partner' | 'blog';
  createdAt: string;
  updatedAt: string;
}

interface PayloadAuthor {
  id: string;
  name: string;
  role: string;
  email: string;
  bio: string;
  createdAt: string;
  updatedAt: string;
}

interface PayloadPartner {
  id: string;
  name: string;
  category: PayloadCategory;
  description: string;
  logo?: {
    id: string;
    url: string;
    filename: string;
  };
  website?: string;
  founded?: number;
  location?: string;
  tags: { tag: string }[];
  featured: boolean;
  createdAt: string;
  updatedAt: string;
}

interface PayloadProduct {
  id: string;
  name: string;
  partner: PayloadPartner;
  category: PayloadCategory;
  description: string;
  image?: {
    id: string;
    url: string;
    filename: string;
  };
  features: { feature: string }[];
  price?: string;
  tags: { tag: string }[];
  createdAt: string;
  updatedAt: string;
}

interface PayloadBlogPost {
  id: string;
  title: string;
  slug: string;
  excerpt: string;
  content: any; // Rich text content
  author: PayloadAuthor;
  publishedAt: string;
  category: PayloadCategory;
  tags: { tag: string }[];
  image?: {
    id: string;
    url: string;
    filename: string;
  };
  featured: boolean;
  readTime?: string;
  createdAt: string;
  updatedAt: string;
}

// Transform functions to convert Payload objects to our app types
function transformPayloadPartner(payloadPartner: PayloadPartner): Partner {
  return {
    id: payloadPartner.id,
    name: payloadPartner.name,
    category: payloadPartner.category?.name || 'Other',
    description: payloadPartner.description,
    logo: payloadPartner.logo?.url,
    website: payloadPartner.website,
    founded: payloadPartner.founded,
    location: payloadPartner.location,
    tags: payloadPartner.tags?.map(t => t.tag) || [],
    featured: payloadPartner.featured,
  };
}

function transformPayloadProduct(payloadProduct: PayloadProduct): Product {
  return {
    id: payloadProduct.id,
    name: payloadProduct.name,
    partnerId: payloadProduct.partner?.id || '',
    partnerName: payloadProduct.partner?.name || '',
    category: payloadProduct.category?.name || 'Other',
    description: payloadProduct.description,
    image: payloadProduct.image?.url,
    features: payloadProduct.features?.map(f => f.feature) || [],
    price: payloadProduct.price,
    tags: payloadProduct.tags?.map(t => t.tag) || [],
  };
}

function transformPayloadBlogPost(payloadBlogPost: PayloadBlogPost): BlogPost {
  // Convert rich text content to plain text for now
  let contentText = '';
  if (payloadBlogPost.content && Array.isArray(payloadBlogPost.content)) {
    contentText = payloadBlogPost.content
      .map((block: any) => {
        if (block.children) {
          return block.children.map((child: any) => child.text || '').join(' ');
        }
        return '';
      })
      .join('\n\n');
  }

  return {
    id: payloadBlogPost.id,
    slug: payloadBlogPost.slug,
    title: payloadBlogPost.title,
    excerpt: payloadBlogPost.excerpt,
    content: contentText || payloadBlogPost.excerpt,
    author: payloadBlogPost.author?.name || 'Unknown',
    publishedAt: payloadBlogPost.publishedAt,
    category: payloadBlogPost.category?.name || 'General',
    tags: payloadBlogPost.tags?.map(t => t.tag) || [],
    image: payloadBlogPost.image?.url,
    featured: payloadBlogPost.featured,
    readTime: payloadBlogPost.readTime,
  };
}

// API Functions

/**
 * Fetch all partners from Payload CMS
 */
export async function fetchPartners(): Promise<Partner[]> {
  try {
    const response = await apiRequest<PayloadResponse<PayloadPartner>>('/partners?limit=100&depth=2');
    return response.docs?.map(transformPayloadPartner) || [];
  } catch (error) {
    console.error('Error fetching partners:', error);
    return [];
  }
}

/**
 * Fetch a single partner by ID
 */
export async function fetchPartnerById(id: string): Promise<Partner | null> {
  try {
    const response = await apiRequest<PayloadPartner>(`/partners/${id}?depth=2`);
    return response ? transformPayloadPartner(response) : null;
  } catch (error) {
    console.error(`Error fetching partner ${id}:`, error);
    return null;
  }
}

/**
 * Fetch all products from Payload CMS
 */
export async function fetchProducts(): Promise<Product[]> {
  try {
    const response = await apiRequest<PayloadResponse<PayloadProduct>>('/products?limit=200&depth=2');
    return response.docs?.map(transformPayloadProduct) || [];
  } catch (error) {
    console.error('Error fetching products:', error);
    return [];
  }
}

/**
 * Fetch a single product by ID
 */
export async function fetchProductById(id: string): Promise<Product | null> {
  try {
    const response = await apiRequest<PayloadProduct>(`/products/${id}?depth=2`);
    return response ? transformPayloadProduct(response) : null;
  } catch (error) {
    console.error(`Error fetching product ${id}:`, error);
    return null;
  }
}

/**
 * Fetch all blog posts from Payload CMS
 */
export async function fetchBlogPosts(): Promise<BlogPost[]> {
  try {
    const response = await apiRequest<PayloadResponse<PayloadBlogPost>>('/blog-posts?limit=100&depth=2&sort=-publishedAt');
    return response.docs?.map(transformPayloadBlogPost) || [];
  } catch (error) {
    console.error('Error fetching blog posts:', error);
    return [];
  }
}

/**
 * Fetch a single blog post by slug
 */
export async function fetchBlogPostBySlug(slug: string): Promise<BlogPost | null> {
  try {
    const response = await apiRequest<PayloadResponse<PayloadBlogPost>>(`/blog-posts?where[slug][equals]=${encodeURIComponent(slug)}&depth=2`);
    const post = response.docs?.[0];
    return post ? transformPayloadBlogPost(post) : null;
  } catch (error) {
    console.error(`Error fetching blog post ${slug}:`, error);
    return null;
  }
}

/**
 * Fetch categories from Payload CMS
 */
export async function fetchCategories(): Promise<PayloadCategory[]> {
  try {
    const response = await apiRequest<PayloadResponse<PayloadCategory>>('/categories?limit=100');
    return response.docs || [];
  } catch (error) {
    console.error('Error fetching categories:', error);
    return [];
  }
}

/**
 * Fetch partners by category
 */
export async function fetchPartnersByCategory(categoryName: string): Promise<Partner[]> {
  if (!categoryName || categoryName === 'all') {
    return fetchPartners();
  }
  
  try {
    const response = await apiRequest<PayloadResponse<PayloadPartner>>(`/partners?where[category.name][equals]=${encodeURIComponent(categoryName)}&limit=100&depth=2`);
    return response.docs?.map(transformPayloadPartner) || [];
  } catch (error) {
    console.error(`Error fetching partners by category ${categoryName}:`, error);
    return [];
  }
}

/**
 * Fetch products by category
 */
export async function fetchProductsByCategory(categoryName: string): Promise<Product[]> {
  if (!categoryName || categoryName === 'all') {
    return fetchProducts();
  }
  
  try {
    const response = await apiRequest<PayloadResponse<PayloadProduct>>(`/products?where[category.name][equals]=${encodeURIComponent(categoryName)}&limit=200&depth=2`);
    return response.docs?.map(transformPayloadProduct) || [];
  } catch (error) {
    console.error(`Error fetching products by category ${categoryName}:`, error);
    return [];
  }
}

/**
 * Fetch products by partner ID
 */
export async function fetchProductsByPartnerId(partnerId: string): Promise<Product[]> {
  try {
    const response = await apiRequest<PayloadResponse<PayloadProduct>>(`/products?where[partner][equals]=${partnerId}&limit=200&depth=2`);
    return response.docs?.map(transformPayloadProduct) || [];
  } catch (error) {
    console.error(`Error fetching products by partner ${partnerId}:`, error);
    return [];
  }
}

/**
 * Search partners
 */
export async function searchPartners(query: string): Promise<Partner[]> {
  try {
    const response = await apiRequest<PayloadResponse<PayloadPartner>>(`/partners?where[or][0][name][contains]=${encodeURIComponent(query)}&where[or][1][description][contains]=${encodeURIComponent(query)}&limit=100&depth=2`);
    return response.docs?.map(transformPayloadPartner) || [];
  } catch (error) {
    console.error(`Error searching partners with query ${query}:`, error);
    return [];
  }
}

/**
 * Search products
 */
export async function searchProducts(query: string): Promise<Product[]> {
  try {
    const response = await apiRequest<PayloadResponse<PayloadProduct>>(`/products?where[or][0][name][contains]=${encodeURIComponent(query)}&where[or][1][description][contains]=${encodeURIComponent(query)}&limit=200&depth=2`);
    return response.docs?.map(transformPayloadProduct) || [];
  } catch (error) {
    console.error(`Error searching products with query ${query}:`, error);
    return [];
  }
}

/**
 * Search blog posts
 */
export async function searchBlogPosts(query: string): Promise<BlogPost[]> {
  try {
    const response = await apiRequest<PayloadResponse<PayloadBlogPost>>(`/blog-posts?where[or][0][title][contains]=${encodeURIComponent(query)}&where[or][1][excerpt][contains]=${encodeURIComponent(query)}&limit=100&depth=2&sort=-publishedAt`);
    return response.docs?.map(transformPayloadBlogPost) || [];
  } catch (error) {
    console.error(`Error searching blog posts with query ${query}:`, error);
    return [];
  }
}

/**
 * Health check function to test isolated CMS service connectivity
 */
export async function checkPayloadAPIHealth(): Promise<boolean> {
  try {
    const response = await fetch(`${API_BASE_URL}/health`);
    return response.ok;
  } catch (error) {
    console.error('Isolated Payload CMS API health check failed:', error);
    console.error(`Attempted to connect to: ${API_BASE_URL}/health`);
    return false;
  }
}
