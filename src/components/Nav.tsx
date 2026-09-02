import { useEffect, useState } from 'react'
import styles from './Nav.module.css'

const NAV_LINKS = [
  { label: 'About', href: '#about' },
  { label: 'Services', href: '#services' },
  { label: 'Gallery', href: '#gallery' },
  { label: 'Products', href: '#products' },
  { label: 'Info', href: '#info' },
  { label: 'Contact', href: '#contact' },
] as const

const BOOKING_URL = 'https://lusciousbyyazmine.as.me/schedule/d8e29d20'

export default function Nav() {
  const [menuOpen, setMenuOpen] = useState(false)

  useEffect(() => {
    if (!menuOpen) return

    const previousOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setMenuOpen(false)
    }

    document.addEventListener('keydown', handleKeyDown)
    return () => {
      document.body.style.overflow = previousOverflow
      document.removeEventListener('keydown', handleKeyDown)
    }
  }, [menuOpen])

  const handleNavClick = () => setMenuOpen(false)

  return (
    <header className={styles.header}>
      <nav className={styles.nav} aria-label="Main navigation">
        <a href="#hero" className={styles.logo} onClick={handleNavClick}>
          LusciousbyYazmine
        </a>

        <button
          type="button"
          className={styles.menuToggle}
          aria-expanded={menuOpen}
          aria-controls="nav-menu"
          onClick={() => setMenuOpen((open) => !open)}
        >
          <span className="sr-only">{menuOpen ? 'Close menu' : 'Open menu'}</span>
          <span className={styles.menuBar} aria-hidden="true" />
          <span className={styles.menuBar} aria-hidden="true" />
        </button>

        <ul
          id="nav-menu"
          className={`${styles.links} ${menuOpen ? styles.linksOpen : ''}`}
        >
          {NAV_LINKS.map((link) => (
            <li key={link.href}>
              <a href={link.href} className={styles.link} onClick={handleNavClick}>
                {link.label}
              </a>
            </li>
          ))}
          <li>
            <a
              href={BOOKING_URL}
              className={styles.bookButton}
              target="_blank"
              rel="noopener noreferrer"
              onClick={handleNavClick}
            >
              Book Now
            </a>
          </li>
        </ul>
      </nav>
    </header>
  )
}
