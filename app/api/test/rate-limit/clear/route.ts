/**
 * Test API: Clear Rate Limits
 *
 * This endpoint clears all rate limit entries for testing purposes.
 * Only available in development/test environments.
 *
 * POST /api/test/rate-limit/clear
 */

import { NextRequest, NextResponse } from 'next/server';
import { clearRateLimits } from '@/lib/middleware/rateLimit';

export async function POST(request: NextRequest): Promise<NextResponse> {
  // Only allow in non-production environments
  if (process.env.NODE_ENV === 'production') {
    return NextResponse.json(
      { error: 'Not available in production' },
      { status: 403 }
    );
  }

  const cleared = clearRateLimits();

  return NextResponse.json({
    success: cleared,
    message: cleared
      ? 'Rate limits cleared successfully'
      : 'Failed to clear rate limits',
  });
}
