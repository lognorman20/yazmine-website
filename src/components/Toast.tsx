import { useEffect } from 'react'
import { useCart } from '../cart/CartContext'
import styles from './Toast.module.css'

const TOAST_DURATION_MS = 6000

export default function Toast() {
  const { toast, dismissToast } = useCart()

  useEffect(() => {
    if (!toast) return
    const timeout = window.setTimeout(dismissToast, TOAST_DURATION_MS)
    return () => window.clearTimeout(timeout)
  }, [toast, dismissToast])

  // The live region stays mounted so screen readers announce the message when it appears.
  return (
    <div className={styles.region} role="status" aria-live="polite">
      {toast && (
        <div key={toast.key} className={styles.toast}>
          <p className={styles.message}>{toast.message}</p>
          <button type="button" className={styles.dismiss} onClick={dismissToast}>
            Dismiss
          </button>
        </div>
      )}
    </div>
  )
}
