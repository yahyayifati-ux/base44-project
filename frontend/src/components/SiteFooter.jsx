import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'

import { api } from '../api'
import { telLink, whatsappLink } from '../format'
import { useSettings } from './settings.jsx'

export default function SiteFooter() {
  const { settings } = useSettings()
  const [categories, setCategories] = useState([])

  useEffect(() => {
    api
      .getCategories()
      .then((data) => setCategories(Array.isArray(data) ? data : []))
      .catch(() => setCategories([]))
  }, [])

  const brandFa = settings?.brand_fa || 'املاک جاوید'
  const brandEn = settings?.brand_en || 'JAVID REAL ESTATE'
  const phone1 = settings?.phone_1 || ''
  const phone2 = settings?.phone_2 || ''
  const whatsapp = settings?.whatsapp || ''
  const address = settings?.address_fa || ''
  const email = settings?.email || ''
  const hours = settings?.hours_fa || ''
  const instagram = settings?.instagram || ''
  const telegram = settings?.telegram || ''
  const intro = settings?.about_intro_fa || ''

  const jalaliYear = new Intl.DateTimeFormat('fa-IR', { year: 'numeric' }).format(new Date())

  const waText = 'سلام، برای مشاوره ملک در قشم تماس می‌گیرم.'

  return (
    <footer className="site-footer">
      <div className="shell shell--wide">
        <div className="site-footer__grid">
          <div className="site-footer__brand">
            <span className="site-footer__wordmark">{brandEn}</span>
            <span className="site-footer__qeshm">QESHM</span>
            {intro ? <p>{intro}</p> : null}
          </div>

          <div>
            <p className="site-footer__title">دسترسی سریع</p>
            <div className="site-footer__list">
              <Link to="/">صفحه اصلی</Link>
              <Link to="/properties">مشاهده املاک</Link>
              <Link to="/about">درباره ما</Link>
              <Link to="/contact">تماس با ما</Link>
            </div>
          </div>

          <div>
            <p className="site-footer__title">دسته‌بندی املاک</p>
            <div className="site-footer__list">
              {categories.length ? (
                categories.map((category) => (
                  <Link key={category.slug} to={`/properties?category=${category.slug}`}>
                    {category.title_fa}
                  </Link>
                ))
              ) : (
                <span className="text-muted">—</span>
              )}
            </div>
          </div>

          <div>
            <p className="site-footer__title">تماس با {brandFa}</p>
            <div className="site-footer__list">
              {phone1 ? (
                <a className="en-sans" href={telLink(phone1)}>
                  {phone1}
                </a>
              ) : null}
              {phone2 ? (
                <a className="en-sans" href={telLink(phone2)}>
                  {phone2}
                </a>
              ) : null}
              {whatsapp ? (
                <a href={whatsappLink(whatsapp, waText)} target="_blank" rel="noreferrer">
                  گفت‌وگو در واتس‌اپ
                </a>
              ) : null}
              {email ? <a href={`mailto:${email}`}>{email}</a> : null}
              {address ? <span>{address}</span> : null}
              {hours ? <span>{hours}</span> : null}
              {instagram ? (
                <a href={instagram} target="_blank" rel="noreferrer">
                  اینستاگرام
                </a>
              ) : null}
              {telegram ? (
                <a href={telegram} target="_blank" rel="noreferrer">
                  تلگرام
                </a>
              ) : null}
            </div>
          </div>
        </div>

        <div className="site-footer__bottom">
          <span>
            © {jalaliYear} {brandFa} — تمام حقوق محفوظ است.
          </span>
          <span className="en-sans">{brandEn} · QESHM</span>
        </div>
      </div>
    </footer>
  )
}
