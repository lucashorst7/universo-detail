import { useEffect, useState } from 'react'
import { Star } from 'lucide-react'
interface Props { productId: string }

export default function ProductRating({ productId }: Props) {
  const [rating, setRating] = useState(0); const [hover, setHover] = useState(0)
  useEffect(() => { try { const map: Record<string, number> = JSON.parse(localStorage.getItem('ratings') ?? '{}'); setRating(map[productId] ?? 0) } catch { setRating(0) } }, [productId])
  const set = (n: number) => { setRating(n); try { const map: Record<string, number> = JSON.parse(localStorage.getItem('ratings') ?? '{}'); map[productId] = n; localStorage.setItem('ratings', JSON.stringify(map)) } catch { /* ignore */ } }
  return (<div className="flex items-center gap-1">{[1,2,3,4,5].map((n) => <button key={n} onMouseEnter={() => setHover(n)} onMouseLeave={() => setHover(0)} onClick={() => set(n)}><Star className={`h-5 w-5 transition-colors ${(hover || rating) >= n ? 'fill-primary-400 text-primary-400' : 'text-neutral-600'}`} /></button>)}</div>)
}
