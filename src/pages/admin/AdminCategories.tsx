import { useEffect, useState } from 'react'
import { supabase } from '../../lib/supabase'
import type { Category } from '../../lib/supabase'
import { getCategoryIcon } from '../../components/categoryIcons'

export default function AdminCategories() {
  const [categories, setCategories] = useState<Category[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    supabase.from('categories').select('*').order('display_order').then(({ data }) => {
      setCategories(data || [])
      setLoading(false)
    })
  }, [])

  if (loading) return <div className="page-loading">Carregando...</div>

  return (
    <div className="admin-page">
      <h1>Categorias</h1>
      <div className="admin-cat-grid">
        {categories.map((c) => {
          const Icon = getCategoryIcon(c.icon)
          return (
            <div key={c.id} className="admin-cat-card">
              <div className="admin-cat-icon">
                <Icon size={28} weight="regular" />
              </div>
              <div>
                <h3>{c.name}</h3>
                <p>{c.slug}</p>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
