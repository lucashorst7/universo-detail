import { useEffect, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import { ArrowRight, Package, Tag, Users } from 'lucide-react'
import { fetchCategories, fetchProducts, fetchBrands, fetchSiteCounts } from '../lib/queries'
import { ProductCard } from '../components/ProductCard'
import { Spinner } from '../components/Feedback'
import type { Category, Brand, ProductWithRelations } from '../types/database'
import './home.css'

export function HomePage() {
  const [categories, setCategories] = useState<Category[]>([])
  const [brands, setBrands] = useState<Brand[]>([])
  const [products, setProducts] = useState<ProductWithRelations[]>([])
  const [counts, setCounts] = useState({ products: 0, brands: 0, users: 0 })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    Promise.all([fetchCategories(), fetchProducts(), fetchBrands(), fetchSiteCounts()])
      .then(([c, p, b, cnt]) => {
        setCategories(c)
        setProducts(p)
        setBrands(b)
        setCounts(cnt)
        setLoading(false)
      })
      .catch(() => setLoading(false))
  }, [])

  if (loading) return <Spinner label="Carregando catálogo..." />

  const featured = products.filter((p) => p.is_featured).slice(0, 8)
  const featuredToShow = featured.length > 0 ? featured : products.slice(0, 8)
  const novidades = products.filter((p) => p.is_new).slice(0, 4)
  const novidadesToShow = novidades.length > 0 ? novidades : products.slice(0, 4)

  return (
    <div className="home">
      <section className="hero">
        <video
          className="hero-video"
          autoPlay
          loop
          muted
          playsInline
        >
          <source
            src="https://videos.pexels.com/video-files/6873168/6873168-hd_1920_1080_25fps.mp4"
            type="video/mp4"
          />
        </video>
        <div className="hero-overlay" />
        <div className="container hero-content">
          <h1 className="hero-title">Universo Detail</h1>
          <p className="hero-tagline">A biblioteca de produtos para estética automotiva</p>
          <div className="hero-stats">
            <div className="hero-stat">
              <Package size={24} className="hero-stat-icon" />
              <AnimatedCounter target={counts.products} />
              <span className="hero-stat-label">Produtos Cadastrados</span>
            </div>
            <div className="hero-stat">
              <Tag size={24} className="hero-stat-icon" />
              <AnimatedCounter target={counts.brands} />
              <span className="hero-stat-label">Marcas Cadastradas</span>
            </div>
            <div className="hero-stat">
              <Users size={24} className="hero-stat-icon" />
              <AnimatedCounter target={counts.users} />
              <span className="hero-stat-label">Usuários Registrados</span>
            </div>
          </div>
        </div>
      </section>

      <section className="container home-section">
        <div className="section-head">
          <h2>Categorias</h2>
          <Link to="/produtos" className="section-link">Ver tudo <ArrowRight size={16} /></Link>
        </div>
        <div className="cat-grid">
          {categories.slice(0, 8).map((c) => (
            <Link key={c.id} to={`/categoria/${c.slug}`} className="cat-card">
              {c.icon && <span className="cat-card-icon">{c.icon}</span>}
              <span className="cat-card-name">{c.name}</span>
            </Link>
          ))}
        </div>
      </section>

      <section className="container home-section">
        <div className="section-head">
          <h2>Destaques</h2>
          <Link to="/produtos" className="section-link">Ver tudo <ArrowRight size={16} /></Link>
        </div>
        <div className="product-grid">
          {featuredToShow.map((p) => <ProductCard key={p.id} product={p} />)}
        </div>
      </section>

      <section className="container home-section">
        <div className="section-head">
          <h2>Novidades</h2>
          <Link to="/produtos" className="section-link">Ver tudo <ArrowRight size={16} /></Link>
        </div>
        <div className="product-grid">
          {novidadesToShow.map((p) => <ProductCard key={p.id} product={p} />)}
        </div>
      </section>

      <section className="container home-section">
        <div className="section-head">
          <h2>Marcas</h2>
          <Link to="/marcas" className="section-link">Ver tudo <ArrowRight size={16} /></Link>
        </div>
        <div className="brand-strip">
          {brands.slice(0, 8).map((b) => (
            <Link key={b.id} to={`/marca/${b.slug}`} className="brand-chip">{b.name}</Link>
          ))}
        </div>
      </section>
    </div>
  )
}

function AnimatedCounter({ target }: { target: number }) {
  const [display, setDisplay] = useState(0)
  const ref = useRef<HTMLSpanElement>(null)

  useEffect(() => {
    setDisplay(0)
    if (target === 0) return
    let start: number | null = null
    const duration = 1200
    let raf: number
    function step(ts: number) {
      if (start === null) start = ts
      const progress = Math.min((ts - start) / duration, 1)
      setDisplay(Math.floor(progress * target))
      if (progress < 1) raf = requestAnimationFrame(step)
      else setDisplay(target)
    }
    raf = requestAnimationFrame(step)
    return () => cancelAnimationFrame(raf)
  }, [target])

  return <span className="hero-stat-value" ref={ref}>{display}</span>
}
