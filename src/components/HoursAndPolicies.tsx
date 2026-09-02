import styles from './HoursAndPolicies.module.css'

const HOURS = [
  { days: 'Sun – Mon', hours: 'Closed' },
  { days: 'Tue – Sat', hours: '7 AM – 11 PM' },
] as const

const POLICIES = [
  {
    title: 'Deposit',
    body:
      'All deposits and transactions are final and non-refundable. Deposits are paid through the website. Your deposit is 50% of your service price and will be deducted from your total service amount.',
  },
  {
    title: 'Payment',
    body: 'Cash and Square invoices.',
  },
  {
    title: 'Lateness',
    body:
      '$25 fee after 20 minutes late. After 30 minutes, your appointment is cancelled and you must reschedule.',
  },
  {
    title: 'Rescheduling',
    body:
      'You may reschedule once without fee if the new date is within the same month as your original appointment. Second reschedule: $30 fee. Third reschedule: $45 fee.',
  },
] as const

export default function HoursAndPolicies() {
  return (
    <section
      id="info"
      className={styles.section}
      aria-labelledby="info-heading"
    >
      <div className={styles.inner}>
        <h2 id="info-heading" className={styles.heading}>
          Hours &amp; Policies
        </h2>

        <div className={styles.grid}>
          <div className={styles.block}>
            <h3 className={styles.blockTitle}>Hours</h3>
            <dl className={styles.hoursList}>
              {HOURS.map((row) => (
                <div key={row.days} className={styles.hoursRow}>
                  <dt>{row.days}</dt>
                  <dd>{row.hours}</dd>
                </div>
              ))}
            </dl>
          </div>

          <div className={styles.block}>
            <h3 className={styles.blockTitle}>Policies</h3>
            <dl className={styles.policyList}>
              {POLICIES.map((policy) => (
                <div key={policy.title} className={styles.policyItem}>
                  <dt className={styles.policyTitle}>{policy.title}</dt>
                  <dd className={styles.policyBody}>{policy.body}</dd>
                </div>
              ))}
            </dl>
          </div>
        </div>
      </div>
    </section>
  )
}
