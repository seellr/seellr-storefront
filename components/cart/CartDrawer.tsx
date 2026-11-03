'use client'

import Link from 'next/link'
import { ShoppingBag, X } from 'lucide-react'
import { useEffect, useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { commerceClient } from '@/lib/commerce/client'
import type { StoreLocale } from '@/lib/theme/types'

export function CartDrawer({ locale }: { locale: StoreLocale }) {
  const [open, setOpen] = useState(false)
  const ar = locale === 'ar'
  const cart = useQuery({
    queryKey: ['guest-cart', 'drawer'],
    queryFn: async () => (await commerceClient.guestCart()).data,
    enabled: open,
  })
  const items = cart.data?.items ?? []
  const itemCount = items.reduce((total, item) => total + item.quantity, 0)

  useEffect(() => {
    if (!open) return
    const onKeyDown = (event: KeyboardEvent) => { if (event.key === 'Escape') setOpen(false) }
    document.addEventListener('keydown', onKeyDown)
    return () => document.removeEventListener('keydown', onKeyDown)
  }, [open])

  return <>
    <button type="button" onClick={() => setOpen(true)} className="relative grid size-10 place-items-center rounded-full border border-border bg-card transition-colors hover:bg-muted" aria-label={ar ? 'فتح السلة' : 'Open cart'} aria-expanded={open}>
      <ShoppingBag className="size-4" />
      <span className="absolute -end-1 -top-1 grid size-4 place-items-center rounded-full bg-primary text-[10px] text-primary-foreground">{itemCount}</span>
    </button>
    {open && <div data-preview-interactive-ignore className="fixed inset-0 z-50 h-dvh" role="dialog" aria-modal="true" aria-label={ar ? 'سلة التسوق' : 'Shopping cart'}>
      <button type="button" onClick={() => setOpen(false)} className="absolute inset-0 cursor-default bg-slate-950/35 backdrop-blur-[2px]" aria-label={ar ? 'إغلاق السلة' : 'Close cart'} />
      <aside className="fixed inset-y-0 end-0 flex h-dvh max-h-dvh w-full max-w-md flex-col overflow-hidden border-s border-border bg-background shadow-2xl shadow-slate-950/20" dir={ar ? 'rtl' : 'ltr'}>
        <div className="relative overflow-hidden border-b border-border bg-gradient-to-br from-primary/10 via-background to-secondary/20 px-5 pb-5 pt-6">
          <div className="absolute -end-12 -top-16 size-40 rounded-full bg-primary/15 blur-3xl" />
          <div className="relative flex items-start justify-between gap-4"><div><p className="text-xs font-bold uppercase tracking-[0.2em] text-primary">{ar ? 'سلتك' : 'Your bag'}</p><h2 className="mt-2 text-2xl font-bold tracking-tight">{ar ? 'سلة التسوق' : 'Shopping cart'}</h2><p className="mt-1 text-sm text-muted-foreground">{ar ? 'راجع اختياراتك قبل إتمام الطلب' : 'Review your picks before checkout'}</p></div><button type="button" onClick={() => setOpen(false)} className="grid size-10 place-items-center rounded-full border border-border/80 bg-background/80 transition-colors hover:bg-muted" aria-label={ar ? 'إغلاق' : 'Close'}><X className="size-4" /></button></div>
          <div className="relative mt-5 flex items-center justify-between rounded-2xl border border-primary/15 bg-background/65 px-4 py-3 text-sm backdrop-blur"><span className="text-muted-foreground">{ar ? 'المنتجات في السلة' : 'Items in your cart'}</span><strong className="rounded-full bg-primary px-2.5 py-1 text-xs text-primary-foreground">{itemCount}</strong></div>
        </div>
        <div className="min-h-0 flex-1 overflow-y-auto px-5 py-5">
          {cart.isLoading ? <div className="space-y-3"><div className="h-20 animate-pulse rounded-2xl bg-muted" /><div className="h-20 animate-pulse rounded-2xl bg-muted" /></div> : cart.isError ? <div className="rounded-2xl border border-dashed p-6 text-center text-sm text-muted-foreground">{ar ? 'تعذر تحميل السلة.' : 'Could not load your cart.'}</div> : items.length === 0 ? <div className="flex min-h-60 flex-col items-center justify-center text-center"><span className="grid size-14 place-items-center rounded-2xl bg-primary/10 text-primary"><ShoppingBag className="size-6" /></span><p className="mt-4 font-semibold">{ar ? 'السلة فارغة' : 'Your cart is empty'}</p><p className="mt-1 text-sm text-muted-foreground">{ar ? 'أضف منتجاتك المفضلة للبدء.' : 'Add your favorite products to get started.'}</p></div> : <div className="space-y-3">{items.map((item) => <article key={item.product_ulid} className="flex gap-3 rounded-2xl border border-border/70 bg-card p-3"><div className="grid size-16 shrink-0 place-items-center rounded-xl bg-gradient-to-br from-primary/15 via-muted to-secondary text-xs font-bold text-primary/60">{item.product_name.slice(0, 2)}</div><div className="min-w-0 flex-1"><h3 className="truncate text-sm font-semibold">{item.product_name}</h3><p className="mt-1 text-sm text-muted-foreground">{item.unit_price} {item.currency}</p><p className="mt-2 text-xs text-muted-foreground">{ar ? 'الكمية' : 'Quantity'}: {item.quantity}</p></div><strong className="text-sm">{item.total_price} {item.currency}</strong></article>)}</div>}
        </div>
        <div className="border-t border-border bg-background/95 p-5 shadow-[0_-12px_30px_-24px_rgba(15,23,42,0.5)] backdrop-blur">
          <Link href={`/${locale}/cart`} onClick={() => setOpen(false)} className="flex w-full items-center justify-center rounded-2xl bg-primary px-5 py-3.5 text-sm font-bold text-primary-foreground shadow-lg shadow-primary/20 transition-all hover:-translate-y-0.5 hover:shadow-xl">{ar ? 'عرض السلة والدفع' : 'View cart & checkout'}</Link>
          <button type="button" onClick={() => setOpen(false)} className="mt-2 w-full rounded-2xl px-5 py-2.5 text-sm font-semibold text-muted-foreground transition-colors hover:bg-muted hover:text-foreground">{ar ? 'متابعة التسوق' : 'Continue shopping'}</button>
        </div>
      </aside>
    </div>}
  </>
}
