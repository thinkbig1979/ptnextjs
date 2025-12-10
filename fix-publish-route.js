#!/usr/bin/env node
/**
 * Quick fix script to replace user.userId with user.id.toString()
 * in the publish route
 */

const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, 'app/api/portal/vendors/[id]/products/[productId]/publish/route.ts');

console.log('Reading file:', filePath);
const content = fs.readFileSync(filePath, 'utf8');

// Replace user.userId with user.id.toString()
const fixed = content.replace('user.userId,', 'user.id.toString(),');

// Check if replacement was made
if (content === fixed) {
  console.log('❌ No changes made - pattern not found');
  process.exit(1);
}

// Write back
fs.writeFileSync(filePath, fixed, 'utf8');
console.log('✅ Fixed: user.userId → user.id.toString()');
console.log('File updated successfully');
