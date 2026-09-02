import styles from './Products.module.css'

const INTRO_COPY =
  'Every product here is made by hand in small batches. I source rosemary, fenugreek, batana, and the rest for quality, not shortcuts. That is the work behind the Rosemary & Fenugreek Oil and Batana Butter below.'

const PRODUCTS = [
  {
    name: 'Rosemary & Fenugreek Oil',
    description:
      'Hand-blended oil with rosemary and fenugreek. Supports scalp health, stronger strands, and moisture on dry or brittle hair.',
  },
  {
    name: 'Batana Butter',
    description:
      'Whipped batana butter for sealing moisture, softening locs, and protecting ends.',
  },
] as const

export default function Products() {
  return (
    <section id="products" className={styles.products} aria-labelledby="products-heading">
      <div className={styles.inner}>
        <h2 id="products-heading" className={styles.heading}>
          Products
        </h2>
        <p className={styles.intro}>{INTRO_COPY}</p>

        <div className={styles.grid}>
          {PRODUCTS.map((product) => (
            <article key={product.name} className={styles.product}>
              <div
                className={styles.imagePlaceholder}
                role="img"
                aria-label={product.name}
              />
              <div className={styles.productText}>
                <h3 className={styles.productName}>{product.name}</h3>
                <p className={styles.description}>{product.description}</p>
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  )
}
