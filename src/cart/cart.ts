import { PRODUCTS_BY_ID, isProductId, type Product, type ProductId } from '../data/products'

export type CartQuantities = Partial<Record<ProductId, number>>

export type CartAction =
  | { type: 'add'; id: ProductId }
  | { type: 'setQuantity'; id: ProductId; quantity: number }
  | { type: 'clear' }

export type CartLine = { product: Product; quantity: number }

export type Customer = { name: string; email: string }

export type ShippingAddress = {
  line1: string
  line2?: string
  city: string
  state: string
  zip: string
}

export type Order = {
  id: string
  lines: CartLine[]
  subtotalCents: number
  customer: Customer
  address: ShippingAddress
  placedAt: Date
}

export type CheckoutStep =
  | { step: 'closed' }
  | { step: 'bag' }
  | { step: 'details' }
  | { step: 'placed'; order: Order }

export const MAX_QUANTITY = 20

const STORAGE_KEY = 'lby-cart'

export function cartReducer(state: CartQuantities, action: CartAction): CartQuantities {
  switch (action.type) {
    case 'add':
      return { ...state, [action.id]: Math.min((state[action.id] ?? 0) + 1, MAX_QUANTITY) }
    case 'setQuantity': {
      const { [action.id]: _removed, ...rest } = state
      const quantity = Math.min(Math.floor(action.quantity), MAX_QUANTITY)
      return quantity > 0 ? { ...rest, [action.id]: quantity } : rest
    }
    case 'clear':
      return {}
  }
}

export function getCartLines(quantities: CartQuantities): CartLine[] {
  return Object.entries(quantities).flatMap(([id, quantity]) =>
    isProductId(id) && quantity ? [{ product: PRODUCTS_BY_ID[id], quantity }] : [],
  )
}

export function getSubtotalCents(lines: readonly CartLine[]) {
  return lines.reduce((total, line) => total + line.product.priceCents * line.quantity, 0)
}

export function loadCart(): CartQuantities {
  try {
    const parsed: unknown = JSON.parse(localStorage.getItem(STORAGE_KEY) ?? '{}')
    if (typeof parsed !== 'object' || parsed === null) return {}

    const quantities: CartQuantities = {}
    for (const [id, quantity] of Object.entries(parsed)) {
      if (isProductId(id) && Number.isInteger(quantity) && quantity > 0) {
        quantities[id] = Math.min(quantity, MAX_QUANTITY)
      }
    }
    return quantities
  } catch {
    return {}
  }
}

export function saveCart(quantities: CartQuantities) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(quantities))
  } catch {
    // Storage can be full or blocked (private mode); the in-memory cart still works.
  }
}

const ORDER_ID_ALPHABET = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789'

function createOrderId() {
  const bytes = crypto.getRandomValues(new Uint8Array(6))
  return `LBY-${Array.from(bytes, (byte) => ORDER_ID_ALPHABET[byte % ORDER_ID_ALPHABET.length]).join('')}`
}

export function createOrder(lines: CartLine[], customer: Customer, address: ShippingAddress): Order {
  return {
    id: createOrderId(),
    lines,
    subtotalCents: getSubtotalCents(lines),
    customer,
    address,
    placedAt: new Date(),
  }
}
