# Pre-1 Analysis: Existing Auth Implementation

## Analysis Date: 2025-12-08

## 1. Current JWT Secret Configuration

**Location**: `lib/utils/jwt.ts`

- Single secret: `PAYLOAD_SECRET` (env variable)
- Same secret used for BOTH access and refresh tokens
- Fallback: throws error if PAYLOAD_SECRET not set

**Issue**: No separation between access and refresh token secrets

## 2. Current Token Payload Structure

```typescript
// lib/utils/jwt.ts (lines 13-19)
export interface JWTPayload {
  id: string;
  email: string;
  role: 'admin' | 'vendor';
  tier?: 'free' | 'tier1' | 'tier2';
  status?: 'pending' | 'approved' | 'rejected' | 'suspended';
}
```

**Missing Fields**:
- `tokenVersion` - Not implemented
- `type` - No access/refresh differentiation
- `jti` - No unique token ID

## 3. Auth Utility Locations & Overlap

| File | Purpose | Token Source | Overlap |
|------|---------|--------------|---------|
| `lib/utils/jwt.ts` | Core JWT operations | N/A | Base implementation |
| `lib/services/auth-service.ts` | High-level auth operations | Uses jwt.ts | Wrapper |
| `lib/middleware/auth-middleware.ts` | Request middleware | `Authorization` header or `access_token` cookie | Uses auth-service |
| `lib/middleware/vendor-portal-auth.ts` | Vendor portal auth | `Authorization` header or `access_token` cookie | Uses auth-service |
| `lib/utils/admin-auth.ts` | Admin authentication | `payload-token`, `access_token`, or `Authorization` | Uses Payload CMS auth |
| `middleware.ts` | Next.js edge middleware | `access_token` cookie only | Basic check only |

**Observation**: Multiple token sources but no unified module

## 4. Cookie Configuration

| Cookie Name | Used In | Attributes |
|-------------|---------|------------|
| `access_token` | Login, Middleware, Portal | httpOnly, secure(prod), sameSite=strict, maxAge=3600 |
| `refresh_token` | Login, Refresh | httpOnly, secure(prod), sameSite=strict, maxAge=604800 |
| `payload-token` | Admin auth (Payload CMS) | Set by Payload |

## 5. Token Generation Locations

| Location | Function | Notes |
|----------|----------|-------|
| `lib/utils/jwt.ts:29-38` | `generateTokens()` | Generates both access and refresh |
| `lib/utils/jwt.ts:72-88` | `refreshAccessToken()` | Generates new access from refresh |
| `lib/services/auth-service.ts:98` | Uses `generateTokens()` | Wrapper call |

## 6. Token Verification Locations

| Location | Function | Notes |
|----------|----------|-------|
| `lib/utils/jwt.ts:44-56` | `verifyToken()` | Generic verify |
| `lib/services/auth-service.ts:120-122` | `validateToken()` | Wrapper call |
| `lib/middleware/auth-middleware.ts:42` | Uses `validateToken()` | Via auth-service |
| `lib/middleware/vendor-portal-auth.ts:85` | Uses `validateToken()` | Via auth-service |
| `lib/utils/admin-auth.ts:93` | Uses Payload auth | Different path |

**Critical Issue**: No distinction between access/refresh token verification

## 7. Users Collection Schema

**Location**: `payload/collections/Users.ts`

**Current Fields**:
- `email` (from Payload auth)
- `password` (from Payload auth)
- `role`: 'admin' | 'vendor'
- `status`: 'pending' | 'approved' | 'rejected' | 'suspended'
- `rejectionReason`: textarea
- `approvedAt`: date
- `rejectedAt`: date
- `createdAt`, `updatedAt` (timestamps)

**Missing Field**: `tokenVersion` - required for token invalidation

## 8. API Routes Requiring Updates

| Route | Current Auth | Needs Update |
|-------|--------------|--------------|
| `/api/auth/login` | Uses `authService.login()` | Add audit logging, use unified module |
| `/api/auth/logout` | Clears cookies | Add audit logging |
| `/api/auth/refresh` | Uses `refreshAccessToken()` | Use new rotation, add audit logging |
| `/api/auth/me` | Unknown | Check and update |

## 9. Next.js Middleware (middleware.ts)

**Current Behavior**:
- Protects `/vendor/dashboard/*` routes
- Only checks for `access_token` cookie existence (no validation)
- Applies security headers to custom API routes
- HSTS is commented out

**Gaps**:
- No token validation at middleware level
- HSTS header not enabled

## 10. Summary of Required Changes

### High Priority
1. Add `tokenVersion` field to Users collection
2. Add separate JWT secrets (`JWT_ACCESS_SECRET`, `JWT_REFRESH_SECRET`)
3. Add `type`, `jti`, `tokenVersion` claims to tokens
4. Create `verifyAccessToken()` and `verifyRefreshToken()` functions
5. Create `AuditLogs` collection

### Medium Priority
1. Implement token rotation in refresh endpoint
2. Add audit logging to auth routes
3. Create unified auth module
4. Enable HSTS header

### Low Priority
1. Update env template
2. Update documentation
