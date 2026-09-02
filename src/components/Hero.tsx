import { useEffect, useRef, useState } from 'react'
import { HERO_VIDEOS, HEADSHOT_SRC } from '../data/media'
import { usePrefersReducedMotion } from '../hooks/usePrefersReducedMotion'
import styles from './Hero.module.css'

const BOOKING_URL = 'https://lusciousbyyazmine.as.me/schedule/d8e29d20'

export default function Hero() {
  const prefersReducedMotion = usePrefersReducedMotion()
  const [slotAIndex, setSlotAIndex] = useState(0)
  const [slotBIndex, setSlotBIndex] = useState(1)
  const [topIsA, setTopIsA] = useState(true)
  const videoARef = useRef<HTMLVideoElement>(null)
  const videoBRef = useRef<HTMLVideoElement>(null)

  useEffect(() => {
    if (prefersReducedMotion) {
      return
    }

    const topVideo = topIsA ? videoARef.current : videoBRef.current
    topVideo?.play().catch(() => {})
  }, [topIsA, slotAIndex, slotBIndex, prefersReducedMotion])

  useEffect(() => {
    if (prefersReducedMotion) {
      return
    }

    const topVideo = topIsA ? videoARef.current : videoBRef.current
    if (!topVideo) {
      return
    }

    const onEnded = () => {
      if (topIsA) {
        const nextIndex = (slotAIndex + 1) % HERO_VIDEOS.length
        setSlotBIndex(nextIndex)
        setTopIsA(false)
        return
      }

      const nextIndex = (slotBIndex + 1) % HERO_VIDEOS.length
      setSlotAIndex(nextIndex)
      setTopIsA(true)
    }

    topVideo.addEventListener('ended', onEnded)
    return () => topVideo.removeEventListener('ended', onEnded)
  }, [prefersReducedMotion, slotAIndex, slotBIndex, topIsA])

  return (
    <section id="hero" className={styles.hero} aria-labelledby="hero-heading">
      <div className={styles.mediaLayer} aria-hidden="true">
        {prefersReducedMotion ? (
          <img
            className={styles.media}
            src={HEADSHOT_SRC}
            alt=""
            decoding="async"
          />
        ) : (
          <>
            <video
              ref={videoARef}
              className={`${styles.media} ${topIsA ? styles.mediaTop : styles.mediaBottom}`}
              src={HERO_VIDEOS[slotAIndex]}
              muted
              playsInline
              autoPlay={topIsA}
              preload="auto"
            />
            <video
              ref={videoBRef}
              className={`${styles.media} ${topIsA ? styles.mediaBottom : styles.mediaTop}`}
              src={HERO_VIDEOS[slotBIndex]}
              muted
              playsInline
              autoPlay={!topIsA}
              preload="auto"
            />
          </>
        )}
        <div className={styles.scrim} />
      </div>

      <div className={styles.content}>
        <h1 id="hero-heading" className={styles.title}>
          LusciousbyYazmine
        </h1>
        <p className={styles.tagline}>Locs, braids &amp; natural hair · Brooklyn</p>
        <a
          href={BOOKING_URL}
          className={styles.cta}
          target="_blank"
          rel="noopener noreferrer"
        >
          Book Now
        </a>
      </div>
    </section>
  )
}
