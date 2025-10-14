import * as fs from 'fs/promises';
import * as path from 'path';
import {
  parseMarkdownFile,
  parseMarkdownDirectory,
  generateSlug,
  transformMediaPath,
  resolveReference,
} from '../../../scripts/migration/utils/markdown-parser';

describe('Markdown Parser Utilities', () => {
  const fixturesDir = path.resolve(__dirname, '../../fixtures/migration');

  describe('parseMarkdownFile', () => {
    it('should parse valid markdown with complete frontmatter', async () => {
      const filePath = path.join(fixturesDir, 'sample-vendor.md');
      const result = await parseMarkdownFile(filePath);

      expect(result.filename).toBe('sample-vendor');
      expect(result.slug).toBe('test-marine-supplier');
      expect(result.frontmatter.name).toBe('Test Marine Supplier Co.');
      expect(result.frontmatter.contactEmail).toBe('info@testmarinesupplier.com');
      expect(result.content).toContain('Test Marine Supplier Co. has been a leading provider');
    });

    it('should parse markdown with missing frontmatter fields', async () => {
      const filePath = path.join(fixturesDir, 'invalid-vendor.md');
      const result = await parseMarkdownFile(filePath);

      expect(result.filename).toBe('invalid-vendor');
      expect(result.frontmatter.name).toBeUndefined();
      expect(result.frontmatter.contactEmail).toBeUndefined();
      expect(result.slug).toBe('invalid-vendor-no-required-fields');
    });

    it('should handle product markdown with vendor reference', async () => {
      const filePath = path.join(fixturesDir, 'sample-product.md');
      const result = await parseMarkdownFile(filePath);

      expect(result.frontmatter.name).toBe('Advanced Navigation System XR-2000');
      expect(result.frontmatter.vendor).toBe('content/vendors/test-marine-supplier.md');
      expect(result.frontmatter.product_images).toHaveLength(2);
      expect(result.frontmatter.specifications).toHaveLength(5);
    });

    it('should handle blog post markdown', async () => {
      const filePath = path.join(fixturesDir, 'sample-blog.md');
      const result = await parseMarkdownFile(filePath);

      expect(result.frontmatter.title).toBe('Navigating the Future of Superyacht Technology');
      expect(result.frontmatter.categories).toEqual(['Technology', 'Innovation']);
      expect(result.content).toContain('technological revolution');
    });

    it('should use filename as slug when frontmatter slug is missing', async () => {
      // Create a temporary test file
      const testPath = path.join(fixturesDir, 'test-no-slug.md');
      await fs.writeFile(testPath, '---\nname: "Test"\n---\nContent');

      const result = await parseMarkdownFile(testPath);
      expect(result.slug).toBe('test-no-slug');

      // Cleanup
      await fs.unlink(testPath);
    });
  });

  describe('parseMarkdownDirectory', () => {
    it('should parse all markdown files in directory', async () => {
      const results = await parseMarkdownDirectory(fixturesDir);

      expect(results.length).toBeGreaterThan(0);
      const vendorFile = results.find(r => r.filename === 'sample-vendor');
      expect(vendorFile).toBeDefined();
      expect(vendorFile?.frontmatter.name).toBe('Test Marine Supplier Co.');
    });

    it('should return empty array for directory with no markdown files', async () => {
      const emptyDir = path.join(fixturesDir, 'empty-test-dir');
      await fs.mkdir(emptyDir, { recursive: true });

      const results = await parseMarkdownDirectory(emptyDir);
      expect(results).toEqual([]);

      // Cleanup
      await fs.rmdir(emptyDir);
    });

    it('should ignore non-markdown files', async () => {
      const testDir = path.join(fixturesDir, 'mixed-files-test');
      await fs.mkdir(testDir, { recursive: true });
      await fs.writeFile(path.join(testDir, 'test.txt'), 'Not markdown');
      await fs.writeFile(path.join(testDir, 'test.md'), '---\nname: "Test"\n---\nContent');

      const results = await parseMarkdownDirectory(testDir);
      expect(results).toHaveLength(1);
      expect(results[0].filename).toBe('test');

      // Cleanup
      await fs.unlink(path.join(testDir, 'test.txt'));
      await fs.unlink(path.join(testDir, 'test.md'));
      await fs.rmdir(testDir);
    });
  });

  describe('generateSlug', () => {
    it('should generate slug from simple filename', () => {
      expect(generateSlug('test-file')).toBe('test-file');
      expect(generateSlug('TestFile')).toBe('testfile');
    });

    it('should handle special characters', () => {
      expect(generateSlug('Test & File')).toBe('test-file');
      expect(generateSlug('Test@File#123')).toBe('test-file-123');
      expect(generateSlug('Test___File')).toBe('test-file');
    });

    it('should remove leading and trailing dashes', () => {
      expect(generateSlug('-test-file-')).toBe('test-file');
      expect(generateSlug('---test---')).toBe('test');
    });

    it('should handle unicode characters', () => {
      expect(generateSlug('Café-Marine')).toBe('caf-marine');
      expect(generateSlug('Test™File©')).toBe('test-file');
    });

    it('should handle empty or invalid input', () => {
      expect(generateSlug('')).toBe('');
      expect(generateSlug('!!!')).toBe('');
    });
  });

  describe('transformMediaPath', () => {
    it('should return empty string for empty input', () => {
      expect(transformMediaPath('')).toBe('');
      expect(transformMediaPath(null as any)).toBe('');
      expect(transformMediaPath(undefined as any)).toBe('');
    });

    it('should preserve HTTP/HTTPS URLs', () => {
      expect(transformMediaPath('https://example.com/image.jpg')).toBe('https://example.com/image.jpg');
      expect(transformMediaPath('http://example.com/image.jpg')).toBe('http://example.com/image.jpg');
    });

    it('should preserve paths already starting with /media/', () => {
      expect(transformMediaPath('/media/vendors/logo.png')).toBe('/media/vendors/logo.png');
    });

    it('should preserve absolute paths', () => {
      expect(transformMediaPath('/images/logo.png')).toBe('/images/logo.png');
    });

    it('should transform relative paths to /media/', () => {
      expect(transformMediaPath('vendors/logo.png')).toBe('/media/vendors/logo.png');
      expect(transformMediaPath('logo.png')).toBe('/media/logo.png');
    });

    it('should handle paths with leading slashes correctly', () => {
      expect(transformMediaPath('/vendors/logo.png')).toBe('/vendors/logo.png');
    });
  });

  describe('resolveReference', () => {
    it('should resolve content reference to slug', () => {
      expect(resolveReference('content/vendors/test-marine-supplier.md')).toBe('test-marine-supplier');
      expect(resolveReference('content/products/navigation-system.md')).toBe('navigation-system');
    });

    it('should return null for non-content paths', () => {
      expect(resolveReference('vendors/test.md')).toBeNull();
      expect(resolveReference('/media/image.png')).toBeNull();
    });

    it('should return null for empty or invalid input', () => {
      expect(resolveReference('')).toBeNull();
      expect(resolveReference(null as any)).toBeNull();
      expect(resolveReference(undefined as any)).toBeNull();
    });

    it('should handle references without .md extension', () => {
      expect(resolveReference('content/vendors/test-vendor')).toBe('test-vendor');
    });

    it('should extract filename from nested content paths', () => {
      expect(resolveReference('content/blog/posts/article.md')).toBe('article');
      expect(resolveReference('content/categories/marine-tech.md')).toBe('marine-tech');
    });
  });
});
