# API Specification

This is the API specification for the spec detailed in @.agent-os/specs/2025-10-18-phase3a-discovery-premium/spec.md

## API Overview

This specification defines RESTful API endpoints for **location-based vendor discovery**, **subscription tier management**, and **premium content access**. All endpoints follow JSON request/response format with standardized error handling.

**Base URL**: `/api` (Next.js API routes)
**Authentication**: JWT tokens in httpOnly cookies (existing Payload CMS auth)
**Content-Type**: `application/json`

## Authentication & Authorization

**Authentication Method**: JWT-based (Payload CMS existing system)
- Access tokens in httpOnly cookies (name: `payload-token`)
- Automatic token validation on protected routes
- 401 Unauthorized if token missing or expired

**Authorization Roles**:
- **Public**: No authentication required (vendor browsing, location filtering)
- **Vendor**: Authenticated vendor users (tier requests, premium content management)
- **Admin**: Authenticated admin users (tier approval, audit logs, manual tier assignment)

## Endpoints

### Public Endpoints (No Auth Required)

#### GET /api/vendors

**Purpose**: Retrieve vendors with optional location and category filtering

**Authorization**: Public (no authentication required)

**Query Parameters**:
```typescript
interface VendorListQuery {
  country?: string        // Filter by service country (e.g., "United States")
  state?: string          // Filter by state/province (e.g., "California")
  city?: string           // Filter by city (e.g., "San Diego")
  lat?: number            // Proximity search latitude
  lon?: number            // Proximity search longitude
  radius?: number         // Proximity search radius in kilometers (default: 50)
  category?: string       // Filter by product category slug
  tier?: 'free' | 'tier1' | 'tier2'  // Filter by subscription tier
  limit?: number          // Results per page (default: 20, max: 100)
  offset?: number         // Pagination offset (default: 0)
}
```

**Example Request**:
```
GET /api/vendors?country=United%20States&state=California&limit=20&offset=0
```

**Success Response** (200):
```json
{
  "success": true,
  "data": {
    "vendors": [
      {
        "id": "vendor-uuid-1",
        "name": "Marine Tech Solutions",
        "tier": "tier2",
        "service_countries": ["United States", "Canada"],
        "service_states": [
          { "country": "United States", "state": "California" }
        ],
        "logo": "/uploads/marine-tech-logo.png",
        "description": "Premium navigation and communication systems",
        "slug": "marine-tech-solutions"
      }
    ],
    "total": 45,
    "filters": {
      "countries": ["United States", "Canada", "United Kingdom"],
      "states": ["California", "Florida", "Washington"],
      "cities": ["San Diego", "Miami", "Seattle"]
    }
  }
}
```

**Error Responses**:
- **400 Bad Request**: Invalid query parameters (e.g., lat without lon)
  ```json
  {
    "success": false,
    "error": {
      "code": "INVALID_PARAMS",
      "message": "Proximity search requires both lat and lon parameters"
    }
  }
  ```
- **500 Server Error**: Database query failure
  ```json
  {
    "success": false,
    "error": {
      "code": "DB_ERROR",
      "message": "Unable to fetch vendors. Please try again later."
    }
  }
  ```

---

#### GET /api/vendors/:id/service-regions

**Purpose**: Get detailed service region data for a specific vendor including map coordinates

**Authorization**: Public

**Path Parameters**:
- `id` (string, required): Vendor UUID

**Example Request**:
```
GET /api/vendors/vendor-uuid-1/service-regions
```

**Success Response** (200):
```json
{
  "success": true,
  "data": {
    "vendor_id": "vendor-uuid-1",
    "vendor_name": "Marine Tech Solutions",
    "service_regions": {
      "countries": ["United States", "Canada"],
      "states": [
        { "country": "United States", "state": "California" },
        { "country": "United States", "state": "Florida" }
      ],
      "cities": [
        { "country": "United States", "state": "California", "city": "San Diego" }
      ],
      "coordinates": [
        { "lat": 32.7157, "lon": -117.1611, "label": "San Diego HQ" },
        { "lat": 25.7617, "lon": -80.1918, "label": "Miami Service Center" }
      ],
      "coverage_notes": "We provide on-site service for all major US ports and remote support globally."
    }
  }
}
```

**Error Responses**:
- **404 Not Found**: Vendor does not exist
  ```json
  {
    "success": false,
    "error": {
      "code": "VENDOR_NOT_FOUND",
      "message": "Vendor with ID vendor-uuid-1 not found"
    }
  }
  ```

---

### Vendor Endpoints (Vendor Auth Required)

#### POST /api/tier-requests

**Purpose**: Vendor initiates a tier upgrade or downgrade request

**Authorization**: Vendor role required (authenticated vendor)

**Request Body**:
```typescript
interface TierRequestBody {
  requested_tier: 'free' | 'tier1' | 'tier2'  // Required
  reason?: string                             // Optional, max 500 chars
}
```

**Example Request**:
```json
POST /api/tier-requests
Content-Type: application/json

{
  "requested_tier": "tier2",
  "reason": "I want to showcase my certifications and case studies to attract more qualified leads."
}
```

**Success Response** (201 Created):
```json
{
  "success": true,
  "data": {
    "request_id": "request-uuid-1",
    "vendor_id": "vendor-uuid-1",
    "current_tier": "free",
    "requested_tier": "tier2",
    "status": "pending",
    "vendor_reason": "I want to showcase my certifications...",
    "created_at": "2025-10-18T14:30:00Z"
  }
}
```

**Error Responses**:
- **400 Bad Request - Invalid Tier**:
  ```json
  {
    "success": false,
    "error": {
      "code": "INVALID_TIER",
      "message": "Requested tier must be 'free', 'tier1', or 'tier2'",
      "field": "requested_tier"
    }
  }
  ```
- **400 Bad Request - Same Tier**:
  ```json
  {
    "success": false,
    "error": {
      "code": "SAME_TIER",
      "message": "Requested tier must be different from your current tier (free)"
    }
  }
  ```
- **400 Bad Request - Duplicate Request**:
  ```json
  {
    "success": false,
    "error": {
      "code": "DUPLICATE_REQUEST",
      "message": "You already have a pending tier upgrade request. Please wait for admin approval or cancel the existing request."
    }
  }
  ```
- **401 Unauthorized**: Not authenticated
  ```json
  {
    "success": false,
    "error": {
      "code": "UNAUTHORIZED",
      "message": "Authentication required. Please log in."
    }
  }
  ```
- **403 Forbidden**: User is not a vendor
  ```json
  {
    "success": false,
    "error": {
      "code": "FORBIDDEN",
      "message": "Only vendor accounts can create tier requests"
    }
  }
  ```

---

#### GET /api/tier-requests

**Purpose**: Get tier change requests (vendors see their own, admins see all)

**Authorization**: Vendor or Admin role required

**Query Parameters**:
```typescript
interface TierRequestsQuery {
  status?: 'pending' | 'approved' | 'rejected'  // Filter by status
  limit?: number                                 // Default: 20, max: 100
  offset?: number                                // Default: 0
}
```

**Example Request** (Vendor):
```
GET /api/tier-requests?status=pending
```

**Success Response** (200) - Vendor View:
```json
{
  "success": true,
  "data": {
    "requests": [
      {
        "id": "request-uuid-1",
        "vendor_id": "vendor-uuid-1",
        "vendor_name": "Marine Tech Solutions",
        "current_tier": "free",
        "requested_tier": "tier2",
        "status": "pending",
        "vendor_reason": "I want to showcase my certifications...",
        "created_at": "2025-10-18T14:30:00Z",
        "updated_at": "2025-10-18T14:30:00Z"
      }
    ],
    "total": 1
  }
}
```

**Success Response** (200) - Admin View (includes all vendors):
```json
{
  "success": true,
  "data": {
    "requests": [
      {
        "id": "request-uuid-1",
        "vendor_id": "vendor-uuid-1",
        "vendor_name": "Marine Tech Solutions",
        "current_tier": "free",
        "requested_tier": "tier2",
        "status": "pending",
        "vendor_reason": "I want to showcase my certifications...",
        "created_at": "2025-10-18T14:30:00Z",
        "updated_at": "2025-10-18T14:30:00Z"
      },
      {
        "id": "request-uuid-2",
        "vendor_id": "vendor-uuid-2",
        "vendor_name": "Ocean Electronics Ltd",
        "current_tier": "tier1",
        "requested_tier": "tier2",
        "status": "pending",
        "vendor_reason": "Expanding product catalog",
        "created_at": "2025-10-18T13:15:00Z",
        "updated_at": "2025-10-18T13:15:00Z"
      }
    ],
    "total": 2
  }
}
```

---

### Admin Endpoints (Admin Auth Required)

#### PATCH /api/tier-requests/:id

**Purpose**: Admin approves or rejects a tier change request

**Authorization**: Admin role required

**Path Parameters**:
- `id` (string, required): Tier request UUID

**Request Body**:
```typescript
interface TierRequestUpdateBody {
  status: 'approved' | 'rejected'  // Required
  admin_notes?: string             // Optional
}
```

**Example Request**:
```json
PATCH /api/tier-requests/request-uuid-1
Content-Type: application/json

{
  "status": "approved",
  "admin_notes": "Vendor has good track record. Approved for Tier 2."
}
```

**Success Response** (200) - Approved:
```json
{
  "success": true,
  "data": {
    "request_id": "request-uuid-1",
    "vendor_id": "vendor-uuid-1",
    "vendor_name": "Marine Tech Solutions",
    "previous_tier": "free",
    "new_tier": "tier2",
    "status": "approved",
    "admin_notes": "Vendor has good track record. Approved for Tier 2.",
    "admin_id": "admin-uuid-1",
    "processed_at": "2025-10-18T15:00:00Z",
    "updated_at": "2025-10-18T15:00:00Z"
  }
}
```

**Success Response** (200) - Rejected:
```json
{
  "success": true,
  "data": {
    "request_id": "request-uuid-1",
    "vendor_id": "vendor-uuid-1",
    "vendor_name": "Marine Tech Solutions",
    "previous_tier": "free",
    "new_tier": "free",
    "status": "rejected",
    "admin_notes": "Profile incomplete. Please add more product information before requesting Tier 2.",
    "admin_id": "admin-uuid-1",
    "processed_at": "2025-10-18T15:00:00Z",
    "updated_at": "2025-10-18T15:00:00Z"
  }
}
```

**Side Effects**:
- If approved: Vendor's `tier` field is automatically updated to `requested_tier`
- Audit log entry is created in `tier_audit_log` table
- Notification is sent to vendor (email/in-app notification)

**Error Responses**:
- **400 Bad Request - Invalid Status**:
  ```json
  {
    "success": false,
    "error": {
      "code": "INVALID_STATUS",
      "message": "Status must be 'approved' or 'rejected'",
      "field": "status"
    }
  }
  ```
- **400 Bad Request - Already Processed**:
  ```json
  {
    "success": false,
    "error": {
      "code": "ALREADY_PROCESSED",
      "message": "This tier request has already been processed (current status: approved)"
    }
  }
  ```
- **403 Forbidden**: User is not an admin
  ```json
  {
    "success": false,
    "error": {
      "code": "FORBIDDEN",
      "message": "Admin role required to approve/reject tier requests"
    }
  }
  ```
- **404 Not Found**: Request does not exist
  ```json
  {
    "success": false,
    "error": {
      "code": "REQUEST_NOT_FOUND",
      "message": "Tier request with ID request-uuid-1 not found"
    }
  }
  ```

---

#### POST /api/admin/vendors/:id/tier

**Purpose**: Admin directly assigns a tier to a vendor (bypass request system)

**Authorization**: Admin role required

**Use Cases**:
- Bulk tier assignments
- Fixing incorrect tier assignments
- Special promotional tier grants
- System maintenance/corrections

**Path Parameters**:
- `id` (string, required): Vendor UUID

**Request Body**:
```typescript
interface AdminTierAssignmentBody {
  tier: 'free' | 'tier1' | 'tier2'  // Required
  admin_notes?: string              // Optional
  bypass_audit?: boolean            // Optional, default false (always logs by default)
}
```

**Example Request**:
```json
POST /api/admin/vendors/vendor-uuid-1/tier
Content-Type: application/json

{
  "tier": "tier2",
  "admin_notes": "Promotional tier upgrade for featured partner program"
}
```

**Success Response** (200):
```json
{
  "success": true,
  "data": {
    "vendor_id": "vendor-uuid-1",
    "vendor_name": "Marine Tech Solutions",
    "previous_tier": "free",
    "new_tier": "tier2",
    "assigned_by": "admin-uuid-1",
    "assigned_by_name": "Admin User",
    "admin_notes": "Promotional tier upgrade for featured partner program",
    "assigned_at": "2025-10-18T16:00:00Z"
  }
}
```

**Side Effects**:
- Vendor's `tier` field is immediately updated
- Audit log entry created with `change_type: 'admin_override'`
- No tier request is created (direct assignment)

**Error Responses**:
- **400 Bad Request - Invalid Tier**:
  ```json
  {
    "success": false,
    "error": {
      "code": "INVALID_TIER",
      "message": "Tier must be 'free', 'tier1', or 'tier2'",
      "field": "tier"
    }
  }
  ```
- **403 Forbidden**: Not an admin
- **404 Not Found**: Vendor does not exist

---

#### GET /api/admin/tier-audit

**Purpose**: Get complete tier change history for audit and compliance

**Authorization**: Admin role required

**Query Parameters**:
```typescript
interface TierAuditQuery {
  vendor_id?: string      // Filter by specific vendor
  from_date?: string      // ISO date (e.g., "2025-01-01")
  to_date?: string        // ISO date (e.g., "2025-12-31")
  change_type?: 'request_approved' | 'request_rejected' | 'admin_override' | 'system_automatic'
  limit?: number          // Default: 50, max: 200
  offset?: number         // Default: 0
}
```

**Example Request**:
```
GET /api/admin/tier-audit?vendor_id=vendor-uuid-1&from_date=2025-01-01&to_date=2025-12-31
```

**Success Response** (200):
```json
{
  "success": true,
  "data": {
    "audit_logs": [
      {
        "id": "audit-uuid-1",
        "vendor_id": "vendor-uuid-1",
        "vendor_name": "Marine Tech Solutions",
        "previous_tier": "free",
        "new_tier": "tier2",
        "change_type": "request_approved",
        "admin_id": "admin-uuid-1",
        "admin_name": "Admin User",
        "tier_request_id": "request-uuid-1",
        "notes": "Vendor has good track record. Approved for Tier 2.",
        "timestamp": "2025-10-18T15:00:00Z"
      },
      {
        "id": "audit-uuid-2",
        "vendor_id": "vendor-uuid-1",
        "vendor_name": "Marine Tech Solutions",
        "previous_tier": "tier2",
        "new_tier": "tier2",
        "change_type": "request_rejected",
        "admin_id": "admin-uuid-2",
        "admin_name": "Another Admin",
        "tier_request_id": "request-uuid-5",
        "notes": "Vendor requested upgrade to tier3 which doesn't exist",
        "timestamp": "2025-09-15T10:30:00Z"
      }
    ],
    "total": 2
  }
}
```

---

## Error Handling

**Standard Error Response Format**:
```json
{
  "success": false,
  "error": {
    "code": "ERROR_CODE",
    "message": "Human-readable error message",
    "field": "field_name",  // Optional: For validation errors
    "details": "Additional technical details",  // Optional: For debugging
    "timestamp": "2025-10-18T14:32:10Z"
  }
}
```

**Common Error Codes**:
- `UNAUTHORIZED`: Missing or invalid authentication token (401)
- `FORBIDDEN`: User lacks required role/permissions (403)
- `NOT_FOUND`: Resource does not exist (404)
- `INVALID_PARAMS`: Invalid query parameters (400)
- `VALIDATION_ERROR`: Request body validation failed (400)
- `DUPLICATE_REQUEST`: Duplicate tier request exists (400)
- `DB_ERROR`: Database operation failed (500)
- `SERVER_ERROR`: Unexpected server error (500)

**HTTP Status Codes**:
- `200`: Success (GET, PATCH)
- `201`: Created (POST)
- `400`: Bad Request (validation errors, duplicate requests)
- `401`: Unauthorized (missing/invalid auth)
- `403`: Forbidden (insufficient permissions)
- `404`: Not Found (resource does not exist)
- `500`: Internal Server Error (unexpected failures)

## Rate Limiting

**Public Endpoints**: 100 requests per minute per IP address
**Authenticated Endpoints**: 200 requests per minute per user

**Rate Limit Headers** (included in all responses):
```
X-RateLimit-Limit: 100
X-RateLimit-Remaining: 95
X-RateLimit-Reset: 1634567890
```

**Rate Limit Exceeded Response** (429):
```json
{
  "success": false,
  "error": {
    "code": "RATE_LIMIT_EXCEEDED",
    "message": "Too many requests. Please try again in 60 seconds.",
    "retry_after": 60
  }
}
```

## Versioning

**Current Version**: v1 (implicit, no version prefix in URL)
**Future Versions**: Will use URL prefix (e.g., `/api/v2/vendors`)

**Backward Compatibility**: All v1 endpoints will remain supported for minimum 12 months after new version release.
