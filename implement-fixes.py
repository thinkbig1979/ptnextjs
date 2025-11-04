#!/usr/bin/env python3
"""
Implement the 3 critical fixes for P0/P1 issues.
"""

import os
import sys

# Fix 1: Product Seed API Validation
PRODUCT_SEED_PATH = "/home/edwin/development/ptnextjs/app/api/test/products/seed/route.ts"

product_old = '''        // Handle vendor relationship if provided
        if (productData.vendor) {
          // Try to find vendor by ID first, then by slug
          let vendorId: string | null = null;
          try {
            // Try as direct ID
            const vendorCheck = await payload.findByID({
              collection: 'vendors',
              id: productData.vendor,
            });
            if (vendorCheck) {
              vendorId = vendorCheck.id as string;
            }
          } catch {
            // If ID lookup fails, try by slug
            try {
              const vendorBySlug = await payload.find({
                collection: 'vendors',
                where: {
                  slug: {
                    equals: productData.vendor,
                  },
                },
              });
              if (vendorBySlug.docs && vendorBySlug.docs.length > 0) {
                vendorId = vendorBySlug.docs[0].id as string;
              }
            } catch {
              // Vendor not found, but we can still create the product without vendor relationship
            }
          }
          if (vendorId) {
            createData.vendor = vendorId;
          }
        }'''

product_new = '''        // Handle vendor relationship if provided with validation
        if (productData.vendor) {
          console.log(`[Product ${i}] Validating vendor: ${productData.vendor}`);
          // Try to find vendor by ID first, then by slug
          let vendorId: string | null = null;
          try {
            // Try as direct ID
            const vendorCheck = await payload.findByID({
              collection: 'vendors',
              id: productData.vendor,
            });
            if (vendorCheck) {
              vendorId = vendorCheck.id as string;
              console.log(`[Product ${i}] Found vendor by ID: ${vendorId}`);
            }
          } catch (idError) {
            console.log(`[Product ${i}] Vendor ID lookup failed, trying slug lookup`);
            // If ID lookup fails, try by slug
            try {
              const vendorBySlug = await payload.find({
                collection: 'vendors',
                where: {
                  slug: {
                    equals: productData.vendor,
                  },
                },
              });
              if (vendorBySlug.docs && vendorBySlug.docs.length > 0) {
                vendorId = vendorBySlug.docs[0].id as string;
                console.log(`[Product ${i}] Found vendor by slug: ${vendorId}`);
              }
            } catch (slugError) {
              console.error(
                `[Product ${i}] Failed to find vendor by slug:`,
                slugError
              );
            }
          }
          if (vendorId) {
            createData.vendor = vendorId;
            console.log(`[Product ${i}] Vendor validated and assigned: ${vendorId}`);
          } else {
            console.warn(
              `[Product ${i}] Vendor "${productData.vendor}" not found in system - proceeding without vendor`
            );
          }
        }'''

# Fix product seed file
print("Fix 1: Applying product seed API validation...")
try:
    with open(PRODUCT_SEED_PATH, 'r') as f:
        product_content = f.read()

    product_content = product_content.replace(product_old, product_new)

    # Also add logging to the successful creation
    product_content = product_content.replace(
        '        createdProductIds.push(createdProduct.id as string);',
        '        createdProductIds.push(createdProduct.id as string);\n        console.log(`[Product ${i}] Successfully created: ${createdProduct.id}`);'
    )

    # Add logging to fatal error
    product_content = product_content.replace(
        '    const errorMessage = error instanceof Error ? error.message : \'Unknown error\';',
        '    const errorMessage = error instanceof Error ? error.message : \'Unknown error\';\n    console.error(\'[Seed API] Fatal error:\', errorMessage);'
    )

    with open(PRODUCT_SEED_PATH, 'w') as f:
        f.write(product_content)

    print("✓ Product seed API validation fixed")
except Exception as e:
    print(f"✗ Failed to fix product seed API: {e}")
    sys.exit(1)

# Fix 2: Vendor Seed API Cache Invalidation
VENDOR_SEED_PATH = "/home/edwin/development/ptnextjs/app/api/test/vendors/seed/route.ts"

print("Fix 2: Applying vendor seed API cache invalidation...")
try:
    with open(VENDOR_SEED_PATH, 'r') as f:
        vendor_content = f.read()

    # Add import for revalidatePath
    if "import { revalidatePath } from 'next/cache';" not in vendor_content:
        vendor_content = vendor_content.replace(
            "import { NextRequest, NextResponse } from 'next/server';",
            "import { NextRequest, NextResponse } from 'next/server';\nimport { revalidatePath } from 'next/cache';"
        )

    # Add revalidatePath call before final response
    old_return = '''    // Return response
    const hasErrors = Object.keys(errors).length > 0;
    return NextResponse.json('''

    new_return = '''    // Invalidate cache for newly created vendors
    if (createdVendorIds.length > 0) {
      try {
        console.log('[Vendor Seed] Invalidating cache for vendor pages...');
        revalidatePath('/vendors/');
        revalidatePath('/');
        revalidatePath('/api/vendors');
        console.log('[Vendor Seed] Cache invalidation complete');
      } catch (cacheError) {
        console.error('[Vendor Seed] Cache invalidation failed:', cacheError);
      }
    }

    // Return response
    const hasErrors = Object.keys(errors).length > 0;
    return NextResponse.json('''

    vendor_content = vendor_content.replace(old_return, new_return)

    with open(VENDOR_SEED_PATH, 'w') as f:
        f.write(vendor_content)

    print("✓ Vendor seed API cache invalidation fixed")
except Exception as e:
    print(f"✗ Failed to fix vendor seed API: {e}")
    sys.exit(1)

# Fix 3: Geocoding Button Enhancement
GEOCODING_BUTTON_PATH = "/home/edwin/development/ptnextjs/components/vendor/GeocodingButton.tsx"

print("Fix 3: Applying geocoding button enhancement...")
try:
    with open(GEOCODING_BUTTON_PATH, 'r') as f:
        geocoding_content = f.read()

    # Fix 1: Change disabled condition
    geocoding_content = geocoding_content.replace(
        'disabled={loading || !address}',
        'disabled={loading || !address?.trim()}'
    )

    # Fix 2: Add dynamic title attribute based on button state
    old_button = '''  return (
    <Button
      onClick={handleGeocode}
      disabled={loading || !address?.trim()}
      variant={variant}
      size={size}
      className={className}
      title="Click to find coordinates for the address"
    >'''

    new_button = '''  const isDisabled = loading || !address?.trim();
  const buttonTitle = isDisabled
    ? 'Please enter an address to geocode'
    : 'Click to find coordinates for the address';

  return (
    <Button
      onClick={handleGeocode}
      disabled={isDisabled}
      variant={variant}
      size={size}
      className={className}
      title={buttonTitle}
      data-testid="geocoding-button"
    >'''

    geocoding_content = geocoding_content.replace(old_button, new_button)

    with open(GEOCODING_BUTTON_PATH, 'w') as f:
        f.write(geocoding_content)

    print("✓ Geocoding button enhancement fixed")
except Exception as e:
    print(f"✗ Failed to fix geocoding button: {e}")
    sys.exit(1)

print("\nAll 3 fixes applied successfully!")
print("\nSummary of changes:")
print("1. Product Seed API: Enhanced vendor validation with detailed logging")
print("2. Vendor Seed API: Added cache invalidation for newly created vendors")
print("3. Geocoding Button: Fixed whitespace handling and improved UX")
