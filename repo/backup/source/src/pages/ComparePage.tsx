import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { GitCompare } from 'lucide-react'
import { supabase } from '../lib/supabase'
import type { Product } from '../types'

export default function ComparePage() {
  const [products, setProducts] = useState<Product[]>([])
  useEffect(() => { const load = async () => { try { const ids: string[] = JSON.parse(localStorage.getItem('compare') ?? '[]'); if (!ids.length) return; const { data } = await supabase.from('products').select('*, category:categories(*), brand:brands(*)').in('id', ids).eq('status', 'published'); setProducts((data ?? []) as Product[]) } catch { /* ignore */ } }; load() }, [])
  return (
    <div className="bg-neutral-50 min-h-screen py-16">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mb-12"><p className="font-sans text-xs font-medium tracking-[0.3em] text-primary-500 uppercase">Comparar</p><h1 className="font-display text-5xl text-secondary-950 mt-2">Comparar Produtos</h1></div>
        {products.length === 0 ? (<div className="text-center py-20"><GitCompare className="h-12 w-12 mx-auto text-neutral-300" /><p className="mt-4 text-neutral-500">Nenhum produto para comparar.</p><Link to="/produtos" className="mt-4 inline-block text-primary-500 hover:underline">Explorar produtos</Link></div>) : (
          <div className="overflow-x-auto">
            <table className="w-full border-collapse">
              <thead><tr><th className="text-left p-4 border-b border-neutral-200 text-secondary-950 font-sans">Atributo</th>{products.map((p) => <th key={p.id} className="text-left p-4 border-b border-neutral-200"><Link to={`/produto/${p.slug}`} className="font-sans font-semibold text-secondary-950 hover:text-primary-600">{p.name}</Link></th>)}</tr></thead>
              <tbody>
                <tr><td className="p-4 border-b border-neutral-100 text-neutral-500">Marca</td>{products.map((p) => <td key={p.id} className="p-4 border-b border-neutral-100 text-secondary-950">{p.brand?.name ?? '—'}</td>)}</tr>
                <tr><td className="p-4 border-b border-neutral-100 text-neutral-500">Categoria</td>{products.map((p) => <td key={p.id} className="p-4 border-b border-neutral-100 text-secondary-950">{p.category?.name ?? '—'}</td>)}</tr>
                <tr><td className="p-4 border-b border-neutral-100 text-neutral-500">Descrição</td>{products.map((p) => <td key={p.id} className="p-4 border-b border-neutral-100 text-secondary-950 text-sm">{p.description ?? '—'}</td>)}</tr>
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}
