import { useEffect, useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import { fetchCategoryBySlug, fetchProductsByCategory, fetchBrands } from '../lib/queries'
import type { Category, Product, Brand } from '../lib/supabase'
import ProductCard from '../components/ProductCard'
import { getCategoryIcon } from '../components/categoryIcons'
import { ArrowLeft } from '@phosphor-icons/react'

export default function CategoryPage() {
  const { slug } = useParams<{ slug: string }>()
  const [category, setCategory] = useState<Category | null>(null)
  const [products, setProducts] = useState<Product[]>([])
  const [brands, setBrands] = useState<Brand[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!slug) return
    setLoading(true)
    Promise.all([fetchCategoryBySlug(slug), fetchProductsByCategory(slug), fetchBrands()])
      .then(([cat, prods, brs]) => { setCategory(cat); setProducts(prods); setBrands(brs) })
      .finally(() => setLoading(false))
  }, [slug])

  if (loading) return <div className="page-loading">Carregando...</div>
  if (!category) return <div className="page-loading">Categoria não encontrada</div>
  const Icon = getCategoryIcon(category.icon)

  return (
    <div className="container page">
      <Link to="/" className="back-link"><ArrowLeft size={16} /> Início</Link>
      <div className="page-header">
        <div className="page-header-icon"><Icon size={40} weight="regular" /></div>
        <div>
          <h1>{category.name}</h1>
          {category.description && <p className="page-subtitle">{category.description}</p>}
        </div>
      </div>
      {products.length === 0 ? (
        <p className="empty-state">Nenhum produto nesta categoria ainda.</p>
      ) : (
        <div className="product-grid">
          {products.map((p) => {
            const brand = brands.find((b) => b.id === p.brand_id)
            return <ProductCard key={p.id} product={p} brandName={brand?.name} />
          })}
        </div>
      )}
    </div>
  )
}
