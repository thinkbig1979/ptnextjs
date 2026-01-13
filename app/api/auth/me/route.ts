import { NextRequest, NextResponse } from 'next/server';
import { authService } from '@/lib/services/auth-service';
import { getPayloadClient } from '@/lib/utils/get-payload-config';

/**
 * GET /api/auth/me
 *
 * Returns current authenticated user from JWT token in httpOnly cookie
 * Also fetches fresh approval status and tier from database to ensure they're up-to-date
 */
export async function GET(request: NextRequest): Promise<NextResponse> {
  try {
    // Extract token from httpOnly cookie
    const token = request.cookies.get('access_token')?.value;

    if (!token) {
      return NextResponse.json(
        { error: 'Not authenticated' },
        { status: 401 }
      );
    }

    // Validate token and get user data
    const user = authService.validateToken(token);

    // Fetch fresh approval status and tier from database
    try {
      const payload = await getPayloadClient();
      const userDoc = await payload.findByID({
        collection: 'users',
        id: user.id,
      });

      // Update status from database if user is a vendor
      if (userDoc && user.role === 'vendor') {
        user.status = (userDoc.status as 'pending' | 'approved' | 'rejected') || 'pending';

        // Fetch fresh tier from vendor record
        // The tier is stored on the vendor, not the user
        const vendors = await payload.find({
          collection: 'vendors',
          where: {
            user: {
              equals: user.id,
            },
          },
          limit: 1,
          depth: 0,
        });

        if (vendors.docs.length > 0) {
          const vendor = vendors.docs[0];
          user.tier = (vendor.tier as 'free' | 'tier1' | 'tier2' | 'tier3') || 'free';
        }
      }
    } catch (dbError) {
      // If database fetch fails, continue with JWT values
      console.warn('[Auth] Failed to fetch fresh user data from database:', dbError);
    }

    return NextResponse.json({
      user,
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Authentication failed';

    if (message === 'Token expired') {
      return NextResponse.json(
        { error: 'Token expired', code: 'TOKEN_EXPIRED' },
        { status: 401 }
      );
    }

    return NextResponse.json(
      { error: 'Invalid token' },
      { status: 401 }
    );
  }
}
