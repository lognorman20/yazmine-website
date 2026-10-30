import { useCallback, useEffect, useMemo, useReducer, useState, type ReactNode } from 'react'
import type { ProductId } from '../data/products'
import {
  cartReducer,
  createOrder,
  getCartLines,
  getSubtotalCents,
  loadCart,
  saveCart,
  type CheckoutStep,
  type Customer,
  type ShippingAddress,
} from './cart'
import { CartContext, type CartContextValue, type Toast } from './CartContext'

export default function CartProvider({ children }: { children: ReactNode }) {
  const [quantities, dispatch] = useReducer(cartReducer, undefined, loadCart)
  const [checkout, setCheckout] = useState<CheckoutStep>({ step: 'closed' })
  const [toast, setToast] = useState<Toast | null>(null)

  useEffect(() => {
    saveCart(quantities)
  }, [quantities])

  const lines = useMemo(() => getCartLines(quantities), [quantities])

  const addToBag = useCallback((id: ProductId) => {
    dispatch({ type: 'add', id })
    setCheckout({ step: 'bag' })
  }, [])
  const setQuantity = useCallback((id: ProductId, quantity: number) => {
    dispatch({ type: 'setQuantity', id, quantity })
  }, [])
  const openBag = useCallback(() => setCheckout({ step: 'bag' }), [])
  const goToDetails = useCallback(() => setCheckout({ step: 'details' }), [])
  const closeCheckout = useCallback(() => {
    if (checkout.step === 'placed') {
      setToast({
        key: Date.now(),
        message: `Order ${checkout.order.id} placed. Shipping is still being set up, so we'll email you before it ships.`,
      })
    }
    setCheckout({ step: 'closed' })
  }, [checkout])
  const dismissToast = useCallback(() => setToast(null), [])

  // Local only until Shopify's Storefront API backs checkout: no payment, no network.
  const placeOrder = useCallback(
    (customer: Customer, address: ShippingAddress) => {
      const order = createOrder(lines, customer, address)
      dispatch({ type: 'clear' })
      setCheckout({ step: 'placed', order })
    },
    [lines],
  )

  const value = useMemo<CartContextValue>(
    () => ({
      lines,
      itemCount: lines.reduce((count, line) => count + line.quantity, 0),
      subtotalCents: getSubtotalCents(lines),
      checkout,
      toast,
      addToBag,
      setQuantity,
      openBag,
      goToDetails,
      closeCheckout,
      placeOrder,
      dismissToast,
    }),
    [lines, checkout, toast, addToBag, setQuantity, openBag, goToDetails, closeCheckout, placeOrder, dismissToast],
  )

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>
}
