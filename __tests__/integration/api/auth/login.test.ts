/**
 * Integration tests for POST /api/auth/login endpoint
 * Tests the full authentication flow including JWT generation and cookie setting
 */

import { NextRequest } from 'next/server';
import { POST } from '@/app/api/auth/login/route';
import { authService } from '@/lib/services/auth-service';
import {
  MOCK_ADMIN_USER,
  MOCK_VENDOR_TIER2,
  MOCK_VENDOR_FREE,
  MOCK_VENDOR_PENDING,
  MOCK_VENDOR_REJECTED,
  TEST_PASSWORDS,
} from '@/__tests__/fixtures/users';

// Mock AuthService
jest.mock('@/lib/services/auth-service', () => ({
  authService: {
    login: jest.fn(),
  },
}));

const mockLogin = authService.login as jest.MockedFunction<typeof authService.login>;

describe('POST /api/auth/login - Integration Tests', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Successful Login', () => {
    it('should return 200 with user and message on successful admin login', async () => {
      // Arrange
      mockLogin.mockResolvedValue({
        user: {
          id: MOCK_ADMIN_USER.id,
          email: MOCK_ADMIN_USER.email,
          role: 'admin',
          tier: undefined,
        },
        tokens: {
          accessToken: 'mock-access-token',
          refreshToken: 'mock-refresh-token',
        },
      });

      const request = new NextRequest('http://localhost:3000/api/auth/login', {
        method: 'POST',
        body: JSON.stringify({
          email: MOCK_ADMIN_USER.email,
          password: TEST_PASSWORDS.ADMIN,
        }),
      });

      // Act
      const response = await POST(request);
      const data = await response.json();

      // Assert
      expect(response.status).toBe(200);
      expect(data).toEqual({
        user: {
          id: MOCK_ADMIN_USER.id,
          email: MOCK_ADMIN_USER.email,
          role: 'admin',
          tier: undefined,
        },
        message: 'Login successful',
      });
      expect(mockLogin).toHaveBeenCalledWith(MOCK_ADMIN_USER.email, TEST_PASSWORDS.ADMIN);
    });

    it('should return user with tier information for vendor login', async () => {
      // Arrange
      mockLogin.mockResolvedValue({
        user: {
          id: MOCK_VENDOR_TIER2.id,
          email: MOCK_VENDOR_TIER2.email,
          role: 'vendor',
          tier: 'tier2',
        },
        tokens: {
          accessToken: 'mock-access-token-vendor',
          refreshToken: 'mock-refresh-token-vendor',
        },
      });

      const request = new NextRequest('http://localhost:3000/api/auth/login', {
        method: 'POST',
        body: JSON.stringify({
          email: MOCK_VENDOR_TIER2.email,
          password: TEST_PASSWORDS.VENDOR_TIER2,
        }),
      });

      // Act
      const response = await POST(request);
      const data = await response.json();

      // Assert
      expect(response.status).toBe(200);
      expect(data.user.role).toBe('vendor');
      expect(data.user.tier).toBe('tier2');
    });

    it('should set httpOnly cookie with access token', async () => {
      // Arrange
      mockLogin.mockResolvedValue({
        user: {
          id: MOCK_ADMIN_USER.id,
          email: MOCK_ADMIN_USER.email,
          role: 'admin',
          tier: undefined,
        },
        tokens: {
          accessToken: 'test-access-token',
          refreshToken: 'test-refresh-token',
        },
      });

      const request = new NextRequest('http://localhost:3000/api/auth/login', {
        method: 'POST',
        body: JSON.stringify({
          email: MOCK_ADMIN_USER.email,
          password: TEST_PASSWORDS.ADMIN,
        }),
      });

      // Act
      const response = await POST(request);

      // Assert
      const setCookieHeaders = response.headers.getSetCookie();
      const accessTokenCookie = setCookieHeaders.find((cookie) => cookie.startsWith('access_token='));

      expect(accessTokenCookie).toBeDefined();
      expect(accessTokenCookie).toContain('test-access-token');
      expect(accessTokenCookie).toContain('HttpOnly');
      expect(accessTokenCookie).toContain('SameSite=Strict');
      expect(accessTokenCookie).toContain('Path=/');
    });

    it('should set httpOnly cookie with refresh token', async () => {
      // Arrange
      mockLogin.mockResolvedValue({
        user: {
          id: MOCK_VENDOR_FREE.id,
          email: MOCK_VENDOR_FREE.email,
          role: 'vendor',
          tier: 'free',
        },
        tokens: {
          accessToken: 'test-access-token',
          refreshToken: 'test-refresh-token',
        },
      });

      const request = new NextRequest('http://localhost:3000/api/auth/login', {
        method: 'POST',
        body: JSON.stringify({
          email: MOCK_VENDOR_FREE.email,
          password: TEST_PASSWORDS.VENDOR_FREE,
        }),
      });

      // Act
      const response = await POST(request);

      // Assert
      const setCookieHeaders = response.headers.getSetCookie();
      const refreshTokenCookie = setCookieHeaders.find((cookie) => cookie.startsWith('refresh_token='));

      expect(refreshTokenCookie).toBeDefined();
      expect(refreshTokenCookie).toContain('test-refresh-token');
      expect(refreshTokenCookie).toContain('HttpOnly');
    });

    it('should set access token cookie with 1 hour max age', async () => {
      // Arrange
      mockLogin.mockResolvedValue({
        user: {
          id: MOCK_ADMIN_USER.id,
          email: MOCK_ADMIN_USER.email,
          role: 'admin',
          tier: undefined,
        },
        tokens: {
          accessToken: 'test-access-token',
          refreshToken: 'test-refresh-token',
        },
      });

      const request = new NextRequest('http://localhost:3000/api/auth/login', {
        method: 'POST',
        body: JSON.stringify({
          email: MOCK_ADMIN_USER.email,
          password: TEST_PASSWORDS.ADMIN,
        }),
      });

      // Act
      const response = await POST(request);

      // Assert
      const setCookieHeaders = response.headers.getSetCookie();
      const accessTokenCookie = setCookieHeaders.find((cookie) => cookie.startsWith('access_token='));

      expect(accessTokenCookie).toContain('Max-Age=3600'); // 1 hour = 3600 seconds
    });

    it('should set refresh token cookie with 7 day max age', async () => {
      // Arrange
      mockLogin.mockResolvedValue({
        user: {
          id: MOCK_ADMIN_USER.id,
          email: MOCK_ADMIN_USER.email,
          role: 'admin',
          tier: undefined,
        },
        tokens: {
          accessToken: 'test-access-token',
          refreshToken: 'test-refresh-token',
        },
      });

      const request = new NextRequest('http://localhost:3000/api/auth/login', {
        method: 'POST',
        body: JSON.stringify({
          email: MOCK_ADMIN_USER.email,
          password: TEST_PASSWORDS.ADMIN,
        }),
      });

      // Act
      const response = await POST(request);

      // Assert
      const setCookieHeaders = response.headers.getSetCookie();
      const refreshTokenCookie = setCookieHeaders.find((cookie) => cookie.startsWith('refresh_token='));

      expect(refreshTokenCookie).toContain('Max-Age=604800'); // 7 days = 604800 seconds
    });
  });

  describe('Invalid Credentials', () => {
    it('should return 401 for invalid email', async () => {
      // Arrange
      mockLogin.mockRejectedValue(new Error('Invalid credentials'));

      const request = new NextRequest('http://localhost:3000/api/auth/login', {
        method: 'POST',
        body: JSON.stringify({
          email: 'nonexistent@example.com',
          password: 'AnyPassword123!@#',
        }),
      });

      // Act
      const response = await POST(request);
      const data = await response.json();

      // Assert
      expect(response.status).toBe(401);
      expect(data.error).toBe('Invalid credentials');
    });

    it('should return 401 for invalid password', async () => {
      // Arrange
      mockLogin.mockRejectedValue(new Error('Invalid credentials'));

      const request = new NextRequest('http://localhost:3000/api/auth/login', {
        method: 'POST',
        body: JSON.stringify({
          email: MOCK_ADMIN_USER.email,
          password: 'WrongPassword123!@#',
        }),
      });

      // Act
      const response = await POST(request);
      const data = await response.json();

      // Assert
      expect(response.status).toBe(401);
      expect(data.error).toBe('Invalid credentials');
    });
  });

  describe('Pending/Rejected Vendor', () => {
    it('should return 401 for pending vendor', async () => {
      // Arrange
      mockLogin.mockRejectedValue(new Error('Account pending approval'));

      const request = new NextRequest('http://localhost:3000/api/auth/login', {
        method: 'POST',
        body: JSON.stringify({
          email: MOCK_VENDOR_PENDING.email,
          password: TEST_PASSWORDS.PENDING,
        }),
      });

      // Act
      const response = await POST(request);
      const data = await response.json();

      // Assert
      expect(response.status).toBe(401);
      expect(data.error).toBe('Account pending approval');
    });

    it('should return 401 for rejected vendor', async () => {
      // Arrange
      mockLogin.mockRejectedValue(new Error('Account pending approval'));

      const request = new NextRequest('http://localhost:3000/api/auth/login', {
        method: 'POST',
        body: JSON.stringify({
          email: MOCK_VENDOR_REJECTED.email,
          password: TEST_PASSWORDS.REJECTED,
        }),
      });

      // Act
      const response = await POST(request);
      const data = await response.json();

      // Assert
      expect(response.status).toBe(401);
      expect(data.error).toBe('Account pending approval');
    });
  });

  describe('Input Validation', () => {
    it('should return 400 when email is missing', async () => {
      // Arrange
      const request = new NextRequest('http://localhost:3000/api/auth/login', {
        method: 'POST',
        body: JSON.stringify({
          password: 'SomePassword123!@#',
        }),
      });

      // Act
      const response = await POST(request);
      const data = await response.json();

      // Assert
      expect(response.status).toBe(400);
      expect(data.error).toBe('Email and password are required');
      expect(mockLogin).not.toHaveBeenCalled();
    });

    it('should return 400 when password is missing', async () => {
      // Arrange
      const request = new NextRequest('http://localhost:3000/api/auth/login', {
        method: 'POST',
        body: JSON.stringify({
          email: 'test@example.com',
        }),
      });

      // Act
      const response = await POST(request);
      const data = await response.json();

      // Assert
      expect(response.status).toBe(400);
      expect(data.error).toBe('Email and password are required');
      expect(mockLogin).not.toHaveBeenCalled();
    });

    it('should return 400 when both email and password are missing', async () => {
      // Arrange
      const request = new NextRequest('http://localhost:3000/api/auth/login', {
        method: 'POST',
        body: JSON.stringify({}),
      });

      // Act
      const response = await POST(request);
      const data = await response.json();

      // Assert
      expect(response.status).toBe(400);
      expect(data.error).toBe('Email and password are required');
    });

    it('should return 400 when email is empty string', async () => {
      // Arrange
      const request = new NextRequest('http://localhost:3000/api/auth/login', {
        method: 'POST',
        body: JSON.stringify({
          email: '',
          password: 'SomePassword123!@#',
        }),
      });

      // Act
      const response = await POST(request);
      const data = await response.json();

      // Assert
      expect(response.status).toBe(400);
      expect(data.error).toBe('Email and password are required');
    });

    it('should return 400 when password is empty string', async () => {
      // Arrange
      const request = new NextRequest('http://localhost:3000/api/auth/login', {
        method: 'POST',
        body: JSON.stringify({
          email: 'test@example.com',
          password: '',
        }),
      });

      // Act
      const response = await POST(request);
      const data = await response.json();

      // Assert
      expect(response.status).toBe(400);
      expect(data.error).toBe('Email and password are required');
    });
  });

  describe('Error Handling', () => {
    it('should return 500 for unexpected errors', async () => {
      // Arrange
      mockLogin.mockRejectedValue(new Error('Database connection failed'));

      const request = new NextRequest('http://localhost:3000/api/auth/login', {
        method: 'POST',
        body: JSON.stringify({
          email: MOCK_ADMIN_USER.email,
          password: TEST_PASSWORDS.ADMIN,
        }),
      });

      // Act
      const response = await POST(request);
      const data = await response.json();

      // Assert
      expect(response.status).toBe(500);
      expect(data.error).toBe('Internal server error');
    });

    it('should handle non-Error exceptions gracefully', async () => {
      // Arrange
      mockLogin.mockRejectedValue('String error');

      const request = new NextRequest('http://localhost:3000/api/auth/login', {
        method: 'POST',
        body: JSON.stringify({
          email: MOCK_ADMIN_USER.email,
          password: TEST_PASSWORDS.ADMIN,
        }),
      });

      // Act
      const response = await POST(request);
      const data = await response.json();

      // Assert
      expect(response.status).toBe(500);
      expect(data.error).toBe('Internal server error');
    });
  });

  describe('Security', () => {
    it('should not leak sensitive information in error messages', async () => {
      // Arrange
      mockLogin.mockRejectedValue(new Error('Invalid credentials'));

      const request = new NextRequest('http://localhost:3000/api/auth/login', {
        method: 'POST',
        body: JSON.stringify({
          email: 'nonexistent@example.com',
          password: 'WrongPassword123!@#',
        }),
      });

      // Act
      const response = await POST(request);
      const data = await response.json();

      // Assert
      expect(data.error).toBe('Invalid credentials');
      expect(data.error).not.toContain('does not exist');
      expect(data.error).not.toContain('password');
    });

    it('should set secure flag in production environment', async () => {
      // Arrange
      const originalEnv = process.env.NODE_ENV;
      process.env.NODE_ENV = 'production';

      mockLogin.mockResolvedValue({
        user: {
          id: MOCK_ADMIN_USER.id,
          email: MOCK_ADMIN_USER.email,
          role: 'admin',
          tier: undefined,
        },
        tokens: {
          accessToken: 'test-access-token',
          refreshToken: 'test-refresh-token',
        },
      });

      const request = new NextRequest('http://localhost:3000/api/auth/login', {
        method: 'POST',
        body: JSON.stringify({
          email: MOCK_ADMIN_USER.email,
          password: TEST_PASSWORDS.ADMIN,
        }),
      });

      // Act
      const response = await POST(request);

      // Assert
      const setCookieHeaders = response.headers.getSetCookie();
      const accessTokenCookie = setCookieHeaders.find((cookie) => cookie.startsWith('access_token='));

      expect(accessTokenCookie).toContain('Secure');

      // Cleanup
      process.env.NODE_ENV = originalEnv;
    });
  });
});
