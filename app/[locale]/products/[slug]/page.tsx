import { Suspense } from 'react'
import { notFound } from 'next/navigation'
import { hasLocale } from 'next-intl'
import type { Metadata } from 'next'
import { PageRenderer } from '@/lib/theme/PageRenderer'
import { getPageLayout } from '@/lib/theme/api'
import { fetchPublishedProduct, fetchPublishedProducts } from '@/lib/commerce/server'
import type { StoreLocale } from '@/lib/theme/types'
import { routing } from '@/lib/i18n/routing'

type ProductRouteProps = PageProps<'/[locale]/products/[slug]'>

function ProductSkeleton() {
  return (
    <main className="mx-auto max-w-7xl animate-pulse px-5 py-24">
      <div className="grid gap-10 md:grid-cols-2">
        <div className="aspect-square rounded-3xl bg-muted" />
        <div className="space-y-5">
          <div className="h-10 w-2/3 rounded bg-muted" />
          <div className="h-24 rounded bg-muted" />
          <div className="h-12 w-40 rounded-full bg-muted" />
        </div>
      </div>
    </main>
  )
}

async function ProductContent({ params }: { params: Promise<{ locale: string; slug: string }> }) {
  const { locale, slug } = await params
  if (!hasLocale(routing.locales, locale)) notFound()
  const [product, layout, related] = await Promise.all([
    fetchPublishedProduct(slug, locale),
    getPageLayout('product', locale as StoreLocale),
    fetchPublishedProducts(locale),
  ])
  if (!product) notFound()

  return (
    <PageRenderer
      page={layout.page}
      locale={locale as StoreLocale}
      settings={layout.settings}
      product={product}
      products={related}
    />
  )
}

export async function generateMetadata({ params }: ProductRouteProps): Promise<Metadata> {
  const { locale, slug } = await params
  if (!hasLocale(routing.locales, locale)) return {}
  const product = await fetchPublishedProduct(slug, locale as StoreLocale)
  if (!product) return {}
  return {
    title: product.seo_meta?.meta_title ?? product.name,
    description: product.seo_meta?.meta_description ?? product.one_liner ?? undefined,
    openGraph: product.seo_meta?.og_image_url ? { images: [product.seo_meta.og_image_url] } : undefined,
  }
}

export default function ProductPage({ params }: ProductRouteProps) {
  return (
    <Suspense fallback={<ProductSkeleton />}>
      <ProductContent params={params} />
    </Suspense>
  )
}
