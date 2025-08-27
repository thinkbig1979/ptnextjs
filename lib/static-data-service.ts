/**
 * Static Data Service for Build-Time CMS Data Fetching
 * Used exclusively for Next.js Static Site Generation (SSG)
 * Now delegating to TinaCMS Data Service
 */

import { tinaCMSDataService } from './tinacms-data-service';
import { Partner, Product, BlogPost, TeamMember } from './types';

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

class StaticDataService {
  // All methods delegate to TinaCMS Data Service

  // Categories
  async getCategories(): Promise<Category[]> {
    return tinaCMSDataService.getCategories();
  }

  // Blog Categories
  async getBlogCategories(): Promise<Category[]> {
    return tinaCMSDataService.getBlogCategories();
  }

  // Partners
  async getAllPartners(): Promise<Partner[]> {
    return tinaCMSDataService.getAllPartners();
  }

  async getPartners(params?: { category?: string; featured?: boolean }): Promise<Partner[]> {
    return tinaCMSDataService.getPartners(params);
  }

  async getPartnerBySlug(slug: string): Promise<Partner | null> {
    return tinaCMSDataService.getPartnerBySlug(slug);
  }

  async getPartnerById(id: string): Promise<Partner | null> {
    return tinaCMSDataService.getPartnerById(id);
  }

  // Products
  async getAllProducts(): Promise<Product[]> {
    return tinaCMSDataService.getAllProducts();
  }

  async getProducts(params?: { category?: string; partnerId?: string }): Promise<Product[]> {
    return tinaCMSDataService.getProducts(params);
  }

  async getProductBySlug(slug: string): Promise<Product | null> {
    return tinaCMSDataService.getProductBySlug(slug);
  }

  async getProductById(id: string): Promise<Product | null> {
    return tinaCMSDataService.getProductById(id);
  }

  async getProductsByPartner(partnerId: string): Promise<Product[]> {
    return tinaCMSDataService.getProductsByPartner(partnerId);
  }

  // Blog Posts
  async getAllBlogPosts(): Promise<BlogPost[]> {
    return tinaCMSDataService.getAllBlogPosts();
  }

  async getBlogPosts(params?: { category?: string; featured?: boolean }): Promise<BlogPost[]> {
    return tinaCMSDataService.getBlogPosts(params);
  }

  async getBlogPostBySlug(slug: string): Promise<BlogPost | null> {
    return tinaCMSDataService.getBlogPostBySlug(slug);
  }

  // Team Members
  async getTeamMembers(): Promise<TeamMember[]> {
    return tinaCMSDataService.getTeamMembers();
  }

  // Company Info
  async getCompanyInfo(): Promise<CompanyInfo> {
    return tinaCMSDataService.getCompanyInfo();
  }

  // Search functionality
  async searchPartners(query: string): Promise<Partner[]> {
    return tinaCMSDataService.searchPartners(query);
  }

  async searchProducts(query: string): Promise<Product[]> {
    return tinaCMSDataService.searchProducts(query);
  }

  async searchBlogPosts(query: string): Promise<BlogPost[]> {
    return tinaCMSDataService.searchBlogPosts(query);
  }

  // Utility methods for static generation
  async getPartnerSlugs(): Promise<string[]> {
    return tinaCMSDataService.getPartnerSlugs();
  }

  async getProductSlugs(): Promise<string[]> {
    return tinaCMSDataService.getProductSlugs();
  }

  async getBlogPostSlugs(): Promise<string[]> {
    return tinaCMSDataService.getBlogPostSlugs();
  }

  // Validation methods for build-time checks
  async validateCMSContent(): Promise<{ isValid: boolean; errors: string[] }> {
    return tinaCMSDataService.validateCMSContent();
  }
}

// Export singleton instance
export const staticDataService = new StaticDataService();
export default staticDataService;