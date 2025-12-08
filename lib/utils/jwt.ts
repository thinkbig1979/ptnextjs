import jwt from 'jsonwebtoken';
import crypto from 'crypto';

// SECURITY: JWT_SECRET is validated at startup in payload.config.ts
// This file will only be imported after the validation passes
if (!process.env.PAYLOAD_SECRET) {
  throw new Error('PAYLOAD_SECRET environment variable is required');
}

// Separate secrets for access and refresh tokens
// Fallback to PAYLOAD_SECRET for backward compatibility
const JWT_ACCESS_SECRET = process.env.JWT_ACCESS_SECRET || process.env.PAYLOAD_SECRET;
const JWT_REFRESH_SECRET = process.env.JWT_REFRESH_SECRET ||
  (process.env.PAYLOAD_SECRET + '_refresh');

const JWT_ACCESS_EXPIRY = '1h';
const JWT_REFRESH_EXPIRY = '7d';

/**
 * Base JWT payload for user data (without token-specific fields)
 */
export interface JWTPayloadBase {
  id: string;
  email: string;
  role: 'admin' | 'vendor';
  tier?: 'free' | 'tier1' | 'tier2';
  status?: 'pending' | 'approved' | 'rejected' | 'suspended';
  tokenVersion: number;
}

/**
 * Full JWT payload including token-specific fields
 */
export interface JWTPayload extends JWTPayloadBase {
  type: 'access' | 'refresh';
  jti: string;
}

/**
 * Legacy payload interface for backward compatibility
 * @deprecated Use JWTPayloadBase instead
 */
export interface LegacyJWTPayload {
  id: string;
  email: string;
  role: 'admin' | 'vendor';
  tier?: 'free' | 'tier1' | 'tier2';
  status?: 'pending' | 'approved' | 'rejected' | 'suspended';
}

export interface TokenPair {
  accessToken: string;
  refreshToken: string;
}

/**
 * Generate a unique token ID (jti) using crypto.randomUUID
 */
function generateJti(): string {
  return crypto.randomUUID();
}

/**
 * Generate access and refresh JWT tokens with enhanced security
 *
 * Enhancements:
 * - Separate secrets for access and refresh tokens
 * - jti (unique ID) claim for each token
 * - type claim to distinguish access vs refresh tokens
 * - tokenVersion support for token invalidation
 */
export function generateTokens(payload: JWTPayloadBase | LegacyJWTPayload): TokenPair {
  // Ensure tokenVersion is set (default to 0 for backward compatibility)
  const tokenVersion = 'tokenVersion' in payload ? payload.tokenVersion : 0;

  // Generate unique JTIs for each token
  const accessJti = generateJti();
  const refreshJti = generateJti();

  // Build access token payload
  const accessPayload: JWTPayload = {
    id: payload.id,
    email: payload.email,
    role: payload.role,
    tier: payload.tier,
    status: payload.status,
    tokenVersion,
    type: 'access',
    jti: accessJti,
  };

  // Build refresh token payload
  const refreshPayload: JWTPayload = {
    id: payload.id,
    email: payload.email,
    role: payload.role,
    tier: payload.tier,
    status: payload.status,
    tokenVersion,
    type: 'refresh',
    jti: refreshJti,
  };

  // Sign with separate secrets
  const accessToken = jwt.sign(accessPayload, JWT_ACCESS_SECRET, {
    expiresIn: JWT_ACCESS_EXPIRY,
  });

  const refreshToken = jwt.sign(refreshPayload, JWT_REFRESH_SECRET, {
    expiresIn: JWT_REFRESH_EXPIRY,
  });

  return { accessToken, refreshToken };
}

/**
 * Verify and decode an access token
 *
 * @throws Error if token is invalid, expired, or not an access token
 */
export function verifyAccessToken(token: string): JWTPayload {
  if (!token) {
    throw new Error('Invalid token');
  }

  try {
    const decoded = jwt.verify(token, JWT_ACCESS_SECRET) as JWTPayload;

    // Verify this is an access token
    if (decoded.type !== 'access') {
      throw new Error('Invalid token type');
    }

    return decoded;
  } catch (error) {
    if (error instanceof jwt.TokenExpiredError) {
      throw new Error('Token expired');
    }
    if (error instanceof jwt.JsonWebTokenError) {
      throw new Error('Invalid token');
    }
    if (error instanceof Error && error.message === 'Invalid token type') {
      throw error;
    }
    throw new Error('Token verification failed');
  }
}

/**
 * Verify and decode a refresh token
 *
 * @throws Error if token is invalid, expired, or not a refresh token
 */
export function verifyRefreshToken(token: string): JWTPayload {
  if (!token) {
    throw new Error('Invalid token');
  }

  try {
    const decoded = jwt.verify(token, JWT_REFRESH_SECRET) as JWTPayload;

    // Verify this is a refresh token
    if (decoded.type !== 'refresh') {
      throw new Error('Invalid token type');
    }

    return decoded;
  } catch (error) {
    if (error instanceof jwt.TokenExpiredError) {
      throw new Error('Token expired');
    }
    if (error instanceof jwt.JsonWebTokenError) {
      throw new Error('Invalid token');
    }
    if (error instanceof Error && error.message === 'Invalid token type') {
      throw error;
    }
    throw new Error('Token verification failed');
  }
}

/**
 * Rotate tokens: generate new access and refresh tokens from a valid refresh token
 *
 * This implements refresh token rotation where both tokens are replaced
 * on each refresh, improving security against token theft.
 *
 * @throws Error if refresh token is invalid
 */
export function rotateTokens(refreshToken: string): TokenPair {
  // Verify the refresh token (will throw if invalid or not a refresh token)
  const decoded = verifyRefreshToken(refreshToken);

  // Generate new token pair with same user data
  return generateTokens({
    id: decoded.id,
    email: decoded.email,
    role: decoded.role,
    tier: decoded.tier,
    status: decoded.status,
    tokenVersion: decoded.tokenVersion,
  });
}

/**
 * Verify and decode JWT token (generic version)
 *
 * @deprecated Use verifyAccessToken or verifyRefreshToken for type safety
 *
 * NOTE: This function uses the ACCESS secret for backward compatibility.
 * New code should use the specific verify functions.
 */
export function verifyToken(token: string): JWTPayload | LegacyJWTPayload {
  try {
    return jwt.verify(token, JWT_ACCESS_SECRET) as JWTPayload;
  } catch (error) {
    if (error instanceof jwt.TokenExpiredError) {
      throw new Error('Token expired');
    }
    if (error instanceof jwt.JsonWebTokenError) {
      throw new Error('Invalid token');
    }
    throw new Error('Token verification failed');
  }
}

/**
 * Decode JWT token without verification (for logging/debugging only)
 *
 * WARNING: Do not use the returned data for authentication decisions!
 * This function does not verify the token signature.
 */
export function decodeToken(token: string): JWTPayload | null {
  try {
    return jwt.decode(token) as JWTPayload;
  } catch {
    return null;
  }
}

/**
 * Generate new access token from refresh token
 *
 * @deprecated Use rotateTokens instead for full token rotation
 *
 * NOTE: This function is kept for backward compatibility but
 * new code should use rotateTokens() which rotates both tokens.
 */
export function refreshAccessToken(refreshToken: string): string {
  // For backward compatibility, we try both secrets
  // First try as a refresh token (new format)
  try {
    const decoded = verifyRefreshToken(refreshToken);
    const tokens = generateTokens({
      id: decoded.id,
      email: decoded.email,
      role: decoded.role,
      tier: decoded.tier,
      status: decoded.status,
      tokenVersion: decoded.tokenVersion,
    });
    return tokens.accessToken;
  } catch {
    // Fall back to legacy behavior (same secret for both)
    // This handles tokens generated before the security enhancement
    try {
      const payload = jwt.verify(refreshToken, JWT_ACCESS_SECRET) as JWTPayload | LegacyJWTPayload;

      const accessToken = jwt.sign(
        {
          id: payload.id,
          email: payload.email,
          role: payload.role,
          tier: payload.tier,
          status: payload.status,
          tokenVersion: 'tokenVersion' in payload ? payload.tokenVersion : 0,
          type: 'access',
          jti: generateJti(),
        },
        JWT_ACCESS_SECRET,
        { expiresIn: JWT_ACCESS_EXPIRY }
      );

      return accessToken;
    } catch (error) {
      if (error instanceof jwt.TokenExpiredError) {
        throw new Error('Token expired');
      }
      throw new Error('Invalid token');
    }
  }
}
