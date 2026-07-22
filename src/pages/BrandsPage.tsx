import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { fetchBrands } from '../lib/queries'
import type { Brand } from '../lib/supabase'

export default function BrandsPage() {
  const [brands, setBrands] = useState<Brand[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchBrands().then(setBrands).finally(() => setLoading(false))
  }, [])

  if (loading) return <div className="page-loading">Carregando...</div>

  return (
    <div className="container page">
      <div className="page-header">
        <div>
          <h1>Marcas</h1>
          <p className="page-subtitle">{brands.length} marcas catalogadas</p>
        </div>
      </div>
      <div className="brand-list">
        {brands.map((b) => (
          <Link key={b.id} to={`/marca/${b.slug}`} className="brand-list-item">
            {b.logo_url ? (
              <img src={b.logo_url} alt={b.name} className="brand-list-logo" />
            ) : (
              <span className="brand-list-name">{b.name}</span>
            )}
            {b.country && <span className="brand-list-country">{b.country}</span>}
          </Link>
        ))}
      </div>
    </div>
  )
}
