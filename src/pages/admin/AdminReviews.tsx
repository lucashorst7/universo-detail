import { useEffect, useState } from 'react'
import { supabase } from '../../lib/supabase'
import type { CustomerReview, Product } from '../../lib/supabase'

export default function AdminReviews() {
  const [reviews, setReviews] = useState<(CustomerReview & { product_name?: string })[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    supabase.from('customer_reviews')
      .select('*, products(name)')
      .eq('is_deleted', false)
      .order('created_at', { ascending: false })
      .then(({ data }) => {
        const mapped = (data || []).map((r: any) => ({
          ...r,
          product_name: r.products?.name,
        }))
        setReviews(mapped)
        setLoading(false)
      })
  }, [])

  if (loading) return <div className="page-loading">Carregando...</div>

  return (
    <div className="admin-page">
      <h1>Reviews</h1>
      <div className="admin-table-wrap">
        <table className="admin-table">
          <thead>
            <tr>
              <th>Produto</th>
              <th>Autor</th>
              <th>Nota</th>
              <th>Título</th>
              <th>Data</th>
            </tr>
          </thead>
          <tbody>
            {reviews.map((r) => (
              <tr key={r.id}>
                <td>{r.product_name || '—'}</td>
                <td>{r.author_name}</td>
                <td>{r.rating}/5</td>
                <td>{r.title}</td>
                <td>{new Date(r.created_at).toLocaleDateString('pt-BR')}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
