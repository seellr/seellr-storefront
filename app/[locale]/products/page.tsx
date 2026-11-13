import { Suspense } from 'react'
import { notFound } from 'next/navigation'
import { hasLocale } from 'next-intl'
import { PageRenderer } from '@/lib/theme/PageRenderer'
import { getPageLayout } from '@/lib/theme/api'
import { fetchPublishedProducts } from '@/lib/commerce/server'
import type { StoreLocale } from '@/lib/theme/types'
import { routing } from '@/lib/i18n/routing'

function ListSkeleton() {
  return (
    <main className="min-h-dvh animate-pulse">
      <div className="h-16 border-b bg-muted/40" />
      <div className="mx-auto grid max-w-7xl gap-5 px-5 py-20 sm:grid-cols-2 lg:grid-cols-3">
        {[0, 1, 2, 3, 4, 5].map((item) => <div key={item} className="h-80 rounded-2xl bg-muted" />)}
      </div>
    </main>
  )
}

async function ProductsContent({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params
  if (!hasLocale(routing.locales, locale)) notFound()
  const [layout, products] = await Promise.all([
    getPageLayout('product_list', locale as StoreLocale),
    fetchPublishedProducts(locale as StoreLocale, { perPage: 48 }),
  ])
  return <PageRenderer page={layout.page} locale={locale as StoreLocale} settings={layout.settings} products={products} />
}

export default function ProductsPage({ params }: PageProps<'/[locale]/products'>) {
  return (
    <Suspense fallback={<ListSkeleton />}>
      <ProductsContent params={params} />
    </Suspense>
  )
}
