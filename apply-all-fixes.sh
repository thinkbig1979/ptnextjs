#!/bin/bash
#
# Apply all 3 implementation fixes
# This script modifies files to resolve P0/P1 issues
#

set -e

cd /home/edwin/development/ptnextjs

echo "======================================"
echo "Applying 3 Implementation Fixes"
echo "======================================"
echo ""

# FIX 1: Product Seed API Validation
echo "[FIX 1] Enhancing Product Seed API with vendor validation..."

# Read the current file content
PRODUCT_SEED_FILE="app/api/test/products/seed/route.ts"

# Create a temporary file with the fixes
cat > /tmp/product-seed-fix.ts << 'PRODUCT_EOF'
import { NextRequest, NextResponse } from 'next/server';
import { getPayload } from 'payload';
import config from '@/payload.config';
/**
 * Test Product Seed API
 * POST /api/test/products/seed
 *
 * Bulk product creation endpoint for E2E tests.
 * Only available in test/development environments for performance.
 * Bypasses validation and creates products with vendor relationships.
 */
interface TestProductInput {
  name: string;
  description?: string;
  category?: string;
  manufacturer?: string;
  model?: string;
  price?: number;
  vendor?: string; // vendor ID or slug
  published?: boolean;
  specifications?: Record<string, unknown>;
}
interface SeedResponse {
  success: boolean;
  productIds?: string[];
  count?: number;
  error?: string;
  errors?: Record<string, string>;
}
/**
 * POST /api/test/products/seed
 * Bulk create products for E2E testing
 */
export async function POST(request: NextRequest): Promise<NextResponse<SeedResponse>> {
  // NODE_ENV guard - only allow in test/development
  if (process.env.NODE_ENV === 'production') {
    return NextResponse.json(
      {
        success: false,
        error: 'Test endpoints are not available in production',
      },
      { status: 403 }
    );
  }
  try {
    // Parse request body
    const body = await request.json();
    // Ensure it's an array
    const products = Array.isArray(body) ? body : body.products || [];
    if (!Array.isArray(products) || products.length === 0) {
      return NextResponse.json(
        {
          success: false,
          error: 'Request body must be an array of product objects or object with products array',
        },
        { status: 400 }
      );
    }
    const payload = await getPayload({ config });
    const createdProductIds: string[] = [];
    const errors: Record<string, string> = {};
    // Create each product
    for (let i = 0; i < products.length; i++) {
      const productData = products[i] as TestProductInput;
      try {
        // Validate required fields
        if (!productData.name) {
          errors[`product_${i}`] = 'name is required';
          continue;
        }
        // Prepare product data
        const createData: any = {
          name: productData.name,
          description: productData.description || '',
          category: productData.category || 'General',
          manufacturer: productData.manufacturer,
          model: productData.model,
          price: productData.price,
          published: productData.published !== false,
        };
        // Handle vendor relationship if provided with validation
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
        }
        // Add specifications if provided
        if (productData.specifications) {
          createData.specifications = productData.specifications;
        }
        // Create product in Payload
        const createdProduct = await payload.create({
          collection: 'products',
          data: createData,
        });
        createdProductIds.push(createdProduct.id as string);
        console.log(`[Product ${i}] Successfully created: ${createdProduct.id}`);
      } catch (productError) {
        const errorMessage = productError instanceof Error ? productError.message : 'Unknown error';
        errors[`product_${i}_${productData.name}`] = errorMessage;
        console.error(`Failed to create product ${productData.name}:`, productError);
      }
    }
    // Return response
    const hasErrors = Object.keys(errors).length > 0;
    return NextResponse.json(
      {
        success: !hasErrors || createdProductIds.length > 0,
        productIds: createdProductIds,
        count: createdProductIds.length,
        ...(hasErrors && { errors }),
      },
      {
        status: hasErrors && createdProductIds.length === 0 ? 400 : 200,
      }
    );
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    console.error('[Seed API] Fatal error:', errorMessage);
    return NextResponse.json(
      {
        success: false,
        error: errorMessage,
      },
      { status: 500 }
    );
  }
}
PRODUCT_EOF

cp /tmp/product-seed-fix.ts "$PRODUCT_SEED_FILE"
echo "✓ Product Seed API fixed"
echo ""

# FIX 2: Vendor Seed API Cache Invalidation
echo "[FIX 2] Adding cache invalidation to Vendor Seed API..."

VENDOR_SEED_FILE="app/api/test/vendors/seed/route.ts"

# Create a temporary file with cache invalidation
cat > /tmp/vendor-seed-fix.ts << 'VENDOR_EOF'
import { NextRequest, NextResponse } from 'next/server';
import { revalidatePath } from 'next/cache';
import { getPayload } from 'payload';
import config from '@/payload.config';
import { authService } from '@/lib/services/auth-service';
/**
 * Test Vendor Seed API
 * POST /api/test/vendors/seed
 *
 * Bulk vendor creation endpoint for E2E tests.
 * Only available in test/development environments for performance.
 * Bypasses validation and admin approval workflow.
 */
interface TestVendorInput {
  companyName: string;
  email: string;
  password: string;
  tier?: 'free' | 'tier1' | 'tier2' | 'tier3';
  description?: string;
  contactPhone?: string;
  website?: string;
  featured?: boolean;
  status?: 'pending' | 'approved' | 'rejected';
  foundedYear?: number;
  totalProjects?: number;
  employeeCount?: number;
  locations?: Array<{
    name: string;
    city: string;
    country: string;
    latitude: number;
    longitude: number;
    isHQ?: boolean;
  }>;
}
interface SeedResponse {
  success: boolean;
  vendorIds?: string[];
  count?: number;
  error?: string;
  errors?: Record<string, string>;
}
/**
 * Generate URL-friendly slug from company name
 */
function generateSlug(companyName: string): string {
  return companyName
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}
/**
 * POST /api/test/vendors/seed
 * Bulk create vendors for E2E testing
 */
export async function POST(request: NextRequest): Promise<NextResponse<SeedResponse>> {
  // NODE_ENV guard - only allow in test/development
  if (process.env.NODE_ENV === 'production') {
    return NextResponse.json(
      {
        success: false,
        error: 'Test endpoints are not available in production',
      },
      { status: 403 }
    );
  }
  try {
    // Parse request body
    const body = await request.json();
    // Ensure it's an array
    const vendors = Array.isArray(body) ? body : body.vendors || [];
    if (!Array.isArray(vendors) || vendors.length === 0) {
      return NextResponse.json(
        {
          success: false,
          error: 'Request body must be an array of vendor objects or object with vendors array',
        },
        { status: 400 }
      );
    }
    const payload = await getPayload({ config });
    const createdVendorIds: string[] = [];
    const errors: Record<string, string> = {};
    // Create each vendor
    for (let i = 0; i < vendors.length; i++) {
      const vendorData = vendors[i] as TestVendorInput;
      try {
        // Validate required fields
        if (!vendorData.companyName) {
          errors[`vendor_${i}`] = 'companyName is required';
          continue;
        }
        if (!vendorData.email) {
          errors[`vendor_${i}`] = 'email is required';
          continue;
        }
        if (!vendorData.password) {
          errors[`vendor_${i}`] = 'password is required';
          continue;
        }
        // Validate password (don't hash - Payload will handle it)
        if (vendorData.password.length < 12) {
          errors[`vendor_${i}_${vendorData.companyName}`] = 'Password must be at least 12 characters long';
          continue;
        }
        // Generate slug
        const slug = generateSlug(vendorData.companyName);
        // First, create the user account (pass plain password - Payload hashes it)
        const createdUser = await payload.create({
          collection: 'users',
          data: {
            email: vendorData.email,
            password: vendorData.password, // Plain password - Payload handles hashing
            role: 'vendor',
            status: vendorData.status || 'approved',
          },
        });
        // Then create vendor linked to the user
        const createdVendor = await payload.create({
          collection: 'vendors',
          data: {
            user: createdUser.id,
            slug,
            companyName: vendorData.companyName,
            contactEmail: vendorData.email,
            tier: vendorData.tier || 'free',
            description: vendorData.description || '',
            contactPhone: vendorData.contactPhone,
            website: vendorData.website,
            featured: vendorData.featured || false,
            published: true,
            foundedYear: vendorData.foundedYear,
            totalProjects: vendorData.totalProjects,
            employeeCount: vendorData.employeeCount,
          },
        });
        // Handle locations if provided
        if (vendorData.locations && vendorData.locations.length > 0) {
          for (const location of vendorData.locations) {
            try {
              await payload.create({
                collection: 'vendor-locations',
                data: {
                  vendor: createdVendor.id,
                  name: location.name,
                  address: location.city,
                  city: location.city,
                  country: location.country,
                  latitude: location.latitude,
                  longitude: location.longitude,
                  isHQ: location.isHQ || false,
                },
              });
            } catch (locError) {
              // Log location error but don't fail the whole vendor creation
              console.error(
                `Failed to create location ${location.name} for vendor ${vendorData.companyName}:`,
                locError
              );
            }
          }
        }
        createdVendorIds.push(createdVendor.id as string);
      } catch (vendorError) {
        const errorMessage = vendorError instanceof Error ? vendorError.message : 'Unknown error';
        errors[`vendor_${i}_${vendorData.companyName}`] = errorMessage;
        console.error(`Failed to create vendor ${vendorData.companyName}:`, vendorError);
      }
    }
    // Invalidate cache for newly created vendors
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
    return NextResponse.json(
      {
        success: !hasErrors || createdVendorIds.length > 0,
        vendorIds: createdVendorIds,
        count: createdVendorIds.length,
        ...(hasErrors && { errors }),
      },
      {
        status: hasErrors && createdVendorIds.length === 0 ? 400 : 200,
      }
    );
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return NextResponse.json(
      {
        success: false,
        error: errorMessage,
      },
      { status: 500 }
    );
  }
}
VENDOR_EOF

cp /tmp/vendor-seed-fix.ts "$VENDOR_SEED_FILE"
echo "✓ Vendor Seed API cache invalidation added"
echo ""

# FIX 3: Geocoding Button Enhancement
echo "[FIX 3] Enhancing Geocoding Button..."

GEOCODING_FILE="components/vendor/GeocodingButton.tsx"

# Create a temporary file with the enhancement
cat > /tmp/geocoding-button-fix.tsx << 'GEOCODING_EOF'
'use client';
import React, { useState, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Loader2, MapPin } from 'lucide-react';
import { toast } from 'sonner';
import GeocodingService from '@/lib/services/GeocodingService';
export interface GeocodingButtonProps {
  address: string;
  onSuccess: (latitude: number, longitude: number) => void;
  onError?: (error: Error) => void;
  className?: string;
  variant?: 'default' | 'outline' | 'secondary' | 'ghost';
  size?: 'default' | 'sm' | 'lg' | 'icon';
}
/**
 * GeocodingButton - Convert address to coordinates
 */
export function GeocodingButton({
  address,
  onSuccess,
  onError,
  className = '',
  variant = 'default',
  size = 'default',
}: GeocodingButtonProps) {
  const [loading, setLoading] = useState(false);
  const handleGeocode = useCallback(async () => {
    if (!address || typeof address !== 'string') {
      toast.error('Please enter a valid address');
      return;
    }
    setLoading(true);
    try {
      const result = await GeocodingService.geocode(address);
      onSuccess(result.latitude, result.longitude);
      toast.success(
        `Coordinates found: ${result.latitude.toFixed(4)}, ${result.longitude.toFixed(4)}`
      );
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : 'Failed to geocode address';
      toast.error(errorMessage);
      onError?.(error instanceof Error ? error : new Error(errorMessage));
    } finally {
      setLoading(false);
    }
  }, [address, onSuccess, onError]);
  const isDisabled = loading || !address?.trim();
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
    >
      {loading ? (
        <>
          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          Geocoding...
        </>
      ) : (
        <>
          <MapPin className="mr-2 h-4 w-4" />
          Find Coordinates
        </>
      )}
    </Button>
  );
}
export default GeocodingButton;
GEOCODING_EOF

cp /tmp/geocoding-button-fix.tsx "$GEOCODING_FILE"
echo "✓ Geocoding Button enhanced"
echo ""

echo "======================================"
echo "All 3 fixes applied successfully!"
echo "======================================"
echo ""
echo "Summary of changes:"
echo "1. Product Seed API: Enhanced vendor validation with detailed logging"
echo "2. Vendor Seed API: Added cache invalidation for newly created vendors"
echo "3. Geocoding Button: Fixed whitespace handling and improved UX"
echo ""
