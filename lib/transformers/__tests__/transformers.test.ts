/**
 * Transformation Layer Test Suite
 *
 * Comprehensive tests for TinaCMS to Payload CMS transformation utilities.
 * Tests cover base utilities, markdown conversion, and entity transformers.
 */

import { describe, it, expect, beforeEach, jest } from '@jest/globals';
import type { Payload } from 'payload';
import {
  generateSlug,
  parseDate,
  resolveReference,
  resolveReferences,
  transformMediaPath,
  isValidEmail,
  isValidUrl,
  extractNumericValue,
  markdownToLexical,
  lexicalToPlainText,
  transformVendorFromMarkdown,
  transformProductFromMarkdown,
  transformYachtFromMarkdown,
  type TinaCMSVendor,
  type TinaCMSProduct,
  type TinaCMSYacht,
} from '../index';

// ============================================================================
// Mock Payload Instance
// ============================================================================

const createMockPayload = (): Payload => {
  const mockFind = jest.fn().mockImplementation(async ({ collection, where }) => {
    // Mock successful reference resolution
    const slug = where?.slug?.equals;
    if (!slug) return { docs: [] };

    // Simulate finding documents
    if (collection === 'vendors' && slug === 'alfa-laval') {
      return { docs: [{ id: 'vendor-123', slug: 'alfa-laval' }] };
    }
    if (collection === 'categories' && slug === 'navigation-systems') {
      return { docs: [{ id: 'category-123', slug: 'navigation-systems' }] };
    }
    if (collection === 'tags' && slug === 'sustainable') {
      return { docs: [{ id: 'tag-123', slug: 'sustainable' }] };
    }
    if (collection === 'tags' && slug === 'marine') {
      return { docs: [{ id: 'tag-456', slug: 'marine' }] };
    }

    return { docs: [] };
  });

  return {
    find: mockFind,
  } as any;
};

// ============================================================================
// Base Utilities Tests
// ============================================================================

describe('Base Utilities', () => {
  describe('generateSlug', () => {
    it('should convert text to lowercase slug', () => {
      expect(generateSlug('Alfa Laval Marine')).toBe('alfa-laval-marine');
    });

    it('should replace spaces with hyphens', () => {
      expect(generateSlug('Product Name Here')).toBe('product-name-here');
    });

    it('should remove special characters', () => {
      expect(generateSlug('Product #123 (2024)')).toBe('product-123-2024');
    });

    it('should handle empty string', () => {
      expect(generateSlug('')).toBe('');
    });

    it('should trim leading and trailing hyphens', () => {
      expect(generateSlug('  --product--  ')).toBe('product');
    });
  });

  describe('parseDate', () => {
    it('should parse ISO date string', () => {
      const date = parseDate('2024-01-15T10:30:00Z');
      expect(date).toBeInstanceOf(Date);
      expect(date?.getFullYear()).toBe(2024);
    });

    it('should parse simple date string', () => {
      const date = parseDate('2024-01-15');
      expect(date).toBeInstanceOf(Date);
      expect(date?.getFullYear()).toBe(2024);
    });

    it('should return null for undefined', () => {
      expect(parseDate(undefined)).toBeNull();
    });

    it('should return null for invalid date', () => {
      expect(parseDate('invalid-date')).toBeNull();
    });
  });

  describe('transformMediaPath', () => {
    it('should preserve path with leading slash', () => {
      expect(transformMediaPath('/media/image.jpg')).toBe('/media/image.jpg');
    });

    it('should add leading slash if missing', () => {
      expect(transformMediaPath('media/image.jpg')).toBe('/media/image.jpg');
    });

    it('should return empty string for undefined', () => {
      expect(transformMediaPath(undefined)).toBe('');
    });
  });

  describe('isValidEmail', () => {
    it('should validate correct email', () => {
      expect(isValidEmail('test@example.com')).toBe(true);
    });

    it('should reject invalid email', () => {
      expect(isValidEmail('invalid-email')).toBe(false);
    });

    it('should reject undefined', () => {
      expect(isValidEmail(undefined)).toBe(false);
    });

    it('should reject email without domain', () => {
      expect(isValidEmail('test@')).toBe(false);
    });
  });

  describe('isValidUrl', () => {
    it('should validate HTTPS URL', () => {
      expect(isValidUrl('https://example.com')).toBe(true);
    });

    it('should validate HTTP URL', () => {
      expect(isValidUrl('http://example.com')).toBe(true);
    });

    it('should reject invalid URL', () => {
      expect(isValidUrl('not-a-url')).toBe(false);
    });

    it('should reject undefined', () => {
      expect(isValidUrl(undefined)).toBe(false);
    });
  });

  describe('extractNumericValue', () => {
    it('should extract number from string', () => {
      expect(extractNumericValue('123')).toBe(123);
    });

    it('should return number as-is', () => {
      expect(extractNumericValue(456)).toBe(456);
    });

    it('should extract first number from mixed string', () => {
      expect(extractNumericValue('15 meters')).toBe(15);
    });

    it('should handle decimal numbers', () => {
      expect(extractNumericValue('3.14')).toBe(3.14);
    });

    it('should return null for undefined', () => {
      expect(extractNumericValue(undefined)).toBeNull();
    });

    it('should return null for non-numeric string', () => {
      expect(extractNumericValue('invalid')).toBeNull();
    });
  });
});

// ============================================================================
// Reference Resolution Tests
// ============================================================================

describe('Reference Resolution', () => {
  let mockPayload: Payload;

  beforeEach(() => {
    mockPayload = createMockPayload();
  });

  describe('resolveReference', () => {
    it('should resolve vendor reference', async () => {
      const result = await resolveReference(
        'content/vendors/alfa-laval.md',
        'vendors',
        mockPayload
      );
      expect(result).toBe('vendor-123');
    });

    it('should resolve category reference', async () => {
      const result = await resolveReference(
        'content/categories/navigation-systems.md',
        'categories',
        mockPayload
      );
      expect(result).toBe('category-123');
    });

    it('should return null for non-existent reference', async () => {
      const result = await resolveReference(
        'content/vendors/non-existent.md',
        'vendors',
        mockPayload
      );
      expect(result).toBeNull();
    });

    it('should return null for undefined path', async () => {
      const result = await resolveReference(undefined, 'vendors', mockPayload);
      expect(result).toBeNull();
    });
  });

  describe('resolveReferences', () => {
    it('should resolve multiple tag references', async () => {
      const result = await resolveReferences(
        ['content/tags/sustainable.md', 'content/tags/marine.md'],
        'tags',
        mockPayload
      );
      expect(result).toEqual(['tag-123', 'tag-456']);
    });

    it('should filter out failed resolutions', async () => {
      const result = await resolveReferences(
        ['content/tags/sustainable.md', 'content/tags/non-existent.md'],
        'tags',
        mockPayload
      );
      expect(result).toEqual(['tag-123']);
    });

    it('should return empty array for undefined', async () => {
      const result = await resolveReferences(undefined, 'tags', mockPayload);
      expect(result).toEqual([]);
    });

    it('should return empty array for empty array', async () => {
      const result = await resolveReferences([], 'tags', mockPayload);
      expect(result).toEqual([]);
    });
  });
});

// ============================================================================
// Markdown to Lexical Tests
// ============================================================================

describe('Markdown to Lexical Conversion', () => {
  describe('markdownToLexical', () => {
    it('should convert simple text to paragraph', () => {
      const result = markdownToLexical('Hello world');
      expect(result.root.type).toBe('root');
      expect(result.root.children).toHaveLength(1);
      expect(result.root.children[0].type).toBe('paragraph');
    });

    it('should convert multiple paragraphs', () => {
      const result = markdownToLexical('First paragraph\n\nSecond paragraph');
      expect(result.root.children).toHaveLength(2);
    });

    it('should handle empty string', () => {
      const result = markdownToLexical('');
      expect(result.root.children).toHaveLength(1);
      expect(result.root.children[0].type).toBe('paragraph');
    });

    it('should handle undefined', () => {
      const result = markdownToLexical(undefined);
      expect(result.root.children).toHaveLength(1);
    });
  });

  describe('lexicalToPlainText', () => {
    it('should convert lexical back to plain text', () => {
      const lexical = markdownToLexical('Hello world\n\nSecond paragraph');
      const plainText = lexicalToPlainText(lexical);
      expect(plainText).toContain('Hello world');
      expect(plainText).toContain('Second paragraph');
    });
  });
});

// ============================================================================
// Vendor Transformation Tests
// ============================================================================

describe('Vendor Transformation', () => {
  let mockPayload: Payload;

  beforeEach(() => {
    mockPayload = createMockPayload();
  });

  it('should transform basic vendor data', async () => {
    const tinaCMSVendor: TinaCMSVendor = {
      name: 'Alfa Laval',
      slug: 'alfa-laval',
      description: 'Marine technology leader',
      logo: '/media/logo.png',
      website: 'https://alfalaval.com',
      contactEmail: 'contact@alfalaval.com',
    };

    const result = await transformVendorFromMarkdown(tinaCMSVendor, mockPayload);

    expect(result.success).toBe(true);
    expect(result.data).toBeDefined();
    expect(result.data?.companyName).toBe('Alfa Laval');
    expect(result.data?.slug).toBe('alfa-laval');
    expect(result.data?.tier).toBe('tier2');
    expect(result.data?.logo).toBe('/media/logo.png');
  });

  it('should handle missing vendor name', async () => {
    const tinaCMSVendor: TinaCMSVendor = {
      name: '',
    };

    const result = await transformVendorFromMarkdown(tinaCMSVendor, mockPayload);

    expect(result.success).toBe(false);
    expect(result.error).toContain('required');
  });

  it('should transform certifications array', async () => {
    const tinaCMSVendor: TinaCMSVendor = {
      name: 'Test Vendor',
      certifications: [
        {
          name: 'ISO 9001',
          issuingOrganization: 'ISO',
          year: 2020,
        },
      ],
    };

    const result = await transformVendorFromMarkdown(tinaCMSVendor, mockPayload);

    expect(result.success).toBe(true);
    expect(result.data?.certifications).toHaveLength(1);
    expect(result.data?.certifications?.[0].name).toBe('ISO 9001');
  });

  it('should map social proof fields to flat structure', async () => {
    const tinaCMSVendor: TinaCMSVendor = {
      name: 'Test Vendor',
      socialProof: {
        linkedinFollowers: 5000,
        projectsCompleted: 100,
        yearsInBusiness: 25,
      },
    };

    const result = await transformVendorFromMarkdown(tinaCMSVendor, mockPayload);

    expect(result.success).toBe(true);
    expect(result.data?.linkedinFollowers).toBe(5000);
    expect(result.data?.totalProjects).toBe(100);
    expect(result.data?.yearsInBusiness).toBe(25);
  });

  it('should warn on invalid email', async () => {
    const tinaCMSVendor: TinaCMSVendor = {
      name: 'Test Vendor',
      contactEmail: 'invalid-email',
    };

    const result = await transformVendorFromMarkdown(tinaCMSVendor, mockPayload);

    expect(result.success).toBe(true);
    expect(result.warnings).toBeDefined();
    expect(result.warnings?.[0]).toContain('Invalid email');
  });
});

// ============================================================================
// Product Transformation Tests
// ============================================================================

describe('Product Transformation', () => {
  let mockPayload: Payload;

  beforeEach(() => {
    mockPayload = createMockPayload();
  });

  it('should transform basic product data', async () => {
    const tinaCMSProduct: TinaCMSProduct = {
      name: 'Test Product',
      slug: 'test-product',
      description: 'Product description',
      vendor: 'content/vendors/alfa-laval.md',
      category: 'content/categories/navigation-systems.md',
    };

    const result = await transformProductFromMarkdown(tinaCMSProduct, mockPayload);

    expect(result.success).toBe(true);
    expect(result.data).toBeDefined();
    expect(result.data?.name).toBe('Test Product');
    expect(result.data?.slug).toBe('test-product');
    expect(result.data?.vendor).toBe('vendor-123');
  });

  it('should handle missing product name', async () => {
    const tinaCMSProduct: TinaCMSProduct = {
      name: '',
    };

    const result = await transformProductFromMarkdown(tinaCMSProduct, mockPayload);

    expect(result.success).toBe(false);
    expect(result.error).toContain('required');
  });

  it('should handle missing vendor reference', async () => {
    const tinaCMSProduct: TinaCMSProduct = {
      name: 'Test Product',
    };

    const result = await transformProductFromMarkdown(tinaCMSProduct, mockPayload);

    expect(result.success).toBe(false);
    expect(result.error).toContain('vendor');
  });

  it('should transform product images', async () => {
    const tinaCMSProduct: TinaCMSProduct = {
      name: 'Test Product',
      vendor: 'content/vendors/alfa-laval.md',
      product_images: [
        {
          image: '/media/image1.jpg',
          alt_text: 'Product image',
          is_main: true,
        },
        {
          url: 'media/image2.jpg',
          altText: 'Gallery image',
          isMain: false,
        },
      ],
    };

    const result = await transformProductFromMarkdown(tinaCMSProduct, mockPayload);

    expect(result.success).toBe(true);
    expect(result.data?.images).toHaveLength(2);
    expect(result.data?.images?.[0].url).toBe('/media/image1.jpg');
    expect(result.data?.images?.[0].isMain).toBe(true);
    expect(result.data?.images?.[1].url).toBe('/media/image2.jpg');
  });

  it('should transform category to categories array', async () => {
    const tinaCMSProduct: TinaCMSProduct = {
      name: 'Test Product',
      vendor: 'content/vendors/alfa-laval.md',
      category: 'content/categories/navigation-systems.md',
    };

    const result = await transformProductFromMarkdown(tinaCMSProduct, mockPayload);

    expect(result.success).toBe(true);
    expect(Array.isArray(result.data?.categories)).toBe(true);
    expect(result.data?.categories).toHaveLength(1);
  });

  it('should transform features array', async () => {
    const tinaCMSProduct: TinaCMSProduct = {
      name: 'Test Product',
      vendor: 'content/vendors/alfa-laval.md',
      features: [
        {
          title: 'Feature 1',
          description: 'Description 1',
          icon: 'icon-1',
        },
      ],
    };

    const result = await transformProductFromMarkdown(tinaCMSProduct, mockPayload);

    expect(result.success).toBe(true);
    expect(result.data?.features).toHaveLength(1);
    expect(result.data?.features?.[0].title).toBe('Feature 1');
  });
});

// ============================================================================
// Yacht Transformation Tests
// ============================================================================

describe('Yacht Transformation', () => {
  let mockPayload: Payload;

  beforeEach(() => {
    mockPayload = createMockPayload();
  });

  it('should transform basic yacht data', async () => {
    const tinaCMSYacht: TinaCMSYacht = {
      name: 'Eclipse',
      slug: 'eclipse',
      description: 'Luxury superyacht',
      length: 162.5,
      builder: 'Blohm+Voss',
      launchYear: 2010,
    };

    const result = await transformYachtFromMarkdown(tinaCMSYacht, mockPayload);

    expect(result.success).toBe(true);
    expect(result.data).toBeDefined();
    expect(result.data?.name).toBe('Eclipse');
    expect(result.data?.length).toBe(162.5);
    expect(result.data?.builder).toBe('Blohm+Voss');
  });

  it('should handle missing yacht name', async () => {
    const tinaCMSYacht: TinaCMSYacht = {
      name: '',
    };

    const result = await transformYachtFromMarkdown(tinaCMSYacht, mockPayload);

    expect(result.success).toBe(false);
    expect(result.error).toContain('required');
  });

  it('should extract numeric values from mixed formats', async () => {
    const tinaCMSYacht: TinaCMSYacht = {
      name: 'Test Yacht',
      length: '50 meters',
      cruisingSpeed: '12 knots',
    };

    const result = await transformYachtFromMarkdown(tinaCMSYacht, mockPayload);

    expect(result.success).toBe(true);
    expect(result.data?.length).toBe(50);
    expect(result.data?.cruisingSpeed).toBe(12);
  });

  it('should warn on failed numeric extraction', async () => {
    const tinaCMSYacht: TinaCMSYacht = {
      name: 'Test Yacht',
      length: 'unknown',
    };

    const result = await transformYachtFromMarkdown(tinaCMSYacht, mockPayload);

    expect(result.success).toBe(true);
    expect(result.warnings).toBeDefined();
    expect(result.warnings?.[0]).toContain('Failed to extract numeric value');
  });

  it('should transform media paths', async () => {
    const tinaCMSYacht: TinaCMSYacht = {
      name: 'Test Yacht',
      image: 'media/yacht.jpg',
      images: ['media/gallery1.jpg', '/media/gallery2.jpg'],
    };

    const result = await transformYachtFromMarkdown(tinaCMSYacht, mockPayload);

    expect(result.success).toBe(true);
    expect(result.data?.image).toBe('/media/yacht.jpg');
    expect(result.data?.images?.[0]).toBe('/media/gallery1.jpg');
    expect(result.data?.images?.[1]).toBe('/media/gallery2.jpg');
  });
});
