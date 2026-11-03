export interface StorefrontProxyTarget { backendPath: string; rule: string }

const safeSegment = /^[A-Za-z0-9_\-./]+$/

export function resolveStorefrontTarget(segments: string[]): StorefrontProxyTarget | null {
  const path = segments.join('/')
  if (!path || !safeSegment.test(path) || path.includes('..')) return null
  if (path === 'theme') return { rule: 'theme', backendPath: '/storefront/theme' }
  if (path.startsWith('pages/custom/')) return { rule: 'custom-page', backendPath: `/storefront/pages/custom/${encodeURIComponent(path.slice('pages/custom/'.length))}` }
  if (path.startsWith('pages/')) return { rule: 'page', backendPath: `/storefront/pages/${encodeURIComponent(path.slice('pages/'.length))}` }
  if (path === 'products' || path.startsWith('products/')) return { rule: 'products', backendPath: `/${path}` }
  if (path === 'product-types' || path === 'search/products') return { rule: path, backendPath: `/${path}` }
  return null
}
