import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'

import { telLink, whatsappLink } from '../format'

/* Homepage hero: oversized brand typography layered over an architectural
   photograph, with the Persian headline and the office details below.
   Both the photograph and the wordmark move a little against the scroll so the
   hero hands over to the overview section; everything collapses to a static
   block when the visitor prefers reduced motion. */
export default function HomeHero({ settings }) {
  const heroImage = settings?.hero_image || '/images/hero.jpg'
  const headline = settings?.hero_headline_fa || 'انتخابی مطمئن برای آینده‌ای ارزشمند'
  const sub =
    settings?.hero_sub_fa ||
    'املاک جاوید در قشم و درگهان کنار شماست تا با شناخت دقیق موقعیت، متراژ و مدارک هر ملک، تصمیم مطمئن‌تری بگیرید.'
  const phone = settings?.phone_1 || ''
  const phone2 = settings?.phone_2 || ''
  const whatsapp = settings?.whatsapp || ''
  const address = settings?.address_fa || 'جزیره قشم، استان هرمزگان'
  const phones = [phone, phone2].filter(Boolean)

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
            transform: `translate3d(0, ${offset * 0.05}px, 0) scale(${1.1 - offset / 9000})`,
          }}
        />
      </div>
      <div className="hero__scrim" aria-hidden="true" />

      {/* The brand wordmark is the hero's typographic layer: it stays behind the
          content and drifts away as the overview section arrives. */}
      <span
        className="hero__wordmark"
        aria-hidden="true"
        style={{
          transform: `translate3d(0, ${offset * -0.18}px, 0)`,
          opacity: Math.max(0, 1 - offset / 560),
        }}
      >
        Real <em>Estate</em>
      </span>

      <div className="hero__inner">
        <div className="shell shell--wide">
          <div className="hero__topline">
            <span className="eyebrow" style={{ color: 'var(--gold-soft)' }}>
              JAVID REAL ESTATE · AMLAK-E JAVED
            </span>
            <span className="hero__qeshm">QESHM</span>
          </div>

          <div className="hero__bottom">
            <div>
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

            <p className="hero__sub">{sub}</p>
          </div>

          <div className="hero__bar">
            <span className="hero__bar-item">
              <span className="hero__bar-label">محدوده فعالیت</span>
              <span>{address}</span>
            </span>

            {phones.length ? (
              <span className="hero__bar-item">
                <span className="hero__bar-label">تماس</span>
                <span className="hero__bar-phones">
                  {phones.map((number) => (
                    <a key={number} className="en-sans" href={telLink(number)}>
                      {number}
                    </a>
                  ))}
                </span>
              </span>
            ) : null}

            {whatsapp ? (
              <span className="hero__bar-item">
                <a
                  href={whatsappLink(
                    whatsapp,
                    'سلام، برای مشاوره خرید ملک در قشم تماس می‌گیرم.'
                  )}
                  target="_blank"
                  rel="noreferrer"
                >
                  گفت‌وگو در واتس‌اپ
                </a>
              </span>
            ) : null}
          </div>
        </div>
      </div>

      <span className="hero__scroll">Scroll</span>
    </section>
  )
}
