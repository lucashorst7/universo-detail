import { useEffect, useState } from 'react'
import { Plus, Edit2, Trash2 } from 'lucide-react'
import { supabase, isConfigured } from '../../lib/supabase'
import { Spinner, EmptyState } from '../../components/Feedback'
import { Modal, ConfirmDialog, Toast } from '../../components/AdminUI'
import type { Brand } from '../../types/database'

export function AdminBrandsPage() {
  const [brands, setBrands] = useState<Brand[]>([])
  const [loading, setLoading] = useState(true)
  const [modalOpen, setModalOpen] = useState(false)
  const [editing, setEditing] = useState<Brand | null>(null)
  const [deleteId, setDeleteId] = useState<string | null>(null)
  const [toast, setToast] = useState<{ msg: string; type: 'success' | 'error' } | null>(null)
  const [form, setForm] = useState({ name: '', slug: '', description: '', country: '', logo_url: '' })

  async function load() {
    if (!isConfigured) { setLoading(false); return }
    const { data } = await supabase.from('brands').select('*').order('name')
    setBrands((data || []) as Brand[])
    setLoading(false)
  }

  useEffect(() => { load() }, [])

  function openCreate() {
    setEditing(null)
    setForm({ name: '', slug: '', description: '', country: '', logo_url: '' })
    setModalOpen(true)
  }

  function openEdit(b: Brand) {
    setEditing(b)
    setForm({ name: b.name, slug: b.slug, description: b.description ?? '', country: b.country ?? '', logo_url: b.logo_url ?? '' })
    setModalOpen(true)
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    const payload = {
      name: form.name,
      slug: form.slug || form.name.toLowerCase().replace(/\s+/g, '-'),
      description: form.description || null,
      country: form.country || null,
      logo_url: form.logo_url || null,
    }
    if (editing) {
      const { error } = await supabase.from('brands').update(payload).eq('id', editing.id)
      if (error) { setToast({ msg: error.message, type: 'error' }); return }
      setToast({ msg: 'Marca atualizada!', type: 'success' })
    } else {
      const { error } = await supabase.from('brands').insert(payload)
      if (error) { setToast({ msg: error.message, type: 'error' }); return }
      setToast({ msg: 'Marca criada!', type: 'success' })
    }
    setModalOpen(false)
    load()
  }

  async function handleDelete() {
    if (!deleteId) return
    const { error } = await supabase.from('brands').delete().eq('id', deleteId)
    if (error) { setToast({ msg: error.message, type: 'error' }); return }
    setToast({ msg: 'Marca excluída!', type: 'success' })
    load()
  }

  if (loading) return <Spinner label="Carregando marcas..." />

  return (
    <div>
      <div className="admin-page-head">
        <h1>Marcas</h1>
        <p>Gerencie as marcas do catálogo</p>
      </div>
      <div className="admin-toolbar">
        <button className="btn btn-primary" onClick={openCreate}><Plus size={16} /> Nova marca</button>
      </div>
      {brands.length === 0 ? (
        <EmptyState title="Nenhuma marca" message="Clique em 'Nova marca' para começar." />
      ) : (
        <table className="admin-table">
          <thead><tr><th>Nome</th><th>Slug</th><th>País</th><th>Ações</th></tr></thead>
          <tbody>
            {brands.map((b) => (
              <tr key={b.id}>
                <td>{b.name}</td>
                <td>{b.slug}</td>
                <td>{b.country ?? '-'}</td>
                <td><div className="row-actions">
                  <button className="btn btn-outline" onClick={() => openEdit(b)}><Edit2 size={14} /></button>
                  <button className="btn btn-danger" onClick={() => setDeleteId(b.id)}><Trash2 size={14} /></button>
                </div></td>
              </tr>
            ))}
          </tbody>
        </table>
      )}

      <Modal open={modalOpen} onClose={() => setModalOpen(false)} title={editing ? 'Editar marca' : 'Nova marca'}>
        <form className="admin-form" onSubmit={handleSubmit}>
          <div className="form-group"><label>Nome</label><input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required /></div>
          <div className="form-group"><label>Slug</label><input value={form.slug} onChange={(e) => setForm({ ...form, slug: e.target.value })} placeholder="auto-gerado se vazio" /></div>
          <div className="form-group"><label>Descrição</label><textarea value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} /></div>
          <div className="form-group"><label>País</label><input value={form.country} onChange={(e) => setForm({ ...form, country: e.target.value })} /></div>
          <div className="form-group"><label>URL do logo</label><input value={form.logo_url} onChange={(e) => setForm({ ...form, logo_url: e.target.value })} /></div>
          <button type="submit" className="btn btn-primary">{editing ? 'Salvar' : 'Criar'}</button>
        </form>
      </Modal>

      <ConfirmDialog open={Boolean(deleteId)} onClose={() => setDeleteId(null)} onConfirm={handleDelete} title="Excluir marca" message="Tem certeza que deseja excluir esta marca?" />
      {toast && <Toast message={toast.msg} type={toast.type} onClose={() => setToast(null)} />}
    </div>
  )
}
