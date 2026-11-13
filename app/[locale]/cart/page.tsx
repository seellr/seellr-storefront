import { Suspense } from 'react'
import { notFound } from 'next/navigation'
import { hasLocale } from 'next-intl'
import { PageRenderer } from '@/lib/theme/PageRenderer'
import { getPageLayout } from '@/lib/theme/api'
import type { StoreLocale } from '@/lib/theme/types'
import { routing } from '@/lib/i18n/routing'

async function CartContent({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params
  if (!hasLocale(routing.locales, locale)) notFound()
  const layout = await getPageLayout('cart', locale as StoreLocale)
  return <PageRenderer page={layout.page} locale={locale as StoreLocale} settings={layout.settings} />
}

export default function CartPage({ params }: PageProps<'/[locale]/cart'>) {
  return (
    <Suspense fallback={<main className="mx-auto max-w-3xl animate-pulse px-5 py-24"><div className="h-10 w-1/3 rounded bg-muted" /><div className="mt-8 h-40 rounded-2xl bg-muted" /></main>}>
      <CartContent params={params} />
    </Suspense>
  )
}
