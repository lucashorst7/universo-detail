import { useEffect, useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import { ArrowLeft } from 'lucide-react'
import { supabase } from '../lib/supabase'
import type { Collection, Product } from '../types'
import ProductCard from '../components/ProductCard'

export default function CollectionDetailPage() {
  const { slug } = useParams<{ slug: string }>()
  const [collection, setCollection] = useState<Collection | null>(null); const [products, setProducts] = useState<Product[]>([]); const [loading, setLoading] = useState(true)
  useEffect(() => { if (!slug) return; supabase.from('collections').select('*').eq('slug', slug).maybeSingle().then(({ data }) => { const c = data as Collection | null; setCollection(c); if (c && c.product_ids?.length) { supabase.from('products').select('*, category:categories(*), brand:brands(*)').in('id', c.product_ids).eq('status', 'published').then(({ data: prods }) => { setProducts((prods ?? []) as Product[]); setLoading(false) }) } else { setLoading(false) } }) }, [slug])
  if (loading) return <div className="flex min-h-[60vh] items-center justify-center"><div className="h-8 w-8 rounded-full border-2 border-primary-500 border-t-transparent animate-spin" /></div>
  if (!collection) return <div className="py-20 text-center"><p className="text-neutral-500">Coleção não encontrada.</p><Link to="/colecoes" className="text-primary-500 hover:underline">Ver todas</Link></div>
  return (
    <div className="bg-neutral-50 min-h-screen py-16">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <Link to="/colecoes" className="inline-flex items-center gap-1 text-sm text-neutral-500 hover:text-primary-500 mb-6"><ArrowLeft className="h-4 w-4" /> Coleções</Link>
        <h1 className="font-display text-5xl text-secondary-950 mb-4">{collection.name}</h1>
        {collection.description && <p className="text-neutral-600 max-w-2xl mb-10">{collection.description}</p>}
        {products.length === 0 ? <p className="text-neutral-500">Nenhum produto nesta coleção.</p> : <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5">{products.map((p) => <ProductCard key={p.id} product={p} />)}</div>}
      </div>
    </div>
  )
}
