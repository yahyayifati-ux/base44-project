/* Property inquiry form used for property questions, consultation requests and
   the contact page. Submissions are stored by the backend. */
import { useState } from 'react'

import { api } from '../api'
import { Alert } from './Feedback.jsx'

const PERSIAN_DIGITS = '۰۱۲۳۴۵۶۷۸۹'

function digitCount(value) {
  let count = 0
  for (const char of String(value)) {
    if (/[0-9]/.test(char)) count += 1
    else if (PERSIAN_DIGITS.includes(char)) count += 1
  }
  return count
}

export default function InquiryForm({
  kind = 'consultation',
  propertyId = null,
  propertyTitle = '',
  submitLabel = 'ثبت درخواست',
  messagePlaceholder = 'اگر جزئیات بیشتری لازم است بنویسید…',
}) {
  const [form, setForm] = useState({ name: '', phone: '', email: '', message: '' })
  const [errors, setErrors] = useState({})
  const [status, setStatus] = useState({ state: 'idle', message: '' })

  const update = (field) => (event) => {
    setForm((previous) => ({ ...previous, [field]: event.target.value }))
  }

  const validate = () => {
    const next = {}
    if (form.name.trim().length < 2) next.name = 'نام و نام خانوادگی را وارد کنید.'
    if (digitCount(form.phone) < 8) next.phone = 'شماره تماس معتبر وارد کنید.'
    if (form.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email.trim())) {
      next.email = 'قالب ایمیل درست نیست.'
    }
    setErrors(next)
    return Object.keys(next).length === 0
  }

  const submit = async (event) => {
    event.preventDefault()
    if (!validate()) return
    setStatus({ state: 'saving', message: '' })
    try {
      const result = await api.createInquiry({
        kind,
        name: form.name.trim(),
        phone: form.phone.trim(),
        email: form.email.trim(),
        message: form.message.trim(),
        property_id: propertyId,
      })
      setStatus({
        state: 'done',
        message: result?.message || 'درخواست شما ثبت شد.',
      })
      setForm({ name: '', phone: '', email: '', message: '' })
    } catch (error) {
      setStatus({ state: 'error', message: error.message })
    }
  }

  return (
    <form onSubmit={submit} noValidate>
      {propertyTitle ? (
        <p className="field__hint" style={{ marginBottom: 16 }}>
          درخواست درباره: {propertyTitle}
        </p>
      ) : null}

      <Alert kind="success">{status.state === 'done' ? status.message : ''}</Alert>
      <Alert kind="error">{status.state === 'error' ? status.message : ''}</Alert>

      <div className="field-row">
        <div className="field">
          <label className="field__label" htmlFor={`name-${kind}-${propertyId ?? 'x'}`}>
            نام و نام خانوادگی
          </label>
          <input
            id={`name-${kind}-${propertyId ?? 'x'}`}
            className={`input ${errors.name ? 'input--error' : ''}`}
            value={form.name}
            onChange={update('name')}
            autoComplete="name"
          />
          {errors.name ? <span className="field__error">{errors.name}</span> : null}
        </div>

        <div className="field">
          <label className="field__label" htmlFor={`phone-${kind}-${propertyId ?? 'x'}`}>
            شماره تماس
          </label>
          <input
            id={`phone-${kind}-${propertyId ?? 'x'}`}
            className={`input en-sans ${errors.phone ? 'input--error' : ''}`}
            value={form.phone}
            onChange={update('phone')}
            inputMode="tel"
            placeholder="0917 000 0000"
            autoComplete="tel"
          />
          {errors.phone ? <span className="field__error">{errors.phone}</span> : null}
        </div>
      </div>

      <div className="field">
        <label className="field__label" htmlFor={`email-${kind}-${propertyId ?? 'x'}`}>
          ایمیل (اختیاری)
        </label>
        <input
          id={`email-${kind}-${propertyId ?? 'x'}`}
          className={`input en-sans ${errors.email ? 'input--error' : ''}`}
          value={form.email}
          onChange={update('email')}
          type="email"
          autoComplete="email"
        />
        {errors.email ? <span className="field__error">{errors.email}</span> : null}
      </div>

      <div className="field">
        <label className="field__label" htmlFor={`message-${kind}-${propertyId ?? 'x'}`}>
          توضیحات
        </label>
        <textarea
          id={`message-${kind}-${propertyId ?? 'x'}`}
          className="textarea"
          value={form.message}
          onChange={update('message')}
          placeholder={messagePlaceholder}
        />
      </div>

      <button
        type="submit"
        className="btn btn--emerald btn--block"
        disabled={status.state === 'saving'}
      >
        {status.state === 'saving' ? 'در حال ارسال…' : submitLabel}
      </button>
      <p className="field__hint" style={{ marginTop: 10 }}>
        شماره شما فقط برای پاسخ‌گویی درباره همین درخواست استفاده می‌شود.
      </p>
    </form>
  )
}
