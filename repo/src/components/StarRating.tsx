import { Star } from 'lucide-react';
export function StarRating({ rating, reviewCount, size = 16, showCount = true }: { rating: number; reviewCount?: number; size?: number; showCount?: boolean; }) {
  if (!reviewCount || reviewCount === 0) return <span className="text-xs text-gray-500">Sem avaliações</span>;
  return <div className="flex items-center gap-1.5"><div className="flex items-center gap-0.5">{[1,2,3,4,5].map(i => <Star key={i} size={size} className={i <= Math.round(rating) ? 'fill-gold-400 text-gold-400' : 'text-ink-600'} />)}</div><span className="text-sm font-medium text-gold-400">{rating.toFixed(1)}</span>{showCount && <span className="text-xs text-gray-500">({reviewCount})</span>}</div>;
}
