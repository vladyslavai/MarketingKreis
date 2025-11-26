import { NextRequest, NextResponse } from "next/server"

export async function POST(req: NextRequest) {
  try {
    const apiUrl = process.env.NEXT_PUBLIC_API_URL || process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:8000'
    const r = await fetch(`${apiUrl}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: await req.text(),
      credentials: 'include',
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


