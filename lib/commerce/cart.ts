'use client'

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { commerceClient } from './client'
import { clearGuestToken, hasCustomerSession, hasGuestToken } from './session'
import type { Cart } from './types'

export const CART_QUERY_KEY = ['cart'] as const

export function cartTotals(cart: Cart | null | undefined) {
  const items = cart?.items ?? []
  const itemsSubtotal = items.reduce((sum, item) => sum + Number(item.total_price ?? 0), 0)
  const hasBackendSubtotal = cart?.subtotal !== undefined && cart?.subtotal !== null && cart?.subtotal !== ''
  const subtotal = hasBackendSubtotal ? Number(cart?.subtotal ?? 0) : itemsSubtotal
  const discount = Number(cart?.discount_amount ?? 0)
  const vat = Number(cart?.vat_amount ?? 0)
  const hasBackendTotal = cart?.total !== undefined && cart?.total !== null && cart?.total !== '' && Number(cart.total) > 0
  const total = hasBackendTotal ? Number(cart?.total ?? 0) : Math.max(0, subtotal - discount + vat)
  return {
    subtotal,
    discount,
    vat,
    total,
    currency: cart?.currency ?? '',
    vatLabel: cart?.vat_label ?? 'VAT',
  }
}

export function cartItemCount(cart: Cart | null | undefined): number {
  return (cart?.items ?? []).reduce((total, item) => total + Number(item.quantity ?? 0), 0)
}

export function cartCouponCode(cart: Cart | null | undefined): string {
  if (!cart) return ''
  if (typeof cart.coupon === 'string') return cart.coupon
  if (cart.coupon?.code) return String(cart.coupon.code)
  return cart.coupon_code ?? ''
}

export async function fetchCart(): Promise<Cart | null> {
  const response = hasCustomerSession()
    ? await commerceClient.cart()
    : await commerceClient.guestCart()
  return response.data ?? null
}

export function useCart() {
  return useQuery({
    queryKey: CART_QUERY_KEY,
    queryFn: fetchCart,
    staleTime: 15_000,
  })
}

function applyCart(queryClient: ReturnType<typeof useQueryClient>, cart: Cart | null | undefined) {
  if (cart) queryClient.setQueryData(CART_QUERY_KEY, cart)
  void queryClient.invalidateQueries({ queryKey: CART_QUERY_KEY })
}

export function useAddToCart() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async ({ productUlid, quantity = 1 }: { productUlid: string; quantity?: number }) => {
      const response = hasCustomerSession()
        ? await commerceClient.addCartItem(productUlid, quantity)
        : await commerceClient.addGuestItem(productUlid, quantity)
      return response.data ?? null
    },
    onSuccess: (cart) => applyCart(queryClient, cart),
  })
}

export function useRemoveCartItem() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (productUlid: string) => {
      const response = hasCustomerSession()
        ? await commerceClient.removeCartItem(productUlid)
        : await commerceClient.removeGuestItem(productUlid)
      return response.data ?? null
    },
    onSuccess: (cart) => applyCart(queryClient, cart),
  })
}

export function useApplyCoupon() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (code: string) => {
      const response = hasCustomerSession()
        ? await commerceClient.applyCoupon(code)
        : await commerceClient.applyGuestCoupon(code)
      return response.data ?? null
    },
    onSuccess: (cart) => applyCart(queryClient, cart),
  })
}

export function useRemoveCoupon() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async () => {
      const response = hasCustomerSession()
        ? await commerceClient.removeCoupon()
        : await commerceClient.removeGuestCoupon()
      return response.data ?? null
    },
    onSuccess: (cart) => applyCart(queryClient, cart),
  })
}

/**
 * A guest cart is merged into the customer cart right after login/registration.
 * The backend endpoint needs the guest token and the fresh customer cookie, so
 * it must run from the browser after the login response set the cookie.
 */
export async function mergeGuestCart(queryClient?: ReturnType<typeof useQueryClient>): Promise<void> {
  if (!hasCustomerSession() || !hasGuestToken()) return
  try {
    await commerceClient.mergeGuestCart()
    clearGuestToken()
    if (queryClient) applyCart(queryClient, null)
  } catch {
    // A merge failure must never block the login flow.
  }
}
