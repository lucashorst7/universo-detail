import { useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'
import type { Product } from '../types'
import ProductCard from '../components/ProductCard'

export default function NewProductsPage() {
  const [products, setProducts] = useState<Product[]>([]); const [loading, setLoading] = useState(true)
  useEffect(() => { supabase.from('products').select('*, category:categories(*), brand:brands(*)').eq('status', 'published').is('parent_product_id', null).order('created_at', { ascending: false }).limit(24).then(({ data }) => { setProducts((data ?? []) as Product[]); setLoading(false) }) }, [])
  return (
    <div className="bg-neutral-50 min-h-screen py-16">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mb-12"><p className="font-sans text-xs font-medium tracking-[0.3em] text-primary-500 uppercase">Novidades</p><h1 className="font-display text-5xl text-secondary-950 mt-2">Produtos Recentes</h1></div>
        {loading ? <div className="flex justify-center"><div className="h-8 w-8 rounded-full border-2 border-primary-500 border-t-transparent animate-spin" /></div> : products.length === 0 ? <p className="text-neutral-500">Nenhum produto.</p> : <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5">{products.map((p) => <ProductCard key={p.id} product={p} />)}</div>}
      </div>
    </div>
  )
}
