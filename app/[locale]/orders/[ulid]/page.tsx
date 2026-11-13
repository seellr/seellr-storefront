'use client'

import { Suspense, use, useEffect, useState } from 'react'
import Link from 'next/link'
import { useSearchParams } from 'next/navigation'
import { CircleCheck, RefreshCw } from 'lucide-react'
import { commerceClient } from '@/lib/commerce/client'
import type { Order } from '@/lib/commerce/types'

async function loadOrder(ulid: string): Promise<Order | null> {
  const result = await commerceClient.order(ulid).catch(() => null)
  return result?.data ?? null
}

function OrderContent({ params }: { params: Promise<{ locale: string; ulid: string }> }) {
  const { locale, ulid } = use(params)
  const ar = locale === 'ar'
  const search = useSearchParams()
  const [order, setOrder] = useState<Order | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(false)
  const success = search.get('success') === '1'

  useEffect(() => {
    let active = true
    void loadOrder(ulid).then((value) => {
      if (!active) return
      setOrder(value)
      setError(!value)
    }).finally(() => { if (active) setLoading(false) })
    return () => { active = false }
  }, [ulid])

  if (loading) {
    return <main className="mx-auto max-w-2xl animate-pulse px-5 py-24"><div className="h-10 w-1/2 rounded bg-muted" /><div className="mt-8 h-48 rounded-2xl bg-muted" /></main>
  }

  if (!order) {
    return <main className="mx-auto flex max-w-xl flex-col items-center gap-4 px-5 py-28 text-center"><p className="font-semibold">{ar ? 'تعذر العثور على الطلب.' : 'Order not found.'}</p><Link href={`/${locale}/orders`} className="rounded-full border px-5 py-2.5 text-sm font-semibold">{ar ? 'طلباتي' : 'My orders'}</Link>{error && <button type="button" onClick={() => { setLoading(true); void loadOrder(ulid).then((value) => { setOrder(value); setError(!value) }).finally(() => setLoading(false)) }} className="inline-flex items-center gap-2 text-sm text-primary"><RefreshCw className="size-4" />{ar ? 'إعادة المحاولة' : 'Try again'}</button>}</main>
  }

  const status = order.status?.label ?? ''
  return (
    <main className="mx-auto max-w-2xl px-5 py-16 sm:px-8 sm:py-24">
      {success && <div className="mb-6 flex items-center gap-2 rounded-2xl border border-emerald-500/30 bg-emerald-500/10 p-4 text-sm font-medium text-emerald-700 dark:text-emerald-400"><CircleCheck className="size-4" />{ar ? 'تم استلام طلبك بنجاح.' : 'Your order was placed successfully.'}</div>}
      <span className="text-xs font-bold uppercase tracking-[0.2em] text-primary">{ar ? 'تفاصيل الطلب' : 'Order details'}</span>
      <h1 className="mt-3 text-4xl font-bold tracking-tight">{order.invoice_number ?? order.ulid}</h1>
      <div className="mt-8 rounded-3xl border bg-card p-7">
        <div className="flex items-center justify-between gap-4"><span className="text-sm text-muted-foreground">{new Date(order.created_at).toLocaleDateString(ar ? 'ar-EG' : 'en-GB')}</span><span className="rounded-full bg-primary/10 px-3 py-1 text-xs font-bold text-primary">{status}</span></div>
        {order.items && order.items.length > 0 && <ul className="mt-6 divide-y border-y">{order.items.map((item) => <li key={item.product_ulid} className="flex items-start justify-between gap-4 py-3 text-sm"><span className="min-w-0"><span className="block truncate font-medium">{item.product_name}</span><span className="text-xs text-muted-foreground">× {item.quantity}</span></span><span className="shrink-0 font-semibold">{item.total_price} {item.currency}</span></li>)}</ul>}
        <dl className="mt-6 space-y-2 text-sm">
          <div className="flex justify-between"><dt className="text-muted-foreground">{ar ? 'المجموع الفرعي' : 'Subtotal'}</dt><dd>{order.subtotal} {order.currency}</dd></div>
          {Number(order.discount_amount) > 0 && <div className="flex justify-between text-primary"><dt>{ar ? 'الخصم' : 'Discount'}</dt><dd>-{order.discount_amount} {order.currency}</dd></div>}
          {Number(order.vat_amount) > 0 && <div className="flex justify-between"><dt className="text-muted-foreground">{ar ? 'ضريبة القيمة المضافة' : 'VAT'}</dt><dd>{order.vat_amount} {order.currency}</dd></div>}
          <div className="flex justify-between border-t pt-4 text-base font-bold"><dt>{ar ? 'الإجمالي' : 'Total'}</dt><dd>{order.total} {order.currency}</dd></div>
        </dl>
        {order.payment_method && <p className="mt-4 text-xs text-muted-foreground">{ar ? 'طريقة الدفع: ' : 'Payment method: '}{typeof order.payment_method === 'object' ? order.payment_method.label : order.payment_method}</p>}
      </div>
      <div className="mt-8 flex flex-wrap gap-3"><Link href={`/${locale}/orders`} className="rounded-full border px-5 py-2.5 text-sm font-semibold">{ar ? 'كل الطلبات' : 'All orders'}</Link><Link href={`/${locale}/products`} className="rounded-full bg-primary px-5 py-2.5 text-sm font-semibold text-primary-foreground">{ar ? 'متابعة التسوق' : 'Continue shopping'}</Link></div>
    </main>
  )
}

export default function OrderPage({ params }: { params: Promise<{ locale: string; ulid: string }> }) {
  return (
    <Suspense fallback={<main className="mx-auto max-w-2xl animate-pulse px-5 py-24"><div className="h-10 w-1/2 rounded bg-muted" /><div className="mt-8 h-48 rounded-2xl bg-muted" /></main>}>
      <OrderContent params={params} />
    </Suspense>
  )
}
