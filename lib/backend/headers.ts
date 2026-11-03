import 'server-only'
import { headers } from 'next/headers'

export async function getStoreHost(): Promise<string> {
  const configured = process.env.STORE_HOST_OVERRIDE?.trim()
  if (configured) return configured

  const incoming = await headers()
  return incoming.get('x-forwarded-host') ?? incoming.get('host') ?? 'localhost'
}

export function storeBackendHeaders(host: string, locale: string, contentType = true, token?: string | null, guestToken?: string | null): HeadersInit {
  const language = locale === 'ar' || locale === 'en' ? locale : 'ar'
  const configuredHostHeader = process.env.STORE_HOST_HEADER?.trim() || 'X-Store-Host'
  return {
    Accept: 'application/json',
    ...(contentType ? { 'Content-Type': 'application/json' } : {}),
    'x-api-key': process.env.API_KEY ?? '',
    'Accept-Language': language,
    'X-Forwarded-Host': host,
    [configuredHostHeader]: host,
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...(guestToken ? { 'X-Guest-Token': guestToken } : {}),
  }
}
