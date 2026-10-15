import { Link } from 'react-router-dom'

import {
  TRANSACTION_LABELS,
  faArea,
  faLandArea,
  faNumber,
  locationLabel,
  priceIsPublished,
  priceLabel,
} from '../format'

export default function PropertyCard({ property }) {
  const published = priceIsPublished(property)
  const specs = []
  if (property.area_sqm) specs.push(faArea(property.area_sqm))
  if (property.land_area_sqm) specs.push(faLandArea(property.land_area_sqm))
  if (property.rooms) specs.push(`${faNumber(property.rooms)} اتاق`)
  if (property.floor !== null && property.floor !== undefined) {
    specs.push(`طبقه ${faNumber(property.floor)}`)
  }
  if (property.documentation) specs.push(property.documentation)

  return (
    <article className="property-card">
      <Link to={`/properties/${property.slug}`} className="property-card__media">
        {property.image ? (
          <img src={property.image} alt={property.title_fa} loading="lazy" />
        ) : (
          <div className="state" style={{ border: 0, height: '100%', background: 'var(--cream)' }}>
            <span className="state__text">تصویری برای این ملک ثبت نشده است.</span>
          </div>
        )}
        <span className="property-card__flags">
          {property.featured ? <span className="badge badge--gold">منتخب</span> : null}
          {property.transaction_type ? (
            <span className="badge badge--emerald">
              {TRANSACTION_LABELS[property.transaction_type] || 'ملک'}
            </span>
          ) : null}
        </span>
      </Link>

      <div className="property-card__body">
        <div>
          <h3 className="property-card__title">
            <Link to={`/properties/${property.slug}`}>{property.title_fa}</Link>
          </h3>
          <p className="property-card__location">
            {property.category?.title_fa ? `${property.category.title_fa} · ` : ''}
            {locationLabel(property)}
          </p>
        </div>

        {specs.length ? (
          <div className="property-card__specs">
            {specs.map((spec) => (
              <span key={spec}>{spec}</span>
            ))}
          </div>
        ) : null}

        <div className="property-card__footer">
          <span
            className={`property-card__price ${published ? '' : 'property-card__price--muted'}`}
          >
            {priceLabel(property)}
          </span>
          <Link className="link-arrow" to={`/properties/${property.slug}`}>
            جزئیات بیشتر
            <span className="link-arrow__mark">←</span>
          </Link>
        </div>
      </div>
    </article>
  )
}
