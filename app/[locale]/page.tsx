import { notFound } from 'next/navigation'
import { hasLocale } from 'next-intl'
import { PageRenderer } from '@/lib/theme/PageRenderer'
import type { StoreLocale, StorefrontPage } from '@/lib/theme/types'
import { routing } from '@/lib/i18n/routing'
import { getPublishedPage, getPublishedTheme } from '@/lib/theme/api'

export default async function LocalizedHome({ params }: PageProps<'/[locale]'>) {
  const { locale } = await params
  if (!hasLocale(routing.locales, locale)) notFound()

  const publishedPage = await getPublishedPage('home', locale as StoreLocale)
  const themeSettings = await getPublishedTheme(locale as StoreLocale)
  if (publishedPage) return <PageRenderer page={publishedPage} locale={locale as StoreLocale} settings={themeSettings} />

  const page: StorefrontPage = {
    id: 'home', type: 'home', sections: [
      { id: 'header', type: 'header', settings: { label: { ar: 'متجري', en: 'My store' } } },
      { id: 'announcement', type: 'announcement', settings: { message: { ar: 'شحن مجاني لفترة محدودة', en: 'Free shipping for a limited time' } } },
      { id: 'hero', type: 'hero', settings: { title: { ar: 'اكتشف ما يناسبك', en: 'Find what fits you' }, subtitle: { ar: 'تجربة متجر بسيطة وجميلة', en: 'A simple, beautiful shopping experience' } } },
      { id: 'products', type: 'product_grid', settings: { title: { ar: 'منتجات مميزة', en: 'Featured products' }, count: 3 } },
      { id: 'cta', type: 'cta', settings: { title: { ar: 'ابدأ الآن', en: 'Get started today' }, button_label: { ar: 'تسوق الآن', en: 'Shop now' } } },
      { id: 'footer', type: 'footer', settings: { label: { ar: 'جميع الحقوق محفوظة', en: 'All rights reserved' } } },
    ],
  }
  return <PageRenderer page={page} locale={locale as StoreLocale} settings={themeSettings} />
}
