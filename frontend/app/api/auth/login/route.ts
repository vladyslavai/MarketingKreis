import { NextResponse } from 'next/server'

export async function POST(request: Request) {
  const backendUrl = process.env.BACKEND_URL || 'http://127.0.0.1:8000'
  const targetUrl = `${backendUrl}/auth/login`

  try {
    const body = await request.text()
    const headers = new Headers(request.headers)
    headers.set('Content-Type', 'application/json')

    const response = await fetch(targetUrl, {
      method: 'POST',
      headers,
      body,
      // cookies are proxied via headers; Next will forward the response Set-Cookie
    })

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



