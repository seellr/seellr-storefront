'use client'

import { useQuery } from '@tanstack/react-query'
import { ArrowRight, Minus, Plus, RefreshCw, ShoppingBag } from 'lucide-react'
import { use } from 'react'
import { commerceClient } from '@/lib/commerce/client'

export default function CartPage({ params }: { params: Promise<{ locale: string }> }) {
  const locale = use(params).locale; const ar = locale === 'ar'; const cart = useQuery({ queryKey: ['guest-cart'], queryFn: async () => (await commerceClient.guestCart()).data })
  if (cart.isLoading) return <main className="mx-auto max-w-3xl animate-pulse px-5 py-24"><div className="h-10 w-1/3 rounded bg-muted" /><div className="mt-8 h-40 rounded-2xl bg-muted" /></main>
  if (cart.isError) return <main className="mx-auto flex max-w-xl flex-col items-center gap-4 px-5 py-28 text-center"><ShoppingBag className="size-10 text-muted-foreground" /><p>{ar ? 'تعذر تحميل السلة.' : 'Could not load your cart.'}</p><button type="button" onClick={() => void cart.refetch()} className="inline-flex items-center gap-2 rounded-full border px-5 py-3 text-sm font-semibold"><RefreshCw className="size-4" />{ar ? 'إعادة المحاولة' : 'Try again'}</button></main>
  const items = cart.data?.items ?? []; return <main className="mx-auto max-w-4xl px-5 py-16 sm:px-8 sm:py-24"><h1 className="text-4xl font-bold">{ar ? 'سلة التسوق' : 'Your cart'}</h1>{items.length === 0 ? <div className="mt-10 rounded-2xl border border-dashed p-16 text-center text-muted-foreground">{ar ? 'السلة فارغة.' : 'Your cart is empty.'}</div> : <div className="mt-10 space-y-4">{items.map((item) => <article key={item.product_ulid} className="flex items-center justify-between gap-4 rounded-2xl border bg-card p-5"><div><h2 className="font-semibold">{item.product_name}</h2><p className="mt-1 text-sm text-muted-foreground">{item.unit_price} {item.currency}</p></div><div className="flex items-center gap-4"><span className="flex items-center gap-3 rounded-full border px-3 py-2 text-sm"><Minus className="size-3" />{item.quantity}<Plus className="size-3" /></span><strong>{item.total_price} {item.currency}</strong></div></article>)}<button type="button" className="mt-5 inline-flex items-center gap-2 rounded-full bg-primary px-6 py-3 text-sm font-semibold text-primary-foreground">{ar ? 'المتابعة للدفع' : 'Continue to checkout'}<ArrowRight className="size-4 rtl:-scale-x-100" /></button></div>}</main>
}
