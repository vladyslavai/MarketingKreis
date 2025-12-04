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
    console.error('Login proxy error:', e)
    return NextResponse.json({ detail: e?.message || 'Internal error' }, { status: 500 })
  }
}
