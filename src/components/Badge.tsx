import { Star } from 'lucide-react'

export function Rating({ value, count, size = 14 }: { value: number; count?: number; size?: number }) {
  return (
    <div className="rating">
      <div className="rating-stars">
        {[1, 2, 3, 4, 5].map((n) => (
          <Star
            key={n}
            size={size}
            className={n <= Math.round(value) ? 'star-filled' : 'star-empty'}
            fill={n <= Math.round(value) ? 'currentColor' : 'none'}
          />
        ))}
      </div>
      <span className="rating-value">{value.toFixed(1)}</span>
      {count !== undefined && <span className="rating-count">({count})</span>}
    </div>
  )
}
