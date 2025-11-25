import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export async function middleware(request: NextRequest) {
  // Important: Do NOT proxy /api/* here. Next.js rewrites (next.config.js) will
  // forward requests to the backend and preserve body/cookies correctly.

  // Route protection for app pages only
  const protectedPrefixes = ['/dashboard', '/crm', '/calendar', '/activities', '/content', '/performance', '/budget', '/uploads', '/reports', '/admin']
  const isProtected = protectedPrefixes.some((p) => request.nextUrl.pathname === p || request.nextUrl.pathname.startsWith(p + '/'))
  const isSignin = request.nextUrl.pathname === '/signin'
  const hasAccessToken = Boolean(request.cookies.get('access_token')?.value)

  // If visiting signin while already authenticated -> redirect to dashboard
  if (isSignin && hasAccessToken) {
    const url = new URL('/dashboard', request.url)
    return NextResponse.redirect(url)
  }

  // If visiting protected route without auth -> redirect to signin
  if (isProtected && !hasAccessToken) {
    const url = new URL('/signin', request.url)
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
  ],
}
