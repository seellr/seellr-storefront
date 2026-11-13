import type { Product } from '@/lib/commerce/types'
import { resolveMediaUrl } from './settings'
import type { FavouriteProduct } from '@/lib/store/favourites'

export function productImage(product: Product | null | undefined): string {
  if (!product) return ''
  if (product.hero_image_url) return resolveMediaUrl(product.hero_image_url)
  for (const image of product.images ?? []) {
    const url = image.url ?? image.thumb_url
    if (url) return resolveMediaUrl(url)
  }
  return ''
}

export function productPrice(product: Product): string {
  return String(product.sale_price ?? product.base_price ?? '')
}

export function productDescription(product: Product | null | undefined): string {
  if (!product) return ''
  const description = product.description
  if (typeof description === 'string') return description
  return description?.full_description ?? description?.short_description ?? product.one_liner ?? ''
}

/** Percentage off the base price, or 0 when the product is not discounted. */
export function productDiscount(product: Product): number {
  const base = Number(product.base_price ?? 0)
  const sale = product.sale_price == null ? null : Number(product.sale_price)
  if (!sale || base <= 0 || sale >= base) return 0
  return Math.round(((base - sale) / base) * 100)
}

/** Snapshot of a product for the persisted favourites list. */
export function productToFavourite(product: Product): FavouriteProduct {
  const sale = product.sale_price == null ? null : Number(product.sale_price)
  const base = Number(product.base_price ?? 0)
  return {
    ulid: product.ulid,
    slug: product.slug,
    name: product.name,
    oneLiner: product.one_liner ?? null,
    price: productPrice(product),
    comparePrice: sale != null && base > sale ? String(product.base_price) : undefined,
    currency: product.currency,
    image: productImage(product),
  }
}
