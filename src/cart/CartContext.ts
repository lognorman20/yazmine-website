import { createContext, useContext } from 'react'
import type { ProductId } from '../data/products'
import type { Cart, CatalogState, DrawerState, SyncState } from './cart'

export type CartContextValue = {
  catalog: CatalogState
  cart: Cart | null
  sync: SyncState
  drawer: DrawerState
  addToBag: (id: ProductId) => void
  setQuantity: (lineId: string, quantity: number) => void
  openBag: () => void
  closeBag: () => void
}

export const CartContext = createContext<CartContextValue | null>(null)

export function useCart() {
  const value = useContext(CartContext)
  if (!value) throw new Error('useCart must be used inside CartProvider')
  return value
}
