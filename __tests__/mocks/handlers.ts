/**
 * Mock Service Worker (MSW) Request Handlers
 *
 * This file defines all API mock handlers for testing frontend components.
 * MSW intercepts network requests at the network layer, providing realistic
 * API mocking without modifying application code.
 *
 * @see https://mswjs.io/docs/
 */

import { http, HttpResponse } from 'msw';

// Success response helpers
const successResponse = (data: any, status = 200) => {
  return HttpResponse.json(data, { status });
};

const errorResponse = (error: string, status = 400, code?: string) => {
  return HttpResponse.json({ error, code }, { status });
};

/**
 * Authentication API Handlers
 */
export const authHandlers = [
  // POST /api/auth/login - Successful login
  http.post('/api/auth/login', async ({ request }) => {
    const body = await request.json() as { email: string; password: string };

    // Admin login
    if (body.email === 'admin@example.com' && body.password === 'Admin123!@#') {
      return successResponse({
        user: {
          id: 'admin-001',
          email: 'admin@example.com',
          role: 'admin',
        },
        message: 'Login successful',
      });
    }

    // Approved vendor login (tier2)
    if (body.email === 'vendor.tier2@example.com' && body.password === 'StrongPass123!@#') {
      return successResponse({
        user: {
          id: 'vendor-tier2-001',
          email: 'vendor.tier2@example.com',
          role: 'vendor',
          tier: 'tier2',
        },
        message: 'Login successful',
      });
    }

    // Approved vendor login (tier1)
    if (body.email === 'vendor.tier1@example.com' && body.password === 'StrongPass123!@#') {
      return successResponse({
        user: {
          id: 'vendor-tier1-001',
          email: 'vendor.tier1@example.com',
          role: 'vendor',
          tier: 'tier1',
        },
        message: 'Login successful',
      });
    }

    // Approved vendor login (free tier)
    if (body.email === 'vendor.free@example.com' && body.password === 'StrongPass123!@#') {
      return successResponse({
        user: {
          id: 'vendor-free-001',
          email: 'vendor.free@example.com',
          role: 'vendor',
          tier: 'free',
        },
        message: 'Login successful',
      });
    }

    // Pending vendor (403)
    if (body.email === 'vendor.pending@example.com') {
      return errorResponse('Your account is pending approval', 403, 'PENDING_APPROVAL');
    }

    // Rejected vendor (403)
    if (body.email === 'vendor.rejected@example.com') {
      return errorResponse('Your account has been rejected', 403, 'ACCOUNT_REJECTED');
    }

    // Invalid credentials (401)
    return errorResponse('Invalid email or password', 401, 'INVALID_CREDENTIALS');
  }),

  // POST /api/auth/logout - Logout
  http.post('/api/auth/logout', () => {
    return successResponse({ message: 'Logout successful' });
  }),

  // POST /api/auth/refresh - Refresh token
  http.post('/api/auth/refresh', () => {
    return successResponse({
      accessToken: 'new-access-token',
      message: 'Token refreshed',
    });
  }),
];

/**
 * Vendor Registration API Handlers
 */
export const registrationHandlers = [
  // POST /api/vendors/register - Successful registration
  http.post('/api/vendors/register', async ({ request }) => {
    const body = await request.json() as any;

    // Duplicate email check
    if (body.email === 'existing@example.com') {
      return errorResponse('Email already exists', 409, 'EMAIL_EXISTS');
    }

    // Duplicate company name check
    if (body.companyName === 'Existing Company') {
      return errorResponse('Company name already exists', 409, 'COMPANY_EXISTS');
    }

    // Validation errors
    if (!body.email || !body.password || !body.companyName) {
      return errorResponse('Missing required fields', 400, 'VALIDATION_ERROR');
    }

    // Success
    return successResponse({
      vendor: {
        id: 'new-vendor-001',
        email: body.email,
        companyName: body.companyName,
        contactName: body.contactName,
        approvalStatus: 'pending',
        tier: 'free',
      },
      message: 'Registration successful. Your account is pending approval.',
    }, 201);
  }),
];

/**
 * Vendor Profile API Handlers
 */
export const profileHandlers = [
  // GET /api/vendors/profile - Get current vendor profile
  http.get('/api/vendors/profile', ({ request }) => {
    const authHeader = request.headers.get('authorization');

    if (!authHeader) {
      return errorResponse('Not authenticated', 401, 'NOT_AUTHENTICATED');
    }

    // Return mock profile based on token
    return successResponse({
      vendor: {
        id: 'vendor-tier2-001',
        email: 'vendor.tier2@example.com',
        companyName: 'Test Marine Tech',
        contactName: 'John Doe',
        phone: '+1-555-0123',
        website: 'https://testmarine.com',
        description: 'Leading provider of marine technology',
        tier: 'tier2',
        approvalStatus: 'approved',
      },
    });
  }),

  // PUT /api/vendors/:id - Update vendor profile
  http.put('/api/vendors/:id', async ({ request, params }) => {
    const authHeader = request.headers.get('authorization');

    if (!authHeader) {
      return errorResponse('Not authenticated', 401, 'NOT_AUTHENTICATED');
    }

    const body = await request.json() as any;

    // Tier restriction validation (free tier trying to update tier1 fields)
    if (body.certifications && request.headers.get('x-user-tier') === 'free') {
      return errorResponse('Upgrade to Tier 1 required', 403, 'TIER_RESTRICTION');
    }

    // Success
    return successResponse({
      vendor: {
        id: params.id,
        ...body,
      },
      message: 'Profile updated successfully',
    });
  }),
];

/**
 * Admin Approval API Handlers
 */
export const adminHandlers = [
  // GET /api/admin/vendors/pending - Get pending vendors
  http.get('/api/admin/vendors/pending', ({ request }) => {
    const authHeader = request.headers.get('authorization');
    const userRole = request.headers.get('x-user-role');

    if (!authHeader) {
      return errorResponse('Not authenticated', 401, 'NOT_AUTHENTICATED');
    }

    if (userRole !== 'admin') {
      return errorResponse('Admin access required', 403, 'FORBIDDEN');
    }

    return successResponse({
      vendors: [
        {
          id: 'pending-001',
          email: 'pending1@example.com',
          companyName: 'Pending Marine Co',
          contactName: 'Jane Smith',
          approvalStatus: 'pending',
          createdAt: '2025-10-01T10:00:00Z',
        },
        {
          id: 'pending-002',
          email: 'pending2@example.com',
          companyName: 'Another Pending Co',
          contactName: 'Bob Johnson',
          approvalStatus: 'pending',
          createdAt: '2025-10-05T14:30:00Z',
        },
      ],
    });
  }),

  // POST /api/admin/vendors/:id/approve - Approve vendor
  http.post('/api/admin/vendors/:id/approve', ({ request, params }) => {
    const authHeader = request.headers.get('authorization');
    const userRole = request.headers.get('x-user-role');

    if (!authHeader) {
      return errorResponse('Not authenticated', 401, 'NOT_AUTHENTICATED');
    }

    if (userRole !== 'admin') {
      return errorResponse('Admin access required', 403, 'FORBIDDEN');
    }

    return successResponse({
      vendor: {
        id: params.id,
        approvalStatus: 'approved',
      },
      message: 'Vendor approved successfully',
    });
  }),

  // POST /api/admin/vendors/:id/reject - Reject vendor
  http.post('/api/admin/vendors/:id/reject', ({ request, params }) => {
    const authHeader = request.headers.get('authorization');
    const userRole = request.headers.get('x-user-role');

    if (!authHeader) {
      return errorResponse('Not authenticated', 401, 'NOT_AUTHENTICATED');
    }

    if (userRole !== 'admin') {
      return errorResponse('Admin access required', 403, 'FORBIDDEN');
    }

    return successResponse({
      vendor: {
        id: params.id,
        approvalStatus: 'rejected',
      },
      message: 'Vendor rejected successfully',
    });
  }),
];

/**
 * Error Scenario Handlers (for testing error handling)
 */
export const errorHandlers = [
  // Server error (500)
  http.post('/api/test/server-error', () => {
    return errorResponse('Internal server error', 500, 'SERVER_ERROR');
  }),

  // Network error (simulated)
  http.post('/api/test/network-error', () => {
    return HttpResponse.error();
  }),

  // Timeout (simulated)
  http.post('/api/test/timeout', async () => {
    await new Promise((resolve) => setTimeout(resolve, 10000));
    return successResponse({ message: 'This should timeout' });
  }),
];

/**
 * Combined handlers export
 */
export const handlers = [
  ...authHandlers,
  ...registrationHandlers,
  ...profileHandlers,
  ...adminHandlers,
  ...errorHandlers,
];
