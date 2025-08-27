#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const glob = require('glob');

function fixEmptyArrays(filePath) {
  console.log(`🔧 Fixing empty arrays in: ${filePath}`);
  
  let content = fs.readFileSync(filePath, 'utf8');
  
  // Fix empty YAML arrays - replace "key:" when it's followed by newline or EOF
  content = content.replace(/^tags:\s*$/gm, 'tags: []');
  content = content.replace(/^product_images:\s*$/gm, 'product_images: []');
  content = content.replace(/^features:\s*$/gm, 'features: []');
  
  fs.writeFileSync(filePath, content);
  console.log(`✅ Fixed: ${filePath}`);
}

// Fix all markdown files in content directory
const contentFiles = glob.sync('content/**/*.md', { cwd: process.cwd() });

console.log(`📋 Found ${contentFiles.length} content files to process`);

contentFiles.forEach(filePath => {
  const fullPath = path.resolve(filePath);
  if (fs.existsSync(fullPath)) {
    fixEmptyArrays(fullPath);
  }
});

console.log('🎉 All empty arrays fixed!');