import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { Droplet, Armchair, Sparkles, Eye, Shield, Shirt, Wrench, SprayCan, ArrowRight, Package } from 'lucide-react'
import { supabase } from '../lib/supabase'
import type { Category } from '../types'

// Icon map keyed by the `icon` column set in the DB migration. Falls back to
// Package for any category without a known icon key.
const iconMap: Record<string, React.ComponentType<{ className?: string }>> = {
  'droplet': Droplet, 'armchair': Armchair, 'sparkles': Sparkles, 'eye': Eye,
  'shield': Shield, 'towel': Shirt, 'wrench': Wrench, 'spray-can': SprayCan,
  'package': Package,
}

export default function CategoriesPage() {
  const [categories, setCategories] = useState<Category[]>([]); const [loading, setLoading] = useState(true)
  useEffect(() => { supabase.from('categories').select('*').order('display_order', { ascending: true }).then(({ data }) => { setCategories((data ?? []) as Category[]); setLoading(false) }) }, [])
  return (
    <div className="bg-neutral-50 min-h-screen py-16">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12"><p className="font-sans text-xs font-medium tracking-[0.3em] text-primary-500 uppercase">Explore por</p><h1 className="font-display text-5xl text-secondary-950 mt-2">Categorias</h1></div>
        {loading ? <div className="flex justify-center"><div className="h-8 w-8 rounded-full border-2 border-primary-500 border-t-transparent animate-spin" /></div> : (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5">
            {categories.map((cat) => { const Icon = iconMap[cat.icon ?? 'package'] ?? Package; return (
              <Link key={cat.id} to={`/categoria/${cat.slug}`} className="group bg-white rounded-xl p-6 border border-neutral-200 hover:border-primary-300 hover:shadow-lg transition-all duration-300">
                <div className="rounded-lg bg-secondary-950 group-hover:bg-primary-500 p-3 w-fit transition-colors"><Icon className="h-6 w-6 text-primary-400 group-hover:text-secondary-950" /></div>
                <h3 className="mt-4 font-sans font-semibold text-secondary-950">{cat.name}</h3>
                {cat.description && <p className="mt-1 text-sm text-neutral-500 line-clamp-2">{cat.description}</p>}
                <span className="mt-3 inline-flex items-center gap-1 text-xs font-medium text-primary-600 group-hover:gap-2 transition-all">Ver produtos <ArrowRight className="h-3 w-3" /></span>
              </Link>
            )})}
          </div>
        )}
      </div>
    </div>
  )
}
