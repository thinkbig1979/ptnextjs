/**
 * Admin API - Vendor Claim Invitations
 *
 * Sends invitation emails to unclaimed vendor profiles so that the business
 * owner can register and take ownership of their listing.
 *
 * POST /api/admin/vendor-invitations
 *   Body: { vendorId: string, email?: string }
 *   - email defaults to the vendor's contactEmail field
 *   - Vendor must exist and have no associated user (unclaimed)
 *   - Creates a vendor-invitations record with a 7-day expiry
 *   - Updates vendor claimStatus to 'invited'
 *   - Sends the invitation email non-blocking via after()
 *
 * GET /api/admin/vendor-invitations?vendorId=xxx
 *   - Returns invitation history for the given vendor
 *
 * Authentication: Required (admin role)
 */

import { NextRequest, NextResponse, after } from 'next/server';
import crypto from 'crypto';
import { getPayloadClient } from '@/lib/utils/get-payload-config';
import { requireAdmin } from '@/lib/auth';
import { sendVendorInvitationEmail } from '@/lib/services/EmailService';

const INVITATION_EXPIRY_DAYS = 7;

/**
 * Format a Date as a human-readable string for use in email copy.
 * Example: "Tuesday, 3 March 2026"
 */
function formatExpiryDate(date: Date): string {
  return date.toLocaleDateString('en-GB', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });
}

function hashToken(token: string): string {
  return crypto.createHash('sha256').update(token).digest('hex');
}

/**
 * POST /api/admin/vendor-invitations
 */
export async function POST(request: NextRequest): Promise<NextResponse> {
  try {
    // Run auth check and payload client init in parallel
    const [auth, payload] = await Promise.all([
      requireAdmin(request),
      getPayloadClient(),
    ]);

    if (!auth.success) {
      return NextResponse.json(
        { error: auth.error, code: auth.code },
        { status: auth.status }
      );
    }

    const body = await request.json();
    const { vendorId, email: bodyEmail } = body as { vendorId?: string; email?: string };

    if (!vendorId) {
      return NextResponse.json(
        { error: 'vendorId is required' },
        { status: 400 }
      );
    }

    // Fetch vendor to verify it exists and is unclaimed
    let vendor;
    try {
      vendor = await payload.findByID({
        collection: 'vendors',
        id: vendorId,
        overrideAccess: true,
      });
    } catch (error) {
      const message = error instanceof Error ? error.message : '';
      if (message.includes('not found') || message.includes('No document')) {
        return NextResponse.json(
          { error: 'Vendor not found' },
          { status: 404 }
        );
      }
      throw error;
    }

    // Vendor must be unclaimed (no associated user)
    if (vendor.user) {
      return NextResponse.json(
        { error: 'Vendor already has an associated user and cannot be invited' },
        { status: 409 }
      );
    }

    // Resolve recipient email: prefer explicit body value, fall back to vendor contactEmail
    const recipientEmail = bodyEmail ?? (vendor.contactEmail as string | undefined);

    if (!recipientEmail) {
      return NextResponse.json(
        { error: 'No email address available. Provide email in the request body or ensure the vendor has a contactEmail.' },
        { status: 422 }
      );
    }

    // Revoke any existing pending invitations for this vendor
    const existingInvitations = await payload.find({
      collection: 'vendor-invitations',
      where: {
        vendor: { equals: vendorId },
        status: { equals: 'pending' },
      },
      overrideAccess: true,
    });

    if (existingInvitations.docs.length > 0) {
      await Promise.all(
        existingInvitations.docs.map((inv) =>
          payload.update({
            collection: 'vendor-invitations',
            id: inv.id,
            data: { status: 'revoked' },
            overrideAccess: true,
          })
        )
      );
    }

    // Generate a secure random token
    const token = crypto.randomBytes(32).toString('hex');

    const now = new Date();
    const expiresAt = new Date(now);
    expiresAt.setDate(expiresAt.getDate() + INVITATION_EXPIRY_DAYS);

    // Create the invitation record
    const invitation = await payload.create({
      collection: 'vendor-invitations',
      data: {
        vendor: vendorId,
        email: recipientEmail,
        token: hashToken(token),
        status: 'pending',
        expiresAt: expiresAt.toISOString(),
      },
      overrideAccess: true,
    });

    // Update vendor claimStatus to reflect that an invitation has been sent
    await payload.update({
      collection: 'vendors',
      id: vendorId,
      data: {
        claimStatus: 'invited',
      },
      overrideAccess: true,
    });

    const claimUrl = `${process.env.NEXT_PUBLIC_BASE_URL}/vendor/claim?token=${token}`;
    const companyName = (vendor.companyName as string | undefined) ?? 'Your Business';

    // Send the invitation email after the response is returned
    after(async () => {
      try {
        await sendVendorInvitationEmail({
          companyName,
          email: recipientEmail,
          claimUrl,
          expiryDate: formatExpiryDate(expiresAt),
        });
      } catch (error) {
        console.error('[VendorInvitations] Failed to send invitation email:', error);
      }
    });

    return NextResponse.json(
      {
        message: 'Vendor invitation created successfully',
        invitation: {
          id: invitation.id,
          vendorId,
          email: recipientEmail,
          expiresAt: expiresAt.toISOString(),
          status: invitation.status,
        },
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('[VendorInvitations POST] Error:', error);
    const message = error instanceof Error ? error.message : 'Failed to create vendor invitation';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

/**
 * GET /api/admin/vendor-invitations?vendorId=xxx
 */
export async function GET(request: NextRequest): Promise<NextResponse> {
  try {
    // Run auth check and payload client init in parallel
    const [auth, payload] = await Promise.all([
      requireAdmin(request),
      getPayloadClient(),
    ]);

    if (!auth.success) {
      return NextResponse.json(
        { error: auth.error, code: auth.code },
        { status: auth.status }
      );
    }

    const vendorId = request.nextUrl.searchParams.get('vendorId');

    if (!vendorId) {
      return NextResponse.json(
        { error: 'vendorId query parameter is required' },
        { status: 400 }
      );
    }

    const result = await payload.find({
      collection: 'vendor-invitations',
      where: {
        vendor: { equals: vendorId },
      },
      sort: '-createdAt',
      overrideAccess: true,
    });

    return NextResponse.json({
      invitations: result.docs,
      totalDocs: result.totalDocs,
    });
  } catch (error) {
    console.error('[VendorInvitations GET] Error:', error);
    const message = error instanceof Error ? error.message : 'Failed to fetch vendor invitations';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
