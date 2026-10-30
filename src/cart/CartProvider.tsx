import { useEffect, useMemo, useReducer, useState, type ReactNode } from 'react'
import { cartReducer, createOrder, getCartLines, getSubtotalCents, loadCart, saveCart, type CheckoutStep } from './cart'
import { CartContext, type CartContextValue, type Toast } from './CartContext'

export default function CartProvider({ children }: { children: ReactNode }) {
  const [quantities, dispatch] = useReducer(cartReducer, undefined, loadCart)
  const [checkout, setCheckout] = useState<CheckoutStep>({ step: 'closed' })
  const [toast, setToast] = useState<Toast | null>(null)

  useEffect(() => {
    saveCart(quantities)
  }, [quantities])

  const value = useMemo<CartContextValue>(() => {
    const lines = getCartLines(quantities)

    return {
      lines,
      itemCount: lines.reduce((count, line) => count + line.quantity, 0),
      subtotalCents: getSubtotalCents(lines),
      checkout,
      toast,
      addToBag: (id) => {
        dispatch({ type: 'add', id })
        setCheckout({ step: 'bag' })
      },
      setQuantity: (id, quantity) => dispatch({ type: 'setQuantity', id, quantity }),
      openBag: () => setCheckout({ step: 'bag' }),
      goToDetails: () => setCheckout({ step: 'details' }),
      closeCheckout: () => setCheckout({ step: 'closed' }),
      // Local only until Shopify's Storefront API backs checkout: no payment, no network.
      placeOrder: (customer, address) => {
        const order = createOrder(lines, customer, address)
        dispatch({ type: 'clear' })
        setCheckout({ step: 'placed', order })
        setToast({
          key: Date.now(),
          message: `Order ${order.id} placed. Shipping is still being set up, so we'll email you before it ships.`,
        })
      },
      dismissToast: () => setToast(null),
    }
  }, [quantities, checkout, toast])

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>
}
