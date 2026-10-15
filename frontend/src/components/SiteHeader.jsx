import { useEffect, useState } from 'react'
import { Link, useLocation } from 'react-router-dom'

import { useSettings } from './settings.jsx'

const NAV_ITEMS = [
  { label: 'صفحه اصلی', to: '/' },
  { label: 'مشاهده املاک', to: '/properties' },
  { label: 'خرید و فروش', to: '/properties?transaction=sale' },
  { label: 'اجاره و رهن', to: '/properties?category=rent-mortgage' },
  { label: 'زمین', to: '/properties?category=land' },
  { label: 'املاک تجاری', to: '/properties?category=commercial' },
  { label: 'درباره ما', to: '/about' },
  { label: 'تماس با ما', to: '/contact' },
]

function BrandMark() {
  return (
    <svg className="brand__mark" viewBox="0 0 64 64" role="img" aria-label="نشان املاک جاوید">
      <circle cx="32" cy="32" r="30" fill="none" stroke="currentColor" strokeWidth="1.4" opacity="0.7" />
      <g fill="currentColor">
        <rect x="26" y="19" width="12" height="27" rx="1" />
        <rect x="19" y="29" width="5.5" height="17" rx="1" opacity="0.75" />
        <rect x="39.5" y="25" width="5.5" height="21" rx="1" opacity="0.75" />
      </g>
    </svg>
  )
}

export default function SiteHeader() {
  const { settings } = useSettings()
  const location = useLocation()
  const [scrolled, setScrolled] = useState(false)
  const [menuOpen, setMenuOpen] = useState(false)

  const isHome = location.pathname === '/'
  const solid = scrolled || !isHome

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 48)
    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  useEffect(() => {
    setMenuOpen(false)
  }, [location.pathname, location.search])

  useEffect(() => {
    document.body.style.overflow = menuOpen ? 'hidden' : ''
    return () => {
      document.body.style.overflow = ''
    }
  }, [menuOpen])

  const brandName = settings?.brand_fa || 'املاک جاوید'
  const brandEn = settings?.brand_en || 'JAVID REAL ESTATE'
  const phone = settings?.phone_1 || ''
  const address = settings?.address_fa || 'قشم و درگهان'

  return (
    <header className={`site-header ${solid ? 'site-header--solid' : ''}`}>
      <div className="shell shell--wide">
        <div className="site-header__bar">
          <Link className="brand" to="/" aria-label={brandName}>
            <BrandMark />
            <span className="brand__text">
              <span className="brand__en">{brandEn}</span>
              <span className="brand__fa">{brandName}</span>
            </span>
          </Link>

          <nav className="site-nav" aria-label="فهرست اصلی">
            {NAV_ITEMS.map((item) => {
              const [path, query] = item.to.split('?')
              const active =
                location.pathname === path &&
                (query ? location.search.includes(query) : !location.search)
              return (
                <Link
                  key={item.to}
                  to={item.to}
                  className={`site-nav__link ${active ? 'is-active' : ''}`}
                >
                  {item.label}
                </Link>
              )
            })}
          </nav>

          <div className="header-actions">
            <div className="header-contact">
              <span className="header-contact__phone">{phone || '—'}</span>
              <span className="header-contact__meta">{address}</span>
            </div>
            <Link className="btn btn--sm btn--light" to="/contact">
              دریافت مشاوره
            </Link>
            <button
              type="button"
              className="nav-toggle"
              aria-label="باز کردن فهرست"
              aria-expanded={menuOpen}
              onClick={() => setMenuOpen(true)}
            >
              <span />
            </button>
          </div>
        </div>
      </div>

      {menuOpen ? (
        <div className="mobile-nav" role="dialog" aria-modal="true" aria-label="فهرست">
          <div className="mobile-nav__head">
            <span className="brand__text">
              <span className="brand__en">{brandEn}</span>
              <span className="brand__fa">{brandName}</span>
            </span>
            <button
              type="button"
              className="mobile-nav__close"
              aria-label="بستن فهرست"
              onClick={() => setMenuOpen(false)}
            >
              ✕
            </button>
          </div>
          <nav className="mobile-nav__links" aria-label="فهرست موبایل">
            {NAV_ITEMS.map((item) => (
              <Link key={item.to} to={item.to} className="mobile-nav__link">
                {item.label}
              </Link>
            ))}
          </nav>
          <div className="mobile-nav__links" style={{ flex: 'none', marginTop: 24 }}>
            {phone ? <span className="en-sans">{phone}</span> : null}
            <Link className="btn btn--light btn--block" to="/contact" style={{ marginTop: 12 }}>
              دریافت مشاوره
            </Link>
          </div>
        </div>
      ) : null}
    </header>
  )
}
