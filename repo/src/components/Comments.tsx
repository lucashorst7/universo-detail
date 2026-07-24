import { useEffect, useState } from 'react'
import { Star } from 'lucide-react'
import { supabase } from '../lib/supabase'
import type { Comment } from '../types'
interface Props { productId: string }

export default function Comments({ productId }: Props) {
  const [comments, setComments] = useState<Comment[]>([]); const [loading, setLoading] = useState(true)
  const [name, setName] = useState(''); const [content, setContent] = useState(''); const [rating, setRating] = useState(5); const [submitting, setSubmitting] = useState(false)
  useEffect(() => { supabase.from('comments').select('*').eq('product_id', productId).order('created_at', { ascending: false }).then(({ data }) => { setComments((data ?? []) as Comment[]); setLoading(false) }) }, [productId])
  const submit = async (e: React.FormEvent) => { e.preventDefault(); if (!name.trim() || !content.trim()) return; setSubmitting(true); const { data } = await supabase.from('comments').insert({ product_id: productId, user_name: name, content, rating }).select('*').single(); if (data) { setComments([data as Comment, ...comments]); setName(''); setContent(''); setRating(5) }; setSubmitting(false) }
  return (
    <div className="space-y-6">
      <h3 className="font-heading text-2xl text-primary-400">Comentários</h3>
      <form onSubmit={submit} className="bg-secondary-900 border border-secondary-800 rounded-xl p-5 space-y-4">
        <div><label className="block text-xs uppercase tracking-widest text-neutral-400 mb-1">Nome</label><input value={name} onChange={(e) => setName(e.target.value)} className="w-full bg-secondary-950 border border-secondary-700 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-primary-400" /></div>
        <div><label className="block text-xs uppercase tracking-widest text-neutral-400 mb-1">Comentário</label><textarea value={content} onChange={(e) => setContent(e.target.value)} rows={3} className="w-full bg-secondary-950 border border-secondary-700 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-primary-400" /></div>
        <div className="flex items-center gap-2"><span className="text-xs uppercase tracking-widest text-neutral-400">Nota</span>{[1,2,3,4,5].map((n) => <button key={n} type="button" onClick={() => setRating(n)}><Star className={`h-5 w-5 ${n <= rating ? 'fill-primary-400 text-primary-400' : 'text-neutral-600'}`} /></button>)}</div>
        <button type="submit" disabled={submitting} className="bg-primary-500 text-secondary-950 font-medium px-5 py-2 rounded-lg text-sm hover:bg-primary-400 disabled:opacity-50 transition-colors">{submitting ? 'Enviando...' : 'Enviar'}</button>
      </form>
      {loading ? <p className="text-neutral-500 text-sm">Carregando...</p> : comments.length === 0 ? <p className="text-neutral-500 text-sm">Nenhum comentário ainda.</p> : (
        <ul className="space-y-4">
          {comments.map((c) => (
            <li key={c.id} className="bg-secondary-900 border border-secondary-800 rounded-xl p-4">
              <div className="flex items-center justify-between mb-2"><span className="font-sans text-sm font-medium text-white">{c.user_name}</span><div className="flex gap-0.5">{[1,2,3,4,5].map((n) => <Star key={n} className={`h-3.5 w-3.5 ${n <= c.rating ? 'fill-primary-400 text-primary-400' : 'text-neutral-700'}`} />)}</div></div>
              <p className="text-sm text-neutral-300">{c.content}</p>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}
