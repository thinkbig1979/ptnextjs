import bcrypt from 'bcryptjs';
import { getPayload } from 'payload';
import config from '@/payload.config';
import { generateTokens, verifyToken, refreshAccessToken, type JWTPayload, type JWTPayloadBase, type LegacyJWTPayload, type TokenPair } from '@/lib/utils/jwt';

const BCRYPT_ROUNDS = 12;

export interface LoginResponse {
  user: {
    id: string;
    email: string;
    role: 'admin' | 'vendor';
    tier?: 'free' | 'tier1' | 'tier2';
    status?: 'pending' | 'approved' | 'rejected' | 'suspended';
  };
  tokens: TokenPair;
}

class AuthService {
  /**
   * Authenticate user with email and password
   */
  async login(email: string, password: string): Promise<LoginResponse> {
    try {
      const payload = await getPayload({ config });

      // Find user by email
      const users = await payload.find({
        collection: 'users',
        where: {
          email: {
            equals: email,
          },
        },
        limit: 1,
      });

      const user = users.docs[0];

      if (!user) {
        throw new Error('Invalid credentials');
      }

      // Verify password using Payload's login (which handles password verification)
      try {
        await payload.login({
          collection: 'users',
          data: {
            email,
            password,
          },
        });
      } catch (error) {
        throw new Error('Invalid credentials');
      }

      // Check if vendor account is approved
      if (user.role === 'vendor') {
        if (user.status === 'pending') {
          throw new Error('Account pending approval');
        }
        if (user.status === 'rejected') {
          throw new Error('Account has been rejected');
        }
        if (user.status === 'suspended') {
          throw new Error('Account has been suspended');
        }
        // Only 'approved' vendors can log in
        if (user.status !== 'approved') {
          throw new Error('Account not approved');
        }
      }

      // Get vendor tier if user is a vendor
      let tier: 'free' | 'tier1' | 'tier2' | undefined;
      if (user.role === 'vendor') {
        const vendors = await payload.find({
          collection: 'vendors',
          where: {
            user: {
              equals: user.id,
            },
          },
          limit: 1,
        });
        tier = vendors.docs[0]?.tier || 'free';
      }

      // Generate JWT tokens
      // Note: generateTokens accepts JWTPayloadBase (without type/jti) and adds those
      const jwtPayload: JWTPayloadBase = {
        id: user.id.toString(),
        email: user.email,
        role: user.role,
        tier,
        status: user.status,
        tokenVersion: 0, // TODO: Get from user.tokenVersion once field is added
      };

      const tokens = generateTokens(jwtPayload);

      return {
        user: {
          id: user.id.toString(),
          email: user.email,
          role: user.role,
          tier,
          status: user.status,
        },
        tokens,
      };
    } catch (error) {
      // Log authentication failures for security monitoring
      console.error('[AuthService] Login failed:', { email, error: error instanceof Error ? error.message : 'Unknown error' });
      throw error;
    }
  }

  /**
   * Validate JWT token and return decoded payload
   *
   * Note: Returns JWTPayload | LegacyJWTPayload to support both
   * new tokens with type/jti and legacy tokens without.
   */
  validateToken(token: string): JWTPayload | LegacyJWTPayload {
    return verifyToken(token);
  }

  /**
   * Refresh access token using refresh token
   */
  refreshToken(refreshToken: string): string {
    return refreshAccessToken(refreshToken);
  }

  /**
   * Hash password with bcrypt
   */
  async hashPassword(password: string): Promise<string> {
    // Validate password strength
    this.validatePasswordStrength(password);

    return bcrypt.hash(password, BCRYPT_ROUNDS);
  }

  /**
   * Compare plain password with hashed password
   */
  async comparePassword(plainPassword: string, hashedPassword: string): Promise<boolean> {
    return bcrypt.compare(plainPassword, hashedPassword);
  }

  /**
   * Check if user has permission to perform action on resource
   */
  async checkPermission(user: JWTPayload, action: string, resource: string): Promise<boolean> {
    // Admin has all permissions
    if (user.role === 'admin') {
      return true;
    }

    // Vendor permissions
    if (user.role === 'vendor') {
      // Vendors can read public resources
      if (action === 'read' && ['products', 'vendors', 'categories', 'blog-posts'].includes(resource)) {
        return true;
      }

      // Vendors can manage their own vendor profile
      if (['update', 'read'].includes(action) && resource === 'vendor') {
        return true;
      }

      // Tier2 vendors can create products
      if (action === 'create' && resource === 'products' && user.tier === 'tier2') {
        return true;
      }

      // Tier2 vendors can manage their own products
      if (['update', 'delete'].includes(action) && resource === 'products' && user.tier === 'tier2') {
        return true;
      }
    }

    return false;
  }

  /**
   * Validate password strength according to OWASP guidelines
   */
  validatePasswordStrength(password: string): void {
    if (password.length < 12) {
      throw new Error('Password must be at least 12 characters long');
    }

    const hasUpperCase = /[A-Z]/.test(password);
    const hasLowerCase = /[a-z]/.test(password);
    const hasNumber = /[0-9]/.test(password);
    const hasSpecialChar = /[!@#$%^&*(),.?":{}|<>]/.test(password);

    if (!hasUpperCase || !hasLowerCase || !hasNumber || !hasSpecialChar) {
      throw new Error('Password must contain uppercase, lowercase, number, and special character');
    }
  }
}

// Export singleton instance
export const authService = new AuthService();
export default authService;
