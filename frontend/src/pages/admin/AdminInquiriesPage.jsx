import { useCallback, useEffect, useState } from 'react'
import { Link } from 'react-router-dom'

import { api } from '../../api'
import { Alert, ErrorState, LoadingState } from '../../components/Feedback.jsx'
import {
  INQUIRY_KIND_LABELS,
  INQUIRY_STATUS_LABELS,
  faDate,
  telLink,
} from '../../format'
import { useSeo } from '../../seo.js'

export default function AdminInquiriesPage() {
  const [items, setItems] = useState([])
  const [status, setStatus] = useState('loading')
  const [error, setError] = useState(null)
  const [message, setMessage] = useState('')
  const [filters, setFilters] = useState({ kind: '', status: '' })

  useSeo({ title: 'درخواست‌ها' })

  const load = useCallback(async () => {
    setStatus('loading')
    try {
      const data = await api.admin.listInquiries(filters)
      setItems(data?.items ?? [])
      setError(null)
      setStatus('ready')
    } catch (err) {
      setError(err)
      setStatus('error')
    }
  }, [filters])

  useEffect(() => {
    load()
  }, [load])

  const setStatusFor = async (inquiry, nextStatus) => {
    setMessage('')
    try {
      await api.admin.updateInquiry(inquiry.id, nextStatus)
      await load()
    } catch (err) {
      setMessage(err.message)
    }
  }

  const remove = async (inquiry) => {
    const confirmed = window.confirm(`درخواست «${inquiry.name}» حذف شود؟`)
    if (!confirmed) return
    setMessage('')
    try {
      await api.admin.deleteInquiry(inquiry.id)
      setMessage('درخواست حذف شد.')
      await load()
    } catch (err) {
      setMessage(err.message)
    }
  }

  return (
    <>
      <div className="admin-toolbar">
        <div>
          <p className="eyebrow">Inquiries</p>
          <h1 className="title-md" style={{ marginTop: 8 }}>
            درخواست‌های مشتریان
          </h1>
        </div>
        <div className="admin-toolbar__filters">
          <select
            className="select"
            value={filters.kind}
            onChange={(event) => setFilters({ ...filters, kind: event.target.value })}
            aria-label="موضوع درخواست"
          >
            <option value="">همه موضوع‌ها</option>
            {Object.entries(INQUIRY_KIND_LABELS).map(([value, label]) => (
              <option key={value} value={value}>
                {label}
              </option>
            ))}
          </select>
          <select
            className="select"
            value={filters.status}
            onChange={(event) => setFilters({ ...filters, status: event.target.value })}
            aria-label="وضعیت درخواست"
          >
            <option value="">همه وضعیت‌ها</option>
            {Object.entries(INQUIRY_STATUS_LABELS).map(([value, label]) => (
              <option key={value} value={value}>
                {label}
              </option>
            ))}
          </select>
        </div>
      </div>

      {message ? <Alert kind="success">{message}</Alert> : null}

      {status === 'loading' ? (
        <LoadingState label="در حال بارگذاری درخواست‌ها…" />
      ) : status === 'error' ? (
        <ErrorState message={error?.message} onRetry={load} />
      ) : items.length ? (
        <div className="table-wrap">
          <table className="table">
            <thead>
              <tr>
                <th>نام</th>
                <th>تماس</th>
                <th>موضوع</th>
                <th>ملک</th>
                <th>پیام</th>
                <th>وضعیت</th>
                <th>تاریخ</th>
                <th>عملیات</th>
              </tr>
            </thead>
            <tbody>
              {items.map((inquiry) => (
                <tr key={inquiry.id}>
                  <td>{inquiry.name}</td>
                  <td>
                    <a className="en-sans" href={telLink(inquiry.phone)}>
                      {inquiry.phone}
                    </a>
                    {inquiry.email ? (
                      <div className="field__hint en-sans">{inquiry.email}</div>
                    ) : null}
                  </td>
                  <td>{INQUIRY_KIND_LABELS[inquiry.kind] || '—'}</td>
                  <td>
                    {inquiry.property_title ? (
                      <Link to="/admin/properties">{inquiry.property_title}</Link>
                    ) : (
                      '—'
                    )}
                  </td>
                  <td style={{ maxWidth: 280 }}>
                    {inquiry.message ? (
                      <span style={{ whiteSpace: 'pre-line', fontSize: '0.84rem' }}>
                        {inquiry.message}
                      </span>
                    ) : (
                      '—'
                    )}
                  </td>
                  <td>{INQUIRY_STATUS_LABELS[inquiry.status] || '—'}</td>
                  <td className="num">{faDate(inquiry.created_at)}</td>
                  <td>
                    <div className="table__actions">
                      {inquiry.status !== 'read' ? (
                        <button
                          type="button"
                          className="btn btn--outline btn--sm"
                          onClick={() => setStatusFor(inquiry, 'read')}
                        >
                          خوانده‌شده
                        </button>
                      ) : null}
                      {inquiry.status !== 'done' ? (
                        <button
                          type="button"
                          className="btn btn--outline btn--sm"
                          onClick={() => setStatusFor(inquiry, 'done')}
                        >
                          پاسخ داده‌شده
                        </button>
                      ) : null}
                      <button
                        type="button"
                        className="btn btn--outline btn--sm"
                        onClick={() => remove(inquiry)}
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
          <p className="state__title">درخواستی یافت نشد</p>
          <p className="state__text">
            درخواست‌هایی که از فرم‌های سایت ارسال می‌شوند، در این بخش نمایش داده می‌شوند.
          </p>
        </div>
      )}
    </>
  )
}
