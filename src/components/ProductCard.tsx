import { Link } from 'react-router-dom'
import type { Product } from '../lib/supabase'
import { Star } from '@phosphor-icons/react'

type Props = {
  product: Product
  brandName?: string
}

export default function ProductCard({ product, brandName }: Props) {
  const rating = Number(product.rating) || 0

  return (
    <Link to={`/produto/${product.slug}`} className="product-card">
      <div className="product-card-image">
        {product.image_url ? (
          <img src={product.image_url} alt={product.name} loading="lazy" />
        ) : (
          <div className="product-card-no-image">Sem imagem</div>
        )}
        {product.is_new && <span className="badge badge-new">Novo</span>}
      </div>
      <div className="product-card-body">
        {brandName && <span className="product-card-brand">{brandName}</span>}
        <h3 className="product-card-name">{product.name}</h3>
        {product.short_description && (
          <p className="product-card-desc">{product.short_description}</p>
        )}
        <div className="product-card-footer">
          <div className="product-card-rating">
            <Star size={14} weight="fill" />
            <span>{rating > 0 ? rating.toFixed(1) : '—'}</span>
            {product.review_count > 0 && <span className="muted">({product.review_count})</span>}
          </div>
          <span className="product-card-link">Ver →</span>
        </div>
      </div>
    </Link>
  )
}
