import assert from 'node:assert/strict'
import { test } from 'node:test'
import { parseCart, parseCatalog, type RawCart } from './cart.ts'

function rawLine(id: string, handle: string | undefined, quantity: number, total: string) {
  return {
    id,
    quantity,
    cost: { totalAmount: { amount: total } },
    merchandise: handle ? { id: `gid://shopify/ProductVariant/${id}`, product: { handle } } : {},
  }
}

const rawCart: RawCart = {
  id: 'gid://shopify/Cart/abc',
  checkoutUrl: 'https://example.myshopify.com/cart/c/abc',
  totalQuantity: 5,
  cost: { subtotalAmount: { amount: '79.97' } },
  lines: {
    nodes: [
      rawLine('1', 'rosemary-oil', 2, '39.98'),
      rawLine('2', 'satin-durag', 1, '19.99'),
      rawLine('3', 'gift-card', 1, '20.0'),
      rawLine('4', undefined, 1, '0.0'),
    ],
  },
}

test('parseCart converts decimal money to integer cents', () => {
  const cart = parseCart(rawCart)
  assert.equal(cart.subtotalCents, 7997)
  assert.deepEqual(
    cart.lines.map((line) => [line.lineId, line.product.id, line.quantity, line.lineTotalCents]),
    [
      ['1', 'rosemary-oil', 2, 3998],
      ['2', 'satin-durag', 1, 1999],
    ],
  )
})

test('parseCart drops lines whose handle is not a local product', () => {
  const cart = parseCart(rawCart)
  assert.equal(cart.lines.some((line) => line.lineId === '3' || line.lineId === '4'), false)
  assert.equal(cart.id, 'gid://shopify/Cart/abc')
  assert.equal(cart.checkoutUrl, 'https://example.myshopify.com/cart/c/abc')
  assert.equal(cart.totalQuantity, 5)
})

test('parseCatalog keys by handle and skips unknown products', () => {
  const catalog = parseCatalog({
    products: {
      nodes: [
        { handle: 'batana-butter', variants: { nodes: [{ id: 'v1', availableForSale: true, price: { amount: '25.0' } }] } },
        { handle: 'satin-bonnet', variants: { nodes: [{ id: 'v2', availableForSale: false, price: { amount: '15.5' } }] } },
        { handle: 'mystery-box', variants: { nodes: [{ id: 'v3', availableForSale: true, price: { amount: '9.0' } }] } },
      ],
    },
  })
  assert.deepEqual(catalog, {
    'batana-butter': { variantId: 'v1', priceCents: 2500, availableForSale: true },
    'satin-bonnet': { variantId: 'v2', priceCents: 1550, availableForSale: false },
  })
})
