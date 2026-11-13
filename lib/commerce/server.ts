import 'server-only'
import { fetchStorefrontBackend, readBackendJson } from '@/lib/backend/client'
import type { ApiEnvelope, Cart, Product, ShippingMethod } from './types'

async function readEnvelope<T>(response: Response): Promise<ApiEnvelope<T> | null> {
  return readBackendJson<ApiEnvelope<T>>(response)
}

export interface ProductQuery {
  q?: string
  type?: string
  featured?: boolean
  perPage?: number
  cursor?: string | null
}

export async function fetchPublishedProducts(locale: string, query: ProductQuery = {}): Promise<Product[]> {
  const params = new URLSearchParams()
  params.set('per_page', String(query.perPage ?? 48))
  if (query.type) params.set('type', query.type)
  if (query.featured !== undefined) params.set('featured', String(query.featured))
  if (query.cursor) params.set('cursor', query.cursor)

  const path = query.q
    ? `/search/products?q=${encodeURIComponent(query.q)}&per_page=${query.perPage ?? 24}${query.type ? `&type=${encodeURIComponent(query.type)}` : ''}`
    : `/products?${params.toString()}`

  try {
    const response = await fetchStorefrontBackend(path, locale)
    if (!response.ok) return []
    const payload = await readEnvelope<Product[]>(response)
    return Array.isArray(payload?.data) ? payload.data : []
  } catch {
    return []
  }
}

export async function fetchPublishedProduct(slug: string, locale: string): Promise<Product | null> {
  if (!slug) return null
  try {
    const response = await fetchStorefrontBackend(`/products/${encodeURIComponent(slug)}`, locale)
    if (!response.ok) return null
    const payload = await readEnvelope<Product>(response)
    return payload?.data ?? null
  } catch {
    return null
  }
}

export async function fetchShippingMethods(locale: string): Promise<ShippingMethod[]> {
  try {
    const response = await fetchStorefrontBackend('/shipping-methods', locale)
    if (!response.ok) return []
    const payload = await readEnvelope<ShippingMethod[]>(response)
    return Array.isArray(payload?.data) ? payload.data : []
  } catch {
    return []
  }
}

export async function fetchCustomerCart(locale: string, token: string): Promise<Cart | null> {
  try {
    const response = await fetchStorefrontBackend('/cart', locale, token)
    if (!response.ok) return null
    const payload = await readEnvelope<Cart>(response)
    return payload?.data ?? null
  } catch {
    return null
  }
}
