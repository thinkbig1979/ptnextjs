/**
 * Payload CMS Data Service
 * Replicates TinaCMSDataService interface but fetches from Payload CMS database
 */

import { getPayload } from 'payload';
import config from '@/payload.config';
import type { Vendor, Partner, Product, BlogPost, TeamMember } from './types';

interface Category {
  id: string;
  name: string;
  slug: string;
  description: string;
  icon: string;
  color: string;
}

interface CompanyInfo {
  name: string;
  tagline: string;
  description: string;
  founded: number;
  location: string;
  address: string;
  phone: string;
  email: string;
  story: string;
}

interface CacheEntry<T> {
  data: T;
  timestamp: number;
  accessCount: number;
}

class PayloadCMSDataService {
  private cache: Map<string, CacheEntry<any>> = new Map();
  private readonly CACHE_TTL = 5 * 60 * 1000; // 5 minutes (matching TinaCMS service)

  private async getCached<T>(key: string, fetcher: () => Promise<T>): Promise<T> {
    const cached = this.cache.get(key);
    const now = Date.now();

    if (cached && now - cached.timestamp < this.CACHE_TTL) {
      cached.accessCount++;
      if (process.env.NODE_ENV === 'development') {
        console.log(`📋 Cache hit for ${key} (accessed ${cached.accessCount} times)`);
      }
      return cached.data;
    }

    if (process.env.NODE_ENV === 'development') {
      console.log(`🔄 Cache miss - Fetching ${key} from Payload CMS...`);
    }

    const data = await fetcher();
    this.cache.set(key, {
      data,
      timestamp: now,
      accessCount: 1,
    });

    if (process.env.NODE_ENV === 'development') {
      console.log(`✅ Cached ${key} (${this.cache.size} total entries)`);
    }

    return data;
  }

  private transformMediaPath(mediaPath: string): string {
    if (!mediaPath) return '';
    if (mediaPath.startsWith('http')) return mediaPath;
    if (mediaPath.startsWith('/media/')) return mediaPath;
    if (mediaPath.startsWith('/')) return mediaPath;
    return `/media/${mediaPath.replace(/^\/+/, '')}`;
  }

  private transformPayloadVendor(doc: any): Vendor {
    return {
      id: doc.id.toString(),
      slug: doc.slug,
      name: doc.name,
      category: doc.category?.name || '',
      description: doc.description || '',
      logo: this.transformMediaPath(doc.logo || ''),
      image: this.transformMediaPath(doc.image || ''),
      website: doc.website || '',
      founded: doc.founded,
      location: doc.location || '',
      tags: [],
      featured: doc.featured || false,
      partner: doc.partner !== undefined ? doc.partner : true,
      services: doc.services || [],
      certifications: doc.certifications || [],
      awards: doc.awards || [],
      socialProof: doc.socialProof,
      videoIntroduction: doc.videoIntroduction,
      caseStudies: doc.caseStudies || [],
      innovationHighlights: doc.innovationHighlights || [],
      teamMembers: doc.teamMembers || [],
      yachtProjects: doc.yachtProjects || [],
    };
  }

  private transformPayloadProduct(doc: any): Product {
    const vendor = doc.vendor;
    const mainImage = doc.images?.find((img: any) => img.isMain) || doc.images?.[0];

    return {
      id: doc.id.toString(),
      slug: doc.slug,
      name: doc.name,
      vendorId: vendor?.id?.toString() || '',
      vendorName: vendor?.name || '',
      partnerId: vendor?.id?.toString() || '',
      partnerName: vendor?.name || '',
      category: doc.categories?.[0]?.name || '',
      description: doc.description || '',
      image: this.transformMediaPath(mainImage?.url || ''),
      images: doc.images?.map((img: any) => ({
        id: img.url,
        url: this.transformMediaPath(img.url || ''),
        altText: img.altText || '',
        isMain: img.isMain || false,
      })) || [],
      features: [],
      price: doc.price,
      tags: [],
      comparisonMetrics: {},
      specifications: doc.specifications?.map((spec: any) => ({
        label: spec.label,
        value: spec.value,
      })) || [],
      integrationCompatibility: [],
      vendor: vendor ? this.transformPayloadVendor(vendor) : undefined,
      partner: vendor ? this.transformPayloadVendor(vendor) : undefined,
    };
  }

  private transformPayloadBlogPost(doc: any): BlogPost {
    return {
      id: doc.id.toString(),
      slug: doc.slug,
      title: doc.title,
      excerpt: doc.excerpt || '',
      content: doc.content || '',
      author: doc.author?.email || '',
      publishedAt: doc.publishedAt || doc.createdAt,
      category: doc.categories?.[0]?.name || '',
      tags: doc.tags?.map((tag: any) => tag.tag) || [],
      image: this.transformMediaPath(doc.featuredImage || ''),
      featured: doc.published || false,
      readTime: 5,
    };
  }

  private transformPayloadTeamMember(doc: any): TeamMember {
    return {
      id: doc.id.toString(),
      name: doc.name,
      role: doc.role,
      bio: doc.bio || '',
      image: this.transformMediaPath(doc.image || ''),
      email: doc.email || '',
      linkedin: doc.linkedin || '',
      order: doc.order || 999,
    };
  }

  // Vendors
  async getAllVendors(): Promise<Vendor[]> {
    return this.getCached('vendors', async () => {
      const payload = await getPayload({ config });
      const result = await payload.find({
        collection: 'vendors',
        limit: 1000,
        depth: 2,
      });

      return result.docs.map(doc => this.transformPayloadVendor(doc));
    });
  }

  async getVendors(params?: { category?: string; featured?: boolean; partnersOnly?: boolean }): Promise<Vendor[]> {
    const allVendors = await this.getAllVendors();
    let filtered = allVendors;

    if (params?.category && params.category !== 'all') {
      filtered = filtered.filter(vendor => vendor.category === params.category);
    }

    if (params?.featured) {
      filtered = filtered.filter(vendor => vendor.featured);
    }

    if (params?.partnersOnly) {
      filtered = filtered.filter(vendor => vendor.partner === true);
    }

    return filtered;
  }

  async getVendorBySlug(slug: string): Promise<Vendor | null> {
    return this.getCached(`vendor:${slug}`, async () => {
      const payload = await getPayload({ config });
      const result = await payload.find({
        collection: 'vendors',
        where: { slug: { equals: slug } },
        limit: 1,
        depth: 2,
      });

      return result.docs[0] ? this.transformPayloadVendor(result.docs[0]) : null;
    });
  }

  async getVendorById(id: string): Promise<Vendor | null> {
    return this.getCached(`vendor-id:${id}`, async () => {
      const payload = await getPayload({ config });
      const doc = await payload.findByID({
        collection: 'vendors',
        id,
        depth: 2,
      });

      return doc ? this.transformPayloadVendor(doc) : null;
    });
  }

  async getFeaturedVendors(): Promise<Vendor[]> {
    return this.getVendors({ featured: true });
  }

  // Partners (backward compatibility)
  async getAllPartners(): Promise<Partner[]> {
    const vendors = await this.getAllVendors();
    return vendors.map(vendor => ({ ...vendor } as Partner));
  }

  async getPartners(params?: { category?: string; featured?: boolean }): Promise<Partner[]> {
    const vendors = await this.getVendors({ ...params, partnersOnly: true });
    return vendors.map(vendor => ({ ...vendor } as Partner));
  }

  async getFeaturedPartners(): Promise<Partner[]> {
    return this.getCached('featured-partners', async () => {
      const allVendors = await this.getAllVendors();
      const featuredPartners = allVendors.filter(
        vendor => vendor.featured === true && vendor.partner === true
      );
      return featuredPartners.map(vendor => ({ ...vendor } as Partner));
    });
  }

  async getPartnerBySlug(slug: string): Promise<Partner | null> {
    const vendor = await this.getVendorBySlug(slug);
    return vendor ? ({ ...vendor } as Partner) : null;
  }

  async getPartnerById(id: string): Promise<Partner | null> {
    const vendor = await this.getVendorById(id);
    return vendor ? ({ ...vendor } as Partner) : null;
  }

  // Products
  async getAllProducts(): Promise<Product[]> {
    return this.getCached('products', async () => {
      const payload = await getPayload({ config });
      const result = await payload.find({
        collection: 'products',
        where: { published: { equals: true } },
        limit: 1000,
        depth: 3,
      });

      return result.docs.map(doc => this.transformPayloadProduct(doc));
    });
  }

  async getProducts(params?: { category?: string; partnerId?: string; vendorId?: string }): Promise<Product[]> {
    const allProducts = await this.getAllProducts();
    let filtered = allProducts;

    if (params?.category && params.category !== 'all') {
      filtered = filtered.filter(product => product.category === params.category);
    }

    const targetId = params?.vendorId || params?.partnerId;
    if (targetId) {
      filtered = filtered.filter(
        product => product.vendorId === targetId || product.partnerId === targetId
      );
    }

    return filtered;
  }

  async getProductBySlug(slug: string): Promise<Product | null> {
    return this.getCached(`product:${slug}`, async () => {
      const payload = await getPayload({ config });
      const result = await payload.find({
        collection: 'products',
        where: { slug: { equals: slug } },
        limit: 1,
        depth: 3,
      });

      return result.docs[0] ? this.transformPayloadProduct(result.docs[0]) : null;
    });
  }

  async getProductById(id: string): Promise<Product | null> {
    const products = await this.getAllProducts();
    return products.find(product => product.id === id) || null;
  }

  async getProductsByVendor(vendorId: string): Promise<Product[]> {
    return this.getProducts({ vendorId });
  }

  async getProductsByPartner(partnerId: string): Promise<Product[]> {
    return this.getProducts({ partnerId });
  }

  // Categories
  async getCategories(): Promise<Category[]> {
    return this.getCached('categories', async () => {
      const payload = await getPayload({ config });
      const result = await payload.find({
        collection: 'categories',
        limit: 1000,
      });

      return result.docs.map(doc => ({
        id: doc.id.toString(),
        name: doc.name,
        slug: doc.slug,
        description: doc.description || '',
        icon: doc.icon || '',
        color: doc.color || '#0066cc',
      }));
    });
  }

  async getBlogCategories(): Promise<Category[]> {
    return this.getCategories();
  }

  // Blog Posts
  async getAllBlogPosts(): Promise<BlogPost[]> {
    return this.getCached('blog-posts', async () => {
      const payload = await getPayload({ config });
      const result = await payload.find({
        collection: 'blog-posts',
        where: { published: { equals: true } },
        limit: 1000,
        depth: 2,
        sort: '-publishedAt',
      });

      return result.docs.map(doc => this.transformPayloadBlogPost(doc));
    });
  }

  async getBlogPosts(params?: { category?: string; featured?: boolean }): Promise<BlogPost[]> {
    const allPosts = await this.getAllBlogPosts();
    let filtered = allPosts;

    if (params?.category) {
      filtered = filtered.filter(post => post.category === params.category);
    }

    if (params?.featured) {
      filtered = filtered.filter(post => post.featured);
    }

    return filtered;
  }

  async getBlogPostBySlug(slug: string): Promise<BlogPost | null> {
    return this.getCached(`blog-post:${slug}`, async () => {
      const payload = await getPayload({ config });
      const result = await payload.find({
        collection: 'blog-posts',
        where: { slug: { equals: slug } },
        limit: 1,
        depth: 2,
      });

      return result.docs[0] ? this.transformPayloadBlogPost(result.docs[0]) : null;
    });
  }

  // Team Members
  async getTeamMembers(): Promise<TeamMember[]> {
    return this.getCached('team-members', async () => {
      const payload = await getPayload({ config });
      const result = await payload.find({
        collection: 'team-members',
        limit: 1000,
        sort: 'order',
      });

      return result.docs.map(doc => this.transformPayloadTeamMember(doc));
    });
  }

  // Company Info
  async getCompanyInfo(): Promise<CompanyInfo> {
    return this.getCached('company-info', async () => {
      const payload = await getPayload({ config });
      const result = await payload.find({
        collection: 'company-info',
        limit: 1,
      });

      const doc = result.docs[0];
      if (!doc) {
        throw new Error('Company info not found');
      }

      return {
        name: doc.name,
        tagline: doc.tagline || '',
        description: doc.description || '',
        founded: doc.founded,
        location: doc.location || '',
        address: doc.address || '',
        phone: doc.phone || '',
        email: doc.email,
        story: doc.story || '',
      };
    });
  }

  // Search functionality
  async searchVendors(query: string): Promise<Vendor[]> {
    const vendors = await this.getAllVendors();
    const searchLower = query.toLowerCase();

    return vendors.filter(
      vendor =>
        vendor.name.toLowerCase().includes(searchLower) ||
        vendor.description.toLowerCase().includes(searchLower)
    );
  }

  async searchPartners(query: string): Promise<Partner[]> {
    const partners = await this.getAllPartners();
    const searchLower = query.toLowerCase();

    return partners.filter(
      partner =>
        partner.name.toLowerCase().includes(searchLower) ||
        partner.description.toLowerCase().includes(searchLower)
    );
  }

  async searchProducts(query: string): Promise<Product[]> {
    const products = await this.getAllProducts();
    const searchLower = query.toLowerCase();

    return products.filter(
      product =>
        product.name.toLowerCase().includes(searchLower) ||
        product.description.toLowerCase().includes(searchLower)
    );
  }

  async searchBlogPosts(query: string): Promise<BlogPost[]> {
    const posts = await this.getAllBlogPosts();
    const searchLower = query.toLowerCase();

    return posts.filter(
      post =>
        post.title.toLowerCase().includes(searchLower) ||
        post.excerpt.toLowerCase().includes(searchLower)
    );
  }

  // Utility methods for static generation
  async getVendorSlugs(): Promise<string[]> {
    const vendors = await this.getAllVendors();
    return vendors.map(vendor => vendor.slug).filter(Boolean) as string[];
  }

  async getPartnerSlugs(): Promise<string[]> {
    const partners = await this.getAllPartners();
    return partners.map(partner => partner.slug).filter(Boolean) as string[];
  }

  async getProductSlugs(): Promise<string[]> {
    const products = await this.getAllProducts();
    return products.map(product => product.slug || product.id).filter(Boolean) as string[];
  }

  async getBlogPostSlugs(): Promise<string[]> {
    const posts = await this.getAllBlogPosts();
    return posts.map(post => post.slug).filter(Boolean) as string[];
  }

  // Cache management
  clearCache(): void {
    this.cache.clear();
    console.log('🗑️ Payload CMS cache cleared');
  }

  getCacheStats(): { hits: number; misses: number; size: number } {
    return {
      hits: 0,
      misses: 0,
      size: this.cache.size,
    };
  }
}

// Export singleton instance
export const payloadCMSDataService = new PayloadCMSDataService();
export default payloadCMSDataService;
