import styles from './Services.module.css'

const SERVICES = [
  {
    name: 'Loc Retwisting',
    description:
      'I specialize in loc retwisting. I learned it in college and still focus on it. I check your roots for thinning, buildup, and tension before I retwist.',
  },
  {
    name: 'Braiding & Twists',
    description:
      'Box braids, knotless braids, two-strand twists, and cornrow patterns. Styles built to last and stay comfortable on your scalp.',
  },
  {
    name: 'Styling',
    description:
      'Wash-and-go sets, silk presses, updos, and looks for work, events, or everyday wear.',
  },
  {
    name: 'Natural Hair Care',
    description:
      'I treat thinning roots, product buildup, and damage from harsh relaxers and heavy products. Clarifying washes, moisture treatments, and the oils and butters I make.',
  },
] as const

export default function Services() {
  return (
    <section id="services" className={styles.services} aria-labelledby="services-heading">
      <div className={styles.inner}>
        <h2 id="services-heading" className={styles.heading}>
          Services
        </h2>

        <ul className={styles.list}>
          {SERVICES.map((service, index) => (
            <li key={service.name} className={styles.item}>
              <span className={styles.number} aria-hidden="true">
                {String(index + 1).padStart(2, '0')}
              </span>
              <div className={styles.itemContent}>
                <h3 className={styles.serviceName}>{service.name}</h3>
                <p className={styles.description}>{service.description}</p>
              </div>
            </li>
          ))}
        </ul>
      </div>
    </section>
  )
}
