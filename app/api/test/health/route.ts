/**
 * Test API: Health Check Endpoint
 *
 * Comprehensive health check for E2E test readiness.
 * Verifies database connection, table access, and test API availability.
 * Only available in development/test environments.
 *
 * GET /api/test/health
 */

import { NextResponse } from 'next/server';
import { getPayload } from 'payload';
import config from '@/payload.config';

interface HealthCheckResult {
  status: 'healthy' | 'unhealthy';
  timestamp: string;
  checks: {
    database: { ok: boolean; message: string };
    vendorsTable: { ok: boolean; count: number; message: string };
    productsTable: { ok: boolean; count: number; message: string };
    testEndpoints: { ok: boolean; message: string };
  };
  readyForTests: boolean;
}

export async function GET(): Promise<NextResponse<HealthCheckResult>> {
  // Only allow in non-production environments OR when E2E_TEST is explicitly enabled
  const isE2ETest = process.env.E2E_TEST === 'true';
  if (process.env.NODE_ENV === 'production' && !isE2ETest) {
    return NextResponse.json(
      {
        status: 'unhealthy',
        timestamp: new Date().toISOString(),
        checks: {
          database: { ok: false, message: 'Production mode' },
          vendorsTable: { ok: false, count: 0, message: 'Not checked' },
          productsTable: { ok: false, count: 0, message: 'Not checked' },
          testEndpoints: { ok: false, message: 'Not available in production' },
        },
        readyForTests: false,
      } as HealthCheckResult,
      { status: 403 }
    );
  }

  const result: HealthCheckResult = {
    status: 'healthy',
    timestamp: new Date().toISOString(),
    checks: {
      database: { ok: false, message: 'Not checked' },
      vendorsTable: { ok: false, count: 0, message: 'Not checked' },
      productsTable: { ok: false, count: 0, message: 'Not checked' },
      testEndpoints: { ok: false, message: 'Not checked' },
    },
    readyForTests: false,
  };

  try {
    // Check 1: Database connection via Payload
    const payload = await getPayload({ config });
    result.checks.database = { ok: true, message: 'Connected' };

    // Check 2: Vendors table query
    try {
      const vendors = await payload.find({
        collection: 'vendors',
        limit: 1,
      });
      result.checks.vendorsTable = {
        ok: true,
        count: vendors.totalDocs,
        message: `${vendors.totalDocs} vendors in database`,
      };
    } catch (vendorError) {
      result.checks.vendorsTable = {
        ok: false,
        count: 0,
        message: `Vendors query failed: ${vendorError instanceof Error ? vendorError.message : 'Unknown error'}`,
      };
    }

    // Check 3: Products table query
    try {
      const products = await payload.find({
        collection: 'products',
        limit: 1,
      });
      result.checks.productsTable = {
        ok: true,
        count: products.totalDocs,
        message: `${products.totalDocs} products in database`,
      };
    } catch (productError) {
      result.checks.productsTable = {
        ok: false,
        count: 0,
        message: `Products query failed: ${productError instanceof Error ? productError.message : 'Unknown error'}`,
      };
    }

    // Check 4: Test endpoints availability (already proven by reaching here)
    result.checks.testEndpoints = {
      ok: true,
      message: 'Test endpoints accessible',
    };

    // Overall health status
    const allChecksPass =
      result.checks.database.ok &&
      result.checks.vendorsTable.ok &&
      result.checks.productsTable.ok &&
      result.checks.testEndpoints.ok;

    result.status = allChecksPass ? 'healthy' : 'unhealthy';
    result.readyForTests = allChecksPass;

    return NextResponse.json(result, { status: allChecksPass ? 200 : 503 });
  } catch (error) {
    // Database connection failed
    result.checks.database = {
      ok: false,
      message: `Connection failed: ${error instanceof Error ? error.message : 'Unknown error'}`,
    };
    result.status = 'unhealthy';
    result.readyForTests = false;

    return NextResponse.json(result, { status: 503 });
  }
}
