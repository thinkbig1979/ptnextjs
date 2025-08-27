#!/usr/bin/env ts-node

/**
 * TinaCMS Migration Validation Script - Milestone 3
 * 
 * Validates migrated content for:
 * 1. Data integrity
 * 2. File format compliance
 * 3. Relationship consistency
 * 4. Media file availability
 * 5. TinaCMS schema compliance
 */

import fs from 'fs/promises';
import path from 'path';
import matter from 'gray-matter';

interface ValidationConfig {
  contentPath: string;
  mediaPath: string;
  schemaPath: string;
  strictMode: boolean;
}

interface ValidationIssue {
  type: 'error' | 'warning';
  collection: string;
  file: string;
  field?: string;
  message: string;
  suggestion?: string;
}

interface ValidationReport {
  timestamp: string;
  totalFiles: number;
  validFiles: number;
  totalIssues: number;
  errors: ValidationIssue[];
  warnings: ValidationIssue[];
  collections: {
    [collectionName: string]: {
      totalFiles: number;
      validFiles: number;
      issues: ValidationIssue[];
    }
  };
  relationships: {
    totalReferences: number;
    validReferences: number;
    brokenReferences: string[];
  };
  mediaFiles: {
    totalRequired: number;
    availableFiles: number;
    missingFiles: string[];
  };
}

interface CollectionSchema {
  name: string;
  path: string;
  format: 'md' | 'json';
  requiredFields: string[];
  optionalFields: string[];
  relationships: {
    [fieldName: string]: {
      collection: string;
      required: boolean;
    }
  };
}

class TinaCMSValidator {
  private config: ValidationConfig;
  private report: ValidationReport;
  private schemas: Map<string, CollectionSchema> = new Map();

  constructor(config: ValidationConfig) {
    this.config = config;
    this.report = {
      timestamp: new Date().toISOString(),
      totalFiles: 0,
      validFiles: 0,
      totalIssues: 0,
      errors: [],
      warnings: [],
      collections: {},
      relationships: {
        totalReferences: 0,
        validReferences: 0,
        brokenReferences: []
      },
      mediaFiles: {
        totalRequired: 0,
        availableFiles: 0,
        missingFiles: []
      }
    };
  }

  /**
   * Main validation execution
   */
  async validate(): Promise<ValidationReport> {
    console.log('🔍 Starting TinaCMS migration validation...');
    console.log(`📅 Validation started at: ${this.report.timestamp}`);

    try {
      // Initialize collection schemas
      await this.initializeSchemas();

      // Validate content files
      await this.validateContentFiles();

      // Validate relationships
      await this.validateRelationships();

      // Validate media files
      await this.validateMediaFiles();

      // Generate summary
      this.generateSummary();

      console.log('✅ Validation completed');
      return this.report;

    } catch (error) {
      console.error('❌ Validation failed:', error);
      throw error;
    }
  }

  /**
   * Initialize collection schemas
   */
  private async initializeSchemas(): Promise<void> {
    console.log('📋 Initializing collection schemas...');

    // Define schemas based on TinaCMS configuration
    const schemas: CollectionSchema[] = [
      {
        name: 'category',
        path: 'categories',
        format: 'md',
        requiredFields: ['name', 'slug', 'description'],
        optionalFields: ['icon', 'color', 'order'],
        relationships: {}
      },
      {
        name: 'tag',
        path: 'tags',
        format: 'md',
        requiredFields: ['name', 'slug'],
        optionalFields: ['description', 'color', 'usage_count'],
        relationships: {}
      },
      {
        name: 'blogCategory',
        path: 'blog/categories',
        format: 'md',
        requiredFields: ['name', 'slug'],
        optionalFields: ['description', 'color', 'order'],
        relationships: {}
      },
      {
        name: 'partner',
        path: 'partners',
        format: 'md',
        requiredFields: ['name', 'slug'],
        optionalFields: ['logo', 'image', 'website', 'founded', 'location', 'featured'],
        relationships: {
          category: { collection: 'category', required: false },
          tags: { collection: 'tag', required: false }
        }
      },
      {
        name: 'product',
        path: 'products',
        format: 'md',
        requiredFields: ['name', 'description'],
        optionalFields: ['slug', 'price', 'product_images', 'features'],
        relationships: {
          partner: { collection: 'partner', required: true },
          category: { collection: 'category', required: false },
          tags: { collection: 'tag', required: false }
        }
      },
      {
        name: 'blogPost',
        path: 'blog/posts',
        format: 'md',
        requiredFields: ['title', 'slug', 'excerpt', 'author', 'published_at'],
        optionalFields: ['featured', 'read_time', 'image'],
        relationships: {
          blog_category: { collection: 'blogCategory', required: false },
          tags: { collection: 'tag', required: false }
        }
      },
      {
        name: 'teamMember',
        path: 'team',
        format: 'md',
        requiredFields: ['name', 'role'],
        optionalFields: ['image', 'email', 'linkedin', 'order'],
        relationships: {}
      },
      {
        name: 'companyInfo',
        path: 'company',
        format: 'json',
        requiredFields: ['name', 'tagline', 'description', 'founded', 'location', 'address', 'phone', 'email', 'story'],
        optionalFields: ['logo', 'social_media', 'seo'],
        relationships: {}
      }
    ];

    schemas.forEach(schema => {
      this.schemas.set(schema.name, schema);
    });

    console.log(`✅ Initialized ${schemas.length} collection schemas`);
  }

  /**
   * Validate content files
   */
  private async validateContentFiles(): Promise<void> {
    console.log('📝 Validating content files...');

    for (const [collectionName, schema] of this.schemas) {
      const collectionPath = path.join(this.config.contentPath, schema.path);
      
      try {
        const files = await this.getContentFiles(collectionPath, schema.format);
        
        this.report.collections[collectionName] = {
          totalFiles: files.length,
          validFiles: 0,
          issues: []
        };

        for (const file of files) {
          const isValid = await this.validateContentFile(file, schema, collectionName);
          if (isValid) {
            this.report.collections[collectionName].validFiles++;
          }
        }

        console.log(`✅ ${collectionName}: ${this.report.collections[collectionName].validFiles}/${files.length} valid`);

      } catch (error) {
        this.addIssue('error', collectionName, '', '', `Failed to validate collection: ${error instanceof Error ? error.message : 'Unknown error'}`);
      }
    }
  }

  /**
   * Get content files for collection
   */
  private async getContentFiles(collectionPath: string, format: 'md' | 'json'): Promise<string[]> {
    try {
      const files = await fs.readdir(collectionPath);
      const extension = format === 'md' ? '.md' : '.json';
      return files
        .filter(file => file.endsWith(extension))
        .map(file => path.join(collectionPath, file));
    } catch (error) {
      return [];
    }
  }

  /**
   * Validate individual content file
   */
  private async validateContentFile(filePath: string, schema: CollectionSchema, collectionName: string): Promise<boolean> {
    this.report.totalFiles++;
    let isValid = true;
    const filename = path.basename(filePath);

    try {
      const content = await fs.readFile(filePath, 'utf-8');
      let data: any;

      if (schema.format === 'md') {
        const parsed = matter(content);
        data = parsed.data;
        
        // Validate frontmatter exists
        if (Object.keys(data).length === 0) {
          this.addIssue('error', collectionName, filename, '', 'Missing frontmatter');
          isValid = false;
        }

        // Validate markdown content exists
        if (!parsed.content.trim()) {
          this.addIssue('warning', collectionName, filename, '', 'Empty markdown content');
        }
        
      } else {
        data = JSON.parse(content);
      }

      // Validate required fields
      for (const field of schema.requiredFields) {
        if (!data[field]) {
          this.addIssue('error', collectionName, filename, field, `Missing required field: ${field}`);
          isValid = false;
        }
      }

      // Validate field types and formats
      isValid = this.validateFieldTypes(data, schema, collectionName, filename) && isValid;

      // Validate relationships
      for (const [fieldName, relationship] of Object.entries(schema.relationships)) {
        if (data[fieldName]) {
          this.validateRelationshipField(data[fieldName], relationship, collectionName, filename, fieldName);
        } else if (relationship.required) {
          this.addIssue('error', collectionName, filename, fieldName, `Missing required relationship: ${fieldName}`);
          isValid = false;
        }
      }

      if (isValid) {
        this.report.validFiles++;
      }

    } catch (error) {
      this.addIssue('error', collectionName, filename, '', `File parsing error: ${error instanceof Error ? error.message : 'Unknown error'}`);
      isValid = false;
    }

    return isValid;
  }

  /**
   * Validate field types and formats
   */
  private validateFieldTypes(data: any, schema: CollectionSchema, collectionName: string, filename: string): boolean {
    let isValid = true;

    // Validate slug format
    if (data.slug && typeof data.slug === 'string') {
      if (!/^[a-z0-9-]+$/.test(data.slug)) {
        this.addIssue('warning', collectionName, filename, 'slug', 'Slug should contain only lowercase letters, numbers, and hyphens');
      }
    }

    // Validate email format
    if (data.email && typeof data.email === 'string') {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(data.email)) {
        this.addIssue('error', collectionName, filename, 'email', 'Invalid email format');
        isValid = false;
      }
    }

    // Validate URL format
    const urlFields = ['website', 'linkedin', 'facebook', 'twitter', 'instagram', 'youtube'];
    for (const field of urlFields) {
      if (data[field] && typeof data[field] === 'string' && data[field].trim()) {
        try {
          new URL(data[field]);
        } catch {
          this.addIssue('warning', collectionName, filename, field, `Invalid URL format: ${field}`);
        }
      }
    }

    // Validate color format
    if (data.color && typeof data.color === 'string') {
      if (!/^#[0-9A-Fa-f]{6}$/.test(data.color)) {
        this.addIssue('warning', collectionName, filename, 'color', 'Color should be in hex format (#RRGGBB)');
      }
    }

    // Validate founded year
    if (data.founded && typeof data.founded === 'number') {
      const currentYear = new Date().getFullYear();
      if (data.founded < 1800 || data.founded > currentYear) {
        this.addIssue('warning', collectionName, filename, 'founded', `Founded year seems unrealistic: ${data.founded}`);
      }
    }

    // Validate published_at date format
    if (data.published_at && typeof data.published_at === 'string') {
      try {
        const date = new Date(data.published_at);
        if (isNaN(date.getTime())) {
          this.addIssue('error', collectionName, filename, 'published_at', 'Invalid date format');
          isValid = false;
        }
      } catch {
        this.addIssue('error', collectionName, filename, 'published_at', 'Invalid date format');
        isValid = false;
      }
    }

    return isValid;
  }

  /**
   * Validate relationship field
   */
  private validateRelationshipField(value: any, relationship: any, collectionName: string, filename: string, fieldName: string): void {
    this.report.relationships.totalReferences++;

    if (Array.isArray(value)) {
      // Handle array of relationships (tags, etc.)
      for (const item of value) {
        this.validateSingleRelationship(item, relationship.collection, collectionName, filename, fieldName);
      }
    } else {
      // Handle single relationship
      this.validateSingleRelationship(value, relationship.collection, collectionName, filename, fieldName);
    }
  }

  /**
   * Validate single relationship reference
   */
  private validateSingleRelationship(reference: string, targetCollection: string, collectionName: string, filename: string, fieldName: string): void {
    if (typeof reference !== 'string' || !reference.startsWith('content/')) {
      this.addIssue('error', collectionName, filename, fieldName, `Invalid reference format: ${reference}`);
      this.report.relationships.brokenReferences.push(`${filename}:${fieldName} -> ${reference}`);
      return;
    }

    // Extract the referenced file path
    const referencePath = path.join(this.config.contentPath, '..', reference);
    
    // Check if referenced file exists (we'll do this in the relationship validation phase)
    this.validateReferenceExists(referencePath, reference, collectionName, filename, fieldName);
  }

  /**
   * Validate that referenced file exists
   */
  private async validateReferenceExists(referencePath: string, reference: string, collectionName: string, filename: string, fieldName: string): Promise<void> {
    try {
      await fs.access(referencePath);
      this.report.relationships.validReferences++;
    } catch {
      this.addIssue('error', collectionName, filename, fieldName, `Broken reference: ${reference}`);
      this.report.relationships.brokenReferences.push(`${filename}:${fieldName} -> ${reference}`);
    }
  }

  /**
   * Validate relationships across all collections
   */
  private async validateRelationships(): Promise<void> {
    console.log('🔗 Validating relationships...');
    
    // This is handled during content file validation
    // Additional cross-collection validation could be added here
    
    const brokenCount = this.report.relationships.brokenReferences.length;
    const validCount = this.report.relationships.validReferences;
    const totalCount = this.report.relationships.totalReferences;
    
    console.log(`✅ Relationships: ${validCount}/${totalCount} valid, ${brokenCount} broken`);
  }

  /**
   * Validate media files
   */
  private async validateMediaFiles(): Promise<void> {
    console.log('🖼️ Validating media files...');

    const mediaReferences = await this.collectMediaReferences();
    this.report.mediaFiles.totalRequired = mediaReferences.length;

    for (const mediaRef of mediaReferences) {
      const mediaPath = path.join(this.config.mediaPath, '..', mediaRef.path);
      
      try {
        await fs.access(mediaPath);
        this.report.mediaFiles.availableFiles++;
      } catch {
        this.report.mediaFiles.missingFiles.push(mediaRef.path);
        this.addIssue('warning', mediaRef.collection, mediaRef.file, mediaRef.field, `Missing media file: ${mediaRef.path}`);
      }
    }

    console.log(`✅ Media files: ${this.report.mediaFiles.availableFiles}/${this.report.mediaFiles.totalRequired} available`);
  }

  /**
   * Collect all media references from content
   */
  private async collectMediaReferences(): Promise<Array<{ path: string; collection: string; file: string; field: string }>> {
    const references: Array<{ path: string; collection: string; file: string; field: string }> = [];
    
    for (const [collectionName, schema] of this.schemas) {
      const collectionPath = path.join(this.config.contentPath, schema.path);
      
      try {
        const files = await this.getContentFiles(collectionPath, schema.format);
        
        for (const file of files) {
          const content = await fs.readFile(file, 'utf-8');
          const filename = path.basename(file);
          let data: any;

          if (schema.format === 'md') {
            data = matter(content).data;
          } else {
            data = JSON.parse(content);
          }

          // Check for image fields
          const imageFields = ['logo', 'image', 'og_image'];
          for (const field of imageFields) {
            if (data[field] && typeof data[field] === 'string' && data[field].startsWith('/media/')) {
              references.push({
                path: data[field],
                collection: collectionName,
                file: filename,
                field
              });
            }
          }

          // Check for product_images array
          if (data.product_images && Array.isArray(data.product_images)) {
            data.product_images.forEach((img: any, index: number) => {
              if (img.image && typeof img.image === 'string' && img.image.startsWith('/media/')) {
                references.push({
                  path: img.image,
                  collection: collectionName,
                  file: filename,
                  field: `product_images[${index}].image`
                });
              }
            });
          }

          // Check for nested social media images
          if (data.social_media) {
            Object.entries(data.social_media).forEach(([platform, url]) => {
              if (typeof url === 'string' && url.startsWith('/media/')) {
                references.push({
                  path: url,
                  collection: collectionName,
                  file: filename,
                  field: `social_media.${platform}`
                });
              }
            });
          }

          // Check for SEO images
          if (data.seo?.og_image && typeof data.seo.og_image === 'string' && data.seo.og_image.startsWith('/media/')) {
            references.push({
              path: data.seo.og_image,
              collection: collectionName,
              file: filename,
              field: 'seo.og_image'
            });
          }
        }
      } catch (error) {
        console.error(`Error processing collection ${collectionName}:`, error);
      }
    }

    return references;
  }

  /**
   * Add validation issue
   */
  private addIssue(type: 'error' | 'warning', collection: string, file: string, field: string, message: string, suggestion?: string): void {
    const issue: ValidationIssue = {
      type,
      collection,
      file,
      field,
      message,
      suggestion
    };

    if (type === 'error') {
      this.report.errors.push(issue);
    } else {
      this.report.warnings.push(issue);
    }

    this.report.totalIssues++;

    if (this.report.collections[collection]) {
      this.report.collections[collection].issues.push(issue);
    }
  }

  /**
   * Generate validation summary
   */
  private generateSummary(): void {
    console.log('\n📊 Validation Summary:');
    console.log(`   Total Files: ${this.report.totalFiles}`);
    console.log(`   Valid Files: ${this.report.validFiles}`);
    console.log(`   Total Issues: ${this.report.totalIssues}`);
    console.log(`   Errors: ${this.report.errors.length}`);
    console.log(`   Warnings: ${this.report.warnings.length}`);

    if (this.report.errors.length > 0) {
      console.log('\n❌ Critical Errors:');
      this.report.errors.slice(0, 10).forEach(error => {
        console.log(`   ${error.collection}/${error.file}${error.field ? ':' + error.field : ''} - ${error.message}`);
      });
      
      if (this.report.errors.length > 10) {
        console.log(`   ... and ${this.report.errors.length - 10} more errors`);
      }
    }

    if (this.report.warnings.length > 0) {
      console.log('\n⚠️ Warnings:');
      this.report.warnings.slice(0, 5).forEach(warning => {
        console.log(`   ${warning.collection}/${warning.file}${warning.field ? ':' + warning.field : ''} - ${warning.message}`);
      });
      
      if (this.report.warnings.length > 5) {
        console.log(`   ... and ${this.report.warnings.length - 5} more warnings`);
      }
    }

    console.log(`\n🔗 Relationships: ${this.report.relationships.validReferences}/${this.report.relationships.totalReferences} valid`);
    console.log(`🖼️ Media Files: ${this.report.mediaFiles.availableFiles}/${this.report.mediaFiles.totalRequired} available`);

    if (this.report.errors.length === 0) {
      console.log('\n✅ Migration validation passed!');
    } else {
      console.log('\n❌ Migration validation failed - please fix critical errors');
    }
  }

  /**
   * Save validation report
   */
  async saveReport(reportPath: string): Promise<void> {
    await fs.writeFile(reportPath, JSON.stringify(this.report, null, 2), 'utf-8');
    console.log(`📄 Validation report saved to: ${reportPath}`);
  }
}

// CLI interface
if (require.main === module) {
  const config: ValidationConfig = {
    contentPath: path.join(__dirname, '..', '..', 'content'),
    mediaPath: path.join(__dirname, '..', '..', 'public', 'media'),
    schemaPath: path.join(__dirname, '..', '..', 'tina', 'config.ts'),
    strictMode: process.argv.includes('--strict')
  };

  const validator = new TinaCMSValidator(config);
  
  validator.validate()
    .then(async (report) => {
      const reportPath = path.join(__dirname, 'validation-report.json');
      await validator.saveReport(reportPath);
      
      if (report.errors.length > 0) {
        console.log('\n💥 Validation failed with errors');
        process.exit(1);
      } else {
        console.log('\n🎉 Validation completed successfully!');
        process.exit(0);
      }
    })
    .catch((error) => {
      console.error('\n💥 Validation script failed:', error);
      process.exit(1);
    });
}

export { TinaCMSValidator, ValidationConfig, ValidationReport, ValidationIssue };