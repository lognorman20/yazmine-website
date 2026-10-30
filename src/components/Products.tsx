import styles from './Products.module.css'

const INTRO_COPY =
  'Every product here is made by hand in small batches. I source rosemary, fenugreek, batana, and the rest for quality, not shortcuts. That is the work behind the oils, butters, and satin pieces below.'

const PRODUCTS = [
  {
    name: 'Rosemary & Fenugreek Oil',
    image: '/media/yazmine_products/rosemary-oil.jpg',
    description:
      'Hand-blended oil with rosemary and fenugreek. Supports scalp health, stronger strands, and moisture on dry or brittle hair.',
  },
  {
    name: 'Batana Butter',
    image: '/media/yazmine_products/batana.jpg',
    description:
      'Whipped batana butter for sealing moisture, softening locs, and protecting ends.',
  },
  {
    name: 'Hydrating Mist',
    image: '/media/yazmine_products/mist.jpg',
    description:
      'Lightweight daily spray with rosemary, aloe, and lemongrass. Refreshes and moisturizes between wash days.',
  },
  {
    name: 'Satin Bonnet',
    image: '/media/yazmine_products/satin-bonnet.jpg',
    description: 'Roomy satin bonnet that protects curls, locs, and silk presses overnight.',
  },
  {
    name: 'Long Braid Bonnet',
    image: '/media/yazmine_products/long-bonnet.jpg',
    description: 'Extra-long satin bonnet with ties, sized for braids and long locs.',
  },
  {
    name: 'Satin Durag',
    image: '/media/yazmine_products/durag.jpg',
    description: 'Satin durag with long ties to hold waves and keep edges smooth.',
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
                <p className={styles.description}>{product.description}</p>
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  )
}
