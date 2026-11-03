import { cookies } from 'next/headers'
import { NextRequest, NextResponse } from 'next/server'
import { getStoreHost, storeBackendHeaders } from '@/lib/backend/headers'
import { envelopeSchema } from './schemas'
import { resolveCommerceTarget, type Scope } from './allowlist'

const API = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:8000/api/v1'
const tokenCookie = 'customer_token'
function fail(message: string, code: string, status: number) { return NextResponse.json({ success: false, message, error_code: code, errors: null }, { status }) }

export async function forwardCommerce(request: NextRequest, scope: Scope, segments: string[]): Promise<Response> {
  const target = resolveCommerceTarget(scope, segments, request.method)
  if (!target) return fail('Not found', 'not_allowed', 404)
  const cookieStore = await cookies(); const token = cookieStore.get(tokenCookie)?.value ?? null
  const guestToken = request.headers.get('x-guest-token')
  if (target.auth === 'customer' && !token) return fail('Login required', 'unauthenticated', 401)
  if (target.auth === 'guest' && !guestToken) return fail('Guest token required', 'guest_token_required', 400)
  try {
    const host = await getStoreHost(); const locale = request.headers.get('accept-language')?.toLowerCase().startsWith('ar') ? 'ar' : 'en'
    const contentType = request.headers.get('content-type') ?? ''; const body = request.method === 'GET' || request.method === 'HEAD' ? undefined : await request.text()
    const backendPath = `${target.backendPath}${request.nextUrl.search}`
    if (process.env.NODE_ENV !== 'production') console.log(`[commerce-proxy] ${request.method} ${backendPath}`)
    const requestHeaders = new Headers(storeBackendHeaders(host, locale, contentType.includes('application/json'), token, guestToken))
    const idempotencyKey = request.headers.get('idempotency-key')
    if (idempotencyKey) requestHeaders.set('Idempotency-Key', idempotencyKey)
    const upstream = await fetch(`${API}${backendPath}`, { method: request.method, headers: requestHeaders, body: body || undefined, cache: 'no-store', redirect: 'manual' })
    if (upstream.status >= 300 && upstream.status < 400) { const location = upstream.headers.get('location'); return location ? NextResponse.redirect(location, upstream.status) : fail('Invalid redirect from service', 'bad_backend_shape', 502) }
    const text = await upstream.text()
    if (upstream.status === 204 || !text.trim()) { const response = new NextResponse(null, { status: upstream.status }); if (upstream.status === 401) response.cookies.delete(tokenCookie); return response }
    let parsed: unknown; try { parsed = JSON.parse(text) as unknown } catch { return fail('Invalid response from service', 'bad_backend_shape', 502) }
    const shape = envelopeSchema.safeParse(parsed)
    if (!shape.success) return fail('Invalid response from service', 'bad_backend_shape', 502)
    const response = NextResponse.json(parsed, { status: upstream.status })
    if (upstream.status === 401 && target.auth === 'customer') response.cookies.delete(tokenCookie)
    return response
  } catch { return fail('Storefront service is unavailable', 'bad_gateway', 502) }
}
