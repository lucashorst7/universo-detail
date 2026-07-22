import { useEffect, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import type { Product } from '../types'
import ProductCard from '../components/ProductCard'

export default function SearchPage() {
  const [params] = useSearchParams(); const q = params.get('q') ?? ''
  const [products, setProducts] = useState<Product[]>([]); const [loading, setLoading] = useState(true)
  useEffect(() => { if (!q) { setLoading(false); return } supabase.from('products').select('*, category:categories(*), brand:brands(*)').eq('status', 'published').is('parent_product_id', null).or(`name.ilike.%${q}%,description.ilike.%${q}%`).limit(30).then(({ data }) => { setProducts((data ?? []) as Product[]); setLoading(false) }) }, [q])
  return (
    <div className="bg-neutral-50 min-h-screen py-16">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <h1 className="font-display text-4xl text-secondary-950 mb-8">{q ? `Busca: "${q}"` : 'Buscar'}</h1>
        {loading ? <div className="flex justify-center"><div className="h-8 w-8 rounded-full border-2 border-primary-500 border-t-transparent animate-spin" /></div> : products.length === 0 ? <p className="text-neutral-500">Nenhum resultado.</p> : <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5">{products.map((p) => <ProductCard key={p.id} product={p} />)}</div>}
      </div>
    </div>
  )
}
