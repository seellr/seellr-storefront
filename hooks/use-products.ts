'use client'

import { useQuery } from '@tanstack/react-query'
import { commerceClient } from '@/lib/commerce/client'
import type { Product } from '@/lib/commerce/types'

export function useProducts(query = '', options: { enabled?: boolean } = {}) {
  return useQuery({
    queryKey: ['products', query],
    queryFn: async () => (await commerceClient.products(query)).data ?? [],
    enabled: options.enabled ?? true,
  })
}

export function useProduct(slug: string) {
  return useQuery({
    queryKey: ['product', slug],
    queryFn: async () => (await commerceClient.product(slug)).data,
    enabled: Boolean(slug),
  })
}

/** Preview has no server-rendered product data, so product sections fetch it. */
export function useSectionProducts(initial: Product[] | undefined | null, query = ''): Product[] {
  const needsFetch = initial === undefined || initial === null
  const products = useProducts(query, { enabled: needsFetch })
  return initial ?? products.data ?? []
}
