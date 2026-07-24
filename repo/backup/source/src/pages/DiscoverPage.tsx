import { useState, useEffect } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import type { Product, Category, Brand } from '../types'
import ProductCard from '../components/ProductCard'
import { SlidersHorizontal } from 'lucide-react'

export default function DiscoverPage() {
  const [searchParams, setSearchParams] = useSearchParams()
  const [products, setProducts] = useState<Product[]>([])
  const [categories, setCategories] = useState<Category[]>([])
  const [brands, setBrands] = useState<Brand[]>([])
  const [loading, setLoading] = useState(true)
  const [showFilters, setShowFilters] = useState(false)

  const categoryFilter = searchParams.get('categoria') ?? ''
  const brandFilter = searchParams.get('marca') ?? ''
  const sort = searchParams.get('ordem') ?? 'recentes'

  useEffect(() => {
    async function load() {
      const [cats, brs] = await Promise.all([
        supabase.from('categories').select('*').order('display_order'),
        supabase.from('brands').select('*').order('name'),
      ])
      setCategories((cats.data ?? []) as Category[])
      setBrands((brs.data ?? []) as Brand[])
    }
    load()
  }, [])

  useEffect(() => {
    async function loadProducts() {
      setLoading(true)
      let q = supabase
        .from('products')
        .select(`*, brand:brands(id, name, slug, logo_url), category:categories(id, name, slug)`)
        .eq('status', 'published')
        .is('parent_product_id', null)

      if (categoryFilter) q = q.eq('category_id', categoryFilter)
      if (brandFilter) q = q.eq('brand_id', brandFilter)

      if (sort === 'recentes') q = q.order('created_at', { ascending: false })
      else if (sort === 'rating') q = q.order('rating', { ascending: false })
      else if (sort === 'nome') q = q.order('name', { ascending: true })

      const { data } = await q.limit(100)
      setProducts((data ?? []) as Product[])
      setLoading(false)
    }
    loadProducts()
  }, [categoryFilter, brandFilter, sort])

  function updateFilter(key: string, value: string) {
    const next = new URLSearchParams(searchParams)
    if (value) next.set(key, value)
    else next.delete(key)
    setSearchParams(next)
  }

  return (
    <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
      <h1 className="font-display text-4xl font-bold text-secondary-900">Descobrir produtos</h1>
      <p className="mt-2 text-neutral-500">Filtre por categoria, marca ou ordenação</p>

      <button onClick={() => setShowFilters(s => !s)} className="mt-6 inline-flex items-center gap-2 rounded-full border border-neutral-300 px-4 py-2 text-sm font-medium text-secondary-700 lg:hidden">
        <SlidersHorizontal className="h-4 w-4" /> Filtros
      </button>

      <div className="mt-6 grid grid-cols-1 gap-8 lg:grid-cols-4">
        <aside className={`${showFilters ? 'block' : 'hidden'} lg:block`}>
          <div className="sticky top-20 space-y-6 rounded-2xl border border-neutral-200 bg-white p-5">
            <div>
              <label className="text-sm font-medium text-secondary-900">Categoria</label>
              <select value={categoryFilter} onChange={e => updateFilter('categoria', e.target.value)} className="mt-1 w-full rounded-lg border border-neutral-300 p-2 text-sm outline-none focus:border-primary-400">
                <option value="">Todas</option>
                {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
              </select>
            </div>
            <div>
              <label className="text-sm font-medium text-secondary-900">Marca</label>
              <select value={brandFilter} onChange={e => updateFilter('marca', e.target.value)} className="mt-1 w-full rounded-lg border border-neutral-300 p-2 text-sm outline-none focus:border-primary-400">
                <option value="">Todas</option>
                {brands.map(b => <option key={b.id} value={b.id}>{b.name}</option>)}
              </select>
            </div>
            <div>
              <label className="text-sm font-medium text-secondary-900">Ordenar por</label>
              <select value={sort} onChange={e => updateFilter('ordem', e.target.value)} className="mt-1 w-full rounded-lg border border-neutral-300 p-2 text-sm outline-none focus:border-primary-400">
                <option value="recentes">Recentes</option>
                <option value="rating">Melhor avaliados</option>
                <option value="nome">Nome (A-Z)</option>
              </select>
            </div>
            {(categoryFilter || brandFilter) && (
              <Link to="/descobrir" className="block text-sm text-primary-600 hover:text-primary-700">Limpar filtros</Link>
            )}
          </div>
        </aside>

        <div className="lg:col-span-3">
          {loading ? (
            <div className="flex justify-center py-20">
              <div className="h-12 w-12 animate-spin rounded-full border-3 border-neutral-200 border-t-primary-500" />
            </div>
          ) : products.length === 0 ? (
            <p className="py-20 text-center text-neutral-500">Nenhum produto encontrado.</p>
          ) : (
            <div className="grid grid-cols-2 gap-4 sm:grid-cols-3">
              {products.map(p => <ProductCard key={p.id} product={p} />)}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
