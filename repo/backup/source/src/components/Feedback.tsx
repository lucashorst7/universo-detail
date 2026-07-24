export function Spinner({ label }: { label?: string }) {
  return (
    <div className="spinner-wrap">
      <div className="spinner" />
      {label && <p className="spinner-label">{label}</p>}
    </div>
  )
}

export function ErrorState({ message, onRetry }: { message: string; onRetry?: () => void }) {
  return (
    <div className="error-state">
      <p>{message}</p>
      {onRetry && <button className="btn btn-outline" onClick={onRetry}>Tentar novamente</button>}
    </div>
  )
}

export function EmptyState({ title, message }: { title: string; message?: string }) {
  return (
    <div className="empty-state">
      <h3>{title}</h3>
      {message && <p>{message}</p>}
    </div>
  )
}
