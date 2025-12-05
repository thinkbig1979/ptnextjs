/**
 * Vendor Portal API - Cancel Tier Downgrade Request
 *
 * DELETE /api/portal/vendors/[id]/tier-downgrade-request/[requestId] - Cancel pending downgrade request
 *
 * Authentication: Required (vendor role)
 * Authorization: Vendors can only cancel their own requests
 * Security: Rate limited to 10 requests per minute per IP
 */

import { NextRequest, NextResponse } from 'next/server';
import * as TierUpgradeRequestService from '@/lib/services/TierUpgradeRequestService';
import { rateLimit } from '@/lib/middleware/rateLimit';
import { authenticateVendorPortal } from '@/lib/middleware/vendor-portal-auth';

/**
 * DELETE - Cancel a pending tier downgrade request
 */
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string; requestId: string }> }
) {
  return rateLimit(request, async () => {
    try {
      const { id, requestId } = await params;
      const auth = await authenticateVendorPortal(request, id);

      if ('error' in auth) {
        return NextResponse.json(
          { success: false, error: auth.error, message: auth.message },
          { status: auth.status }
        );
      }

      // Cancel the downgrade request
      const result = await TierUpgradeRequestService.cancelRequest(
        requestId,
        id
      );

      if (!result.success) {
        const statusCode = result.error === 'Request not found' ? 404 :
                          result.error === 'Request does not belong to vendor' ? 403 :
                          result.error === 'Can only cancel pending requests' ? 400 : 500;

        return NextResponse.json(
          {
            success: false,
            error: result.error?.toUpperCase().replace(/ /g, '_') || 'CANCEL_FAILED',
            message: result.error || 'Failed to cancel request',
          },
          { status: statusCode }
        );
      }

      return NextResponse.json(
        { success: true, message: 'Downgrade request cancelled successfully' },
        { status: 200 }
      );
    } catch (error) {
      console.error('Error cancelling tier downgrade request:', error);
      return NextResponse.json(
        { success: false, error: 'INTERNAL_ERROR', message: 'Failed to cancel request' },
        { status: 500 }
      );
    }
  });
}
