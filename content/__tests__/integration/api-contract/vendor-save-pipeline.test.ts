/**
 * Vendor Save Pipeline Tests
 *
 * End-to-end contract tests for the vendor dashboard save pipeline:
 *   Frontend form data → filterVendorPayload → Zod validation → transformArrayFieldsForPayload → Payload CMS
 *
 * These tests verify the exact data shapes that flow through each stage,
 * catching mismatches that would cause silent data loss or 400 errors in production.
 *
 * Coverage:
 * 1. Zod schema accepts certifications/awards/mediaGallery as arrays (Bug #1 fix)
 * 2. Zod schema preserves component field name aliases (Bug #1 fix)
 * 3. videoDuration string→number coercion through pipeline (Bug #1 fix)
 * 4. plainTextToLexicalJson output format (Bug #3 verification)
 * 5. transformArrayFieldsForPayload field name mappings
 * 6. Full pipeline: filterVendorPayload → Zod → transform for each form component
 */

import { safeValidateVendorUpdate } from '@/lib/validation/vendor-update-schema';
import {
  plainTextToLexicalJson,
  isLexicalJson,
  transformArrayFieldsForPayload,
} from '@/lib/services/VendorProfileService';
import { filterVendorPayload } from '@/lib/context/VendorDashboardContext';

// ============================================================================
// Bug #1: Zod schema accepts array fields
// ============================================================================

describe('Bug #1 Fix: Zod schema accepts array fields', () => {
  describe('certifications as array (was z.string())', () => {
    it('should accept certifications array from CertificationsAwardsManager', () => {
      const data = {
        certifications: [
          {
            name: 'ISO 9001:2015',
            issuer: 'International Organization for Standardization',
            year: 2023,
            expiryDate: '2026-12-31',
            certificateUrl: 'https://example.com/cert',
            logo: 'https://example.com/logo.png',
          },
        ],
      };

      const result = safeValidateVendorUpdate(data);
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.certifications).toHaveLength(1);
        // Verify field names are preserved (not stripped by Zod)
        expect(result.data.certifications![0].name).toBe('ISO 9001:2015');
        expect(result.data.certifications![0].certificateUrl).toBe('https://example.com/cert');
      }
    });

    it('should accept certifications with Payload field names', () => {
      const data = {
        certifications: [
          {
            name: 'ABYC Certified',
            issuer: 'ABYC',
            year: 2022,
            verificationUrl: 'https://abyc.org/verify/123',
            certificateNumber: 'CERT-12345',
            logo: 42, // media ID (number)
          },
        ],
      };

      const result = safeValidateVendorUpdate(data);
      expect(result.success).toBe(true);
    });

    it('should accept empty certifications array', () => {
      const result = safeValidateVendorUpdate({ certifications: [] });
      expect(result.success).toBe(true);
    });

    it('should accept null certifications', () => {
      const result = safeValidateVendorUpdate({ certifications: null });
      expect(result.success).toBe(true);
    });
  });

  describe('awards as array (was missing from schema)', () => {
    it('should accept awards array from CertificationsAwardsManager', () => {
      const data = {
        awards: [
          {
            title: 'Best Yacht Builder 2024',
            organization: 'ShowBoats International',
            year: 2024,
            category: 'Innovation',
            description: 'Recognized for excellence',
          },
        ],
      };

      const result = safeValidateVendorUpdate(data);
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.awards).toHaveLength(1);
        expect(result.data.awards![0].title).toBe('Best Yacht Builder 2024');
      }
    });

    it('should accept awards with image as media ID', () => {
      const data = {
        awards: [
          { title: 'Award', organization: 'Org', year: 2024, image: 42 },
        ],
      };

      const result = safeValidateVendorUpdate(data);
      expect(result.success).toBe(true);
    });

    it('should accept awards with image as URL string', () => {
      const data = {
        awards: [
          { title: 'Award', organization: 'Org', year: 2024, image: 'https://example.com/img.jpg' },
        ],
      };

      const result = safeValidateVendorUpdate(data);
      expect(result.success).toBe(true);
    });
  });

  describe('mediaGallery as array (was missing from schema)', () => {
    it('should accept mediaGallery with image type', () => {
      const data = {
        mediaGallery: [
          {
            type: 'image' as const,
            media: 42,
            caption: 'Yacht interior',
            altText: 'Modern yacht interior',
            album: 'Portfolio',
            order: 0,
          },
        ],
      };

      const result = safeValidateVendorUpdate(data);
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.mediaGallery).toHaveLength(1);
        expect(result.data.mediaGallery![0].type).toBe('image');
      }
    });

    it('should accept mediaGallery with video type', () => {
      const data = {
        mediaGallery: [
          {
            type: 'video' as const,
            videoUrl: 'https://youtube.com/watch?v=abc',
            caption: 'Company video',
            order: 1,
          },
        ],
      };

      const result = safeValidateVendorUpdate(data);
      expect(result.success).toBe(true);
    });

    it('should accept mediaGallery with component url field', () => {
      const data = {
        mediaGallery: [
          { type: 'video' as const, url: 'https://youtube.com/watch?v=abc' },
        ],
      };

      const result = safeValidateVendorUpdate(data);
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.mediaGallery![0].url).toBe('https://youtube.com/watch?v=abc');
      }
    });
  });

  describe('videoDuration accepts both string and number', () => {
    it('should accept videoDuration as string (from form input)', () => {
      const result = safeValidateVendorUpdate({ videoDuration: '5:30' });
      expect(result.success).toBe(true);
    });

    it('should accept videoDuration as number (after filterVendorPayload coercion)', () => {
      const result = safeValidateVendorUpdate({ videoDuration: 330 });
      expect(result.success).toBe(true);
    });

    it('should accept videoDuration as 0', () => {
      const result = safeValidateVendorUpdate({ videoDuration: 0 });
      expect(result.success).toBe(true);
    });

    it('should reject negative videoDuration', () => {
      const result = safeValidateVendorUpdate({ videoDuration: -1 });
      expect(result.success).toBe(false);
    });
  });

  describe('caseStudies richText fields accept string and Lexical JSON', () => {
    it('should accept challenge/solution/results as plain text strings', () => {
      const data = {
        caseStudies: [
          {
            title: 'Project',
            challenge: 'The yacht needed a complete navigation system upgrade.',
            solution: 'We installed state-of-the-art radar systems.',
            results: 'Navigation accuracy improved by 40%.',
          },
        ],
      };

      const result = safeValidateVendorUpdate(data);
      expect(result.success).toBe(true);
    });

    it('should accept challenge/solution/results as Lexical JSON objects', () => {
      const lexicalJson = {
        root: {
          type: 'root',
          children: [
            {
              type: 'paragraph',
              children: [{ type: 'text', text: 'Test content', detail: 0, format: 0, mode: 'normal', style: '', version: 1 }],
              direction: 'ltr',
              format: '',
              indent: 0,
              textFormat: 0,
              version: 1,
            },
          ],
          direction: 'ltr',
          format: '',
          indent: 0,
          version: 1,
        },
      };

      const data = {
        caseStudies: [
          {
            title: 'Project',
            challenge: lexicalJson,
            solution: lexicalJson,
            results: lexicalJson,
          },
        ],
      };

      const result = safeValidateVendorUpdate(data);
      expect(result.success).toBe(true);
    });
  });
});

// ============================================================================
// Bug #1 Fix: Component field name aliases in teamMembers
// ============================================================================

describe('Bug #1 Fix: teamMembers field name aliases', () => {
  it('should preserve linkedin field (component name) through Zod', () => {
    const data = {
      teamMembers: [
        {
          name: 'John',
          role: 'Engineer',
          linkedin: 'https://linkedin.com/in/john',
        },
      ],
    };

    const result = safeValidateVendorUpdate(data);
    expect(result.success).toBe(true);
    if (result.success) {
      // linkedin must NOT be stripped by Zod
      expect(result.data.teamMembers![0].linkedin).toBe('https://linkedin.com/in/john');
    }
  });

  it('should preserve image field (component name) through Zod', () => {
    const data = {
      teamMembers: [
        {
          name: 'Jane',
          role: 'Designer',
          image: 'https://example.com/jane.jpg',
        },
      ],
    };

    const result = safeValidateVendorUpdate(data);
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.teamMembers![0].image).toBe('https://example.com/jane.jpg');
    }
  });

  it('should preserve order field (component name) through Zod', () => {
    const data = {
      teamMembers: [
        {
          name: 'Bob',
          role: 'Captain',
          order: 2,
        },
      ],
    };

    const result = safeValidateVendorUpdate(data);
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.teamMembers![0].order).toBe(2);
    }
  });

  it('should accept both component and Payload field names together', () => {
    const data = {
      teamMembers: [
        {
          name: 'Alice',
          role: 'Manager',
          linkedin: 'https://linkedin.com/in/alice',
          linkedinUrl: 'https://linkedin.com/in/alice',
          image: 'https://example.com/alice.jpg',
          photo: 'https://example.com/alice.jpg',
          order: 0,
          displayOrder: 0,
        },
      ],
    };

    const result = safeValidateVendorUpdate(data);
    expect(result.success).toBe(true);
  });

  it('should preserve createdAt/updatedAt synthetic fields', () => {
    const data = {
      teamMembers: [
        {
          id: 'team-123',
          name: 'Bob',
          role: 'Captain',
          createdAt: '2024-01-01T00:00:00.000Z',
          updatedAt: '2024-06-15T12:00:00.000Z',
        },
      ],
    };

    const result = safeValidateVendorUpdate(data);
    expect(result.success).toBe(true);
  });
});

// ============================================================================
// Bug #3: Lexical JSON format verification
// ============================================================================

describe('Bug #3: plainTextToLexicalJson format', () => {
  it('should produce valid Lexical editor state structure', () => {
    const result = plainTextToLexicalJson('Hello world');

    // Top-level structure
    expect(result).toHaveProperty('root');
    expect(result.root).toHaveProperty('type', 'root');
    expect(result.root).toHaveProperty('version', 1);
    expect(result.root).toHaveProperty('children');
    expect(result.root).toHaveProperty('direction', 'ltr');
    expect(result.root).toHaveProperty('format', '');
    expect(result.root).toHaveProperty('indent', 0);
  });

  it('should create one paragraph per text line', () => {
    const result = plainTextToLexicalJson('Line 1\nLine 2\nLine 3');
    const children = (result.root as any).children;

    expect(children).toHaveLength(3);
    children.forEach((para: any) => {
      expect(para.type).toBe('paragraph');
      expect(para.version).toBe(1);
      expect(para.direction).toBe('ltr');
    });
  });

  it('should create text nodes with all required fields', () => {
    const result = plainTextToLexicalJson('Hello');
    const textNode = (result.root as any).children[0].children[0];

    expect(textNode.type).toBe('text');
    expect(textNode.text).toBe('Hello');
    expect(textNode.version).toBe(1);
    expect(textNode.detail).toBe(0);
    expect(textNode.format).toBe(0);
    expect(textNode.mode).toBe('normal');
    expect(textNode.style).toBe('');
  });

  it('should skip empty lines', () => {
    const result = plainTextToLexicalJson('Line 1\n\n\nLine 2');
    const children = (result.root as any).children;
    expect(children).toHaveLength(2);
  });

  it('should trim whitespace from paragraphs', () => {
    const result = plainTextToLexicalJson('  Hello  ');
    const textNode = (result.root as any).children[0].children[0];
    expect(textNode.text).toBe('Hello');
  });

  it('should be recognized by isLexicalJson', () => {
    const result = plainTextToLexicalJson('Test');
    expect(isLexicalJson(result)).toBe(true);
  });

  it('isLexicalJson should reject plain strings', () => {
    expect(isLexicalJson('just a string')).toBe(false);
    expect(isLexicalJson(null)).toBe(false);
    expect(isLexicalJson(undefined)).toBe(false);
    expect(isLexicalJson(42)).toBe(false);
  });
});

// ============================================================================
// transformArrayFieldsForPayload unit tests
// ============================================================================

describe('transformArrayFieldsForPayload', () => {
  describe('certifications transform', () => {
    it('should map certificateUrl to verificationUrl', () => {
      const data = {
        certifications: [
          { name: 'ISO 9001', issuer: 'ISO', year: 2023, certificateUrl: 'https://example.com/cert' },
        ],
      };

      const result = transformArrayFieldsForPayload(data);
      const cert = (result.certifications as any[])[0];
      expect(cert.verificationUrl).toBe('https://example.com/cert');
      expect(cert).not.toHaveProperty('certificateUrl');
    });

    it('should strip logo URL strings (expects media ID)', () => {
      const data = {
        certifications: [
          { name: 'Cert', issuer: 'Org', year: 2023, logo: 'https://example.com/logo.png' },
        ],
      };

      const result = transformArrayFieldsForPayload(data);
      const cert = (result.certifications as any[])[0];
      expect(cert).not.toHaveProperty('logo');
    });

    it('should keep logo as number (media ID)', () => {
      const data = {
        certifications: [
          { name: 'Cert', issuer: 'Org', year: 2023, logo: 42 },
        ],
      };

      const result = transformArrayFieldsForPayload(data);
      expect((result.certifications as any[])[0].logo).toBe(42);
    });
  });

  describe('teamMembers transform', () => {
    it('should map linkedin to linkedinUrl', () => {
      const data = {
        teamMembers: [
          { name: 'John', role: 'CEO', linkedin: 'https://linkedin.com/in/john' },
        ],
      };

      const result = transformArrayFieldsForPayload(data);
      const member = (result.teamMembers as any[])[0];
      expect(member.linkedinUrl).toBe('https://linkedin.com/in/john');
    });

    it('should map order to displayOrder', () => {
      const data = {
        teamMembers: [
          { name: 'John', role: 'CEO', order: 3 },
        ],
      };

      const result = transformArrayFieldsForPayload(data);
      expect((result.teamMembers as any[])[0].displayOrder).toBe(3);
    });

    it('should strip image URL strings (photo expects media ID)', () => {
      const data = {
        teamMembers: [
          { name: 'John', role: 'CEO', image: 'https://example.com/photo.jpg' },
        ],
      };

      const result = transformArrayFieldsForPayload(data);
      expect((result.teamMembers as any[])[0]).not.toHaveProperty('photo');
    });
  });

  describe('caseStudies transform', () => {
    it('should convert plain text challenge to Lexical JSON', () => {
      const data = {
        caseStudies: [
          { title: 'Test', featured: false, challenge: 'A difficult problem' },
        ],
      };

      const result = transformArrayFieldsForPayload(data);
      const cs = (result.caseStudies as any[])[0];
      expect(isLexicalJson(cs.challenge)).toBe(true);
    });

    it('should pass through existing Lexical JSON unchanged', () => {
      const lexical = plainTextToLexicalJson('Already Lexical');
      const data = {
        caseStudies: [
          { title: 'Test', featured: false, challenge: lexical },
        ],
      };

      const result = transformArrayFieldsForPayload(data);
      const cs = (result.caseStudies as any[])[0];
      expect(cs.challenge).toEqual(lexical);
    });
  });

  describe('serviceAreas transform', () => {
    it('should convert string array to {area: string} objects', () => {
      const data = { serviceAreas: ['Mediterranean', 'Caribbean'] };
      const result = transformArrayFieldsForPayload(data);
      expect(result.serviceAreas).toEqual([
        { area: 'Mediterranean' },
        { area: 'Caribbean' },
      ]);
    });

    it('should filter empty strings', () => {
      const data = { serviceAreas: ['Mediterranean', '', '  ', 'Caribbean'] };
      const result = transformArrayFieldsForPayload(data);
      expect(result.serviceAreas).toEqual([
        { area: 'Mediterranean' },
        { area: 'Caribbean' },
      ]);
    });
  });

  describe('companyValues transform', () => {
    it('should convert string array to {value: string} objects', () => {
      const data = { companyValues: ['Innovation', 'Quality'] };
      const result = transformArrayFieldsForPayload(data);
      expect(result.companyValues).toEqual([
        { value: 'Innovation' },
        { value: 'Quality' },
      ]);
    });
  });

  describe('mediaGallery transform', () => {
    it('should keep numeric media IDs for images', () => {
      const data = {
        mediaGallery: [
          { type: 'image', media: 42, caption: 'Test' },
        ],
      };

      const result = transformArrayFieldsForPayload(data);
      expect((result.mediaGallery as any[])[0].media).toBe(42);
    });

    it('should map url to videoUrl for video type', () => {
      const data = {
        mediaGallery: [
          { type: 'video', url: 'https://youtube.com/watch?v=abc' },
        ],
      };

      const result = transformArrayFieldsForPayload(data);
      expect((result.mediaGallery as any[])[0].videoUrl).toBe('https://youtube.com/watch?v=abc');
    });

    it('should strip URL strings from image media field', () => {
      const data = {
        mediaGallery: [
          { type: 'image', url: 'https://example.com/photo.jpg' },
        ],
      };

      const result = transformArrayFieldsForPayload(data);
      // URL strings can't be sent to upload fields
      expect((result.mediaGallery as any[])[0]).not.toHaveProperty('media');
    });
  });

  describe('upload field URL stripping', () => {
    it('should strip logo URL string at top level', () => {
      const data = { logo: 'https://example.com/logo.png' };
      const result = transformArrayFieldsForPayload(data);
      expect(result).not.toHaveProperty('logo');
    });

    it('should strip videoThumbnail URL string', () => {
      const data = { videoThumbnail: 'https://example.com/thumb.jpg' };
      const result = transformArrayFieldsForPayload(data);
      expect(result).not.toHaveProperty('videoThumbnail');
    });
  });
});

// ============================================================================
// filterVendorPayload unit tests
// ============================================================================

describe('filterVendorPayload', () => {
  it('should include all ALLOWED_UPDATE_FIELDS', () => {
    const vendor = {
      companyName: 'Test',
      description: 'Desc',
      contactEmail: 'test@test.com',
      certifications: [{ name: 'Cert', issuer: 'Org' }],
      awards: [{ title: 'Award', year: 2024 }],
      teamMembers: [{ name: 'John', role: 'CEO' }],
      caseStudies: [{ title: 'Study' }],
      mediaGallery: [{ type: 'image' }],
      serviceAreas: ['Mediterranean'],
      companyValues: ['Quality'],
    };

    const result = filterVendorPayload(vendor);
    expect(result.companyName).toBe('Test');
    expect(result.certifications).toHaveLength(1);
    expect(result.awards).toHaveLength(1);
    expect(result.teamMembers).toHaveLength(1);
    expect(result.caseStudies).toHaveLength(1);
    expect(result.mediaGallery).toHaveLength(1);
    expect(result.serviceAreas).toHaveLength(1);
    expect(result.companyValues).toHaveLength(1);
  });

  it('should exclude non-allowed fields', () => {
    const vendor = {
      id: '123',
      name: 'Test',  // 'name' is intentionally excluded (computed field)
      tier: 'tier1',
      published: true,
      user: 'user-123',
      companyName: 'Test',
    };

    const result = filterVendorPayload(vendor);
    expect(result).not.toHaveProperty('id');
    expect(result).not.toHaveProperty('name');
    expect(result).not.toHaveProperty('tier');
    expect(result).not.toHaveProperty('published');
    expect(result).not.toHaveProperty('user');
    expect(result.companyName).toBe('Test');
  });

  it('should coerce videoDuration string to number', () => {
    const vendor = { videoDuration: '120' };
    const result = filterVendorPayload(vendor);
    expect(result.videoDuration).toBe(120);
    expect(typeof result.videoDuration).toBe('number');
  });

  it('should coerce videoDuration MM:SS format to seconds', () => {
    const vendor = { videoDuration: '5:30' };
    const result = filterVendorPayload(vendor);
    expect(result.videoDuration).toBe(330);
  });

  it('should skip empty strings', () => {
    const vendor = { description: '', contactPhone: '' };
    const result = filterVendorPayload(vendor);
    expect(result).not.toHaveProperty('description');
    expect(result).not.toHaveProperty('contactPhone');
  });

  it('should skip null values', () => {
    const vendor = { description: null, website: null };
    const result = filterVendorPayload(vendor);
    expect(result).not.toHaveProperty('description');
    expect(result).not.toHaveProperty('website');
  });

  it('should skip empty arrays', () => {
    const vendor = { certifications: [], awards: [] };
    const result = filterVendorPayload(vendor);
    expect(result).not.toHaveProperty('certifications');
    expect(result).not.toHaveProperty('awards');
  });

  it('should filter empty items from array fields', () => {
    const vendor = {
      companyValues: ['Innovation', '', '  ', 'Quality'],
    };
    const result = filterVendorPayload(vendor);
    expect(result.companyValues).toEqual(['Innovation', 'Quality']);
  });
});

// ============================================================================
// Full pipeline tests: exact form payloads → filterVendorPayload → Zod
// ============================================================================

describe('Full Pipeline: Form → filterVendorPayload → Zod validation', () => {
  describe('CertificationsAwardsManager save payload', () => {
    it('should pass full pipeline with certifications and awards', () => {
      // Simulate the exact mergedVendor that CertificationsAwardsManager creates
      const mergedVendor = {
        id: 'vendor-123',
        name: 'Test Company',
        companyName: 'Test Company',
        slug: 'test-company',
        description: 'A test company',
        contactEmail: 'test@test.com',
        tier: 'tier1',
        certifications: [
          { name: 'ISO 9001', issuer: 'ISO', year: 2023, certificateUrl: 'https://iso.org/cert' },
          { name: 'ABYC', issuer: 'ABYC', year: 2022 },
        ],
        awards: [
          { title: 'Best Builder', organization: 'ShowBoats', year: 2024, category: 'Innovation' },
        ],
      };

      // Step 1: filterVendorPayload
      const filtered = filterVendorPayload(mergedVendor);
      expect(filtered.certifications).toHaveLength(2);
      expect(filtered.awards).toHaveLength(1);

      // Step 2: Zod validation
      const zodResult = safeValidateVendorUpdate(filtered);
      expect(zodResult.success).toBe(true);
      if (zodResult.success) {
        expect(zodResult.data.certifications).toHaveLength(2);
        expect(zodResult.data.awards).toHaveLength(1);
      }
    });
  });

  describe('TeamMembersManager save payload', () => {
    it('should pass full pipeline with component field names', () => {
      const mergedVendor = {
        id: 'vendor-123',
        companyName: 'Test Company',
        contactEmail: 'test@test.com',
        teamMembers: [
          {
            id: 'team-1',
            name: 'John Smith',
            role: 'CEO',
            bio: 'Experienced captain',
            image: 'https://example.com/john.jpg',  // Component field name
            linkedin: 'https://linkedin.com/in/john', // Component field name
            email: 'john@example.com',
            order: 0, // Component field name
            createdAt: '2024-01-01T00:00:00Z',
            updatedAt: '2024-01-01T00:00:00Z',
          },
        ],
      };

      // Step 1: filterVendorPayload
      const filtered = filterVendorPayload(mergedVendor);
      expect(filtered.teamMembers).toHaveLength(1);

      // Step 2: Zod validation - CRITICAL: linkedin/image/order must survive
      const zodResult = safeValidateVendorUpdate(filtered);
      expect(zodResult.success).toBe(true);
      if (zodResult.success) {
        const member = zodResult.data.teamMembers![0];
        expect(member.linkedin).toBe('https://linkedin.com/in/john');
        expect(member.image).toBe('https://example.com/john.jpg');
        expect(member.order).toBe(0);
      }

      // Step 3: transformArrayFieldsForPayload - should map to Payload names
      if (zodResult.success) {
        const transformed = transformArrayFieldsForPayload(zodResult.data as Record<string, unknown>);
        const member = (transformed.teamMembers as any[])[0];
        expect(member.linkedinUrl).toBe('https://linkedin.com/in/john');
        // image URL should be stripped (Payload expects media ID for photo)
        expect(member).not.toHaveProperty('photo');
      }
    });
  });

  describe('CaseStudiesManager save payload', () => {
    it('should pass full pipeline with plain text richText fields', () => {
      const mergedVendor = {
        id: 'vendor-123',
        companyName: 'Test Company',
        contactEmail: 'test@test.com',
        caseStudies: [
          {
            title: 'Yacht Refit Project',
            yachtName: 'MY Serenity',
            projectDate: '2024-06',
            challenge: 'The yacht needed a complete navigation overhaul.',
            solution: 'We installed a modern ECDIS and radar system.',
            results: 'Navigation accuracy improved by 40%.',
            testimonyQuote: 'Outstanding work',
            testimonyAuthor: 'Captain Smith',
            testimonyRole: 'Yacht Owner',
            featured: true,
          },
        ],
      };

      // Step 1: filterVendorPayload
      const filtered = filterVendorPayload(mergedVendor);

      // Step 2: Zod validation
      const zodResult = safeValidateVendorUpdate(filtered);
      expect(zodResult.success).toBe(true);

      // Step 3: transform - plain text should become Lexical JSON
      if (zodResult.success) {
        const transformed = transformArrayFieldsForPayload(zodResult.data as Record<string, unknown>);
        const cs = (transformed.caseStudies as any[])[0];
        expect(isLexicalJson(cs.challenge)).toBe(true);
        expect(isLexicalJson(cs.solution)).toBe(true);
        expect(isLexicalJson(cs.results)).toBe(true);
        // Verify the text content is preserved inside the Lexical structure
        expect(cs.challenge.root.children[0].children[0].text).toBe(
          'The yacht needed a complete navigation overhaul.'
        );
      }
    });
  });

  describe('BasicInfoForm save payload', () => {
    it('should pass full pipeline with basic info + video fields', () => {
      const mergedVendor = {
        id: 'vendor-123',
        name: 'Test Company',
        companyName: 'Test Company',
        slug: 'test-company',
        description: 'A test company',
        contactEmail: 'test@test.com',
        contactPhone: '+1-555-0123',
        videoUrl: 'https://youtube.com/watch?v=abc',
        videoDuration: '2:30', // String from form input
        videoTitle: 'Company Intro',
      };

      // Step 1: filterVendorPayload
      const filtered = filterVendorPayload(mergedVendor);
      // videoDuration should be coerced to number
      expect(filtered.videoDuration).toBe(150);
      expect(typeof filtered.videoDuration).toBe('number');

      // Step 2: Zod validation - must accept number
      const zodResult = safeValidateVendorUpdate(filtered);
      expect(zodResult.success).toBe(true);
    });
  });

  describe('Full vendor save with all array fields', () => {
    it('should pass pipeline with every array field populated', () => {
      const fullVendor = {
        id: 'vendor-123',
        companyName: 'Luxury Marine Services',
        slug: 'luxury-marine',
        description: 'Premium yacht services worldwide',
        contactEmail: 'info@luxury.com',
        contactPhone: '+1-555-0123',
        website: 'https://luxury.com',
        linkedinUrl: 'https://linkedin.com/company/luxury',
        foundedYear: 2005,
        totalProjects: 150,
        employeeCount: 45,
        videoUrl: 'https://youtube.com/watch?v=abc',
        videoDuration: '3:00',
        serviceAreas: ['Mediterranean', 'Caribbean'],
        companyValues: ['Innovation', 'Quality', 'Integrity'],
        certifications: [
          { name: 'ISO 9001', issuer: 'ISO', year: 2023 },
        ],
        awards: [
          { title: 'Best Builder', organization: 'SBI', year: 2024 },
        ],
        teamMembers: [
          { name: 'John', role: 'CEO', linkedin: 'https://linkedin.com/in/john', order: 0 },
        ],
        caseStudies: [
          { title: 'Project X', challenge: 'Hard problem', solution: 'Good fix', results: 'Great outcome', featured: true },
        ],
        mediaGallery: [
          { type: 'image', media: 42, caption: 'Portfolio' },
          { type: 'video', url: 'https://youtube.com/watch?v=def' },
        ],
      };

      const filtered = filterVendorPayload(fullVendor);
      const zodResult = safeValidateVendorUpdate(filtered);

      expect(zodResult.success).toBe(true);
      if (!zodResult.success) {
        // If this fails, print the exact Zod errors for debugging
        console.error('Zod errors:', zodResult.error.errors.map(e => ({
          path: e.path.join('.'),
          message: e.message,
          code: e.code,
        })));
      }

      if (zodResult.success) {
        const transformed = transformArrayFieldsForPayload(zodResult.data as Record<string, unknown>);

        // Verify all arrays survived the pipeline
        expect(transformed.certifications).toHaveLength(1);
        expect(transformed.awards).toHaveLength(1);
        expect(transformed.teamMembers).toHaveLength(1);
        expect(transformed.caseStudies).toHaveLength(1);
        expect(transformed.mediaGallery).toHaveLength(2);
        expect(transformed.serviceAreas).toEqual([
          { area: 'Mediterranean' },
          { area: 'Caribbean' },
        ]);
        expect(transformed.companyValues).toEqual([
          { value: 'Innovation' },
          { value: 'Quality' },
          { value: 'Integrity' },
        ]);
      }
    });
  });
});
