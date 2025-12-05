import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export async function middleware(request: NextRequest) {
  // Important: Do NOT proxy /api/* here. Next.js rewrites (next.config.js) will
  // forward requests to the backend and preserve body/cookies correctly.

  const pathname = request.nextUrl.pathname

  // Hard redirect old /signin to the new combined auth page
  if (pathname === '/signin') {
    const url = new URL('/signup?mode=login', request.url)
    return NextResponse.redirect(url)
  }

  // Route protection for app pages only
  const protectedPrefixes = ['/dashboard', '/crm', '/calendar', '/activities', '/content', '/performance', '/budget', '/uploads', '/reports', '/admin']
  const isProtected = protectedPrefixes.some((p) => pathname === p || pathname.startsWith(p + '/'))
  const isAuthPage = pathname === '/signup'
  const hasAccessToken = Boolean(request.cookies.get('access_token')?.value)

  // If visiting auth page while already authenticated -> redirect to dashboard
  if (isAuthPage && hasAccessToken) {
    const url = new URL('/dashboard', request.url)
    return NextResponse.redirect(url)
  }

  // If visiting protected route without auth -> redirect to signup
  if (isProtected && !hasAccessToken) {
    const url = new URL('/signup', request.url)
    return NextResponse.redirect(url)
  }

  return NextResponse.next()
}

export const config = {
  matcher: [
    // NOTE: Do not match '/api/:path*' to avoid consuming request bodies in middleware
    '/dashboard/:path*',
    '/crm/:path*',
    '/calendar/:path*',
    '/activities/:path*',
    '/content/:path*',
    '/performance/:path*',
    '/budget/:path*',
    '/uploads/:path*',
    '/reports/:path*',
    '/admin/:path*',
    '/signin',
    '/signup',
  ],
}
