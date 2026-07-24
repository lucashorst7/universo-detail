import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import type { Product } from '../types'
import ProductCard from '../components/ProductCard'

interface CompareItem { id: string; slug: string }

export default function CompareSelectPage() {
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)
  const [selected, setSelected] = useState<CompareItem[]>([])

  useEffect(() => {
    try { setSelected(JSON.parse(localStorage.getItem('compare') ?? '[]') as CompareItem[]) } catch { setSelected([]) }
    supabase
      .from('products')
      .select(`*, brand:brands(id, name, slug, logo_url), category:categories(id, name, slug)`)
      .eq('status', 'published')
      .is('parent_product_id', null)
      .limit(100)
      .then(({ data }) => { setProducts((data ?? []) as Product[]); setLoading(false) })
  }, [])

  function toggle(p: Product) {
    const exists = selected.some(i => i.id === p.id)
    let next: CompareItem[]
    if (exists) { next = selected.filter(i => i.id !== p.id) }
    else if (selected.length < 4) { next = [...selected, { id: p.id, slug: p.slug }] }
    else return
    setSelected(next)
    localStorage.setItem('compare', JSON.stringify(next))
    window.dispatchEvent(new Event('storage'))
  }

  return (
    <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
      <h1 className="font-display text-4xl font-bold text-secondary-900">Selecionar produtos</h1>
      <p className="mt-2 text-neutral-500">Escolha até 4 produtos para comparar ({selected.length}/4)</p>

      {loading ? (
        <div className="flex justify-center py-20"><div className="h-12 w-12 animate-spin rounded-full border-3 border-neutral-200 border-t-primary-500" /></div>
      ) : (
        <>
          <div className="mt-10 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
            {products.map(p => {
              const isSelected = selected.some(i => i.id === p.id)
              return (
                <div key={p.id} className="relative">
                  <button onClick={() => toggle(p)} className={`absolute right-3 top-3 z-10 h-6 w-6 rounded-full border-2 transition-colors ${isSelected ? 'border-primary-500 bg-primary-500 text-white' : 'border-neutral-300 bg-white text-transparent'}`}>✓</button>
                  <ProductCard product={p} />
                </div>
              )
            })}
          </div>
          {selected.length > 0 && (
            <Link to="/comparar" className="mt-8 inline-flex items-center rounded-full bg-primary-500 px-6 py-3 text-sm font-semibold text-white hover:bg-primary-600">Comparar {selected.length} produtos</Link>
          )}
        </>
      )}
    </div>
  )
}
