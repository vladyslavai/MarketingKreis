import { NextRequest, NextResponse } from "next/server"

export async function POST(req: NextRequest) {
  try {
    const apiUrl = (process.env.NEXT_PUBLIC_API_BASE_URL || process.env.NEXT_PUBLIC_API_URL || 'https://kreismarketing-backend.onrender.com').replace(/\/$/, '')
    // Short timeout to avoid Vercel 504s
    const controller = new AbortController()
    const t = setTimeout(() => controller.abort(), 9000)
    const r = await fetch(`${apiUrl}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: await req.text(),
      credentials: 'include',
      cache: 'no-store',
      signal: controller.signal,
    })
    clearTimeout(t)
    const setCookie = r.headers.get('set-cookie') || undefined
    const text = await r.text()
    const resp = new NextResponse(text, { status: r.status })
    if (setCookie) resp.headers.set('set-cookie', setCookie)
    return resp
  } catch (e: any) {
    return NextResponse.json({ error: e?.message || 'Unexpected error' }, { status: 500 })
  }
}

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



