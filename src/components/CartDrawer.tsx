import { useEffect, useId, useRef } from 'react'
import { createPortal } from 'react-dom'
import { MAX_QUANTITY } from '../cart/cart'
import { useCart } from '../cart/CartContext'
import { formatPrice } from '../data/products'
import { usePrefersReducedMotion } from '../hooks/usePrefersReducedMotion'
import styles from './CartDrawer.module.css'

const FOCUSABLE_SELECTOR =
  'button:not([disabled]), [href], input:not([disabled]), select, textarea, [tabindex]:not([tabindex="-1"])'

function CloseIcon() {
  return (
    <svg aria-hidden="true" className={styles.icon} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75">
      <path d="M6 6l12 12M18 6L6 18" />
    </svg>
  )
}

function formatItemCount(count: number) {
  return `${count} ${count === 1 ? 'item' : 'items'}`
}

export default function CartDrawer() {
  const { drawer } = useCart()
  if (drawer === 'closed') return null
  return <OpenCartDrawer />
}

function OpenCartDrawer() {
  const { cart, closeBag } = useCart()
  const prefersReducedMotion = usePrefersReducedMotion()
  const titleId = useId()
  const dialogRef = useRef<HTMLDivElement>(null)
  const headingRef = useRef<HTMLHeadingElement>(null)

  useEffect(() => {
    const previousOverflow = document.body.style.overflow
    const returnFocusTo = document.activeElement instanceof HTMLElement ? document.activeElement : null
    document.body.style.overflow = 'hidden'
    return () => {
      document.body.style.overflow = previousOverflow
      returnFocusTo?.focus()
    }
  }, [])

  useEffect(() => {
    headingRef.current?.focus()
  }, [])

  // Removing a line unmounts the focused stepper button; pull focus back inside the dialog.
  useEffect(() => {
    if (!dialogRef.current?.contains(document.activeElement)) {
      headingRef.current?.focus()
    }
  }, [cart?.lines.length])

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        event.preventDefault()
        closeBag()
        return
      }

      const dialog = dialogRef.current
      if (event.key !== 'Tab' || !dialog) return

      const focusable = dialog.querySelectorAll<HTMLElement>(FOCUSABLE_SELECTOR)
      if (focusable.length === 0) return

      const first = focusable[0]
      const last = focusable[focusable.length - 1]
      const outside = !dialog.contains(document.activeElement)

      if (event.shiftKey && (document.activeElement === first || outside)) {
        event.preventDefault()
        last.focus()
      } else if (!event.shiftKey && (document.activeElement === last || outside)) {
        event.preventDefault()
        first.focus()
      }
    }

    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [closeBag])

  const panelClassName = prefersReducedMotion ? styles.panel : `${styles.panel} ${styles.panelAnimated}`

  return createPortal(
    <div
      className={styles.backdrop}
      onClick={(event) => {
        if (event.target === event.currentTarget) closeBag()
      }}
    >
      <div ref={dialogRef} className={panelClassName} role="dialog" aria-modal="true" aria-labelledby={titleId}>
        <div className={styles.header}>
          <h2 id={titleId} ref={headingRef} className={styles.title} tabIndex={-1}>
            Your bag
          </h2>
          <button type="button" className={styles.closeButton} onClick={closeBag} aria-label="Close bag">
            <CloseIcon />
          </button>
        </div>

        <BagStep />
      </div>
    </div>,
    document.body,
  )
}

function BagStep() {
  const { cart, sync, setQuantity, closeBag } = useCart()
  const busy = sync.status === 'pending'

  if (!cart || cart.lines.length === 0) {
    return (
      <div className={styles.body}>
        {busy ? (
          <p className={styles.emptyText} role="status">Loading your bag</p>
        ) : (
          <>
            <p className={styles.emptyText}>Your bag is empty.</p>
            {sync.status === 'error' && (
              <p className={styles.error} role="alert">
                We couldn't update your bag. {sync.message}
              </p>
            )}
            <a href="#products" className={styles.textLink} onClick={closeBag}>
              Browse products
            </a>
          </>
        )}
      </div>
    )
  }

  // aria-disabled instead of disabled keeps keyboard focus on the button while the cart syncs.
  const whenIdle = (action: () => void) => () => {
    if (!busy) action()
  }

  return (
    <>
      <div className={styles.body}>
        <ul className={styles.lines} aria-label={`Bag, ${formatItemCount(cart.totalQuantity)}`}>
          {cart.lines.map(({ lineId, product, quantity, lineTotalCents }) => (
            <li key={lineId} className={styles.line}>
              <img className={styles.thumb} src={product.image} alt="" width={72} height={72} />
              <div className={styles.lineInfo}>
                <p className={styles.lineName}>{product.name}</p>
                <p className={styles.muted}>{formatPrice(lineTotalCents / quantity)} each</p>
                <div className={styles.lineControls}>
                  <div className={styles.stepper} role="group" aria-label={`${product.name} quantity`}>
                    <button
                      type="button"
                      className={styles.stepButton}
                      onClick={whenIdle(() => setQuantity(lineId, quantity - 1))}
                      aria-disabled={busy}
                      aria-label={quantity === 1 ? `Remove ${product.name}` : `Decrease ${product.name} quantity`}
                    >
                      −
                    </button>
                    <span className={styles.quantity}>{quantity}</span>
                    <button
                      type="button"
                      className={styles.stepButton}
                      onClick={whenIdle(() => setQuantity(lineId, quantity + 1))}
                      disabled={quantity >= MAX_QUANTITY}
                      aria-disabled={busy}
                      aria-label={`Increase ${product.name} quantity`}
                    >
                      +
                    </button>
                  </div>
                  <button
                    type="button"
                    className={styles.removeButton}
                    onClick={whenIdle(() => setQuantity(lineId, 0))}
                    aria-disabled={busy}
                  >
                    Remove<span className="sr-only"> {product.name}</span>
                  </button>
                </div>
              </div>
              <p className={styles.lineTotal}>{formatPrice(lineTotalCents)}</p>
            </li>
          ))}
        </ul>
      </div>

      <div className={styles.footer}>
        <dl className={styles.totals}>
          <div className={styles.totalRow}>
            <dt>Subtotal</dt>
            <dd>{formatPrice(cart.subtotalCents)}</dd>
          </div>
        </dl>
        <p className={styles.status} role="status">
          {busy && 'Updating your bag'}
        </p>
        {sync.status === 'error' && (
          <p className={styles.error} role="alert">
            We couldn't update your bag. {sync.message}
          </p>
        )}
        <button
          type="button"
          className={styles.primaryButton}
          onClick={whenIdle(() => window.location.assign(cart.checkoutUrl))}
          aria-disabled={busy}
        >
          Continue to checkout
        </button>
        <p className={styles.muted}>Shipping and payment are handled on the next page, through Shopify checkout.</p>
      </div>
    </>
  )
}
