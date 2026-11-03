import 'server-only'
import { fetchStorefrontBackend, readBackendJson } from '@/lib/backend/client'
import type { StoreLocale, StorefrontPage, ThemeSettings } from './types'

interface ThemeResponse { success?: boolean; data?: { settings?: ThemeSettings }; settings?: ThemeSettings }
interface PageResponse { success?: boolean; data?: StorefrontPage }

export async function getPublishedTheme(locale: StoreLocale): Promise<ThemeSettings> {
  try {
    const response = await fetchStorefrontBackend('/storefront/theme', locale)
    const payload = await readBackendJson<ThemeResponse>(response)
    return payload?.data?.settings ?? payload?.settings ?? {}
  } catch {
    return {}
  }
}

export async function getPublishedPage(type: string, locale: StoreLocale): Promise<StorefrontPage | null> {
  try {
    const response = await fetchStorefrontBackend(`/storefront/pages/${encodeURIComponent(type)}`, locale)
    const payload = await readBackendJson<PageResponse>(response)
    return response.ok ? payload?.data ?? null : null
  } catch {
    return null
  }
}
