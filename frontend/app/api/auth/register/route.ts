import { NextRequest, NextResponse } from "next/server"

export async function POST(req: NextRequest) {
  try {
    const apiUrl = (process.env.NEXT_PUBLIC_API_BASE_URL || process.env.NEXT_PUBLIC_API_URL || 'https://kreismarketing-backend-xvag.onrender.com').replace(/\/$/, '')
    const r = await fetch(`${apiUrl}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: await req.text(),
      credentials: 'include',
      cache: 'no-store',
      // Abort if backend doesn’t respond within 15s to avoid hanging UI
      signal: (AbortSignal as any).timeout ? (AbortSignal as any).timeout(15000) : undefined,
    })
    const setCookie = r.headers.get('set-cookie') || undefined
    const text = await r.text()
    const resp = new NextResponse(text, { status: r.status })
    if (setCookie) resp.headers.set('set-cookie', setCookie)
    return resp
  } catch (e: any) {
    return NextResponse.json({ error: e?.message || 'Unexpected error' }, { status: 500 })
  }
}





