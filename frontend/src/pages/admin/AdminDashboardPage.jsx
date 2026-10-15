import { useCallback, useEffect, useState } from 'react'
import { Link } from 'react-router-dom'

import { api } from '../../api'
import { ErrorState, LoadingState } from '../../components/Feedback.jsx'
import {
  INQUIRY_KIND_LABELS,
  INQUIRY_STATUS_LABELS,
  TRANSACTION_LABELS,
  faDate,
  faNumber,
} from '../../format'
import { useSeo } from '../../seo.js'

export default function AdminDashboardPage() {
  const [stats, setStats] = useState(null)
  const [properties, setProperties] = useState([])
  const [inquiries, setInquiries] = useState([])
  const [status, setStatus] = useState('loading')
  const [error, setError] = useState(null)

  useSeo({ title: 'داشبورد مدیریت' })

  const load = useCallback(async () => {
    setStatus('loading')
    try {
      const [statsData, propertyData, inquiryData] = await Promise.all([
        api.admin.stats(),
        api.admin.listProperties({ page_size: 5 }),
        api.admin.listInquiries({}),
      ])
      setStats(statsData)
      setProperties(propertyData?.items ?? [])
      setInquiries((inquiryData?.items ?? []).slice(0, 5))
      setError(null)
      setStatus('ready')
    } catch (err) {
      setError(err)
      setStatus('error')
    }
  }, [])

  useEffect(() => {
    load()
  }, [load])

  if (status === 'loading') return <LoadingState label="در حال بارگذاری داشبورد…" />
  if (status === 'error') return <ErrorState message={error?.message} onRetry={load} />

  const tiles = [
    { label: 'کل فایل‌ها', value: stats?.properties ?? 0 },
    { label: 'منتشرشده', value: stats?.published ?? 0 },
    { label: 'پیش‌نویس', value: stats?.drafts ?? 0 },
    { label: 'درخواست‌های جدید', value: stats?.new_inquiries ?? 0 },
  ]

  return (
    <>
      <div className="admin-toolbar">
        <div>
          <p className="eyebrow">Dashboard</p>
          <h1 className="title-md" style={{ marginTop: 8 }}>
            وضعیت سایت املاک جاوید
          </h1>
        </div>
        <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
          <Link className="btn btn--emerald btn--sm" to="/admin/properties/new">
            افزودن ملک
          </Link>
          <Link className="btn btn--outline btn--sm" to="/admin/inquiries">
            بررسی درخواست‌ها
          </Link>
        </div>
      </div>

      <div className="stat-grid">
        {tiles.map((tile) => (
          <div className="stat" key={tile.label}>
            <div className="stat__value">{faNumber(tile.value)}</div>
            <div className="stat__label">{tile.label}</div>
          </div>
        ))}
      </div>

      <div className="grid-2">
        <div>
          <h2 className="title-md" style={{ fontSize: '1.15rem', marginBottom: 14 }}>
            آخرین فایل‌ها
          </h2>
          {properties.length ? (
            <div className="table-wrap">
              <table className="table">
                <thead>
                  <tr>
                    <th>عنوان</th>
                    <th>معامله</th>
                    <th>وضعیت</th>
                  </tr>
                </thead>
                <tbody>
                  {properties.map((property) => (
                    <tr key={property.id}>
                      <td>
                        <Link to={`/admin/properties/${property.id}`}>{property.title_fa}</Link>
                      </td>
                      <td>{TRANSACTION_LABELS[property.transaction_type] || '—'}</td>
                      <td>
                        <span className={`badge ${property.published ? 'badge--published' : 'badge--draft'}`}>
                          {property.published ? 'منتشرشده' : 'پیش‌نویس'}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="state">
              <p className="state__title">هنوز ملکی ثبت نشده است</p>
              <p className="state__text">
                اولین فایل ملکی را اضافه کنید؛ پس از انتشار در سایت نمایش داده می‌شود.
              </p>
              <Link className="btn btn--emerald btn--sm" to="/admin/properties/new">
                افزودن ملک
              </Link>
            </div>
          )}
        </div>

        <div>
          <h2 className="title-md" style={{ fontSize: '1.15rem', marginBottom: 14 }}>
            آخرین درخواست‌ها
          </h2>
          {inquiries.length ? (
            <div className="table-wrap">
              <table className="table">
                <thead>
                  <tr>
                    <th>نام</th>
                    <th>موضوع</th>
                    <th>وضعیت</th>
                    <th>تاریخ</th>
                  </tr>
                </thead>
                <tbody>
                  {inquiries.map((inquiry) => (
                    <tr key={inquiry.id}>
                      <td>{inquiry.name}</td>
                      <td>{INQUIRY_KIND_LABELS[inquiry.kind] || '—'}</td>
                      <td>{INQUIRY_STATUS_LABELS[inquiry.status] || '—'}</td>
                      <td className="num">{faDate(inquiry.created_at)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="state">
              <p className="state__title">درخواستی ثبت نشده است</p>
              <p className="state__text">
                درخواست‌های فرم‌های سایت در این بخش نمایش داده می‌شوند.
              </p>
            </div>
          )}
        </div>
      </div>
    </>
  )
}
