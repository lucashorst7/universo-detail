import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { BookOpen, ArrowRight } from 'lucide-react'
import { supabase } from '../lib/supabase'
import type { Guide } from '../types'

export default function GuidesPage() {
  const [guides, setGuides] = useState<Guide[]>([]); const [loading, setLoading] = useState(true)
  useEffect(() => { supabase.from('guides').select('*').order('created_at', { ascending: false }).then(({ data }) => { setGuides((data ?? []) as Guide[]); setLoading(false) }) }, [])
  return (
    <div className="bg-neutral-50 min-h-screen py-16">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12"><p className="font-sans text-xs font-medium tracking-[0.3em] text-primary-500 uppercase">Aprenda</p><h1 className="font-display text-5xl text-secondary-950 mt-2">Guias</h1></div>
        {loading ? <div className="flex justify-center"><div className="h-8 w-8 rounded-full border-2 border-primary-500 border-t-transparent animate-spin" /></div> : guides.length === 0 ? <p className="text-center text-neutral-500">Nenhum guia disponível.</p> : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {guides.map((g) => (
              <Link key={g.id} to={`/guia/${g.slug}`} className="group bg-white rounded-xl p-6 border border-neutral-200 hover:border-primary-300 hover:shadow-lg transition-all">
                <div className="rounded-lg bg-secondary-950 p-3 w-fit"><BookOpen className="h-6 w-6 text-primary-400" /></div>
                <h3 className="mt-4 font-sans font-semibold text-secondary-950 group-hover:text-primary-600 transition-colors">{g.title}</h3>
                {g.excerpt && <p className="mt-2 text-sm text-neutral-500 line-clamp-3">{g.excerpt}</p>}
                <span className="mt-3 inline-flex items-center gap-1 text-xs font-medium text-primary-600 group-hover:gap-2 transition-all">Ler guia <ArrowRight className="h-3 w-3" /></span>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
