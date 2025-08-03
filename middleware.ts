
import { NextRequest, NextResponse } from 'next/server'

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl

  // Handle admin routes - proxy to Payload CMS server
  if (pathname.startsWith('/admin')) {
    // In development, proxy to local Payload CMS server
    if (process.env.NODE_ENV === 'development') {
      const payloadUrl = `http://localhost:3001${pathname}${request.nextUrl.search}`
      return NextResponse.rewrite(new URL(payloadUrl))
    }
    
    // In production, you might want to handle this differently
    // For now, we'll redirect to the CMS server
    const cmsUrl = `${process.env.PAYLOAD_PUBLIC_SERVER_URL || 'http://localhost:3001'}${pathname}${request.nextUrl.search}`
    return NextResponse.redirect(new URL(cmsUrl))
  }

  // Handle API routes that should go to Payload CMS
  if (pathname.startsWith('/api/payload')) {
    // Remove '/payload' prefix and proxy to CMS
    const cmsPath = pathname.replace('/api/payload', '/api')
    const payloadUrl = `http://localhost:3001${cmsPath}${request.nextUrl.search}`
    return NextResponse.rewrite(new URL(payloadUrl))
  }

  return NextResponse.next()
}

export const config = {
  matcher: [
    '/admin/:path*',
    '/api/payload/:path*'
  ]
}
