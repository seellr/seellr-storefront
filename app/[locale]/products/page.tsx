'use client'

import Link from 'next/link'
import { use } from 'react'
import { RefreshCw, ShoppingBag } from 'lucide-react'
import { useProducts } from '@/hooks/use-products'
import type { Locale } from '@/lib/commerce/types'

export default function ProductsPage({ params }: { params: Promise<{ locale: string }> }) {
  const locale = use(params).locale as Locale
  const ar = locale === 'ar'; const products = useProducts()
  if (products.isLoading) return <main className="mx-auto grid max-w-7xl gap-5 px-5 py-20 sm:grid-cols-3">{[1, 2, 3].map((item) => <div key={item} className="h-80 animate-pulse rounded-2xl bg-muted" />)}</main>
  if (products.isError) return <main className="mx-auto flex max-w-xl flex-col items-center gap-4 px-5 py-28 text-center"><p className="font-semibold">{ar ? 'تعذر تحميل المنتجات' : 'Could not load products'}</p><button type="button" onClick={() => void products.refetch()} className="inline-flex items-center gap-2 rounded-full bg-primary px-5 py-3 text-sm font-semibold text-primary-foreground"><RefreshCw className="size-4" />{ar ? 'إعادة المحاولة' : 'Try again'}</button></main>
  const items = products.data ?? []; return <main className="mx-auto max-w-7xl px-5 py-16 sm:px-8 sm:py-24"><div className="mb-10"><span className="text-xs font-bold uppercase tracking-[0.2em] text-primary">{ar ? 'المتجر' : 'Shop'}</span><h1 className="mt-3 text-4xl font-bold">{ar ? 'كل المنتجات' : 'All products'}</h1></div>{items.length === 0 ? <div className="rounded-2xl border border-dashed p-16 text-center text-muted-foreground">{ar ? 'لا توجد منتجات متاحة بعد.' : 'No products are available yet.'}</div> : <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">{items.map((product) => <Link key={product.ulid} href={`/${locale}/products/${product.slug}`} className="group overflow-hidden rounded-2xl border bg-card transition-all hover:-translate-y-1 hover:shadow-xl"><div className="aspect-[4/3] bg-gradient-to-br from-primary/15 via-muted to-secondary" /><div className="p-5"><h2 className="font-semibold">{product.name}</h2><p className="mt-2 line-clamp-2 text-sm text-muted-foreground">{product.one_liner}</p><div className="mt-5 flex items-center justify-between"><strong>{product.sale_price ?? product.base_price} {product.currency}</strong><span className="grid size-9 place-items-center rounded-full bg-primary text-primary-foreground transition-transform group-hover:scale-110"><ShoppingBag className="size-4" /></span></div></div></Link>)}</div>}</main>
}
