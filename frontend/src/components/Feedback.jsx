/* Loading / error / empty surfaces used across the public site and admin. */
import { Link } from 'react-router-dom'

export function LoadingState({ label = 'در حال بارگذاری…' }) {
  return (
    <div className="loading-block" role="status">
      <span className="spinner" aria-hidden="true" />
      <span>{label}</span>
    </div>
  )
}

export function ErrorState({ message, onRetry }) {
  return (
    <div className="state" role="alert">
      <p className="state__title">مشکلی پیش آمد</p>
      <p className="state__text">{message || 'ارتباط با سرور برقرار نشد. دوباره تلاش کنید.'}</p>
      {onRetry ? (
        <button type="button" className="btn btn--outline btn--sm" onClick={onRetry}>
          تلاش دوباره
        </button>
      ) : null}
    </div>
  )
}

export function EmptyState({ title, text, actionLabel, actionTo }) {
  return (
    <div className="state">
      <p className="state__title">{title}</p>
      {text ? <p className="state__text">{text}</p> : null}
      {actionLabel && actionTo ? (
        <Link className="btn btn--emerald btn--sm" to={actionTo}>
          {actionLabel}
        </Link>
      ) : null}
    </div>
  )
}

export function Alert({ kind = 'success', children }) {
  if (!children) return null
  return (
    <div className={`alert alert--${kind === 'error' ? 'error' : 'success'}`} role="status">
      {children}
    </div>
  )
}
