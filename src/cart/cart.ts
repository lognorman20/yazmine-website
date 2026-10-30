import { PRODUCTS_BY_ID, isProductId, type Product, type ProductId } from '../data/products.ts'

export const MAX_QUANTITY = 20

export type CatalogEntry = { variantId: string; priceCents: number; availableForSale: boolean }

export type Catalog = Partial<Record<ProductId, CatalogEntry>>

export type CartLine = { lineId: string; product: Product; quantity: number; lineTotalCents: number }

export type Cart = {
  id: string
  checkoutUrl: string
  totalQuantity: number
  subtotalCents: number
  lines: CartLine[]
}

export type CatalogState = { status: 'loading' } | { status: 'ready'; catalog: Catalog } | { status: 'error' }

export type SyncState = { status: 'idle' } | { status: 'pending' } | { status: 'error'; message: string }

export type DrawerState = 'closed' | 'bag'

type Money = { amount: string }

export type RawCart = {
  id: string
  checkoutUrl: string
  totalQuantity: number
  cost: { subtotalAmount: Money }
  lines: {
    nodes: {
      id: string
      quantity: number
      cost: { totalAmount: Money }
      merchandise: { id?: string; product?: { handle: string } }
    }[]
  }
}

export type RawCatalog = {
  products: {
    nodes: {
      handle: string
      variants: { nodes: { id: string; availableForSale: boolean; price: Money }[] }
    }[]
  }
}

export const CART_FRAGMENT = `
  fragment CartFields on Cart {
    id
    checkoutUrl
    totalQuantity
    cost { subtotalAmount { amount } }
    lines(first: 50) {
      nodes {
        id
        quantity
        cost { totalAmount { amount } }
        merchandise { ... on ProductVariant { id product { handle } } }
      }
    }
  }
`

// MoneyV2.amount is a decimal string; rounding absorbs float error like 19.99 * 100.
export function toCents(money: Money) {
  return Math.round(Number(money.amount) * 100)
}

export function parseCart(raw: RawCart): Cart {
  return {
    id: raw.id,
    checkoutUrl: raw.checkoutUrl,
    totalQuantity: raw.totalQuantity,
    subtotalCents: toCents(raw.cost.subtotalAmount),
    lines: raw.lines.nodes.flatMap((line) => {
      const handle = line.merchandise.product?.handle
      if (!handle || !isProductId(handle)) return []
      return [
        {
          lineId: line.id,
          product: PRODUCTS_BY_ID[handle],
          quantity: line.quantity,
          lineTotalCents: toCents(line.cost.totalAmount),
        },
      ]
    }),
  }
}

export function parseCatalog(raw: RawCatalog): Catalog {
  const catalog: Catalog = {}
  for (const product of raw.products.nodes) {
    const variant = product.variants.nodes[0]
    if (!variant || !isProductId(product.handle)) continue
    catalog[product.handle] = {
      variantId: variant.id,
      priceCents: toCents(variant.price),
      availableForSale: variant.availableForSale,
    }
  }
  return catalog
}
