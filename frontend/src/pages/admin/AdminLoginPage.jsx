import { useState } from 'react'
import { Navigate, useLocation, useNavigate } from 'react-router-dom'

import { useAuth } from '../../auth.jsx'
import { Alert, LoadingState } from '../../components/Feedback.jsx'
import { useSeo } from '../../seo.js'

export default function AdminLoginPage() {
  const { user, loading, login } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const [form, setForm] = useState({ email: '', password: '' })
  const [error, setError] = useState('')
  const [busy, setBusy] = useState(false)

  useSeo({ title: 'ورود مدیران' })

  if (loading) {
    return (
      <div className="login-shell">
        <LoadingState label="در حال بررسی نشست…" />
      </div>
    )
  }

  if (user) {
    return <Navigate to={location.state?.from || '/admin'} replace />
  }

  const submit = async (event) => {
    event.preventDefault()
    setBusy(true)
    setError('')
    try {
      await login(form.email.trim(), form.password)
      navigate(location.state?.from || '/admin', { replace: true })
    } catch (err) {
      setError(err.message)
    } finally {
      setBusy(false)
    }
  }

  return (
    <div className="login-shell">
      <div className="login-card">
        <p className="eyebrow">JAVID REAL ESTATE</p>
        <h1 className="title-md" style={{ margin: '10px 0 6px' }}>
          ورود به پنل مدیریت
        </h1>
        <p className="field__hint" style={{ marginBottom: 22 }}>
          این بخش مخصوص مدیران املاک جاوید است. تنها حساب‌های مجاز می‌توانند وارد شوند.
        </p>

        <Alert kind="error">{error}</Alert>

        <form onSubmit={submit} noValidate>
          <div className="field">
            <label className="field__label" htmlFor="admin-email">
              ایمیل
            </label>
            <input
              id="admin-email"
              className="input en-sans"
              type="email"
              value={form.email}
              onChange={(event) => setForm({ ...form, email: event.target.value })}
              autoComplete="username"
              required
            />
          </div>

          <div className="field">
            <label className="field__label" htmlFor="admin-password">
              رمز عبور
            </label>
            <input
              id="admin-password"
              className="input en-sans"
              type="password"
              value={form.password}
              onChange={(event) => setForm({ ...form, password: event.target.value })}
              autoComplete="current-password"
              required
            />
          </div>

          <button type="submit" className="btn btn--emerald btn--block" disabled={busy}>
            {busy ? 'در حال ورود…' : 'ورود'}
          </button>
        </form>
      </div>
    </div>
  )
}
