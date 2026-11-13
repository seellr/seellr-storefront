'use client'

import { Heart, LoaderCircle, ShoppingBag, Trash2, X } from 'lucide-react'
import { useState } from 'react'
import { useSyncExternalStore } from 'react'
import Link from 'next/link'
import { useAddToCart } from '@/lib/commerce/cart'
import { useFavourites } from '@/lib/store/favourites'
import type { StoreLocale } from '@/lib/theme/types'

export function FavouritesDrawer({ locale }: { locale: StoreLocale }) {
  const ar = locale === 'ar'
  const { items, isOpen, close, remove, clear } = useFavourites()
  const add = useAddToCart()
  const [pendingUlid, setPendingUlid] = useState('')

  function addToCart(item: { ulid: string }) {
    setPendingUlid(item.ulid)
    void add
      .mutateAsync({ productUlid: item.ulid, quantity: 1 })
      .catch(() => undefined)
      .finally(() => setPendingUlid(''))
  }

  const label = {
    title: ar ? 'المفضلة' : 'Favourites',
    emptyTitle: ar ? 'لا توجد منتجات محفوظة بعد' : 'Nothing saved yet',
    emptyBody: ar ? 'اضغط على  Heart أي منتج لحفظه هنا.' : 'Tap the Heart on any product to save it here.',
    remove: ar ? 'إزالة' : 'Remove',
    add: ar ? 'أضف إلى السلة' : 'Add to cart',
    clear: ar ? 'مسح الكل' : 'Clear all',
    view: ar ? 'عرض المنتج' : 'View product',
    count: ar ? 'منتج محفوظ' : 'saved items',
  }

  return (
    <div
      className={`fixed inset-0 z-50 ${isOpen ? '' : 'pointer-events-none'}`}
      aria-hidden={!isOpen}
      data-preview-interactive-ignore
    >
      <div
        onClick={close}
        className={`absolute inset-0 bg-black/45 backdrop-blur-sm transition-opacity duration-300 ${isOpen ? 'opacity-100' : 'opacity-0'}`}
      />
      <aside
        role="dialog"
        aria-modal="true"
        aria-label={label.title}
        className={`absolute inset-y-0 end-0 flex h-full w-full max-w-md flex-col bg-background shadow-2xl transition-transform duration-300 ease-out ${isOpen ? 'translate-x-0' : 'translate-x-full rtl:-translate-x-full'}`}
      >
        <div className="flex items-center justify-between gap-3 border-b border-border/70 px-5 py-4">
          <div className="flex items-center gap-2">
            <Heart className="size-4 text-primary" />
            <h2 className="text-lg font-bold">{label.title}</h2>
            <span className="rounded-full bg-muted px-2.5 py-0.5 text-xs font-bold text-muted-foreground">{items.length}</span>
          </div>
          <button
            type="button"
            onClick={close}
            aria-label={ar ? 'إغلاق' : 'Close'}
            className="grid size-9 place-items-center rounded-full border border-border transition-colors hover:bg-muted"
          >
            <X className="size-4" />
          </button>
        </div>

        {items.length === 0 ? (
          <div className="flex flex-1 flex-col items-center justify-center gap-3 px-8 text-center">
            <span className="grid size-16 place-items-center rounded-full bg-muted text-muted-foreground">
              <Heart className="size-6" />
            </span>
            <p className="font-semibold">{label.emptyTitle}</p>
            <p className="text-sm leading-7 text-muted-foreground">{label.emptyBody}</p>
            <Link
              href={`/${locale}/products`}
              onClick={close}
              className="mt-3 inline-flex items-center gap-2 rounded-full bg-primary px-5 py-2.5 text-sm font-semibold text-primary-foreground"
            >
              <ShoppingBag className="size-4" />
              {ar ? 'تصفح المنتجات' : 'Browse products'}
            </Link>
          </div>
        ) : (
          <>
            <ul className="flex-1 divide-y divide-border/60 overflow-y-auto px-5">
              {items.map((item) => (
                <li key={item.ulid} className="flex gap-3 py-4">
                  <Link
                    href={`/${locale}/products/${encodeURIComponent(item.slug)}`}
                    onClick={close}
                    className="relative block size-20 shrink-0 overflow-hidden rounded-xl bg-gradient-to-br from-primary/10 via-muted to-secondary"
                  >
                    {item.image
                      ? <img src={item.image} alt={item.name} className="size-full object-cover" />
                      : <span className="absolute inset-0 grid place-items-center text-xl font-bold text-primary/20">{item.name.slice(0, 2)}</span>}
                  </Link>
                  <div className="flex min-w-0 flex-1 flex-col">
                    <Link
                      href={`/${locale}/products/${encodeURIComponent(item.slug)}`}
                      onClick={close}
                      className="truncate text-sm font-semibold hover:text-primary"
                    >
                      {item.name}
                    </Link>
                    <span className="mt-1 text-sm font-bold text-primary">
                      {item.price} <span className="text-xs font-semibold text-muted-foreground">{item.currency}</span>
                    </span>
                    <div className="mt-2.5 flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => addToCart(item)}
                        disabled={pendingUlid === item.ulid}
                        className="inline-flex items-center gap-1.5 rounded-full border border-border px-3 py-1.5 text-xs font-bold transition-colors hover:bg-muted disabled:opacity-60"
                      >
                        {pendingUlid === item.ulid ? <LoaderCircle className="size-3.5 animate-spin" /> : <ShoppingBag className="size-3.5" />}
                        {label.add}
                      </button>
                      <button
                        type="button"
                        onClick={() => remove(item.ulid)}
                        disabled={pendingUlid === item.ulid}
                        aria-label={label.remove}
                        className="grid size-8 place-items-center rounded-full text-muted-foreground transition-colors hover:text-destructive disabled:opacity-60"
                      >
                        <Trash2 className="size-3.5" />
                      </button>
                    </div>
                  </div>
                </li>
              ))}
            </ul>
            <div className="border-t border-border/70 px-5 py-4">
              <button
                type="button"
                onClick={clear}
                className="w-full rounded-full border border-border py-2.5 text-sm font-semibold text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
              >
                {label.clear}
              </button>
            </div>
          </>
        )}
      </aside>
    </div>
  )
}

/** Header trigger for the favourites offcanvas. */
export function FavouritesButton({ locale }: { locale: StoreLocale }) {
  const ar = locale === 'ar'
  const items = useFavourites((state) => state.items)
  const open = useFavourites((state) => state.open)
  // Render the count only after hydration so the server (empty list) and the
  // first client render agree, avoiding a hydration mismatch.
  const isClient = useSyncExternalStore(
    () => () => {},
    () => true,
    () => false,
  )

  return (
    <button
      type="button"
      onClick={open}
      aria-label={ar ? 'المفضلة' : 'Favourites'}
      title={ar ? 'المفضلة' : 'Favourites'}
      className="relative grid size-10 place-items-center rounded-full border border-border bg-card transition-colors hover:bg-muted"
    >
      <Heart className="size-4" />
      {isClient && items.length > 0 && (
        <span className="absolute -end-0.5 -top-0.5 grid min-w-4.5 place-items-center rounded-full bg-destructive px-1 text-[10px] font-bold text-destructive-foreground">
          {items.length}
        </span>
      )}
    </button>
  )
}
