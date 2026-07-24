import { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import { fetchProductsByCategory } from '../lib/queries'
import { ProductCard } from '../components/ProductCard'
import { Spinner, EmptyState } from '../components/Feedback'
import type { ProductWithRelations } from '../types/database'
import './products.css'

export function CategoryPage() {
  const { slug } = useParams()
  const [products, setProducts] = useState<ProductWithRelations[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!slug) return
    setLoading(true)
    fetchProductsByCategory(slug).then((d) => { setProducts(d); setLoading(false) })
  }, [slug])

  if (loading) return <Spinner label="Carregando..." />

  return (
    <div className="container products-page">
      <div className="products-head">
        <h1>Categoria</h1>
        <p>{products.length} {products.length === 1 ? 'produto' : 'produtos'} em nosso catálogo</p>
      </div>
      {products.length === 0 ? (
        <EmptyState title="Nenhum produto" message="Nenhum produto encontrado nesta categoria." />
      ) : (
        <div className="product-grid">
          {products.map((p) => <ProductCard key={p.id} product={p} />)}
        </div>
      )}
    </div>
  )
}
