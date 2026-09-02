import { useEffect, useRef } from 'react'
import { GALLERY_ITEMS } from '../data/media'
import { usePrefersReducedMotion } from '../hooks/usePrefersReducedMotion'
import styles from './Gallery.module.css'

const GALLERY_IMAGE_ALT = 'Hair styling work by Yazmine Taylor'
const GALLERY_VIDEO_LABEL = 'Hair styling video by Yazmine Taylor'

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

export default function Gallery() {
  return (
    <section id="gallery" className={styles.gallery} aria-labelledby="gallery-heading">
      <div className={styles.header}>
        <h2 id="gallery-heading" className={styles.heading}>
          Gallery
        </h2>
      </div>

      <div className={styles.scrollContainer} tabIndex={0} role="region" aria-label="Work gallery">
        <ul className={styles.track}>
          {GALLERY_ITEMS.map((item) => (
            <li key={item.src} className={styles.slide}>
              <div className={styles.mediaFrame}>
                {item.kind === 'image' ? (
                  <img
                    className={styles.media}
                    src={item.src}
                    alt={GALLERY_IMAGE_ALT}
                    decoding="async"
                  />
                ) : (
                  <GalleryVideo src={item.src} />
                )}
              </div>
            </li>
          ))}
        </ul>
      </div>
    </section>
  )
}
