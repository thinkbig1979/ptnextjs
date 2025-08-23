import { Partner, Product, BlogPost, TeamMember } from './data.js';

const STRAPI_API_URL = process.env.STRAPI_API_URL || 
  process.env.NEXT_PUBLIC_STRAPI_API_URL || 
  'http://localhost:1337/api';

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

interface StrapiEntry {
  id: number;
  attributes: any;
  createdAt: string;
  updatedAt: string;
  publishedAt: string;
}

class StrapiClient {
  private baseUrl: string;

  constructor(baseUrl: string = STRAPI_API_URL) {
    this.baseUrl = baseUrl;
  }

  private async request<T>(endpoint: string, options?: RequestInit): Promise<T> {
    const url = `${this.baseUrl}${endpoint}`;
    
    try {
      const response = await fetch(url, {
        headers: {
          'Content-Type': 'application/json',
          ...options?.headers,
        },
        ...options,
      });

      if (!response.ok) {
        throw new Error(`Strapi API error: ${response.status} ${response.statusText}`);
      }

      return await response.json();
    } catch (error) {
      console.error(`Strapi API request failed for ${endpoint}:`, error);
      throw error;
    }
  }

  // Categories
  async getCategories() {
    const response = await this.request<StrapiResponse<StrapiEntry[]>>('/categories?populate=*&pagination[pageSize]=100');
    return response.data.map(item => ({
      id: item.id.toString(),
      name: item.attributes.name,
      slug: item.attributes.slug,
      description: item.attributes.description,
      icon: item.attributes.icon,
      color: item.attributes.color,
    }));
  }

  // Partners
  async getPartners(params?: { category?: string; featured?: boolean }): Promise<Partner[]> {
    let endpoint = '/partners?populate=*&pagination[pageSize]=100';
    
    if (params?.category && params.category !== 'all') {
      endpoint += `&filters[category][name][$eq]=${encodeURIComponent(params.category)}`;
    }
    
    if (params?.featured) {
      endpoint += `&filters[featured][$eq]=true`;
    }

    const response = await this.request<StrapiResponse<StrapiEntry[]>>(endpoint);
    
    return response.data.map(item => ({
      id: item.id.toString(),
      name: item.attributes.name,
      category: item.attributes.category?.data?.attributes?.name || '',
      description: item.attributes.description,
      logo: item.attributes.logo?.data?.attributes?.url,
      website: item.attributes.website,
      founded: item.attributes.founded,
      location: item.attributes.location,
      tags: item.attributes.tags?.data?.map((tag: any) => tag.attributes.name) || [],
      featured: item.attributes.featured,
    }));
  }

  async getPartnerById(id: string): Promise<Partner | null> {
    try {
      const response = await this.request<StrapiResponse<StrapiEntry>>(`/partners/${id}?populate=*`);
      const item = response.data;
      
      return {
        id: item.id.toString(),
        name: item.attributes.name,
        category: item.attributes.category?.data?.attributes?.name || '',
        description: item.attributes.description,
        logo: item.attributes.logo?.data?.attributes?.url,
        website: item.attributes.website,
        founded: item.attributes.founded,
        location: item.attributes.location,
        tags: item.attributes.tags?.data?.map((tag: any) => tag.attributes.name) || [],
        featured: item.attributes.featured,
      };
    } catch (error) {
      return null;
    }
  }

  // Products
  async getProducts(params?: { category?: string; partnerId?: string }): Promise<Product[]> {
    let endpoint = '/products?populate=*&pagination[pageSize]=100';
    
    if (params?.category && params.category !== 'all') {
      endpoint += `&filters[category][name][$eq]=${encodeURIComponent(params.category)}`;
    }
    
    if (params?.partnerId) {
      endpoint += `&filters[partner][id][$eq]=${params.partnerId}`;
    }

    const response = await this.request<StrapiResponse<StrapiEntry[]>>(endpoint);
    
    return response.data.map(item => ({
      id: item.id.toString(),
      name: item.attributes.name,
      partnerId: item.attributes.partner?.data?.id?.toString() || '',
      partnerName: item.attributes.partner?.data?.attributes?.name || '',
      category: item.attributes.category?.data?.attributes?.name || '',
      description: item.attributes.description,
      image: item.attributes.image?.data?.attributes?.url,
      features: item.attributes.features?.map((feature: any) => feature.title) || [],
      price: item.attributes.price,
      tags: item.attributes.tags?.data?.map((tag: any) => tag.attributes.name) || [],
    }));
  }

  async getProductById(id: string): Promise<Product | null> {
    try {
      const response = await this.request<StrapiResponse<StrapiEntry>>(`/products/${id}?populate=*`);
      const item = response.data;
      
      return {
        id: item.id.toString(),
        name: item.attributes.name,
        partnerId: item.attributes.partner?.data?.id?.toString() || '',
        partnerName: item.attributes.partner?.data?.attributes?.name || '',
        category: item.attributes.category?.data?.attributes?.name || '',
        description: item.attributes.description,
        image: item.attributes.image?.data?.attributes?.url,
        features: item.attributes.features?.map((feature: any) => feature.title) || [],
        price: item.attributes.price,
        tags: item.attributes.tags?.data?.map((tag: any) => tag.attributes.name) || [],
      };
    } catch (error) {
      return null;
    }
  }

  // Blog Posts
  async getBlogPosts(params?: { category?: string; featured?: boolean }): Promise<BlogPost[]> {
    let endpoint = '/blog-posts?populate=*&sort=publishedAt:desc&pagination[pageSize]=100';
    
    if (params?.category) {
      endpoint += `&filters[category][$eq]=${encodeURIComponent(params.category)}`;
    }
    
    if (params?.featured) {
      endpoint += `&filters[featured][$eq]=true`;
    }

    const response = await this.request<StrapiResponse<StrapiEntry[]>>(endpoint);
    
    return response.data.map(item => ({
      id: item.id.toString(),
      slug: item.attributes.slug,
      title: item.attributes.title,
      excerpt: item.attributes.excerpt,
      content: item.attributes.content,
      author: item.attributes.author,
      publishedAt: item.attributes.publishedAt,
      category: item.attributes.category,
      tags: item.attributes.tags?.data?.map((tag: any) => tag.attributes.name) || [],
      image: item.attributes.image?.data?.attributes?.url,
      featured: item.attributes.featured,
      readTime: item.attributes.readTime,
    }));
  }

  async getBlogPostBySlug(slug: string): Promise<BlogPost | null> {
    try {
      const response = await this.request<StrapiResponse<StrapiEntry[]>>(`/blog-posts?filters[slug][$eq]=${slug}&populate=*`);
      
      if (response.data.length === 0) {
        return null;
      }
      
      const item = response.data[0];
      return {
        id: item.id.toString(),
        slug: item.attributes.slug,
        title: item.attributes.title,
        excerpt: item.attributes.excerpt,
        content: item.attributes.content,
        author: item.attributes.author,
        publishedAt: item.attributes.publishedAt,
        category: item.attributes.category,
        tags: item.attributes.tags?.data?.map((tag: any) => tag.attributes.name) || [],
        image: item.attributes.image?.data?.attributes?.url,
        featured: item.attributes.featured,
        readTime: item.attributes.readTime,
      };
    } catch (error) {
      return null;
    }
  }

  // Team Members
  async getTeamMembers(): Promise<TeamMember[]> {
    const response = await this.request<StrapiResponse<StrapiEntry[]>>('/team-members?populate=*&pagination[pageSize]=100');
    
    return response.data.map(item => ({
      id: item.id.toString(),
      name: item.attributes.name,
      role: item.attributes.role,
      bio: item.attributes.bio,
      image: item.attributes.image?.data?.attributes?.url,
      email: item.attributes.email,
      linkedin: item.attributes.linkedin,
    }));
  }

  // Company Info
  async getCompanyInfo() {
    const response = await this.request<StrapiResponse<StrapiEntry>>('/company-info?populate=*');
    const item = response.data;
    
    return {
      name: item.attributes.name,
      tagline: item.attributes.tagline,
      description: item.attributes.description,
      founded: item.attributes.founded,
      location: item.attributes.location,
      address: item.attributes.address,
      phone: item.attributes.phone,
      email: item.attributes.email,
      story: item.attributes.story,
    };
  }

  // Search functionality
  async searchPartners(query: string): Promise<Partner[]> {
    const endpoint = `/partners?populate=*&pagination[pageSize]=100&filters[$or][0][name][$containsi]=${encodeURIComponent(query)}&filters[$or][1][description][$containsi]=${encodeURIComponent(query)}`;
    const response = await this.request<StrapiResponse<StrapiEntry[]>>(endpoint);
    
    return response.data.map(item => ({
      id: item.id.toString(),
      name: item.attributes.name,
      category: item.attributes.category?.data?.attributes?.name || '',
      description: item.attributes.description,
      logo: item.attributes.logo?.data?.attributes?.url,
      website: item.attributes.website,
      founded: item.attributes.founded,
      location: item.attributes.location,
      tags: item.attributes.tags?.data?.map((tag: any) => tag.attributes.name) || [],
      featured: item.attributes.featured,
    }));
  }

  async searchProducts(query: string): Promise<Product[]> {
    const endpoint = `/products?populate=*&pagination[pageSize]=100&filters[$or][0][name][$containsi]=${encodeURIComponent(query)}&filters[$or][1][description][$containsi]=${encodeURIComponent(query)}`;
    const response = await this.request<StrapiResponse<StrapiEntry[]>>(endpoint);
    
    return response.data.map(item => ({
      id: item.id.toString(),
      name: item.attributes.name,
      partnerId: item.attributes.partner?.data?.id?.toString() || '',
      partnerName: item.attributes.partner?.data?.attributes?.name || '',
      category: item.attributes.category?.data?.attributes?.name || '',
      description: item.attributes.description,
      image: item.attributes.image?.data?.attributes?.url,
      features: item.attributes.features?.map((feature: any) => feature.title) || [],
      price: item.attributes.price,
      tags: item.attributes.tags?.data?.map((tag: any) => tag.attributes.name) || [],
    }));
  }

  async searchBlogPosts(query: string): Promise<BlogPost[]> {
    const endpoint = `/blog-posts?populate=*&pagination[pageSize]=100&filters[$or][0][title][$containsi]=${encodeURIComponent(query)}&filters[$or][1][excerpt][$containsi]=${encodeURIComponent(query)}&sort=publishedAt:desc`;
    const response = await this.request<StrapiResponse<StrapiEntry[]>>(endpoint);
    
    return response.data.map(item => ({
      id: item.id.toString(),
      slug: item.attributes.slug,
      title: item.attributes.title,
      excerpt: item.attributes.excerpt,
      content: item.attributes.content,
      author: item.attributes.author,
      publishedAt: item.attributes.publishedAt,
      category: item.attributes.category,
      tags: item.attributes.tags?.data?.map((tag: any) => tag.attributes.name) || [],
      image: item.attributes.image?.data?.attributes?.url,
      featured: item.attributes.featured,
      readTime: item.attributes.readTime,
    }));
  }
}

export const strapiClient = new StrapiClient();
export default strapiClient;