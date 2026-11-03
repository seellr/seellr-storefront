import { NextRequest, NextResponse } from 'next/server'
import { getStoreHost, storeBackendHeaders } from '@/lib/backend/headers'
import { resolveStorefrontTarget } from '@/lib/storefront/allowlist'

function failure(message: string, code: string, status: number) {
  return NextResponse.json({ success: false, message, error_code: code, errors: null }, { status })
}

export async function GET(request: NextRequest, context: { params: Promise<{ path: string[] }> }) {
  const target = resolveStorefrontTarget((await context.params).path)
  if (!target) return failure('Not found', 'not_allowed', 404)

  try {
    const host = await getStoreHost()
    const upstream = await fetch(`${process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:8000/api/v1'}${target.backendPath}${request.nextUrl.search}`, {
      headers: storeBackendHeaders(host, request.nextUrl.searchParams.get('locale') ?? 'ar'),
      cache: 'no-store',
    })
    const text = await upstream.text()
    if (upstream.status === 204 || !text) return new NextResponse(null, { status: upstream.status })
    try {
      return NextResponse.json(JSON.parse(text) as unknown, { status: upstream.status })
    } catch {
      return failure('Invalid response from storefront service', 'bad_backend_shape', 502)
    }
  } catch {
    return failure('Storefront service is unavailable', 'bad_gateway', 502)
  }
}
