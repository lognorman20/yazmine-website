import { useCallback, useEffect, useMemo, useRef, useState, type ReactNode } from 'react'
import type { ProductId } from '../data/products'
import { addCartLine, createCart, fetchCart, fetchCatalog, removeCartLine, updateCartLine } from '../shopify/storefront'
import { MAX_QUANTITY, type Cart, type CatalogState, type DrawerState, type SyncState } from './cart'
import { CartContext, type CartContextValue } from './CartContext'

const CART_ID_KEY = 'lby-shopify-cart'

function loadCartId() {
  try {
    return localStorage.getItem(CART_ID_KEY)
  } catch {
    return null
  }
}

function saveCartId(cartId: string | null) {
  try {
    if (cartId) localStorage.setItem(CART_ID_KEY, cartId)
    else localStorage.removeItem(CART_ID_KEY)
  } catch {
    // Storage can be full or blocked (private mode); the in-memory cart still works.
  }
}

export default function CartProvider({ children }: { children: ReactNode }) {
  const [catalog, setCatalog] = useState<CatalogState>({ status: 'loading' })
  const [cart, setCart] = useState<Cart | null>(null)
  const [storedCartId] = useState(loadCartId)
  const [sync, setSync] = useState<SyncState>(storedCartId ? { status: 'pending' } : { status: 'idle' })
  const [drawer, setDrawer] = useState<DrawerState>('closed')

  // Mutations run one at a time against the latest cart, so a queued add sees the cart a prior create returned.
  const queue = useRef(Promise.resolve())
  const queued = useRef(0)
  const cartRef = useRef<Cart | null>(null)

  const chain = useCallback((operation: (current: Cart | null) => Promise<Cart | null>) => {
    queued.current += 1
    queue.current = queue.current.then(async () => {
      let next: SyncState = { status: 'idle' }
      try {
        const updated = await operation(cartRef.current)
        cartRef.current = updated
        setCart(updated)
        saveCartId(updated?.id ?? null)
      } catch (error) {
        next = { status: 'error', message: error instanceof Error ? error.message : 'Something went wrong.' }
      }
      queued.current -= 1
      if (queued.current === 0 || next.status === 'error') setSync(next)
    })
  }, [])

  const enqueue = useCallback(
    (operation: (current: Cart | null) => Promise<Cart | null>) => {
      setSync({ status: 'pending' })
      chain(operation)
    },
    [chain],
  )

  useEffect(() => {
    let cancelled = false
    fetchCatalog().then(
      (loaded) => !cancelled && setCatalog({ status: 'ready', catalog: loaded }),
      () => !cancelled && setCatalog({ status: 'error' }),
    )
    return () => {
      cancelled = true
    }
  }, [])

  useEffect(() => {
    // A null cart means it expired or was already checked out; the chain then clears the stored ID.
    if (storedCartId) chain(() => fetchCart(storedCartId))
  }, [chain, storedCartId])

  const addToBag = useCallback(
    (id: ProductId) => {
      setDrawer('bag')
      const entry = catalog.status === 'ready' ? catalog.catalog[id] : undefined
      if (!entry?.availableForSale) return
      enqueue(async (current) => {
        if (!current) return createCart(entry.variantId)
        const line = current.lines.find((cartLine) => cartLine.product.id === id)
        if (line && line.quantity >= MAX_QUANTITY) return current
        return addCartLine(current.id, entry.variantId)
      })
    },
    [catalog, enqueue],
  )

  const setQuantity = useCallback(
    (lineId: string, quantity: number) => {
      enqueue(async (current) => {
        if (!current) return current
        const clamped = Math.min(Math.floor(quantity), MAX_QUANTITY)
        return clamped > 0 ? updateCartLine(current.id, lineId, clamped) : removeCartLine(current.id, lineId)
      })
    },
    [enqueue],
  )

  const openBag = useCallback(() => setDrawer('bag'), [])
  const closeBag = useCallback(() => setDrawer('closed'), [])

  const value = useMemo<CartContextValue>(
    () => ({ catalog, cart, sync, drawer, addToBag, setQuantity, openBag, closeBag }),
    [catalog, cart, sync, drawer, addToBag, setQuantity, openBag, closeBag],
  )

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>
}
