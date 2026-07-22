import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { fetchBrands } from '../lib/queries'
import { Spinner, EmptyState } from '../components/Feedback'
import type { Brand } from '../types/database'
import './products.css'
import './brands.css'

export function BrandsPage() {
  const [brands, setBrands] = useState<Brand[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchBrands().then((d) => { setBrands(d); setLoading(false) })
  }, [])

  if (loading) return <Spinner label="Carregando marcas..." />

  return (
    <div className="container products-page">
      <div className="products-head">
        <h1>Marcas</h1>
        <p>{brands.length} marcas em nosso catálogo</p>
      </div>
      {brands.length === 0 ? (
        <EmptyState title="Nenhuma marca" message="Ainda não há marcas cadastradas em nosso catálogo." />
      ) : (
        <div className="brand-grid">
          {brands.map((b) => (
            <Link key={b.id} to={`/marca/${b.slug}`} className="brand-card">
              <h3>{b.name}</h3>
              {b.country && <span className="brand-country">{b.country}</span>}
              {b.description && <p>{b.description}</p>}
            </Link>
          ))}
        </div>
      )}
    </div>
  )
}
