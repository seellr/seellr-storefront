const GUEST_TOKEN_KEY = 'seellr_guest_token'
const CUSTOMER_SESSION_COOKIE = 'customer_session'

export function getGuestToken(): string {
  if (typeof window === 'undefined') return ''
  const existing = window.localStorage.getItem(GUEST_TOKEN_KEY)
  if (existing) return existing
  const token = crypto.randomUUID()
  window.localStorage.setItem(GUEST_TOKEN_KEY, token)
  return token
}

export function hasGuestToken(): boolean {
  return typeof window !== 'undefined' && Boolean(window.localStorage.getItem(GUEST_TOKEN_KEY))
}

export function clearGuestToken(): void {
  if (typeof window === 'undefined') return
  window.localStorage.removeItem(GUEST_TOKEN_KEY)
}

export function hasCustomerSession(): boolean {
  if (typeof document === 'undefined') return false
  return document.cookie
    .split(';')
    .some((entry) => entry.trim().startsWith(`${CUSTOMER_SESSION_COOKIE}=`))
}

export function isCustomerRoute(pathname: string): boolean {
  return /^\/(?:ar|en)\/(?:account|orders|checkout|library|funnel)(?:\/|$)/.test(pathname)
}
