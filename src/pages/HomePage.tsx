import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { fetchCategories, fetchFeaturedProducts, fetchNewProducts, fetchFeaturedBrands, fetchSpotlight } from '../lib/queries'
import type { Category, Product, Brand } from '../lib/supabase'
import ProductCard from '../components/ProductCard'
import { getCategoryIcon } from '../components/categoryIcons'
import { Package, Tag, UsersThree, Sparkle } from '@phosphor-icons/react'

type SpotlightData = { product_id: string; editorial_text: string | null; products: Product | null }

export default function HomePage() {
  const [categories, setCategories] = useState<Category[]>([])
  const [featured, setFeatured] = useState<Product[]>([])
  const [newProducts, setNewProducts] = useState<Product[]>([])
  const [brands, setBrands] = useState<Brand[]>([])
  const [spotlight, setSpotlight] = useState<SpotlightData | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    Promise.all([fetchCategories(), fetchFeaturedProducts(8), fetchNewProducts(4), fetchFeaturedBrands(), fetchSpotlight()])
      .then(([cats, feat, news, brs, spot]) => {
        setCategories(cats); setFeatured(feat); setNewProducts(news); setBrands(brs); setSpotlight(spot as SpotlightData | null)
      })
      .finally(() => setLoading(false))
  }, [])

  if (loading) return <div className="page-loading">Carregando...</div>

  return (
    <div className="home-page">
      <section className="hero">
        <div className="hero-content">
          <h1 className="hero-title">Estética automotiva sem mistério</h1>
          <p className="hero-subtitle">Reviews honestas, guias práticos e kits recomendados. Tudo que você precisa para cuidar do seu carro.</p>
          <div className="hero-stats">
            <div className="hero-stat"><Package size={28} weight="regular" className="hero-stat-icon" /><span className="hero-stat-num">100+</span><span className="hero-stat-label">Produtos</span></div>
            <div className="hero-stat"><Tag size={28} weight="regular" className="hero-stat-icon" /><span className="hero-stat-num">29+</span><span className="hero-stat-label">Marcas</span></div>
            <div className="hero-stat"><UsersThree size={28} weight="regular" className="hero-stat-icon" /><span className="hero-stat-num">8</span><span className="hero-stat-label">Categorias</span></div>
          </div>
        </div>
      </section>

      <section className="container section">
        <div className="section-header"><h2>Categorias</h2><Link to="/busca" className="section-link">Ver tudo →</Link></div>
        <div className="cat-grid">
          {categories.map((cat) => {
            const Icon = getCategoryIcon(cat.icon)
            return (
              <Link key={cat.id} to={`/categoria/${cat.slug}`} className="cat-card">
                <div className="cat-card-icon-wrap"><Icon size={32} weight="regular" className="cat-card-icon" /></div>
                <span className="cat-card-name">{cat.name}</span>
                {cat.description && <span className="cat-card-desc">{cat.description}</span>}
              </Link>
            )
          })}
        </div>
      </section>

      {spotlight?.products && (
        <section className="container section">
          <div className="section-header"><h2>Destaque da semana</h2></div>
          <div className="spotlight-card">
            <div className="spotlight-image">{spotlight.products.image_url && <img src={spotlight.products.image_url} alt={spotlight.products.name} />}</div>
            <div className="spotlight-body">
              <div className="spotlight-badge"><Sparkle size={16} weight="fill" /> Escolha do editor</div>
              <h3>{spotlight.products.name}</h3>
              {spotlight.editorial_text && <p>{spotlight.editorial_text}</p>}
              <Link to={`/produto/${spotlight.products.slug}`} className="btn-primary">Ver produto</Link>
            </div>
          </div>
        </section>
      )}

      {featured.length > 0 && (
        <section className="container section">
          <div className="section-header"><h2>Produtos em destaque</h2></div>
          <div className="product-grid">{featured.map((p) => <ProductCard key={p.id} product={p} />)}</div>
        </section>
      )}

      {newProducts.length > 0 && (
        <section className="container section">
          <div className="section-header"><h2>Novidades</h2></div>
          <div className="product-grid">{newProducts.map((p) => <ProductCard key={p.id} product={p} />)}</div>
        </section>
      )}

      {brands.length > 0 && (
        <section className="container section">
          <div className="section-header"><h2>Marcas em destaque</h2><Link to="/marcas" className="section-link">Ver tudo →</Link></div>
          <div className="brand-grid">
            {brands.map((b) => (
              <Link key={b.id} to={`/marca/${b.slug}`} className="brand-chip">
                {b.logo_url ? <img src={b.logo_url} alt={b.name} className="brand-chip-logo" /> : <span className="brand-chip-name">{b.name}</span>}
              </Link>
            ))}
          </div>
        </section>
      )}
    </div>
  )
}
