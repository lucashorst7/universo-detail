import { useEffect, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import { fetchProducts, searchProducts } from '../lib/queries'
import { ProductCard } from '../components/ProductCard'
import { Spinner, EmptyState } from '../components/Feedback'
import type { ProductWithRelations } from '../types/database'
import './products.css'

export function ProductsPage() {
  const [products, setProducts] = useState<ProductWithRelations[]>([])
  const [loading, setLoading] = useState(true)
  const [params] = useSearchParams()
  const q = params.get('q') ?? ''

  useEffect(() => {
    setLoading(true)
    if (q) {
      searchProducts(q).then((d) => { setProducts(d); setLoading(false) })
    } else {
      fetchProducts().then((d) => { setProducts(d); setLoading(false) })
    }
  }, [q])

  if (loading) return <Spinner label="Carregando produtos..." />

  return (
    <div className="container products-page">
      <div className="products-head">
        <h1>{q ? `Resultados para "${q}"` : 'Produtos'}</h1>
        <p>{products.length} {products.length === 1 ? 'produto encontrado' : 'produtos encontrados'} em nosso catálogo</p>
      </div>
      {products.length === 0 ? (
        <EmptyState title="Nenhum produto" message={q ? 'Tente buscar por outro termo.' : 'Ainda não há produtos cadastrados em nosso catálogo.'} />
      ) : (
        <div className="product-grid">
          {products.map((p) => <ProductCard key={p.id} product={p} />)}
        </div>
      )}
    </div>
  )
}
