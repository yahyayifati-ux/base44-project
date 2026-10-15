import { useCallback, useEffect, useState } from 'react'
import { Link } from 'react-router-dom'

import { api } from '../../api'
import { Alert, ErrorState, LoadingState } from '../../components/Feedback.jsx'
import { useSettings } from '../../components/settings.jsx'
import { useSeo } from '../../seo.js'

const CONTACT_FIELDS = [
  ['phone_1', 'تلفن اصلی'],
  ['phone_2', 'تلفن دوم'],
  ['whatsapp', 'شماره واتس‌اپ (با کد کشور، مثلاً 989171234567)'],
  ['office_code', 'کد دفتر'],
  ['email', 'ایمیل'],
  ['address_fa', 'نشانی دفتر'],
  ['hours_fa', 'ساعات کاری (در صورت تمایل)'],
  ['instagram', 'نشانی اینستاگرام (اختیاری)'],
  ['telegram', 'نشانی تلگرام (اختیاری)'],
]

const COPY_FIELDS = [
  ['hero_headline_fa', 'تیتر اصلی صفحه نخست', 'textarea'],
  ['hero_sub_fa', 'توضیح زیر تیتر صفحه نخست', 'textarea'],
  ['about_intro_fa', 'معرفی کوتاه املاک جاوید', 'textarea'],
  ['about_body_fa', 'توضیح کامل درباره ما', 'textarea'],
  ['qeshm_text_fa', 'متن بخش قشم', 'textarea'],
]

const IMAGE_FIELDS = [
  ['hero_image', 'تصویر اصلی صفحه نخست'],
  ['about_image', 'تصویر بخش درباره ما'],
  ['qeshm_image', 'تصویر بخش قشم'],
]

export default function AdminSettingsPage() {
  const { settings: publicSettings } = useSettings()
  const [form, setForm] = useState(null)
  const [status, setStatus] = useState('loading')
  const [error, setError] = useState(null)
  const [message, setMessage] = useState('')
  const [saving, setSaving] = useState(false)
  const [password, setPassword] = useState({ current: '', next: '' })
  const [passwordMessage, setPasswordMessage] = useState('')
  const [passwordError, setPasswordError] = useState('')

  useSeo({ title: 'تنظیمات سایت' })

  const load = useCallback(async () => {
    setStatus('loading')
    try {
      const data = await api.admin.getSettings()
      setForm(data)
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

  const update = (field) => (event) => {
    setForm((previous) => ({ ...previous, [field]: event.target.value }))
  }

  const save = async (event) => {
    event.preventDefault()
    setSaving(true)
    setMessage('')
    try {
      const payload = {}
      Object.keys(form).forEach((key) => {
        if (key !== 'updated_at') payload[key] = form[key]
      })
      const saved = await api.admin.updateSettings(payload)
      setForm(saved)
      setMessage('تنظیمات ذخیره شد. تغییرات در سایت اعمال می‌شود.')
      if (publicSettings) {
        // Reload the shared public settings so header/footer reflect the change.
        window.setTimeout(() => window.location.reload(), 900)
      }
    } catch (err) {
      setMessage(err.message)
    } finally {
      setSaving(false)
    }
  }

  const changePassword = async (event) => {
    event.preventDefault()
    setPasswordMessage('')
    setPasswordError('')
    try {
      const result = await api.admin.changePassword(password.current, password.next)
      setPasswordMessage(result?.message || 'رمز عبور به‌روزرسانی شد.')
      setPassword({ current: '', next: '' })
    } catch (err) {
      setPasswordError(err.message)
    }
  }

  if (status === 'loading') return <LoadingState label="در حال بارگذاری تنظیمات…" />
  if (status === 'error') return <ErrorState message={error?.message} onRetry={load} />
  if (!form) return null

  return (
    <>
      <div className="admin-toolbar">
        <div>
          <p className="eyebrow">Settings</p>
          <h1 className="title-md" style={{ marginTop: 8 }}>
            تنظیمات سایت و اطلاعات تماس
          </h1>
        </div>
        <Link className="btn btn--outline btn--sm" to="/">
          مشاهده سایت
        </Link>
      </div>

      <form onSubmit={save}>
        {message ? (
          <Alert kind={message.includes('ذخیره') ? 'success' : 'error'}>{message}</Alert>
        ) : null}

        <div className="grid-2" style={{ alignItems: 'start' }}>
          <div className="panel">
            <p className="eyebrow">Contact</p>
            <h2 className="title-md" style={{ fontSize: '1.1rem', margin: '10px 0 18px' }}>
              اطلاعات تماس
            </h2>

            {CONTACT_FIELDS.map(([field, label]) => (
              <div className="field" key={field}>
                <label className="field__label" htmlFor={field}>
                  {label}
                </label>
                <input
                  id={field}
                  className="input"
                  value={form[field] ?? ''}
                  onChange={update(field)}
                />
              </div>
            ))}
          </div>

          <div>
            <div className="panel">
              <p className="eyebrow">Content</p>
              <h2 className="title-md" style={{ fontSize: '1.1rem', margin: '10px 0 18px' }}>
                متن‌های سایت
              </h2>

              {COPY_FIELDS.map(([field, label, type]) => (
                <div className="field" key={field}>
                  <label className="field__label" htmlFor={field}>
                    {label}
                  </label>
                  {type === 'textarea' ? (
                    <textarea
                      id={field}
                      className="textarea"
                      value={form[field] ?? ''}
                      onChange={update(field)}
                    />
                  ) : (
                    <input
                      id={field}
                      className="input"
                      value={form[field] ?? ''}
                      onChange={update(field)}
                    />
                  )}
                </div>
              ))}
            </div>

            <div className="panel" style={{ marginTop: 22 }}>
              <p className="eyebrow">Imagery</p>
              <h2 className="title-md" style={{ fontSize: '1.1rem', margin: '10px 0 18px' }}>
                تصاویر بخش‌ها
              </h2>

              {IMAGE_FIELDS.map(([field, label]) => (
                <div className="field" key={field}>
                  <label className="field__label" htmlFor={field}>
                    {label}
                  </label>
                  <input
                    id={field}
                    className="input en-sans"
                    value={form[field] ?? ''}
                    onChange={update(field)}
                    dir="ltr"
                  />
                  {form[field] ? (
                    <img
                      src={form[field]}
                      alt=""
                      style={{
                        marginTop: 10,
                        width: 180,
                        aspectRatio: '4 / 3',
                        objectFit: 'cover',
                        border: '1px solid var(--line)',
                      }}
                    />
                  ) : null}
                </div>
              ))}
            </div>

            <button type="submit" className="btn btn--emerald" style={{ marginTop: 22 }} disabled={saving}>
              {saving ? 'در حال ذخیره…' : 'ذخیره تنظیمات'}
            </button>
          </div>
        </div>
      </form>

      <div className="panel" style={{ marginTop: 34, maxWidth: 560 }}>
        <p className="eyebrow">Security</p>
        <h2 className="title-md" style={{ fontSize: '1.1rem', margin: '10px 0 18px' }}>
          تغییر رمز عبور مدیر
        </h2>

        <Alert kind="success">{passwordMessage}</Alert>
        <Alert kind="error">{passwordError}</Alert>

        <form onSubmit={changePassword}>
          <div className="field">
            <label className="field__label" htmlFor="current_password">
              رمز عبور فعلی
            </label>
            <input
              id="current_password"
              className="input en-sans"
              type="password"
              value={password.current}
              onChange={(event) => setPassword({ ...password, current: event.target.value })}
              autoComplete="current-password"
            />
          </div>

          <div className="field">
            <label className="field__label" htmlFor="new_password">
              رمز عبور جدید (حداقل ۸ نویسه)
            </label>
            <input
              id="new_password"
              className="input en-sans"
              type="password"
              value={password.next}
              onChange={(event) => setPassword({ ...password, next: event.target.value })}
              autoComplete="new-password"
            />
          </div>

          <button
            type="submit"
            className="btn btn--outline btn--sm"
            disabled={password.next.length < 8 || !password.current}
          >
            به‌روزرسانی رمز عبور
          </button>
        </form>
      </div>
    </>
  )
}
