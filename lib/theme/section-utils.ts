import type { StoreLocale, ThemeSetting } from './types'

// Kept for backwards compatibility with the first storefront pass. New code
// should import from `./settings`, which has richer readers and media support.

export function settingText(
  settings: Record<string, ThemeSetting>,
  key: string,
  locale: StoreLocale,
  fallback = '',
): string {
  const value = settings[key]
  if (typeof value === 'string') return value
  if (typeof value === 'object' && value !== null && !Array.isArray(value)) {
    const localized = value as Partial<Record<StoreLocale, unknown>>
    const text = localized[locale]
    if (typeof text === 'string') return text
  }
  return fallback
}

export function settingString(
  settings: Record<string, ThemeSetting>,
  key: string,
  fallback = '',
): string {
  const value = settings[key]
  return typeof value === 'string' ? value : fallback
}
