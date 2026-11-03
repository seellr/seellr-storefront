'use client'

import type { ApiEnvelope, Cart, Product, User } from './types'

let guestToken: string | null = null
function getGuestToken(): string { if (guestToken) return guestToken; const key = 'seellr_guest_token'; const existing = window.localStorage.getItem(key); guestToken = existing ?? crypto.randomUUID(); if (!existing) window.localStorage.setItem(key, guestToken); return guestToken }
async function request<T>(path: string, init: RequestInit = {}, guest = false): Promise<ApiEnvelope<T>> { const response = await fetch(path, { ...init, headers: { Accept: 'application/json', 'Content-Type': 'application/json', ...(guest ? { 'X-Guest-Token': getGuestToken() } : {}), ...init.headers } }); const text = await response.text(); let payload: ApiEnvelope<T> = { success: response.ok }; try { if (text) payload = JSON.parse(text) as ApiEnvelope<T> } catch { throw Object.assign(new Error('Invalid response from service'), { code: 'bad_backend_shape', status: 502 }) } if (response.status === 401) { const next = `${window.location.pathname}${window.location.search}`; const locale = window.location.pathname.split('/')[1] === 'en' ? 'en' : 'ar'; window.location.replace(`/${locale}/login?next=${encodeURIComponent(next)}`) } if (!response.ok || !payload.success) throw Object.assign(new Error(payload.message ?? 'Request failed'), { code: payload.error_code, fields: payload.errors, status: response.status }); return payload }
export const commerceClient = {
  products: (query = '') => request<Product[]>(`/api/public/products${query}`),
  product: (slug: string) => request<Product>(`/api/public/products/${encodeURIComponent(slug)}`),
  guestCart: () => request<Cart>('/api/guest/cart', {}, true),
  addGuestItem: (product_ulid: string, quantity: number) => request<Cart>('/api/guest/cart/items', { method: 'POST', body: JSON.stringify({ product_ulid, quantity }) }, true),
  applyGuestCoupon: (code: string) => request<Cart>('/api/guest/cart/coupon', { method: 'POST', body: JSON.stringify({ code }) }, true),
  removeGuestCoupon: () => request<Cart>('/api/guest/cart/coupon', { method: 'DELETE' }, true),
  login: (identifier: string, password: string) => request<{ user: User }>('/api/customer/auth/login', { method: 'POST', body: JSON.stringify({ identifier, password }) }),
  me: () => request<User>('/api/customer/auth/me'),
  logout: () => request<null>('/api/customer/auth/logout', { method: 'POST' }),
  register: (body: Record<string, unknown>) => request<{ user?: User }>('/api/customer/auth/register', { method: 'POST', body: JSON.stringify(body) }),
  forgotPassword: (email: string) => request<null>('/api/customer/auth/password/forgot', { method: 'POST', body: JSON.stringify({ email }) }),
  resetPassword: (body: Record<string, unknown>) => request<null>('/api/customer/auth/password/reset', { method: 'POST', body: JSON.stringify(body) }),
  cart: () => request<Cart>('/api/customer/cart'),
  addCartItem: (product_ulid: string, quantity: number) => request<Cart>('/api/customer/cart/items', { method: 'POST', body: JSON.stringify({ product_ulid, quantity }) }),
  removeCartItem: (itemUlid: string) => request<Cart>(`/api/customer/cart/items/${encodeURIComponent(itemUlid)}`, { method: 'DELETE' }),
  cartSummary: () => request<unknown>('/api/customer/cart/summary'),
  applyCoupon: (code: string) => request<Cart>('/api/customer/cart/coupon', { method: 'POST', body: JSON.stringify({ code }) }),
  removeCoupon: () => request<Cart>('/api/customer/cart/coupon', { method: 'DELETE' }),
  shippingMethods: () => request<unknown[]>('/api/customer/shipping-methods'),
  createOrder: (body: Record<string, unknown>) => request<{ ulid: string }>('/api/customer/orders', { method: 'POST', body: JSON.stringify(body) }),
  payOrder: (ulid: string, idempotencyKey: string, method?: string) => request<{ provider: string; redirect_url?: string; iframe_token?: string; client_secret?: string }>(`/api/customer/orders/${encodeURIComponent(ulid)}/pay`, { method: 'POST', headers: { 'Idempotency-Key': idempotencyKey }, body: JSON.stringify(method ? { method } : {}) }),
  orders: () => request<import('./types').Order[]>('/api/customer/orders'),
  order: (ulid: string) => request<import('./types').Order>(`/api/customer/orders/${encodeURIComponent(ulid)}`),
  invoice: (ulid: string) => request<unknown>(`/api/customer/orders/${encodeURIComponent(ulid)}/invoice`),
  createShipment: (ulid: string, body: Record<string, unknown>) => request<unknown>(`/api/customer/orders/${encodeURIComponent(ulid)}/shipment`, { method: 'POST', body: JSON.stringify(body) }),
  trackShipment: (shipmentUlid: string) => request<unknown>(`/api/public/shipments/${encodeURIComponent(shipmentUlid)}/track`),
  funnelNext: (ulid: string) => request<unknown>(`/api/customer/funnel/${encodeURIComponent(ulid)}/next-step`),
  decideOffer: (ulid: string, offer: 'oto' | 'downsell', accepted: boolean) => request<unknown>(`/api/customer/funnel/${encodeURIComponent(ulid)}/${offer}/decide`, { method: 'POST', body: JSON.stringify({ accepted }) }),
  delivery: (productUlid: string) => request<unknown>(`/api/customer/delivery/${encodeURIComponent(productUlid)}`),
  downloadDelivery: (assetUlid: string) => request<unknown>(`/api/customer/delivery/download/${encodeURIComponent(assetUlid)}`),
  quiz: (slug: string) => request<unknown>(`/api/public/quiz/${encodeURIComponent(slug)}`),
  submitQuiz: (slug: string, body: Record<string, unknown>) => request<unknown>(`/api/public/quiz/${encodeURIComponent(slug)}`, { method: 'POST', body: JSON.stringify(body) }),
  aiTool: (slug: string) => request<unknown>(`/api/public/ai-tools/${encodeURIComponent(slug)}`),
  runAiTool: (slug: string, body: Record<string, unknown>) => request<unknown>(`/api/customer/ai-tools/${encodeURIComponent(slug)}`, { method: 'POST', body: JSON.stringify(body) }),
  trackAnalytics: (body: Record<string, unknown>) => request<null>('/api/public/analytics/track', { method: 'POST', body: JSON.stringify(body) }),
  unsubscribe: (email: string) => request<null>('/api/public/email/unsubscribe', { method: 'POST', body: JSON.stringify({ email }) }),
}
