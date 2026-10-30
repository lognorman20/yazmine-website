import { useEffect, useState } from 'react'
import { useCart } from '../cart/CartContext'
import { useActiveSection } from '../hooks/useActiveSection'
import styles from './Nav.module.css'

const NAV_LINKS = [
  { label: 'About', href: '#about' },
  { label: 'Services', href: '#services' },
  { label: 'Gallery', href: '#gallery' },
  { label: 'Products', href: '#products' },
  { label: 'Info', href: '#info' },
  { label: 'Contact', href: '#contact' },
] as const

const SECTION_IDS = NAV_LINKS.map((link) => link.href)

function BagIcon() {
  return (
    <svg aria-hidden="true" className={styles.bagIcon} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75">
      <path d="M5 8h14l-1 12H6L5 8z" />
      <path d="M9 8V6a3 3 0 0 1 6 0v2" />
    </svg>
  )
}

export default function Nav() {
  const [menuOpen, setMenuOpen] = useState(false)
  const { itemCount, openBag } = useCart()
  const activeSection = useActiveSection(SECTION_IDS)

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
        <a
          href="#about"
          className={styles.logo}
          onClick={handleNavClick}
        >
          LusciousbyYazmine
        </a>

        <button
          type="button"
          className={styles.bagButton}
          onClick={() => {
            setMenuOpen(false)
            openBag()
          }}
          aria-label={`Open bag, ${itemCount} ${itemCount === 1 ? 'item' : 'items'}`}
        >
          <BagIcon />
          {itemCount > 0 && (
            <span className={styles.bagCount} aria-hidden="true">
              {itemCount}
            </span>
          )}
        </button>

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
              <a
                href={link.href}
                className={`${styles.link} ${activeSection === link.href ? styles.linkActive : ''}`}
                onClick={handleNavClick}
                aria-current={activeSection === link.href ? 'page' : undefined}
              >
                {link.label}
              </a>
            </li>
          ))}
          <li>
            <a
              href="#book"
              className={styles.bookButton}
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
