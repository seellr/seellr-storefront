import { Suspense } from 'react'
import { hasLocale } from 'next-intl'
import { notFound } from 'next/navigation'
import { routing } from '@/lib/i18n/routing'
import { CommerceQueryProvider } from '@/components/commerce/query-provider'
import { FavouritesDrawer } from '@/components/favourites/FavouritesDrawer'
import { MotionProvider } from '@/components/motion/MotionProvider'

export function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }))
}

async function LocaleShell({ children, params }: LayoutProps<'/[locale]'>) {
  const { locale } = await params
  if (!hasLocale(routing.locales, locale)) notFound()
  const dir = locale === 'ar' ? 'rtl' : 'ltr'

  return (
    <div lang={locale} dir={dir} className="min-h-full">
      {/*
        The root layout owns <html>, but it cannot know the locale. Sync the
        document attributes during parsing so `:lang()` styles, screen readers
        and crawlers see the right language before the first paint.
      */}
      <script
        dangerouslySetInnerHTML={{
          __html: `document.documentElement.lang=${JSON.stringify(locale)};document.documentElement.dir=${JSON.stringify(dir)};`,
        }}
      />
      {children}
      <FavouritesDrawer locale={locale as 'ar' | 'en'} />
    </div>
  )
}
export default function LocaleLayout({ children, params }: LayoutProps<'/[locale]'>) {
  return (
    <CommerceQueryProvider>
      <MotionProvider>
        <Suspense fallback={<div className="min-h-full" />}>
          <LocaleShell params={params}>{children}</LocaleShell>
        </Suspense>
      </MotionProvider>
    </CommerceQueryProvider>
  )
}
