import { useEffect, useState } from 'react'
import { supabase } from '../../lib/supabase'
import type { Brand } from '../../lib/supabase'

export default function AdminBrands() {
  const [brands, setBrands] = useState<Brand[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    supabase.from('brands').select('*').order('name').then(({ data }) => {
      setBrands(data || [])
      setLoading(false)
    })
  }, [])

  if (loading) return <div className="page-loading">Carregando...</div>

  return (
    <div className="admin-page">
      <h1>Marcas</h1>
      <div className="admin-table-wrap">
        <table className="admin-table">
          <thead>
            <tr>
              <th>Nome</th>
              <th>País</th>
              <th>Destaque</th>
            </tr>
          </thead>
          <tbody>
            {brands.map((b) => (
              <tr key={b.id}>
                <td>{b.name}</td>
                <td>{b.country || '—'}</td>
                <td>{b.is_featured ? 'Sim' : 'Não'}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
