import { CART_FRAGMENT, parseCart, parseCatalog, type Cart, type Catalog, type RawCart, type RawCatalog } from '../cart/cart'

const API_VERSION = '2026-10'

type GraphQLResponse<T> = { data?: T; errors?: { message: string }[] }

type CartPayload = { cart: RawCart | null; userErrors: { message: string }[] }

async function storefront<T>(query: string, variables: Record<string, unknown> = {}): Promise<T> {
  const domain = import.meta.env.VITE_SHOPIFY_STORE_DOMAIN
  const token = import.meta.env.VITE_SHOPIFY_STOREFRONT_TOKEN
  if (!domain || !token) throw new Error('Shopify is not configured.')

  const response = await fetch(`https://${domain}/api/${API_VERSION}/graphql.json`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'X-Shopify-Storefront-Access-Token': token },
    body: JSON.stringify({ query, variables }),
  })
  if (!response.ok) throw new Error(`Shopify request failed (${response.status}).`)

  const body = (await response.json()) as GraphQLResponse<T>
  if (body.errors?.length) throw new Error(body.errors.map((error) => error.message).join(' '))
  if (!body.data) throw new Error('Shopify returned no data.')
  return body.data
}

export async function fetchCatalog(): Promise<Catalog> {
  const data = await storefront<RawCatalog>(`
    query Catalog {
      products(first: 20) {
        nodes {
          handle
          variants(first: 1) { nodes { id availableForSale price { amount } } }
        }
      }
    }
  `)
  return parseCatalog(data)
}

export async function fetchCart(cartId: string): Promise<Cart | null> {
  const data = await storefront<{ cart: RawCart | null }>(
    `query Cart($cartId: ID!) { cart(id: $cartId) { ...CartFields } } ${CART_FRAGMENT}`,
    { cartId },
  )
  return data.cart && parseCart(data.cart)
}

const CART_PAYLOAD = 'cart { ...CartFields } userErrors { message }'

async function mutateCart(field: string, mutation: string, variables: Record<string, unknown>) {
  const data = await storefront<Record<string, CartPayload>>(`${mutation} ${CART_FRAGMENT}`, variables)
  const { cart, userErrors } = data[field]
  if (userErrors.length) throw new Error(userErrors.map((error) => error.message).join(' '))
  if (!cart) throw new Error('Shopify returned no cart.')
  return parseCart(cart)
}

export function createCart(merchandiseId: string) {
  return mutateCart(
    'cartCreate',
    `mutation CartCreate($input: CartInput!) { cartCreate(input: $input) { ${CART_PAYLOAD} } }`,
    { input: { lines: [{ merchandiseId, quantity: 1 }] } },
  )
}

export function addCartLine(cartId: string, merchandiseId: string) {
  return mutateCart(
    'cartLinesAdd',
    `mutation CartLinesAdd($cartId: ID!, $lines: [CartLineInput!]!) {
      cartLinesAdd(cartId: $cartId, lines: $lines) { ${CART_PAYLOAD} }
    }`,
    { cartId, lines: [{ merchandiseId, quantity: 1 }] },
  )
}

export function updateCartLine(cartId: string, lineId: string, quantity: number) {
  return mutateCart(
    'cartLinesUpdate',
    `mutation CartLinesUpdate($cartId: ID!, $lines: [CartLineUpdateInput!]!) {
      cartLinesUpdate(cartId: $cartId, lines: $lines) { ${CART_PAYLOAD} }
    }`,
    { cartId, lines: [{ id: lineId, quantity }] },
  )
}

export function removeCartLine(cartId: string, lineId: string) {
  return mutateCart(
    'cartLinesRemove',
    `mutation CartLinesRemove($cartId: ID!, $lineIds: [ID!]!) {
      cartLinesRemove(cartId: $cartId, lineIds: $lineIds) { ${CART_PAYLOAD} }
    }`,
    { cartId, lineIds: [lineId] },
  )
}
