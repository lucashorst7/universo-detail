import { useEffect, useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import { fetchBrandBySlug, fetchProductsByBrand } from '../lib/queries'
import type { Brand, Product } from '../lib/supabase'
import ProductCard from '../components/ProductCard'
import { ArrowLeft } from '@phosphor-icons/react'

export default function BrandPage() {
  const { slug } = useParams<{ slug: string }>()
  const [brand, setBrand] = useState<Brand | null>(null)
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!slug) return
    setLoading(true)
    Promise.all([fetchBrandBySlug(slug), fetchProductsByBrand(slug)])
      .then(([b, ps]) => { setBrand(b); setProducts(ps) })
      .finally(() => setLoading(false))
  }, [slug])

  if (loading) return <div className="page-loading">Carregando...</div>
  if (!brand) return <div className="page-loading">Marca não encontrada</div>

  return (
    <div className="container page">
      <Link to="/marcas" className="back-link"><ArrowLeft size={16} /> Marcas</Link>
      <div className="page-header">
        <div>
          <h1>{brand.name}</h1>
          {brand.country && <span className="brand-country">{brand.country}</span>}
          {brand.description && <p className="page-subtitle">{brand.description}</p>}
        </div>
        {brand.logo_url && <img src={brand.logo_url} alt={brand.name} className="brand-logo-lg" />}
      </div>
      {products.length === 0 ? <p className="empty-state">Nenhum produto desta marca ainda.</p> : (
        <div className="product-grid">{products.map((p) => <ProductCard key={p.id} product={p} brandName={brand.name} />)}</div>
      )}
    </div>
  )
}
