import { Suspense } from 'react'
import { notFound } from 'next/navigation'
import { hasLocale } from 'next-intl'
import { PageRenderer } from '@/lib/theme/PageRenderer'
import { getPageLayout } from '@/lib/theme/api'
import { fetchPublishedProducts } from '@/lib/commerce/server'
import type { StoreLocale } from '@/lib/theme/types'
import { routing } from '@/lib/i18n/routing'

function HomeSkeleton() {
  return (
    <main className="min-h-dvh animate-pulse">
      <div className="h-16 border-b bg-muted/40" />
      <div className="mx-auto max-w-4xl px-5 py-28 text-center">
        <div className="mx-auto h-10 w-2/3 rounded bg-muted" />
        <div className="mx-auto mt-4 h-4 w-1/2 rounded bg-muted" />
      </div>
      <div className="mx-auto grid max-w-7xl gap-5 px-5 pb-24 sm:grid-cols-3">
        {[0, 1, 2].map((item) => <div key={item} className="h-72 rounded-2xl bg-muted" />)}
      </div>
    </main>
  )
}

async function HomeContent({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params
  if (!hasLocale(routing.locales, locale)) notFound()
  const [layout, products] = await Promise.all([
    getPageLayout('home', locale as StoreLocale),
    fetchPublishedProducts(locale as StoreLocale),
  ])
  console.log(products)
  return <PageRenderer page={layout.page} locale={locale as StoreLocale} settings={layout.settings} products={products} />
}

export default function LocalizedHome({ params }: PageProps<'/[locale]'>) {
  return (
    <Suspense fallback={<HomeSkeleton />}>
      <HomeContent params={params} />
    </Suspense>
  )
}
