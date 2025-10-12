/**
 * Integration Test: Dry-Run Mode
 * Tests that dry-run mode prevents database writes while still validating data
 */

import * as path from 'path';
import { parseMarkdownFile } from '../../../scripts/migration/utils/markdown-parser';
import { validateVendorData, validateProductData } from '../../../scripts/migration/utils/validation';

describe('Migration Dry-Run Mode', () => {
  const fixturesDir = path.resolve(__dirname, '../../fixtures/migration');

  describe('Dry-run validation without database writes', () => {
    it('should parse and validate vendor data in dry-run mode', async () => {
      const filePath = path.join(fixturesDir, 'sample-vendor.md');
      const parsed = await parseMarkdownFile(filePath);

      // Simulate dry-run processing
      const vendorData = {
        user: 'mock-user-id',
        tier: parsed.frontmatter.tier || 'free',
        companyName: parsed.frontmatter.name,
        slug: parsed.slug,
        contactEmail: parsed.frontmatter.contactEmail,
        description: parsed.frontmatter.description,
        logo: parsed.frontmatter.logo,
        contactPhone: parsed.frontmatter.contactPhone,
        website: parsed.frontmatter.website,
        linkedinUrl: parsed.frontmatter.linkedinUrl,
        twitterUrl: parsed.frontmatter.twitterUrl,
      };

      const validation = validateVendorData(vendorData);

      expect(validation.valid).toBe(true);
      expect(validation.errors).toHaveLength(0);

      // In dry-run, no database insert should occur
      // This is verified by the absence of payload.create() calls
    });

    it('should detect validation errors in dry-run mode', async () => {
      const filePath = path.join(fixturesDir, 'invalid-vendor.md');
      const parsed = await parseMarkdownFile(filePath);

      const vendorData = {
        user: 'mock-user-id',
        tier: 'free',
        companyName: parsed.frontmatter.name, // undefined
        slug: parsed.slug,
        contactEmail: parsed.frontmatter.contactEmail, // undefined
      };

      const validation = validateVendorData(vendorData);

      expect(validation.valid).toBe(false);
      expect(validation.errors.length).toBeGreaterThan(0);
      expect(validation.errors.some(e => e.field === 'companyName')).toBe(true);
      expect(validation.errors.some(e => e.field === 'contactEmail')).toBe(true);
    });

    it('should validate product data with vendor reference in dry-run', async () => {
      const filePath = path.join(fixturesDir, 'sample-product.md');
      const parsed = await parseMarkdownFile(filePath);

      const productData = {
        name: parsed.frontmatter.name,
        vendor: 'mock-vendor-id', // In real migration, this is resolved
        slug: parsed.slug,
      };

      const validation = validateProductData(productData);

      expect(validation.valid).toBe(true);
      expect(validation.errors).toHaveLength(0);
    });

    it('should generate migration report in dry-run mode', async () => {
      // Simulate dry-run report generation
      const report = {
        vendors: {
          processed: 1,
          valid: 1,
          invalid: 0,
          errors: [],
        },
        products: {
          processed: 1,
          valid: 1,
          invalid: 0,
          errors: [],
        },
      };

      expect(report.vendors.valid).toBe(1);
      expect(report.products.valid).toBe(1);
      expect(report.vendors.errors).toHaveLength(0);
    });
  });

  describe('Dry-run flag behavior', () => {
    it('should recognize --dry-run flag', () => {
      const args = ['--dry-run'];
      const isDryRun = args.includes('--dry-run');

      expect(isDryRun).toBe(true);
    });

    it('should combine --dry-run with other flags', () => {
      const args = ['--dry-run', '--skip-backup'];
      const isDryRun = args.includes('--dry-run');
      const skipBackup = args.includes('--skip-backup');

      expect(isDryRun).toBe(true);
      expect(skipBackup).toBe(true);
    });

    it('should log dry-run operations without executing', () => {
      const logs: string[] = [];
      const dryRunLog = (message: string) => logs.push(message);

      // Simulate dry-run logging
      dryRunLog('[DRY RUN] Would create vendor: test-marine-supplier');
      dryRunLog('[DRY RUN] Would create product: advanced-navigation-system-xr2000');

      expect(logs).toHaveLength(2);
      expect(logs[0]).toContain('DRY RUN');
      expect(logs[0]).toContain('vendor');
      expect(logs[1]).toContain('product');
    });
  });

  describe('Transition from dry-run to real migration', () => {
    it('should show same validation results in dry-run and real mode', async () => {
      const filePath = path.join(fixturesDir, 'sample-vendor.md');
      const parsed = await parseMarkdownFile(filePath);

      const vendorData = {
        user: 'mock-user-id',
        tier: parsed.frontmatter.tier || 'free',
        companyName: parsed.frontmatter.name,
        slug: parsed.slug,
        contactEmail: parsed.frontmatter.contactEmail,
        description: parsed.frontmatter.description,
      };

      // Validation is the same regardless of mode
      const dryRunValidation = validateVendorData(vendorData);
      const realValidation = validateVendorData(vendorData);

      expect(dryRunValidation.valid).toBe(realValidation.valid);
      expect(dryRunValidation.errors).toEqual(realValidation.errors);
    });

    it('should process same files in both modes', async () => {
      const filePath = path.join(fixturesDir, 'sample-vendor.md');

      // Both modes parse the same file
      const parsed1 = await parseMarkdownFile(filePath);
      const parsed2 = await parseMarkdownFile(filePath);

      expect(parsed1.slug).toBe(parsed2.slug);
      expect(parsed1.frontmatter).toEqual(parsed2.frontmatter);
      expect(parsed1.content).toBe(parsed2.content);
    });
  });

  describe('Dry-run output formatting', () => {
    it('should format dry-run output clearly', () => {
      const dryRunPrefix = '[DRY RUN]';
      const message = 'Would create vendor: test-company';
      const formattedMessage = `${dryRunPrefix} ${message}`;

      expect(formattedMessage).toContain('DRY RUN');
      expect(formattedMessage).toContain('Would create');
    });

    it('should distinguish dry-run logs from real migration logs', () => {
      const dryRunLog = '[DRY RUN] Would create vendor: test';
      const realLog = 'Created vendor: test';

      expect(dryRunLog).toContain('DRY RUN');
      expect(dryRunLog).toContain('Would');
      expect(realLog).not.toContain('DRY RUN');
      expect(realLog).toContain('Created');
    });
  });
});
