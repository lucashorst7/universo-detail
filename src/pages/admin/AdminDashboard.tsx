import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { supabase } from '../../lib/supabase'

export default function AdminDashboard() {
  const [stats, setStats] = useState({ products: 0, brands: 0, categories: 0, reviews: 0 })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    Promise.all([
      supabase.from('products').select('id', { count: 'exact', head: true }),
      supabase.from('brands').select('id', { count: 'exact', head: true }),
      supabase.from('categories').select('id', { count: 'exact', head: true }),
      supabase.from('customer_reviews').select('id', { count: 'exact', head: true }).eq('is_deleted', false),
    ]).then(([p, b, c, r]) => {
      setStats({ products: p.count || 0, brands: b.count || 0, categories: c.count || 0, reviews: r.count || 0 })
      setLoading(false)
    })
  }, [])

  if (loading) return <div className="page-loading">Carregando...</div>

  return (
    <div className="admin-page">
      <h1>Dashboard</h1>
      <div className="admin-stats">
        <Link to="/admin/produtos" className="admin-stat-card"><span className="admin-stat-num">{stats.products}</span><span className="admin-stat-label">Produtos</span></Link>
        <Link to="/admin/marcas" className="admin-stat-card"><span className="admin-stat-num">{stats.brands}</span><span className="admin-stat-label">Marcas</span></Link>
        <Link to="/admin/categorias" className="admin-stat-card"><span className="admin-stat-num">{stats.categories}</span><span className="admin-stat-label">Categorias</span></Link>
        <Link to="/admin/reviews" className="admin-stat-card"><span className="admin-stat-num">{stats.reviews}</span><span className="admin-stat-label">Reviews</span></Link>
      </div>
    </div>
  )
}
