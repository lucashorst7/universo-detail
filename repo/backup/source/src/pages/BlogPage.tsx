import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { ArrowRight } from 'lucide-react'
import { supabase } from '../lib/supabase'
import type { BlogPost } from '../types'

export default function BlogPage() {
  const [posts, setPosts] = useState<BlogPost[]>([]); const [loading, setLoading] = useState(true)
  useEffect(() => { supabase.from('blog_posts').select('*').order('published_at', { ascending: false }).then(({ data }) => { setPosts((data ?? []) as BlogPost[]); setLoading(false) }) }, [])
  return (
    <div className="bg-neutral-50 min-h-screen py-16">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12"><p className="font-sans text-xs font-medium tracking-[0.3em] text-primary-500 uppercase">Leia</p><h1 className="font-display text-5xl text-secondary-950 mt-2">Blog</h1></div>
        {loading ? <div className="flex justify-center"><div className="h-8 w-8 rounded-full border-2 border-primary-500 border-t-transparent animate-spin" /></div> : posts.length === 0 ? <p className="text-center text-neutral-500">Nenhum post publicado.</p> : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {posts.map((p) => (
              <Link key={p.id} to={`/blog/${p.slug}`} className="group bg-white rounded-xl overflow-hidden border border-neutral-200 hover:border-primary-300 hover:shadow-lg transition-all">
                <div className="aspect-video bg-secondary-900 overflow-hidden">{p.cover_image_url ? <img src={p.cover_image_url} alt={p.title} className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105" /> : <div className="flex h-full items-center justify-center font-display text-3xl text-primary-400">{p.title.charAt(0)}</div>}</div>
                <div className="p-5">
                  {p.author && <p className="text-xs font-medium tracking-widest text-primary-500 uppercase">por {p.author}</p>}
                  <h3 className="mt-1 font-sans font-semibold text-secondary-950 group-hover:text-primary-600 transition-colors">{p.title}</h3>
                  {p.excerpt && <p className="mt-2 text-sm text-neutral-500 line-clamp-2">{p.excerpt}</p>}
                  <span className="mt-3 inline-flex items-center gap-1 text-xs font-medium text-primary-600 group-hover:gap-2 transition-all">Ler mais <ArrowRight className="h-3 w-3" /></span>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
