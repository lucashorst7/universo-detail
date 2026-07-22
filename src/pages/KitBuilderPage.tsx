import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { Package, Check, Save, Trash2, ShoppingCart, Tag } from 'lucide-react'
import Seo from '../components/Seo'
import Container from '../components/ui/Container'
import ResilientImage from '../components/ui/ResilientImage'
import StarRating from '../components/StarRating'
import { getCategoryIcon } from '../components/categoryIcons'
import { supabase } from '../lib/supabase'
import { fmtBRL } from '../lib/specsCalculations'
import type { Category, ProductCardProduct, AffiliateLink } from '../types'

const STORAGE_KEY = 'papodetailer:kit'

interface KitSelection {
  [categoryId: string]: ProductCardProduct
}

export default function KitBuilderPage() {
  const [categories, setCategories] = useState<Category[]>([])
  const [productsByCategory, setProductsByCategory] = useState<Record<string, ProductCardProduct[]>>({})
  const [pricesByProduct, setPricesByProduct] = useState<Record<string, number | null>>({})
  const [selection, setSelection] = useState<KitSelection>({})
  const [loading, setLoading] = useState(true)
  const [expandedCat, setExpandedCat] = useState<string | null>(null)
  const [saved, setSaved] = useState(false)

  useEffect(() => {
    let mounted = true
    async function load() {
      const { data: cats } = await supabase
        .from('categories')
        .select('*')
        .order('display_order', { ascending: true })
      if (!mounted) return
      const catList = (cats || []) as Category[]
      setCategories(catList)

      // Fetch products for each category (with affiliate links for pricing)
      const promises = catList.map(async (cat) => {
        const { data: prods } = await supabase
          .from('products')
          .select('id, name, slug, short_description, image_url, rating, review_count, is_new, is_featured, variant_label, category_id, brands:brand_id(name), affiliate_links(*)')
          .eq('status', 'published')
          .eq('category_id', cat.id)
          .order('is_featured', { ascending: false })
          .order('rating', { ascending: false })
          .limit(12)

        const list = (prods || []) as unknown as (ProductCardProduct & { affiliate_links?: AffiliateLink[] })[]
        // Extract primary prices
        const priceMap: Record<string, number | null> = {}
        list.forEach(p => {
          const links = p.affiliate_links || []
          const primary = links.find(l => l.is_primary) ?? links[0]
          priceMap[p.id] = primary?.price ?? null
        })
        setPricesByProduct(prev => ({ ...prev, ...priceMap }))
        const { affiliate_links, ...rest } = list[0] || ({} as any)
        const cleanList = list.map(({ affiliate_links, ...rest }) => rest as ProductCardProduct)
        return { categoryId: cat.id, products: cleanList }
      })

      const results = await Promise.all(promises)
      if (!mounted) return
      const map: Record<string, ProductCardProduct[]> = {}
      results.forEach(r => { map[r.categoryId] = r.products })
      setProductsByCategory(map)
      setLoading(false)

      // Load saved kit
      try {
        const raw = localStorage.getItem(STORAGE_KEY)
        if (raw) {
          const savedKit = JSON.parse(raw) as KitSelection
          setSelection(savedKit)
        }
      } catch { /* ignore */ }
    }
    load()
    return () => { mounted = false }
  }, [])

  const total = Object.values(selection).reduce((sum, p) => {
    const price = pricesByProduct[p.id]
    return sum + (price ?? 0)
  }, 0)

  const itemCount = Object.keys(selection).length

  function selectProduct(categoryId: string, product: ProductCardProduct) {
    setSelection(prev => {
      const next = { ...prev }
      if (next[categoryId]?.id === product.id) {
        delete next[categoryId]
      } else {
        next[categoryId] = product
      }
      return next
    })
  }

  function saveKit() {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(selection))
      setSaved(true)
      setTimeout(() => setSaved(false), 3000)
    } catch { /* ignore */ }
  }

  function clearKit() {
    setSelection({})
    try {
      localStorage.removeItem(STORAGE_KEY)
    } catch { /* ignore */ }
  }

  return (
    <>
      <Seo title="Monte seu kit" description="Monte seu kit de detalhamento escolhendo um produto por categoria." />
      <Container className="py-8">
        <div className="flex items-center gap-3 mb-8">
          <Package size={24} className="text-gold-500" />
          <h1 className="text-2xl font-bold text-ink-100">Monte seu kit</h1>
        </div>

        <p className="text-sm text-ink-400 mb-8 max-w-2xl">
          Selecione um produto de cada categoria para montar seu kit de detalhamento personalizado.
          Veja o valor total atualizando em tempo real.
        </p>

        {/* Summary bar */}
        <div className="card-premium rounded-xl p-5 mb-8 sticky top-4 z-20 glass">
          <div className="flex items-center justify-between flex-wrap gap-4">
            <div className="flex items-center gap-6">
              <div>
                <span className="text-xs text-ink-500">Produtos selecionados</span>
                <div className="text-2xl font-bold text-gold-300">{itemCount}</div>
              </div>
              <div>
                <span className="text-xs text-ink-500">Total estimado</span>
                <div className="text-2xl font-bold text-gold-gradient">{fmtBRL(total)}</div>
              </div>
            </div>
            <div className="flex items-center gap-3">
              {saved && (
                <span className="text-sm text-emerald-400 flex items-center gap-1">
                  <Check size={14} /> Kit salvo!
                </span>
              )}
              <button
                onClick={saveKit}
                disabled={itemCount === 0}
                className="btn-gold inline-flex items-center gap-2 px-4 py-2 rounded-lg text-sm disabled:opacity-50"
              >
                <Save size={14} /> Salvar kit
              </button>
              {itemCount > 0 && (
                <button
                  onClick={clearKit}
                  className="inline-flex items-center gap-1 text-xs text-ink-400 hover:text-red-400 transition-colors"
                >
                  <Trash2 size={14} /> Limpar
                </button>
              )}
            </div>
          </div>
        </div>

        {loading ? (
          <div className="space-y-6">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="card-premium rounded-xl p-6 space-y-4">
                <div className="skeleton h-6 w-48 rounded" />
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  {Array.from({ length: 4 }).map((_, j) => (
                    <div key={j} className="skeleton aspect-square rounded-lg" />
                  ))}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="space-y-4">
            {categories.map((cat) => {
              const Icon = getCategoryIcon(cat.icon)
              const catProducts = productsByCategory[cat.id] || []
              const selected = selection[cat.id]
              const isExpanded = expandedCat === cat.id
              return (
                <div key={cat.id} className="card-premium rounded-xl overflow-hidden">
                  <button
                    onClick={() => setExpandedCat(isExpanded ? null : cat.id)}
                    className="w-full flex items-center gap-3 p-5 text-left"
                  >
                    <div className="w-10 h-10 rounded-lg bg-gold-600/10 flex items-center justify-center">
                      <Icon size={20} className="text-gold-500" />
                    </div>
                    <div className="flex-1">
                      <h2 className="text-base font-semibold text-ink-100">{cat.name}</h2>
                      <p className="text-xs text-ink-500">
                        {catProducts.length} produtos {selected && `· ${selected.name}`}
                      </p>
                    </div>
                    {selected ? (
                      <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-gold-600/15 text-gold-400 text-xs">
                        <Check size={12} /> Selecionado
                      </span>
                    ) : (
                      <span className="text-xs text-ink-500">Escolher →</span>
                    )}
                  </button>

                  {isExpanded && (
                    <div className="px-5 pb-5">
                      {catProducts.length === 0 ? (
                        <p className="text-sm text-ink-500 py-4">Nenhum produto nesta categoria.</p>
                      ) : (
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                          {catProducts.map((p) => {
                            const isSelected = selected?.id === p.id
                            const price = pricesByProduct[p.id]
                            return (
                              <div
                                key={p.id}
                                onClick={() => selectProduct(cat.id, p)}
                                className={`rounded-lg overflow-hidden cursor-pointer border-2 transition-all ${
                                  isSelected ? 'border-gold-500 bg-gold-600/5' : 'border-transparent hover:border-ink-700'
                                }`}
                              >
                                <div className="relative aspect-square bg-ink-950">
                                  <ResilientImage src={p.image_url} alt={p.name} className="w-full h-full object-cover" />
                                  {isSelected && (
                                    <div className="absolute top-2 right-2 w-6 h-6 rounded-full bg-gold-500 text-ink-950 flex items-center justify-center">
                                      <Check size={14} />
                                    </div>
                                  )}
                                </div>
                                <div className="p-3 space-y-1">
                                  <h3 className="text-xs font-semibold text-ink-100 line-clamp-2">{p.name}</h3>
                                  <StarRating rating={p.rating} reviewCount={p.review_count} size={10} showText={false} />
                                  {price != null && (
                                    <div className="flex items-center gap-1 text-xs text-gold-400 font-semibold">
                                      <Tag size={10} /> {fmtBRL(price)}
                                    </div>
                                  )}
                                </div>
                              </div>
                            )
                          })}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              )
            })}
          </div>
        )}

        {/* Selected products summary */}
        {itemCount > 0 && (
          <div className="mt-8 card-premium rounded-xl p-6">
            <div className="flex items-center gap-2 mb-4">
              <ShoppingCart size={18} className="text-gold-500" />
              <h2 className="text-lg font-semibold text-ink-100">Seu kit</h2>
            </div>
            <div className="space-y-3">
              {Object.entries(selection).map(([catId, p]) => {
                const cat = categories.find(c => c.id === catId)
                const price = pricesByProduct[p.id]
                return (
                  <div key={catId} className="flex items-center gap-3 p-3 rounded-lg bg-ink-950 border border-ink-800">
                    <div className="w-12 h-12 rounded-lg overflow-hidden bg-ink-900 shrink-0">
                      <ResilientImage src={p.image_url} alt={p.name} className="w-full h-full object-cover" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <span className="text-xs text-gold-400">{cat?.name}</span>
                      <Link to={`/produto/${p.slug}`} className="block text-sm font-medium text-ink-100 truncate hover:text-gold-300 transition-colors">
                        {p.name}
                      </Link>
                    </div>
                    {price != null && (
                      <span className="text-sm font-bold text-gold-300 shrink-0">{fmtBRL(price)}</span>
                    )}
                  </div>
                )
              })}
            </div>
          </div>
        )}
      </Container>
    </>
  )
}
