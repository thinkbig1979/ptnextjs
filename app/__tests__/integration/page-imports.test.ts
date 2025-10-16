/**
 * Page Import Validation Tests
 *
 * Validates that all pages import PayloadCMSDataService correctly
 * without requiring full runtime or Payload connection.
 */

import { readFileSync } from 'fs';
import { join } from 'path';

describe('Page Import Validation', () => {
  const appDir = join(process.cwd(), 'app');

  const readPageFile = (path: string): string => {
    return readFileSync(join(appDir, path), 'utf-8');
  };

  describe('Import Statements', () => {
    const pages = [
      'vendors/page.tsx',
      'vendors/[slug]/page.tsx',
      'products/page.tsx',
      'products/[id]/page.tsx',
      'yachts/page.tsx',
      'yachts/[slug]/page.tsx',
      'blog/page.tsx',
      'blog/[slug]/page.tsx',
      'about/page.tsx',
      'page.tsx',
    ];

    pages.forEach((pagePath) => {
      it(`${pagePath} should import payloadCMSDataService`, () => {
        const content = readPageFile(pagePath);
        expect(content).toContain('payloadCMSDataService');
        // Check for import from payload-cms-data-service (with either single or double quotes)
        const hasCorrectImport =
          content.includes("from '@/lib/payload-cms-data-service'") ||
          content.includes('from "@/lib/payload-cms-data-service"');
        expect(hasCorrectImport).toBe(true);
      });

      it(`${pagePath} should NOT import TinaCMSDataService`, () => {
        const content = readPageFile(pagePath);
        expect(content).not.toContain('TinaCMSDataService');
        expect(content).not.toContain('tinacms-data-service');
      });
    });
  });

  describe('Method Calls', () => {
    it('vendors/page.tsx should call vendor methods', () => {
      const content = readPageFile('vendors/page.tsx');
      // Check for actual method calls like getAllVendors, getVendors, etc.
      const hasVendorMethods =
        content.includes('getAllVendors') ||
        content.includes('getVendors') ||
        content.includes('.getVendors') ||
        content.includes('.getAllVendors');
      expect(hasVendorMethods).toBe(true);
    });

    it('vendors/[slug]/page.tsx should call getVendorBySlug()', () => {
      const content = readPageFile('vendors/[slug]/page.tsx');
      expect(content).toContain('getVendorBySlug');
    });

    it('products/page.tsx should call product methods', () => {
      const content = readPageFile('products/page.tsx');
      const hasProductMethods =
        content.includes('getAllProducts') ||
        content.includes('getProducts') ||
        content.includes('.getProducts') ||
        content.includes('.getAllProducts');
      expect(hasProductMethods).toBe(true);
    });

    it('products/[id]/page.tsx should call getProductById()', () => {
      const content = readPageFile('products/[id]/page.tsx');
      expect(content).toContain('getProductById');
    });

    it('yachts/page.tsx should call yacht methods', () => {
      const content = readPageFile('yachts/page.tsx');
      const hasYachtMethods =
        content.includes('getYachts') || content.includes('getFeaturedYachts');
      expect(hasYachtMethods).toBe(true);
    });

    it('yachts/[slug]/page.tsx should call getYachtBySlug()', () => {
      const content = readPageFile('yachts/[slug]/page.tsx');
      expect(content).toContain('getYachtBySlug');
    });

    it('blog/page.tsx should call blog methods', () => {
      const content = readPageFile('blog/page.tsx');
      const hasBlogMethods =
        content.includes('getAllBlogPosts') ||
        content.includes('getBlogPosts') ||
        content.includes('.getBlogPosts') ||
        content.includes('.getAllBlogPosts');
      expect(hasBlogMethods).toBe(true);
    });

    it('blog/[slug]/page.tsx should call getBlogPostBySlug()', () => {
      const content = readPageFile('blog/[slug]/page.tsx');
      expect(content).toContain('getBlogPostBySlug');
    });
  });

  describe('Enhanced Field References', () => {
    it('vendors/[slug]/page.tsx should reference enhanced vendor fields', () => {
      const content = readPageFile('vendors/[slug]/page.tsx');

      const hasEnhancedFields =
        content.includes('certifications') ||
        content.includes('awards') ||
        content.includes('socialProof') ||
        content.includes('caseStudies') ||
        content.includes('innovations') ||
        content.includes('teamMembers') ||
        content.includes('yachtProjects');

      expect(hasEnhancedFields).toBe(true);
    });

    it('products/[id]/page.tsx should reference enhanced product fields', () => {
      const content = readPageFile('products/[id]/page.tsx');

      const hasEnhancedFields =
        content.includes('comparisonMetrics') ||
        content.includes('integrationCompatibility') ||
        content.includes('ownerReviews') ||
        content.includes('visualDemoContent') ||
        content.includes('technicalDocumentation') ||
        content.includes('warrantySupport');

      expect(hasEnhancedFields).toBe(true);
    });

    it('yachts/[slug]/page.tsx should reference yacht-specific fields', () => {
      const content = readPageFile('yachts/[slug]/page.tsx');

      const hasYachtFields =
        content.includes('timeline') ||
        content.includes('supplierMap') ||
        content.includes('sustainabilityMetrics') ||
        content.includes('maintenanceHistory') ||
        content.includes('specifications');

      expect(hasYachtFields).toBe(true);
    });
  });
});
