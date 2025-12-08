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

  // NOTE: For the current demo setup we do NOT protect app pages on the Next.js layer,
  // because authentication is handled directly by the backend service cookies.
  // We still keep the /signin -> /signup redirect above, but let all other routes pass through.

  return NextResponse.next()
}

export const config = {
  matcher: [
    // Only handle auth entry pages; app pages are not gated here because
    // backend authentication is done via its own cookies.
    '/signin',
    '/signup',
  ],
}
