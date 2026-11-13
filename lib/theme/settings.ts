import type { MediaReference, StoreLocale, ThemeSetting } from './types'

const API_BASE = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:8000/api/v1'
const MEDIA_BASE =
  process.env.NEXT_PUBLIC_STORAGE_URL
  ?? API_BASE.replace(/\/api\/v\d+\/?$/, '')

export function resolveMediaUrl(value: string | null | undefined): string {
  if (!value) return ''
  const url = value.trim()
  if (!url) return ''
  if (/^(https?:)?\/\//i.test(url) || /^(data|blob):/i.test(url)) return url
  return `${MEDIA_BASE}${url.startsWith('/') ? '' : '/'}${url}`
}

export function isLocalizedValue(value: ThemeSetting | undefined): value is { ar?: string; en?: string } {
  return typeof value === 'object' && value !== null && !Array.isArray(value) && ('ar' in value || 'en' in value)
}

export function isMediaReference(value: ThemeSetting | undefined): value is MediaReference {
  return typeof value === 'object' && value !== null && !Array.isArray(value) && ('url' in value || 'thumb_url' in value)
}

/** Returns the raw value, distinguishing "missing key" (undefined) from explicit null. */
export function settingValue(
  settings: Record<string, ThemeSetting>,
  key: string,
): ThemeSetting | undefined {
  return settings[key]
}

/** Reads localized copy. A cleared value stays empty instead of masking with a default. */
export function settingText(
  settings: Record<string, ThemeSetting>,
  key: string,
  locale: StoreLocale,
  fallback = '',
): string {
  if (!(key in settings)) return fallback
  const value = settings[key]
  if (typeof value === 'string') return value
  if (isLocalizedValue(value)) return value[locale] ?? value.ar ?? value.en ?? ''
  return ''
}

export function settingString(
  settings: Record<string, ThemeSetting>,
  key: string,
  fallback = '',
): string {
  if (!(key in settings)) return fallback
  const value = settings[key]
  if (typeof value === 'string') return value
  if (typeof value === 'number' || typeof value === 'boolean') return String(value)
  return ''
}

export function settingNumber(
  settings: Record<string, ThemeSetting>,
  key: string,
  fallback = 0,
): number {
  if (!(key in settings)) return fallback
  const value = settings[key]
  if (typeof value === 'number' && Number.isFinite(value)) return value
  if (typeof value === 'string' && value.trim() !== '') {
    const parsed = Number(value)
    return Number.isFinite(parsed) ? parsed : fallback
  }
  return fallback
}

export function settingBoolean(
  settings: Record<string, ThemeSetting>,
  key: string,
  fallback = false,
): boolean {
  if (!(key in settings)) return fallback
  const value = settings[key]
  if (typeof value === 'boolean') return value
  if (typeof value === 'string') return value === 'true' || value === '1'
  if (typeof value === 'number') return value !== 0
  return fallback
}

export function settingList<T = ThemeSetting>(
  settings: Record<string, ThemeSetting>,
  key: string,
): T[] {
  const value = settings[key]
  return Array.isArray(value) ? (value as T[]) : []
}

/** Media settings may be a URL string, a media reference object or a list of either. */
export function mediaUrl(value: ThemeSetting | undefined): string {
  if (typeof value === 'string') return resolveMediaUrl(value)
  if (isMediaReference(value)) return resolveMediaUrl(value.url ?? value.thumb_url ?? '')
  if (Array.isArray(value)) {
    for (const entry of value) {
      const url = mediaUrl(entry)
      if (url) return url
    }
  }
  return ''
}

export function settingImageUrl(
  settings: Record<string, ThemeSetting>,
  keys: string[],
): string {
  for (const key of keys) {
    const url = mediaUrl(settings[key])
    if (url) return url
  }
  return ''
}

export function settingProductIds(settings: Record<string, ThemeSetting>, key = 'products'): string[] {
  const values = Array.isArray(settings[key]) ? settings[key] as ThemeSetting[] : [settings[key]]
  const ids: string[] = []
  for (const value of values) {
    if (typeof value === 'string' && value.trim()) ids.push(value.trim())
    if (isMediaReference(value) && typeof value.ulid === 'string') ids.push(value.ulid)
    if (typeof value === 'object' && value !== null && !Array.isArray(value) && typeof (value as { ulid?: unknown }).ulid === 'string') {
      ids.push((value as { ulid: string }).ulid)
    }
  }
  return [...new Set(ids)]
}

/** Prefixes internal root-relative links with the active locale when needed. */
export function localizeHref(href: string, locale: StoreLocale): string {
  const value = href.trim()
  if (!value) return ''
  if (/^(https?:)?\/\//i.test(value) || /^(mailto:|tel:|#)/i.test(value)) return value
  if (/^\/(ar|en)(\/|$)/.test(value)) return value
  return `/${locale}${value.startsWith('/') ? '' : '/'}${value}`
}

const FONT_FAMILIES: Record<string, string> = {
  alexandria: '"Alexandria", sans-serif',
  roboto: '"Roboto", sans-serif',
  cairo: '"Alexandria", sans-serif',
  inter: 'Inter, system-ui, sans-serif',
  poppins: 'Poppins, system-ui, sans-serif',
  playfair: '"Playfair Display", Georgia, serif',
}

export function fontFamily(value: string | undefined, fallback: string): string {
  if (!value) return fallback
  return FONT_FAMILIES[value.toLowerCase()] ?? `"${value}", ${fallback}`
}
