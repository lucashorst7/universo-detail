import { useEffect, useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import type { Category, Product } from '../types'
import ProductCard from '../components/ProductCard'

export default function CategoryDetailPage() {
  const { slug } = useParams<{ slug: string }>()
  const [category, setCategory] = useState<Category | null>(null); const [products, setProducts] = useState<Product[]>([]); const [loading, setLoading] = useState(true)
  useEffect(() => {
    if (!slug) return; setLoading(true)
    supabase.from('categories').select('*').eq('slug', slug).maybeSingle().then(({ data }) => { setCategory(data as Category | null); if (data) { supabase.from('products').select('*, category:categories(*), brand:brands(*)').eq('category_id', data.id).eq('status', 'published').is('parent_product_id', null).order('name').then(({ data: prods }) => { setProducts((prods ?? []) as Product[]); setLoading(false) }) } else { setLoading(false) } })
  }, [slug])
  if (loading) return <div className="flex min-h-[60vh] items-center justify-center"><div className="h-8 w-8 rounded-full border-2 border-primary-500 border-t-transparent animate-spin" /></div>
  if (!category) return <div className="py-20 text-center"><p className="text-neutral-500">Categoria não encontrada.</p><Link to="/categorias" className="text-primary-500 hover:underline">Ver todas</Link></div>
  return (
    <div className="bg-neutral-50 min-h-screen py-16">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <nav className="text-sm text-neutral-500 mb-6"><Link to="/categorias" className="hover:text-primary-500">Categorias</Link><span className="mx-2">/</span><span className="text-secondary-950">{category.name}</span></nav>
        <h1 className="font-display text-5xl text-secondary-950 mb-2">{category.name}</h1>
        {category.description && <p className="text-neutral-600 max-w-2xl mb-10">{category.description}</p>}
        {products.length === 0 ? <p className="text-neutral-500">Nenhum produto nesta categoria ainda.</p> : <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5">{products.map((p) => <ProductCard key={p.id} product={p} />)}</div>}
      </div>
    </div>
  )
}
