#!/usr/bin/env node

/**
 * Update Product Vendor References Script
 * Updates all product files to reference content/vendors instead of content/partners
 */

const fs = require('fs').promises;
const path = require('path');

const PRODUCTS_DIR = 'content/products';

async function updateProductReferences() {
  console.log('🔄 Starting product vendor reference updates...');
  
  try {
    // Get all product files
    const files = await fs.readdir(PRODUCTS_DIR);
    const mdFiles = files.filter(file => file.endsWith('.md'));
    
    console.log(`📋 Found ${mdFiles.length} product files to update`);
    
    let updated = 0;
    
    for (const file of mdFiles) {
      const filePath = path.join(PRODUCTS_DIR, file);
      
      try {
        // Read file content
        const content = await fs.readFile(filePath, 'utf-8');
        
        // Check if it contains the old partner reference
        if (content.includes('content/partners/')) {
          // Replace all instances of content/partners/ with content/vendors/
          const updatedContent = content.replace(/content\/partners\//g, 'content/vendors/');
          
          // Write the updated content back
          await fs.writeFile(filePath, updatedContent);
          console.log(`✅ Updated: ${file}`);
          updated++;
        } else {
          console.log(`⏭️  No updates needed: ${file}`);
        }
      } catch (error) {
        console.error(`❌ Failed to update ${file}:`, error.message);
      }
    }
    
    console.log(`\n🎉 Update completed: ${updated}/${mdFiles.length} files updated successfully`);
    
  } catch (error) {
    console.error('❌ Update failed:', error.message);
    process.exit(1);
  }
}

// Run the update
updateProductReferences();