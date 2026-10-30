import { createContext, useContext } from 'react'
import type { ProductId } from '../data/products'
import type { CartLine, CheckoutStep, Customer, ShippingAddress } from './cart'

export type Toast = { key: number; message: string }

export type CartContextValue = {
  lines: CartLine[]
  itemCount: number
  subtotalCents: number
  checkout: CheckoutStep
  toast: Toast | null
  addToBag: (id: ProductId) => void
  setQuantity: (id: ProductId, quantity: number) => void
  openBag: () => void
  goToDetails: () => void
  closeCheckout: () => void
  placeOrder: (customer: Customer, address: ShippingAddress) => void
  dismissToast: () => void
}

export const CartContext = createContext<CartContextValue | null>(null)

export function useCart() {
  const value = useContext(CartContext)
  if (!value) throw new Error('useCart must be used inside CartProvider')
  return value
}
