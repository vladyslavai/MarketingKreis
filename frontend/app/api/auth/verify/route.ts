import { NextRequest, NextResponse } from "next/server"

export async function GET(req: NextRequest) {
  const token = req.nextUrl.searchParams.get('token') || ''
  try {
    const apiUrl = process.env.NEXT_PUBLIC_API_URL || process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:8000'
    const r = await fetch(`${apiUrl}/auth/verify?token=${encodeURIComponent(token)}`, {
      method: 'GET',
      credentials: 'include',
    })
    const text = await r.text()
    return new NextResponse(text, { status: r.status })
  } catch (e: any) {
    return NextResponse.json({ error: e?.message || 'Unexpected error' }, { status: 500 })
  }
}




