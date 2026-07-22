import { useEffect, useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import { MapPin } from 'lucide-react'
import { supabase } from '../lib/supabase'
import type { Brand, Product } from '../types'
import ProductCard from '../components/ProductCard'

export default function BrandDetailPage() {
  const { slug } = useParams<{ slug: string }>()
  const [brand, setBrand] = useState<Brand | null>(null); const [products, setProducts] = useState<Product[]>([]); const [loading, setLoading] = useState(true)
  useEffect(() => { if (!slug) return; setLoading(true); supabase.from('brands').select('*').eq('slug', slug).maybeSingle().then(({ data }) => { setBrand(data as Brand | null); if (data) { supabase.from('products').select('*, category:categories(*), brand:brands(*)').eq('brand_id', data.id).eq('status', 'published').is('parent_product_id', null).order('name').then(({ data: prods }) => { setProducts((prods ?? []) as Product[]); setLoading(false) }) } else { setLoading(false) } }) }, [slug])
  if (loading) return <div className="flex min-h-[60vh] items-center justify-center"><div className="h-8 w-8 rounded-full border-2 border-primary-500 border-t-transparent animate-spin" /></div>
  if (!brand) return <div className="py-20 text-center"><p className="text-neutral-500">Marca não encontrada.</p><Link to="/marcas" className="text-primary-500 hover:underline">Ver todas</Link></div>
  return (
    <div className="bg-neutral-50 min-h-screen py-16">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <nav className="text-sm text-neutral-500 mb-6"><Link to="/marcas" className="hover:text-primary-500">Marcas</Link><span className="mx-2">/</span><span className="text-secondary-950">{brand.name}</span></nav>
        <div className="flex items-center gap-6 mb-10">
          <div className="h-24 w-24 rounded-xl bg-white border border-neutral-200 flex items-center justify-center overflow-hidden">{brand.logo_url ? <img src={brand.logo_url} alt={brand.name} className="h-full w-full object-contain p-2" /> : <span className="font-display text-3xl text-secondary-950">{brand.name.charAt(0)}</span>}</div>
          <div><h1 className="font-display text-5xl text-secondary-950">{brand.name}</h1>{brand.country && <p className="mt-2 flex items-center gap-1.5 text-neutral-600"><MapPin className="h-4 w-4 text-primary-500" /> {brand.country}</p>}</div>
        </div>
        {brand.description && <p className="text-neutral-600 max-w-2xl mb-10">{brand.description}</p>}
        {products.length === 0 ? <p className="text-neutral-500">Nenhum produto desta marca.</p> : <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5">{products.map((p) => <ProductCard key={p.id} product={p} />)}</div>}
      </div>
    </div>
  )
}
