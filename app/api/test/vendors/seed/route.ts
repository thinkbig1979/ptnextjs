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
        // Prepare locations array if provided
        const locations = vendorData.locations?.map(loc => ({
          address: loc.name, // Using name as address for now
          city: loc.city,
          country: loc.country,
          latitude: loc.latitude,
          longitude: loc.longitude,
          isHQ: loc.isHQ || false,
        })) || [];

        // Then create vendor linked to the user (with locations included)
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
            locations: locations.length > 0 ? locations : undefined,
          },
        });
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
