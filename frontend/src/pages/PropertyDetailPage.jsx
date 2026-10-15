import { useCallback, useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'

import { api } from '../api'
import { ErrorState, LoadingState } from '../components/Feedback.jsx'
import Gallery from '../components/Gallery.jsx'
import InquiryForm from '../components/InquiryForm.jsx'
import PropertyCard from '../components/PropertyCard.jsx'
import { useSettings } from '../components/settings.jsx'
import {
  TRANSACTION_LABELS,
  faArea,
  faNumber,
  locationLabel,
  priceIsPublished,
  priceLabel,
  telLink,
  whatsappLink,
} from '../format'
import { useSeo } from '../seo.js'

export default function PropertyDetailPage() {
  const { slug } = useParams()
  const { settings } = useSettings()
  const [property, setProperty] = useState(null)
  const [status, setStatus] = useState('loading')
  const [error, setError] = useState(null)

  const load = useCallback(async () => {
    setStatus('loading')
    try {
      const data = await api.getProperty(slug)
      setProperty(data)
      setError(null)
      setStatus('ready')
    } catch (err) {
      setError(err)
      setProperty(null)
      setStatus('error')
    }
  }, [slug])

  useEffect(() => {
    load()
  }, [load])

  useSeo({
    title: property?.title_fa,
    description: property?.description_fa
      ? property.description_fa.slice(0, 160)
      : property
        ? `${property.title_fa} — ${locationLabel(property)}`
        : undefined,
    image: property?.image,
    type: 'article',
  })

  if (status === 'loading') {
    return (
      <section className="section">
        <div className="shell shell--wide">
          <LoadingState label="در حال بارگذاری جزئیات ملک…" />
        </div>
      </section>
    )
  }

  if (status === 'error' || !property) {
    return (
      <section className="section">
        <div className="shell shell--wide">
          <ErrorState message={error?.message} onRetry={load} />
          <p style={{ marginTop: 22 }}>
            <Link className="link-arrow" to="/properties">
              بازگشت به فهرست املاک
              <span className="link-arrow__mark">←</span>
            </Link>
          </p>
        </div>
      </section>
    )
  }

  const phone = settings?.phone_1 || ''
  const whatsapp = settings?.whatsapp || ''
  const waText = `سلام، درباره «${property.title_fa}» در املاک جاوید سؤال داشتم.`
  const published = priceIsPublished(property)

  const specs = [
    ['نوع ملک', property.category?.title_fa],
    ['نوع معامله', TRANSACTION_LABELS[property.transaction_type]],
    ['موقعیت', locationLabel(property)],
    ['محدوده', property.location_note],
    ['متراژ', faArea(property.area_sqm)],
    ['متراژ زمین', property.land_area_sqm ? faArea(property.land_area_sqm) : ''],
    ['تعداد اتاق', property.rooms ? `${faNumber(property.rooms)} اتاق` : ''],
    ['طبقه', property.floor !== null && property.floor !== undefined ? faNumber(property.floor) : ''],
    ['سال ساخت', property.year_built ? faNumber(property.year_built) : ''],
    ['نوع سند', property.documentation],
  ].filter(([, value]) => value)

  const hasCoordinates = Boolean(property.latitude && property.longitude)
  const bbox = hasCoordinates
    ? `${Number(property.longitude) - 0.01},${Number(property.latitude) - 0.008},${
        Number(property.longitude) + 0.01
      },${Number(property.latitude) + 0.008}`
    : ''

  return (
    <>
      <section className="detail-hero">
        <div className="shell shell--wide">
          <nav className="detail-breadcrumb" aria-label="مسیر صفحه">
            <Link to="/">صفحه اصلی</Link>
            <span>/</span>
            <Link to="/properties">املاک</Link>
            {property.category ? (
              <>
                <span>/</span>
                <Link to={`/properties?category=${property.category.slug}`}>
                  {property.category.title_fa}
                </Link>
              </>
            ) : null}
          </nav>

          <h1 className="title-lg">{property.title_fa}</h1>
          <div className="meta-row" style={{ marginTop: 16 }}>
            {locationLabel(property) ? (
              <span className="meta-item">
                <span className="meta-item__label">موقعیت</span>
                <span className="meta-item__value">{locationLabel(property)}</span>
              </span>
            ) : null}
            {property.area_sqm ? (
              <span className="meta-item">
                <span className="meta-item__label">متراژ</span>
                <span className="meta-item__value">{faArea(property.area_sqm)}</span>
              </span>
            ) : null}
            {property.transaction_type ? (
              <span className="meta-item">
                <span className="meta-item__label">وضعیت</span>
                <span className="meta-item__value">
                  {TRANSACTION_LABELS[property.transaction_type]}
                </span>
              </span>
            ) : null}
          </div>
        </div>
      </section>

      <section className="section section--tight">
        <div className="shell shell--wide">
          <div className="detail-layout">
            <div>
              <Gallery images={property.images} alt={property.title_fa} />

              <div style={{ marginTop: 40 }}>
                <p className="eyebrow">Specifications</p>
                <h2 className="title-md" style={{ margin: '12px 0 18px' }}>
                  مشخصات ملک
                </h2>
                <table className="spec-table">
                  <tbody>
                    {specs.map(([label, value]) => (
                      <tr key={label}>
                        <td>{label}</td>
                        <td>{value}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {property.description_fa ? (
                <div style={{ marginTop: 40 }}>
                  <p className="eyebrow">Description</p>
                  <h2 className="title-md" style={{ margin: '12px 0 14px' }}>
                    توضیحات
                  </h2>
                  <p className="lede" style={{ whiteSpace: 'pre-line' }}>
                    {property.description_fa}
                  </p>
                </div>
              ) : null}

              {property.features?.length ? (
                <div style={{ marginTop: 40 }}>
                  <p className="eyebrow">Features</p>
                  <h2 className="title-md" style={{ margin: '12px 0 16px' }}>
                    ویژگی‌ها
                  </h2>
                  <div className="feature-tags">
                    {property.features.map((feature) => (
                      <span className="badge" key={feature}>
                        {feature}
                      </span>
                    ))}
                  </div>
                </div>
              ) : null}

              {property.virtual_tour_url || property.video_url || property.floor_plan_url ? (
                <div style={{ marginTop: 40, display: 'flex', gap: 12, flexWrap: 'wrap' }}>
                  {property.virtual_tour_url ? (
                    <a
                      className="btn btn--emerald btn--sm"
                      href={property.virtual_tour_url}
                      target="_blank"
                      rel="noreferrer"
                    >
                      مشاهده تور مجازی
                    </a>
                  ) : null}
                  {property.video_url ? (
                    <a
                      className="btn btn--outline btn--sm"
                      href={property.video_url}
                      target="_blank"
                      rel="noreferrer"
                    >
                      مشاهده ویدیو ملک
                    </a>
                  ) : null}
                  {property.floor_plan_url ? (
                    <a
                      className="btn btn--outline btn--sm"
                      href={property.floor_plan_url}
                      target="_blank"
                      rel="noreferrer"
                    >
                      مشاهده پلان
                    </a>
                  ) : null}
                </div>
              ) : null}

              {hasCoordinates ? (
                <div style={{ marginTop: 40 }} id="map">
                  <p className="eyebrow">Location</p>
                  <h2 className="title-md" style={{ margin: '12px 0 16px' }}>
                    موقعیت ملک
                  </h2>
                  <iframe
                    className="map-frame"
                    title={`نقشه ${property.title_fa}`}
                    loading="lazy"
                    src={`https://www.openstreetmap.org/export/embed.html?bbox=${bbox}&layer=mapnik&marker=${property.latitude},${property.longitude}`}
                  />
                  <p className="field__hint" style={{ marginTop: 10 }}>
                    موقعیت تقریبی؛ برای بازدید دقیق با ما هماهنگ کنید.
                  </p>
                </div>
              ) : null}
            </div>

            <aside className="detail-sidebar">
              <div className="panel">
                <p className="eyebrow">Price</p>
                <p
                  className={`property-card__price ${published ? '' : 'property-card__price--muted'}`}
                  style={{ marginTop: 10, fontSize: '1.2rem' }}
                >
                  {priceLabel(property)}
                </p>
                <div style={{ display: 'flex', gap: 8, marginTop: 14, flexWrap: 'wrap' }}>
                  {property.transaction_type ? (
                    <span className="badge badge--emerald">
                      {TRANSACTION_LABELS[property.transaction_type]}
                    </span>
                  ) : null}
                  {property.featured ? <span className="badge badge--gold">منتخب</span> : null}
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginTop: 20 }}>
                  {phone ? (
                    <a className="btn btn--emerald btn--block" href={telLink(phone)}>
                      تماس تلفنی
                    </a>
                  ) : null}
                  {whatsapp ? (
                    <a
                      className="btn btn--outline btn--block"
                      href={whatsappLink(whatsapp, waText)}
                      target="_blank"
                      rel="noreferrer"
                    >
                      گفت‌وگو در واتس‌اپ
                    </a>
                  ) : null}
                  {hasCoordinates ? (
                    <a className="btn btn--outline btn--block" href="#map">
                      مشاهده موقعیت
                    </a>
                  ) : null}
                </div>
              </div>

              <div className="panel">
                <p className="eyebrow">Inquiry</p>
                <h2 className="title-md" style={{ margin: '10px 0 16px', fontSize: '1.15rem' }}>
                  درخواست بازدید
                </h2>
                <InquiryForm
                  kind="property"
                  propertyId={property.id}
                  propertyTitle={property.title_fa}
                  submitLabel="ارسال درخواست بازدید"
                  messagePlaceholder="زمان مناسب برای بازدید یا سؤال خود را بنویسید…"
                />
              </div>
            </aside>
          </div>

          {property.related?.length ? (
            <div style={{ marginTop: 'clamp(48px, 7vw, 96px)' }}>
              <div className="section-header">
                <p className="eyebrow">Similar Properties</p>
                <div className="section-header__row">
                  <h2 className="title-md">املاک مشابه</h2>
                  <Link className="link-arrow" to="/properties">
                    همه املاک
                    <span className="link-arrow__mark">←</span>
                  </Link>
                </div>
              </div>
              <div className="grid-3">
                {property.related.map((item) => (
                  <PropertyCard key={item.id} property={item} />
                ))}
              </div>
            </div>
          ) : null}
        </div>
      </section>

      <div className="sticky-contact">
        {phone ? (
          <a className="btn btn--emerald" href={telLink(phone)}>
            تماس
          </a>
        ) : null}
        {whatsapp ? (
          <a
            className="btn btn--outline"
            href={whatsappLink(whatsapp, waText)}
            target="_blank"
            rel="noreferrer"
          >
            واتس‌اپ
          </a>
        ) : (
          <Link className="btn btn--outline" to="/contact">
            درخواست بازدید
          </Link>
        )}
      </div>
    </>
  )
}
