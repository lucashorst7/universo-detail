import { useEffect, useState } from 'react'
import { Plus, Edit2, Trash2 } from 'lucide-react'
import { supabase, isConfigured } from '../../lib/supabase'
import { Spinner, EmptyState } from '../../components/Feedback'
import { Modal, ConfirmDialog, Toast } from '../../components/AdminUI'
import type { Category } from '../../types/database'

export function AdminCategoriesPage() {
  const [categories, setCategories] = useState<Category[]>([])
  const [loading, setLoading] = useState(true)
  const [modalOpen, setModalOpen] = useState(false)
  const [editing, setEditing] = useState<Category | null>(null)
  const [deleteId, setDeleteId] = useState<string | null>(null)
  const [toast, setToast] = useState<{ msg: string; type: 'success' | 'error' } | null>(null)
  const [form, setForm] = useState({ name: '', slug: '', description: '', icon: '' })

  async function load() {
    if (!isConfigured) { setLoading(false); return }
    const { data } = await supabase.from('categories').select('*').order('name')
    setCategories((data || []) as Category[])
    setLoading(false)
  }

  useEffect(() => { load() }, [])

  function openCreate() {
    setEditing(null)
    setForm({ name: '', slug: '', description: '', icon: '' })
    setModalOpen(true)
  }

  function openEdit(c: Category) {
    setEditing(c)
    setForm({ name: c.name, slug: c.slug, description: c.description ?? '', icon: c.icon ?? '' })
    setModalOpen(true)
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    const payload = {
      name: form.name,
      slug: form.slug || form.name.toLowerCase().replace(/\s+/g, '-'),
      description: form.description || null,
      icon: form.icon || null,
    }
    if (editing) {
      const { error } = await supabase.from('categories').update(payload).eq('id', editing.id)
      if (error) { setToast({ msg: error.message, type: 'error' }); return }
      setToast({ msg: 'Categoria atualizada!', type: 'success' })
    } else {
      const { error } = await supabase.from('categories').insert(payload)
      if (error) { setToast({ msg: error.message, type: 'error' }); return }
      setToast({ msg: 'Categoria criada!', type: 'success' })
    }
    setModalOpen(false)
    load()
  }

  async function handleDelete() {
    if (!deleteId) return
    const { error } = await supabase.from('categories').delete().eq('id', deleteId)
    if (error) { setToast({ msg: error.message, type: 'error' }); return }
    setToast({ msg: 'Categoria excluída!', type: 'success' })
    load()
  }

  if (loading) return <Spinner label="Carregando categorias..." />

  return (
    <div>
      <div className="admin-page-head">
        <h1>Categorias</h1>
        <p>Gerencie as categorias do catálogo</p>
      </div>
      <div className="admin-toolbar">
        <button className="btn btn-primary" onClick={openCreate}><Plus size={16} /> Nova categoria</button>
      </div>
      {categories.length === 0 ? (
        <EmptyState title="Nenhuma categoria" message="Clique em 'Nova categoria' para começar." />
      ) : (
        <table className="admin-table">
          <thead><tr><th>Nome</th><th>Slug</th><th>Ícone</th><th>Ações</th></tr></thead>
          <tbody>
            {categories.map((c) => (
              <tr key={c.id}>
                <td>{c.name}</td>
                <td>{c.slug}</td>
                <td>{c.icon ?? '-'}</td>
                <td><div className="row-actions">
                  <button className="btn btn-outline" onClick={() => openEdit(c)}><Edit2 size={14} /></button>
                  <button className="btn btn-danger" onClick={() => setDeleteId(c.id)}><Trash2 size={14} /></button>
                </div></td>
              </tr>
            ))}
          </tbody>
        </table>
      )}

      <Modal open={modalOpen} onClose={() => setModalOpen(false)} title={editing ? 'Editar categoria' : 'Nova categoria'}>
        <form className="admin-form" onSubmit={handleSubmit}>
          <div className="form-group"><label>Nome</label><input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required /></div>
          <div className="form-group"><label>Slug</label><input value={form.slug} onChange={(e) => setForm({ ...form, slug: e.target.value })} placeholder="auto-gerado se vazio" /></div>
          <div className="form-group"><label>Descrição</label><textarea value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} /></div>
          <div className="form-group"><label>Ícone (emoji)</label><input value={form.icon} onChange={(e) => setForm({ ...form, icon: e.target.value })} /></div>
          <button type="submit" className="btn btn-primary">{editing ? 'Salvar' : 'Criar'}</button>
        </form>
      </Modal>

      <ConfirmDialog open={Boolean(deleteId)} onClose={() => setDeleteId(null)} onConfirm={handleDelete} title="Excluir categoria" message="Tem certeza que deseja excluir esta categoria?" />
      {toast && <Toast message={toast.msg} type={toast.type} onClose={() => setToast(null)} />}
    </div>
  )
}
