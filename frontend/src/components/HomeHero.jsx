import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'

/* Cinematic hero: the JAVID office photograph fills the screen, an oversized
   translucent "Real Estate" wordmark sits at the top, and a single Persian
   headline with two actions anchors the bottom. The photograph and wordmark
   drift gently against the scroll; everything collapses to a static block
   when the visitor prefers reduced motion. */
export default function HomeHero({ settings }) {
  const heroImage = settings?.hero_image || '/images/hero.jpg'
  const headline = settings?.hero_headline_fa || 'انتخابی مطمئن برای آینده‌ای ارزشمند'

  const [offset, setOffset] = useState(0)

  useEffect(() => {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return undefined
    let frame = 0
    const onScroll = () => {
      if (frame) return
      frame = window.requestAnimationFrame(() => {
        frame = 0
        setOffset(Math.min(window.scrollY, 700))
      })
    }
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => {
      window.removeEventListener('scroll', onScroll)
      if (frame) window.cancelAnimationFrame(frame)
    }
  }, [])

  return (
    <section className="hero">
      <div className="hero__media" aria-hidden="true">
        <img
          src={heroImage}
          alt=""
          style={{
            transform: `translate3d(0, ${offset * 0.06}px, 0) scale(${1.12 - offset / 9000})`,
          }}
        />
      </div>
      <div className="hero__scrim" aria-hidden="true" />

      {/* Oversized editorial wordmark — drifts up and fades as you scroll. */}
      <span
        className="hero__wordmark"
        aria-hidden="true"
        style={{
          transform: `translate3d(0, ${offset * -0.16}px, 0)`,
          opacity: Math.max(0, 1 - offset / 520),
        }}
      >
        Real <em>Estate</em>
      </span>

      <div className="hero__inner">
        <div className="shell shell--wide">
          <div className="hero__bottom">
            <h1 className="hero__headline">{headline}</h1>
            <div className="hero__actions">
              <Link className="btn btn--light" to="/properties">
                مشاهده املاک
              </Link>
              <Link className="btn btn--outline-inverse" to="/contact">
                دریافت مشاوره
              </Link>
            </div>
          </div>
        </div>
      </div>

      <span className="hero__scroll">Scroll</span>
    </section>
  )
}
