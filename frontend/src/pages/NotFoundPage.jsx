import { Link } from 'react-router-dom'

import { useSeo } from '../seo.js'

export default function NotFoundPage() {
  useSeo({ title: 'صفحه پیدا نشد' })

  return (
    <section className="section" style={{ paddingTop: 160 }}>
      <div className="shell shell--wide">
        <div className="state" style={{ maxWidth: 640, margin: '0 auto' }}>
          <p className="eyebrow">404</p>
          <p className="state__title">این صفحه در دسترس نیست</p>
          <p className="state__text">
            ممکن است نشانی تغییر کرده باشد یا ملک مورد نظر منتشر نشده باشد. از فهرست املاک
            شروع کنید یا با ما تماس بگیرید.
          </p>
          <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', justifyContent: 'center' }}>
            <Link className="btn btn--emerald btn--sm" to="/properties">
              مشاهده املاک
            </Link>
            <Link className="btn btn--outline btn--sm" to="/">
              صفحه اصلی
            </Link>
          </div>
        </div>
      </div>
    </section>
  )
}
