#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const glob = require('glob');

function fixBrokenYaml(filePath) {
  console.log(`🔧 Fixing broken YAML in: ${filePath}`);
  
  let content = fs.readFileSync(filePath, 'utf8');
  
  // Fix arrays that have [] followed by items
  content = content.replace(/^(tags|product_images|features):\s*\[\]\s*\n(\s+- )/gm, '$1:\n$2');
  
  fs.writeFileSync(filePath, content);
  console.log(`✅ Fixed: ${filePath}`);
}

// Fix all markdown files in content directory
const contentFiles = glob.sync('content/**/*.md', { cwd: process.cwd() });

console.log(`📋 Found ${contentFiles.length} content files to process`);

contentFiles.forEach(filePath => {
  const fullPath = path.resolve(filePath);
  if (fs.existsSync(fullPath)) {
    fixBrokenYaml(fullPath);
  }
});

console.log('🎉 All broken YAML fixed!');