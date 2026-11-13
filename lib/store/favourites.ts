'use client'

import { create } from 'zustand'
import { persist } from 'zustand/middleware'

/** Minimal product snapshot kept in the wishlist so the drawer stays light. */
export interface FavouriteProduct {
  ulid: string
  slug: string
  name: string
  oneLiner?: string | null
  price: string
  comparePrice?: string
  currency: string
  image: string
}

export const FAVOURITES_STORAGE_KEY = 'seellr-favourites'

interface FavouritesState {
  items: FavouriteProduct[]
  /** True once the persisted list has been read, so counts never flash on load. */
  hydrated: boolean
  isOpen: boolean
  markHydrated: () => void
  open: () => void
  close: () => void
  toggle: (product: FavouriteProduct) => void
  remove: (ulid: string) => void
  clear: () => void
}

export const useFavourites = create<FavouritesState>()(
  persist(
    (set) => ({
      items: [],
      hydrated: false,
      isOpen: false,
      markHydrated: () => set({ hydrated: true }),
      open: () => set({ isOpen: true }),
      close: () => set({ isOpen: false }),
      toggle: (product) =>
        set((state) => {
          const exists = state.items.some((item) => item.ulid === product.ulid)
          return {
            items: exists
              ? state.items.filter((item) => item.ulid !== product.ulid)
              : [product, ...state.items],
          }
        }),
      remove: (ulid) => set((state) => ({ items: state.items.filter((item) => item.ulid !== ulid) })),
      clear: () => set({ items: [] }),
    }),
    {
      name: FAVOURITES_STORAGE_KEY,
      version: 1,
      // Only the list is persisted; UI state belongs to the session.
      partialize: (state) => ({ items: state.items }),
      onRehydrateStorage: () => () => useFavourites.getState().markHydrated(),
    },
  ),
)

export function isFavourite(items: FavouriteProduct[], ulid: string | undefined | null): boolean {
  if (!ulid) return false
  return items.some((item) => item.ulid === ulid)
}
