import type { z } from 'zod'

export type Locale = 'ar' | 'en'

export interface ApiEnvelope<T> {
  success: boolean
  message?: string
  data?: T
  error_code?: string
  errors?: Record<string, string[]>
  meta?: { per_page?: number; next_cursor?: string | null; has_more?: boolean; page?: number; total?: number; total_pages?: number }
}

export interface ProductImage {
  ulid?: string
  url?: string | null
  thumb_url?: string | null
  alt?: string | null
  sort_order?: number
}

export interface ProductDescription {
  short_description?: string | null
  full_description?: string | null
  [key: string]: unknown
}

export interface ProductFaq {
  question?: string | null
  answer?: string | null
}

export interface ProductTestimonial {
  quote?: string | null
  author?: string | null
}

export interface Product {
  ulid: string
  slug: string
  name: string
  internal_name?: string | null
  one_liner?: string | null
  base_price: string | number
  sale_price?: string | number | null
  currency: string
  hero_image_url?: string | null
  images?: ProductImage[]
  description?: ProductDescription | string | null
  seo_meta?: {
    meta_title?: string | null
    meta_description?: string | null
    og_image_url?: string | null
    canonical_url?: string | null
    schema_type?: string | null
  } | null
  faqs?: ProductFaq[]
  testimonials?: ProductTestimonial[]
  requires_shipping?: boolean
  featured?: boolean
  type?: { id: number | string; label: string } | number | string | null
  status?: { id: number | string; label: string } | null
  coupon_eligible?: boolean
  delivery_method?: { id: number | string; label: string } | number | string | null
}

export interface CartItem {
  product_ulid: string
  product_name: string
  product_slug?: string | null
  hero_image_url?: string | null
  quantity: number
  unit_price: string | number
  total_price: string | number
  currency: string
  coupon_eligible?: boolean
  requires_shipping?: boolean
}

export interface CartCoupon {
  code?: string | null
  type?: { id: number | string; label: string } | string | null
  value?: string | number | null
  [key: string]: unknown
}

export interface Cart {
  items: CartItem[]
  coupon?: CartCoupon | string | null
  coupon_code?: string | null
  // The guest cart endpoint only returns `items`, `coupon_code` and `currency`,
  // so totals are optional here and derived from the items when missing.
  subtotal?: string | number
  discount_amount?: string | number
  vat_amount?: string | number
  vat_label?: string | null
  total?: string | number
  currency: string
}

export interface User {
  ulid: string
  first_name?: string | null
  last_name?: string | null
  name?: string | null
  email?: string | null
  email_verified?: boolean
  phone?: string | null
  roles?: string[]
}

export interface Order {
  ulid: string
  invoice_number?: string | null
  status: { id: number | string; label: string }
  subtotal: string | number
  discount_amount: string | number
  vat_amount: string | number
  total: string | number
  currency: string
  payment_method?: { id: number | string; label: string } | string | null
  payment_gateway?: { id: number | string; label: string } | string | null
  requires_shipping?: boolean
  created_at: string
  items?: CartItem[]
}

export interface ShippingMethod {
  id?: number | string
  ulid?: string
  name?: string
  label?: string
  price?: string | number
  currency?: string
  [key: string]: unknown
}

export type SchemaOutput<T extends z.ZodType> = z.infer<T>
