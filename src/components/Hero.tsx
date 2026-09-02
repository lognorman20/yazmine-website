import { useEffect, useRef, useState } from 'react'
import { HERO_VIDEOS, HEADSHOT_SRC } from '../data/media'
import { usePrefersReducedMotion } from '../hooks/usePrefersReducedMotion'
import styles from './Hero.module.css'

const BOOKING_URL = 'https://lusciousbyyazmine.as.me/schedule/d8e29d20'

export default function Hero() {
  const prefersReducedMotion = usePrefersReducedMotion()
  const [videoIndex, setVideoIndex] = useState(0)
  const videoRef = useRef<HTMLVideoElement>(null)

  useEffect(() => {
    if (prefersReducedMotion) {
      return
    }

    const video = videoRef.current
    if (!video) {
      return
    }

    video.load()
    video.play().catch(() => {})

    const onEnded = () => {
      setVideoIndex((index) => (index + 1) % HERO_VIDEOS.length)
    }

    video.addEventListener('ended', onEnded)
    return () => video.removeEventListener('ended', onEnded)
  }, [videoIndex, prefersReducedMotion])

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
          <video
            ref={videoRef}
            className={styles.media}
            src={HERO_VIDEOS[videoIndex]}
            muted
            playsInline
            autoPlay
            preload="auto"
          />
        )}
        <div className={styles.scrim} />
      </div>

      <div className={styles.content}>
        <h1 id="hero-heading" className={styles.title}>
          LusciousbyYazmine
        </h1>
        <p className={styles.tagline}>Care, Culture, Confidence</p>
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
