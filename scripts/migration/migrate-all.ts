#!/usr/bin/env tsx

/**
 * Master Migration Script - TinaCMS to Payload CMS
 * Migrates all content from markdown files to Payload CMS database
 */

import * as path from 'path';
import { getPayload } from 'payload';
import config from '../../payload.config';
import { parseMarkdownDirectory, transformMediaPath, resolveReference } from './utils/markdown-parser';
import { createBackup } from './utils/backup';

const DRY_RUN = process.argv.includes('--dry-run');
const SKIP_BACKUP = process.argv.includes('--skip-backup');

interface MigrationReport {
  collection: string;
  success: number;
  failed: number;
  errors: string[];
}

const report: MigrationReport[] = [];

async function migrateVendors() {
  console.log('\n📦 Migrating Vendors...');
  const collectionReport: MigrationReport = {
    collection: 'vendors',
    success: 0,
    failed: 0,
    errors: [],
  };

  try {
    const contentPath = path.resolve(process.cwd(), 'content/vendors');
    const files = await parseMarkdownDirectory(contentPath);

    const payload = await getPayload({ config });

    for (const file of files) {
      try {
        const vendorData = {
          slug: file.slug,
          name: file.frontmatter.name,
          description: file.frontmatter.description || file.content.substring(0, 200),
          logo: transformMediaPath(file.frontmatter.logo || ''),
          image: transformMediaPath(file.frontmatter.image || ''),
          website: file.frontmatter.website || '',
          founded: file.frontmatter.founded,
          location: file.frontmatter.location || '',
          featured: file.frontmatter.featured || false,
          partner: file.frontmatter.partner !== undefined ? file.frontmatter.partner : true,
          services: file.frontmatter.services || [],
          tier: 'free' as const,
          certifications: file.frontmatter.certifications || [],
        };

        if (!DRY_RUN) {
          await payload.create({
            collection: 'vendors',
            data: vendorData,
          });
        }

        collectionReport.success++;
        console.log(`  ✅ ${file.slug}`);
      } catch (error) {
        collectionReport.failed++;
        const errorMsg = error instanceof Error ? error.message : 'Unknown error';
        collectionReport.errors.push(`${file.slug}: ${errorMsg}`);
        console.log(`  ❌ ${file.slug}: ${errorMsg}`);
      }
    }
  } catch (error) {
    console.error(`❌ Failed to migrate vendors:`, error);
  }

  report.push(collectionReport);
}

async function migrateCategories() {
  console.log('\n📦 Migrating Categories...');
  const collectionReport: MigrationReport = {
    collection: 'categories',
    success: 0,
    failed: 0,
    errors: [],
  };

  try {
    const contentPath = path.resolve(process.cwd(), 'content/categories');
    const files = await parseMarkdownDirectory(contentPath);

    const payload = await getPayload({ config });

    for (const file of files) {
      try {
        const categoryData = {
          slug: file.slug,
          name: file.frontmatter.name,
          description: file.frontmatter.description || '',
          icon: file.frontmatter.icon || '',
          color: file.frontmatter.color || '#0066cc',
        };

        if (!DRY_RUN) {
          await payload.create({
            collection: 'categories',
            data: categoryData,
          });
        }

        collectionReport.success++;
        console.log(`  ✅ ${file.slug}`);
      } catch (error) {
        collectionReport.failed++;
        const errorMsg = error instanceof Error ? error.message : 'Unknown error';
        collectionReport.errors.push(`${file.slug}: ${errorMsg}`);
        console.log(`  ❌ ${file.slug}: ${errorMsg}`);
      }
    }
  } catch (error) {
    console.error(`❌ Failed to migrate categories:`, error);
  }

  report.push(collectionReport);
}

async function migrateProducts() {
  console.log('\n📦 Migrating Products...');
  const collectionReport: MigrationReport = {
    collection: 'products',
    success: 0,
    failed: 0,
    errors: [],
  };

  try {
    const contentPath = path.resolve(process.cwd(), 'content/products');
    const files = await parseMarkdownDirectory(contentPath);

    const payload = await getPayload({ config });

    // Get vendor mapping
    const vendors = await payload.find({
      collection: 'vendors',
      limit: 1000,
    });

    const vendorMap = new Map(
      vendors.docs.map(v => [v.slug, v.id])
    );

    for (const file of files) {
      try {
        const vendorRef = resolveReference(file.frontmatter.vendor || file.frontmatter.partner);
        const vendorId = vendorRef ? vendorMap.get(vendorRef) : null;

        if (!vendorId) {
          throw new Error(`Vendor not found: ${vendorRef}`);
        }

        const productData = {
          slug: file.slug,
          name: file.frontmatter.name,
          description: file.frontmatter.description || '',
          vendor: vendorId,
          images: file.frontmatter.product_images?.map((img: any) => ({
            url: transformMediaPath(img.image || ''),
            altText: img.alt_text || '',
            isMain: img.is_main || false,
          })) || [],
          specifications: file.frontmatter.specifications || [],
          published: false, // Admin must approve
        };

        if (!DRY_RUN) {
          await payload.create({
            collection: 'products',
            data: productData,
          });
        }

        collectionReport.success++;
        console.log(`  ✅ ${file.slug}`);
      } catch (error) {
        collectionReport.failed++;
        const errorMsg = error instanceof Error ? error.message : 'Unknown error';
        collectionReport.errors.push(`${file.slug}: ${errorMsg}`);
        console.log(`  ❌ ${file.slug}: ${errorMsg}`);
      }
    }
  } catch (error) {
    console.error(`❌ Failed to migrate products:`, error);
  }

  report.push(collectionReport);
}

async function migrateBlogPosts() {
  console.log('\n📦 Migrating Blog Posts...');
  const collectionReport: MigrationReport = {
    collection: 'blog-posts',
    success: 0,
    failed: 0,
    errors: [],
  };

  try {
    const contentPath = path.resolve(process.cwd(), 'content/blog/posts');
    const files = await parseMarkdownDirectory(contentPath);

    const payload = await getPayload({ config });

    for (const file of files) {
      try {
        const blogData = {
          slug: file.slug,
          title: file.frontmatter.title,
          content: file.content,
          excerpt: file.frontmatter.excerpt || '',
          featuredImage: transformMediaPath(file.frontmatter.image || ''),
          published: false,
          publishedAt: file.frontmatter.published_at || new Date().toISOString(),
        };

        if (!DRY_RUN) {
          await payload.create({
            collection: 'blog-posts',
            data: blogData,
          });
        }

        collectionReport.success++;
        console.log(`  ✅ ${file.slug}`);
      } catch (error) {
        collectionReport.failed++;
        const errorMsg = error instanceof Error ? error.message : 'Unknown error';
        collectionReport.errors.push(`${file.slug}: ${errorMsg}`);
        console.log(`  ❌ ${file.slug}: ${errorMsg}`);
      }
    }
  } catch (error) {
    console.error(`❌ Failed to migrate blog posts:`, error);
  }

  report.push(collectionReport);
}

async function migrateTeamMembers() {
  console.log('\n📦 Migrating Team Members...');
  const collectionReport: MigrationReport = {
    collection: 'team-members',
    success: 0,
    failed: 0,
    errors: [],
  };

  try {
    const contentPath = path.resolve(process.cwd(), 'content/team');
    const files = await parseMarkdownDirectory(contentPath);

    const payload = await getPayload({ config });

    for (const file of files) {
      try {
        const teamData = {
          name: file.frontmatter.name,
          role: file.frontmatter.role,
          bio: file.frontmatter.bio || '',
          image: transformMediaPath(file.frontmatter.image || ''),
          email: file.frontmatter.email || '',
          linkedin: file.frontmatter.linkedin || '',
          order: file.frontmatter.order || 999,
        };

        if (!DRY_RUN) {
          await payload.create({
            collection: 'team-members',
            data: teamData,
          });
        }

        collectionReport.success++;
        console.log(`  ✅ ${file.filename}`);
      } catch (error) {
        collectionReport.failed++;
        const errorMsg = error instanceof Error ? error.message : 'Unknown error';
        collectionReport.errors.push(`${file.filename}: ${errorMsg}`);
        console.log(`  ❌ ${file.filename}: ${errorMsg}`);
      }
    }
  } catch (error) {
    console.error(`❌ Failed to migrate team members:`, error);
  }

  report.push(collectionReport);
}

async function migrateCompanyInfo() {
  console.log('\n📦 Migrating Company Info...');
  const collectionReport: MigrationReport = {
    collection: 'company-info',
    success: 0,
    failed: 0,
    errors: [],
  };

  try {
    const contentPath = path.resolve(process.cwd(), 'content/company/info.json');
    const content = await require('fs/promises').readFile(contentPath, 'utf-8');
    const data = JSON.parse(content);

    const payload = await getPayload({ config });

    const companyData = {
      name: data.name,
      tagline: data.tagline || '',
      description: data.description || '',
      story: data.story || '',
      founded: data.founded,
      location: data.location || '',
      address: data.address || '',
      phone: data.phone || '',
      email: data.email,
      logo: transformMediaPath(data.logo || ''),
    };

    if (!DRY_RUN) {
      await payload.create({
        collection: 'company-info',
        data: companyData,
      });
    }

    collectionReport.success++;
    console.log(`  ✅ Company info migrated`);
  } catch (error) {
    collectionReport.failed++;
    const errorMsg = error instanceof Error ? error.message : 'Unknown error';
    collectionReport.errors.push(`Company info: ${errorMsg}`);
    console.log(`  ❌ Company info: ${errorMsg}`);
  }

  report.push(collectionReport);
}

async function printReport() {
  console.log('\n' + '='.repeat(60));
  console.log('📊 MIGRATION REPORT');
  console.log('='.repeat(60));

  let totalSuccess = 0;
  let totalFailed = 0;

  for (const collectionReport of report) {
    console.log(`\n${collectionReport.collection}:`);
    console.log(`  ✅ Success: ${collectionReport.success}`);
    console.log(`  ❌ Failed: ${collectionReport.failed}`);

    if (collectionReport.errors.length > 0) {
      console.log(`  Errors:`);
      collectionReport.errors.forEach(error => console.log(`    - ${error}`));
    }

    totalSuccess += collectionReport.success;
    totalFailed += collectionReport.failed;
  }

  console.log('\n' + '='.repeat(60));
  console.log(`Total Success: ${totalSuccess}`);
  console.log(`Total Failed: ${totalFailed}`);
  console.log('='.repeat(60));
}

async function main() {
  console.log('🚀 TinaCMS to Payload CMS Migration');
  console.log('='.repeat(60));

  if (DRY_RUN) {
    console.log('⚠️  DRY RUN MODE - No changes will be made to database');
  }

  // Create backup
  if (!SKIP_BACKUP && !DRY_RUN) {
    const backupPath = await createBackup(
      path.resolve(process.cwd(), 'content'),
      path.resolve(process.cwd(), 'backups')
    );
    console.log(`📦 Backup created: ${backupPath}`);
  }

  // Run migrations in order (respecting dependencies)
  await migrateCategories();
  await migrateVendors();
  await migrateProducts();
  await migrateBlogPosts();
  await migrateTeamMembers();
  await migrateCompanyInfo();

  // Print report
  await printReport();

  console.log('\n✅ Migration complete!');
}

main().catch(error => {
  console.error('❌ Migration failed:', error);
  process.exit(1);
});
