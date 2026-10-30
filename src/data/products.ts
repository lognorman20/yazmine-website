const PRODUCT_IMAGE_BASE = '/media/yazmine_products'

export type ProductId =
  | 'rosemary-oil'
  | 'batana-butter'
  | 'hydrating-mist'
  | 'satin-bonnet'
  | 'long-braid-bonnet'
  | 'satin-durag'

export type Product = {
  id: ProductId
  name: string
  image: string
  description: string
}

export const PRODUCTS: readonly Product[] = [
  {
    id: 'rosemary-oil',
    name: 'Rosemary & Fenugreek Oil',
    image: `${PRODUCT_IMAGE_BASE}/rosemary-oil.jpg`,
    description:
      'Hand-blended oil with rosemary and fenugreek. Supports scalp health, stronger strands, and moisture on dry or brittle hair.',
  },
  {
    id: 'batana-butter',
    name: 'Batana Butter',
    image: `${PRODUCT_IMAGE_BASE}/batana.jpg`,
    description: 'Whipped batana butter for sealing moisture, softening locs, and protecting ends.',
  },
  {
    id: 'hydrating-mist',
    name: 'Hydrating Mist',
    image: `${PRODUCT_IMAGE_BASE}/mist.jpg`,
    description:
      'Lightweight daily spray with rosemary, aloe, and lemongrass. Refreshes and moisturizes between wash days.',
  },
  {
    id: 'satin-bonnet',
    name: 'Satin Bonnet',
    image: `${PRODUCT_IMAGE_BASE}/satin-bonnet.jpg`,
    description: 'Roomy satin bonnet that protects curls, locs, and silk presses overnight.',
  },
  {
    id: 'long-braid-bonnet',
    name: 'Long Braid Bonnet',
    image: `${PRODUCT_IMAGE_BASE}/long-bonnet.jpg`,
    description: 'Extra-long satin bonnet with ties, sized for braids and long locs.',
  },
  {
    id: 'satin-durag',
    name: 'Satin Durag',
    image: `${PRODUCT_IMAGE_BASE}/durag.jpg`,
    description: 'Satin durag with long ties to hold waves and keep edges smooth.',
  },
]

export const PRODUCTS_BY_ID = Object.fromEntries(
  PRODUCTS.map((product) => [product.id, product]),
) as Record<ProductId, Product>

export function isProductId(value: string): value is ProductId {
  return Object.hasOwn(PRODUCTS_BY_ID, value)
}

const priceFormatter = new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' })

export function formatPrice(cents: number) {
  return priceFormatter.format(cents / 100)
}
