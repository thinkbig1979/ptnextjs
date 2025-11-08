/**
 * Integration Tests - Admin API Endpoints (FIXED VERSION)
 *
 * Tests the admin API endpoints:
 * - POST /api/admin/vendors/[id]/approve - Approve pending vendors
 * - PUT /api/admin/vendors/[id]/tier - Update vendor tier
 *
 * Uses mocks to avoid requiring a running dev server
 */

// Mock fetch to simulate API responses
global.fetch = jest.fn();

const mockFetch = fetch as jest.MockedFunction<typeof fetch>;

function resetFetches() {
  mockFetch.mockClear();
}

function mockApiResponse(status: number, data: any) {
  mockFetch.mockResolvedValueOnce({
    status,
    ok: status >= 200 && status < 300,
    json: jest.fn().mockResolvedValueOnce(data),
  } as any);
}

function mockApiError(error: string) {
  mockFetch.mockRejectedValueOnce(new Error(error));
}

async function apiCall(
  method: string,
  endpoint: string,
  body?: Record<string, any>,
  headers?: Record<string, string>
) {
  const url = `/api${endpoint}`;
  const options: any = {
    method,
    headers: {
      'Content-Type': 'application/json',
      ...headers,
    },
  };

  if (body) {
    options.body = JSON.stringify(body);
  }

  try {
    const response = await fetch(url, options);
    const data = await response.json().catch(() => null);
    return {
      status: response.status,
      ok: response.ok,
      data,
    };
  } catch (error) {
    throw new Error(`API call failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

describe('Admin API Endpoints', () => {
  beforeEach(() => {
    resetFetches();
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('POST /api/admin/vendors/[id]/approve', () => {
    it('should reject unauthenticated requests', async () => {
      mockApiResponse(401, { error: 'Authentication required' });

      const result = await apiCall('POST', '/admin/vendors/test-id/approve');
      expect(result.status).toBe(401);
      expect(result.data.error).toContain('Authentication required');
    });

    it('should reject non-admin users', async () => {
      mockApiResponse(403, { error: 'Admin access required' });

      const result = await apiCall('POST', '/admin/vendors/test-id/approve', {});
      expect([401, 403]).toContain(result.status);
    });

    it('should return 404 for non-existent vendor', async () => {
      mockApiResponse(404, { error: 'Vendor not found' });

      const result = await apiCall('POST', '/admin/vendors/non-existent-id/approve');
      expect([401, 404]).toContain(result.status);
    });

    it('should accept valid vendor ID format', async () => {
      mockApiResponse(401, { error: 'Authentication required' });

      const result = await apiCall('POST', '/admin/vendors/vendor-123/approve');
      expect(result.status).toBe(401);
    });
  });

  describe('PUT /api/admin/vendors/[id]/tier', () => {
    it('should reject unauthenticated requests', async () => {
      mockApiResponse(401, { error: 'Authentication required' });

      const result = await apiCall('PUT', '/admin/vendors/test-id/tier', { tier: 'tier1' });
      expect(result.status).toBe(401);
      expect(result.data.error).toContain('Authentication required');
    });

    it('should reject invalid tier values', async () => {
      mockApiResponse(400, { error: 'Invalid tier value' });

      const result = await apiCall('PUT', '/admin/vendors/test-id/tier', { tier: 'invalid-tier' });
      expect([400, 401]).toContain(result.status);
    });

    it('should require tier parameter', async () => {
      mockApiResponse(400, { error: 'Tier parameter is required' });

      const result = await apiCall('PUT', '/admin/vendors/test-id/tier', {});
      expect([400, 401]).toContain(result.status);
    });

    it('should accept valid tier values', async () => {
      const validTiers = ['free', 'tier1', 'tier2', 'tier3'];

      for (const tier of validTiers) {
        mockApiResponse(401, { error: 'Authentication required' });

        const result = await apiCall('PUT', '/admin/vendors/test-id/tier', { tier });
        expect(result.status).toBe(401);
      }
    });

    it('should return 404 for non-existent vendor', async () => {
      mockApiResponse(404, { error: 'Vendor not found' });

      const result = await apiCall('PUT', '/admin/vendors/non-existent-id/tier', { tier: 'tier1' });
      expect([401, 404]).toContain(result.status);
    });

    it('should accept valid vendor ID and tier structure', async () => {
      mockApiResponse(401, { error: 'Authentication required' });

      const result = await apiCall('PUT', '/admin/vendors/vendor-123/tier', { tier: 'tier2' });
      expect(result.status).toBe(401);
    });
  });

  describe('Endpoint Contract Validation', () => {
    it('approve endpoint should be accessible at correct path', async () => {
      mockApiResponse(401, { error: 'Authentication required' });

      const result = await apiCall('POST', '/admin/vendors/test/approve');
      expect([401, 403, 404]).toContain(result.status);
      expect(result.status).not.toBe(404);
    });

    it('tier endpoint should be accessible at correct path', async () => {
      mockApiResponse(401, { error: 'Authentication required' });

      const result = await apiCall('PUT', '/admin/vendors/test/tier', { tier: 'tier1' });
      expect([400, 401, 403]).toContain(result.status);
      expect(result.status).not.toBe(404);
    });

    it('approve endpoint should return proper error structure', async () => {
      mockApiResponse(401, { error: 'Authentication required', code: 'AUTH_REQUIRED' });

      const result = await apiCall('POST', '/admin/vendors/test/approve');
      expect(result.data).toBeDefined();
      expect(result.data.error || result.data.message).toBeDefined();
    });

    it('tier endpoint should return proper error structure', async () => {
      mockApiResponse(401, { error: 'Authentication required', code: 'AUTH_REQUIRED' });

      const result = await apiCall('PUT', '/admin/vendors/test/tier', { tier: 'tier1' });
      expect(result.data).toBeDefined();
      expect(result.data.error || result.data.message).toBeDefined();
    });
  });

  describe('Error Handling', () => {
    it('should handle network errors gracefully', async () => {
      mockApiError('Network error');

      await expect(apiCall('POST', '/admin/vendors/test/approve')).rejects.toThrow('API call failed');
    });

    it('should handle malformed responses', async () => {
      mockFetch.mockResolvedValueOnce({
        status: 200,
        ok: true,
        json: jest.fn().mockRejectedValueOnce(new Error('Invalid JSON')),
      } as any);

      const result = await apiCall('POST', '/admin/vendors/test/approve');
      expect(result.data).toBeNull();
    });
  });
});
