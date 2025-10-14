# API Specification

This is the API specification for the spec detailed in @.agent-os/specs/2025-10-11-payload-cms-vendor-enrollment/spec.md

## API Overview

### Base URL

- **Development**: `http://localhost:3000/api`
- **Production**: `https://yourdomain.com/api`

### Authentication

All protected endpoints require a valid JWT access token passed via httpOnly cookie (`access_token`). The frontend automatically includes this cookie with each request.

### Response Format

All API endpoints return a standardized JSON response:

**Success Response**:
```json
{
  "success": true,
  "data": { /* endpoint-specific data */ },
  "meta": {
    "timestamp": "2025-10-11T12:34:56Z"
  }
}
```

**Error Response**:
```json
{
  "success": false,
  "error": {
    "code": "ERROR_CODE",
    "message": "Human-readable error message",
    "details": "Additional technical details (optional)",
    "fields": { /* field-specific errors for validation */ },
    "timestamp": "2025-10-11T12:34:56Z"
  }
}
```

### HTTP Status Codes

- **200 OK**: Successful GET, PUT, PATCH, DELETE
- **201 Created**: Successful POST (resource creation)
- **204 No Content**: Successful DELETE with no response body
- **400 Bad Request**: Validation error, malformed request
- **401 Unauthorized**: Missing or invalid authentication token
- **403 Forbidden**: Valid auth but insufficient permissions
- **404 Not Found**: Resource does not exist
- **409 Conflict**: Duplicate resource (e.g., email already exists)
- **422 Unprocessable Entity**: Business logic validation failure
- **429 Too Many Requests**: Rate limit exceeded
- **500 Internal Server Error**: Unexpected server error

---

## Authentication Endpoints

### POST /api/auth/login

Authenticate user and issue JWT tokens.

**Request Body**:
```json
{
  "email": "vendor@example.com",
  "password": "SecurePassword123!"
}
```

**Validation Rules**:
- `email`: Required, valid email format
- `password`: Required, string

**Success Response** (200):
```json
{
  "success": true,
  "data": {
    "user": {
      "id": "uuid",
      "email": "vendor@example.com",
      "role": "vendor",
      "tier": "free",
      "companyName": "Test Vendor"
    },
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  },
  "meta": {
    "timestamp": "2025-10-11T12:34:56Z"
  }
}
```

**Sets Cookies**:
- `access_token`: JWT access token (1 hour expiry, httpOnly, secure, sameSite=Lax)
- `refresh_token`: JWT refresh token (7 days expiry, httpOnly, secure, sameSite=Lax)

**Error Responses**:

**401 Unauthorized** - Invalid credentials:
```json
{
  "success": false,
  "error": {
    "code": "INVALID_CREDENTIALS",
    "message": "Invalid email or password",
    "timestamp": "2025-10-11T12:34:56Z"
  }
}
```

**403 Forbidden** - Account pending approval:
```json
{
  "success": false,
  "error": {
    "code": "ACCOUNT_PENDING",
    "message": "Your account is pending admin approval",
    "timestamp": "2025-10-11T12:34:56Z"
  }
}
```

**403 Forbidden** - Account rejected:
```json
{
  "success": false,
  "error": {
    "code": "ACCOUNT_REJECTED",
    "message": "Your account registration was rejected",
    "details": "Incomplete company information",
    "timestamp": "2025-10-11T12:34:56Z"
  }
}
```

**400 Bad Request** - Validation error:
```json
{
  "success": false,
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Invalid request data",
    "fields": {
      "email": "Invalid email format"
    },
    "timestamp": "2025-10-11T12:34:56Z"
  }
}
```

**Rate Limiting**: 10 requests per minute per IP address

---

### POST /api/auth/logout

Logout user and invalidate tokens.

**Authentication**: Required (JWT token)

**Request Body**: None

**Success Response** (200):
```json
{
  "success": true,
  "data": {
    "message": "Logged out successfully"
  },
  "meta": {
    "timestamp": "2025-10-11T12:34:56Z"
  }
}
```

**Clears Cookies**:
- `access_token`
- `refresh_token`

**Side Effects**:
- Refresh token blacklisted (cannot be reused)
- User must log in again to get new tokens

---

### POST /api/auth/refresh

Refresh access token using refresh token.

**Authentication**: Requires valid refresh token cookie

**Request Body**: None

**Success Response** (200):
```json
{
  "success": true,
  "data": {
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  },
  "meta": {
    "timestamp": "2025-10-11T12:34:56Z"
  }
}
```

**Sets Cookie**:
- `access_token`: New JWT access token (1 hour expiry)

**Error Responses**:

**401 Unauthorized** - Invalid or expired refresh token:
```json
{
  "success": false,
  "error": {
    "code": "INVALID_REFRESH_TOKEN",
    "message": "Invalid or expired refresh token, please log in again",
    "timestamp": "2025-10-11T12:34:56Z"
  }
}
```

---

## Vendor Registration Endpoints

### POST /api/vendors/register

Register a new vendor account (public endpoint).

**Authentication**: None (public)

**Request Body**:
```json
{
  "companyName": "Marine Tech Solutions",
  "contactEmail": "contact@marinetech.com",
  "contactPhone": "+1-555-0123",
  "password": "SecurePassword123!"
}
```

**Validation Rules**:
- `companyName`: Required, 2-100 characters
- `contactEmail`: Required, valid email format
- `contactPhone`: Optional, valid phone format (E.164)
- `password`: Required, minimum 12 characters, uppercase, lowercase, number, special character

**Success Response** (201):
```json
{
  "success": true,
  "data": {
    "vendorId": "uuid",
    "status": "pending",
    "message": "Registration submitted for admin approval"
  },
  "meta": {
    "timestamp": "2025-10-11T12:34:56Z"
  }
}
```

**Error Responses**:

**400 Bad Request** - Validation error:
```json
{
  "success": false,
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Invalid request data",
    "fields": {
      "password": "Password must be at least 12 characters and include uppercase, lowercase, number, and special character"
    },
    "timestamp": "2025-10-11T12:34:56Z"
  }
}
```

**409 Conflict** - Duplicate email:
```json
{
  "success": false,
  "error": {
    "code": "DUPLICATE_EMAIL",
    "message": "An account with this email already exists",
    "timestamp": "2025-10-11T12:34:56Z"
  }
}
```

**Side Effects**:
- Creates user record with status='pending'
- Creates vendor record with tier='free', published=false
- Password hashed with bcrypt (12 rounds) before storage

**Rate Limiting**: 5 registrations per hour per IP address

---

## Vendor Management Endpoints

### GET /api/vendors

Get list of vendors (public or authenticated).

**Authentication**: Optional

**Query Parameters**:
- `published` (boolean): Filter by published status (default: true for public, omit for admin)
- `featured` (boolean): Filter by featured status
- `tier` (string): Filter by subscription tier ('free', 'tier1', 'tier2')
- `page` (number): Page number (default: 1)
- `limit` (number): Items per page (default: 20, max: 100)
- `sort` (string): Sort field (default: 'createdAt', options: 'companyName', 'createdAt')
- `order` (string): Sort order (default: 'desc', options: 'asc', 'desc')

**Success Response** (200):
```json
{
  "success": true,
  "data": {
    "vendors": [
      {
        "id": "uuid",
        "companyName": "Marine Tech Solutions",
        "slug": "marine-tech-solutions",
        "description": "Leading provider of marine navigation systems",
        "logo": "/images/vendors/marine-tech-logo.png",
        "tier": "tier2",
        "featured": true,
        "contactEmail": "contact@marinetech.com",
        "website": "https://marinetech.com",
        "createdAt": "2025-10-01T10:00:00Z"
      }
    ],
    "pagination": {
      "page": 1,
      "limit": 20,
      "total": 150,
      "totalPages": 8
    }
  },
  "meta": {
    "timestamp": "2025-10-11T12:34:56Z"
  }
}
```

**Tier-Based Field Visibility**:
- **Free Tier**: companyName, description, logo, contactEmail, contactPhone
- **Tier 1**: All free fields + website, social links
- **Tier 2**: All tier 1 fields (products fetched separately)

---

### GET /api/vendors/{slug}

Get single vendor by slug (public or authenticated).

**Authentication**: Optional

**URL Parameters**:
- `slug` (string): Vendor slug

**Success Response** (200):
```json
{
  "success": true,
  "data": {
    "vendor": {
      "id": "uuid",
      "companyName": "Marine Tech Solutions",
      "slug": "marine-tech-solutions",
      "description": "Leading provider of marine navigation systems...",
      "logo": "/images/vendors/marine-tech-logo.png",
      "tier": "tier2",
      "featured": true,
      "contactEmail": "contact@marinetech.com",
      "contactPhone": "+1-555-0123",
      "website": "https://marinetech.com",
      "linkedinUrl": "https://linkedin.com/company/marinetech",
      "certifications": ["ISO 9001", "ISO 14001"],
      "published": true,
      "createdAt": "2025-10-01T10:00:00Z",
      "updatedAt": "2025-10-05T15:30:00Z"
    }
  },
  "meta": {
    "timestamp": "2025-10-11T12:34:56Z"
  }
}
```

**Error Responses**:

**404 Not Found**:
```json
{
  "success": false,
  "error": {
    "code": "NOT_FOUND",
    "message": "Vendor not found",
    "timestamp": "2025-10-11T12:34:56Z"
  }
}
```

---

### GET /api/vendors/{id}

Get vendor by ID (authenticated, vendor or admin).

**Authentication**: Required (vendor can only access own profile, admin can access any)

**URL Parameters**:
- `id` (uuid): Vendor ID

**Authorization**:
- Vendor role: Can only access their own vendor profile (`req.user.vendorId === params.id`)
- Admin role: Can access any vendor profile

**Success Response** (200):
Same as GET /api/vendors/{slug}, but includes unpublished vendors if authorized.

**Error Responses**:

**401 Unauthorized**:
```json
{
  "success": false,
  "error": {
    "code": "UNAUTHORIZED",
    "message": "Authentication required",
    "timestamp": "2025-10-11T12:34:56Z"
  }
}
```

**403 Forbidden**:
```json
{
  "success": false,
  "error": {
    "code": "FORBIDDEN",
    "message": "You can only access your own vendor profile",
    "timestamp": "2025-10-11T12:34:56Z"
  }
}
```

---

### PUT /api/vendors/{id}

Update vendor profile (authenticated, vendor or admin).

**Authentication**: Required (vendor can only update own profile, admin can update any)

**URL Parameters**:
- `id` (uuid): Vendor ID

**Request Body** (partial update):
```json
{
  "companyName": "Marine Tech Solutions Inc.",
  "description": "Updated description...",
  "logo": "/images/vendors/new-logo.png",
  "contactEmail": "info@marinetech.com",
  "contactPhone": "+1-555-9999",
  "website": "https://newsite.com",
  "linkedinUrl": "https://linkedin.com/company/newprofile",
  "certifications": ["ISO 9001", "ISO 14001", "CE Marking"]
}
```

**Tier Restrictions**:
- **Free Tier**: Can only update companyName, description, logo, contactEmail, contactPhone
- **Tier 1**: Can update all free tier fields + website, social links, certifications
- **Tier 2**: Can update all tier 1 fields (products managed separately)

**Authorization**:
- Vendor role: Can only update their own profile, restricted by tier
- Admin role: Can update any profile, not restricted by tier

**Success Response** (200):
```json
{
  "success": true,
  "data": {
    "vendor": { /* updated vendor object */ }
  },
  "meta": {
    "timestamp": "2025-10-11T12:34:56Z"
  }
}
```

**Error Responses**:

**403 Forbidden** - Tier restriction:
```json
{
  "success": false,
  "error": {
    "code": "TIER_RESTRICTED",
    "message": "This feature requires Tier 1 subscription",
    "details": "Fields 'website', 'linkedinUrl' are restricted to Tier 1+ vendors",
    "restrictedFields": ["website", "linkedinUrl"],
    "timestamp": "2025-10-11T12:34:56Z"
  }
}
```

**422 Unprocessable Entity** - Business logic error:
```json
{
  "success": false,
  "error": {
    "code": "VALIDATION_FAILED",
    "message": "Cannot update published vendor profile",
    "timestamp": "2025-10-11T12:34:56Z"
  }
}
```

---

## Admin Approval Endpoints

### GET /api/admin/vendors/pending

Get list of pending vendor registrations (admin only).

**Authentication**: Required (admin role)

**Query Parameters**:
- `page` (number): Page number (default: 1)
- `limit` (number): Items per page (default: 20, max: 100)

**Success Response** (200):
```json
{
  "success": true,
  "data": {
    "vendors": [
      {
        "id": "uuid",
        "companyName": "New Vendor Co",
        "contactEmail": "vendor@newvendor.com",
        "contactPhone": "+1-555-1234",
        "createdAt": "2025-10-10T14:22:00Z"
      }
    ],
    "pagination": {
      "page": 1,
      "limit": 20,
      "total": 15,
      "totalPages": 1
    }
  },
  "meta": {
    "timestamp": "2025-10-11T12:34:56Z"
  }
}
```

**Error Responses**:

**403 Forbidden** - Not admin:
```json
{
  "success": false,
  "error": {
    "code": "FORBIDDEN",
    "message": "Admin access required",
    "timestamp": "2025-10-11T12:34:56Z"
  }
}
```

---

### POST /api/admin/vendors/{id}/approve

Approve a pending vendor registration (admin only).

**Authentication**: Required (admin role)

**URL Parameters**:
- `id` (uuid): Vendor ID

**Request Body**:
```json
{
  "initialTier": "free",
  "welcomeMessage": "Welcome to the platform!"
}
```

**Validation Rules**:
- `initialTier`: Optional, default 'free', valid values: 'free', 'tier1', 'tier2'
- `welcomeMessage`: Optional, string

**Success Response** (200):
```json
{
  "success": true,
  "data": {
    "vendor": {
      "id": "uuid",
      "status": "approved",
      "tier": "free",
      "approvedAt": "2025-10-11T12:34:56Z"
    }
  },
  "meta": {
    "timestamp": "2025-10-11T12:34:56Z"
  }
}
```

**Side Effects**:
- Updates `users.status` to 'approved'
- Sets `users.approved_at` to current timestamp
- Sets `vendors.tier` to specified tier (default 'free')
- Sets `vendors.published` to true
- (Future) Sends welcome email to vendor

**Error Responses**:

**404 Not Found** - Vendor not found or already processed:
```json
{
  "success": false,
  "error": {
    "code": "NOT_FOUND",
    "message": "Pending vendor not found",
    "timestamp": "2025-10-11T12:34:56Z"
  }
}
```

---

### POST /api/admin/vendors/{id}/reject

Reject a pending vendor registration (admin only).

**Authentication**: Required (admin role)

**URL Parameters**:
- `id` (uuid): Vendor ID

**Request Body**:
```json
{
  "reason": "Incomplete company information"
}
```

**Validation Rules**:
- `reason`: Required, string, minimum 10 characters

**Success Response** (200):
```json
{
  "success": true,
  "data": {
    "vendor": {
      "id": "uuid",
      "status": "rejected",
      "rejectedAt": "2025-10-11T12:34:56Z",
      "rejectionReason": "Incomplete company information"
    }
  },
  "meta": {
    "timestamp": "2025-10-11T12:34:56Z"
  }
}
```

**Side Effects**:
- Updates `users.status` to 'rejected'
- Sets `users.rejected_at` to current timestamp
- Stores `users.rejection_reason`
- Vendor cannot log in (status check on login)
- (Future) Sends rejection email to vendor

**Error Responses**:

**400 Bad Request** - Missing reason:
```json
{
  "success": false,
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Rejection reason is required",
    "fields": {
      "reason": "Reason must be at least 10 characters"
    },
    "timestamp": "2025-10-11T12:34:56Z"
  }
}
```

---

## Product Endpoints

### GET /api/products

Get list of products (public or authenticated).

**Authentication**: Optional

**Query Parameters**:
- `vendorId` (uuid): Filter by vendor ID
- `published` (boolean): Filter by published status (default: true)
- `categories` (string[]): Filter by category slugs (comma-separated)
- `page` (number): Page number (default: 1)
- `limit` (number): Items per page (default: 20, max: 100)

**Success Response** (200):
```json
{
  "success": true,
  "data": {
    "products": [
      {
        "id": "uuid",
        "name": "GPS Navigator Pro",
        "slug": "gps-navigator-pro",
        "shortDescription": "Advanced marine GPS navigation system",
        "images": ["/images/products/gps-1.jpg"],
        "categories": ["navigation", "gps"],
        "vendor": {
          "id": "uuid",
          "companyName": "Marine Tech Solutions",
          "slug": "marine-tech-solutions"
        },
        "published": true,
        "createdAt": "2025-10-05T10:00:00Z"
      }
    ],
    "pagination": {
      "page": 1,
      "limit": 20,
      "total": 75,
      "totalPages": 4
    }
  },
  "meta": {
    "timestamp": "2025-10-11T12:34:56Z"
  }
}
```

---

### GET /api/products/{slug}

Get single product by slug (public or authenticated).

**Authentication**: Optional

**URL Parameters**:
- `slug` (string): Product slug

**Success Response** (200):
```json
{
  "success": true,
  "data": {
    "product": {
      "id": "uuid",
      "name": "GPS Navigator Pro",
      "slug": "gps-navigator-pro",
      "description": "Full product description with markdown...",
      "shortDescription": "Advanced marine GPS navigation system",
      "images": [
        "/images/products/gps-1.jpg",
        "/images/products/gps-2.jpg"
      ],
      "categories": ["navigation", "gps"],
      "specifications": {
        "dimensions": "12cm x 8cm x 3cm",
        "weight": "450g",
        "power": "12V DC",
        "waterproof": "IPX7"
      },
      "vendor": {
        "id": "uuid",
        "companyName": "Marine Tech Solutions",
        "slug": "marine-tech-solutions",
        "logo": "/images/vendors/marine-tech-logo.png"
      },
      "published": true,
      "createdAt": "2025-10-05T10:00:00Z",
      "updatedAt": "2025-10-07T14:20:00Z"
    }
  },
  "meta": {
    "timestamp": "2025-10-11T12:34:56Z"
  }
}
```

---

## Error Handling

### Global Error Codes

| Code | HTTP Status | Description |
|---|---|---|
| VALIDATION_ERROR | 400 | Request data failed validation |
| UNAUTHORIZED | 401 | Missing or invalid authentication |
| FORBIDDEN | 403 | Insufficient permissions |
| NOT_FOUND | 404 | Resource does not exist |
| DUPLICATE_EMAIL | 409 | Email already registered |
| TIER_RESTRICTED | 403 | Feature requires higher tier |
| RATE_LIMIT_EXCEEDED | 429 | Too many requests |
| SERVER_ERROR | 500 | Internal server error |

### Error Response Guidelines

**Client Errors (4xx)**:
- Include specific error code for programmatic handling
- Provide user-friendly error message
- For validation errors, include field-specific errors in `fields` object
- For authorization errors, explain what permission is missing

**Server Errors (5xx)**:
- Log full error details server-side (stack trace, context)
- Return generic error message to client (don't expose internals)
- Include timestamp for correlating with server logs
- Alert monitoring system for investigation

**Example Error Response**:
```json
{
  "success": false,
  "error": {
    "code": "TIER_RESTRICTED",
    "message": "This feature requires Tier 2 subscription",
    "details": "Product management is only available to Tier 2 vendors. Please upgrade your subscription to access this feature.",
    "requiredTier": "tier2",
    "currentTier": "free",
    "timestamp": "2025-10-11T12:34:56Z"
  }
}
```

---

## Rate Limiting

### Rate Limit Policies

| Endpoint Pattern | Limit | Window | Identifier |
|---|---|---|---|
| /api/auth/login | 10 requests | 1 minute | IP address |
| /api/vendors/register | 5 requests | 1 hour | IP address |
| /api/auth/* | 20 requests | 1 minute | IP address |
| /api/vendors/* (authenticated) | 200 requests | 1 minute | User ID |
| /api/products/* (authenticated) | 200 requests | 1 minute | User ID |
| /api/admin/* | No limit | - | - |
| /api/* (public) | 100 requests | 1 minute | IP address |

### Rate Limit Headers

**Response Headers**:
- `X-RateLimit-Limit`: Maximum requests allowed in window
- `X-RateLimit-Remaining`: Requests remaining in current window
- `X-RateLimit-Reset`: Unix timestamp when window resets

**Example**:
```
X-RateLimit-Limit: 200
X-RateLimit-Remaining: 195
X-RateLimit-Reset: 1696942800
```

### Rate Limit Exceeded Response

**429 Too Many Requests**:
```json
{
  "success": false,
  "error": {
    "code": "RATE_LIMIT_EXCEEDED",
    "message": "Too many requests, please try again later",
    "retryAfter": 42,
    "timestamp": "2025-10-11T12:34:56Z"
  }
}
```

**Response Headers**:
- `Retry-After`: Seconds until rate limit resets

---

## API Versioning

**Current Version**: v1 (implicit, no version in URL)

**Future Versioning Strategy**:
- Breaking changes will be released as new version (v2, v3)
- Version specified in URL path: `/api/v2/vendors`
- Previous versions supported for 12 months after new version release
- Deprecation warnings in response headers: `X-API-Deprecation: true`, `X-API-Sunset: 2026-10-11`

**Backward Compatibility Guidelines**:
- Adding new fields: Backward compatible (clients ignore unknown fields)
- Adding new endpoints: Backward compatible
- Adding new query parameters: Backward compatible (defaults applied)
- Changing response format: Breaking change (requires new version)
- Removing fields: Breaking change (requires new version)
- Changing authentication: Breaking change (requires new version)

---

## Security

### Input Validation

All request bodies and query parameters validated with Zod schemas before processing.

**Example Validation Schema**:
```typescript
const registerVendorSchema = z.object({
  companyName: z.string().min(2).max(100),
  contactEmail: z.string().email(),
  contactPhone: z.string().regex(/^\+?[1-9]\d{1,14}$/).optional(),
  password: z.string()
    .min(12)
    .regex(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]+$/, {
      message: 'Password must include uppercase, lowercase, number, and special character'
    })
})
```

### SQL Injection Prevention

All database queries use parameterized statements via Payload CMS local API. No string concatenation for SQL queries.

**Safe Query Example**:
```typescript
// Good: Parameterized query
const vendor = await payload.findByID({
  collection: 'vendors',
  id: vendorId, // Automatically escaped
})

// Bad: String concatenation (NEVER DO THIS)
const query = `SELECT * FROM vendors WHERE id = '${vendorId}'` // ❌ Vulnerable
```

### XSS Prevention

- React automatically escapes all values rendered to DOM
- Content Security Policy (CSP) headers set:
  - `Content-Security-Policy: default-src 'self'; script-src 'self' 'unsafe-inline'; style-src 'self' 'unsafe-inline';`
- User-generated content sanitized with DOMPurify before rendering HTML

### CSRF Protection

- `SameSite=Lax` attribute on all cookies prevents CSRF on state-changing requests
- For additional security, can implement CSRF tokens for mutations
- GET requests never have side effects (safe from CSRF)

### Authentication Security

- Passwords hashed with bcrypt (12 rounds)
- JWT tokens stored in httpOnly cookies (XSS protection)
- Access tokens expire after 1 hour (short-lived)
- Refresh tokens expire after 7 days
- Refresh tokens blacklisted on logout

---

## Testing

### API Testing with Supertest

```typescript
import request from 'supertest'
import { app } from '@/app'

describe('POST /api/vendors/register', () => {
  it('should register vendor with valid data', async () => {
    const response = await request(app)
      .post('/api/vendors/register')
      .send({
        companyName: 'Test Vendor',
        contactEmail: 'test@example.com',
        password: 'SecurePassword123!',
      })
      .expect(201)

    expect(response.body.success).toBe(true)
    expect(response.body.data.vendorId).toBeDefined()
    expect(response.body.data.status).toBe('pending')
  })

  it('should reject duplicate email', async () => {
    // Create existing vendor
    await createVendor({ email: 'existing@example.com' })

    const response = await request(app)
      .post('/api/vendors/register')
      .send({
        companyName: 'Another Vendor',
        contactEmail: 'existing@example.com',
        password: 'SecurePassword123!',
      })
      .expect(409)

    expect(response.body.error.code).toBe('DUPLICATE_EMAIL')
  })
})
```

### API Documentation

API documentation can be generated using OpenAPI/Swagger specification. Consider using tools like:
- **Swagger UI**: Interactive API documentation
- **Postman Collections**: Shareable API collection for testing
- **Stoplight**: API design and documentation platform

**Sample OpenAPI Spec**:
```yaml
openapi: 3.0.0
info:
  title: Marine Technology Discovery Platform API
  version: 1.0.0
paths:
  /api/vendors/register:
    post:
      summary: Register new vendor
      requestBody:
        required: true
        content:
          application/json:
            schema:
              type: object
              properties:
                companyName:
                  type: string
                contactEmail:
                  type: string
                  format: email
                password:
                  type: string
                  minLength: 12
      responses:
        '201':
          description: Vendor registered successfully
        '400':
          description: Validation error
        '409':
          description: Duplicate email
```
