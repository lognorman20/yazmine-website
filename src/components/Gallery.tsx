import { useEffect, useRef, useState, type PointerEvent as ReactPointerEvent } from 'react'
import { GALLERY_ITEMS } from '../data/media'
import { usePrefersReducedMotion } from '../hooks/usePrefersReducedMotion'
import GalleryLightbox from './GalleryLightbox'
import styles from './Gallery.module.css'

const GALLERY_IMAGE_ALT = 'Hair styling work by Yazmine Taylor'
const GALLERY_VIDEO_LABEL = 'Hair styling video by Yazmine Taylor'
const TAP_MOVE_THRESHOLD_PX = 10

function GalleryVideo({ src }: { src: string }) {
  const prefersReducedMotion = usePrefersReducedMotion()
  const videoRef = useRef<HTMLVideoElement>(null)

  useEffect(() => {
    if (prefersReducedMotion) {
      return
    }

    const video = videoRef.current
    if (!video) {
      return
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          video.play().catch(() => {})
        } else {
          video.pause()
        }
      },
      { threshold: 0.5 },
    )

    observer.observe(video)
    return () => observer.disconnect()
  }, [prefersReducedMotion])

  return (
    <video
      ref={videoRef}
      className={styles.media}
      src={src}
      muted
      playsInline
      loop
      preload="metadata"
      aria-label={GALLERY_VIDEO_LABEL}
    />
  )
}

type PointerPoint = { x: number; y: number }

export default function Gallery() {
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null)
  const triggerRefs = useRef<(HTMLButtonElement | null)[]>([])
  const returnFocusRef = useRef<HTMLElement | null>(null)
  const pointerStartRef = useRef<PointerPoint | null>(null)
  const pointerMovedRef = useRef(false)
  const suppressClickRef = useRef(false)

  const openLightbox = (index: number) => {
    returnFocusRef.current = triggerRefs.current[index]
    setLightboxIndex(index)
  }

  const closeLightbox = () => {
    setLightboxIndex(null)
  }

  const resetPointerState = () => {
    pointerStartRef.current = null
    pointerMovedRef.current = false
  }

  const handleSlidePointerDown = (event: ReactPointerEvent<HTMLButtonElement>) => {
    if (event.pointerType === 'mouse' && event.button !== 0) {
      return
    }

    pointerStartRef.current = { x: event.clientX, y: event.clientY }
    pointerMovedRef.current = false
  }

  const handleSlidePointerMove = (event: ReactPointerEvent<HTMLButtonElement>) => {
    const start = pointerStartRef.current
    if (!start) {
      return
    }

    const deltaX = Math.abs(event.clientX - start.x)
    const deltaY = Math.abs(event.clientY - start.y)
    if (deltaX > TAP_MOVE_THRESHOLD_PX || deltaY > TAP_MOVE_THRESHOLD_PX) {
      pointerMovedRef.current = true
    }
  }

  const handleSlidePointerUp = (index: number, event: ReactPointerEvent<HTMLButtonElement>) => {
    const start = pointerStartRef.current
    if (!start || event.pointerType === 'mouse') {
      resetPointerState()
      return
    }

    const deltaX = Math.abs(event.clientX - start.x)
    const deltaY = Math.abs(event.clientY - start.y)
    const isTap =
      !pointerMovedRef.current &&
      deltaX <= TAP_MOVE_THRESHOLD_PX &&
      deltaY <= TAP_MOVE_THRESHOLD_PX

    resetPointerState()

    if (!isTap) {
      return
    }

    event.preventDefault()
    suppressClickRef.current = true
    openLightbox(index)
  }

  const handleSlideClick = (index: number) => {
    if (suppressClickRef.current) {
      suppressClickRef.current = false
      return
    }

    openLightbox(index)
  }

  return (
    <section id="gallery" className={styles.gallery} aria-labelledby="gallery-heading">
      <div className={styles.header}>
        <h2 id="gallery-heading" className={styles.heading}>
          Gallery
        </h2>
      </div>

      <div className={styles.scrollWrap}>
        <div className={styles.scrollContainer} tabIndex={0} role="region" aria-label="Work gallery">
          <ul className={styles.track}>
            {GALLERY_ITEMS.map((item, index) => (
              <li key={item.src} className={styles.slide}>
                <button
                  type="button"
                  ref={(element) => {
                    triggerRefs.current[index] = element
                  }}
                  className={styles.slideButton}
                  onPointerDown={handleSlidePointerDown}
                  onPointerMove={handleSlidePointerMove}
                  onPointerUp={(event) => handleSlidePointerUp(index, event)}
                  onPointerCancel={resetPointerState}
                  onClick={() => handleSlideClick(index)}
                  aria-label={
                    item.kind === 'image'
                      ? `View ${GALLERY_IMAGE_ALT}`
                      : `View ${GALLERY_VIDEO_LABEL}`
                  }
                >
                  <div className={styles.mediaFrame}>
                    {item.kind === 'image' ? (
                      <img
                        className={styles.media}
                        src={item.src}
                        alt=""
                        decoding="async"
                        draggable={false}
                      />
                    ) : (
                      <GalleryVideo src={item.src} />
                    )}
                  </div>
                </button>
              </li>
            ))}
          </ul>
        </div>
        <div className={styles.edgeFade} aria-hidden="true" />
      </div>

      {lightboxIndex !== null ? (
        <GalleryLightbox
          items={GALLERY_ITEMS}
          activeIndex={lightboxIndex}
          onClose={closeLightbox}
          onChange={setLightboxIndex}
          returnFocusRef={returnFocusRef}
        />
      ) : null}
    </section>
  )
}
