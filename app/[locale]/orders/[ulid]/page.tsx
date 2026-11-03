'use client'

import { use, useEffect, useState } from 'react'
import { commerceClient } from '@/lib/commerce/client'
import type { Order } from '@/lib/commerce/types'
export default function OrderPage({ params }: { params: Promise<{ locale: string; ulid: string }> }) { const value = use(params); const ar = value.locale === 'ar'; const [order, setOrder] = useState<Order | null>(null); useEffect(() => { void commerceClient.order(value.ulid).then((result) => setOrder(result.data ?? null)).catch(() => undefined) }, [value.ulid]); return <main className="mx-auto max-w-2xl px-5 py-16 sm:px-8 sm:py-24"><h1 className="text-4xl font-bold">{ar ? 'تفاصيل الطلب' : 'Order details'}</h1>{!order ? <div className="mt-8 h-40 animate-pulse rounded-2xl bg-muted" /> : <div className="mt-8 rounded-3xl border bg-card p-7"><p className="text-sm text-muted-foreground">{order.invoice_number ?? order.ulid}</p><p className="mt-4 font-semibold">{order.status.label}</p><div className="mt-8 flex justify-between border-t pt-5"><span>{ar ? 'الإجمالي' : 'Total'}</span><strong>{order.total} {order.currency}</strong></div></div>}</main> }
