import { hasLocale } from 'next-intl'
import { notFound } from 'next/navigation'
import { routing } from '@/lib/i18n/routing'
import { CommerceQueryProvider } from '@/components/commerce/query-provider'

export function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }))
}

export default async function LocaleLayout({ children, params }: LayoutProps<'/[locale]'>) {
  const { locale } = await params
  if (!hasLocale(routing.locales, locale)) notFound()

  return <CommerceQueryProvider><div lang={locale} dir={locale === 'ar' ? 'rtl' : 'ltr'} className="min-h-full">{children}</div></CommerceQueryProvider>
}
