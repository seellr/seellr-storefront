'use client'

import { use, useMemo, useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { ArrowRight, CreditCard, LoaderCircle, ShieldCheck, Truck, Wallet } from 'lucide-react'
import { cartTotals, useCart } from '@/lib/commerce/cart'
import { commerceClient } from '@/lib/commerce/client'

type PaymentOption = {
  value: 'card' | 'wallet' | 'stripe' | 'cod'
  method: 1 | 2 | 3 | 4
  titleAr: string
  titleEn: string
  descriptionAr: string
  descriptionEn: string
}

const PAYMENT_OPTIONS: PaymentOption[] = [
  { value: 'card', method: 1, titleAr: 'بطاقة عبر باي موب', titleEn: 'Card via Paymob', descriptionAr: 'فيزا / ماستركارد', descriptionEn: 'Visa / Mastercard' },
  { value: 'wallet', method: 2, titleAr: 'محفظة إلكترونية', titleEn: 'Mobile wallet', descriptionAr: 'فودافون كاش ومحافظ أخرى', descriptionEn: 'Vodafone Cash and more' },
  { value: 'stripe', method: 3, titleAr: 'بطاقة عبر Stripe', titleEn: 'Card via Stripe', descriptionAr: 'دفع دولي آمن', descriptionEn: 'Secure international payment' },
  { value: 'cod', method: 4, titleAr: 'الدفع عند الاستلام', titleEn: 'Cash on delivery', descriptionAr: 'ادفع عند وصول الطلب', descriptionEn: 'Pay when your order arrives' },
]

function payMethod(option: PaymentOption): 'card' | 'wallet' | 'cod' {
  if (option.value === 'wallet') return 'wallet'
  if (option.value === 'cod') return 'cod'
  return 'card'
}

export default function CheckoutPage({ params }: PageProps<'/[locale]/checkout'>) {
  const { locale } = use(params)
  const ar = locale === 'ar'
  const router = useRouter()
  const cart = useCart()
  const totals = cartTotals(cart.data)
  const items = useMemo(() => cart.data?.items ?? [], [cart.data])
  const [option, setOption] = useState<PaymentOption>(PAYMENT_OPTIONS[0])
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')
  const [fields, setFields] = useState<Record<string, string[]>>({})
  const [form, setForm] = useState({
    name: '',
    phone: '',
    address: '',
    city: '',
    country: 'EG',
  })

  const requiresShipping = useMemo(
    () => items.some((item) => item.requires_shipping),
    [items],
  )

  function update(key: keyof typeof form, value: string) {
    setForm((current) => ({ ...current, [key]: value }))
  }

  async function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setError('')
    setFields({})
    setBusy(true)
    try {
      const order = await commerceClient.createOrder({
        payment_method: option.method,
        coupon_code: undefined,
        ...(requiresShipping
          ? {
              shipping_name: form.name.trim(),
              shipping_phone: form.phone.trim(),
              shipping_address: form.address.trim(),
              shipping_city: form.city.trim(),
              shipping_country: form.country.trim().toUpperCase(),
            }
          : {}),
      })
      const ulid = order.data?.ulid
      if (!ulid) throw new Error(ar ? 'لم يتم إنشاء الطلب.' : 'The order was not created.')

      const payment = await commerceClient.payOrder(ulid, crypto.randomUUID(), payMethod(option))
      const redirect = payment.data?.redirect_url
      if (redirect) {
        window.location.assign(redirect)
        return
      }
      router.replace(`/${locale}/orders/${ulid}?success=1`)
    } catch (cause) {
      const value = cause as { message?: string; status?: number; fields?: Record<string, string[]> }
      setError(value.message || (ar ? 'تعذر إتمام الطلب. حاول مرة أخرى.' : 'Checkout failed. Please try again.'))
      if (value.fields) setFields(value.fields)
      void cart.refetch()
    } finally {
      setBusy(false)
    }
  }

  if (cart.isLoading) {
    return <main className="mx-auto max-w-6xl animate-pulse px-5 py-20 sm:px-8"><div className="h-10 w-1/3 rounded bg-muted" /><div className="mt-10 grid gap-8 lg:grid-cols-[1fr_360px]"><div className="h-96 rounded-3xl bg-muted" /><div className="h-72 rounded-3xl bg-muted" /></div></main>
  }

  if (items.length === 0) {
    return <main className="mx-auto flex min-h-[60vh] max-w-xl flex-col items-center justify-center px-5 text-center"><h1 className="text-3xl font-bold">{ar ? 'سلتك فارغة' : 'Your cart is empty'}</h1><p className="mt-3 text-muted-foreground">{ar ? 'أضف منتجًا قبل إتمام الطلب.' : 'Add a product before checking out.'}</p><Link href={`/${locale}/products`} className="mt-7 inline-flex items-center gap-2 rounded-full bg-primary px-6 py-3 text-sm font-semibold text-primary-foreground">{ar ? 'تصفح المنتجات' : 'Browse products'}<ArrowRight className="size-4 rtl:-scale-x-100" /></Link></main>
  }

  return (
    <main className="mx-auto max-w-6xl px-5 py-14 sm:px-8 sm:py-20">
      <div className="mb-10">
        <span className="text-xs font-bold uppercase tracking-[0.2em] text-primary">{ar ? 'الدفع' : 'Checkout'}</span>
        <h1 className="mt-3 text-4xl font-bold tracking-tight">{ar ? 'إتمام الطلب' : 'Complete your order'}</h1>
      </div>

      <form onSubmit={submit} className="grid gap-8 lg:grid-cols-[1fr_360px]">
        <div className="space-y-6">
          {requiresShipping && (
            <section className="rounded-3xl border bg-card p-6 sm:p-8">
              <div className="mb-5 flex items-center gap-2"><Truck className="size-5 text-primary" /><h2 className="text-lg font-bold">{ar ? 'بيانات الشحن' : 'Shipping details'}</h2></div>
              <div className="grid gap-4 sm:grid-cols-2">
                <label className="grid gap-1.5 text-sm font-medium sm:col-span-2">{ar ? 'الاسم بالكامل' : 'Full name'}
                  <input required value={form.name} onChange={(event) => update('name', event.target.value)} autoComplete="name" className="h-11 rounded-xl border bg-background px-3 font-normal" />
                </label>
                <label className="grid gap-1.5 text-sm font-medium">{ar ? 'رقم الهاتف' : 'Phone'}
                  <input required value={form.phone} onChange={(event) => update('phone', event.target.value)} autoComplete="tel" placeholder="+201001234567" dir="ltr" className="h-11 rounded-xl border bg-background px-3 font-normal" />
                </label>
                <label className="grid gap-1.5 text-sm font-medium">{ar ? 'المدينة' : 'City'}
                  <input required value={form.city} onChange={(event) => update('city', event.target.value)} autoComplete="address-level2" className="h-11 rounded-xl border bg-background px-3 font-normal" />
                </label>
                <label className="grid gap-1.5 text-sm font-medium sm:col-span-2">{ar ? 'العنوان' : 'Address'}
                  <input required value={form.address} onChange={(event) => update('address', event.target.value)} autoComplete="street-address" className="h-11 rounded-xl border bg-background px-3 font-normal" />
                </label>
                <label className="grid gap-1.5 text-sm font-medium">{ar ? 'الدولة' : 'Country'}
                  <select value={form.country} onChange={(event) => update('country', event.target.value)} className="h-11 rounded-xl border bg-background px-3 font-normal">
                    <option value="EG">Egypt (EG)</option>
                    <option value="SA">Saudi Arabia (SA)</option>
                    <option value="AE">United Arab Emirates (AE)</option>
                  </select>
                </label>
              </div>
            </section>
          )}

          <section className="rounded-3xl border bg-card p-6 sm:p-8">
            <div className="mb-5 flex items-center gap-2"><CreditCard className="size-5 text-primary" /><h2 className="text-lg font-bold">{ar ? 'طريقة الدفع' : 'Payment method'}</h2></div>
            <div className="grid gap-3">
              {PAYMENT_OPTIONS.map((item) => {
                const selected = option.value === item.value
                return <label key={item.value} className={`flex cursor-pointer items-center gap-4 rounded-2xl border p-4 transition-colors ${selected ? 'border-primary bg-primary/5' : 'hover:bg-muted/60'}`}>
                  <input type="radio" name="payment" value={item.value} checked={selected} onChange={() => setOption(item)} className="sr-only" />
                  <span className={`grid size-10 shrink-0 place-items-center rounded-full ${selected ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground'}`}>{item.value === 'wallet' ? <Wallet className="size-4" /> : item.value === 'cod' ? <Truck className="size-4" /> : <CreditCard className="size-4" />}</span>
                  <span className="min-w-0 flex-1"><span className="block text-sm font-semibold">{ar ? item.titleAr : item.titleEn}</span><span className="mt-0.5 block text-xs text-muted-foreground">{ar ? item.descriptionAr : item.descriptionEn}</span></span>
                  <span className={`grid size-5 place-items-center rounded-full border ${selected ? 'border-primary bg-primary' : 'border-muted-foreground/40'}`}>{selected && <span className="size-2 rounded-full bg-primary-foreground" />}</span>
                </label>
              })}
            </div>
          </section>

          {error && <div role="alert" className="rounded-2xl border border-destructive/30 bg-destructive/5 p-4 text-sm text-destructive">{error}{Object.keys(fields).length > 0 && <ul className="mt-2 list-inside list-disc text-xs">{Object.entries(fields).map(([key, messages]) => <li key={key}>{key}: {messages.join(' ')}</li>)}</ul>}</div>}
        </div>

        <aside className="h-fit rounded-3xl border bg-card p-6 shadow-sm">
          <h2 className="text-lg font-bold">{ar ? 'ملخص الطلب' : 'Order summary'}</h2>
          <ul className="mt-4 space-y-3">{items.map((item) => <li key={item.product_ulid} className="flex items-start justify-between gap-3 text-sm"><span className="min-w-0"><span className="block truncate font-medium">{item.product_name}</span><span className="text-xs text-muted-foreground">× {item.quantity}</span></span><span className="shrink-0 font-semibold">{item.total_price} {item.currency}</span></li>)}</ul>
          <dl className="mt-5 space-y-2 border-t pt-4 text-sm">
            <div className="flex justify-between"><dt className="text-muted-foreground">{ar ? 'المجموع الفرعي' : 'Subtotal'}</dt><dd>{totals.subtotal.toFixed(2)} {totals.currency}</dd></div>
            {totals.discount > 0 && <div className="flex justify-between text-primary"><dt>{ar ? 'الخصم' : 'Discount'}</dt><dd>-{totals.discount.toFixed(2)} {totals.currency}</dd></div>}
            {totals.vat > 0 && <div className="flex justify-between"><dt className="text-muted-foreground">{totals.vatLabel}</dt><dd>{totals.vat.toFixed(2)} {totals.currency}</dd></div>}
            <div className="flex justify-between border-t pt-4 text-base font-bold"><dt>{ar ? 'الإجمالي' : 'Total'}</dt><dd>{totals.total.toFixed(2)} {totals.currency}</dd></div>
          </dl>
          <button type="submit" disabled={busy} className="mt-6 flex w-full items-center justify-center gap-2 rounded-2xl bg-primary px-5 py-3.5 text-sm font-bold text-primary-foreground transition-transform hover:-translate-y-0.5 disabled:opacity-60">{busy ? <LoaderCircle className="size-4 animate-spin" /> : <ShieldCheck className="size-4" />}{busy ? (ar ? 'جارٍ تنفيذ الدفع…' : 'Processing payment…') : (ar ? 'تأكيد الطلب والدفع' : 'Place order & pay')}</button>
          <p className="mt-3 text-center text-xs text-muted-foreground">{ar ? 'دفع آمن ومشفر' : 'Secure, encrypted checkout'}</p>
        </aside>
      </form>
    </main>
  )
}
