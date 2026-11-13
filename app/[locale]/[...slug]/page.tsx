import { Suspense } from 'react'
import { notFound } from 'next/navigation'
import { hasLocale } from 'next-intl'
import { PageRenderer } from '@/lib/theme/PageRenderer'
import { getCustomPageLayout, getPageLayout } from '@/lib/theme/api'
import type { StoreLocale } from '@/lib/theme/types'
import { routing } from '@/lib/i18n/routing'

async function CustomContent({ params }: { params: Promise<{ locale: string; slug: string[] }> }) {
  const { locale, slug } = await params
  if (!hasLocale(routing.locales, locale)) notFound()
  const path = slug.join('/')
  const layout = await getCustomPageLayout(path, locale as StoreLocale)

  // A missing custom page renders the theme's 404 layout rather than a blank
  // page. The shell (header/footer) still comes from the published theme.
  if (layout.page.sections.length === 0) {
    const notFoundLayout = await getPageLayout('404', locale as StoreLocale)
    return <PageRenderer page={notFoundLayout.page} locale={locale as StoreLocale} settings={notFoundLayout.settings} />
  }

  return <PageRenderer page={layout.page} locale={locale as StoreLocale} settings={layout.settings} />
}

export default function CustomPage({ params }: { params: Promise<{ locale: string; slug: string[] }> }) {
  return (
    <Suspense fallback={<main className="mx-auto max-w-4xl animate-pulse px-5 py-24"><div className="h-12 w-2/3 rounded bg-muted" /><div className="mt-6 h-64 rounded-2xl bg-muted" /></main>}>
      <CustomContent params={params} />
    </Suspense>
  )
}
