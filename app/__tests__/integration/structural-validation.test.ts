/**
 * Structural Validation Tests
 *
 * Validates that all pages have correct imports, method calls, and
 * enhanced field references without requiring full static generation.
 *
 * These tests check code structure and integration points.
 */

import { readFileSync } from 'fs';
import { join } from 'path';

describe('Structural Validation - Page Imports', () => {
  const appDir = join(process.cwd(), 'app');

  const readPageFile = (path: string): string => {
    return readFileSync(join(appDir, path), 'utf-8');
  };

  describe('Vendors Pages', () => {
    it('vendors/page.tsx should import PayloadCMSDataService', () => {
      const content = readPageFile('vendors/page.tsx');
      expect(content).toContain('PayloadCMSDataService');
      expect(content).toContain("from '@/lib/payload-cms-data-service'");
      expect(content).not.toContain('TinaCMSDataService');
    });

    it('vendors/[slug]/page.tsx should import PayloadCMSDataService', () => {
      const content = readPageFile('vendors/[slug]/page.tsx');
      expect(content).toContain('PayloadCMSDataService');
      expect(content).toContain("from '@/lib/payload-cms-data-service'");
      expect(content).not.toContain('TinaCMSDataService');
    });
  });

  describe('Products Pages', () => {
    it('products/page.tsx should import PayloadCMSDataService', () => {
      const content = readPageFile('products/page.tsx');
      expect(content).toContain('PayloadCMSDataService');
      expect(content).toContain("from '@/lib/payload-cms-data-service'");
      expect(content).not.toContain('TinaCMSDataService');
    });

    it('products/[id]/page.tsx should import PayloadCMSDataService', () => {
      const content = readPageFile('products/[id]/page.tsx');
      expect(content).toContain('PayloadCMSDataService');
      expect(content).toContain("from '@/lib/payload-cms-data-service'");
      expect(content).not.toContain('TinaCMSDataService');
    });
  });

  describe('Yachts Pages', () => {
    it('yachts/page.tsx should exist and import PayloadCMSDataService', () => {
      const content = readPageFile('yachts/page.tsx');
      expect(content).toContain('PayloadCMSDataService');
      expect(content).toContain("from '@/lib/payload-cms-data-service'");
      expect(content).not.toContain('TinaCMSDataService');
    });

    it('yachts/[slug]/page.tsx should exist and import PayloadCMSDataService', () => {
      const content = readPageFile('yachts/[slug]/page.tsx');
      expect(content).toContain('PayloadCMSDataService');
      expect(content).toContain("from '@/lib/payload-cms-data-service'");
      expect(content).not.toContain('TinaCMSDataService');
    });
  });

  describe('Blog Pages', () => {
    it('blog/page.tsx should import PayloadCMSDataService', () => {
      const content = readPageFile('blog/page.tsx');
      expect(content).toContain('PayloadCMSDataService');
      expect(content).toContain("from '@/lib/payload-cms-data-service'");
      expect(content).not.toContain('TinaCMSDataService');
    });

    it('blog/[slug]/page.tsx should import PayloadCMSDataService', () => {
      const content = readPageFile('blog/[slug]/page.tsx');
      expect(content).toContain('PayloadCMSDataService');
      expect(content).toContain("from '@/lib/payload-cms-data-service'");
      expect(content).not.toContain('TinaCMSDataService');
    });
  });

  describe('Other Pages', () => {
    it('about/page.tsx should import PayloadCMSDataService', () => {
      const content = readPageFile('about/page.tsx');
      expect(content).toContain('PayloadCMSDataService');
      expect(content).toContain("from '@/lib/payload-cms-data-service'");
      expect(content).not.toContain('TinaCMSDataService');
    });

    it('homepage (page.tsx) should import PayloadCMSDataService', () => {
      const content = readPageFile('page.tsx');
      expect(content).toContain('PayloadCMSDataService');
      expect(content).toContain("from '@/lib/payload-cms-data-service'");
      expect(content).not.toContain('TinaCMSDataService');
    });
  });
});

describe('Structural Validation - Method Calls', () => {
  const appDir = join(process.cwd(), 'app');

  const readPageFile = (path: string): string => {
    return readFileSync(join(appDir, path), 'utf-8');
  };

  describe('Vendors Pages', () => {
    it('vendors/page.tsx should call getVendors()', () => {
      const content = readPageFile('vendors/page.tsx');
      expect(content).toContain('getVendors');
    });

    it('vendors/[slug]/page.tsx should call getVendorBySlug()', () => {
      const content = readPageFile('vendors/[slug]/page.tsx');
      expect(content).toContain('getVendorBySlug');
    });
  });

  describe('Products Pages', () => {
    it('products/page.tsx should call getProducts()', () => {
      const content = readPageFile('products/page.tsx');
      expect(content).toContain('getProducts');
    });

    it('products/[id]/page.tsx should call getProductById()', () => {
      const content = readPageFile('products/[id]/page.tsx');
      expect(content).toContain('getProductById');
    });
  });

  describe('Yachts Pages', () => {
    it('yachts/page.tsx should call getYachts() or getFeaturedYachts()', () => {
      const content = readPageFile('yachts/page.tsx');
      expect(
        content.includes('getYachts') || content.includes('getFeaturedYachts')
      ).toBe(true);
    });

    it('yachts/[slug]/page.tsx should call getYachtBySlug()', () => {
      const content = readPageFile('yachts/[slug]/page.tsx');
      expect(content).toContain('getYachtBySlug');
    });
  });

  describe('Blog Pages', () => {
    it('blog/page.tsx should call getBlogPosts()', () => {
      const content = readPageFile('blog/page.tsx');
      expect(content).toContain('getBlogPosts');
    });

    it('blog/[slug]/page.tsx should call getBlogPostBySlug()', () => {
      const content = readPageFile('blog/[slug]/page.tsx');
      expect(content).toContain('getBlogPostBySlug');
    });
  });

  describe('Homepage', () => {
    it('page.tsx should call featured methods', () => {
      const content = readPageFile('page.tsx');
      const hasFeaturedVendors =
        content.includes('getFeaturedVendors') ||
        content.includes('getFeaturedPartners');
      const hasFeaturedProducts = content.includes('getFeaturedProducts');

      expect(hasFeaturedVendors || hasFeaturedProducts).toBe(true);
    });
  });
});

describe('Structural Validation - Enhanced Fields', () => {
  const appDir = join(process.cwd(), 'app');

  const readPageFile = (path: string): string => {
    return readFileSync(join(appDir, path), 'utf-8');
  };

  describe('Vendor Detail Page', () => {
    it('should reference enhanced vendor fields', () => {
      const content = readPageFile('vendors/[slug]/page.tsx');

      // Check for at least some enhanced field references
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
  });

  describe('Product Detail Page', () => {
    it('should reference enhanced product fields', () => {
      const content = readPageFile('products/[id]/page.tsx');

      // Check for at least some enhanced field references
      const hasEnhancedFields =
        content.includes('comparisonMetrics') ||
        content.includes('integrationCompatibility') ||
        content.includes('ownerReviews') ||
        content.includes('visualDemoContent') ||
        content.includes('technicalDocumentation') ||
        content.includes('warrantySupport');

      expect(hasEnhancedFields).toBe(true);
    });
  });

  describe('Yacht Detail Page', () => {
    it('should reference yacht-specific fields', () => {
      const content = readPageFile('yachts/[slug]/page.tsx');

      // Check for yacht-specific field references
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

describe('Structural Validation - Data Service Usage', () => {
  const appDir = join(process.cwd(), 'app');

  const readPageFile = (path: string): string => {
    return readFileSync(join(appDir, path), 'utf-8');
  };

  describe('getInstance Pattern', () => {
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
      it(`${pagePath} should use getInstance() pattern`, () => {
        const content = readPageFile(pagePath);
        expect(content).toContain('getInstance');
      });
    });
  });

  describe('Async Data Fetching', () => {
    const pages = [
      'vendors/page.tsx',
      'vendors/[slug]/page.tsx',
      'products/page.tsx',
      'products/[id]/page.tsx',
      'yachts/page.tsx',
      'yachts/[slug]/page.tsx',
      'blog/page.tsx',
      'blog/[slug]/page.tsx',
    ];

    pages.forEach((pagePath) => {
      it(`${pagePath} should use async/await`, () => {
        const content = readPageFile(pagePath);
        expect(content).toContain('await');
      });
    });
  });
});

describe('Structural Validation - File Existence', () => {
  const appDir = join(process.cwd(), 'app');

  it('should have all required page files', () => {
    const requiredPages = [
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

    requiredPages.forEach((pagePath) => {
      const exists = (() => {
        try {
          readFileSync(join(appDir, pagePath), 'utf-8');
          return true;
        } catch {
          return false;
        }
      })();

      expect(exists).toBe(true);
    });
  });

  it('should have PayloadCMSDataService file', () => {
    const libDir = join(process.cwd(), 'lib');
    const exists = (() => {
      try {
        readFileSync(join(libDir, 'payload-cms-data-service.ts'), 'utf-8');
        return true;
      } catch {
        return false;
      }
    })();

    expect(exists).toBe(true);
  });

  it('should have types file', () => {
    const libDir = join(process.cwd(), 'lib');
    const exists = (() => {
      try {
        readFileSync(join(libDir, 'types.ts'), 'utf-8');
        return true;
      } catch {
        return false;
      }
    })();

    expect(exists).toBe(true);
  });
});
