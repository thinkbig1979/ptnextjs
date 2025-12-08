# Spec Summary (Lite)

Implement security best practices for the JWT authentication system: separate secrets for access/refresh tokens, token versioning for instant revocation (no Redis needed), unique token IDs (jti), refresh token rotation, structured audit logging via Payload CMS collection, HSTS in production, middleware token validation, and auth utility consolidation. All improvements use existing infrastructure with no new external dependencies or development friction.

## Key Deliverables

1. **Separate JWT Secrets** - Access/refresh tokens use different signing keys with type claims
2. **Token Versioning** - Database-based instant revocation via `tokenVersion` field
3. **Audit Logging** - All auth events logged to `audit_logs` collection
4. **Refresh Rotation** - New refresh token issued on each refresh
5. **HSTS Enabled** - Production-only Strict-Transport-Security header
6. **Middleware Hardening** - Validate token signature, not just existence
7. **Auth Consolidation** - Single unified auth module replacing three utilities

## Files Changed

- `lib/utils/jwt.ts` - Separate secrets, jti, type claims
- `lib/services/auth-service.ts` - tokenVersion verification
- `payload/collections/Users.ts` - tokenVersion field
- `payload/collections/AuditLogs.ts` - New collection
- `lib/services/audit-service.ts` - New service
- `middleware.ts` - HSTS + token validation
- `lib/auth/index.ts` - New unified auth module
- All auth API routes - Audit logging integration
