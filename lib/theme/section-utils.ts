import type { StoreLocale, ThemeSetting } from './types'
export function settingText(settings: Record<string, ThemeSetting>, key: string, locale: StoreLocale, fallback = ''): string { const value = settings[key]; if (typeof value === 'object' && value !== null && 'ar' in value && 'en' in value) return value[locale] || fallback; return typeof value === 'string' ? value : fallback }
export function settingString(settings: Record<string, ThemeSetting>, key: string, fallback = ''): string { const value = settings[key]; return typeof value === 'string' ? value : fallback }
