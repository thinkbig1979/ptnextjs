import { NextRequest, NextResponse } from 'next/server';
import { VendorProfileService } from '@/lib/services/VendorProfileService';
import { TierValidationService } from '@/lib/services/TierValidationService';
import { VendorComputedFieldsService } from '@/lib/services/VendorComputedFieldsService';
import { getPayloadClient } from '@/lib/utils/get-payload-config';
import type { Tier } from '@/lib/services/TierService';

interface RouteContext {
  params: Promise<{
    slug: string;
  }>;
}

interface SuccessResponse {
  success: true;
  data: Record<string, unknown>;
}

interface ErrorResponse {
  success: false;
  error: {
    code: 'NOT_FOUND' | 'SERVER_ERROR';
    message: string;
  };
}

interface VendorLocation {
  isHQ: boolean;
  [key: string]: unknown;
}

interface VendorData {
  tier?: Tier;
  locations?: VendorLocation[];
  [key: string]: unknown;
}

/**
 * Filter array fields based on tier limits
 */
function filterArrayFieldsByTier(vendor: VendorData, tier: Tier): VendorData {
  const filtered = { ...vendor };

  // Free tier: Only HQ location
  if (tier === 'free' && filtered.locations && Array.isArray(filtered.locations)) {
    filtered.locations = filtered.locations.filter((loc) => loc.isHQ).slice(0, 1);
  }
  // Tier 1: Max 3 locations
  else if (tier === 'tier1' && filtered.locations && Array.isArray(filtered.locations)) {
    filtered.locations = filtered.locations.slice(0, 3);
  }
  // Tier 2+: All locations (no limit)

  return filtered;
}

/**
 * Filter vendor fields based on tier
 * Only return fields accessible at the vendor's tier level
 */
function filterFieldsByTier(vendor: VendorData): VendorData {
  const tier = (vendor.tier as Tier) || 'free';
  const accessibleFields = TierValidationService.getAccessibleFields(tier);

  // Create filtered vendor object
  const filtered: VendorData = {};

  // Always include these base fields
  const alwaysInclude = ['id', 'tier', 'slug', 'createdAt', 'updatedAt'];

  for (const key of Object.keys(vendor)) {
    // Include if it's a base field or an accessible field
    if (alwaysInclude.includes(key) || accessibleFields.includes(key)) {
      filtered[key] = vendor[key];
    }
  }

  // Filter array fields by tier limits
  return filterArrayFieldsByTier(filtered, tier);
}

/**
 * GET /api/vendors/[slug]
 *
 * Public API to fetch vendor profile by slug
 *
 * Authorization: Public (no authentication required)
 *
 * Features:
 * - Returns only published vendors
 * - Filters fields based on vendor's tier
 * - Applies array limits (locations: Free=1 HQ, Tier1=3, Tier2+=all)
 * - Includes computed fields (yearsInBusiness)
 * - Sets cache headers for performance
 */
export async function GET(
  request: NextRequest,
  context: RouteContext
): Promise<NextResponse<SuccessResponse | ErrorResponse>> {
  try {
    const resolvedParams = await context.params;
    const slugOrId = resolvedParams.slug;

    // Check if param is a numeric ID or a slug
    const isNumericId = /^\d+$/.test(slugOrId);

    // Fetch vendor - by ID if numeric, otherwise by slug
    try {
      let vendor: Record<string, unknown>;

      if (isNumericId) {
        // Fetch by ID using Payload directly
        const payload = await getPayloadClient();
        const result = await payload.findByID({
          collection: 'vendors',
          id: parseInt(slugOrId, 10),
          depth: 1,
        });

        if (!result || !result.published) {
          throw new Error('Vendor not found');
        }

        vendor = VendorComputedFieldsService.enrichVendorData(result);
      } else {
        // Fetch by slug using VendorProfileService (handles published check)
        vendor = await VendorProfileService.getVendorProfile(slugOrId, {
          includeComputed: true, // Include yearsInBusiness
        });
      }

      // Filter fields based on vendor's tier
      const filteredVendor = filterFieldsByTier(vendor);

      // Return with cache headers for performance
      return NextResponse.json(
        {
          success: true,
          data: filteredVendor,
        },
        {
          status: 200,
          headers: {
            'Cache-Control': 'public, s-maxage=300, stale-while-revalidate=600', // 5 min cache
          },
        }
      );
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';

      // Vendor not found or not published
      if (errorMessage.includes('not found')) {
        return NextResponse.json(
          {
            success: false,
            error: {
              code: 'NOT_FOUND',
              message: 'Vendor not found',
            },
          },
          { status: 404 }
        );
      }

      throw error; // Re-throw to be caught by outer try-catch
    }
  } catch (error) {
    // Log error for monitoring
    console.error('[VendorPublicGet] Fetch failed:', {
      error: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack : undefined,
      timestamp: new Date().toISOString(),
    });

    // Return generic error response
    return NextResponse.json(
      {
        success: false,
        error: {
          code: 'SERVER_ERROR',
          message: 'An error occurred while fetching vendor profile',
        },
      },
      { status: 500 }
    );
  }
}
