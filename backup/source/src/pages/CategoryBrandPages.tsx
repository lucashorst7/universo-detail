import { useEffect, useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import { fetchProducts, fetchCategories, fetchBrands } from '../lib/queries'
import { ProductCard } from '../components/ProductCard'
import { ErrorState, EmptyState, PageLoader } from '../components/Feedback'
import type { Brand, Category, ProductWithRelations } from '../types/database'
import './catalog.css'
export function CategoryPage() {
  const { slug } = useParams()
  const [cat, setCat] = useState<Category | null>(null)
  const [products, setProducts] = useState<ProductWithRelations[]>([])
  const [loading, setLoading] = useState(true)
  const [err, setErr] = useState(false)
  useEffect(() => {
    let active = true
    ;(async () => {
      try { const [all,cats] = await Promise.all([fetchProducts(),fetchCategories()]); if(!active)return; setCat(cats.find(x => x.slug === slug) ?? null); setProducts(all.filter(p => p.category?.slug === slug)) }
      catch { if(active)setErr(true) } finally { if(active)setLoading(false) }
    })()
    return () => { active = false }
  }, [slug])
  if (loading) return <PageLoader />
  if (err || !cat) return <div className="container"><ErrorState /></div>
  return (
    <div className="container catalog">
      <div className="catalog-head"><h1>{cat.name}</h1>{cat.description && <p>{cat.description}</p>}</div>
      {products.length === 0 ? <EmptyState message="Nenhum produto nesta categoria." /> : <div className="product-grid">{products.map(p => <ProductCard key={p.id} product={p} />)}</div>}
    </div>
  )
}
export function BrandPage() {
  const { slug } = useParams()
  const [brand, setBrand] = useState<Brand | null>(null)
  const [products, setProducts] = useState<ProductWithRelations[]>([])
  const [loading, setLoading] = useState(true)
  const [err, setErr] = useState(false)
  useEffect(() => {
    let active = true
    ;(async () => {
      try { const [all,brands] = await Promise.all([fetchProducts(),fetchBrands()]); if(!active)return; setBrand(brands.find(b => b.slug === slug) ?? null); setProducts(all.filter(p => p.brand?.slug === slug)) }
      catch { if(active)setErr(true) } finally { if(active)setLoading(false) }
    })()
    return () => { active = false }
  }, [slug])
  if (loading) return <PageLoader />
  if (err || !brand) return <div className="container"><ErrorState /></div>
  return (
    <div className="container catalog">
      <div className="catalog-head"><h1>{brand.name}</h1>{brand.country && <p>{brand.country}</p>}</div>
      {products.length === 0 ? <EmptyState message="Nenhum produto desta marca." /> : <div className="product-grid">{products.map(p => <ProductCard key={p.id} product={p} />)}</div>}
    </div>
  )
}
export function BrandsListPage() {
  const [brands, setBrands] = useState<Brand[]>([])
  const [loading, setLoading] = useState(true)
  const [err, setErr] = useState(false)
  useEffect(() => {
    let active = true
    fetchBrands().then(b => { if(active)setBrands(b) }).catch(() => { if(active)setErr(true) }).finally(() => { if(active)setLoading(false) })
    return () => { active = false }
  }, [])
  if (loading) return <PageLoader />
  if (err) return <div className="container"><ErrorState /></div>
  return (
    <div className="container catalog">
      <div className="catalog-head"><h1>Marcas</h1><p>{brands.length} marca(s)</p></div>
      <div className="brands-list">{brands.map(b => <Link key={b.id} to={`/marca/${b.slug}`} className="brand-tile">{b.logo_url && <img src={b.logo_url} alt={b.name} />}<strong>{b.name}</strong>{b.country && <span>{b.country}</span>}</Link>)}</div>
    </div>
  )
}
