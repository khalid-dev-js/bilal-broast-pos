import { NextRequest, NextResponse } from 'next/server'

const BACKEND_URL = process.env.NEXT_PUBLIC_API_URL || 'https://bilal-broast-backend.vercel.app/api'

async function proxy(request: NextRequest, { params }: { params: Promise<{ path: string[] }> }) {
  const { path } = await params
  const target = `${BACKEND_URL}/${path.join('/')}${request.nextUrl.search}`
  const headers = new Headers(request.headers)
  headers.delete('host')
  headers.delete('connection')
  headers.delete('origin')
  const response = await fetch(target, { method: request.method, headers, body: request.method === 'GET' || request.method === 'HEAD' ? undefined : await request.arrayBuffer(), cache: 'no-store' })
  const body = await response.text()
  return new NextResponse(body, {
    status: response.status,
    headers: { 'content-type': response.headers.get('content-type') || 'application/json', ...(response.headers.get('set-cookie') ? { 'set-cookie': response.headers.get('set-cookie')! } : {}) },
  })
}

export const GET = proxy
export const POST = proxy
export const PUT = proxy
export const PATCH = proxy
export const DELETE = proxy
