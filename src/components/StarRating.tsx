import { Star } from '@phosphor-icons/react'

type Props = {
  rating: number
  size?: number
}

export default function StarRating({ rating, size = 16 }: Props) {
  return (
    <div className="star-rating">
      {[1, 2, 3, 4, 5].map((n) => (
        <Star key={n} size={size} weight={n <= Math.round(rating) ? 'fill' : 'regular'} className={n <= Math.round(rating) ? 'star-filled' : 'star-empty'} />
      ))}
    </div>
  )
}
