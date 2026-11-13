export type Scope = 'public' | 'customer' | 'guest'
export interface CommerceTarget { backendPath: string; auth: 'public' | 'customer' | 'guest' }
const ULID = '[A-Za-z0-9]{26}'
const safe = (value: string) => /^[A-Za-z0-9_./?=&%+:-]+$/.test(value) && !value.includes('..')

export function resolveCommerceTarget(scope: Scope, segments: string[], method: string): CommerceTarget | null {
  const path = segments.join('/')
  if (!safe(path)) return null
  if (scope === 'public' && method === 'GET' && (path === 'plans' || path === 'products' || path === 'product-types' || path === 'shipping-methods' || path === 'locale' || path === 'locale/defaults' || path === 'ai-tools' || /^products\/[A-Za-z0-9_-]+$/.test(path) || /^search\/products$/.test(path) || /^coupons\/.+\/validate$/.test(path) || /^shipments\/[A-Za-z0-9_-]+\/track$/.test(path) || /^quiz\/.+$/.test(path) || /^ai-tools\/.+$/.test(path))) return { backendPath: `/${path}`, auth: 'public' }
  if (scope === 'public' && method === 'POST' && (path === 'analytics/track' || path === 'email/unsubscribe')) return { backendPath: `/${path}`, auth: 'public' }
  if (scope === 'public' && path.startsWith('quiz/') && ['GET', 'POST'].includes(method)) return { backendPath: `/${path}`, auth: 'public' }
  if (scope === 'public' && path.startsWith('ai-tools') && method === 'GET') return { backendPath: `/${path}`, auth: 'public' }
  if (scope === 'guest' && (/^cart$/.test(path) || /^cart\/items(?:\/[^/]+)?$/.test(path) || path === 'cart/coupon') && ['GET', 'POST', 'DELETE'].includes(method)) return { backendPath: `/guest/${path}`, auth: 'guest' }
  if (scope === 'guest' && path === 'cart/merge' && method === 'POST') return { backendPath: '/guest/cart/merge', auth: 'guest' }
  if (scope === 'customer' && path === 'auth/login' && method === 'POST') return { backendPath: '/customer/auth/login', auth: 'public' }
  if (scope === 'customer' && path === 'auth/register' && method === 'POST') return { backendPath: '/customer/auth/register', auth: 'public' }
  if (scope === 'customer' && path === 'auth/logout' && method === 'POST') return { backendPath: '/customer/auth/logout', auth: 'customer' }
  if (scope === 'customer' && path === 'auth/me' && method === 'GET') return { backendPath: '/customer/auth/me', auth: 'customer' }
  if (scope === 'customer' && /^auth\/email\/verify\/.+\/.+$/.test(path) && method === 'GET') return { backendPath: `/customer/${path}`, auth: 'public' }
  if (scope === 'customer' && path.startsWith('auth/phone/') && method === 'POST') return { backendPath: `/customer/${path}`, auth: 'public' }
  if (scope === 'customer' && path.startsWith('auth/password/') && method === 'POST') return { backendPath: `/customer/${path}`, auth: 'public' }
  if (scope === 'customer' && path === 'cart' && method === 'GET') return { backendPath: '/cart', auth: 'customer' }
  if (scope === 'customer' && /^cart\/items\/[A-Za-z0-9_-]+$/.test(path) && ['DELETE'].includes(method)) return { backendPath: `/${path}`, auth: 'customer' }
  if (scope === 'customer' && path === 'cart/items' && method === 'POST') return { backendPath: '/cart/items', auth: 'customer' }
  if (scope === 'customer' && path === 'cart/coupon' && ['POST', 'DELETE'].includes(method)) return { backendPath: '/cart/coupon', auth: 'customer' }
  if (scope === 'customer' && path === 'cart/summary' && method === 'GET') return { backendPath: '/cart/summary', auth: 'customer' }
  if (scope === 'customer' && path === 'shipping-methods' && method === 'GET') return { backendPath: '/shipping-methods', auth: 'customer' }
  if (scope === 'customer' && path === 'orders' && ['GET', 'POST'].includes(method)) return { backendPath: '/orders', auth: 'customer' }
  if (scope === 'customer' && new RegExp(`^orders/${ULID}(?:/pay|/invoice)?$`).test(path) && ['GET', 'POST'].includes(method)) return { backendPath: `/${path}`, auth: 'customer' }
  if (scope === 'customer' && new RegExp(`^orders/${ULID}/shipment$`).test(path) && method === 'POST') return { backendPath: `/${path}`, auth: 'customer' }
  if (scope === 'customer' && new RegExp(`^funnel/${ULID}/next-step$`).test(path) && method === 'GET') return { backendPath: `/${path}`, auth: 'customer' }
  if (scope === 'customer' && new RegExp(`^funnel/${ULID}/(?:oto|downsell)/decide$`).test(path) && method === 'POST') return { backendPath: `/${path}`, auth: 'customer' }
  if (scope === 'customer' && new RegExp(`^delivery/[A-Za-z0-9_-]+$`).test(path) && method === 'GET') return { backendPath: `/${path}`, auth: 'customer' }
  if (scope === 'customer' && /^delivery\/download\/[A-Za-z0-9_-]+$/.test(path) && method === 'GET') return { backendPath: `/${path}`, auth: 'customer' }
  if (scope === 'customer' && path.startsWith('ai-tools/') && method === 'POST') return { backendPath: `/${path}`, auth: 'customer' }
  return null
}
