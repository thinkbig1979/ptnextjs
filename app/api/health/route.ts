/**
 * Health Check Endpoint
 *
 * Basic health check for Docker HEALTHCHECK and monitoring.
 * Returns application status without database connectivity checks.
 *
 * Endpoint: GET /api/health
 * Response Time: <100ms (lightweight)
 * Authentication: None required (safe for internal network)
 */

import { NextRequest, NextResponse } from 'next/server';

export async function GET(_request: NextRequest) {
  const startTime = process.hrtime.bigint();

  // Build response with application status
  const response = {
    status: 'ok',
    timestamp: new Date().toISOString(),
    uptime: Math.floor(process.uptime()),
    environment: process.env.NODE_ENV || 'production',
    version: process.env.npm_package_version || '2.0.0',
  };

  // Calculate response time
  const endTime = process.hrtime.bigint();
  const duration = Number(endTime - startTime) / 1_000_000; // Convert to milliseconds

  return NextResponse.json(response, {
    status: 200,
    headers: {
      'Content-Type': 'application/json',
      'Cache-Control': 'no-cache, no-store, must-revalidate',
      'X-Response-Time': `${duration.toFixed(2)}ms`,
    },
  });
}

// Support HEAD requests for lightweight health checks
export async function HEAD(_request: NextRequest) {
  return new NextResponse(null, {
    status: 200,
    headers: {
      'Cache-Control': 'no-cache, no-store, must-revalidate',
    },
  });
}
