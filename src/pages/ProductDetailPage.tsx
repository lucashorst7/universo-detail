import { useEffect, useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import { fetchProductBySlug, fetchReviewsByProduct } from '../lib/queries'
import { Spinner, ErrorState, EmptyState } from '../components/Feedback'
import { Rating } from '../components/Badge'
import { TechSpecsDisplay } from '../components/TechSpecsDisplay'
import { getCategorySpec, getFieldsForCategoryAndSubtype } from '../lib/categorySpecs'
import { useAuth } from '../lib/auth'
import { supabase } from '../lib/supabase'
import type { ProductWithRelations, CustomerReview } from '../types/database'
import './product-detail.css'

export function ProductDetailPage() {
  const { slug } = useParams()
  const [product, setProduct] = useState<ProductWithRelations | null>(null)
  const [reviews, setReviews] = useState<CustomerReview[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const { session, profile, emailVerified } = useAuth()

  useEffect(() => {
    if (!slug) return
    setLoading(true); setError('')
    fetchProductBySlug(slug).then(async (p) => {
      if (!p) { setError('Produto não encontrado'); setLoading(false); return }
      setProduct(p)
      const r = await fetchReviewsByProduct(p.id)
      setReviews(r); setLoading(false)
    })
  }, [slug])

  if (loading) return <Spinner label="Carregando produto..." />
  if (error) return <div className="container" style={{ padding: '40px' }}><ErrorState message={error} /></div>
  if (!product) return null

  const avg = reviews.length ? reviews.reduce((s, r) => s + r.rating, 0) / reviews.length : 0
  const categorySlug = product.category?.slug ?? ''
  const categorySpec = categorySlug ? getCategorySpec(categorySlug) : null
  const techSpecs = (product.technical_specs as Record<string, unknown>) ?? {}
  const subtype = (techSpecs.product_subtype as string) ?? undefined
  const productType = (techSpecs.product_type as string) ?? undefined
  const visibleFields = categorySpec ? getFieldsForCategoryAndSubtype(categorySlug, subtype, productType) : []

  return (
    <div className="container product-detail">
      <nav className="breadcrumb">
        <Link to="/">Início</Link><span>/</span><Link to="/produtos">Produtos</Link>
        {product.category && <><span>/</span><Link to={`/categoria/${product.category.slug}`}>{product.category.name}</Link></>}
        <span>/</span><span className="breadcrumb-current">{product.name}</span>
      </nav>
      <div className="product-detail-grid">
        <div className="product-detail-img">
          {product.image_url ? <img src={product.image_url} alt={product.name} /> : <div className="product-detail-img-placeholder">Sem imagem</div>}
        </div>
        <div className="product-detail-info">
          {product.category && <span className="product-detail-cat">{product.category.name}</span>}
          <h1>{product.name}</h1>
          {product.brand && <Link to={`/marca/${product.brand.slug}`} className="product-detail-brand">{product.brand.name}</Link>}
          {reviews.length > 0 && <Rating value={avg} count={reviews.length} size={18} />}
          {product.short_description && <p className="product-detail-short">{product.short_description}</p>}
          {product.description && <p className="product-detail-desc">{product.description}</p>}
        </div>
      </div>
      {categorySpec && <TechSpecsDisplay fields={visibleFields} specs={techSpecs} volumetries={product.volumetries} subtypeLabel={categorySpec.subtypeLabel} subtype={subtype} />}
      <section className="product-reviews">
        <h2>Avaliações ({reviews.length})</h2>
        <ReviewForm productId={product.id} loggedIn={Boolean(session)} emailVerified={emailVerified} displayName={profile?.display_name ?? ''} onSubmitted={(r) => setReviews([r, ...reviews])} />
        {reviews.length === 0 ? (
          <EmptyState title="Sem avaliações" message="Este produto ainda não possui avaliações." />
        ) : (
          <div className="reviews-list">
            {reviews.map((r) => (
              <div key={r.id} className="review-card">
                <div className="review-head"><Rating value={r.rating} size={14} /><span className="review-author">{r.author_name}</span></div>
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

interface ReviewFormProps { productId: string; loggedIn: boolean; emailVerified: boolean; displayName: string; onSubmitted: (r: CustomerReview) => void }

function ReviewForm({ productId, loggedIn, emailVerified, displayName, onSubmitted }: ReviewFormProps) {
  const [rating, setRating] = useState(5)
  const [title, setTitle] = useState('')
  const [comment, setComment] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')

  if (!loggedIn) {
    return (<div className="review-gate"><p>Para deixar uma avaliação, você precisa estar logado.</p><Link to="/login" className="btn btn-outline">Entrar</Link><span style={{ fontSize: 13, color: 'var(--color-text-3)' }}>ou <Link to="/cadastro" style={{ color: 'var(--color-primary)', fontWeight: 600 }}>criar conta</Link></span></div>)
  }
  if (!emailVerified) {
    return (<div className="review-gate"><p>Confirme seu e-mail para deixar avaliações.</p><Link to="/verificar-email" className="btn btn-outline">Verificar e-mail</Link></div>)
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!comment.trim()) return
    setSubmitting(true); setError('')
    const { data, error } = await supabase.from('customer_reviews').insert({ product_id: productId, rating, title: title.trim() || null, comment: comment.trim(), author_name: displayName }).select('*').single()
    setSubmitting(false)
    if (error) { setError(error.message); return }
    onSubmitted(data as CustomerReview)
    setTitle(''); setComment(''); setRating(5)
  }

  return (
    <form className="review-form" onSubmit={handleSubmit}>
      {error && <div className="auth-error" style={{ marginBottom: 8 }}>{error}</div>}
      <div className="review-form-rating">
        <span style={{ fontSize: 13, color: 'var(--color-text-2)', fontWeight: 600 }}>Nota</span>
        {[1, 2, 3, 4, 5].map((n) => (
          <button key={n} type="button" onClick={() => setRating(n)} className="review-star-btn" aria-label={`${n} estrelas`}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill={n <= rating ? 'var(--color-primary)' : 'none'} stroke={n <= rating ? 'var(--color-primary)' : 'var(--color-text-3)'} strokeWidth="2"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" /></svg>
          </button>
        ))}
      </div>
      <input type="text" value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Título (opcional)" className="review-form-input" />
      <textarea value={comment} onChange={(e) => setComment(e.target.value)} placeholder="Escreva sua avaliação..." rows={3} className="review-form-input" required />
      <button type="submit" className="btn btn-primary" disabled={submitting}>{submitting ? 'Enviando...' : 'Enviar avaliação'}</button>
    </form>
  )
}
