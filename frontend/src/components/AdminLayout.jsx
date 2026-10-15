/* Admin shell: enforces the session, then renders the dashboard chrome. */
import { NavLink, Navigate, Outlet, useLocation, useNavigate } from 'react-router-dom'

import { useAuth } from '../auth.jsx'
import { LoadingState } from './Feedback.jsx'

const LINKS = [
  { to: '/admin', label: 'داشبورد', end: true },
  { to: '/admin/properties', label: 'فایل‌های ملکی' },
  { to: '/admin/inquiries', label: 'درخواست‌ها' },
  { to: '/admin/settings', label: 'تنظیمات سایت' },
]

export default function AdminLayout() {
  const { user, loading, logout } = useAuth()
  const location = useLocation()
  const navigate = useNavigate()

  if (loading) {
    return (
      <div className="admin">
        <LoadingState label="در حال بررسی نشست…" />
      </div>
    )
  }

  if (!user) {
    return <Navigate to="/admin/login" state={{ from: location.pathname }} replace />
  }

  const handleLogout = async () => {
    await logout()
    navigate('/admin/login', { replace: true })
  }

  return (
    <div className="admin">
      <div className="admin-topbar">
        <div className="shell shell--wide">
          <div className="admin-topbar__bar">
            <div style={{ display: 'flex', alignItems: 'center', gap: 22, flexWrap: 'wrap' }}>
              <span className="brand__text">
                <span className="brand__en" style={{ color: 'var(--ivory)' }}>
                  JAVID REAL ESTATE
                </span>
                <span className="brand__fa" style={{ opacity: 0.7 }}>
                  پنل مدیریت
                </span>
              </span>
              <nav className="admin-nav" aria-label="فهرست مدیریت">
                {LINKS.map((link) => (
                  <NavLink
                    key={link.to}
                    to={link.to}
                    end={link.end}
                    className={({ isActive }) =>
                      `admin-nav__link ${isActive ? 'is-active' : ''}`
                    }
                  >
                    {link.label}
                  </NavLink>
                ))}
              </nav>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
              <span className="en-sans" style={{ fontSize: '0.82rem', opacity: 0.72 }}>
                {user.email}
              </span>
              <button type="button" className="btn btn--outline-inverse btn--sm" onClick={handleLogout}>
                خروج
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="admin-body">
        <div className="shell shell--wide">
          <Outlet />
        </div>
      </div>
    </div>
  )
}
