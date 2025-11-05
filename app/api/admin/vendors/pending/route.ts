import { NextRequest, NextResponse } from 'next/server';
import { getPayload } from 'payload';
import config from '@/payload.config';
import { authService } from '@/lib/services/auth-service';

/**
 * Extract and validate admin user
 */
function extractAdminUser(request: NextRequest) {
  const token = request.cookies.get('access_token')?.value ||
                request.headers.get('authorization')?.replace('Bearer ', '');

  if (!token) {
    throw new Error('Authentication required');
  }

  const user = authService.validateToken(token);

  if (user.role !== 'admin') {
    throw new Error('Admin access required');
  }

  return user;
}

/**
 * GET /api/admin/vendors/pending - Get pending vendor approvals
 */
export async function GET(request: NextRequest) {
  try {
    extractAdminUser(request);

    const payload = await getPayload({ config });

    // Get all users with pending status
    const pendingUsers = await payload.find({
      collection: 'users',
      where: { status: { equals: 'pending' } },
      limit: 100,
    });

    // Get vendor profiles for pending users
    const vendorProfiles = await Promise.all(
      pendingUsers.docs.map(async (user) => {
        const vendors = await payload.find({
          collection: 'vendors',
          where: { user: { equals: user.id } },
          limit: 1,
        });

        return {
          user: {
            id: user.id,
            email: user.email,
            role: user.role,
            status: user.status,
            createdAt: user.createdAt,
          },
          vendor: vendors.docs[0] || null,
        };
      })
    );

    return NextResponse.json({ pending: vendorProfiles });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed to fetch pending approvals';

    if (message.includes('Admin access required')) {
      return NextResponse.json({ error: message }, { status: 403 });
    }

    return NextResponse.json({ error: message }, { status: 401 });
  }
}
