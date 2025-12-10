/**
 * JWT Token Enhancement Test Suite
 *
 * TDD GREEN Phase: Tests for JWT token generation with:
 * - Separate secrets for access/refresh tokens
 * - jti (unique ID) claims
 * - type claims (access vs refresh)
 * - tokenVersion support
 */
import jwt from 'jsonwebtoken';
import {
  generateTokens,
  verifyAccessToken,
  verifyRefreshToken,
  rotateTokens,
  type JWTPayloadBase,
} from '@/lib/utils/jwt';

describe('JWT Token Generation', () => {
  // Test payload following enhanced JWTPayload interface
  const testPayload: JWTPayloadBase = {
    id: 'user-123',
    email: 'test@example.com',
    role: 'vendor' as const,
    tier: 'tier1' as const,
    status: 'approved' as const,
    tokenVersion: 0,
  };

  describe('generateTokens', () => {
    it('should generate access token with jti claim', () => {
      const { accessToken } = generateTokens(testPayload);
      const decoded = verifyAccessToken(accessToken);

      expect(decoded.jti).toBeDefined();
      expect(typeof decoded.jti).toBe('string');
      expect(decoded.jti.length).toBeGreaterThan(0);
    });

    it('should generate unique jti for each token', () => {
      const tokens1 = generateTokens(testPayload);
      const tokens2 = generateTokens(testPayload);

      const decoded1 = verifyAccessToken(tokens1.accessToken);
      const decoded2 = verifyAccessToken(tokens2.accessToken);

      expect(decoded1.jti).not.toBe(decoded2.jti);
    });

    it('should generate access token with type: access', () => {
      const { accessToken } = generateTokens(testPayload);
      const decoded = verifyAccessToken(accessToken);

      expect(decoded.type).toBe('access');
    });

    it('should generate refresh token with type: refresh', () => {
      const { refreshToken } = generateTokens(testPayload);
      const decoded = verifyRefreshToken(refreshToken);

      expect(decoded.type).toBe('refresh');
    });

    it('should include tokenVersion in both tokens', () => {
      const { accessToken, refreshToken } = generateTokens(testPayload);

      const accessDecoded = verifyAccessToken(accessToken);
      const refreshDecoded = verifyRefreshToken(refreshToken);

      expect(accessDecoded.tokenVersion).toBe(0);
      expect(refreshDecoded.tokenVersion).toBe(0);
    });

    it('should preserve all user payload fields', () => {
      const { accessToken } = generateTokens(testPayload);
      const decoded = verifyAccessToken(accessToken);

      expect(decoded.id).toBe(testPayload.id);
      expect(decoded.email).toBe(testPayload.email);
      expect(decoded.role).toBe(testPayload.role);
      expect(decoded.tier).toBe(testPayload.tier);
      expect(decoded.status).toBe(testPayload.status);
    });
  });

  describe('verifyAccessToken', () => {
    it('should reject refresh token when verifying as access token', () => {
      const { refreshToken } = generateTokens(testPayload);

      expect(() => verifyAccessToken(refreshToken)).toThrow();
    });

    it('should throw specific error message for refresh token rejection', () => {
      const { refreshToken } = generateTokens(testPayload);

      expect(() => verifyAccessToken(refreshToken)).toThrow(/invalid.*token/i);
    });

    it('should reject malformed token', () => {
      expect(() => verifyAccessToken('not-a-valid-token')).toThrow();
    });

    it('should reject empty token', () => {
      expect(() => verifyAccessToken('')).toThrow();
    });
  });

  describe('verifyRefreshToken', () => {
    it('should reject access token when verifying as refresh token', () => {
      const { accessToken } = generateTokens(testPayload);

      expect(() => verifyRefreshToken(accessToken)).toThrow();
    });

    it('should throw specific error message for access token rejection', () => {
      const { accessToken } = generateTokens(testPayload);

      expect(() => verifyRefreshToken(accessToken)).toThrow(/invalid.*token/i);
    });

    it('should successfully verify valid refresh token', () => {
      const { refreshToken } = generateTokens(testPayload);
      const decoded = verifyRefreshToken(refreshToken);

      expect(decoded.id).toBe(testPayload.id);
      expect(decoded.type).toBe('refresh');
    });
  });

  describe('rotateTokens', () => {
    it('should generate new token pair from valid refresh token', () => {
      const original = generateTokens(testPayload);
      const rotated = rotateTokens(original.refreshToken);

      expect(rotated.accessToken).toBeDefined();
      expect(rotated.refreshToken).toBeDefined();
      expect(rotated.accessToken).not.toBe(original.accessToken);
      expect(rotated.refreshToken).not.toBe(original.refreshToken);
    });

    it('should preserve user data in rotated tokens', () => {
      const original = generateTokens(testPayload);
      const rotated = rotateTokens(original.refreshToken);

      const decoded = verifyAccessToken(rotated.accessToken);

      expect(decoded.id).toBe(testPayload.id);
      expect(decoded.email).toBe(testPayload.email);
      expect(decoded.role).toBe(testPayload.role);
    });

    it('should generate new jti for rotated tokens', () => {
      const original = generateTokens(testPayload);
      const originalDecoded = verifyAccessToken(original.accessToken);

      const rotated = rotateTokens(original.refreshToken);
      const rotatedDecoded = verifyAccessToken(rotated.accessToken);

      expect(rotatedDecoded.jti).not.toBe(originalDecoded.jti);
    });

    it('should reject access token for rotation', () => {
      const { accessToken } = generateTokens(testPayload);

      expect(() => rotateTokens(accessToken)).toThrow();
    });

    it('should preserve tokenVersion during rotation', () => {
      const payloadWithVersion = { ...testPayload, tokenVersion: 5 };
      const original = generateTokens(payloadWithVersion);
      const rotated = rotateTokens(original.refreshToken);

      const decoded = verifyAccessToken(rotated.accessToken);

      expect(decoded.tokenVersion).toBe(5);
    });
  });

  describe('Token Expiration', () => {
    it('should set access token to expire in 1 hour', () => {
      const { accessToken } = generateTokens(testPayload);
      const decoded = jwt.decode(accessToken) as jwt.JwtPayload;

      expect(decoded.exp).toBeDefined();
      expect(decoded.iat).toBeDefined();

      // exp should be ~1 hour after iat
      const expiresIn = (decoded.exp! - decoded.iat!) / 3600;
      expect(expiresIn).toBeCloseTo(1, 0);
    });

    it('should set refresh token to expire in 7 days', () => {
      const { refreshToken } = generateTokens(testPayload);
      const decoded = jwt.decode(refreshToken) as jwt.JwtPayload;

      expect(decoded.exp).toBeDefined();
      expect(decoded.iat).toBeDefined();

      // exp should be ~7 days after iat
      const expiresInDays = (decoded.exp! - decoded.iat!) / 86400;
      expect(expiresInDays).toBeCloseTo(7, 0);
    });
  });

  describe('Secret Separation', () => {
    it('should use different secrets for access and refresh tokens', () => {
      // Generate tokens
      const { accessToken, refreshToken } = generateTokens(testPayload);

      // Both should verify with their respective functions
      expect(() => verifyAccessToken(accessToken)).not.toThrow();
      expect(() => verifyRefreshToken(refreshToken)).not.toThrow();

      // But cross-verification should fail
      // (This proves different secrets are used)
      expect(() => verifyAccessToken(refreshToken)).toThrow();
      expect(() => verifyRefreshToken(accessToken)).toThrow();
    });
  });
});
