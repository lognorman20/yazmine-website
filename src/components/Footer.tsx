import styles from './Footer.module.css'

const SOCIAL_LINKS = [
  {
    label: 'Instagram',
    href: 'https://www.instagram.com/lusciousbyyazmine',
  },
  {
    label: 'TikTok',
    href: 'https://www.tiktok.com/@lusciousbyyazmine',
  },
  {
    label: 'Facebook',
    href: 'https://www.facebook.com/lusciousbyyazmine',
  },
] as const

function InstagramIcon() {
  return (
    <svg
      aria-hidden="true"
      className={styles.icon}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.75"
    >
      <rect x="3" y="3" width="18" height="18" rx="5" />
      <circle cx="12" cy="12" r="4" />
      <circle cx="17" cy="7" r="0.75" fill="currentColor" stroke="none" />
    </svg>
  )
}

function TikTokIcon() {
  return (
    <svg
      aria-hidden="true"
      className={styles.icon}
      viewBox="0 0 24 24"
      fill="currentColor"
    >
      <path d="M16.5 3.5c.4 2.2 1.8 3.9 3.8 4.5v3.2c-1.4 0-2.7-.4-3.8-1.1v5.9c0 3.6-2.9 6.5-6.5 6.5S3.5 19.6 3.5 16 6.4 9.5 10 9.5c.4 0 .8 0 1.2.1v3.4c-.4-.1-.7-.2-1.2-.2-1.8 0-3.2 1.4-3.2 3.2s1.4 3.2 3.2 3.2 3.2-1.4 3.2-3.2V3.5h3.3z" />
    </svg>
  )
}

function FacebookIcon() {
  return (
    <svg
      aria-hidden="true"
      className={styles.icon}
      viewBox="0 0 24 24"
      fill="currentColor"
    >
      <path d="M22 12c0-5.523-4.477-10-10-10S2 6.477 2 12c0 4.991 3.657 9.128 8.438 9.878v-6.987h-2.54V12h2.54V9.797c0-2.506 1.492-3.89 3.777-3.89 1.094 0 2.238.195 2.238.195v2.46h-1.26c-1.243 0-1.63.771-1.63 1.562V12h2.773l-.443 2.89h-2.33v6.988C18.343 21.128 22 16.991 22 12z" />
    </svg>
  )
}

const SOCIAL_ICONS = {
  Instagram: InstagramIcon,
  TikTok: TikTokIcon,
  Facebook: FacebookIcon,
} as const

export default function Footer() {
  return (
    <footer className={styles.footer}>
      <nav className={styles.socialNav} aria-label="Social media">
        <ul className={styles.socialList}>
          {SOCIAL_LINKS.map((link) => {
            const Icon = SOCIAL_ICONS[link.label]
            return (
              <li key={link.label}>
                <a
                  href={link.href}
                  className={styles.socialLink}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={link.label}
                >
                  <Icon />
                </a>
              </li>
            )
          })}
        </ul>
      </nav>
      <p className={styles.copyright}>
        &copy; {new Date().getFullYear()} LusciousbyYazmine
      </p>
    </footer>
  )
}
