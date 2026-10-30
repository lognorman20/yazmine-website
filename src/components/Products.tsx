import { useCart } from '../cart/CartContext'
import { PRODUCTS, formatPrice } from '../data/products'
import styles from './Products.module.css'

const INTRO_COPY =
  'Every product here is made by hand in small batches. I source rosemary, fenugreek, batana, and the rest for quality, not shortcuts. That is the work behind the oils, butters, and satin pieces below.'

export default function Products() {
  const { catalog, addToBag } = useCart()

  return (
    <section id="products" className={styles.products} aria-labelledby="products-heading">
      <div className={styles.inner}>
        <h2 id="products-heading" className={styles.heading}>
          Products
        </h2>
        <p className={styles.intro}>{INTRO_COPY}</p>
        {catalog.status === 'error' && (
          <p className={styles.catalogError} role="status">
            The shop is offline right now, so prices and the bag are unavailable.
          </p>
        )}

        <div className={styles.grid}>
          {PRODUCTS.map((product) => {
            const entry = catalog.status === 'ready' ? catalog.catalog[product.id] : undefined
            const soldOut = entry?.availableForSale === false
            return (
              <article key={product.id} className={styles.product}>
                <img
                  className={styles.image}
                  src={product.image}
                  alt={product.name}
                  loading="lazy"
                  width={900}
                  height={900}
                />
                <div className={styles.productText}>
                  <h3 className={styles.productName}>{product.name}</h3>
                  {catalog.status === 'loading' ? (
                    <p className={styles.price}>
                      <span className={styles.pricePlaceholder} aria-hidden="true" />
                      <span className="sr-only">Loading price</span>
                    </p>
                  ) : (
                    entry && <p className={styles.price}>{formatPrice(entry.priceCents)}</p>
                  )}
                  <p className={styles.description}>{product.description}</p>
                  <button
                    type="button"
                    className={styles.addButton}
                    onClick={() => addToBag(product.id)}
                    disabled={!entry?.availableForSale}
                    aria-label={soldOut ? `${product.name} is sold out` : `Add ${product.name} to bag`}
                  >
                    {soldOut ? 'Sold out' : 'Add to bag'}
                  </button>
                </div>
              </article>
            )
          })}
        </div>
      </div>
    </section>
  )
}
