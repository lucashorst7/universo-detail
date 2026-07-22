import { useEffect, useState } from 'react'
import { useSearchParams, Link } from 'react-router-dom'
import { searchProducts } from '../lib/queries'
import type { Product } from '../lib/supabase'
import ProductCard from '../components/ProductCard'
import { MagnifyingGlass } from '@phosphor-icons/react'

export default function SearchPage() {
  const [params] = useSearchParams()
  const query = params.get('q') || ''
  const [results, setResults] = useState<Product[]>([])
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (!query) { setResults([]); return }
    setLoading(true)
    searchProducts(query).then(setResults).finally(() => setLoading(false))
  }, [query])

  return (
    <div className="container page">
      <div className="page-header">
        <div>
          <h1>Busca</h1>
          <p className="page-subtitle">
            {query ? `Resultados para "${query}"` : 'Digite algo para buscar'}
          </p>
        </div>
      </div>

      {loading && <div className="page-loading">Buscando...</div>}

      {!loading && query && results.length === 0 && (
        <p className="empty-state">Nenhum produto encontrado para "{query}".</p>
      )}

      {!loading && results.length > 0 && (
        <div className="product-grid">
          {results.map((p) => (
            <ProductCard key={p.id} product={p} />
          ))}
        </div>
      )}

      {!loading && !query && (
        <div className="empty-state">
          <MagnifyingGlass size={48} weight="regular" />
          <p>Use a barra de busca no topo para encontrar produtos.</p>
        </div>
      )}
    </div>
  )
}
