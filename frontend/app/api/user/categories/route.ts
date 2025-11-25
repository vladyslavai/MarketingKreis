import { NextRequest, NextResponse } from 'next/server'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

type Cat = { name: string; color: string }

// Simple in-memory store for dev/demo
// @ts-ignore
const store: { cats?: Cat[] } = globalThis.__USER_CATS__ || (globalThis.__USER_CATS__ = {})

export async function GET() {
  return NextResponse.json({ categories: store.cats || [] })
}

export async function PUT(req: NextRequest) {
  const body = await req.json().catch(() => ({}))
  const cats = Array.isArray(body?.categories) ? body.categories : []
  store.cats = cats.slice(0, 5)
  return NextResponse.json({ ok: true, categories: store.cats })
}


