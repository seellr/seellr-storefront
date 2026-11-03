import { NextRequest, NextResponse } from 'next/server'
import { getStoreHost, storeBackendHeaders } from '@/lib/backend/headers'
import { loginSchema, envelopeSchema } from '@/lib/commerce/schemas'

export async function POST(request: NextRequest) {
  const input = loginSchema.safeParse(await request.json().catch(() => null))
  if (!input.success) return NextResponse.json({ success: false, error_code: 'validation_failed', errors: input.error.flatten().fieldErrors }, { status: 422 })
  try {
    const host = await getStoreHost(); const upstream = await fetch(`${process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:8000/api/v1'}/customer/auth/login`, { method: 'POST', headers: storeBackendHeaders(host, request.headers.get('accept-language')?.startsWith('ar') ? 'ar' : 'en'), body: JSON.stringify(input.data), cache: 'no-store' })
    const text = await upstream.text(); let parsed: unknown = null; if (text) { try { parsed = JSON.parse(text) as unknown } catch { return NextResponse.json({ success: false, error_code: 'bad_backend_shape' }, { status: 502 }) } }
    const shape = envelopeSchema.safeParse(parsed)
    if (!shape.success) return NextResponse.json({ success: false, error_code: 'bad_backend_shape' }, { status: 502 })
    const data = shape.data.data as { access_token?: string; expires_in?: number; user?: unknown } | undefined
    const response = NextResponse.json({ success: shape.data.success, message: shape.data.message, data: { user: data?.user }, error_code: shape.data.error_code, errors: shape.data.errors }, { status: upstream.status })
    if (upstream.ok && data?.access_token) response.cookies.set('customer_token', data.access_token, { httpOnly: true, secure: process.env.NODE_ENV === 'production', sameSite: 'lax', maxAge: data.expires_in ?? 60 * 60 * 24 * 7, path: '/' })
    return response
  } catch { return NextResponse.json({ success: false, error_code: 'bad_gateway', message: 'Storefront service is unavailable' }, { status: 502 }) }
}
