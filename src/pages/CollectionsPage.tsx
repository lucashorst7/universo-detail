import { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { fetchCollections, fetchCollectionBySlug, fetchCollectionItems } from '../lib/queries'
import type { Collection, CollectionItem } from '../lib/supabase'
import ProductCard from '../components/ProductCard'
import { ArrowLeft } from '@phosphor-icons/react'

export default function CollectionsPage() {
  const { slug } = useParams<{ slug: string }>()
  const [collections, setCollections] = useState<Collection[]>([])
  const [activeCollection, setActiveCollection] = useState<Collection | null>(null)
  const [items, setItems] = useState<CollectionItem[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchCollections().then(setCollections).finally(() => setLoading(false))
  }, [])

  useEffect(() => {
    if (!slug) { setActiveCollection(null); return }
    fetchCollectionBySlug(slug).then(async (col) => {
      setActiveCollection(col)
      if (col) {
        const its = await fetchCollectionItems(col.id)
        setItems(its as CollectionItem[])
      }
    })
  }, [slug])

  if (loading) return <div className="page-loading">Carregando...</div>

  if (slug && activeCollection) {
    return (
      <div className="container page">
        <Link to="/colecoes" className="back-link"><ArrowLeft size={16} /> Coleções</Link>
        <div className="page-header">
          <div>
            <h1>{activeCollection.title}</h1>
            {activeCollection.description && <p className="page-subtitle">{activeCollection.description}</p>}
          </div>
        </div>
        {items.length === 0 ? (
          <p className="empty-state">Nenhum produto nesta coleção.</p>
        ) : (
          <div className="product-grid">
            {items.map((item) => item.products && (
              <div key={item.id}>
                {item.note && <div className="collection-note">{item.note}</div>}
                <ProductCard product={item.products} />
              </div>
            ))}
          </div>
        )}
      </div>
    )
  }

  return (
    <div className="container page">
      <div className="page-header">
        <div>
          <h1>Coleções</h1>
          <p className="page-subtitle">Kits curados para cada necessidade</p>
        </div>
      </div>
      <div className="collection-grid">
        {collections.map((col) => (
          <Link key={col.id} to={`/colecoes/${col.slug}`} className="collection-card">
            <h3>{col.title}</h3>
            {col.description && <p>{col.description}</p>}
            <span className="collection-link">Ver produtos →</span>
          </Link>
        ))}
      </div>
    </div>
  )
}
