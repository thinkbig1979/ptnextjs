import crypto from 'crypto';
import { NextRequest, NextResponse } from 'next/server';
import { after } from 'next/server';
import { getPayloadClient } from '@/lib/utils/get-payload-config';
import { rateLimit } from '@/lib/middleware/rateLimit';
import { authService } from '@/lib/services/auth-service';
import { sendUserApprovedEmail } from '@/lib/services/EmailService';

function hashToken(token: string): string {
  return crypto.createHash('sha256').update(token).digest('hex');
}

const CLAIM_RATE_LIMIT = {
  maxRequests: 6,
  windowMs: 60 * 60 * 1000, // 1 hour
  identifier: '/api/portal/vendors/claim',
};

const CLAIM_GET_RATE_LIMIT = {
  maxRequests: 20,
  windowMs: 60 * 60 * 1000, // 1 hour
  identifier: '/api/portal/vendors/claim/get',
};

// GET /api/portal/vendors/claim?token=xxx
// Lightweight token validation with no auth required.
export async function GET(request: NextRequest): Promise<NextResponse> {
  return rateLimit(
    request,
    async () => {
      const { searchParams } = new URL(request.url);
      const token = searchParams.get('token');

      if (!token) {
        return NextResponse.json(
          { error: 'Token is required' },
          { status: 400 },
        );
      }

      try {
        const payload = await getPayloadClient();

        const result = await payload.find({
          collection: 'vendor-invitations',
          where: {
            token: { equals: hashToken(token) },
            status: { equals: 'pending' },
          },
          depth: 1,
          limit: 1,
          overrideAccess: true,
        });

        if (result.docs.length === 0) {
          return NextResponse.json(
            { error: 'Invitation not found' },
            { status: 404 },
          );
        }

        const invitation = result.docs[0];

        if (new Date(invitation.expiresAt) < new Date()) {
          // Mark as expired (fire-and-forget)
          payload.update({
            collection: 'vendor-invitations',
            id: invitation.id,
            data: { status: 'expired' },
            overrideAccess: true,
          }).catch(() => {});
          return NextResponse.json(
            { error: 'Invitation has expired' },
            { status: 410 },
          );
        }

        const vendor = invitation.vendor as {
          id: string | number;
          companyName: string;
          contactEmail: string;
          user?: unknown;
        };

        return NextResponse.json({
          valid: true,
          companyName: vendor.companyName,
          email: invitation.email,
        });
      } catch (error) {
        console.error('[VendorClaim] GET token validation failed:', {
          error: error instanceof Error ? error.message : 'Unknown error',
          timestamp: new Date().toISOString(),
        });

        return NextResponse.json(
          { error: 'An error occurred while validating the invitation' },
          { status: 500 },
        );
      }
    },
    CLAIM_GET_RATE_LIMIT,
  );
}

// POST /api/portal/vendors/claim
// Claims a vendor profile using an invitation token. Rate limited, no auth required.
export async function POST(request: NextRequest): Promise<NextResponse> {
  return rateLimit(
    request,
    async () => {
      try {
        const body = await request.json();
        const { token, password } = body as { token?: unknown; password?: unknown };

        if (!token || typeof token !== 'string') {
          return NextResponse.json(
            { error: 'Token is required' },
            { status: 400 },
          );
        }

        if (!password || typeof password !== 'string') {
          return NextResponse.json(
            { error: 'Password is required' },
            { status: 400 },
          );
        }

        if (password.length < 12) {
          return NextResponse.json(
            { error: 'Password must be at least 12 characters' },
            { status: 400 },
          );
        }

        try {
          authService.validatePasswordStrength(password);
        } catch (err) {
          const message = err instanceof Error ? err.message : 'Invalid password';
          return NextResponse.json(
            { error: message },
            { status: 400 },
          );
        }

        const payload = await getPayloadClient();

        const result = await payload.find({
          collection: 'vendor-invitations',
          where: {
            token: { equals: hashToken(token) },
            status: { equals: 'pending' },
          },
          depth: 1,
          limit: 1,
          overrideAccess: true,
        });

        if (result.docs.length === 0) {
          return NextResponse.json(
            { error: 'Invitation not found' },
            { status: 404 },
          );
        }

        const invitation = result.docs[0];

        if (new Date(invitation.expiresAt) < new Date()) {
          // Mark as expired (fire-and-forget)
          payload.update({
            collection: 'vendor-invitations',
            id: invitation.id,
            data: { status: 'expired' },
            overrideAccess: true,
          }).catch(() => {});
          return NextResponse.json(
            { error: 'Invitation has expired' },
            { status: 410 },
          );
        }

        const vendor = invitation.vendor as {
          id: string | number;
          companyName: string;
          contactEmail: string;
          user?: unknown;
        };

        // Verify vendor hasn't been claimed through another path
        if (vendor.user) {
          return NextResponse.json(
            { error: 'This vendor profile has already been claimed' },
            { status: 409 },
          );
        }

        let userId: string | number | undefined;

        try {
          const user = await payload.create({
            collection: 'users',
            data: {
              email: invitation.email,
              password,
              role: 'vendor',
              status: 'approved',
            },
            overrideAccess: true,
          });
          userId = user.id;

          // Optimistic lock: update invitation status first to prevent race conditions
          const invitationUpdate = await payload.update({
            collection: 'vendor-invitations',
            id: invitation.id,
            data: {
              status: 'claimed',
              claimedAt: new Date().toISOString(),
              claimedByUser: userId,
            },
            overrideAccess: true,
          });

          // If the invitation was already claimed by another request, the status
          // would have changed. Check by verifying the update succeeded.
          if (!invitationUpdate || invitationUpdate.status !== 'claimed') {
            // Race condition: another request claimed this first
            throw new Error('RACE_CONDITION');
          }

          // Now update the vendor
          await payload.update({
            collection: 'vendors',
            id: vendor.id,
            data: {
              user: userId,
              claimStatus: 'claimed',
            },
            overrideAccess: true,
          });

          const claimedEmail = invitation.email;

          after(async () => {
            try {
              await sendUserApprovedEmail({ email: claimedEmail });
            } catch (emailError) {
              console.error('[VendorClaim] Failed to send confirmation email:', {
                error: emailError instanceof Error ? emailError.message : 'Unknown error',
                email: claimedEmail,
              });
            }
          });

          return NextResponse.json(
            {
              success: true,
              data: {
                message: 'Vendor profile claimed successfully',
              },
            },
            { status: 201 },
          );
        } catch (error) {
          if (userId) {
            try {
              await payload.delete({
                collection: 'users',
                id: userId,
                overrideAccess: true,
              });
            } catch (rollbackError) {
              console.error('[VendorClaim] Failed to rollback user creation:', rollbackError);
            }
          }
          // Return 409 for race conditions instead of 500
          if (error instanceof Error && error.message === 'RACE_CONDITION') {
            return NextResponse.json(
              { error: 'This invitation has already been claimed' },
              { status: 409 },
            );
          }
          throw error;
        }
      } catch (error) {
        console.error('[VendorClaim] POST claim failed:', {
          error: error instanceof Error ? error.message : 'Unknown error',
          stack: error instanceof Error ? error.stack : undefined,
          timestamp: new Date().toISOString(),
        });

        return NextResponse.json(
          {
            success: false,
            error: 'An error occurred while claiming the vendor profile. Please try again.',
          },
          { status: 500 },
        );
      }
    },
    CLAIM_RATE_LIMIT,
  );
}
