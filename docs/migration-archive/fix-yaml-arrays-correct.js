#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const glob = require('glob');

function fixYamlArrays(filePath) {
  console.log(`🔧 Fixing YAML arrays in: ${filePath}`);
  
  let content = fs.readFileSync(filePath, 'utf8');
  
  // Split content into frontmatter and body
  const parts = content.split(/^---$/m);
  if (parts.length < 3) {
    console.log(`⚠️  Skipping ${filePath} - no valid frontmatter found`);
    return;
  }
  
  let frontmatter = parts[1];
  const body = parts.slice(2).join('---');
  
  // Fix the YAML arrays - only replace when they're truly empty
  frontmatter = frontmatter.replace(/^tags:\s*\[\]\s*$/gm, 'tags:');
  frontmatter = frontmatter.replace(/^product_images:\s*\[\]\s*$/gm, 'product_images:');
  frontmatter = frontmatter.replace(/^features:\s*\[\]\s*$/gm, 'features:');
  
  // Now fix the ones that have actual content after them but were marked as []
  // Look for patterns like "tags: []\n  - content/tags/..."
  frontmatter = frontmatter.replace(/^(tags|product_images|features):\s*\[\]\s*\n(\s+- )/gm, '$1:\n$2');
  
  const newContent = `---${frontmatter}---${body}`;
  
  fs.writeFileSync(filePath, newContent);
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

console.log('🎉 All YAML array formatting issues fixed correctly!');