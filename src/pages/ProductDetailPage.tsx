import { useEffect, useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import { fetchProductBySlug, fetchReviewsByProduct } from '../lib/queries'
import { Spinner, ErrorState, EmptyState } from '../components/Feedback'
import { Rating } from '../components/Badge'
import type { ProductWithRelations, CustomerReview } from '../types/database'
import './product-detail.css'

export function ProductDetailPage() {
  const { slug } = useParams()
  const [product, setProduct] = useState<ProductWithRelations | null>(null)
  const [reviews, setReviews] = useState<CustomerReview[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    if (!slug) return
    setLoading(true)
    setError('')
    fetchProductBySlug(slug).then(async (p) => {
      if (!p) { setError('Produto não encontrado'); setLoading(false); return }
      setProduct(p)
      const r = await fetchReviewsByProduct(p.id)
      setReviews(r)
      setLoading(false)
    })
  }, [slug])

  if (loading) return <Spinner label="Carregando produto..." />
  if (error) return <div className="container" style={{ padding: '40px' }}><ErrorState message={error} /></div>
  if (!product) return null

  const avg = reviews.length ? reviews.reduce((s, r) => s + r.rating, 0) / reviews.length : 0

  return (
    <div className="container product-detail">
      <nav className="breadcrumb">
        <Link to="/">Início</Link>
        <span>/</span>
        <Link to="/produtos">Produtos</Link>
        {product.category && <><span>/</span><Link to={`/categoria/${product.category.slug}`}>{product.category.name}</Link></>}
        <span>/</span>
        <span className="breadcrumb-current">{product.name}</span>
      </nav>

      <div className="product-detail-grid">
        <div className="product-detail-img">
          {product.image_url ? (
            <img src={product.image_url} alt={product.name} />
          ) : (
            <div className="product-detail-img-placeholder">Sem imagem</div>
          )}
        </div>
        <div className="product-detail-info">
          {product.category && <span className="product-detail-cat">{product.category.name}</span>}
          <h1>{product.name}</h1>
          {product.brand && (
            <Link to={`/marca/${product.brand.slug}`} className="product-detail-brand">{product.brand.name}</Link>
          )}
          {reviews.length > 0 && <Rating value={avg} count={reviews.length} size={18} />}
          {product.short_description && <p className="product-detail-short">{product.short_description}</p>}
          {product.description && <p className="product-detail-desc">{product.description}</p>}
        </div>
      </div>

      <section className="product-reviews">
        <h2>Avaliações ({reviews.length})</h2>
        {reviews.length === 0 ? (
          <EmptyState title="Sem avaliações" message="Este produto ainda não possui avaliações." />
        ) : (
          <div className="reviews-list">
            {reviews.map((r) => (
              <div key={r.id} className="review-card">
                <div className="review-head">
                  <Rating value={r.rating} size={14} />
                  <span className="review-author">{r.author_name}</span>
                </div>
                {r.title && <h4>{r.title}</h4>}
                <p>{r.comment}</p>
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  )
}
