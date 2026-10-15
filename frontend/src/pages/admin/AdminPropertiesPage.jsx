import { useCallback, useEffect, useState } from 'react'
import { Link } from 'react-router-dom'

import { api } from '../../api'
import { toPropertyPayload } from '../../adminPayload.js'
import { Alert, ErrorState, LoadingState } from '../../components/Feedback.jsx'
import { TRANSACTION_LABELS, faDate, faNumber, priceLabel } from '../../format'
import { useSeo } from '../../seo.js'

export default function AdminPropertiesPage() {
  const [items, setItems] = useState([])
  const [total, setTotal] = useState(0)
  const [status, setStatus] = useState('loading')
  const [error, setError] = useState(null)
  const [message, setMessage] = useState('')
  const [busyId, setBusyId] = useState(null)
  const [filters, setFilters] = useState({ q: '', status: '' })

  useSeo({ title: 'مدیریت فایل‌های ملکی' })

  const load = useCallback(async () => {
    setStatus('loading')
    try {
      const data = await api.admin.listProperties({ ...filters, page_size: 50 })
      setItems(data?.items ?? [])
      setTotal(data?.total ?? 0)
      setError(null)
      setStatus('ready')
    } catch (err) {
      setError(err)
      setStatus('error')
    }
  }, [filters])

  useEffect(() => {
    const timer = setTimeout(load, 250)
    return () => clearTimeout(timer)
  }, [load])

  const togglePublish = async (property) => {
    setBusyId(property.id)
    setMessage('')
    try {
      const detail = await api.admin.getProperty(property.id)
      await api.admin.updateProperty(property.id, {
        ...toPropertyPayload(detail),
        published: !detail.published,
      })
      setMessage(
        detail.published
          ? 'ملک از حالت انتشار خارج شد و در سایت نمایش داده نمی‌شود.'
          : 'ملک منتشر شد و در سایت نمایش داده می‌شود.'
      )
      await load()
    } catch (err) {
      setMessage(err.message)
    } finally {
      setBusyId(null)
    }
  }

  const remove = async (property) => {
    const confirmed = window.confirm(
      `«${property.title_fa}» برای همیشه حذف شود؟ این کار قابل بازگشت نیست.`
    )
    if (!confirmed) return
    setBusyId(property.id)
    setMessage('')
    try {
      await api.admin.deleteProperty(property.id)
      setMessage('ملک حذف شد.')
      await load()
    } catch (err) {
      setMessage(err.message)
    } finally {
      setBusyId(null)
    }
  }

  return (
    <>
      <div className="admin-toolbar">
        <div>
          <p className="eyebrow">Properties</p>
          <h1 className="title-md" style={{ marginTop: 8 }}>
            فایل‌های ملکی ({faNumber(total)})
          </h1>
        </div>
        <Link className="btn btn--emerald btn--sm" to="/admin/properties/new">
          افزودن ملک
        </Link>
      </div>

      <div className="admin-toolbar__filters" style={{ marginBottom: 18 }}>
        <input
          className="input"
          placeholder="جست‌وجو در عنوان یا محله"
          value={filters.q}
          onChange={(event) => setFilters({ ...filters, q: event.target.value })}
          aria-label="جست‌وجوی فایل‌ها"
        />
        <select
          className="select"
          value={filters.status}
          onChange={(event) => setFilters({ ...filters, status: event.target.value })}
          aria-label="وضعیت انتشار"
        >
          <option value="">همه وضعیت‌ها</option>
          <option value="published">منتشرشده</option>
          <option value="draft">پیش‌نویس</option>
          <option value="featured">منتخب</option>
        </select>
      </div>

      {message ? <Alert kind="success">{message}</Alert> : null}

      {status === 'loading' ? (
        <LoadingState label="در حال بارگذاری فایل‌ها…" />
      ) : status === 'error' ? (
        <ErrorState message={error?.message} onRetry={load} />
      ) : items.length ? (
        <div className="table-wrap">
          <table className="table">
            <thead>
              <tr>
                <th>عنوان</th>
                <th>نوع معامله</th>
                <th>قیمت</th>
                <th>وضعیت</th>
                <th>آخرین تغییر</th>
                <th>عملیات</th>
              </tr>
            </thead>
            <tbody>
              {items.map((property) => (
                <tr key={property.id}>
                  <td>
                    <Link to={`/admin/properties/${property.id}`}>{property.title_fa}</Link>
                    <div className="field__hint en-sans">{property.slug}</div>
                  </td>
                  <td>{TRANSACTION_LABELS[property.transaction_type] || '—'}</td>
                  <td>{priceLabel(property)}</td>
                  <td>
                    <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                      <span className={`badge ${property.published ? 'badge--published' : 'badge--draft'}`}>
                        {property.published ? 'منتشرشده' : 'پیش‌نویس'}
                      </span>
                      {property.featured ? <span className="badge badge--gold">منتخب</span> : null}
                    </div>
                  </td>
                  <td className="num">{faDate(property.created_at)}</td>
                  <td>
                    <div className="table__actions">
                      <Link
                        className="btn btn--outline btn--sm"
                        to={`/admin/properties/${property.id}`}
                      >
                        ویرایش
                      </Link>
                      <button
                        type="button"
                        className="btn btn--outline btn--sm"
                        onClick={() => togglePublish(property)}
                        disabled={busyId === property.id}
                      >
                        {property.published ? 'لغو انتشار' : 'انتشار'}
                      </button>
                      <button
                        type="button"
                        className="btn btn--outline btn--sm"
                        onClick={() => remove(property)}
                        disabled={busyId === property.id}
                      >
                        حذف
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <div className="state">
          <p className="state__title">فایلی یافت نشد</p>
          <p className="state__text">
            هنوز ملکی ثبت نشده یا فیلترها نتیجه‌ای نداشته‌اند. برای شروع، اولین ملک را اضافه
            کنید.
          </p>
          <Link className="btn btn--emerald btn--sm" to="/admin/properties/new">
            افزودن ملک
          </Link>
        </div>
      )}
    </>
  )
}
