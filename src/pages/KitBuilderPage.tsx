import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { fetchCategories, fetchProductsByCategory } from '../lib/queries'
import type { Category, Product } from '../lib/supabase'
import { getCategoryIcon } from '../components/categoryIcons'
import { Plus, Trash, ShoppingCart } from '@phosphor-icons/react'

type KitItem = { product: Product; category: Category }

export default function KitBuilderPage() {
  const [categories, setCategories] = useState<Category[]>([])
  const [products, setProducts] = useState<Record<string, Product[]>>({})
  const [kit, setKit] = useState<KitItem[]>([])
  const [activeCat, setActiveCat] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchCategories().then(async (cats) => {
      setCategories(cats)
      const prodsByCat: Record<string, Product[]> = {}
      for (const c of cats) { prodsByCat[c.slug] = await fetchProductsByCategory(c.slug) }
      setProducts(prodsByCat)
      if (cats.length > 0) setActiveCat(cats[0].slug)
    }).finally(() => setLoading(false))
  }, [])

  function addToKit(product: Product, category: Category) {
    setKit((prev) => prev.some((k) => k.product.id === product.id) ? prev : [...prev, { product, category }])
  }
  function removeFromKit(productId: string) {
    setKit((prev) => prev.filter((k) => k.product.id !== productId))
  }

  if (loading) return <div className="page-loading">Carregando...</div>
  const activeProducts = activeCat ? products[activeCat] || [] : []
  const activeCategory = categories.find((c) => c.slug === activeCat)

  return (
    <div className="container page kit-builder">
      <div className="page-header"><div><h1>Montar Kit</h1><p className="page-subtitle">Monte seu kit de detalhamento escolhendo produtos por categoria</p></div></div>
      <div className="kit-layout">
        <div className="kit-selector">
          <div className="kit-cat-tabs">
            {categories.map((c) => {
              const Icon = getCategoryIcon(c.icon)
              return (
                <button key={c.id} className={`kit-cat-tab${activeCat === c.slug ? ' active' : ''}`} onClick={() => setActiveCat(c.slug)}>
                  <Icon size={18} weight="regular" /><span>{c.name}</span>
                </button>
              )
            })}
          </div>
          <div className="kit-products">
            {activeProducts.length === 0 ? <p className="empty-state">Nenhum produto nesta categoria.</p> : (
              <div className="kit-product-list">
                {activeProducts.map((p) => {
                  const inKit = kit.some((k) => k.product.id === p.id)
                  return (
                    <div key={p.id} className="kit-product-item">
                      {p.image_url && <img src={p.image_url} alt={p.name} className="kit-product-thumb" />}
                      <div className="kit-product-info">
                        <span className="kit-product-name">{p.name}</span>
                        {p.short_description && <span className="kit-product-desc">{p.short_description}</span>}
                      </div>
                      <button className={`btn-sm ${inKit ? 'btn-secondary' : 'btn-primary'}`} onClick={() => activeCategory && addToKit(p, activeCategory)} disabled={inKit}>
                        {inKit ? 'Adicionado' : <><Plus size={14} /> Adicionar</>}
                      </button>
                    </div>
                  )
                })}
              </div>
            )}
          </div>
        </div>
        <div className="kit-summary">
          <h2>Meu Kit ({kit.length})</h2>
          {kit.length === 0 ? <p className="empty-state">Seu kit está vazio. Adicione produtos das categorias.</p> : (
            <>
              <div className="kit-summary-list">
                {kit.map((item) => (
                  <div key={item.product.id} className="kit-summary-item">
                    <div className="kit-summary-info">
                      <span className="kit-summary-cat">{item.category.name}</span>
                      <span className="kit-summary-name">{item.product.name}</span>
                    </div>
                    <button onClick={() => removeFromKit(item.product.id)} className="kit-remove-btn"><Trash size={16} /></button>
                  </div>
                ))}
              </div>
              <Link to="/colecoes" className="btn-primary kit-checkout"><ShoppingCart size={18} /> Ver coleções</Link>
            </>
          )}
        </div>
      </div>
    </div>
  )
}
