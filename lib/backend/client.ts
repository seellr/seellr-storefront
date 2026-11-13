import 'server-only'
import { getStoreHost, storeBackendHeaders } from './headers'

const backendUrl = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:8000/api/v1'

export async function fetchStorefrontBackend(path: string, locale: string, token?: string | null): Promise<Response> {
  const host = await getStoreHost()
  return fetch(`${backendUrl}${path}`, {
    headers: storeBackendHeaders(host, locale, true, token),
    cache: 'no-store',
  })
}

export async function readBackendJson<T>(response: Response): Promise<T | null> {
  const text = await response.text()
  if (!text) return null
  try {
    return JSON.parse(text) as T
  } catch {
    return null
  }
}
