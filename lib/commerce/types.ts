import type { z } from 'zod'

export type Locale = 'ar' | 'en'
export interface ApiEnvelope<T> { success: boolean; message?: string; data?: T; error_code?: string; errors?: Record<string, string[]>; meta?: { per_page?: number; next_cursor?: string | null; has_more?: boolean; page?: number; total?: number; total_pages?: number } }
export interface Product { ulid: string; slug: string; name: string; one_liner?: string | null; base_price: string; sale_price?: string | null; currency: string; hero_image_url?: string | null; images?: Array<{ url?: string | null; thumb_url?: string | null }>; description?: Record<string, string | null | undefined>; seo_meta?: { meta_title?: string | null; meta_description?: string | null; og_image_url?: string | null; canonical_url?: string | null; schema_type?: string | null }; faqs?: Array<{ question?: string | null; answer?: string | null }>; testimonials?: Array<{ quote?: string | null; author?: string | null }>; requires_shipping?: boolean; featured?: boolean }
export interface CartItem { product_ulid: string; product_name: string; quantity: number; unit_price: string; total_price: string; currency: string; coupon_eligible?: boolean; requires_shipping?: boolean }
export interface Cart { items: CartItem[]; coupon_code?: string | null; currency?: string }
export interface User { ulid: string; first_name?: string | null; last_name?: string | null; name?: string | null; email?: string | null; email_verified?: boolean; phone?: string | null }
export interface Order { ulid: string; invoice_number?: string | null; status: { id: number | string; label: string }; subtotal: string; discount_amount: string; vat_amount: string; total: string; currency: string; created_at: string }
export type SchemaOutput<T extends z.ZodType> = z.infer<T>
