/**
 * @jest-environment node
 */

import jwt from 'jsonwebtoken';
import {
  generateTokens,
  verifyToken,
  refreshAccessToken,
  decodeToken,
  type JWTPayload,
} from '@/lib/utils/jwt';
import { MOCK_ADMIN_JWT_PAYLOAD, MOCK_VENDOR_TIER2_JWT_PAYLOAD } from '@/__tests__/fixtures/users';

// Use test JWT secret
const JWT_SECRET = process.env.PAYLOAD_SECRET || 'your-secret-key-here-minimum-32-characters';

describe('JWT Utilities', () => {
  describe('generateTokens()', () => {
    it('should generate access token and refresh token', () => {
      // Act
      const tokens = generateTokens(MOCK_ADMIN_JWT_PAYLOAD);

      // Assert
      expect(tokens).toHaveProperty('accessToken');
      expect(tokens).toHaveProperty('refreshToken');
      expect(typeof tokens.accessToken).toBe('string');
      expect(typeof tokens.refreshToken).toBe('string');
    });

    it('should generate access token with 1 hour expiry', () => {
      // Act
      const tokens = generateTokens(MOCK_ADMIN_JWT_PAYLOAD);

      // Assert
      const decoded = jwt.decode(tokens.accessToken) as any;
      const expiryTime = decoded.exp - decoded.iat;
      expect(expiryTime).toBe(3600); // 1 hour = 3600 seconds
    });

    it('should generate refresh token with 7 day expiry', () => {
      // Act
      const tokens = generateTokens(MOCK_ADMIN_JWT_PAYLOAD);

      // Assert
      const decoded = jwt.decode(tokens.refreshToken) as any;
      const expiryTime = decoded.exp - decoded.iat;
      expect(expiryTime).toBe(604800); // 7 days = 604800 seconds
    });

    it('should include correct payload in access token', () => {
      // Act
      const tokens = generateTokens(MOCK_ADMIN_JWT_PAYLOAD);

      // Assert
      const decoded = jwt.verify(tokens.accessToken, JWT_SECRET) as JWTPayload;
      expect(decoded.id).toBe(MOCK_ADMIN_JWT_PAYLOAD.id);
      expect(decoded.email).toBe(MOCK_ADMIN_JWT_PAYLOAD.email);
      expect(decoded.role).toBe(MOCK_ADMIN_JWT_PAYLOAD.role);
    });

    it('should include correct payload in refresh token', () => {
      // Act
      const tokens = generateTokens(MOCK_VENDOR_TIER2_JWT_PAYLOAD);

      // Assert
      const decoded = jwt.verify(tokens.refreshToken, JWT_SECRET) as JWTPayload;
      expect(decoded.id).toBe(MOCK_VENDOR_TIER2_JWT_PAYLOAD.id);
      expect(decoded.email).toBe(MOCK_VENDOR_TIER2_JWT_PAYLOAD.email);
      expect(decoded.role).toBe(MOCK_VENDOR_TIER2_JWT_PAYLOAD.role);
      expect(decoded.tier).toBe(MOCK_VENDOR_TIER2_JWT_PAYLOAD.tier);
    });

    it('should generate valid JWT format tokens', () => {
      // Act
      const tokens = generateTokens(MOCK_ADMIN_JWT_PAYLOAD);

      // Assert
      const accessTokenParts = tokens.accessToken.split('.');
      const refreshTokenParts = tokens.refreshToken.split('.');
      expect(accessTokenParts.length).toBe(3); // header.payload.signature
      expect(refreshTokenParts.length).toBe(3);
    });

    it('should generate different tokens for same payload (due to timestamps)', () => {
      // Act
      const tokens1 = generateTokens(MOCK_ADMIN_JWT_PAYLOAD);
      // Wait a bit to ensure different iat timestamps
      const tokens2 = generateTokens(MOCK_ADMIN_JWT_PAYLOAD);

      // Assert
      expect(tokens1.accessToken).not.toBe(tokens2.accessToken);
      expect(tokens1.refreshToken).not.toBe(tokens2.refreshToken);
    });
  });

  describe('verifyToken()', () => {
    it('should return decoded payload for valid token', () => {
      // Arrange
      const tokens = generateTokens(MOCK_ADMIN_JWT_PAYLOAD);

      // Act
      const result = verifyToken(tokens.accessToken);

      // Assert
      expect(result.id).toBe(MOCK_ADMIN_JWT_PAYLOAD.id);
      expect(result.email).toBe(MOCK_ADMIN_JWT_PAYLOAD.email);
      expect(result.role).toBe(MOCK_ADMIN_JWT_PAYLOAD.role);
    });

    it('should verify vendor token with tier information', () => {
      // Arrange
      const tokens = generateTokens(MOCK_VENDOR_TIER2_JWT_PAYLOAD);

      // Act
      const result = verifyToken(tokens.accessToken);

      // Assert
      expect(result.tier).toBe('tier2');
      expect(result.role).toBe('vendor');
    });

    it('should throw "Token expired" error for expired token', () => {
      // Arrange
      const expiredToken = jwt.sign(MOCK_ADMIN_JWT_PAYLOAD, JWT_SECRET, { expiresIn: '-1h' });

      // Act & Assert
      expect(() => verifyToken(expiredToken)).toThrow('Token expired');
    });

    it('should throw "Invalid token" error for malformed token', () => {
      // Act & Assert
      expect(() => verifyToken('invalid.token.format')).toThrow('Invalid token');
    });

    it('should throw "Invalid token" error for token with wrong signature', () => {
      // Arrange
      const validToken = jwt.sign(MOCK_ADMIN_JWT_PAYLOAD, JWT_SECRET);
      const parts = validToken.split('.');
      const tamperedToken = `${parts[0]}.${parts[1]}.wrongsignature`;

      // Act & Assert
      expect(() => verifyToken(tamperedToken)).toThrow('Invalid token');
    });

    it('should throw "Invalid token" error for empty token', () => {
      // Act & Assert
      expect(() => verifyToken('')).toThrow('Invalid token');
    });

    it('should throw error for token signed with wrong secret', () => {
      // Arrange
      const wrongToken = jwt.sign(MOCK_ADMIN_JWT_PAYLOAD, 'wrong-secret-key');

      // Act & Assert
      expect(() => verifyToken(wrongToken)).toThrow('Invalid token');
    });
  });

  describe('decodeToken()', () => {
    it('should decode valid token without verification', () => {
      // Arrange
      const tokens = generateTokens(MOCK_ADMIN_JWT_PAYLOAD);

      // Act
      const result = decodeToken(tokens.accessToken);

      // Assert
      expect(result).not.toBeNull();
      expect(result?.id).toBe(MOCK_ADMIN_JWT_PAYLOAD.id);
      expect(result?.email).toBe(MOCK_ADMIN_JWT_PAYLOAD.email);
    });

    it('should decode expired token (without verification)', () => {
      // Arrange
      const expiredToken = jwt.sign(MOCK_ADMIN_JWT_PAYLOAD, JWT_SECRET, { expiresIn: '-1h' });

      // Act
      const result = decodeToken(expiredToken);

      // Assert
      expect(result).not.toBeNull();
      expect(result?.id).toBe(MOCK_ADMIN_JWT_PAYLOAD.id);
    });

    it('should return null for invalid token', () => {
      // Act
      const result = decodeToken('invalid-token');

      // Assert
      expect(result).toBeNull();
    });

    it('should return null for empty token', () => {
      // Act
      const result = decodeToken('');

      // Assert
      expect(result).toBeNull();
    });
  });

  describe('refreshAccessToken()', () => {
    it('should generate new access token from valid refresh token', () => {
      // Arrange
      const tokens = generateTokens(MOCK_ADMIN_JWT_PAYLOAD);

      // Act
      const newAccessToken = refreshAccessToken(tokens.refreshToken);

      // Assert
      expect(newAccessToken).toBeDefined();
      expect(typeof newAccessToken).toBe('string');
      expect(newAccessToken).not.toBe(tokens.accessToken);
    });

    it('should preserve user payload in new access token', () => {
      // Arrange
      const tokens = generateTokens(MOCK_VENDOR_TIER2_JWT_PAYLOAD);

      // Act
      const newAccessToken = refreshAccessToken(tokens.refreshToken);

      // Assert
      const decoded = verifyToken(newAccessToken);
      expect(decoded.id).toBe(MOCK_VENDOR_TIER2_JWT_PAYLOAD.id);
      expect(decoded.email).toBe(MOCK_VENDOR_TIER2_JWT_PAYLOAD.email);
      expect(decoded.role).toBe(MOCK_VENDOR_TIER2_JWT_PAYLOAD.role);
      expect(decoded.tier).toBe(MOCK_VENDOR_TIER2_JWT_PAYLOAD.tier);
    });

    it('should generate new access token with 1 hour expiry', () => {
      // Arrange
      const tokens = generateTokens(MOCK_ADMIN_JWT_PAYLOAD);

      // Act
      const newAccessToken = refreshAccessToken(tokens.refreshToken);

      // Assert
      const decoded = jwt.decode(newAccessToken) as any;
      const expiryTime = decoded.exp - decoded.iat;
      expect(expiryTime).toBe(3600); // 1 hour
    });

    it('should throw error for expired refresh token', () => {
      // Arrange
      const expiredRefreshToken = jwt.sign(MOCK_ADMIN_JWT_PAYLOAD, JWT_SECRET, { expiresIn: '-7d' });

      // Act & Assert
      expect(() => refreshAccessToken(expiredRefreshToken)).toThrow('Token expired');
    });

    it('should throw error for invalid refresh token', () => {
      // Act & Assert
      expect(() => refreshAccessToken('invalid-refresh-token')).toThrow('Invalid token');
    });

    it('should throw error for tampered refresh token', () => {
      // Arrange
      const tokens = generateTokens(MOCK_ADMIN_JWT_PAYLOAD);
      const parts = tokens.refreshToken.split('.');
      const tamperedToken = `${parts[0]}.${parts[1]}.tampered`;

      // Act & Assert
      expect(() => refreshAccessToken(tamperedToken)).toThrow('Invalid token');
    });
  });
});
