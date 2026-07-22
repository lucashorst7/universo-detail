import { useEffect, useState } from 'react'
import { Check, X } from 'lucide-react'
import { supabase, isConfigured } from '../../lib/supabase'
import { Spinner, EmptyState } from '../../components/Feedback'
import { Toast } from '../../components/AdminUI'
import { Rating } from '../../components/Badge'
import type { CustomerReview, Product } from '../../types/database'

export function AdminReviewsPage() {
  const [reviews, setReviews] = useState<(CustomerReview & { product?: Product | null })[]>([])
  const [loading, setLoading] = useState(true)
  const [toast, setToast] = useState<{ msg: string; type: 'success' | 'error' } | null>(null)

  async function load() {
    if (!isConfigured) { setLoading(false); return }
    const { data } = await supabase
      .from('customer_reviews')
      .select('*, product:product_id(name,slug)')
      .order('created_at', { ascending: false })
    setReviews((data || []) as (CustomerReview & { product?: Product | null })[])
    setLoading(false)
  }

  useEffect(() => { load() }, [])

  async function toggleDeleted(id: string, isDeleted: boolean) {
    const { error } = await supabase.from('customer_reviews').update({ is_deleted: !isDeleted }).eq('id', id)
    if (error) { setToast({ msg: error.message, type: 'error' }); return }
    setToast({ msg: isDeleted ? 'Avaliação restaurada!' : 'Avaliação ocultada!', type: 'success' })
    load()
  }

  if (loading) return <Spinner label="Carregando avaliações..." />

  return (
    <div>
      <div className="admin-page-head">
        <h1>Avaliações</h1>
        <p>Modere as avaliações dos produtos</p>
      </div>
      {reviews.length === 0 ? (
        <EmptyState title="Nenhuma avaliação" message="Não há avaliações para moderar." />
      ) : (
        <table className="admin-table">
          <thead><tr><th>Produto</th><th>Nota</th><th>Autor</th><th>Status</th><th>Ações</th></tr></thead>
          <tbody>
            {reviews.map((r) => (
              <tr key={r.id}>
                <td>{r.product?.name ?? r.title ?? '—'}</td>
                <td><Rating value={r.rating} size={12} /></td>
                <td>{r.author_name}</td>
                <td><span className={`badge ${r.is_deleted ? 'badge-red' : 'badge-gold'}`}>{r.is_deleted ? 'Ocultada' : 'Ativa'}</span></td>
                <td><div className="row-actions">
                  {r.is_deleted ? (
                    <button className="btn btn-outline" title="Restaurar" onClick={() => toggleDeleted(r.id, true)}><Check size={14} /></button>
                  ) : (
                    <button className="btn btn-outline" title="Ocultar" onClick={() => toggleDeleted(r.id, false)}><X size={14} /></button>
                  )}
                </div></td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
      {toast && <Toast message={toast.msg} type={toast.type} onClose={() => setToast(null)} />}
    </div>
  )
}
