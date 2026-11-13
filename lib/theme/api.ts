import 'server-only'
import { fetchStorefrontBackend, readBackendJson } from '@/lib/backend/client'
import { defaultFooter, defaultHeader, defaultSections } from './defaults'
import { normalizePage, normalizeTheme } from './normalize'
import type { PublishedTheme, StoreLocale, StorefrontPage, ThemeSection, ThemeSettings } from './types'

export interface StorefrontPageLayout {
  page: StorefrontPage
  settings: ThemeSettings
  theme: PublishedTheme['theme']
}

async function readPageResponse(response: Response): Promise<StorefrontPage | null> {
  const payload = await readBackendJson<unknown>(response)
  if (!response.ok) return null
  return normalizePage(payload)
}

export async function getPublishedTheme(locale: StoreLocale): Promise<PublishedTheme> {
  try {
    const response = await fetchStorefrontBackend('/storefront/theme', locale)
    if (!response.ok) return { settings: {} }
    const payload = await readBackendJson<unknown>(response)
    return normalizeTheme(payload)
  } catch {
    return { settings: {} }
  }
}

export async function getPublishedPage(type: string, locale: StoreLocale): Promise<StorefrontPage | null> {
  try {
    const response = await fetchStorefrontBackend(`/storefront/pages/${encodeURIComponent(type)}`, locale)
    return await readPageResponse(response)
  } catch {
    return null
  }
}

export async function getPublishedCustomPage(slug: string, locale: StoreLocale): Promise<StorefrontPage | null> {
  try {
    const response = await fetchStorefrontBackend(`/storefront/pages/custom/${encodeURIComponent(slug)}`, locale)
    return await readPageResponse(response)
  } catch {
    return null
  }
}

function headerSections(page: StorefrontPage | null): ThemeSection[] {
  return (page?.sections ?? []).filter((section) => section.type === 'header')
}

function footerSections(page: StorefrontPage | null): ThemeSection[] {
  return (page?.sections ?? []).filter((section) => section.type === 'footer')
}

/**
 * A page's published layout is composed from the page itself plus the reusable
 * `header` and `footer` pages. The API may already include them; dedupe so a
 * page never renders two headers or two footers.
 */
export async function getPageLayout(type: string, locale: StoreLocale): Promise<StorefrontPageLayout> {
  const [main, headerPage, footerPage, theme] = await Promise.all([
    getPublishedPage(type, locale),
    getPublishedPage('header', locale),
    getPublishedPage('footer', locale),
    getPublishedTheme(locale),
  ])

  // A published page can be missing (new store) or empty. Fall back to a
  // schema-aligned default so the route still renders.
  const mainSections = main && main.sections.length > 0 ? main.sections : defaultSections(type)
  const hasHeader = mainSections.some((section) => section.type === 'header')
  const hasFooter = mainSections.some((section) => section.type === 'footer')

  const header = headerSections(headerPage)
  const footer = footerSections(footerPage)

  const sections: ThemeSection[] = [
    ...(hasHeader ? [] : header.length > 0 ? header : [defaultHeader()]),
    ...mainSections,
    ...(hasFooter ? [] : footer.length > 0 ? footer : [defaultFooter()]),
  ]

  const page: StorefrontPage = main
    ? { ...main, sections }
    : {
        id: `default-${type}`,
        type,
        sections,
      }

  return { page, settings: theme.settings, theme: theme.theme }
}

export async function getCustomPageLayout(slug: string, locale: StoreLocale): Promise<StorefrontPageLayout> {
  const [main, headerPage, footerPage, theme] = await Promise.all([
    getPublishedCustomPage(slug, locale),
    getPublishedPage('header', locale),
    getPublishedPage('footer', locale),
    getPublishedTheme(locale),
  ])
  if (!main) return { page: { id: slug, type: 'custom', slug, sections: [] }, settings: theme.settings, theme: theme.theme }

  const mainSections = main.sections
  const header = headerSections(headerPage)
  const footer = footerSections(footerPage)
  const sections: ThemeSection[] = [
    ...(mainSections.some((section) => section.type === 'header') ? [] : header.length > 0 ? header : [defaultHeader()]),
    ...mainSections,
    ...(mainSections.some((section) => section.type === 'footer') ? [] : footer.length > 0 ? footer : [defaultFooter()]),
  ]

  return { page: { ...main, sections }, settings: theme.settings, theme: theme.theme }
}
