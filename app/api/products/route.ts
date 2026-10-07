import { NextResponse } from 'next/server'
import { backendApiBaseUrl } from '@/lib/backend-api'

export async function GET() {
  try {
    const response = await fetch(`${backendApiBaseUrl}/products?page=1&limit=100`, {
      headers: { accept: 'application/json' },
      cache: 'no-store',
    })

    if (!response.ok) {
      return NextResponse.json({ success: false, data: { products: [] } }, { status: response.status })
    }

    const payload = await response.json()
    return NextResponse.json(payload)
  } catch (error) {
    return NextResponse.json(
      { success: false, data: { products: [] }, message: 'Unable to fetch products' },
      { status: 500 },
    )
  }
}
