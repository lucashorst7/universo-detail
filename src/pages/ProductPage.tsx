import { useEffect, useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import {
  fetchProductBySlug,
  fetchBrands,
  fetchCategories,
  fetchProductReviews,
  fetchProductAffiliateLinks,
} from '../lib/queries'
import type { Product, Brand, Category, CustomerReview, AffiliateLink } from '../lib/supabase'
import StarRating from '../components/StarRating'
import { ArrowLeft, ShoppingBag, Star } from '@phosphor-icons/react'
import { formatPrice, formatDate } from '../lib/queries'

export default function ProductPage() {
  const { slug } = useParams<{ slug: string }>()
  const [product, setProduct] = useState<Product | null>(null)
  const [brand, setBrand] = useState<Brand | null>(null)
  const [category, setCategory] = useState<Category | null>(null)
  const [reviews, setReviews] = useState<CustomerReview[]>([])
  const [links, setLinks] = useState<AffiliateLink[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!slug) return
    setLoading(true)
    fetchProductBySlug(slug).then(async (p) => {
      if (!p) return
      setProduct(p)
      const [brs, cats, revs, lnks] = await Promise.all([
        p.brand_id ? fetchBrands().then((bs) => bs.find((b) => b.id === p.brand_id) || null) : null,
        p.category_id ? fetchCategories().then((cs) => cs.find((c) => c.id === p.category_id) || null) : null,
        fetchProductReviews(p.id),
        fetchProductAffiliateLinks(p.id),
      ])
      setBrand(brs)
      setCategory(cats)
      setReviews(revs as CustomerReview[])
      setLinks(lnks as AffiliateLink[])
    }).finally(() => setLoading(false))
  }, [slug])

  if (loading) return <div className="page-loading">Carregando...</div>
  if (!product) return <div className="page-loading">Produto não encontrado</div>

  const rating = Number(product.rating) || 0

  return (
    <div className="container page">
      <Link to={category ? `/categoria/${category.slug}` : '/'} className="back-link">
        <ArrowLeft size={16} /> {category ? category.name : 'Início'}
      </Link>

      <div className="product-detail">
        <div className="product-detail-image">
          {product.image_url ? (
            <img src={product.image_url} alt={product.name} />
          ) : (
            <div className="product-card-no-image">Sem imagem</div>
          )}
        </div>

        <div className="product-detail-info">
          {brand && (
            <Link to={`/marca/${brand.slug}`} className="product-detail-brand">{brand.name}</Link>
          )}
          <h1>{product.name}</h1>
          {product.short_description && <p className="product-detail-short">{product.short_description}</p>}

          <div className="product-detail-rating">
            <StarRating rating={rating} />
            <span>{rating > 0 ? rating.toFixed(1) : 'Sem avaliações'}</span>
            {product.review_count > 0 && <span className="muted">({product.review_count} avaliações)</span>}
          </div>

          {product.is_new && <span className="badge badge-new">Novo</span>}
          {product.is_featured && <span className="badge badge-featured">Destaque</span>}

          {links.length > 0 && (
            <div className="product-links">
              <h3>Onde comprar</h3>
              {links.map((link) => (
                <a key={link.id} href={link.url} target="_blank" rel="noopener noreferrer" className="buy-link">
                  <ShoppingBag size={18} />
                  <span>{link.marketplace}</span>
                  {link.price !== null && <span className="buy-link-price">{formatPrice(link.price, link.currency)}</span>}
                </a>
              ))}
            </div>
          )}
        </div>
      </div>

      {product.description && (
        <div className="product-section">
          <h2>Descrição</h2>
          <p className="product-description">{product.description}</p>
        </div>
      )}

      {product.specifications && Object.keys(product.specifications).length > 0 && (
        <div className="product-section">
          <h2>Especificações</h2>
          <table className="spec-table">
            <tbody>
              {Object.entries(product.specifications).map(([key, val]) => (
                <tr key={key}>
                  <td className="spec-key">{key}</td>
                  <td className="spec-val">{val}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {product.usability && (
        <div className="product-section">
          <h2>Como usar</h2>
          <p className="product-description">{product.usability}</p>
        </div>
      )}

      {product.tips && (
        <div className="product-section">
          <h2>Dicas</h2>
          <p className="product-description">{product.tips}</p>
        </div>
      )}

      <div className="product-section">
        <h2>Avaliações ({reviews.length})</h2>
        {reviews.length === 0 ? (
          <p className="empty-state">Ainda não há avaliações. Seja o primeiro a avaliar!</p>
        ) : (
          <div className="reviews-list">
            {reviews.map((rev) => (
              <div key={rev.id} className="review-card">
                <div className="review-header">
                  <span className="review-author">{rev.author_name}</span>
                  <StarRating rating={rev.rating} size={14} />
                  <span className="review-date">{formatDate(rev.created_at)}</span>
                </div>
                {rev.title && <h4>{rev.title}</h4>}
                <p>{rev.comment}</p>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
