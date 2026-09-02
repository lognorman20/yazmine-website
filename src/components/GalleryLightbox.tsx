import { useEffect, useId, useRef, type RefObject } from 'react'
import { createPortal } from 'react-dom'
import type { GalleryItem } from '../data/media'
import { usePrefersReducedMotion } from '../hooks/usePrefersReducedMotion'
import styles from './GalleryLightbox.module.css'

const GALLERY_IMAGE_ALT = 'Hair styling work by Yazmine Taylor'
const GALLERY_VIDEO_LABEL = 'Hair styling video by Yazmine Taylor'

type GalleryLightboxProps = {
  items: readonly GalleryItem[]
  activeIndex: number
  onClose: () => void
  onChange: (index: number) => void
  returnFocusRef: RefObject<HTMLElement | null>
}

function CloseIcon() {
  return (
    <svg aria-hidden="true" className={styles.icon} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75">
      <path d="M6 6l12 12M18 6L6 18" />
    </svg>
  )
}

function PrevIcon() {
  return (
    <svg aria-hidden="true" className={styles.icon} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75">
      <path d="M14 6l-6 6 6 6" />
    </svg>
  )
}

function NextIcon() {
  return (
    <svg aria-hidden="true" className={styles.icon} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75">
      <path d="M10 6l6 6-6 6" />
    </svg>
  )
}

function getWrappedIndex(index: number, length: number, delta: number) {
  return (index + delta + length) % length
}

export default function GalleryLightbox({
  items,
  activeIndex,
  onClose,
  onChange,
  returnFocusRef,
}: GalleryLightboxProps) {
  const prefersReducedMotion = usePrefersReducedMotion()
  const titleId = useId()
  const dialogRef = useRef<HTMLDivElement>(null)
  const closeButtonRef = useRef<HTMLButtonElement>(null)
  const item = items[activeIndex]
  const hasMultiple = items.length > 1

  useEffect(() => {
    const previousOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    return () => {
      document.body.style.overflow = previousOverflow
    }
  }, [])

  useEffect(() => {
    closeButtonRef.current?.focus()
  }, [])

  useEffect(() => {
    const elementToFocus = returnFocusRef.current
    return () => {
      elementToFocus?.focus()
    }
  }, [returnFocusRef])

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        event.preventDefault()
        onClose()
        return
      }

      if (!hasMultiple) {
        return
      }

      if (event.key === 'ArrowLeft') {
        event.preventDefault()
        onChange(getWrappedIndex(activeIndex, items.length, -1))
      }

      if (event.key === 'ArrowRight') {
        event.preventDefault()
        onChange(getWrappedIndex(activeIndex, items.length, 1))
      }
    }

    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [activeIndex, hasMultiple, items.length, onChange, onClose])

  useEffect(() => {
    const dialog = dialogRef.current
    if (!dialog) {
      return
    }

    const handleTab = (event: KeyboardEvent) => {
      if (event.key !== 'Tab') {
        return
      }

      const focusable = dialog.querySelectorAll<HTMLElement>(
        'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])',
      )

      if (focusable.length === 0) {
        return
      }

      const first = focusable[0]
      const last = focusable[focusable.length - 1]

      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault()
        last.focus()
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault()
        first.focus()
      }
    }

    document.addEventListener('keydown', handleTab)
    return () => document.removeEventListener('keydown', handleTab)
  }, [activeIndex])

  const handleBackdropClick = (event: React.MouseEvent<HTMLDivElement>) => {
    if (event.target === event.currentTarget) {
      onClose()
    }
  }

  const panelClassName = prefersReducedMotion ? styles.panel : `${styles.panel} ${styles.panelAnimated}`

  return createPortal(
    <div
      className={styles.backdrop}
      onClick={handleBackdropClick}
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) {
          event.preventDefault()
        }
      }}
    >
      <div
        ref={dialogRef}
        className={panelClassName}
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        onClick={(event) => event.stopPropagation()}
      >
        <p id={titleId} className={styles.srOnly}>
          {item.kind === 'image' ? GALLERY_IMAGE_ALT : GALLERY_VIDEO_LABEL}
          {hasMultiple ? ` (${activeIndex + 1} of ${items.length})` : ''}
        </p>

        <div className={styles.toolbar}>
          {hasMultiple ? (
            <button
              type="button"
              className={styles.navButton}
              onClick={() => onChange(getWrappedIndex(activeIndex, items.length, -1))}
              aria-label="Previous item"
            >
              <PrevIcon />
            </button>
          ) : (
            <span className={styles.navSpacer} aria-hidden="true" />
          )}

          <button
            ref={closeButtonRef}
            type="button"
            className={styles.closeButton}
            onClick={onClose}
            aria-label="Close gallery view"
          >
            <CloseIcon />
          </button>

          {hasMultiple ? (
            <button
              type="button"
              className={styles.navButton}
              onClick={() => onChange(getWrappedIndex(activeIndex, items.length, 1))}
              aria-label="Next item"
            >
              <NextIcon />
            </button>
          ) : (
            <span className={styles.navSpacer} aria-hidden="true" />
          )}
        </div>

        <div className={styles.mediaWrap}>
          {item.kind === 'image' ? (
            <img className={styles.media} src={item.src} alt={GALLERY_IMAGE_ALT} decoding="async" />
          ) : (
            <video
              key={item.src}
              className={styles.media}
              src={item.src}
              controls
              playsInline
              preload="metadata"
              aria-label={GALLERY_VIDEO_LABEL}
            />
          )}
        </div>
      </div>
    </div>,
    document.body,
  )
}
