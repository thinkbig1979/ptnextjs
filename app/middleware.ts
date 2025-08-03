
// STEP 6: Payload CMS Isolation - Middleware Removed
// 
// This middleware has been removed to ensure complete architectural separation
// between Next.js and Payload CMS routing systems.
//
// Previous functionality:
// - Proxied /admin routes to Payload CMS server
// - Proxied /api/payload routes to CMS API
//
// Current approach:
// - Next.js and Payload CMS run as completely separate services
// - Direct access to CMS: http://localhost:3001/admin
// - Direct access to CMS API: http://localhost:3001/api
// - No routing conflicts or coupling between the systems
//
// The API integration layer (lib/payload-api.ts) handles communication
// between the services using explicit endpoint configuration.

import { NextRequest, NextResponse } from 'next/server'

export function middleware(request: NextRequest) {
  // No routing proxying - maintain complete separation
  // Both Next.js and Payload CMS operate independently
  return NextResponse.next()
}

// No middleware configuration needed for isolated architecture
export const config = {
  matcher: []
}
