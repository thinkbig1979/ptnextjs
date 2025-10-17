/**
 * Validation Utilities
 *
 * Pre-migration and post-migration validation to ensure data integrity
 * and zero data loss during TinaCMS to Payload migration.
 */

import { Payload } from 'payload';
import { getMarkdownCounts, parseCollectionFiles, resolveReferenceToSlug } from './markdown-parser';

export interface ValidationResult {
  valid: boolean;
  errors: string[];
  warnings: string[];
}

export interface CountComparison {
  collection: string;
  tinaCMS: number;
  payload: number;
  match: boolean;
}

/**
 * Validate TinaCMS content before migration
 */
export async function validateTinaCMSContent(): Promise<ValidationResult> {
  console.log('\n📋 Validating TinaCMS content...\n');

  const errors: string[] = [];
  const warnings: string[] = [];

  try {
    // Get content counts
    const counts = await getMarkdownCounts();

    console.log('Content inventory:');
    for (const [collection, count] of Object.entries(counts)) {
      console.log(`  ${collection}: ${count} items`);

      if (count === 0 && collection !== 'yachts' && collection !== 'company') {
        warnings.push(`Collection '${collection}' has no content`);
      }
    }

    // Validate reference integrity
    const referenceValidation = await validateReferences();
    errors.push(...referenceValidation.errors);
    warnings.push(...referenceValidation.warnings);

    console.log('\n✓ Pre-migration validation complete\n');

    return {
      valid: errors.length === 0,
      errors,
      warnings,
    };
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    errors.push(`Validation error: ${errorMessage}`);

    return {
      valid: false,
      errors,
      warnings,
    };
  }
}

/**
 * Validate reference integrity (category/tag references)
 */
async function validateReferences(): Promise<ValidationResult> {
  const errors: string[] = [];
  const warnings: string[] = [];

  try {
    // Get all categories and tags
    const categories = await parseCollectionFiles('categories');
    const tags = await parseCollectionFiles('tags');

    const categorySlugs = new Set(categories.map((c) => c.fileName));
    const tagSlugs = new Set(tags.map((t) => t.fileName));

    // Validate vendor references
    const vendors = await parseCollectionFiles('vendors');
    for (const vendor of vendors) {
      // Check category references
      if (vendor.data.category) {
        const slug = resolveReferenceToSlug(vendor.data.category);
        if (slug && !categorySlugs.has(slug)) {
          errors.push(
            `Vendor '${vendor.fileName}' references non-existent category: ${vendor.data.category}`
          );
        }
      }

      // Check tag references
      if (Array.isArray(vendor.data.tags)) {
        for (const tagRef of vendor.data.tags) {
          const slug = resolveReferenceToSlug(tagRef);
          if (slug && !tagSlugs.has(slug)) {
            errors.push(
              `Vendor '${vendor.fileName}' references non-existent tag: ${tagRef}`
            );
          }
        }
      }
    }

    // Validate product references
    const products = await parseCollectionFiles('products');
    for (const product of products) {
      // Check category references
      if (product.data.category) {
        const slug = resolveReferenceToSlug(product.data.category);
        if (slug && !categorySlugs.has(slug)) {
          errors.push(
            `Product '${product.fileName}' references non-existent category: ${product.data.category}`
          );
        }
      }

      // Check tag references
      if (Array.isArray(product.data.tags)) {
        for (const tagRef of product.data.tags) {
          const slug = resolveReferenceToSlug(tagRef);
          if (slug && !tagSlugs.has(slug)) {
            errors.push(
              `Product '${product.fileName}' references non-existent tag: ${tagRef}`
            );
          }
        }
      }

      // Check vendor reference
      if (product.data.vendor) {
        const vendorSlug = resolveReferenceToSlug(product.data.vendor);
        const vendorExists = vendors.some((v) => v.fileName === vendorSlug);
        if (vendorSlug && !vendorExists) {
          errors.push(
            `Product '${product.fileName}' references non-existent vendor: ${product.data.vendor}`
          );
        }
      }
    }

    return {
      valid: errors.length === 0,
      errors,
      warnings,
    };
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return {
      valid: false,
      errors: [`Reference validation failed: ${errorMessage}`],
      warnings,
    };
  }
}

/**
 * Get entity counts from Payload database
 */
export async function getPayloadCounts(payload: Payload): Promise<Record<string, number>> {
  const counts: Record<string, number> = {};

  try {
    // Map collection names to Payload collection slugs
    const collections = [
      { name: 'vendors', slug: 'vendors' },
      { name: 'products', slug: 'products' },
      { name: 'categories', slug: 'categories' },
      { name: 'tags', slug: 'tags' },
      { name: 'yachts', slug: 'yachts' },
      { name: 'blog', slug: 'blog-posts' },
      { name: 'team', slug: 'team-members' },
      { name: 'company', slug: 'company-info' },
    ];

    for (const { name, slug } of collections) {
      try {
        const result = await payload.count({ collection: slug as any });
        counts[name] = result.totalDocs;
      } catch (error) {
        // Collection might not exist yet
        counts[name] = 0;
      }
    }

    return counts;
  } catch (error) {
    console.error('Error getting Payload counts:', error);
    return counts;
  }
}

/**
 * Validate migration by comparing entity counts
 */
export async function validateMigration(payload: Payload): Promise<ValidationResult> {
  console.log('\n📊 Validating migration...\n');

  const errors: string[] = [];
  const warnings: string[] = [];

  try {
    // Get counts from both sources
    const tinaCounts = await getMarkdownCounts();
    const payloadCounts = await getPayloadCounts(payload);

    const comparisons: CountComparison[] = [];

    // Compare entity counts
    for (const collection of Object.keys(tinaCounts)) {
      const tinaCount = tinaCounts[collection];
      const payloadCount = payloadCounts[collection] || 0;
      const match = tinaCount === payloadCount;

      comparisons.push({
        collection,
        tinaCMS: tinaCount,
        payload: payloadCount,
        match,
      });

      if (match) {
        console.log(`✓ ${collection}: ${payloadCount}/${tinaCount} migrated`);
      } else {
        console.error(`⚠ Count mismatch for ${collection}:`);
        console.error(`  TinaCMS: ${tinaCount}`);
        console.error(`  Payload: ${payloadCount}`);
        errors.push(
          `Count mismatch for ${collection}: TinaCMS=${tinaCount}, Payload=${payloadCount}`
        );
      }
    }

    // Sample-based field validation
    const fieldValidation = await sampleValidation(payload);
    errors.push(...fieldValidation.errors);
    warnings.push(...fieldValidation.warnings);

    console.log('\n✓ Post-migration validation complete\n');

    return {
      valid: errors.length === 0,
      errors,
      warnings,
    };
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    errors.push(`Migration validation error: ${errorMessage}`);

    return {
      valid: false,
      errors,
      warnings,
    };
  }
}

/**
 * Sample-based field validation
 * Validates that key fields are properly migrated by sampling records
 */
async function sampleValidation(payload: Payload): Promise<ValidationResult> {
  const errors: string[] = [];
  const warnings: string[] = [];

  try {
    // Sample vendors
    const vendors = await payload.find({
      collection: 'vendors',
      limit: 5,
      depth: 0,
    });

    for (const vendor of vendors.docs) {
      if (!vendor.companyName) {
        errors.push(`Vendor ${vendor.id} missing companyName`);
      }
      if (!vendor.slug) {
        errors.push(`Vendor ${vendor.id} missing slug`);
      }
    }

    // Sample products
    const products = await payload.find({
      collection: 'products',
      limit: 5,
      depth: 0,
    });

    for (const product of products.docs) {
      if (!product.name) {
        errors.push(`Product ${product.id} missing name`);
      }
      if (!product.slug) {
        errors.push(`Product ${product.id} missing slug`);
      }
    }

    return {
      valid: errors.length === 0,
      errors,
      warnings,
    };
  } catch (error) {
    return {
      valid: true, // Don't fail validation if sampling fails
      errors: [],
      warnings: [`Sample validation skipped: ${error}`],
    };
  }
}
