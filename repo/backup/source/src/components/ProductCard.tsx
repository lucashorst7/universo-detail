import { Link } from 'react-router-dom'
import { Star } from 'lucide-react'
import type { ProductWithRelations } from '../types/database'

export function ProductCard({ product }: { product: ProductWithRelations }) {
  return (
    <Link to={`/produto/${product.slug}`} className="product-card">
      <div className="product-card-img">
        {product.image_url ? (
          <img src={product.image_url} alt={product.name} />
        ) : (
          <div className="product-card-img-placeholder">Sem imagem</div>
        )}
      </div>
      <div className="product-card-body">
        <span className="product-card-cat">{product.category?.name ?? 'Sem categoria'}</span>
        <h3 className="product-card-title">{product.name}</h3>
        <span className="product-card-brand">{product.brand?.name ?? 'Sem marca'}</span>
        <div className="product-card-rating">
          <Star size={14} fill="currentColor" className="star-filled" />
          <span>Sem avaliações</span>
        </div>
      </div>
    </Link>
  )
}
