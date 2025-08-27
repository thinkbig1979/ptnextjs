#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const glob = require('glob');

function fixYamlArrays(filePath) {
  console.log(`🔧 Fixing YAML arrays in: ${filePath}`);
  
  let content = fs.readFileSync(filePath, 'utf8');
  
  // Fix empty arrays/objects
  content = content.replace(/^tags:\s*$/gm, 'tags: []');
  content = content.replace(/^product_images:\s*$/gm, 'product_images: []');
  content = content.replace(/^features:\s*$/gm, 'features: []');
  
  // Fix arrays that have empty line after colon
  content = content.replace(/^tags:\s*\n\n/gm, 'tags: []\n');
  content = content.replace(/^product_images:\s*\n\n/gm, 'product_images: []\n');
  content = content.replace(/^features:\s*\n\n/gm, 'features: []\n');
  
  fs.writeFileSync(filePath, content);
  console.log(`✅ Fixed: ${filePath}`);
}

// Fix all markdown files in content directory
const contentFiles = glob.sync('content/**/*.md', { cwd: process.cwd() });

console.log(`📋 Found ${contentFiles.length} content files to process`);

contentFiles.forEach(filePath => {
  const fullPath = path.resolve(filePath);
  if (fs.existsSync(fullPath)) {
    fixYamlArrays(fullPath);
  }
});

console.log('🎉 All YAML array formatting issues fixed!');