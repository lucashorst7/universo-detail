import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { Package, Tag, FolderTree, Star, Users } from 'lucide-react'
import { supabase, isConfigured } from '../../lib/supabase'
import { Spinner } from '../../components/Feedback'

export function AdminDashboardPage() {
  const [counts, setCounts] = useState({ products: 0, brands: 0, categories: 0, reviews: 0, users: 0 })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!isConfigured) { setLoading(false); return }
    Promise.all([
      supabase.from('products').select('*', { count: 'exact', head: true }),
      supabase.from('brands').select('*', { count: 'exact', head: true }),
      supabase.from('categories').select('*', { count: 'exact', head: true }),
      supabase.from('customer_reviews').select('*', { count: 'exact', head: true }),
      supabase.from('user_profiles').select('*', { count: 'exact', head: true }),
    ])
      .then(([p, b, c, r, u]) => {
        setCounts({ products: p.count ?? 0, brands: b.count ?? 0, categories: c.count ?? 0, reviews: r.count ?? 0, users: u.count ?? 0 })
        setLoading(false)
      })
      .catch(() => setLoading(false))
  }, [])

  if (loading) return <Spinner label="Carregando..." />

  const cards = [
    { label: 'Produtos', value: counts.products, icon: Package, to: '/admin/produtos' },
    { label: 'Marcas', value: counts.brands, icon: Tag, to: '/admin/marcas' },
    { label: 'Categorias', value: counts.categories, icon: FolderTree, to: '/admin/categorias' },
    { label: 'Avaliações', value: counts.reviews, icon: Star, to: '/admin/avaliacoes' },
    { label: 'Membros', value: counts.users, icon: Users, to: '/admin/membros' },
  ]

  return (
    <div>
      <div className="admin-page-head">
        <h1>Dashboard</h1>
        <p>Visão geral do catálogo</p>
      </div>
      <div className="admin-stats">
        {cards.map((c) => (
          <Link key={c.label} to={c.to} className="admin-stat-card" style={{ textDecoration: 'none' }}>
            <div className="stat-label">{c.label}</div>
            <div className="stat-value">{c.value}</div>
          </Link>
        ))}
      </div>
    </div>
  )
}
