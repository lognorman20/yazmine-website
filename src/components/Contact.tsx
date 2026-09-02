import styles from './Contact.module.css'

export default function Contact() {
  return (
    <section id="contact" className={styles.contact} aria-labelledby="contact-heading">
      <div className={styles.inner}>
        <h2 id="contact-heading" className={styles.heading}>
          Get in Touch
        </h2>

        <div className={styles.mainGrid}>
          <div className={styles.block}>
            <h3 className={styles.blockTitle}>Location</h3>
            <address className={styles.address}>
              Brooklyn, NY 11226
              <br />
              3-minute walk from Newkirk Avenue-Little Haiti (2)(5) train
              <br />
              <span className={styles.addressNote}>
                Exact address provided upon confirmation.
              </span>
            </address>
          </div>

          <div className={styles.block}>
            <h3 className={styles.blockTitle}>Contact</h3>
            <ul className={styles.contactList}>
              <li className={styles.contactItem}>
                <span className={styles.contactLabel}>Email</span>
                <a
                  href="mailto:info@lusciousbyyazmine.com"
                  className={styles.contactLink}
                >
                  info@lusciousbyyazmine.com
                </a>
              </li>
              <li className={styles.contactItem}>
                <span className={styles.contactLabel}>Phone</span>
                <a href="tel:+15512575820" className={styles.contactLink}>
                  (551) 257-5820
                </a>
              </li>
            </ul>
          </div>
        </div>
      </div>
    </section>
  )
}
