/**
 * Readiness Check Endpoint
 *
 * Comprehensive readiness check including database connectivity.
 * Used for Kubernetes readiness probes or load balancer health checks.
 *
 * Endpoint: GET /api/health/ready
 * Response Time: <500ms (includes database check)
 * Authentication: None required (safe for internal network)
 */

import { NextRequest, NextResponse } from 'next/server';
import { getPayload } from 'payload';
import config from '@payload-config';

export async function GET(request: NextRequest) {
  const startTime = process.hrtime.bigint();

  const checks = {
    database: 'unknown',
    payload: 'unknown',
  };

  let overallStatus = 'healthy';
  let statusCode = 200;

  try {
    // Check Payload CMS initialization
    const payload = await getPayload({ config });
    checks.payload = 'initialized';

    // Check database connectivity
    // For SQLite, we can check if we can perform a simple query
    try {
      await payload.find({
        collection: 'users',
        limit: 1,
      });
      checks.database = 'connected';
    } catch (dbError) {
      checks.database = 'disconnected';
      overallStatus = 'unhealthy';
      statusCode = 503;
    }
  } catch (error) {
    checks.payload = 'failed';
    overallStatus = 'unhealthy';
    statusCode = 503;
  }

  // Calculate response time
  const endTime = process.hrtime.bigint();
  const duration = Number(endTime - startTime) / 1_000_000; // Convert to milliseconds

  const response = {
    status: overallStatus,
    timestamp: new Date().toISOString(),
    checks,
    uptime: Math.floor(process.uptime()),
    environment: process.env.NODE_ENV || 'production',
  };

  return NextResponse.json(response, {
    status: statusCode,
    headers: {
      'Content-Type': 'application/json',
      'Cache-Control': 'no-cache, no-store, must-revalidate',
      'X-Response-Time': `${duration.toFixed(2)}ms`,
    },
  });
}

// Support HEAD requests for lightweight readiness checks
export async function HEAD(request: NextRequest) {
  try {
    const payload = await getPayload({ config });
    await payload.find({
      collection: 'users',
      limit: 1,
    });

    return new NextResponse(null, {
      status: 200,
      headers: {
        'Cache-Control': 'no-cache, no-store, must-revalidate',
      },
    });
  } catch (error) {
    return new NextResponse(null, {
      status: 503,
      headers: {
        'Cache-Control': 'no-cache, no-store, must-revalidate',
      },
    });
  }
}
