#!/usr/bin/env tsx

/**
 * CMS Content Validation Script for Build-Time Static Generation
 * 
 * This script validates that all required content exists in the Strapi CMS
 * before proceeding with the static build. It ensures data integrity and
 * provides detailed error reporting for missing or invalid content.
 */

import dotenv from 'dotenv';
import { staticDataService } from '../lib/static-data-service';

// Load environment variables
dotenv.config({ path: '.env.local' });
dotenv.config({ path: '.env' });

async function validateCMSContent() {
  console.log('🚀 Starting CMS content validation...\n');
  
  try {
    // Validate CMS content
    const validation = await staticDataService.validateCMSContent();
    
    if (!validation.isValid) {
      console.error('\n❌ CMS validation failed with the following errors:');
      validation.errors.forEach(error => {
        console.error(`  • ${error}`);
      });
      console.error('\nPlease ensure your Strapi CMS is running and contains all required content.');
      console.error('Environment variables checked:');
      console.error(`  STRAPI_API_URL: ${process.env.STRAPI_API_URL || 'not set'}`);
      console.error(`  NEXT_PUBLIC_STRAPI_API_URL: ${process.env.NEXT_PUBLIC_STRAPI_API_URL || 'not set'}`);
      
      process.exit(1);
    }

    // Get content counts for reporting
    const [partners, products, categories, blogPosts, teamMembers] = await Promise.all([
      staticDataService.getAllPartners(),
      staticDataService.getAllProducts(),
      staticDataService.getCategories(),
      staticDataService.getAllBlogPosts(),
      staticDataService.getTeamMembers()
    ]);

    console.log('✅ CMS validation passed successfully!\n');
    console.log('📊 Content Summary:');
    console.log(`  Partners: ${partners.length}`);
    console.log(`  Products: ${products.length}`);
    console.log(`  Categories: ${categories.length}`);
    console.log(`  Blog Posts: ${blogPosts.length}`);
    console.log(`  Team Members: ${teamMembers.length}`);
    
    // Generate static paths summary
    const [partnerSlugs, productSlugs, blogSlugs] = await Promise.all([
      staticDataService.getPartnerSlugs(),
      staticDataService.getProductSlugs(),
      staticDataService.getBlogPostSlugs()
    ]);
    
    console.log('\n🔗 Static Paths to Generate:');
    console.log(`  Partner pages: ${partnerSlugs.length}`);
    console.log(`  Product pages: ${productSlugs.length}`);
    console.log(`  Blog pages: ${blogSlugs.length}`);
    
    console.log('\n🎉 Ready for static site generation!');
    
  } catch (error) {
    console.error('\n💥 Unexpected error during CMS validation:');
    console.error(error);
    console.error('\nThis typically indicates:');
    console.error('  1. Strapi server is not running');
    console.error('  2. Network connectivity issues');
    console.error('  3. Invalid Strapi API URL configuration');
    
    process.exit(1);
  }
}

// Run validation if this script is executed directly
if (require.main === module) {
  validateCMSContent();
}

export default validateCMSContent;