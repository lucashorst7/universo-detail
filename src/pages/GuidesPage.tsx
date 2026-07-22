import { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { fetchGuides, fetchGuideBySlug, fetchGuideProducts } from '../lib/queries'
import type { Guide, GuideProduct } from '../lib/supabase'
import ProductCard from '../components/ProductCard'
import { ArrowLeft } from '@phosphor-icons/react'

export default function GuidesPage() {
  const { slug } = useParams<{ slug: string }>()
  const [guides, setGuides] = useState<Guide[]>([])
  const [activeGuide, setActiveGuide] = useState<Guide | null>(null)
  const [products, setProducts] = useState<GuideProduct[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => { fetchGuides().then(setGuides).finally(() => setLoading(false)) }, [])
  useEffect(() => {
    if (!slug) { setActiveGuide(null); return }
    fetchGuideBySlug(slug).then(async (g) => { setActiveGuide(g); if (g) { const gps = await fetchGuideProducts(g.id); setProducts(gps as GuideProduct[]) } })
  }, [slug])

  if (loading) return <div className="page-loading">Carregando...</div>

  if (slug && activeGuide) {
    return (
      <div className="container page">
        <Link to="/guias" className="back-link"><ArrowLeft size={16} /> Guias</Link>
        <div className="page-header"><div><h1>{activeGuide.title}</h1>{activeGuide.description && <p className="page-subtitle">{activeGuide.description}</p>}</div></div>
        {products.length > 0 && (
          <div className="product-grid">
            {products.map((gp) => gp.products && (<div key={gp.id}>{gp.match_label && <div className="guide-match-label">{gp.match_label}</div>}<ProductCard product={gp.products} /></div>))}
          </div>
        )}
      </div>
    )
  }

  return (
    <div className="container page">
      <div className="page-header"><div><h1>Guias</h1><p className="page-subtitle">Tutoriais para te ajudar a escolher certo</p></div></div>
      <div className="guide-grid">
        {guides.map((g) => (
          <Link key={g.id} to={`/guias/${g.slug}`} className="guide-card">
            <h3>{g.title}</h3>
            {g.description && <p>{g.description}</p>}
            <span className="guide-link">Ler guia →</span>
          </Link>
        ))}
      </div>
    </div>
  )
}
