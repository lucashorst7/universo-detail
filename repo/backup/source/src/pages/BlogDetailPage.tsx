import { useEffect, useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import { ArrowLeft } from 'lucide-react'
import { supabase } from '../lib/supabase'
import type { BlogPost } from '../types'

export default function BlogDetailPage() {
  const { slug } = useParams<{ slug: string }>()
  const [post, setPost] = useState<BlogPost | null>(null); const [loading, setLoading] = useState(true)
  useEffect(() => { if (!slug) return; supabase.from('blog_posts').select('*').eq('slug', slug).maybeSingle().then(({ data }) => { setPost(data as BlogPost | null); setLoading(false) }) }, [slug])
  if (loading) return <div className="flex min-h-[60vh] items-center justify-center"><div className="h-8 w-8 rounded-full border-2 border-primary-500 border-t-transparent animate-spin" /></div>
  if (!post) return <div className="py-20 text-center"><p className="text-neutral-500">Post não encontrado.</p><Link to="/blog" className="text-primary-500 hover:underline">Ver todos</Link></div>
  return (
    <div className="bg-neutral-50 min-h-screen py-16">
      <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8">
        <Link to="/blog" className="inline-flex items-center gap-1 text-sm text-neutral-500 hover:text-primary-500 mb-6"><ArrowLeft className="h-4 w-4" /> Blog</Link>
        {post.cover_image_url && <div className="aspect-video rounded-2xl overflow-hidden mb-8"><img src={post.cover_image_url} alt={post.title} className="h-full w-full object-cover" /></div>}
        <h1 className="font-display text-4xl text-secondary-950 mb-4">{post.title}</h1>
        {post.author && <p className="text-sm text-neutral-500 mb-6">por {post.author}</p>}
        {post.excerpt && <p className="text-neutral-600 mb-8 text-lg">{post.excerpt}</p>}
        <div className="prose prose-neutral max-w-none">{post.content.split('\n').map((line, i) => <p key={i} className="text-neutral-700 leading-relaxed mb-4">{line}</p>)}</div>
      </div>
    </div>
  )
}
