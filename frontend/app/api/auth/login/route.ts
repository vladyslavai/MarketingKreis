import { NextResponse } from 'next/server'

export async function POST(request: Request) {
  const apiUrl = (process.env.NEXT_PUBLIC_API_BASE_URL || process.env.NEXT_PUBLIC_API_URL || 'https://kreismarketing-backend-xvag.onrender.com').replace(/\/$/, '')
  const targetUrl = `${apiUrl}/auth/login`

  try {
    const body = await request.text()
    const headers = new Headers({ 'Content-Type': 'application/json' })

    // Short server-side timeout to avoid 504s on Vercel
    const controller = new AbortController()
    const timer = setTimeout(() => controller.abort(), 9000)

    const response = await fetch(targetUrl, {
      method: 'POST',
      headers,
      body,
      cache: 'no-store',
      // Next will forward Set-Cookie from backend response to the client
      signal: controller.signal,
    })
    clearTimeout(timer)

    const text = await response.text()
    const next = new NextResponse(text, { status: response.status })

    // Forward Set-Cookie
    const setCookie = response.headers.get('set-cookie')
    if (setCookie) next.headers.set('set-cookie', setCookie)

    // Forward redirect header
    const redirectTo = response.headers.get('X-Redirect-To')
    if (redirectTo) next.headers.set('X-Redirect-To', redirectTo)

    next.headers.set('Content-Type', response.headers.get('content-type') || 'application/json')
    return next
  } catch (err) {
    console.error('Login proxy error:', err)
    return NextResponse.json({ detail: 'Internal error' }, { status: 500 })
  }
}



