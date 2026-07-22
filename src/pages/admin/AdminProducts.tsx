import { useEffect, useState } from 'react'
import { supabase } from '../../lib/supabase'
import type { Product, Brand, Category } from '../../lib/supabase'

export default function AdminProducts() {
  const [products, setProducts] = useState<Product[]>([])
  const [brands, setBrands] = useState<Brand[]>([])
  const [categories, setCategories] = useState<Category[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')

  useEffect(() => {
    Promise.all([
      supabase.from('products').select('*').order('created_at', { ascending: false }).limit(100),
      supabase.from('brands').select('*').order('name'),
      supabase.from('categories').select('*').order('display_order'),
    ]).then(([p, b, c]) => {
      setProducts(p.data || []); setBrands(b.data || []); setCategories(c.data || [])
      setLoading(false)
    })
  }, [])

  const filtered = products.filter((p) => p.name.toLowerCase().includes(search.toLowerCase()))
  const getBrandName = (id: string | null) => brands.find((b) => b.id === id)?.name || '—'
  const getCategoryName = (id: string | null) => categories.find((c) => c.id === id)?.name || '—'

  if (loading) return <div className="page-loading">Carregando...</div>

  return (
    <div className="admin-page">
      <h1>Produtos</h1>
      <input type="text" placeholder="Buscar..." value={search} onChange={(e) => setSearch(e.target.value)} className="form-input admin-search" />
      <div className="admin-table-wrap">
        <table className="admin-table">
          <thead><tr><th>Nome</th><th>Marca</th><th>Categoria</th><th>Status</th><th>Rating</th></tr></thead>
          <tbody>
            {filtered.map((p) => (
              <tr key={p.id}>
                <td>{p.name}</td><td>{getBrandName(p.brand_id)}</td><td>{getCategoryName(p.category_id)}</td>
                <td><span className={`status-badge status-${p.status}`}>{p.status}</span></td>
                <td>{Number(p.rating).toFixed(1)} ({p.review_count})</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
