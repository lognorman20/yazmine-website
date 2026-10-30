import { useEffect, useId, useRef, useState, type FormEvent } from 'react'
import { createPortal } from 'react-dom'
import { MAX_QUANTITY, type CartLine, type Order } from '../cart/cart'
import { useCart } from '../cart/CartContext'
import { formatPrice } from '../data/products'
import { usePrefersReducedMotion } from '../hooks/usePrefersReducedMotion'
import styles from './CartDrawer.module.css'

type DetailsDraft = {
  name: string
  email: string
  line1: string
  line2: string
  city: string
  state: string
  zip: string
}

const EMPTY_DRAFT: DetailsDraft = { name: '', email: '', line1: '', line2: '', city: '', state: '', zip: '' }

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

function OrderLines({ lines }: { lines: readonly CartLine[] }) {
  return (
    <ul className={styles.summaryLines}>
      {lines.map(({ product, quantity }) => (
        <li key={product.id} className={styles.summaryLine}>
          <span>
            {product.name} <span className={styles.muted}>× {quantity}</span>
          </span>
          <span>{formatPrice(product.priceCents * quantity)}</span>
        </li>
      ))}
    </ul>
  )
}

export default function CartDrawer() {
  const { checkout } = useCart()
  if (checkout.step === 'closed') return null
  return <OpenCartDrawer />
}

function OpenCartDrawer() {
  const { checkout, lines, closeCheckout } = useCart()
  const prefersReducedMotion = usePrefersReducedMotion()
  const titleId = useId()
  const dialogRef = useRef<HTMLDivElement>(null)
  const headingRef = useRef<HTMLHeadingElement>(null)
  const [draft, setDraft] = useState<DetailsDraft>(EMPTY_DRAFT)

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
  }, [checkout.step])

  // Removing a line unmounts the focused stepper button; pull focus back inside the dialog.
  useEffect(() => {
    if (!dialogRef.current?.contains(document.activeElement)) {
      headingRef.current?.focus()
    }
  }, [lines.length])

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        event.preventDefault()
        closeCheckout()
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
  }, [closeCheckout])

  const title =
    checkout.step === 'placed' ? 'Order placed' : checkout.step === 'details' ? 'Checkout' : 'Your bag'

  const panelClassName = prefersReducedMotion ? styles.panel : `${styles.panel} ${styles.panelAnimated}`

  return createPortal(
    <div
      className={styles.backdrop}
      onClick={(event) => {
        if (event.target === event.currentTarget) closeCheckout()
      }}
    >
      <div ref={dialogRef} className={panelClassName} role="dialog" aria-modal="true" aria-labelledby={titleId}>
        <div className={styles.header}>
          <h2 id={titleId} ref={headingRef} className={styles.title} tabIndex={-1}>
            {title}
          </h2>
          <button type="button" className={styles.closeButton} onClick={closeCheckout} aria-label="Close bag">
            <CloseIcon />
          </button>
        </div>

        {checkout.step === 'bag' && <BagStep />}
        {checkout.step === 'details' && <DetailsStep draft={draft} onDraftChange={setDraft} />}
        {checkout.step === 'placed' && <PlacedStep order={checkout.order} />}
      </div>
    </div>,
    document.body,
  )
}

function BagStep() {
  const { lines, itemCount, subtotalCents, setQuantity, goToDetails, closeCheckout } = useCart()

  if (lines.length === 0) {
    return (
      <div className={styles.body}>
        <p className={styles.emptyText}>Your bag is empty.</p>
        <a href="#products" className={styles.textLink} onClick={closeCheckout}>
          Browse products
        </a>
      </div>
    )
  }

  return (
    <>
      <div className={styles.body}>
        <ul className={styles.lines} aria-label={`Bag, ${formatItemCount(itemCount)}`}>
          {lines.map(({ product, quantity }) => (
            <li key={product.id} className={styles.line}>
              <img className={styles.thumb} src={product.image} alt="" width={72} height={72} />
              <div className={styles.lineInfo}>
                <p className={styles.lineName}>{product.name}</p>
                <p className={styles.muted}>{formatPrice(product.priceCents)} each</p>
                <div className={styles.lineControls}>
                  <div className={styles.stepper} role="group" aria-label={`${product.name} quantity`}>
                    <button
                      type="button"
                      className={styles.stepButton}
                      onClick={() => setQuantity(product.id, quantity - 1)}
                      aria-label={quantity === 1 ? `Remove ${product.name}` : `Decrease ${product.name} quantity`}
                    >
                      −
                    </button>
                    <span className={styles.quantity}>{quantity}</span>
                    <button
                      type="button"
                      className={styles.stepButton}
                      onClick={() => setQuantity(product.id, quantity + 1)}
                      disabled={quantity >= MAX_QUANTITY}
                      aria-label={`Increase ${product.name} quantity`}
                    >
                      +
                    </button>
                  </div>
                  <button type="button" className={styles.removeButton} onClick={() => setQuantity(product.id, 0)}>
                    Remove<span className="sr-only"> {product.name}</span>
                  </button>
                </div>
              </div>
              <p className={styles.lineTotal}>{formatPrice(product.priceCents * quantity)}</p>
            </li>
          ))}
        </ul>
      </div>

      <div className={styles.footer}>
        <dl className={styles.totals}>
          <div className={styles.totalRow}>
            <dt>Subtotal</dt>
            <dd>{formatPrice(subtotalCents)}</dd>
          </div>
          <div className={styles.totalRow}>
            <dt>Shipping</dt>
            <dd className={styles.muted}>Calculated later</dd>
          </div>
        </dl>
        <button type="button" className={styles.primaryButton} onClick={goToDetails}>
          Continue to checkout
        </button>
      </div>
    </>
  )
}

type DetailsStepProps = {
  draft: DetailsDraft
  onDraftChange: (draft: DetailsDraft) => void
}

function DetailsStep({ draft, onDraftChange }: DetailsStepProps) {
  const { lines, subtotalCents, placeOrder, openBag } = useCart()
  const formId = useId()

  const field = (key: keyof DetailsDraft) => ({
    id: `${formId}-${key}`,
    name: key,
    value: draft[key],
    onChange: (event: React.ChangeEvent<HTMLInputElement>) => onDraftChange({ ...draft, [key]: event.target.value }),
    className: styles.input,
  })

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    const line2 = draft.line2.trim()
    placeOrder(
      { name: draft.name.trim(), email: draft.email.trim() },
      {
        line1: draft.line1.trim(),
        ...(line2 ? { line2 } : {}),
        city: draft.city.trim(),
        state: draft.state.trim(),
        zip: draft.zip.trim(),
      },
    )
  }

  return (
    <>
      <div className={styles.body}>
        <form id={formId} className={styles.form} onSubmit={handleSubmit}>
          <fieldset className={styles.fieldset}>
            <legend className={styles.legend}>Contact</legend>
            <label className={styles.label} htmlFor={`${formId}-name`}>Full name</label>
            <input {...field('name')} autoComplete="name" required />
            <label className={styles.label} htmlFor={`${formId}-email`}>Email</label>
            <input {...field('email')} type="email" autoComplete="email" required />
          </fieldset>

          <fieldset className={styles.fieldset}>
            <legend className={styles.legend}>Shipping address</legend>
            <label className={styles.label} htmlFor={`${formId}-line1`}>Address</label>
            <input {...field('line1')} autoComplete="address-line1" required />
            <label className={styles.label} htmlFor={`${formId}-line2`}>
              Apartment, suite, etc. <span className={styles.muted}>(optional)</span>
            </label>
            <input {...field('line2')} autoComplete="address-line2" />
            <label className={styles.label} htmlFor={`${formId}-city`}>City</label>
            <input {...field('city')} autoComplete="address-level2" required />
            <div className={styles.fieldRow}>
              <div>
                <label className={styles.label} htmlFor={`${formId}-state`}>State</label>
                <input {...field('state')} autoComplete="address-level1" required />
              </div>
              <div>
                <label className={styles.label} htmlFor={`${formId}-zip`}>ZIP code</label>
                <input
                  {...field('zip')}
                  autoComplete="postal-code"
                  inputMode="numeric"
                  pattern="\d{5}(-\d{4})?"
                  title="5-digit ZIP code, like 11216"
                  required
                />
              </div>
            </div>
          </fieldset>
        </form>

        <section className={styles.summary} aria-label="Order summary">
          <h3 className={styles.legend}>Order summary</h3>
          <OrderLines lines={lines} />
          <p className={styles.summaryLine}>
            <span>Subtotal</span>
            <span>{formatPrice(subtotalCents)}</span>
          </p>
        </section>

        <p className={styles.note}>
          Payment isn't connected yet, so placing this order won't charge you anything.
        </p>
      </div>

      <div className={styles.footer}>
        <button type="submit" form={formId} className={styles.primaryButton}>
          Place order
        </button>
        <button type="button" className={styles.secondaryButton} onClick={openBag}>
          Back to bag
        </button>
      </div>
    </>
  )
}

function PlacedStep({ order }: { order: Order }) {
  const { closeCheckout } = useCart()
  const { address } = order

  return (
    <>
      <div className={styles.body}>
        <p className={styles.orderNumber}>
          Order number <strong>{order.id}</strong>
        </p>

        <section className={styles.summary} aria-label="Items">
          <h3 className={styles.legend}>Items</h3>
          <OrderLines lines={order.lines} />
          <p className={styles.summaryLine}>
            <span>Subtotal</span>
            <span>{formatPrice(order.subtotalCents)}</span>
          </p>
        </section>

        <section className={styles.summary} aria-label="Ship to">
          <h3 className={styles.legend}>Ship to</h3>
          <address className={styles.address}>
            {order.customer.name}
            <br />
            {address.line1}
            {address.line2 && (
              <>
                <br />
                {address.line2}
              </>
            )}
            <br />
            {address.city}, {address.state} {address.zip}
          </address>
        </section>

        <p className={styles.note}>
          Shipping is still being set up. We'll email {order.customer.email} before your order ships.
        </p>
      </div>

      <div className={styles.footer}>
        <button type="button" className={styles.primaryButton} onClick={closeCheckout}>
          Keep shopping
        </button>
      </div>
    </>
  )
}
