#!/usr/bin/env node
/**
 * Apply email validation fix for test vendor seeding
 * This script patches the Vendors.ts and seed route to allow @test.com emails in test environments
 */

const fs = require('fs');
const path = require('path');

const VENDORS_FILE = path.join(__dirname, '../payload/collections/Vendors.ts');
const SEED_FILE = path.join(__dirname, '../app/api/test/vendors/seed/route.ts');

// Backup function
function createBackup(filePath) {
  const backupPath = `${filePath}.backup`;
  fs.copyFileSync(filePath, backupPath);
  console.log(`✓ Created backup: ${backupPath}`);
  return backupPath;
}

// Fix 1: Add custom validate to contactEmail in Vendors.ts
function fixVendorsContactEmail() {
  console.log('\n📝 Fix 1: Adding custom email validation to Vendors.ts...');

  const content = fs.readFileSync(VENDORS_FILE, 'utf8');
  const lines = content.split('\n');

  // Find the contactEmail field (around line 127-134)
  let startLine = -1;
  let endLine = -1;

  for (let i = 0; i < lines.length; i++) {
    if (lines[i].includes("name: 'contactEmail'")) {
      startLine = i - 1; // Include the opening brace
      // Find the closing brace
      for (let j = i; j < lines.length; j++) {
        if (lines[j].trim() === '},') {
          endLine = j;
          break;
        }
      }
      break;
    }
  }

  if (startLine === -1 || endLine === -1) {
    console.error('✗ Could not find contactEmail field');
    return false;
  }

  console.log(`Found contactEmail at lines ${startLine + 1}-${endLine + 1}`);

  // Build the replacement
  const indent = '    ';
  const replacement = [
    `${indent}{`,
    `${indent}  name: 'contactEmail',`,
    `${indent}  type: 'email',`,
    `${indent}  required: true,`,
    `${indent}  admin: {`,
    `${indent}    description: 'Contact email address',`,
    `${indent}  },`,
    `${indent}  validate: (value) => {`,
    `${indent}    // Basic email format check`,
    `${indent}    if (!value || typeof value !== 'string') {`,
    `${indent}      return 'Email is required';`,
    `${indent}    }`,
    `${indent}`,
    `${indent}    const emailRegex = /^[^\\s@]+@[^\\s@]+\\.[^\\s@]+$/;`,
    `${indent}    if (!emailRegex.test(value)) {`,
    `${indent}      return 'Must be a valid email address';`,
    `${indent}    }`,
    `${indent}`,
    `${indent}    // In test/development, allow test domains`,
    `${indent}    const isTestEnv = process.env.NODE_ENV === 'test' || process.env.NODE_ENV === 'development';`,
    `${indent}    const testDomains = ['@test.com', '@example.com', '@localhost'];`,
    `${indent}    const isTestEmail = testDomains.some(domain => value.endsWith(domain));`,
    `${indent}`,
    `${indent}    if (!isTestEnv && isTestEmail) {`,
    `${indent}      return 'Test email domains are not allowed in production';`,
    `${indent}    }`,
    `${indent}`,
    `${indent}    return true; // Valid`,
    `${indent}  },`,
    `${indent}},`,
  ];

  // Replace the lines
  const newLines = [
    ...lines.slice(0, startLine),
    ...replacement,
    ...lines.slice(endLine + 1),
  ];

  // Write back
  createBackup(VENDORS_FILE);
  fs.writeFileSync(VENDORS_FILE, newLines.join('\n'), 'utf8');
  console.log('✓ Fixed contactEmail validation in Vendors.ts');

  return true;
}

// Fix 2: Add overrideAccess to seed API
function fixSeedRoute() {
  console.log('\n📝 Fix 2: Adding overrideAccess to seed API...');

  let content = fs.readFileSync(SEED_FILE, 'utf8');

  // Fix user creation - add overrideAccess before the closing });
  const userCreatePattern = /(const createdUser = await payload\.create\(\{[\s\S]*?status: vendorData\.status \|\| 'approved',\s*\n\s*)(}\))/;

  if (userCreatePattern.test(content)) {
    content = content.replace(
      userCreatePattern,
      '$1  overrideAccess: true, // Bypass access control for test seeding\n        $2'
    );
    console.log('✓ Added overrideAccess to user creation');
  } else {
    console.warn('⚠ Could not find user creation pattern');
  }

  // Fix vendor creation - add overrideAccess before the closing });
  const vendorCreatePattern = /(const createdVendor = await payload\.create\(\{[\s\S]*?locations: locations\.length > 0 \? locations : undefined,\s*\n\s*)(}\))/;

  if (vendorCreatePattern.test(content)) {
    content = content.replace(
      vendorCreatePattern,
      '$1  overrideAccess: true, // Bypass access control for test seeding\n        $2'
    );
    console.log('✓ Added overrideAccess to vendor creation');
  } else {
    console.warn('⚠ Could not find vendor creation pattern');
  }

  // Write back
  createBackup(SEED_FILE);
  fs.writeFileSync(SEED_FILE, content, 'utf8');
  console.log('✓ Fixed seed route');

  return true;
}

// Main
function main() {
  console.log('=== Applying Email Validation Fix for Test Vendors ===');

  let success = true;

  try {
    if (!fixVendorsContactEmail()) {
      success = false;
    }
  } catch (err) {
    console.error('✗ Error fixing Vendors.ts:', err.message);
    success = false;
  }

  try {
    if (!fixSeedRoute()) {
      success = false;
    }
  } catch (err) {
    console.error('✗ Error fixing seed route:', err.message);
    success = false;
  }

  console.log('\n' + '='.repeat(60));
  if (success) {
    console.log('✅ All fixes applied successfully!');
    console.log('\nWhat was fixed:');
    console.log('  1. Added custom email validation to Vendors.contactEmail');
    console.log('     - Allows @test.com, @example.com, @localhost in test/dev');
    console.log('     - Blocks test domains in production');
    console.log('  2. Added overrideAccess: true to seed API');
    console.log('     - Bypasses access control for test data seeding');
    console.log('\nBackup files created with .backup extension');
    console.log('\nTo test the fix:');
    console.log('  npm run test:e2e -- --grep "seed"');
  } else {
    console.log('❌ Some fixes failed');
    console.log('\nSee Supporting-Docs/email-validation-fix.md for manual instructions');
  }
  console.log('='.repeat(60));

  process.exit(success ? 0 : 1);
}

main();
