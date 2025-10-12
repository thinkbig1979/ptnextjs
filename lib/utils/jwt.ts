import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.PAYLOAD_SECRET || 'your-secret-key-here-minimum-32-characters';
const JWT_ACCESS_EXPIRY = '1h';
const JWT_REFRESH_EXPIRY = '7d';

export interface JWTPayload {
  id: string;
  email: string;
  role: 'admin' | 'vendor';
  tier?: 'free' | 'tier1' | 'tier2';
}

export interface TokenPair {
  accessToken: string;
  refreshToken: string;
}

/**
 * Generate access and refresh JWT tokens
 */
export function generateTokens(payload: JWTPayload): TokenPair {
  const accessToken = jwt.sign(payload, JWT_SECRET, {
    expiresIn: JWT_ACCESS_EXPIRY,
  });

  const refreshToken = jwt.sign(payload, JWT_SECRET, {
    expiresIn: JWT_REFRESH_EXPIRY,
  });

  return { accessToken, refreshToken };
}

/**
 * Verify and decode JWT token
 */
export function verifyToken(token: string): JWTPayload {
  try {
    return jwt.verify(token, JWT_SECRET) as JWTPayload;
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
 * Decode JWT token without verification (for debugging only)
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
 */
export function refreshAccessToken(refreshToken: string): string {
  const payload = verifyToken(refreshToken);

  // Generate new access token with same payload
  const accessToken = jwt.sign(
    {
      id: payload.id,
      email: payload.email,
      role: payload.role,
      tier: payload.tier,
    },
    JWT_SECRET,
    { expiresIn: JWT_ACCESS_EXPIRY }
  );

  return accessToken;
}
