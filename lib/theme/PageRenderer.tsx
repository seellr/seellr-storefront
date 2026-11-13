'use client'

import type { CSSProperties } from 'react'
import type { Product } from '@/lib/commerce/types'
import type { StoreLocale, StorefrontPage, ThemeSettings } from './types'
import { storefrontSections } from './sections'
import { fontFamily } from './settings'

function sectionsWithAnnouncementAtTop(sections: StorefrontPage['sections']) {
  const visible = sections.filter((section) => !section.hidden)
  const announcements = visible.filter((section) => section.type === 'announcement')
  const rest = visible.filter((section) => section.type !== 'announcement')
  const headerIndex = rest.findIndex((section) => section.type === 'header')
  if (headerIndex < 0) return [...announcements, ...rest]
  return [...rest.slice(0, headerIndex), ...announcements, ...rest.slice(headerIndex)]
}

function themeStyle(settings: ThemeSettings): CSSProperties {
  const style: Record<string, string> = {
    '--theme-primary': settings.primary_color ?? 'oklch(0.55 0.22 264)',
    '--theme-secondary': settings.secondary_color ?? 'oklch(0.93 0.01 264)',
    '--theme-background': settings.background_color ?? 'var(--background)',
    '--theme-foreground': settings.foreground_color ?? 'var(--foreground)',
    fontFamily: fontFamily(settings.body_font, 'var(--font-body)'),
  }
  if (settings.heading_font) {
    style['--font-heading'] = fontFamily(settings.heading_font, 'var(--font-heading)')
  }
  return style as CSSProperties
}

interface PageRendererProps {
  page: StorefrontPage
  locale: StoreLocale
  settings?: ThemeSettings
  selectedSectionId?: string | null
  /** Server-provided products for product sections. Undefined means "fetch in the browser" (preview). */
  products?: Product[] | null
  /** Product being viewed on a product page. */
  product?: Product | null
}

export function PageRenderer({
  page,
  locale,
  settings = {},
  selectedSectionId,
  products,
  product,
}: PageRendererProps) {
  return (
    <main
      lang={locale}
      dir={locale === 'ar' ? 'rtl' : 'ltr'}
      style={themeStyle(settings)}
      className="min-h-full bg-[var(--theme-background)] text-[var(--theme-foreground)] [font-family:var(--theme-font-body,var(--font-body))]"
    >
      {sectionsWithAnnouncementAtTop(page.sections).map((section) => {
        const Component = storefrontSections[section.type]
        if (!Component) return null
        const isSelected = selectedSectionId === section.id
        return (
          <div
            key={section.id}
            data-section-id={section.id}
            data-section-type={section.type}
            data-selected={isSelected || undefined}
            className={`${isSelected ? 'outline-2 outline-primary outline-offset-[-2px]' : ''} ${section.type === 'header' ? 'sticky top-0 z-30' : ''}`.trim()}
          >
            <Component section={section} locale={locale} products={products} product={product} />
          </div>
        )
      })}
    </main>
  )
}
