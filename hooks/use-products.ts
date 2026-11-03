'use client'

import { useQuery } from '@tanstack/react-query'
import { commerceClient } from '@/lib/commerce/client'
export function useProducts(query = '') { return useQuery({ queryKey: ['products', query], queryFn: async () => (await commerceClient.products(query)).data ?? [] }) }
export function useProduct(slug: string) { return useQuery({ queryKey: ['product', slug], queryFn: async () => (await commerceClient.product(slug)).data, enabled: Boolean(slug) }) }
