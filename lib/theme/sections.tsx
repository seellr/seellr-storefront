'use client'

import type { CSSProperties, ReactNode } from 'react'
import Link from 'next/link'
import { ArrowRight, ArrowUpRight, ChevronDown, CircleCheck, Megaphone, Minus, Plus, Star, Trash2 } from 'lucide-react'
import { useState } from 'react'
import { StorefrontHeader, type StorefrontNavLink } from '@/components/theme/StorefrontHeader'
import { AddToCartButton, WishlistButton } from '@/components/theme/AddToCartButton'
import { Reveal, RevealGroup, RevealItem } from '@/components/motion/Reveal'
import { useSectionProducts } from '@/hooks/use-products'
import { cartCouponCode, cartItemCount, cartTotals, useAddToCart, useApplyCoupon, useCart, useRemoveCartItem, useRemoveCoupon } from '@/lib/commerce/cart'
import { hasCustomerSession } from '@/lib/commerce/session'
import type { Product } from '@/lib/commerce/types'
import { RichTextContent } from './RichTextContent'
import { productDescription, productDiscount, productImage, productPrice } from './product'
import {
  localizeHref,
  settingBoolean,
  settingImageUrl,
  settingList,
  settingNumber,
  settingProductIds,
  settingString,
  settingText,
} from './settings'
import type { StoreLocale, ThemeBlock, ThemeSection } from './types'

export interface SectionProps {
  section: ThemeSection
  locale: StoreLocale
  /** Server-provided product data; undefined means "fetch in the browser" (preview). */
  products?: Product[] | null
  product?: Product | null
}

const isArabic = (locale: StoreLocale) => locale === 'ar'

function blocksOfType(section: ThemeSection, type?: string): ThemeBlock[] {
  return (section.blocks ?? []).filter((block) => block.hidden !== true && (!type || block.type === type))
}

function imageFor(block: ThemeBlock): string {
  return settingImageUrl(block.settings, ['image', 'image_url', 'logo', 'media', 'hero_image_url'])
}

function ProductPlaceholder({ index, locale }: { index: number; locale: StoreLocale }) {
  return <article className="flex flex-col overflow-hidden rounded-2xl border border-border/70 bg-card shadow-sm"><div className="relative aspect-[4/3] bg-gradient-to-br from-primary/10 via-muted to-secondary"><div className="absolute inset-0 grid place-items-center text-5xl font-bold text-primary/15">{String(index + 1).padStart(2, '0')}</div></div><div className="flex flex-1 flex-col gap-3 p-4"><div className="h-3 w-1/4 rounded bg-muted" /><div className="h-4 w-3/4 rounded bg-muted" /><div className="h-3 w-full rounded bg-muted" /><div className="mt-auto flex items-center justify-between border-t border-border/60 pt-3.5"><div className="h-4 w-20 rounded bg-muted" /><div className="size-9 rounded-full bg-muted" /></div></div><span className="sr-only">{locale === 'ar' ? 'منتج' : 'Product'}</span></article>
}

function ProductCard({ product, locale }: { product: Product; locale: StoreLocale }) {
  const ar = isArabic(locale)
  const image = productImage(product)
  const discount = productDiscount(product)
  const typeLabel = product.type && typeof product.type === 'object' ? product.type.label : ''
  const href = `/${locale}/products/${encodeURIComponent(product.slug)}`

  return (
    <article className="group relative flex flex-col overflow-hidden rounded-2xl border border-border/70 bg-card shadow-sm transition-all duration-300 hover:-translate-y-1 hover:border-primary/30 hover:shadow-xl hover:shadow-primary/5">
      <div className="relative">
        <Link href={href} className="relative block aspect-[4/3] overflow-hidden bg-gradient-to-br from-primary/10 via-muted to-secondary">
          {image
            ? <img src={image} alt={product.name} loading="lazy" className="size-full object-cover transition-transform duration-700 ease-out group-hover:scale-110" />
            : <div className="absolute inset-0 grid place-items-center text-5xl font-bold text-primary/15">{product.name.slice(0, 2)}</div>}
          <div className="pointer-events-none absolute inset-x-0 bottom-0 h-16 bg-gradient-to-t from-black/30 to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
        </Link>
        <div className="absolute start-3.5 top-3.5 flex flex-col items-start gap-1.5">
          {product.featured && <span className="rounded-full bg-foreground/90 px-2.5 py-1 text-[11px] font-bold text-background backdrop-blur">{ar ? 'مميز' : 'Featured'}</span>}
          {discount > 0 && <span className="rounded-full bg-destructive px-2.5 py-1 text-[11px] font-bold text-destructive-foreground">-{discount}%</span>}
        </div>
        <div className="absolute end-3.5 top-3.5 opacity-70 transition-opacity duration-300 focus-within:opacity-100 sm:opacity-0 sm:group-hover:opacity-100">
          <WishlistButton product={product} locale={locale} />
        </div>
      </div>
      <div className="flex flex-1 flex-col p-4">
        {typeLabel && <span className="text-[11px] font-bold uppercase tracking-[0.18em] text-muted-foreground/80">{typeLabel}</span>}
        <Link href={href} className="mt-1 text-[15px] font-semibold leading-snug hover:text-primary">{product.name}</Link>
        {product.one_liner && <p className="mt-1.5 line-clamp-2 text-[13px] leading-relaxed text-muted-foreground">{product.one_liner}</p>}
        <div className="mt-auto flex items-end justify-between gap-3 border-t border-border/60 pt-3.5">
          <div className="flex flex-col gap-0.5">
            <div className="flex items-baseline gap-1">
              <strong className="text-[15px] font-bold">{productPrice(product)}</strong>
              <span className="text-xs text-muted-foreground">{product.currency}</span>
            </div>
            {discount > 0 && <span className="text-xs text-muted-foreground line-through">{product.base_price} {product.currency}</span>}
          </div>
          <AddToCartButton productUlid={product.ulid} locale={locale} variant="card" />
        </div>
      </div>
    </article>
  )
}

function EmptyProducts({ locale }: { locale: StoreLocale }) {
  return <div className="rounded-2xl border border-dashed p-10 text-center text-sm text-muted-foreground">{locale === 'ar' ? 'لا توجد منتجات لعرضها بعد.' : 'There are no products to show yet.'}</div>
}

function Announcement({ section, locale }: SectionProps) {
  const ar = isArabic(locale)
  const href = settingString(section.settings, 'link_href') || settingString(section.settings, 'link_url')
  const linkLabel = settingText(section.settings, 'link_label', locale)
  return <div className="relative isolate w-full overflow-hidden border-b border-primary/15 bg-primary px-4 py-3 text-primary-foreground shadow-sm"><div className="absolute inset-y-0 start-0 w-1/3 bg-white/10 blur-2xl" /><div className="relative mx-auto flex max-w-7xl flex-wrap items-center justify-center gap-x-3 gap-y-2 text-center text-xs font-semibold leading-5 sm:text-sm"><span className="inline-flex shrink-0 items-center gap-2"><span className="grid size-6 place-items-center rounded-full bg-white/15"><Megaphone className="size-3.5" /></span><span className="text-balance">{settingText(section.settings, 'message', locale, ar ? 'شحن مجاني لفترة محدودة' : 'Free shipping for a limited time')}</span></span>{linkLabel && href && <a href={localizeHref(href, locale)} className="inline-flex shrink-0 items-center gap-1 rounded-full border border-white/25 bg-white/10 px-3 py-1 text-[11px] font-bold transition-colors hover:bg-white/20">{linkLabel}<ArrowUpRight className="size-3 rtl:-scale-x-100" /></a>}</div></div>
}

function Header({ section, locale }: SectionProps) {
  const links: StorefrontNavLink[] = blocksOfType(section, 'link').flatMap((block) => {
    const href = settingString(block.settings, 'url', '/')
    const label = settingText(block.settings, 'label', locale)
    return href && label ? [{ href: localizeHref(href, locale), label }] : []
  })
  return <StorefrontHeader locale={locale} label={settingText(section.settings, 'label', locale, isArabic(locale) ? 'متجري' : 'My store')} logo={settingImageUrl(section.settings, ['logo', 'logo_url', 'image'])} links={links} sticky={settingBoolean(section.settings, 'sticky', true)} />
}

function heroPadding(height: string): string {
  if (height === 'sm') return 'py-16 md:py-20'
  if (height === 'lg') return 'py-32 md:py-44'
  return 'py-24 md:py-32'
}

function Hero({ section, locale }: SectionProps) {
  const ar = isArabic(locale)
  const title = 'heading' in section.settings ? settingText(section.settings, 'heading', locale) : settingText(section.settings, 'title', locale)
  const subtitle = 'subheading' in section.settings ? settingText(section.settings, 'subheading', locale) : settingText(section.settings, 'subtitle', locale)
  const background = settingString(section.settings, 'background_color', 'var(--theme-primary)')
  const image = settingImageUrl(section.settings, ['image', 'image_url', 'background_image', 'background_image_url', 'hero_image', 'banner_image', 'media'])
  const padded = heroPadding(settingString(section.settings, 'height', 'md'))
  const buttons = blocksOfType(section, 'button')
  const legacyLabel = settingText(section.settings, 'button_label', locale)
  const legacyHref = settingString(section.settings, 'button_url') || settingString(section.settings, 'button_href')
  const style: CSSProperties | undefined = image ? undefined : { background }

  return <section className={`relative isolate overflow-hidden bg-slate-950 px-6 text-center text-white ${padded}`} style={style}>
    {image ? <><img src={image} alt="" className="absolute inset-0 -z-20 size-full object-cover" /><div className="absolute inset-0 -z-10 bg-black/50" aria-hidden="true" /></> : <div className="absolute inset-0 -z-10 bg-[radial-gradient(circle_at_top,var(--theme-primary),transparent_58%)] opacity-80" aria-hidden="true" />}
    <RevealGroup className="mx-auto max-w-4xl">
      <RevealItem className="mb-6 inline-flex rounded-full border border-white/15 bg-white/10 px-4 py-2 text-xs font-medium text-white/80">{ar ? 'اختيارات مصممة لك' : 'Curated for you'}</RevealItem>
      <RevealItem><h1 className="text-4xl font-bold leading-[1.1] tracking-tight sm:text-6xl md:text-7xl">{title}</h1></RevealItem>
      {subtitle && <RevealItem><p className="mx-auto mt-6 max-w-2xl text-base leading-8 text-white/65 sm:text-lg">{subtitle}</p></RevealItem>}
      {(buttons.length > 0 || (legacyLabel && legacyHref)) && <RevealItem className="mt-9 flex flex-wrap justify-center gap-3">
        {buttons.map((button) => {
          const href = settingString(button.settings, 'url', '#')
          const label = settingText(button.settings, 'label', locale)
          return label ? <a key={button.id} href={localizeHref(href, locale)} className="inline-flex rounded-full bg-white px-6 py-3 text-sm font-semibold text-slate-950 transition hover:bg-white/90">{label}</a> : null
        })}
        {legacyLabel && legacyHref && <a href={localizeHref(legacyHref, locale)} className="inline-flex rounded-full bg-white px-6 py-3 text-sm font-semibold text-slate-950 transition hover:bg-white/90">{legacyLabel}</a>}
      </RevealItem>}
    </RevealGroup>
  </section>
}

function ProductGrid({ section, locale, products: initialProducts }: SectionProps) {
  const fetched = useSectionProducts(initialProducts)
  const wanted = settingProductIds(section.settings)
  const products = wanted.length > 0
    ? wanted.map((ulid) => fetched.find((product) => product.ulid === ulid)).filter((product): product is Product => Boolean(product))
    : fetched.slice(0, Math.max(1, Math.min(settingNumber(section.settings, 'count', 6), 12)))
  const heading = 'heading' in section.settings ? settingText(section.settings, 'heading', locale) : settingText(section.settings, 'title', locale)
  const columns = String(section.settings.columns ?? 3)
  const columnClass = columns === '2' ? 'sm:grid-cols-2' : columns === '4' ? 'sm:grid-cols-2 lg:grid-cols-4' : 'sm:grid-cols-2 lg:grid-cols-3'
  return <section id="products" className="mx-auto max-w-7xl px-5 py-20 sm:px-8 sm:py-28">
    <Reveal className="mb-10 flex items-end justify-between gap-4"><div><span className="text-xs font-bold uppercase tracking-[0.2em] text-primary">{isArabic(locale) ? 'منتجات مختارة' : 'Selected collection'}</span>{heading && <h2 className="mt-3 text-3xl font-bold tracking-tight sm:text-4xl">{heading}</h2>}</div><Link href={`/${locale}/products`} className="hidden items-center gap-1 text-sm font-semibold text-primary sm:flex">{isArabic(locale) ? 'عرض الكل' : 'View all'}<ArrowUpRight className="size-4 rtl:-scale-x-100" /></Link></Reveal>
    {initialProducts === undefined && products.length === 0
      ? <div className={`grid gap-5 ${columnClass}`}>{Array.from({ length: 3 }, (_, index) => <ProductPlaceholder key={index} index={index} locale={locale} />)}</div>
      : products.length === 0 ? <EmptyProducts locale={locale} /> : <RevealGroup className={`grid gap-5 ${columnClass}`}>{products.map((product) => <RevealItem key={product.ulid}><ProductCard product={product} locale={locale} /></RevealItem>)}</RevealGroup>}
  </section>
}

function ProductCarousel({ section, locale, products: initialProducts }: SectionProps) {
  const fetched = useSectionProducts(initialProducts)
  const wanted = settingProductIds(section.settings)
  const products = wanted.length > 0
    ? wanted.map((ulid) => fetched.find((product) => product.ulid === ulid)).filter((product): product is Product => Boolean(product))
    : fetched.slice(0, 8)
  return <section className="mx-auto max-w-7xl px-5 py-16 sm:px-8">
    {settingText(section.settings, 'heading', locale) || settingText(section.settings, 'title', locale) ? <h2 className="mb-8 text-3xl font-bold">{settingText(section.settings, 'heading', locale) || settingText(section.settings, 'title', locale)}</h2> : null}
    {products.length === 0 ? <EmptyProducts locale={locale} /> : <div className="flex snap-x gap-4 overflow-x-auto pb-2">{products.map((product) => <div key={product.ulid} className="min-w-56 flex-1 snap-start"><ProductCard product={product} locale={locale} /></div>)}</div>}
  </section>
}

function FeaturedProduct({ section, locale, products: initialProducts, product }: SectionProps) {
  const fetched = useSectionProducts(initialProducts)
  const wanted = settingProductIds(section.settings, 'product')[0]
  const featured = product ?? fetched.find((item) => item.ulid === wanted) ?? fetched[0] ?? null
  const cta = settingText(section.settings, 'cta_label', locale, isArabic(locale) ? 'اشتري الآن' : 'Buy now')
  if (!featured) return <section className="mx-auto max-w-5xl px-5 py-16 sm:px-8"><div className="grid gap-8 rounded-3xl border bg-card p-8 md:grid-cols-2 md:items-center"><div className="aspect-square rounded-2xl bg-gradient-to-br from-primary/20 via-muted to-secondary" /><div className="space-y-4"><div className="h-4 w-24 rounded bg-muted" /><div className="h-8 w-2/3 rounded bg-muted" /><div className="h-11 w-32 rounded-full bg-primary/30" /></div></div></section>
  const image = productImage(featured)
  return <section className="mx-auto max-w-5xl px-5 py-16 sm:px-8"><Reveal className="grid gap-8 rounded-3xl border bg-card p-8 md:grid-cols-2 md:items-center">
    <div className="aspect-square overflow-hidden rounded-2xl bg-gradient-to-br from-primary/20 via-muted to-secondary">{image ? <img src={image} alt={featured.name} className="size-full object-cover" /> : null}</div>
    <div className="space-y-4"><span className="text-xs font-bold uppercase tracking-[0.2em] text-primary">{featured.featured ? (isArabic(locale) ? 'منتج مميز' : 'Featured product') : featured.currency}</span><h2 className="text-2xl font-bold tracking-tight">{featured.name}</h2>{featured.one_liner && <p className="text-muted-foreground">{featured.one_liner}</p>}<strong className="block text-2xl">{productPrice(featured)} {featured.currency}</strong><AddToCartButton productUlid={featured.ulid} locale={locale} label={cta} /></div>
  </Reveal></section>
}

function ProductDetail({ section, locale, product }: SectionProps) {
  const ar = isArabic(locale)
  if (!product) {
    const image = settingImageUrl(section.settings, ['image_url', 'image'])
    return <section className="mx-auto grid max-w-7xl gap-10 px-5 py-20 sm:px-8 sm:py-28 md:grid-cols-2 md:items-center"><div className="relative aspect-square overflow-hidden rounded-3xl bg-gradient-to-br from-primary/20 via-muted to-secondary" style={image ? { backgroundImage: `url("${image}")`, backgroundPosition: 'center', backgroundSize: 'cover' } : undefined} /><div className="max-w-xl"><h2 className="text-4xl font-bold tracking-tight sm:text-5xl">{settingText(section.settings, 'title', locale, ar ? 'اسم المنتج' : 'Product name')}</h2><p className="mt-5 text-base leading-8 text-muted-foreground">{settingText(section.settings, 'description', locale, ar ? 'وصف المنتج' : 'Product description')}</p><strong className="mt-7 block text-3xl">{settingString(section.settings, 'price')}</strong></div></section>
  }
  const image = productImage(product)
  const description = productDescription(product)
  return <section className="mx-auto grid max-w-7xl gap-10 px-5 py-20 sm:px-8 sm:py-28 md:grid-cols-2 md:items-start">
    <div className="relative aspect-square overflow-hidden rounded-3xl bg-gradient-to-br from-primary/20 via-muted to-secondary shadow-inner">{image ? <img src={image} alt={product.name} className="size-full object-cover" /> : null}{product.featured && <span className="absolute start-5 top-5 rounded-full bg-background/85 px-3 py-1 text-xs font-semibold backdrop-blur">{ar ? 'الأكثر مبيعًا' : 'Best seller'}</span>}</div>
    <div className="max-w-xl">
      <span className="text-xs font-bold uppercase tracking-[0.2em] text-primary">{product.type && typeof product.type === 'object' ? product.type.label : product.currency}</span>
      <h1 className="mt-3 text-4xl font-bold tracking-tight sm:text-5xl">{product.name}</h1>
      {product.one_liner && <p className="mt-4 text-lg text-muted-foreground">{product.one_liner}</p>}
      <div className="mt-7 flex items-center gap-3"><strong className="text-3xl">{productPrice(product)} {product.currency}</strong>{product.sale_price && <span className="text-base text-muted-foreground line-through">{product.base_price} {product.currency}</span>}</div>
      <AddToCartButton productUlid={product.ulid} locale={locale} className="mt-8 inline-flex items-center gap-2 rounded-full bg-primary px-7 py-3.5 text-sm font-semibold text-primary-foreground shadow-lg shadow-primary/20 transition-transform hover:-translate-y-0.5 disabled:opacity-60" />
      {description && <div className="mt-10 border-t pt-8"><h2 className="text-xl font-bold">{ar ? 'عن المنتج' : 'About this product'}</h2><RichTextContent html={description} className="theme-rich-text mt-4 leading-8 text-muted-foreground" /></div>}
    </div>
  </section>
}

function ImageText({ section, locale }: SectionProps) {
  const title = settingText(section.settings, 'heading', locale) || settingText(section.settings, 'title', locale)
  const body = settingText(section.settings, 'body', locale)
  const image = settingImageUrl(section.settings, ['image_url', 'image', 'media'])
  const bullets = settingList<string>(section.settings, 'bullets').filter(Boolean)
  return <section id="about" className="mx-auto grid max-w-7xl gap-10 px-5 py-20 sm:px-8 sm:py-28 md:grid-cols-2 md:items-center">
    <div className="aspect-[4/3] overflow-hidden rounded-3xl bg-gradient-to-br from-secondary via-muted to-primary/15" style={image ? { backgroundImage: `url("${image}")`, backgroundPosition: 'center', backgroundSize: 'cover' } : undefined} />
    <div className="max-w-xl">{title && <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">{title}</h2>}{body && <p className="mt-5 text-base leading-8 text-muted-foreground">{body}</p>}{bullets.length > 0 && <div className="mt-6 grid gap-3 text-sm font-medium">{bullets.map((item) => <span key={item} className="flex items-center gap-2"><CircleCheck className="size-4 text-primary" />{item}</span>)}</div>}</div>
  </section>
}

function RichText({ section, locale }: SectionProps) {
  const heading = settingText(section.settings, 'heading', locale)
  const content = settingText(section.settings, 'content', locale)
  return <section className="mx-auto max-w-3xl px-5 py-16 sm:px-8">{heading && <h2 className="mb-6 text-3xl font-bold tracking-tight">{heading}</h2>}{content && <RichTextContent html={content} className="theme-rich-text text-lg leading-9 text-muted-foreground" />}</section>
}

function Faq({ section, locale, product }: SectionProps) {
  const heading = settingText(section.settings, 'heading', locale) || settingText(section.settings, 'title', locale)
  const blocks = blocksOfType(section)
  const items = blocks.length > 0
    ? blocks.map((block) => ({ id: block.id, question: settingText(block.settings, 'question', locale), answer: settingText(block.settings, 'answer', locale) }))
    : (product?.faqs ?? []).map((faq, index) => ({ id: `product-faq-${index}`, question: faq.question ?? '', answer: faq.answer ?? '' }))
  if (!heading && items.length === 0) return null
  return <section className="mx-auto max-w-3xl px-5 py-20 sm:px-8 sm:py-28">{heading && <Reveal className="mb-10 text-center"><span className="text-xs font-bold uppercase tracking-[0.2em] text-primary">FAQ</span><h2 className="mt-3 text-3xl font-bold">{heading}</h2></Reveal>}<Reveal className="divide-y divide-border/70 rounded-2xl border border-border/70 bg-card">{items.map((item) => <details key={item.id} className="group p-5"><summary className="flex cursor-pointer list-none items-center justify-between gap-4 font-semibold"><span>{item.question}</span><ChevronDown className="size-4 shrink-0 transition-transform group-open:rotate-180" /></summary><RichTextContent html={item.answer} className="theme-rich-text mt-3 max-w-2xl text-sm leading-7 text-muted-foreground" /></details>)}</Reveal></section>
}

function Testimonials({ section, locale, product }: SectionProps) {
  const heading = settingText(section.settings, 'heading', locale) || settingText(section.settings, 'title', locale)
  const blocks = blocksOfType(section)
  const items = blocks.length > 0
    ? blocks.map((block) => ({ id: block.id, quote: settingText(block.settings, 'quote', locale), author: settingText(block.settings, 'author', locale) }))
    : (product?.testimonials ?? []).map((testimonial, index) => ({ id: `product-testimonial-${index}`, quote: testimonial.quote ?? '', author: testimonial.author ?? '' }))
  if (!heading && items.length === 0) return null
  return <section className="bg-muted/40 px-5 py-20 sm:px-8 sm:py-28"><div className="mx-auto max-w-7xl">{heading && <Reveal className="mb-10 text-center"><h2 className="text-3xl font-bold">{heading}</h2></Reveal>}<RevealGroup className="grid gap-5 md:grid-cols-3">{items.map((item) => <RevealItem key={item.id}><blockquote className="rounded-2xl border border-border/70 bg-card p-6 shadow-sm"><div className="mb-5 flex gap-1 text-amber-400">{Array.from({ length: 5 }, (_, index) => <Star key={index} className="size-4 fill-current" />)}</div><p className="leading-7 text-muted-foreground">“{item.quote}”</p>{item.author && <footer className="mt-6 text-sm font-semibold">{item.author}</footer>}</blockquote></RevealItem>)}</RevealGroup></div></section>
}

function Cta({ section, locale }: SectionProps) {
  const title = settingText(section.settings, 'heading', locale) || settingText(section.settings, 'title', locale)
  const body = settingText(section.settings, 'body', locale)
  const label = settingText(section.settings, 'button_label', locale) || settingText(section.settings, 'cta_label', locale)
  const href = settingString(section.settings, 'button_url') || settingString(section.settings, 'url', '#products')
  return <section className="px-5 py-20 sm:px-8 sm:py-28"><Reveal className="mx-auto max-w-5xl overflow-hidden rounded-3xl bg-primary px-6 py-14 text-center text-primary-foreground shadow-2xl shadow-primary/20 sm:px-12">{title && <h2 className="text-3xl font-bold sm:text-4xl">{title}</h2>}{body && <p className="mx-auto mt-4 max-w-xl text-primary-foreground/75">{body}</p>}{label && <a href={localizeHref(href, locale)} className="mt-8 inline-flex items-center gap-2 rounded-full bg-background px-6 py-3 text-sm font-semibold text-foreground transition-transform hover:-translate-y-0.5">{label}<ArrowUpRight className="size-4 rtl:-scale-x-100" /></a>}</Reveal></section>
}

function CategoryGrid({ section, locale }: SectionProps) {
  const title = settingText(section.settings, 'heading', locale) || settingText(section.settings, 'title', locale)
  const items = blocksOfType(section)
  if (items.length === 0) return title ? <section className="mx-auto max-w-7xl px-5 py-16 sm:px-8"><h2 className="mb-8 text-3xl font-bold">{title}</h2></section> : null
  return <section className="mx-auto max-w-7xl px-5 py-16 sm:px-8">{title && <h2 className="mb-8 text-3xl font-bold">{title}</h2>}<div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">{items.map((item) => <a href={localizeHref(settingString(item.settings, 'url', '#products'), locale)} key={item.id} className="group rounded-2xl border bg-gradient-to-br from-primary/10 to-muted p-6 transition-transform hover:-translate-y-1"><div className="mb-10 aspect-[4/3] overflow-hidden rounded-xl bg-background/50" style={imageFor(item) ? { backgroundImage: `url("${imageFor(item)}")`, backgroundPosition: 'center', backgroundSize: 'cover' } : undefined} /><h3 className="font-semibold">{settingText(item.settings, 'label', locale)}</h3></a>)}</div></section>
}

function Video({ section, locale }: SectionProps) {
  const url = settingImageUrl(section.settings, ['video_url', 'url'])
  const title = settingText(section.settings, 'heading', locale) || settingText(section.settings, 'title', locale)
  const youtube = url.match(/(?:youtube\.com\/(?:watch\?v=|embed\/)|youtu\.be\/)([A-Za-z0-9_-]+)/)
  const vimeo = url.match(/vimeo\.com\/(\d+)/)
  return <section className="mx-auto max-w-5xl px-5 py-16 sm:px-8">{youtube ? <iframe src={`https://www.youtube.com/embed/${youtube[1]}`} title={title || 'Video'} allowFullScreen className="aspect-video w-full rounded-3xl" /> : vimeo ? <iframe src={`https://player.vimeo.com/video/${vimeo[1]}`} title={title || 'Video'} allowFullScreen className="aspect-video w-full rounded-3xl" /> : url ? <video src={url} controls className="aspect-video w-full rounded-3xl bg-slate-950" /> : <div className="relative aspect-video overflow-hidden rounded-3xl bg-slate-950"><div className="absolute inset-0 grid place-items-center bg-black/30"><div className="grid size-16 place-items-center rounded-full bg-white text-xl text-slate-950">▶</div></div></div>}{title && <h2 className="mt-5 text-center text-2xl font-bold">{title}</h2>}</section>
}

function Stats({ section, locale }: SectionProps) {
  const values = [1, 2, 3].map((index) => ({ value: settingString(section.settings, `value_${index}`), label: settingText(section.settings, `label_${index}`, locale) }))
  if (values.every((item) => !item.value && !item.label)) return null
  return <section className="border-y bg-muted/30 px-5 py-12 sm:px-8"><div className="mx-auto grid max-w-6xl gap-8 text-center sm:grid-cols-3">{values.map((item, index) => <div key={index}>{item.value && <div className="text-4xl font-bold text-primary">{item.value}</div>}{item.label && <p className="mt-2 text-sm text-muted-foreground">{item.label}</p>}</div>)}</div></section>
}

function LogoCloud({ section, locale }: SectionProps) {
  const logos = blocksOfType(section)
  const title = settingText(section.settings, 'heading', locale) || settingText(section.settings, 'title', locale)
  if (logos.length === 0) return null
  return <section className="px-5 py-12 text-center sm:px-8">{title && <p className="mb-7 text-xs font-bold uppercase tracking-[0.2em] text-muted-foreground">{title}</p>}<div className="flex flex-wrap justify-center gap-3">{logos.map((logo) => <span key={logo.id} className="rounded-xl border bg-card px-5 py-3 text-sm font-bold tracking-widest text-muted-foreground">{imageFor(logo) ? <img src={imageFor(logo)} alt={settingText(logo.settings, 'label', locale)} className="h-8 w-auto" /> : settingText(logo.settings, 'label', locale)}</span>)}</div></section>
}

function Newsletter({ section, locale }: SectionProps) {
  const ar = isArabic(locale)
  const [sent, setSent] = useState(false)
  const title = settingText(section.settings, 'heading', locale) || settingText(section.settings, 'title', locale)
  const body = settingText(section.settings, 'body', locale)
  if (!title && !body) return null
  return <section className="mx-auto max-w-3xl px-5 py-16 text-center sm:px-8">{title && <h2 className="text-2xl font-bold">{title}</h2>}{body && <p className="mt-3 text-sm text-muted-foreground">{body}</p>}<form onSubmit={(event) => { event.preventDefault(); setSent(true) }} className="mx-auto mt-6 flex max-w-md gap-2"><input type="email" required aria-label={ar ? 'البريد الإلكتروني' : 'Email'} className="h-11 min-w-0 flex-1 rounded-xl border bg-background px-3" placeholder={ar ? 'بريدك الإلكتروني' : 'Your email'} /><button type="submit" className="h-11 rounded-xl bg-primary px-4 text-sm font-semibold text-primary-foreground">{ar ? 'اشتراك' : 'Subscribe'}</button></form>{sent && <p className="mt-3 text-sm text-muted-foreground">{ar ? 'تم استلام بريدك.' : 'Thanks — we received your email.'}</p>}</section>
}

function Spacer({ section }: SectionProps) {
  const height = settingNumber(section.settings, 'height', 48)
  return <div aria-hidden="true" style={{ height: Math.max(8, Math.min(height, 320)) }} />
}

function Footer({ section, locale }: SectionProps) {
  const label = settingText(section.settings, 'copyright', locale) || settingText(section.settings, 'label', locale)
  const links = blocksOfType(section, 'link')
  return <footer className="border-t border-border/70 bg-muted/30 px-5 py-10 sm:px-8"><div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-4 text-sm text-muted-foreground sm:flex-row">{label && <span className="font-semibold text-foreground">{label}</span>}{links.length > 0 && <div className="flex flex-wrap gap-5">{links.map((link) => <a key={link.id} href={localizeHref(settingString(link.settings, 'url', '/'), locale)} className="hover:text-foreground">{settingText(link.settings, 'label', locale)}</a>)}</div>}</div></footer>
}

function CartItems({ locale }: SectionProps) {
  const ar = isArabic(locale)
  const cart = useCart()
  const add = useAddToCart()
  const remove = useRemoveCartItem()
  const applyCoupon = useApplyCoupon()
  const removeCoupon = useRemoveCoupon()
  const [code, setCode] = useState('')
  const [couponError, setCouponError] = useState('')
  const items = cart.data?.items ?? []
  const totals = cartTotals(cart.data)
  const coupon = cartCouponCode(cart.data)
  const loggedIn = hasCustomerSession()

  if (cart.isLoading) return <section className="mx-auto max-w-4xl px-5 py-16 sm:px-8"><div className="h-10 w-1/3 animate-pulse rounded bg-muted" /><div className="mt-8 h-40 animate-pulse rounded-2xl bg-muted" /></section>
  if (cart.isError) return <section className="mx-auto max-w-xl px-5 py-24 text-center text-muted-foreground">{ar ? 'تعذر تحميل السلة.' : 'Could not load your cart.'}</section>

  return <section className="mx-auto max-w-4xl px-5 py-16 sm:px-8 sm:py-24">
    <span className="text-xs font-bold uppercase tracking-[0.2em] text-primary">{ar ? 'المتجر' : 'Shop'}</span>
    <h1 className="mt-3 text-4xl font-bold">{ar ? 'سلة التسوق' : 'Your cart'}</h1>
    {items.length === 0 ? <div className="mt-10 rounded-2xl border border-dashed p-16 text-center text-muted-foreground">{ar ? 'السلة فارغة.' : 'Your cart is empty.'}</div> : <div className="mt-10 grid gap-6 lg:grid-cols-[1fr_320px]">
      <div className="space-y-4">{items.map((item) => <article key={item.product_ulid} className="flex items-center justify-between gap-4 rounded-2xl border bg-card p-5"><div className="flex min-w-0 items-center gap-4"><div className="grid size-16 shrink-0 place-items-center rounded-xl bg-gradient-to-br from-primary/15 via-muted to-secondary bg-cover bg-center text-xs font-bold text-primary/60" style={item.hero_image_url ? { backgroundImage: `url("${item.hero_image_url}")` } : undefined}>{!item.hero_image_url && item.product_name.slice(0, 2)}</div><div className="min-w-0"><h2 className="truncate font-semibold">{item.product_name}</h2><p className="mt-1 text-sm text-muted-foreground">{item.unit_price} {item.currency}</p><div className="mt-2 flex items-center gap-2"><button type="button" onClick={() => void add.mutateAsync({ productUlid: item.product_ulid, quantity: item.quantity - 1 }).catch(() => undefined)} disabled={item.quantity <= 1 || add.isPending} aria-label={ar ? 'تقليل الكمية' : 'Decrease quantity'} className="grid size-7 place-items-center rounded-full border disabled:opacity-40"><Minus className="size-3" /></button><span className="text-xs font-semibold">{item.quantity}</span><button type="button" onClick={() => void add.mutateAsync({ productUlid: item.product_ulid, quantity: item.quantity + 1 }).catch(() => undefined)} disabled={item.quantity >= 10 || add.isPending} aria-label={ar ? 'زيادة الكمية' : 'Increase quantity'} className="grid size-7 place-items-center rounded-full border disabled:opacity-40"><Plus className="size-3" /></button></div></div></div><div className="flex flex-col items-end gap-3"><strong>{item.total_price} {item.currency}</strong><button type="button" onClick={() => void remove.mutateAsync(item.product_ulid).catch(() => undefined)} disabled={remove.isPending} aria-label={ar ? 'إزالة' : 'Remove'} className="text-muted-foreground hover:text-destructive disabled:opacity-40"><Trash2 className="size-4" /></button></div></article>)}</div>
      <aside className="h-fit rounded-2xl border bg-card p-5">
        <h2 className="font-semibold">{ar ? 'ملخص الطلب' : 'Order summary'}</h2>
        <dl className="mt-4 space-y-2 text-sm"><div className="flex justify-between"><dt className="text-muted-foreground">{ar ? 'المجموع الفرعي' : 'Subtotal'}</dt><dd>{totals.subtotal.toFixed(2)} {totals.currency}</dd></div>{totals.discount > 0 && <div className="flex justify-between text-primary"><dt>{ar ? 'الخصم' : 'Discount'}</dt><dd>-{totals.discount.toFixed(2)} {totals.currency}</dd></div>}{totals.vat > 0 && <div className="flex justify-between"><dt className="text-muted-foreground">{totals.vatLabel}</dt><dd>{totals.vat.toFixed(2)} {totals.currency}</dd></div>}<div className="flex justify-between border-t pt-3 text-base font-bold"><dt>{ar ? 'الإجمالي' : 'Total'}</dt><dd>{totals.total.toFixed(2)} {totals.currency}</dd></div></dl>
        <div className="mt-5 border-t pt-4">{coupon ? <div className="flex items-center justify-between rounded-xl bg-primary/5 px-3 py-2 text-sm"><span className="font-semibold">{coupon}</span><button type="button" onClick={() => void removeCoupon.mutateAsync().catch(() => undefined)} className="text-xs font-semibold text-muted-foreground hover:text-destructive">{ar ? 'إزالة' : 'Remove'}</button></div> : <form onSubmit={(event) => { event.preventDefault(); setCouponError(''); void applyCoupon.mutateAsync(code).then(() => setCode('')).catch((cause: unknown) => setCouponError(cause instanceof Error ? cause.message : ar ? 'كود غير صالح.' : 'Invalid code.')) }} className="flex gap-2"><input value={code} onChange={(event) => setCode(event.target.value)} required minLength={3} placeholder={ar ? 'كود الخصم' : 'Coupon code'} className="h-10 min-w-0 flex-1 rounded-xl border bg-background px-3 text-sm" /><button type="submit" disabled={applyCoupon.isPending} className="h-10 rounded-xl border px-3 text-sm font-semibold disabled:opacity-50">{ar ? 'تطبيق' : 'Apply'}</button></form>}{couponError && <p role="alert" className="mt-2 text-xs text-destructive">{couponError}</p>}</div>
        <Link href={loggedIn ? `/${locale}/checkout` : `/${locale}/login?next=${encodeURIComponent(`/${locale}/checkout`)}`} className="mt-5 flex w-full items-center justify-center gap-2 rounded-2xl bg-primary px-5 py-3.5 text-sm font-bold text-primary-foreground">{loggedIn ? (ar ? 'المتابعة للدفع' : 'Continue to checkout') : (ar ? 'سجل الدخول للدفع' : 'Sign in to checkout')}<ArrowRight className="size-4 rtl:-scale-x-100" /></Link>
        <p className="mt-3 text-center text-xs text-muted-foreground">{cartItemCount(cart.data)} {ar ? 'منتج' : 'items'}</p>
      </aside>
    </div>}
  </section>
}

function AccountDashboard({ locale }: SectionProps) {
  const ar = isArabic(locale)
  return <section className="mx-auto max-w-3xl px-5 py-16 sm:px-8 sm:py-24"><span className="text-xs font-bold uppercase tracking-[0.2em] text-primary">{ar ? 'حسابك' : 'Your account'}</span><h1 className="mt-3 text-4xl font-bold">{ar ? 'مرحبًا بك' : 'Welcome back'}</h1><div className="mt-8 grid gap-3 sm:grid-cols-2"><Link href={`/${locale}/orders`} className="rounded-2xl border bg-card p-6 font-semibold transition-colors hover:border-primary">{ar ? 'طلباتي' : 'My orders'}</Link><Link href={`/${locale}/cart`} className="rounded-2xl border bg-card p-6 font-semibold transition-colors hover:border-primary">{ar ? 'سلة التسوق' : 'My cart'}</Link><Link href={`/${locale}/products`} className="rounded-2xl border bg-card p-6 font-semibold transition-colors hover:border-primary">{ar ? 'تسوق المنتجات' : 'Browse products'}</Link><Link href={`/${locale}`} className="rounded-2xl border bg-card p-6 font-semibold transition-colors hover:border-primary">{ar ? 'الرئيسية' : 'Home'}</Link></div></section>
}

function OfferHero({ section, locale }: SectionProps) {
  const ar = isArabic(locale)
  const accept = settingText(section.settings, 'accept_label', locale, ar ? 'نعم، أضف العرض' : 'Yes, add this offer')
  const decline = settingText(section.settings, 'decline_label', locale, ar ? 'لا شكرا' : 'No thanks')
  const heading = settingText(section.settings, 'heading', locale) || settingText(section.settings, 'title', locale, ar ? 'عرض خاص' : 'Special offer')
  const showPrice = settingBoolean(section.settings, 'show_price', true)
  return <section className="mx-auto max-w-3xl px-5 py-16 text-center sm:px-8"><div className="rounded-3xl border bg-card p-10"><h2 className="text-3xl font-bold tracking-tight">{heading}</h2>{showPrice && settingString(section.settings, 'price') && <p className="mt-4 text-lg font-semibold text-primary">{settingString(section.settings, 'price')}</p>}<div className="mt-8 flex flex-wrap justify-center gap-3"><a href={localizeHref(settingString(section.settings, 'accept_url', '#'), locale)} className="inline-flex rounded-full bg-primary px-6 py-3 text-sm font-semibold text-primary-foreground">{accept}</a><a href={localizeHref(settingString(section.settings, 'decline_url', '#'), locale)} className="inline-flex rounded-full border px-6 py-3 text-sm font-semibold">{decline}</a></div></div></section>
}

function Countdown({ section, locale }: SectionProps) {
  const label = settingText(section.settings, 'label', locale)
  const color = settingString(section.settings, 'color', '#D32F2F')
  return <section className="mx-auto max-w-3xl px-5 py-12 text-center sm:px-8"><p className="text-sm font-medium uppercase tracking-[0.2em]" style={{ color }}>{label || (isArabic(locale) ? 'ينتهي العرض خلال' : 'Offer ends in')}</p><div className="mt-4 flex justify-center gap-3">{['00', '00', '00'].map((value, index) => <span key={index} className="rounded-xl border bg-card px-5 py-3 text-2xl font-bold tabular-nums">{value}</span>)}</div></section>
}

function ThankYouMessage({ section, locale }: SectionProps) {
  const heading = settingText(section.settings, 'heading', locale, isArabic(locale) ? 'شكرا لطلبك' : 'Thank you for your order')
  const message = settingText(section.settings, 'message', locale)
  return <section className="mx-auto max-w-3xl px-5 py-20 text-center sm:px-8"><h2 className="text-3xl font-bold tracking-tight">{heading}</h2>{message && <RichTextContent html={message} className="theme-rich-text mt-6 text-start" />}</section>
}

function NotFoundMessage({ section, locale }: SectionProps) {
  const heading = settingText(section.settings, 'heading', locale, isArabic(locale) ? 'الصفحة غير موجودة' : 'Page not found')
  return <section className="mx-auto max-w-3xl px-5 py-24 text-center sm:px-8"><h2 className="text-4xl font-bold tracking-tight">{heading}</h2><Link href={`/${locale}`} className="mt-6 inline-flex rounded-full bg-primary px-6 py-3 text-sm font-semibold text-primary-foreground">{isArabic(locale) ? 'العودة للرئيسية' : 'Back to home'}</Link></section>
}

export const storefrontSections: Record<string, (props: SectionProps) => ReactNode> = {
  announcement: Announcement,
  header: Header,
  hero: Hero,
  product_grid: ProductGrid,
  product_list: ProductGrid,
  product_catalog: ProductGrid,
  product_details: ProductDetail,
  product_detail: ProductDetail,
  product_carousel: ProductCarousel,
  featured_product: FeaturedProduct,
  image_text: ImageText,
  rich_text: RichText,
  faq: Faq,
  testimonials: Testimonials,
  cta: Cta,
  category_grid: CategoryGrid,
  video: Video,
  stats: Stats,
  logo_cloud: LogoCloud,
  newsletter: Newsletter,
  spacer: Spacer,
  footer: Footer,
  cart_items: CartItems,
  account_dashboard: AccountDashboard,
  offer_hero: OfferHero,
  countdown: Countdown,
  thank_you_message: ThankYouMessage,
  not_found_message: NotFoundMessage,
}
