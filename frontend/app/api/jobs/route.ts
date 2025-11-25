import { NextRequest, NextResponse } from 'next/server'

const backendUrl = process.env.BACKEND_URL || 'http://127.0.0.1:8000'

export async function GET(request: NextRequest) {
  const url = `${backendUrl}/jobs`
  const res = await fetch(url, { headers: request.headers, credentials: 'include' })
  const text = await res.text()
  const next = new NextResponse(text, { status: res.status })
  const setCookie = res.headers.get('set-cookie')
  if (setCookie) next.headers.set('set-cookie', setCookie)
  next.headers.set('Content-Type', res.headers.get('content-type') || 'application/json')
  return next
}






