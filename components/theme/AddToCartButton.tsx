'use client'

import { Check, Heart, LoaderCircle, ShoppingBag } from 'lucide-react'
import { useState } from 'react'
import { useAddToCart } from '@/lib/commerce/cart'
import type { Product } from '@/lib/commerce/types'
import { isFavourite, useFavourites } from '@/lib/store/favourites'
import { productToFavourite } from '@/lib/theme/product'
import type { StoreLocale } from '@/lib/theme/types'

interface AddToCartButtonProps {
  productUlid: string
  locale: StoreLocale
  /** Visible label. Defaults to the localized "Add to cart" text. */
  label?: string
  quantity?: number
  className?: string
  /** `card` renders a compact icon button; `pill` renders a labelled button. */
  variant?: 'card' | 'pill'
}

const CARD_CLASSES =
  'grid size-9 place-items-center rounded-full border border-primary/25 bg-primary text-primary-foreground shadow-md shadow-primary/20 transition-all hover:scale-105 hover:shadow-lg active:scale-95 disabled:cursor-not-allowed disabled:opacity-70'

const PILL_CLASSES =
  'inline-flex items-center justify-center gap-2 rounded-full bg-primary px-5 py-2.5 text-sm font-semibold text-primary-foreground shadow-md shadow-primary/20 transition-all hover:-translate-y-0.5 hover:shadow-lg active:translate-y-0 active:scale-95 disabled:cursor-not-allowed disabled:opacity-70'

export function AddToCartButton({
  productUlid,
  locale,
  label,
  quantity = 1,
  className,
  variant = 'pill',
}: AddToCartButtonProps) {
  const ar = locale === 'ar'
  const add = useAddToCart()
  const [added, setAdded] = useState(false)
  const [error, setError] = useState('')

  const fallbackLabel = ar ? 'أضف إلى السلة' : 'Add to cart'
  const text = label ?? fallbackLabel
  const pending = add.isPending

  async function handleClick() {
    setError('')
    try {
      await add.mutateAsync({ productUlid, quantity })
      setAdded(true)
      window.setTimeout(() => setAdded(false), 2200)
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : ar ? 'تعذر إضافة المنتج.' : 'Could not add this product.')
    }
  }

  if (variant === 'card') {
    return (
      <span className="inline-flex flex-col items-end gap-1">
        <button
          type="button"
          onClick={() => void handleClick()}
          disabled={pending}
          aria-label={text}
          title={text}
          className={className ?? CARD_CLASSES}
        >
          {pending ? (
            <LoaderCircle className="size-4 animate-spin" />
          ) : added ? (
            <Check className="size-4" />
          ) : (
            <ShoppingBag className="size-4" />
          )}
        </button>
        {error ? <span role="alert" className="max-w-24 text-end text-[11px] leading-tight text-destructive">{error}</span> : null}
      </span>
    )
  }

  return (
    <span className="inline-flex flex-col items-start gap-1">
      <button
        type="button"
        onClick={() => void handleClick()}
        disabled={pending}
        className={className ?? PILL_CLASSES}
      >
        {pending ? (
          <LoaderCircle className="size-4 animate-spin" />
        ) : added ? (
          <Check className="size-4" />
        ) : (
          <ShoppingBag className="size-4" />
        )}
        {added ? (ar ? 'تمت الإضافة' : 'Added') : text}
      </button>
      {error ? <span role="alert" className="text-xs text-destructive">{error}</span> : null}
    </span>
  )
}

export function WishlistButton({ product, locale }: { product: Product; locale: StoreLocale }) {
  const items = useFavourites((state) => state.items)
  const toggle = useFavourites((state) => state.toggle)
  const saved = isFavourite(items, product.ulid)
  const ar = locale === 'ar'
  const label = saved ? (ar ? 'محفوظ في المفضلة' : 'Saved to wishlist') : (ar ? 'أضف إلى المفضلة' : 'Add to wishlist')

  return (
    <button
      type="button"
      onClick={() => toggle(productToFavourite(product))}
      aria-label={label}
      title={label}
      aria-pressed={saved}
      className="grid size-9 place-items-center rounded-full bg-background/85 text-foreground shadow-sm backdrop-blur transition-all hover:scale-110 hover:bg-background active:scale-95"
    >
      <Heart className={`size-4 transition-colors ${saved ? 'fill-destructive text-destructive' : ''}`} />
    </button>
  )
}
