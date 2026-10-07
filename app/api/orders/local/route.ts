import { NextRequest, NextResponse } from 'next/server'
import { backendApiBaseUrl } from '@/lib/backend-api'

const localOrdersUrl = `${backendApiBaseUrl}/admin/orders/local`

export async function GET(request: NextRequest) {
  const url = new URL(localOrdersUrl)
  const dateFrom = request.nextUrl.searchParams.get('dateFrom')
  const dateTo = request.nextUrl.searchParams.get('dateTo')

  if (dateFrom) url.searchParams.set('dateFrom', dateFrom)
  if (dateTo) url.searchParams.set('dateTo', dateTo)
  url.searchParams.set('isCallOrder', 'false')

  try {
    const response = await fetch(url, { cache: 'no-store' })
    const payload = await response.json()
    return NextResponse.json(payload, { status: response.status })
  } catch {
    return NextResponse.json(
      { success: false, data: [], total: 0, message: 'Unable to load local orders.' },
      { status: 502 },
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const response = await fetch(localOrdersUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ...body, isCallOrder: false }),
      cache: 'no-store',
    })
    const payload = await response.json()
    return NextResponse.json(payload, { status: response.status })
  } catch {
    return NextResponse.json(
      { success: false, message: 'Unable to create the order. Check the backend connection and try again.' },
      { status: 502 },
    )
  }
}