import { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import { fetchProductsByBrand, fetchBrands } from '../lib/queries'
import { ProductCard } from '../components/ProductCard'
import { Spinner, EmptyState } from '../components/Feedback'
import type { ProductWithRelations, Brand } from '../types/database'
import './products.css'

export function BrandPage() {
  const { slug } = useParams()
  const [products, setProducts] = useState<ProductWithRelations[]>([])
  const [brand, setBrand] = useState<Brand | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!slug) return
    setLoading(true)
    fetchBrands().then((brands) => {
      const b = brands.find((x) => x.slug === slug) ?? null
      setBrand(b)
      fetchProductsByBrand(slug).then((d) => { setProducts(d); setLoading(false) })
    })
  }, [slug])

  if (loading) return <Spinner label="Carregando..." />

  return (
    <div className="container products-page">
      <div className="products-head">
        <h1>{brand?.name ?? 'Marca'}</h1>
        <p>{products.length} {products.length === 1 ? 'produto' : 'produtos'} em nosso catálogo</p>
        {brand?.description && <p style={{ marginTop: 8, color: 'var(--color-text-2)' }}>{brand.description}</p>}
      </div>
      {products.length === 0 ? (
        <EmptyState title="Nenhum produto" message="Esta marca ainda não possui produtos cadastrados em nosso catálogo." />
      ) : (
        <div className="product-grid">
          {products.map((p) => <ProductCard key={p.id} product={p} />)}
        </div>
      )}
    </div>
  )
}
