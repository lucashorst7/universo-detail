import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { Heart } from 'lucide-react'
import { supabase } from '../lib/supabase'
import type { Product } from '../types'
import ProductCard from '../components/ProductCard'

export default function WishlistPage() {
  const [products, setProducts] = useState<Product[]>([])
  useEffect(() => { const load = async () => { try { const ids: string[] = JSON.parse(localStorage.getItem('wishlist') ?? '[]'); if (!ids.length) return; const { data } = await supabase.from('products').select('*, category:categories(*), brand:brands(*)').in('id', ids).eq('status', 'published'); setProducts((data ?? []) as Product[]) } catch { /* ignore */ } }; load() }, [])
  return (
    <div className="bg-neutral-50 min-h-screen py-16">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mb-12"><p className="font-sans text-xs font-medium tracking-[0.3em] text-primary-500 uppercase">Sua lista</p><h1 className="font-display text-5xl text-secondary-950 mt-2">Lista de Desejos</h1></div>
        {products.length === 0 ? (<div className="text-center py-20"><Heart className="h-12 w-12 mx-auto text-neutral-300" /><p className="mt-4 text-neutral-500">Sua lista de desejos está vazia.</p><Link to="/produtos" className="mt-4 inline-block text-primary-500 hover:underline">Explorar produtos</Link></div>) : <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5">{products.map((p) => <ProductCard key={p.id} product={p} />)}</div>}
      </div>
    </div>
  )
}
