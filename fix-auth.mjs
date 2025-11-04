#!/usr/bin/env node
import fs from 'fs';
import path from 'path';

const projectRoot = '/home/edwin/development/ptnextjs';

// Fix 1: Seed API
console.log('Fixing seed API (double hashing issue)...');
const seedPath = path.join(projectRoot, 'app/api/test/vendors/seed/route.ts');
let seedContent = fs.readFileSync(seedPath, 'utf8');

// Find and replace the hashing section
const oldHashSection = `        // Hash password
        const hashedPassword = await authService.hashPassword(vendorData.password);
        // Generate slug
        const slug = generateSlug(vendorData.companyName);
        // First, create the user account
        const createdUser = await payload.create({
          collection: 'users',
          data: {
            email: vendorData.email,
            password: hashedPassword,
            role: 'vendor',
            status: vendorData.status || 'approved',
          },
        });`;

const newHashSection = `        // Validate password strength first (but don't hash - Payload CMS will do that)
        try {
          await authService.hashPassword(vendorData.password); // This just validates password strength
        } catch (validationError) {
          errors[\`vendor_\${i}_\${vendorData.companyName}\`] = validationError instanceof Error ? validationError.message : 'Invalid password';
          continue;
        }

        // Generate slug
        const slug = generateSlug(vendorData.companyName);
        // First, create the user account
        // IMPORTANT: Pass plain password - Payload CMS will hash it automatically
        const createdUser = await payload.create({
          collection: 'users',
          data: {
            email: vendorData.email,
            password: vendorData.password, // Plain password - Payload CMS will hash it
            role: 'vendor',
            status: vendorData.status || 'approved',
          },
        });`;

if (seedContent.includes(oldHashSection)) {
  seedContent = seedContent.replace(oldHashSection, newHashSection);
  fs.writeFileSync(seedPath, seedContent, 'utf8');
  console.log('✓ Seed API fixed: removed double password hashing');
} else {
  console.log('⚠ Could not find exact hash section in seed API - trying partial match');
  if (seedContent.includes('const hashedPassword = await authService.hashPassword')) {
    seedContent = seedContent.replace(
      'const hashedPassword = await authService.hashPassword(vendorData.password);',
      `try {
          await authService.hashPassword(vendorData.password); // Validates password strength
        } catch (validationError) {
          errors[\`vendor_\${i}_\${vendorData.companyName}\`] = validationError instanceof Error ? validationError.message : 'Invalid password';
          continue;
        }`
    );
    seedContent = seedContent.replace(
      'password: hashedPassword,',
      'password: vendorData.password, // Plain password - Payload CMS will hash it'
    );
    fs.writeFileSync(seedPath, seedContent, 'utf8');
    console.log('✓ Seed API fixed: removed double password hashing (partial match)');
  }
}

// Fix 2: Login endpoint
console.log('Fixing login endpoint (add logging)...');
const loginPath = path.join(projectRoot, 'app/api/auth/login/route.ts');
let loginContent = fs.readFileSync(loginPath, 'utf8');

const oldCatch = `  } catch (error) {
    const message = error instanceof Error ? error.message : 'Authentication failed';

    // Return appropriate error status`;

const newCatch = `  } catch (error) {
    const message = error instanceof Error ? error.message : 'Authentication failed';

    // Log authentication failures for debugging
    console.error('[Login] Authentication error:', {
      email: body?.email || 'unknown',
      error: message,
      timestamp: new Date().toISOString(),
    });

    // Return appropriate error status`;

if (loginContent.includes(oldCatch)) {
  loginContent = loginContent.replace(oldCatch, newCatch);
  fs.writeFileSync(loginPath, loginContent, 'utf8');
  console.log('✓ Login endpoint fixed: added logging');
} else {
  console.log('⚠ Could not find exact catch section in login endpoint');
}

console.log('\nAll fixes completed!');
